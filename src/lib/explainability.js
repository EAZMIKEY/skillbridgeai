import { STUDENT_PROFILE } from "@/data/studentProfile";
import { SKILLS_DATA } from "@/data/skillModel";
import { ROLES_DATA } from "@/data/skillGraph";
import { getRoleSkills, getSkillConnections } from "@/lib/skillGraphLogic";
import { calculateTransferability } from "@/lib/skillTransferability";
import { generateLearningPath } from "@/lib/learningPathGenerator";
import { getAdjacentRoles, compareRoles } from "@/lib/roleAdjacency";
import { buildStudentSkillTwin } from "@/lib/studentSkillTwin";
import { calculateIndustryReadiness } from "@/lib/industryReadiness";
import { analyzeSkillGaps } from "@/lib/skillGapIntelligence";
import { generateSkillInterventions } from "@/lib/skillIntervention";

function clamp(val, min = 0, max = 100) {
  if (val === undefined || val === null || isNaN(val)) return min;
  return Math.max(min, Math.min(max, Math.round(Number(val))));
}

/**
 * 1. EXPLAIN SKILL GAP INTELLIGENCE
 */
export function explainSkillGap(skillId, roleId, studentCapabilities = null) {
  const capabilities = studentCapabilities || STUDENT_PROFILE.capabilities || {};
  const gapAnalysis = analyzeSkillGaps(roleId, capabilities);
  const gapItem = gapAnalysis.gaps.find((g) => g.skillId === skillId);
  const targetRole = ROLES_DATA.find((r) => r.id === roleId) || ROLES_DATA[0];

  if (!gapItem) {
    return {
      type: "SKILL_GAP",
      subject: skillId,
      recommendation: "Skill Not Required",
      conciseWhy: `Skill ${skillId} is not explicitly required for ${targetRole.name}.`,
      overallScore: 0,
      scoreBreakdown: [],
      positiveSignals: [],
      limitingSignals: [],
      evidence: { currentCapability: 0, requiredCapability: 0, gap: 0 },
      dependencies: { prerequisites: [], unlocks: [], isBlocking: false },
      traceableSource: "Skill Gap Intelligence"
    };
  }

  // Decompose Task 18 Priority Score (25% Gap Severity, 20% Role Importance, 15% Future Demand, 15% Current Demand, 15% Unlock, 5% Foundation, 5% Ease)
  const scoreBreakdown = [
    { factor: "Gap Deficit Severity", contribution: Math.round(gapItem.gapSeverity * 0.25), weight: "25%" },
    { factor: "Role Importance", contribution: Math.round(gapItem.roleImportance * 0.20), weight: "20%" },
    { factor: "Future Market Demand", contribution: Math.round(gapItem.futureDemand * 0.15), weight: "15%" },
    { factor: "Current Market Demand", contribution: Math.round(gapItem.currentDemand * 0.15), weight: "15%" },
    { factor: "Downstream Unlock Value", contribution: Math.round(Math.min(100, gapItem.unlockedSkillCount * 35) * 0.15), weight: "15%" },
    { factor: "Transferable Foundation", contribution: gapItem.hasTransferableFoundation ? 5 : 0, weight: "5%" },
    { factor: "Learning Effort Ease", contribution: Math.round(Math.max(0, 100 - (gapItem.gap * 1.2)) * 0.05), weight: "5%" }
  ];

  const positiveSignals = [];
  if (gapItem.futureDemand >= 80) positiveSignals.push(`High future market growth (${gapItem.futureDemand}%).`);
  if (gapItem.isBlockingSkill) positiveSignals.push(`Blocks ${gapItem.unlockedSkillCount} downstream competencies.`);
  if (gapItem.currentDemand >= 75) positiveSignals.push(`Strong active market demand (${gapItem.currentDemand}%).`);
  if (gapItem.hasTransferableFoundation) positiveSignals.push("Existing foundational capability baseline.");

  const limitingSignals = [];
  if (gapItem.gap > 50) limitingSignals.push(`Large capability gap (+${gapItem.gap} points).`);
  if (gapItem.blockedSkillCount > 0) limitingSignals.push(`Requires ${gapItem.blockedSkillCount} prerequisite skills.`);

  return {
    type: "SKILL_GAP",
    subject: gapItem.skillName,
    recommendation: `${gapItem.priorityCategory} Gap (${gapItem.priorityScore}/100)`,
    conciseWhy: gapItem.explanation,
    overallScore: gapItem.priorityScore,
    scoreBreakdown,
    positiveSignals,
    limitingSignals,
    evidence: {
      currentCapability: gapItem.capability,
      requiredCapability: gapItem.requiredCapability,
      gap: gapItem.gap,
      currentDemand: gapItem.currentDemand,
      futureDemand: gapItem.futureDemand,
      demandGrowth: gapItem.demandGrowth,
      roleImportance: gapItem.roleImportance
    },
    dependencies: {
      prerequisites: gapItem.prerequisites,
      unlocks: gapItem.unlocks,
      isBlocking: gapItem.isBlockingSkill,
      blockedCount: gapItem.blockedSkillCount,
      unlockedCount: gapItem.unlockedSkillCount
    },
    expectedImpact: {
      readinessGain: gapItem.potentialReadinessGain,
      marketPriority: gapItem.marketPriority
    },
    traceableSource: "Skill Gap Intelligence"
  };
}

