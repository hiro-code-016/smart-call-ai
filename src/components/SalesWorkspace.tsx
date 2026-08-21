import { useMemo, useState } from 'react';
import { useStore } from '@/store';
import { computeRisk, currency, isFollowUpOverdue } from '@/lib/risk';
import { Avatar, EmptyState, RiskBadge, StatusBadge, UrgencyDot } from './Badges';
import { ArrowDownUp, CalendarClock, ShieldAlert, Phone, Users } from 'lucide-react';

type SortKey = 'followUp' | 'risk';

export function SalesWorkspace({ onOpenLead }: { onOpenLead: (id: string) => void }) {
  const { leads, salespeople, activeSalespersonId } = useStore();
  const [sortKey, setSortKey] = useState<SortKey>('risk');
  const [sortDesc, setSortDesc] = useState(true);

  const activeSp = salespeople.find((s) => s.id === activeSalespersonId);

  const myLeads = useMemo(() => {
    return leads.filter((l) => l.salespersonId === activeSalespersonId);
  }, [leads, activeSalespersonId]);

  const sorted = useMemo(() => {
    const arr = [...myLeads];
    arr.sort((a, b) => {
      const ra = computeRisk(a);
      const rb = computeRisk(b);
      if (sortKey === 'risk') {
        return sortDesc ? rb.score - ra.score : ra.score - rb.score;
      }
      // followUp
      const fa = a.followUpDate ?? '9999-12-31';
      const fb = b.followUpDate ?? '9999-12-31';
      return sortDesc ? (fa < fb ? -1 : 1) : fa > fb ? -1 : 1;
    });
    return arr;
  }, [myLeads, sortKey, sortDesc]);

  const overdueCount = myLeads.filter((l) => isFollowUpOverdue(l)).length;
  const highRiskCount = myLeads.filter((l) => computeRisk(l).band === 'High').length;
  const callsToday = myLeads.reduce((s, l) => {
    const today = new Date().toISOString().slice(0, 10);
    return s + l.calls.filter((c) => c.endedAt && c.endedAt.slice(0, 10) === today).length;
  }, 0);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDesc((d) => !d);
    else {
      setSortKey(key);
      setSortDesc(true);
    }
  };

  return (
    <div className="space-y-5">
      {/* Mini KPIs */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat label="My Leads" value={myLeads.length} icon={<Users size={16} />} tone="text-brand-300" />
        <MiniStat label="Calls Today" value={callsToday} icon={<Phone size={16} />} tone="text-cyan-400" />
        <MiniStat label="Overdue" value={overdueCount} icon={<CalendarClock size={16} />} tone="text-coral-400" />
        <MiniStat label="High Risk" value={highRiskCount} icon={<ShieldAlert size={16} />} tone="text-amber-400" />
      </div>

      <div className="glass p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {activeSp && <Avatar initials={activeSp.initials} color={activeSp.color} size="sm" />}
            <h3 className="text-sm font-semibold text-slate-100">{activeSp?.name}'s workspace</h3>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ArrowDownUp size={14} />
            <span>Sort by</span>
            <button
              onClick={() => toggleSort('risk')}
              className={`rounded-lg px-2 py-1 ${sortKey === 'risk' ? 'bg-brand-500/20 text-brand-200' : 'hover:bg-white/5'}`}
            >
              Risk {sortKey === 'risk' ? (sortDesc ? '↓' : '↑') : ''}
            </button>
            <button
              onClick={() => toggleSort('followUp')}
              className={`rounded-lg px-2 py-1 ${sortKey === 'followUp' ? 'bg-brand-500/20 text-brand-200' : 'hover:bg-white/5'}`}
            >
              Follow-up {sortKey === 'followUp' ? (sortDesc ? '↓' : '↑') : ''}
            </button>
          </div>
        </div>

        {sorted.length === 0 ? (
          <EmptyState icon={<Users size={22} />} title="No leads assigned to you yet" subtitle="Ask your manager to assign leads." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-3 py-3 font-medium">Lead</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Deal value</th>
                  <th className="px-3 py-3 font-medium">Follow-up</th>
                  <th className="px-3 py-3 font-medium">Risk</th>
                  <th className="px-3 py-3 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {sorted.map((lead) => {
                  const risk = computeRisk(lead);
                  const overdue = isFollowUpOverdue(lead);
                  return (
                    <tr key={lead.id} className="table-row-hover">
                      <td className="px-3 py-3">
                        <button onClick={() => onOpenLead(lead.id)} className="text-left">
                          <p className="font-semibold text-slate-100">{lead.company}</p>
                          <p className="text-xs text-slate-500">{lead.name}</p>
                        </button>
                      </td>
                      <td className="px-3 py-3"><StatusBadge status={lead.status} /></td>
                      <td className="px-3 py-3 tabular text-slate-200">{currency(lead.dealValue)}</td>
                      <td className="px-3 py-3">
                        {lead.followUpDate ? (
                          <span className={`text-xs ${overdue ? 'text-coral-300' : 'text-slate-300'}`}>
                            {lead.followUpDate}
                            {overdue && <span className="ml-1 text-coral-400">· overdue</span>}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-600">—</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <UrgencyDot score={risk.score} />
                          <RiskBadge score={risk.score} />
                        </div>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <button onClick={() => onOpenLead(lead.id)} className="btn-ghost px-3 py-1.5 text-xs">
                          Open
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function MiniStat({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone: string }) {
  return (
    <div className="glass flex items-center gap-3 p-4">
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 ${tone}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
        <p className="text-xl font-semibold tabular text-slate-100">{value}</p>
      </div>
    </div>
  );
}
