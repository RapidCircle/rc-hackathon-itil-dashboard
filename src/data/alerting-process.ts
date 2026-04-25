import type { Edge } from '@xyflow/react';
import type { ProcessNode } from '../types/process';

const s = { fontSize: 12, padding: 8, borderRadius: 8, width: 180, textAlign: 'center' as const };

export const alertingNodes: ProcessNode[] = [
  {
    id: 'a1', position: { x: 300, y: 0 },
    data: {
      label: 'Monitoring Alert Fires',
      metadata: {
        description: 'An automated monitoring system detects a threshold breach, anomaly, or error condition and generates an alert for investigation.',
        responsibleRole: 'Monitoring System / NOC Team',
        tips: 'Ensure monitoring covers all critical services and infrastructure components; Set meaningful thresholds to minimise noise; Use multi-condition alerting to improve signal accuracy.',
      },
    },
    style: { ...s, background: '#fecaca', border: '2px solid #ef4444' },
  },
  {
    id: 'a2', position: { x: 300, y: 80 },
    data: {
      label: 'Alert Correlation & Dedup',
      metadata: {
        description: 'Multiple related alerts are correlated and deduplicated to identify the true scope of the issue and prevent alert fatigue from duplicate notifications.',
        responsibleRole: 'NOC Engineer / AIOps Platform',
        tips: 'Use AIOps or event correlation tools to group related alerts; Suppress child alerts when a parent alert is already active; Tune deduplication rules regularly.',
      },
    },
    style: { ...s, background: '#e0e7ff', border: '2px solid #6366f1' },
  },
  {
    id: 'a3', position: { x: 300, y: 170 },
    data: {
      label: 'Is It a Real Issue?',
      metadata: {
        description: 'A decision point to determine whether the alert represents a genuine service-affecting condition or a false positive caused by a misconfigured threshold or transient spike.',
        responsibleRole: 'NOC Engineer',
        tips: 'Check historical alert data for similar patterns; Verify with secondary monitoring sources before actioning; Log false positive decisions for threshold tuning.',
      },
    },
    style: { ...s, background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: 4 },
  },
  {
    id: 'a4', position: { x: 80, y: 260 },
    data: {
      label: 'Suppress / Tune Alert',
      metadata: {
        description: 'A false positive alert is suppressed and the underlying monitoring rule or threshold is adjusted to prevent the same false alarm from recurring.',
        responsibleRole: 'NOC Engineer / Monitoring Admin',
        tips: 'Document the reason for suppression and the tuning change; Review suppressed alerts periodically to ensure none are masking real issues; Involve the service owner in threshold decisions.',
      },
    },
    style: { ...s, background: '#f3f4f6', border: '2px solid #9ca3af' },
  },
  {
    id: 'a5', position: { x: 520, y: 260 },
    data: {
      label: 'Classify Severity',
      metadata: {
        description: 'The confirmed alert is classified by severity level based on its business impact, number of affected users, and criticality of the impacted service.',
        responsibleRole: 'NOC Engineer / Incident Manager',
        tips: 'Use a defined severity matrix tied to business impact; Align severity classification with incident priority levels; Escalate immediately for Critical or High severity alerts.',
      },
    },
    style: { ...s, background: '#fecaca', border: '2px solid #ef4444' },
  },
  {
    id: 'a6', position: { x: 520, y: 350 },
    data: {
      label: 'Auto-Remediation Available?',
      metadata: {
        description: 'A decision point to determine whether an automated remediation script or runbook exists that can resolve this type of alert without manual intervention.',
        responsibleRole: 'NOC Engineer / Automation Team',
        tips: 'Maintain a catalogue of verified auto-remediation scripts mapped to alert types; Only auto-remediate for well-understood, low-risk scenarios; Log every auto-remediation action for audit.',
      },
    },
    style: { ...s, background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: 4 },
  },
  {
    id: 'a7', position: { x: 300, y: 440 },
    data: {
      label: 'Execute Runbook / Script',
      metadata: {
        description: 'An automated runbook or remediation script is executed to attempt to resolve the alert condition without requiring manual engineer involvement.',
        responsibleRole: 'Automation Platform / NOC Engineer',
        tips: 'Validate that the runbook is appropriate for the current alert context; Set execution timeouts to prevent runbooks from hanging; Capture all output and results for review.',
      },
    },
    style: { ...s, background: '#d1fae5', border: '2px solid #10b981' },
  },
  {
    id: 'a8', position: { x: 720, y: 440 },
    data: {
      label: 'Notify On-Call Engineer',
      metadata: {
        description: 'The on-call engineer is paged or notified via the alerting platform to manually investigate and respond to the alert when auto-remediation is not available.',
        responsibleRole: 'Alerting Platform / NOC Team',
        tips: 'Use a defined on-call rotation with clear escalation paths; Include alert context and severity in the notification; Acknowledge receipt to prevent duplicate escalations.',
      },
    },
    style: { ...s, background: '#fed7aa', border: '2px solid #f97316' },
  },
  {
    id: 'a9', position: { x: 300, y: 530 },
    data: {
      label: 'Auto-Fix Successful?',
      metadata: {
        description: 'A decision point to determine whether the automated remediation successfully resolved the alert condition or whether manual intervention is still required.',
        responsibleRole: 'Automation Platform / NOC Engineer',
        tips: 'Validate resolution by checking alert status and service health metrics; Do not assume success without confirmation data; Create an incident ticket if auto-fix fails.',
      },
    },
    style: { ...s, background: '#fef3c7', border: '2px solid #f59e0b', borderRadius: 4 },
  },
  {
    id: 'a10', position: { x: 300, y: 620 },
    data: {
      label: 'Log Resolution',
      metadata: {
        description: 'The successful resolution is logged, including the alert details, automated action taken, and confirmation that the service has returned to normal operation.',
        responsibleRole: 'Automation Platform / NOC Engineer',
        tips: 'Record the exact remediation action and timestamp; Link the log entry to the original alert and any monitoring ticket; Use logs to improve future runbook accuracy.',
      },
    },
    style: { ...s, background: '#d1fae5', border: '2px solid #10b981' },
  },
  {
    id: 'a11', position: { x: 720, y: 530 },
    data: {
      label: 'Create Incident Ticket',
      metadata: {
        description: 'A formal incident ticket is raised in the service management platform to track the manual investigation and resolution effort.',
        responsibleRole: 'NOC Engineer / Service Desk',
        tips: 'Pre-populate the ticket with alert data, severity, and affected CIs; Link the alert and ticket for traceability; Set the correct priority based on severity classification.',
      },
    },
    style: { ...s, background: '#dbeafe', border: '2px solid #3b82f6' },
  },
  {
    id: 'a12', position: { x: 720, y: 620 },
    data: {
      label: 'Manual Investigation',
      metadata: {
        description: 'An engineer performs manual investigation using system logs, monitoring dashboards, and diagnostic tools to identify and resolve the root cause of the alert.',
        responsibleRole: 'On-Call Engineer / L2 Support',
        tips: 'Follow the appropriate runbook or troubleshooting guide; Escalate to L3 or vendor if required; Document all investigation steps in the incident ticket.',
      },
    },
    style: { ...s, background: '#dbeafe', border: '2px solid #3b82f6' },
  },
  {
    id: 'a13', position: { x: 520, y: 720 },
    data: {
      label: 'Update Alert Rules / Thresholds',
      metadata: {
        description: 'Post-resolution, the alerting rules and thresholds are reviewed and updated to improve detection accuracy, reduce false positives, and strengthen future response.',
        responsibleRole: 'Monitoring Admin / NOC Lead',
        tips: 'Base threshold changes on evidence, not assumptions; Test updated rules in a staging environment where possible; Document all rule changes with justification.',
      },
    },
    style: { ...s, background: '#e0e7ff', border: '2px solid #6366f1' },
  },
  {
    id: 'a14', position: { x: 520, y: 810 },
    data: {
      label: 'Close Alert',
      metadata: {
        description: 'The alert is formally closed after the issue has been resolved, the service confirmed as healthy, and all documentation updated.',
        responsibleRole: 'NOC Engineer / Incident Manager',
        tips: 'Verify service health metrics before closing; Update linked incident tickets with resolution details; Conduct a brief post-incident review for Critical or High severity alerts.',
      },
    },
    style: { ...s, background: '#d1fae5', border: '2px solid #059669', fontWeight: 'bold' },
  },
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
