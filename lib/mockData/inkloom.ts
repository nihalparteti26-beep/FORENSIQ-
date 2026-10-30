export interface BrandFact {
  id: string;
  claim_text: string;
  category: 'Performance' | 'Company' | 'Security' | 'Product' | 'Customer';
  evidence_url: string;
  source_doc: string;
  expiry_date: string;
  version: string;
  owner: string;
  confidence: number;
  status: 'valid' | 'expired' | 'under_review';
  tags: string[];
  embeddingVector?: number[];
}

export interface BrandAsset {
  id: string;
  title: string;
  type: 'Ad' | 'Sales Deck' | 'Blog Post' | 'Landing Page' | 'Email';
  channel: string;
  owner: string;
  status: 'published' | 'in_review' | 'flagged' | 'draft';
  lastUpdated: string;
  dependentFactIds: string[];
  riskLevel: 'Low' | 'Medium' | 'High';
  originDoc: string;
}

export interface AdHistoryItem {
  id: string;
  adNumber: number;
  date: string;
  title: string;
  channel: 'Google Search' | 'LinkedIn' | 'Meta' | 'YouTube' | 'Display';
  toneScore: number; // 0 (hyper-salesy/urgency) to 100 (informative/objective)
  urgencyScore: number; // 0 to 100
  copySnippet: string;
  sentiment: 'Objective' | 'Persuasive' | 'Aggressive Hype' | 'Salesy Drift';
  flagged: boolean;
  authorAgency: string;
}

export interface RuleViolation {
  id: string;
  ruleName: string;
  category: string;
  snippet: string;
  suggestedFix: string;
  sourceDoc: string;
  severity: 'high' | 'medium' | 'low';
}

