import { useState } from 'react';
import UserManagement from './UserManagement';
import type { ProcessData } from '../types/process';

type AdminTab = 'users' | 'processes';

const PROTECTED_KEYS = ['incident', 'problem', 'alerting'];

interface Props {
  processes: ProcessData[];
  onDeleteProcess: (key: string) => void;
  onClose: () => void;
  onOpenAddProcess: () => void;
}

export default function AdminPanel({ processes, onDeleteProcess, onClose, onOpenAddProcess }: Props) {
  const [activeTab, setActiveTab] = useState<AdminTab>('users');

  return (
    <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-6">
      <div className="rc-card w-full max-w-3xl shadow-2xl flex flex-col overflow-hidden max-h-full" role="dialog" aria-modal="true" aria-label="Admin panel">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--rc-primary-100)] flex-shrink-0 bg-[var(--rc-primary-50)]">
          <h2 className="text-base font-semibold text-[var(--rc-primary-900)]">⚙️ Admin Panel</h2>
          <button
            onClick={onClose}
            aria-label="Close admin panel"
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--rc-primary-100)] px-6 flex-shrink-0">
          {(['users', 'processes'] as AdminTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              aria-label={`Open ${tab} tab`}
              className={`mr-6 py-3 text-sm font-medium border-b-2 transition-colors font-asap ${
                activeTab === tab
                  ? 'border-[var(--rc-primary-600)] text-[var(--rc-primary-700)]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab === 'users' ? 'User Management' : 'Process Management'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'users' ? (
            <UserManagement />
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">Manage process flows visible in the sidebar.</p>
                <button
                  onClick={onOpenAddProcess}
                  aria-label="Add process"
                  className="rc-primary-btn text-sm font-medium px-4 py-2 rounded-lg"
                >
                  + Add Process
                </button>
              </div>
              <div className="bg-white border border-[var(--rc-primary-100)] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-left">
                      <th className="px-4 py-3 font-semibold text-gray-600">Process</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Description</th>
                      <th className="px-4 py-3 font-semibold text-gray-600">Nodes</th>
                      <th className="px-4 py-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {processes.map(p => (
                      <tr key={p.key} className="border-b border-gray-100 last:border-0">
                        <td className="px-4 py-3">
                          <span className="flex items-center gap-2">
                            <span>{p.icon}</span>
                            <span className="font-medium text-gray-900">{p.info.title}</span>
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs max-w-xs truncate">
                          {p.info.description}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{p.nodes.length}</td>
                        <td className="px-4 py-3 text-right">
                          {!PROTECTED_KEYS.includes(p.key) ? (
                            <button
                              onClick={() => onDeleteProcess(p.key)}
                              className="text-xs text-red-500 hover:text-red-700 font-medium"
                            >
                              Delete
                            </button>
                          ) : (
                            <span className="text-xs text-gray-300 italic">protected</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
