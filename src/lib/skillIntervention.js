import { STUDENT_PROFILE } from "@/data/studentProfile";
import { SKILLS_DATA } from "@/data/skillModel";
import { ROLES_DATA } from "@/data/skillGraph";
import { getRoleSkills, getSkillConnections } from "@/lib/skillGraphLogic";
import { calculateTransferability } from "@/lib/skillTransferability";
import { generateLearningPath } from "@/lib/learningPathGenerator";
import { getAdjacentRoles } from "@/lib/roleAdjacency";
import { buildStudentSkillTwin, getCapabilityStatus } from "@/lib/studentSkillTwin";
import { calculateIndustryReadiness } from "@/lib/industryReadiness";
import { analyzeSkillGaps } from "@/lib/skillGapIntelligence";

function clamp(val, min = 0, max = 100) {
  if (val === undefined || val === null || isNaN(val)) return min;
  return Math.max(min, Math.min(max, Math.round(Number(val))));
}

export function getInterventionPriorityLevel(score) {
  const s = clamp(score);
  if (s >= 80) return "IMMEDIATE ACTION";
  if (s >= 65) return "HIGH PRIORITY";
  if (s >= 50) return "RECOMMENDED";
  if (s >= 30) return "OPTIONAL";
  return "MAINTENANCE";
}

/**
 * Pure deterministic Skill Intervention Engine.
 */
