'use client';

import React from 'react';

export interface SidebarProps {
  currentPath: string;
}

export function Sidebar({ currentPath }: SidebarProps) {
  const navItems = [
    {
      step: '01',
      name: 'Ingest & BrandTwin',
      href: '/ingest',
      icon: '🧬',
      description: 'Knowledge Graph & Vector DB',
      badge: '20 Facts'
    },
    {
      step: '02',
      name: 'Creation Firewall',
      href: '/editor',
      icon: '🛡️',
      description: 'Real-Time Smart Editor',
      badge: 'Live Scan'
    },
    {
      step: '03',
      name: 'Compiler & Debate',
      href: '/review',
      icon: '⚖️',
      description: '6 Checks & 4-Agent Debate',
      badge: 'Multi-Agent'
    },
    {
      step: '04',
      name: 'Impact & Forensics',
      href: '/forensics',
      icon: '🌊',
      description: 'BrandRipple & Blast Radius',
      badge: 'React Flow'
    },
    {
      step: '05',
      name: 'Approval & Immunity',
      href: '/dashboard',
      icon: '🏛️',
      description: 'BrandContract & Drift Radar',
      badge: 'Audit & ML'
    }
  ];

  return (
    <aside className="w-72 bg-slate-950/95 backdrop-blur-md border-r border-slate-800/80 flex flex-col justify-between p-5 min-h-screen text-slate-200 select-none">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-sky-500 via-indigo-600 to-cyan-400 p-[1.5px] shadow-lg shadow-sky-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <svg className="w-6 h-6 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-wider text-lg text-white font-mono">FORENSIQ</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-400/30">OS</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Brand Governance Engine</p>
          </div>
        </div>

        {/* Brand Workspace Switcher */}
        <div className="mt-4 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-sky-400 to-indigo-500 flex items-center justify-center text-xs font-bold text-white shadow-inner">
              IN
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-100 leading-tight">Inkloom BrandTwin</p>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                v3.2 Sync Active
              </p>
            </div>
          </div>
          <span className="text-slate-500 text-xs">▼</span>
        </div>

        {/* 5-Step Workflow Nav */}
        <div className="mt-6">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2 font-mono">
            Product Workflow (5 Steps)
          </p>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = currentPath === item.href || (item.href === '/editor' && currentPath === '/');
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-sky-500/15 via-indigo-500/10 to-transparent border-l-4 border-sky-400 text-white font-medium shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{item.icon}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-mono text-slate-500 group-hover:text-sky-400">{item.step}</span>
                        <span className="text-xs font-medium text-slate-100">{item.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">{item.description}</p>
                    </div>
                  </div>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* 4 Architecture Layers Indicator */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2.5 font-mono">
            4 Core OS Layers
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800/60">
              <span className="text-sky-400 font-mono block font-semibold">1. Memory</span>
              <span className="text-slate-400 text-[9px]">BrandDNA Graph</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800/60">
              <span className="text-indigo-400 font-mono block font-semibold">2. Compiler</span>
              <span className="text-slate-400 text-[9px]">BrandContract</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800/60">
              <span className="text-cyan-400 font-mono block font-semibold">3. Forensics</span>
              <span className="text-slate-400 text-[9px]">BrandRipple Graph</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/50 border border-slate-800/60">
              <span className="text-emerald-400 font-mono block font-semibold">4. Immune</span>
              <span className="text-slate-400 text-[9px]">Drift Radar</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Systemic Status */}
      <div className="pt-4 border-t border-slate-800/80 space-y-2.5">
        <div className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-slate-300 font-medium">Enterprise Shield</span>
          </div>
          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
            Zero-Retention
          </span>
        </div>
        <p className="text-[10px] text-slate-500 text-center font-mono">
          FORENSIQ OS · Production v2.4.1
        </p>
      </div>
    </aside>
  );
}
