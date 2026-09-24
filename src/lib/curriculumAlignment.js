import { TRAINING_PROGRAMS } from "@/data/trainingPrograms";
import { STUDENT_PROFILE } from "@/data/studentProfile";
import { SKILLS_DATA } from "@/data/skillModel";
import { ROLES_DATA } from "@/data/skillGraph";
import { getRoleSkills, getSkillConnections } from "@/lib/skillGraphLogic";
import { INDUSTRY_CHALLENGES } from "@/data/industryChallengesData";
import { calculateChallengeFit } from "@/lib/industryChallenges";
import { generateExplanation } from "@/lib/explainability";

function clamp(val, min = 0, max = 100) {
  if (val === undefined || val === null || isNaN(val)) return min;
  return Math.max(min, Math.min(max, Math.round(Number(val))));
}

/**
 * Search, filter, and sort Training Programs deterministically.
 */
export function getTrainingPrograms(filters = {}, studentCapabilities = null) {
  const capabilities = studentCapabilities || STUDENT_PROFILE.capabilities || {};

  let list = TRAINING_PROGRAMS.map((prog) => {
    const alignment = calculateCurriculumAlignment(prog.id);
    const projectedImpact = calculateProjectedStudentImpact(prog.id, capabilities);
    return {
      ...prog,
      alignment,
      projectedImpact
    };
  });

  // Search filter
  if (filters.search && typeof filters.search === "string" && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.provider.toLowerCase().includes(q) ||
      p.domain.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.coveredSkills.some(s => s.skillId.toLowerCase().includes(q))
    );
  }

  // Domain filter
  if (filters.domain && filters.domain !== "ALL") {
    list = list.filter((p) => p.domain.toLowerCase() === filters.domain.toLowerCase());
  }

  // Level filter
  if (filters.level && filters.level !== "ALL") {
    list = list.filter((p) => p.level.toLowerCase() === filters.level.toLowerCase());
  }

  // Delivery mode filter
  if (filters.deliveryMode && filters.deliveryMode !== "ALL") {
    list = list.filter((p) => p.deliveryMode.toLowerCase().includes(filters.deliveryMode.toLowerCase()));
  }

  // Skill filter
  if (filters.skill) {
    list = list.filter((p) => p.coveredSkills.some(s => s.skillId === filters.skill));
  }

  // Trajectory filter
  if (filters.trajectory && filters.trajectory !== "ALL") {
    list = list.filter((p) => p.alignment.trajectory === filters.trajectory);
  }

  // Sorting
  const sortBy = filters.sortBy || "bestIndustry";
  list.sort((a, b) => {
    if (sortBy === "bestIndustry") return b.alignment.currentAlignment - a.alignment.currentAlignment;
    if (sortBy === "bestFuture") return b.alignment.futureAlignment - a.alignment.futureAlignment;
    if (sortBy === "highestCoverage") return b.alignment.skillCoverageScore - a.alignment.skillCoverageScore;
    if (sortBy === "highestPractical") return b.alignment.practicalExposureScore - a.alignment.practicalExposureScore;
    return 0;
  });

  return list;
}

/**
 * Transparent Curriculum Alignment Score Calculation (0-100)
 * 
 * Formula:
 * Alignment Score =
 *   (Skill Coverage * 0.30)
 * + (Skill Depth * 0.20)
 * + (Practical Exposure * 0.15)
 * + (Current Industry Demand * 0.15)
 * + (Future Industry Demand * 0.15)
 * + (Role Coverage * 0.05)
 * - (Staleness Penalty)
 */
