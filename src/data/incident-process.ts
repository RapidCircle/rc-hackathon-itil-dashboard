import type { Edge } from '@xyflow/react';
import type { ProcessNode } from '../types/process';

const nodeDefaults = {
  style: { fontSize: 12, padding: 8, borderRadius: 8, width: 180, textAlign: 'center' as const },
};

export const incidentNodes: ProcessNode[] = [
  {
    id: 'i1',
    position: { x: 300, y: 0 },
    data: {
      label: 'User Reports Incident',
      metadata: {
        description: 'An end user identifies an issue and reports it through an approved channel such as a service portal, email, chatbot, or phone.',
        responsibleRole: 'End User / Requester',
        tips: 'Promote a single reporting channel to avoid duplicate incidents; Capture screenshots, error messages, timestamps, and impact details; Use structured forms instead of free-text where possible.',
      },
    },
    style: { ...nodeDefaults.style, background: '#dbeafe', border: '2px solid #3b82f6' },
  },
  {
    id: 'i2',
    position: { x: 300, y: 80 },
    data: {
      label: 'Log & Categorize',
      metadata: {
        description: 'The reported incident is logged into the ticketing system and categorized based on service, category, and subcategory to enable correct routing and reporting.',
        responsibleRole: 'Service Desk / L1 Support',
        tips: 'Use predefined categories and subcategories; Correct categorization improves SLA tracking and analytics; Automate categorization using templates or rules where possible.',
      },
    },
    style: { ...nodeDefaults.style, background: '#dbeafe', border: '2px solid #3b82f6' },
  },
  {
    id: 'i3',
    position: { x: 300, y: 160 },
    data: {
      label: 'Assign Priority (P1-P4)',
      metadata: {
        description: 'The incident priority is assigned based on business impact and urgency, determining response and resolution SLAs.',
        responsibleRole: 'Service Desk / Incident Manager',
        tips: 'Use a clear impact x urgency priority matrix; Avoid unnecessary P1 assignments; Reassess priority if impact or urgency changes.',
      },
    },
    style: { ...nodeDefaults.style, background: '#dbeafe', border: '2px solid #3b82f6' },
  },
  {
    id: 'i4',
    position: { x: 300, y: 240 },
    data: {
      label: 'L1 Support Investigates',
      metadata: {
        description: 'Level 1 support performs initial investigation and troubleshooting using standard runbooks, knowledge base articles, and known error databases.',
        responsibleRole: 'L1 Support Team',
        tips: 'Follow documented troubleshooting steps first; Check for known issues before new investigation; Document all analysis performed.',
      },
    },
    style: { ...nodeDefaults.style, background: '#bfdbfe', border: '2px solid #2563eb' },
  },
  {
    id: 'i5',
    position: { x: 300, y: 350 },
    data: {
      label: 'Can L1 Resolve?',
      metadata: {
        description: 'A decision point to determine whether the issue can be resolved at Level 1 with available access, skills, and documentation.',
        responsibleRole: 'L1 Support Lead / L1 Engineer',
        tips: 'Do not delay escalation if skills or permissions are insufficient; Resolution speed is more important than ownership; Clearly define L1 resolution scope.',
      },
    },
    type: 'default',
    style: { ...nodeDefaults.style, background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: 4 },
  },
  {
    id: 'i6',
    position: { x: 80, y: 420 },
    data: {
      label: 'Apply Fix & Document',
      metadata: {
        description: 'L1 applies the identified resolution or workaround and documents the fix, including steps taken and outcome.',
        responsibleRole: 'L1 Support Team',
        tips: 'Always record the fix for audit and knowledge reuse; Update or create knowledge base articles if needed; Ensure fix aligns with standard operating procedures.',
      },
    },
    style: { ...nodeDefaults.style, background: '#d1fae5', border: '2px solid #10b981' },
  },
  {
    id: 'i7',
    position: { x: 520, y: 420 },
    data: {
      label: 'Escalate to L2',
      metadata: {
        description: 'The incident is escalated to Level 2 when it cannot be resolved by L1 due to complexity, access, or technical limitations.',
        responsibleRole: 'L1 Support -> L2 Support',
        tips: 'Include complete troubleshooting notes during escalation; Avoid blind escalations; Confirm correct assignment group.',
      },
    },
    style: { ...nodeDefaults.style, background: '#fed7aa', border: '2px solid #f97316' },
  },
  {
    id: 'i8',
    position: { x: 520, y: 510 },
    data: {
      label: 'L2 Deep Investigation',
      metadata: {
        description: 'Level 2 support performs advanced technical analysis, including log analysis, configuration checks, and deeper diagnostics.',
        responsibleRole: 'L2 Support Team',
        tips: 'Use system logs, monitoring tools, and diagnostics; Engage SMEs early if needed; Maintain regular updates in the incident ticket.',
      },
    },
    style: { ...nodeDefaults.style, background: '#fed7aa', border: '2px solid #f97316' },
  },
  {
    id: 'i9',
    position: { x: 520, y: 600 },
    data: {
      label: 'Can L2 Resolve?',
      metadata: {
        description: 'A decision point to determine whether L2 can resolve the incident or if it requires escalation to Level 3 or an external vendor.',
        responsibleRole: 'L2 Support Lead / SME',
        tips: 'Escalate early for vendor-related or product defects; Avoid extended troubleshooting without progress; Clearly document root cause hypothesis.',
      },
    },
    style: { ...nodeDefaults.style, background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: 4 },
  },
  {
    id: 'i10',
    position: { x: 300, y: 690 },
    data: {
      label: 'Apply Fix & Document',
      metadata: {
        description: 'L2 implements the permanent fix or workaround and documents technical details, resolution steps, and root cause where applicable.',
        responsibleRole: 'L2 Support Team',
        tips: 'Capture technical learnings for future incidents; Update internal documentation and KBs; Confirm fix does not introduce new risks.',
      },
    },
    style: { ...nodeDefaults.style, background: '#d1fae5', border: '2px solid #10b981' },
  },
  {
    id: 'i11',
    position: { x: 720, y: 690 },
    data: {
      label: 'Escalate to L3 / Vendor',
      metadata: {
        description: 'The incident is escalated to Level 3 support or an external vendor when specialised expertise, product-level access, or vendor intervention is required.',
        responsibleRole: 'L2 Support -> L3 Support / Vendor',
        tips: 'Attach logs, evidence, and timelines; Track vendor SLAs and follow-ups; Ensure internal visibility during vendor engagement.',
      },
    },
    style: { ...nodeDefaults.style, background: '#fecaca', border: '2px solid #ef4444' },
  },
  {
    id: 'i12',
    position: { x: 720, y: 780 },
    data: {
      label: 'L3 / Vendor Resolution',
      metadata: {
        description: 'The issue is investigated and resolved by the product team, engineering team, or external vendor.',
        responsibleRole: 'L3 Support / Vendor Team',
        tips: 'Validate fix before rollback of workarounds; Request RCA for major incidents; Share learnings with L1 and L2 teams.',
      },
    },
    style: { ...nodeDefaults.style, background: '#fecaca', border: '2px solid #ef4444' },
  },
  {
    id: 'i13',
    position: { x: 300, y: 780 },
    data: {
      label: 'Verify with User',
      metadata: {
        description: 'The implemented fix is confirmed with the end user to ensure the issue is resolved and service is fully restored.',
        responsibleRole: 'Service Desk / L1 Support',
        tips: 'Use clear confirmation questions; Allow reasonable verification time; Capture user feedback if available.',
      },
    },
    style: { ...nodeDefaults.style, background: '#e0e7ff', border: '2px solid #6366f1' },
  },
  {
    id: 'i14',
    position: { x: 300, y: 870 },
    data: {
      label: 'Close Incident',
      metadata: {
        description: 'The incident is formally closed after successful verification, documentation, and resolution confirmation.',
        responsibleRole: 'Service Desk / Incident Manager',
        tips: 'Ensure all fields are updated before closure; Link related incidents if applicable; Review for continuous improvement opportunities.',
      },
    },
    style: { ...nodeDefaults.style, background: '#d1fae5', border: '2px solid #059669', fontWeight: 'bold' },
  },
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
