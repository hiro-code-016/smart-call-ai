import type { Lead, Salesperson } from '@/types';

export const SALESPEOPLE: Salesperson[] = [
  { id: 'sp_john', name: 'John Carter', initials: 'JC', color: 'from-brand-500 to-brand-700' },
  { id: 'sp_sarah', name: 'Sarah Lee', initials: 'SL', color: 'from-cyan-500 to-cyan-600' },
];

const now = new Date();
const iso = (d: Date) => d.toISOString();
const daysAgo = (n: number) => {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() - n);
  return iso(d);
};
const dayKey = (offset: number) => {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
};

export const SEED_LEADS: Lead[] = [
  {
    id: 'lead_apex',
    name: 'Marcus Reed',
    company: 'Apex Traders',
    email: 'marcus@apextraders.example',
    phone: '—',
    dealValue: 48000,
    status: 'In Progress',
    salespersonId: 'sp_john',
    createdAt: daysAgo(18),
    followUpDate: dayKey(-2), // overdue
    calls: [
      {
        id: 'call_apex_1',
        startedAt: daysAgo(14),
        endedAt: daysAgo(14),
        durationSec: 42,
        outcome: 'No Answer',
        notes: 'Rang out. No voicemail set up.',
        salespersonId: 'sp_john',
      },
      {
        id: 'call_apex_2',
        startedAt: daysAgo(11),
        endedAt: daysAgo(11),
        durationSec: 68,
        outcome: 'Left Message',
        notes: 'Left a message with the gatekeeper.',
        salespersonId: 'sp_john',
      },
      {
        id: 'call_apex_3',
        startedAt: daysAgo(7),
        endedAt: daysAgo(7),
        durationSec: 95,
        outcome: 'No Answer',
        notes: 'Tried direct line, no answer.',
        salespersonId: 'sp_john',
      },
      {
        id: 'call_apex_4',
        startedAt: daysAgo(4),
        endedAt: daysAgo(4),
        durationSec: 120,
        outcome: 'Spoke - Not Interested',
        notes: 'Said timing is bad, asked to call back next quarter.',
        salespersonId: 'sp_john',
      },
    ],
    assignments: [
      { id: 'asg_apex_1', at: daysAgo(18), fromSalespersonId: null, toSalespersonId: 'sp_john', by: 'manager' },
    ],
    interventions: [],
  },
  {
    id: 'lead_nimbus',
    name: 'Aisha Khan',
    company: 'Nimbus Solutions',
    email: 'aisha@nimbussol.example',
    phone: '—',
    dealValue: 32000,
    status: 'Interested',
    salespersonId: 'sp_sarah',
    createdAt: daysAgo(6),
    followUpDate: dayKey(3), // future
    calls: [
      {
        id: 'call_nimbus_1',
        startedAt: daysAgo(1),
        endedAt: daysAgo(1),
        durationSec: 240,
        outcome: 'Spoke - Interested',
        notes: 'Great conversation. Wants a demo next week. Send pricing one-pager.',
        salespersonId: 'sp_sarah',
      },
    ],
    assignments: [
      { id: 'asg_nimbus_1', at: daysAgo(6), fromSalespersonId: null, toSalespersonId: 'sp_sarah', by: 'manager' },
    ],
    interventions: [],
  },
];