export function calculateCurriculumAlignment(programId) {
  let program = TRAINING_PROGRAMS.find((p) => p.id === programId);
  if (!program) {
    program = TRAINING_PROGRAMS[0];
  }

  const covered = program.coveredSkills || [];
  if (covered.length === 0) {
    return {
      currentAlignment: 0,
      futureAlignment: 0,
      alignmentDelta: 0,
      trajectory: "FUTURE RISK",
      skillCoverageScore: 0,
      skillDepthScore: 0,
      practicalExposureScore: 0,
      currentDemandScore: 0,
      futureDemandScore: 0,
      roleCoverageScore: 0,
      stalenessPenalty: 20,
      breakdown: {
        coverage: 0,
        depth: 0,
        practical: 0,
        currentDemand: 0,
        futureDemand: 0,
        roleCoverage: 0,
        staleness: 20
      }
    };
  }

  let totalCoverage = 0;
  let totalDepth = 0;
  let totalPractical = 0;
  let totalCurrentDemand = 0;
  let totalFutureDemand = 0;

  const skillDetails = covered.map((c) => {
    const sData = SKILLS_DATA.find((s) => s.id === c.skillId) || { name: c.skillId, currentDemand: 70, futureDemand: 80 };
    totalCoverage += c.coverageLevel;
    totalDepth += c.depth;
    totalPractical += c.practicalExposure;
    totalCurrentDemand += sData.currentDemand;
    totalFutureDemand += sData.futureDemand;

    let status = "COVERED";
    if (c.coverageLevel >= 85 && c.depth >= 85) status = "MASTERED / STRONGLY COVERED";
    else if (c.coverageLevel >= 70) status = "COVERED";
    else if (c.coverageLevel >= 45) status = "PARTIALLY COVERED";
    else if (c.coverageLevel >= 20) status = "WEAK COVERAGE";
    else status = "MISSING";

    return {
      skillId: c.skillId,
      skillName: sData.name,
      coverageLevel: c.coverageLevel,
      depth: c.depth,
      practicalExposure: c.practicalExposure,
      currentDemand: sData.currentDemand,
      futureDemand: sData.futureDemand,
      status
    };
  });

  const count = covered.length;
  const skillCoverageScore = Math.round(totalCoverage / count);
  const skillDepthScore = Math.round(totalDepth / count);
  const practicalExposureScore = Math.round(totalPractical / count);
  const currentDemandScore = Math.round(totalCurrentDemand / count);
  const futureDemandScore = Math.round(totalFutureDemand / count);
  const roleCoverageScore = Math.min(100, (program.industryAlignment?.targetRoles?.length || 1) * 35);

  // Check Staleness Penalty based on lastUpdated year
  const updatedYear = parseInt((program.lastUpdated || "2026").substring(0, 4), 10);
  const currentYear = 2026;
  const stalenessPenalty = Math.max(0, (currentYear - updatedYear) * 10);

  // Current Alignment Formula
  const rawCurrent = (skillCoverageScore * 0.30) + 
                     (skillDepthScore * 0.20) + 
                     (practicalExposureScore * 0.15) + 
                     (currentDemandScore * 0.15) + 
                     (currentDemandScore * 0.15) + 
                     (roleCoverageScore * 0.05) - 
                     stalenessPenalty;

  // Future Alignment Formula (weights future demand higher)
  const rawFuture = (skillCoverageScore * 0.25) + 
                    (skillDepthScore * 0.20) + 
                    (practicalExposureScore * 0.15) + 
                    (currentDemandScore * 0.10) + 
                    (futureDemandScore * 0.25) + 
                    (roleCoverageScore * 0.05) - 
                    stalenessPenalty;

  const currentAlignment = clamp(rawCurrent);
  const futureAlignment = clamp(rawFuture);
  const alignmentDelta = futureAlignment - currentAlignment;

  let trajectory = "STABLE";
  if (alignmentDelta >= 3) trajectory = "IMPROVING";
  else if (alignmentDelta <= -4 || futureAlignment < 60) trajectory = "FUTURE RISK";

  return {
    currentAlignment,
    futureAlignment,
    alignmentDelta,
    trajectory,
    skillCoverageScore,
    skillDepthScore,
    practicalExposureScore,
    currentDemandScore,
    futureDemandScore,
    roleCoverageScore,
    stalenessPenalty,
    skillDetails,
    breakdown: {
      coverage: skillCoverageScore,
      depth: skillDepthScore,
      practical: practicalExposureScore,
      currentDemand: currentDemandScore,
      futureDemand: futureDemandScore,
      roleCoverage: roleCoverageScore,
      staleness: stalenessPenalty
    }
  };
}

/**
 * Curriculum Skill Gap Intelligence Report
 */
