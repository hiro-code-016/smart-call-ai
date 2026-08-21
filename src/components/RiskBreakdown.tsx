import type { Lead } from '@/types';
import { computeRisk, currency } from '@/lib/risk';
import { RiskBadge } from './Badges';
import { ShieldAlert, Calendar, TrendingDown, Phone, Clock } from 'lucide-react';

export function RiskBreakdown({ lead }: { lead: Lead }) {
  const risk = computeRisk(lead);
  const maxContribution = 100;

  return (
    <div className="glass p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert size={18} className="text-cyan-400" />
          <h3 className="text-base font-semibold text-slate-100">Risk Intelligence</h3>
        </div>
        <RiskBadge score={risk.score} />
      </div>

      <p className="mt-3 rounded-xl border border-cyan-400/20 bg-cyan-500/5 p-3 text-sm text-cyan-100">
        <span className="font-semibold text-cyan-300">Next best action: </span>
        {risk.recommendation}
      </p>

      <div className="mt-4 space-y-3">
        {risk.factors.map((f) => (
          <div key={f.key}>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-slate-300">
                {f.key === 'days' && <Calendar size={14} className="text-slate-500" />}
                {f.key === 'attempts' && <Phone size={14} className="text-slate-500" />}
                {f.key === 'neg' && <TrendingDown size={14} className="text-slate-500" />}
                {f.key === 'overdue' && <Clock size={14} className="text-slate-500" />}
                <span>{f.label}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <span className="tabular text-slate-200">{f.value}</span>
                <span className="text-slate-600">×</span>
                <span className="tabular">{f.weight.toFixed(1)}</span>
                <span className="text-slate-600">=</span>
                <span className="tabular font-semibold text-slate-100">+{f.contribution}</span>
              </div>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-500"
                style={{ width: `${Math.min(100, (f.contribution / maxContribution) * 100)}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500">{f.description}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/50 px-4 py-3">
        <span className="text-sm text-slate-400">Risk score</span>
        <span className="text-lg font-semibold tabular text-slate-50">{risk.score} / 100</span>
      </div>
    </div>
  );
}

export function RiskMiniBar({ lead }: { lead: Lead }) {
  const risk = computeRisk(lead);
  const color =
    risk.band === 'High'
      ? 'from-coral-500 to-coral-400'
      : risk.band === 'Medium'
        ? 'from-amber-500 to-amber-400'
        : 'from-emerald-500 to-emerald-400';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-12 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full bg-gradient-to-r ${color}`} style={{ width: `${risk.score}%` }} />
      </div>
      <span className="tabular text-xs font-semibold text-slate-300">{risk.score}</span>
    </div>
  );
}

export function DealValue({ lead }: { lead: Lead }) {
  return <span className="tabular text-sm font-medium text-slate-200">{currency(lead.dealValue)}</span>;
}
