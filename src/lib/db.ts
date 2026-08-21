import { PGlite } from '@electric-sql/pglite';
import type { AssignmentEvent, CallLog, Intervention, Lead, Salesperson } from '@/types';

const db = new PGlite('idb://smartcall-db');

export interface DbLead {
  id: string;
  name: string;
  company: string;
  email: string | null;
  phone: string | null;
  deal_value: number;
  status: string;
  salesperson_id: string;
  created_at: string;
  follow_up_date: string | null;
}

export interface DbCall {
  id: string;
  lead_id: string;
  salesperson_id: string;
  started_at: string;
  ended_at: string | null;
  duration_sec: number | null;
  outcome: string | null;
  notes: string;
}

export interface DbAssignment {
  id: string;
  lead_id: string;
  from_salesperson_id: string | null;
  to_salesperson_id: string;
  by: string;
  at: string;
}

export interface DbIntervention {
  id: string;
  lead_id: string;
  note: string;
  status: string;
  at: string;
  resolved_at: string | null;
  resolve_note: string | null;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS salespeople (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  initials TEXT NOT NULL,
  color TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS leads (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  deal_value INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'New',
  salesperson_id TEXT NOT NULL REFERENCES salespeople(id),
  created_at TEXT NOT NULL,
  follow_up_date TEXT
);

CREATE TABLE IF NOT EXISTS calls (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  salesperson_id TEXT NOT NULL,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  duration_sec INTEGER,
  outcome TEXT,
  notes TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  from_salesperson_id TEXT,
  to_salesperson_id TEXT NOT NULL,
  by TEXT NOT NULL DEFAULT 'manager',
  at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS interventions (
  id TEXT PRIMARY KEY,
  lead_id TEXT NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  at TEXT NOT NULL,
  resolved_at TEXT,
  resolve_note TEXT
);

CREATE INDEX IF NOT EXISTS idx_calls_lead_id ON calls(lead_id);
CREATE INDEX IF NOT EXISTS idx_assignments_lead_id ON assignments(lead_id);
CREATE INDEX IF NOT EXISTS idx_interventions_lead_id ON interventions(lead_id);
`;

let initialized = false;
let initPromise: Promise<void> | null = null;

export async function initDb(): Promise<void> {
  if (initialized) return;
  if (initPromise) return initPromise;
  initPromise = (async () => {
    await db.exec(SCHEMA);
    initialized = true;
  })();
  return initPromise;
}

export async function isSeeded(): Promise<boolean> {
  await initDb();
  const result = await db.query<{ count: number }>('SELECT COUNT(*) as count FROM salespeople');
  return (result.rows[0]?.count ?? 0) > 0;
}

export async function loadSalespeople(): Promise<Salesperson[]> {
  await initDb();
  const result = await db.query<Salesperson>('SELECT id, name, initials, color FROM salespeople ORDER BY name');
  return result.rows;
}

export async function loadLeads(): Promise<Lead[]> {
  await initDb();
  const leadRows = await db.query<DbLead>(`
    SELECT id, name, company, email, phone, deal_value, status, salesperson_id, created_at, follow_up_date
    FROM leads ORDER BY created_at DESC
  `);

  const callRows = await db.query<DbCall>('SELECT * FROM calls ORDER BY started_at ASC');
  const asgRows = await db.query<DbAssignment>('SELECT * FROM assignments ORDER BY at ASC');
  const ivRows = await db.query<DbIntervention>('SELECT * FROM interventions ORDER BY at ASC');

  return leadRows.rows.map((row) => mapLead(row, callRows.rows, asgRows.rows, ivRows.rows));
}

function mapLead(
  row: DbLead,
  calls: DbCall[],
  assignments: DbAssignment[],
  interventions: DbIntervention[],
): Lead {
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    dealValue: row.deal_value,
    status: row.status as Lead['status'],
    salespersonId: row.salesperson_id,
    createdAt: row.created_at,
    followUpDate: row.follow_up_date ?? null,
    calls: calls
      .filter((c) => c.lead_id === row.id)
      .map((c) => ({
        id: c.id,
        startedAt: c.started_at,
        endedAt: c.ended_at,
        durationSec: c.duration_sec,
        outcome: c.outcome as CallLog['outcome'],
        notes: c.notes,
        salespersonId: c.salesperson_id,
      })),
    assignments: assignments
      .filter((a) => a.lead_id === row.id)
      .map((a) => ({
        id: a.id,
        at: a.at,
        fromSalespersonId: a.from_salesperson_id,
        toSalespersonId: a.to_salesperson_id,
        by: a.by as AssignmentEvent['by'],
      })),
    interventions: interventions
      .filter((i) => i.lead_id === row.id)
      .map((i) => ({
        id: i.id,
        at: i.at,
        note: i.note,
        status: i.status as Intervention['status'],
        resolvedAt: i.resolved_at ?? undefined,
        resolveNote: i.resolve_note ?? undefined,
      })),
  };
}

export async function insertLead(lead: Lead): Promise<void> {
  await initDb();
  await db.query(
    `INSERT INTO leads (id, name, company, email, phone, deal_value, status, salesperson_id, created_at, follow_up_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [lead.id, lead.name, lead.company, lead.email ?? null, lead.phone ?? null, lead.dealValue, lead.status, lead.salespersonId, lead.createdAt, lead.followUpDate],
  );
  for (const a of lead.assignments) {
    await db.query(
      `INSERT INTO assignments (id, lead_id, from_salesperson_id, to_salesperson_id, by, at) VALUES ($1, $2, $3, $4, $5, $6)`,
      [a.id, lead.id, a.fromSalespersonId, a.toSalespersonId, a.by, a.at],
    );
  }
}

export async function updateLeadStatus(leadId: string, status: string, followUpDate: string | null): Promise<void> {
  await initDb();
  await db.query('UPDATE leads SET status = $1, follow_up_date = $2 WHERE id = $3', [status, followUpDate, leadId]);
}

export async function updateFollowUpDate(leadId: string, date: string | null): Promise<void> {
  await initDb();
  await db.query('UPDATE leads SET follow_up_date = $1 WHERE id = $2', [date, leadId]);
}

export async function updateLeadSalesperson(leadId: string, salespersonId: string): Promise<void> {
  await initDb();
  await db.query('UPDATE leads SET salesperson_id = $1 WHERE id = $2', [salespersonId, leadId]);
}

export async function insertCall(call: CallLog & { leadId: string }): Promise<void> {
  await initDb();
  await db.query(
    `INSERT INTO calls (id, lead_id, salesperson_id, started_at, ended_at, duration_sec, outcome, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [call.id, call.leadId, call.salespersonId, call.startedAt, call.endedAt, call.durationSec, call.outcome, call.notes],
  );
}

export async function updateCall(
  callId: string,
  endedAt: string,
  durationSec: number,
  outcome: string,
  notes: string,
): Promise<void> {
  await initDb();
  await db.query(
    'UPDATE calls SET ended_at = $1, duration_sec = $2, outcome = $3, notes = $4 WHERE id = $5',
    [endedAt, durationSec, outcome, notes, callId],
  );
}

export async function insertAssignment(event: AssignmentEvent & { leadId: string }): Promise<void> {
  await initDb();
  await db.query(
    'INSERT INTO assignments (id, lead_id, from_salesperson_id, to_salesperson_id, by, at) VALUES ($1, $2, $3, $4, $5, $6)',
    [event.id, event.leadId, event.fromSalespersonId, event.toSalespersonId, event.by, event.at],
  );
}

export async function insertIntervention(iv: Intervention & { leadId: string }): Promise<void> {
  await initDb();
  await db.query(
    'INSERT INTO interventions (id, lead_id, note, status, at) VALUES ($1, $2, $3, $4, $5)',
    [iv.id, iv.leadId, iv.note, iv.status, iv.at],
  );
}

export async function resolveIntervention(interventionId: string, resolvedAt: string, resolveNote: string): Promise<void> {
  await initDb();
  await db.query(
    'UPDATE interventions SET status = $1, resolved_at = $2, resolve_note = $3 WHERE id = $4',
    ['resolved', resolvedAt, resolveNote, interventionId],
  );
}

export async function clearAllData(): Promise<void> {
  await initDb();
  await db.exec('DELETE FROM interventions');
  await db.exec('DELETE FROM assignments');
  await db.exec('DELETE FROM calls');
  await db.exec('DELETE FROM leads');
  await db.exec('DELETE FROM salespeople');
}

export async function seedDatabase(salespeople: Salesperson[], leads: Lead[]): Promise<void> {
  await initDb();
  for (const sp of salespeople) {
    await db.query(
      'INSERT INTO salespeople (id, name, initials, color) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING',
      [sp.id, sp.name, sp.initials, sp.color],
    );
  }
  for (const lead of leads) {
    await insertLead(lead);
    for (const call of lead.calls) {
      await insertCall({ ...call, leadId: lead.id });
    }
    for (const iv of lead.interventions) {
      await insertIntervention({ ...iv, leadId: lead.id });
    }
  }
}
