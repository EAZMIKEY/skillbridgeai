import { MAHARASHTRA_REGIONAL_DATA } from "@/data/maharashtraWorkforceData";
import { SKILLS_DATA } from "@/data/skillModel";
import { ROLES_DATA } from "@/data/skillGraph";
import { TRAINING_PROGRAMS } from "@/data/trainingPrograms";
import { calculateCurriculumAlignment } from "@/lib/curriculumAlignment";
import { getSkillConnections, getRoleSkills } from "@/lib/skillGraphLogic";
import { INDUSTRY_CHALLENGES } from "@/data/industryChallengesData";
import { generateExplanation } from "@/lib/explainability";
import { STUDENT_PROFILE } from "@/data/studentProfile";

// Safety helpers to avoid runtime errors during prerender when data may be undefined
const safeFind = (arr, cb) => (Array.isArray(arr) ? arr.find(cb) : undefined);
const safeFilter = (arr, cb) => (Array.isArray(arr) ? arr.filter(cb) : []);
const safeMap = (arr, cb) => (Array.isArray(arr) ? arr.map(cb) : []);

function clamp(val, min = 0, max = 100) {
  if (val === undefined || val === null || isNaN(val)) return min;
  return Math.max(min, Math.min(max, Math.round(Number(val))));
}

/**
 * State-level Workforce Pulse Metrics
 */
export function buildMaharashtraWorkforceOverview() {
  let totalCap = 0;
  let totalDemand = 0;
  let totalFutureDemand = 0;
  let totalAlign = 0;
  let count = MAHARASHTRA_REGIONAL_DATA.length || 1;

  MAHARASHTRA_REGIONAL_DATA.forEach((reg) => {
    let regCap = 0;
    let regDemand = 0;
    let regFut = 0;

    reg.workforceCapability.forEach((c) => (regCap += c.availableCapability));
    reg.skillDemand.forEach((d) => {
      regDemand += d.currentDemand;
      regFut += d.futureDemand;
    });

    const cLen = reg.workforceCapability.length || 1;
    const dLen = reg.skillDemand.length || 1;

    totalCap += regCap / cLen;
    totalDemand += regDemand / dLen;
    totalFutureDemand += regFut / dLen;
    totalAlign += Math.round((regCap / cLen) * 0.4 + (regDemand / dLen) * 0.6);
  });

  const workforceCapabilityIndex = clamp(totalCap / count);
  const currentDemandIndex = clamp(totalDemand / count);
  const futureDemandIndex = clamp(totalFutureDemand / count);
  const workforceAlignmentIndex = clamp(totalAlign / count);
  const trainingAlignmentIndex = 64; // baseline state training alignment

  const shortages = getMaharashtraSkillShortages("mah_pune");
  const criticalShortagesCount = 7;
  const emergingRisksCount = 4;

  return {
    regionsAnalyzed: count,
    workforceAlignmentIndex,
    workforceCapabilityIndex,
    currentDemandIndex,
    futureDemandIndex,
    trainingAlignmentIndex,
    criticalShortagesCount,
    emergingRisksCount,
    topOpportunityRegion: "Pune Tech & Automotive Cluster"
  };
}

/**
 * Get all Maharashtra regions with filtering and sorting
 */
export function getMaharashtraRegions(filters = {}) {
  let list = MAHARASHTRA_REGIONAL_DATA.map((reg) => {
    const shortages = getMaharashtraSkillShortages(reg.id);
    const futureRisks = getMaharashtraFutureRisksForRegion(reg.id);
    const alignmentScore = calculateMaharashtraRegionAlignment(reg.id);

    return {
      ...reg,
      alignmentScore,
      shortagesCount: shortages.length,
      topShortage: shortages[0] || null,
      futureRisks
    };
  });

  // Search filter
  if (filters.search && typeof filters.search === "string" && filters.search.trim()) {
    const q = filters.search.toLowerCase().trim();
    list = list.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.district.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q)
    );
  }

  // Skill filter
  if (filters.skill) {
    list = list.filter((r) => r.skillDemand.some((s) => s.skillId === filters.skill));
  }

  // Sorting
  const sortBy = filters.sortBy || "bestAlignment";
  list.sort((a, b) => {
    if (sortBy === "bestAlignment") return (b.alignmentScore || 0) - (a.alignmentScore || 0);
    if (sortBy === "highestRisk") return (b.futureRisks?.riskScore || 0) - (a.futureRisks?.riskScore || 0);
    if (sortBy === "largestWorkforce")
      return parseInt(b.workforceSize?.replace(/,/g, "") || "0", 10) - parseInt(a.workforceSize?.replace(/,/g, "") || "0", 10);
    return 0;
  });

  return list;
}

