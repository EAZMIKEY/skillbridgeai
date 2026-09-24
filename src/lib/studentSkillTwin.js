import { STUDENT_PROFILE } from "@/data/studentProfile";
import { SKILLS_DATA } from "@/data/skillModel";
import { ROLES_DATA, SKILL_RELATIONS } from "@/data/skillGraph";
import { getRoleSkills, getSkillConnections } from "@/lib/skillGraphLogic";
import { calculateTransferability, THRESHOLDS } from "@/lib/skillTransferability";
import { generateLearningPath } from "@/lib/learningPathGenerator";
import { getAdjacentRoles } from "@/lib/roleAdjacency";

/**
 * SKILL TWIN THRESHOLD CONSTANTS:
 * 80–100 -> MASTERED
 * 65–79  -> STRONG
 * 40–64  -> DEVELOPING
 * 1–39   -> WEAK
 * 0 / undefined -> MISSING
 */
export const STATUS_THRESHOLDS = {
  MASTERED: 80,
  STRONG: 65,
  DEVELOPING: 40,
  WEAK: 1
};

/**
 * Capability Cluster Mapping for SKILLS_DATA
 */
const CLUSTER_DEFINITIONS = [
  {
    name: "Programming & Software",
    description: "Core programming languages, systems development, and software engineering practices.",
    skillIds: ["s_python", "s_javascript", "s_typescript", "s_rust", "s_go", "s_php", "s_cobol", "s_traditional_qa"]
  },
  {
    name: "AI & Machine Learning",
    description: "Generative models, natural language processing, prompt engineering, and quantum computing.",
    skillIds: ["s_genai", "s_prompt_eng", "s_nlp", "s_quantum"]
  },
  {
    name: "Data & Analytics",
    description: "Data pipeline engineering, SQL data manipulation, and analytical modeling.",
    skillIds: ["s_data_eng", "s_sql"]
  },
  {
    name: "Cloud & Infrastructure",
    description: "Cloud architecture, container orchestration, edge computing, and green computing.",
    skillIds: ["s_cloud", "s_docker", "s_edge_computing", "s_green_energy"]
  },
  {
    name: "Cybersecurity & Systems",
    description: "Information security, threat detection, devsecops, and zero-trust controls.",
    skillIds: ["s_cybersec"]
  },
  {
    name: "Design & Operations",
    description: "UI/UX design, AR/VR development, agile project management, and blockchain protocols.",
    skillIds: ["s_ui_ux", "s_agile", "s_ar_vr", "s_blockchain"]
  }
];

/**
 * Safely clamp any capability score to an integer between 0 and 100.
 */
function clampScore(val) {
  if (val === undefined || val === null || isNaN(val)) return 0;
  return Math.max(0, Math.min(100, Math.round(Number(val))));
}

/**
 * Classify a capability score into a deterministic status level.
 */
export function getCapabilityStatus(score) {
  const s = clampScore(score);
  if (s >= STATUS_THRESHOLDS.MASTERED) return "MASTERED";
  if (s >= STATUS_THRESHOLDS.STRONG) return "STRONG";
  if (s >= STATUS_THRESHOLDS.DEVELOPING) return "DEVELOPING";
  if (s >= STATUS_THRESHOLDS.WEAK) return "WEAK";
  return "MISSING";
}

/**
 * Check if a skill is within 10 points of upgrading to the next status bracket.
 */
function isNearThreshold(score) {
  const s = clampScore(score);
  if (s >= 30 && s < 40) return true; // Near DEVELOPING
  if (s >= 55 && s < 65) return true; // Near STRONG
  if (s >= 70 && s < 80) return true; // Near MASTERED
  return false;
}

/**
 * Build a complete, deterministic Student Skill Twin representation.
 */
