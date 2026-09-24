import { REGIONAL_SKILL_DATA } from "@/data/regionalSkillData";
import { STUDENT_PROFILE } from "@/data/studentProfile";
import { SKILLS_DATA } from "@/data/skillModel";
import { TRAINING_PROGRAMS } from "@/data/trainingPrograms";
import { calculateCurriculumAlignment } from "@/lib/curriculumAlignment";
import { getSkillConnections } from "@/lib/skillGraphLogic";
import { INDUSTRY_CHALLENGES } from "@/data/industryChallengesData";
import { generateExplanation } from "@/lib/explainability";

function clamp(val, min = 0, max = 100) {
  if (val === undefined || val === null || isNaN(val)) return min;
  return Math.max(min, Math.min(max, Math.round(Number(val))));
}

/**
 * Filter, search, and rank Regions deterministically.
 */
export function getRegions(filters = {}) {
  let list = REGIONAL_SKILL_DATA.map((reg) => {
    const alignment = calculateRegionalAlignment(reg.id);
    const futureRisks = getRegionalFutureRisks(reg.id);
    const shortages = getRegionalSkillShortages(reg.id);
    const opportunities = getRegionalOpportunities(reg.id);

    return {
      ...reg,
      alignment,
      futureRisks,
      shortagesCount: shortages.length,
      topShortage: shortages[0] || null,
      topOpportunity: opportunities[0] || null
    };
  });

  // Search filter
  if (filters.search && typeof filters.search === "string" && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter((r) =>
      r.name.toLowerCase().includes(q) ||
      r.country.toLowerCase().includes(q) ||
      r.stateOrProvince.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q)
    );
  }

  // Country / State filter
  if (filters.country && filters.country !== "ALL") {
    list = list.filter((r) => r.country.toLowerCase() === filters.country.toLowerCase());
  }

  // Skill filter
  if (filters.skill) {
    list = list.filter((r) => r.skillDemand.some((s) => s.skillId === filters.skill));
  }

  // Risk Level filter
  if (filters.riskLevel && filters.riskLevel !== "ALL") {
    list = list.filter((r) => r.futureRisks.riskLevel === filters.riskLevel);
  }

  // Sorting
  const sortBy = filters.sortBy || "bestAlignment";
  list.sort((a, b) => {
    if (sortBy === "bestAlignment") return b.alignment.alignmentScore - a.alignment.alignmentScore;
    if (sortBy === "highestRisk") return b.futureRisks.riskScore - a.futureRisks.riskScore;
    if (sortBy === "largestWorkforce") return parseInt(b.workforceSize.replace(/,/g, ""), 10) - parseInt(a.workforceSize.replace(/,/g, ""), 10);
    if (sortBy === "highestShortages") return b.shortagesCount - a.shortagesCount;
    return 0;
  });

  return list;
}

/**
 * Deterministic Regional Skill Gap Formula
 * Skill Gap = Regional Future Demand - Regional Available Capability
 */
export function calculateRegionalSkillGap(regionId, skillId) {
  let region = REGIONAL_SKILL_DATA.find((r) => r.id === regionId);
  if (!region) region = REGIONAL_SKILL_DATA[0];

  const demandEntry = region.skillDemand.find((s) => s.skillId === skillId) || { currentDemand: 70, futureDemand: 75, growthRate: 15, importance: 80 };
  const capEntry = region.workforceCapability.find((c) => c.skillId === skillId) || { availableCapability: 50, workforceCoverage: 40 };

  const rawGap = demandEntry.futureDemand - capEntry.availableCapability;
  const gapScore = clamp(rawGap + 20); // normalized

  let gapLevel = "MODERATE";
  if (rawGap >= 40) gapLevel = "CRITICAL";
  else if (rawGap >= 25) gapLevel = "HIGH";
  else if (rawGap >= 10) gapLevel = "MODERATE";
  else if (rawGap >= -10) gapLevel = "LOW";
  else gapLevel = "SURPLUS";

  const sData = SKILLS_DATA.find((s) => s.id === skillId) || { name: skillId };

  return {
    skillId,
    skillName: sData.name,
    currentDemand: demandEntry.currentDemand,
    futureDemand: demandEntry.futureDemand,
    growthRate: demandEntry.growthRate,
    importance: demandEntry.importance,
    availableCapability: capEntry.availableCapability,
    workforceCoverage: capEntry.workforceCoverage,
    rawGap,
    gapScore,
    gapLevel,
    gapAcceleration: demandEntry.growthRate >= 25 ? "RAPIDLY INCREASING" : "STABLE"
  };
}

