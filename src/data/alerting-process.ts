import type { Node, Edge } from '@xyflow/react';

const s = { fontSize: 12, padding: 8, borderRadius: 8, width: 180, textAlign: 'center' as const };

export const alertingNodes: Node[] = [
  { id: 'a1', position: { x: 300, y: 0 }, data: { label: 'Monitoring Alert Fires' }, style: { ...s, background: '#fecaca', border: '2px solid #ef4444' } },
  { id: 'a2', position: { x: 300, y: 80 }, data: { label: 'Alert Correlation & Dedup' }, style: { ...s, background: '#e0e7ff', border: '2px solid #6366f1' } },
  { id: 'a3', position: { x: 300, y: 170 }, data: { label: 'Is It a Real Issue?' }, style: { ...s, background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: 4 } },
  { id: 'a4', position: { x: 80, y: 260 }, data: { label: 'Suppress / Tune Alert' }, style: { ...s, background: '#f3f4f6', border: '2px solid #9ca3af' } },
  { id: 'a5', position: { x: 520, y: 260 }, data: { label: 'Classify Severity' }, style: { ...s, background: '#fecaca', border: '2px solid #ef4444' } },
  { id: 'a6', position: { x: 520, y: 350 }, data: { label: 'Auto-Remediation Available?' }, style: { ...s, background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: 4 } },
  { id: 'a7', position: { x: 300, y: 440 }, data: { label: 'Execute Runbook / Script' }, style: { ...s, background: '#d1fae5', border: '2px solid #10b981' } },
  { id: 'a8', position: { x: 720, y: 440 }, data: { label: 'Notify On-Call Engineer' }, style: { ...s, background: '#fed7aa', border: '2px solid #f97316' } },
  { id: 'a9', position: { x: 300, y: 530 }, data: { label: 'Auto-Fix Successful?' }, style: { ...s, background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: 4 } },
  { id: 'a10', position: { x: 300, y: 620 }, data: { label: 'Log Resolution' }, style: { ...s, background: '#d1fae5', border: '2px solid #10b981' } },
  { id: 'a11', position: { x: 720, y: 530 }, data: { label: 'Create Incident Ticket' }, style: { ...s, background: '#dbeafe', border: '2px solid #3b82f6' } },
  { id: 'a12', position: { x: 720, y: 620 }, data: { label: 'Manual Investigation' }, style: { ...s, background: '#dbeafe', border: '2px solid #3b82f6' } },
  { id: 'a13', position: { x: 520, y: 720 }, data: { label: 'Update Alert Rules / Thresholds' }, style: { ...s, background: '#e0e7ff', border: '2px solid #6366f1' } },
  { id: 'a14', position: { x: 520, y: 810 }, data: { label: 'Close Alert' }, style: { ...s, background: '#d1fae5', border: '2px solid #059669', fontWeight: 'bold' } },
];

export const alertingEdges: Edge[] = [
  { id: 'ae1', source: 'a1', target: 'a2', animated: true },
  { id: 'ae2', source: 'a2', target: 'a3' },
  { id: 'ae3', source: 'a3', target: 'a4', label: 'False Positive', style: { stroke: '#9ca3af' } },
  { id: 'ae4', source: 'a3', target: 'a5', label: 'Real Issue', style: { stroke: '#ef4444' } },
  { id: 'ae5', source: 'a5', target: 'a6' },
  { id: 'ae6', source: 'a6', target: 'a7', label: 'Yes', style: { stroke: '#10b981' } },
  { id: 'ae7', source: 'a6', target: 'a8', label: 'No', style: { stroke: '#f97316' } },
  { id: 'ae8', source: 'a7', target: 'a9' },
  { id: 'ae9', source: 'a9', target: 'a10', label: 'Yes', style: { stroke: '#10b981' } },
  { id: 'ae10', source: 'a9', target: 'a11', label: 'No', style: { stroke: '#ef4444' } },
  { id: 'ae11', source: 'a8', target: 'a11' },
  { id: 'ae12', source: 'a11', target: 'a12' },
  { id: 'ae13', source: 'a10', target: 'a13' },
  { id: 'ae14', source: 'a12', target: 'a13' },
  { id: 'ae15', source: 'a13', target: 'a14' },
];

export const alertingInfo = {
  title: 'Alerting & Monitoring',
  description: 'Proactively detect, correlate, and respond to infrastructure and application alerts before users are impacted.',
  sla: { Critical: '5 minutes', High: '15 minutes', Medium: '1 hour', Low: '4 hours' },
};
