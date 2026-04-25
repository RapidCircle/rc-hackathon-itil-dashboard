import type { User } from '../types/auth';
import type { ProcessData } from '../types/process';
import { incidentNodes, incidentEdges, incidentInfo } from '../data/incident-process';
import { problemNodes, problemEdges, problemInfo } from '../data/problem-process';
import { alertingNodes, alertingEdges, alertingInfo } from '../data/alerting-process';
import { getUsers, setUsers, getProcesses, setProcesses, normalizeProcessInfo } from './storage';

// Bump this version whenever built-in process data (nodes/edges/positions) changes.
// On mismatch the built-in processes are reseeded from the data files while any
// admin-added custom processes are preserved.
const SEED_VERSION = '5';
const SEED_VERSION_KEY = 'itil_seed_version';

export const DEMO_OTP_CODE = '123456';

export const DEMO_USERS: User[] = [
  {
    id: 'admin-1',
    name: 'Admin',
    email: 'admin@itil.com',
    password: 'Admin@123',
    role: 'admin',
  },
  {
    id: 'sdm-1',
    name: 'Service Desk Manager',
    email: 'sdm@itil.com',
    password: 'Sdm@123',
    role: 'sdm',
  },
  {
    id: 'user-1',
    name: 'Support Analyst',
    email: 'user@itil.com',
    password: 'User@123',
    role: 'user',
  },
];

const seedProcesses: ProcessData[] = [
  {
    key: 'incident',
    nodes: incidentNodes,
    edges: incidentEdges,
    info: normalizeProcessInfo({
      ...incidentInfo,
      metrics: {
        averageResolutionTime: '3.5 hours',
        slaCompliance: '96%',
      },
    }),
    icon: '🔥',
    color: 'bg-red-50 text-red-700 border-red-200',
  },
  {
    key: 'problem',
    nodes: problemNodes,
    edges: problemEdges,
    info: normalizeProcessInfo({
      ...problemInfo,
      metrics: {
        averageResolutionTime: '2.5 business days',
        slaCompliance: '93%',
      },
    }),
    icon: '🔍',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
  },
  {
    key: 'alerting',
    nodes: alertingNodes,
    edges: alertingEdges,
    info: normalizeProcessInfo({
      ...alertingInfo,
      metrics: {
        averageResolutionTime: '18 minutes',
        slaCompliance: '98%',
      },
    }),
    icon: '🔔',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
  },
];

export function seedIfEmpty(): void {
  const existingUsers = getUsers();
  const mergedUsers = [...existingUsers];

  for (const demoUser of DEMO_USERS) {
    const existingIndex = mergedUsers.findIndex(user => user.email === demoUser.email);
    if (existingIndex === -1) {
      mergedUsers.push(demoUser);
    }
  }

  if (mergedUsers.length !== existingUsers.length) {
    setUsers(mergedUsers);
  }

  const existingProcesses = getProcesses();
  const storedVersion = localStorage.getItem(SEED_VERSION_KEY);

  if (existingProcesses.length === 0) {
    setProcesses(seedProcesses);
    localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
  } else if (storedVersion !== SEED_VERSION) {
    // Reseed built-in processes from the data files; preserve any admin-added custom processes.
    const builtInKeys = new Set(seedProcesses.map(p => p.key));
    const customProcesses = existingProcesses.filter(p => !builtInKeys.has(p.key));
    setProcesses([...seedProcesses, ...customProcesses]);
    // Set the version BEFORE reloading so the next load doesn't reseed again.
    localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
    // Force a full page reload so React re-initialises all state from the
    // freshly written localStorage (avoids stale positions surviving HMR).
    window.location.reload();
  }
}
