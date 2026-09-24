import { STUDENT_PROFILE } from "@/data/studentProfile";
import { SKILLS_DATA } from "@/data/skillModel";
import { ROLES_DATA } from "@/data/skillGraph";
import { getRoleSkills, getSkillConnections } from "@/lib/skillGraphLogic";
import { calculateTransferability } from "@/lib/skillTransferability";
import { generateLearningPath } from "@/lib/learningPathGenerator";
import { getAdjacentRoles } from "@/lib/roleAdjacency";
import { buildStudentSkillTwin } from "@/lib/studentSkillTwin";
import { calculateIndustryReadiness } from "@/lib/industryReadiness";
import { analyzeSkillGaps } from "@/lib/skillGapIntelligence";
import { generateSkillInterventions } from "@/lib/skillIntervention";
import { generateExplanation } from "@/lib/explainability";

function clamp(val, min = 0, max = 100) {
  if (val === undefined || val === null || isNaN(val)) return min;
  return Math.max(min, Math.min(max, Math.round(Number(val))));
}

/**
 * Generate 5 deterministic mission execution steps based on skill type & gap.
 */
export function generateMissionSteps(skill, missionType, gap, prerequisites) {
  const name = skill.name || skill.id;
  const prereqNames = prerequisites.join(", ");

  if (missionType === "UNLOCK") {
    return [
      { stepId: 1, title: `Understand ${name} Core Architecture`, description: `Review foundational concepts and dependency position of ${name}.`, type: "THEORY", completed: false },
      { stepId: 2, title: `Clear Prerequisite Friction (${prereqNames || "Baseline"})`, description: `Ensure foundational skills are active to support ${name}.`, type: "PREREQUISITE", completed: false },
      { stepId: 3, title: `Build Practical Hands-on ${name} Lab`, description: `Set up a baseline environment and complete essential exercises.`, type: "PRACTICE", completed: false },
      { stepId: 4, title: `Execute Dependency Verification Task`, description: `Demonstrate capability score reaching target threshold.`, type: "VERIFICATION", completed: false },
      { stepId: 5, title: `Unlock Downstream Skill Pipeline`, description: `Release downstream skill dependencies across target role graph.`, type: "UNLOCK", completed: false }
    ];
  }

  if (missionType === "LEARN") {
    return [
      { stepId: 1, title: `Study ${name} Fundamentals`, description: `Cover core theory, key terminologies, and industry workflows.`, type: "THEORY", completed: false },
      { stepId: 2, title: `Guided Code/System Walkthrough`, description: `Follow step-by-step implementations and reference solutions.`, type: "GUIDED", completed: false },
      { stepId: 3, title: `Build Mini Project in ${name}`, description: `Develop a standalone prototype addressing a target requirement.`, type: "PROJECT", completed: false },
      { stepId: 4, title: `Refactor & Optimize Implementation`, description: `Apply best practices and optimize system performance.`, type: "REFACTOR", completed: false },
      { stepId: 5, title: `Verify Role Capability Milestone`, description: `Achieve target capability score and validate readiness impact.`, type: "VERIFICATION", completed: false }
    ];
  }

  if (missionType === "STRENGTHEN" || missionType === "PRACTICE") {
    return [
      { stepId: 1, title: `Assess Existing ${name} Foundation`, description: `Review current capability score and identify specific deficit areas.`, type: "ASSESSMENT", completed: false },
      { stepId: 2, title: `Apply ${name} to Advanced Scenario`, description: `Solve real-world industry problem statements.`, type: "PRACTICE", completed: false },
      { stepId: 3, title: `Integrate with Connected Capabilities`, description: `Connect ${name} with companion skills in target role stack.`, type: "INTEGRATION", completed: false },
      { stepId: 4, title: `Benchmark Performance & Speed`, description: `Test solution under role-specific constraints.`, type: "BENCHMARK", completed: false },
      { stepId: 5, title: `Complete Capability Mastery Check`, description: `Reach full requirement score threshold.`, type: "VERIFICATION", completed: false }
    ];
  }

  return [
    { stepId: 1, title: `Review ${name} Industry Updates`, description: `Stay updated on recent trends and framework evolutions.`, type: "MAINTENANCE", completed: false },
    { stepId: 2, title: `Conduct Periodic Skill Refresher`, description: `Re-verify core knowledge through practical exercise.`, type: "PRACTICE", completed: false },
    { stepId: 3, title: `Sustain Target Capability Score`, description: `Maintain current high capability baseline.`, type: "VERIFICATION", completed: false }
  ];
}

/**
 * Pure deterministic Skill Missions Engine.
 */
