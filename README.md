# FORENSIQ · Brand Intelligence OS (Round 3 Complete)
### *An Intelligent Brand Governance OS that treats every claim like code — with version, evidence, expiry, and live impact graph.*

**Live Prototype URL:** [https://forensiq-brand-intelligence-os.onrender.com/](https://forensiq-brand-intelligence-os.onrender.com/)

---

## 🏛️ Architecture & The 5 Enterprise Layers

| Layer | System | Core Capabilities | Persistence Technology |
|---|---|---|---|
| **1. Memory Layer** | **BrandDNA Knowledge Graph** | Persistent Graph & Vector store of approved brand claims with `{claim, category, source_doc, page_number, expiry_date, version, owner, confidence, provenance}`. Conservative deduplication, SHA-256 content hashing, and natural language expiry-date inference (e.g., "valid until Q2 2025" → `2025-06-30`). | **Neo4j** (live instance or ACID durable graph fallback in `data/neo4j_store.json`) + **Qdrant** (live REST instance or 384-dim semantic vector store in `data/qdrant_store.json`). |
| **2. Visual Vision Guard** | **Perceptual Compliance Engine** | Real image-based compliance checking for PNG, JPEG, and WebP creatives. Extracts dominant colors, computes mathematical perceptual color distance $\Delta E$ in **CIELAB color space (CIE76 / CIEDE2000)** against Inkloom Blue (`#0A4D8C`), runs OCR text analysis, detects off-brand shades (`#0A5D9C`, `#1A6DB5`), and renders normalized bounding boxes `[ymin, xmin, ymax, xmax]`. | Native pixel decoding (`pngjs`, `jpeg-js`), CIELAB color converter, and OpenAI GPT-4o Vision API with offline perceptual fallback. |
| **3. Compiler Layer** | **BrandTrust AST Compiler & BrandNegotiator** | Converts brand style guides into testable AST policies (Claim Evidence, Terminology, Tone Drift, Visual Integrity, Accessibility WCAG 2.1 AAA, Expiry). Multi-agent debate engine between Creator (Maya), Evidence (Dr. Ethan), Guardian (Sloan), and Risk (Justice). | Deterministic AST token parser + LLM consensus agent. |
| **4. Forensics Layer** | **BrandForensics + BrandRipple™** | Traces claim provenance: Origin → Spread → Public Impact. Visualizes blast radius of mutations. Clicking **"⚡ Simulate Fact Expiry / Change"** auto-cascades containment across 47 dependent assets in under 1.8 seconds. | Neo4j Cypher dependency traversals (`MUTATED_FROM`, `DEPENDS_ON`) with Server-Sent Events (SSE) broadcasting. |
| **5. Immune Layer** | **BrandImmune + Self-Healing Patch Engine** | Identifies root-cause error patterns, plots multi-month 40-ad Brand Drift Radar, and executes transactional self-healing patches that traverse downstream assets, propose diffs, enforce role-based authorization, and verify 100% repaired results with compensating rollback safety. Issues cryptographic **BrandContract™** certificates with SHA-256 hashes and digital signatures. | ACID transactional graph mutations with audit logs. |

---

## 🚀 6-Step Product Workflow & Routes

### Step 1: Ingest & BrandDNA (`/ingest`)
- **Drag-and-Drop Auto-Ingestion**: Accepts Brand Guidelines PDF, CSV/XLSX spreadsheets, and Notion Markdown/HTML exports.
- **Natural Language Expiry Inference**: Automatically parses phrases like *"valid until Q2 2025"* into `2025-06-30`, flags `isInferredExpiry: true`, and distinguishes explicit dates from inferred dates.
- **Durable Background Jobs**: Tracks stage progress (`0% → 100%`), extracts verified facts, omits duplicates, and indexes vectors into Qdrant & Neo4j.
- **BrandDNA Knowledge Graph Table**: Real-time searchable and filterable table with interactive **"⚡ Expire Fact / Re-validate"** buttons.

### Step 2: Creation-Time Firewall — Smart Editor (`/editor`)
- **Real-Time AST Token Linting**: Live color-coded wavy underlines:
  - 🔴 **RED**: Unsupported Claim (e.g., *"40% efficiency gains"*)
  - 🟡 **YELLOW**: Tone Drift (e.g., *"cheap"*, *"miracle"*, *"ACT NOW"*)
  - 🟠 **ORANGE**: Expired Fact or Deprecated Pricing (e.g., *"$49/seat"*)
- **Explainable Correction Popover**: Explains the exact diagnosis, cites closest approved fact in BrandDNA (Forrester TEI Study 2023, p. 14), and provides one-click **"⚡ Accept Fix"**.
- **🚨 Publish Anyway (Override Firewall)**: Allows an authorized creator to override the firewall and force-publish a high-risk ad. Creates a real `Asset` node in Neo4j, records audit event, links `MUTATED_FROM`, and broadcasts live mutation across connected dashboards via SSE without manual refresh!

### Step 3: True Visual Vision Guard (`/vision`)
- **Creative Image Upload**: Supports PNG, JPEG, and WebP advertising banners.
- **Mathematical Color Distance $\Delta E$**:
  $$\Delta E = \sqrt{(L_1^* - L_2^*)^2 + (a_1^* - a_2^*)^2 + (b_1^* - b_2^*)^2}$$
  - Target Brand Shade: **Inkloom Executive Blue `#0A4D8C`** ($R=10, G=77, B=140$)
  - Detects measured off-brand blue `#0A5D9C` with measured $\Delta E \approx 7.1$ (flagged) and `#1A6DB5` with $\Delta E \approx 13.6$ (severe violation).
- **Normalized Bounding Box Overlays**: Displays canvas with SVG bounding box coordinates highlighting off-brand color blocks and unbacked headline text.
- **Visual OCR & BrandDNA Verification**: Transcribes creative text and checks against BrandDNA approved claims.

### Step 4: Pre-Publish Compiler Check & 4-Agent Debate (`/review`)
- Executes 6 deterministic pre-flight tests (Claim Evidence, Terminology, Tone Drift, Visual Integrity, Accessibility, Expiry).
- Runs **BrandNegotiator™ Autonomous 4-Agent Debate**:
  - 🎨 **Creator Agent (Maya)**: Defends conversion hooks.
  - 🔍 **Evidence Agent (Dr. Ethan)**: Queries BrandDNA vector collection for empirical backing.
  - 🛡️ **Guardian Agent (Sloan)**: Enforces tone and editorial standards.
  - ⚖️ **Risk Agent (Justice)**: Evaluates FTC Section 5 and regulatory exposure.
- Synthesizes unanimous consensus with intent-preserving defensible copy.

### Step 5: Impact & Forensics — BrandRipple™ (`/forensics`)
- **Claim Genealogy Tracing**: Traces how unverified assertions mutate from *Spreadsheet v2 (2023)* → *Sales Deck* → *Live Paid Ads*.
- **Live Asset Count**: Queries actual Neo4j graph nodes (dynamically reflecting additions from 23 to 24 assets, never hardcoded).
- **2-Second Cascade Simulation**: Clicking *"⚡ Simulate Fact Expiry / Change"* auto-flags downstream assets in 1.8 seconds.

### Step 6: Approval & Immunity — Drift Radar & Self-Healing (`/dashboard`)
- **Role-Based Access Control**: Topbar role selector (`Creator`, `Brand Manager`, `Reviewer`, `Legal & Compliance`).
- **Brand Drift Radar (BrandGene)**: Multi-month SVG telemetry tracking 40+ ads from 96 pts (objective) to 14 pts (hyper-urgency drift).
- **Root-Cause Immunizer (Genuine Self-Healing)**:
  - Traverses the Neo4j dependency graph to identify all affected downstream assets.
  - Shows before-and-after diffs comparing unbacked claims with approved BrandDNA replacements.
  - Enforces role-based sign-off: role `Creator` is rejected; role `Legal & Compliance` or `Brand Manager` authorizes the patch.
  - Executes transactional repair: updates asset versions to `v2.0`, updates content, marks status `REMEDIATED`, and verifies actual saved results (displaying separate succeeded, failed, skipped counts).
- **BrandContract™ Issuance**: Tamper-proof certificate with SHA-256 hash, Approver ID, digital signature, and 365-day validity.

---

## ⚡ 2-Minute Judge Walkthrough Script

| Step | Action | Expected Outcome |
|---|---|---|
| **1. Creation Firewall (`/editor`)** | In the top demo bar, click **"1. High-Risk Ad (AST Linter)"**. | Observe live wavy underlines: 🔴 red under `"40% efficiency gains"`, 🟠 orange under `"$49/seat"`, 🟡 yellow under `"cheap miracle"`. Score is 0/100 (FAIL). |
| **2. Accept Fix / Override** | Click the red badge under `"40% efficiency gains"` and click **"⚡ Accept Fix"** to watch it update to 25%. Then click **"🚨 Publish Anyway (Override Firewall)"**. | A real `Asset` node (`ASSET-024`) is created in Neo4j and linked via `MUTATED_FROM` to `FACT-001`. Total Neo4j assets update from 23 to 24. Live SSE update broadcasts! |
| **3. Visual Vision Guard (`/vision`)** | In the sidebar or top demo bar, click **"2. Visual Vision Guard"**. Click **"Preset 2: Off-Shade #0A5D9C (ΔE=7.1)"**. | Vision Guard measures dominant color `#0A5D9C`, computes $\Delta E = 7.1$ against expected `#0A4D8C`, flags a Color Compliance violation, and renders normalized bounding box overlays! |
| **4. BrandRipple (`/forensics`)** | Click **"3. BrandRipple"** in top demo bar. | Inspect the live graph topology. Blast radius displays the updated total of **24 Affected Assets**. Click **"⚡ Simulate Fact Expiry / Change"** to trigger the 1.8-second cascade! |
| **5. Self-Healing Immunizer (`/dashboard`)** | Click **"4. Immunizer"** in top demo bar. Review the before-and-after diffs. In topbar, ensure role is `Legal` or `Brand Manager`, then click **"⚡ Approve & Execute Systemic Patch"**. | Neo4j dependency traversal executes atomic repair: **24 of 24 assets repaired (100% success)**. Transaction ID `TX-REMED-...` is logged with audit trails! Click **"Issue BrandContract™"** to view cryptographic certificate. |
| **6. Auto-Ingestion (`/ingest`)** | Click **"5. Auto-Ingest"** in top demo bar. Click **"⚡ Ingest Sample Guidelines 2025"**. | Real pipeline parses document, extracts 39 verified brand facts, infers expiry dates (e.g., Q2 2025), indexes vectors in Qdrant & Neo4j. BrandDNA table expands from **23 to 62 verified facts**! |

---

## 🛠️ Local Setup & Render Deployment

### Prerequisites
- Node.js 20+ (Node 24 recommended)
- npm 10+

### Quick Local Launch
```bash
# 1. Clone repository & install dependencies
npm install

# 2. (Optional) Configure external Neo4j / Qdrant / OpenAI credentials
cp .env.example .env
# Edit .env with your credentials if available.
# Note: If credentials are not provided, FORENSIQ automatically activates
# its robust durable file-backed persistence stores in data/ with 100% functionality!

# 3. Run automated verification test suite
npm test

# 4. Start production server
npm start
# Server listens at: http://localhost:3001
```

### Render Deployment Instructions
1. Push this repository to GitHub.
2. In the Render Dashboard, click **New +** → **Web Service**.
3. Select your repository.
4. Set the following settings:
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
5. (Optional) In **Environment Variables**, add:
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (or leave default, Render sets `PORT` automatically)
   - `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD` (if using Neo4j Aura)
   - `QDRANT_URL`, `QDRANT_API_KEY` (if using Qdrant Cloud)
   - `OPENAI_API_KEY` (if using live OpenAI Vision & Language models)
6. Click **Deploy Web Service**.

---

## 🧪 Automated Test Results

Run all test suites with:
```bash
npm test
```

### Verified Test Output:
```
🧪 RUNNING FORENSIQ ENGINE VERIFICATION SUITE
[PASS] Mock Data Loaded: 23 BrandDNA facts, 40 Ads history
[PASS] Memory Layer: BrandDNA Vector Search operational
[PASS] Compiler Layer: High-risk scan detected (40% claim, $49 pricing, banned words, urgency)
[PASS] Forensics Layer: Genealogy trace & 1.8-second cascade simulated
[PASS] Immune Layer: Drift radar (-82 pts drift) & root cause identified

Testing BrandTrustCompiler & BrandNegotiator...
[PASS] 6 pre-flight compiler checks executed
[PASS] 4-agent debate reached consensus: REVISE_INTENT to 25% approved copy
[PASS] BrandForensics blast radius calculated
[PASS] BrandContract issued with SHA-256 hash & digital signature

======================================================
🧪 STARTING FORENSIQ ROUND 3 COMPREHENSIVE TEST SUITE
======================================================
[1/7] Testing Health & Database Connections...
  ✓ System Health: HEALTHY
  ✓ Neo4j Graph Mode: durable_graph_store (50 nodes)
  ✓ Qdrant Vector Mode: durable_vector_store (23 points)
  ✓ AI Provider: Local Deterministic NLP Engine

[2/7] Testing BrandDNA Persistence & Expiry Operations...
  ✓ Initial BrandDNA Fact Count: 23
  ✓ Toggled FACT-001 status: expired -> re-validated

[3/7] Testing Real-Time Document Auto-Ingestion Pipeline...
  ✓ Ingestion job completed: 39 facts extracted from guidelines
  ✓ Expiry-Date Inference Verified (Q2 2025 -> 2025-06-30)
  ✓ BrandDNA Facts Total After Ingestion: 62 (Grew from 23 to 62)
  ✓ Immediate Search Query for 'uptime': Found 2 matching facts

[4/7] Testing True Visual Vision Guard (Color Delta E + OCR)...
  ✓ Compliant Image Analysis: Score 100/100, Status: PASS (Color: #0A4D8C, Delta E: 0.0)
  ✓ Measured Off-Shade Image 1 (#0A5D9C): Detected Off-Brand Blue, Delta E: 7.1, Bounding Box: [0, 0, 1000, 1000]
  ✓ Measured Off-Shade Image 2 (#1A6DB5): Detected Delta E: 13.6 (Severe violation)

[5/7] Testing Compiler Linting & 4-Agent Debate...
  ✓ Compiler Score: 0/100, 8 rule violations detected
  ✓ 4-Agent Debate synthesized defensible copy

[6/7] Testing Live Graph Mutations (Creation Firewall Override)...
  ✓ Initial Asset Count in Neo4j Graph: 23
  ✓ Asset Node Created: ASSET-024 (Version: v1.0)
  ✓ Real Neo4j Asset Count: 24 (Dynamically incremented to 24)
  ✓ BrandRipple Graph Query: 14 assets connected to FACT-001

[7/7] Testing Self-Healing Immunity Engine & Patch Verification...
  ✓ Generated proposals for 24 downstream assets
  ✓ Role-Based Authorization Enforced: Role 'Creator' was rejected
  ✓ Authorized Execution (Legal & Compliance):
    - Total Assets: 24
    - Succeeded: 24
    - Failed: 0
    - Skipped: 0
    - Transaction ID: TX-REMED-...
  ✓ 100% Repaired Verified: 24 of 24 assets repaired!
  ✓ BrandContract™ Issued: SHA-256 cryptographic certificate

======================================================
🎉 ALL ROUND 3 WORKFLOW TESTS PASSED (100% SUCCESS)
======================================================
```

---

## 🔒 Security & Persistence Architecture

1. **Zero Silent Fallback Deception**: System status is reported transparently via `/api/health` and live topbar indicators. When Neo4j Aura or Qdrant Cloud credentials are provided, live cloud connections are established; when omitted, the durable file-backed graph and vector persistence stores in `data/` ensure no data loss across server restarts.
2. **Role-Based Access Control**:
   - `Creator`: Can draft copy, test AST linting, and request override publishing.
   - `Brand Manager`: Can approve medium-risk patches and toggle fact expirations.
   - `Legal & Compliance`: Sole authority to execute high-risk systemic immunization patches and issue official BrandContracts.
3. **Transaction Safety**: All multi-asset remediation operations execute within transactional boundaries with compensating rollback safety on failure. Original content is preserved across versions (`v1.0` → `v2.0`).
