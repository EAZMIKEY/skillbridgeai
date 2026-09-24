export function calculateGrowth(current, future) {
  if (current === 0) return future > 0 ? 100 : 0;
  return ((future - current) / current) * 100;
}

export function determineStatus(current, future, growth) {
  // Classification logic covering all possibilities
  if (growth > 15) {
    if (current < 60) return "Emerging";
    return "Growing"; 
  }
  
  if (growth > 10) {
    return "Growing";
  }
  
  if (growth >= -5 && growth <= 10) {
    return "Stable";
  }
  
  // growth < -5
  if (current >= 50) {
    return "Transforming";
  }
  
  return "Declining";
}

export function generateExplanation(name, status, current, future, growth) {
  const gStr = growth > 0 ? `+${growth.toFixed(1)}%` : `${growth.toFixed(1)}%`;
  
  switch (status) {
    case "Emerging":
      return `${name} is classified as Emerging because it shows strong future growth potential (${gStr}) starting from a lower baseline demand of ${current}.`;
    case "Growing":
      return `${name} is classified as Growing due to strong projected increases in demand (${gStr}), moving from ${current} to ${future} while remaining highly relevant across target roles.`;
    case "Stable":
      return `${name} is classified as Stable. Its demand remains consistent (${gStr}), projected at ${future}, indicating steady industry reliance.`;
    case "Transforming":
      return `${name} is classified as Transforming. While current workforce reliance is strong (${current}), future demand shrinks (${gStr}), suggesting changing practices or tooling overhauls.`;
    case "Declining":
      return `${name} is classified as Declining because projected demand continues to drop (${gStr}) from an already limiting baseline factor (${current}).`;
    default:
      return "Status unclassified.";
  }
}

export function enrichSkillData(skills) {
  return skills.map((skill) => {
    const growth = calculateGrowth(skill.currentDemand, skill.futureDemand);
    const status = determineStatus(skill.currentDemand, skill.futureDemand, growth);
    const explanation = generateExplanation(
      skill.name,
      status,
      skill.currentDemand,
      skill.futureDemand,
      growth
    );
    
    return {
      ...skill,
      growth,
      status,
      explanation
    };
  });
}
