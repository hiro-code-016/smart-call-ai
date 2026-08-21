import type { ReactNode } from 'react';
import type { LeadStatus, Outcome } from '@/types';
import { bandFor } from '@/lib/risk';

export function StatusBadge({ status }: { status: LeadStatus }) {
  const map: Record<LeadStatus, string> = {
    New: 'bg-brand-500/15 text-brand-200 border border-brand-400/30',
    'In Progress': 'bg-amber-500/15 text-amber-300 border border-amber-400/30',
    Interested: 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30',
    'Not Interested': 'bg-slate-500/15 text-slate-300 border border-slate-400/30',
    Disqualified: 'bg-coral-500/15 text-coral-300 border border-coral-400/30',
  };
  return <span className={`chip ${map[status]}`}>{status}</span>;
}

export function OutcomeBadge({ outcome }: { outcome: Outcome }) {
  const negative: Outcome[] = ['No Answer', 'Left Message', 'Spoke - Not Interested'];
  const positive: Outcome[] = ['Spoke - Interested'];
  let cls = 'bg-slate-500/15 text-slate-300 border border-slate-400/30';
  if (negative.includes(outcome)) cls = 'bg-coral-500/15 text-coral-300 border border-coral-400/30';
  else if (positive.includes(outcome)) cls = 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30';
  else if (outcome === 'Disqualified') cls = 'bg-coral-600/20 text-coral-300 border border-coral-500/40';
  return <span className={`chip ${cls}`}>{outcome}</span>;
}

export function RiskBadge({ score }: { score: number }) {
  const band = bandFor(score);
  const cls =
    band === 'High'
      ? 'bg-coral-500/15 text-coral-300 border border-coral-400/30'
      : band === 'Medium'
        ? 'bg-amber-500/15 text-amber-300 border border-amber-400/30'
        : 'bg-emerald-500/15 text-emerald-300 border border-emerald-400/30';
  return (
    <span className={`chip ${cls}`}>
      <span className="tabular font-semibold">{score}</span>
      <span className="opacity-60">·</span>
      <span>{band}</span>
    </span>
  );
}

export function UrgencyDot({ score }: { score: number }) {
  const band = bandFor(score);
  const color = band === 'High' ? 'bg-coral-500' : band === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500';
  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      {band === 'High' && (
        <span className={`absolute inline-flex h-full w-full rounded-full ${color} opacity-60 animate-ring`} />
      )}
      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${color}`} />
    </span>
  );
}

export function Avatar({ initials, color, size = 'md' }: { initials: string; color: string; size?: 'sm' | 'md' | 'lg' }) {
  const sz = size === 'sm' ? 'h-7 w-7 text-xs' : size === 'lg' ? 'h-12 w-12 text-base' : 'h-9 w-9 text-sm';
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br ${color} ${sz} font-semibold text-white shadow-glow`}
    >
      {initials}
    </span>
  );
}

export function SectionTitle({ title, subtitle, icon }: { title: string; subtitle?: string; icon?: ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      {icon && (
        <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-brand-300">
          {icon}
        </div>
      )}
      <div>
        <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, subtitle }: { icon?: ReactNode; title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      {icon && <div className="text-slate-500">{icon}</div>}
      <p className="text-sm font-medium text-slate-300">{title}</p>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
    </div>
  );
}
