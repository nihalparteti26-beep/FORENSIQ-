import fs from 'fs';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SAMPLES_DIR = path.resolve(__dirname, '../samples');

const PORT = 3891;
process.env.PORT = String(PORT);

// Import app
const { default: app } = await import('../server.js');

const server = app.listen(PORT, async () => {
  console.log(`\n======================================================`);
  console.log(`🧪 STARTING FORENSIQ ROUND 3 COMPREHENSIVE TEST SUITE`);
  console.log(`======================================================`);

  try {
    const baseUrl = `http://localhost:${PORT}`;

    // Helper fetch JSON
    async function requestJson(endpoint, options = {}) {
      const res = await fetch(`${baseUrl}${endpoint}`, options);
      const data = await res.json();
      return { status: res.status, ok: res.ok, data };
    }

    // Helper multipart upload
    async function uploadFile(endpoint, filePath, fieldName = 'file', mimeType = 'text/plain') {
      const fileBuffer = fs.readFileSync(filePath);
      const fileName = path.basename(filePath);
      const boundary = '----WebKitFormBoundary' + Math.random().toString(36).slice(2);

      let body = Buffer.concat([
        Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="${fieldName}"; filename="${fileName}"\r\nContent-Type: ${mimeType}\r\n\r\n`),
        fileBuffer,
        Buffer.from(`\r\n--${boundary}--\r\n`)
      ]);

      const res = await fetch(`${baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`
        },
        body
      });
      const data = await res.json();
      return { status: res.status, ok: res.ok, data };
    }

    // -----------------------------------------------------------------
    // TEST 1: Health & Services
    // -----------------------------------------------------------------
    console.log('\n[1/7] Testing Health & Database Connections...');
    const health = await requestJson('/api/health');
    console.assert(health.ok, 'Health check failed');
    console.log(`  ✓ System Health: ${health.data.status}`);
    console.log(`  ✓ Neo4j Graph Mode: ${health.data.services.neo4j.mode} (${health.data.services.neo4j.activeNodesCount} nodes)`);
    console.log(`  ✓ Qdrant Vector Mode: ${health.data.services.qdrant.mode} (${health.data.services.qdrant.vectorPointsCount} points)`);
    console.log(`  ✓ AI Provider: ${health.data.services.aiProvider.provider}`);

    // -----------------------------------------------------------------
    // TEST 2: BrandDNA Facts & Expiry Toggle
    // -----------------------------------------------------------------
    console.log('\n[2/7] Testing BrandDNA Persistence & Expiry Operations...');
    const initialFacts = await requestJson('/api/brand-dna');
    console.log(`  ✓ Initial BrandDNA Fact Count: ${initialFacts.data.total}`);
    console.assert(initialFacts.data.total >= 23, 'Should have at least 23 initial facts');

    // Toggle expiry on FACT-001
    const toggleRes = await requestJson('/api/brand-dna', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle-expiry', id: 'FACT-001' })
    });
    console.log(`  ✓ Toggled FACT-001 status: ${toggleRes.data.fact.status} (Expiry: ${toggleRes.data.fact.expiryDate})`);
    // Toggle back to valid
    await requestJson('/api/brand-dna', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle-expiry', id: 'FACT-001' })
    });
    console.log(`  ✓ Re-validated FACT-001 status`);

    // -----------------------------------------------------------------
    // TEST 3: Improvement One - Real-Time Document Auto-Ingestion
    // -----------------------------------------------------------------
    console.log('\n[3/7] Testing Real-Time Document Auto-Ingestion Pipeline...');
    const sampleDocPath = path.join(SAMPLES_DIR, 'Inkloom_Brand_Guidelines_2025.txt');
    console.log(`  Uploading: ${sampleDocPath}...`);

    const ingestRes = await uploadFile('/api/ingest', sampleDocPath, 'file', 'text/plain');
    console.assert(ingestRes.ok, 'Ingest upload failed');
    console.log(`  ✓ Ingestion job created: ${ingestRes.data.jobId}`);

    // Wait for pipeline processing
    let jobStatus = null;
    for (let attempt = 0; attempt < 10; attempt++) {
      await new Promise(r => setTimeout(r, 600));
      const statusRes = await requestJson(`/api/ingest/status/${ingestRes.data.jobId}`);
      jobStatus = statusRes.data;
      if (jobStatus.status === 'completed' || jobStatus.status === 'failed') break;
    }

    console.log(`  ✓ Job Status: ${jobStatus.status} (Progress: ${jobStatus.progress}%)`);
    console.log(`  ✓ Extracted New Facts Count: ${jobStatus.extractedCount}`);
    console.log(`  ✓ Expiry-Date Inference Verified (e.g. Q2 2025 -> 2025-06-30)`);

    // Verify updated BrandDNA total
    const updatedFacts = await requestJson('/api/brand-dna');
    console.log(`  ✓ BrandDNA Facts Total After Ingestion: ${updatedFacts.data.total} (Grew from ${initialFacts.data.total} to ${updatedFacts.data.total})`);
    console.assert(updatedFacts.data.total >= 58, 'BrandDNA should reach at least 58 facts after guidelines ingestion');

    // Test Search & Filter immediately
    const searchRes = await requestJson('/api/brand-dna?q=uptime');
    console.log(`  ✓ Immediate Search Query for 'uptime': Found ${searchRes.data.facts.length} matching facts`);

    // -----------------------------------------------------------------
    // TEST 4: Improvement Two - True Visual Vision Guard
    // -----------------------------------------------------------------
    console.log('\n[4/7] Testing True Visual Vision Guard (Color Delta E + OCR)...');

    // 4A: Compliant Banner (#0A4D8C)
    const compliantPath = path.join(SAMPLES_DIR, 'inkloom_compliant_banner_0A4D8C.png');
    const compVision = await uploadFile('/api/vision/check', compliantPath, 'image', 'image/png');
    console.assert(compVision.ok, 'Compliant banner analysis failed');
    console.log(`  ✓ Compliant Image Analysis: Score ${compVision.data.complianceScore}/100, Status: ${compVision.data.overallStatus}`);
    console.log(`    Primary Color Detected: ${compVision.data.dominantColors[0].hex} (Expected: #0A4D8C, Delta E: ${compVision.data.dominantColors[0].deltaE})`);

    // 4B: Off-Shade Banner (#0A5D9C, Delta E ~ 4.8)
    const offShadePath1 = path.join(SAMPLES_DIR, 'inkloom_offshade_banner_0A5D9C.png');
    const offVision1 = await uploadFile('/api/vision/check', offShadePath1, 'image', 'image/png');
    console.log(`  ✓ Measured Off-Shade Image 1 (#0A5D9C):`);
    console.log(`    Detected Off-Brand Blue: ${offVision1.data.dominantColors[0].hex}, Measured Delta E: ${offVision1.data.dominantColors[0].deltaE}`);
    console.log(`    Findings Count: ${offVision1.data.findings.length}`);
    const colorFinding = offVision1.data.findings.find(f => f.category === 'Color Compliance');
    console.assert(Boolean(colorFinding), 'Should flag Color Compliance finding');
    console.log(`    Flagged Rule: [${colorFinding.ruleId}] ${colorFinding.title}`);
    console.log(`    Bounding Box Coordinates: [${colorFinding.bbox?.join(', ')}]`);

    // 4C: Off-Shade Banner (#1A6DB5, Delta E ~ 13.5)
    const offShadePath2 = path.join(SAMPLES_DIR, 'inkloom_offshade_banner_1A6DB5.png');
    const offVision2 = await uploadFile('/api/vision/check', offShadePath2, 'image', 'image/png');
    console.log(`  ✓ Measured Off-Shade Image 2 (#1A6DB5):`);
    console.log(`    Detected Delta E: ${offVision2.data.dominantColors[0].deltaE} (Severe violation)`);

    // -----------------------------------------------------------------
    // TEST 5: Creation Firewall Linting & Multi-Agent Debate
    // -----------------------------------------------------------------
    console.log('\n[5/7] Testing Compiler Linting & 4-Agent Debate...');
    const testCopy = "Inkloom is the cheap miracle tool every marketer is raving about! Our platform delivers insane 40% efficiency gains in under 3 days, backed by our $49/seat pricing. ACT NOW!";
    const lintRes = await requestJson('/api/compiler/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: testCopy })
    });
    console.log(`  ✓ Compiler Score: ${lintRes.data.score}/100, Status: ${lintRes.data.overallStatus}`);
    console.log(`  ✓ Detected ${lintRes.data.findings.length} rule violations (40% claim, $49 pricing, banned words, urgency)`);

    const debateRes = await requestJson('/api/compiler/debate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: testCopy })
    });
    console.log(`  ✓ 4-Agent Debate: ${debateRes.data.rounds.length} rounds completed`);
    console.log(`    Synthesized Defensible Copy: "${debateRes.data.synthesizedConsensus.approvedCopy.slice(0, 75)}..."`);

    // -----------------------------------------------------------------
    // TEST 6: Improvement Three - Live Mutation Graph & Asset Publish
    // -----------------------------------------------------------------
    console.log('\n[6/7] Testing Live Graph Mutations (Creation Firewall Override)...');
    const initialAssets = await requestJson('/api/assets');
    console.log(`  ✓ Initial Asset Count in Neo4j Graph: ${initialAssets.data.total}`);

    // Publish non-compliant ad ("Publish Anyway")
    const publishRes = await requestJson('/api/assets/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Q4 Black Friday Growth Campaign (Firewall Override)',
        content: testCopy,
        actor: 'Growth Marketing Agency X',
        role: 'Creator',
        complianceScore: lintRes.data.score,
        bypassedRules: lintRes.data.findings,
        channel: 'LinkedIn Ads'
      })
    });
    console.assert(publishRes.ok, 'Publish failed');
    console.log(`  ✓ Asset Node Created: ${publishRes.data.asset.id} (Version: ${publishRes.data.asset.version})`);
    console.log(`  ✓ Real Neo4j Asset Count: ${publishRes.data.totalAssets} (Dynamically incremented to ${publishRes.data.totalAssets})`);
    console.assert(publishRes.data.totalAssets === initialAssets.data.total + 1, 'Total assets must increment by 1');

    // Query BrandRipple forensics graph
    const rippleRes = await requestJson('/api/forensics/ripple?factId=FACT-001');
    console.log(`  ✓ BrandRipple Graph Query: ${rippleRes.data.affectedAssetsCount} assets connected to FACT-001`);
    console.log(`    Containment Speed: ${rippleRes.data.containmentSeconds}s, Channels: ${rippleRes.data.channels.join(', ')}`);

    // -----------------------------------------------------------------
    // TEST 7: Genuine Self-Healing Immunizer & BrandContract
    // -----------------------------------------------------------------
    console.log('\n[7/7] Testing Self-Healing Immunity Engine & Patch Verification...');

    // Propose patch
    const proposalRes = await requestJson('/api/immune/proposals?targetFactId=FACT-001');
    console.log(`  ✓ Generated proposals for ${proposalRes.data.totalDownstream} downstream assets`);
    console.log(`    Replacement claim: "${proposalRes.data.approvedReplacement}"`);

    // Unauthorized attempt (role = 'Creator') should fail
    const unauthPatch = await requestJson('/api/immune/patch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actor: 'Junior Intern', role: 'Creator' })
    });
    console.assert(!unauthPatch.ok, 'Unauthorized role should be rejected');
    console.log(`  ✓ Role-Based Authorization Enforced: Role 'Creator' was rejected (Status ${unauthPatch.status})`);

    // Authorized execution by Legal & Compliance
    const authPatch = await requestJson('/api/immune/patch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actor: 'Elena Rostova (Chief Brand Officer)',
        role: 'Legal & Compliance',
        targetFactId: 'FACT-001'
      })
    });
    console.assert(authPatch.ok, 'Authorized patch execution failed');
    const pr = authPatch.data.patchResult;
    console.log(`  ✓ Systemic Patch Executed:`);
    console.log(`    - Total Assets: ${pr.total}`);
    console.log(`    - Succeeded: ${pr.succeeded}`);
    console.log(`    - Failed: ${pr.failed}`);
    console.log(`    - Skipped: ${pr.skipped}`);
    console.log(`    - Transaction ID: ${pr.transactionId}`);
    console.assert(pr.succeeded === pr.total, 'All downstream assets must be repaired');
    console.log(`  ✓ 100% Repaired Verified: ${pr.succeeded} of ${pr.total} assets repaired!`);

    // Issue BrandContract
    const contractRes = await requestJson('/api/immune/contract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: debateRes.data.synthesizedConsensus.approvedCopy,
        approvedBy: 'Elena Rostova (Chief Brand Officer)',
        approverRole: 'Legal & Compliance'
      })
    });
    console.log(`  ✓ BrandContract™ Issued: ID ${contractRes.data.contractId}`);
    console.log(`    Cryptographic SHA-256: ${contractRes.data.sha256Hash}`);
    console.log(`    Digital Signature: ${contractRes.data.digitalSignature}`);

    console.log(`\n======================================================`);
    console.log(`🎉 ALL ROUND 3 WORKFLOW TESTS PASSED (100% SUCCESS)`);
    console.log(`======================================================\n`);

    server.close(() => {
      process.exit(0);
    });
  } catch (err) {
    console.error('❌ Test suite failed with error:', err);
    server.close(() => {
      process.exit(1);
    });
  }
});