/**
 * Calculate Region Alignment Score for Maharashtra
 */
function calculateMaharashtraRegionAlignment(regionId) {
  let region = safeFind(MAHARASHTRA_REGIONAL_DATA, (r) => r.id === regionId);
  if (!region) region = (Array.isArray(MAHARASHTRA_REGIONAL_DATA) && MAHARASHTRA_REGIONAL_DATA[0]) || { id: regionId, skillDemand: [], workforceCapability: [], trainingSupply: [] };

  let totalDemand = 0;
  let totalCap = 0;

  region.skillDemand.forEach((d) => (totalDemand += d.currentDemand));
  region.workforceCapability.forEach((c) => (totalCap += c.availableCapability));

  const dLen = region.skillDemand.length || 1;
  const cLen = region.workforceCapability.length || 1;

  const avgDemand = totalDemand / dLen;
  const avgCap = totalCap / cLen;

  return clamp(avgCap * 0.5 + (100 - Math.abs(avgDemand - avgCap)) * 0.5);
}

/**
 * Single Region Future Risk Calculator
 */
function getMaharashtraFutureRisksForRegion(regionId) {
  let region = safeFind(MAHARASHTRA_REGIONAL_DATA, (r) => r.id === regionId);
  if (!region) region = (Array.isArray(MAHARASHTRA_REGIONAL_DATA) && MAHARASHTRA_REGIONAL_DATA[0]) || { id: regionId, skillDemand: [], workforceCapability: [] };

  const shortages = getMaharashtraSkillShortages(region.id);
  const critical = shortages.filter((s) => s.gapLevel === "CRITICAL" || s.growthRate >= 25);

  const riskScore = clamp(critical.length * 30 + 20);
  let riskLevel = "MODERATE";
  if (riskScore >= 75) riskLevel = "CRITICAL";
  else if (riskScore >= 50) riskLevel = "HIGH";
  else if (riskScore >= 30) riskLevel = "MODERATE";
  else riskLevel = "LOW";

  return {
    regionId: region.id,
    riskScore,
    riskLevel,
    primaryConstraint: critical[0]?.skillName || "Cloud Infrastructure",
    explanation: `Accelerating future demand for ${critical[0]?.skillName || 'high-tech skills'} (+${critical[0]?.growthRate || 28}%) outpaces local regional capability (${critical[0]?.availableCapability || 45}%).`
  };
}

/**
 * Calculate Skill Gap per Region
 */
export function calculateMaharashtraSkillGap(regionId, skillId) {
  let region = safeFind(MAHARASHTRA_REGIONAL_DATA, (r) => r.id === regionId);
  if (!region) region = (Array.isArray(MAHARASHTRA_REGIONAL_DATA) && MAHARASHTRA_REGIONAL_DATA[0]) || { id: regionId, skillDemand: [], workforceCapability: [] };

  const skillDemand = region?.skillDemand || [];
  const workforceCapability = region?.workforceCapability || [];

  const demandEntry = (Array.isArray(skillDemand) ? skillDemand.find((s) => s.skillId === skillId) : undefined) || { currentDemand: 70, futureDemand: 75, growthRate: 15, importance: 80 };
  const capEntry = (Array.isArray(workforceCapability) ? workforceCapability.find((c) => c.skillId === skillId) : undefined) || { availableCapability: 50, workforceCoverage: 40 };

  const rawGap = demandEntry.futureDemand - capEntry.availableCapability;
  const gapScore = clamp(rawGap + 20);

  let gapLevel = "MODERATE";
  if (rawGap >= 40) gapLevel = "CRITICAL";
  else if (rawGap >= 25) gapLevel = "HIGH";
  else if (rawGap >= 10) gapLevel = "MODERATE";
  else gapLevel = "LOW";

  const sData = (Array.isArray(SKILLS_DATA) ? SKILLS_DATA.find((s) => s.id === skillId) : undefined) || { name: skillId };

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
    gapLevel
  };
}

/**
 * Ranked Skill Shortages
 */
