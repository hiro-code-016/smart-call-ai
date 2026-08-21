import { useMemo } from 'react';
import { useStore } from '@/store';
import { computeRisk, currency, formatDuration } from '@/lib/risk';
import { Avatar, EmptyState } from './Badges';
import { KpiCard } from './KpiCard';
import type { Outcome } from '@/types';
import { NEGATIVE_OUTCOMES, OUTCOMES } from '@/types';
import {
  BarChart3,
  Phone,
  PhoneCall,
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  Users,
  PieChart,
  Activity,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

const OUTCOME_COLORS: Record<Outcome, string> = {
  'No Answer': '#64748b',
  'Left Message': '#fbbf4a',
  'Spoke - Interested': '#10c880',
  'Spoke - Not Interested': '#f6544a',
  Disqualified: '#e0352b',
};

export function Analytics() {
  const { leads, salespeople } = useStore();

  const allCalls = useMemo(
    () => leads.flatMap((l) => l.calls.filter((c) => c.endedAt).map((c) => ({ call: c, lead: l }))),
    [leads],
  );

  const totalCalls = allCalls.length;
  const connectedCalls = allCalls.filter((c) => c.call.outcome?.startsWith('Spoke')).length;
  const interestedCalls = allCalls.filter((c) => c.call.outcome === 'Spoke - Interested').length;
  const avgDuration = totalCalls
    ? Math.round(allCalls.reduce((s, c) => s + (c.call.durationSec ?? 0), 0) / totalCalls)
    : 0;
  const connectionRate = totalCalls ? Math.round((connectedCalls / totalCalls) * 100) : 0;
  const conversionRate = totalCalls ? Math.round((interestedCalls / totalCalls) * 100) : 0;

  const last14Days = useMemo(() => {
    const days: { dateKey: string; dateLabel: string; calls: number; connected: number }[] = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setUTCDate(d.getUTCDate() - i);
      const key = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
      const dayCalls = allCalls.filter((c) => c.call.endedAt!.slice(0, 10) === key);
      days.push({
        dateKey: key,
        dateLabel: label,
        calls: dayCalls.length,
        connected: dayCalls.filter((c) => c.call.outcome?.startsWith('Spoke')).length,
      });
    }
    return days;
  }, [allCalls]);

  const maxDailyCalls = Math.max(1, ...last14Days.map((d) => d.calls));

  const outcomeCounts = useMemo(() => {
    const counts: Record<Outcome, number> = {
      'No Answer': 0,
      'Left Message': 0,
      'Spoke - Interested': 0,
      'Spoke - Not Interested': 0,
      Disqualified: 0,
    };
    allCalls.forEach((c) => {
      if (c.call.outcome) counts[c.call.outcome]++;
    });
    return counts;
  }, [allCalls]);

  const repStats = useMemo(() => {
    return salespeople.map((sp) => {
      const repCalls = allCalls.filter((c) => c.call.salespersonId === sp.id);
      const repLeads = leads.filter((l) => l.salespersonId === sp.id);
      const connected = repCalls.filter((c) => c.call.outcome?.startsWith('Spoke')).length;
      const interested = repCalls.filter((c) => c.call.outcome === 'Spoke - Interested').length;
      const neg = repCalls.filter((c) => c.call.outcome && NEGATIVE_OUTCOMES.includes(c.call.outcome)).length;
      const avgDur = repCalls.length
        ? Math.round(repCalls.reduce((s, c) => s + (c.call.durationSec ?? 0), 0) / repCalls.length)
        : 0;
      const conversionRate = repCalls.length ? Math.round((interested / repCalls.length) * 100) : 0;
      const connRate = repCalls.length ? Math.round((connected / repCalls.length) * 100) : 0;
      const pipelineValue = repLeads
        .filter((l) => l.status === 'Interested' || l.status === 'In Progress')
        .reduce((s, l) => s + l.dealValue, 0);
      return { sp, totalCalls: repCalls.length, connected, interested, neg, avgDur, conversionRate, connRate, pipelineValue, leadCount: repLeads.length };
    });
  }, [allCalls, leads, salespeople]);

  const statusCounts = useMemo(() => {
    const counts = { New: 0, 'In Progress': 0, Interested: 0, 'Not Interested': 0, Disqualified: 0 };
    leads.forEach((l) => { counts[l.status]++; });
    return counts;
  }, [leads]);

  const funnelStages = [
    { label: 'Total Leads', value: leads.length, color: '#5b5ff0' },
    { label: 'Calls Made', value: leads.filter((l) => l.calls.some((c) => c.endedAt)).length, color: '#19c8d8' },
    { label: 'Connected', value: leads.filter((l) => l.calls.some((c) => c.outcome?.startsWith('Spoke'))).length, color: '#fbbf4a' },
    { label: 'Interested', value: statusCounts.Interested, color: '#10c880' },
  ];
  const funnelMax = Math.max(1, ...funnelStages.map((s) => s.value));

  const maxRepCalls = Math.max(1, ...repStats.map((r) => r.totalCalls));

  if (totalCalls === 0 && leads.length === 0) {
    return (
      <div className="glass p-10">
        <EmptyState
          icon={<BarChart3 size={24} />}
          title="No data to analyze yet"
          subtitle="Create leads and log calls to see analytics."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Total Calls" value={totalCalls} sub="All completed calls" tone="brand" icon={<PhoneCall size={18} />} />
        <KpiCard label="Connection Rate" value={`${connectionRate}%`} sub={`${connectedCalls} connected`} tone="cyan" icon={<Phone size={18} />} />
        <KpiCard label="Conversion Rate" value={`${conversionRate}%`} sub={`${interestedCalls} interested`} tone="emerald" icon={<Target size={18} />} />
        <KpiCard label="Avg Duration" value={formatDuration(avgDuration)} sub="Per call" tone="amber" icon={<Clock size={18} />} />
        <KpiCard label="Active Pipeline" value={currency(repStats.reduce((s, r) => s + r.pipelineValue, 0))} sub="Interested + in progress" tone="coral" icon={<TrendingUp size={18} />} />
      </div>

      {/* Call activity chart */}
      <div className="glass p-5">
        <div className="mb-5 flex items-center gap-2">
          <Activity size={18} className="text-cyan-400" />
          <h3 className="text-base font-semibold text-slate-100">Call Activity — Last 14 Days</h3>
        </div>
        <div className="flex items-end gap-1.5 sm:gap-2.5" style={{ height: 200 }}>
          {last14Days.map((d) => {
            const totalH = (d.calls / maxDailyCalls) * 100;
            const connH = d.calls > 0 ? (d.connected / d.calls) * totalH : 0;
            return (
              <div key={d.dateKey} className="group relative flex flex-1 flex-col items-center justify-end" style={{ height: '100%' }}>
                <div className="absolute -top-8 z-10 hidden whitespace-nowrap rounded-lg border border-white/10 bg-ink-900/95 px-2.5 py-1.5 text-xs text-slate-200 shadow-glass group-hover:block">
                  <span className="font-medium text-slate-100">{d.calls}</span> calls · {d.connected} connected
                </div>
                <div className="relative flex w-full max-w-[36px] flex-col justify-end" style={{ height: `${totalH}%`, minHeight: d.calls > 0 ? 4 : 0 }}>
                  <div
                    className="w-full rounded-t-md bg-brand-500/30 transition-all duration-300 group-hover:bg-brand-500/50"
                    style={{ height: `${totalH > 0 ? 100 - (connH / totalH) * 100 : 0}%` }}
                  />
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-cyan-500 to-cyan-400 transition-all duration-300 group-hover:from-cyan-400 group-hover:to-cyan-300"
                    style={{ height: `${totalH > 0 ? (connH / totalH) * 100 : 0}%` }}
                  />
                </div>
                <span className="mt-2 text-[10px] text-slate-500">{d.dateLabel.split(' ')[1]}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-cyan-400" /> Connected</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-brand-500/50" /> Not connected</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* Outcome distribution */}
        <div className="glass p-5">
          <div className="mb-5 flex items-center gap-2">
            <PieChart size={18} className="text-brand-300" />
            <h3 className="text-base font-semibold text-slate-100">Call Outcome Distribution</h3>
          </div>
          <div className="flex items-center gap-6">
            <DonutChart data={OUTCOMES.map((o) => ({ label: o, value: outcomeCounts[o], color: OUTCOME_COLORS[o] }))} />
            <div className="flex-1 space-y-2.5">
              {OUTCOMES.map((o) => {
                const pct = totalCalls ? Math.round((outcomeCounts[o] / totalCalls) * 100) : 0;
                return (
                  <div key={o} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-300">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: OUTCOME_COLORS[o] }} />
                      {o}
                    </span>
                    <span className="tabular text-slate-400">{outcomeCounts[o]} <span className="text-slate-600">({pct}%)</span></span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Conversion funnel */}
        <div className="glass p-5">
          <div className="mb-5 flex items-center gap-2">
            <Target size={18} className="text-emerald-400" />
            <h3 className="text-base font-semibold text-slate-100">Conversion Funnel</h3>
          </div>
          <div className="space-y-3">
            {funnelStages.map((stage, i) => {
              const width = (stage.value / funnelMax) * 100;
              const prevValue = i > 0 ? funnelStages[i - 1].value : stage.value;
              const dropOff = i > 0 && prevValue > 0 ? Math.round((1 - stage.value / prevValue) * 100) : 0;
              return (
                <div key={stage.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-slate-300">{stage.label}</span>
                    <span className="tabular text-slate-400">
                      {stage.value}
                      {i > 0 && dropOff > 0 && <span className="ml-2 text-coral-400">−{dropOff}%</span>}
                    </span>
                  </div>
                  <div className="h-7 w-full overflow-hidden rounded-lg bg-white/5">
                    <div
                      className="h-full rounded-lg transition-all duration-500"
                      style={{ width: `${width}%`, background: `linear-gradient(90deg, ${stage.color}80, ${stage.color})` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/5 p-3 text-sm text-emerald-100">
            <CheckCircle2 size={15} className="text-emerald-400" />
            <span>
              <span className="font-semibold text-emerald-300">{conversionRate}%</span> of all calls result in interest.
              {connectionRate > 50 && ' Strong connection rate.'}
            </span>
          </div>
        </div>
      </div>

      {/* Rep performance comparison */}
      <div className="glass p-5">
        <div className="mb-5 flex items-center gap-2">
          <Users size={18} className="text-cyan-400" />
          <h3 className="text-base font-semibold text-slate-100">Salesperson Performance Comparison</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="pb-3 pr-4 font-medium">Rep</th>
                <th className="pb-3 pr-4 font-medium">Leads</th>
                <th className="pb-3 pr-4 font-medium">Calls</th>
                <th className="pb-3 pr-4 font-medium">Conn. Rate</th>
                <th className="pb-3 pr-4 font-medium">Conversion</th>
                <th className="pb-3 pr-4 font-medium">Avg Duration</th>
                <th className="pb-3 pr-4 font-medium">Pipeline</th>
                <th className="pb-3 font-medium">Call Volume</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {repStats.map((r) => (
                <tr key={r.sp.id} className="table-row-hover">
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={r.sp.initials} color={r.sp.color} size="sm" />
                      <span className="font-medium text-slate-200">{r.sp.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4 tabular text-slate-300">{r.leadCount}</td>
                  <td className="py-3.5 pr-4 tabular text-slate-300">{r.totalCalls}</td>
                  <td className="py-3.5 pr-4">
                    <span className={`tabular font-medium ${r.connRate >= 50 ? 'text-emerald-300' : r.connRate >= 25 ? 'text-amber-300' : 'text-coral-300'}`}>
                      {r.connRate}%
                    </span>
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className={`tabular font-medium ${r.conversionRate >= 25 ? 'text-emerald-300' : r.conversionRate >= 10 ? 'text-amber-300' : 'text-coral-300'}`}>
                      {r.conversionRate}%
                    </span>
                  </td>
                  <td className="py-3.5 pr-4 tabular text-slate-300">{formatDuration(r.avgDur)}</td>
                  <td className="py-3.5 pr-4 tabular text-slate-300">{currency(r.pipelineValue)}</td>
                  <td className="py-3.5">
                    <div className="h-5 w-28 overflow-hidden rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-cyan-500 transition-all duration-500"
                        style={{ width: `${(r.totalCalls / maxRepCalls) * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insight cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InsightCard
          icon={connectionRate >= 40 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          tone={connectionRate >= 40 ? 'emerald' : 'coral'}
          title="Connection Health"
          text={connectionRate >= 40
            ? `Your team connects on ${connectionRate}% of calls — above the 40% benchmark. Keep it up.`
            : `Connection rate is ${connectionRate}%. Consider reviewing call timing or lead quality.`}
        />
        <InsightCard
          icon={<Clock size={16} />}
          tone="cyan"
          title="Talk Time"
          text={`Average call duration is ${formatDuration(avgDuration)}. ${avgDuration >= 60 ? 'Good engagement depth.' : 'Short calls may indicate low engagement.'}`}
        />
        <InsightCard
          icon={<XCircle size={16} />}
          tone="amber"
          title="Negative Outcomes"
          text={`${Math.round((outcomeCounts['No Answer'] + outcomeCounts['Left Message'] + outcomeCounts['Spoke - Not Interested']) / Math.max(1, totalCalls) * 100)}% of calls end negatively. Focus on better targeting and timing.`}
        />
      </div>
    </div>
  );
}

function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  return (
    <div className="relative" style={{ width: 140, height: 140 }}>
      <svg width={140} height={140} viewBox="0 0 140 140">
        <circle cx={70} cy={70} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={16} />
        {total > 0 && data.map((d) => {
          if (d.value === 0) return null;
          const dash = (d.value / total) * circumference;
          const seg = (
            <circle
              key={d.label}
              cx={70}
              cy={70}
              r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth={16}
              strokeDasharray={`${dash} ${circumference - dash}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 70 70)"
              className="transition-all duration-500"
            />
          );
          offset += dash;
          return seg;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold tabular text-slate-50">{total}</span>
        <span className="text-[10px] uppercase tracking-wider text-slate-500">Total Calls</span>
      </div>
    </div>
  );
}

function InsightCard({
  icon,
  tone,
  title,
  text,
}: {
  icon: React.ReactNode;
  tone: 'emerald' | 'coral' | 'cyan' | 'amber';
  title: string;
  text: string;
}) {
  const toneMap = {
    emerald: 'border-emerald-400/20 bg-emerald-500/5 text-emerald-300',
    coral: 'border-coral-400/20 bg-coral-500/5 text-coral-300',
    cyan: 'border-cyan-400/20 bg-cyan-500/5 text-cyan-300',
    amber: 'border-amber-400/20 bg-amber-500/5 text-amber-300',
  };
  return (
    <div className="glass p-4">
      <div className="mb-2 flex items-center gap-2">
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg border ${toneMap[tone]}`}>
          {icon}
        </div>
        <h4 className="text-sm font-semibold text-slate-100">{title}</h4>
      </div>
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  );
}
