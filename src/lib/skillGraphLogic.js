import { SKILLS_DATA } from "@/data/skillModel";
import { ROLES_DATA, SKILL_RELATIONS } from "@/data/skillGraph";

// Retrieve a specific Node (Role or Skill)
export function getNode(id) {
  const role = ROLES_DATA.find((r) => r.id === id);
  if (role) return role;
  
  const skill = SKILLS_DATA.find((s) => s.id === id);
  if (skill) return skill;

  return null;
}

// Get skills directly required by a Role
export function getRoleSkills(roleId) {
  const relations = SKILL_RELATIONS.filter(
    (rel) => rel.source === roleId && rel.type === "requires"
  );
  
  return relations.map((rel) => {
    return {
      node: getNode(rel.target),
      explanation: rel.explanation
    };
  });
}

// Get roles that require this specific skill
export function getRelatedRoles(skillId) {
  const relations = SKILL_RELATIONS.filter(
    (rel) => rel.target === skillId && rel.type === "requires"
  );
  
  return relations.map((rel) => {
    return {
      node: getNode(rel.source),
      explanation: rel.explanation
    };
  });
}

// Get skills connected to this skill (both where this is target, and where this is source)
export function getSkillConnections(skillId) {
  const children = SKILL_RELATIONS.filter(
    (rel) => rel.source === skillId && rel.type === "related"
  ).map((rel) => ({
    node: getNode(rel.target),
    direction: "child",
    explanation: rel.explanation
  }));

  const parents = SKILL_RELATIONS.filter(
    (rel) => rel.target === skillId && rel.type === "related"
  ).map((rel) => ({
    node: getNode(rel.source),
    direction: "parent",
    explanation: rel.explanation
  }));

  return [...children, ...parents].filter((item) => item.node !== null && item.node !== undefined);
}
