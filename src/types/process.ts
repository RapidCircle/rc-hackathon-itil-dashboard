import type { Node, Edge } from '@xyflow/react';

export interface ProcessNodeMetadata {
  description?: string;
  responsibleRole?: string;
  tips?: string;
}

export interface ProcessNodeData extends Record<string, unknown> {
  label: string;
  metadata?: ProcessNodeMetadata;
}

export type ProcessNode = Node<ProcessNodeData>;

export interface ProcessMetrics {
  averageResolutionTime: string;
  slaCompliance: string;
}

export interface ProcessInfo {
  title: string;
  description: string;
  sla: Record<string, string>;
  metrics: ProcessMetrics;
}

export interface ProcessData {
  key: string;
  nodes: ProcessNode[];
  edges: Edge[];
  info: ProcessInfo;
  icon: string;
  color: string;
}

export type SearchMatchType = 'node' | 'edge' | 'process' | 'sla';

export interface ProcessSearchResult {
  id: string;
  processKey: string;
  processTitle: string;
  processIcon: string;
  matchType: SearchMatchType;
  matchText: string;
  contextText?: string;
  nodeId?: string;
  edgeId?: string;
  rank: number;
}
