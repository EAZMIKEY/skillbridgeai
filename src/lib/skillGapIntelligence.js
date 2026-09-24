import { STUDENT_PROFILE } from "@/data/studentProfile";
import { SKILLS_DATA } from "@/data/skillModel";
import { ROLES_DATA } from "@/data/skillGraph";
import { getRoleSkills, getSkillConnections } from "@/lib/skillGraphLogic";
import { calculateTransferability } from "@/lib/skillTransferability";
import { generateLearningPath } from "@/lib/learningPathGenerator";
import { getAdjacentRoles } from "@/lib/roleAdjacency";
import { buildStudentSkillTwin, getCapabilityStatus } from "@/lib/studentSkillTwin";
import { calculateIndustryReadiness } from "@/lib/industryReadiness";

/**
 * DETERMINISTIC GAP CLASSIFICATION THRESHOLDS:
 * gap == 0           -> MASTERED
 * gap <= 15          -> SMALL GAP
 * gap > 15 && <= 35  -> MODERATE GAP
 * gap > 35 && <= 60  -> LARGE GAP
 * gap > 60           -> CRITICAL GAP
 */

function clamp(val, min = 0, max = 100) {
  if (val === undefined || val === null || isNaN(val)) return min;
  return Math.max(min, Math.min(max, Math.round(Number(val))));
}

export function getGapStatus(gap) {
  const g = Math.max(0, gap);
  if (g === 0) return "MASTERED";
  if (g <= 15) return "SMALL GAP";
  if (g <= 35) return "MODERATE GAP";
  if (g <= 60) return "LARGE GAP";
  return "CRITICAL GAP";
}

export function getPriorityClassification(priorityScore) {
  const s = clamp(priorityScore);
  if (s >= 80) return "CRITICAL PRIORITY";
  if (s >= 65) return "HIGH PRIORITY";
  if (s >= 50) return "MEDIUM PRIORITY";
  if (s >= 30) return "LOW PRIORITY";
  return "MINIMAL PRIORITY";
}

/**
 * Pure deterministic Skill Gap Intelligence function.
 */
