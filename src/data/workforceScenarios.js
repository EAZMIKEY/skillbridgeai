export const WORKFORCE_SCENARIOS = [
  {
    id: "ai-adoption-30",
    name: "AI Adoption +30%",
    description: "Simulates a rapid 30% increase in AI integration across standard engineering and product teams.",
    sector: "Technology",
    impactLevel: "High",
    roleModifiers: {
      "r_ai_engineer": 30,
      "r_data_scientist": 20,
      "r_data_engineer": 15,
      "r_product_mgr": 10,
      "r_frontend": -5 // Shifts to automated generation
    },
    skillModifiers: {
      "s_genai": 35,
      "s_prompt_eng": 40,
      "s_python": 15,
      "s_nlp": 25,
      "s_javascript": -5
    }
  },
  {
    id: "ai-automation-40",
    name: "AI Automation +40%",
    description: "Simulates severe workforce transformation via highly capable agentic AI automating traditional tasks.",
    sector: "Technology",
    impactLevel: "Critical",
    roleModifiers: {
      "r_ai_engineer": 40,
      "r_devops": 15,
      "r_frontend": -20,
      "r_backend": -15
    },
    skillModifiers: {
      "s_genai": 45,
      "s_prompt_eng": 50,
      "s_traditional_qa": -35,
      "s_react": -15,
      "s_php": -25
    }
  },
  {
    id: "cloud-migration-25",
    name: "Cloud Migration +25%",
    description: "Simulates an accelerated push to decommission on-premise infrastructure in favor of cloud-native and edge models.",
    sector: "Infrastructure",
    impactLevel: "Moderate",
    roleModifiers: {
      "r_devops": 25,
      "r_cloud_arch": 30,
      "r_backend": 10,
      "r_security": 15
    },
    skillModifiers: {
      "s_cloud": 28,
      "s_docker": 25,
      "s_edge_computing": 35,
      "s_cybersec": 15,
      "s_cobol": -15
    }
  },
  {
    id: "cybersecurity-push-35",
    name: "Cybersecurity Push +35%",
    description: "Simulates the aftermath of major industry breaches prompting massive defensive re-architectures.",
    sector: "Information Security",
    impactLevel: "High",
    roleModifiers: {
      "r_security": 35,
      "r_devops": 15,
      "r_cloud_arch": 10,
      "r_frontend": -5
    },
    skillModifiers: {
      "s_cybersec": 38,
      "s_rust": 30,
      "s_cloud": 10,
      "s_blockchain": 20
    }
  },
  {
    id: "legacy-sunset-25",
    name: "Legacy Technology Sunset -25%",
    description: "Simulates an aggressively mandated phase-out of legacy backend systems (PHP, Perl, COBOL).",
    sector: "Financial & Tech",
    impactLevel: "Moderate",
    roleModifiers: {
      "r_backend": 15,
      "r_data_engineer": 20
    },
    skillModifiers: {
      "s_cobol": -40,
      "s_php": -30,
      "s_perl": -30,
      "s_go": 25,
      "s_rust": 20,
      "s_python": 10
    }
  }
];
