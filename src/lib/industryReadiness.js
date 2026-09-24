import { STUDENT_PROFILE } from "@/data/studentProfile";
import { SKILLS_DATA } from "@/data/skillModel";
import { ROLES_DATA } from "@/data/skillGraph";
import { getRoleSkills, getSkillConnections } from "@/lib/skillGraphLogic";
import { calculateTransferability } from "@/lib/skillTransferability";
import { generateLearningPath } from "@/lib/learningPathGenerator";
import { getAdjacentRoles } from "@/lib/roleAdjacency";
import { buildStudentSkillTwin, getCapabilityStatus } from "@/lib/studentSkillTwin";

/**
 * DETERMINISTIC READINESS LEVEL THRESHOLDS:
 * 80–100 -> INDUSTRY READY
 * 65–79  -> NEARLY READY
 * 50–64  -> DEVELOPING
 * 30–49  -> EARLY STAGE
 * 0–29   -> FOUNDATIONAL
 */
export const READINESS_LEVELS = {
  INDUSTRY_READY: { min: 80, label: "INDUSTRY READY", color: "emerald" },
  NEARLY_READY: { min: 65, label: "NEARLY READY", color: "blue" },
  DEVELOPING: { min: 50, label: "DEVELOPING", color: "amber" },
  EARLY_STAGE: { min: 30, label: "EARLY STAGE", color: "orange" },
  FOUNDATIONAL: { min: 0, label: "FOUNDATIONAL", color: "red" }
};

function clamp(val, min = 0, max = 100) {
  if (val === undefined || val === null || isNaN(val)) return min;
  return Math.max(min, Math.min(max, Math.round(Number(val))));
}

export function getReadinessLevel(score) {
  const s = clamp(score);
  if (s >= 80) return READINESS_LEVELS.INDUSTRY_READY;
  if (s >= 65) return READINESS_LEVELS.NEARLY_READY;
  if (s >= 50) return READINESS_LEVELS.DEVELOPING;
  if (s >= 30) return READINESS_LEVELS.EARLY_STAGE;
  return READINESS_LEVELS.FOUNDATIONAL;
}

/**
 * Calculate deterministic Industry Readiness for a target role & student capability profile.
 */
