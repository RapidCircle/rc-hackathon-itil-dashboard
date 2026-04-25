import type { User } from '../types/auth';
import type { ProcessData } from '../types/process';
import { incidentNodes, incidentEdges, incidentInfo } from '../data/incident-process';
import { problemNodes, problemEdges, problemInfo } from '../data/problem-process';
import { alertingNodes, alertingEdges, alertingInfo } from '../data/alerting-process';
import { getUsers, setUsers, getProcesses, setProcesses, normalizeProcessInfo } from './storage';

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
  if (getProcesses().length === 0) {
    setProcesses(seedProcesses);
  }
}
