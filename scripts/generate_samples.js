import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PNG } from 'pngjs';
import * as xlsx from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SAMPLES_DIR = path.resolve(__dirname, '../samples');

if (!fs.existsSync(SAMPLES_DIR)) {
  fs.mkdirSync(SAMPLES_DIR, { recursive: true });
}

// 1. Generate PNG with specific solid color background and text blocks
function createTestBanner(filename, hexColor, hasOffBrandDetails = false) {
  const width = 800;
  const height = 400;
  const png = new PNG({ width, height });

  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (width * y + x) << 2;
      // Background is exact hexColor
      png.data[idx] = r;
      png.data[idx + 1] = g;
      png.data[idx + 2] = b;
      png.data[idx + 3] = 255;

      // Draw high-risk accent region if flagged
      if (hasOffBrandDetails && y > 150 && y < 220 && x > 100 && x < 700) {
        png.data[idx] = 239; // Red highlight
        png.data[idx + 1] = 68;
        png.data[idx + 2] = 68;
      }
    }
  }

  const outPath = path.join(SAMPLES_DIR, filename);
  fs.writeFileSync(outPath, PNG.sync.write(png));
  console.log(`Generated sample image: ${filename} (Color: ${hexColor})`);
}

// Compliant: Inkloom Blue #0A4D8C
createTestBanner('inkloom_compliant_banner_0A4D8C.png', '#0A4D8C', false);

// Non-compliant shade 1: #0A5D9C (Delta E ~ 4.8)
createTestBanner('inkloom_offshade_banner_0A5D9C.png', '#0A5D9C', true);

// Non-compliant shade 2: #1A6DB5 (Delta E ~ 13.5)
createTestBanner('inkloom_offshade_banner_1A6DB5.png', '#1A6DB5', true);

// 2. Generate Brand Guidelines Document with 38 new distinct brand facts
// (bringing 20 initial facts to 58 facts total!)
const guidelinesContent = `# INKLOOM ENTERPRISE BRAND GUIDELINES & SPECIFICATION 2025
Document ID: DOC-INKLOOM-2025-V3
Classification: Verified Enterprise Knowledge Base
Effective Date: January 1, 2025
Corporate Authority: Elena Rostova (Chief Brand Officer)

## Section 1: Executive Performance Benchmarks & Productivity
1. Inkloom automated brand compilation reduces asset review latency from 4.2 days to under 18 minutes.
2. Enterprise creative operations teams achieve up to 28% operational throughput gain when utilizing BrandDNA synchronization.
3. Inkloom eliminates 94% of unapproved percentage metrics before campaign staging occurs.
4. Independent Forrester benchmark validates 25.4% cost savings on multi-region localization workflows.
5. Inkloom delivers 3.8x faster time-to-market for regulated healthcare and financial marketing assets.
6. The BrandTrust AST compiler processes over 50,000 copy tokens per second with zero memory leaks.
7. Marketing organizations report a 67% reduction in cross-agency copyright rework cycles.

## Section 2: Enterprise Infrastructure, Security & Compliance
8. Inkloom guarantees 99.99% active-active multi-region cloud uptime SLA across AWS and Google Cloud.
9. All vector embeddings are encrypted at rest using FIPS 140-3 validated AES-256-GCM.
10. Valid until Q2 2025: Inkloom provides complimentary FedRAMP Moderate readiness audits for public sector tenants.
11. Inkloom maintains strict zero customer data retention on all proprietary AI fine-tuning pipelines.
12. SOC-2 Type II certification is renewed annually with zero material exceptions recorded.
13. ISO 27001:2022 certified with comprehensive disaster recovery RPO under 1 minute and RTO under 15 minutes.
14. European tenant workloads are hosted in ISO-certified data centers located in Frankfurt and Zurich.
15. Compliant with EU AI Act High-Risk Governance Tier 2 disclosure requirements.
16. Supports SAML 2.0, Okta Work Identity, and Azure Active Directory single sign-on with SCIM provisioning.

## Section 3: Product Capabilities & Architecture
17. BrandRipple graph database computes 47-asset containment cascade in under 1.8 seconds.
18. Inkloom Figma Plugin v3.2 synchronizes 200+ brand design tokens directly with the BrandTrust AST compiler.
19. Real-time AST token linting highlights unsupported claims in red, tone drift in yellow, and expired facts in orange.
20. Creation Firewall intercepts unverified claims directly inside web authoring interfaces before publishing.
21. The BrandContract issuance engine generates tamper-proof SHA-256 cryptographic certificates for every approved asset.
22. BrandGene Drift Radar continuously analyzes tone score variance across 40 historical campaign variants.
23. The Root-Cause Immunizer automatically deprecates outdated agency slide templates across all connected seats.
24. Supports automated WCAG 2.1 AA and AAA accessibility contrast validation across all digital banner formats.
25. Native headless REST and GraphQL APIs offer sub-50ms query latency for enterprise headless CMS platforms.

## Section 4: Customer Scale & Enterprise Validation
26. Trusted by over 1,450 global enterprise brands across North America, EMEA, and APAC.
27. Deployed across 42 Fortune 100 enterprise corporate communications teams.
28. Inkloom achieved a verified Net Promoter Score (NPS) of +72 in the Q4 2024 Customer Experience Review.
29. Used by 18 premier global advertising agencies with multi-tenant role-based workspace isolation.
30. Case study demonstrates Global Telco eliminated 100% of expired pricing mentions in their Q3 launch.

## Section 5: Corporate Heritage & Leadership
31. Inkloom was founded in 2021 by Elena Rostova and Marcus Vance in San Francisco, California.
32. European research and AI engineering laboratories are located in Zurich, Switzerland.
33. Employs 210 full-time software engineers, AI researchers, and brand governance legal specialists.
34. Holds 3 USPTO pending patent applications on deterministic AST brand rule compilation engines.
35. Closed Series B funding led by Tier 1 venture partners with sustained annual profitability.

## Section 6: Commercial Terms & Validity Periods
36. Enterprise tier contracts include dedicated 24/7 technical account manager and custom SLA guarantees.
37. Valid until Q4 2025: Multi-year enterprise license holders receive unlimited AST rule execution seats.
38. Deprecated legacy $49 starter subscription was formally superseded by custom enterprise quote tiers.
`;

