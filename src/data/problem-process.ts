import type { Edge } from '@xyflow/react';
import type { ProcessNode } from '../types/process';

const s = { fontSize: 12, padding: 8, borderRadius: 8, width: 180, textAlign: 'center' as const };

export const problemNodes: ProcessNode[] = [
  {
    id: 'p1', position: { x: 300, y: 0 },
    data: {
      label: 'Recurring Incidents Detected',
      metadata: {
        description: 'A pattern of repeated incidents is identified, triggering the problem management process to find and eliminate the underlying root cause.',
        responsibleRole: 'Incident Manager / Service Desk',
        tips: 'Use incident trend reports to detect patterns; Set thresholds for automatic problem record creation; Correlate incidents by category, CI, or impacted service.',
      },
    },
    style: { ...s, background: '#fecaca', border: '2px solid #ef4444' },
  },
  {
    id: 'p2', position: { x: 300, y: 80 },
    data: {
      label: 'Log Problem Record',
      metadata: {
        description: 'A formal problem record is created in the service management tool, capturing all known details including affected services, related incidents, and initial symptoms.',
        responsibleRole: 'Problem Manager / Service Desk',
        tips: 'Link all related incident tickets to the problem record; Capture CI information and affected service details; Set initial priority based on business impact.',
      },
    },
    style: { ...s, background: '#e0e7ff', border: '2px solid #6366f1' },
  },
  {
    id: 'p3', position: { x: 300, y: 160 },
    data: {
      label: 'Assign Problem Manager',
      metadata: {
        description: 'A qualified Problem Manager is assigned to own the investigation and drive the problem record through to resolution.',
        responsibleRole: 'IT Management / Problem Manager',
        tips: 'Assign based on technical domain expertise; Ensure the Problem Manager has cross-team authority; Set clear ownership and escalation paths.',
      },
    },
    style: { ...s, background: '#e0e7ff', border: '2px solid #6366f1' },
  },
  {
    id: 'p4', position: { x: 300, y: 250 },
    data: {
      label: 'Root Cause Analysis (RCA)',
      metadata: {
        description: 'A structured investigation is performed to identify the underlying root cause of the problem using techniques such as 5-Whys, Ishikawa diagrams, or fault tree analysis.',
        responsibleRole: 'Problem Manager / SME',
        tips: 'Use a structured RCA methodology consistently; Involve relevant SMEs and engineering teams; Document all hypotheses, tests, and findings.',
      },
    },
    style: { ...s, background: '#fef3c7', border: '2px solid #f59e0b' },
  },
  {
    id: 'p5', position: { x: 300, y: 350 },
    data: {
      label: 'Root Cause Identified?',
      metadata: {
        description: 'A decision point to confirm whether the root cause has been definitively identified, or whether further investigation or external research is required.',
        responsibleRole: 'Problem Manager',
        tips: 'Do not proceed without a validated root cause; Peer-review findings before closing the investigation phase; Escalate if root cause cannot be determined internally.',
      },
    },
    style: { ...s, background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: 4 },
  },
  {
    id: 'p6', position: { x: 80, y: 440 },
    data: {
      label: 'Document Known Error',
      metadata: {
        description: 'The identified problem and its root cause are documented as a Known Error, enabling faster resolution of future incidents with the same root cause.',
        responsibleRole: 'Problem Manager / Knowledge Manager',
        tips: 'Include symptoms, root cause, and any available workarounds; Keep Known Error records accurate and up to date; Make records accessible to the Service Desk.',
      },
    },
    style: { ...s, background: '#d1fae5', border: '2px solid #10b981' },
  },
  {
    id: 'p7', position: { x: 520, y: 440 },
    data: {
      label: 'Escalate / External Research',
      metadata: {
        description: 'When the root cause cannot be determined internally, the problem is escalated to specialist teams, vendor support, or external research communities.',
        responsibleRole: 'Problem Manager / Vendor Support',
        tips: 'Prepare detailed evidence packages before escalation; Track vendor response SLAs; Keep internal stakeholders updated on progress.',
      },
    },
    style: { ...s, background: '#fed7aa', border: '2px solid #f97316' },
  },
  {
    id: 'p8', position: { x: 80, y: 530 },
    data: {
      label: 'Add to Known Error DB (KEDB)',
      metadata: {
        description: 'The Known Error is formally added to the Known Error Database so it can be referenced during future incident investigations and service desk troubleshooting.',
        responsibleRole: 'Knowledge Manager / Problem Manager',
        tips: 'Ensure KEDB entries are searchable and categorised; Review and retire outdated Known Errors regularly; Share access with L1 and L2 support teams.',
      },
    },
    style: { ...s, background: '#d1fae5', border: '2px solid #10b981' },
  },
  {
    id: 'p9', position: { x: 80, y: 620 },
    data: {
      label: 'Workaround Available?',
      metadata: {
        description: 'A decision point to determine whether an interim workaround exists to restore or maintain service while a permanent fix is planned and implemented.',
        responsibleRole: 'Problem Manager / SME',
        tips: 'Document the workaround even if temporary; Communicate workarounds to the Service Desk immediately; Re-evaluate workarounds if conditions change.',
      },
    },
    style: { ...s, background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: 4 },
  },
  {
    id: 'p10', position: { x: -140, y: 710 },
    data: {
      label: 'Document Workaround',
      metadata: {
        description: 'The interim workaround is formally documented in the problem record and Known Error Database to enable the Service Desk to apply it for future incidents.',
        responsibleRole: 'Problem Manager / L2 Support',
        tips: 'Write workaround steps clearly for L1 use; Include known risks or limitations of the workaround; Link workaround to affected incident tickets.',
      },
    },
    style: { ...s, background: '#dbeafe', border: '2px solid #3b82f6' },
  },
  {
    id: 'p11', position: { x: 80, y: 710 },
    data: {
      label: 'Plan Permanent Fix',
      metadata: {
        description: 'A permanent resolution is planned, which may involve a software fix, configuration change, infrastructure upgrade, or process improvement.',
        responsibleRole: 'Problem Manager / Change Manager',
        tips: 'Raise a Request for Change (RFC) if required; Estimate risk and effort before planning; Align the fix timeline with change management windows.',
      },
    },
    style: { ...s, background: '#e0e7ff', border: '2px solid #6366f1' },
  },
  {
    id: 'p12', position: { x: 80, y: 800 },
    data: {
      label: 'Implement Change (RFC)',
      metadata: {
        description: 'The planned fix is implemented through the formal change management process to ensure controlled and auditable deployment.',
        responsibleRole: 'Change Manager / Technical Team',
        tips: 'Follow the approved change process; Test the fix in a non-production environment first; Ensure rollback procedures are documented and ready.',
      },
    },
    style: { ...s, background: '#e0e7ff', border: '2px solid #6366f1' },
  },
  {
    id: 'p13', position: { x: 80, y: 890 },
    data: {
      label: 'Verify Fix in Production',
      metadata: {
        description: 'The implemented fix is validated in the production environment to confirm the root cause has been eliminated and the problem will not recur.',
        responsibleRole: 'Problem Manager / Technical Team',
        tips: 'Monitor the affected service for a sufficient period post-fix; Confirm linked incidents do not reopen; Remove or update the workaround in the KEDB if no longer needed.',
      },
    },
    style: { ...s, background: '#dbeafe', border: '2px solid #3b82f6' },
  },
  {
    id: 'p14', position: { x: 300, y: 980 },
    data: {
      label: 'Close Problem Record',
      metadata: {
        description: 'The problem record is formally closed after the fix has been verified, all documentation is complete, and related incident tickets are updated.',
        responsibleRole: 'Problem Manager',
        tips: 'Ensure all linked incidents are resolved or updated; Conduct a post-implementation review for major problems; Share lessons learned with support teams.',
      },
    },
    style: { ...s, background: '#d1fae5', border: '2px solid #059669', fontWeight: 'bold' },
  },
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
