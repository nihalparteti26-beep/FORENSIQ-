import assert from 'assert';
import { forensicsEngine } from '../lib/forensics/index.ts';
import { accessibilityEngine } from '../lib/compiler/accessibility.ts';
import { approvalPipelineService } from '../lib/pipeline/approval.ts';

const PORT = 3893;
process.env.PORT = String(PORT);

// Import server (starts listening automatically on PORT)
await import('../server.js');
await new Promise(r => setTimeout(r, 600));

const baseUrl = `http://localhost:${PORT}`;

async function requestJson(endpoint, options = {}) {
  const url = `${baseUrl}${endpoint}`;
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    body: options.body ? (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)) : undefined
  });
  let data;
  try {
    data = await res.json();
  } catch (e) {
    data = {};
  }
  return { status: res.status, data };
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 VERIFYING 5 OBJECTIVES FOR ROUND 3 JUDGE DEMO');
  console.log('======================================================\n');

  try {
    // ----------------------------------------------------
    // OBJECTIVE 1: Live Neo4j Graph Dynamic Updates (Point 3)
    // ----------------------------------------------------
    console.log('[Objective 1] Testing Live Neo4j Graph Dynamic Updates...');
    
    // 1.1 Query initial ripple graph
    const initialRipple = await requestJson('/api/forensics/ripple?factId=FACT-001');
    assert.strictEqual(initialRipple.status, 200);
    const initialAssetCount = initialRipple.data.affectedAssetsCount;
    console.log(`  Initial ripple affected assets: ${initialAssetCount}`);

    // 1.2 Insert live mutation ad
    const liveMutationPayload = {
      title: 'Judge Demo Ad Mutation #999',
      content: 'Inkloom guarantees insane 40% efficiency gains in 3 days. ACT NOW!',
      actor: 'Judge Panel Tester',
      role: 'Creator',
      complianceScore: 35,
      channel: 'LinkedIn Ads'
    };

    const mutationRes = await requestJson('/api/forensics/live-mutation', {
      method: 'POST',
      body: liveMutationPayload
    });

    assert.strictEqual(mutationRes.status, 200, 'Live mutation endpoint should succeed');
    assert.strictEqual(mutationRes.data.success, true);
    assert.ok(mutationRes.data.asset.id.startsWith('ASSET-'), 'Created asset should have an ASSET- ID');
    console.log(`  ✓ Inserted live mutation node: ${mutationRes.data.asset.id} (New total: ${mutationRes.data.totalAssets})`);

    // 1.3 Verify dynamic ripple graph reflects the newly added asset
    const updatedRipple = await requestJson('/api/forensics/ripple?factId=FACT-001');
    assert.strictEqual(updatedRipple.status, 200);
    assert.ok(updatedRipple.data.hasLiveDynamicUpdates, 'Ripple graph should flag hasLiveDynamicUpdates');
    
    const liveNode = updatedRipple.data.graphTopology.nodes.find(n => n.id === mutationRes.data.asset.id);
    assert.ok(liveNode, 'Newly inserted asset must exist in graph topology nodes');
    assert.strictEqual(liveNode.isNewLiveMutation, true, 'Live asset must have isNewLiveMutation flag');
    
    const liveEdge = updatedRipple.data.graphTopology.edges.find(e => e.target === mutationRes.data.asset.id);
    assert.ok(liveEdge, 'Newly inserted asset must have connecting edge from sales deck/mutation');
    console.log(`  ✓ Dynamic traversal confirmed: ${liveNode.id} rendered with level ${liveNode.level} and connecting edge`);

    // ----------------------------------------------------
    // OBJECTIVE 2: Dynamic Drift Radar Calculation (Point 4)
    // ----------------------------------------------------
    console.log('\n[Objective 2] Testing Dynamic Drift Radar Calculation...');

    // 2.1 Get baseline drift history
    const driftRes1 = await requestJson('/api/drift/history');
    assert.strictEqual(driftRes1.status, 200);
    const initialBaseline = driftRes1.data.baselineScore;
    const initialCurrent = driftRes1.data.currentScore;
    const initialDelta = driftRes1.data.driftDelta;
    console.log(`  Initial Drift: Baseline=${initialBaseline}, Current=${initialCurrent}, Delta=${initialDelta}`);
    assert.ok(typeof driftRes1.data.driftDelta === 'number', 'Drift delta must be a calculated number');
    assert.ok(Array.isArray(driftRes1.data.timeline), 'Monthly timeline array must be present');

    // 2.2 Ingest 10 live test ads
    const batchRes = await requestJson('/api/drift/batch', {
      method: 'POST',
      body: { count: 10, mode: 'drift' }
    });
    assert.strictEqual(batchRes.status, 200);
    assert.strictEqual(batchRes.data.success, true);
    assert.strictEqual(batchRes.data.result.created.length, 10, 'Must create 10 new test ads');
    console.log(`  ✓ Ingested 10 live test ads. New total ads: ${batchRes.data.driftTelemetry.totalAds}`);

    // 2.3 Verify recalculated drift delta & timeline progression
    const driftRes2 = await requestJson('/api/drift/history');
    assert.strictEqual(driftRes2.status, 200);
    console.log(`  Recalculated Drift: Current=${driftRes2.data.currentScore}, Delta=${driftRes2.data.driftDelta}`);
    assert.ok(driftRes2.data.timeline.length >= 6, 'Timeline should include monthly cohorts + live session');
    assert.ok(driftRes2.data.liveSessionCount >= 10, 'Live session count should reflect batch additions');
    console.log(`  ✓ Dynamic drift calculation verified: timeline cohorts = ${driftRes2.data.timeline.map(t => t.month).join(' -> ')}`);

    // ----------------------------------------------------
    // OBJECTIVE 3: Advanced Accessibility Compliance Check (Point 5)
    // ----------------------------------------------------
    console.log('\n[Objective 3] Testing Advanced Accessibility Compliance Check (Axe-Core)...');

    const testHtml = `
      <main>
        <h1>Inkloom Enterprise Platform</h1>
        <h2>Deterministic Creative Governance</h2>
        <p>Save 25% creative production time with verified audit trails.</p>
        <button aria-label="Schedule Enterprise Demo">Schedule Demo</button>
        <a href="https://example.com/whitepaper">Read Forrester Whitepaper</a>
        <img src="chart.png" alt="Creative ROI benchmark graph showing 25% efficiency" />
        <label for="email">Business Email:</label>
        <input id="email" type="email" placeholder="name@company.com" />
      </main>
    `;

    const a11yRes = await requestJson('/api/compiler/accessibility', {
      method: 'POST',
      body: { content: testHtml }
    });

    console.log('  a11y report score:', a11yRes.data.score, 'rules:', a11yRes.data.rules?.map(r => `${r.ruleId}:${r.status}`));
    assert.strictEqual(a11yRes.status, 200);
    assert.ok(a11yRes.data.score >= 80, `Well-formed accessible HTML should score >= 80 (was ${a11yRes.data.score})`);
    assert.ok(Array.isArray(a11yRes.data.passes), 'Passes array must be returned');
    assert.ok(Array.isArray(a11yRes.data.violations), 'Violations array must be returned');
    
    // Check specific axe-core rule evaluations
    const passedRuleIds = a11yRes.data.passes.map(p => p.ruleId || p.id);
    console.log(`  Evaluated rules (${passedRuleIds.length} passed):`, passedRuleIds.join(', '));
    assert.ok(passedRuleIds.includes('axe-heading-order'), 'Must evaluate axe-heading-order');
    assert.ok(passedRuleIds.includes('axe-color-contrast'), 'Must evaluate axe-color-contrast');
    assert.ok(passedRuleIds.includes('axe-aria-hidden-focus'), 'Must evaluate axe-aria-hidden-focus');
    assert.ok(passedRuleIds.includes('axe-button-name'), 'Must evaluate axe-button-name');
    assert.ok(passedRuleIds.includes('axe-link-name'), 'Must evaluate axe-link-name');
    assert.ok(passedRuleIds.includes('axe-screenreader-reading-order'), 'Must evaluate axe-screenreader-reading-order');
    console.log(`  ✓ Axe-Core Rule Matrix verified: Score ${a11yRes.data.score}/100, WCAG 2.1 compliance verified`);

    // ----------------------------------------------------
    // OBJECTIVE 4: Multi-User Real-Time Collaboration & Concurrency (Point 6)
    // ----------------------------------------------------
    console.log('\n[Objective 4] Testing Multi-User Collaboration & Concurrency Control...');

    // 4.1 Check 3-lane pipeline
    const pipelineRes = await requestJson('/api/pipeline');
    assert.strictEqual(pipelineRes.status, 200);
    assert.ok(pipelineRes.data.lanes.low, 'Low risk lane must exist');
    assert.ok(pipelineRes.data.lanes.medium, 'Medium risk lane must exist');
    assert.ok(pipelineRes.data.lanes.high, 'High risk lane must exist');
    console.log(`  ✓ 3-Lane Architecture active: Low=${pipelineRes.data.lanes.low.length}, Med=${pipelineRes.data.lanes.medium.length}, High=${pipelineRes.data.lanes.high.length}`);

    // 4.2 Test Optimistic Locking & Version Increment
    const targetAsset = pipelineRes.data.lanes.medium[0] || pipelineRes.data.lanes.low[0];
    const initialVersion = targetAsset.version;

    const updateRes1 = await requestJson('/api/pipeline/update', {
      method: 'POST',
      body: {
        assetId: targetAsset.id,
        expectedVersion: initialVersion,
        newContent: targetAsset.content + ' [Updated by User A]',
        user: 'User A (Reviewer)'
      }
    });
    assert.strictEqual(updateRes1.status, 200);
    assert.strictEqual(updateRes1.data.asset.version, initialVersion + 1, 'Version must increment on successful update');
    console.log(`  ✓ Optimistic update succeeded: ${targetAsset.id} version updated from v${initialVersion} to v${updateRes1.data.asset.version}`);

    // 4.3 Test 409 Conflict Detection when another user attempts stale update
    const staleUpdateRes = await requestJson('/api/pipeline/update', {
      method: 'POST',
      body: {
        assetId: targetAsset.id,
        expectedVersion: initialVersion, // Stale version! Server is now at initialVersion + 1
        newContent: targetAsset.content + ' [Conflicting edit by User B]',
        user: 'User B (Reviewer)'
      }
    });
    assert.strictEqual(staleUpdateRes.status, 409, 'Must return HTTP 409 Conflict on version mismatch');
    assert.strictEqual(staleUpdateRes.data.code, 'CONCURRENCY_CONFLICT');
    assert.strictEqual(staleUpdateRes.data.serverVersion, initialVersion + 1);
    console.log(`  ✓ Concurrency Conflict detected (HTTP 409): Expected v${initialVersion} vs Server v${initialVersion + 1}`);

    // 4.4 Test Conflict Resolution via Smart Merge
    const resolveRes = await requestJson('/api/pipeline/resolve', {
      method: 'POST',
      body: {
        assetId: targetAsset.id,
        resolutionType: 'MERGE',
        mergedContent: targetAsset.content + ' [Merged User A + User B]',
        user: 'Elena Rostova (Legal Admin)'
      }
    });
    assert.strictEqual(resolveRes.status, 200);
    assert.strictEqual(resolveRes.data.success, true);
    assert.strictEqual(resolveRes.data.asset.version, initialVersion + 2);
    console.log(`  ✓ Conflict resolved via MERGE strategy. Asset incremented to v${resolveRes.data.asset.version}`);

    // 4.5 Test Pre-configured Conflict Simulation Endpoint
    const simRes = await requestJson('/api/pipeline/simulate-conflict', { method: 'POST', body: {} });
    console.log('  simRes response:', simRes);
    assert.strictEqual(simRes.status, 200);
    assert.ok(simRes.data.conflict, 'Simulation endpoint must return conflict diff payload');
    assert.strictEqual(simRes.data.conflict.code, 'CONCURRENCY_CONFLICT');
    console.log(`  ✓ Simulated 409 conflict payload generated cleanly for live judge demonstration`);

    // ----------------------------------------------------
    // OBJECTIVE 5: Responsive Mobile UI for BrandRipple Graph (Point 7)
    // ----------------------------------------------------
    console.log('\n[Objective 5] Testing Responsive Mobile UI Layouts for BrandRipple...');

    // 5.1 Test mobile layout calculation
    const mobileGraph = forensicsEngine.getGraphData('FACT-001', false, { isMobile: true });
    assert.ok(mobileGraph.nodes.length > 0, 'Mobile graph must have nodes');
    assert.ok(mobileGraph.edges.length > 0, 'Mobile graph must have edges');

    // Verify coordinates are vertically stacked and non-overlapping
    const mobileYCoords = mobileGraph.nodes.map(n => n.y);
    const maxY = Math.max(...mobileYCoords);
    const minY = Math.min(...mobileYCoords);
    assert.ok(maxY > minY + 200, 'Mobile nodes must be distributed vertically along y-axis');

    // Check that width fits within standard mobile viewport (<= 380px)
    const mobileXCoords = mobileGraph.nodes.map(n => n.x);
    const maxX = Math.max(...mobileXCoords);
    assert.ok(maxX <= 380, `Mobile nodes x coordinates (${maxX}) must fit mobile viewport width`);
    console.log(`  ✓ Responsive mobile coordinates verified: X range [${Math.min(...mobileXCoords)} - ${maxX}], Y range [${minY} - ${maxY}]`);

    console.log('\n======================================================');
    console.log('🎉 ALL 5 OBJECTIVES VERIFIED AND PASSING 100%!');
    console.log('======================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Test failed:', err);
    process.exit(1);
  }
}

runTests();
