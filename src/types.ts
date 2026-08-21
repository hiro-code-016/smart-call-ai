export type Outcome =
  | 'No Answer'
  | 'Left Message'
  | 'Spoke - Interested'
  | 'Spoke - Not Interested'
  | 'Disqualified';

export const OUTCOMES: Outcome[] = [
  'No Answer',
  'Left Message',
  'Spoke - Interested',
  'Spoke - Not Interested',
  'Disqualified',
];

export const NEGATIVE_OUTCOMES: Outcome[] = [
  'No Answer',
  'Left Message',
  'Spoke - Not Interested',
];

export type LeadStatus =
  | 'New'
  | 'In Progress'
  | 'Interested'
  | 'Not Interested'
  | 'Disqualified';

export interface CallLog {
  id: string;
  startedAt: string; // ISO
  endedAt: string | null; // ISO
  durationSec: number | null;
  outcome: Outcome | null;
  notes: string;
  salespersonId: string;
}

export interface AssignmentEvent {
  id: string;
  at: string; // ISO
  fromSalespersonId: string | null;
  toSalespersonId: string;
  by: 'manager';
}

export interface Intervention {
  id: string;
  at: string; // ISO
  note: string;
  status: 'open' | 'resolved';
  resolvedAt?: string;
  resolveNote?: string;
}

export interface Lead {
  id: string;
  name: string;
  company: string;
  email?: string;
  phone?: string;
  dealValue: number;
  status: LeadStatus;
  salespersonId: string;
  createdAt: string; // ISO
  followUpDate: string | null; // YYYY-MM-DD
  calls: CallLog[];
  assignments: AssignmentEvent[];
  interventions: Intervention[];
}

export interface Salesperson {
  id: string;
  name: string;
  initials: string;
  color: string; // tailwind gradient classes
}

export interface AppState {
  salespeople: Salesperson[];
  leads: Lead[];
  highRiskThreshold: number; // default 60
  activeRole: 'manager' | string; // salesperson id when in rep view
  activeSalespersonId: string;
}
