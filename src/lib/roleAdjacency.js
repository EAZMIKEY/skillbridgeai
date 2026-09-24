import { STUDENT_PROFILE } from "@/data/studentProfile";
import { ROLES_DATA, SKILL_RELATIONS } from "@/data/skillGraph";
import { getRoleSkills, getSkillConnections } from "@/lib/skillGraphLogic";
import { calculateTransferability, THRESHOLDS } from "@/lib/skillTransferability";
import { generateLearningPath } from "@/lib/learningPathGenerator";

/**
 * DETERMINISTIC ADJACENCY SCORING MODEL:
 * 
 * 1. Skill Overlap Score (30%): Overlap between target role requirements, student capabilities, and candidate role skills.
 * 2. Capability Coverage Score (25%): Percentage of candidate role baseline points satisfied by student profile.
 * 3. Foundation Strength Score (15%): Ratio of candidate skills classified as Direct Transfer or Strong Foundation.
 * 4. Graph Proximity Score (10%): Prerequisite DAG connectivity between student's existing skills and candidate's missing skills.
 * 5. Role Demand Alignment Score (10%): Average market demand metric of candidate role skills.
 * 6. Transition Ease Score (10%): Inverse function of estimated weeks needed to complete transition path.
 * 
 * Adjacency Score = Clamp(0..100, Sum of above components)
 */

/**
 * Helper to parse numeric week estimate from effort string (e.g. "4–6 weeks" -> 5)
 */
function parseEstimatedWeeks(effortStr) {
  if (!effortStr || effortStr.includes("0 weeks") || effortStr.includes("Completed")) return 0;
  const matches = effortStr.match(/(\d+)–(\d+)/);
  if (matches) {
    return Math.round((parseInt(matches[1], 10) + parseInt(matches[2], 10)) / 2);
  }
  const single = effortStr.match(/(\d+)/);
  return single ? parseInt(single[1], 10) : 4;
}

/**
 * Calculate deterministic career role adjacencies for a target role and student profile.
 */
