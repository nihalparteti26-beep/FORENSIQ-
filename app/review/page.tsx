'use client';

import React, { useState } from 'react';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';
import { JudgeDemoBar } from '../../components/JudgeDemoBar';
import { MultiAgentDebate } from '../../components/MultiAgentDebate';
import { brandCompiler, CompilerReport } from '../../lib/compiler';
import { brandNegotiator, MultiAgentDebateResult } from '../../lib/compiler/agents';
import { accessibilityEngine, AccessibilityAuditReport } from '../../lib/compiler/accessibility';
import { DEMO_PRESET_SCENARIOS } from '../../lib/mockData/inkloom';

export default function ReviewPage() {
  const [currentRole, setCurrentRole] = useState<'Creator' | 'Brand Manager' | 'Reviewer' | 'Legal & Compliance'>('Reviewer');
  const [privacyShieldActive, setPrivacyShieldActive] = useState(true);
  const [draftContent, setDraftContent] = useState(DEMO_PRESET_SCENARIOS.highRisk.content);
  const [report, setReport] = useState<CompilerReport>(brandCompiler.compile(draftContent));
  const [debate, setDebate] = useState<MultiAgentDebateResult>(brandNegotiator.conductDebate(draftContent, report));
  const [isCompiling, setIsCompiling] = useState(false);
  const [isInsertingImpact, setIsInsertingImpact] = useState(false);
  const [showJsonAudit, setShowJsonAudit] = useState(false);
  const [showA11yMatrix, setShowA11yMatrix] = useState(false);

  // Evaluate deep axe-core accessibility compliance
  const a11yReport: AccessibilityAuditReport = report.accessibilityReport || accessibilityEngine.evaluate(draftContent);

  const handleRunCompiler = () => {
    setIsCompiling(true);
    setTimeout(() => {
      const newReport = brandCompiler.compile(draftContent);
      setReport(newReport);
      setDebate(brandNegotiator.conductDebate(draftContent, newReport));
      setIsCompiling(false);
    }, 1000);
  };

  // Dynamically register live mutation into Neo4j when "View Impact" is clicked
  const handleViewImpact = async () => {
    setIsInsertingImpact(true);
    try {
      await fetch('/api/forensics/live-mutation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Live Judge Ad Mutation',
          content: draftContent,
          actor: 'Judge Demo Session',
          role: currentRole,
          complianceScore: report.score,
          channel: 'LinkedIn Ads'
        })
      });
    } catch (err) {
      console.warn('Live mutation registration fallback:', err);
    } finally {
      setIsInsertingImpact(false);
      window.location.href = '/forensics';
    }
  };

  const checks = [
    { num: '01', title: 'Tone Check', detail: 'LLM tone & sentiment analysis vs brand guidelines', status: report.findings.some(f => f.category === 'Tone') ? 'WARN' : 'PASS' },
    { num: '02', title: 'Terminology Check', detail: 'Banned vocabulary list vs approved lexicon', status: report.findings.some(f => f.category === 'Terminology') ? 'FAIL' : 'PASS' },
    { num: '03', title: 'Messaging Check', detail: 'Core value pillars, positioning & required disclaimers', status: report.findings.some(f => f.category === 'Messaging') ? 'WARN' : 'PASS' },
    { num: '04', title: 'Visual Check', detail: 'Logo version (v2.4 SVG), brand hex #0284C7, typography', status: report.findings.some(f => f.category === 'Visual') ? 'WARN' : 'PASS' },
    {
      num: '05',
      title: 'Advanced Accessibility (Axe-Core)',
      detail: `WCAG 2.1 ${a11yReport.wcagCompliance}: ${a11yReport.passedCount} rules passed, ${a11yReport.failedCount} violations, ${a11yReport.warningCount} warnings (Click to inspect matrix)`,
      status: a11yReport.failedCount > 0 ? 'FAIL' : a11yReport.warningCount > 0 ? 'WARN' : 'PASS',
      isA11y: true
    },
    { num: '06', title: 'Claim Evidence Check', detail: 'Qdrant vector similarity match to BrandDNA facts', status: report.findings.some(f => f.category === 'Claim Evidence') ? 'FAIL' : 'PASS' },
  ];

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar currentPath="/review" />
      <div className="flex-1 flex flex-col min-w-0">
        <JudgeDemoBar activePage="review" />
        <Topbar
          title="Step 3: Pre-Publish Compiler Check"
          subtitle="6 deterministic brand governance tests + Autonomous 4-Agent Debate (BrandNegotiator)"
          currentRole={currentRole}
          onRoleChange={setCurrentRole}
          privacyShieldActive={privacyShieldActive}
          onTogglePrivacyShield={() => setPrivacyShieldActive(!privacyShieldActive)}
        />
        <main className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6 overflow-y-auto">
          {/* Action Header Card */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-indigo-950 border border-slate-800 flex items-center justify-between flex-wrap gap-4 shadow-xl">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">⚙️</span>
                <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  BrandTrust Compiler™ Pre-Flight Execution
                </h2>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Compiles creative content against 200+ testable brand, legal, and visual policies.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => setShowA11yMatrix(!showA11yMatrix)}
                className="px-3.5 py-2 rounded-xl bg-purple-950/40 border border-purple-500/40 hover:bg-purple-900/40 text-purple-300 text-xs font-mono transition-all flex items-center gap-1.5"
              >
                <span>♿ Axe-Core Matrix</span>
                <span className="text-[10px] bg-purple-500/20 px-1.5 py-0.5 rounded">
                  {a11yReport.wcagCompliance}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowJsonAudit(!showJsonAudit)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-all"
              >
                {showJsonAudit ? 'Hide JSON Report' : '{ } View Audit JSON'}
              </button>

              <button
                type="button"
                onClick={handleRunCompiler}
                disabled={isCompiling}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 via-indigo-600 to-teal-500 hover:opacity-90 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition-all font-mono flex items-center gap-2 cursor-pointer"
              >
                {isCompiling ? (
                  <>
                    <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Compiling 6 Tests...</span>
                  </>
                ) : (
                  <>
                    <span>⚡ Run BrandTrust Compiler</span>
                  </>
                )}
              </button>

              {/* VIEW IMPACT (DYNAMIC NEO4J MUTATION INSERTION) */}
              <button
                type="button"
                onClick={handleViewImpact}
                disabled={isInsertingImpact}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-mono font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isInsertingImpact ? (
                  <>
                    <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Persisting to Neo4j...</span>
                  </>
                ) : (
                  <>
                    <span>View Impact & Forensics →</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 6 Automated Check Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {checks.map(c => {
              const isPass = c.status === 'PASS';
              const isWarn = c.status === 'WARN';
              return (
                <div
                  key={c.num}
                  onClick={() => c.isA11y && setShowA11yMatrix(!showA11yMatrix)}
                  className={`p-4 rounded-xl border transition-all ${c.isA11y ? 'cursor-pointer hover:border-purple-500/60' : ''} ${
                    isPass
                      ? 'bg-slate-900/60 border-emerald-500/30'
                      : isWarn
                      ? 'bg-slate-900/60 border-amber-500/30'
                      : 'bg-slate-900/60 border-rose-500/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono text-slate-500">CHECK {c.num}</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                        isPass
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : isWarn
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white mb-1">{c.title}</h3>
                  <p className="text-[11px] text-slate-400 leading-normal">{c.detail}</p>
                  {c.isA11y && (
                    <span className="inline-block mt-2 text-[10px] font-mono text-purple-400 underline">
                      {showA11yMatrix ? '▲ Hide Axe-Core Rule Matrix' : '▼ Expand Axe-Core Rule Matrix'}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* ADVANCED ACCESSIBILITY AXE-CORE AUDIT MATRIX DRAWER */}
          {showA11yMatrix && (
            <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-purple-950/40 border border-purple-500/50 shadow-2xl space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-purple-500/30 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">♿</span>
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                      Axe-Core Enterprise Accessibility Audit Matrix (WCAG 2.1 AA / AAA)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Evaluates reading order, heading hierarchy, key ARIA attributes, button/link names, and contrast.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    Compliance: {a11yReport.wcagCompliance}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowA11yMatrix(false)}
                    className="text-slate-400 hover:text-white text-xs px-2"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Rules Evaluation Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {a11yReport.rules.map(rule => (
                  <div
                    key={rule.ruleId}
                    className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                      rule.status === 'PASS'
                        ? 'bg-slate-900/50 border-emerald-500/30'
                        : rule.status === 'WARNING'
                        ? 'bg-amber-950/20 border-amber-500/40'
                        : 'bg-rose-950/20 border-rose-500/40'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[11px] font-bold text-white">
                        [{rule.ruleId}] {rule.ruleTitle}
                      </span>
                      <span
                        className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          rule.status === 'PASS'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : rule.status === 'WARNING'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {rule.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-normal">
                      {rule.description}
                    </p>
                    <div className="pt-1 text-[10px] font-mono text-slate-400 flex items-center justify-between">
                      <span>Criterion: {rule.wcagCriterion}</span>
                      <span className="text-sky-300">Level {rule.wcagLevel}</span>
                    </div>
                    {rule.status !== 'PASS' && (
                      <div className="p-2 rounded bg-slate-950/80 border border-slate-800 text-[10px] text-sky-200 mt-1">
                        💡 Remediation: {rule.remediation}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* JSON Audit Report Drawer */}
          {showJsonAudit && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-sky-300 overflow-x-auto max-h-72">
              <pre>{JSON.stringify({ report, debateConsensus: debate.synthesizedConsensus }, null, 2)}</pre>
            </div>
          )}

          {/* 4-Agent Debate Surface (BrandNegotiator) */}
          <MultiAgentDebate debateResult={debate} />
        </main>
      </div>
    </div>
  );
}
