/**
 * Training / Curriculum Programs Prototype Dataset
 * 
 * Fictional but realistic institutions & providers:
 * - Apex Tech Academy
 * - Quantum Cloud Institute
 * - Meridian AI Institute
 * - CyberGrid Security Academy
 * - Atlas Developer Institute
 * - BioData Systems Academy
 * - NextGen Software Institute
 * - CloudScale Learning Center
 */

export const TRAINING_PROGRAMS = [
  {
    id: "tp_fullstack_ai",
    name: "Applied Full-Stack & Generative AI Engineering",
    provider: "Meridian AI Institute",
    domain: "AI / GenAI",
    level: "Advanced",
    duration: "16 Weeks",
    deliveryMode: "Blended / Hands-on Labs",
    description: "Intensive 16-week curriculum covering modern React frontend development, Node.js backend infrastructure, vector databases, RAG architecture, and GenAI model deployment.",
    coveredSkills: [
      { skillId: "s_react", coverageLevel: 90, depth: 85, practicalExposure: 90 },
      { skillId: "s_javascript", coverageLevel: 95, depth: 90, practicalExposure: 95 },
      { skillId: "s_backend_dev", coverageLevel: 85, depth: 80, practicalExposure: 85 },
      { skillId: "s_genai", coverageLevel: 80, depth: 75, practicalExposure: 80 },
      { skillId: "s_python", coverageLevel: 75, depth: 70, practicalExposure: 70 }
    ],
    prerequisiteSkills: ["s_javascript", "s_html_css"],
    projectComponents: [
      "Real-time collaborative document editor",
      "Agentic Enterprise RAG Query System with vector retrieval"
    ],
    assessmentMethods: ["Code reviews", "Benchmark test suite", "Capstone project submission"],
    industryAlignment: {
      targetRoles: ["r_backend", "r_ai_engineer", "r_fullstack"],
      targetSectors: ["Enterprise Software", "AI / Tech"],
      currentDemandFocus: ["React", "Node.js", "Python"],
      futureDemandFocus: ["GenAI", "Agentic Workflows"]
    },
    curriculumVersion: "2026.1",
    lastUpdated: "2026-02-15",
    status: "Active"
  },
  {
    id: "tp_backend_microservices",
    name: "Enterprise Microservices & Cloud Infrastructure",
    provider: "Apex Tech Academy",
    domain: "Backend Engineering",
    level: "Intermediate",
    duration: "12 Weeks",
    deliveryMode: "Online / Self-Paced Labs",
    description: "Comprehensive backend training focused on REST API architecture, distributed caching, database indexing, system design patterns, and containerized deployment.",
    coveredSkills: [
      { skillId: "s_backend_dev", coverageLevel: 95, depth: 90, practicalExposure: 95 },
      { skillId: "s_sql", coverageLevel: 90, depth: 85, practicalExposure: 85 },
      { skillId: "s_system_design", coverageLevel: 85, depth: 80, practicalExposure: 80 },
      { skillId: "s_rest_apis", coverageLevel: 95, depth: 90, practicalExposure: 95 },
      { skillId: "s_docker_k8s", coverageLevel: 70, depth: 65, practicalExposure: 70 }
    ],
    prerequisiteSkills: ["s_python", "s_sql"],
    projectComponents: [
      "High-availability API gateway with rate limiting",
      "Distributed cache node cluster with consistent hashing"
    ],
    assessmentMethods: ["Load test evaluation", "System architecture defense"],
    industryAlignment: {
      targetRoles: ["r_backend", "r_devops"],
      targetSectors: ["Financial Technology", "E-Commerce"],
      currentDemandFocus: ["Backend Systems", "SQL", "REST APIs"],
      futureDemandFocus: ["System Design", "Cloud Infrastructure"]
    },
    curriculumVersion: "2025.4",
    lastUpdated: "2025-11-20",
    status: "Active"
  },
  {
    id: "tp_cloud_devops_gitops",
    name: "Cloud Architecture & Multi-Region GitOps",
    provider: "Quantum Cloud Institute",
    domain: "Cloud Engineering",
    level: "Advanced",
    duration: "14 Weeks",
    deliveryMode: "Hands-on Virtual Labs",
    description: "Master multi-cloud architecture, Kubernetes cluster management, Infrastructure-as-Code (IaC), GitOps pipelines, and zero-downtime deployment strategies.",
    coveredSkills: [
      { skillId: "s_cloud_architecture", coverageLevel: 95, depth: 90, practicalExposure: 90 },
      { skillId: "s_docker_k8s", coverageLevel: 90, depth: 85, practicalExposure: 95 },
      { skillId: "s_devops", coverageLevel: 90, depth: 85, practicalExposure: 90 },
      { skillId: "s_system_design", coverageLevel: 75, depth: 70, practicalExposure: 75 }
    ],
    prerequisiteSkills: ["s_backend_dev", "s_linux"],
    projectComponents: [
      "Automated multi-region Kubernetes cluster deployment via Helm & GitOps",
      "Cloud cost optimization & horizontal autoscaling pipeline"
    ],
    assessmentMethods: ["Chaos engineering simulation", "Infrastructure audit"],
    industryAlignment: {
      targetRoles: ["r_devops", "r_cloud_architect"],
      targetSectors: ["Cloud Infrastructure", "SaaS"],
      currentDemandFocus: ["AWS/Cloud", "Docker", "Kubernetes"],
      futureDemandFocus: ["GitOps", "Multi-Cloud Resilience"]
    },
    curriculumVersion: "2026.1",
    lastUpdated: "2026-01-10",
    status: "Active"
  },
  {
    id: "tp_cybersecurity_zerotrust",
    name: "Zero-Trust Security & Offensive Risk Engineering",
    provider: "CyberGrid Security Academy",
    domain: "Cybersecurity",
    level: "Intermediate",
    duration: "10 Weeks",
    deliveryMode: "Interactive Cyber Range",
    description: "Hands-on cybersecurity program covering threat modeling, OAuth2/OIDC identity management, API security, vulnerability remediation, and Zero-Trust architecture.",
    coveredSkills: [
      { skillId: "s_cybersecurity", coverageLevel: 95, depth: 90, practicalExposure: 95 },
      { skillId: "s_backend_dev", coverageLevel: 75, depth: 70, practicalExposure: 75 },
      { skillId: "s_rest_apis", coverageLevel: 80, depth: 75, practicalExposure: 80 }
    ],
    prerequisiteSkills: ["s_networking", "s_backend_dev"],
    projectComponents: [
      "Zero-Trust Identity & RBAC enforcement suite",
      "OWASP API Security vulnerability penetration test"
    ],
    assessmentMethods: ["Cyber range capture-the-flag", "Security audit documentation"],
    industryAlignment: {
      targetRoles: ["r_cybersecurity", "r_backend"],
      targetSectors: ["Cybersecurity", "FinTech", "Healthcare"],
      currentDemandFocus: ["Cybersecurity", "Network Security"],
      futureDemandFocus: ["Zero-Trust Security", "API Security"]
    },
    curriculumVersion: "2025.3",
    lastUpdated: "2025-10-15",
    status: "Active"
  },
  {
    id: "tp_data_ml_engineering",
    name: "Data Engineering & Scalable Machine Learning",
    provider: "Atlas Developer Institute",
    domain: "Data Engineering",
    level: "Advanced",
    duration: "16 Weeks",
    deliveryMode: "Blended Learning",
    description: "Learn high-throughput data pipeline engineering, streaming data architectures, SQL optimization, and production machine learning model deployment.",
    coveredSkills: [
      { skillId: "s_python", coverageLevel: 90, depth: 85, practicalExposure: 90 },
      { skillId: "s_sql", coverageLevel: 95, depth: 90, practicalExposure: 95 },
      { skillId: "s_machine_learning", coverageLevel: 85, depth: 80, practicalExposure: 80 },
      { skillId: "s_data_pipelines", coverageLevel: 90, depth: 85, practicalExposure: 90 }
    ],
    prerequisiteSkills: ["s_python", "s_math_stats"],
    projectComponents: [
      "Real-time financial fraud detection streaming data pipeline",
      "Automated ML model retraining and feature store engine"
    ],
    assessmentMethods: ["Pipeline benchmark evaluation", "Model precision audit"],
    industryAlignment: {
      targetRoles: ["r_data_engineer", "r_ai_engineer"],
      targetSectors: ["Finance", "E-Commerce", "Analytics"],
      currentDemandFocus: ["Python", "SQL", "Data Pipelines"],
      futureDemandFocus: ["Streaming Analytics", "Feature Stores"]
    },
    curriculumVersion: "2026.1",
    lastUpdated: "2026-01-28",
    status: "Active"
  },
  {
    id: "tp_nlp_clinical_ai",
    name: "Applied Natural Language Processing & Clinical AI",
    provider: "BioData Systems Academy",
    domain: "NLP",
    level: "Advanced",
    duration: "12 Weeks",
    deliveryMode: "Online Project Labs",
    description: "Specialized NLP training focusing on text parsing, entity extraction, transformer models, BERT fine-tuning, and clinical/medical record extraction.",
    coveredSkills: [
      { skillId: "s_nlp", coverageLevel: 95, depth: 90, practicalExposure: 90 },
      { skillId: "s_python", coverageLevel: 90, depth: 85, practicalExposure: 90 },
      { skillId: "s_machine_learning", coverageLevel: 85, depth: 80, practicalExposure: 80 },
      { skillId: "s_genai", coverageLevel: 70, depth: 65, practicalExposure: 70 }
    ],
    prerequisiteSkills: ["s_python", "s_machine_learning"],
    projectComponents: [
      "Clinical NLP medical record entity extraction engine",
      "Semantic search engine over unstructured research papers"
    ],
    assessmentMethods: ["NER extraction benchmark F1 evaluation", "Technical paper presentation"],
    industryAlignment: {
      targetRoles: ["r_nlp_specialist", "r_ai_engineer"],
      targetSectors: ["HealthTech", "Research", "AI"],
      currentDemandFocus: ["NLP", "Python", "Transformers"],
      futureDemandFocus: ["Clinical AI", "GenAI Integration"]
    },
    curriculumVersion: "2025.4",
    lastUpdated: "2025-12-05",
    status: "Active"
  },
  {
    id: "tp_react_frontend_core",
    name: "Modern Frontend Web Development with React",
    provider: "NextGen Software Institute",
    domain: "Software Engineering",
    level: "Intermediate",
    duration: "8 Weeks",
    deliveryMode: "Self-Paced / Mentored",
    description: "Foundational to intermediate frontend engineering program teaching HTML5, CSS3, JavaScript ES6+, React state management, and API integration.",
    coveredSkills: [
      { skillId: "s_react", coverageLevel: 90, depth: 85, practicalExposure: 90 },
      { skillId: "s_javascript", coverageLevel: 90, depth: 85, practicalExposure: 90 },
      { skillId: "s_html_css", coverageLevel: 95, depth: 90, practicalExposure: 95 },
      { skillId: "s_rest_apis", coverageLevel: 75, depth: 70, practicalExposure: 75 }
    ],
    prerequisiteSkills: ["s_html_css"],
    projectComponents: [
      "Interactive data dashboard with custom chart visualizations",
      "E-commerce product catalog with state persistent cart"
    ],
    assessmentMethods: ["UI accessibility audit", "Code review"],
    industryAlignment: {
      targetRoles: ["r_frontend", "r_fullstack"],
      targetSectors: ["Web Software", "SaaS"],
      currentDemandFocus: ["React", "JavaScript", "HTML/CSS"],
      futureDemandFocus: ["Frontend Performance", "Design Systems"]
    },
    curriculumVersion: "2025.2",
    lastUpdated: "2025-08-10",
    status: "Active"
  },
  {
    id: "tp_legacy_software_eng",
    name: "Traditional Software Engineering Foundations",
    provider: "CloudScale Learning Center",
    domain: "Software Engineering",
    level: "Foundation",
    duration: "10 Weeks",
    deliveryMode: "Lectures & Lab Work",
    description: "Traditional computer science software engineering course focusing on procedural programming, basic database queries, and static web page creation.",
    coveredSkills: [
      { skillId: "s_html_css", coverageLevel: 80, depth: 75, practicalExposure: 70 },
      { skillId: "s_javascript", coverageLevel: 60, depth: 55, practicalExposure: 50 },
      { skillId: "s_sql", coverageLevel: 65, depth: 60, practicalExposure: 55 }
    ],
    prerequisiteSkills: [],
    projectComponents: [
      "Static personal portfolio website",
      "Basic SQL database inventory table"
    ],
    assessmentMethods: ["Written exam", "Simple coding assignment"],
    industryAlignment: {
      targetRoles: ["r_frontend"],
      targetSectors: ["IT Services"],
      currentDemandFocus: ["Basic HTML/CSS", "SQL"],
      futureDemandFocus: ["Low Future Alignment"]
    },
    curriculumVersion: "2024.1",
    lastUpdated: "2024-03-01",
    status: "Active"
  }
];
