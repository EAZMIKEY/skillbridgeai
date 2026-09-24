import { STUDENT_PROFILE } from "@/data/studentProfile";
import { ROLES_DATA } from "@/data/skillGraph";
import { getRoleSkills, getSkillConnections } from "@/lib/skillGraphLogic";

export const THRESHOLDS = {
  DIRECT_TRANSFER: 75,
  STRONG_FOUNDATION: 50,
  PARTIAL_TRANSFER: 25
};

export function calculateTransferability(targetRoleId, profile = STUDENT_PROFILE) {
  const student = profile || STUDENT_PROFILE;
  
  let targetRole = ROLES_DATA.find((r) => r.id === targetRoleId);
  if (!targetRole) {
    targetRole = ROLES_DATA[0];
  }

  const requiredSkills = getRoleSkills(targetRole.id);
  let totalRequiredPoints = 0;
  let totalAchievedPoints = 0;

  const foundations = [];
  const missing = [];

  requiredSkills.forEach(({ node: skill, explanation: roleExplanation }) => {
    if (!skill) return;

    const requirement = skill.currentDemand > 0 ? skill.currentDemand : 70;
    const currentScore = (student.capabilities && student.capabilities[skill.id] !== undefined)
      ? student.capabilities[skill.id] 
      : 0;

    totalRequiredPoints += requirement;
    totalAchievedPoints += Math.min(currentScore, requirement);

    let classification = "Missing";
    let classificationReason = "";

    if (currentScore >= THRESHOLDS.DIRECT_TRANSFER) {
      classification = "Direct Transfer";
      classificationReason = `Your current ${skill.name} capability is ${currentScore}, placing it in Direct Transfer territory for this role (meets or exceeds requirement of ${requirement}).`;
    } else if (currentScore >= THRESHOLDS.STRONG_FOUNDATION) {
      classification = "Strong Foundation";
      classificationReason = `Your score of ${currentScore} indicates a strong working foundation, requiring only moderate topping up to meet target requirement of ${requirement}.`;
    } else if (currentScore >= THRESHOLDS.PARTIAL_TRANSFER) {
      classification = "Partial Transfer";
      classificationReason = `You have partial knowledge (${currentScore}), providing a head-start, but upskilling is needed to reach target requirement of ${requirement}.`;
    } else {
      classification = "Missing";
      classificationReason = currentScore === 0 
        ? `This skill is required by the role (Target: ${requirement}), but no current capability is detected in your profile.` 
        : `Your capability (${currentScore}) is below the partial transfer threshold (${THRESHOLDS.PARTIAL_TRANSFER}) relative to the target requirement of ${requirement}.`;
    }

    const gap = Math.max(0, requirement - currentScore);
    const transferabilityPct = requirement > 0 
      ? Math.min(100, Math.round((currentScore / requirement) * 100)) 
      : 0;

    const mappedSkill = {
      ...skill,
      currentScore,
      targetRequirement: requirement,
      gap,
      transferabilityPct,
      classification,
      classificationReason,
      roleExplanation
    };

    if (classification === "Missing") {
      missing.push(mappedSkill);
    } else {
      foundations.push(mappedSkill);
    }
  });

  // Calculate learning priority for missing skills
  missing.forEach((mSkill) => {
    const connections = getSkillConnections(mSkill.id);
    
    // Missing skills that this mSkill connects to as a parent (child direction)
    const downstreamMissing = connections
      .filter((conn) => conn.direction === "child" && missing.some((ms) => ms.id === conn.node.id))
      .map((conn) => conn.node.name);

    // Missing skills that connect to this mSkill as a parent (parent direction)
    const upstreamMissing = connections
      .filter((conn) => conn.direction === "parent" && missing.some((ms) => ms.id === conn.node.id))
      .map((conn) => conn.node.name);

    const isPrerequisite = downstreamMissing.length > 0;
    const isDependent = upstreamMissing.length > 0;

    if (isPrerequisite && !isDependent) {
      mSkill.priorityLevel = 1;
      mSkill.priorityLabel = "Priority 1";
      mSkill.priorityCategory = "Foundational prerequisite";
      mSkill.priorityReason = `Foundational prerequisite for ${downstreamMissing.join(", ")}. Required before learning downstream competencies in your gap list.`;
    } else if (!isPrerequisite && !isDependent) {
      mSkill.priorityLevel = 2;
      mSkill.priorityLabel = "Priority 2";
      mSkill.priorityCategory = "Core transition skill";
      mSkill.priorityReason = `Core transition skill with direct relevance to the target role.`;
    } else {
      mSkill.priorityLevel = 3;
      mSkill.priorityLabel = "Priority 3";
      mSkill.priorityCategory = "Advanced/dependent skill";
      mSkill.priorityReason = isDependent
        ? `Advanced/dependent skill. Depends on ${upstreamMissing.join(", ")}, which should be prioritized first.`
        : `Advanced/dependent skill. Prioritize establishing foundational prerequisites first.`;
    }

    mSkill.isPrerequisite = isPrerequisite;
    mSkill.isDependent = isDependent;
    mSkill.downstreamMissing = downstreamMissing;
    mSkill.upstreamMissing = upstreamMissing;

    mSkill.explanation = `${mSkill.name} is required by the target role (Target: ${mSkill.targetRequirement}, Current: ${mSkill.currentScore}). ${mSkill.priorityReason}`;
  });

  // Sort missing skills by priorityLevel asc, then name asc for determinism
  missing.sort((a, b) => {
    if (a.priorityLevel !== b.priorityLevel) return a.priorityLevel - b.priorityLevel;
    return a.name.localeCompare(b.name);
  });

  // Sort foundations deterministically (score desc, then name asc)
  foundations.sort((a, b) => {
    if (b.currentScore !== a.currentScore) return b.currentScore - a.currentScore;
    return a.name.localeCompare(b.name);
  });

  const foundationCoverage = totalRequiredPoints > 0 
    ? Math.max(0, Math.min(100, Math.round((totalAchievedPoints / totalRequiredPoints) * 100))) 
    : 0;

  return {
    targetRole,
    student,
    totalRequiredSkills: requiredSkills.length,
    transferableCapabilities: foundations.length,
    strongFoundations: foundations.filter(f => f.classification === "Strong Foundation").length,
    partialTransfers: foundations.filter(f => f.classification === "Partial Transfer").length,
    directTransfers: foundations.filter(f => f.classification === "Direct Transfer").length,
    missingCriticals: missing.length,
    foundationCoverage,
    foundations,
    missing
  };
}
