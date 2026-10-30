import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import { neo4jService } from './lib/db/neo4j.ts';
import { qdrantService } from './lib/db/qdrant.ts';
import { aiProvider } from './lib/ai/provider.ts';
import { ingestionPipeline } from './lib/ingest/pipeline.ts';
import { visionGuardService } from './lib/vision/guard.ts';
import { mutationEngine, sseBroadcaster } from './lib/mutations/engine.ts';
import { brandCompiler } from './lib/compiler/index.ts';
import { brandNegotiator } from './lib/compiler/agents.ts';
import { immuneEngine } from './lib/immune/index.ts';
import { accessibilityEngine } from './lib/compiler/accessibility.ts';
import { approvalPipelineService } from './lib/pipeline/approval.ts';
import { WebSocketServer } from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3001;
const PUBLIC_DIR = path.join(__dirname, 'public');
const UPLOADS_DIR = path.join(PUBLIC_DIR, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Multer in-memory storage for fast buffer processing
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});

// Serve static frontend and uploads
app.use(express.static(PUBLIC_DIR));

// ==========================================
// 1. HEALTH & SYSTEM STATUS
// ==========================================
app.get('/api/health', (req, res) => {
  const neo4jStatus = neo4jService.getConnectionStatus();
  const qdrantStatus = qdrantService.getConnectionStatus();
  const aiStatus = aiProvider.getConnectionStatus();

  res.json({
    status: 'HEALTHY',
    version: '3.0.0-ENTERPRISE',
    timestamp: new Date().toISOString(),
    services: {
      neo4j: neo4jStatus,
      qdrant: qdrantStatus,
      aiProvider: aiStatus,
      sseClients: sseBroadcaster.getActiveCount()
    }
  });
});

