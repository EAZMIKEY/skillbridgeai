import { INDUSTRY_CHALLENGES } from "@/data/industryChallengesData";
import { STUDENT_PROFILE } from "@/data/studentProfile";
import { SKILLS_DATA } from "@/data/skillModel";
import { getSkillConnections } from "@/lib/skillGraphLogic";
import { buildStudentSkillTwin, getCapabilityStatus } from "@/lib/studentSkillTwin";
import { analyzeSkillGaps } from "@/lib/skillGapIntelligence";
import { calculateIndustryReadiness } from "@/lib/industryReadiness";
import { generateLearningPath } from "@/lib/learningPathGenerator";
import { generateSkillInterventions } from "@/lib/skillIntervention";
import { generateSkillMissions } from "@/lib/skillMissions";
import { generateExplanation } from "@/lib/explainability";

function clamp(val, min = 0, max = 100) {
  if (val === undefined || val === null || isNaN(val)) return min;
  return Math.max(min, Math.min(max, Math.round(Number(val))));
}

/**
 * Filter, search, and sort Industry Challenges deterministically.
 */
export function getIndustryChallenges(filters = {}, studentCapabilities = null) {
  const capabilities = studentCapabilities || STUDENT_PROFILE.capabilities || {};
  let list = INDUSTRY_CHALLENGES.map((ch) => {
    const fitData = calculateChallengeFit(ch, capabilities);
    return {
      ...ch,
      fitScore: fitData.fitScore,
      fitLevel: fitData.fitLevel,
      matchedSkillsCount: fitData.matchedSkills.length,
      gapCount: fitData.missingSkills.length + fitData.partialSkills.length,
      blockingCount: fitData.blockingSkills.length,
      fitSummary: fitData
    };
  });

  // Search filter (title, domain, company, sector, description, skills)
  if (filters.search && typeof filters.search === "string" && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter((c) => 
      c.title.toLowerCase().includes(q) ||
      c.organization.toLowerCase().includes(q) ||
      c.domain.toLowerCase().includes(q) ||
      c.sector.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.requiredSkills.some(s => s.skillId.toLowerCase().includes(q))
    );
  }

  // Domain filter
  if (filters.domain && filters.domain !== "ALL") {
    list = list.filter((c) => c.domain.toLowerCase() === filters.domain.toLowerCase());
  }

  // Difficulty filter
  if (filters.difficulty && filters.difficulty !== "ALL") {
    list = list.filter((c) => c.difficulty.toLowerCase() === filters.difficulty.toLowerCase());
  }

  // Required skill filter
  if (filters.skill) {
    list = list.filter((c) => c.requiredSkills.some(s => s.skillId === filters.skill));
  }

  // Fit level filter
  if (filters.fitLevel && filters.fitLevel !== "ALL") {
    list = list.filter((c) => c.fitLevel === filters.fitLevel);
  }

  // Sorting logic
  const sortBy = filters.sortBy || "bestMatch";
  list.sort((a, b) => {
    if (sortBy === "bestMatch") return b.fitScore - a.fitScore;
    if (sortBy === "highestDemand") {
      const aDemand = a.requiredSkills.reduce((sum, s) => sum + s.importance, 0);
      const bDemand = b.requiredSkills.reduce((sum, s) => sum + s.importance, 0);
      return bDemand - aDemand;
    }
    if (sortBy === "lowestEffort") {
      const getHours = (str) => parseInt(str.match(/\d+/)?.[0] || "30", 10);
      return getHours(a.estimatedEffort) - getHours(b.estimatedEffort);
    }
    if (sortBy === "highestImpact") return b.requiredSkills.length - a.requiredSkills.length;
    return 0;
  });

  return list;
}

/**
 * Deterministic Challenge Fit Formula Calculation
 * 
 * Formula (Transparent weighted scoring 0-100):
 * - Capability Coverage (30%): ratio of student cap to required cap across required skills
 * - Required Skill Coverage (25%): percentage of required skills where student cap >= 50
 * - Prerequisite Readiness (20%): check if upstream DAG prerequisites are met
 * - Future Demand Relevance (15%): average future demand score of required skills
 * - Transferability (10%): general background capability score
 * - Critical Gap Penalty (-15% per blocking skill)
 * - Effort Penalty (-5% for high complexity/duration)
 */
