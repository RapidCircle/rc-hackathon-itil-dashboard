import type { User, Session } from '../types/auth';
import type { ProcessData, ProcessInfo, ProcessMetrics, ProcessNode, ProcessNodeData } from '../types/process';

const KEYS = {
  session: 'itil_session',
  users: 'itil_users',
  processes: 'itil_processes',
} as const;

const DEFAULT_PROCESS_METRICS: ProcessMetrics = {
  averageResolutionTime: '4 hours',
  slaCompliance: '95%',
};

export function normalizeProcessInfo(info: Partial<ProcessInfo> | undefined): ProcessInfo {
  return {
    title: String(info?.title ?? ''),
    description: String(info?.description ?? ''),
    sla: info?.sla ?? {},
    metrics: {
      averageResolutionTime: String(info?.metrics?.averageResolutionTime ?? DEFAULT_PROCESS_METRICS.averageResolutionTime),
      slaCompliance: String(info?.metrics?.slaCompliance ?? DEFAULT_PROCESS_METRICS.slaCompliance),
    },
  };
}

function normalizeProcessNodeData(data: unknown): ProcessNodeData {
  const raw = (data ?? {}) as Partial<ProcessNodeData>;
  return {
    label: String(raw.label ?? 'Untitled Step'),
    metadata: raw.metadata
      ? {
          description: raw.metadata.description ? String(raw.metadata.description) : '',
          responsibleRole: raw.metadata.responsibleRole ? String(raw.metadata.responsibleRole) : '',
          tips: raw.metadata.tips ? String(raw.metadata.tips) : '',
        }
      : undefined,
  };
}

export function normalizeProcess(process: ProcessData): ProcessData {
  return {
    ...process,
    nodes: process.nodes.map((node): ProcessNode => ({
      ...node,
      data: normalizeProcessNodeData(node.data),
    })),
    info: normalizeProcessInfo(process.info),
  };
}

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEYS.session);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function setSession(session: Session | null): void {
  if (session) {
    localStorage.setItem(KEYS.session, JSON.stringify(session));
  } else {
    localStorage.removeItem(KEYS.session);
  }
}

export function getUsers(): User[] {
  try {
    const raw = localStorage.getItem(KEYS.users);
    return raw ? (JSON.parse(raw) as User[]) : [];
  } catch {
    return [];
  }
}

export function setUsers(users: User[]): void {
  localStorage.setItem(KEYS.users, JSON.stringify(users));
}

export function getProcesses(): ProcessData[] {
  try {
    const raw = localStorage.getItem(KEYS.processes);
    return raw ? (JSON.parse(raw) as ProcessData[]).map(normalizeProcess) : [];
  } catch {
    return [];
  }
}

export function setProcesses(processes: ProcessData[]): void {
  localStorage.setItem(KEYS.processes, JSON.stringify(processes.map(normalizeProcess)));
}
