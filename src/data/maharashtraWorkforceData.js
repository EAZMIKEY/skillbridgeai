/**
 * Maharashtra Workforce Intelligence Prototype Dataset
 * 
 * DISCLAIMER: Prototype / synthetic dataset for regional capability modeling.
 * Regional workforce, capability, training capacity and demand values shown in this prototype
 * are synthetic and are not official Government of Maharashtra statistics.
 */

export const MAHARASHTRA_REGIONAL_DATA = [
  {
    id: "mah_pune",
    name: "Pune Tech & Automotive Cluster",
    type: "Prototype Regional Cluster",
    district: "Pune",
    workforceSize: "650,000",
    description: "Major software, cloud infrastructure, and automotive R&D hub experiencing accelerating demand in Cybersecurity, Cloud DevOps, and AI systems.",
    skillDemand: [
      { skillId: "s_backend_dev", currentDemand: 90, futureDemand: 88, growthRate: 14, importance: 88 },
      { skillId: "s_cybersecurity", currentDemand: 80, futureDemand: 92, growthRate: 30, importance: 90 },
      { skillId: "s_sql", currentDemand: 88, futureDemand: 82, growthRate: 8, importance: 82 },
      { skillId: "s_cloud_architecture", currentDemand: 75, futureDemand: 90, growthRate: 28, importance: 86 },
      { skillId: "s_genai", currentDemand: 70, futureDemand: 95, growthRate: 36, importance: 94 }
    ],
    workforceCapability: [
      { skillId: "s_backend_dev", availableCapability: 80, proficiencyDistribution: { foundation: 25, core: 55, advanced: 20 }, workforceCoverage: 75 },
      { skillId: "s_cybersecurity", availableCapability: 42, proficiencyDistribution: { foundation: 50, core: 35, advanced: 15 }, workforceCoverage: 35 },
      { skillId: "s_sql", availableCapability: 85, proficiencyDistribution: { foundation: 20, core: 60, advanced: 20 }, workforceCoverage: 80 },
      { skillId: "s_cloud_architecture", availableCapability: 50, proficiencyDistribution: { foundation: 45, core: 40, advanced: 15 }, workforceCoverage: 45 },
      { skillId: "s_genai", availableCapability: 35, proficiencyDistribution: { foundation: 60, core: 30, advanced: 10 }, workforceCoverage: 22 }
    ],
    trainingSupply: [
      { programId: "tp_backend_microservices", capacity: 4000, relevantSkills: ["s_backend_dev", "s_sql"] },
      { programId: "tp_cybersecurity_zerotrust", capacity: 1800, relevantSkills: ["s_cybersecurity"] }
    ]
  },
  {
    id: "mah_mumbai",
    name: "Mumbai Metropolitan Region",
    type: "Prototype Regional Cluster",
    district: "Mumbai City & Suburban",
    workforceSize: "1,100,000",
    description: "FinTech, enterprise software, and cloud services epicenter with high demand for advanced data pipelines, low-latency backends, and cloud security.",
    skillDemand: [
      { skillId: "s_cybersecurity", currentDemand: 92, futureDemand: 96, growthRate: 24, importance: 96 },
      { skillId: "s_cloud_architecture", currentDemand: 88, futureDemand: 94, growthRate: 22, importance: 92 },
      { skillId: "s_backend_dev", currentDemand: 92, futureDemand: 90, growthRate: 12, importance: 88 },
      { skillId: "s_genai", currentDemand: 82, futureDemand: 96, growthRate: 34, importance: 95 }
    ],
    workforceCapability: [
      { skillId: "s_cybersecurity", availableCapability: 68, proficiencyDistribution: { foundation: 25, core: 50, advanced: 25 }, workforceCoverage: 60 },
      { skillId: "s_cloud_architecture", availableCapability: 72, proficiencyDistribution: { foundation: 25, core: 50, advanced: 25 }, workforceCoverage: 65 },
      { skillId: "s_backend_dev", availableCapability: 88, proficiencyDistribution: { foundation: 15, core: 55, advanced: 30 }, workforceCoverage: 80 },
      { skillId: "s_genai", availableCapability: 52, proficiencyDistribution: { foundation: 45, core: 40, advanced: 15 }, workforceCoverage: 40 }
    ],
    trainingSupply: [
      { programId: "tp_cybersecurity_zerotrust", capacity: 2500, relevantSkills: ["s_cybersecurity"] },
      { programId: "tp_fullstack_ai", capacity: 3000, relevantSkills: ["s_genai", "s_python"] }
    ]
  },
  {
    id: "mah_nagpur",
    name: "Nagpur Innovation Zone",
    type: "Prototype Regional Cluster",
    district: "Nagpur",
    workforceSize: "320,000",
    description: "Emerging IT and data services cluster in central India focusing on full-stack web engineering, SQL databases, and foundational cloud migration.",
    skillDemand: [
      { skillId: "s_react", currentDemand: 85, futureDemand: 82, growthRate: 10, importance: 82 },
      { skillId: "s_sql", currentDemand: 82, futureDemand: 80, growthRate: 8, importance: 78 },
      { skillId: "s_backend_dev", currentDemand: 78, futureDemand: 84, growthRate: 16, importance: 80 },
      { skillId: "s_cloud_architecture", currentDemand: 60, futureDemand: 82, growthRate: 32, importance: 85 }
    ],
    workforceCapability: [
      { skillId: "s_react", availableCapability: 70, proficiencyDistribution: { foundation: 35, core: 50, advanced: 15 }, workforceCoverage: 62 },
      { skillId: "s_sql", availableCapability: 75, proficiencyDistribution: { foundation: 30, core: 55, advanced: 15 }, workforceCoverage: 70 },
      { skillId: "s_backend_dev", availableCapability: 62, proficiencyDistribution: { foundation: 40, core: 45, advanced: 15 }, workforceCoverage: 55 },
      { skillId: "s_cloud_architecture", availableCapability: 35, proficiencyDistribution: { foundation: 60, core: 30, advanced: 10 }, workforceCoverage: 28 }
    ],
    trainingSupply: [
      { programId: "tp_react_frontend_core", capacity: 2000, relevantSkills: ["s_react", "s_javascript"] }
    ]
  },
  {
    id: "mah_nashik",
    name: "Nashik Industrial & Software Belt",
    type: "Prototype Regional Cluster",
    district: "Nashik",
    workforceSize: "280,000",
    description: "Growing industrial automation and digital engineering cluster with rising demand for DevOps, Python scripting, and cloud integration.",
    skillDemand: [
      { skillId: "s_python", currentDemand: 82, futureDemand: 86, growthRate: 15, importance: 82 },
      { skillId: "s_devops", currentDemand: 72, futureDemand: 88, growthRate: 26, importance: 86 },
      { skillId: "s_sql", currentDemand: 80, futureDemand: 78, growthRate: 6, importance: 76 }
    ],
    workforceCapability: [
      { skillId: "s_python", availableCapability: 72, proficiencyDistribution: { foundation: 30, core: 50, advanced: 20 }, workforceCoverage: 65 },
      { skillId: "s_devops", availableCapability: 42, proficiencyDistribution: { foundation: 55, core: 35, advanced: 10 }, workforceCoverage: 32 },
      { skillId: "s_sql", availableCapability: 78, proficiencyDistribution: { foundation: 25, core: 60, advanced: 15 }, workforceCoverage: 72 }
    ],
    trainingSupply: [
      { programId: "tp_cloud_devops_gitops", capacity: 1200, relevantSkills: ["s_devops"] }
    ]
  },
  {
    id: "mah_chhatrapati_sambhajinagar",
    name: "Chhatrapati Sambhajinagar Manufacturing Hub",
    type: "Prototype Regional Cluster",
    district: "Chhatrapati Sambhajinagar (Aurangabad)",
    workforceSize: "240,000",
    description: "Industrial manufacturing and logistics cluster modernizing with IoT data pipelines, SQL telemetry, and basic cloud reporting.",
    skillDemand: [
      { skillId: "s_sql", currentDemand: 80, futureDemand: 78, growthRate: 8, importance: 78 },
      { skillId: "s_data_pipelines", currentDemand: 65, futureDemand: 84, growthRate: 28, importance: 84 },
      { skillId: "s_python", currentDemand: 70, futureDemand: 78, growthRate: 14, importance: 75 }
    ],
    workforceCapability: [
      { skillId: "s_sql", availableCapability: 70, proficiencyDistribution: { foundation: 35, core: 50, advanced: 15 }, workforceCoverage: 65 },
      { skillId: "s_data_pipelines", availableCapability: 32, proficiencyDistribution: { foundation: 60, core: 30, advanced: 10 }, workforceCoverage: 25 },
      { skillId: "s_python", availableCapability: 58, proficiencyDistribution: { foundation: 45, core: 45, advanced: 10 }, workforceCoverage: 50 }
    ],
    trainingSupply: [
      { programId: "tp_data_ml_engineering", capacity: 1000, relevantSkills: ["s_data_pipelines", "s_python"] }
    ]
  },
  {
    id: "mah_thane_navimumbai",
    name: "Thane & Navi Mumbai Tech Belt",
    type: "Prototype Regional Cluster",
    district: "Thane / Thane District",
    workforceSize: "550,000",
    description: "Satellite IT corridor specializing in full-stack web applications, microservices architecture, and cloud data engineering.",
    skillDemand: [
      { skillId: "s_react", currentDemand: 90, futureDemand: 88, growthRate: 12, importance: 86 },
      { skillId: "s_backend_dev", currentDemand: 88, futureDemand: 86, growthRate: 14, importance: 85 },
      { skillId: "s_cloud_architecture", currentDemand: 80, futureDemand: 92, growthRate: 25, importance: 90 }
    ],
    workforceCapability: [
      { skillId: "s_react", availableCapability: 82, proficiencyDistribution: { foundation: 20, core: 55, advanced: 25 }, workforceCoverage: 76 },
      { skillId: "s_backend_dev", availableCapability: 80, proficiencyDistribution: { foundation: 20, core: 55, advanced: 25 }, workforceCoverage: 74 },
      { skillId: "s_cloud_architecture", availableCapability: 55, proficiencyDistribution: { foundation: 40, core: 45, advanced: 15 }, workforceCoverage: 48 }
    ],
    trainingSupply: [
      { programId: "tp_react_frontend_core", capacity: 3200, relevantSkills: ["s_react"] },
      { programId: "tp_backend_microservices", capacity: 2500, relevantSkills: ["s_backend_dev"] }
    ]
  }
];