export function getAdjacentRoles(targetRoleId, studentCapabilities = null) {
  // Construct student profile override if custom capabilities object provided
  const profile = studentCapabilities 
    ? { ...STUDENT_PROFILE, capabilities: studentCapabilities }
    : STUDENT_PROFILE;

  // Retrieve base target role object
  let targetRole = ROLES_DATA.find((r) => r.id === targetRoleId);
  if (!targetRole) {
    targetRole = ROLES_DATA[0];
  }

  // Get skills required by the primary target role
  const targetRoleSkillEntries = getRoleSkills(targetRole.id);
  const targetSkillIds = new Set(targetRoleSkillEntries.map((e) => e.node?.id).filter(Boolean));

  // Inspect all candidate roles excluding the selected target role itself
  const candidateRoles = ROLES_DATA.filter((r) => r.id !== targetRole.id);

  const adjacentRoles = candidateRoles.map((candidateRole) => {
    // Retrieve skills required by candidate role
    const candidateSkillEntries = getRoleSkills(candidateRole.id);
    const candidateSkills = candidateSkillEntries.map((e) => e.node).filter(Boolean);

    if (candidateSkills.length === 0) {
      return {
        roleId: candidateRole.id,
        roleName: candidateRole.name,
        adjacencyScore: 0,
        category: "DISTANT",
        transitionDistance: "HIGH",
        matchedSkills: [],
        transferableSkills: [],
        missingSkills: [],
        foundationCoverage: 0,
        estimatedTransitionEffort: "Unknown",
        estimatedTransitionWeeks: 99,
        whyAdjacent: `No defined skill requirements found for ${candidateRole.name}.`,
        learningPath: null,
        transferability: null
      };
    }

    // Call Task 13 Transferability Engine for this candidate role
    const transferability = calculateTransferability(candidateRole.id, profile);
    
    // Call Task 14 Learning Path Generator for this candidate role
    const learningPath = generateLearningPath(candidateRole.id, profile.capabilities);

    // 1. Skill Overlap Calculation
    const sharedWithTargetRole = candidateSkills.filter((s) => targetSkillIds.has(s.id));
    const matchedStudentSkills = candidateSkills.filter((s) => {
      const score = (profile.capabilities && profile.capabilities[s.id] !== undefined)
        ? profile.capabilities[s.id]
        : 0;
      return score >= THRESHOLDS.PARTIAL_TRANSFER;
    });

    const overlapRatio = Math.min(
      1,
      (sharedWithTargetRole.length * 1.5 + matchedStudentSkills.length) / (candidateSkills.length * 2)
    );
    const skillOverlapScore = Math.round(overlapRatio * 30);

    // 2. Capability Coverage Score (25%)
    const capabilityCoverageScore = Math.round((transferability.foundationCoverage / 100) * 25);

    // 3. Foundation Strength Score (15%)
    const strongCount = transferability.directTransfers + transferability.strongFoundations;
    const strengthRatio = candidateSkills.length > 0 ? (strongCount / candidateSkills.length) : 0;
    const foundationStrengthScore = Math.round(strengthRatio * 15);

    // 4. Graph Proximity Score (10%)
    // Check if missing skills for candidate role are connected in graph to skills student possesses
    const missingSkills = transferability.missing;
    let connectedMissingCount = 0;
    missingSkills.forEach((mSkill) => {
      const connections = getSkillConnections(mSkill.id);
      const isConnectedToStudentPossessed = connections.some((conn) => {
        const studentScore = profile.capabilities ? (profile.capabilities[conn.node?.id] || 0) : 0;
        return studentScore >= THRESHOLDS.PARTIAL_TRANSFER;
      });
      if (isConnectedToStudentPossessed) connectedMissingCount += 1;
    });

    const proximityRatio = missingSkills.length > 0 ? (connectedMissingCount / missingSkills.length) : 1;
    const graphProximityScore = Math.round(proximityRatio * 10);

    // 5. Role Demand Alignment Score (10%)
    const totalDemand = candidateSkills.reduce((sum, s) => sum + (s.currentDemand || 70), 0);
    const avgDemand = candidateSkills.length > 0 ? totalDemand / candidateSkills.length : 70;
    const roleDemandScore = Math.round((avgDemand / 100) * 10);

    // 6. Transition Ease Score (10%)
    const transitionWeeks = parseEstimatedWeeks(learningPath.totalEstimatedEffort);
    const transitionEaseScore = Math.max(0, Math.min(10, Math.round((1 - (transitionWeeks / 16)) * 10)));

    // Total Adjacency Score Calculation
    let adjacencyScore = skillOverlapScore 
                       + capabilityCoverageScore 
                       + foundationStrengthScore 
                       + graphProximityScore 
                       + roleDemandScore 
                       + transitionEaseScore;

    adjacencyScore = Math.min(100, Math.max(0, adjacencyScore));

    // Role Category Classification
    let category = "DISTANT";
    if (adjacencyScore >= 80) category = "VERY CLOSE";
    else if (adjacencyScore >= 65) category = "CLOSE";
    else if (adjacencyScore >= 50) category = "POSSIBLE TRANSITION";

    // Transition Distance Classification
    let transitionDistance = "HIGH";
    if (transitionWeeks <= 4 || missingSkills.length <= 1) {
      transitionDistance = "LOW";
    } else if (transitionWeeks <= 8 || missingSkills.length <= 3) {
      transitionDistance = "MEDIUM";
    }

    // Dynamic Explainability (WHY Adjacent)
    let whyAdjacent = "";
    if (matchedStudentSkills.length > 0 && sharedWithTargetRole.length > 0) {
      whyAdjacent = `High structural overlap: Shares ${sharedWithTargetRole.length} core requirements with ${targetRole.name}. You already possess ${matchedStudentSkills.length} matching skills (${matchedStudentSkills.map(s => s.name).join(", ")}), yielding ${transferability.foundationCoverage}% baseline coverage.`;
    } else if (matchedStudentSkills.length > 0) {
      whyAdjacent = `Strong capability alignment: Your existing ${matchedStudentSkills.map(s => s.name).join(", ")} foundation directly satisfies ${transferability.foundationCoverage}% of ${candidateRole.name} requirements.`;
    } else if (sharedWithTargetRole.length > 0) {
      whyAdjacent = `Adjacent domain: Requires overlapping competencies (${sharedWithTargetRole.map(s => s.name).join(", ")}) with your primary target role ${targetRole.name}.`;
    } else {
      whyAdjacent = `Adjacent technical track requiring ${missingSkills.length} capability top-ups with an estimated transition effort of ${learningPath.totalEstimatedEffort}.`;
    }

    return {
      roleId: candidateRole.id,
      roleName: candidateRole.name,
      adjacencyScore,
      category,
      transitionDistance,
      matchedSkills: matchedStudentSkills.map((s) => s.name),
      transferableSkills: transferability.foundations,
      missingSkills: transferability.missing,
      foundationCoverage: transferability.foundationCoverage,
      estimatedTransitionEffort: learningPath.totalEstimatedEffort,
      estimatedTransitionWeeks: transitionWeeks,
      whyAdjacent,
      learningPath,
      transferability
    };
  });

  // Sort candidate roles deterministically:
  // 1. Adjacency Score descending
  // 2. Transition Weeks ascending
  // 3. Role Name ascending (localeCompare)
  adjacentRoles.sort((a, b) => {
    if (b.adjacencyScore !== a.adjacencyScore) {
      return b.adjacencyScore - a.adjacencyScore;
    }
    if (a.estimatedTransitionWeeks !== b.estimatedTransitionWeeks) {
      return a.estimatedTransitionWeeks - b.estimatedTransitionWeeks;
    }
    return a.roleName.localeCompare(b.roleName);
  });

  return {
    targetRole,
    studentProfile: profile,
    totalAdjacentRoles: adjacentRoles.length,
    veryCloseCount: adjacentRoles.filter(r => r.category === "VERY CLOSE").length,
    closeCount: adjacentRoles.filter(r => r.category === "CLOSE").length,
    possibleCount: adjacentRoles.filter(r => r.category === "POSSIBLE TRANSITION").length,
    topAdjacentRoles: adjacentRoles
  };
}