export function getCurriculumGaps(programId) {
  let program = TRAINING_PROGRAMS.find((p) => p.id === programId);
  if (!program) program = TRAINING_PROGRAMS[0];

  const coveredIds = new Set(program.coveredSkills.map((s) => s.skillId));
  const targetRoles = program.industryAlignment?.targetRoles || ["r_backend"];

  // Collect all required skills across target roles
  const requiredRoleSkills = [];
  targetRoles.forEach((roleId) => {
    const roleSkills = getRoleSkills(roleId);
    roleSkills.forEach((entry) => {
      if (entry.node && !requiredRoleSkills.some(r => r.skillId === entry.node.id)) {
        const sData = SKILLS_DATA.find(s => s.id === entry.node.id) || { name: entry.node.id, currentDemand: 70, futureDemand: 80 };
        requiredRoleSkills.push({
          skillId: entry.node.id,
          skillName: sData.name,
          currentDemand: sData.currentDemand,
          futureDemand: sData.futureDemand,
          trend: sData.futureDemand - sData.currentDemand
        });
      }
    });
  });

  const criticalGaps = [];
  const futureGaps = [];
  const weakCoverage = [];
  const strengths = [];

  // Check covered skills
  program.coveredSkills.forEach((cov) => {
    const sData = SKILLS_DATA.find(s => s.id === cov.skillId) || { name: cov.skillId, currentDemand: 70, futureDemand: 80 };
    if (cov.coverageLevel >= 80 && cov.depth >= 80) {
      strengths.push({ skillId: cov.skillId, name: sData.name, coverageLevel: cov.coverageLevel, reason: "Strong depth and practical exposure" });
    } else if (cov.coverageLevel < 60 || cov.depth < 60) {
      weakCoverage.push({ skillId: cov.skillId, name: sData.name, coverageLevel: cov.coverageLevel, depth: cov.depth, reason: "Inadequate coverage level or depth for industry execution" });
    }
  });

  // Check missing skills required by target roles
  requiredRoleSkills.forEach((req) => {
    if (!coveredIds.has(req.skillId)) {
      const connections = getSkillConnections(req.skillId);
      const unlocksCount = connections.filter(c => c.direction === "child").length;

      if (req.trend >= 10 || req.futureDemand >= 85) {
        futureGaps.push({ skillId: req.skillId, name: req.skillName, futureDemand: req.futureDemand, trend: req.trend, unlocksCount, reason: `High future demand growth skill (+${req.trend}%) missing from curriculum` });
      } else {
        criticalGaps.push({ skillId: req.skillId, name: req.skillName, currentDemand: req.currentDemand, unlocksCount, reason: `Required target role skill completely absent from curriculum` });
      }
    }
  });

  return {
    criticalGaps,
    futureGaps,
    weakCoverage,
    strengths
  };
}

/**
 * Curriculum Intervention Recommendations Engine
 */
export function generateCurriculumInterventions(programId) {
  const gaps = getCurriculumGaps(programId);
  const interventions = [];

  // Critical gaps -> ADD SKILL
  gaps.criticalGaps.forEach((g) => {
    interventions.push({
      type: "ADD SKILL",
      skillId: g.skillId,
      skillName: g.name,
      priority: "HIGH",
      reason: `Add ${g.name} module. ${g.reason}. Unlocks ${g.unlocksCount} downstream capabilities.`,
      expectedImpact: "+12 pts Industry Alignment Score",
      targetCoverage: 80,
      downstreamUnlocks: g.unlocksCount
    });
  });

  // Future gaps -> UPDATE MODULE / ADD SKILL
  gaps.futureGaps.forEach((g) => {
    interventions.push({
      type: "UPDATE MODULE",
      skillId: g.skillId,
      skillName: g.name,
      priority: "HIGH",
      reason: `Integrate ${g.name} into curriculum. ${g.reason}.`,
      expectedImpact: "+15 pts Future Alignment Trajectory",
      targetCoverage: 85,
      downstreamUnlocks: g.unlocksCount
    });
  });

  // Weak coverage -> INCREASE DEPTH / ADD PRACTICAL PROJECT
  gaps.weakCoverage.forEach((g) => {
    interventions.push({
      type: "INCREASE DEPTH",
      skillId: g.skillId,
      skillName: g.name,
      priority: "MEDIUM",
      reason: `Increase practical project depth for ${g.name} (currently ${g.coverageLevel}% coverage).`,
      expectedImpact: "+8 pts Practical Exposure Score",
      targetCoverage: 85,
      downstreamUnlocks: 1
    });
  });

  return interventions.sort((a, b) => (b.priority === "HIGH" ? 1 : -1));
}