export function getMaharashtraSkillShortages(regionId) {
  let region = safeFind(MAHARASHTRA_REGIONAL_DATA, (r) => r.id === regionId);
  if (!region) region = (Array.isArray(MAHARASHTRA_REGIONAL_DATA) && MAHARASHTRA_REGIONAL_DATA[0]) || { id: regionId, skillDemand: [] };

  return region.skillDemand
    .map((d) => {
      const gap = calculateMaharashtraSkillGap(region.id, d.skillId);
      const connections = Array.isArray(getSkillConnections) ? getSkillConnections(d.skillId) : getSkillConnections(d.skillId);
      const unlocksCount = (Array.isArray(connections) ? connections.filter((c) => c.direction === "child").length : 0);

      const shortageScore = clamp(gap.rawGap * 0.45 + d.growthRate * 0.35 + unlocksCount * 5);

      return {
        ...gap,
        shortageScore,
        unlocksCount,
        affectedRoles: ["Cloud Engineer", "Cybersecurity Analyst", "AI Systems Engineer"]
      };
    })
    .sort((a, b) => b.shortageScore - a.shortageScore);
}

/**
 * Emerging Skills Maharashtra Should Watch
 */
export function getEmergingMaharashtraSkills() {
  const map = new Map();

  (Array.isArray(MAHARASHTRA_REGIONAL_DATA) ? MAHARASHTRA_REGIONAL_DATA : []).forEach((reg) => {
    (reg.skillDemand || []).forEach((d) => {
      const sData = SKILLS_DATA.find((s) => s.id === d.skillId) || { name: d.skillId || "Unknown Skill" };
      const capEntry = (reg.workforceCapability || []).find((c) => c.skillId === d.skillId) || { availableCapability: 50 };

      if (!map.has(d.skillId)) {
        map.set(d.skillId, {
          skillId: d.skillId,
          skillName: sData.name,
          totalFutureDemand: 0,
          totalGrowth: 0,
          totalCap: 0,
          count: 0
        });
      }

      const item = map.get(d.skillId);
      item.totalFutureDemand += d.futureDemand;
      item.totalGrowth += d.growthRate;
      item.totalCap += capEntry.availableCapability;
      item.count += 1;
    });
  });

  const list = [];
  map.forEach((val) => {
    const avgFutureDemand = Math.round(val.totalFutureDemand / val.count);
    const avgGrowth = Math.round(val.totalGrowth / val.count);
    const avgCap = Math.round(val.totalCap / val.count);
    const mismatchScore = clamp(avgFutureDemand - avgCap + avgGrowth);

    list.push({
      skillId: val.skillId,
      skillName: val.skillName,
      avgFutureDemand,
      avgGrowth,
      avgCap,
      mismatchScore,
      riskLevel: mismatchScore >= 60 ? "HIGH RISK" : "MODERATE RISK"
    });
  });

  return list.sort((a, b) => b.mismatchScore - a.mismatchScore);
}

/**
 * Role-Level Maharashtra Intelligence (Task 23 Integration)
 */
export function getRoleLevelMaharashtraIntelligence(roleId = "r_backend") {
  const role = (Array.isArray(ROLES_DATA) ? ROLES_DATA.find((r) => r.id === roleId) : undefined) || (Array.isArray(ROLES_DATA) ? ROLES_DATA[0] : { id: roleId, name: roleId });
  const roleSkillEntries = getRoleSkills(role.id);

  let currentCapSum = 0;
  let currentDemandSum = 0;
  let futureDemandSum = 0;
  let count = 0;

  roleSkillEntries.forEach((entry) => {
    const sId = entry.node?.id;
    if (!sId) return;
    (Array.isArray(MAHARASHTRA_REGIONAL_DATA) ? MAHARASHTRA_REGIONAL_DATA : []).forEach((reg) => {
      const cap = (reg.workforceCapability || []).find((c) => c.skillId === sId);
      const dem = (reg.skillDemand || []).find((d) => d.skillId === sId);
      if (cap && dem) {
        currentCapSum += cap.availableCapability;
        currentDemandSum += dem.currentDemand;
        futureDemandSum += dem.futureDemand;
        count += 1;
      }
    });
  });

  const cLen = count || 1;
  const currentCapability = clamp(currentCapSum / cLen);
  const currentDemand = clamp(currentDemandSum / cLen);
  const futureDemand = clamp(futureDemandSum / cLen);
  const capabilityGap = clamp(futureDemand - currentCapability);
  const trainingAlignment = 62;

  return {
    roleId: role.id,
    roleTitle: role.name || role.title,
    currentCapability,
    currentDemand,
    futureDemand,
    capabilityGap,
    futureRisk: capabilityGap >= 25 ? "HIGH" : "MODERATE",
    trainingAlignment,
    keySkills: roleSkillEntries.map((e) => (e.node?.name || e.node?.id || "").toUpperCase())
  };
}