export function generateSkillMissions(roleId, studentCapabilities = null) {
  const capabilities = studentCapabilities || STUDENT_PROFILE.capabilities || {};
  const targetRole = ROLES_DATA.find((r) => r.id === roleId) || ROLES_DATA[0];

  // Consume existing intelligence stack
  const gapAnalysis = analyzeSkillGaps(targetRole.id, capabilities);
  const interventions = generateSkillInterventions(targetRole.id, capabilities);
  const readiness = calculateIndustryReadiness(targetRole.id, capabilities);
  const learningPath = generateLearningPath(targetRole.id, capabilities);
  const twin = buildStudentSkillTwin(capabilities, targetRole.id);

  if (!gapAnalysis.gaps || gapAnalysis.gaps.length === 0) {
    return {
      targetRole: { id: targetRole.id, name: targetRole.name },
      summary: { totalMissions: 0, availableMissions: 0, completedMissions: 0, lockedMissions: 0 },
      missions: [],
      topMissions: [],
      nextBestMission: null,
      missionPlan: [],
      readiness,
      gapAnalysis
    };
  }

  // Generate a structured Mission object for each intervention item
  const missions = interventions.interventions.map((intervention) => {
    const skill = SKILLS_DATA.find((s) => s.id === intervention.skillId) || {
      id: intervention.skillId,
      name: intervention.skillName
    };

    const missionId = `mission_${skill.id}`;
    const missionType = intervention.interventionType;
    const currentCapability = intervention.currentCapability;
    const targetCapability = intervention.requiredCapability;
    const gap = intervention.gap;
    const isBlockingSkill = intervention.isBlockingSkill;

    // Determine Mission State (LOCKED / AVAILABLE / COMPLETED)
    let state = "AVAILABLE";
    if (gap === 0) {
      state = "COMPLETED";
    } else if (intervention.prerequisiteBlockers.length > 0) {
      state = "LOCKED";
    }

    // Dynamic Title & Difficulty
    let title = "";
    let difficulty = "INTERMEDIATE";
    if (missionType === "UNLOCK") {
      title = `UNLOCK FOUNDATION: ${skill.name}`;
      difficulty = "HIGH";
    } else if (missionType === "LEARN") {
      title = `CORE SKILL: Build ${skill.name}`;
      difficulty = gap > 50 ? "ADVANCED" : "INTERMEDIATE";
    } else if (missionType === "STRENGTHEN") {
      title = `CAPABILITY ELEVATION: ${skill.name}`;
      difficulty = "INTERMEDIATE";
    } else if (missionType === "PRACTICE") {
      title = `PRACTICAL MASTERY: ${skill.name}`;
      difficulty = "BEGINNER";
    } else {
      title = `MAINTAIN MASTERY: ${skill.name}`;
      difficulty = "LIGHT";
    }

    // Steps Generation
    const steps = generateMissionSteps(skill, missionType, gap, intervention.prerequisites);

    // Completion Criteria
    const completionCriteria = {
      targetCapabilityThreshold: targetCapability,
      readinessGainTarget: intervention.expectedReadinessGain,
      prerequisitesCleared: intervention.prerequisiteBlockers.length === 0,
      downstreamUnlockedCount: intervention.expectedUnlockImpact
    };

    // Consume Task 21 Explainability Layer for traceable reasoning
    const explanationData = generateExplanation({
      type: "INTERVENTION",
      skillId: skill.id,
      roleId: targetRole.id,
      studentCapabilities: capabilities
    });

    return {
      missionId,
      title,
      targetSkill: skill.id,
      targetSkillName: skill.name,
      missionType,
      priority: intervention.priorityLevel,
      priorityScore: intervention.priorityScore,
      difficulty,
      estimatedEffort: intervention.estimatedEffort,
      currentCapability,
      targetCapability,
      gap,
      state,
      reason: intervention.reason,
      expectedOutcome: intervention.expectedOutcome,
      prerequisiteSkills: intervention.prerequisites,
      unlockedSkills: intervention.unlocks,
      isBlockingSkill,
      prerequisiteBlockers: intervention.prerequisiteBlockers,
      affectedRole: targetRole.name,
      readinessImpact: intervention.expectedReadinessGain,
      steps,
      completionCriteria,
      explanation: explanationData
    };
  });

  // Sort missions deterministically:
  // 1. priorityScore descending
  // 2. state (AVAILABLE/IN_PROGRESS before LOCKED/COMPLETED)
  // 3. targetSkillName ascending
  missions.sort((a, b) => {
    if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
    if (a.state === "AVAILABLE" && b.state === "LOCKED") return -1;
    if (a.state === "LOCKED" && b.state === "AVAILABLE") return 1;
    return a.targetSkillName.localeCompare(b.targetSkillName);
  });

  const availableMissions = missions.filter((m) => m.state === "AVAILABLE").length;
  const lockedMissions = missions.filter((m) => m.state === "LOCKED").length;
  const completedMissions = missions.filter((m) => m.state === "COMPLETED").length;

  // Next Best Mission Selection
  const availableCandidates = missions.filter((m) => m.state === "AVAILABLE" && m.gap > 0);
  const nextBestMission = availableCandidates.length > 0 ? availableCandidates[0] : (missions.length > 0 ? missions[0] : null);

  // Structured Mission Roadmap Phases
  const missionPlan = [
    { phase: 1, title: "1. UNBLOCK FOUNDATIONAL MISSIONS", missions: missions.filter((m) => m.missionType === "UNLOCK") },
    { phase: 2, title: "2. BUILD CORE SKILL MISSIONS", missions: missions.filter((m) => m.missionType === "LEARN") },
    { phase: 3, title: "3. STRENGTHEN DEVELOPING MISSIONS", missions: missions.filter((m) => m.missionType === "STRENGTHEN") },
    { phase: 4, title: "4. PRACTICAL MASTERY MISSIONS", missions: missions.filter((m) => m.missionType === "PRACTICE") },
    { phase: 5, title: "5. MAINTENANCE MISSIONS", missions: missions.filter((m) => m.missionType === "MAINTAIN") }
  ].filter((p) => p.missions.length > 0);

  return {
    targetRole: { id: targetRole.id, name: targetRole.name },
    summary: {
      totalMissions: missions.length,
      availableMissions,
      lockedMissions,
      completedMissions
    },
    missions,
    topMissions: missions.slice(0, 4),
    nextBestMission,
    missionPlan,
    readiness,
    gapAnalysis,
    learningPath,
    studentSkillTwin: twin
  };
}
