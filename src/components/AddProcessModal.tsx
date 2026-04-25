import { useState, type FormEvent } from 'react';
import type { ProcessData } from '../types/process';

const COLOR_THEMES = [
  { label: 'Blue', value: 'bg-blue-50 text-blue-700 border-blue-200' },
  { label: 'Red', value: 'bg-red-50 text-red-700 border-red-200' },
  { label: 'Purple', value: 'bg-purple-50 text-purple-700 border-purple-200' },
  { label: 'Amber', value: 'bg-amber-50 text-amber-700 border-amber-200' },
  { label: 'Green', value: 'bg-green-50 text-green-700 border-green-200' },
  { label: 'Indigo', value: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
];

interface Props {
  onClose: () => void;
  onAdd: (process: ProcessData) => void;
}

export default function AddProcessModal({ onClose, onAdd }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📋');
  const [color, setColor] = useState(COLOR_THEMES[0].value);
  const [averageResolutionTime, setAverageResolutionTime] = useState('4 hours');
  const [slaCompliance, setSlaCompliance] = useState('95%');
  const [slaRows, setSlaRows] = useState<{ key: string; value: string }[]>([{ key: '', value: '' }]);

  function handleSlaChange(index: number, field: 'key' | 'value', val: string) {
    setSlaRows(rows => rows.map((r, i) => (i === index ? { ...r, [field]: val } : r)));
  }

  function addSlaRow() {
    setSlaRows(rows => [...rows, { key: '', value: '' }]);
  }

  function removeSlaRow(index: number) {
    setSlaRows(rows => rows.filter((_, i) => i !== index));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const sla: Record<string, string> = {};
    for (const row of slaRows) {
      if (row.key.trim()) sla[row.key.trim()] = row.value.trim();
    }
    const key =
      title
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '') +
      `-${Date.now()}`;
    const newProcess: ProcessData = {
      key,
      nodes: [],
      edges: [],
      info: {
        title: title.trim(),
        description: description.trim(),
        sla,
        metrics: {
          averageResolutionTime: averageResolutionTime.trim() || '4 hours',
          slaCompliance: slaCompliance.trim() || '95%',
        },
      },
      icon,
      color,
    };
    onAdd(newProcess);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="rc-card shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" role="dialog" aria-modal="true" aria-label="Add process">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-[var(--rc-primary-900)]">Add New Process</h3>
          <button
            onClick={onClose}
            aria-label="Close add process dialog"
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-1">
              <label htmlFor="process-icon" className="block text-xs font-medium text-gray-600 mb-1 font-asap">Icon</label>
              <input
                id="process-icon"
                value={icon}
                onChange={e => setIcon(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-lg focus:outline-none focus:ring-2 focus:ring-[var(--rc-primary)]"
                maxLength={2}
              />
            </div>
            <div className="col-span-3">
              <label htmlFor="process-title" className="block text-xs font-medium text-gray-600 mb-1 font-asap">Title</label>
              <input
                id="process-title"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rc-primary)]"
                placeholder="e.g. Change Management"
              />
            </div>
          </div>
          <div>
            <label htmlFor="process-description" className="block text-xs font-medium text-gray-600 mb-1 font-asap">Description</label>
            <textarea
              id="process-description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rc-primary)] resize-none"
              placeholder="Short description of the process"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2 font-asap">Color Theme</label>
            <div className="flex gap-2 flex-wrap">
              {COLOR_THEMES.map(t => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setColor(t.value)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all ${t.value} ${
                    color === t.value ? 'ring-2 ring-offset-1 ring-[var(--rc-primary)]' : ''
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2 font-asap">SLA Targets</label>
            <div className="space-y-2">
              {slaRows.map((row, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <input
                    value={row.key}
                    onChange={e => handleSlaChange(i, 'key', e.target.value)}
                    placeholder="Level (e.g. P1)"
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rc-primary)]"
                  />
                  <input
                    value={row.value}
                    onChange={e => handleSlaChange(i, 'value', e.target.value)}
                    placeholder="Target (e.g. 1 hour)"
                    className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rc-primary)]"
                  />
                  {slaRows.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSlaRow(i)}
                      className="text-gray-400 hover:text-red-500 text-xl leading-none"
                    >
                      &times;
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addSlaRow}
                className="text-xs text-[var(--rc-primary-700)] hover:underline"
              >
                + Add SLA row
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="process-average-resolution" className="block text-xs font-medium text-gray-600 mb-1 font-asap">Avg. Resolution Time</label>
              <input
                id="process-average-resolution"
                value={averageResolutionTime}
                onChange={e => setAverageResolutionTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rc-primary)]"
                placeholder="e.g. 4 hours"
              />
            </div>
            <div>
              <label htmlFor="process-sla-compliance" className="block text-xs font-medium text-gray-600 mb-1 font-asap">SLA Compliance</label>
              <input
                id="process-sla-compliance"
                value={slaCompliance}
                onChange={e => setSlaCompliance(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[var(--rc-primary)]"
                placeholder="e.g. 95%"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium font-asap"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rc-primary-btn text-sm font-medium px-5 py-2 rounded-lg"
            >
              Add Process
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
