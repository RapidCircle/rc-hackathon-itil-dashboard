import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  NodeToolbar,
  Position,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeMouseHandler,
  BackgroundVariant,
} from '@xyflow/react';
import AnimatedTokenEdge from './AnimatedTokenEdge';

interface ProcessInfo {
  title: string;
  description: string;
  sla: Record<string, string>;
}

interface FlowChartProps {
  initialNodes: Node[];
  initialEdges: Edge[];
  processInfo: ProcessInfo;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getOutgoing(nodeId: string, edges: Edge[]): Edge[] {
  return edges.filter((e) => e.source === nodeId);
}

function isDecision(outgoing: Edge[]): boolean {
  // Require 2+ outgoing edges — single labeled edges (e.g. "Retry") are not decision branches
  return outgoing.length >= 2 && outgoing.some((e) => typeof e.label === 'string' && e.label.trim() !== '');
}

// ─── Component ──────────────────────────────────────────────────────────────

const edgeTypes = { default: AnimatedTokenEdge };

type AnimState = 'idle' | 'playing' | 'paused' | 'waiting' | 'done';

interface PendingChoice {
  nodeId: string;
  edges: Edge[];
}

export default function FlowChart({ initialNodes, initialEdges, processInfo }: FlowChartProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // ── Node click panel ──
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    setSelectedNode(node);
    setPanelOpen(true);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setPanelOpen(false);
  }, []);

  // ── Animation state ──
  const [animState, setAnimState] = useState<AnimState>('idle');
  const [visitedNodes, setVisitedNodes] = useState<string[]>([]);
  const [currentNodeId, setCurrentNodeId] = useState<string | null>(null);
  const [activeEdgeId, setActiveEdgeId] = useState<string | null>(null);
  const [pendingChoice, setPendingChoice] = useState<PendingChoice | null>(null);
  const [speed, setSpeed] = useState<600 | 1200 | 2000>(1200);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep a stable reference to latest edges (needed inside setTimeout callbacks)
  const edgesRef = useRef(initialEdges);
  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);

  // ── Advance logic ──
  const advance = useCallback(
    (nodeId: string, currentSpeed: number) => {
      const outgoing = getOutgoing(nodeId, edgesRef.current);

      if (outgoing.length === 0) {
        setAnimState('done');
        return;
      }

      if (isDecision(outgoing)) {
        setAnimState('waiting');
        setPendingChoice({ nodeId, edges: outgoing });
        return;
      }

      const chosenEdge = outgoing[0];
      setActiveEdgeId(chosenEdge.id);

      timeoutRef.current = setTimeout(() => {
        setVisitedNodes((prev) => [...prev, nodeId]);
        setActiveEdgeId(null);
        setCurrentNodeId(chosenEdge.target);
      }, currentSpeed);
    },
    [],
  );

  // Trigger advance whenever playing and currentNode is set
  useEffect(() => {
    if (animState === 'playing' && currentNodeId !== null) {
      advance(currentNodeId, speed);
    }
  }, [animState, currentNodeId, speed, advance]);

  // ── Reset helper ──
  const reset = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setAnimState('idle');
    setVisitedNodes([]);
    setCurrentNodeId(null);
    setActiveEdgeId(null);
    setPendingChoice(null);
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // ── Play / pause ──
  const handlePlay = useCallback(() => {
    if (animState === 'done') {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setVisitedNodes([]);
      setActiveEdgeId(null);
      setPendingChoice(null);
      setCurrentNodeId(initialNodes[0].id);
      setAnimState('playing');
      return;
    }
    if (currentNodeId === null) {
      setCurrentNodeId(initialNodes[0].id);
    }
    setAnimState('playing');
  }, [animState, currentNodeId, initialNodes]);

  const handlePause = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setAnimState('paused');
  }, []);

  // ── Decision choice handler ──
  const handleChoice = useCallback(
    (chosenEdge: Edge) => {
      if (!pendingChoice) return;
      setVisitedNodes((prev) => [...prev, pendingChoice.nodeId]);
      setPendingChoice(null);
      setActiveEdgeId(chosenEdge.id);
      // Keep animState as 'waiting' during the edge transition so the advance
      // effect doesn't re-fire on the (already-visited) decision node.
      // Set 'playing' only after currentNodeId has moved to the target.
      timeoutRef.current = setTimeout(() => {
        setActiveEdgeId(null);
        setCurrentNodeId(chosenEdge.target);
        setAnimState('playing');
      }, speed);
    },
    [pendingChoice, speed],
  );

  // ── Sync visuals ──
  useEffect(() => {
    const visitedSet = new Set(visitedNodes);

    setNodes(
      initialNodes.map((n) => {
        const isActive = n.id === currentNodeId;
        const isVisited = visitedSet.has(n.id);

        if (isActive) {
          return {
            ...n,
            className: 'token-active',
            style: {
              ...n.style,
              background: '#eef2ff',
              border: '3px solid #6366f1',
            },
          };
        }
        if (isVisited) {
          return {
            ...n,
            className: undefined,
            style: {
              ...n.style,
              opacity: 0.45,
            },
          };
        }
        return { ...n, className: undefined };
      }),
    );

    // Build set of traversed edge IDs
    const orderedPath = [...visitedNodes];
    if (currentNodeId) orderedPath.push(currentNodeId);

    const traversedEdgeIds = new Set<string>();
    for (let i = 0; i < orderedPath.length - 1; i++) {
      const src = orderedPath[i];
      const tgt = orderedPath[i + 1];
      const match = initialEdges.find((e) => e.source === src && e.target === tgt);
      if (match) traversedEdgeIds.add(match.id);
    }

    setEdges(
      initialEdges.map((e) => {
        if (e.id === activeEdgeId) {
          return {
            ...e,
            animated: false,
            data: { ...(e.data ?? {}), tokenMoving: true, animDuration: speed },
          };
        }
        if (traversedEdgeIds.has(e.id)) {
          return {
            ...e,
            animated: true,
            data: { ...(e.data ?? {}), tokenMoving: false },
          };
        }
        return {
          ...e,
          animated: false,
          data: { ...(e.data ?? {}), tokenMoving: false },
        };
      }),
    );
  }, [visitedNodes, currentNodeId, activeEdgeId, initialNodes, initialEdges, speed, setNodes, setEdges]);

  // ── Cleanup on unmount ──
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // ── ESC key resets animation ──
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') reset();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [reset]);

  // ── Auto-open mobile panel when waiting for decision ──
  useEffect(() => {
    if (animState === 'waiting') setPanelOpen(true);
  }, [animState]);

  // ── Panel content ──
  const panelContent = selectedNode ? (
    <div>
      <div className="mb-4">
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Selected Step</span>
        <h3 className="text-lg font-semibold text-gray-900 mt-1">{String(selectedNode.data.label)}</h3>
      </div>
      <div className="space-y-3">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs font-medium text-gray-500 mb-1">Node ID</p>
          <p className="text-sm font-mono text-gray-700">{selectedNode.id}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-3">
          <p className="text-xs font-medium text-blue-600 mb-1">Tip</p>
          <p className="text-sm text-blue-800">Click any node to see its details. Use scroll to zoom, drag to pan.</p>
        </div>
      </div>
    </div>
  ) : (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{processInfo.title}</h3>
      <p className="text-sm text-gray-600 mb-4">{processInfo.description}</p>
      <div className="mb-4">
        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">SLA Targets</h4>
        <div className="space-y-2">
          {Object.entries(processInfo.sla).map(([level, time]) => (
            <div key={level} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
              <span className="text-sm font-medium text-gray-700">{level}</span>
              <span className="text-sm font-semibold text-gray-900">{time}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-gray-100 pt-4">
        <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Legend</h4>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-blue-200 border border-blue-400"></span> L1 Support</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-orange-200 border border-orange-400"></span> L2 Support</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-red-200 border border-red-400"></span> L3 / Critical</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-green-200 border border-green-400"></span> Resolution</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-yellow-200 border border-yellow-400"></span> Decision</div>
          <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-indigo-200 border border-indigo-400"></span> Process Step</div>
        </div>
      </div>
    </div>
  );

  // ── Step counter ──
  const totalNodes = initialNodes.length;
  const stepsCompleted = visitedNodes.length;
  const hasStarted = animState !== 'idle' || stepsCompleted > 0;

  return (
    <div className="flex h-full">
      {/* Flow area */}
      <div className="flex-1 relative min-w-0">

        {/* ── Animation Controls Bar ── */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm border border-gray-200 shadow-md rounded-full px-3 py-1.5">

          {/* Reset */}
          <button
            onClick={reset}
            title="Reset animation"
            className="w-7 h-7 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          <div className="w-px h-4 bg-gray-200" />

          {/* Play / Pause */}
          {animState === 'playing' ? (
            <button
              onClick={handlePause}
              title="Pause"
              className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
              </svg>
            </button>
          ) : (
            <button
              onClick={handlePlay}
              disabled={animState === 'waiting'}
              title={animState === 'done' ? 'Replay' : 'Play'}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </button>
          )}

          <div className="w-px h-4 bg-gray-200" />

          {/* Speed toggle */}
          {([
            { label: 'Slow', value: 2000 },
            { label: 'Normal', value: 1200 },
            { label: 'Fast', value: 600 },
          ] as const).map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setSpeed(value)}
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors ${
                speed === value
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {label}
            </button>
          ))}

          {/* Step counter */}
          {hasStarted && (
            <>
              <div className="w-px h-4 bg-gray-200" />
              <span className="text-[11px] font-medium text-gray-500 whitespace-nowrap pr-1">
                {stepsCompleted} / {totalNodes}
              </span>
            </>
          )}
        </div>

        {/* ── Done banner ── */}
        {animState === 'done' && (
          <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20">
            <div className="bg-green-50 border border-green-200 shadow-lg rounded-2xl px-5 py-3 flex items-center gap-3">
              <span className="text-green-600 text-xl">✓</span>
              <div>
                <p className="text-sm font-semibold text-green-800">Process Complete</p>
                <p className="text-xs text-green-600">{stepsCompleted} steps walked through</p>
              </div>
              <button
                onClick={handlePlay}
                className="ml-2 text-xs font-semibold text-green-700 underline underline-offset-2 hover:text-green-900"
              >
                Replay
              </button>
            </div>
          </div>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          attributionPosition="bottom-left"
        >
          <Controls position="bottom-right" />
          <MiniMap
            nodeStrokeWidth={3}
            zoomable
            pannable
            position="bottom-left"
            style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8 }}
          />
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e2e8f0" />

          {/* ── Option F: inline node-anchored popover ── */}
          {pendingChoice && (
            <NodeToolbar
              nodeId={pendingChoice.nodeId}
              position={Position.Bottom}
              isVisible={animState === 'waiting'}
              offset={16}
            >
              <div className="bg-white border border-gray-200 rounded-2xl shadow-xl px-4 py-3 w-72">
                {/* connector dot */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-amber-400 border-2 border-white shadow" />

                {/* header row */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-bold text-amber-500 uppercase tracking-widest">Choose a path</span>
                  <button
                    onClick={reset}
                    className="text-gray-300 hover:text-gray-500 text-xs leading-none transition-colors"
                    title="Reset (Esc)"
                  >
                    ✕
                  </button>
                </div>

                {/* choice cards */}
                <div className="grid grid-cols-2 gap-2">
                  {pendingChoice.edges.map((edge) => {
                    const lbl = String(edge.label ?? '');
                    const lower = lbl.toLowerCase();
                    const isYes = lower === 'yes';
                    const isNo = lower === 'no';
                    const destLabel = String(
                      initialNodes.find((n) => n.id === edge.target)?.data?.label ?? edge.target
                    );
                    const border = isYes
                      ? 'border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50'
                      : isNo
                      ? 'border-rose-200 hover:border-rose-400 hover:bg-rose-50'
                      : 'border-gray-200 hover:border-gray-400 hover:bg-gray-50';
                    const labelColor = isYes
                      ? 'text-emerald-600'
                      : isNo
                      ? 'text-rose-600'
                      : 'text-gray-600';
                    const dot = isYes ? 'bg-emerald-400' : isNo ? 'bg-rose-400' : 'bg-gray-400';
                    return (
                      <button
                        key={edge.id}
                        onClick={() => handleChoice(edge)}
                        className={`group flex flex-col items-start gap-1 border-2 ${border} rounded-xl p-3 bg-white transition-all hover:shadow-sm`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
                          <span className={`text-xs font-bold ${labelColor}`}>{lbl || 'Continue'}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 leading-tight line-clamp-2">{destLabel}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </NodeToolbar>
          )}
        </ReactFlow>

        {/* Floating info button — mobile only */}
        <button
          className="md:hidden absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-white border border-gray-200 shadow-sm rounded-full px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          onClick={() => { setSelectedNode(null); setPanelOpen(true); }}
          aria-label="Show process info"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
          </svg>
          Info
        </button>
      </div>

      {/* Desktop detail panel */}
      <div className="hidden md:flex md:flex-col w-80 border-l border-gray-200 bg-white p-5 overflow-y-auto">
        {panelContent}
      </div>

      {/* Mobile bottom sheet backdrop */}
      {panelOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30"
          onClick={() => setPanelOpen(false)}
        />
      )}

      {/* Mobile bottom sheet */}
      <div
        className={`
          md:hidden fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-2xl
          transform transition-transform duration-300 ease-in-out max-h-[65vh] flex flex-col
          ${panelOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
      >
        {/* Handle + header */}
        <div className="flex items-center justify-between px-5 pt-3 pb-2 border-b border-gray-100 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-gray-300 absolute left-1/2 -translate-x-1/2 top-2" />
          <span className="text-sm font-semibold text-gray-700 mt-1">
            {selectedNode ? 'Step Details' : 'Process Info'}
          </span>
          <button
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 mt-1"
            onClick={() => setPanelOpen(false)}
            aria-label="Close panel"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Scrollable content */}
        <div className="overflow-y-auto p-5 flex-1">
          {panelContent}
        </div>
      </div>
    </div>
  );
}

