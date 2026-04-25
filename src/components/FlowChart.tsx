import { useCallback, useState } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeMouseHandler,
  BackgroundVariant,
} from '@xyflow/react';

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

export default function FlowChart({ initialNodes, initialEdges, processInfo }: FlowChartProps) {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);
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

  return (
    <div className="flex h-full">
      {/* Flow area */}
      <div className="flex-1 relative min-w-0">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
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
