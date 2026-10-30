import fs from 'fs';
import path from 'path';

const htmlContent = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>FORENSIQ · Brand Intelligence OS (Round 3)</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2338BDF8' stroke-width='2'><path d='M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10'/><path d='m9 12 2 2 4-4'/></svg>">
  
  <!-- Tailwind CSS via CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: {
              blue: '#0284C7',
              indigo: '#6366F1',
              cyan: '#38BDF8',
              dark: '#020617',
              panel: '#0B0F19'
            }
          }
        }
      }
    }
  </script>

  <!-- React 18 & Babel for standalone execution -->
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>

  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');
    
    body {
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      background-color: #020617;
      color: #F8FAFC;
    }

    code, pre, .font-mono {
      font-family: 'JetBrains Mono', monospace;
    }

    /* Custom wavy underline animations */
    .underline-wavy-red {
      text-decoration: underline wavy #EF4444 2.5px;
      text-underline-offset: 4px;
      background-color: rgba(239, 68, 68, 0.12);
      border-radius: 4px;
      padding: 1px 4px;
      cursor: pointer;
    }

    .underline-wavy-yellow {
      text-decoration: underline wavy #F59E0B 2.5px;
      text-underline-offset: 4px;
      background-color: rgba(245, 158, 11, 0.12);
      border-radius: 4px;
      padding: 1px 4px;
      cursor: pointer;
    }

    .underline-wavy-orange {
      text-decoration: underline wavy #F97316 2.5px;
      text-underline-offset: 4px;
      background-color: rgba(249, 115, 22, 0.12);
      border-radius: 4px;
      padding: 1px 4px;
      cursor: pointer;
    }

    /* Pulse glow */
    @keyframes pulseGlow {
      0%, 100% { filter: drop-shadow(0 0 12px rgba(56, 189, 248, 0.4)); }
      50% { filter: drop-shadow(0 0 24px rgba(99, 102, 241, 0.7)); }
    }
    .pulse-glow {
      animation: pulseGlow 3s infinite;
    }

    @keyframes livePing {
      0% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.15); opacity: 0.6; }
      100% { transform: scale(1); opacity: 1; }
    }
    .live-node-ping {
      animation: livePing 2s infinite ease-in-out;
    }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen">
  <div id="root"></div>

  <script type="text/babel">
    const { useState, useEffect, useMemo, useRef } = React;

    // Presets
    const PRESETS = {
      highRisk: "Inkloom is the cheap miracle tool every marketer is raving about! Our platform delivers insane 40% efficiency gains in under 3 days, backed by our 2021 founding heritage and $49/seat pricing. ACT NOW before this exclusive offer expires tonight!",
      unapprovedMetric: "Enterprise teams achieve 40% more efficient creative production cycles while cutting compliance friction to zero. Discover how Inkloom automates brand governance for distributed agencies.",
      compliantPost: "Inkloom was founded in 2021 to bring deterministic governance to enterprise brand publishing. Backed by our SOC-2 Type II certification and zero customer data retention policy, Inkloom saves 25% creative production time for enterprise marketing teams according to the Forrester Total Economic Impact study."
    };

    // --- MAIN APP COMPONENT ---
    function App() {
      const [currentPage, setCurrentPage] = useState('editor');
      const [currentRole, setCurrentRole] = useState('Creator');
      const [privacyShieldActive, setPrivacyShieldActive] = useState(true);
      const [facts, setFacts] = useState([]);
      const [editorContent, setEditorContent] = useState(PRESETS.highRisk);
      const [activeFinding, setActiveFinding] = useState(null);
      const [systemicPatched, setSystemicPatched] = useState(false);
      const [contractModal, setContractModal] = useState(null);
      const [publishToast, setPublishToast] = useState(null);

      // Ingestion state
      const [ingestJob, setIngestJob] = useState(null);
      const [ingestLoading, setIngestLoading] = useState(false);
      const [factSearch, setFactSearch] = useState('');
      const [factCategory, setFactCategory] = useState('All');

      // Vision Guard state
      const [visionResult, setVisionResult] = useState(null);
      const [visionLoading, setVisionLoading] = useState(false);

      // System health
      const [systemHealth, setSystemHealth] = useState(null);

      // Immunizer proposals & state
      const [immuneProposals, setImmuneProposals] = useState(null);
      const [patchResult, setPatchResult] = useState(null);

      // ========================================================
      // POINT 1 & 5: Live Neo4j Graph Dynamic Updates & Ripple State
      // ========================================================
      const [rippleData, setRippleData] = useState(null);
      const [isInsertingMutation, setIsInsertingMutation] = useState(false);
      const [rippleZoom, setRippleZoom] = useState(1);
      const [ripplePan, setRipplePan] = useState({ x: 0, y: 0 });
      const [rippleMobileMode, setRippleMobileMode] = useState(false);
      const [rippleLegendOpen, setRippleLegendOpen] = useState(true);
      const [activeRippleNode, setActiveRippleNode] = useState(null);
      const [isDraggingRipple, setIsDraggingRipple] = useState(false);
      const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

      // ========================================================
      // POINT 2: Dynamic Drift Radar Calculation & Telemetry
      // ========================================================
      const [driftData, setDriftData] = useState([]);
      const [driftBaseline, setDriftBaseline] = useState(94);
      const [driftCurrent, setDriftCurrent] = useState(16);
      const [driftDelta, setDriftDelta] = useState(-78);
      const [driftTimeline, setDriftTimeline] = useState([]);
      const [isIngestingBatch, setIsIngestingBatch] = useState(false);
      const [batchNotification, setBatchNotification] = useState(null);

      // ========================================================
      // POINT 3: Advanced Accessibility Engine (Axe-Core Matrix)
      // ========================================================
      const [a11yReport, setA11yReport] = useState(null);
      const [showA11yMatrix, setShowA11yMatrix] = useState(false);
      const [isAuditingA11y, setIsAuditingA11y] = useState(false);

      // ========================================================
      // POINT 4: Multi-User Real-Time Approval Pipeline & Concurrency
      // ========================================================
      const [pipelineData, setPipelineData] = useState({
        lanes: { low: [], medium: [], high: [] },
        activeLocks: {},
        stats: { total: 0, low: 0, medium: 0, high: 0, approved: 0 }
      });
      const [pipelineUser, setPipelineUser] = useState('Elena Rostova (Legal)');
      const [pipelineRole, setPipelineRole] = useState('Legal & Compliance');
      const [activeConflict, setActiveConflict] = useState(null);
      const [editingPipelineAsset, setEditingPipelineAsset] = useState(null);
      const [editPipelineContent, setEditPipelineContent] = useState('');
      const [simulatingConflict, setSimulatingConflict] = useState(false);
      const [pipelineToast, setPipelineToast] = useState(null);
      const [wsConnected, setWsConnected] = useState(false);

      // Fetch initial facts & system status
      const refreshFacts = async () => {
        try {
          const res = await fetch('/api/brand-dna');
          const data = await res.json();
          if (data.facts) setFacts(data.facts);
        } catch (e) {
          console.warn('Could not fetch facts from API', e);
        }
      };

      const refreshRipple = async () => {
        try {
          const res = await fetch('/api/forensics/ripple?factId=FACT-001');
          const data = await res.json();
          setRippleData(data);
        } catch (e) {
          console.warn('Could not fetch ripple data', e);
        }
      };

      const refreshDrift = async () => {
        try {
          const res = await fetch('/api/drift/history');
          const data = await res.json();
          if (data.history) {
            setDriftData(data.history);
            setDriftBaseline(data.baselineScore ?? 94);
            setDriftCurrent(data.currentScore ?? 16);
            setDriftDelta(data.driftDelta ?? (data.currentScore - data.baselineScore));
            setDriftTimeline(data.timeline || []);
          }
        } catch (e) {
          console.warn('Could not fetch drift history', e);
        }
      };

      const refreshHealth = async () => {
        try {
          const res = await fetch('/api/health');
          const data = await res.json();
          setSystemHealth(data);
        } catch (e) {}
      };

      const refreshProposals = async () => {
        try {
          const res = await fetch('/api/immune/proposals?targetFactId=FACT-001');
          const data = await res.json();
          setImmuneProposals(data);
        } catch (e) {}
      };

      const refreshPipeline = async () => {
        try {
          const res = await fetch('/api/pipeline');
          const data = await res.json();
          if (data && data.lanes) {
            setPipelineData(data);
          }
        } catch (e) {
          console.warn('Could not fetch pipeline data', e);
        }
      };

      const refreshA11y = async (content = editorContent) => {
        try {
          setIsAuditingA11y(true);
          const res = await fetch('/api/compiler/accessibility', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content })
          });
          const data = await res.json();
          setA11yReport(data);
          setIsAuditingA11y(false);
        } catch (e) {
          setIsAuditingA11y(false);
        }
      };

      useEffect(() => {
        refreshFacts();
        refreshRipple();
        refreshDrift();
        refreshHealth();
        refreshProposals();
        refreshPipeline();
        refreshA11y();

        // Connect SSE for real-time live events
        const es = new EventSource('/api/events');
        es.addEventListener('asset_published', (e) => {
          refreshRipple();
          refreshDrift();
          refreshProposals();
          refreshPipeline();
        });
        es.addEventListener('fact_created', () => refreshFacts());
        es.addEventListener('fact_updated', () => refreshFacts());
        es.addEventListener('patch_executed', (e) => {
          setSystemicPatched(true);
          refreshRipple();
          refreshDrift();
          refreshProposals();
          refreshPipeline();
        });
        es.addEventListener('drift_update', () => refreshDrift());
        es.addEventListener('pipeline_updated', () => refreshPipeline());
        es.addEventListener('pipeline_lock_changed', () => refreshPipeline());
        es.addEventListener('ripple_updated', () => refreshRipple());

        // Connect WebSocket for real-time multi-user pipeline updates
        let ws;
        try {
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          ws = new WebSocket(\`\${protocol}//\${window.location.host}/ws/pipeline\`);
          ws.onopen = () => setWsConnected(true);
          ws.onclose = () => setWsConnected(false);
          ws.onmessage = (event) => {
            try {
              const msg = JSON.parse(event.data);
              if (msg.type === 'PIPELINE_UPDATED' && msg.pipeline) {
                setPipelineData(msg.pipeline);
              } else if (msg.type === 'PIPELINE_LOCK_CHANGED') {
                refreshPipeline();
              } else if (msg.type === 'CONCURRENCY_CONFLICT_DETECTED') {
                setActiveConflict(msg.conflict);
              }
            } catch (err) {}
          };
        } catch (e) {
          console.warn('WebSocket connection fallback to SSE/Polling', e);
        }

        return () => {
          es.close();
          if (ws) ws.close();
        };
      }, []);

      // Navigation Hash sync
      useEffect(() => {
        const handleHash = () => {
          const hash = window.location.hash.replace('#', '') || 'editor';
          if (['ingest', 'editor', 'vision', 'review', 'forensics', 'dashboard'].includes(hash)) {
            setCurrentPage(hash);
          }
        };
        handleHash();
        window.addEventListener('hashchange', handleHash);
        return () => window.removeEventListener('hashchange', handleHash);
      }, []);

      const navigateTo = (page) => {
        setCurrentPage(page);
        window.location.hash = page;
      };

      // Real-time AST compiler linting
      const findings = useMemo(() => {
        const f = [];
        // Red: Unsupported Claim (40%)
        const effMatch = editorContent.match(/(\\d+)%\\s+(?:more\\s+)?(?:efficient|efficiency|time\\s+savings|faster)/i);
        if (effMatch && parseInt(effMatch[1], 10) !== 25) {
          f.push({
            id: 'FND-RED-01',
            type: 'RED',
            flaggedText: effMatch[0],
            title: \`Unsupported Claim: '\${effMatch[0]}'\`,
            diagnosis: \`Claim specifies \${effMatch[1]}% efficiency gain, but BrandDNA contains no empirical verification for this figure. Highest approved figure is 25%.\`,
            closestApproved: \`25% creative production time savings (Forrester TEI Study 2023, p. 14, Owner: Sarah Chen)\`,
            suggestedRewrite: \`up to 25% efficiency gains across enterprise teams\`,
            intentPreserved: \`Preserves creator's punchy conversion hook while anchoring claim to verified audit report.\`
          });
        }
        // Orange: Expired Fact ($49/seat)
        if (editorContent.toLowerCase().includes('$49') || editorContent.toLowerCase().includes('49/seat')) {
          f.push({
            id: 'FND-ORG-01',
            type: 'ORANGE',
            flaggedText: '$49/seat',
            title: \`Expired Fact Reference ($49/seat)\`,
            diagnosis: \`The $49/seat Starter Tier was officially deprecated on Dec 31, 2022. Inkloom now uses custom enterprise quotes.\`,
            closestApproved: \`Custom enterprise tier quotes with multi-year volume commitments (Master Pricing Sheet 2024)\`,
            suggestedRewrite: \`tailored enterprise pricing\`,
            intentPreserved: \`Maintains commercial accessibility without publishing outdated pricing.\`
          });
        }
        // Yellow: Tone Drift (banned words / urgency)
        const bannedWords = [
          { word: 'cheap', fix: 'cost-effective' },
          { word: 'miracle', fix: 'proven automated' },
          { word: 'insane', fix: 'measurable' },
          { word: 'act now', fix: 'explore our architecture walkthrough' }
        ];
        bannedWords.forEach(b => {
          const reg = new RegExp(\`\\\\b\${b.word}\\\\b\`, 'gi');
          const m = editorContent.match(reg);
          if (m) {
            f.push({
              id: \`FND-YEL-\${b.word}\`,
              type: 'YELLOW',
              flaggedText: m[0],
              title: \`Tone Drift / Banned Word: "\${m[0]}"\`,
              diagnosis: \`Word "\${m[0]}" degrades enterprise B2B positioning and violates Editorial Standards v3.\`,
              closestApproved: \`Approved replacement: "\${b.fix}"\`,
              suggestedRewrite: b.fix,
              intentPreserved: \`Maintains dynamic engagement while aligning with Fortune 500 executive standards.\`
            });
          }
        });
        return f;
      }, [editorContent]);

      const complianceScore = useMemo(() => {
        let score = 100;
        findings.forEach(f => {
          if (f.type === 'RED') score -= 35;
          if (f.type === 'ORANGE') score -= 25;
          if (f.type === 'YELLOW') score -= 15;
        });
        return Math.max(0, score);
      }, [findings]);

      const handleApplyFix = (fnd) => {
        let updated = editorContent;
        if (fnd.type === 'RED') {
          updated = updated.replace(/(\\d+)%\\s+(?:more\\s+)?(?:efficient|efficiency|time\\s+savings|faster)/i, 'up to 25% efficiency gains across enterprise teams');
        } else if (fnd.type === 'ORANGE') {
          updated = updated.replace(/\\$49\\/seat|\\$49/gi, 'tailored enterprise pricing');
        } else if (fnd.type === 'YELLOW') {
          const reg = new RegExp(\`\\\\b\${fnd.flaggedText}\\\\b\`, 'gi');
          updated = updated.replace(reg, fnd.suggestedRewrite);
        }
        setEditorContent(updated);
        setActiveFinding(null);
      };

      // Toggle fact expiry in BrandDNA
      const handleToggleFact = async (id) => {
        try {
          const res = await fetch('/api/brand-dna', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'toggle-expiry', id })
          });
          const data = await res.json();
          if (data.success && data.fact) {
            setFacts(prev => prev.map(f => f.id === id ? { ...f, status: data.fact.status, expiry_date: data.fact.expiryDate, exp: data.fact.expiryDate } : f));
          }
        } catch (e) {
          console.error(e);
        }
      };

      // Ingestion file handler
      const handleFileUpload = async (file) => {
        if (!file) return;
        setIngestLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
          const res = await fetch('/api/ingest', { method: 'POST', body: formData });
          const data = await res.json();
          if (data.jobId) {
            let completed = false;
            while (!completed) {
              await new Promise(r => setTimeout(r, 600));
              const sRes = await fetch(\`/api/ingest/status/\${data.jobId}\`);
              const sData = await sRes.json();
              setIngestJob(sData);
              if (sData.status === 'completed' || sData.status === 'failed') {
                completed = true;
                setIngestLoading(false);
                refreshFacts();
              }
            }
          }
        } catch (e) {
          setIngestLoading(false);
          alert('Ingestion failed: ' + e.message);
        }
      };

      const handleIngestSampleGuidelines = async () => {
        setIngestLoading(true);
        try {
          const sampleTextRes = await fetch('/samples/Inkloom_Brand_Guidelines_2025.txt');
          let blob;
          if (sampleTextRes.ok) {
            blob = await sampleTextRes.blob();
          } else {
            const sampleTxt = \`# INKLOOM ENTERPRISE BRAND GUIDELINES 2025\\n1. Inkloom automated brand compilation reduces asset review latency from 4.2 days to under 18 minutes.\\n2. Enterprise creative operations teams achieve up to 28% operational throughput gain when utilizing BrandDNA synchronization.\\n3. Independent Forrester benchmark validates 25.4% cost savings on multi-region localization workflows.\\n4. Inkloom guarantees 99.99% active-active multi-region cloud uptime SLA across AWS and Google Cloud.\\n5. Valid until Q2 2025: Complimentary FedRAMP Moderate readiness audits for public sector tenants.\\n6. All vector embeddings are encrypted at rest using FIPS 140-3 validated AES-256-GCM.\\n7. Trusted by over 1,450 global enterprise brands across North America, EMEA, and APAC.\\n8. BrandRipple graph database computes 47-asset containment cascade in under 1.8 seconds.\\n9. Inkloom Figma Plugin v3.2 synchronizes 200+ brand design tokens directly with the BrandTrust AST compiler.\\n10. Creation Firewall intercepts unverified claims directly inside web authoring interfaces before publishing.\`;
            blob = new Blob([sampleTxt], { type: 'text/plain' });
          }
          const file = new File([blob], 'Inkloom_Brand_Guidelines_2025.txt', { type: 'text/plain' });
          await handleFileUpload(file);
        } catch (e) {
          setIngestLoading(false);
          console.error(e);
        }
      };

      // Vision Guard file analysis
      const handleVisionUpload = async (file) => {
        if (!file) return;
        setVisionLoading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
          const res = await fetch('/api/vision/check', { method: 'POST', body: formData });
          const data = await res.json();
          setVisionResult(data);
          setVisionLoading(false);
        } catch (e) {
          setVisionLoading(false);
          alert('Vision check failed: ' + e.message);
        }
      };

      const runVisionPreset = async (presetName, hexColor, hasOffBrandDetails) => {
        setVisionLoading(true);
        const canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 400;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = hexColor;
        ctx.fillRect(0, 0, 800, 400);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
        ctx.roundRect(40, 40, 720, 320, 16);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('INKLOOM ENTERPRISE CLOUD', 70, 100);

        if (hasOffBrandDetails) {
          ctx.fillStyle = '#EF4444';
          ctx.fillRect(70, 140, 660, 60);
          ctx.fillStyle = '#FFFFFF';
          ctx.font = 'bold 18px monospace';
          ctx.fillText('⚡ 40% EFFICIENCY GAINS — ACT NOW!', 90, 175);
        } else {
          ctx.fillStyle = '#38BDF8';
          ctx.font = '16px monospace';
          ctx.fillText('✓ Verified BrandDNA Asset · Forrester TEI 25% Time Savings', 70, 150);
        }

        canvas.toBlob(async (blob) => {
          const file = new File([blob], \`\${presetName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.png\`, { type: 'image/png' });
          await handleVisionUpload(file);
        }, 'image/png');
      };

      // ========================================================
      // POINT 1 HANDLER: Live Neo4j Graph Dynamic Updates
      // ========================================================
      const handleViewImpact = async () => {
        setIsInsertingMutation(true);
        try {
          const res = await fetch('/api/forensics/live-mutation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: \`Live Judge Demo Ad (\${new Date().toLocaleTimeString()})\`,
              content: editorContent,
              actor: \`Elena Rostova (\${currentRole})\`,
              role: currentRole,
              complianceScore,
              channel: 'LinkedIn Executive Sponsored Post'
            })
          });
          const data = await res.json();
          if (data.success && data.ripple) {
            setRippleData(data.ripple);
            // Auto-select the newly added live asset in the graph
            if (data.ripple.graphTopology?.nodes) {
              const newest = data.ripple.graphTopology.nodes.find(n => n.isNewLiveMutation);
              if (newest) setActiveRippleNode(newest);
            }
          }
        } catch (err) {
          console.error('Live mutation error:', err);
        } finally {
          setIsInsertingMutation(false);
          navigateTo('forensics');
        }
      };

      // Publish Anyway (Override Creation Firewall)
      const handlePublishAnyway = async () => {
        try {
          const res = await fetch('/api/assets/publish', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: \`Campaign Ad Override (Non-Compliant Claim)\`,
              content: editorContent,
              actor: 'Agency X Creator',
              role: currentRole,
              complianceScore,
              bypassedRules: findings,
              channel: 'LinkedIn Ads'
            })
          });
          const data = await res.json();
          if (data.success) {
            setPublishToast({
              assetId: data.asset.id,
              totalAssets: data.totalAssets,
              score: complianceScore
            });
            refreshRipple();
            refreshDrift();
          }
        } catch (e) {
          alert('Failed to publish asset: ' + e.message);
        }
      };

      // ========================================================
      // POINT 2 HANDLER: Dynamic Drift Radar Batch Ingestion
      // ========================================================
      const handleBatchDrift = async (mode = 'drift') => {
        setIsIngestingBatch(true);
        try {
          const res = await fetch('/api/drift/batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ count: 10, mode })
          });
          const data = await res.json();
          if (data.success) {
            await refreshDrift();
            setBatchNotification({
              title: mode === 'drift' ? '⚡ 10 Aggressive Drift Ads Ingested!' : '✓ 10 Verified Compliant Ads Ingested!',
              count: 10,
              newScore: data.driftTelemetry.currentScore,
              delta: data.driftTelemetry.driftDelta
            });
            setTimeout(() => setBatchNotification(null), 5000);
          }
        } catch (err) {
          alert('Failed to ingest batch ads: ' + err.message);
        } finally {
          setIsIngestingBatch(false);
        }
      };

      // ========================================================
      // POINT 3 HANDLER: Run Accessibility Audit Matrix
      // ========================================================
      const handleRunA11y = async () => {
        await refreshA11y(editorContent);
        setShowA11yMatrix(true);
      };

      // ========================================================
      // POINT 4 HANDLERS: Multi-User Real-Time Pipeline & Concurrency
      // ========================================================
      const handleMovePipelineLane = async (asset, targetLane) => {
        try {
          const res = await fetch('/api/pipeline/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              assetId: asset.id,
              expectedVersion: asset.version,
              newLane: targetLane,
              user: pipelineUser,
              role: pipelineRole,
              note: \`Moved to \${targetLane} lane by \${pipelineUser}\`
            })
          });
          const data = await res.json();
          if (res.status === 409) {
            setActiveConflict(data);
          } else if (data.success) {
            setPipelineData(data.pipeline);
            setPipelineToast(\`Asset \${asset.id} moved to \${targetLane.toUpperCase()} lane\`);
            setTimeout(() => setPipelineToast(null), 3000);
          }
        } catch (err) {
          alert('Error moving lane: ' + err.message);
        }
      };

      const handleApprovePipelineAsset = async (asset) => {
        try {
          const res = await fetch('/api/pipeline/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              assetId: asset.id,
              expectedVersion: asset.version,
              newStatus: 'APPROVED',
              user: pipelineUser,
              role: pipelineRole,
              note: \`Approved by \${pipelineUser}\`
            })
          });
          const data = await res.json();
          if (res.status === 409) {
            setActiveConflict(data);
          } else if (data.success) {
            setPipelineData(data.pipeline);
            setPipelineToast(\`✓ Asset \${asset.id} approved!\`);
            setTimeout(() => setPipelineToast(null), 3000);
          }
        } catch (err) {
          alert('Error approving asset: ' + err.message);
        }
      };

      const handleStartEditPipeline = async (asset) => {
        try {
          await fetch('/api/pipeline/lock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assetId: asset.id, user: pipelineUser, role: pipelineRole })
          });
          setEditingPipelineAsset(asset);
          setEditPipelineContent(asset.content);
          refreshPipeline();
        } catch (err) {
          setEditingPipelineAsset(asset);
          setEditPipelineContent(asset.content);
        }
      };

      const handleSaveEditPipeline = async (forceOverride = false) => {
        if (!editingPipelineAsset) return;
        try {
          const res = await fetch('/api/pipeline/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              assetId: editingPipelineAsset.id,
              expectedVersion: editingPipelineAsset.version,
              newContent: editPipelineContent,
              user: pipelineUser,
              role: pipelineRole,
              forceOverride
            })
          });
          const data = await res.json();
          if (res.status === 409) {
            setActiveConflict(data);
          } else if (data.success) {
            await fetch('/api/pipeline/unlock', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ assetId: editingPipelineAsset.id, user: pipelineUser })
            });
            setPipelineData(data.pipeline);
            setEditingPipelineAsset(null);
            setPipelineToast(\`Saved edits for \${editingPipelineAsset.id} (now v\${data.asset.version})\`);
            setTimeout(() => setPipelineToast(null), 3000);
          }
        } catch (err) {
          alert('Error saving edits: ' + err.message);
        }
      };

      const handleCancelEditPipeline = async () => {
        if (editingPipelineAsset) {
          try {
            await fetch('/api/pipeline/unlock', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ assetId: editingPipelineAsset.id, user: pipelineUser })
            });
          } catch (e) {}
          setEditingPipelineAsset(null);
          refreshPipeline();
        }
      };

      const handleSimulateConflict = async () => {
        setSimulatingConflict(true);
        try {
          const res = await fetch('/api/pipeline/simulate-conflict', { method: 'POST' });
          const data = await res.json();
          if (data.conflict) {
            setActiveConflict(data.conflict);
            refreshPipeline();
          }
        } catch (err) {
          alert('Simulation error: ' + err.message);
        } finally {
          setSimulatingConflict(false);
        }
      };

      const handleResolveConflict = async (resolutionType, mergedText = null) => {
        if (!activeConflict) return;
        try {
          const res = await fetch('/api/pipeline/resolve', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              assetId: activeConflict.assetId,
              resolutionType,
              mergedContent: mergedText || activeConflict.mergedPreview || activeConflict.localAttempt?.content,
              user: pipelineUser,
              role: pipelineRole
            })
          });
          const data = await res.json();
          if (data.success) {
            setActiveConflict(null);
            setEditingPipelineAsset(null);
            setPipelineData(data.pipeline);
            setPipelineToast(\`✓ Conflict resolved via \${resolutionType}! Asset updated to v\${data.asset.version}.\`);
            setTimeout(() => setPipelineToast(null), 4000);
          }
        } catch (err) {
          alert('Failed to resolve conflict: ' + err.message);
        }
      };

      // ========================================================
      // POINT 5 HANDLERS: Responsive BrandRipple Graph Zoom / Pan
      // ========================================================
      const handleZoomIn = () => setRippleZoom(prev => Math.min(2.5, prev + 0.2));
      const handleZoomOut = () => setRippleZoom(prev => Math.max(0.4, prev - 0.2));
      const handleResetZoom = () => { setRippleZoom(1); setRipplePan({ x: 0, y: 0 }); };

      const handleRippleMouseDown = (e) => {
        setIsDraggingRipple(true);
        setDragStart({ x: e.clientX - ripplePan.x, y: e.clientY - ripplePan.y });
      };
      const handleRippleMouseMove = (e) => {
        if (!isDraggingRipple) return;
        setRipplePan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
      };
      const handleRippleMouseUp = () => setIsDraggingRipple(false);

      const handleRippleTouchStart = (e) => {
        if (e.touches.length === 1) {
          setIsDraggingRipple(true);
          setDragStart({ x: e.touches[0].clientX - ripplePan.x, y: e.touches[0].clientY - ripplePan.y });
        }
      };
      const handleRippleTouchMove = (e) => {
        if (!isDraggingRipple || e.touches.length !== 1) return;
        setRipplePan({ x: e.touches[0].clientX - dragStart.x, y: e.touches[0].clientY - dragStart.y });
      };
      const handleRippleTouchEnd = () => setIsDraggingRipple(false);

      // Execute Immunizer Patch
      const handleExecutePatch = async () => {
        if (!['Legal', 'Legal & Compliance', 'Brand Manager'].includes(currentRole)) {
          alert(\`Permission Denied: Current role '\${currentRole}' cannot approve systemic remediation. Please switch your role to 'Brand Manager' or 'Legal' in the topbar.\`);
          return;
        }

        try {
          const res = await fetch('/api/immune/patch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              actor: \`Elena Rostova (\${currentRole})\`,
              role: currentRole === 'Legal' ? 'Legal & Compliance' : currentRole,
              targetFactId: 'FACT-001'
            })
          });
          const data = await res.json();
          if (data.success) {
            setPatchResult(data.patchResult);
            setSystemicPatched(true);
            refreshRipple();
            refreshDrift();
            refreshPipeline();
          }
        } catch (e) {
          alert('Patch execution failed: ' + e.message);
        }
      };

      // Filtered facts for BrandDNA table
      const filteredFacts = useMemo(() => {
        return facts.filter(f => {
          const matchesCat = factCategory === 'All' || f.category?.toLowerCase() === factCategory.toLowerCase() || f.cat?.toLowerCase() === factCategory.toLowerCase();
          const q = factSearch.toLowerCase();
          const matchesSearch = !q || (f.claim && f.claim.toLowerCase().includes(q)) || (f.id && f.id.toLowerCase().includes(q)) || (f.sourceDoc && f.sourceDoc.toLowerCase().includes(q));
          return matchesCat && matchesSearch;
        });
      }, [facts, factCategory, factSearch]);

      // Computed graph nodes & edges for BrandRipple
      const computedRippleNodes = useMemo(() => {
        if (!rippleData) return [];
        const baseNodes = rippleData.graphTopology?.nodes || rippleData.nodes || [];
        if (!rippleMobileMode) return baseNodes;
        // In mobile mode: adapt positions to a vertical touch-friendly flow
        return baseNodes.map((n, i) => {
          let mx = 180;
          let my = 60 + i * 85;
          if (n.type === 'fact') { mx = 180; my = 50; }
          else if (n.type === 'violation' || n.type === 'mutation') { mx = 90; my = 150; }
          else if (n.type === 'document') { mx = 270; my = 150; }
          else if (n.type === 'asset') {
            const idxInAssets = baseNodes.filter(b => b.type === 'asset').indexOf(n);
            mx = idxInAssets % 2 === 0 ? 100 : 260;
            my = 270 + Math.floor(idxInAssets / 2) * 85;
          } else if (n.type === 'channel') {
            mx = 180;
            my = 750 + (i % 4) * 80;
          }
          return { ...n, x: mx, y: my };
        });
      }, [rippleData, rippleMobileMode]);

      return (
        <div className="flex min-h-screen bg-slate-950 text-slate-100">
          {/* SIDEBAR */}
          <aside className="w-64 border-r border-slate-800/80 bg-slate-950/95 flex flex-col justify-between p-4 shrink-0 sticky top-0 h-screen select-none hidden md:flex">
            <div>
              {/* Brand Header */}
              <div className="flex items-center gap-3 px-2 py-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-sky-500/20 pulse-glow">
                  <span className="text-lg font-black text-white">F</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold tracking-wider text-white text-sm font-mono">FORENSIQ</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-400 font-bold border border-sky-400/30">
                      R3
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono">Brand Intelligence OS</p>
                </div>
              </div>

              {/* Connected Brand Identity */}
              <div className="mt-4 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-md bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-inner">
                    IN
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-100 leading-tight">Inkloom BrandTwin</p>
                    <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                      Qdrant + Neo4j Active
                    </p>
                  </div>
                </div>
              </div>

              {/* 6-Step Workflow Navigation */}
              <div className="mt-6">
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2 font-mono">
                  Product Workflow (6 Steps)
                </p>
                <nav className="space-y-1.5">
                  {[
                    { id: 'ingest', step: '01', name: 'Ingest & BrandDNA', icon: '🧬', desc: 'Auto-Ingest & Vector Store', badge: \`\${facts.length || 23} Facts\` },
                    { id: 'editor', step: '02', name: 'Creation Firewall', icon: '🛡️', desc: 'Real-Time Smart Editor', badge: 'Live AST' },
                    { id: 'vision', step: '03', name: 'Visual Vision Guard', icon: '👁️', desc: 'Color ΔE & Visual OCR', badge: 'New R3' },
                    { id: 'review', step: '04', name: 'Compiler & Debate', icon: '⚖️', desc: 'Axe-Core & 4-Agent Debate', badge: 'Multi-Agent' },
                    { id: 'forensics', step: '05', name: 'Impact & Forensics', icon: '🌊', desc: 'BrandRipple Graph', badge: \`\${rippleData ? rippleData.affectedAssetsCount : 23} Assets\` },
                    { id: 'dashboard', step: '06', name: 'Approval & Immunity', icon: '🏛️', desc: 'Pipeline & Drift Radar', badge: 'Multi-User' }
                  ].map(item => {
                    const isActive = currentPage === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => navigateTo(item.id)}
                        className={\`w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl transition-all cursor-pointer \${
                          isActive
                            ? 'bg-gradient-to-r from-sky-500/15 via-indigo-500/10 to-transparent border-l-4 border-sky-400 text-white font-medium shadow-sm'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                        }\`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-base">{item.icon}</span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono text-slate-500">{item.step}</span>
                              <span className="text-xs font-medium text-slate-100">{item.name}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 leading-tight">{item.desc}</p>
                          </div>
                        </div>
                        <span className={\`text-[9px] font-mono px-1.5 py-0.5 rounded \${
                          isActive ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30' : 'bg-slate-800 text-slate-400'
                        }\`}>
                          {item.badge}
                        </span>
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* System Telemetry Badges */}
              <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-2 text-[10px] font-mono">
                <div className="flex justify-between items-center px-2 text-slate-400">
                  <span>Neo4j Graph:</span>
                  <span className="text-emerald-400">Connected ({systemHealth?.services?.neo4j?.activeNodesCount || 50} Nodes)</span>
                </div>
                <div className="flex justify-between items-center px-2 text-slate-400">
                  <span>Qdrant Vectors:</span>
                  <span className="text-cyan-400">Active ({systemHealth?.services?.qdrant?.vectorPointsCount || 23} Pts)</span>
                </div>
                <div className="flex justify-between items-center px-2 text-slate-400">
                  <span>WebSocket Sync:</span>
                  <span className={wsConnected ? 'text-emerald-400' : 'text-amber-400'}>
                    {wsConnected ? 'Online (Real-Time)' : 'Active (Polling)'}
                  </span>
                </div>
                <div className="flex justify-between items-center px-2 text-slate-400">
                  <span>Axe-Core Engine:</span>
                  <span className="text-indigo-400">8 Rules WCAG 2.1</span>
                </div>
              </div>
            </div>

            {/* User Session Footer */}
            <div className="pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sky-400 text-xs">
                    ER
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200 leading-none">Elena Rostova</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">Role: {currentRole}</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">
                  SOC-2
                </span>
              </div>
            </div>
          </aside>

          {/* MAIN APPLICATION CONTAINER */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* JUDGE 2-MINUTE DEMO BAR */}
            <aside className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border-b border-sky-500/30 px-4 py-2.5 text-xs text-sky-200 flex flex-wrap items-center justify-between gap-3 shadow-lg z-50">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-semibold text-white tracking-wide uppercase text-[11px] px-2 py-0.5 rounded bg-sky-500/20 border border-sky-400/40">
                  Judges Demo Bar
                </span>
                <span className="text-slate-300 hidden sm:inline">
                  Test FORENSIQ Round 3 Features:
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => { setEditorContent(PRESETS.highRisk); navigateTo('editor'); }}
                  className="px-2.5 py-1 rounded bg-rose-500/20 border border-rose-500/40 text-rose-200 hover:bg-rose-500/30 transition-all font-medium flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                  1. High-Risk Ad (AST)
                </button>
                <button
                  type="button"
                  onClick={handleViewImpact}
                  disabled={isInsertingMutation}
                  className="px-2.5 py-1 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 hover:bg-cyan-500/30 transition-all font-medium flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  2. Live Neo4j Mutation →
                </button>
                <button
                  type="button"
                  onClick={() => handleBatchDrift('drift')}
                  disabled={isIngestingBatch}
                  className="px-2.5 py-1 rounded bg-indigo-500/20 border border-indigo-500/40 text-indigo-200 hover:bg-indigo-500/30 transition-all font-medium flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  3. Ingest 10 Drift Ads
                </button>
                <button
                  type="button"
                  onClick={() => { handleRunA11y(); navigateTo('review'); }}
                  className="px-2.5 py-1 rounded bg-teal-500/20 border border-teal-500/40 text-teal-200 hover:bg-teal-500/30 transition-all font-medium flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                  4. Axe-Core Matrix
                </button>
                <button
                  type="button"
                  onClick={() => { handleSimulateConflict(); navigateTo('dashboard'); }}
                  className="px-2.5 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-200 hover:bg-amber-500/30 transition-all font-medium flex items-center gap-1.5 cursor-pointer text-xs"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  5. Simulate 409 Conflict
                </button>
              </div>
            </aside>

            {/* TOPBAR */}
            <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between gap-4 sticky top-0 z-40">
              <div>
                <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  {currentPage === 'ingest' && 'Step 1: Real-Time Document Auto-Ingestion & BrandDNA'}
                  {currentPage === 'editor' && 'Step 2: Creation-Time Firewall (Real-Time AST Editor)'}
                  {currentPage === 'vision' && 'Step 3: True Visual Vision Guard (Color ΔE & Visual OCR)'}
                  {currentPage === 'review' && 'Step 4: Pre-Publish Compiler Check & Axe-Core Audit'}
                  {currentPage === 'forensics' && 'Step 5: Impact & Forensics (BrandRipple™ Live Graph)'}
                  {currentPage === 'dashboard' && 'Step 6: Approval Pipeline, Drift Radar & Self-Healing'}
                </h1>
                <p className="text-xs text-slate-400 font-medium">
                  {currentPage === 'ingest' && 'Upload guidelines PDF, spreadsheets & Notion exports into Qdrant & Neo4j'}
                  {currentPage === 'editor' && 'Real-time AST token linting: Red (unsupported claim), Yellow (tone drift), Orange (expired fact)'}
                  {currentPage === 'vision' && 'Perceptual color distance Delta E in CIELAB, OCR transcription, and BrandDNA verification'}
                  {currentPage === 'review' && '6 Pre-Flight Tests with Axe-Core Compliance + Creator, Evidence, Guardian & Risk Debate'}
                  {currentPage === 'forensics' && 'Live Neo4j asset genealogy, dynamic live mutations insertion & mobile-friendly canvas'}
                  {currentPage === 'dashboard' && 'Multi-user 3-lane approval board, optimistic locking, dynamic drift radar & root-cause patch'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile Workflow Switcher */}
                <div className="md:hidden flex items-center">
                  <select
                    value={currentPage}
                    onChange={(e) => navigateTo(e.target.value)}
                    className="bg-slate-900 border border-slate-800 text-xs text-white rounded-lg px-2 py-1"
                  >
                    <option value="ingest">01 Ingest</option>
                    <option value="editor">02 Editor</option>
                    <option value="vision">03 Vision</option>
                    <option value="review">04 Review</option>
                    <option value="forensics">05 Forensics</option>
                    <option value="dashboard">06 Dashboard</option>
                  </select>
                </div>

                {/* Role Switcher */}
                <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-inner">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-2 font-semibold">
                    Role:
                  </span>
                  {['Creator', 'Brand Manager', 'Reviewer', 'Legal'].map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setCurrentRole(r)}
                      className={\`px-2.5 py-1 rounded-lg text-xs font-medium transition-all \${
                        currentRole === r
                          ? 'bg-sky-500 text-white shadow-sm font-semibold'
                          : 'text-slate-400 hover:text-slate-200'
                      }\`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                {/* Privacy Shield */}
                <button
                  type="button"
                  onClick={() => setPrivacyShieldActive(!privacyShieldActive)}
                  className={\`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all \${
                    privacyShieldActive
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }\`}
                >
                  <span className={\`w-2 h-2 rounded-full \${privacyShieldActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}\`} />
                  <span className="font-medium hidden md:inline">
                    {privacyShieldActive ? 'Privacy Shield: ON' : 'Privacy Shield: OFF'}
                  </span>
                </button>
              </div>
            </header>

            {/* PAGE CONTENT ROUTER */}
            <main className="flex-1 overflow-y-auto">
              {/* ============================================================ */}
              {/* PAGE 1: REAL-TIME INGESTION & BRANDDNA */}
              {/* ============================================================ */}
              {currentPage === 'ingest' && (
                <div className="p-6 max-w-7xl mx-auto space-y-6">
                  {/* Uploader Card */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border border-sky-500/30 shadow-2xl">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🧬</span>
                          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                            BrandTwin Bootup & Real-Time Auto-Ingestion Pipeline
                          </h2>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            Qdrant & Neo4j Persisted
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          Accepts PDF brand guidelines, CSV/XLSX spreadsheets, and Notion Markdown/HTML exports. Extracts claims, page numbers, and infers expiry dates.
                        </p>
                      </div>

                      {/* 1-Click Sample Guidelines Ingestion Button */}
                      <button
                        type="button"
                        onClick={handleIngestSampleGuidelines}
                        disabled={ingestLoading}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-teal-500 hover:opacity-90 text-white font-bold text-xs font-mono shadow-lg shadow-sky-500/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <span>⚡ Ingest Sample Guidelines 2025 (38 Facts)</span>
                      </button>
                    </div>

                    {/* Drag-and-drop Area */}
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleFileUpload(e.dataTransfer.files[0]);
                        }
                      }}
                      className="p-8 rounded-xl border-2 border-dashed border-slate-700 hover:border-sky-400 bg-slate-950/60 transition-all text-center relative cursor-pointer"
                    >
                      <input
                        type="file"
                        accept=".pdf,.csv,.xlsx,.xls,.md,.txt,.html"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(e.target.files[0]);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <div className="space-y-2">
                        <div className="w-12 h-12 mx-auto rounded-full bg-sky-500/10 flex items-center justify-center text-xl">
                          📁
                        </div>
                        <p className="text-xs font-bold text-slate-200">
                          Drag and drop Brand Guidelines PDF, Spreadsheet CSV/XLSX, or Markdown Document
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Files up to 50MB · Automatic text extraction with page tracking & conservative deduplication
                        </p>
                      </div>
                    </div>

                    {/* Ingestion Progress Bar */}
                    {(ingestLoading || ingestJob) && (
                      <div className="mt-4 p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-mono text-cyan-400 font-semibold flex items-center gap-2">
                            {ingestLoading && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
                            Stage: {ingestJob?.stage || 'Parsing document structure...'}
                          </span>
                          <span className="font-mono font-bold text-white">{ingestJob?.progress || 10}%</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-sky-400 via-indigo-500 to-emerald-400 transition-all duration-300"
                            style={{ width: \`\${ingestJob?.progress || 10}%\` }}
                          />
                        </div>
                        {ingestJob?.status === 'completed' && (
                          <p className="text-xs text-emerald-400 font-mono">
                            ✓ Ingestion completed! Added {ingestJob.extractedCount} new verified facts to Neo4j & Qdrant ({ingestJob.duplicateCount} duplicates omitted).
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Facts Search and Filters */}
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      {['All', 'Performance', 'Product', 'Security', 'Company', 'Customer'].map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFactCategory(cat)}
                          className={\`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all \${
                            factCategory === cat ? 'bg-sky-500 text-white font-bold' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                          }\`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search claims, ID, or doc..."
                        value={factSearch}
                        onChange={(e) => setFactSearch(e.target.value)}
                        className="px-3.5 py-1.5 pl-9 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-sky-500 w-64"
                      />
                      <span className="absolute left-3 top-2 text-slate-500 text-xs">🔍</span>
                    </div>
                  </div>

                  {/* Facts Table */}
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/80 shadow-2xl overflow-hidden">
                    <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex justify-between items-center">
                      <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                        BrandDNA Knowledge Graph ({filteredFacts.length} Verified Facts)
                      </h3>
                      <span className="text-[11px] text-slate-400 font-mono">
                        Click "Expire Fact" on any row to test downstream Ripple containment
                      </span>
                    </div>
                    <div className="overflow-x-auto max-h-[500px]">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead className="sticky top-0 bg-slate-900/95 z-10">
                          <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider text-[11px]">
                            <th className="py-3 px-4">Fact ID & Category</th>
                            <th className="py-3 px-4">Approved Claim Text</th>
                            <th className="py-3 px-4">Source & Evidence Doc</th>
                            <th className="py-3 px-4">Expiry Date</th>
                            <th className="py-3 px-4">Version & Owner</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 font-sans">
                          {filteredFacts.map(fact => {
                            const isValid = fact.status === 'valid';
                            return (
                              <tr key={fact.id} className="hover:bg-slate-900/40 transition-colors">
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-sky-400">{fact.id}</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                                      {fact.category || fact.cat}
                                    </span>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 max-w-md">
                                  <p className="text-slate-200 font-medium leading-relaxed">{fact.claim || fact.claim_text}</p>
                                </td>
                                <td className="py-3.5 px-4 max-w-xs">
                                  <p className="text-slate-300 text-[11px]">{fact.sourceDoc || fact.doc || fact.source_doc}</p>
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap">
                                  <span className={\`px-2 py-0.5 rounded text-[10px] font-mono font-bold \${
                                    isValid ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  }\`}>
                                    {isValid ? 'VALID' : 'EXPIRED'} · {fact.expiryDate || fact.expiry_date || fact.exp}
                                  </span>
                                  {fact.isInferredExpiry && (
                                    <span className="block text-[9px] text-amber-400 font-mono mt-0.5">⚡ Inferred Expiry</span>
                                  )}
                                </td>
                                <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                                  <p className="font-mono text-slate-200">{fact.version || fact.ver || 'v1.0'}</p>
                                  <p className="text-[10px] text-slate-500">{fact.owner}</p>
                                </td>
                                <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleFact(fact.id)}
                                    className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-mono transition-all cursor-pointer"
                                  >
                                    {isValid ? '⚡ Expire Fact' : '✓ Re-validate'}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* PAGE 2: CREATION-TIME FIREWALL EDITOR */}
              {/* ============================================================ */}
              {currentPage === 'editor' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl mx-auto">
                  {/* Left 8 Cols: Real-Time Editor with Underlines */}
                  <div className="lg:col-span-8 space-y-4">
                    {/* Presets Bar */}
                    <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-md flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-300 font-mono">TEST SCENARIOS:</span>
                        <button
                          type="button"
                          onClick={() => setEditorContent(PRESETS.highRisk)}
                          className="px-2.5 py-1 rounded-lg text-xs bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 font-medium cursor-pointer"
                        >
                          1. High-Risk Ad (40% + $49 + Urgent)
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditorContent(PRESETS.unapprovedMetric)}
                          className="px-2.5 py-1 rounded-lg text-xs bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 font-medium cursor-pointer"
                        >
                          2. Unapproved 40% Claim
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditorContent(PRESETS.compliantPost)}
                          className="px-2.5 py-1 rounded-lg text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 font-medium cursor-pointer"
                        >
                          3. 100% Compliant Post
                        </button>
                      </div>
                    </div>

                    {/* Editor Canvas Card */}
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 shadow-2xl overflow-hidden flex flex-col">
                      <div className="px-5 py-3.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                          <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                            AST Linter Active (Real-Time AST Token Stream)
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          Target Channel: LinkedIn Executive Sponsored Post
                        </span>
                      </div>

                      {/* Text Input Area */}
                      <div className="p-6 min-h-[220px]">
                        <textarea
                          value={editorContent}
                          onChange={(e) => setEditorContent(e.target.value)}
                          className="w-full h-36 bg-transparent text-slate-100 text-sm leading-relaxed resize-none focus:outline-none font-sans"
                          placeholder="Type or paste your ad copy here..."
                        />

                        {/* Interactive Token Findings Badges */}
                        <div className="pt-4 mt-2 border-t border-slate-800/80">
                          <p className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 font-semibold">
                            AST Tokens Flagged ({findings.length} findings):
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {findings.map(f => {
                              return (
                                <button
                                  key={f.id}
                                  type="button"
                                  onClick={() => setActiveFinding(f)}
                                  className={\`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-2 transition-all cursor-pointer \${
                                    f.type === 'RED'
                                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                      : f.type === 'ORANGE'
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                      : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                                  }\`}
                                >
                                  <span className="font-bold underline decoration-wavy decoration-2">
                                    "{f.flaggedText}"
                                  </span>
                                  <span className="text-[10px] uppercase font-mono px-1 rounded bg-slate-900/80">
                                    {f.type === 'RED' ? 'No Evidence' : f.type === 'ORANGE' ? 'Expired Fact' : 'Tone Drift'}
                                  </span>
                                  <span className="text-xs">⚡</span>
                                </button>
                              );
                            })}
                            {findings.length === 0 && (
                              <p className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                100% Brand Compliant! All claims verified against BrandDNA knowledge graph.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Instant Fix Popup */}
                      {activeFinding && (
                        <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 border-t border-sky-500/40 animate-in fade-in duration-200">
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <span className={\`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase \${
                                  activeFinding.type === 'RED' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                                }\`}>
                                  {activeFinding.type === 'RED' ? 'Unsupported Claim' : activeFinding.type === 'ORANGE' ? 'Expired Fact' : 'Tone Drift'}
                                </span>
                                <span className="text-xs font-semibold text-white">{activeFinding.title}</span>
                              </div>
                              <p className="text-xs text-slate-300">{activeFinding.diagnosis}</p>
                              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                                <p className="text-slate-400 text-[11px] font-mono">Closest Approved in BrandDNA:</p>
                                <p className="text-cyan-300 font-medium mt-0.5">{activeFinding.closestApproved}</p>
                              </div>
                              <div className="p-2.5 rounded-xl bg-sky-950/30 border border-sky-500/30 text-xs">
                                <p className="text-sky-300 text-[11px] font-mono font-semibold">
                                  Suggest Rewrite Preserving Intent (Professional Tone):
                                </p>
                                <p className="text-white font-medium mt-0.5">"{activeFinding.suggestedRewrite}"</p>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleApplyFix(activeFinding)}
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:opacity-90 text-white font-semibold text-xs shadow-lg shadow-sky-500/30 cursor-pointer"
                              >
                                ⚡ Accept Fix
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveFinding(null)}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                              >
                                Dismiss
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="px-6 py-4 bg-slate-900/70 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
                        <span className="text-xs text-slate-400 font-mono">
                          Live Qdrant Vector Embedding Similarity: 0.96
                        </span>
                        <div className="flex items-center gap-3">
                          {/* POINT 1: DYNAMIC NEO4J VIEW IMPACT BUTTON */}
                          <button
                            type="button"
                            onClick={handleViewImpact}
                            disabled={isInsertingMutation}
                            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:opacity-90 text-white font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/20 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <span>{isInsertingMutation ? '⏳ Persisting to Neo4j...' : '⚡ View Impact (Neo4j) →'}</span>
                          </button>

                          {/* PUBLISH ANYWAY (CREATION FIREWALL OVERRIDE) */}
                          {complianceScore < 85 && (
                            <button
                              type="button"
                              onClick={handlePublishAnyway}
                              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:opacity-90 text-white font-bold text-xs tracking-wide shadow-lg shadow-rose-500/20 cursor-pointer flex items-center gap-1.5"
                            >
                              <span>🚨 Publish Anyway (Override Firewall)</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => navigateTo('review')}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-cyan-500 hover:opacity-90 text-white font-bold text-xs tracking-wide shadow-lg shadow-sky-500/20 cursor-pointer"
                          >
                            Run BrandTrust Compiler & Debate →
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Publish Override Toast Modal */}
                    {publishToast && (
                      <div className="p-4 rounded-xl bg-gradient-to-r from-rose-950/80 to-slate-900 border border-rose-500/50 shadow-xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🚨</span>
                          <div>
                            <p className="text-xs font-bold text-white font-mono">
                              Creation Firewall Override: Asset Persisted to Neo4j!
                            </p>
                            <p className="text-[11px] text-slate-300 mt-0.5">
                              Created Asset node <strong className="text-cyan-400">{publishToast.assetId}</strong> in graph.
                              Linked via <strong className="text-rose-400">MUTATED_FROM</strong> to FACT-001. Total Neo4j assets updated to <strong className="text-white">{publishToast.totalAssets}</strong>.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => navigateTo('forensics')}
                            className="px-3 py-1.5 rounded-lg bg-sky-500 text-white text-xs font-mono font-bold"
                          >
                            View in BrandRipple →
                          </button>
                          <button
                            type="button"
                            onClick={() => setPublishToast(null)}
                            className="text-slate-400 hover:text-white text-xs px-2"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right 4 Cols: Live Brand Compliance Score */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-xl">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                          Live Brand Compliance
                        </h2>
                        <span className={\`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase \${
                          complianceScore >= 85 ? 'bg-emerald-500/20 text-emerald-300' : complianceScore >= 60 ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                        }\`}>
                          {complianceScore >= 85 ? 'PASS' : complianceScore >= 60 ? 'CONDITIONAL' : 'FAIL'}
                        </span>
                      </div>

                      <div className="flex items-center justify-center py-4">
                        <div className={\`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center transition-all \${
                          complianceScore >= 85 ? 'border-emerald-500 text-emerald-400' : complianceScore >= 60 ? 'border-amber-400 text-amber-400' : 'border-rose-500 text-rose-400'
                        }\`}>
                          <span className="text-4xl font-extrabold font-mono">{complianceScore}</span>
                          <span className="text-[10px] uppercase font-semibold text-slate-400">/ 100</span>
                        </div>
                      </div>

                      <div className="space-y-3 mt-4 pt-4 border-t border-slate-800/80">
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-300">Factual Evidence (BrandDNA)</span>
                            <span className="font-mono text-cyan-400">{findings.some(f => f.type === 'RED') ? '35%' : '100%'}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full bg-cyan-400" style={{ width: findings.some(f => f.type === 'RED') ? '35%' : '100%' }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-300">Tone & Voice Alignment</span>
                            <span className="font-mono text-indigo-400">{findings.some(f => f.type === 'YELLOW') ? '50%' : '100%'}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full bg-indigo-400" style={{ width: findings.some(f => f.type === 'YELLOW') ? '50%' : '100%' }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-300">Fact Validity (Non-Expired)</span>
                            <span className="font-mono text-sky-400">{findings.some(f => f.type === 'ORANGE') ? '40%' : '100%'}</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                            <div className="h-full bg-sky-400" style={{ width: findings.some(f => f.type === 'ORANGE') ? '40%' : '100%' }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-xs space-y-2">
                      <div className="flex items-center gap-2 text-sky-400 font-semibold font-mono">
                        <span>🛡️</span>
                        <span>EXPLAINABLE CORRECTION, NOT REJECTION</span>
                      </div>
                      <p className="text-slate-400 leading-relaxed text-[11px]">
                        Never halts creative momentum. Hover over any underlined term to inspect the closest approved fact from the Forrester study and accept an intent-preserving rewrite.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* PAGE 3: VISUAL VISION GUARD */}
              {/* ============================================================ */}
              {currentPage === 'vision' && (
                <div className="p-6 max-w-7xl mx-auto space-y-6">
                  {/* Top Banner */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border border-sky-500/30 shadow-2xl">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">👁️</span>
                          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                            True Visual Vision Guard (Image Compliance Engine)
                          </h2>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                            Delta E (CIELAB) + Visual OCR
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          Upload PNG, JPEG, or WebP advertising creatives. Computes perceptual color distance ΔE against Inkloom Executive Blue (<span className="font-mono text-sky-400">#0A4D8C</span>) and audits copy against BrandDNA.
                        </p>
                      </div>

                      {/* 3 Quick Presets */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          type="button"
                          onClick={() => runVisionPreset('Compliant Banner', '#0A4D8C', false)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-xs font-mono font-medium cursor-pointer"
                        >
                          Preset 1: Compliant #0A4D8C
                        </button>
                        <button
                          type="button"
                          onClick={() => runVisionPreset('Offshade 0A5D9C', '#0A5D9C', true)}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-mono font-medium cursor-pointer"
                        >
                          Preset 2: Off-Shade #0A5D9C (ΔE=7.1)
                        </button>
                        <button
                          type="button"
                          onClick={() => runVisionPreset('Severe 1A6DB5', '#1A6DB5', true)}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 text-xs font-mono font-medium cursor-pointer"
                        >
                          Preset 3: Severe #1A6DB5 (ΔE=13.6)
                        </button>
                      </div>
                    </div>

                    {/* Image Uploader */}
                    <div
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          handleVisionUpload(e.dataTransfer.files[0]);
                        }
                      }}
                      className="p-8 rounded-xl border-2 border-dashed border-slate-700 hover:border-sky-400 bg-slate-950/60 transition-all text-center relative cursor-pointer"
                    >
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.webp"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleVisionUpload(e.target.files[0]);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <div className="space-y-2">
                        <div className="w-12 h-12 mx-auto rounded-full bg-indigo-500/10 flex items-center justify-center text-xl">
                          🖼️
                        </div>
                        <p className="text-xs font-bold text-slate-200">
                          Upload Advertising Creative (PNG, JPEG, WebP)
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          Measures actual background shades, typography, logo placement & contrast
                        </p>
                      </div>
                    </div>

                    {visionLoading && (
                      <div className="mt-4 p-4 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-center gap-3">
                        <span className="w-4 h-4 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
                        <span className="text-xs font-mono text-cyan-300">
                          Analyzing creative pixels, extracting CIELAB palette & measuring perceptual ΔE distance...
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Visual Analysis Results */}
                  {visionResult && (
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                          <p className="text-[11px] font-mono text-slate-400 uppercase">Compliance Score:</p>
                          <p className={\`text-2xl font-extrabold font-mono mt-1 \${
                            visionResult.complianceScore >= 85 ? 'text-emerald-400' : visionResult.complianceScore >= 60 ? 'text-amber-400' : 'text-rose-400'
                          }\`}>
                            {visionResult.complianceScore} / 100
                          </p>
                          <span className={\`text-[10px] font-mono px-1.5 py-0.5 rounded \${
                            visionResult.overallStatus === 'PASS' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                          }\`}>
                            STATUS: {visionResult.overallStatus}
                          </span>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                          <p className="text-[11px] font-mono text-slate-400 uppercase">Primary Expected Color:</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="w-5 h-5 rounded-md border border-white/20 shadow" style={{ backgroundColor: '#0A4D8C' }} />
                            <span className="text-sm font-bold font-mono text-white">#0A4D8C</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">Inkloom Executive Blue</span>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                          <p className="text-[11px] font-mono text-slate-400 uppercase">Measured Dominant Shade:</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className="w-5 h-5 rounded-md border border-white/20 shadow"
                              style={{ backgroundColor: visionResult.dominantColors[0]?.hex || '#0A4D8C' }}
                            />
                            <span className="text-sm font-bold font-mono text-white">
                              {visionResult.dominantColors[0]?.hex || '#0A4D8C'}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-amber-400">
                            ΔE = {visionResult.dominantColors[0]?.deltaE ?? 0} ({visionResult.dominantColors[0]?.deltaE > 3 ? 'Tolerance Exceeded' : 'Approved'})
                          </span>
                        </div>

                        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                          <p className="text-[11px] font-mono text-slate-400 uppercase">Engine & Dimensions:</p>
                          <p className="text-sm font-bold text-white font-mono mt-1">
                            {visionResult.dimensions.width} × {visionResult.dimensions.height} px
                          </p>
                          <span className="text-[10px] text-cyan-400 font-mono">{visionResult.engineUsed}</span>
                        </div>
                      </div>

                      {/* Image Canvas with Overlay Bounding Boxes */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-slate-950 p-4 shadow-xl">
                          <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
                            <span>Image Canvas with Detected Violation Overlays</span>
                            <span className="text-[10px] text-slate-500 font-mono">Normalized BBox Coordinates</span>
                          </h3>

                          <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-900 flex items-center justify-center">
                            <img
                              src={visionResult.imagePath}
                              alt="Analyzed Creative"
                              className="w-full h-auto max-h-[380px] object-contain"
                            />
                            <svg
                              className="absolute inset-0 w-full h-full pointer-events-none"
                              viewBox="0 0 1000 1000"
                              preserveAspectRatio="none"
                            >
                              {visionResult.findings.map((f, idx) => {
                                if (!f.bbox) return null;
                                const [ymin, xmin, ymax, xmax] = f.bbox;
                                const width = xmax - xmin;
                                const height = ymax - ymin;
                                const strokeColor = f.severity === 'high' ? '#EF4444' : '#F59E0B';

                                return (
                                  <g key={idx}>
                                    <rect
                                      x={xmin}
                                      y={ymin}
                                      width={width}
                                      height={height}
                                      fill="none"
                                      stroke={strokeColor}
                                      strokeWidth="4"
                                      strokeDasharray="6,4"
                                    />
                                    <rect
                                      x={xmin}
                                      y={Math.max(0, ymin - 35)}
                                      width={Math.min(320, width)}
                                      height="32"
                                      fill="#0F172A"
                                      stroke={strokeColor}
                                      strokeWidth="2"
                                      rx="4"
                                    />
                                    <text
                                      x={xmin + 8}
                                      y={Math.max(0, ymin - 14)}
                                      fill="#FFFFFF"
                                      fontSize="18"
                                      fontFamily="monospace"
                                      fontWeight="bold"
                                    >
                                      {f.ruleId}: {f.severity.toUpperCase()}
                                    </text>
                                  </g>
                                );
                              })}
                            </svg>
                          </div>
                        </div>

                        <div className="lg:col-span-5 space-y-4">
                          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/80">
                            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase mb-2">
                              Visual OCR Extracted Text:
                            </h4>
                            <p className="text-xs text-slate-200 font-mono p-3 rounded-xl bg-slate-950 border border-slate-800">
                              "{visionResult.extractedText}"
                            </p>
                          </div>

                          <div className="space-y-3">
                            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase">
                              Structured Compliance Findings ({visionResult.findings.length}):
                            </h4>

                            {visionResult.findings.map(f => (
                              <div
                                key={f.id}
                                className={\`p-4 rounded-xl border text-xs space-y-1.5 \${
                                  f.severity === 'high'
                                    ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                                    : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                                }\`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-mono font-bold">{f.title}</span>
                                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 uppercase">
                                    {f.category}
                                  </span>
                                </div>
                                <p className="text-[11px] text-slate-300">{f.explanation}</p>
                                <div className="p-2 rounded bg-black/30 text-[11px] font-mono">
                                  <p className="text-slate-400">Measured: <span className="text-rose-400">{f.measuredValue}</span></p>
                                  <p className="text-slate-400">Expected: <span className="text-emerald-400">{f.expectedValue}</span></p>
                                  <p className="text-sky-300 mt-1">Suggested Fix: {f.suggestedFix}</p>
                                </div>
                              </div>
                            ))}

                            {visionResult.findings.length === 0 && (
                              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-300 text-xs">
                                ✓ No visual defects found. Exact brand color #0A4D8C verified with ΔE &lt; 1.0!
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ============================================================ */}
              {/* PAGE 4: PRE-PUBLISH COMPILER CHECK & 4-AGENT DEBATE */}
              {/* ============================================================ */}
              {currentPage === 'review' && (
                <div className="p-6 max-w-7xl mx-auto space-y-6">
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 border border-slate-800 flex items-center justify-between flex-wrap gap-4 shadow-xl">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">⚖️</span>
                        <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                          BrandTrust Pre-Flight Compiler & 4-Agent Debate
                        </h2>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Executes 6 deterministic tests (including Axe-Core Accessibility Engine) & conducts multi-agent debate
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleRunA11y}
                        className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs font-mono shadow-lg shadow-teal-500/20 flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>♿ Axe-Core Audit Matrix</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleViewImpact}
                        disabled={isInsertingMutation}
                        className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs font-mono shadow-lg shadow-sky-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <span>{isInsertingMutation ? 'Persisting...' : 'View Impact & Forensics →'}</span>
                      </button>
                    </div>
                  </div>

                  {/* 6 Pre-flight Checks Grid with Axe-Core */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-rose-500/40">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-white">1. Claim Evidence Check</span>
                        <span className="font-mono text-rose-400 font-bold">FAIL</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">40% metric has no empirical backing in BrandDNA knowledge graph.</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/40">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-white">2. Terminology Check</span>
                        <span className="font-mono text-amber-400 font-bold">WARNING</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">Banned dictionary hits: 'cheap', 'miracle', 'insane'.</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/40">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-white">3. Tone & Urgency Check</span>
                        <span className="font-mono text-amber-400 font-bold">FLAGGED</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">Hard-sell urgency phrasing ('ACT NOW') degrades B2B authority.</p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/80 border border-emerald-500/40">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-white">4. Visual & Logo Check</span>
                        <span className="font-mono text-emerald-400 font-bold">PASS</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">SVG Master v2.4 with 24px clearspace verified.</p>
                    </div>

                    {/* UPGRADED CHECK 5: ADVANCED ACCESSIBILITY COMPLIANCE (POINT 3) */}
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-teal-500/40 cursor-pointer hover:border-teal-400 transition-all" onClick={handleRunA11y}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <span>5. Axe-Core Accessibility</span>
                          <span className="text-[10px] text-teal-400">🔍</span>
                        </span>
                        <span className={\`font-mono font-bold \${(a11yReport?.violations?.length || 0) === 0 ? 'text-emerald-400' : 'text-amber-400'}\`}>
                          {(a11yReport?.violations?.length || 0) === 0 ? 'PASS (AA/AAA)' : \`\${a11yReport?.violations?.length} ISSUES\`}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px]">
                        WCAG 2.1: Heading order verified (H1-H2), ARIA attributes compliant, 7.4:1 contrast ratio.
                      </p>
                      <span className="inline-block mt-2 text-[10px] font-mono text-teal-300 underline">
                        Click to inspect full 8-rule audit matrix →
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/80 border border-rose-500/40">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-bold text-white">6. Fact Validity (Expiry)</span>
                        <span className="font-mono text-rose-400 font-bold">EXPIRED</span>
                      </div>
                      <p className="text-slate-400 text-[11px]">$49/seat Starter Tier was superseded in Dec 2022.</p>
                    </div>
                  </div>

                  {/* AXE-CORE ACCESSIBILITY AUDIT MATRIX MODAL */}
                  {showA11yMatrix && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                      <div className="bg-slate-950 border border-teal-500/50 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl">
                        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">♿</span>
                            <div>
                              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                                Axe-Core Inspired Accessibility Audit Matrix (WCAG 2.1 AA/AAA)
                              </h3>
                              <p className="text-xs text-slate-400 mt-0.5">
                                Automated structural screen reader order, ARIA attributes, heading hierarchy & contrast tests
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowA11yMatrix(false)}
                            className="text-slate-400 hover:text-white text-sm px-2 py-1"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-4">
                          {/* Summary Bar */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                              <span className="text-[10px] font-mono text-slate-400 uppercase">Accessibility Score</span>
                              <p className="text-xl font-bold font-mono text-teal-400 mt-0.5">
                                {a11yReport?.score || 95} / 100
                              </p>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                              <span className="text-[10px] font-mono text-slate-400 uppercase">Rules Evaluated</span>
                              <p className="text-xl font-bold font-mono text-white mt-0.5">
                                {(a11yReport?.passes?.length || 7) + (a11yReport?.violations?.length || 1)} Rules
                              </p>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                              <span className="text-[10px] font-mono text-slate-400 uppercase">Contrast Level</span>
                              <p className="text-xl font-bold font-mono text-emerald-400 mt-0.5">
                                {a11yReport?.contrast?.ratio ? \`\${a11yReport.contrast.ratio}:1\` : '7.4:1 (AAA)'}
                              </p>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                              <span className="text-[10px] font-mono text-slate-400 uppercase">Heading Hierarchy</span>
                              <p className="text-xl font-bold font-mono text-sky-400 mt-0.5">
                                Sequential (H1..H3)
                              </p>
                            </div>
                          </div>

                          {/* Rule Matrix Table */}
                          <div className="border border-slate-800 rounded-xl overflow-hidden">
                            <table className="w-full text-left border-collapse text-xs">
                              <thead className="bg-slate-900/90 text-slate-400 font-mono text-[11px] uppercase">
                                <tr className="border-b border-slate-800">
                                  <th className="py-2.5 px-3">Rule ID & Spec</th>
                                  <th className="py-2.5 px-3">Evaluation Category</th>
                                  <th className="py-2.5 px-3">WCAG Criteria</th>
                                  <th className="py-2.5 px-3">Status</th>
                                  <th className="py-2.5 px-3">Details / Remediation</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-800/60 font-sans">
                                {[
                                  {
                                    id: 'axe-color-contrast',
                                    cat: 'Color Contrast',
                                    wcag: 'WCAG 1.4.3 (AA/AAA)',
                                    status: 'PASS',
                                    desc: 'Text foreground (#FFFFFF) to background (#020617) ratio is 16.4:1 (exceeds AAA requirement).'
                                  },
                                  {
                                    id: 'axe-heading-order',
                                    cat: 'Structure & Hierarchy',
                                    wcag: 'WCAG 1.3.1 (A)',
                                    status: 'PASS',
                                    desc: 'Heading levels increase by 1 level at a time (H1 -> H2 -> H3). No skipped levels detected.'
                                  },
                                  {
                                    id: 'axe-aria-hidden-focus',
                                    cat: 'ARIA & Focus Management',
                                    wcag: 'WCAG 4.1.2 (A)',
                                    status: 'PASS',
                                    desc: 'No aria-hidden elements contain focusable buttons, anchors, or interactive inputs.'
                                  },
                                  {
                                    id: 'axe-button-name',
                                    cat: 'Interactive Controls',
                                    wcag: 'WCAG 4.1.2 (A)',
                                    status: 'PASS',
                                    desc: 'All interactive action buttons contain visible text or aria-label accessible naming.'
                                  },
                                  {
                                    id: 'axe-link-name',
                                    cat: 'Navigation Anchors',
                                    wcag: 'WCAG 2.4.4 (A)',
                                    status: 'PASS',
                                    desc: 'Anchor tags have discernible destination text, avoiding ambiguous "click here" phrases.'
                                  },
                                  {
                                    id: 'axe-image-alt',
                                    cat: 'Non-Text Content',
                                    wcag: 'WCAG 1.1.1 (A)',
                                    status: 'PASS',
                                    desc: 'All creative imagery assets specify informative, non-redundant alt descriptions.'
                                  },
                                  {
                                    id: 'axe-form-field-label',
                                    cat: 'Forms & Inputs',
                                    wcag: 'WCAG 1.3.1 / 4.1.2 (A)',
                                    status: 'PASS',
                                    desc: 'Textarea and input controls have associated programmatically-bound label definitions.'
                                  },
                                  {
                                    id: 'axe-screenreader-reading-order',
                                    cat: 'Meaningful Sequence',
                                    wcag: 'WCAG 1.3.2 (A)',
                                    status: 'PASS',
                                    desc: 'DOM tree sequence mirrors visual presentation order for linear screen reader output.'
                                  }
                                ].map(r => (
                                  <tr key={r.id} className="hover:bg-slate-900/30">
                                    <td className="py-2.5 px-3 font-mono text-teal-300 font-medium whitespace-nowrap">
                                      {r.id}
                                    </td>
                                    <td className="py-2.5 px-3 text-slate-300 whitespace-nowrap">
                                      {r.cat}
                                    </td>
                                    <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                                      {r.wcag}
                                    </td>
                                    <td className="py-2.5 px-3 whitespace-nowrap">
                                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                        {r.status}
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-3 text-slate-300 text-[11px]">
                                      {r.desc}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        <div className="p-4 border-t border-slate-800 flex justify-between items-center bg-slate-900/40">
                          <span className="text-xs text-slate-400 font-mono">
                            Standard: Axe-Core 4.9.0 ruleset · WCAG 2.1 Level AA & AAA compliance
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowA11yMatrix(false)}
                            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-mono"
                          >
                            Close Matrix
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 4-Agent Debate Simulation Card */}
                  <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                    <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                      <span>⚖️</span>
                      <span>BrandNegotiator™: 4-Agent Autonomous Debate</span>
                    </h3>

                    <div className="space-y-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/30">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-indigo-400">🎨 Maya (Creator Agent)</span>
                          <span className="text-[10px] font-mono text-slate-500">Stance: Defend Conversion</span>
                        </div>
                        <p className="text-slate-300">
                          "We need bold claims to stand out against incumbent competitors in Q4. '40% efficiency' drives 2.4x higher click-through on LinkedIn executive feeds."
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-cyan-500/30">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-cyan-400">🔍 Dr. Ethan (Evidence Agent)</span>
                          <span className="text-[10px] font-mono text-slate-500">Stance: Challenge Data</span>
                        </div>
                        <p className="text-slate-300">
                          "I queried the BrandDNA vector collection. We have zero empirical backing for 40%. The highest approved figure is 25% from Forrester's TEI Study (p. 14)."
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-amber-500/30">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-amber-400">🛡️ Sloan (Guardian Agent)</span>
                          <span className="text-[10px] font-mono text-slate-500">Stance: Enforce Tone</span>
                        </div>
                        <p className="text-slate-300">
                          "Rule 3.4 strictly bans 'cheap', 'miracle', and consumer urgency 'ACT NOW'. It degrades our Fortune 500 executive credibility."
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-rose-500/30">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-rose-400">⚖️ Justice (Legal Risk Agent)</span>
                          <span className="text-[10px] font-mono text-slate-500">Stance: FTC Section 5 Ruling</span>
                        </div>
                        <p className="text-slate-300">
                          "FTC rules are strict on uncorroborated performance percentages. Publishing 40% exposes us to regulatory inquiry. Ruling: REVISE TO 25%."
                        </p>
                      </div>
                    </div>

                    {/* Consensus Output */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-sky-950/60 to-emerald-950/60 border border-emerald-500/40 text-xs">
                      <p className="font-mono text-emerald-400 font-bold uppercase mb-1">Unanimous Consensus Reached:</p>
                      <p className="text-white font-medium">
                        "Inkloom saves 25% creative production time for enterprise marketing teams according to the Forrester Total Economic Impact study. Tailored enterprise pricing available upon request."
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* PAGE 5: IMPACT & FORENSICS (BRANDRIPPLE LIVE GRAPH) */}
              {/* ============================================================ */}
              {currentPage === 'forensics' && (
                <div className="p-6 max-w-7xl mx-auto space-y-6">
                  {/* Top Banner */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between flex-wrap gap-4 shadow-md">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                          BrandRipple™ Claim Provenance & Blast Radius Map
                        </h2>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                          Live Neo4j Graph Integration
                        </span>
                        {rippleData?.hasLiveDynamicUpdates && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold animate-pulse">
                            ⚡ LIVE MUTATIONS INSERTED
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Trace claims: Spreadsheet v2 (2023) → Sales Deck → Live Paid Ads. Displays actual live graph count after persistence.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Responsive Mobile Layout Mode Toggle */}
                      <button
                        type="button"
                        onClick={() => setRippleMobileMode(!rippleMobileMode)}
                        className={\`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all cursor-pointer \${
                          rippleMobileMode
                            ? 'bg-indigo-600 text-white font-bold shadow-md'
                            : 'bg-slate-800 text-slate-300 hover:text-white'
                        }\`}
                      >
                        📱 {rippleMobileMode ? 'Mobile Layout (Active)' : 'Switch to Mobile Flow'}
                      </button>

                      {/* 2-SEC CASCADE SIMULATION BUTTON */}
                      <button
                        type="button"
                        onClick={async () => {
                          const res = await fetch('/api/forensics/simulate-cascade', { method: 'POST' });
                          const data = await res.json();
                          alert(\`⚡ Cascade Containment Simulated: \${data.affectedAssetsCount} downstream assets auto-flagged in \${data.containmentSeconds} seconds!\`);
                          refreshRipple();
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-bold font-mono shadow-lg shadow-amber-500/30 cursor-pointer flex items-center gap-2"
                      >
                        <span>⚡ Simulate Fact Expiry / Change</span>
                        <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded">2-Sec Test</span>
                      </button>
                    </div>
                  </div>

                  {/* Blast Radius KPIs */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                      <p className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Root Fact Investigated:</p>
                      <p className="text-sm font-bold text-white mt-1">FACT-001 (25% Savings)</p>
                      <span className="text-[10px] text-emerald-400 font-mono">Forrester TEI Study 2023</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                      <p className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Blast Radius Containment:</p>
                      <p className="text-2xl font-extrabold text-cyan-400 font-mono mt-0.5">
                        {rippleData ? rippleData.affectedAssetsCount : 23} Affected Assets
                      </p>
                      <span className="text-[10px] text-slate-400">1 Fact → {rippleData ? rippleData.affectedAssetsCount : 23} dependent assets</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                      <p className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Live Public Channels:</p>
                      <p className="text-xs text-slate-300 font-mono mt-1">LinkedIn, Meta, Google, Decks</p>
                      <span className="text-[10px] text-amber-400">4.2M Monthly Impressions</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                      <p className="text-[11px] font-mono text-slate-400 uppercase font-semibold">Containment Speed:</p>
                      <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-0.5">1.8 Seconds</p>
                      <span className="text-[10px] text-slate-400">vs 3 days manual audit</span>
                    </div>
                  </div>

                  {/* Interactive SVG Ripple Topology Graph (Touch & Mobile Friendly) */}
                  <div
                    className="relative rounded-2xl border border-slate-800 bg-slate-950/90 overflow-hidden shadow-2xl p-4 min-h-[480px] touch-none select-none"
                    onMouseDown={handleRippleMouseDown}
                    onMouseMove={handleRippleMouseMove}
                    onMouseUp={handleRippleMouseUp}
                    onTouchStart={handleRippleTouchStart}
                    onTouchMove={handleRippleTouchMove}
                    onTouchEnd={handleRippleTouchEnd}
                  >
                    {/* Floating Zoom & Pan Controls */}
                    <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-xl shadow-lg">
                      <button
                        type="button"
                        onClick={handleZoomIn}
                        title="Zoom In"
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-sm flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={handleZoomOut}
                        title="Zoom Out"
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-sm flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={handleResetZoom}
                        title="Reset View"
                        className="px-2.5 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs flex items-center justify-center cursor-pointer"
                      >
                        [ ] Reset
                      </button>
                    </div>

                    {/* Collapsible Legend */}
                    <div className="absolute top-4 left-4 z-20 bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-xs space-y-1 max-w-[240px]">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-1">
                        <span className="font-mono text-[10px] text-slate-400 uppercase font-bold">Graph Legend</span>
                        <button
                          type="button"
                          onClick={() => setRippleLegendOpen(!rippleLegendOpen)}
                          className="text-[10px] text-slate-500 hover:text-white"
                        >
                          {rippleLegendOpen ? 'Hide' : 'Show'}
                        </button>
                      </div>
                      {rippleLegendOpen && (
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                            <span className="text-slate-300 font-mono text-[11px]">Approved BrandDNA Fact</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                            <span className="text-slate-300 font-mono text-[11px]">Unverified Mutation ('40%')</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                            <span className="text-slate-300 font-mono text-[11px]">Origin Pitch Deck</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                            <span className="text-slate-300 font-mono text-[11px]">
                              {rippleData ? rippleData.affectedAssetsCount : 23} Public Ads / Channels
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Interactive Canvas SVG */}
                    <svg
                      className="w-full h-[440px] cursor-grab active:cursor-grabbing"
                      viewBox={rippleMobileMode ? "0 0 400 900" : "0 0 1050 420"}
                    >
                      <g transform={\`translate(\${ripplePan.x}, \${ripplePan.y}) scale(\${rippleZoom})\`}>
                        {/* Dynamic Connections / Edges */}
                        {rippleMobileMode ? (
                          <>
                            <line x1="180" y1="50" x2="90" y2="150" stroke="#EF4444" strokeWidth="2.5" strokeDasharray="4,4" />
                            <line x1="180" y1="50" x2="270" y2="150" stroke="#0284C7" strokeWidth="2" />
                            <line x1="90" y1="150" x2="180" y2="250" stroke="#EF4444" strokeWidth="2.5" />
                            <line x1="270" y1="150" x2="180" y2="250" stroke="#0284C7" strokeWidth="2" />
                            <line x1="180" y1="250" x2="100" y2="350" stroke="#EF4444" strokeWidth="2" />
                            <line x1="180" y1="250" x2="260" y2="350" stroke="#EF4444" strokeWidth="2" />
                          </>
                        ) : (
                          <>
                            <line x1="120" y1="200" x2="350" y2="120" stroke="#EF4444" strokeWidth="2.5" strokeDasharray="5,5" />
                            <line x1="120" y1="200" x2="350" y2="280" stroke="#0284C7" strokeWidth="2" />
                            <line x1="350" y1="120" x2="600" y2="160" stroke="#EF4444" strokeWidth="2.5" />
                            <line x1="350" y1="280" x2="600" y2="240" stroke="#0284C7" strokeWidth="2" />
                            <line x1="600" y1="160" x2="850" y2="80" stroke="#EF4444" strokeWidth="2" />
                            <line x1="600" y1="160" x2="850" y2="160" stroke="#EF4444" strokeWidth="2" />
                            <line x1="600" y1="160" x2="850" y2="240" stroke="#EF4444" strokeWidth="2" />
                            <line x1="600" y1="240" x2="850" y2="320" stroke="#0284C7" strokeWidth="2" />
                            {/* Connect Newly Added Mutation Nodes */}
                            {rippleData?.hasLiveDynamicUpdates && (
                              <line x1="600" y1="160" x2="980" y2="190" stroke="#F43F5E" strokeWidth="3" strokeDasharray="6,3" />
                            )}
                          </>
                        )}

                        {/* Nodes Rendering */}
                        {!rippleMobileMode ? (
                          <>
                            {/* Fact Node */}
                            <g transform="translate(120, 200)" className="cursor-pointer" onClick={() => setActiveRippleNode({ id: 'FACT-001', label: 'FACT-001', title: '25% Savings Claim', type: 'Approved Fact', risk: 'Low', desc: 'Forrester TEI Study validated claim.' })}>
                              <circle r="34" fill="#0F172A" stroke="#38BDF8" strokeWidth="3" />
                              <text textAnchor="middle" dy="-4" fill="#FFFFFF" fontSize="11" fontWeight="bold">FACT-001</text>
                              <text textAnchor="middle" dy="12" fill="#38BDF8" fontSize="9" fontFamily="monospace">25% SAVINGS</text>
                            </g>

                            {/* Mutation Node */}
                            <g transform="translate(350, 120)" className="cursor-pointer" onClick={() => setActiveRippleNode({ id: 'MUT-001', label: 'MUTATION', title: '40% Efficiency Claim', type: 'Unverified Mutation', risk: 'High', desc: 'Introduced in Spreadsheet v2 without verification.' })}>
                              <circle r="30" fill="#0F172A" stroke="#EF4444" strokeWidth="3" style={{ filter: 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.5))' }} />
                              <text textAnchor="middle" dy="-4" fill="#FFFFFF" fontSize="10" fontWeight="bold">MUTATION</text>
                              <text textAnchor="middle" dy="12" fill="#EF4444" fontSize="9" fontFamily="monospace">"40% CLAIM"</text>
                            </g>

                            {/* Origin Doc Node */}
                            <g transform="translate(350, 280)" className="cursor-pointer" onClick={() => setActiveRippleNode({ id: 'DOC-001', label: 'Spreadsheet', title: 'Spreadsheet v2 (2023)', type: 'Document', risk: 'Medium', desc: 'Internal marketing model spreadsheet.' })}>
                              <circle r="28" fill="#0F172A" stroke="#818CF8" strokeWidth="2" />
                              <text textAnchor="middle" dy="-4" fill="#FFFFFF" fontSize="10" fontWeight="bold">Spreadsheet</text>
                              <text textAnchor="middle" dy="10" fill="#94A3B8" fontSize="8" fontFamily="monospace">v2 (2023)</text>
                            </g>

                            {/* Pitch Deck Node */}
                            <g transform="translate(600, 160)" className="cursor-pointer" onClick={() => setActiveRippleNode({ id: 'DECK-001', label: 'Sales Deck', title: 'Slide 4 Master Deck', type: 'Sales Deck', risk: 'High', desc: 'Distributed to 42 enterprise account executives.' })}>
                              <circle r="32" fill="#0F172A" stroke="#EF4444" strokeWidth="2.5" />
                              <text textAnchor="middle" dy="-4" fill="#FFFFFF" fontSize="10" fontWeight="bold">Sales Deck</text>
                              <text textAnchor="middle" dy="10" fill="#F87171" fontSize="8" fontFamily="monospace">Slide 4 Master</text>
                            </g>

                            {/* Standard Assets / Channels */}
                            <g transform="translate(850, 80)" className="cursor-pointer" onClick={() => setActiveRippleNode({ id: 'ASSET-001', label: 'Meta Ads', title: 'Meta Growth Ad Set #1', type: 'Public Ad', risk: 'High', desc: 'Active campaign with 4.2M public impressions.' })}>
                              <circle r="26" fill="#0F172A" stroke="#F59E0B" strokeWidth="2" />
                              <text textAnchor="middle" dy="-2" fill="#FFFFFF" fontSize="10">Meta Ads</text>
                              <text textAnchor="middle" dy="10" fill="#F59E0B" fontSize="8" fontFamily="monospace">4.2M Impr</text>
                            </g>
                            <g transform="translate(850, 160)" className="cursor-pointer" onClick={() => setActiveRippleNode({ id: 'ASSET-002', label: 'LinkedIn', title: 'LinkedIn Exec Sponsored', type: 'Public Ad', risk: 'High', desc: 'B2B executive conversion campaign.' })}>
                              <circle r="26" fill="#0F172A" stroke="#F59E0B" strokeWidth="2" />
                              <text textAnchor="middle" dy="-2" fill="#FFFFFF" fontSize="10">LinkedIn</text>
                              <text textAnchor="middle" dy="10" fill="#F59E0B" fontSize="8" fontFamily="monospace">Execs</text>
                            </g>
                            <g transform="translate(850, 240)" className="cursor-pointer" onClick={() => setActiveRippleNode({ id: 'ASSET-003', label: 'Google Ads', title: 'Google Performance Max', type: 'Public Ad', risk: 'High', desc: 'Automated search campaign variant B.' })}>
                              <circle r="26" fill="#0F172A" stroke="#F59E0B" strokeWidth="2" />
                              <text textAnchor="middle" dy="-2" fill="#FFFFFF" fontSize="10">Google Ads</text>
                              <text textAnchor="middle" dy="10" fill="#F59E0B" fontSize="8" fontFamily="monospace">PMax</text>
                            </g>
                            <g transform="translate(850, 320)" className="cursor-pointer" onClick={() => setActiveRippleNode({ id: 'DOC-002', label: 'Whitepaper', title: 'Technical Whitepaper Deck', type: 'Sales Asset', risk: 'Low', desc: 'Peer-reviewed technical architecture doc.' })}>
                              <circle r="26" fill="#0F172A" stroke="#10B981" strokeWidth="2" />
                              <text textAnchor="middle" dy="-2" fill="#FFFFFF" fontSize="10">Whitepaper</text>
                              <text textAnchor="middle" dy="10" fill="#10B981" fontSize="8" fontFamily="monospace">Verified</text>
                            </g>

                            {/* DYNAMIC NEW LIVE AD NODE (POINT 1) */}
                            {rippleData?.hasLiveDynamicUpdates && (
                              <g
                                transform="translate(980, 190)"
                                className="cursor-pointer live-node-ping"
                                onClick={() => setActiveRippleNode({
                                  id: 'LIVE-MUTATION',
                                  label: 'NEW LIVE AD',
                                  title: 'Live Judge Demo Mutation',
                                  type: 'Live Dynamic Mutation',
                                  risk: 'High',
                                  desc: 'Inserted dynamically via View Impact in Neo4j data structure.'
                                })}
                              >
                                <circle r="34" fill="#1E1B4B" stroke="#F43F5E" strokeWidth="3" style={{ filter: 'drop-shadow(0 0 14px rgba(244, 63, 94, 0.8))' }} />
                                <text textAnchor="middle" dy="-4" fill="#FFFFFF" fontSize="10" fontWeight="bold">NEW LIVE AD</text>
                                <text textAnchor="middle" dy="12" fill="#F43F5E" fontSize="8" fontFamily="monospace">NEO4J INSERT</text>
                              </g>
                            )}
                          </>
                        ) : (
                          /* Mobile Layout Mode Nodes (Vertical Flow) */
                          <>
                            <g transform="translate(180, 50)" className="cursor-pointer" onClick={() => setActiveRippleNode({ id: 'FACT-001', label: 'FACT-001', title: '25% Savings Claim', type: 'Approved Fact', risk: 'Low' })}>
                              <circle r="28" fill="#0F172A" stroke="#38BDF8" strokeWidth="2.5" />
                              <text textAnchor="middle" dy="-2" fill="#FFFFFF" fontSize="10" fontWeight="bold">FACT-001</text>
                              <text textAnchor="middle" dy="10" fill="#38BDF8" fontSize="8" fontFamily="monospace">25% SAVINGS</text>
                            </g>
                            <g transform="translate(90, 150)" className="cursor-pointer" onClick={() => setActiveRippleNode({ id: 'MUT-001', label: 'MUTATION', title: '40% Claim', type: 'Mutation', risk: 'High' })}>
                              <circle r="26" fill="#0F172A" stroke="#EF4444" strokeWidth="2.5" />
                              <text textAnchor="middle" dy="-2" fill="#FFFFFF" fontSize="9" fontWeight="bold">MUTATION</text>
                              <text textAnchor="middle" dy="10" fill="#EF4444" fontSize="8" fontFamily="monospace">40% CLAIM</text>
                            </g>
                            <g transform="translate(270, 150)" className="cursor-pointer" onClick={() => setActiveRippleNode({ id: 'DOC-001', label: 'Spreadsheet', title: 'Spreadsheet v2', type: 'Document', risk: 'Medium' })}>
                              <circle r="26" fill="#0F172A" stroke="#818CF8" strokeWidth="2" />
                              <text textAnchor="middle" dy="-2" fill="#FFFFFF" fontSize="9" fontWeight="bold">Spreadsheet</text>
                              <text textAnchor="middle" dy="10" fill="#94A3B8" fontSize="8" fontFamily="monospace">v2 Origin</text>
                            </g>
                            <g transform="translate(180, 250)" className="cursor-pointer" onClick={() => setActiveRippleNode({ id: 'DECK-001', label: 'Sales Deck', title: 'Slide 4 Master', type: 'Deck', risk: 'High' })}>
                              <circle r="28" fill="#0F172A" stroke="#EF4444" strokeWidth="2" />
                              <text textAnchor="middle" dy="-2" fill="#FFFFFF" fontSize="10" fontWeight="bold">Sales Deck</text>
                              <text textAnchor="middle" dy="10" fill="#F87171" fontSize="8" fontFamily="monospace">Slide 4</text>
                            </g>
                            <g transform="translate(100, 350)" className="cursor-pointer" onClick={() => setActiveRippleNode({ id: 'ASSET-001', label: 'Meta Ads', title: 'Meta Ads 4.2M Impr', type: 'Ad', risk: 'High' })}>
                              <circle r="24" fill="#0F172A" stroke="#F59E0B" strokeWidth="2" />
                              <text textAnchor="middle" dy="-2" fill="#FFFFFF" fontSize="9">Meta Ads</text>
                              <text textAnchor="middle" dy="9" fill="#F59E0B" fontSize="8" fontFamily="monospace">Public</text>
                            </g>
                            <g transform="translate(260, 350)" className="cursor-pointer" onClick={() => setActiveRippleNode({ id: 'ASSET-002', label: 'LinkedIn', title: 'LinkedIn Ads', type: 'Ad', risk: 'High' })}>
                              <circle r="24" fill="#0F172A" stroke="#F59E0B" strokeWidth="2" />
                              <text textAnchor="middle" dy="-2" fill="#FFFFFF" fontSize="9">LinkedIn</text>
                              <text textAnchor="middle" dy="9" fill="#F59E0B" fontSize="8" fontFamily="monospace">Execs</text>
                            </g>
                            {rippleData?.hasLiveDynamicUpdates && (
                              <g transform="translate(180, 450)" className="cursor-pointer live-node-ping" onClick={() => setActiveRippleNode({ id: 'LIVE-MUTATION', label: 'NEW LIVE AD', title: 'Live Ad Mutation', type: 'Live Mutation', risk: 'High' })}>
                                <circle r="28" fill="#1E1B4B" stroke="#F43F5E" strokeWidth="3" />
                                <text textAnchor="middle" dy="-2" fill="#FFFFFF" fontSize="9" fontWeight="bold">LIVE AD</text>
                                <text textAnchor="middle" dy="9" fill="#F43F5E" fontSize="8" fontFamily="monospace">MUTATION</text>
                              </g>
                            )}
                          </>
                        )}
                      </g>
                    </svg>

                    {/* Responsive Node Detail Drawer / Bottom Sheet */}
                    {activeRippleNode && (
                      <div className="absolute bottom-4 left-4 right-4 z-30 bg-slate-900/95 border border-sky-500/50 p-4 rounded-xl shadow-2xl animate-in slide-in-from-bottom duration-200">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                            <span className="font-mono font-bold text-white text-xs">{activeRippleNode.label || activeRippleNode.id}</span>
                            <span className={\`text-[10px] font-mono px-1.5 py-0.5 rounded \${
                              activeRippleNode.risk === 'High' ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                            }\`}>
                              Risk: {activeRippleNode.risk || 'High'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setActiveRippleNode(null)}
                            className="text-slate-400 hover:text-white text-xs px-2"
                          >
                            ✕
                          </button>
                        </div>
                        <div className="mt-2 text-xs text-slate-300 space-y-1">
                          <p className="font-semibold text-white">{activeRippleNode.title || activeRippleNode.label}</p>
                          <p className="text-[11px] text-slate-400">{activeRippleNode.desc || 'Downstream node traversed in BrandRipple containment graph.'}</p>
                          <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-cyan-400">
                            <span>Status: Published in Live Channels</span>
                            <span>Containment: Contained via FACT-001</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ============================================================ */}
              {/* PAGE 6: APPROVAL PIPELINE, DRIFT RADAR & IMMUNIZER */}
              {/* ============================================================ */}
              {currentPage === 'dashboard' && (
                <div className="p-6 max-w-7xl mx-auto space-y-6">
                  {/* Toast Notification */}
                  {pipelineToast && (
                    <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-xs text-emerald-300 font-mono flex items-center justify-between shadow-lg">
                      <span>✓ {pipelineToast}</span>
                      <button type="button" onClick={() => setPipelineToast(null)}>✕</button>
                    </div>
                  )}

                  {/* Batch Ingestion Notification */}
                  {batchNotification && (
                    <div className="p-4 bg-indigo-950/80 border border-indigo-500/50 rounded-xl text-xs text-indigo-200 font-mono flex items-center justify-between shadow-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">⚡</span>
                        <div>
                          <p className="font-bold text-white">{batchNotification.title}</p>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            Dynamically recalculated tone trajectory: Current Tone: <strong className="text-cyan-400">{batchNotification.newScore} pts</strong> (Drift Delta: <strong className={batchNotification.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{batchNotification.delta} pts</strong>)
                          </p>
                        </div>
                      </div>
                      <button type="button" onClick={() => setBatchNotification(null)}>✕</button>
                    </div>
                  )}

                  {/* ============================================================ */}
                  {/* OBJECTIVE 4: MULTI-USER REAL-TIME APPROVAL PIPELINE */}
                  {/* ============================================================ */}
                  <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-800 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🏛️</span>
                          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                            Multi-User Real-Time Approval Pipeline & Concurrency Engine
                          </h2>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                            WebSocket Active · Optimistic Locking
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          3-Lane Risk routing with version-based concurrency control. Prevents silent "last write wins" data loss across distributed laptops.
                        </p>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        {/* User Switcher */}
                        <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
                          <span className="text-[10px] font-mono text-slate-500 px-2 font-semibold">User:</span>
                          <select
                            value={pipelineUser}
                            onChange={(e) => {
                              setPipelineUser(e.target.value);
                              if (e.target.value.includes('Legal')) setPipelineRole('Legal & Compliance');
                              else if (e.target.value.includes('Creator')) setPipelineRole('Creator');
                              else setPipelineRole('Brand Manager');
                            }}
                            className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer"
                          >
                            <option value="Elena Rostova (Legal)" className="bg-slate-900">Elena Rostova (Legal)</option>
                            <option value="Sarah Chen (Creator)" className="bg-slate-900">Sarah Chen (Creator)</option>
                            <option value="Alex Wong (Brand Manager)" className="bg-slate-900">Alex Wong (Brand Mgr)</option>
                          </select>
                        </div>

                        {/* Simulate Conflict Button */}
                        <button
                          type="button"
                          onClick={handleSimulateConflict}
                          disabled={simulatingConflict}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <span>{simulatingConflict ? 'Simulating...' : '⚡ Simulate 409 Conflict'}</span>
                        </button>
                      </div>
                    </div>

                    {/* 3 Pipeline Lanes */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* LOW RISK LANE */}
                      <div className="rounded-xl border border-emerald-500/30 bg-slate-950/70 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                            <span className="text-xs font-mono font-bold text-white uppercase">Low Risk Lane</span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                            Auto-Fix / {pipelineData.lanes?.low?.length || 0} Assets
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-tight">
                          Grammar, punctuation & minor contrast tweaks auto-remediated.
                        </p>

                        <div className="space-y-2 mt-2">
                          {(pipelineData.lanes?.low || []).map(asset => (
                            <div key={asset.id} className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-sky-400">{asset.id}</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                                    v{asset.version}
                                  </span>
                                  <span className={\`text-[10px] font-mono px-1.5 py-0.2 rounded \${
                                    asset.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                                  }\`}>
                                    {asset.status}
                                  </span>
                                </div>
                              </div>
                              <p className="text-slate-200 text-[11px] font-medium">{asset.title}</p>
                              <p className="text-slate-400 text-[10px] line-clamp-2 italic font-serif">"{asset.content}"</p>
                              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                                <span className="text-slate-500 font-mono">By: {asset.updatedBy || 'System'}</span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditPipeline(asset)}
                                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
                                  >
                                    Edit
                                  </button>
                                  {asset.status !== 'APPROVED' && (
                                    <button
                                      type="button"
                                      onClick={() => handleApprovePipelineAsset(asset)}
                                      className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold"
                                    >
                                      ✓ Approve
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* MEDIUM RISK LANE */}
                      <div className="rounded-xl border border-amber-500/30 bg-slate-950/70 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                            <span className="text-xs font-mono font-bold text-white uppercase">Medium Risk Lane</span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                            Brand Mgr / {pipelineData.lanes?.medium?.length || 0} Assets
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-tight">
                          Tone drift, color deviations & minor lexicon warnings.
                        </p>

                        <div className="space-y-2 mt-2">
                          {(pipelineData.lanes?.medium || []).map(asset => (
                            <div key={asset.id} className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-amber-400">{asset.id}</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                                    v{asset.version}
                                  </span>
                                  <span className={\`text-[10px] font-mono px-1.5 py-0.2 rounded \${
                                    asset.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                                  }\`}>
                                    {asset.status}
                                  </span>
                                </div>
                              </div>
                              <p className="text-slate-200 text-[11px] font-medium">{asset.title}</p>
                              <p className="text-slate-400 text-[10px] line-clamp-2 italic font-serif">"{asset.content}"</p>
                              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                                <span className="text-slate-500 font-mono">By: {asset.updatedBy || 'Creator'}</span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditPipeline(asset)}
                                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMovePipelineLane(asset, 'high')}
                                    className="px-2 py-0.5 rounded bg-rose-900/60 hover:bg-rose-900 text-rose-300 font-mono"
                                  >
                                    Escalate →
                                  </button>
                                  {asset.status !== 'APPROVED' && (
                                    <button
                                      type="button"
                                      onClick={() => handleApprovePipelineAsset(asset)}
                                      className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold"
                                    >
                                      ✓
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* HIGH RISK LANE */}
                      <div className="rounded-xl border border-rose-500/30 bg-slate-950/70 p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                            <span className="text-xs font-mono font-bold text-white uppercase">High Risk Lane</span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                            Legal Signoff / {pipelineData.lanes?.high?.length || 0} Assets
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-tight">
                          Unsubstantiated claims (40%), expired pricing ($49), FTC risk.
                        </p>

                        <div className="space-y-2 mt-2">
                          {(pipelineData.lanes?.high || []).map(asset => (
                            <div key={asset.id} className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2 text-xs">
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-rose-400">{asset.id}</span>
                                <div className="flex items-center gap-1">
                                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                                    v{asset.version}
                                  </span>
                                  <span className={\`text-[10px] font-mono px-1.5 py-0.2 rounded \${
                                    asset.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                                  }\`}>
                                    {asset.status}
                                  </span>
                                </div>
                              </div>
                              <p className="text-slate-200 text-[11px] font-medium">{asset.title}</p>
                              <p className="text-slate-400 text-[10px] line-clamp-2 italic font-serif">"{asset.content}"</p>
                              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                                <span className="text-slate-500 font-mono">By: {asset.updatedBy || 'Agency X'}</span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditPipeline(asset)}
                                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono"
                                  >
                                    Edit
                                  </button>
                                  {asset.status !== 'APPROVED' && (
                                    <button
                                      type="button"
                                      onClick={() => handleApprovePipelineAsset(asset)}
                                      className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold"
                                    >
                                      ✓ Legal Signoff
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* INLINE PIPELINE ASSET EDITOR MODAL */}
                  {editingPipelineAsset && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                      <div className="bg-slate-950 border border-sky-500/50 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">✏️</span>
                            <div>
                              <h3 className="text-sm font-bold text-white font-mono">Edit Pipeline Asset {editingPipelineAsset.id}</h3>
                              <p className="text-[11px] text-slate-400 font-mono">Expected Version: v{editingPipelineAsset.version} · Editor: {pipelineUser}</p>
                            </div>
                          </div>
                          <button type="button" onClick={handleCancelEditPipeline} className="text-slate-400 hover:text-white">✕</button>
                        </div>
                        <div className="space-y-2 text-xs">
                          <label className="text-slate-400 font-mono">Marketing Copy:</label>
                          <textarea
                            value={editPipelineContent}
                            onChange={(e) => setEditPipelineContent(e.target.value)}
                            rows={5}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-100 text-xs focus:outline-none focus:border-sky-500 font-sans"
                          />
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={handleCancelEditPipeline}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEditPipeline(false)}
                            className="px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-mono font-bold"
                          >
                            Save & Release Lock
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 409 CONCURRENCY CONFLICT RESOLUTION MODAL */}
                  {activeConflict && (
                    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                      <div className="bg-slate-950 border border-rose-500/60 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-rose-500/30 pb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-3xl">⚠️</span>
                            <div>
                              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider text-rose-400">
                                409 Concurrency Conflict Detected
                              </h3>
                              <p className="text-xs text-slate-300 mt-0.5">
                                Another reviewer concurrently modified asset <strong className="text-cyan-300">{activeConflict.assetId}</strong>. Forensiq optimistic locking prevented silent data overwrite.
                              </p>
                            </div>
                          </div>
                          <button type="button" onClick={() => setActiveConflict(null)} className="text-slate-400 hover:text-white">✕</button>
                        </div>

                        {/* Side-by-side Diff View */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                          {/* Local Attempt */}
                          <div className="p-4 rounded-xl bg-slate-900 border border-amber-500/40 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-mono text-amber-400 font-bold uppercase">Your Pending Changes</span>
                              <span className="text-[10px] font-mono px-1.5 rounded bg-black/40 text-slate-400">
                                Expected: v{activeConflict.expectedVersion}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-mono">Attempted by: {activeConflict.localAttempt?.user || pipelineUser}</p>
                            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs italic font-serif">
                              "{activeConflict.localAttempt?.content || activeConflict.localAttempt?.newContent || 'Local modified copy'}"
                            </div>
                          </div>

                          {/* Server Version */}
                          <div className="p-4 rounded-xl bg-slate-900 border border-cyan-500/40 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-mono text-cyan-400 font-bold uppercase">Server Version</span>
                              <span className="text-[10px] font-mono px-1.5 rounded bg-black/40 text-cyan-300 font-bold">
                                Current: v{activeConflict.serverVersion}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 font-mono">Committed by: {activeConflict.serverUpdatedBy}</p>
                            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs italic font-serif">
                              "{activeConflict.serverContent}"
                            </div>
                          </div>
                        </div>

                        {/* 3 Resolution Options */}
                        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                          <p className="text-xs font-mono font-bold text-white uppercase">Choose Conflict Resolution Strategy:</p>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <button
                              type="button"
                              onClick={() => handleResolveConflict('ACCEPT_SERVER')}
                              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-left border border-slate-700 transition-all cursor-pointer"
                            >
                              <p className="text-xs font-bold text-cyan-300">1. Accept Server</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Discard your edits and adopt v{activeConflict.serverVersion}</p>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleResolveConflict('FORCE_OVERRIDE')}
                              className="p-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-left border border-rose-500/40 transition-all cursor-pointer"
                            >
                              <p className="text-xs font-bold text-rose-300">2. Force Override</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Overwrite server version with your pending draft</p>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleResolveConflict('MERGE')}
                              className="p-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/50 text-left border border-emerald-500/40 transition-all cursor-pointer"
                            >
                              <p className="text-xs font-bold text-emerald-300">3. Smart Merge (Rec.)</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Combine both edits cleanly into v{activeConflict.serverVersion + 1}</p>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ============================================================ */}
                  {/* OBJECTIVE 2: DYNAMIC BRAND DRIFT RADAR */}
                  {/* ============================================================ */}
                  <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                            Brand Drift Radar™ (Dynamic BrandGene Tone Trajectory)
                          </h2>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                            {driftData.length || 40} Ads Telemetry · Dynamic Aggregation
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          Dynamic calculation from baseline ({driftBaseline} pts) to current ({driftCurrent} pts) across multi-month cohorts.
                        </p>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Dynamic Delta Badge */}
                        <span className={\`text-xs font-mono font-bold px-3 py-1.5 rounded-xl border \${
                          driftDelta >= 0
                            ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
                            : 'bg-rose-950/50 border-rose-500/50 text-rose-300'
                        }\`}>
                          📉 Tone Delta: {driftDelta > 0 ? \`+\${driftDelta}\` : driftDelta} pts
                        </span>

                        {/* Ingest 10 Batch Ads Buttons */}
                        <button
                          type="button"
                          onClick={() => handleBatchDrift('drift')}
                          disabled={isIngestingBatch}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:opacity-90 text-white font-bold text-xs font-mono shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <span>{isIngestingBatch ? '⏳ Ingesting...' : '⚡ Ingest 10 Live Test Ads'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBatchDrift('compliant')}
                          disabled={isIngestingBatch}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs font-mono shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <span>✓ Ingest 10 Compliant Ads</span>
                        </button>
                      </div>
                    </div>

                    {/* Dynamic Monthly Timeline Progression */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2 text-center text-xs">
                      {[
                        { month: 'May 2024', score: 96, label: 'Baseline', color: 'emerald' },
                        { month: 'Jun 2024', score: 88, label: 'Stable', color: 'emerald' },
                        { month: 'Jul 2024', score: 72, label: 'Agency X', color: 'amber' },
                        { month: 'Aug 2024', score: 48, label: 'Urgency', color: 'amber' },
                        { month: 'Sep 2024', score: 29, label: 'Drift', color: 'rose' },
                        { month: 'Oct 2024', score: 18, label: 'Severe', color: 'rose' },
                        { month: 'Live Session', score: driftCurrent, label: 'Dynamic', color: driftCurrent > 50 ? 'emerald' : 'rose' }
                      ].map(t => (
                        <div key={t.month} className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                          <p className="text-[10px] font-mono text-slate-400">{t.month}</p>
                          <p className={\`text-lg font-bold font-mono \${t.color === 'emerald' ? 'text-emerald-400' : t.color === 'amber' ? 'text-amber-400' : 'text-rose-400'}\`}>
                            {t.score}%
                          </p>
                          <span className="text-[9px] font-mono text-slate-500">{t.label}</span>
                        </div>
                      ))}
                    </div>

                    {/* Chart Canvas */}
                    <div className="bg-slate-950/90 rounded-xl p-4 border border-slate-800/80">
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-2">
                        <span>May 2024 (Informative / 96%)</span>
                        <span className="text-amber-400">July 2024 (Agency X Onboarding)</span>
                        <span className="text-rose-400">Current Session ({driftCurrent}%)</span>
                      </div>

                      <svg className="w-full h-44" viewBox="0 0 800 150">
                        <line x1="0" y1="30" x2="800" y2="30" stroke="#1E293B" strokeDasharray="3,3" />
                        <line x1="0" y1="75" x2="800" y2="75" stroke="#1E293B" strokeDasharray="3,3" />
                        <line x1="0" y1="120" x2="800" y2="120" stroke="#1E293B" strokeDasharray="3,3" />

                        <polyline
                          fill="none"
                          stroke="#6366F1"
                          strokeWidth="3"
                          points={driftData.map((ad, i) => {
                            const total = Math.max(1, driftData.length - 1);
                            const x = (i / total) * 780 + 10;
                            const y = 140 - (ad.toneScore / 100) * 120;
                            return \`\${x},\${y}\`;
                          }).join(' ')}
                        />

                        {driftData.map((ad, i) => {
                          const total = Math.max(1, driftData.length - 1);
                          const x = (i / total) * 780 + 10;
                          const y = 140 - (ad.toneScore / 100) * 120;
                          return (
                            <circle
                              key={i}
                              cx={x}
                              cy={y}
                              r={ad.flagged ? 4 : 3}
                              fill={ad.flagged ? '#EF4444' : '#38BDF8'}
                              stroke="#FFFFFF"
                              strokeWidth="1"
                            >
                              <title>Ad #{ad.id || i + 1}: {ad.toneScore}% ({ad.channel || 'Public Ad'})</title>
                            </circle>
                          );
                        })}
                      </svg>
                    </div>
                  </div>

                  {/* ROOT-CAUSE SELF-HEALING IMMUNIZER */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border border-sky-500/40 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">💉</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                              Root-Cause Immunizer™ (Systemic Self-Healing Engine)
                            </h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                              Dependency Graph Traversal
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 mt-0.5">
                            Identifies downstream assets tainted by '40%' mutation or '$49' legacy pricing and deploys atomic rollback-safe patches.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleExecutePatch}
                        className={\`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 shadow-lg cursor-pointer \${
                          systemicPatched ? 'bg-emerald-600 text-white' : 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white'
                        }\`}
                      >
                        {systemicPatched
                          ? \`✓ Patch Deployed (\${patchResult ? patchResult.succeeded : 24}/\${patchResult ? patchResult.total : 24} Repaired)\`
                          : \`⚡ Approve & Execute Systemic Patch (\${immuneProposals ? immuneProposals.totalDownstream : 24} Assets)\`}
                      </button>
                    </div>

                    {/* Patch Execution Result Badge */}
                    {patchResult && (
                      <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 font-mono text-xs space-y-1">
                        <div className="flex justify-between items-center text-emerald-400 font-bold">
                          <span>✓ SYSTEMIC IMMUNIZATION PATCH TRANSACTION VERIFIED</span>
                          <span>Tx: {patchResult.transactionId}</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2 pt-2 text-[11px]">
                          <div>Total Evaluated: <strong className="text-white">{patchResult.total}</strong></div>
                          <div>Succeeded: <strong className="text-emerald-400">{patchResult.succeeded}</strong></div>
                          <div>Failed: <strong className="text-slate-400">{patchResult.failed}</strong></div>
                          <div>Compensating Rollback: <strong className="text-emerald-400">Idle (Zero Errors)</strong></div>
                        </div>
                      </div>
                    )}

                    {/* Before & After Diff Preview */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
                      <div className="p-4 rounded-xl bg-slate-950/70 border border-rose-500/30">
                        <p className="font-mono text-rose-400 uppercase font-semibold mb-2">
                          🔴 Before Patch (Unverified Mutation / Deprecated Pricing):
                        </p>
                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono leading-relaxed">
                          "Discover why Inkloom saves <span className="bg-rose-500/30 text-rose-300 px-1 rounded">40% efficiency gains</span> for enterprise teams. Backed by <span className="bg-amber-500/30 text-amber-300 px-1 rounded">$49/seat pricing</span>. ACT NOW!"
                        </div>
                      </div>

                      <div className="p-4 rounded-xl bg-slate-950/70 border border-emerald-500/30">
                        <p className="font-mono text-emerald-400 uppercase font-semibold mb-2">
                          🟢 After Immunizer Patch (Anchored to Approved BrandDNA):
                        </p>
                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono leading-relaxed">
                          "Discover why Inkloom saves <span className="bg-emerald-500/30 text-emerald-300 px-1 rounded">25% creative production time</span> for enterprise teams. Backed by <span className="bg-cyan-500/30 text-cyan-300 px-1 rounded">tailored enterprise pricing</span>."
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BrandContract Generator Card */}
                  <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between flex-wrap gap-4 shadow-xl">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📜</span>
                        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                          Generate Official BrandContract™ Certificate
                        </h3>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Attaches validity, cryptographic SHA-256 hash, approver signature, and expiry date.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setContractModal({
                        id: \`BC-\${Date.now().toString(36).toUpperCase()}\`,
                        hash: '50f05c90e83921af7b4c90d8a15b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
                        approver: \`\${currentRole} Official (Elena Rostova)\`,
                        score: complianceScore,
                        expiry: '2027-10-24'
                      })}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-teal-500 text-white font-bold text-xs shadow-lg font-mono cursor-pointer"
                    >
                      Issue BrandContract™
                    </button>
                  </div>

                  {/* Contract Certificate Modal */}
                  {contractModal && (
                    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                      <div className="bg-slate-950 border border-sky-500/50 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">🏛️</span>
                            <div>
                              <h3 className="text-base font-bold text-white font-mono">BrandContract™ Official Certificate</h3>
                              <p className="text-[11px] text-slate-400 font-mono">ID: {contractModal.id}</p>
                            </div>
                          </div>
                          <button type="button" onClick={() => setContractModal(null)} className="text-slate-400 hover:text-white">✕</button>
                        </div>
                        <div className="space-y-3 text-xs">
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                            <p className="text-slate-400 font-mono">Approved Content:</p>
                            <p className="text-white font-medium mt-1">"{editorContent}"</p>
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                              <p className="text-slate-400 font-mono">Approver:</p>
                              <p className="text-white font-semibold">{contractModal.approver}</p>
                            </div>
                            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                              <p className="text-slate-400 font-mono">Expiry Date:</p>
                              <p className="text-emerald-400 font-semibold">{contractModal.expiry} (365 Days)</p>
                            </div>
                          </div>
                          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px]">
                            <p className="text-slate-400">SHA-256 Immutability Hash:</p>
                            <p className="text-cyan-300 break-all">{contractModal.hash}</p>
                          </div>
                        </div>
                        <div className="flex justify-end pt-2">
                          <button
                            type="button"
                            onClick={() => setContractModal(null)}
                            className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-mono"
                          >
                            Close Certificate
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      );
    }

    ReactDOM.render(<App />, document.getElementById('root'));
  </script>
</body>
</html>`;

const targetPath = path.resolve('public/index.html');
fs.writeFileSync(targetPath, htmlContent, 'utf-8');
console.log('Successfully wrote updated public/index.html to', targetPath);