export const INKLOOM_BRAND_FACTS: BrandFact[] = [
  {
    id: "FACT-001",
    claim_text: "Inkloom saves 25% creative production time for enterprise marketing teams.",
    category: "Performance",
    evidence_url: "https://evidence.inkloom.internal/reports/forrester-tei-2023.pdf",
    source_doc: "Forrester Total Economic Impact Study 2023 (p. 14)",
    expiry_date: "2027-12-31",
    version: "v2.1",
    owner: "Sarah Chen (Head of Product Marketing)",
    confidence: 0.98,
    status: "valid",
    tags: ["efficiency", "time-savings", "enterprise", "forrester"]
  },
  {
    id: "FACT-002",
    claim_text: "Inkloom was founded in 2021 by Elena Rostova and Marcus Vance.",
    category: "Company",
    evidence_url: "https://evidence.inkloom.internal/legal/articles-of-incorporation.pdf",
    source_doc: "Certificate of Incorporation DE-849204",
    expiry_date: "2030-01-01",
    version: "v1.0",
    owner: "Legal & Corporate Registry",
    confidence: 1.0,
    status: "valid",
    tags: ["founding", "history", "leadership"]
  },
  {
    id: "FACT-003",
    claim_text: "SOC-2 Type II Certified with zero customer data retention on AI fine-tuning pipelines.",
    category: "Security",
    evidence_url: "https://trust.inkloom.internal/soc2-type2-audit-2024.pdf",
    source_doc: "A-LIGN SOC-2 Annual Audit Report 2024",
    expiry_date: "2027-04-15",
    version: "v3.0",
    owner: "David Lin (CISO)",
    confidence: 0.99,
    status: "valid",
    tags: ["soc2", "security", "compliance", "privacy"]
  },
  {
    id: "FACT-004",
    claim_text: "Guarantees 99.95% uptime SLA backed by multi-region active-active cloud failover.",
    category: "Product",
    evidence_url: "https://trust.inkloom.internal/sla-agreement-2024.pdf",
    source_doc: "Master Service Agreement Exhibit B",
    expiry_date: "2027-10-01",
    version: "v2.2",
    owner: "DevOps Infrastructure Council",
    confidence: 0.99,
    status: "valid",
    tags: ["sla", "uptime", "reliability"]
  },
  {
    id: "FACT-005",
    claim_text: "Trusted by over 1,200 global brands including 40 of the Fortune 500.",
    category: "Customer",
    evidence_url: "https://evidence.inkloom.internal/customers/q2-2024-audit.pdf",
    source_doc: "Q2 2024 Sales Verified Customer Roster",
    expiry_date: "2027-06-30",
    version: "v4.1",
    owner: "Rachel Kim (VP Revenue Operations)",
    confidence: 0.96,
    status: "valid",
    tags: ["customers", "scale", "fortune500"]
  },
  {
    id: "FACT-006",
    claim_text: "Reduces brand compliance review cycles from 4.2 days to under 18 minutes.",
    category: "Performance",
    evidence_url: "https://evidence.inkloom.internal/metrics/review-latency-benchmarks.pdf",
    source_doc: "Internal Customer Telemetry Benchmark Report 2024",
    expiry_date: "2027-09-30",
    version: "v1.4",
    owner: "Sarah Chen (Product Marketing)",
    confidence: 0.95,
    status: "valid",
    tags: ["review-cycle", "speed", "automation"]
  },
  {
    id: "FACT-007",
    claim_text: "Native integrations with Adobe Creative Cloud, Figma, and Contentful Enterprise.",
    category: "Product",
    evidence_url: "https://evidence.inkloom.internal/integrations/technical-spec-2024.pdf",
    source_doc: "Ecosystem Partner Certification Doc v3",
    expiry_date: "2027-11-15",
    version: "v2.0",
    owner: "Liam Scott (VP Partnerships)",
    confidence: 0.99,
    status: "valid",
    tags: ["integrations", "adobe", "figma", "contentful"]
  },
  {
    id: "FACT-008",
    claim_text: "Inkloom's BrandTrust Engine compiles brand guidelines into automated AST rules.",
    category: "Product",
    evidence_url: "https://evidence.inkloom.internal/patents/us-pat-pending-brand-compiler.pdf",
    source_doc: "USPTO Patent Application #18/492,021",
    expiry_date: "2032-01-01",
    version: "v1.1",
    owner: "Dr. Aris Thorne (Chief AI Architect)",
    confidence: 1.0,
    status: "valid",
    tags: ["patent", "compiler", "brandtrust", "technology"]
  },
  {
    id: "FACT-009",
    claim_text: "Inkloom holds ISO 27001:2022 Certification across all global datacenter regions.",
    category: "Security",
    evidence_url: "https://trust.inkloom.internal/iso-27001-certificate.pdf",
    source_doc: "BSI Assurance ISO/IEC 27001 Certificate #IS-749201",
    expiry_date: "2027-08-20",
    version: "v2.0",
    owner: "David Lin (CISO)",
    confidence: 1.0,
    status: "valid",
    tags: ["iso27001", "security", "datacenter"]
  },
  {
    id: "FACT-010",
    claim_text: "Headquartered in San Francisco with research engineering laboratories in Zurich.",
    category: "Company",
    evidence_url: "https://evidence.inkloom.internal/corp/facilities-lease-registry.pdf",
    source_doc: "Corporate Facility Disclosures 2024",
    expiry_date: "2029-05-01",
    version: "v1.2",
    owner: "People & Places Operations",
    confidence: 0.99,
    status: "valid",
    tags: ["headquarters", "locations", "zurich", "san-francisco"]
  },
  {
    id: "FACT-011",
    claim_text: "Employs over 180 full-time engineers, researchers, and brand governance specialists.",
    category: "Company",
    evidence_url: "https://evidence.inkloom.internal/hr/q3-headcount-verified.pdf",
    source_doc: "Q3 2024 Payroll & HR Census",
    expiry_date: "2027-03-31",
    version: "v3.1",
    owner: "Monique Beller (VP People)",
    confidence: 0.94,
    status: "valid",
    tags: ["headcount", "team", "engineers"]
  },
  {
    id: "FACT-012",
    claim_text: "Achieved Net Promoter Score (NPS) of +68 in the 2024 Enterprise MarTech Survey.",
    category: "Customer",
    evidence_url: "https://evidence.inkloom.internal/satisfaction/nps-report-2024.pdf",
    source_doc: "Third-Party Customer Satisfaction Benchmarks, Qualtrics",
    expiry_date: "2027-07-15",
    version: "v2.0",
    owner: "Customer Experience Team",
    confidence: 0.97,
    status: "valid",
    tags: ["nps", "satisfaction", "survey"]
  },
  {
    id: "FACT-013",
    claim_text: "Compliant with GDPR, CCPA, CPRA, and EU AI Act Governance Tier 2 classifications.",
    category: "Security",
    evidence_url: "https://trust.inkloom.internal/legal/privacy-framework-2024.pdf",
    source_doc: "Baker & McKenzie Regulatory Compliance Opinion 2024",
    expiry_date: "2027-11-01",
    version: "v2.3",
    owner: "Legal Privacy Counsel",
    confidence: 0.99,
    status: "valid",
    tags: ["gdpr", "ccpa", "ai-act", "legal"]
  },
  {
    id: "FACT-014",
    claim_text: "BrandGene Drift Radar provides continuous tone vector variance analysis across channels.",
    category: "Product",
    evidence_url: "https://evidence.inkloom.internal/tech/drift-radar-spec.pdf",
    source_doc: "Inkloom Whitepaper: Continuous Brand Governance at Scale",
    expiry_date: "2028-01-01",
    version: "v1.0",
    owner: "Dr. Aris Thorne (Chief AI Architect)",
    confidence: 0.98,
    status: "valid",
    tags: ["drift-radar", "brandgene", "governance"]
  },
  {
    id: "FACT-015",
    claim_text: "Offers automated WCAG 2.1 AA/AAA accessibility contrast validation for all digital assets.",
    category: "Product",
    evidence_url: "https://evidence.inkloom.internal/accessibility/wcag-audit.pdf",
    source_doc: "Accessibility Conformance Report (VPAT 2.4)",
    expiry_date: "2027-10-30",
    version: "v2.0",
    owner: "UX Governance Guild",
    confidence: 0.99,
    status: "valid",
    tags: ["wcag", "accessibility", "contrast"]
  },
  {
    id: "FACT-016",
    claim_text: "Zero-retention model: Customer assets are never utilized to train shared AI weights.",
    category: "Security",
    evidence_url: "https://trust.inkloom.internal/data-privacy/enterprise-dpa.pdf",
    source_doc: "Data Processing Addendum Section 7.2",
    expiry_date: "2028-12-31",
    version: "v4.0",
    owner: "David Lin (CISO)",
    confidence: 1.0,
    status: "valid",
    tags: ["privacy", "no-training", "enterprise"]
  },
  {
    id: "FACT-017",
    claim_text: "Inkloom primary color hex is #0284C7 (Cyber Blue) with accent #6366F1 (Electric Indigo).",
    category: "Product",
    evidence_url: "https://brand.inkloom.internal/tokens/design-system-2024.json",
    source_doc: "Inkloom Design System Spec v3.2",
    expiry_date: "2028-06-01",
    version: "v3.2",
    owner: "Brand Creative Director",
    confidence: 1.0,
    status: "valid",
    tags: ["design-system", "colors", "hex", "brand-identity"]
  },
  {
    id: "FACT-018",
    claim_text: "Supported by Series B funding led by Sequoia Capital and Benchmark.",
    category: "Company",
    evidence_url: "https://evidence.inkloom.internal/investors/series-b-release.pdf",
    source_doc: "Press Wire Official Filing SEC Form D 2023",
    expiry_date: "2029-01-01",
    version: "v1.0",
    owner: "Chief Financial Officer",
    confidence: 1.0,
    status: "valid",
    tags: ["investors", "sequoia", "series-b"]
  },
  {
    id: "FACT-019",
    claim_text: "Eliminates up to 88% of off-brand visual and typography regressions in published campaigns.",
    category: "Performance",
    evidence_url: "https://evidence.inkloom.internal/case-studies/enterprise-cohort-2024.pdf",
    source_doc: "Annual Brand Integrity Cohort Study (Q1 2024)",
    expiry_date: "2027-05-30",
    version: "v1.8",
    owner: "Sarah Chen (Product Marketing)",
    confidence: 0.94,
    status: "valid",
    tags: ["case-study", "visual-regressions", "efficiency"]
  },
  {
    id: "FACT-020",
    claim_text: "Approved logo asset package is Version 2.4 SVG with minimum clearspace of 24px.",
    category: "Product",
    evidence_url: "https://brand.inkloom.internal/assets/logo-guidelines-v2.4.pdf",
    source_doc: "Brand Asset Master Guidelines v2.4",
    expiry_date: "2028-01-01",
    version: "v2.4",
    owner: "Brand Creative Director",
    confidence: 1.0,
    status: "valid",
    tags: ["logo", "svg", "clearspace", "brand-identity"]
  },
  // Expired facts (critical for demonstration!)
  {
    id: "FACT-EXP-001",
    claim_text: "Inkloom Starter Tier subscription starts at $49/seat/month.",
    category: "Product",
    evidence_url: "https://evidence.inkloom.internal/archive/2022-pricing-card.pdf",
    source_doc: "Archived 2022 Pricing Sheet (Superseded by Enterprise Quote Model)",
    expiry_date: "2022-12-31",
    version: "v1.0-LEGACY",
    owner: "Revenue Council (Deprecated)",
    confidence: 0.91,
    status: "expired",
    tags: ["pricing", "legacy", "expired"]
  },
  {
    id: "FACT-EXP-002",
    claim_text: "Inkloom provides experimental beta support for Figma Plugin v1.0.",
    category: "Product",
    evidence_url: "https://evidence.inkloom.internal/archive/figma-v1-deprecation-notice.pdf",
    source_doc: "Engineering Notice: Figma v1 deprecated in favor of REST API v3",
    expiry_date: "2023-06-30",
    version: "v1.0-BETA",
    owner: "Integrations Guild",
    confidence: 0.88,
    status: "expired",
    tags: ["figma", "beta", "deprecated", "expired"]
  },
  {
    id: "FACT-EXP-003",
    claim_text: "European data center processing is hosted exclusively in Dublin (EU-West-1).",
    category: "Security",
    evidence_url: "https://evidence.inkloom.internal/archive/datacenter-migration-2023.pdf",
    source_doc: "Cloud Infrastructure Bulletin: Migrated to Frankfurt Multi-AZ in Q1 2024",
    expiry_date: "2023-12-31",
    version: "v1.2",
    owner: "Cloud Architecture Guild",
    confidence: 0.85,
    status: "expired",
    tags: ["datacenter", "dublin", "deprecated", "expired"]
  }
];

