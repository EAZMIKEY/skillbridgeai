import { SKILLS_DATA } from "./skillModel";

// Pre-defined core prototype roles
export const ROLES_DATA = [
  { id: "r_ai_engineer", name: "AI Engineer", type: "Role" },
  { id: "r_data_scientist", name: "Data Scientist", type: "Role" },
  { id: "r_devops", name: "DevOps Engineer", type: "Role" },
  { id: "r_backend", name: "Backend Developer", type: "Role" },
  { id: "r_frontend", name: "Frontend Developer", type: "Role" },
  { id: "r_data_engineer", name: "Data Engineer", type: "Role" },
  { id: "r_blockchain", name: "Blockchain Developer", type: "Role" },
  { id: "r_cloud_arch", name: "Cloud Architect", type: "Role" },
  { id: "r_product_mgr", name: "Product Manager", type: "Role" },
  { id: "r_security", name: "Security Analyst", type: "Role" }
];

// Relationships representation:
// source: ID of a role or skill
// target: ID of a skill
// type: "requires" (role -> skill) | "related" (skill -> skill)
export const SKILL_RELATIONS = [
  // AI Engineer connects
  { source: "r_ai_engineer", target: "s_genai", type: "requires", explanation: "AI Engineers need Generative AI competencies to build modern NLP and image systems." },
  { source: "r_ai_engineer", target: "s_python", type: "requires", explanation: "Python is the foundational language for AI computing and model inference." },
  { source: "r_ai_engineer", target: "s_nlp", type: "requires", explanation: "Natural Language Processing is a core domain of AI engineering." },
  
  // Data Scientist connects
  { source: "r_data_scientist", target: "s_python", type: "requires", explanation: "Data Scientists rely heavily on Python for data analysis and scikit-learn models." },
  { source: "r_data_scientist", target: "s_data_eng", type: "requires", explanation: "Understanding Data Engineering provides a baseline for ETL workloads." },
  { source: "r_data_scientist", target: "s_sql", type: "requires", explanation: "SQL is essential for querying raw datasets before analysis." },

  // DevOps Engineers
  { source: "r_devops", target: "s_cloud", type: "requires", explanation: "DevOps Engineers primarily deploy onto Cloud Computing environments." },
  { source: "r_devops", target: "s_docker", type: "requires", explanation: "Containerization through Docker is the backbone of deployment orchestration." },
  { source: "r_devops", target: "s_cybersec", type: "requires", explanation: "Security must be integrated deeply into DevOps pipelines (DevSecOps)." },

  // Backend Developer
  { source: "r_backend", target: "s_python", type: "requires", explanation: "Used widely in backend API services (Django/FastAPI)." },
  { source: "r_backend", target: "s_sql", type: "requires", explanation: "Backend systems must robustly interact with relational databases." },
  { source: "r_backend", target: "s_go", type: "requires", explanation: "Go provides highly concurrent and performant backend services." },
  { source: "r_backend", target: "s_rust", type: "requires", explanation: "Rust provides memory-safe and incredibly fast low-level backend capability." },

  // Frontend Developer
  { source: "r_frontend", target: "s_javascript", type: "requires", explanation: "The foundational language of all frontend web architecture." },
  { source: "r_frontend", target: "s_react", type: "requires", explanation: "React.js is the dominant component framework for frontend interfaces." },
  { source: "r_frontend", target: "s_typescript", type: "requires", explanation: "TypeScript offers type-safety for complex frontend logic." },
  { source: "r_frontend", target: "s_ui_ux", type: "requires", explanation: "Frontend Developers must understand UI/UX logic for proper layout execution." },

  // Data Engineer
  { source: "r_data_engineer", target: "s_data_eng", type: "requires", explanation: "Core capability for designing data pipelines and ETL workflows." },
  { source: "r_data_engineer", target: "s_sql", type: "requires", explanation: "Essential for querying, transforming, and structuring large datasets." },
  { source: "r_data_engineer", target: "s_cloud", type: "requires", explanation: "Data pipelines operate heavily on cloud data warehouses." },
  { source: "r_data_engineer", target: "s_python", type: "requires", explanation: "Python scripts orchestrate data processing frameworks." },

  // Blockchain Developer
  { source: "r_blockchain", target: "s_blockchain", type: "requires", explanation: "Smart contract logic and decentralized protocol execution." },
  { source: "r_blockchain", target: "s_rust", type: "requires", explanation: "Rust provides memory-safe and high-performance smart contract development." },
  { source: "r_blockchain", target: "s_go", type: "requires", explanation: "Go powers major distributed ledger nodes and blockchain infrastructure." },
  { source: "r_blockchain", target: "s_cybersec", type: "requires", explanation: "Cryptographic auditing and security are paramount in smart contracts." },

  // Cloud Architect
  { source: "r_cloud_arch", target: "s_cloud", type: "requires", explanation: "Designing scalable, resilient enterprise cloud infrastructure." },
  { source: "r_cloud_arch", target: "s_edge_computing", type: "requires", explanation: "Integrating low-latency edge nodes into cloud topologies." },
  { source: "r_cloud_arch", target: "s_docker", type: "requires", explanation: "Container orchestration is standard across cloud infrastructure." },
  { source: "r_cloud_arch", target: "s_cybersec", type: "requires", explanation: "Zero-trust cloud security and compliance architecture." },

  // Product Manager
  { source: "r_product_mgr", target: "s_agile", type: "requires", explanation: "Agile methodologies drive product roadmap planning and sprints." },
  { source: "r_product_mgr", target: "s_ui_ux", type: "requires", explanation: "Product managers evaluate user journeys and interface usability." },
  { source: "r_product_mgr", target: "s_prompt_eng", type: "requires", explanation: "Utilizing AI workflows to accelerate product discovery and feature specs." },

  // Security Analyst
  { source: "r_security", target: "s_cybersec", type: "requires", explanation: "Primary domain expertise for threat analysis and security controls." },
  { source: "r_security", target: "s_cloud", type: "requires", explanation: "Securing cloud workloads and identity management." },
  { source: "r_security", target: "s_sql", type: "requires", explanation: "Analyzing database access logs and security event records." },

  // Skill -> Skill relationships (Related / Supporting)
  { source: "s_genai", target: "s_prompt_eng", type: "related", explanation: "Prompt Engineering is the primary operational mechanism for utilizing Generative AI models." },
  { source: "s_cloud", target: "s_edge_computing", type: "related", explanation: "Edge Computing complements Cloud architectures for low-latency distribution." },
  { source: "s_javascript", target: "s_typescript", type: "related", explanation: "TypeScript is a strict syntactical superset of JavaScript." },
  { source: "s_react", target: "s_javascript", type: "related", explanation: "React relies exclusively on underlying JavaScript execution." },
  { source: "s_docker", target: "s_cloud", type: "related", explanation: "Containers are the primary delivery method for cloud topologies." },
  { source: "s_agile", target: "s_traditional_qa", type: "related", explanation: "Agile methodologies often transition teams away from isolated Traditional QA." },
  { source: "s_rust", target: "s_blockchain", type: "related", explanation: "Rust is highly preferred in modern blockchain layers like Solana." },
  { source: "s_php", target: "s_sql", type: "related", explanation: "Legacy PHP applications are deeply integrated with strict SQL database structures." },
];
