/**
 * Industry Challenge Marketplace Prototype Dataset
 * 
 * Fictional but realistic industry organizations:
 * - Meridian AI Labs
 * - NovaCloud Systems
 * - Vertex Data
 * - SecureGrid
 * - Atlas Commerce
 * - Nexus Cyberworks
 * - Quantum Scale Labs
 * - BioPulse Analytics
 */

export const INDUSTRY_CHALLENGES = [
  {
    id: "ic_fraud_detection",
    title: "Real-Time Financial Fraud Detection Pipeline",
    organization: "Meridian AI Labs",
    sector: "Financial Technology",
    domain: "Data / AI",
    description: "Design and implement a high-throughput streaming fraud detection pipeline capable of processing 10,000 transactions/sec and evaluating ML risk anomaly scores in under 50ms.",
    challengeType: "Production Engineering",
    difficulty: "Advanced",
    requiredSkills: [
      { skillId: "s_python", requiredCapability: 85, importance: 90 },
      { skillId: "s_sql", requiredCapability: 80, importance: 85 },
      { skillId: "s_machine_learning", requiredCapability: 80, importance: 95 },
      { skillId: "s_system_design", requiredCapability: 75, importance: 80 }
    ],
    preferredSkills: [
      { skillId: "s_cloud_architecture", requiredCapability: 70, importance: 60 },
      { skillId: "s_data_pipelines", requiredCapability: 75, importance: 70 }
    ],
    emergingSkills: [
      { skillId: "s_genai", requiredCapability: 60, importance: 50 }
    ],
    expectedOutcomes: [
      "Stream processing pipeline with event-driven architecture",
      "Low-latency anomaly scoring model with high precision",
      "Automated feature store and real-time monitoring dashboard"
    ],
    estimatedEffort: "3 weeks (30 hours total)",
    duration: "3 weeks",
    deadline: "Open Enrollment",
    industryDemandContext: "Financial institutions urgently require engineers who can bridge data engineering with low-latency ML anomaly scoring.",
    verificationCriteria: [
      "Functional pipeline throughput >= 5,000 ops/sec",
      "Model inference latency under 50ms",
      "Automated integration test suite",
      "System architecture diagram and threat analysis"
    ],
    status: "Active"
  },
  {
    id: "ic_llm_rag_agent",
    title: "Enterprise Knowledge RAG & Agentic Query System",
    organization: "NovaCloud Systems",
    sector: "Enterprise Software",
    domain: "AI / GenAI",
    description: "Build an enterprise-grade Retrieval-Augmented Generation (RAG) system with agentic self-correction, hybrid vector/keyword search, and hallucination evaluation metrics.",
    challengeType: "AI System Architecture",
    difficulty: "Advanced",
    requiredSkills: [
      { skillId: "s_genai", requiredCapability: 85, importance: 95 },
      { skillId: "s_python", requiredCapability: 85, importance: 90 },
      { skillId: "s_nlp", requiredCapability: 80, importance: 85 }
    ],
    preferredSkills: [
      { skillId: "s_backend_dev", requiredCapability: 75, importance: 70 },
      { skillId: "s_system_design", requiredCapability: 70, importance: 65 }
    ],
    emergingSkills: [
      { skillId: "s_genai", requiredCapability: 90, importance: 90 }
    ],
    expectedOutcomes: [
      "Production-ready vector retrieval & reranking pipeline",
      "Agentic reflection step to detect and eliminate hallucinations",
      "Evaluation suite reporting precision, recall, and answer faithfulness"
    ],
    estimatedEffort: "2.5 weeks (25 hours total)",
    duration: "2.5 weeks",
    deadline: "Open Enrollment",
    industryDemandContext: "Enterprise demand for GenAI developers who understand evaluation benchmarks and agentic accuracy is growing by over 40% year-over-year.",
    verificationCriteria: [
      "Retrieval precision@k >= 0.85 on benchmark dataset",
      "Faithfulness evaluation score >= 90%",
      "RESTful API service implementation with swagger docs",
      "Evaluation report comparing dense vs hybrid search"
    ],
    status: "Active"
  },
  {
    id: "ic_microservices_gateway",
    title: "High-Availability API Gateway & Rate Limiting Engine",
    organization: "Atlas Commerce",
    sector: "E-Commerce Technology",
    domain: "Backend Engineering",
    description: "Architect a resilient API Gateway handling authentication, token-bucket rate limiting, circuit breaking, and dynamic route distribution for microservice architectures.",
    challengeType: "Distributed Infrastructure",
    difficulty: "Intermediate",
    requiredSkills: [
      { skillId: "s_backend_dev", requiredCapability: 85, importance: 95 },
      { skillId: "s_system_design", requiredCapability: 75, importance: 85 },
      { skillId: "s_rest_apis", requiredCapability: 85, importance: 90 }
    ],
    preferredSkills: [
      { skillId: "s_cloud_architecture", requiredCapability: 70, importance: 60 }
    ],
    emergingSkills: [
      { skillId: "s_devops", requiredCapability: 65, importance: 50 }
    ],
    expectedOutcomes: [
      "Distributed rate limiter using Redis / memory store",
      "Circuit breaker implementation with graceful fallback responses",
      "Load balancing benchmark reports under stress conditions"
    ],
    estimatedEffort: "2 weeks (20 hours total)",
    duration: "2 weeks",
    deadline: "Open Enrollment",
    industryDemandContext: "Backend engineers capable of building fault-tolerant gateway infrastructure represent a top priority across e-commerce platforms.",
    verificationCriteria: [
      "Rate limiter correctly throttles excessive requests (HTTP 429)",
      "Circuit breaker trips under simulated 50% backend failure rate",
      "Load test demonstrating zero unhandled exceptions under 2,000 QPS",
      "Comprehensive benchmark report"
    ],
    status: "Active"
  },
  {
    id: "ic_zero_trust_iam",
    title: "Zero-Trust Identity & RBAC Enforcement Suite",
    organization: "SecureGrid",
    sector: "Cybersecurity",
    domain: "Cybersecurity",
    description: "Implement a Zero-Trust identity verification layer with OAuth2/OIDC, granular Role-Based Access Control (RBAC), and continuous session security evaluation.",
    challengeType: "Security Engineering",
    difficulty: "Intermediate",
    requiredSkills: [
      { skillId: "s_cybersecurity", requiredCapability: 85, importance: 95 },
      { skillId: "s_backend_dev", requiredCapability: 75, importance: 80 },
      { skillId: "s_rest_apis", requiredCapability: 80, importance: 80 }
    ],
    preferredSkills: [
      { skillId: "s_system_design", requiredCapability: 70, importance: 65 }
    ],
    emergingSkills: [],
    expectedOutcomes: [
      "Zero-Trust authentication provider with short-lived JWTs & refresh token rotation",
      "Granular RBAC middleware protecting sensitive API endpoints",
      "Security audit log trail with anomaly alerting"
    ],
    estimatedEffort: "2 weeks (18 hours total)",
    duration: "2 weeks",
    deadline: "Open Enrollment",
    industryDemandContext: "Zero-trust architectures are now mandatory compliance standards across healthcare, government, and finance technology sectors.",
    verificationCriteria: [
      "Passes OWASP API Security Top 10 vulnerability audit",
      "Automated unit tests validating permission denial on invalid tokens",
      "Detailed threat model analysis document"
    ],
    status: "Active"
  },
  {
    id: "ic_cloud_k8s_gitops",
    title: "Automated Multi-Region Kubernetes GitOps Deployment",
    organization: "Vertex Data",
    sector: "Cloud Infrastructure",
    domain: "Cloud",
    description: "Develop an automated Infrastructure-as-Code (IaC) and GitOps pipeline deploying resilient containerized workloads across multi-region Kubernetes clusters with auto-scaling.",
    challengeType: "Cloud Engineering",
    difficulty: "Advanced",
    requiredSkills: [
      { skillId: "s_cloud_architecture", requiredCapability: 85, importance: 95 },
      { skillId: "s_docker_k8s", requiredCapability: 85, importance: 90 },
      { skillId: "s_devops", requiredCapability: 80, importance: 85 }
    ],
    preferredSkills: [
      { skillId: "s_system_design", requiredCapability: 75, importance: 70 }
    ],
    emergingSkills: [],
    expectedOutcomes: [
      "Declarative Kubernetes deployment manifests with Helm/Kustomize",
      "GitOps continuous deployment workflow using automated cluster syncing",
      "Horizontal Pod Autoscaling (HPA) configured to traffic spikes"
    ],
    estimatedEffort: "3 weeks (28 hours total)",
    duration: "3 weeks",
    deadline: "Open Enrollment",
    industryDemandContext: "Organizations migrating to multi-cloud setups require cloud engineers proficient in declarative GitOps workflows.",
    verificationCriteria: [
      "Cluster auto-sync executes cleanly on Git commit",
      "HPA triggers scale-out upon 80% CPU load threshold",
      "Zero-downtime rolling update verification test"
    ],
    status: "Active"
  },
  {
    id: "ic_collaborative_workspace",
    title: "Real-Time Collaborative Document Canvas",
    organization: "Nexus Cyberworks",
    sector: "SaaS Application",
    domain: "Full Stack",
    description: "Create a full-stack real-time collaborative editing canvas using WebSockets, Operational Transformation (OT) / CRDTs, and dynamic state synchronization.",
    challengeType: "Full Stack Development",
    difficulty: "Intermediate",
    requiredSkills: [
      { skillId: "s_react", requiredCapability: 85, importance: 90 },
      { skillId: "s_javascript", requiredCapability: 85, importance: 90 },
      { skillId: "s_backend_dev", requiredCapability: 75, importance: 80 }
    ],
    preferredSkills: [
      { skillId: "s_rest_apis", requiredCapability: 75, importance: 70 },
      { skillId: "s_html_css", requiredCapability: 80, importance: 65 }
    ],
    emergingSkills: [],
    expectedOutcomes: [
      "Full-stack React frontend with instant cursor synchronization",
      "WebSocket backend managing concurrent client conflict resolution",
      "Persistent state database storage with revision rollback history"
    ],
    estimatedEffort: "2.5 weeks (24 hours total)",
    duration: "2.5 weeks",
    deadline: "Open Enrollment",
    industryDemandContext: "Modern SaaS web applications demand full-stack developers skilled in real-time client-server synchronization.",
    verificationCriteria: [
      "Concurrent edits by 5 simulated users resolve without state divergence",
      "Reconnection logic handles dropped WebSocket connections cleanly",
      "Clean UI component design with accessible state controls"
    ],
    status: "Active"
  },
  {
    id: "ic_clinical_nlp_extractor",
    title: "Clinical NLP Entity & Insight Extraction Pipeline",
    organization: "BioPulse Analytics",
    sector: "HealthTech & AI",
    domain: "NLP",
    description: "Build an NLP extraction engine that parses unstructured medical reports, categorizes clinical entities, and extracts diagnostic risk indicators with high accuracy.",
    challengeType: "Applied AI / NLP",
    difficulty: "Advanced",
    requiredSkills: [
      { skillId: "s_nlp", requiredCapability: 85, importance: 95 },
      { skillId: "s_python", requiredCapability: 85, importance: 90 },
      { skillId: "s_machine_learning", requiredCapability: 80, importance: 85 }
    ],
    preferredSkills: [
      { skillId: "s_data_pipelines", requiredCapability: 75, importance: 70 }
    ],
    emergingSkills: [
      { skillId: "s_genai", requiredCapability: 75, importance: 80 }
    ],
    expectedOutcomes: [
      "Named Entity Recognition (NER) pipeline trained on clinical domain text",
      "Structured JSON extraction output with confidence scoring",
      "Validation script testing against benchmark medical records"
    ],
    estimatedEffort: "3 weeks (30 hours total)",
    duration: "3 weeks",
    deadline: "Open Enrollment",
    industryDemandContext: "HealthTech companies require specialized NLP developers to digitize and structure massive volumes of unstructured clinical records.",
    verificationCriteria: [
      "F1 score >= 0.88 on medical NER entity extraction test set",
      "Structured output complies with FHIR/JSON schema standard",
      "Executable evaluation script provided"
    ],
    status: "Active"
  },
  {
    id: "ic_distributed_cache_kv",
    title: "In-Memory Distributed Key-Value Store & Consensus",
    organization: "Quantum Scale Labs",
    sector: "Systems & Infrastructure",
    domain: "Software Engineering",
    description: "Develop an in-memory distributed key-value store supporting TTL eviction, consistent hashing partition management, and consensus replication across nodes.",
    challengeType: "Systems Programming",
    difficulty: "Advanced",
    requiredSkills: [
      { skillId: "s_system_design", requiredCapability: 85, importance: 95 },
      { skillId: "s_python", requiredCapability: 80, importance: 80 },
      { skillId: "s_backend_dev", requiredCapability: 80, importance: 85 }
    ],
    preferredSkills: [
      { skillId: "s_cloud_architecture", requiredCapability: 70, importance: 60 }
    ],
    emergingSkills: [],
    expectedOutcomes: [
      "Consistent hashing ring distributing key partitions evenly across 3+ nodes",
      "LRU eviction strategy maintaining peak memory bounds",
      "Resilience testing suite simulating node crashes and rejoin operations"
    ],
    estimatedEffort: "3.5 weeks (35 hours total)",
    duration: "3.5 weeks",
    deadline: "Open Enrollment",
    industryDemandContext: "Core systems engineering roles prioritize candidates who understand distributed consensus, partitioning, and memory management fundamentals.",
    verificationCriteria: [
      "Key distribution variance under 10% across ring nodes",
      "Data consistency maintained through simulated node restart",
      "Benchmark testing proving < 10ms P99 latency"
    ],
    status: "Active"
  }
];
