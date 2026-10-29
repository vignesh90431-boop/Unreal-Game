import React, { useState, useRef } from 'react';
import { BLUEPRINT_GRAPHS } from '../../data/blueprintData';
import { BlueprintGraphData, BlueprintNode } from '../../types/game';
import { 
  Copy, 
  Check, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  HelpCircle, 
  Info, 
  Layers, 
  Play, 
  Code2, 
  ArrowRight,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { soundManager } from '../../utils/audio';

export const BlueprintEditor: React.FC = () => {
  const [selectedGraphId, setSelectedGraphId] = useState<string>('char-movement');
  const [selectedNode, setSelectedNode] = useState<BlueprintNode | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [zoom, setZoom] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 20, y: 20 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [activeStepTab, setActiveStepTab] = useState<number>(0);

  const activeGraph = BLUEPRINT_GRAPHS.find((g) => g.id === selectedGraphId) || BLUEPRINT_GRAPHS[0];

  const handleCopyClipboard = () => {
    soundManager.playUiClick();
    navigator.clipboard.writeText(activeGraph.ue5ClipboardText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2400);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.blueprint-node')) return;
    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setPanOffset({
      x: e.clientX - panStart.x,
      y: e.clientY - panStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => Math.max(0.6, Math.min(1.5, prev + delta)));
  };

  const resetView = () => {
    setZoom(1.0);
    setPanOffset({ x: 20, y: 20 });
  };

  // Node header color based on category
  const getNodeHeaderColor = (category: string) => {
    switch (category) {
      case 'Event':
        return 'bg-gradient-to-r from-red-700 to-rose-900 border-red-500/40 text-red-100';
      case 'Function':
        return 'bg-gradient-to-r from-sky-700 to-blue-900 border-sky-500/40 text-sky-100';
      case 'Pure':
        return 'bg-gradient-to-r from-emerald-700 to-teal-900 border-emerald-500/40 text-emerald-100';
      case 'FlowControl':
        return 'bg-gradient-to-r from-zinc-700 to-neutral-800 border-zinc-500/40 text-zinc-100';
      case 'Interface':
        return 'bg-gradient-to-r from-amber-700 to-yellow-900 border-amber-500/40 text-amber-100';
      case 'Variable':
        return 'bg-gradient-to-r from-purple-700 to-indigo-900 border-purple-500/40 text-purple-100';
      default:
        return 'bg-zinc-800 text-zinc-100';
    }
  };

  // Pin socket color based on pin data type
  const getPinColor = (type: string) => {
    switch (type) {
      case 'exec':
        return 'bg-white border-white';
      case 'bool':
        return 'bg-red-500 border-red-400';
      case 'float':
        return 'bg-lime-400 border-lime-300';
      case 'vector':
        return 'bg-yellow-400 border-yellow-300';
      case 'rotator':
        return 'bg-indigo-400 border-indigo-300';
      case 'object':
        return 'bg-cyan-400 border-cyan-300';
      case 'string':
        return 'bg-fuchsia-400 border-fuchsia-300';
      case 'struct':
        return 'bg-violet-400 border-violet-300';
      default:
        return 'bg-zinc-400 border-zinc-300';
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 select-none">
      {/* Top Bar: Graph Selector Tabs & Actions */}
      <div className="h-14 border-b border-zinc-800 bg-zinc-900/90 px-4 flex items-center justify-between gap-3 overflow-x-auto">
        {/* System Graph Pills */}
        <div className="flex items-center gap-1.5">
          {BLUEPRINT_GRAPHS.map((graph) => {
            const isActive = graph.id === selectedGraphId;
            return (
              <button
                key={graph.id}
                onClick={() => {
                  soundManager.playUiClick();
                  setSelectedGraphId(graph.id);
                  setSelectedNode(null);
                  setActiveStepTab(0);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 border border-transparent'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>{graph.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right Tools: Zoom, Copy to UE5 */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-lg p-0.5">
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
              className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono px-2 text-zinc-400">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
              className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={resetView}
              className="p-1 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 rounded cursor-pointer"
              title="Reset View"
            >
              <Maximize className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            onClick={handleCopyClipboard}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
            }`}
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied UE5 Code!' : 'Copy to UE5 (Ctrl+V)'}</span>
          </button>
        </div>
      </div>

      {/* Main Blueprint Canvas + Inspection Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Graph Workspace (Grid) */}
        <div
          className="flex-1 h-full overflow-hidden relative cursor-crosshair bg-[#141417]"
          style={{
            backgroundImage: `
              radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px),
              linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: `${20 * zoom}px ${20 * zoom}px, ${100 * zoom}px ${100 * zoom}px, ${100 * zoom}px ${100 * zoom}px`,
            backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onWheel={handleWheel}
        >
          {/* Blueprint Title Watermark */}
          <div className="absolute top-4 left-4 z-10 pointer-events-none opacity-40">
            <div className="text-xl font-cinzel font-bold text-zinc-400">{activeGraph.blueprintClass}</div>
            <div className="text-xs font-mono text-zinc-500">Parent: {activeGraph.parentClass}</div>
          </div>

          {/* Canvas Transform Container */}
          <div
            className="absolute top-0 left-0 w-full h-full transform-gpu origin-top-left"
            style={{
              transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
            }}
          >
            {/* SVG Connection Splines (Wires) */}
            <svg className="absolute top-0 left-0 w-[4000px] h-[3000px] pointer-events-none">
              <defs>
                <linearGradient id="execWireGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              {activeGraph.connections.map((conn, idx) => {
                const fromNode = activeGraph.nodes.find((n) => n.id === conn.fromNodeId);
                const toNode = activeGraph.nodes.find((n) => n.id === conn.toNodeId);
                if (!fromNode || !toNode) return null;

                // Approximate pin positions
                const startX = fromNode.x + 230;
                const startY = fromNode.y + 70 + (fromNode.outputs.findIndex((p) => p.id === conn.fromPinId) * 24);
                const endX = toNode.x;
                const endY = toNode.y + 70 + (toNode.inputs.findIndex((p) => p.id === conn.toPinId) * 24);

                const controlX = Math.abs(endX - startX) * 0.5;
                const d = `M ${startX} ${startY} C ${startX + controlX} ${startY}, ${endX - controlX} ${endY}, ${endX} ${endY}`;

                let strokeColor = '#ffffff';
                if (conn.type === 'bool') strokeColor = '#ef4444';
                if (conn.type === 'float') strokeColor = '#a3e635';
                if (conn.type === 'vector') strokeColor = '#facc15';
                if (conn.type === 'rotator') strokeColor = '#818cf8';
                if (conn.type === 'object') strokeColor = '#22d3ee';
                if (conn.type === 'struct') strokeColor = '#c084fc';

                return (
                  <path
                    key={idx}
                    d={d}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={conn.type === 'exec' ? 2.5 : 2}
                    strokeLinecap="round"
                    className="opacity-90 hover:opacity-100 transition-opacity"
                  />
                );
              })}
            </svg>

            {/* Nodes */}
            {activeGraph.nodes.map((node) => {
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    soundManager.playUiClick();
                    setSelectedNode(node);
                  }}
                  className={`blueprint-node absolute rounded-lg border shadow-2xl bg-zinc-900/95 overflow-hidden transition-all duration-150 cursor-pointer ${
                    isSelected ? 'ring-2 ring-amber-400 border-amber-400 scale-[1.02]' : 'border-zinc-700/80 hover:border-zinc-500'
                  }`}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    width: '240px',
                  }}
                >
                  {/* Node Header */}
                  <div className={`px-3 py-2 border-b text-xs font-semibold flex items-center justify-between ${getNodeHeaderColor(node.category)}`}>
                    <div className="truncate pr-1">
                      <div>{node.title}</div>
                      {node.subtext && <div className="text-[10px] font-mono opacity-80">{node.subtext}</div>}
                    </div>
                    <span className="text-[9px] uppercase tracking-wider font-mono px-1 py-0.5 rounded bg-black/30 text-white/90">
                      {node.category}
                    </span>
                  </div>

                  {/* Node Body with Pins */}
                  <div className="p-2.5 flex justify-between gap-2 text-xs">
                    {/* Inputs Column */}
                    <div className="flex flex-col gap-2 flex-1">
                      {node.inputs.map((pin) => (
                        <div key={pin.id} className="flex items-center gap-1.5 group">
                          <div
                            className={`w-2.5 h-2.5 rounded-full border ${getPinColor(pin.type)}`}
                            title={`${pin.name} (${pin.type})`}
                          />
                          <span className="text-[11px] text-zinc-300 font-mono truncate">{pin.name}</span>
                          {pin.value !== undefined && (
                            <span className="text-[10px] text-zinc-500 font-mono">[{String(pin.value)}]</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Outputs Column */}
                    <div className="flex flex-col gap-2 flex-1 items-end text-right">
                      {node.outputs.map((pin) => (
                        <div key={pin.id} className="flex items-center justify-end gap-1.5 group">
                          <span className="text-[11px] text-zinc-300 font-mono truncate">{pin.name}</span>
                          <div
                            className={`w-2.5 h-2.5 rounded-full border ${getPinColor(pin.type)}`}
                            title={`${pin.name} (${pin.type})`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Drawer: Step Walkthrough & Node Inspector */}
        <div className="w-80 md:w-96 border-l border-zinc-800 bg-zinc-900/95 flex flex-col h-full overflow-y-auto">
          {/* Header */}
          <div className="p-4 border-b border-zinc-800">
            <div className="text-xs uppercase tracking-wider font-mono text-amber-400 font-bold mb-1">
              {activeGraph.systemName}
            </div>
            <h3 className="font-cinzel font-bold text-lg text-zinc-100">{activeGraph.name}</h3>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{activeGraph.description}</p>
          </div>

          {/* Node Inspector Section (when a node is selected) */}
          {selectedNode ? (
            <div className="p-4 border-b border-zinc-800 bg-zinc-950/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">Node Details</span>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  Close
                </button>
              </div>
              <h4 className="font-semibold text-sm text-amber-300">{selectedNode.title}</h4>
              <p className="text-xs text-zinc-300 mt-1 leading-normal">{selectedNode.description}</p>

              <div className="mt-3 bg-zinc-900 border border-zinc-800 rounded p-2 text-xs">
                <div className="text-[10px] font-mono text-zinc-500">UE5 C++ / Kismet Equivalent:</div>
                <div className="text-[11px] font-mono text-emerald-400 mt-0.5 break-all">
                  {selectedNode.ue5Equivalent}
                </div>
              </div>

              {selectedNode.tips && (
                <div className="mt-2.5 bg-amber-500/10 border border-amber-500/30 rounded p-2 text-xs flex items-start gap-1.5 text-amber-200">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-snug">{selectedNode.tips}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 border-b border-zinc-800 text-xs text-zinc-500 italic flex items-center gap-2">
              <Info className="w-4 h-4 text-zinc-600" />
              Click any node in the Blueprint graph to inspect its parameters and UE5 logic.
            </div>
          )}

          {/* Implementation Walkthrough Steps */}
          <div className="p-4 flex-1">
            <div className="flex items-center gap-1.5 mb-3">
              <BookOpen className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-semibold uppercase tracking-wider font-mono text-zinc-200">
                Step-by-Step UE5 Setup
              </h4>
            </div>

            <div className="flex flex-col gap-3">
              {activeGraph.walkthrough.map((step, idx) => (
                <div
                  key={step.stepNumber}
                  onClick={() => setActiveStepTab(idx)}
                  className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                    activeStepTab === idx
                      ? 'bg-zinc-800/90 border-amber-500/50 shadow-md'
                      : 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-800/40 text-zinc-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-amber-400 font-bold text-[11px]">
                      Step {step.stepNumber}: {step.title}
                    </span>
                  </div>
                  <p className="text-zinc-300 text-[11px] leading-relaxed">{step.action}</p>

                  {/* Common Pitfall Warning */}
                  <div className="mt-2 pt-2 border-t border-zinc-700/50 text-[10px] text-rose-300 leading-snug">
                    <strong className="text-rose-400">Common Traps:</strong> {step.commonMistake}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
