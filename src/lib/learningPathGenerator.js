import { STUDENT_PROFILE } from "@/data/studentProfile";
import { ROLES_DATA } from "@/data/skillGraph";
import { getRoleSkills, getSkillConnections } from "@/lib/skillGraphLogic";
import { calculateTransferability, THRESHOLDS } from "@/lib/skillTransferability";

/**
 * DETERMINISTIC LEARNING PRIORITY FORMULA:
 * 
 * priorityScore = (downstreamUnlockCount * 30)       // Unlock value: number of target-role skills unlocked
 *               + (isPrerequisiteInGraph ? 20 : 0)   // General prerequisite status
 *               + (gapSeverityRatio * 35)            // Gap ratio: (targetRequirement - currentCapability) / targetRequirement * 35
 *               + (hasPartialFoundation ? 15 : 0)    // Boost for building on partial foundations (25 <= score < 50)
 *               - (unlearnedPrerequisiteCount * 25)  // Penalty if parent prerequisites are not yet learned
 */

/**
 * Map gap and capability status to a prototype estimated effort range.
 */
export function getEstimatedEffort(gap, currentScore, isPrerequisite) {
  if (gap <= 0) return { label: "Completed", weeksMin: 0, weeksMax: 0 };
  if (gap <= 15 || currentScore >= 50) return { label: "1–2 weeks", weeksMin: 1, weeksMax: 2 };
  if (gap <= 30 || currentScore >= 25) return { label: "2–4 weeks", weeksMin: 2, weeksMax: 4 };
  if (gap <= 50 && !isPrerequisite) return { label: "4–6 weeks", weeksMin: 4, weeksMax: 6 };
  return { label: "6–8 weeks", weeksMin: 6, weeksMax: 8 };
}

/**
 * Generate a deterministic, explainable upskilling roadmap for a given target role and student profile.
 */
