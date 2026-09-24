/**
 * Regional Skill Intelligence Prototype Dataset (Synthetic Model)
 * 
 * CLEAR DISCLAIMER: Prototype / synthetic dataset for regional capability modeling.
 */

export const REGIONAL_SKILL_DATA = [
  {
    id: "reg_bengaluru",
    name: "Bengaluru Innovation Corridor",
    country: "India",
    stateOrProvince: "Karnataka",
    workforceSize: "1,200,000",
    description: "Major global tech hub with dense backend engineering, AI, and cloud talent, experiencing rapid demand acceleration in Generative AI and distributed systems.",
    skillDemand: [
      { skillId: "s_genai", currentDemand: 85, futureDemand: 98, growthRate: 35, importance: 95 },
      { skillId: "s_backend_dev", currentDemand: 95, futureDemand: 92, growthRate: 15, importance: 90 },
      { skillId: "s_cloud_architecture", currentDemand: 88, futureDemand: 95, growthRate: 25, importance: 92 },
      { skillId: "s_python", currentDemand: 92, futureDemand: 90, growthRate: 12, importance: 88 },
      { skillId: "s_cybersecurity", currentDemand: 75, futureDemand: 88, growthRate: 28, importance: 85 }
    ],
    workforceCapability: [
      { skillId: "s_genai", availableCapability: 45, proficiencyDistribution: { foundation: 50, core: 35, advanced: 15 }, workforceCoverage: 25 },
      { skillId: "s_backend_dev", availableCapability: 85, proficiencyDistribution: { foundation: 20, core: 50, advanced: 30 }, workforceCoverage: 80 },
      { skillId: "s_cloud_architecture", availableCapability: 65, proficiencyDistribution: { foundation: 35, core: 45, advanced: 20 }, workforceCoverage: 60 },
      { skillId: "s_python", availableCapability: 90, proficiencyDistribution: { foundation: 15, core: 55, advanced: 30 }, workforceCoverage: 85 },
      { skillId: "s_cybersecurity", availableCapability: 55, proficiencyDistribution: { foundation: 40, core: 45, advanced: 15 }, workforceCoverage: 45 }
    ],
    trainingSupply: [
      { programId: "tp_fullstack_ai", capacity: 4500, relevantSkills: ["s_genai", "s_react", "s_backend_dev"] },
      { programId: "tp_backend_microservices", capacity: 6000, relevantSkills: ["s_backend_dev", "s_sql"] },
      { programId: "tp_cloud_devops_gitops", capacity: 3200, relevantSkills: ["s_cloud_architecture", "s_docker_k8s"] }
    ]
  },
  {
    id: "reg_silicon_valley",
    name: "Silicon Valley Tech Bay",
    country: "USA",
    stateOrProvince: "California",
    workforceSize: "850,000",
    description: "Global epicenter for AI research, venture-backed scaling, advanced cloud architecture, and systems engineering.",
    skillDemand: [
      { skillId: "s_genai", currentDemand: 95, futureDemand: 99, growthRate: 40, importance: 98 },
      { skillId: "s_system_design", currentDemand: 92, futureDemand: 95, growthRate: 20, importance: 94 },
      { skillId: "s_machine_learning", currentDemand: 90, futureDemand: 96, growthRate: 22, importance: 92 },
      { skillId: "s_cloud_architecture", currentDemand: 90, futureDemand: 92, growthRate: 15, importance: 90 }
    ],
    workforceCapability: [
      { skillId: "s_genai", availableCapability: 75, proficiencyDistribution: { foundation: 20, core: 45, advanced: 35 }, workforceCoverage: 55 },
      { skillId: "s_system_design", availableCapability: 88, proficiencyDistribution: { foundation: 15, core: 45, advanced: 40 }, workforceCoverage: 75 },
      { skillId: "s_machine_learning", availableCapability: 82, proficiencyDistribution: { foundation: 20, core: 50, advanced: 30 }, workforceCoverage: 70 },
      { skillId: "s_cloud_architecture", availableCapability: 85, proficiencyDistribution: { foundation: 20, core: 50, advanced: 30 }, workforceCoverage: 75 }
    ],
    trainingSupply: [
      { programId: "tp_fullstack_ai", capacity: 2500, relevantSkills: ["s_genai", "s_python"] },
      { programId: "tp_cloud_devops_gitops", capacity: 2000, relevantSkills: ["s_cloud_architecture", "s_docker_k8s"] }
    ]
  },
  {
    id: "reg_pune",
    name: "Pune IT & Automotive Software Hub",
    country: "India",
    stateOrProvince: "Maharashtra",
    workforceSize: "650,000",
    description: "Rapidly growing software and engineering cluster with strong backend, cybersecurity, and cloud migration demand.",
    skillDemand: [
      { skillId: "s_backend_dev", currentDemand: 90, futureDemand: 88, growthRate: 14, importance: 88 },
      { skillId: "s_cybersecurity", currentDemand: 80, futureDemand: 92, growthRate: 30, importance: 90 },
      { skillId: "s_sql", currentDemand: 88, futureDemand: 82, growthRate: 8, importance: 82 },
      { skillId: "s_cloud_architecture", currentDemand: 75, futureDemand: 90, growthRate: 28, importance: 86 }
    ],
    workforceCapability: [
      { skillId: "s_backend_dev", availableCapability: 80, proficiencyDistribution: { foundation: 25, core: 55, advanced: 20 }, workforceCoverage: 75 },
      { skillId: "s_cybersecurity", availableCapability: 42, proficiencyDistribution: { foundation: 50, core: 35, advanced: 15 }, workforceCoverage: 35 },
      { skillId: "s_sql", availableCapability: 85, proficiencyDistribution: { foundation: 20, core: 60, advanced: 20 }, workforceCoverage: 80 },
      { skillId: "s_cloud_architecture", availableCapability: 50, proficiencyDistribution: { foundation: 45, core: 40, advanced: 15 }, workforceCoverage: 45 }
    ],
    trainingSupply: [
      { programId: "tp_backend_microservices", capacity: 4000, relevantSkills: ["s_backend_dev", "s_sql"] },
      { programId: "tp_cybersecurity_zerotrust", capacity: 1800, relevantSkills: ["s_cybersecurity"] }
    ]
  },
  {
    id: "reg_london",
    name: "London Financial Tech Belt",
    country: "UK",
    stateOrProvince: "Greater London",
    workforceSize: "720,000",
    description: "FinTech and quantitative trading center with high demand for zero-trust cybersecurity, low-latency streaming pipelines, and regulatory compliance AI.",
    skillDemand: [
      { skillId: "s_cybersecurity", currentDemand: 92, futureDemand: 96, growthRate: 24, importance: 96 },
      { skillId: "s_data_pipelines", currentDemand: 88, futureDemand: 94, growthRate: 22, importance: 90 },
      { skillId: "s_python", currentDemand: 90, futureDemand: 88, growthRate: 10, importance: 85 }
    ],
    workforceCapability: [
      { skillId: "s_cybersecurity", availableCapability: 70, proficiencyDistribution: { foundation: 25, core: 50, advanced: 25 }, workforceCoverage: 60 },
      { skillId: "s_data_pipelines", availableCapability: 68, proficiencyDistribution: { foundation: 30, core: 50, advanced: 20 }, workforceCoverage: 55 },
      { skillId: "s_python", availableCapability: 88, proficiencyDistribution: { foundation: 15, core: 55, advanced: 30 }, workforceCoverage: 80 }
    ],
    trainingSupply: [
      { programId: "tp_cybersecurity_zerotrust", capacity: 2200, relevantSkills: ["s_cybersecurity"] },
      { programId: "tp_data_ml_engineering", capacity: 1800, relevantSkills: ["s_data_pipelines", "s_python"] }
    ]
  },
  {
    id: "reg_tokyo",
    name: "Tokyo AI & Robotics Zone",
    country: "Japan",
    stateOrProvince: "Tokyo Metropolis",
    workforceSize: "900,000",
    description: "Leading industrial AI, NLP, and systems automation cluster accelerating digital transformation and enterprise GenAI adoption.",
    skillDemand: [
      { skillId: "s_nlp", currentDemand: 85, futureDemand: 94, growthRate: 26, importance: 92 },
      { skillId: "s_machine_learning", currentDemand: 88, futureDemand: 92, growthRate: 18, importance: 90 },
      { skillId: "s_system_design", currentDemand: 82, futureDemand: 88, growthRate: 16, importance: 85 }
    ],
    workforceCapability: [
      { skillId: "s_nlp", availableCapability: 60, proficiencyDistribution: { foundation: 35, core: 45, advanced: 20 }, workforceCoverage: 50 },
      { skillId: "s_machine_learning", availableCapability: 72, proficiencyDistribution: { foundation: 25, core: 50, advanced: 25 }, workforceCoverage: 62 },
      { skillId: "s_system_design", availableCapability: 78, proficiencyDistribution: { foundation: 20, core: 55, advanced: 25 }, workforceCoverage: 70 }
    ],
    trainingSupply: [
      { programId: "tp_nlp_clinical_ai", capacity: 1500, relevantSkills: ["s_nlp", "s_python"] }
    ]
  },
  {
    id: "reg_berlin",
    name: "Berlin Scaleup Hub",
    country: "Germany",
    stateOrProvince: "Berlin",
    workforceSize: "480,000",
    description: "Vibrant European SaaS and startup ecosystem with high demand for full-stack React developers, cloud DevOps, and open-source GenAI systems.",
    skillDemand: [
      { skillId: "s_react", currentDemand: 92, futureDemand: 88, growthRate: 12, importance: 88 },
      { skillId: "s_devops", currentDemand: 85, futureDemand: 94, growthRate: 25, importance: 92 },
      { skillId: "s_backend_dev", currentDemand: 88, futureDemand: 86, growthRate: 14, importance: 86 }
    ],
    workforceCapability: [
      { skillId: "s_react", availableCapability: 82, proficiencyDistribution: { foundation: 20, core: 55, advanced: 25 }, workforceCoverage: 75 },
      { skillId: "s_devops", availableCapability: 58, proficiencyDistribution: { foundation: 40, core: 45, advanced: 15 }, workforceCoverage: 48 },
      { skillId: "s_backend_dev", availableCapability: 80, proficiencyDistribution: { foundation: 20, core: 55, advanced: 25 }, workforceCoverage: 72 }
    ],
    trainingSupply: [
      { programId: "tp_react_frontend_core", capacity: 2800, relevantSkills: ["s_react", "s_javascript"] },
      { programId: "tp_cloud_devops_gitops", capacity: 1600, relevantSkills: ["s_devops", "s_docker_k8s"] }
    ]
  }
];