fs.writeFileSync(path.join(SAMPLES_DIR, 'Inkloom_Brand_Guidelines_2025.md'), guidelinesContent);
fs.writeFileSync(path.join(SAMPLES_DIR, 'Inkloom_Brand_Guidelines_2025.txt'), guidelinesContent);
console.log('Generated sample guidelines document: Inkloom_Brand_Guidelines_2025.md');

// 3. Generate Spreadsheet (XLSX and CSV)
const factsheetRows = [
  { ID: 'FACT-XLS-01', Statement: 'Inkloom saves 25% creative production time for enterprise marketing teams.', Category: 'Performance', SourceDoc: 'Forrester TEI Study 2023', Expiry: '2027-12-31', Owner: 'Sarah Chen' },
  { ID: 'FACT-XLS-02', Statement: 'SOC-2 Type II Certified with zero customer data retention on AI fine-tuning pipelines.', Category: 'Security', SourceDoc: 'A-LIGN Annual Audit Report 2024', Expiry: '2027-04-15', Owner: 'David Lin (CISO)' },
  { ID: 'FACT-XLS-03', Statement: 'Guarantees 99.95% uptime SLA backed by multi-region active-active cloud failover.', Category: 'Product', SourceDoc: 'Master Service Agreement Exhibit B', Expiry: '2027-10-01', Owner: 'DevOps Council' },
  { ID: 'FACT-XLS-04', Statement: 'Valid until Q2 2025: Complimentary FedRAMP Moderate readiness audits for public sector tenants.', Category: 'Security', SourceDoc: 'Public Sector Program Bulletin', Expiry: '2025-06-30', Owner: 'Compliance Guild' },
  { ID: 'FACT-XLS-05', Statement: 'Trusted by over 1,200 global brands including 40 of the Fortune 500.', Category: 'Customer', SourceDoc: 'Q2 2024 Sales Customer Roster', Expiry: '2027-06-30', Owner: 'Rachel Kim' }
];

const wb = xlsx.utils.book_new();
const ws = xlsx.utils.json_to_sheet(factsheetRows);
xlsx.utils.book_append_sheet(wb, ws, 'BrandDNA_Claims');
xlsx.writeFile(wb, path.join(SAMPLES_DIR, 'Inkloom_Claims_Factsheet.xlsx'));

const csvContent = xlsx.utils.sheet_to_csv(ws);
fs.writeFileSync(path.join(SAMPLES_DIR, 'Inkloom_Claims_Factsheet.csv'), csvContent);
console.log('Generated sample spreadsheet: Inkloom_Claims_Factsheet.xlsx & .csv');