/**
 * 2. EXPLAIN SKILL INTERVENTION ENGINE
 */
export function explainIntervention(skillId, roleId, studentCapabilities = null) {
  const capabilities = studentCapabilities || STUDENT_PROFILE.capabilities || {};
  const interventions = generateSkillInterventions(roleId, capabilities);
  const item = interventions.interventions.find((i) => i.skillId === skillId);
  const targetRole = ROLES_DATA.find((r) => r.id === roleId) || ROLES_DATA[0];

  if (!item) {
    return explainSkillGap(skillId, roleId, capabilities);
  }

  // Decompose Task 19 Priority Score
  const scoreBreakdown = [
    { factor: "Skill Gap Priority", contribution: Math.round(item.priorityScore * 0.35), weight: "35%" },
    { factor: "Industry Readiness Impact", contribution: Math.round((item.expectedReadinessGain / 25) * 100 * 0.20), weight: "20%" },
    { factor: "Role Importance", contribution: Math.round((item.roleImportance / 100) * 100 * 0.15), weight: "15%" },
    { factor: "Future Demand Trend", contribution: Math.round((item.futureDemand / 100) * 100 * 0.10), weight: "10%" },
    { factor: "Current Market Demand", contribution: Math.round((item.currentDemand / 100) * 100 * 0.05), weight: "5%" },
    { factor: "Unlock Downstream Value", contribution: Math.round(Math.min(1.0, item.unlockedSkillCount / 3) * 100 * 0.10), weight: "10%" },
    { factor: "Learning Effort Ease", contribution: Math.round(Math.max(0, 1.0 - (item.gap / 100)) * 100 * 0.05), weight: "5%" }
  ];

  const positiveSignals = [];
  if (item.interventionType === "UNLOCK") positiveSignals.push(`Unlocks ${item.expectedUnlockImpact} downstream capabilities.`);
  if (item.expectedReadinessGain > 0) positiveSignals.push(`Yields +${item.expectedReadinessGain}% readiness boost.`);
  if (item.futureDemand >= 80) positiveSignals.push(`Aligned with future demand (${item.futureDemand}%).`);

  const limitingSignals = [];
  if (item.prerequisiteBlockers.length > 0) {
    item.prerequisiteBlockers.forEach((pb) => limitingSignals.push(pb.reason));
  }

  return {
    type: "INTERVENTION",
    subject: item.skillName,
    recommendation: `${item.interventionType} — ${item.priorityLevel} (${item.priorityScore}/100)`,
    conciseWhy: item.reason,
    overallScore: item.priorityScore,
    scoreBreakdown,
    positiveSignals,
    limitingSignals,
    evidence: {
      action: item.action,
      expectedOutcome: item.expectedOutcome,
      currentCapability: item.currentCapability,
      requiredCapability: item.requiredCapability,
      gap: item.gap,
      estimatedEffort: item.estimatedEffort,
      learningPhase: item.learningPathPhase
    },
    dependencies: {
      prerequisites: item.prerequisites,
      unlocks: item.unlocks,
      isBlocking: item.isBlockingSkill,
      prerequisiteBlockers: item.prerequisiteBlockers
    },
    expectedImpact: {
      readinessGain: item.expectedReadinessGain,
      unlockCount: item.expectedUnlockImpact
    },
    traceableSource: "Skill Intervention Engine"
  };
}

/**
 * 3. EXPLAIN INDUSTRY READINESS ENGINE
 */
export function explainIndustryReadiness(roleId, studentCapabilities = null) {
  const capabilities = studentCapabilities || STUDENT_PROFILE.capabilities || {};
  const readiness = calculateIndustryReadiness(roleId, capabilities);

  const scoreBreakdown = [
    { factor: "Base Role Capability Coverage", contribution: Math.round(readiness.overallScore * 0.50), weight: "50%" },
    { factor: "Current Market Demand Alignment", contribution: Math.round(readiness.currentReadiness * 0.25), weight: "25%" },
    { factor: "Future Growth Demand Projection", contribution: Math.round(readiness.futureReadiness * 0.25), weight: "25%" }
  ];

  const positiveSignals = [];
  if (readiness.overallScore >= 75) positiveSignals.push("High capability coverage across required skills.");
  if (readiness.currentReadiness >= 75) positiveSignals.push("Strong current market alignment.");
  if (readiness.futureReadiness >= 80) positiveSignals.push("High future growth trajectory.");

  const limitingSignals = [];
  if (readiness.overallScore < 60) limitingSignals.push("Significant capability deficits across core role requirements.");

  return {
    type: "INDUSTRY_READINESS",
    subject: readiness?.targetRole?.name || readiness?.roleName || "Target Role",
    recommendation: `Industry Readiness: ${readiness.overallScore}/100 (${readiness.readinessLevel})`,
    conciseWhy: readiness.explanation,
    overallScore: readiness.overallScore,
    scoreBreakdown,
    positiveSignals,
    limitingSignals,
    evidence: {
      overallScore: readiness.overallScore,
      currentReadiness: readiness.currentReadiness,
      futureReadiness: readiness.futureReadiness,
      readinessLevel: readiness.readinessLevel,
      nextBestSkill: readiness.nextHighestValueSkill?.skillName
    },
    dependencies: {},
    expectedImpact: {
      nextSkillGain: readiness.nextHighestValueSkill?.potentialReadinessGain
    },
    traceableSource: "Industry Readiness Engine"
  };
}

