import type { Node, Edge } from '@xyflow/react';

const s = { fontSize: 12, padding: 8, borderRadius: 8, width: 180, textAlign: 'center' as const };

export const problemNodes: Node[] = [
  { id: 'p1', position: { x: 300, y: 0 }, data: { label: 'Recurring Incidents Detected' }, style: { ...s, background: '#fecaca', border: '2px solid #ef4444' } },
  { id: 'p2', position: { x: 300, y: 80 }, data: { label: 'Log Problem Record' }, style: { ...s, background: '#e0e7ff', border: '2px solid #6366f1' } },
  { id: 'p3', position: { x: 300, y: 160 }, data: { label: 'Assign Problem Manager' }, style: { ...s, background: '#e0e7ff', border: '2px solid #6366f1' } },
  { id: 'p4', position: { x: 300, y: 250 }, data: { label: 'Root Cause Analysis (RCA)' }, style: { ...s, background: '#fef3c7', border: '2px solid #f59e0b' } },
  { id: 'p5', position: { x: 300, y: 350 }, data: { label: 'Root Cause Identified?' }, style: { ...s, background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: 4 } },
  { id: 'p6', position: { x: 80, y: 440 }, data: { label: 'Document Known Error' }, style: { ...s, background: '#d1fae5', border: '2px solid #10b981' } },
  { id: 'p7', position: { x: 520, y: 440 }, data: { label: 'Escalate / External Research' }, style: { ...s, background: '#fed7aa', border: '2px solid #f97316' } },
  { id: 'p8', position: { x: 80, y: 530 }, data: { label: 'Add to Known Error DB (KEDB)' }, style: { ...s, background: '#d1fae5', border: '2px solid #10b981' } },
  { id: 'p9', position: { x: 80, y: 620 }, data: { label: 'Workaround Available?' }, style: { ...s, background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: 4 } },
  { id: 'p10', position: { x: -140, y: 710 }, data: { label: 'Document Workaround' }, style: { ...s, background: '#dbeafe', border: '2px solid #3b82f6' } },
  { id: 'p11', position: { x: 80, y: 710 }, data: { label: 'Plan Permanent Fix' }, style: { ...s, background: '#e0e7ff', border: '2px solid #6366f1' } },
  { id: 'p12', position: { x: 80, y: 800 }, data: { label: 'Implement Change (RFC)' }, style: { ...s, background: '#e0e7ff', border: '2px solid #6366f1' } },
  { id: 'p13', position: { x: 80, y: 890 }, data: { label: 'Verify Fix in Production' }, style: { ...s, background: '#dbeafe', border: '2px solid #3b82f6' } },
  { id: 'p14', position: { x: 300, y: 980 }, data: { label: 'Close Problem Record' }, style: { ...s, background: '#d1fae5', border: '2px solid #059669', fontWeight: 'bold' } },
];

export const problemEdges: Edge[] = [
  { id: 'pe1', source: 'p1', target: 'p2', animated: true },
  { id: 'pe2', source: 'p2', target: 'p3' },
  { id: 'pe3', source: 'p3', target: 'p4' },
  { id: 'pe4', source: 'p4', target: 'p5' },
  { id: 'pe5', source: 'p5', target: 'p6', label: 'Yes', style: { stroke: '#10b981' } },
  { id: 'pe6', source: 'p5', target: 'p7', label: 'No', style: { stroke: '#ef4444' } },
  { id: 'pe7', source: 'p7', target: 'p4', label: 'Retry', style: { stroke: '#f97316' } },
  { id: 'pe8', source: 'p6', target: 'p8' },
  { id: 'pe9', source: 'p8', target: 'p9' },
  { id: 'pe10', source: 'p9', target: 'p10', label: 'Yes', style: { stroke: '#10b981' } },
  { id: 'pe11', source: 'p9', target: 'p11', label: 'No' },
  { id: 'pe12', source: 'p10', target: 'p11' },
  { id: 'pe13', source: 'p11', target: 'p12' },
  { id: 'pe14', source: 'p12', target: 'p13' },
  { id: 'pe15', source: 'p13', target: 'p14' },
];

export const problemInfo = {
  title: 'Problem Management',
  description: 'Identify root causes of recurring incidents and implement permanent fixes to prevent future occurrences.',
  sla: { Critical: '48 hours', High: '1 week', Medium: '2 weeks', Low: '1 month' },
};