/**
 * Training Supply vs Industry Demand Mismatch Matrix (Task 25 Integration)
 */
export function getMaharashtraTrainingMismatch() {
  const skills = Array.isArray(SKILLS_DATA) ? SKILLS_DATA.slice(0, 5) : [];
  return skills.map((s) => {
    let demSum = 0;
    let capSum = 0;
    let regCount = 0;

    (Array.isArray(MAHARASHTRA_REGIONAL_DATA) ? MAHARASHTRA_REGIONAL_DATA : []).forEach((reg) => {
      const d = reg.skillDemand.find((sd) => sd.skillId === s.id);
      const c = reg.workforceCapability.find((wc) => wc.skillId === s.id);
      if (d && c) {
        demSum += d.futureDemand;
        capSum += c.availableCapability;
        regCount += 1;
      }
    });

    const avgDemand = Math.round((demSum / (regCount || 1)) || 75);
    const avgCap = Math.round((capSum / (regCount || 1)) || 50);

    let demandLevel = "HIGH";
    if (avgDemand < 65) demandLevel = "MEDIUM";

    let trainingCoverage = "MEDIUM";
    if (avgCap < 45) trainingCoverage = "LOW";
    else if (avgCap > 70) trainingCoverage = "HIGH";

    let gapLevel = "MODERATE";
    if (avgDemand >= 85 && avgCap < 50) gapLevel = "CRITICAL";
    else if (avgDemand >= 75 && avgCap < 60) gapLevel = "HIGH";

    return {
      skillId: s.id,
      skillName: s.name,
      industryDemand: demandLevel,
      trainingCoverage,
      gapLevel
    };
  });
}

/**
 * Ranked High-Leverage Maharashtra Interventions
 */
export function generateMaharashtraInterventions(regionId = null) {
  const regions = regionId
    ? [safeFind(MAHARASHTRA_REGIONAL_DATA, (r) => r.id === regionId) || (Array.isArray(MAHARASHTRA_REGIONAL_DATA) ? MAHARASHTRA_REGIONAL_DATA[0] : null)].filter(Boolean)
    : (Array.isArray(MAHARASHTRA_REGIONAL_DATA) ? MAHARASHTRA_REGIONAL_DATA : []);

  const interventions = [];

  regions.forEach((reg) => {
    const shortages = getMaharashtraSkillShortages(reg.id);
    shortages.forEach((s) => {
      if (s.gapLevel === "CRITICAL") {
        interventions.push({
          regionId: reg.id,
          regionName: reg.name,
          skillId: s.skillId,
          skillName: s.skillName,
          interventionType: "EXPAND TRAINING CAPACITY",
          priorityScore: 95,
          urgency: "CRITICAL",
          demandPressure: s.futureDemand,
          capabilityGap: s.rawGap,
          trainingGap: 45,
          affectedRoles: s.affectedRoles,
          expectedImpact: "+20 pts Regional Capability Coverage",
          reason: `Critical shortfall in ${s.skillName} across ${reg.name} (demand ${s.futureDemand}% vs capability ${s.availableCapability}%).`
        });
      } else if (s.growthRate >= 25) {
        interventions.push({
          regionId: reg.id,
          regionName: reg.name,
          skillId: s.skillId,
          skillName: s.skillName,
          interventionType: "UPDATE CURRICULUM",
          priorityScore: 85,
          urgency: "HIGH",
          demandPressure: s.futureDemand,
          capabilityGap: s.rawGap,
          trainingGap: 30,
          affectedRoles: s.affectedRoles,
          expectedImpact: "+15 pts Future Alignment Trajectory",
          reason: `Accelerating growth (+${s.growthRate}%) in ${s.skillName} requires updating local institute modules.`
        });
      }
    });
  });

  return interventions.sort((a, b) => b.priorityScore - a.priorityScore);
}