/**
 * Regional Skill Shortages Ranking
 */
export function getRegionalSkillShortages(regionId) {
  let region = REGIONAL_SKILL_DATA.find((r) => r.id === regionId);
  if (!region) region = REGIONAL_SKILL_DATA[0];

  const list = region.skillDemand.map((d) => {
    const gapInfo = calculateRegionalSkillGap(region.id, d.skillId);
    const connections = getSkillConnections(d.skillId);
    const unlocksCount = connections.filter((c) => c.direction === "child").length;

    // Shortage Priority Score Formula
    const shortageScore = clamp(
      gapInfo.rawGap * 0.4 +
      d.growthRate * 0.3 +
      d.importance * 0.2 +
      unlocksCount * 5
    );

    return {
      ...gapInfo,
      shortageScore,
      unlocksCount,
      affectedRoles: ["r_backend", "r_ai_engineer", "r_cloud_architect"]
    };
  });

  return list.filter((item) => item.rawGap > 10).sort((a, b) => b.shortageScore - a.shortageScore);
}

/**
 * Regional Opportunities Engine
 */
export function getRegionalOpportunities(regionId) {
  let region = REGIONAL_SKILL_DATA.find((r) => r.id === regionId);
  if (!region) region = REGIONAL_SKILL_DATA[0];

  const opportunities = [];

  region.skillDemand.forEach((d) => {
    const capEntry = region.workforceCapability.find((c) => c.skillId === d.skillId) || { availableCapability: 50 };
    const sData = SKILLS_DATA.find((s) => s.id === d.skillId) || { name: d.skillId };

    // Capability Strength
    if (capEntry.availableCapability >= 80 && d.futureDemand >= 85) {
      opportunities.push({
        type: "CAPABILITY STRENGTH",
        skillId: d.skillId,
        title: `Regional Hub Strength in ${sData.name}`,
        score: capEntry.availableCapability,
        reason: `Region possesses strong capability (${capEntry.availableCapability}%) in high-demand ${sData.name}.`,
        recommendedAction: "Position region as regional competence center and export talent."
      });
    }

    // Emerging Specialization
    if (d.growthRate >= 25 && capEntry.availableCapability >= 60) {
      opportunities.push({
        type: "EMERGING SPECIALIZATION",
        skillId: d.skillId,
        title: `Emerging Specialization: ${sData.name}`,
        score: d.growthRate,
        reason: `Accelerating growth (+${d.growthRate}%) matched with solid regional baseline capability (${capEntry.availableCapability}%).`,
        recommendedAction: "Expand specialized incubation labs and industry challenges."
      });
    }

    // Training Opportunity
    if (d.futureDemand >= 85 && capEntry.availableCapability < 55) {
      opportunities.push({
        type: "TRAINING OPPORTUNITY",
        skillId: d.skillId,
        title: `High Training Demand for ${sData.name}`,
        score: d.futureDemand - capEntry.availableCapability,
        reason: `High future demand (${d.futureDemand}%) vs limited regional workforce capability (${capEntry.availableCapability}%).`,
        recommendedAction: "Establish local training bootcamps and curriculum expansion."
      });
    }
  });

  return opportunities.sort((a, b) => b.score - a.score);
}

/**
 * Regional Alignment Score Calculation (0-100)
 * 
 * Formula:
 * Regional Alignment =
 *     (Demand Coverage * 0.30)
 *   + (Future Demand Coverage * 0.20)
 *   + (Workforce Capability * 0.20)
 *   + (Training Supply Coverage * 0.15)
 *   + (Curriculum Alignment * 0.10)
 *   + (Mobility Potential * 0.05)
 */