export function generateSkillInterventions(roleId, studentCapabilities = null) {
  const capabilities = studentCapabilities || STUDENT_PROFILE.capabilities || {};
  const profile = { ...STUDENT_PROFILE, capabilities };

  const targetRole = ROLES_DATA.find((r) => r.id === roleId) || ROLES_DATA[0];
  const roleSkillEntries = getRoleSkills(targetRole.id);
  const requiredSkills = roleSkillEntries.map((e) => e.node).filter(Boolean);

  // Consume existing intelligence layers
  const gapAnalysis = analyzeSkillGaps(targetRole.id, capabilities);
  const readiness = calculateIndustryReadiness(targetRole.id, capabilities);
  const learningPath = generateLearningPath(targetRole.id, capabilities);
  const twin = buildStudentSkillTwin(capabilities, targetRole.id);

  if (requiredSkills.length === 0 || gapAnalysis.gaps.length === 0) {
    return {
      targetRole: { id: targetRole.id, name: targetRole.name },
      summary: {
        totalInterventions: 0,
        immediateActions: 0,
        highPriorityActions: 0,
        estimatedTotalEffort: "0 weeks"
      },
      interventions: [],
      topInterventions: [],
      nextBestAction: null,
      interventionPlan: [],
      readiness,
      gapAnalysis
    };
  }

  // Map each gap item into a structured Intervention Object
  const interventions = gapAnalysis.gaps.map((gapItem) => {
    const skill = SKILLS_DATA.find((s) => s.id === gapItem.skillId) || {
      id: gapItem.skillId,
      name: gapItem.skillName,
      currentDemand: gapItem.currentDemand,
      futureDemand: gapItem.futureDemand
    };

    const capability = gapItem.capability;
    const requiredCapability = gapItem.requiredCapability;
    const gap = gapItem.gap;
    const isBlockingSkill = gapItem.isBlockingSkill;
    const unlockedSkillCount = gapItem.unlockedSkillCount;

    // Determine Intervention Type deterministically
    let interventionType = "LEARN";
    if (capability >= 80) {
      interventionType = "MAINTAIN";
    } else if (isBlockingSkill && gap > 0) {
      interventionType = "UNLOCK";
    } else if (capability >= 65) {
      interventionType = "PRACTICE";
    } else if (capability >= 40) {
      interventionType = "STRENGTHEN";
    } else {
      interventionType = "LEARN";
    }

    // Prerequisite blockers detection
    const connections = getSkillConnections(skill.id);
    const parentConnections = connections.filter((c) => c.direction === "parent");
    const prerequisiteBlockers = parentConnections
      .map((c) => {
        const parentId = c.node?.id;
        const parentCap = clamp(capabilities[parentId] || 0);
        if (parentCap < 60) {
          return {
            skillId: parentId,
            skillName: c.node?.name,
            capability: parentCap,
            reason: `Prerequisite ${c.node?.name} is below threshold (${parentCap} pts).`
          };
        }
        return null;
      })
      .filter(Boolean);

    // Intervention Priority Formula (0–100)
    // Weighting: Gap Priority (35%), Readiness Impact (20%), Role Importance (15%),
    // Future Demand (10%), Current Demand (5%), Unlock Value (10%), Effort/Ease (5%)
    const readinessGainRatio = gapItem.potentialReadinessGain / 25;
    const unlockRatio = Math.min(1.0, unlockedSkillCount / 3);
    const easeRatio = Math.max(0, 1.0 - (gap / 100));

    const priorityScore = clamp(
      (gapItem.priorityScore * 0.35) +
      (readinessGainRatio * 100 * 0.20) +
      ((gapItem.roleImportance / 100) * 100 * 0.15) +
      ((gapItem.futureDemand / 100) * 100 * 0.10) +
      ((gapItem.currentDemand / 100) * 100 * 0.05) +
      (unlockRatio * 100 * 0.10) +
      (easeRatio * 100 * 0.05)
    );

    const priorityLevel = getInterventionPriorityLevel(priorityScore);

    // Learning Path Integration
    const learningPathItem = learningPath?.roadmap?.find ? learningPath.roadmap.find((lp) => lp.skillId === skill.id) : null;
    const estimatedEffort = learningPathItem ? learningPathItem.estimatedEffort : (gap <= 25 ? "1–2 weeks" : "3–5 weeks");
    const learningPathPhase = learningPathItem ? learningPathItem.phaseTitle : "Phase 1 Foundations";

    // Action & Reason Generation
    let action = "";
    let reason = "";
    let expectedOutcome = "";

    if (interventionType === "UNLOCK") {
      action = `Prioritize unblocking ${skill.name} to release downstream skill dependencies.`;
      reason = `${skill.name} unlocks ${unlockedSkillCount} downstream competencies for ${targetRole.name}. Resolving this ${gap}-pt gap clears prerequisite friction.`;
      expectedOutcome = `Unlocks ${unlockedSkillCount} dependent skills and boosts overall target readiness by +${gapItem.potentialReadinessGain}%.`;
    } else if (interventionType === "LEARN") {
      action = `Build foundational capability in ${skill.name} from scratch.`;
      reason = `You currently have ${capability} pts in ${skill.name} against a requirement of ${requiredCapability} pts. Future demand is projected at ${gapItem.futureDemand}%.`;
      expectedOutcome = `Closes a ${gap}-pt requirement deficit and increases readiness alignment.`;
    } else if (interventionType === "STRENGTHEN") {
      action = `Elevate ${skill.name} from ${capability} pts to ${requiredCapability} pts.`;
      reason = `You have a baseline foundation in ${skill.name} (${capability} pts). Strengthening it satisfies core role expectations.`;
      expectedOutcome = `Achieves strong role competency and adds +${gapItem.potentialReadinessGain}% to readiness.`;
    } else if (interventionType === "PRACTICE") {
      action = `Apply ${skill.name} in practical role scenarios to reach full mastery.`;
      reason = `Capability is near requirement (${capability} pts vs ${requiredCapability} pts). Practical application will close the remaining ${gap} pts.`;
      expectedOutcome = `Full mastery (${requiredCapability} pts) with minimal estimated effort (${estimatedEffort}).`;
    } else {
      action = `Maintain current mastery in ${skill.name} (${capability} pts).`;
      reason = `${skill.name} is fully satisfied and aligns with current market demand (${gapItem.currentDemand}%).`;
      expectedOutcome = `Sustains foundational competency for ${targetRole.name}.`;
    }

    return {
      skillId: skill.id,
      skillName: skill.name,
      interventionType,
      priorityScore,
      priorityLevel,
      currentCapability: capability,
      requiredCapability,
      gap,
      currentDemand: gapItem.currentDemand,
      futureDemand: gapItem.futureDemand,
      demandGrowth: gapItem.demandGrowth,
      roleImportance: gapItem.roleImportance,
      prerequisites: gapItem.prerequisites,
      unlocks: gapItem.unlocks,
      isBlockingSkill,
      prerequisiteBlockers,
      estimatedEffort,
      learningPathPhase,
      expectedReadinessGain: gapItem.potentialReadinessGain,
      expectedUnlockImpact: unlockedSkillCount,
      action,
      reason,
      expectedOutcome
    };
  });

  // Sort interventions deterministically:
  // 1. priorityScore descending
  // 2. gap descending
  // 3. skillName ascending
  interventions.sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
    if (b.gap !== a.gap) return b.gap - a.gap;
    return a.skillName.localeCompare(b.skillName);
  });

  const immediateActions = interventions.filter((i) => i.priorityLevel === "IMMEDIATE ACTION").length;
  const highPriorityActions = interventions.filter((i) => i.priorityLevel === "HIGH PRIORITY").length;

  // Calculate total effort estimate
  const activeInterventions = interventions.filter((i) => i.gap > 0);
  const totalWeeks = activeInterventions.length * 3;
  const estimatedTotalEffort = activeInterventions.length > 0 ? `${totalWeeks} weeks total` : "0 weeks";

  // Top Interventions Shortlist (Top 4 active interventions)
  const topInterventions = activeInterventions.slice(0, 4);

  // Determine NEXT BEST ACTION
  let nextBestAction = null;
  if (activeInterventions.length > 0) {
    const topIntervention = activeInterventions[0];
    nextBestAction = {
      skillId: topIntervention.skillId,
      skillName: topIntervention.skillName,
      interventionType: topIntervention.interventionType,
      priorityScore: topIntervention.priorityScore,
      priorityLevel: topIntervention.priorityLevel,
      action: topIntervention.action,
      reason: topIntervention.reason,
      expectedReadinessGain: topIntervention.expectedReadinessGain,
      expectedUnlockImpact: topIntervention.expectedUnlockImpact,
      estimatedEffort: topIntervention.estimatedEffort,
      prerequisiteBlockers: topIntervention.prerequisiteBlockers
    };
  }

  // Construct Structured Intervention Roadmap (Intervention Bundles)
  const roadmapPhases = [
    {
      phase: 1,
      title: "1. UNBLOCK FOUNDATIONS",
      interventions: interventions.filter((i) => i.interventionType === "UNLOCK"),
      reason: "Resolve blocking prerequisites to clear downstream learning paths."
    },
    {
      phase: 2,
      title: "2. BUILD CORE COMPETENCIES",
      interventions: interventions.filter((i) => i.interventionType === "LEARN"),
      reason: "Establish initial baseline capabilities for major skill gaps."
    },
    {
      phase: 3,
      title: "3. STRENGTHEN DEVELOPING SKILLS",
      interventions: interventions.filter((i) => i.interventionType === "STRENGTHEN"),
      reason: "Elevate intermediate skills to meet target role standards."
    },
    {
      phase: 4,
      title: "4. APPLY & REFINE",
      interventions: interventions.filter((i) => i.interventionType === "PRACTICE"),
      reason: "Reinforce near-mastery skills through practical application."
    },
    {
      phase: 5,
      title: "5. MAINTAIN MASTERY",
      interventions: interventions.filter((i) => i.interventionType === "MAINTAIN"),
      reason: "Sustain high-value mastered competencies aligned with market demand."
    }
  ].filter((p) => p.interventions.length > 0);

  return {
    targetRole: { id: targetRole.id, name: targetRole.name },
    summary: {
      totalInterventions: interventions.length,
      immediateActions,
      highPriorityActions,
      estimatedTotalEffort
    },
    interventions,
    topInterventions,
    nextBestAction,
    interventionPlan: roadmapPhases,
    readiness,
    gapAnalysis,
    learningPath,
    studentSkillTwin: twin
  };
}
