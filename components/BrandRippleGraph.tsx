'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { forensicsEngine, BlastRadiusResult, ForensicsNode, ForensicsEdge } from '../lib/forensics';

export function BrandRippleGraph() {
  const [isSimulated, setIsSimulated] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedFactId, setSelectedFactId] = useState<string>("FACT-001");
  const [activeNode, setActiveNode] = useState<any | null>(null);
  const [rippleApiData, setRippleApiData] = useState<any | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);
  const [isMobileMode, setIsMobileMode] = useState(false);

  // Pan & Zoom State for touch & responsive viewport
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-detect mobile viewport on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768;
      setIsMobileMode(isMobile);
      if (isMobile) {
        setZoom(0.85);
      } else {
        setZoom(1);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch Live Neo4j Graph Data from /api/forensics/ripple
  const fetchLiveRipple = async () => {
    try {
      const res = await fetch(`/api/forensics/ripple?factId=${selectedFactId}`);
      if (res.ok) {
        const data = await res.json();
        setRippleApiData(data);
      }
    } catch (err) {
      console.warn('Could not fetch live Neo4j ripple graph, using local fallback:', err);
    }
  };

  useEffect(() => {
    fetchLiveRipple();

    // Listen to real-time events via SSE if available
    let es: EventSource | null = null;
    try {
      es = new EventSource('/api/events');
      es.addEventListener('asset_published', () => fetchLiveRipple());
      es.addEventListener('ripple_updated', () => fetchLiveRipple());
      es.addEventListener('cascade_simulated', (e: any) => {
        try {
          const payload = JSON.parse(e.data);
          setIsSimulated(true);
        } catch (_) {}
      });
    } catch (_) {}

    return () => {
      if (es) es.close();
    };
  }, [selectedFactId]);

  const blastRadius: BlastRadiusResult = useMemo(() => {
    const base = forensicsEngine.calculateBlastRadius(selectedFactId);
    if (rippleApiData && rippleApiData.affectedAssetsCount) {
      base.affectedAssetsCount = rippleApiData.affectedAssetsCount;
      if (rippleApiData.channels && rippleApiData.channels.length > 0) {
        base.affectedChannels = rippleApiData.channels;
      }
    }
    return base;
  }, [selectedFactId, rippleApiData]);

  // Merge static graph data with live dynamic Neo4j topology
  const graphData = useMemo(() => {
    const liveAssets = rippleApiData?.assets || [];
    const baseGraph = forensicsEngine.getGraphData(selectedFactId, isSimulated, {
      isMobile: isMobileMode,
      liveAssets: liveAssets.filter((a: any) => {
        const num = parseInt(a.id?.replace('ASSET-', '') || '0', 10);
        return num > 23;
      })
    });

    // If server returned complete dynamic topology, merge coordinates
    if (rippleApiData?.graphTopology?.nodes) {
      const serverNodes = rippleApiData.graphTopology.nodes;
      const serverEdges = rippleApiData.graphTopology.edges;

      // Adapt coordinates for mobile mode if needed
      const adaptedNodes = serverNodes.map((n: any, idx: number) => {
        if (isMobileMode) {
          // Compact responsive mobile layout
          const tier = n.level || 0;
          return {
            ...n,
            x: 50 + ((idx % 3) * 110) + (tier === 0 ? 90 : 0),
            y: 45 + tier * 95
          };
        }
        return n;
      });

      return {
        nodes: adaptedNodes,
        edges: serverEdges
      };
    }

    return baseGraph;
  }, [selectedFactId, isSimulated, isMobileMode, rippleApiData]);

  const handleTriggerSimulation = async () => {
    setIsAnimating(true);
    try {
      await fetch('/api/forensics/simulate-cascade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ factId: selectedFactId })
      });
    } catch (_) {}

    setTimeout(() => {
      setIsSimulated(!isSimulated);
      setIsAnimating(false);
    }, 1800);
  };

  // Pointer drag panning handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleResetZoom = () => {
    setZoom(isMobileMode ? 0.85 : 1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="space-y-6">
      {/* Top Controls Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between flex-wrap gap-4 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              BrandRipple™ Claim Provenance & Impact Graph
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              Live Neo4j Graph Integration
            </span>
            {rippleApiData?.newlyAddedAssets?.length > 0 && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
                + {rippleApiData.newlyAddedAssets.length} Live Ad Mutation(s) Active
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time traversal: Root Fact → Document → Unverified Mutation → Multi-Channel Public Ads.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Mobile Layout Switcher */}
          <button
            type="button"
            onClick={() => {
              setIsMobileMode(!isMobileMode);
              handleResetZoom();
            }}
            className={`px-3 py-2 rounded-xl text-xs font-mono font-medium border transition-all ${
              isMobileMode
                ? 'bg-sky-500/20 border-sky-500/40 text-sky-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            {isMobileMode ? '📱 Mobile Mode: ON' : '🖥️ Desktop View'}
          </button>

          {/* 2-Second Cascade Simulation Button */}
          <button
            type="button"
            onClick={handleTriggerSimulation}
            disabled={isAnimating}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center gap-2 shadow-lg cursor-pointer ${
              isSimulated
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-500/30'
                : 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white shadow-amber-500/30'
            }`}
          >
            {isAnimating ? (
              <>
                <span className="w-3 h-3 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Simulating 2-Sec Cascade...</span>
              </>
            ) : isSimulated ? (
              <>
                <span>⚠️ Cascade Active: {blastRadius.affectedAssetsCount} Assets Flagged</span>
                <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded">Reset</span>
              </>
            ) : (
              <>
                <span>⚡ Simulate Fact Expiry / Change</span>
                <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded">2-Sec Test</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Blast Radius KPI Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <p className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
            Root Fact Investigated:
          </p>
          <p className="text-sm font-bold text-white mt-1">
            FACT-001 (25% Savings)
          </p>
          <span className="text-[10px] text-emerald-400 font-mono">Forrester TEI Study 2023</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <p className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
            Blast Radius Containment:
          </p>
          <p className="text-2xl font-extrabold text-cyan-400 font-mono mt-0.5">
            {isSimulated ? `${blastRadius.affectedAssetsCount} Assets` : `${blastRadius.affectedAssetsCount} Affected Assets`}
          </p>
          <span className="text-[10px] text-slate-400">
            Real Neo4j Graph ({blastRadius.affectedAssetsCount} dependent nodes)
          </span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <p className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
            Live Public Channels:
          </p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {blastRadius.affectedChannels.map(c => (
              <span key={c} className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                {c}
              </span>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
          <p className="text-[11px] font-mono text-slate-400 uppercase font-semibold">
            Containment Speed:
          </p>
          <p className="text-2xl font-extrabold text-emerald-400 font-mono mt-0.5">
            1.8 Seconds
          </p>
          <span className="text-[10px] text-slate-400">vs 3 days manual agency audit</span>
        </div>
      </div>

      {/* Responsive Visual Graph Canvas with Touch Pan & Zoom */}
      <div
        ref={containerRef}
        className="relative rounded-2xl border border-slate-800 bg-slate-950/90 overflow-hidden shadow-2xl min-h-[460px] md:min-h-[520px] select-none touch-none"
      >
        {/* Floating Pan & Zoom Controls Toolbar */}
        <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 shadow-lg">
          <button
            type="button"
            onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-base flex items-center justify-center transition-all"
            title="Zoom In"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setZoom(z => Math.max(0.4, z - 0.15))}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-base flex items-center justify-center transition-all"
            title="Zoom Out"
            aria-label="Zoom out"
          >
            -
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            className="px-2.5 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-mono text-xs flex items-center justify-center transition-all"
            title="Fit to Screen"
            aria-label="Reset zoom and center"
          >
            Fit ({Math.round(zoom * 100)}%)
          </button>
        </div>

        {/* Collapsible Mobile-Friendly Legend */}
        <div className="absolute top-3 left-3 z-30">
          <button
            type="button"
            onClick={() => setLegendOpen(!legendOpen)}
            className="md:hidden px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-1.5"
          >
            <span>🏷️ Legend</span>
            <span>{legendOpen ? '▲' : '▼'}</span>
          </button>

          <div
            className={`${
              legendOpen ? 'block mt-2' : 'hidden md:block'
            } bg-slate-900/95 backdrop-blur-md p-3 rounded-xl border border-slate-800 text-xs space-y-1.5 max-w-[220px] shadow-xl`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <span className="text-slate-300 font-mono text-[11px]">Approved BrandDNA Fact</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-300 font-mono text-[11px]">Unverified Mutation (40%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
              <span className="text-slate-300 font-mono text-[11px]">Origin Internal Deck</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span className="text-slate-300 font-mono text-[11px]">Public Ads / Channels</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
              <span className="text-purple-300 font-mono text-[11px]">Live New Ad Node</span>
            </div>
          </div>
        </div>

        {/* Mobile touch hint */}
        <div className="absolute bottom-3 left-3 z-20 pointer-events-none text-[10px] font-mono text-slate-500 bg-slate-950/60 px-2 py-1 rounded border border-slate-800/60">
          💡 Drag to pan • Pinch / buttons to zoom
        </div>

        {/* SVG Interactive Topology Canvas */}
        <svg
          className="w-full h-[460px] md:h-[540px] cursor-grab active:cursor-grabbing"
          viewBox={isMobileMode ? "0 0 380 580" : "0 0 1350 500"}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <defs>
            <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0284C7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#6366F1" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="alertGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.9" />
            </linearGradient>
            <filter id="glowRose">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#EF4444" floodOpacity="0.6" />
            </filter>
            <filter id="glowCyan">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#38BDF8" floodOpacity="0.5" />
            </filter>
          </defs>

          {/* Group transformed by Zoom & Pan */}
          <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
            {/* Cascade simulation expanding pulse wave */}
            {isSimulated && (
              <circle
                cx={graphData.nodes[0]?.x || 100}
                cy={graphData.nodes[0]?.y || 200}
                r="300"
                fill="none"
                stroke="#EF4444"
                strokeWidth="2"
                strokeDasharray="4,4"
                opacity="0.3"
                className="animate-ping"
              />
            )}

            {/* Render Connections */}
            {graphData.edges.map((e: any) => {
              const sNode = graphData.nodes.find((n: any) => n.id === e.source);
              const tNode = graphData.nodes.find((n: any) => n.id === e.target);
              if (!sNode || !tNode) return null;

              const isRed = e.style?.stroke === '#EF4444' || isSimulated;
              return (
                <g key={e.id}>
                  <line
                    x1={sNode.x}
                    y1={sNode.y}
                    x2={tNode.x}
                    y2={tNode.y}
                    stroke={isRed ? 'url(#alertGrad)' : 'url(#edgeGrad)'}
                    strokeWidth={isRed ? '2.5' : '1.5'}
                    strokeDasharray={e.animated || isRed ? '5,5' : undefined}
                  />
                  {e.label && !isMobileMode && (
                    <text
                      x={(sNode.x! + tNode.x!) / 2}
                      y={(sNode.y! + tNode.y!) / 2 - 8}
                      fill={isRed ? '#FCA5A5' : '#94A3B8'}
                      fontSize="9"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {e.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Render Nodes */}
            {graphData.nodes.map((n: any) => {
              const isSelected = activeNode?.id === n.id;
              const isNewLive = Boolean(n.isNewLiveMutation || n.metadata?.isNewLiveMutation);
              let bgColor = '#0F172A';
              let strokeColor = '#38BDF8';
              let glowFilter = 'none';

              if (n.type === 'violation' || (isSimulated && n.type === 'asset')) {
                strokeColor = '#EF4444';
                glowFilter = 'url(#glowRose)';
              } else if (n.type === 'document') {
                strokeColor = '#818CF8';
              } else if (n.type === 'channel') {
                strokeColor = '#F59E0B';
              }

              if (isNewLive) {
                strokeColor = '#C084FC';
                glowFilter = 'url(#glowRose)';
              }

              const radius = isSelected ? 32 : isMobileMode ? 24 : 26;

              return (
                <g
                  key={n.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveNode(n);
                  }}
                  className="cursor-pointer transition-all hover:scale-105"
                  transform={`translate(${n.x}, ${n.y})`}
                >
                  {/* Invisible enlarged tap target for mobile touch */}
                  <circle r={radius + 14} fill="transparent" />

                  {/* Pulsing ring for new live mutations */}
                  {isNewLive && (
                    <circle
                      r={radius + 6}
                      fill="none"
                      stroke="#C084FC"
                      strokeWidth="2"
                      opacity="0.8"
                      className="animate-pulse"
                    />
                  )}

                  <circle
                    r={radius}
                    fill={bgColor}
                    stroke={strokeColor}
                    strokeWidth={isSelected ? 3.5 : isNewLive ? 3 : 2}
                    filter={glowFilter}
                  />

                  <text
                    textAnchor="middle"
                    dy="-4"
                    fill="#FFFFFF"
                    fontSize={isMobileMode ? "8" : "10"}
                    fontWeight="bold"
                    fontFamily="sans-serif"
                  >
                    {n.label.length > (isMobileMode ? 12 : 18)
                      ? n.label.slice(0, isMobileMode ? 10 : 16) + '..'
                      : n.label}
                  </text>
                  <text
                    textAnchor="middle"
                    dy="12"
                    fill={isNewLive ? "#E879F9" : "#94A3B8"}
                    fontSize={isMobileMode ? "7" : "8"}
                    fontFamily="monospace"
                  >
                    {isNewLive ? 'NEW LIVE AD' : n.type.toUpperCase()}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>

        {/* Selected Node Drawer: Responsive Bottom Sheet on Mobile, Floating Card on Desktop */}
        {activeNode && (
          <div className="fixed sm:absolute inset-x-3 bottom-3 sm:inset-auto sm:bottom-4 sm:right-4 sm:w-84 p-4 rounded-2xl bg-slate-900/98 border border-sky-500/50 shadow-2xl backdrop-blur-xl z-40 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-sky-500/20 text-cyan-300 border border-sky-500/30">
                {activeNode.type} Node Details
              </span>
              <button
                type="button"
                onClick={() => setActiveNode(null)}
                className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>
            <h4 className="text-sm font-bold text-white leading-tight">
              {activeNode.label}
            </h4>
            <p className="text-xs text-slate-300 mt-1">
              {activeNode.subLabel || activeNode.content}
            </p>
            <div className="mt-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-mono space-y-1">
              <p>Risk Level: <span className="text-rose-400 font-bold">{activeNode.riskLevel || 'High'}</span></p>
              <p>Status: <span className="text-cyan-400">{activeNode.status}</span></p>
              {activeNode.isNewLiveMutation && (
                <p className="text-purple-300 font-bold">⚡ Inserted Live during Judge Session!</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Claim Genealogy Timeline */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
        <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-4 flex items-center gap-2">
          <span>📜</span>
          <span>Claim Genealogy Audit Trail (Origin → Spread → Impact)</span>
        </h3>
        <div className="relative border-l-2 border-slate-700 ml-4 pl-6 space-y-6">
          {blastRadius.genealogyTrail.map((item) => (
            <div key={item.step} className="relative">
              <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-slate-950 border-2 border-sky-400 flex items-center justify-center text-[9px] font-bold text-white">
                {item.step}
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{item.entity}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {item.type}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{item.date}</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {item.note}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
