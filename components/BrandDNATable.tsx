'use client';

import React, { useState } from 'react';
import { brandDNA } from '../lib/brandDNA';
import { BrandFact } from '../lib/mockData/inkloom';

export function BrandDNATable() {
  const [facts, setFacts] = useState<BrandFact[]>(brandDNA.getAllFacts());
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [uploadSimulating, setUploadSimulating] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleToggleExpiry = (id: string) => {
    brandDNA.toggleFactExpiry(id);
    setFacts([...brandDNA.getAllFacts()]);
  };

  const handleSimulateUpload = () => {
    setUploadSimulating(true);
    setTimeout(() => {
      setUploadSimulating(false);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    }, 1500);
  };

  const filteredFacts = facts.filter(f => {
    const matchesFilter = filter === 'all' || f.status === filter || f.category.toLowerCase() === filter.toLowerCase();
    const matchesSearch = search === '' || f.claim_text.toLowerCase().includes(search.toLowerCase()) || f.source_doc.toLowerCase().includes(search.toLowerCase()) || f.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Step 1 Drag & Drop Ingest Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border border-sky-500/30 shadow-2xl">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🧬</span>
              <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Step 1: BrandTwin Bootup & Asset Ingestion
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Vector DB Active
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Upload brand guideline PDFs, logo packages, or Excel fact-sheets to synthesize your organization's BrandTwin.
            </p>
          </div>
        </div>

        {/* Drag & Drop Simulation Dropzone */}
        <div
          onClick={handleSimulateUpload}
          className="p-8 rounded-xl border-2 border-dashed border-slate-700 hover:border-sky-400 bg-slate-950/60 transition-all text-center cursor-pointer group"
        >
          {uploadSimulating ? (
            <div className="flex flex-col items-center justify-center space-y-2">
              <span className="w-8 h-8 rounded-full border-2 border-sky-400 border-t-transparent animate-spin" />
              <p className="text-xs font-mono text-sky-300">
                Parsing PDF AST tokens & generating 1536-dim vector embeddings...
              </p>
            </div>
          ) : uploadSuccess ? (
            <div className="text-center space-y-1">
              <p className="text-emerald-400 font-bold text-sm">✓ Ingestion Complete!</p>
              <p className="text-xs text-slate-400">20 BrandDNA facts indexed into Qdrant vector space with cryptographic timestamps.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-sky-500/10 group-hover:bg-sky-500/20 flex items-center justify-center text-xl transition-all">
                📁
              </div>
              <p className="text-xs font-bold text-slate-200">
                Drag and drop Brand Guidelines PDF, Figma Tokens, or Factsheet CSV here
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                Supports PDF, XLSX, CSV, SVG, JSON · Pre-loaded with 20 Inkloom facts for demo
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between flex-wrap gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-slate-400">Filter:</span>
          {['all', 'valid', 'expired', 'Performance', 'Security', 'Product', 'Company'].map(f => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-sky-500 text-white font-semibold'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="w-72">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search facts, sources, IDs..."
            className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* BrandDNA Knowledge Graph Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/80 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider text-[11px]">
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
                          {fact.category}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-md">
                      <p className="text-slate-200 font-medium leading-relaxed">
                        {fact.claim_text}
                      </p>
                      <div className="flex gap-1 mt-1">
                        {fact.tags.map(t => (
                          <span key={t} className="text-[9px] text-slate-500 font-mono">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <p className="text-slate-300 text-[11px] leading-tight">
                        {fact.source_doc}
                      </p>
                      <a
                        href={fact.evidence_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-sky-400 hover:underline mt-0.5 inline-block font-mono"
                      >
                        [View Evidence PDF]
                      </a>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        isValid
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      }`}>
                        {isValid ? 'VALID' : 'EXPIRED'} · {fact.expiry_date}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                      <p className="font-mono text-slate-200">{fact.version}</p>
                      <p className="text-[10px] text-slate-500 truncate max-w-[140px]">{fact.owner}</p>
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleToggleExpiry(fact.id)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-mono transition-all"
                        title="Toggle validity status to simulate an expired fact"
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
  );
}
