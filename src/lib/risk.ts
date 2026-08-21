import type { Lead, Outcome } from '@/types';
import { NEGATIVE_OUTCOMES } from '@/types';

export function daysSince(dateISO: string | null, now = new Date()): number {
  if (!dateISO) return 0;
  const d = new Date(dateISO);
  if (Number.isNaN(d.getTime())) return 0;
  const ms = now.getTime() - d.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

export function todayISO(now = new Date()): string {
  return now.toISOString();
}

export function dateKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + days);
  return dateKey(d);
}

export function defaultFollowUpDays(outcome: Outcome): number | null {
  switch (outcome) {
    case 'No Answer':
      return 1;
    case 'Left Message':
      return 1;
    case 'Spoke - Interested':
      return 3;
    case 'Spoke - Not Interested':
      return 7;
    case 'Disqualified':
      return null;
    default:
      return null;
  }
}

export function isFollowUpOverdue(lead: Lead, now = new Date()): boolean {
  if (lead.status === 'Disqualified') return false;
  if (!lead.followUpDate) return false;
  const today = dateKey(now);
  return lead.followUpDate < today;
}

export function lastContactISO(lead: Lead): string | null {
  const ended = lead.calls
    .filter((c) => c.endedAt)
    .map((c) => c.endedAt as string)
    .sort();
  return ended.length ? ended[ended.length - 1] : null;
}

export function callAttemptsCount(lead: Lead): number {
  return lead.calls.filter((c) => c.endedAt).length;
}

export function negativeOutcomesRatio(lead: Lead): number {
  const completed = lead.calls.filter((c) => c.endedAt && c.outcome);
  if (completed.length === 0) return 0;
  const neg = completed.filter((c) => c.outcome && NEGATIVE_OUTCOMES.includes(c.outcome)).length;
  return neg / completed.length;
}

export interface RiskFactor {
  key: string;
  label: string;
  value: string;
  weight: number;
  contribution: number;
  description: string;
}

export interface RiskResult {
  score: number;
  band: 'Low' | 'Medium' | 'High';
  factors: RiskFactor[];
  recommendation: string;
  daysSinceLastContact: number;
  attempts: number;
  negativeRatio: number;
  overdue: boolean;
}

export function bandFor(score: number): 'Low' | 'Medium' | 'High' {
  if (score >= 60) return 'High';
  if (score >= 30) return 'Medium';
  return 'Low';
}

export function computeRisk(lead: Lead, now = new Date()): RiskResult {
  const days = daysSince(lastContactISO(lead), now);
  const attempts = callAttemptsCount(lead);
  const negRatio = negativeOutcomesRatio(lead);
  const overdue = isFollowUpOverdue(lead, now);

  const cDays = days * 2.0;
  const cAttempts = attempts * 4.0;
  const cNeg = negRatio * 40.0;
  const cOverdue = overdue ? 20.0 : 0;
  const raw = cDays + cAttempts + cNeg + cOverdue;
  const score = Math.min(100, Math.round(raw));
  const band = bandFor(score);

  const factors: RiskFactor[] = [
    {
      key: 'days',
      label: 'Days since last contact',
      value: `${days}d`,
      weight: 2.0,
      contribution: Math.round(cDays),
      description: 'Time elapsed since the most recent completed call.',
    },
    {
      key: 'attempts',
      label: 'Call attempts',
      value: `${attempts}`,
      weight: 4.0,
      contribution: Math.round(cAttempts),
      description: 'Total number of completed calls logged for this lead.',
    },
    {
      key: 'neg',
      label: 'Negative outcome ratio',
      value: `${Math.round(negRatio * 100)}%`,
      weight: 40.0,
      contribution: Math.round(cNeg),
      description: 'Share of completed calls ending in No Answer, Left Message, or Not Interested.',
    },
    {
      key: 'overdue',
      label: 'Follow-up overdue',
      value: overdue ? 'Yes' : 'No',
      weight: 20.0,
      contribution: Math.round(cOverdue),
      description: 'Scheduled follow-up date is in the past and lead is not disqualified.',
    },
  ];

  const recommendation = recommend(score, band, overdue, days, attempts, negRatio);
  return { score, band, factors, recommendation, daysSinceLastContact: days, attempts, negativeRatio: negRatio, overdue };
}

function recommend(
  score: number,
  band: 'Low' | 'Medium' | 'High',
  overdue: boolean,
  days: number,
  attempts: number,
  negRatio: number,
): string {
  if (band === 'Low') {
    if (attempts === 0) return 'New lead — make the first introductory call to establish contact.';
    return 'Healthy lead. Keep the scheduled follow-up and continue nurturing the relationship.';
  }
  if (band === 'Medium') {
    if (overdue) return 'Follow-up is overdue. Re-engage now with a tailored value proposition.';
    if (negRatio > 0.5) return 'Mixed outcomes. Try a new angle or decision-maker before next attempt.';
    return 'Moderate attention needed. Confirm the next follow-up date and keep momentum.';
  }
  // High
  if (overdue) return 'High risk and overdue. Escalate to manager and reassign or intervene immediately.';
  if (days >= 7) return 'Lead is going cold. Call today and reset the follow-up cadence.';
  if (negRatio >= 0.66) return 'Repeated negative outcomes. Re-qualify or change the outreach strategy.';
  return 'High risk. Prioritize a call and review the lead history before dialing.';
}

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function relativeTime(iso: string | null, now = new Date()): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const diff = now.getTime() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `${day}d ago`;
  return d.toLocaleDateString();
}

export function currency(n: number): string {
  return '$' + n.toLocaleString('en-US');
}
