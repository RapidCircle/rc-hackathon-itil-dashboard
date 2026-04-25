import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type Edge,
  type NodeMouseHandler,
  type Connection,
  type EdgeChange,
  type ReactFlowInstance,
  BackgroundVariant,
} from '@xyflow/react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import type { ProcessInfo, ProcessNode, ProcessNodeMetadata } from '../types/process';

const ANIMATION_SPEEDS = {
  slow: 1600,
  normal: 1000,
  fast: 650,
} as const;

type AnimationSpeed = keyof typeof ANIMATION_SPEEDS;

interface FlowChartProps {
  initialNodes: ProcessNode[];
  initialEdges: Edge[];
  processInfo: ProcessInfo;
  isEditable?: boolean;
  focusNodeId?: string;
  highlightNodeIds?: string[];
  highlightNonce?: number;
  onUpdate?: (data: { nodes: ProcessNode[]; edges: Edge[]; info: ProcessInfo }) => void;
}

function compareNodePosition(a: ProcessNode, b: ProcessNode): number {
  if (a.position.y !== b.position.y) {
    return a.position.y - b.position.y;
  }
  return a.position.x - b.position.x;
}

function buildAnimationPath(nodes: ProcessNode[], edges: Edge[]) {
  const nodeMap = new Map(nodes.map(node => [node.id, node]));
  const incoming = new Map<string, number>();
  const outgoing = new Map<string, Edge[]>();

  for (const node of nodes) {
    incoming.set(node.id, 0);
    outgoing.set(node.id, []);
  }

  for (const edge of edges) {
    incoming.set(edge.target, (incoming.get(edge.target) ?? 0) + 1);
    outgoing.set(edge.source, [...(outgoing.get(edge.source) ?? []), edge]);
  }

  for (const [nodeId, list] of outgoing.entries()) {
    list.sort((edgeA, edgeB) => {
      const targetA = nodeMap.get(edgeA.target);
      const targetB = nodeMap.get(edgeB.target);
      if (!targetA || !targetB) {
        return edgeA.id.localeCompare(edgeB.id);
      }
      return compareNodePosition(targetA, targetB);
    });
    outgoing.set(nodeId, list);
  }

  const roots = nodes
    .filter(node => (incoming.get(node.id) ?? 0) === 0)
    .sort(compareNodePosition);

  const orderedNodes: string[] = [];
  const orderedEdges: string[] = [];
  const visitedNodes = new Set<string>();
  const visitedEdges = new Set<string>();

  const walk = (nodeId: string) => {
    if (visitedNodes.has(nodeId)) {
      return;
    }
    visitedNodes.add(nodeId);
    orderedNodes.push(nodeId);

    for (const edge of outgoing.get(nodeId) ?? []) {
      if (!visitedEdges.has(edge.id)) {
        visitedEdges.add(edge.id);
        orderedEdges.push(edge.id);
      }
      walk(edge.target);
    }
  };

  for (const root of roots) {
    walk(root.id);
  }

  const remainingNodes = [...nodes].sort(compareNodePosition);
  for (const node of remainingNodes) {
    walk(node.id);
  }

  return { nodeIds: orderedNodes, edgeIds: orderedEdges };
}

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function FlowChart({
  initialNodes,
  initialEdges,
  processInfo,
  isEditable = false,
  focusNodeId,
  highlightNodeIds = [],
  highlightNonce,
  onUpdate,
}: FlowChartProps) {
  const chartViewportRef = useRef<HTMLDivElement | null>(null);
  const [flowInstance, setFlowInstance] = useState<ReactFlowInstance<ProcessNode, Edge> | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState<ProcessNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<ProcessNode | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editMetadata, setEditMetadata] = useState<ProcessNodeMetadata>({});
  const [info, setInfo] = useState<ProcessInfo>(processInfo);
  const [activeExport, setActiveExport] = useState<'png' | 'pdf' | null>(null);
  const [exportError, setExportError] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationSpeed, setAnimationSpeed] = useState<AnimationSpeed>('normal');
  const [animationStep, setAnimationStep] = useState(0);

  const persist = useCallback(
    (newNodes: ProcessNode[], newEdges: Edge[], newInfo: ProcessInfo) => {
      onUpdate?.({ nodes: newNodes, edges: newEdges, info: newInfo });
    },
    [onUpdate],
  );

  const onNodeClick: NodeMouseHandler<ProcessNode> = useCallback((_, node) => {
    setSelectedNode(node);
    setEditLabel(node.data.label);
  }, []);

  useEffect(() => {
    setInfo(processInfo);
  }, [processInfo]);

  useEffect(() => {
    if (!selectedNode) {
      setEditMetadata({});
      return;
    }

    setEditLabel(selectedNode.data.label);
    setEditMetadata(selectedNode.data.metadata ?? {});
  }, [selectedNode]);

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleSaveNodeDetails = useCallback(() => {
    if (!selectedNode) return;

    const nextMetadata: ProcessNodeMetadata = {
      description: editMetadata.description?.trim() ?? '',
      responsibleRole: editMetadata.responsibleRole?.trim() ?? '',
      tips: editMetadata.tips?.trim() ?? '',
    };

    const newNodes = nodes.map(n =>
      n.id === selectedNode.id
        ? {
            ...n,
            data: {
              ...n.data,
              label: editLabel.trim() || 'Untitled Step',
              metadata: nextMetadata,
            },
          }
        : n,
    );
    setNodes(newNodes);
    setSelectedNode(prev =>
      prev
        ? {
            ...prev,
            data: {
              ...prev.data,
              label: editLabel.trim() || 'Untitled Step',
              metadata: nextMetadata,
            },
          }
        : null,
    );
    persist(newNodes, edges, info);
  }, [selectedNode, editLabel, editMetadata, nodes, edges, info, setNodes, persist]);

  const handleDeleteNode = useCallback(() => {
    if (!selectedNode) return;
    const newNodes = nodes.filter(n => n.id !== selectedNode.id);
    const newEdges = edges.filter(
      e => e.source !== selectedNode.id && e.target !== selectedNode.id,
    );
    setNodes(newNodes);
    setEdges(newEdges);
    setSelectedNode(null);
    persist(newNodes, newEdges, info);
  }, [selectedNode, nodes, edges, info, setNodes, setEdges, persist]);

  const handleAddNode = useCallback(() => {
    const id = generateId('n');
    const newNode: ProcessNode = {
      id,
      position: { x: 300, y: nodes.length * 90 },
      data: {
        label: 'New Step',
        metadata: {
          description: '',
          responsibleRole: '',
          tips: '',
        },
      },
      style: {
        fontSize: 12,
        padding: 8,
        borderRadius: 8,
        width: 180,
        textAlign: 'center' as const,
        background: 'var(--rc-primary-50)',
        border: '2px solid var(--rc-primary-600)',
      },
    };
    const newNodes = [...nodes, newNode];
    setNodes(newNodes);
    persist(newNodes, edges, info);
  }, [nodes, edges, info, setNodes, persist]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge: Edge = { ...connection, id: generateId('e') };
      const newEdges = addEdge(newEdge, edges);
      setEdges(newEdges);
      persist(nodes, newEdges, info);
    },
    [nodes, edges, info, setEdges, persist],
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange[]) => {
      onEdgesChange(changes);
      if (isEditable) {
        const removedIds = new Set(
          changes
            .filter((c): c is { type: 'remove'; id: string } => c.type === 'remove')
            .map(c => c.id),
        );
        if (removedIds.size > 0) {
          const newEdges = edges.filter(e => !removedIds.has(e.id));
          persist(nodes, newEdges, info);
        }
      }
    },
    [onEdgesChange, edges, nodes, info, isEditable, persist],
  );

  const onNodeDragStop = useCallback(
    (_event: MouseEvent, _node: ProcessNode, currentNodes: ProcessNode[]) => {
      persist(currentNodes, edges, info);
    },
    [edges, info, persist],
  );

  const handleMetricChange = useCallback(
    (field: keyof ProcessInfo['metrics'], value: string) => {
      const newInfo = {
        ...info,
        metrics: {
          ...info.metrics,
          [field]: value,
        },
      };
      setInfo(newInfo);
      persist(nodes, edges, newInfo);
    },
    [info, nodes, edges, persist],
  );

  const handleSlaChange = useCallback(
    (level: string, value: string) => {
      const newInfo = { ...info, sla: { ...info.sla, [level]: value } };
      setInfo(newInfo);
      persist(nodes, edges, newInfo);
    },
    [info, nodes, edges, persist],
  );

  useEffect(() => {
    if (!focusNodeId) {
      return;
    }
    const node = nodes.find(n => n.id === focusNodeId);
    if (!node) {
      return;
    }
    const width = typeof node.width === 'number' ? node.width : 180;
    const height = typeof node.height === 'number' ? node.height : 60;
    const centerX = node.position.x + width / 2;
    const centerY = node.position.y + height / 2;
    flowInstance?.setCenter(centerX, centerY, { zoom: 1.2, duration: 350 });
    setSelectedNode(node);
  }, [focusNodeId, highlightNonce, nodes, flowInstance]);

  const animationPath = useMemo(() => buildAnimationPath(nodes, edges), [nodes, edges]);

  useEffect(() => {
    if (!isAnimating || animationPath.nodeIds.length === 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setAnimationStep(prev => prev + 1);
    }, ANIMATION_SPEEDS[animationSpeed]);

    return () => {
      window.clearInterval(timer);
    };
  }, [isAnimating, animationSpeed, animationPath.nodeIds.length]);

  useEffect(() => {
    if (!isAnimating) {
      setAnimationStep(0);
    }
  }, [isAnimating]);

  const animatedNodeId = isAnimating && animationPath.nodeIds.length > 0
    ? animationPath.nodeIds[animationStep % animationPath.nodeIds.length]
    : undefined;
  const animatedEdgeId = isAnimating && animationPath.edgeIds.length > 0
    ? animationPath.edgeIds[animationStep % animationPath.edgeIds.length]
    : undefined;

  const displayNodes = useMemo(() => {
    if (highlightNodeIds.length === 0 && !animatedNodeId) {
      return nodes;
    }

    const highlighted = new Set(highlightNodeIds);
    return nodes.map(node => {
      if (!highlighted.has(node.id) && node.id !== animatedNodeId) {
        return node;
      }

      const isAnimated = node.id === animatedNodeId;
      return {
        ...node,
        style: {
          ...node.style,
          boxShadow: isAnimated
            ? '0 0 0 4px color-mix(in srgb, var(--rc-primary-600) 45%, transparent), 0 0 18px color-mix(in srgb, var(--rc-primary-600) 28%, transparent)'
            : '0 0 0 3px color-mix(in srgb, var(--rc-primary-600) 35%, transparent)',
          borderColor: isAnimated ? 'var(--rc-primary-600)' : 'var(--rc-primary-700)',
        },
      };
    });
  }, [nodes, highlightNodeIds, animatedNodeId]);

  const displayEdges = useMemo(() => {
    if (!animatedEdgeId) {
      return edges;
    }

    return edges.map(edge =>
      edge.id === animatedEdgeId
        ? {
            ...edge,
            animated: true,
            style: {
              ...edge.style,
              stroke: 'var(--rc-primary-600)',
              strokeWidth: 3,
            },
          }
        : edge,
    );
  }, [edges, animatedEdgeId]);

  const handleExport = useCallback(
    async (format: 'png' | 'pdf') => {
      if (!chartViewportRef.current) {
        return;
      }

      setActiveExport(format);
      setExportError('');

      try {
        const backgroundColor =
          getComputedStyle(document.documentElement)
            .getPropertyValue('--rc-surface-elevated')
            .trim() || '#ffffff';
        const dataUrl = await toPng(chartViewportRef.current, {
          cacheBust: true,
          pixelRatio: 2,
          backgroundColor,
        });

        if (format === 'png') {
          const link = document.createElement('a');
          link.download = `${info.title.toLowerCase().replace(/\s+/g, '-')}-flow.png`;
          link.href = dataUrl;
          link.click();
          return;
        }

        const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: 'a4' });
        const image = pdf.getImageProperties(dataUrl);
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const ratio = Math.min(pageWidth / image.width, pageHeight / image.height);
        const width = image.width * ratio;
        const height = image.height * ratio;
        const offsetX = (pageWidth - width) / 2;
        const offsetY = (pageHeight - height) / 2;

        pdf.addImage(dataUrl, 'PNG', offsetX, offsetY, width, height);
        pdf.save(`${info.title.toLowerCase().replace(/\s+/g, '-')}-flow.pdf`);
      } catch {
        setExportError('Unable to export the current flow. Try again after the chart finishes rendering.');
      } finally {
        setActiveExport(null);
      }
    },
    [info.title],
  );

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[var(--rc-primary-100)] bg-white/80 px-4 py-3 backdrop-blur-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rc-card p-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 font-asap">Avg. Resolution Time</p>
              {isEditable ? (
                <input
                  value={info.metrics.averageResolutionTime}
                  onChange={e => handleMetricChange('averageResolutionTime', e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rc-primary)]"
                  aria-label="Average resolution time"
                />
              ) : (
                <p className="mt-2 text-lg font-semibold text-gray-900">{info.metrics.averageResolutionTime}</p>
              )}
            </div>
            <div className="rc-card p-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-500 font-asap">SLA Compliance</p>
              {isEditable ? (
                <input
                  value={info.metrics.slaCompliance}
                  onChange={e => handleMetricChange('slaCompliance', e.target.value)}
                  className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rc-primary)]"
                  aria-label="SLA compliance"
                />
              ) : (
                <p className="mt-2 text-lg font-semibold text-gray-900">{info.metrics.slaCompliance}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap xl:justify-end">
            <button
              type="button"
              onClick={() => handleExport('png')}
              disabled={activeExport !== null}
              className="rounded-lg border border-[var(--rc-primary-100)] bg-white px-3 py-2 text-xs font-medium text-[var(--rc-primary-900)] hover:bg-[var(--rc-primary-50)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {activeExport === 'png' ? 'Exporting PNG...' : 'Export PNG'}
            </button>
            <button
              type="button"
              onClick={() => handleExport('pdf')}
              disabled={activeExport !== null}
              className="rounded-lg border border-[var(--rc-primary-100)] bg-white px-3 py-2 text-xs font-medium text-[var(--rc-primary-900)] hover:bg-[var(--rc-primary-50)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {activeExport === 'pdf' ? 'Exporting PDF...' : 'Export PDF'}
            </button>
            <button
              type="button"
              onClick={() => setIsAnimating(prev => !prev)}
              className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                isAnimating
                  ? 'border-[var(--rc-primary-100)] bg-[var(--rc-primary-50)] text-[var(--rc-primary-900)]'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {isAnimating ? 'Stop Animation' : 'Start Animation'}
            </button>
            <select
              value={animationSpeed}
              onChange={e => setAnimationSpeed(e.target.value as AnimationSpeed)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[var(--rc-primary)]"
              aria-label="Animation speed"
            >
              <option value="slow">Speed: Slow</option>
              <option value="normal">Speed: Normal</option>
              <option value="fast">Speed: Fast</option>
            </select>
          </div>
        </div>
        {exportError && <p className="mt-2 text-xs text-red-600">{exportError}</p>}
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div ref={chartViewportRef} className="relative min-h-[320px] flex-1">
        <ReactFlow
          nodes={displayNodes}
          edges={displayEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={handleEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onConnect={isEditable ? onConnect : undefined}
          onNodeDragStop={isEditable ? onNodeDragStop : undefined}
          deleteKeyCode={isEditable ? 'Delete' : null}
          onInit={setFlowInstance}
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
            style={{
              background: 'color-mix(in srgb, var(--rc-surface-elevated) 96%, transparent)',
              border: '1px solid var(--rc-border-soft)',
              borderRadius: 8,
            }}
          />
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="var(--rc-flow-grid)" />
        </ReactFlow>
      </div>

      <div className="w-full border-t border-[var(--rc-primary-100)] bg-white/95 p-5 text-[var(--rc-text)] overflow-y-auto lg:w-80 lg:border-l lg:border-t-0">
        {selectedNode ? (
          <div>
            <div className="mb-4">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider font-asap">Selected Step</span>
              <h3 className="text-lg font-semibold text-gray-900 mt-1">{selectedNode.data.label}</h3>
            </div>
            {isEditable ? (
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 mb-2">Step Details</p>
                  <input
                    value={editLabel}
                    onChange={e => setEditLabel(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSaveNodeDetails()}
                    aria-label="Edit node label"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rc-primary)]"
                  />
                  <textarea
                    value={editMetadata.description ?? ''}
                    onChange={e => setEditMetadata(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    aria-label="Edit node description"
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rc-primary)] resize-none"
                    placeholder="Description"
                  />
                  <input
                    value={editMetadata.responsibleRole ?? ''}
                    onChange={e => setEditMetadata(prev => ({ ...prev, responsibleRole: e.target.value }))}
                    aria-label="Edit responsible role"
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rc-primary)]"
                    placeholder="Responsible role"
                  />
                  <textarea
                    value={editMetadata.tips ?? ''}
                    onChange={e => setEditMetadata(prev => ({ ...prev, tips: e.target.value }))}
                    rows={3}
                    aria-label="Edit tips"
                    className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rc-primary)] resize-none"
                    placeholder="Tips or operator notes"
                  />
                  <button
                    onClick={handleSaveNodeDetails}
                    aria-label="Save node details"
                    className="mt-2 w-full bg-[var(--rc-primary-600)] hover:bg-[var(--rc-primary-700)] text-white text-xs font-medium py-1.5 rounded-lg transition-colors"
                  >
                    Save Details
                  </button>
                </div>
                <button
                  onClick={handleDeleteNode}
                  aria-label="Delete selected node"
                  className="w-full bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-medium py-2 rounded-lg transition-colors"
                >
                  Delete Node
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">Description</p>
                  <p className="text-sm text-gray-700">{selectedNode.data.metadata?.description || 'No description added yet.'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-gray-500 mb-1">Responsible Role</p>
                  <p className="text-sm text-gray-700">{selectedNode.data.metadata?.responsibleRole || 'No role assigned.'}</p>
                </div>
                <div className="bg-[var(--rc-primary-50)] rounded-lg p-3 border border-[var(--rc-primary-100)]">
                  <p className="text-xs font-medium text-[var(--rc-primary-700)] mb-1">Tips</p>
                  <p className="text-sm text-[var(--rc-primary-900)]">
                    {selectedNode.data.metadata?.tips || 'Click any node to see its details. Use scroll to zoom, drag to pan.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{info.title}</h3>
            <p className="text-sm text-gray-600 mb-4 font-asap">{info.description}</p>

            {isEditable && (
              <div className="mb-4">
                <button
                  onClick={handleAddNode}
                  aria-label="Add a new node"
                  className="w-full bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 text-xs font-medium py-2 rounded-lg transition-colors"
                >
                  + Add Node
                </button>
                <p className="text-[10px] text-gray-400 mt-1 text-center">
                  Drag from a node handle to connect. Select + Delete key removes edges.
                </p>
              </div>
            )}

            <div className="mb-4">
              <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">SLA Targets</h4>
              <div className="space-y-2">
                {Object.entries(info.sla).map(([level, time]) => (
                  <div key={level} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-sm font-medium text-gray-700">{level}</span>
                    {isEditable ? (
                      <input
                        value={time}
                        onChange={e => handleSlaChange(level, e.target.value)}
                        aria-label={`Edit SLA target for ${level}`}
                        className="text-sm font-semibold text-gray-900 bg-white border border-gray-300 rounded px-2 py-0.5 w-24 text-right focus:outline-none focus:ring-2 focus:ring-[var(--rc-primary)]"
                      />
                    ) : (
                      <span className="text-sm font-semibold text-gray-900">{time}</span>
                    )}
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
        )}
      </div>
      </div>
    </div>
  );
}