export function buildStudentSkillTwin(studentCapabilities = null, targetRoleId = null) {
  // Construct student profile override if custom capabilities object provided
  const capabilities = studentCapabilities || STUDENT_PROFILE.capabilities || {};
  const profile = { ...STUDENT_PROFILE, capabilities };

  // Determine active target role
  const roleId = targetRoleId || ROLES_DATA[0].id;
  const targetRole = ROLES_DATA.find((r) => r.id === roleId) || ROLES_DATA[0];

  // Retrieve base intelligence from Tasks 13, 14, 15
  const transferability = calculateTransferability(targetRole.id, profile);
  const learningPath = generateLearningPath(targetRole.id, capabilities);
  const roleAdjacencies = getAdjacentRoles(targetRole.id, capabilities);

  // Map each skill in SKILLS_DATA into a structured Skill Twin Node
  const twinSkills = SKILLS_DATA.map((skill) => {
    const rawCapability = capabilities[skill.id];
    const capability = clampScore(rawCapability);
    const status = getCapabilityStatus(capability);

    // Retrieve graph connections for this skill
    const connections = getSkillConnections(skill.id);
    const prerequisiteSkills = connections
      .filter((c) => c.direction === "parent")
      .map((c) => c.node?.name)
      .filter(Boolean);

    const unlocksSkills = connections
      .filter((c) => c.direction === "child")
      .map((c) => c.node?.name)
      .filter(Boolean);

    const connectedSkills = connections.map((c) => ({
      id: c.node?.id,
      name: c.node?.name,
      direction: c.direction,
      explanation: c.explanation
    })).filter(c => c.id);

    const isFoundational = unlocksSkills.length > 0;
    const nearThreshold = isNearThreshold(capability);

    // Map skill to a cluster
    const clusterObj = CLUSTER_DEFINITIONS.find((c) => c.skillIds.includes(skill.id));
    const cluster = clusterObj ? clusterObj.name : "General Technology";

    // Dynamic explainability string
    let explanation = "";
    if (status === "MASTERED") {
      explanation = `You have mastered ${skill.name} with a capability score of ${capability}. It acts as a primary foundation for your technical profile.`;
    } else if (status === "STRONG") {
      explanation = `Your capability of ${capability} in ${skill.name} represents a solid foundation requiring minor refinement to achieve full mastery.`;
    } else if (status === "DEVELOPING") {
      explanation = `You have a developing capability of ${capability} in ${skill.name}. Continued practice will advance this to a strong core asset.`;
    } else if (status === "WEAK") {
      explanation = `You possess introductory knowledge in ${skill.name} (${capability} pts). Dedicated upskilling will build this into an active foundation.`;
    } else {
      explanation = `No current capability detected for ${skill.name}. Upskilling in this domain will unlock additional downstream competencies.`;
    }

    return {
      skillId: skill.id,
      skillName: skill.name,
      capability,
      status,
      sector: skill.sector || "Technology",
      cluster,
      currentDemand: skill.currentDemand || 70,
      futureDemand: skill.futureDemand || 80,
      prerequisiteSkills,
      unlocksSkills,
      connectedSkills,
      isFoundational,
      nearThreshold,
      explanation
    };
  });

  // Calculate status counts
  const masteredCount = twinSkills.filter((s) => s.status === "MASTERED").length;
  const strongCount = twinSkills.filter((s) => s.status === "STRONG").length;
  const developingCount = twinSkills.filter((s) => s.status === "DEVELOPING").length;
  const weakCount = twinSkills.filter((s) => s.status === "WEAK").length;
  const missingCount = twinSkills.filter((s) => s.status === "MISSING").length;

  // Calculate Overall Capability Score (weighted average with foundational skill bonus)
  let totalWeightedScore = 0;
  let totalWeight = 0;
  twinSkills.forEach((s) => {
    const weight = s.isFoundational ? 1.25 : 1.0;
    totalWeightedScore += s.capability * weight;
    totalWeight += weight;
  });
  const overallCapabilityScore = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;

  // Calculate Foundation Score (average capability of foundational skills)
  const foundationalSkills = twinSkills.filter((s) => s.isFoundational);
  const foundationScore = foundationalSkills.length > 0
    ? Math.round(foundationalSkills.reduce((acc, s) => acc + s.capability, 0) / foundationalSkills.length)
    : 0;

  // Identify Strongest Capability & Biggest Gap
  const sortedByCapability = [...twinSkills].sort((a, b) => b.capability - a.capability);
  const strongestCapability = sortedByCapability[0] || null;

  // Find biggest gap among required skills for target role (or general highest gap)
  const targetRequiredSkillIds = new Set(getRoleSkills(targetRole.id).map(e => e.node?.id).filter(Boolean));
  const requiredTwinSkills = twinSkills.filter(s => targetRequiredSkillIds.has(s.skillId));
  const gapCandidateList = requiredTwinSkills.length > 0 ? requiredTwinSkills : twinSkills;
  const sortedByGap = [...gapCandidateList].sort((a, b) => (100 - a.capability) - (100 - b.capability));
  const biggestGap = sortedByGap[0] || null;

  // Calculate Capability Clusters
  const clusters = CLUSTER_DEFINITIONS.map((def) => {
    const skillsInCluster = twinSkills.filter((s) => def.skillIds.includes(s.skillId));
    if (skillsInCluster.length === 0) {
      return {
        clusterName: def.name,
        description: def.description,
        clusterScore: 0,
        totalSkills: 0,
        strongestSkill: null,
        weakestSkill: null,
        status: "Foundation Needed",
        skills: []
      };
    }

    const sumScore = skillsInCluster.reduce((acc, s) => acc + s.capability, 0);
    const clusterScore = Math.round(sumScore / skillsInCluster.length);

    const sortedCluster = [...skillsInCluster].sort((a, b) => b.capability - a.capability);
    const strongestSkill = sortedCluster[0];
    const weakestSkill = sortedCluster[sortedCluster.length - 1];

    let clusterStatus = "Foundation Needed";
    if (clusterScore >= 70) clusterStatus = "Advanced";
    else if (clusterScore >= 40) clusterStatus = "Developing";

    return {
      clusterName: def.name,
      description: def.description,
      clusterScore,
      totalSkills: skillsInCluster.length,
      strongestSkill,
      weakestSkill,
      status: clusterStatus,
      skills: skillsInCluster
    };
  });

  // Sort clusters by clusterScore descending
  const sortedClusters = [...clusters].sort((a, b) => b.clusterScore - a.clusterScore);
  const strongestCluster = sortedClusters[0] || null;
  const biggestDevelopmentCluster = sortedClusters[sortedClusters.length - 1] || null;

  // Calculate Growth Potential ("Current Momentum Potential")
  const nearThresholdCount = twinSkills.filter((s) => s.nearThreshold).length;
  
  // Count missing skills whose prerequisites are MASTERED or STRONG
  const unlockedOpportunityCount = twinSkills.filter((s) => {
    if (s.status !== "MISSING" && s.status !== "WEAK") return false;
    if (s.prerequisiteSkills.length === 0) return false;
    return s.prerequisiteSkills.every((pName) => {
      const parentSkill = twinSkills.find((ts) => ts.skillName === pName);
      return parentSkill && (parentSkill.status === "MASTERED" || parentSkill.status === "STRONG");
    });
  }).length;

  const growthPotentialPoints = (nearThresholdCount * 25) + (unlockedOpportunityCount * 25) + (developingCount * 15);
  let growthLevel = "LOW";
  if (growthPotentialPoints >= 65) growthLevel = "HIGH";
  else if (growthPotentialPoints >= 35) growthLevel = "MEDIUM";

  const growthPotential = {
    level: growthLevel,
    score: growthPotentialPoints,
    nearThresholdCount,
    unlockedOpportunityCount,
    developingCount,
    reasoning: `Growth Potential indicates immediate capability momentum: ${nearThresholdCount} near-threshold skills are positioned to level up and ${unlockedOpportunityCount} downstream learning opportunities are unlocked by your current foundations. (Note: Evaluates current profile structure, not historical progress).`
  };

  return {
    targetRole: {
      id: targetRole.id,
      name: targetRole.name
    },
    studentProfile: profile,
    skills: twinSkills,
    summary: {
      totalEvaluated: twinSkills.length,
      masteredCount,
      strongCount,
      developingCount,
      weakCount,
      missingCount,
      overallCapabilityScore,
      foundationScore,
      growthPotential,
      strongestCapability,
      biggestGap
    },
    clusters,
    strongestCluster,
    biggestDevelopmentCluster,
    intelligence: {
      transferability,
      learningPath,
      roleAdjacencies
    }
  };
}
