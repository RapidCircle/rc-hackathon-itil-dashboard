import type { Node } from '@xyflow/react';
import type { ProcessData, ProcessSearchResult } from '../types/process';

function normalizeText(value: unknown): string {
  return String(value ?? '').trim();
}

function includesQuery(value: string, query: string): boolean {
  return value.toLowerCase().includes(query.toLowerCase());
}

function scoreMatch(text: string, query: string, base: number): number {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  if (lowerText === lowerQuery) return base + 300;
  if (lowerText.startsWith(lowerQuery)) return base + 200;
  if (lowerText.includes(lowerQuery)) return base + 100;
  return base;
}

function getNodeCenter(node: Node): { x: number; y: number } {
  const width = typeof node.width === 'number' ? node.width : 180;
  const height = typeof node.height === 'number' ? node.height : 60;
  return {
    x: node.position.x + width / 2,
    y: node.position.y + height / 2,
  };
}

export function getBestProcessNodeId(process: ProcessData): string | undefined {
  if (process.nodes.length === 0) return undefined;
  const sorted = [...process.nodes].sort((a, b) => {
    const aCenter = getNodeCenter(a);
    const bCenter = getNodeCenter(b);
    if (aCenter.y !== bCenter.y) return aCenter.y - bCenter.y;
    return aCenter.x - bCenter.x;
  });
  return sorted[0]?.id;
}

export function searchProcesses(processes: ProcessData[], query: string): ProcessSearchResult[] {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return [];

  const results: ProcessSearchResult[] = [];

  for (const process of processes) {
    const title = normalizeText(process.info.title);
    const description = normalizeText(process.info.description);

    if (includesQuery(title, normalizedQuery)) {
      results.push({
        id: `process-title-${process.key}`,
        processKey: process.key,
        processTitle: process.info.title,
        processIcon: process.icon,
        matchType: 'process',
        matchText: title,
        contextText: 'Process title',
        nodeId: getBestProcessNodeId(process),
        rank: scoreMatch(title, normalizedQuery, 60),
      });
    }

    if (description && includesQuery(description, normalizedQuery)) {
      results.push({
        id: `process-description-${process.key}`,
        processKey: process.key,
        processTitle: process.info.title,
        processIcon: process.icon,
        matchType: 'process',
        matchText: description,
        contextText: 'Process description',
        nodeId: getBestProcessNodeId(process),
        rank: scoreMatch(description, normalizedQuery, 55),
      });
    }

    for (const [slaLevel, slaTime] of Object.entries(process.info.sla)) {
      const text = `${slaLevel} ${slaTime}`;
      if (!includesQuery(text, normalizedQuery)) continue;
      results.push({
        id: `sla-${process.key}-${slaLevel}`,
        processKey: process.key,
        processTitle: process.info.title,
        processIcon: process.icon,
        matchType: 'sla',
        matchText: slaTime,
        contextText: `SLA ${slaLevel}`,
        nodeId: getBestProcessNodeId(process),
        rank: scoreMatch(text, normalizedQuery, 50),
      });
    }

    for (const node of process.nodes) {
      const label = normalizeText((node.data as { label?: unknown })?.label);
      if (!label || !includesQuery(label, normalizedQuery)) continue;
      results.push({
        id: `node-${process.key}-${node.id}`,
        processKey: process.key,
        processTitle: process.info.title,
        processIcon: process.icon,
        matchType: 'node',
        matchText: label,
        contextText: 'Node label',
        nodeId: node.id,
        rank: scoreMatch(label, normalizedQuery, 100),
      });
    }

    for (const edge of process.edges) {
      const edgeLabel = normalizeText(edge.label);
      if (!edgeLabel || !includesQuery(edgeLabel, normalizedQuery)) continue;
      results.push({
        id: `edge-${process.key}-${edge.id}`,
        processKey: process.key,
        processTitle: process.info.title,
        processIcon: process.icon,
        matchType: 'edge',
        matchText: edgeLabel,
        contextText: `Edge ${edge.source} -> ${edge.target}`,
        edgeId: edge.id,
        nodeId: edge.target || edge.source || getBestProcessNodeId(process),
        rank: scoreMatch(edgeLabel, normalizedQuery, 70),
      });
    }
  }

  return results.sort((a, b) => {
    if (b.rank !== a.rank) return b.rank - a.rank;
    if (a.processTitle !== b.processTitle) return a.processTitle.localeCompare(b.processTitle);
    return a.matchText.localeCompare(b.matchText);
  });
}