export function calculateChallengeFit(challenge, studentCapabilities = null) {
  const capabilities = studentCapabilities || STUDENT_PROFILE.capabilities || {};
  const reqSkills = challenge.requiredSkills || [];

  if (reqSkills.length === 0) {
    return {
      fitScore: 100,
      fitLevel: "READY",
      fitColor: "emerald",
      matchedSkills: [],
      partialSkills: [],
      missingSkills: [],
      blockingSkills: [],
      recommendedPreparation: [],
      estimatedPreparationEffort: "0 hours",
      explanation: "No specific technical requirements defined."
    };
  }

  let totalCapRatio = 0;
  let metCount = 0;
  let prereqScore = 0;
  let totalFutureDemand = 0;

  const matchedSkills = [];
  const partialSkills = [];
  const missingSkills = [];
  const blockingSkills = [];
  const recommendedPrepList = [];

  reqSkills.forEach((req) => {
    const skillData = SKILLS_DATA.find((s) => s.id === req.skillId);
    const skillName = skillData ? skillData.name : req.skillId;
    const currentCap = clamp(capabilities[req.skillId] || 0);
    const requiredCap = req.requiredCapability || 80;

    const capRatio = Math.min(1.0, currentCap / Math.max(1, requiredCap));
    totalCapRatio += capRatio;

    if (currentCap >= requiredCap - 10) {
      metCount++;
      matchedSkills.push({ skillId: req.skillId, name: skillName, currentCap, requiredCap });
    } else if (currentCap >= 30) {
      partialSkills.push({ skillId: req.skillId, name: skillName, currentCap, requiredCap, gap: requiredCap - currentCap });
    } else {
      missingSkills.push({ skillId: req.skillId, name: skillName, currentCap, requiredCap, gap: requiredCap - currentCap });
    }

    // Check upstream DAG prerequisites
    const connections = getSkillConnections(req.skillId);
    const parents = connections.filter((c) => c.direction === "parent");
    const parentMet = parents.every((p) => clamp(capabilities[p.node.id] || 0) >= 40);

    if (parents.length > 0) {
      prereqScore += parentMet ? 1 : 0.5;
    } else {
      prereqScore += 1;
    }

    // Identify blocking skills (missing foundation skill with gap > 40)
    if (currentCap < 30 && req.importance >= 85) {
      blockingSkills.push({ skillId: req.skillId, name: skillName, gap: requiredCap - currentCap });
    }

    const futureDemand = skillData ? skillData.futureDemand || 80 : 80;
    totalFutureDemand += futureDemand;
  });

  const capCoveragePct = (totalCapRatio / reqSkills.length) * 100;
  const skillCoveragePct = (metCount / reqSkills.length) * 100;
  const prereqPct = (prereqScore / reqSkills.length) * 100;
  const avgFutureDemandPct = totalFutureDemand / reqSkills.length;
  const transferabilityPct = 75; // baseline transferable capability score

  // Raw Weighted Score
  let rawScore = (capCoveragePct * 0.30) + 
                 (skillCoveragePct * 0.25) + 
                 (prereqPct * 0.20) + 
                 (avgFutureDemandPct * 0.15) + 
                 (transferabilityPct * 0.10);

  // Penalties
  const gapPenalty = blockingSkills.length * 15;
  const effortPenalty = challenge.difficulty === "Advanced" ? 5 : 0;

  const fitScore = clamp(rawScore - gapPenalty - effortPenalty);

  // Fit Level Categorization
  let fitLevel = "DEVELOPING";
  let fitColor = "amber";

  if (fitScore >= 80) {
    fitLevel = "READY";
    fitColor = "emerald";
  } else if (fitScore >= 65) {
    fitLevel = "NEARLY READY";
    fitColor = "blue";
  } else if (fitScore >= 40) {
    fitLevel = "DEVELOPING";
    fitColor = "amber";
  } else {
    fitLevel = "FOUNDATION REQUIRED";
    fitColor = "red";
  }

  // Recommended Preparation Actions
  [...blockingSkills, ...missingSkills, ...partialSkills].slice(0, 3).forEach((item) => {
    recommendedPrepList.push({
      skillId: item.skillId,
      skillName: item.name,
      action: item.currentCap < 30 ? `Build baseline ${item.name} capability` : `Strengthen ${item.name} (+${item.gap} pts needed)`,
      estimatedHours: item.currentCap < 30 ? "8-12 hours" : "4-6 hours"
    });
  });

  const estimatedPreparationEffort = recommendedPrepList.length > 0 
    ? `${recommendedPrepList.length * 8} hours recommended preparation`
    : "0 hours (Ready to Start)";

  const explanation = `Challenge Fit Score (${fitScore}/100 - ${fitLevel}) derived from ${Math.round(capCoveragePct)}% capability coverage, ${matchedSkills.length}/${reqSkills.length} skills matched, and ${blockingSkills.length} critical gap penalties.`;

  return {
    fitScore,
    fitLevel,
    fitColor,
    matchedSkills,
    partialSkills,
    missingSkills,
    blockingSkills,
    recommendedPreparation: recommendedPrepList,
    estimatedPreparationEffort,
    explanation
  };
}

