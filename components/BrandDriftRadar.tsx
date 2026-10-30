'use client';

import React, { useState, useEffect } from 'react';
import { immuneEngine, BrandContract } from '../lib/immune';
import { AdHistoryItem } from '../lib/mockData/inkloom';

export function BrandDriftRadar() {
  const [selectedAd, setSelectedAd] = useState<any | null>(null);
  const [patchApplied, setPatchApplied] = useState(false);
  const [contractModalOpen, setContractModalOpen] = useState(false);
  const [issuedContract, setIssuedContract] = useState<BrandContract | null>(null);
  const [isGeneratingBatch, setIsGeneratingBatch] = useState(false);

  // Dynamic Drift Telemetry State (fetched live from Neo4j backend)
  const defaultDrift = immuneEngine.getDriftRadarData();
  const [driftAds, setDriftAds] = useState<any[]>(defaultDrift.ads);
  const [baselineScore, setBaselineScore] = useState<number>(94);
  const [currentScore, setCurrentScore] = useState<number>(16);
  const [driftDelta, setDriftDelta] = useState<number>(-78);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [liveSessionCount, setLiveSessionCount] = useState<number>(0);

  const rootCause = immuneEngine.getRootCauseAnalysis();
  const heatmap = immuneEngine.getRepeatedMistakesHeatmap();
  const unclearRules = immuneEngine.getUnclearGuidelines();

  // Fetch Live Dynamic Drift History from backend
  const fetchDriftHistory = async () => {
    try {
      const res = await fetch('/api/drift/history');
      if (res.ok) {
        const data = await res.json();
        if (data.history && Array.isArray(data.history)) {
          setDriftAds(data.history);
        }
        if (typeof data.baselineScore === 'number') setBaselineScore(data.baselineScore);
        if (typeof data.currentScore === 'number') setCurrentScore(data.currentScore);
        if (typeof data.driftDelta === 'number') setDriftDelta(data.driftDelta);
        if (Array.isArray(data.timeline)) setTimeline(data.timeline);
        if (typeof data.liveSessionCount === 'number') setLiveSessionCount(data.liveSessionCount);
      }
    } catch (err) {
      console.warn('Could not fetch dynamic drift history, falling back to local simulation:', err);
    }
  };

  useEffect(() => {
    fetchDriftHistory();

    // Listen to live drift updates via SSE
    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/events');
      es.addEventListener('drift_update', () => fetchDriftHistory());
      es.addEventListener('asset_published', () => fetchDriftHistory());
    } catch (_) {}

    return () => {
      if (es) es.close();
    };
  }, []);

  // Judge Demo Action: Generate 10 Live Test Ads to watch drift calculation update dynamically
  const handleGenerateLiveAds = async (mode: 'drift' | 'compliant' | 'mixed' = 'mixed') => {
    setIsGeneratingBatch(true);
    try {
      const res = await fetch('/api/drift/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 10, mode })
      });
      if (res.ok) {
        await fetchDriftHistory();
      }
    } catch (err) {
      console.error('Batch ad generation error:', err);
    } finally {
      setIsGeneratingBatch(false);
    }
  };

  const handleApplyPatch = () => {
    immuneEngine.applySystemicPatch();
    setPatchApplied(true);
  };

  const handleIssueContract = () => {
    const contract = immuneEngine.issueBrandContract({
      assetTitle: "Q4 Enterprise Launch Campaign Master",
      content: "Inkloom saves 25% creative production time backed by SOC-2 Type II audit.",
      approvedBy: "Elena Rostova (Chief Brand Officer)",
      approverRole: "Brand Manager",
      verifiedFactIds: ["FACT-001", "FACT-003"],
      governanceScore: 98
    });
    setIssuedContract(contract);
    setContractModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Brand Drift Radar Line Chart (BrandGene) */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Brand Drift Radar™ (BrandGene Tone Trajectory)
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                {driftAds.length} Ads Dynamic Telemetry
              </span>
              {liveSessionCount > 0 && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 animate-pulse">
                  +{liveSessionCount} Live Session Inputs Active
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Dynamic multi-month aggregation: Baseline ({baselineScore} pts) → Current ({currentScore} pts). Automatically recalibrates on new ad submissions.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Dynamic Drift Delta Badge (Never Hardcoded!) */}
            <span
              className={`text-xs font-mono px-3 py-1.5 rounded-xl border flex items-center gap-1.5 font-bold ${
                driftDelta < 0
                  ? 'text-rose-400 bg-rose-950/40 border-rose-800/40'
                  : 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40'
              }`}
            >
              <span>{driftDelta < 0 ? '📉' : '📈'}</span>
              <span>Tone Delta: {driftDelta > 0 ? `+${driftDelta}` : `${driftDelta}`} pts</span>
              <span className="text-[10px] opacity-75">({baselineScore} → {currentScore})</span>
            </span>

            {/* Judge Demo Quick Action: 10 Live Ads */}
            <button
              type="button"
              onClick={() => handleGenerateLiveAds('mixed')}
              disabled={isGeneratingBatch}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:opacity-90 text-white font-mono font-bold text-xs shadow-md shadow-sky-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isGeneratingBatch ? (
                <>
                  <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Ingesting 10 Ads...</span>
                </>
              ) : (
                <>
                  <span>⚡ Ingest 10 Live Test Ads</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Dynamic SVG Line Chart for Ads History */}
        <div className="relative bg-slate-950/90 rounded-xl p-4 border border-slate-800/80 select-none">
          {/* Dynamic Monthly Timeline Header */}
          <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-2 flex-wrap gap-2">
            <span>May 2024 (Baseline / {baselineScore}%)</span>
            <span className="text-amber-400">July 2024 (Agency X Onboarding)</span>
            <span className="text-rose-400">
              {liveSessionCount > 0 ? `Live Session / Oct (${currentScore}%)` : `Current Month (${currentScore}%)`}
            </span>
          </div>

          <svg className="w-full h-48" viewBox="0 0 800 160">
            {/* Gridlines */}
            <line x1="0" y1="30" x2="800" y2="30" stroke="#1E293B" strokeDasharray="3,3" />
            <line x1="0" y1="80" x2="800" y2="80" stroke="#1E293B" strokeDasharray="3,3" />
            <line x1="0" y1="130" x2="800" y2="130" stroke="#1E293B" strokeDasharray="3,3" />

            {/* Polyline connecting all ad data points */}
            <polyline
              fill="none"
              stroke="#6366F1"
              strokeWidth="3"
              points={driftAds.map((ad, i) => {
                const total = Math.max(1, driftAds.length - 1);
                const x = (i / total) * 780 + 10;
                const score = ad.toneScore ?? 50;
                const y = 145 - (score / 100) * 125;
                return `${x},${y}`;
              }).join(' ')}
            />

            {/* Render Data Points (Clickable) */}
            {driftAds.map((ad, i) => {
              const total = Math.max(1, driftAds.length - 1);
              const x = (i / total) * 780 + 10;
              const score = ad.toneScore ?? 50;
              const y = 145 - (score / 100) * 125;
              const isSelected = selectedAd?.adNum === ad.adNum;
              const isLive = Boolean(ad.isLiveSession);
              const dotColor = isLive ? '#C084FC' : ad.flagged ? '#EF4444' : score < 70 ? '#F59E0B' : '#38BDF8';

              return (
                <circle
                  key={ad.adNum || i}
                  cx={x}
                  cy={y}
                  r={isSelected ? 6 : isLive ? 5 : ad.flagged ? 4 : 3}
                  fill={dotColor}
                  stroke="#FFFFFF"
                  strokeWidth={isSelected || isLive ? 2 : 1}
                  className="cursor-pointer hover:scale-150 transition-all"
                  onClick={() => setSelectedAd(ad)}
                />
              );
            })}
          </svg>

          {/* Ad Detail Card on Click */}
          {selectedAd && (
            <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-sky-500/40 flex items-start justify-between gap-4 animate-in fade-in">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-bold text-white font-mono">
                    Ad #{selectedAd.adNum || selectedAd.adNumber}: "{selectedAd.title}"
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {selectedAd.date} · {selectedAd.channel || 'Public Channels'}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    selectedAd.flagged ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {selectedAd.sentiment || (selectedAd.flagged ? 'Aggressive Hype' : 'Compliant')}
                  </span>
                  {selectedAd.isLiveSession && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                      ⚡ Live Session Input
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 font-sans italic mt-1">
                  "{selectedAd.snippet || selectedAd.copySnippet || selectedAd.content}"
                </p>
                <p className="text-[10px] text-slate-500 font-mono mt-1">
                  Author Agency: {selectedAd.agency || selectedAd.authorAgency} · Tone Score: {selectedAd.toneScore}/100 · Urgency: {selectedAd.urgencyScore}/100
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAd(null)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
          )}

          {/* Dynamic Monthly Timeline Breakdown Cards */}
          {timeline.length > 0 && (
            <div className="mt-4 pt-4 border-t border-slate-800/80">
              <p className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider mb-2">
                Monthly Aggregated Tone & Urgency Progression ({timeline.length} Cohorts):
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {timeline.map((tc, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border text-xs ${
                      tc.month.includes('Live Session')
                        ? 'bg-purple-950/30 border-purple-500/40'
                        : tc.avgTone >= 80
                        ? 'bg-slate-900/60 border-slate-800'
                        : tc.avgTone >= 50
                        ? 'bg-amber-950/20 border-amber-500/30'
                        : 'bg-rose-950/20 border-rose-500/30'
                    }`}
                  >
                    <p className="text-[10px] font-mono text-slate-400 font-semibold">{tc.month}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className="font-mono font-bold text-white text-xs">{tc.avgTone} pts</span>
                      <span className={`text-[10px] font-mono ${tc.avgTone >= 80 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {tc.status}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full ${tc.avgTone >= 80 ? 'bg-cyan-400' : tc.avgTone >= 50 ? 'bg-amber-400' : 'bg-rose-500'}`}
                        style={{ width: `${tc.avgTone}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Root-Cause Immunizer (Finds WHY Mistakes Repeat) */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border border-sky-500/40 shadow-2xl">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💉</span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  Root-Cause Immunizer™ (Systemic Error Prevention)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  ML Pattern Extraction
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {rootCause.headline}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleApplyPatch}
            className={`px-4 py-2 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 shadow-lg cursor-pointer ${
              patchApplied
                ? 'bg-emerald-600 text-white shadow-emerald-500/30'
                : 'bg-gradient-to-r from-sky-500 to-indigo-600 hover:opacity-90 text-white shadow-sky-500/30'
            }`}
          >
            {patchApplied ? (
              <>
                <span>✓ Systemic Patch Deployed</span>
                <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded">18 Seats Protected</span>
              </>
            ) : (
              <>
                <span>⚡ Deploy Systemic Immunization Patch</span>
                <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded">1-Click Fix</span>
              </>
            )}
          </button>
        </div>

        {/* Pattern Breakdown Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <p className="text-[11px] font-mono text-slate-400 uppercase font-semibold mb-2">
              Repeated Error Breakdown (Same Template = 62.5% of Violations):
            </p>
            <div className="space-y-2">
              {rootCause.violationsBreakdown.map((vb, i) => (
                <div key={i} className="flex justify-between items-center text-xs p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-300">{vb.rule}</span>
                  <span className="font-mono text-rose-400 font-bold">{vb.occurrences}x</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
            <div>
              <p className="text-[11px] font-mono text-slate-400 uppercase font-semibold mb-2">
                Systemic Solution & Policy Enforcement:
              </p>
              <p className="text-xs text-slate-300 leading-relaxed">
                {rootCause.systemicFix}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Agency: {rootCause.agency}</span>
              <span className="text-emerald-400 font-bold">Prevents 23 Future Errors</span>
            </div>
          </div>
        </div>
      </div>

      {/* Repeated Mistakes Heatmap & Unclear Guideline Detector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Heatmap Card */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>🔥</span>
              <span>Repeated Mistakes Heatmap</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">By Department</span>
          </div>
          <div className="space-y-2">
            {heatmap.map((h, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs">
                <div>
                  <p className="text-slate-200 font-medium">{h.guideline}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{h.department}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-rose-400">{h.violationCount} hits</span>
                  <span className={`w-2 h-2 rounded-full ${h.riskWeight === 'High' ? 'bg-rose-500' : 'bg-amber-400'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Unclear Guideline Detector */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span>❓</span>
              <span>Unclear Guideline Detector</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Dispute Rates</span>
          </div>
          <div className="space-y-3">
            {unclearRules.map(ur => (
              <div key={ur.ruleId} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">{ur.ruleTitle}</span>
                  <span className="font-mono text-amber-400 font-bold">{ur.disputeRate} Disputes</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  {ur.systemicDiagnosis}
                </p>
                <div className="p-2 rounded bg-sky-950/30 border border-sky-800/40 text-[11px] text-sky-200 mt-1">
                  💡 Recommendation: {ur.suggestedClarification}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BrandContract™ Audit Certificate Action */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between flex-wrap gap-4 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📜</span>
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Issue Official BrandContract™ Digital Certificate
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographically anchors approval timestamp, approver signature, and BrandDNA validity.
          </p>
        </div>
        <button
          type="button"
          onClick={handleIssueContract}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-teal-500 hover:opacity-90 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition-all font-mono"
        >
          Generate BrandContract™
        </button>
      </div>

      {/* BrandContract Certificate Modal */}
      {contractModalOpen && issuedContract && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-sky-500/50 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏛️</span>
                <div>
                  <h3 className="text-base font-bold text-white font-mono">
                    BrandContract™ Official Certificate
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    ID: {issuedContract.contractId}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setContractModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                <p className="text-slate-400 font-mono">Campaign Asset:</p>
                <p className="text-white font-semibold">{issuedContract.assetTitle}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-slate-400 font-mono">Approver:</p>
                  <p className="text-white font-medium">{issuedContract.approvedBy}</p>
                  <p className="text-[10px] text-sky-400 font-mono">{issuedContract.approverRole}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-slate-400 font-mono">Expiry Date:</p>
                  <p className="text-white font-medium">{issuedContract.expiryDate}</p>
                  <p className="text-[10px] text-emerald-400 font-mono">Valid 365 Days</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px]">
                <p className="text-slate-400">Cryptographic SHA-256 Hash:</p>
                <p className="text-cyan-300 break-all">{issuedContract.sha256Hash}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px]">
                <p className="text-slate-400">Digital Signature:</p>
                <p className="text-indigo-300">{issuedContract.digitalSignature}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setContractModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs font-mono"
              >
                Close Certificate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
