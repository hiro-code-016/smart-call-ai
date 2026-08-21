import type { Lead, Salesperson } from '@/types';

export const SALESPEOPLE: Salesperson[] = [
  { id: 'sp_john', name: 'John Carter', initials: 'JC', color: 'from-brand-500 to-brand-700' },
  { id: 'sp_sarah', name: 'Sarah Lee', initials: 'SL', color: 'from-cyan-500 to-cyan-600' },
  { id: 'sp_mike', name: 'Mike Torres', initials: 'MT', color: 'from-emerald-500 to-emerald-600' },
  { id: 'sp_priya', name: 'Priya Sharma', initials: 'PS', color: 'from-amber-500 to-amber-600' },
];

const now = new Date();
const iso = (d: Date) => d.toISOString();
const daysAgo = (n: number) => {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() - n);
  return iso(d);
};
const hoursAgo = (n: number) => {
  const d = new Date(now);
  d.setUTCHours(d.getUTCHours() - n);
  return iso(d);
};
const dayKey = (offset: number) => {
  const d = new Date(now);
  d.setUTCDate(d.getUTCDate() + offset);
  return d.toISOString().slice(0, 10);
};

export const SEED_LEADS: Lead[] = [
  // Lead 1 — Apex Traders (high risk, overdue, John)
  {
    id: 'lead_apex',
    name: 'Marcus Reed',
    company: 'Apex Traders',
    email: 'marcus@apextraders.example',
    phone: '+1-555-0101',
    dealValue: 48000,
    status: 'In Progress',
    salespersonId: 'sp_john',
    createdAt: daysAgo(18),
    followUpDate: dayKey(-2),
    calls: [
      { id: 'call_apex_1', startedAt: daysAgo(14), endedAt: daysAgo(14), durationSec: 42, outcome: 'No Answer', notes: 'Rang out. No voicemail set up.', salespersonId: 'sp_john' },
      { id: 'call_apex_2', startedAt: daysAgo(11), endedAt: daysAgo(11), durationSec: 68, outcome: 'Left Message', notes: 'Left a message with the gatekeeper.', salespersonId: 'sp_john' },
      { id: 'call_apex_3', startedAt: daysAgo(7), endedAt: daysAgo(7), durationSec: 95, outcome: 'No Answer', notes: 'Tried direct line, no answer.', salespersonId: 'sp_john' },
      { id: 'call_apex_4', startedAt: daysAgo(4), endedAt: daysAgo(4), durationSec: 120, outcome: 'Spoke - Not Interested', notes: 'Said timing is bad, asked to call back next quarter.', salespersonId: 'sp_john' },
    ],
    assignments: [{ id: 'asg_apex_1', at: daysAgo(18), fromSalespersonId: null, toSalespersonId: 'sp_john', by: 'manager' }],
    interventions: [],
  },
  // Lead 2 — Nimbus Solutions (interested, Sarah)
  {
    id: 'lead_nimbus',
    name: 'Aisha Khan',
    company: 'Nimbus Solutions',
    email: 'aisha@nimbussol.example',
    phone: '+1-555-0102',
    dealValue: 32000,
    status: 'Interested',
    salespersonId: 'sp_sarah',
    createdAt: daysAgo(6),
    followUpDate: dayKey(3),
    calls: [
      { id: 'call_nimbus_1', startedAt: daysAgo(1), endedAt: daysAgo(1), durationSec: 240, outcome: 'Spoke - Interested', notes: 'Great conversation. Wants a demo next week. Send pricing one-pager.', salespersonId: 'sp_sarah' },
    ],
    assignments: [{ id: 'asg_nimbus_1', at: daysAgo(6), fromSalespersonId: null, toSalespersonId: 'sp_sarah', by: 'manager' }],
    interventions: [],
  },
  // Lead 3 — Vertex Logistics (high risk, Mike, many attempts)
  {
    id: 'lead_vertex',
    name: 'David Chen',
    company: 'Vertex Logistics',
    email: 'dchen@vertexlog.example',
    phone: '+1-555-0103',
    dealValue: 65000,
    status: 'In Progress',
    salespersonId: 'sp_mike',
    createdAt: daysAgo(22),
    followUpDate: dayKey(-5),
    calls: [
      { id: 'call_vertex_1', startedAt: daysAgo(20), endedAt: daysAgo(20), durationSec: 30, outcome: 'No Answer', notes: 'No answer, no voicemail.', salespersonId: 'sp_mike' },
      { id: 'call_vertex_2', startedAt: daysAgo(17), endedAt: daysAgo(17), durationSec: 55, outcome: 'No Answer', notes: 'Tried again, still no answer.', salespersonId: 'sp_mike' },
      { id: 'call_vertex_3', startedAt: daysAgo(14), endedAt: daysAgo(14), durationSec: 90, outcome: 'Left Message', notes: 'Left voicemail with callback number.', salespersonId: 'sp_mike' },
      { id: 'call_vertex_4', startedAt: daysAgo(10), endedAt: daysAgo(10), durationSec: 110, outcome: 'No Answer', notes: 'Still no response. Getting concerned.', salespersonId: 'sp_mike' },
      { id: 'call_vertex_5', startedAt: daysAgo(6), endedAt: daysAgo(6), durationSec: 75, outcome: 'No Answer', notes: 'Fifth attempt. May need reassignment.', salespersonId: 'sp_mike' },
    ],
    assignments: [{ id: 'asg_vertex_1', at: daysAgo(22), fromSalespersonId: null, toSalespersonId: 'sp_mike', by: 'manager' }],
    interventions: [{ id: 'iv_vertex_1', at: daysAgo(5), note: '5 call attempts with no contact. Consider reassigning or changing outreach strategy.', status: 'open' }],
  },
  // Lead 4 — Bright Retail (interested, Priya, high value)
  {
    id: 'lead_bright',
    name: 'Olivia Park',
    company: 'Bright Retail Co',
    email: 'olivia@brightretail.example',
    phone: '+1-555-0104',
    dealValue: 85000,
    status: 'Interested',
    salespersonId: 'sp_priya',
    createdAt: daysAgo(9),
    followUpDate: dayKey(1),
    calls: [
      { id: 'call_bright_1', startedAt: daysAgo(8), endedAt: daysAgo(8), durationSec: 180, outcome: 'Spoke - Interested', notes: 'Very interested in enterprise plan. Wants ROI calculation.', salespersonId: 'sp_priya' },
      { id: 'call_bright_2', startedAt: daysAgo(3), endedAt: daysAgo(3), durationSec: 320, outcome: 'Spoke - Interested', notes: 'Follow-up call. Reviewed ROI. Sending contract draft.', salespersonId: 'sp_priya' },
    ],
    assignments: [{ id: 'asg_bright_1', at: daysAgo(9), fromSalespersonId: null, toSalespersonId: 'sp_priya', by: 'manager' }],
    interventions: [],
  },
  // Lead 5 — Summit Foods (new lead, John)
  {
    id: 'lead_summit',
    name: 'Robert Hayes',
    company: 'Summit Foods Inc',
    email: 'rhayes@summitfoods.example',
    phone: '+1-555-0105',
    dealValue: 28000,
    status: 'New',
    salespersonId: 'sp_john',
    createdAt: daysAgo(1),
    followUpDate: null,
    calls: [],
    assignments: [{ id: 'asg_summit_1', at: daysAgo(1), fromSalespersonId: null, toSalespersonId: 'sp_john', by: 'manager' }],
    interventions: [],
  },
  // Lead 6 — Crestline Media (disqualified, Sarah)
  {
    id: 'lead_crestline',
    name: 'Emily Watson',
    company: 'Crestline Media',
    email: 'emily@crestline.example',
    phone: '+1-555-0106',
    dealValue: 15000,
    status: 'Disqualified',
    salespersonId: 'sp_sarah',
    createdAt: daysAgo(15),
    followUpDate: null,
    calls: [
      { id: 'call_crestline_1', startedAt: daysAgo(13), endedAt: daysAgo(13), durationSec: 60, outcome: 'No Answer', notes: 'No answer on first attempt.', salespersonId: 'sp_sarah' },
      { id: 'call_crestline_2', startedAt: daysAgo(10), endedAt: daysAgo(10), durationSec: 150, outcome: 'Disqualified', notes: 'Company already using competitor with long-term contract. Not a fit.', salespersonId: 'sp_sarah' },
    ],
    assignments: [{ id: 'asg_crestline_1', at: daysAgo(15), fromSalespersonId: null, toSalespersonId: 'sp_sarah', by: 'manager' }],
    interventions: [],
  },
  // Lead 7 — Delta Construction (in progress, Mike, recent call today)
  {
    id: 'lead_delta',
    name: 'James Foster',
    company: 'Delta Construction',
    email: 'jfoster@deltaconst.example',
    phone: '+1-555-0107',
    dealValue: 52000,
    status: 'In Progress',
    salespersonId: 'sp_mike',
    createdAt: daysAgo(5),
    followUpDate: dayKey(2),
    calls: [
      { id: 'call_delta_1', startedAt: daysAgo(4), endedAt: daysAgo(4), durationSec: 85, outcome: 'No Answer', notes: 'First attempt, no answer.', salespersonId: 'sp_mike' },
      { id: 'call_delta_2', startedAt: hoursAgo(3), endedAt: hoursAgo(3), durationSec: 195, outcome: 'Left Message', notes: 'Left message with assistant. They said he would call back.', salespersonId: 'sp_mike' },
    ],
    assignments: [{ id: 'asg_delta_1', at: daysAgo(5), fromSalespersonId: null, toSalespersonId: 'sp_mike', by: 'manager' }],
    interventions: [],
  },
  // Lead 8 — Pinnacle Health (interested, Priya, reassigned from John)
  {
    id: 'lead_pinnacle',
    name: 'Dr. Lisa Nguyen',
    company: 'Pinnacle Health Systems',
    email: 'lnguyen@pinnaclehealth.example',
    phone: '+1-555-0108',
    dealValue: 95000,
    status: 'Interested',
    salespersonId: 'sp_priya',
    createdAt: daysAgo(20),
    followUpDate: dayKey(4),
    calls: [
      { id: 'call_pinnacle_1', startedAt: daysAgo(18), endedAt: daysAgo(18), durationSec: 40, outcome: 'No Answer', notes: 'No answer. Was assigned to John at this point.', salespersonId: 'sp_john' },
      { id: 'call_pinnacle_2', startedAt: daysAgo(12), endedAt: daysAgo(12), durationSec: 210, outcome: 'Spoke - Interested', notes: 'Reassigned to Priya. Great initial conversation. Wants case studies.', salespersonId: 'sp_priya' },
      { id: 'call_pinnacle_3', startedAt: daysAgo(5), endedAt: daysAgo(5), durationSec: 280, outcome: 'Spoke - Interested', notes: 'Reviewed case studies. Moving toward proposal stage.', salespersonId: 'sp_priya' },
    ],
    assignments: [
      { id: 'asg_pinnacle_1', at: daysAgo(20), fromSalespersonId: null, toSalespersonId: 'sp_john', by: 'manager' },
      { id: 'asg_pinnacle_2', at: daysAgo(14), fromSalespersonId: 'sp_john', toSalespersonId: 'sp_priya', by: 'manager' },
    ],
    interventions: [],
  },
  // Lead 9 — Orbit Tech (not interested, John)
  {
    id: 'lead_orbit',
    name: 'Kevin Liu',
    company: 'Orbit Technologies',
    email: 'kliu@orbittech.example',
    phone: '+1-555-0109',
    dealValue: 38000,
    status: 'Not Interested',
    salespersonId: 'sp_john',
    createdAt: daysAgo(12),
    followUpDate: dayKey(5),
    calls: [
      { id: 'call_orbit_1', startedAt: daysAgo(10), endedAt: daysAgo(10), durationSec: 130, outcome: 'Spoke - Not Interested', notes: 'Not interested right now. Budget constraints. Follow up next quarter.', salespersonId: 'sp_john' },
    ],
    assignments: [{ id: 'asg_orbit_1', at: daysAgo(12), fromSalespersonId: null, toSalespersonId: 'sp_john', by: 'manager' }],
    interventions: [],
  },
  // Lead 10 — Meridian Capital (new, Sarah, just assigned)
  {
    id: 'lead_meridian',
    name: 'Sophia Martinez',
    company: 'Meridian Capital',
    email: 'smartinez@meridiancap.example',
    phone: '+1-555-0110',
    dealValue: 72000,
    status: 'New',
    salespersonId: 'sp_sarah',
    createdAt: hoursAgo(6),
    followUpDate: null,
    calls: [],
    assignments: [{ id: 'asg_meridian_1', at: hoursAgo(6), fromSalespersonId: null, toSalespersonId: 'sp_sarah', by: 'manager' }],
    interventions: [],
  },
  // Lead 11 — Quantum Labs (in progress, Priya, overdue follow-up)
  {
    id: 'lead_quantum',
    name: 'Alex Rivera',
    company: 'Quantum Labs',
    email: 'arivera@quantumlabs.example',
    phone: '+1-555-0111',
    dealValue: 58000,
    status: 'In Progress',
    salespersonId: 'sp_priya',
    createdAt: daysAgo(16),
    followUpDate: dayKey(-1),
    calls: [
      { id: 'call_quantum_1', startedAt: daysAgo(15), endedAt: daysAgo(15), durationSec: 70, outcome: 'No Answer', notes: 'No answer on first attempt.', salespersonId: 'sp_priya' },
      { id: 'call_quantum_2', startedAt: daysAgo(12), endedAt: daysAgo(12), durationSec: 165, outcome: 'Left Message', notes: 'Left voicemail about our solution.', salespersonId: 'sp_priya' },
      { id: 'call_quantum_3', startedAt: daysAgo(8), endedAt: daysAgo(8), durationSec: 220, outcome: 'Spoke - Interested', notes: 'Good conversation, wants more info. Sent brochure.', salespersonId: 'sp_priya' },
    ],
    assignments: [{ id: 'asg_quantum_1', at: daysAgo(16), fromSalespersonId: null, toSalespersonId: 'sp_priya', by: 'manager' }],
    interventions: [],
  },
  // Lead 12 — Beacon Energy (in progress, Mike, called today)
  {
    id: 'lead_beacon',
    name: 'Thomas Wright',
    company: 'Beacon Energy',
    email: 'twright@beaconenergy.example',
    phone: '+1-555-0112',
    dealValue: 42000,
    status: 'In Progress',
    salespersonId: 'sp_mike',
    createdAt: daysAgo(8),
    followUpDate: dayKey(1),
    calls: [
      { id: 'call_beacon_1', startedAt: daysAgo(6), endedAt: daysAgo(6), durationSec: 50, outcome: 'No Answer', notes: 'No answer.', salespersonId: 'sp_mike' },
      { id: 'call_beacon_2', startedAt: hoursAgo(1), endedAt: hoursAgo(1), durationSec: 175, outcome: 'Spoke - Interested', notes: 'Spoke with Thomas. Interested in learning more. Sending demo link.', salespersonId: 'sp_mike' },
    ],
    assignments: [{ id: 'asg_beacon_1', at: daysAgo(8), fromSalespersonId: null, toSalespersonId: 'sp_mike', by: 'manager' }],
    interventions: [],
  },
];