export const INKLOOM_MARKETING_ASSETS: BrandAsset[] = [
  {
    id: "ASSET-001",
    title: "Q4 2024 Global Enterprise Sales Deck",
    type: "Sales Deck",
    channel: "Enterprise Direct Sales",
    owner: "Enterprise Sales Enablement",
    status: "published",
    lastUpdated: "2024-10-14",
    dependentFactIds: ["FACT-001", "FACT-005", "FACT-003", "FACT-017"],
    riskLevel: "Low",
    originDoc: "Enterprise_Pitch_Master_v4.pptx"
  },
  {
    id: "ASSET-002",
    title: "Agency X Performance Growth Campaign (12 Meta Ads)",
    type: "Ad",
    channel: "Meta Paid Social",
    owner: "Agency X Growth Partners",
    status: "flagged",
    lastUpdated: "2024-10-20",
    dependentFactIds: ["FACT-001", "FACT-EXP-001"],
    riskLevel: "High",
    originDoc: "AgencyX_Social_Templates_Q3.pptx"
  },
  {
    id: "ASSET-003",
    title: "Forrester Total Economic Impact Case Study Brochure",
    type: "Blog Post",
    channel: "Website & Resource Center",
    owner: "Content Marketing",
    status: "published",
    lastUpdated: "2024-08-11",
    dependentFactIds: ["FACT-001", "FACT-006", "FACT-019"],
    riskLevel: "Low",
    originDoc: "TEI_Summary_Brochure_v2.pdf"
  },
  {
    id: "ASSET-004",
    title: "Brand Governance Executive Webinar Slide Deck",
    type: "Sales Deck",
    channel: "Virtual Summit",
    owner: "Demand Gen",
    status: "in_review",
    lastUpdated: "2024-10-18",
    dependentFactIds: ["FACT-006", "FACT-008", "FACT-014"],
    riskLevel: "Medium",
    originDoc: "Webinar_Slide_Deck_Final.key"
  },
  {
    id: "ASSET-005",
    title: "Cyber Security & AI Governance Datasheet",
    type: "Landing Page",
    channel: "Trust Center",
    owner: "Infosec & Compliance",
    status: "published",
    lastUpdated: "2024-09-02",
    dependentFactIds: ["FACT-003", "FACT-009", "FACT-013", "FACT-016"],
    riskLevel: "Low",
    originDoc: "Trust_Center_Spec_2024.md"
  },
  {
    id: "ASSET-006",
    title: "LinkedIn Sponsored Executive Quote Ads (Cohort B)",
    type: "Ad",
    channel: "LinkedIn Ads",
    owner: "Performance Marketing",
    status: "published",
    lastUpdated: "2024-09-25",
    dependentFactIds: ["FACT-005", "FACT-012"],
    riskLevel: "Low",
    originDoc: "LinkedIn_Sponsored_Quotes_v3.fig"
  },
  {
    id: "ASSET-007",
    title: "Pricing Matrix & Enterprise Feature Comparison Page",
    type: "Landing Page",
    channel: "Website",
    owner: "Growth Engineering",
    status: "flagged",
    lastUpdated: "2024-10-15",
    dependentFactIds: ["FACT-EXP-001", "FACT-004"],
    riskLevel: "High",
    originDoc: "Website_Pricing_Component.tsx"
  },
  {
    id: "ASSET-008",
    title: "Google Search Ad Extensions - Time Savings Benchmark",
    type: "Ad",
    channel: "Google Ads",
    owner: "Search Marketing",
    status: "published",
    lastUpdated: "2024-08-30",
    dependentFactIds: ["FACT-001"],
    riskLevel: "Low",
    originDoc: "Search_Copy_Spreadsheet_2024.xlsx"
  },
  {
    id: "ASSET-009",
    title: "European Expansion & Infrastructure Announcement",
    type: "Blog Post",
    channel: "Company Blog",
    owner: "Corporate PR",
    status: "published",
    lastUpdated: "2024-03-12",
    dependentFactIds: ["FACT-010", "FACT-EXP-003"],
    riskLevel: "Medium",
    originDoc: "PR_Euro_Expansion_Release.docx"
  },
  {
    id: "ASSET-010",
    title: "Design System & Creative Automation Figma Community File",
    type: "Landing Page",
    channel: "Figma Community",
    owner: "Brand Design Team",
    status: "in_review",
    lastUpdated: "2024-10-22",
    dependentFactIds: ["FACT-017", "FACT-020", "FACT-EXP-002"],
    riskLevel: "Medium",
    originDoc: "Inkloom_UI_Tokens_Release.fig"
  },
  {
    id: "ASSET-011",
    title: "Customer Welcome Email Nurture Sequence (6 Emails)",
    type: "Email",
    channel: "Marketo Lifecycle",
    owner: "Lifecycle Marketing",
    status: "published",
    lastUpdated: "2024-07-19",
    dependentFactIds: ["FACT-001", "FACT-004", "FACT-007"],
    riskLevel: "Low",
    originDoc: "Nurture_Journey_Workflow_v2.json"
  },
  {
    id: "ASSET-012",
    title: "Q3 Agency Out-of-Home Billboard & Airport Displays",
    type: "Ad",
    channel: "OOH Displays",
    owner: "Brand Media Agency",
    status: "published",
    lastUpdated: "2024-07-01",
    dependentFactIds: ["FACT-017", "FACT-020", "FACT-002"],
    riskLevel: "Low",
    originDoc: "Airport_Billboard_Artwork_Master.ai"
  },
  {
    id: "ASSET-013",
    title: "Product Launch Press Release: BrandTrust Compiler 3.0",
    type: "Blog Post",
    channel: "PR Newswire",
    owner: "Corporate PR",
    status: "published",
    lastUpdated: "2024-09-10",
    dependentFactIds: ["FACT-008", "FACT-014", "FACT-015"],
    riskLevel: "Low",
    originDoc: "PR_Compiler_Launch.docx"
  },
  {
    id: "ASSET-014",
    title: "Security Whitepaper: Zero-Retention AI Governance",
    type: "Landing Page",
    channel: "Trust Portal",
    owner: "Security Architecture",
    status: "published",
    lastUpdated: "2024-08-15",
    dependentFactIds: ["FACT-003", "FACT-009", "FACT-016"],
    riskLevel: "Low",
    originDoc: "Zero_Retention_Whitepaper_2024.pdf"
  },
  {
    id: "ASSET-015",
    title: "End-of-Year Customer Appreciation Gift & Factsheet",
    type: "Email",
    channel: "VIP Executive Mailer",
    owner: "Executive Communications",
    status: "draft",
    lastUpdated: "2024-10-24",
    dependentFactIds: ["FACT-005", "FACT-011", "FACT-012"],
    riskLevel: "Low",
    originDoc: "VIP_Executive_Pack_2024.pdf"
  }
];

