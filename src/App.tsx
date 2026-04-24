import { useState } from 'react';
import FlowChart from './components/FlowChart';
import { incidentNodes, incidentEdges, incidentInfo } from './data/incident-process';
import { problemNodes, problemEdges, problemInfo } from './data/problem-process';
import { alertingNodes, alertingEdges, alertingInfo } from './data/alerting-process';

type ProcessKey = 'incident' | 'problem' | 'alerting';

const processes = {
  incident: { nodes: incidentNodes, edges: incidentEdges, info: incidentInfo, icon: '🔥', color: 'bg-red-50 text-red-700 border-red-200' },
  problem: { nodes: problemNodes, edges: problemEdges, info: problemInfo, icon: '🔍', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  alerting: { nodes: alertingNodes, edges: alertingEdges, info: alertingInfo, icon: '🔔', color: 'bg-amber-50 text-amber-700 border-amber-200' },
};

export default function App() {
  const [activeProcess, setActiveProcess] = useState<ProcessKey>('incident');
  const current = processes[activeProcess];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo */}
        <div className="px-5 py-4 border-b border-gray-200">
          <h1 className="text-lg font-bold text-gray-900">ITIL Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">Interactive Process Viewer</p>
        </div>

        {/* Process list */}
        <nav className="flex-1 p-3 space-y-1">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-2">Processes</p>
          {(Object.entries(processes) as [ProcessKey, typeof processes.incident][]).map(([key, proc]) => (
            <button
              key={key}
              onClick={() => setActiveProcess(key)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2.5 ${
                activeProcess === key
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-100 border border-transparent'
              }`}
            >
              <span className="text-lg">{proc.icon}</span>
              {proc.info.title}
            </button>
          ))}
        </nav>

        {/* Stats */}
        <div className="p-4 border-t border-gray-200">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Current Process</p>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Nodes</span>
              <span className="font-semibold text-gray-900">{current.nodes.length}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Connections</span>
              <span className="font-semibold text-gray-900">{current.edges.length}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Decisions</span>
              <span className="font-semibold text-gray-900">
                {current.nodes.filter(n => String(n.data.label).includes('?')).length}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-200 text-center">
          <p className="text-[10px] text-gray-400">RapidCircle Hackathon 2026</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${current.color}`}>
              {current.icon} {current.info.title}
            </span>
            <p className="text-sm text-gray-500 hidden sm:block">{current.info.description}</p>
          </div>
        </header>

        {/* FlowChart */}
        <div className="flex-1">
          <FlowChart
            key={activeProcess}
            initialNodes={current.nodes}
            initialEdges={current.edges}
            processInfo={current.info}
          />
        </div>
      </main>
    </div>
  );
}