export function calculateRegionalAlignment(regionId) {
  let region = REGIONAL_SKILL_DATA.find((r) => r.id === regionId);
  if (!region) region = REGIONAL_SKILL_DATA[0];

  let totalDemand = 0;
  let totalFutureDemand = 0;
  let totalCap = 0;

  region.skillDemand.forEach((d) => {
    totalDemand += d.currentDemand;
    totalFutureDemand += d.futureDemand;
  });

  region.workforceCapability.forEach((c) => {
    totalCap += c.availableCapability;
  });

  const countDemand = region.skillDemand.length || 1;
  const countCap = region.workforceCapability.length || 1;

  const demandCoverage = Math.round(totalDemand / countDemand);
  const futureCoverage = Math.round(totalFutureDemand / countDemand);
  const workforceCapability = Math.round(totalCap / countCap);
  const trainingCoverage = Math.min(100, (region.trainingSupply?.length || 1) * 35);
  const curriculumAlignment = 78; // baseline training alignment
  const mobilityPotential = 70;

  const rawAlignment = (demandCoverage * 0.30) +
                       (futureCoverage * 0.20) +
                       (workforceCapability * 0.20) +
                       (trainingCoverage * 0.15) +
                       (curriculumAlignment * 0.10) +
                       (mobilityPotential * 0.05);

  const alignmentScore = clamp(rawAlignment);

  let trajectory = "STABLE";
  if (futureCoverage >= demandCoverage + 3) trajectory = "IMPROVING";
  else if (workforceCapability < demandCoverage - 15) trajectory = "FUTURE RISK";

  return {
    alignmentScore,
    demandCoverage,
    futureCoverage,
    workforceCapability,
    trainingCoverage,
    curriculumAlignment,
    mobilityPotential,
    trajectory
  };
}

/**
 * Regional Future Risk Engine
 */
export function getRegionalFutureRisks(regionId) {
  let region = REGIONAL_SKILL_DATA.find((r) => r.id === regionId);
  if (!region) region = REGIONAL_SKILL_DATA[0];

  const shortages = getRegionalSkillShortages(region.id);
  const highRiskSkills = shortages.filter((s) => s.gapLevel === "CRITICAL" || s.growthRate >= 25);

  let riskScore = clamp(highRiskSkills.length * 25 + (100 - calculateRegionalAlignment(region.id).workforceCapability) * 0.4);
  let riskLevel = "MODERATE";

  if (riskScore >= 75) riskLevel = "CRITICAL";
  else if (riskScore >= 55) riskLevel = "HIGH";
  else if (riskScore >= 35) riskLevel = "MODERATE";
  else riskLevel = "LOW";

  return {
    regionId: region.id,
    riskScore,
    riskLevel,
    emergingSkills: highRiskSkills.map((s) => s.skillName),
    primaryConstraint: highRiskSkills[0]?.skillName || "Cloud Engineering",
    explanation: `Future demand for ${highRiskSkills[0]?.skillName || 'high-tech capabilities'} is accelerating (+${highRiskSkills[0]?.growthRate || 25}%) while regional workforce capability (${highRiskSkills[0]?.availableCapability || 45}%) remains constrained.`
  };
}

/**
 * Deterministic Regional Interventions Engine
 */
export function generateRegionalInterventions(regionId) {
  let region = REGIONAL_SKILL_DATA.find((r) => r.id === regionId);
  if (!region) region = REGIONAL_SKILL_DATA[0];

  const shortages = getRegionalSkillShortages(region.id);
  const interventions = [];

  shortages.forEach((s) => {
    if (s.gapLevel === "CRITICAL") {
      interventions.push({
        type: "EXPAND TRAINING CAPACITY",
        priority: "HIGH",
        skillId: s.skillId,
        skillName: s.skillName,
        reason: `Critical regional shortage in ${s.skillName} (demand ${s.futureDemand}% vs capability ${s.availableCapability}%).`,
        expectedImpact: "+15 pts Regional Capability Coverage",
        estimatedUrgency: "Immediate (0-6 Months)"
      });
    } else if (s.growthRate >= 25) {
      interventions.push({
        type: "UPDATE CURRICULUM",
        priority: "HIGH",
        skillId: s.skillId,
        skillName: s.skillName,
        reason: `Accelerating growth rate (+${s.growthRate}%) requires modernizing regional institute modules.`,
        expectedImpact: "+20 pts Future Alignment Trajectory",
        estimatedUrgency: "Medium Term (6-12 Months)"
      });
    } else {
      interventions.push({
        type: "UPSKILL EXISTING WORKFORCE",
        priority: "MEDIUM",
        skillId: s.skillId,
        skillName: s.skillName,
        reason: `Mid-level capability gap in ${s.skillName}. Deploy practical industry challenges.`,
        expectedImpact: "+10 pts Workforce Proficiency",
        estimatedUrgency: "12+ Months"
      });
    }
  });

  return interventions.sort((a, b) => (b.priority === "HIGH" ? 1 : -1));
}

/**
 * Cross-Region Comparison Intelligence
 */
