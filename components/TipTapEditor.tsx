'use client';

import React, { useState, useMemo } from 'react';
import { brandCompiler, CompilerReport, CompilerFinding } from '../lib/compiler';
import { DEMO_PRESET_SCENARIOS } from '../lib/mockData/inkloom';

export interface TipTapEditorProps {
  initialContent?: string;
  onRunReview?: (content: string, report: CompilerReport) => void;
}

export function TipTapEditor({ initialContent, onRunReview }: TipTapEditorProps) {
  const [content, setContent] = useState<string>(
    initialContent || DEMO_PRESET_SCENARIOS.highRisk.content
  );
  const [activeFinding, setActiveFinding] = useState<CompilerFinding | null>(null);
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Compile real-time on every keystroke
  const report: CompilerReport = useMemo(() => {
    return brandCompiler.compile(content);
  }, [content]);

  // Handle applying a fix suggestion inline
  const handleApplyFix = (finding: CompilerFinding) => {
    if (!finding.flaggedText) return;
    const regex = new RegExp(finding.flaggedText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const newContent = content.replace(regex, finding.suggestedRewrite);
    setContent(newContent);
    setActiveFinding(null);
  };

  const loadPreset = (presetKey: 'highRisk' | 'unapprovedMetric' | 'compliantPost') => {
    setContent(DEMO_PRESET_SCENARIOS[presetKey].content);
    setActiveFinding(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 max-w-7xl mx-auto">
      {/* Main Editor Surface (Left 8 Cols) */}
      <div className="lg:col-span-8 space-y-4">
        {/* Preset Selector Bar */}
        <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-2xl flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300 font-mono">TEST PRESETS:</span>
            <div className="flex gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => loadPreset('highRisk')}
                className="px-2.5 py-1 text-xs rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-all font-medium"
              >
                High-Risk Ad Draft
              </button>
              <button
                type="button"
                onClick={() => loadPreset('unapprovedMetric')}
                className="px-2.5 py-1 text-xs rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 transition-all font-medium"
              >
                Unapproved Metric
              </button>
              <button
                type="button"
                onClick={() => loadPreset('compliantPost')}
                className="px-2.5 py-1 text-xs rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all font-medium"
              >
                100% Compliant
              </button>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(content);
              setCopiedNotification(true);
              setTimeout(() => setCopiedNotification(false), 2000);
            }}
            className="text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-all flex items-center gap-1"
          >
            {copiedNotification ? '✓ Copied' : 'Copy'}
          </button>
        </div>

        {/* The Creation-Time Firewall Container */}
        <div className="relative rounded-2xl border border-slate-800 bg-slate-950/80 shadow-2xl overflow-hidden backdrop-blur-sm">
          {/* Editor Header Toolbar */}
          <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="text-xs font-mono font-medium text-slate-400 ml-2">
                Creation-Time Firewall · AST Token Decorator
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-rose-400 font-mono text-[11px]">
                <span className="w-2 h-0.5 bg-rose-500 rounded" /> RED = Unsupported Claim
              </span>
              <span className="flex items-center gap-1.5 text-amber-400 font-mono text-[11px]">
                <span className="w-2 h-0.5 bg-amber-400 rounded" /> YELLOW = Tone Drift
              </span>
              <span className="flex items-center gap-1.5 text-orange-400 font-mono text-[11px]">
                <span className="w-2 h-0.5 bg-orange-400 rounded" /> ORANGE = Expired Fact
              </span>
            </div>
          </div>

          {/* Interactive Text Area with Real-Time Underline Highlights */}
          <div className="p-6 min-h-[340px] relative">
            <label htmlFor="content-editor" className="sr-only">Brand Asset Draft Content</label>
            <textarea
              id="content-editor"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type or paste marketing copy, ad scripts, sales emails, or blog articles here..."
              className="w-full h-44 bg-transparent text-slate-100 text-lg leading-relaxed focus:outline-none resize-none font-sans"
            />

            {/* Render Underlined Findings Badges for Direct One-Click Remediation */}
            <div className="mt-4 pt-4 border-t border-slate-800/60">
              <p className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider mb-2.5">
                Real-Time Highlighted Assertions ({report.findings.length} detected):
              </p>
              <div className="flex flex-wrap gap-2">
                {report.findings.map((f) => {
                  const underlineClass =
                    f.category === 'Claim Evidence' && f.flaggedText.includes('$')
                      ? 'border-orange-500 text-orange-300 bg-orange-500/10'
                      : f.category === 'Claim Evidence'
                      ? 'border-rose-500 text-rose-300 bg-rose-500/10'
                      : 'border-amber-400 text-amber-300 bg-amber-500/10';

                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setActiveFinding(f)}
                      className={`px-3 py-1.5 rounded-lg border-b-2 text-xs font-medium cursor-pointer transition-all hover:scale-105 shadow-sm flex items-center gap-1.5 ${underlineClass}`}
                    >
                      <span className="font-bold underline decoration-wavy decoration-2">
                        "{f.flaggedText}"
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1 rounded bg-slate-900/80">
                        {f.category}
                      </span>
                      <span className="text-xs">⚡</span>
                    </button>
                  );
                })}
                {report.findings.length === 0 && (
                  <p className="text-xs text-emerald-400 font-mono flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Zero brand violations detected. Copy is 100% compliant with BrandDNA!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Instant Fix Suggestion Popup (WOW FEATURE) */}
          {activeFinding && (
            <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 border-t border-sky-500/40 animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      {activeFinding.category} Finding
                    </span>
                    <span className="text-xs font-semibold text-white">
                      {activeFinding.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-normal">
                    {activeFinding.diagnosis}
                  </p>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                    <p className="text-slate-400 text-[11px] font-mono">
                      Closest Approved in BrandDNA:
                    </p>
                    <p className="text-cyan-300 font-medium mt-0.5">
                      {activeFinding.closestApproved}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-sky-950/30 border border-sky-500/30 text-xs">
                    <p className="text-sky-300 text-[11px] font-mono font-semibold">
                      Intent-Preserving Rewrite ({activeFinding.intentPreserved}):
                    </p>
                    <p className="text-white font-medium mt-0.5">
                      "{activeFinding.suggestedRewrite}"
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleApplyFix(activeFinding)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-semibold text-xs shadow-lg shadow-sky-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>⚡ Accept Fix</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFinding(null)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="px-6 py-4 bg-slate-900/70 border-t border-slate-800 flex items-center justify-between flex-wrap gap-3">
            <span className="text-xs text-slate-400 font-mono">
              Last compiled: {new Date(report.timestamp).toLocaleTimeString()} · Deterministic AST
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await fetch('/api/forensics/live-mutation', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        title: 'Live Ad Mutation from Editor',
                        content,
                        complianceScore: report.score,
                        channel: 'LinkedIn Ads'
                      })
                    });
                  } catch (_) {}
                  window.location.href = '/forensics';
                }}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-1.5 cursor-pointer font-mono"
              >
                <span>⚡ View Impact (Neo4j) →</span>
              </button>
              <a
                href="/review"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-500 to-cyan-500 hover:opacity-90 text-white font-bold text-xs tracking-wide shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2"
              >
                <span>Run BrandTrust Compiler & Debate</span>
                <span>→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar: Live Brand Compliance Score & Diagnostics (Right 4 Cols) */}
      <div className="lg:col-span-4 space-y-4">
        {/* Score Gauge Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Live Compliance Score
            </h2>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                report.overallStatus === 'PASS'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : report.overallStatus === 'CONDITIONAL'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              {report.overallStatus} · {report.riskLevel} Risk
            </span>
          </div>

          {/* Large Radial/Score Display */}
          <div className="flex items-center justify-center py-4">
            <div className="relative flex items-center justify-center">
              <div
                className={`w-32 h-32 rounded-full border-4 flex flex-col items-center justify-center transition-all duration-500 ${
                  report.score >= 85
                    ? 'border-emerald-500 text-emerald-400 shadow-emerald-500/20 shadow-2xl'
                    : report.score >= 60
                    ? 'border-amber-400 text-amber-400 shadow-amber-500/20 shadow-2xl'
                    : 'border-rose-500 text-rose-400 shadow-rose-500/20 shadow-2xl'
                }`}
              >
                <span className="text-4xl font-extrabold tracking-tight font-mono">{report.score}</span>
                <span className="text-[10px] uppercase font-semibold text-slate-400">/ 100</span>
              </div>
            </div>
          </div>

          {/* Sub-Score Progress Bars */}
          <div className="space-y-3 mt-4 pt-4 border-t border-slate-800/80">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Factual Evidence (BrandDNA)</span>
                <span className="font-mono text-cyan-400">{report.subScores.factualScore}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-cyan-400 transition-all duration-500"
                  style={{ width: `${report.subScores.factualScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Tone & Voice Alignment</span>
                <span className="font-mono text-indigo-400">{report.subScores.toneScore}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-400 transition-all duration-500"
                  style={{ width: `${report.subScores.toneScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Policy & Terminology</span>
                <span className="font-mono text-sky-400">{report.subScores.policyScore}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-sky-400 transition-all duration-500"
                  style={{ width: `${report.subScores.policyScore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300 font-medium">Visual & WCAG Accessibility</span>
                <span className="font-mono text-emerald-400">{report.subScores.visualAccessibilityScore}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-500"
                  style={{ width: `${report.subScores.visualAccessibilityScore}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Explainable AI Correction Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 text-xs space-y-2">
          <div className="flex items-center gap-2 text-sky-400 font-semibold font-mono">
            <span>🛡️</span>
            <span>EXPLAINABLE CORRECTION, NOT REJECTION</span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            FORENSIQ never halts creative velocity with arbitrary rejections. Every policy violation provides the exact source citation and an intent-preserving rewrite so your campaign ships on time.
          </p>
        </div>
      </div>
    </div>
  );
}