/**
 * 4. EXPLAIN CAREER ROLE ADJACENCY
 */
export function explainRoleAdjacency(adjacentRoleId, targetRoleId, studentCapabilities = null) {
  const capabilities = studentCapabilities || STUDENT_PROFILE.capabilities || {};
  const comparison = compareRoles(targetRoleId, adjacentRoleId, capabilities);

  if (!comparison) {
    return {
      type: "ROLE_ADJACENCY",
      subject: adjacentRoleId,
      recommendation: "Adjacency Analysis Unavailable",
      conciseWhy: `Unable to calculate adjacency between ${targetRoleId} and ${adjacentRoleId}.`,
      overallScore: 0,
      scoreBreakdown: [],
      positiveSignals: [],
      limitingSignals: [],
      evidence: {},
      dependencies: {},
      traceableSource: "Career / Role Adjacency Engine"
    };
  }

  const overlapCount = comparison.sharedSkills?.length || 0;
  const targetName = comparison.targetRole?.name || "Target Role";
  const adjacentName = comparison.adjacentRole?.name || "Adjacent Role";
  const coverageScore = comparison.adjacentRole?.foundationCoverage || 0;
  const missingCount = comparison.missingForAdjacent?.length || 0;
  const adjacencyScore = comparison.adjacentRole?.adjacencyScore || 50;
  const category = comparison.adjacentRole?.category || "POSSIBLE TRANSITION";

  const scoreBreakdown = [
    { factor: "Target Skill Overlap", contribution: Math.round(overlapCount * 20), weight: "40%" },
    { factor: "Shared Capability Baseline", contribution: Math.round(coverageScore * 0.35), weight: "35%" },
    { factor: "Transition Learning Ease", contribution: Math.round(Math.max(0, 100 - missingCount * 10) * 0.25), weight: "25%" }
  ];

  const positiveSignals = [
    `Shares ${overlapCount} core skills with ${targetName}.`,
    `Current student capability in shared skills is ${coverageScore} pts.`
  ];

  const limitingSignals = [
    `Requires ${missingCount} new role competencies to transition.`
  ];

  return {
    type: "ROLE_ADJACENCY",
    subject: adjacentName,
    recommendation: `Role Adjacency: ${adjacencyScore}/100 (${category})`,
    conciseWhy: comparison.keyRelationshipReason,
    overallScore: adjacencyScore,
    scoreBreakdown,
    positiveSignals,
    limitingSignals,
    evidence: {
      targetRole: targetName,
      adjacentRole: adjacentName,
      skillOverlapCount: overlapCount,
      transitionGap: missingCount,
      sharedSkills: comparison.sharedSkills || [],
      missingSkills: comparison.missingForAdjacent || []
    },
    dependencies: {},
    expectedImpact: {},
    traceableSource: "Career / Role Adjacency Engine"
  };
}

/**
 * Master Unified Explanation Router
 */
export function generateExplanation(query) {
  const { type, skillId, roleId, targetRoleId, adjacentRoleId, studentCapabilities } = query;

  if (type === "INTERVENTION" && skillId && roleId) {
    return explainIntervention(skillId, roleId, studentCapabilities);
  }
  if (type === "SKILL_GAP" && skillId && roleId) {
    return explainSkillGap(skillId, roleId, studentCapabilities);
  }
  if (type === "INDUSTRY_READINESS" && roleId) {
    return explainIndustryReadiness(roleId, studentCapabilities);
  }
  if (type === "ROLE_ADJACENCY" && targetRoleId && adjacentRoleId) {
    return explainRoleAdjacency(adjacentRoleId, targetRoleId, studentCapabilities);
  }

  if (skillId && roleId) {
    return explainIntervention(skillId, roleId, studentCapabilities);
  }

  return {
    type: "UNKNOWN",
    subject: "Recommendation",
    recommendation: "Generic Recommendation",
    conciseWhy: "Reasoning generated from student capability baseline and role demand metrics.",
    overallScore: 70,
    scoreBreakdown: [],
    positiveSignals: [],
    limitingSignals: [],
    evidence: {},
    dependencies: {},
    traceableSource: "SkillBridge Intelligence Suite"
  };
}
