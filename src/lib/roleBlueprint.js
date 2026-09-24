import { STUDENT_PROFILE } from "@/data/studentProfile";
import { SKILLS_DATA } from "@/data/skillModel";
import { ROLES_DATA } from "@/data/skillGraph";
import { getRoleSkills, getSkillConnections } from "@/lib/skillGraphLogic";
import { calculateTransferability } from "@/lib/skillTransferability";
import { generateLearningPath } from "@/lib/learningPathGenerator";
import { getAdjacentRoles } from "@/lib/roleAdjacency";
import { getCapabilityStatus } from "@/lib/studentSkillTwin";
import { calculateIndustryReadiness } from "@/lib/industryReadiness";
import { analyzeSkillGaps } from "@/lib/skillGapIntelligence";
import { generateSkillInterventions } from "@/lib/skillIntervention";
import { generateSkillMissions } from "@/lib/skillMissions";
import { generateExplanation } from "@/lib/explainability";

function clamp(val, min = 0, max = 100) {
  if (val === undefined || val === null || isNaN(val)) return min;
  return Math.max(min, Math.min(max, Math.round(Number(val))));
}

/**
 * Pure deterministic Function to build an Industry Role Blueprint.
 * Accepts roleId and optional studentCapabilities.
 */
export function buildRoleBlueprint(roleId, studentCapabilities = null) {
  const capabilities = studentCapabilities || STUDENT_PROFILE.capabilities || {};
  
  // 1. Resolve Target Role safely with fallback
  let role = ROLES_DATA.find((r) => r.id === roleId);
  if (!role) {
    role = ROLES_DATA[0];
  }

  // 2. Fetch role skills from Skill Graph
  const roleSkillEntries = getRoleSkills(role.id);
  const requiredSkillNodes = roleSkillEntries.map((e) => e.node).filter(Boolean);

  // Re-use Task 10 logic / skillModel attributes for demand metrics
  const detailedRoleSkills = requiredSkillNodes.map((skill) => {
    const fullSkill = SKILLS_DATA.find((s) => s.id === skill.id) || skill;
    const currentCap = clamp(capabilities[skill.id] || 0);
    const reqCap = 100;
    const gap = Math.max(0, reqCap - currentCap);
    const currentDemand = fullSkill.currentDemand || 70;
    const futureDemand = fullSkill.futureDemand || 80;
    const trend = futureDemand - currentDemand;

    const connections = getSkillConnections(skill.id);
    
    // Upstream prerequisites required by this skill
    const prerequisites = connections
      .filter((c) => c.direction === "parent")
      .map((c) => ({ skillId: c.node.id, skillName: c.node.name, explanation: c.explanation }));

    // Downstream skills unlocked by this skill
    const unlocks = connections
      .filter((c) => c.direction === "child")
      .map((c) => ({ skillId: c.node.id, skillName: c.node.name, explanation: c.explanation }));

    // Count in-degree (parents) & out-degree (children) within the role's required skill set
    const parentCount = prerequisites.length;
    const unlockCount = unlocks.length;

    // Categorization logic:
    // FOUNDATION: Has 0 prerequisites OR unlocks multiple skills (out-degree >= 1) near graph base
    // ADVANCED: Has prerequisites (in-degree > 0) AND (unlocks 0 OR gap/complexity high)
    // CORE: Standard central skill directly required for role performance
    let category = "CORE";
    if (parentCount === 0 || (unlockCount > 0 && parentCount <= unlockCount)) {
      category = "FOUNDATION";
    } else if (parentCount > 0 && unlockCount === 0) {
      category = "ADVANCED";
    }

    // Role importance calculation (deterministic)
    const importance = clamp(50 + (unlockCount * 15) + (currentDemand * 0.3));

    // Capability status label
    const studentStatus = getCapabilityStatus(currentCap);

    const reason = `Required for ${role.name}. ${category} capability (Demand: ${currentDemand}%, Future: ${futureDemand}%). ${unlockCount > 0 ? `Unlocks ${unlockCount} downstream skills.` : ''}`;

    return {
      skillId: skill.id,
      skillName: skill.name,
      sector: fullSkill.sector || "Technology",
      category,
      requiredCapability: reqCap,
      currentCapability: currentCap,
      gap,
      importance,
      currentDemand,
      futureDemand,
      trend,
      prerequisites,
      unlocks,
      studentStatus,
      reason
    };
  });

  // Sort skills deterministically by category (FOUNDATION, CORE, ADVANCED) then importance descending
  const categoryOrder = { FOUNDATION: 1, CORE: 2, ADVANCED: 3 };
  detailedRoleSkills.sort((a, b) => {
    if (categoryOrder[a.category] !== categoryOrder[b.category]) {
      return categoryOrder[a.category] - categoryOrder[b.category];
    }
    if (b.importance !== a.importance) {
      return b.importance - a.importance;
    }
    return a.skillName.localeCompare(b.skillName);
  });

  const foundationalSkills = detailedRoleSkills.filter((s) => s.category === "FOUNDATION");
  const coreSkills = detailedRoleSkills.filter((s) => s.category === "CORE");
  const advancedSkills = detailedRoleSkills.filter((s) => s.category === "ADVANCED");

  // 3. Role Demand Overview
  const avgCurrentDemand = detailedRoleSkills.length > 0
    ? Math.round(detailedRoleSkills.reduce((sum, s) => sum + s.currentDemand, 0) / detailedRoleSkills.length)
    : 70;
  const avgFutureDemand = detailedRoleSkills.length > 0
    ? Math.round(detailedRoleSkills.reduce((sum, s) => sum + s.futureDemand, 0) / detailedRoleSkills.length)
    : 80;
  const demandTrend = avgFutureDemand >= avgCurrentDemand + 5 ? "EXPANDING" : (avgFutureDemand <= avgCurrentDemand - 5 ? "TRANSFORMING" : "STABLE");
  
  const roleDemand = {
    currentDemand: avgCurrentDemand,
    futureDemand: avgFutureDemand,
    trend: demandTrend,
    outlook: `${role.name} demand is projected to move from ${avgCurrentDemand}% to ${avgFutureDemand}% across key industry competencies.`
  };

  // 4. Capability Thresholds
  // Foundation Threshold: baseline score to enter role (min score expected across foundations)
  // Core Threshold: score needed for reliable role execution
  // Advanced Threshold: score needed for complex responsibilities
  const overallRequiredCapability = 100;
  const foundationThreshold = 50; // Entry baseline threshold
  const coreThreshold = 75;       // Proficient execution threshold
  const advancedThreshold = 90;   // Mastery threshold

  const capabilityModel = {
    overallRequiredCapability,
    foundationThreshold,
    coreThreshold,
    advancedThreshold,
    explanations: {
      foundation: `Foundation threshold (${foundationThreshold} pts): Minimum baseline required in core prerequisites to start practical work.`,
      core: `Core threshold (${coreThreshold} pts): Competency level needed for reliable autonomous execution.`,
      advanced: `Advanced threshold (${advancedThreshold} pts): Higher-level capability required for complex system engineering and leadership.`
    }
  };

  // 5. Critical Skills Identification
  // High role importance, unlock value, high demand, or critical student gap
  const criticalSkills = [...detailedRoleSkills]
    .map((s) => {
      const criticalScore = Math.round(
        (s.importance * 0.35) + 
        (s.futureDemand * 0.30) + 
        (s.unlocks.length * 15) + 
        (s.gap * 0.20)
      );
      
      let why = `High impact skill with ${s.futureDemand}% projected demand`;
      if (s.unlocks.length > 0) why += ` and unlocks ${s.unlocks.length} downstream skills`;
      if (s.gap > 0) why += ` (+${s.gap} pt gap)`;

      return {
        ...s,
        criticalScore,
        whyCritical: why
      };
    })
    .sort((a, b) => b.criticalScore - a.criticalScore)
    .slice(0, 4);

  // 6. Emerging Skills Identification (Reusing Task 10 trend metrics)
  const emergingSkills = [...detailedRoleSkills]
    .filter((s) => s.trend > 0 || s.futureDemand >= 80)
    .map((s) => ({
      skillId: s.skillId,
      skillName: s.skillName,
      currentDemand: s.currentDemand,
      futureDemand: s.futureDemand,
      growth: s.trend,
      trendLabel: s.trend > 15 ? "High Growth" : "Emerging",
      whyEmerging: `${s.skillName} is expanding with a +${s.trend}% growth trajectory (${s.currentDemand}% -> ${s.futureDemand}%).`
    }))
    .sort((a, b) => b.growth - a.growth);

  // 7. Dependency Map (DAG structure for the role)
  const dependencyMap = detailedRoleSkills.map((s) => ({
    skillId: s.skillId,
    skillName: s.skillName,
    category: s.category,
    prerequisites: s.prerequisites,
    unlocks: s.unlocks,
    isBlocking: s.category === "FOUNDATION" && s.gap > 0 && s.unlocks.length > 0,
    chainText: `${s.prerequisites.length > 0 ? s.prerequisites.map(p => p.skillName).join(", ") + " → " : ""}${s.skillName}${s.unlocks.length > 0 ? " → " + s.unlocks.map(u => u.skillName).join(", ") : ""}`
  }));

  // 8. Re-use Existing Engines for Student Fit, Path, Mobility & Interventions
  const readiness = calculateIndustryReadiness(role.id, capabilities);
  const gapAnalysis = analyzeSkillGaps(role.id, capabilities);
  const transferability = calculateTransferability(role.id, { ...STUDENT_PROFILE, capabilities });
  const learningPath = generateLearningPath(role.id, capabilities);
  const adjacentRolesData = getAdjacentRoles(role.id, capabilities);
  const interventions = generateSkillInterventions(role.id, capabilities);
  const missions = generateSkillMissions(role.id, capabilities);

  // Match / Partial / Missing breakdown
  const matchedSkills = detailedRoleSkills.filter((s) => s.currentCapability >= 80);
  const partialSkills = detailedRoleSkills.filter((s) => s.currentCapability >= 25 && s.currentCapability < 80);
  const missingSkills = detailedRoleSkills.filter((s) => s.currentCapability < 25);
  const blockingSkills = detailedRoleSkills.filter((s) => s.category === "FOUNDATION" && s.gap > 0);
  const strongestSkills = [...detailedRoleSkills].sort((a, b) => b.currentCapability - a.currentCapability).slice(0, 3);
  const biggestGaps = [...detailedRoleSkills].sort((a, b) => b.gap - a.gap).slice(0, 3);

  const studentFit = {
    readinessScore: readiness.overallScore,
    readinessLevel: readiness.readinessLevel,
    readinessLevelColor: readiness.readinessLevelColor,
    matchedSkills: matchedSkills.map((s) => s.skillName),
    partialSkills: partialSkills.map((s) => s.skillName),
    missingSkills: missingSkills.map((s) => s.skillName),
    blockingSkills: blockingSkills.map((s) => s.skillName),
    strongestSkills: strongestSkills.map((s) => ({ skillId: s.skillId, name: s.skillName, capability: s.currentCapability })),
    biggestGaps: biggestGaps.map((s) => ({ skillId: s.skillId, name: s.skillName, gap: s.gap }))
  };

  // 9. Development Path
  const developmentPath = {
    nextBestSkill: learningPath.nextBestSkill,
    orderedSkills: learningPath.phases.flatMap((p) => p.skills.map((s) => s.skillName)),
    estimatedEffort: learningPath.totalEstimatedEffort,
    phases: learningPath.phases
  };

  // 10. Career Mobility
  const careerMobility = {
    adjacentRoles: adjacentRolesData.topAdjacentRoles.slice(0, 4).map((r) => ({
      roleId: r.roleId,
      roleName: r.roleName,
      adjacencyScore: r.adjacencyScore,
      category: r.category,
      transitionDistance: r.transitionDistance,
      estimatedEffort: r.estimatedTransitionEffort,
      whyAdjacent: r.whyAdjacent
    })),
    transitionDifficulty: adjacentRolesData.topAdjacentRoles[0]?.transitionDistance || "MEDIUM"
  };

  // 11. Industry Impact
  const highValueSkills = detailedRoleSkills.filter((s) => s.importance >= 70);
  const futureCriticalSkills = detailedRoleSkills.filter((s) => s.futureDemand >= 85);
  const riskSkills = detailedRoleSkills.filter((s) => s.trend < 0);

  const industryImpact = {
    highValueSkills: highValueSkills.map((s) => ({ skillId: s.skillId, name: s.skillName, demand: s.currentDemand })),
    futureCriticalSkills: futureCriticalSkills.map((s) => ({ skillId: s.skillId, name: s.skillName, futureDemand: s.futureDemand })),
    riskSkills: riskSkills.map((s) => ({ skillId: s.skillId, name: s.skillName, trend: s.trend }))
  };

  // 12. Explainability integration using Task 21
  const readinessExplanation = generateExplanation({ type: "INDUSTRY_READINESS", roleId: role.id, studentCapabilities: capabilities });
  const explanation = {
    roleRequirementsWhy: `Role blueprint for ${role.name} maps ${detailedRoleSkills.length} required competencies categorized into Foundation, Core, and Advanced tiers based on graph DAG topological dependencies.`,
    readinessWhy: readinessExplanation.conciseWhy,
    developmentPathWhy: learningPath.nextBestSkillReason || `Sequential path built according to DAG prerequisites to optimize capability acquisition.`,
    mobilityWhy: careerMobility.adjacentRoles[0]?.whyAdjacent || `Career mobility computed using skill overlap and transition effort algorithms.`
  };

  return {
    roleId: role.id,
    roleName: role.name,
    sector: detailedRoleSkills[0]?.sector || "Technology",
    description: `Complete, explainable industry role blueprint for ${role.name}, defining required capabilities, skill classification, graph dependencies, student fit, and career mobility options.`,

    roleDemand,
    capabilityModel,

    skillRequirements: detailedRoleSkills,
    foundationalSkills,
    coreSkills,
    advancedSkills,

    criticalSkills,
    emergingSkills,

    dependencyMap,

    studentFit,
    developmentPath,
    careerMobility,
    industryImpact,

    explanation,
    
    // Pass raw engines data for seamless UI interactions
    rawEngines: {
      readiness,
      gapAnalysis,
      interventions,
      missions,
      learningPath,
      transferability
    }
  };
}