export function generateLearningPath(targetRoleId, studentCapabilities = null) {
  // Construct student profile override if custom capabilities object provided
  const profile = studentCapabilities 
    ? { ...STUDENT_PROFILE, capabilities: studentCapabilities }
    : STUDENT_PROFILE;

  // Retrieve base transferability metrics from Task 13 engine
  const transferability = calculateTransferability(targetRoleId, profile);
  
  if (!transferability || !transferability.targetRole) {
    const fallbackRole = ROLES_DATA[0];
    return generateLearningPath(fallbackRole.id, studentCapabilities);
  }

  const { targetRole, foundationCoverage, foundations, missing } = transferability;

  // Retrieve all skills required by the target role
  const requiredSkillEntries = getRoleSkills(targetRole.id);
  
  // Combine foundations and missing skills into a unified list of required skills
  const allTargetSkills = [...foundations, ...missing];

  // Identify skills needing upskilling (gap > 0 or classification is not Direct Transfer)
  const skillsToLearn = allTargetSkills.map((skill) => {
    const connections = getSkillConnections(skill.id);

    // Parent skills (prerequisites for this skill)
    const prerequisiteSkills = connections
      .filter((conn) => conn.direction === "parent")
      .map((conn) => conn.node.name);

    // Child skills (skills unlocked by this skill)
    const unlocksSkills = connections
      .filter((conn) => conn.direction === "child")
      .map((conn) => conn.node.name);

    // Downstream skills required by THIS SPECIFIC target role that list this skill as parent
    const downstreamRoleUnlocks = connections
      .filter((conn) => conn.direction === "child" && allTargetSkills.some((ts) => ts.id === conn.node.id))
      .map((conn) => conn.node.name);

    // Upstream skills required by THIS SPECIFIC target role that are parents of this skill
    const upstreamRolePrereqs = connections
      .filter((conn) => conn.direction === "parent" && allTargetSkills.some((ts) => ts.id === conn.node.id))
      .map((conn) => conn.node.name);

    // Count how many parent prerequisite skills in this role are NOT yet sufficiently learned (< PARTIAL_TRANSFER)
    const unlearnedPrerequisiteCount = connections.filter((conn) => {
      if (conn.direction !== "parent") return false;
      const parentInRole = allTargetSkills.find((ts) => ts.id === conn.node.id);
      return parentInRole && parentInRole.currentScore < THRESHOLDS.PARTIAL_TRANSFER;
    }).length;

    const isPrerequisite = downstreamRoleUnlocks.length > 0;
    const gapRatio = skill.targetRequirement > 0 ? (skill.gap / skill.targetRequirement) : 0;
    const hasPartialFoundation = skill.currentScore >= THRESHOLDS.PARTIAL_TRANSFER && skill.currentScore < THRESHOLDS.STRONG_FOUNDATION;

    // Calculate Priority Score using explicit formula
    let priorityScore = (downstreamRoleUnlocks.length * 30)
                      + (isPrerequisite ? 20 : 0)
                      + Math.round(gapRatio * 35)
                      + (hasPartialFoundation ? 15 : 0)
                      - (unlearnedPrerequisiteCount * 25);

    priorityScore = Math.max(0, priorityScore);

    // Priority Level classification (1 = Foundational Prerequisite, 2 = Core Transition, 3 = Advanced/Dependent)
    let priorityLevel = 2;
    let priorityCategory = "Core transition skill";
    
    if (isPrerequisite && unlearnedPrerequisiteCount === 0) {
      priorityLevel = 1;
      priorityCategory = "Foundational prerequisite";
    } else if (unlearnedPrerequisiteCount > 0) {
      priorityLevel = 3;
      priorityCategory = "Advanced/dependent skill";
    } else if (skill.currentScore >= THRESHOLDS.STRONG_FOUNDATION) {
      priorityLevel = 1;
      priorityCategory = "Quick-win foundation";
    }

    const effort = getEstimatedEffort(skill.gap, skill.currentScore, isPrerequisite);

    // Dynamic Explainability string
    let why = "";
    if (skill.gap === 0 || skill.currentScore >= skill.targetRequirement) {
      why = `You meet or exceed the ${skill.targetRequirement} point requirement for ${targetRole.name}. Focus on maintaining competency.`;
    } else if (isPrerequisite && unlearnedPrerequisiteCount === 0) {
      why = `Prioritized as a foundational prerequisite for ${downstreamRoleUnlocks.join(", ")}. Establishing this competency first unlocks downstream role requirements.`;
    } else if (unlearnedPrerequisiteCount > 0) {
      why = `Scheduled after foundational prerequisites (${upstreamRolePrereqs.join(", ")}) are established to ensure optimal learning progression.`;
    } else if (hasPartialFoundation) {
      why = `You already possess a partial foundation (${skill.currentScore} pts). Strengthening this gap (+${skill.gap} pts) provides a high-return quick win toward ${targetRole.name}.`;
    } else {
      why = `Core requirement for ${targetRole.name} (Target: ${skill.targetRequirement}, Current: ${skill.currentScore}). Priority gap of ${skill.gap} pts.`;
    }

    return {
      skillId: skill.id,
      skillName: skill.name,
      currentCapability: skill.currentScore,
      requiredCapability: skill.targetRequirement,
      gap: skill.gap,
      classification: skill.classification,
      priorityScore,
      priorityLevel,
      priorityCategory,
      isPrerequisite,
      unlearnedPrerequisiteCount,
      prerequisiteSkills,
      unlocksSkills,
      downstreamRoleUnlocks,
      upstreamRolePrereqs,
      estimatedEffort: effort.label,
      weeksMin: effort.weeksMin,
      weeksMax: effort.weeksMax,
      why,
      roleExplanation: skill.roleExplanation || `Required for ${targetRole.name}`
    };
  });

  // Filter skills that actually require learning (gap > 0)
  const activeLearningSkills = skillsToLearn.filter((s) => s.gap > 0);

  // Deterministic sorting of learning skills
  activeLearningSkills.sort((a, b) => {
    // 1. Skills with 0 unlearned prerequisites come first
    if (a.unlearnedPrerequisiteCount !== b.unlearnedPrerequisiteCount) {
      return a.unlearnedPrerequisiteCount - b.unlearnedPrerequisiteCount;
    }
    // 2. Priority Score descending
    if (b.priorityScore !== a.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }
    // 3. Gap descending
    if (b.gap !== a.gap) {
      return b.gap - a.gap;
    }
    // 4. Deterministic string sort by skillName
    return a.skillName.localeCompare(b.skillName);
  });

  // Total estimated effort calculation
  const totalMinWeeks = activeLearningSkills.reduce((acc, s) => acc + s.weeksMin, 0);
  const totalMaxWeeks = activeLearningSkills.reduce((acc, s) => acc + s.weeksMax, 0);
  
  let totalEstimatedEffort = "0 weeks";
  if (activeLearningSkills.length > 0) {
    // Format realistic prototype aggregated range
    const aggregateMin = Math.max(1, Math.round(totalMinWeeks * 0.75));
    const aggregateMax = Math.round(totalMaxWeeks * 0.85);
    totalEstimatedEffort = `${aggregateMin}–${aggregateMax} weeks`;
  }

  // Handle Fully Aligned Student Edge Case
  if (activeLearningSkills.length === 0) {
    return {
      targetRoleId: targetRole.id,
      targetRoleName: targetRole.name,
      foundationCoverage,
      nextBestSkill: null,
      nextBestSkillReason: "You're already well aligned with this role! All core requirements are satisfied.",
      totalEstimatedEffort: "0 weeks",
      totalSkillsToLearn: 0,
      isFullyAligned: true,
      phases: [
        {
          phaseNumber: 1,
          title: "Phase 1 — Maintenance & Specialization",
          description: "All core role requirements are met. Focus on continuous practice and exploring advanced specializations.",
          skills: skillsToLearn.map(s => ({
            ...s,
            priorityCategory: "Fully Covered",
            why: `You have met the target requirement of ${s.requiredCapability} for ${s.skillName}.`
          }))
        }
      ]
    };
  }

  // Next Best Skill Selection (top item in sorted learning list)
  const topSkill = activeLearningSkills[0];
  const nextBestSkill = {
    skillId: topSkill.skillId,
    skillName: topSkill.skillName,
    currentCapability: topSkill.currentCapability,
    requiredCapability: topSkill.requiredCapability,
    gap: topSkill.gap,
    estimatedEffort: topSkill.estimatedEffort,
    reason: topSkill.why
  };
  const nextBestSkillReason = `Highest priority next step: ${topSkill.skillName}. ${topSkill.why}`;

  // Organize skills into Learning Phases
  const phase1Skills = [];
  const phase2Skills = [];
  const phase3Skills = [];

  activeLearningSkills.forEach((skill) => {
    if (skill.unlearnedPrerequisiteCount === 0 && (skill.isPrerequisite || skill.priorityLevel === 1 || skill.currentCapability >= THRESHOLDS.PARTIAL_TRANSFER)) {
      phase1Skills.push(skill);
    } else if (skill.unlearnedPrerequisiteCount > 0 || skill.gap > 45) {
      phase3Skills.push(skill);
    } else {
      phase2Skills.push(skill);
    }
  });

  // Ensure Phase 1 has at least 1 skill if active learning skills exist
  if (phase1Skills.length === 0 && activeLearningSkills.length > 0) {
    phase1Skills.push(activeLearningSkills[0]);
    const indexIn2 = phase2Skills.findIndex((s) => s.skillId === activeLearningSkills[0].skillId);
    if (indexIn2 !== -1) phase2Skills.splice(indexIn2, 1);
    const indexIn3 = phase3Skills.findIndex((s) => s.skillId === activeLearningSkills[0].skillId);
    if (indexIn3 !== -1) phase3Skills.splice(indexIn3, 1);
  }

  const phases = [];

  if (phase1Skills.length > 0) {
    phases.push({
      phaseNumber: 1,
      title: "Phase 1 — Strengthen Foundations",
      description: "Establish foundational prerequisites and build on existing partial knowledge to unlock core role requirements.",
      skills: phase1Skills
    });
  }

  if (phase2Skills.length > 0) {
    phases.push({
      phaseNumber: phases.length + 1,
      title: `Phase ${phases.length + 1} — Build Core Skills`,
      description: "Develop core competencies directly required for daily execution in the target role.",
      skills: phase2Skills
    });
  }

  if (phase3Skills.length > 0) {
    phases.push({
      phaseNumber: phases.length + 1,
      title: `Phase ${phases.length + 1} — Develop Advanced Skills`,
      description: "Master specialized and dependent competencies after foundational prerequisites are completed.",
      skills: phase3Skills
    });
  }

  return {
    targetRoleId: targetRole.id,
    targetRoleName: targetRole.name,
    foundationCoverage,
    nextBestSkill,
    nextBestSkillReason,
    totalEstimatedEffort,
    totalSkillsToLearn: activeLearningSkills.length,
    isFullyAligned: false,
    phases
  };
}