/**
 * Top Executive Action Items (What Maharashtra Should Act On)
 */
export function getMaharashtraExecutiveDecisionView() {
  const ranked = generateMaharashtraInterventions();
  return ranked.slice(0, 4).map((item, idx) => ({
    rank: `0${idx + 1}`,
    title: `${item.interventionType}: ${item.skillName}`,
    regionName: item.regionName,
    priority: item.urgency,
    expectedImpact: item.expectedImpact,
    reason: item.reason
  }));
}

/**
 * Cross-Region Maharashtra Comparison
 */
export function compareMaharashtraRegions(regionIds = []) {
  const targetIds = regionIds.length > 0 ? regionIds : ["mah_pune", "mah_mumbai", "mah_nagpur"];
  return targetIds.map((id) => {
    const profile = buildMaharashtraRegionProfile(id);
    return {
      regionId: profile.regionId,
      name: profile.name,
      district: profile.district,
      alignmentScore: profile.alignmentScore,
      capabilityIndex: profile.capabilityIndex,
      futureDemand: profile.futureDemand,
      topShortage: profile.shortages[0]?.skillName || "None",
      futureRisk: profile.futureRisks.riskLevel
    };
  });
}

/**
 * Full Maharashtra Region Profile Builder
 */
export function buildMaharashtraRegionProfile(regionId) {
  let region = safeFind(MAHARASHTRA_REGIONAL_DATA, (r) => r.id === regionId);
  if (!region) region = (Array.isArray(MAHARASHTRA_REGIONAL_DATA) && MAHARASHTRA_REGIONAL_DATA[0]) || { id: regionId, skillDemand: [], workforceCapability: [], trainingSupply: [] };

  const shortages = getMaharashtraSkillShortages(region.id);
  const futureRisks = getMaharashtraFutureRisksForRegion(region.id);
  const alignmentScore = calculateMaharashtraRegionAlignment(region.id);
  const interventions = generateMaharashtraInterventions(region.id);

  let capSum = 0;
  let demSum = 0;
  let futSum = 0;

  region.workforceCapability.forEach((c) => (capSum += c.availableCapability));
  region.skillDemand.forEach((d) => {
    demSum += d.currentDemand;
    futSum += d.futureDemand;
  });

  const cLen = region.workforceCapability.length || 1;
  const dLen = region.skillDemand.length || 1;

  const capabilityIndex = Math.round(capSum / cLen);
  const currentDemand = Math.round(demSum / dLen);
  const futureDemand = Math.round(futSum / dLen);

  // Map local training supply from Task 25
  const mappedTrainingSupply = (region.trainingSupply || []).map((t) => {
    const prog = TRAINING_PROGRAMS.find((p) => p.id === t.programId) || { name: t.programId, provider: "Maharashtra Provider" };
    const progAlignment = calculateCurriculumAlignment(t.programId);
    return {
      programId: t.programId,
      programName: prog.name,
      provider: prog.provider,
      capacity: t.capacity,
      relevantSkills: t.relevantSkills,
      alignmentScore: progAlignment.currentAlignment
    };
  });

  // Map relevant Industry Challenges from Task 24
  const regionalSkillIds = new Set((region.skillDemand || []).map((s) => s.skillId));
  const relevantChallenges = (INDUSTRY_CHALLENGES || []).filter((ch) =>
    (ch.requiredSkills || []).some((s) => regionalSkillIds.has(s.skillId))
  ).map((ch) => ({
    challengeId: ch.id,
    title: ch.title,
    organization: ch.organization,
    domain: ch.domain
  }));

  // Explainability using Task 21
  const traceableExplanation = generateExplanation({
    type: "INDUSTRY_READINESS",
    roleId: "r_backend",
    studentCapabilities: STUDENT_PROFILE.capabilities
  });

  return {
    regionId: region.id,
    name: region.name,
    type: region.type,
    district: region.district,
    workforceSize: region.workforceSize,
    description: region.description,

    capabilityIndex,
    currentDemand,
    futureDemand,
    alignmentScore,

    shortages,
    futureRisks,
    interventions,
    trainingSupply: mappedTrainingSupply,
    relevantChallenges,

    explanation: {
      regionalWhy: futureRisks.explanation,
      systemReasoning: traceableExplanation.conciseWhy
    }
  };
}
