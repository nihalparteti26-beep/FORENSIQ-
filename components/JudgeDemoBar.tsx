'use client';

import React from 'react';
import Link from 'next/navigation';

export interface JudgeDemoBarProps {
  onLoadScenario?: (scenarioKey: 'highRisk' | 'unapprovedMetric' | 'compliantPost') => void;
  activePage?: string;
}

export function JudgeDemoBar({ onLoadScenario, activePage }: JudgeDemoBarProps) {
  return (
    <aside aria-label="Judge Walkthrough and Quick Demo Bar" className="bg-gradient-to-r from-sky-950 via-slate-900 to-indigo-950 border-b border-sky-500/30 px-4 py-2.5 text-xs text-sky-200 flex flex-wrap items-center justify-between gap-3 shadow-lg z-50">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-semibold text-white tracking-wide uppercase text-[11px] px-2 py-0.5 rounded bg-sky-500/20 border border-sky-400/40">
          Judges 2-Min Demo Mode
        </span>
        <span className="text-slate-300 hidden sm:inline">
          Test FORENSIQ live workflow end-to-end:
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-slate-400 font-medium">Quick Scenarios:</span>
        <button
          type="button"
          onClick={() => onLoadScenario?.('highRisk')}
          className="px-2.5 py-1 rounded bg-rose-500/20 border border-rose-500/40 text-rose-200 hover:bg-rose-500/30 transition-all font-medium flex items-center gap-1.5 cursor-pointer"
          title="Loads high-risk draft with unsupported 40% claim, urgency tone drift, and expired $49 pricing"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
          1. High-Risk Ad (All Underlines)
        </button>

        <button
          type="button"
          onClick={() => onLoadScenario?.('unapprovedMetric')}
          className="px-2.5 py-1 rounded bg-amber-500/20 border border-amber-500/40 text-amber-200 hover:bg-amber-500/30 transition-all font-medium flex items-center gap-1.5 cursor-pointer"
          title="Loads 40% efficiency claim without evidence"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          2. Unbacked Metric Claim
        </button>

        <button
          type="button"
          onClick={() => onLoadScenario?.('compliantPost')}
          className="px-2.5 py-1 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 hover:bg-emerald-500/30 transition-all font-medium flex items-center gap-1.5 cursor-pointer"
          title="Loads 100% compliant post with Forrester 25% verified source"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          3. 100% Compliant Post
        </button>

        <span className="h-4 w-px bg-slate-700 mx-1" />

        <span className="text-slate-400">Jump to:</span>
        <a href="/editor" className="text-sky-300 hover:text-white underline underline-offset-2">Editor</a>
        <span className="text-slate-600">·</span>
        <a href="/review" className="text-sky-300 hover:text-white underline underline-offset-2">4-Agent Debate</a>
        <span className="text-slate-600">·</span>
        <a href="/forensics" className="text-sky-300 hover:text-white underline underline-offset-2">Ripple Graph</a>
        <span className="text-slate-600">·</span>
        <a href="/dashboard" className="text-sky-300 hover:text-white underline underline-offset-2">Drift Radar</a>
      </div>
    </aside>
  );
}