/**
 * Calculate Student Projected Impact if completing the program.
 */
export function calculateProjectedStudentImpact(programId, studentCapabilities = null) {
  const capabilities = studentCapabilities || STUDENT_PROFILE.capabilities || {};
  let program = TRAINING_PROGRAMS.find(p => p.id === programId);
  if (!program) program = TRAINING_PROGRAMS[0];

  const covered = program.coveredSkills || [];
  const addressedGaps = [];
  const remainingGaps = [];
  let potentialGainSum = 0;

  covered.forEach(c => {
    const currentCap = clamp(capabilities[c.skillId] || 0);
    const targetCap = c.coverageLevel;
    const sData = SKILLS_DATA.find(s => s.id === c.skillId) || { name: c.skillId };

    if (currentCap < targetCap) {
      const gain = targetCap - currentCap;
      potentialGainSum += gain;
      addressedGaps.push({ skillId: c.skillId, name: sData.name, currentCap, projectedCap: targetCap, gain });
    }
  });

  const projectedReadinessImpact = Math.round(potentialGainSum * 0.15);

  return {
    addressedGaps,
    remainingGaps,
    projectedReadinessImpact: `+${projectedReadinessImpact}% Projected Readiness Boost`
  };
}

/**
 * Full Curriculum Alignment Intelligence Builder
 */
export function buildCurriculumAlignment(programId, studentCapabilities = null) {
  const capabilities = studentCapabilities || STUDENT_PROFILE.capabilities || {};
  let program = TRAINING_PROGRAMS.find((p) => p.id === programId);
  if (!program) program = TRAINING_PROGRAMS[0];

  const alignment = calculateCurriculumAlignment(program.id);
  const gaps = getCurriculumGaps(program.id);
  const interventions = generateCurriculumInterventions(program.id);
  const projectedImpact = calculateProjectedStudentImpact(program.id, capabilities);

  // Relevant Industry Challenges from Task 24
  const coveredSkillIds = new Set(program.coveredSkills.map(s => s.skillId));
  const relevantChallenges = INDUSTRY_CHALLENGES.filter(ch => 
    ch.requiredSkills.some(s => coveredSkillIds.has(s.skillId))
  ).map(ch => {
    const matchedCount = ch.requiredSkills.filter(s => coveredSkillIds.has(s.skillId)).length;
    const readinessPct = Math.round((matchedCount / ch.requiredSkills.length) * 100);
    return {
      challengeId: ch.id,
      title: ch.title,
      organization: ch.organization,
      domain: ch.domain,
      readinessPct,
      evidenceOpportunity: `Completing ${program.name} prepares learners for ${readinessPct}% of this challenge's required capabilities.`
    };
  });

  // Traceable explanation using Task 21
  const traceableExplanation = generateExplanation({
    type: "INDUSTRY_READINESS",
    roleId: program.industryAlignment?.targetRoles?.[0] || "r_backend",
    studentCapabilities: capabilities
  });

  return {
    programId: program.id,
    name: program.name,
    provider: program.provider,
    domain: program.domain,
    level: program.level,
    duration: program.duration,
    deliveryMode: program.deliveryMode,
    description: program.description,
    curriculumVersion: program.curriculumVersion,
    lastUpdated: program.lastUpdated,
    status: program.status,
    coveredSkills: program.coveredSkills,
    projectComponents: program.projectComponents,
    assessmentMethods: program.assessmentMethods,
    industryAlignment: program.industryAlignment,

    alignment,
    gaps,
    interventions,
    projectedImpact,
    relevantChallenges,

    explanation: {
      alignmentWhy: `Curriculum Alignment Score (${alignment.currentAlignment}% Current / ${alignment.futureAlignment}% Future - ${alignment.trajectory}) computed across ${program.coveredSkills.length} covered skills.`,
      systemReasoning: traceableExplanation.conciseWhy
    }
  };
}
