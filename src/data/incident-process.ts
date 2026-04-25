import type { Node, Edge } from '@xyflow/react';

const nodeDefaults = {
  style: { fontSize: 12, padding: 8, borderRadius: 8, width: 180, textAlign: 'center' as const },
};

export const incidentNodes: Node[] = [
  { id: 'i1', position: { x: 300, y: 0 }, data: { label: 'User Reports Incident' }, style: { ...nodeDefaults.style, background: '#dbeafe', border: '2px solid #3b82f6' } },
  { id: 'i2', position: { x: 300, y: 80 }, data: { label: 'Log & Categorize' }, style: { ...nodeDefaults.style, background: '#dbeafe', border: '2px solid #3b82f6' } },
  { id: 'i3', position: { x: 300, y: 160 }, data: { label: 'Assign Priority (P1-P4)' }, style: { ...nodeDefaults.style, background: '#dbeafe', border: '2px solid #3b82f6' } },
  { id: 'i4', position: { x: 300, y: 240 }, data: { label: 'L1 Support Investigates' }, style: { ...nodeDefaults.style, background: '#bfdbfe', border: '2px solid #2563eb' } },
  { id: 'i5', position: { x: 300, y: 330 }, data: { label: 'Can L1 Resolve?' }, style: { ...nodeDefaults.style, background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: 4 } },
  { id: 'i6', position: { x: 80, y: 420 }, data: { label: 'Apply Fix & Document' }, style: { ...nodeDefaults.style, background: '#d1fae5', border: '2px solid #10b981' } },
  { id: 'i7', position: { x: 520, y: 420 }, data: { label: 'Escalate to L2' }, style: { ...nodeDefaults.style, background: '#fed7aa', border: '2px solid #f97316' } },
  { id: 'i8', position: { x: 520, y: 510 }, data: { label: 'L2 Deep Investigation' }, style: { ...nodeDefaults.style, background: '#fed7aa', border: '2px solid #f97316' } },
  { id: 'i9', position: { x: 520, y: 600 }, data: { label: 'Can L2 Resolve?' }, style: { ...nodeDefaults.style, background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: 4 } },
  { id: 'i10', position: { x: 300, y: 690 }, data: { label: 'Apply Fix & Document' }, style: { ...nodeDefaults.style, background: '#d1fae5', border: '2px solid #10b981' } },
  { id: 'i11', position: { x: 720, y: 690 }, data: { label: 'Escalate to L3 / Vendor' }, style: { ...nodeDefaults.style, background: '#fecaca', border: '2px solid #ef4444' } },
  { id: 'i12', position: { x: 720, y: 780 }, data: { label: 'L3 / Vendor Resolution' }, style: { ...nodeDefaults.style, background: '#fecaca', border: '2px solid #ef4444' } },
  { id: 'i13', position: { x: 300, y: 780 }, data: { label: 'Verify with User' }, style: { ...nodeDefaults.style, background: '#e0e7ff', border: '2px solid #6366f1' } },
  { id: 'i14', position: { x: 300, y: 870 }, data: { label: 'Close Incident' }, style: { ...nodeDefaults.style, background: '#d1fae5', border: '2px solid #059669', fontWeight: 'bold' } },
];

export const incidentEdges: Edge[] = [
  { id: 'ie1', source: 'i1', target: 'i2', animated: true },
  { id: 'ie2', source: 'i2', target: 'i3' },
  { id: 'ie3', source: 'i3', target: 'i4' },
  { id: 'ie4', source: 'i4', target: 'i5' },
  { id: 'ie5', source: 'i5', target: 'i6', label: 'Yes', style: { stroke: '#10b981' } },
  { id: 'ie6', source: 'i5', target: 'i7', label: 'No', style: { stroke: '#ef4444' } },
  { id: 'ie7', source: 'i7', target: 'i8' },
  { id: 'ie8', source: 'i8', target: 'i9' },
  { id: 'ie9', source: 'i9', target: 'i10', label: 'Yes', style: { stroke: '#10b981' } },
  { id: 'ie10', source: 'i9', target: 'i11', label: 'No', style: { stroke: '#ef4444' } },
  { id: 'ie11', source: 'i6', target: 'i13' },
  { id: 'ie12', source: 'i10', target: 'i13' },
  { id: 'ie13', source: 'i11', target: 'i12' },
  { id: 'ie14', source: 'i12', target: 'i13' },
  { id: 'ie15', source: 'i13', target: 'i14' },
];

export const incidentInfo = {
  title: 'Incident Management',
  description: 'Restore normal service operation as quickly as possible while minimizing impact on business operations.',
  sla: { P1: '1 hour', P2: '4 hours', P3: '8 hours', P4: '24 hours' },
};
