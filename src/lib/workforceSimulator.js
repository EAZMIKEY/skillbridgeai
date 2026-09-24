import { SKILLS_DATA } from "@/data/skillModel";
import { ROLES_DATA } from "@/data/skillGraph";
import { getRoleSkills, getSkillConnections } from "@/lib/skillGraphLogic";
import { determineStatus, calculateGrowth } from "@/lib/skillLogic";

function getRoleBaseDemand(roleId) {
  const reqSkills = getRoleSkills(roleId);
  if (reqSkills.length === 0) return 60; // fallback deterministic base
  const sum = reqSkills.reduce((acc, s) => acc + (s.node?.currentDemand || 60), 0);
  return Math.round(sum / reqSkills.length); // Average of required skills creates a deterministic baseline
}

function clamp(value) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function simulateScenario(scenario) {
  // 1. Calculate Role Impact
  const roles = ROLES_DATA.map(role => {
    const baseDemand = getRoleBaseDemand(role.id);
    const modifier = scenario.roleModifiers[role.id] || 0;
    
    const projectedDemand = clamp(baseDemand * (1 + modifier / 100));
    const delta = ((projectedDemand - baseDemand) / baseDemand) * 100;

    let classification = "Stable";
    if (delta >= 15) classification = "Strong Increase";
    else if (delta > 5) classification = "Moderate Increase";
    else if (delta <= -15) classification = "Strong Decrease";
    else if (delta < -5) classification = "Moderate Decrease";

    return {
      ...role,
      baseDemand,
      projectedDemand,
      modifier,
      delta: Math.round(delta),
      classification
    };
  });

  // 2. Calculate Skill Impact & Evolution
  const skills = SKILLS_DATA.map(skill => {
    const modifier = scenario.skillModifiers[skill.id] || 0;
    
    // Instead of raw future demand, the scenario modifies the *CURRENT* projection
    const projectedFuture = clamp(skill.futureDemand * (1 + modifier / 100));
    
    const growth = calculateGrowth(skill.currentDemand, projectedFuture);
    const status = determineStatus(skill.currentDemand, projectedFuture, growth);

    // 3. Workforce Gap Calculation
    // Deterministic current capability: slightly lower than current demand for most, heavily penalized for newer tech
    const capabilityPenalty = (100 - skill.currentDemand) * 0.3; // Pseudo-deterministic drop
    const currentCapability = clamp(skill.currentDemand - capabilityPenalty);
    
    const gap = Math.max(0, projectedFuture - currentCapability);
    
    let gapSeverity = "Low";
    if (gap > 40) gapSeverity = "Critical";
    else if (gap > 25) gapSeverity = "High";
    else if (gap > 10) gapSeverity = "Moderate";

    // Explainability for Gaps
    let explanation = `With projected demand at ${projectedFuture} against a current market capability of ${currentCapability}, supply is slightly lagging.`;
    if (gapSeverity === "Critical") {
      explanation = `Projected demand (${projectedFuture}) massively outpaces existing workforce capability (${currentCapability}), signaling an immediate crisis.`;
    } else if (gapSeverity === "High") {
       explanation = `Projected demand (${projectedFuture}) is significantly stripping market capability (${currentCapability}), requiring aggressive reskilling.`;
    }

    return {
      ...skill,
      projectedFuture,
      scenarioModified: modifier !== 0,
      scenarioGrowth: growth,
      scenarioStatus: status,
      currentCapability,
      gap,
      gapSeverity,
      explanation
    };
  });

  // 4. Generate Interventions
  // Focus only on High/Critical gaps to formulate interventions
  const criticalGaps = skills.filter(s => s.gapSeverity === "Critical" || s.gapSeverity === "High")
    .sort((a, b) => b.gap - a.gap);

  const interventions = [];
  const seenSkillIds = new Set();
  
  criticalGaps.forEach(skillTarget => {
    // Generate recommendation based on graph relationships
    const related = getSkillConnections(skillTarget.id).filter(c => c.direction === "parent");
    
    if (!seenSkillIds.has(skillTarget.id)) {
       seenSkillIds.add(skillTarget.id);
       interventions.push({
         skillId: skillTarget.id,
         skillName: skillTarget.name,
         priority: skillTarget.gapSeverity === "Critical" ? "HIGH PRIORITY" : "MEDIUM PRIORITY",
         reasoning: `Critical workforce gap (${skillTarget.gap}) identified.`
       });
    }

    // Add immediate prerequisite recommendations
    related.forEach(rel => {
      if (!seenSkillIds.has(rel.node.id) && rel.node.type !== "Role") { 
        seenSkillIds.add(rel.node.id);
        interventions.push({
          skillId: rel.node.id,
          skillName: rel.node.name,
          priority: "SUPPORTING PRIORITY",
          reasoning: `Enables ${skillTarget.name} readiness (${rel.explanation}).`
        });
      }
    });
  });

  // 5. Build Summary
  const affectedRoles = roles.filter(r => r.modifier !== 0).length;
  const transformedSkills = skills.filter(s => s.scenarioModified).length;
  const emerging = skills.filter(s => s.scenarioStatus === "Emerging").length;
  const declining = skills.filter(s => s.scenarioStatus === "Declining").length;

  let overallImpact = "LOW";
  if (affectedRoles > Math.floor(ROLES_DATA.length * 0.5) || transformedSkills > Math.floor(SKILLS_DATA.length * 0.4)) {
    overallImpact = "CRITICAL";
  } else if (affectedRoles > Math.floor(ROLES_DATA.length * 0.2)) {
    overallImpact = "HIGH";
  }

  return {
    scenario,
    roles,
    skills,
    interventions: interventions.slice(0, 5), // Keep it concise
    summary: {
      affectedRoles,
      transformedSkills,
      emerging,
      declining,
      overallImpact
    }
  };
}