export const INKLOOM_40_ADS_DRIFT_HISTORY: AdHistoryItem[] = [
  // Oldest ads (6 months ago) - strictly informative, objective tone
  { id: "AD-01", adNumber: 1, date: "2024-05-01", title: "Engineering Rigor in Creative Automation", channel: "LinkedIn", toneScore: 96, urgencyScore: 4, copySnippet: "Inkloom compiles brand style guides into deterministic validation rules, saving teams 25% production time.", sentiment: "Objective", flagged: false, authorAgency: "Internal Brand" },
  { id: "AD-02", adNumber: 2, date: "2024-05-05", title: "Forrester Total Economic Impact Findings", channel: "Google Search", toneScore: 94, urgencyScore: 6, copySnippet: "Read the Forrester study to learn how enterprise teams reduce brand review latency to under 18 minutes.", sentiment: "Objective", flagged: false, authorAgency: "Internal Brand" },
  { id: "AD-03", adNumber: 3, date: "2024-05-10", title: "Enterprise Zero-Retention Security Architecture", channel: "LinkedIn", toneScore: 95, urgencyScore: 5, copySnippet: "SOC-2 Type II and ISO 27001 verified. Your creative assets are never retained for model retraining.", sentiment: "Objective", flagged: false, authorAgency: "Internal Brand" },
  { id: "AD-04", adNumber: 4, date: "2024-05-16", title: "Adobe & Figma Native Integration Overview", channel: "Meta", toneScore: 92, urgencyScore: 8, copySnippet: "Connect your existing creative design system directly with Inkloom BrandTrust Engine.", sentiment: "Objective", flagged: false, authorAgency: "Internal Brand" },
  { id: "AD-05", adNumber: 5, date: "2024-05-22", title: "Governing 10,000 Assets Across 50 Markets", channel: "LinkedIn", toneScore: 93, urgencyScore: 7, copySnippet: "Enterprise brand governance systems engineered for Fortune 500 compliance and risk mitigation.", sentiment: "Objective", flagged: false, authorAgency: "Internal Brand" },
  { id: "AD-06", adNumber: 6, date: "2024-05-28", title: "Continuous Automated WCAG Contrast Verification", channel: "Google Search", toneScore: 91, urgencyScore: 10, copySnippet: "Validate digital accessibility compliance across color tokens and typography hierarchies automatically.", sentiment: "Objective", flagged: false, authorAgency: "Internal Brand" },
  { id: "AD-07", adNumber: 7, date: "2024-06-03", title: "Brand Compliance as Code: The Architecture", channel: "LinkedIn", toneScore: 90, urgencyScore: 11, copySnippet: "Treat every claim, visual token, and disclaimer as versioned code with cryptographic audit trails.", sentiment: "Objective", flagged: false, authorAgency: "Internal Brand" },
  { id: "AD-08", adNumber: 8, date: "2024-06-09", title: "Customer Spotlight: Enterprise Scaling", channel: "Display", toneScore: 89, urgencyScore: 12, copySnippet: "See why 1,200+ global brands rely on Inkloom for consistent multi-channel compliance.", sentiment: "Persuasive", flagged: false, authorAgency: "Internal Brand" },
  { id: "AD-09", adNumber: 9, date: "2024-06-15", title: "Modern Brand Governance Blueprint", channel: "LinkedIn", toneScore: 88, urgencyScore: 14, copySnippet: "Download the complete enterprise guide to reducing visual and regulatory inconsistencies.", sentiment: "Persuasive", flagged: false, authorAgency: "Internal Brand" },
  { id: "AD-10", adNumber: 10, date: "2024-06-21", title: "Accelerate Campaign Velocity Without Drift", channel: "Meta", toneScore: 86, urgencyScore: 16, copySnippet: "Empower distributed agencies to publish quickly while maintaining strict factual accuracy.", sentiment: "Persuasive", flagged: false, authorAgency: "Internal Brand" },
  
  // Transition Phase (Summer - agency onboarding, slight promotional lift)
  { id: "AD-11", adNumber: 11, date: "2024-06-27", title: "Cut Agency Review Bottlenecks in Half", channel: "LinkedIn", toneScore: 85, urgencyScore: 18, copySnippet: "Say goodbye to endless feedback loops. Automate compliance pre-flight checks today.", sentiment: "Persuasive", flagged: false, authorAgency: "Agency X Growth" },
  { id: "AD-12", adNumber: 12, date: "2024-07-03", title: "The Smartest Way to Scale Marketing", channel: "Google Search", toneScore: 83, urgencyScore: 22, copySnippet: "Supercharge your team's creative throughput with real-time brand rule compilation.", sentiment: "Persuasive", flagged: false, authorAgency: "Agency X Growth" },
  { id: "AD-13", adNumber: 13, date: "2024-07-09", title: "Eliminate Brand Disasters Before They Happen", channel: "Meta", toneScore: 80, urgencyScore: 25, copySnippet: "Protect your brand reputation from accidental compliance missteps and expired claims.", sentiment: "Persuasive", flagged: false, authorAgency: "Agency X Growth" },
  { id: "AD-14", adNumber: 14, date: "2024-07-15", title: "Unlock 25% Higher Creative Output", channel: "Display", toneScore: 78, urgencyScore: 28, copySnippet: "Discover why leading marketing leaders choose Inkloom over manual reviews.", sentiment: "Persuasive", flagged: false, authorAgency: "Agency X Growth" },
  { id: "AD-15", adNumber: 15, date: "2024-07-21", title: "Transform Your Creative Workflow in 10 Minutes", channel: "LinkedIn", toneScore: 76, urgencyScore: 32, copySnippet: "Join thousands of creative teams experiencing zero brand review delays.", sentiment: "Persuasive", flagged: false, authorAgency: "Agency X Growth" },
  { id: "AD-16", adNumber: 16, date: "2024-07-27", title: "Are Your Agencies Following Your Guidelines?", channel: "Meta", toneScore: 74, urgencyScore: 35, copySnippet: "Don't leave brand integrity to chance. Put automated guardrails on every digital asset.", sentiment: "Persuasive", flagged: false, authorAgency: "Agency X Growth" },
  { id: "AD-17", adNumber: 17, date: "2024-08-02", title: "Stop Wasting Hours on Manual Approvals", channel: "Google Search", toneScore: 72, urgencyScore: 39, copySnippet: "Get instant compliance feedback directly in your creative workspace with Inkloom.", sentiment: "Persuasive", flagged: false, authorAgency: "Agency X Growth" },
  { id: "AD-18", adNumber: 18, date: "2024-08-08", title: "The Secret Weapon of High-Velocity Brands", channel: "YouTube", toneScore: 70, urgencyScore: 42, copySnippet: "Watch how top global enterprises scale creative output 10x faster with AI guardrails.", sentiment: "Persuasive", flagged: false, authorAgency: "Agency X Growth" },
  { id: "AD-19", adNumber: 19, date: "2024-08-14", title: "Speed Up Every Launch Cycle Now", channel: "Meta", toneScore: 68, urgencyScore: 46, copySnippet: "Streamline content review processes across all marketing channels in one unified platform.", sentiment: "Persuasive", flagged: false, authorAgency: "Agency X Growth" },
  { id: "AD-20", adNumber: 20, date: "2024-08-20", title: "Double Your Output Without Adding Headcount", channel: "LinkedIn", toneScore: 65, urgencyScore: 50, copySnippet: "Maximize marketing efficiency with continuous governance and claim verification.", sentiment: "Salesy Drift", flagged: false, authorAgency: "Agency X Growth" },

  // Visible Brand Drift Period (Late August - September: heavy urgency, sensationalism)
  { id: "AD-21", adNumber: 21, date: "2024-08-26", title: "Why Your Brand is Secretly Leaking Revenue", channel: "Meta", toneScore: 62, urgencyScore: 55, copySnippet: "Bad compliance is costing you millions. Fix it before your competitors take your market share.", sentiment: "Salesy Drift", flagged: false, authorAgency: "Agency X Growth" },
  { id: "AD-22", adNumber: 22, date: "2024-09-01", title: "Unbeatable Creative Velocity - Test It Today!", channel: "Google Search", toneScore: 59, urgencyScore: 58, copySnippet: "Skyrocket your marketing velocity today! Sign up now for immediate setup.", sentiment: "Salesy Drift", flagged: false, authorAgency: "Agency X Growth" },
  { id: "AD-23", adNumber: 23, date: "2024-09-06", title: "Don't Get Left Behind in the AI Content Race", channel: "LinkedIn", toneScore: 56, urgencyScore: 63, copySnippet: "Competitors are publishing 10x more content than you. Catch up instantly with Inkloom.", sentiment: "Salesy Drift", flagged: false, authorAgency: "Agency X Growth" },
  { id: "AD-24", adNumber: 24, date: "2024-09-11", title: "Instant AI Magic for Brand Governance", channel: "Meta", toneScore: 52, urgencyScore: 68, copySnippet: "Miraculous AI engine cures all your brand compliance headaches in seconds!", sentiment: "Aggressive Hype", flagged: true, authorAgency: "Agency X Growth" },
  { id: "AD-25", adNumber: 25, date: "2024-09-16", title: "Hurry! Claim Your Free Enterprise Audit", channel: "Display", toneScore: 49, urgencyScore: 72, copySnippet: "Limited time offer! Get your entire brand DNA audited for zero dollars this week only.", sentiment: "Salesy Drift", flagged: true, authorAgency: "Agency X Growth" },
  { id: "AD-26", adNumber: 26, date: "2024-09-20", title: "Crush Content Bottlenecks Instantly", channel: "YouTube", toneScore: 47, urgencyScore: 75, copySnippet: "Tired of slow legal teams? Bypass the line and publish content instantly without roadblocks.", sentiment: "Aggressive Hype", flagged: true, authorAgency: "Agency X Growth" },
  { id: "AD-27", adNumber: 27, date: "2024-09-24", title: "The #1 Tool CMOs are Obsessed With", channel: "LinkedIn", toneScore: 44, urgencyScore: 78, copySnippet: "Every top CMO is talking about this secret hack. Don't be the last to know.", sentiment: "Salesy Drift", flagged: true, authorAgency: "Agency X Growth" },
  { id: "AD-28", adNumber: 28, date: "2024-09-28", title: "Guaranteed 100% Brand Perfection or Money Back", channel: "Google Search", toneScore: 40, urgencyScore: 82, copySnippet: "Guaranteed zero errors across all creative materials. 100% foolproof protection guaranteed.", sentiment: "Aggressive Hype", flagged: true, authorAgency: "Agency X Growth" },
  { id: "AD-29", adNumber: 29, date: "2024-10-02", title: "LAST CHANCE: Q4 Early Access Special", channel: "Meta", toneScore: 38, urgencyScore: 85, copySnippet: "Seats are disappearing fast! Lock in legacy pricing before midnight tonight or pay double.", sentiment: "Aggressive Hype", flagged: true, authorAgency: "Agency X Growth" },
  { id: "AD-30", adNumber: 30, date: "2024-10-05", title: "Inkloom Delivers Insane 40% Efficiency Gains!", channel: "Display", toneScore: 35, urgencyScore: 88, copySnippet: "Get insane 40% efficiency gains across all your marketing channels in under 3 days!", sentiment: "Aggressive Hype", flagged: true, authorAgency: "Agency X Growth" },

  // Peak Drift & Extreme Urgency (October 2024 - triggered BrandForensics alarm)
  { id: "AD-31", adNumber: 31, date: "2024-10-08", title: "ACT NOW: The End of Creative Errors Forever", channel: "Meta", toneScore: 32, urgencyScore: 91, copySnippet: "Don't hesitate another second! Click now to revolutionize your marketing before spots fill up.", sentiment: "Aggressive Hype", flagged: true, authorAgency: "Agency X Growth" },
  { id: "AD-32", adNumber: 32, date: "2024-10-10", title: "Cheap Brand Governance That Works Miracles", channel: "Google Search", toneScore: 29, urgencyScore: 93, copySnippet: "Cheap and lightning-fast compliance verification. Stop overpaying expensive agency retainers.", sentiment: "Aggressive Hype", flagged: true, authorAgency: "Agency X Growth" },
  { id: "AD-33", adNumber: 33, date: "2024-10-12", title: "WARNING: Your Brand is in Serious Danger", channel: "LinkedIn", toneScore: 26, urgencyScore: 95, copySnippet: "Brand catastrophe is looming if you don't install Inkloom immediately. Act before it's too late.", sentiment: "Aggressive Hype", flagged: true, authorAgency: "Agency X Growth" },
  { id: "AD-34", adNumber: 34, date: "2024-10-14", title: "The Silver Bullet for All Marketing Woes", channel: "YouTube", toneScore: 24, urgencyScore: 96, copySnippet: "The ultimate silver bullet that eliminates 100% of human error with automated push-button AI.", sentiment: "Aggressive Hype", flagged: true, authorAgency: "Agency X Growth" },
  { id: "AD-35", adNumber: 35, date: "2024-10-16", title: "FINAL HOURS: Claim $49/Seat Legacy Plan", channel: "Meta", toneScore: 22, urgencyScore: 98, copySnippet: "Expired plan resurrection: Grab the $49/seat plan now before we permanently shut the doors!", sentiment: "Aggressive Hype", flagged: true, authorAgency: "Agency X Growth" },
  { id: "AD-36", adNumber: 36, date: "2024-10-18", title: "10x Cheaper Than In-House Legal Reviewers", channel: "Display", toneScore: 20, urgencyScore: 98, copySnippet: "Fire your expensive compliance consultants! Inkloom gives you cheap, effortless pass rates.", sentiment: "Aggressive Hype", flagged: true, authorAgency: "Agency X Growth" },
  { id: "AD-37", adNumber: 37, date: "2024-10-20", title: "Massive 40% Time Savings Guaranteed Overnight", channel: "Google Search", toneScore: 19, urgencyScore: 99, copySnippet: "Save 40% time on all ad variations guaranteed! Sign up in 30 seconds and start dominating.", sentiment: "Aggressive Hype", flagged: true, authorAgency: "Agency X Growth" },
  { id: "AD-38", adNumber: 38, date: "2024-10-22", title: "EMERGENCY NOTIFICATION: Last Day for Founders Club", channel: "LinkedIn", toneScore: 17, urgencyScore: 100, copySnippet: "Urgent announcement! Today is the final chance to join our exclusive high-speed cohort.", sentiment: "Aggressive Hype", flagged: true, authorAgency: "Agency X Growth" },
  { id: "AD-39", adNumber: 39, date: "2024-10-23", title: "Shockingly Fast Approvals: Click Before It's Gone", channel: "Meta", toneScore: 15, urgencyScore: 100, copySnippet: "Shock your entire team with instant 1-click approvals. Click now to claim your exclusive discount!", sentiment: "Aggressive Hype", flagged: true, authorAgency: "Agency X Growth" },
  { id: "AD-40", adNumber: 40, date: "2024-10-24", title: "DON'T MISS OUT: 40% Faster Content Deployment", channel: "Google Search", toneScore: 14, urgencyScore: 100, copySnippet: "Why wait? Get 40% faster marketing execution right this second. Time is running out!", sentiment: "Aggressive Hype", flagged: true, authorAgency: "Agency X Growth" }
];