/**
 * Detailed Intelligence builder for a specific Challenge ID.
 */
export function buildIndustryChallenge(challengeId, studentCapabilities = null) {
  const capabilities = studentCapabilities || STUDENT_PROFILE.capabilities || {};
  let challenge = INDUSTRY_CHALLENGES.find((c) => c.id === challengeId);
  if (!challenge) {
    challenge = INDUSTRY_CHALLENGES[0];
  }

  const fitData = calculateChallengeFit(challenge, capabilities);

  // Map required skills with full DAG graph dependencies and twin metrics
  const mappedRequiredSkills = challenge.requiredSkills.map((req) => {
    const skillData = SKILLS_DATA.find((s) => s.id === req.skillId) || { name: req.skillId, currentDemand: 75, futureDemand: 85 };
    const currentCap = clamp(capabilities[req.skillId] || 0);
    const requiredCap = req.requiredCapability || 80;
    const gap = Math.max(0, requiredCap - currentCap);
    const status = getCapabilityStatus(currentCap);

    const connections = getSkillConnections(req.skillId);
    const prerequisites = connections.filter((c) => c.direction === "parent").map((c) => c.node.name);
    const unlocks = connections.filter((c) => c.direction === "child").map((c) => c.node.name);

    let category = "CORE";
    if (prerequisites.length === 0) category = "FOUNDATION";
    else if (unlocks.length === 0) category = "ADVANCED";

    return {
      skillId: req.skillId,
      skillName: skillData.name,
      category,
      requiredCapability: requiredCap,
      currentCapability: currentCap,
      gap,
      importance: req.importance,
      currentDemand: skillData.currentDemand,
      futureDemand: skillData.futureDemand,
      trend: skillData.futureDemand - skillData.currentDemand,
      prerequisites,
      unlocks,
      status
    };
  });

  const foundationalSkills = mappedRequiredSkills.filter((s) => s.category === "FOUNDATION");
  const coreSkills = mappedRequiredSkills.filter((s) => s.category === "CORE");
  const advancedSkills = mappedRequiredSkills.filter((s) => s.category === "ADVANCED");
  const criticalSkills = mappedRequiredSkills.filter((s) => s.importance >= 85 || s.gap > 30);

  // Preparation Plan Breakdown
  const alreadyReady = mappedRequiredSkills.filter((s) => s.gap === 0);
  const needsStrengthening = mappedRequiredSkills.filter((s) => s.gap > 0 && s.currentCapability >= 30);
  const blockingSkills = mappedRequiredSkills.filter((s) => s.currentCapability < 30 && s.importance >= 85);

  // Traceable explanation using Task 21
  const traceableExplanation = generateExplanation({
    type: "INDUSTRY_READINESS",
    roleId: "r_backend",
    studentCapabilities: capabilities
  });

  return {
    challengeId: challenge.id,
    title: challenge.title,
    organization: challenge.organization,
    sector: challenge.sector,
    domain: challenge.domain,
    description: challenge.description,
    challengeType: challenge.challengeType,
    difficulty: challenge.difficulty,
    estimatedEffort: challenge.estimatedEffort,
    duration: challenge.duration,
    deadline: challenge.deadline,
    industryDemandContext: challenge.industryDemandContext,
    verificationCriteria: challenge.verificationCriteria,
    status: challenge.status,
    expectedOutcomes: challenge.expectedOutcomes,

    fit: fitData,

    capabilityArchitecture: {
      requiredSkills: mappedRequiredSkills,
      foundationalSkills,
      coreSkills,
      advancedSkills,
      criticalSkills
    },

    preparationPlan: {
      alreadyReady,
      needsStrengthening,
      blockingSkills,
      recommendedActions: fitData.recommendedPreparation,
      estimatedPreparationEffort: fitData.estimatedPreparationEffort
    },

    evidenceRequirements: challenge.verificationCriteria.map((c) => ({
      criterion: c,
      demonstratedSkill: mappedRequiredSkills[0]?.skillName || "System Architecture",
      confidenceGain: "+15 pts capability confidence"
    })),

    explanation: {
      whyRecommended: `Your current ${challenge.domain} capability matches ${fitData.fitScore}% of ${challenge.title} requirements. Completing preparation actions will increase readiness to READY level.`,
      systemReasoning: traceableExplanation.conciseWhy
    }
  };
}
