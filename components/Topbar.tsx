'use client';

import React from 'react';

export interface TopbarProps {
  title: string;
  subtitle?: string;
  currentRole: 'Creator' | 'Brand Manager' | 'Reviewer' | 'Legal & Compliance';
  onRoleChange: (role: 'Creator' | 'Brand Manager' | 'Reviewer' | 'Legal & Compliance') => void;
  privacyShieldActive: boolean;
  onTogglePrivacyShield: () => void;
}

export function Topbar({
  title,
  subtitle,
  currentRole,
  onRoleChange,
  privacyShieldActive,
  onTogglePrivacyShield
}: TopbarProps) {
  const roles: Array<'Creator' | 'Brand Manager' | 'Reviewer' | 'Legal & Compliance'> = [
    'Creator',
    'Brand Manager',
    'Reviewer',
    'Legal & Compliance'
  ];

  return (
    <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md px-6 flex items-center justify-between gap-4 sticky top-0 z-40">
      <div>
        <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
          {title}
        </h1>
        {subtitle && <p className="text-xs text-slate-400 font-medium">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4">
        {/* Role-Based Access UI Toggle */}
        <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 shadow-inner">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider px-2 font-semibold">
            Role:
          </span>
          <div className="flex items-center gap-1">
            {roles.map((r) => {
              const isSelected = currentRole === r;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => onRoleChange(r)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-sky-500 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  {r}
                </button>
              );
            })}
          </div>
        </div>

        {/* Enterprise Shield Toggle */}
        <button
          type="button"
          onClick={onTogglePrivacyShield}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all ${
            privacyShieldActive
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}
          title="Zero-retention AI processing: No customer data is retained or used for foundation model training"
        >
          <span className={`w-2 h-2 rounded-full ${privacyShieldActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
          <span className="font-medium hidden md:inline">
            {privacyShieldActive ? 'Privacy Shield: ON' : 'Privacy Shield: OFF'}
          </span>
          <span className="text-[10px] uppercase font-mono px-1 rounded bg-slate-800 text-slate-300">
            SOC-2
          </span>
        </button>

        {/* User Monogram */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-400 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shadow-md">
          {currentRole.slice(0, 2).toUpperCase()}
        </div>
      </div>
    </header>
  );
}