export function analyzeSkillGaps(roleId, studentCapabilities = null) {
  const capabilities = studentCapabilities || STUDENT_PROFILE.capabilities || {};
  const profile = { ...STUDENT_PROFILE, capabilities };

  const targetRole = ROLES_DATA.find((r) => r.id === roleId) || ROLES_DATA[0];
  const roleSkillEntries = getRoleSkills(targetRole.id);
  const requiredSkills = roleSkillEntries.map((e) => e.node).filter(Boolean);

  // Consume existing logic layers
  const transferability = calculateTransferability(targetRole.id, profile);
  const learningPath = generateLearningPath(targetRole.id, capabilities);
  const readiness = calculateIndustryReadiness(targetRole.id, capabilities);
  const twin = buildStudentSkillTwin(capabilities, targetRole.id);

  if (requiredSkills.length === 0) {
    return {
      targetRole: { id: targetRole.id, name: targetRole.name },
      summary: {
        totalRequiredSkills: 0,
        coveredSkills: 0,
        totalGaps: 0,
        criticalGaps: 0,
        highPriorityGaps: 0,
        overallCoverage: 0
      },
      gaps: [],
      categories: {
        criticalGaps: [],
        highImpactGaps: [],
        blockingGaps: [],
        quickWins: [],
        futureCritical: [],
        currentMarket: [],
        mastered: []
      },
      nextBestGap: null,
      readiness,
      learningPath
    };
  }

  // Analyze each required skill for the target role
  const gapAnalysis = requiredSkills.map((skill) => {
    const rawCapability = capabilities[skill.id];
    const capability = clamp(rawCapability || 0);
    const requiredCapability = 100;
    const gap = Math.max(0, requiredCapability - capability);
    const gapPercentage = Math.round((gap / requiredCapability) * 100);
    const gapStatus = getGapStatus(gap);

    const currentDemand = skill.currentDemand || 70;
    const futureDemand = skill.futureDemand || 80;
    const demandGrowth = futureDemand - currentDemand;

    // Graph DAG Connection Analysis
    const connections = getSkillConnections(skill.id);
    const parentConnections = connections.filter((c) => c.direction === "parent");
    const childConnections = connections.filter((c) => c.direction === "child");

    const prerequisites = parentConnections.map((c) => c.node?.name).filter(Boolean);
    const unlocks = childConnections.map((c) => c.node?.name).filter(Boolean);
    const unlockedSkillCount = childConnections.length;

    // Check how many required skills for target role depend on this skill
    const isBlockingSkill = unlockedSkillCount > 0;

    const roleImportance = Math.min(100, 50 + (unlockedSkillCount * 15) + (futureDemand * 0.3));

    // 1. Gap Severity Score (0–100)
    // Formula: (gapRatio * 40%) + (roleImportance * 20%) + (futureDemand * 20%) + (currentDemand * 20%)
    const gapSeverity = clamp(
      ((gap / 100) * 40) +
      ((roleImportance / 100) * 20) +
      ((futureDemand / 100) * 20) +
      ((currentDemand / 100) * 20)
    );

    // 2. Current vs Future Priority Classification
    let marketPriority = "LOWER PRIORITY";
    if (currentDemand >= 75 && futureDemand >= 75) {
      marketPriority = "DUAL PRIORITY";
    } else if (currentDemand >= 75) {
      marketPriority = "CURRENT PRIORITY";
    } else if (futureDemand >= 75) {
      marketPriority = "FUTURE PRIORITY";
    }

    // 3. Overall Priority Score (0–100)
    // Conceptual Weighting:
    // Gap Severity (25%), Role Importance (20%), Future Demand (15%), Current Demand (15%),
    // Dependency/Unlock Value (15%), Transferability Foundation (5%), Learning Effort (5%)
    const hasTransferableFoundation = transferability.foundations.some((f) => f.id === skill.id);
    const transferabilityBonus = hasTransferableFoundation ? 100 : 0;
    const unlockValue = Math.min(100, unlockedSkillCount * 35);
    const effortEaseBonus = Math.max(0, 100 - (gap * 1.2)); // smaller gap = higher ease bonus

    const priorityScore = clamp(
      (gapSeverity * 0.25) +
      (roleImportance * 0.20) +
      (futureDemand * 0.15) +
      (currentDemand * 0.15) +
      (unlockValue * 0.15) +
      (transferabilityBonus * 0.05) +
      (effortEaseBonus * 0.05)
    );

    const priorityCategory = getPriorityClassification(priorityScore);

    // 4. Potential Readiness Gain (% point boost to overall readiness)
    const potentialReadinessGain = Math.min(25, Math.max(2, Math.round((gap / 100) * (roleImportance / 100) * 20)));

    // 5. Dynamic Actionable Explanation
    let explanation = "";
    if (gap === 0) {
      explanation = `Fully satisfied: You possess ${capability} pts in ${skill.name}, completely meeting the target role requirement.`;
    } else if (isBlockingSkill) {
      explanation = `Foundational blocking gap: Your capability is ${capability} pts (gap of ${gap} pts). Because ${skill.name} unlocks ${unlockedSkillCount} downstream skills, closing this gap is a structural priority.`;
    } else if (demandGrowth >= 15) {
      explanation = `High strategic growth: ${skill.name} has a ${gap}-point deficit while future industry demand is projected to surge by +${demandGrowth}%.`;
    } else {
      explanation = `Target requirement gap of ${gap} pts with ${currentDemand}% current market demand.`;
    }

    return {
      skillId: skill.id,
      skillName: skill.name,
      capability,
      requiredCapability,
      gap,
      gapPercentage,
      gapStatus,
      gapSeverity,
      currentDemand,
      futureDemand,
      demandGrowth,
      roleImportance,
      isBlockingSkill,
      blockedSkillCount: prerequisites.length,
      unlockedSkillCount,
      prerequisites,
      unlocks,
      marketPriority,
      priorityScore,
      priorityCategory,
      potentialReadinessGain,
      hasTransferableFoundation,
      explanation
    };
  });

  // Sort gaps deterministically:
  // 1. priorityScore descending
  // 2. gapSeverity descending
  // 3. skillName ascending (localeCompare)
  gapAnalysis.sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }
    if (b.gapSeverity !== a.gapSeverity) {
      return b.gapSeverity - a.gapSeverity;
    }
    return a.skillName.localeCompare(b.skillName);
  });

  const mastered = gapAnalysis.filter((g) => g.gap === 0);
  const activeGaps = gapAnalysis.filter((g) => g.gap > 0);

  const criticalGaps = activeGaps.filter((g) => g.gapStatus === "CRITICAL GAP" || g.priorityCategory === "CRITICAL PRIORITY");
  const highImpactGaps = activeGaps.filter((g) => g.priorityCategory === "HIGH PRIORITY");
  const blockingGaps = activeGaps.filter((g) => g.isBlockingSkill);
  const quickWins = activeGaps.filter((g) => g.gap <= 25 && g.unlockedSkillCount > 0);
  const futureCritical = activeGaps.filter((g) => g.futureDemand >= 85);
  const currentMarket = activeGaps.filter((g) => g.currentDemand >= 85);

  // Determine NEXT BEST GAP
  let nextBestGap = null;
  if (activeGaps.length > 0) {
    const topItem = activeGaps[0];
    const learningPathItem = learningPath?.roadmap?.find ? learningPath.roadmap.find((item) => item.skillId === topItem.skillId) : null;

    nextBestGap = {
      ...topItem,
      estimatedEffort: learningPathItem ? learningPathItem.estimatedEffort : "1–3 weeks",
      learningPathPhase: learningPathItem ? learningPathItem.phaseTitle : "Phase 1 Foundations",
      reason: `Highest priority score (${topItem.priorityScore}/100): Addresses a ${topItem.gap}-point gap in ${topItem.skillName} which unlocks ${topItem.unlockedSkillCount} downstream competencies and offers a +${topItem.potentialReadinessGain}% readiness boost.`
    };
  }

  const coveredCount = mastered.length;
  const totalGaps = activeGaps.length;
  const criticalCount = criticalGaps.length;
  const highPriorityCount = highImpactGaps.length;
  const overallCoverage = Math.round((coveredCount / requiredSkills.length) * 100);

  return {
    targetRole: { id: targetRole.id, name: targetRole.name },
    summary: {
      totalRequiredSkills: requiredSkills.length,
      coveredSkills: coveredCount,
      totalGaps,
      criticalGaps: criticalCount,
      highPriorityGaps: highPriorityCount,
      overallCoverage
    },
    gaps: gapAnalysis,
    categories: {
      criticalGaps,
      highImpactGaps,
      blockingGaps,
      quickWins,
      futureCritical,
      currentMarket,
      mastered
    },
    nextBestGap,
    readiness,
    learningPath,
    studentSkillTwin: twin
  };
}
