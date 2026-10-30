'use client';

import React, { useState } from 'react';
import { MultiAgentDebateResult, AgentMessage } from '../lib/compiler/agents';

export interface MultiAgentDebateProps {
  debateResult: MultiAgentDebateResult;
  onApplyApprovedCopy?: (copy: string) => void;
}

export function MultiAgentDebate({ debateResult, onApplyApprovedCopy }: MultiAgentDebateProps) {
  const [activeStep, setActiveStep] = useState<number>(debateResult.rounds.length);
  const [copied, setCopied] = useState(false);

  const rounds = debateResult.rounds.slice(0, activeStep);
  const consensus = debateResult.synthesizedConsensus;

  return (
    <div className="space-y-6">
      {/* Debate Header */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-cyan-400 p-[1.5px]">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-lg">
              ⚖️
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white font-mono">BrandNegotiator™ Autonomous Multi-Agent Court</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-sky-500/20 text-sky-300 border border-sky-400/30">
                4 Agents Live
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Autonomous resolution protocol between creative expression, factuality, brand equity, and legal liability.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveStep(debateResult.rounds.length)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-all"
          >
            Show All Rounds
          </button>
        </div>
      </div>

      {/* 4 Agent Profile Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/30 flex items-center gap-2.5">
          <span className="text-2xl">🎨</span>
          <div>
            <p className="text-xs font-bold text-blue-300">Creator Agent</p>
            <p className="text-[10px] text-slate-400">Defends CTR & Intent</p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-500/30 flex items-center gap-2.5">
          <span className="text-2xl">🔍</span>
          <div>
            <p className="text-xs font-bold text-cyan-300">Evidence Agent</p>
            <p className="text-[10px] text-slate-400">BrandDNA Vector Index</p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 flex items-center gap-2.5">
          <span className="text-2xl">🛡️</span>
          <div>
            <p className="text-xs font-bold text-indigo-300">Guardian Agent</p>
            <p className="text-[10px] text-slate-400">Tone & Lexicon Guard</p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-center gap-2.5">
          <span className="text-2xl">⚖️</span>
          <div>
            <p className="text-xs font-bold text-rose-300">Risk Agent</p>
            <p className="text-[10px] text-slate-400">FTC & Legal Exposure</p>
          </div>
        </div>
      </div>

      {/* Stream of Agent Arguments */}
      <div className="space-y-3.5">
        {rounds.map((msg: AgentMessage, idx: number) => {
          const borderColors = {
            Creator: 'border-blue-500/40 bg-blue-950/20',
            Evidence: 'border-cyan-500/40 bg-cyan-950/20',
            Guardian: 'border-indigo-500/40 bg-indigo-950/20',
            Risk: 'border-rose-500/40 bg-rose-950/20'
          };
          const badgeColors = {
            Creator: 'text-blue-300 bg-blue-500/20 border-blue-500/40',
            Evidence: 'text-cyan-300 bg-cyan-500/20 border-cyan-500/40',
            Guardian: 'text-indigo-300 bg-indigo-500/20 border-indigo-500/40',
            Risk: 'text-rose-300 bg-rose-500/20 border-rose-500/40'
          };

          return (
            <div
              key={msg.id}
              className={`p-4 rounded-2xl border ${borderColors[msg.agentRole]} transition-all animate-in fade-in duration-300`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">{msg.avatar}</span>
                  <div>
                    <span className="text-xs font-bold text-white">{msg.agentName}</span>
                    <span className="text-[10px] text-slate-400 ml-2 font-mono">Round {idx + 1}</span>
                  </div>
                </div>
                <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded-full border ${badgeColors[msg.agentRole]}`}>
                  {msg.stance}
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans pl-8">
                "{msg.text}"
              </p>
            </div>
          );
        })}
      </div>

      {/* Synthesized Final Consensus Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border border-emerald-500/40 shadow-2xl">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Consensus Synthesis & Legally Defensible Rewrite
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
              Decision: {consensus.finalDecision}
            </span>
            <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
              Risk: {consensus.riskScore}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <p className="text-[11px] font-mono text-slate-400 uppercase font-semibold mb-1">
              Intent Preservation Statement:
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              {consensus.preservedIntentStatement}
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <p className="text-[11px] font-mono text-slate-400 uppercase font-semibold mb-1">
              Synthesized Rationale:
            </p>
            <p className="text-xs text-slate-300 leading-relaxed">
              {consensus.rationale}
            </p>
          </div>
        </div>

        {/* Approved Defensible Copy */}
        <div className="p-4 rounded-xl bg-slate-950/90 border border-sky-500/40 mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-sky-400 uppercase">
              Approved BrandContract™ Copy:
            </span>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard?.writeText(consensus.approvedCopy);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="text-[11px] text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-800"
            >
              {copied ? '✓ Copied' : 'Copy Approved Copy'}
            </button>
          </div>
          <p className="text-sm text-slate-100 font-medium leading-relaxed">
            "{consensus.approvedCopy}"
          </p>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <a
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
          >
            <span>Proceed to Step 5: Approval & BrandContract</span>
            <span>→</span>
          </a>
        </div>
      </div>
    </div>
  );
}