export const ROOT_CAUSE_INSIGHTS = {
  headline: "4 of last 6 logo & tone violations originated from Agency X's legacy PPT template",
  agency: "Agency X Growth Partners",
  templateFile: "AgencyX_Social_Templates_Q3.pptx (v1.2)",
  impactAssetsCount: 23,
  violationPercentage: 62.5,
  systemicFix: "Deprecate Template v1.2 & Deploy Synchronized BrandDNA Figma Token Library across 18 seats.",
  violationsBreakdown: [
    { rule: "Unsupported Metric Claim ('40% more efficient')", occurrences: 14, source: "Slide 4 of AgencyX_Social_Templates_Q3.pptx" },
    { rule: "Deprecated Raster Logo v1.0 instead of SVG v2.4", occurrences: 8, source: "Slide Master Header of Pitch Deck v1.2" },
    { rule: "Banned Words & Aggressive Urgency Drift ('Hurry', 'Cheap', 'Guaranteed')", occurrences: 19, source: "Ad Copy Generator Macro" },
    { rule: "Expired Pricing Fact ($49/seat)", occurrences: 5, source: "Pricing Table Asset Component" }
  ]
};

export const BANNED_WORDS_DICTIONARY = [
  { word: "cheap", approved: "cost-effective or high-ROI", category: "Tone & Positioning", reason: "Degrades premium enterprise brand reputation." },
  { word: "guaranteed 100%", approved: "backed by our 99.95% uptime SLA", category: "Legal Risk", reason: "Absolute performance promises create false advertising liabilities (FTC Section 5)." },
  { word: "magic", approved: "automated or deterministic compiler", category: "Engineering Rigor", reason: "Inkloom positions as deterministic brand governance, not black-box illusion." },
  { word: "miracle", approved: "measurable efficiency gain", category: "Engineering Rigor", reason: "Hyperbolic claims violate scientific credibility guidelines." },
  { word: "silver bullet", approved: "proven governance framework", category: "Positioning", reason: "Cliché terminology banned under Editorial Standards v3." },
  { word: "insane", approved: "statistically significant or measurable", category: "Tone", reason: "Colloquial hyperbole inconsistent with B2B enterprise tone." },
  { word: "act now", approved: "schedule an enterprise architecture session", category: "Urgency Drift", reason: "High-pressure tactics trigger anti-spam filters and brand perception erosion." },
  { word: "hurry", approved: "explore our Q4 rollout schedule", category: "Urgency Drift", reason: "Consumer retail urgency phrasing strictly prohibited in B2B tier." }
];

export const DEMO_PRESET_SCENARIOS = {
  highRisk: {
    title: "High-Risk Agency Ad Draft (Triggers all 3 underlines)",
    content: "Inkloom is the cheap miracle tool every marketer is raving about! Our platform delivers insane 40% efficiency gains in under 3 days, backed by our 2021 founding heritage and $49/seat pricing. ACT NOW before this exclusive offer expires tonight!"
  },
  unapprovedMetric: {
    title: "Unapproved Speculative Metric Post",
    content: "Enterprise teams achieve 40% more efficient creative production cycles while cutting compliance friction to zero. Discover how Inkloom automates brand governance for distributed agencies."
  },
  compliantPost: {
    title: "100% Brand Compliant Product Announcement",
    content: "Inkloom was founded in 2021 to bring deterministic governance to enterprise brand publishing. Backed by our SOC-2 Type II certification and zero customer data retention policy, Inkloom saves 25% creative production time for enterprise marketing teams according to the Forrester Total Economic Impact study."
  }
};