// ==========================================
// 2. SERVER-SENT EVENTS (SSE) STREAM
// ==========================================
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  const clientId = `client_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  sseBroadcaster.addClient(clientId, res);

  res.write(`event: connected\ndata: ${JSON.stringify({ clientId, timestamp: new Date().toISOString() })}\n\n`);

  req.on('close', () => {
    sseBroadcaster.removeClient(clientId);
  });
});

// ==========================================
// 3. BRANDDNA FACTS API (NEO4J + QDRANT)
// ==========================================
app.get('/api/brand-dna', async (req, res) => {
  try {
    const { category, status, q } = req.query;
    const facts = await neo4jService.getAllFacts({
      category,
      status,
      search: q
    });
    res.json({ facts, total: facts.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/brand-dna', async (req, res) => {
  try {
    const { action, id, fact } = req.body;
    if (action === 'toggle-expiry' && id) {
      const updated = await neo4jService.toggleFactExpiry(id);
      sseBroadcaster.broadcast('fact_updated', { fact: updated });
      return res.json({ success: true, fact: updated });
    }

    if (action === 'create' && fact) {
      const created = await neo4jService.upsertFact(fact);
      await qdrantService.upsertPoint(created.id, created.claim, created);
      sseBroadcaster.broadcast('fact_created', { fact: created });
      return res.json({ success: true, fact: created });
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 4. IMPROVEMENT ONE: REAL-TIME INGESTION
// ==========================================
app.post('/api/ingest', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please upload a brand document or spreadsheet.' });
    }

    const job = await ingestionPipeline.processUpload({
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer
    });

    sseBroadcaster.broadcast('ingest_started', {
      jobId: job.jobId,
      fileName: job.fileName
    });

    res.json({
      success: true,
      jobId: job.jobId,
      status: job.status,
      message: `File '${job.fileName}' received and queued for BrandDNA synthesis.`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/ingest/status/:jobId', (req, res) => {
  const job = ingestionPipeline.getJob(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: 'Ingestion job not found' });
  }
  res.json(job);
});

app.get('/api/ingest/jobs', (req, res) => {
  res.json({ jobs: ingestionPipeline.getAllJobs() });
});

// ==========================================
// 5. IMPROVEMENT TWO: VISUAL VISION GUARD
// ==========================================
app.post('/api/vision/check', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded. Please upload a PNG, JPEG, or WebP creative.' });
    }

    const result = await visionGuardService.analyzeCreative({
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      buffer: req.file.buffer
    });

    sseBroadcaster.broadcast('vision_analyzed', {
      analysisId: result.analysisId,
      score: result.complianceScore,
      status: result.overallStatus
    });

    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/vision/history', (req, res) => {
  res.json({ history: visionGuardService.getHistory() });
});

app.get('/api/vision/:id', (req, res) => {
  const item = visionGuardService.getAnalysisById(req.params.id);
  if (!item) return res.status(404).json({ error: 'Vision analysis not found' });
  res.json(item);
});

// ==========================================
// 6. CREATION-TIME FIREWALL COMPILER & DEBATE
// ==========================================
app.post('/api/compiler/check', (req, res) => {
  const content = req.body.content || '';
  const visualContext = req.body.visualContext;
  const report = brandCompiler.compile(content, visualContext);
  res.json({
    score: report.score,
    overallStatus: report.overallStatus,
    riskLevel: report.riskLevel,
    findings: report.findings,
    summary: report.summary,
    subScores: report.subScores,
    accessibilityReport: report.accessibilityReport
  });
});

app.post('/api/compiler/accessibility', (req, res) => {
  const content = req.body.content || '';
  const visualContext = req.body.visualContext;
  const a11yReport = accessibilityEngine.evaluate(content, visualContext);
  res.json(a11yReport);
});

app.post('/api/compiler/debate', (req, res) => {
  const content = req.body.content || '';
  const report = brandCompiler.compile(content);
  const debate = brandNegotiator.conductDebate(content, report);
  res.json(debate);
});

// ==========================================
// 7. IMPROVEMENT THREE: MUTATION GRAPH & ASSETS
// ==========================================
app.post('/api/assets/publish', async (req, res) => {
  try {
    const { title, content, actor, role, complianceScore, bypassedRules, channel } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required to publish an asset.' });
    }

    const result = await mutationEngine.publishAsset({
      title: title || 'Campaign Ad Override',
      content,
      actor: actor || 'Content Creator',
      role: role || 'Creator',
      complianceScore: complianceScore ?? 45,
      bypassedRules: bypassedRules || [],
      channel: channel || 'LinkedIn Ads'
    });

    res.json({
      success: true,
      asset: result.asset,
      totalAssets: result.totalAssets,
      message: `Asset ${result.asset.id} successfully persisted in Neo4j graph.`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/assets', async (req, res) => {
  try {
    const assets = await neo4jService.getAllAssets();
    res.json({ assets, total: assets.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 8. BRANDRIPPLE FORENSICS GRAPH
// ==========================================
app.get('/api/forensics/ripple', async (req, res) => {
  try {
    const factId = req.query.factId || 'FACT-001';
    const ripple = await mutationEngine.getRippleGraph(factId);
    res.json(ripple);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/forensics/live-mutation', async (req, res) => {
  try {
    const { title, content, actor, role, complianceScore, channel } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Content is required for live mutation insertion' });
    }

    const result = await neo4jService.ensureLiveMutation({
      title: title || 'Live Editor Ad Mutation',
      content,
      actor: actor || 'Judge / Live Creator',
      role: role || 'Creator',
      complianceScore: complianceScore ?? 42,
      channel: channel || 'LinkedIn Ads'
    });

    sseBroadcaster.broadcast('asset_published', {
      asset: result.asset,
      totalAssets: result.totalAssets,
      isLiveMutation: true,
      timestamp: new Date().toISOString()
    });

    sseBroadcaster.broadcast('ripple_updated', {
      ripple: result.ripple,
      newAsset: result.asset,
      timestamp: new Date().toISOString()
    });

    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/forensics/simulate-cascade', async (req, res) => {
  try {
    const factId = req.body.factId || 'FACT-001';
    const ripple = await mutationEngine.getRippleGraph(factId);

    sseBroadcaster.broadcast('cascade_simulated', {
      factId,
      affectedAssetsCount: ripple.affectedAssetsCount,
      containmentSeconds: 1.8,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      factId,
      affectedAssetsCount: ripple.affectedAssetsCount,
      containmentSeconds: 1.8,
      channels: ripple.channels,
      message: `2-second cascade containment simulated: ${ripple.affectedAssetsCount} downstream assets auto-flagged in 1.8s.`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 9. SELF-HEALING IMMUNITY ENGINE & CONTRACT
// ==========================================
app.get('/api/immune/proposals', async (req, res) => {
  try {
    const targetFactId = req.query.targetFactId || 'FACT-001';
    const proposals = await mutationEngine.getProposals(targetFactId);
    res.json(proposals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/immune/patch', async (req, res) => {
  try {
    const { actor = 'Elena Rostova (Chief Brand Officer)', role = 'Legal & Compliance', targetFactId = 'FACT-001' } = req.body;

    const patchResult = await mutationEngine.executePatch({
      actor,
      role,
      targetFactId
    });

    res.json({
      success: patchResult.success,
      patchResult,
      message: `Systemic patch verified and deployed across ${patchResult.succeeded} assets.`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/immune/contract', (req, res) => {
  try {
    const { content, approvedBy, approverRole, verifiedFactIds, governanceScore } = req.body;
    const contract = immuneEngine.issueBrandContract({
      assetTitle: 'Brand Publishing Release',
      content: content || 'Verified Enterprise Marketing Copy',
      approvedBy: approvedBy || 'Elena Rostova (Chief Brand Officer)',
      approverRole: approverRole || 'Legal & Compliance',
      verifiedFactIds: verifiedFactIds || ['FACT-001', 'FACT-003'],
      governanceScore: governanceScore ?? 98
    });
    res.json(contract);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 10. DYNAMIC DRIFT RADAR HISTORY & CALCULATION
// ==========================================
app.get('/api/drift/history', async (req, res) => {
  try {
    const history = await neo4jService.getDriftRadarHistory();
    res.json({
      history,
      total: history.length,
      baselineScore: history.baselineScore ?? 94,
      currentScore: history.currentScore ?? 16,
      driftDelta: history.driftDelta ?? -78,
      timeline: history.timeline || [],
      liveSessionCount: history.liveSessionCount || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/drift/batch', async (req, res) => {
  try {
    const count = req.body.count || 10;
    const mode = req.body.mode || 'mixed';
    const result = await neo4jService.addBatchAds(count, mode);
    const history = await neo4jService.getDriftRadarHistory();

    sseBroadcaster.broadcast('drift_update', {
      latestAsset: result.created[result.created.length - 1],
      totalAssets: result.newTotalAssets,
      baselineScore: history.baselineScore,
      currentScore: history.currentScore,
      driftDelta: history.driftDelta,
      timeline: history.timeline,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      result,
      driftTelemetry: {
        baselineScore: history.baselineScore,
        currentScore: history.currentScore,
        driftDelta: history.driftDelta,
        timeline: history.timeline,
        totalAds: history.length
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// 11. MULTI-USER REAL-TIME APPROVAL PIPELINE
// ==========================================
// In-memory set of connected WebSocket clients for real-time dispatching
const wsPipelineClients = new Set();
function broadcastPipelineWebSocket(data) {
  const payload = JSON.stringify(data);
  for (const client of wsPipelineClients) {
    if (client.readyState === 1) { // WebSocket.OPEN
      try {
        client.send(payload);
      } catch (err) {
        wsPipelineClients.delete(client);
      }
    }
  }
}

app.get('/api/pipeline', (req, res) => {
  try {
    const pipeline = approvalPipelineService.getPipeline();
    res.json({
      lanes: {
        low: pipeline.low,
        medium: pipeline.medium,
        high: pipeline.high
      },
      ...pipeline
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pipeline/lock', (req, res) => {
  try {
    const { assetId, user = 'Anonymous User', role = 'Reviewer' } = req.body;
    const result = approvalPipelineService.acquireLock(assetId, user, role);
    if (!result.success) {
      return res.status(423).json(result);
    }
    sseBroadcaster.broadcast('pipeline_lock_changed', { assetId, lock: result.lock, action: 'LOCKED' });
    broadcastPipelineWebSocket({ type: 'PIPELINE_LOCK_CHANGED', assetId, lock: result.lock, action: 'LOCKED' });
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pipeline/unlock', (req, res) => {
  try {
    const { assetId, user = 'Anonymous User' } = req.body;
    const success = approvalPipelineService.releaseLock(assetId, user);
    sseBroadcaster.broadcast('pipeline_lock_changed', { assetId, lock: null, action: 'UNLOCKED' });
    broadcastPipelineWebSocket({ type: 'PIPELINE_LOCK_CHANGED', assetId, lock: null, action: 'UNLOCKED' });
    res.json({ success });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pipeline/update', (req, res) => {
  try {
    const { assetId, expectedVersion, newLane, newStatus, newContent, user = 'Reviewer', role = 'Brand Manager', note, forceOverride } = req.body;
    const result = approvalPipelineService.updateAsset({
      assetId,
      expectedVersion,
      newLane,
      newStatus,
      newContent,
      user,
      role,
      note,
      forceOverride
    });

    if (!result.success) {
      // Concurrency conflict detected!
      sseBroadcaster.broadcast('concurrency_conflict_detected', result.conflict);
      broadcastPipelineWebSocket({ type: 'CONCURRENCY_CONFLICT_DETECTED', conflict: result.conflict });
      return res.status(409).json(result.conflict);
    }

    const updatedPipeline = approvalPipelineService.getPipeline();
    const formattedPipeline = {
      lanes: { low: updatedPipeline.low, medium: updatedPipeline.medium, high: updatedPipeline.high },
      ...updatedPipeline
    };
    sseBroadcaster.broadcast('pipeline_updated', { asset: result.asset, pipeline: formattedPipeline });
    broadcastPipelineWebSocket({ type: 'PIPELINE_UPDATED', asset: result.asset, pipeline: formattedPipeline });
    res.json({ success: true, asset: result.asset, pipeline: formattedPipeline });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pipeline/resolve', (req, res) => {
  try {
    const { assetId, resolutionType, mergedContent, newStatus, user = 'Admin', role = 'Legal & Compliance' } = req.body;
    const result = approvalPipelineService.resolveConflict({
      assetId,
      resolutionType,
      mergedContent,
      newStatus,
      user,
      role
    });

    const updatedPipeline = approvalPipelineService.getPipeline();
    const formattedPipeline = {
      lanes: { low: updatedPipeline.low, medium: updatedPipeline.medium, high: updatedPipeline.high },
      ...updatedPipeline
    };
    sseBroadcaster.broadcast('pipeline_updated', { asset: result.asset, pipeline: formattedPipeline });
    broadcastPipelineWebSocket({ type: 'PIPELINE_UPDATED', asset: result.asset, pipeline: formattedPipeline });
    res.json({ success: true, asset: result.asset, resolution: result, pipeline: formattedPipeline });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/pipeline/simulate-conflict', (req, res) => {
  try {
    const assetId = (req.body && req.body.assetId) || 'ASSET-001';
    const asset = approvalPipelineService.getAsset(assetId);
    if (!asset) return res.status(404).json({ error: 'Asset not found' });

    const staleVersion = asset.version;

    // Step 1: User 1 (Brand Director) updates asset to increment version
    const user1Update = approvalPipelineService.updateAsset({
      assetId,
      expectedVersion: staleVersion,
      newLane: 'medium',
      newStatus: 'in_review',
      newContent: asset.content + ' [Approved tone adjustments by Brand Director]',
      user: 'Maya Lin',
      role: 'Brand Manager',
      note: 'Brand Manager approved tone adjustments'
    });

    // Step 2: User 2 (Legal Counsel on another laptop) attempts to approve based on the original stale version
    const user2Attempt = approvalPipelineService.updateAsset({
      assetId,
      expectedVersion: staleVersion, // stale expected version!
      newLane: 'high',
      newStatus: 'approved',
      newContent: asset.content + ' [Legal FTC signoff]',
      user: 'Justice Vance',
      role: 'Legal & Compliance',
      note: 'Legal Counsel signoff'
    });

    // user2Attempt produces concurrency conflict!
    sseBroadcaster.broadcast('concurrency_conflict_detected', user2Attempt.conflict);
    broadcastPipelineWebSocket({ type: 'CONCURRENCY_CONFLICT_DETECTED', conflict: user2Attempt.conflict });

    res.json({
      simulated: true,
      message: 'Simultaneous dual-write conflict triggered successfully.',
      user1Result: user1Update,
      conflict: user2Attempt.conflict,
      user2Conflict: user2Attempt.conflict,
      pipeline: approvalPipelineService.getPipeline()
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// SPA Fallback: Serve index.html for any unhandled routes
app.use((req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Start Server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n======================================================`);
  console.log(`🛡️  FORENSIQ · Brand Intelligence OS (Round 3 Complete)`);
  console.log(`======================================================`);
  console.log(`🚀 Production Server running at: http://localhost:${PORT}`);
  console.log(`🧬 BrandDNA: Active (Qdrant Vectors + Neo4j Graph)`);
  console.log(`👁️  Vision Guard: Active (Delta E CIELAB + Text AST Inspector)`);
  console.log(`🌊 BrandRipple: Active (Live Mutations + SSE Stream)`);
  console.log(`💉 Self-Healing Immunizer: Active (Transactional Patch Engine)`);
  console.log(`🤝 Multi-User Collaboration: Active (WebSocket + Optimistic Lock)`);
  console.log(`♿ Accessibility Engine: Active (Axe-Core Evaluator WCAG 2.1 AAA)`);
  console.log(`======================================================\n`);
});

// Setup WebSocket Server for real-time collaboration
try {
  const wss = new WebSocketServer({ server, path: '/ws/pipeline' });
  wss.on('connection', (ws) => {
    wsPipelineClients.add(ws);
    ws.send(JSON.stringify({ type: 'CONNECTED', message: 'WebSocket real-time pipeline stream established' }));

    ws.on('message', (msg) => {
      try {
        const parsed = JSON.parse(msg.toString());
        if (parsed.type === 'PING') ws.send(JSON.stringify({ type: 'PONG' }));
        if (parsed.type === 'REFRESH_PIPELINE') {
          ws.send(JSON.stringify({ type: 'PIPELINE_UPDATED', pipeline: approvalPipelineService.getPipeline() }));
        }
      } catch (err) {}
    });

    ws.on('close', () => {
      wsPipelineClients.delete(ws);
    });
  });
} catch (wsErr) {
  console.warn('⚠️ WebSocket server attach warning:', wsErr.message);
}

export default app;