export function calculateIndustryReadiness(roleId, studentCapabilities = null) {
  const capabilities = studentCapabilities || STUDENT_PROFILE.capabilities || {};
  const profile = { ...STUDENT_PROFILE, capabilities };

  const targetRole = ROLES_DATA.find((r) => r.id === roleId) || ROLES_DATA[0];
  const roleSkillEntries = getRoleSkills(targetRole.id);
  const requiredSkills = roleSkillEntries.map((e) => e.node).filter(Boolean);

  // Consume Task 13, 14, 15, 16 logic layers
  const transferability = calculateTransferability(targetRole.id, profile);
  const learningPath = generateLearningPath(targetRole.id, capabilities);
  const twin = buildStudentSkillTwin(capabilities, targetRole.id);

  if (requiredSkills.length === 0) {
    return {
      roleId: targetRole.id,
      roleName: targetRole.name,
      overallScore: 0,
      readinessLevel: READINESS_LEVELS.FOUNDATIONAL.label,
      currentReadiness: 0,
      futureReadiness: 0,
      readinessTrend: "STABLE",
      readinessGap: 0,
      capabilityCoverage: 0,
      currentDemandAlignment: 0,
      futureDemandAlignment: 0,
      transferabilityScore: 0,
      gapPenalty: 0,
      strengths: [],
      highImpactGaps: [],
      highImpactSkills: [],
      strongestIndustrySkill: null,
      biggestIndustryGap: null,
      nextHighestValueSkill: null,
      explanation: `No explicit skill requirements defined for ${targetRole.name}.`,
      adjacentRoles: getAdjacentRoles(targetRole.id, capabilities),
      learningPath
    };
  }

  // 1. Current Capability Coverage Score (35%)
  const totalTargetCap = requiredSkills.reduce((sum, s) => sum + 100, 0);
  const studentTotalCap = requiredSkills.reduce((sum, s) => {
    return sum + clamp(capabilities[s.id] || 0);
  }, 0);
  const capabilityCoverage = Math.round((studentTotalCap / totalTargetCap) * 100);
  const capabilityScore = Math.round((capabilityCoverage / 100) * 35);

  // 2. Required Skill Importance Weighting (20%)
  // Assign 1.25x importance weight to skills that unlock downstream dependencies
  let weightedImportanceCoverage = 0;
  let totalImportanceWeight = 0;
  requiredSkills.forEach((s) => {
    const connections = getSkillConnections(s.id);
    const unlocksCount = connections.filter((c) => c.direction === "child").length;
    const importanceWeight = 1 + (unlocksCount * 0.15);
    const capRatio = clamp(capabilities[s.id] || 0) / 100;

    weightedImportanceCoverage += capRatio * importanceWeight;
    totalImportanceWeight += importanceWeight;
  });
  const skillImportanceScore = Math.round((weightedImportanceCoverage / totalImportanceWeight) * 20);

  // 3. Current Industry Demand Alignment (15%)
  const totalCurrentDemand = requiredSkills.reduce((sum, s) => sum + (s.currentDemand || 70), 0);
  const studentCurrentDemandWeighted = requiredSkills.reduce((sum, s) => {
    const capRatio = clamp(capabilities[s.id] || 0) / 100;
    return sum + ((s.currentDemand || 70) * capRatio);
  }, 0);
  const currentDemandAlignment = totalCurrentDemand > 0 
    ? Math.round((studentCurrentDemandWeighted / totalCurrentDemand) * 100) 
    : 70;
  const currentDemandScore = Math.round((currentDemandAlignment / 100) * 15);

  // 4. Future Industry Demand Alignment (15%)
  const totalFutureDemand = requiredSkills.reduce((sum, s) => sum + (s.futureDemand || 80), 0);
  const studentFutureDemandWeighted = requiredSkills.reduce((sum, s) => {
    const capRatio = clamp(capabilities[s.id] || 0) / 100;
    return sum + ((s.futureDemand || 80) * capRatio);
  }, 0);
  const futureDemandAlignment = totalFutureDemand > 0 
    ? Math.round((studentFutureDemandWeighted / totalFutureDemand) * 100) 
    : 75;
  const futureDemandScore = Math.round((futureDemandAlignment / 100) * 15);

  // 5. Transferability / Foundation Strength (10%)
  const transferabilityScore = Math.round((transferability.foundationCoverage / 100) * 10);

  // 6. Gap Penalty (5%)
  const missingCriticalCount = transferability.missingCriticals;
  const gapPenaltyPercent = Math.min(100, Math.round((missingCriticalCount / requiredSkills.length) * 100));
  const gapPenaltyScore = Math.round((gapPenaltyPercent / 100) * 5);

  // Overall Score (0–100)
  let overallScore = capabilityScore + skillImportanceScore + currentDemandScore + futureDemandScore + transferabilityScore - gapPenaltyScore;
  overallScore = clamp(overallScore);

  const readinessLevelObj = getReadinessLevel(overallScore);
  const readinessLevel = readinessLevelObj.label;

  // CURRENT VS FUTURE READINESS
  // Current Readiness: weighted heavily by current capability coverage & current demand
  const currentIndustryReadiness = clamp(Math.round((capabilityCoverage * 0.55) + (currentDemandAlignment * 0.35) + (transferability.foundationCoverage * 0.10)));
  
  // Future Readiness: weighted heavily by future demand & foundational skill strength
  const futureIndustryReadiness = clamp(Math.round((capabilityCoverage * 0.45) + (futureDemandAlignment * 0.45) + (twin.summary.foundationScore * 0.10)));

  const readinessGap = futureIndustryReadiness - currentIndustryReadiness;
  let readinessTrend = "STABLE";
  if (readinessGap >= 5) readinessTrend = "IMPROVING";
  else if (readinessGap <= -5) readinessTrend = "FUTURE RISK";

  // Dynamic Trend Explanation
  let trendExplanation = "";
  if (readinessTrend === "FUTURE RISK") {
    trendExplanation = `Your current market alignment (${currentIndustryReadiness}%) exceeds your future projected readiness (${futureIndustryReadiness}%). Required role skills have high future demand growth that your current capability does not fully satisfy.`;
  } else if (readinessTrend === "IMPROVING") {
    trendExplanation = `Your future readiness (${futureIndustryReadiness}%) exceeds current market alignment (${currentIndustryReadiness}%), indicating your strong foundational skills align well with emerging industry demand trends.`;
  } else {
    trendExplanation = `Your current market readiness (${currentIndustryReadiness}%) and future projected readiness (${futureIndustryReadiness}%) are closely aligned across key role competencies.`;
  }

  // HIGH-IMPACT SKILLS EVALUATION
  const highImpactSkills = requiredSkills.map((skill) => {
    const capability = clamp(capabilities[skill.id] || 0);
    const requiredCapability = 100;
    const gap = Math.max(0, requiredCapability - capability);
    const currentDemand = skill.currentDemand || 70;
    const futureDemand = skill.futureDemand || 80;
    const demandGrowth = futureDemand - currentDemand;

    const connections = getSkillConnections(skill.id);
    const unlocksCount = connections.filter((c) => c.direction === "child").length;
    const roleImportance = 10 + (unlocksCount * 5);

    // Impact Score Formula
    const gapRatio = gap / 100;
    const impactScore = Math.round(
      (gapRatio * 35) + 
      ((futureDemand / 100) * 25) + 
      ((currentDemand / 100) * 20) + 
      ((roleImportance / 35) * 20)
    );

    const status = getCapabilityStatus(capability);

    let explanation = "";
    if (capability >= 80) {
      explanation = `Strong asset: High demand skill (${futureDemand}% future demand) with full capability coverage.`;
    } else if (gap > 0) {
      explanation = `High impact gap: ${demandGrowth >= 0 ? '+' : ''}${demandGrowth}% demand growth with a ${gap} pt capability deficit.`;
    } else {
      explanation = `Satisfies baseline requirements with active market demand.`;
    }

    return {
      skillId: skill.id,
      skillName: skill.name,
      capability,
      requiredCapability,
      currentDemand,
      futureDemand,
      demandGrowth,
      gap,
      impactScore,
      status,
      explanation
    };
  });

  // Rank High-Impact Skills by impactScore descending
  highImpactSkills.sort((a, b) => b.impactScore - a.impactScore);

  const strengths = highImpactSkills.filter((s) => s.capability >= 65);
  const highImpactGaps = highImpactSkills.filter((s) => s.gap > 0);

  const strongestIndustrySkill = [...highImpactSkills].sort((a, b) => b.capability - a.capability)[0] || null;
  const biggestIndustryGap = [...highImpactSkills].sort((a, b) => b.gap - a.gap)[0] || null;

  // Identify NEXT HIGHEST-VALUE INDUSTRY SKILL
  let nextHighestValueSkill = null;
  if (highImpactGaps.length > 0) {
    const topGapSkill = highImpactGaps[0];
    const learningPathItem = learningPath?.roadmap?.find ? learningPath.roadmap.find((item) => item.skillId === topGapSkill.skillId) : null;

    nextHighestValueSkill = {
      ...topGapSkill,
      estimatedEffort: learningPathItem ? learningPathItem.estimatedEffort : "2–4 weeks",
      learningPriorityReason: learningPathItem ? learningPathItem.why : `Highest-impact gap (+${topGapSkill.gap} pts) aligned with high future market demand (${topGapSkill.futureDemand}%).`
    };
  }

  // Dynamic Overall Explanation
  const explanation = `Your industry readiness for ${targetRole.name} is ${overallScore}% (${readinessLevel}). You satisfy ${capabilityCoverage}% of required capability points across ${requiredSkills.length} core competencies. ${trendExplanation}`;

  return {
    roleId: targetRole.id,
    roleName: targetRole.name,
    overallScore,
    readinessLevel,
    readinessLevelColor: readinessLevelObj.color,
    currentReadiness: currentIndustryReadiness,
    futureReadiness: futureIndustryReadiness,
    readinessTrend,
    readinessGap,
    trendExplanation,
    capabilityCoverage,
    currentDemandAlignment,
    futureDemandAlignment,
    transferabilityScore,
    gapPenalty: gapPenaltyPercent,
    strengths,
    highImpactGaps,
    highImpactSkills,
    strongestIndustrySkill,
    biggestIndustryGap,
    nextHighestValueSkill,
    explanation,
    adjacentRoles: getAdjacentRoles(targetRole.id, capabilities),
    learningPath
  };
}