/**
 * Compare primary target role side-by-side with a selected candidate adjacent role.
 */
export function compareRoles(targetRoleId, adjacentRoleId, studentCapabilities = null) {
  const profile = studentCapabilities 
    ? { ...STUDENT_PROFILE, capabilities: studentCapabilities }
    : STUDENT_PROFILE;

  const targetRole = ROLES_DATA.find((r) => r.id === targetRoleId) || ROLES_DATA[0];
  const adjacentRole = ROLES_DATA.find((r) => r.id === adjacentRoleId) || ROLES_DATA[1];

  const targetSkills = getRoleSkills(targetRole.id).map(e => e.node).filter(Boolean);
  const adjacentSkills = getRoleSkills(adjacentRole.id).map(e => e.node).filter(Boolean);

  const sharedSkillNames = targetSkills
    .filter(ts => adjacentSkills.some(as => as.id === ts.id))
    .map(s => s.name);

  const transferability = calculateTransferability(adjacentRole.id, profile);
  const learningPath = generateLearningPath(adjacentRole.id, profile.capabilities);

  const matchedStudentSkills = adjacentSkills
    .filter(s => (profile.capabilities?.[s.id] || 0) >= THRESHOLDS.PARTIAL_TRANSFER)
    .map(s => s.name);

  const missingSkills = transferability.missing.map(s => s.name);

  const adjacentData = getAdjacentRoles(targetRole.id, profile.capabilities);
  const roleMatch = adjacentData.topAdjacentRoles.find(r => r.roleId === adjacentRole.id);

  return {
    targetRole: {
      id: targetRole.id,
      name: targetRole.name,
      totalSkills: targetSkills.length
    },
    adjacentRole: {
      id: adjacentRole.id,
      name: adjacentRole.name,
      adjacencyScore: roleMatch ? roleMatch.adjacencyScore : 65,
      category: roleMatch ? roleMatch.category : "CLOSE",
      transitionDistance: roleMatch ? roleMatch.transitionDistance : "MEDIUM",
      foundationCoverage: transferability.foundationCoverage,
      estimatedTransitionEffort: learningPath.totalEstimatedEffort
    },
    sharedSkills: sharedSkillNames,
    studentPossessedForAdjacent: matchedStudentSkills,
    missingForAdjacent: missingSkills,
    keyRelationshipReason: roleMatch ? roleMatch.whyAdjacent : `${adjacentRole.name} shares core technical competencies with ${targetRole.name}.`,
    learningPath
  };
}