export function compareRegions(regionIds = []) {
  const targetIds = regionIds.length > 0 ? regionIds : ["reg_bengaluru", "reg_silicon_valley"];
  return targetIds.map((id) => {
    const profile = buildRegionalSkillProfile(id);
    return {
      regionId: profile.regionId,
      name: profile.name,
      country: profile.country,
      alignmentScore: profile.alignment.alignmentScore,
      workforceCapability: profile.alignment.workforceCapability,
      topShortage: profile.shortages[0]?.skillName || "None",
      riskLevel: profile.futureRisks.riskLevel,
      topOpportunity: profile.opportunities[0]?.title || "None"
    };
  });
}

/**
 * Skill-Centric Regional Landscape Engine
 * Ranking regions by a specific skill
 */
export function getSkillRegionalLandscape(skillId) {
  const sData = SKILLS_DATA.find((s) => s.id === skillId) || { name: skillId };
  
  const regionalBreakdown = REGIONAL_SKILL_DATA.map((reg) => {
    const gapInfo = calculateRegionalSkillGap(reg.id, skillId);
    return {
      regionId: reg.id,
      regionName: reg.name,
      country: reg.country,
      currentDemand: gapInfo.currentDemand,
      futureDemand: gapInfo.futureDemand,
      availableCapability: gapInfo.availableCapability,
      gapLevel: gapInfo.gapLevel,
      rawGap: gapInfo.rawGap
    };
  });

  regionalBreakdown.sort((a, b) => b.futureDemand - a.futureDemand);

  return {
    skillId,
    skillName: sData.name,
    regions: regionalBreakdown,
    strongestRegion: [...regionalBreakdown].sort((a, b) => b.availableCapability - a.availableCapability)[0],
    biggestShortageRegion: [...regionalBreakdown].sort((a, b) => b.rawGap - a.rawGap)[0]
  };
}

/**
 * Full Regional Skill Profile Builder
 */
export function buildRegionalSkillProfile(regionId) {
  let region = REGIONAL_SKILL_DATA.find((r) => r.id === regionId);
  if (!region) region = REGIONAL_SKILL_DATA[0];

  const alignment = calculateRegionalAlignment(region.id);
  const shortages = getRegionalSkillShortages(region.id);
  const opportunities = getRegionalOpportunities(region.id);
  const futureRisks = getRegionalFutureRisks(region.id);
  const interventions = generateRegionalInterventions(region.id);

  // Map local training supply from Task 25
  const mappedTrainingSupply = (region.trainingSupply || []).map((t) => {
    const prog = TRAINING_PROGRAMS.find((p) => p.id === t.programId) || { name: t.programId, provider: "Regional Provider" };
    const progAlignment = calculateCurriculumAlignment(t.programId);
    return {
      programId: t.programId,
      programName: prog.name,
      provider: prog.provider,
      capacity: t.capacity,
      relevantSkills: t.relevantSkills,
      alignmentScore: progAlignment.currentAlignment,
      futureAlignment: progAlignment.futureAlignment
    };
  });

  // Map relevant Industry Challenges from Task 24
  const regionalSkillIds = new Set(region.skillDemand.map((s) => s.skillId));
  const relevantChallenges = INDUSTRY_CHALLENGES.filter((ch) =>
    ch.requiredSkills.some((s) => regionalSkillIds.has(s.skillId))
  ).map((ch) => ({
    challengeId: ch.id,
    title: ch.title,
    organization: ch.organization,
    domain: ch.domain,
    difficulty: ch.difficulty
  }));

  // Traceable explanation using Task 21
  const traceableExplanation = generateExplanation({
    type: "INDUSTRY_READINESS",
    roleId: "r_backend",
    studentCapabilities: STUDENT_PROFILE.capabilities
  });

  return {
    regionId: region.id,
    name: region.name,
    country: region.country,
    stateOrProvince: region.stateOrProvince,
    workforceSize: region.workforceSize,
    description: region.description,
    skillDemand: region.skillDemand,
    workforceCapability: region.workforceCapability,

    alignment,
    shortages,
    opportunities,
    futureRisks,
    interventions,
    trainingSupply: mappedTrainingSupply,
    relevantChallenges,

    explanation: {
      regionalWhy: `Regional Alignment Score (${alignment.alignmentScore}/100 - ${alignment.trajectory}) derived from workforce capability (${alignment.workforceCapability}%) vs future demand (${alignment.futureCoverage}%).`,
      systemReasoning: traceableExplanation.conciseWhy
    }
  };
}
