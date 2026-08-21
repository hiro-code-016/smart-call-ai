import { useEffect, useState } from 'react';
import { useStore } from '@/store';
import { computeRisk, currency, isFollowUpOverdue, relativeTime } from '@/lib/risk';
import { Avatar, EmptyState, RiskBadge, StatusBadge, UrgencyDot } from './Badges';
import { Modal } from './Modal';
import { KpiCard } from './KpiCard';
import type { Lead } from '@/types';
import { ArrowRightLeft, Flag, ShieldCheck, ShieldAlert, AlertTriangle, CalendarClock, Gauge, Users, Phone } from 'lucide-react';

interface QueueItemProps {
  lead: Lead;
  onOpen: (leadId: string) => void;
  onReassign: (lead: Lead) => void;
  onFlag: (lead: Lead) => void;
  onResolve: (lead: Lead) => void;
  hasOpenIntervention?: boolean;
}

function QueueRow({ lead, onOpen, onReassign, onFlag, onResolve, hasOpenIntervention }: QueueItemProps) {
  const { salespeople } = useStore();
  const risk = computeRisk(lead);
  const sp = salespeople.find((s) => s.id === lead.salespersonId);
  const overdue = isFollowUpOverdue(lead);

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-ink-900/40 px-3 py-3 transition-colors hover:bg-white/5">
      <UrgencyDot score={risk.score} />
      <button onClick={() => onOpen(lead.id)} className="flex flex-1 items-center gap-3 text-left">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-100">{lead.company}</p>
          <p className="truncate text-xs text-slate-500">{lead.name} · {sp?.name}</p>
        </div>
      </button>
      <div className="hidden items-center gap-2 sm:flex">
        <RiskBadge score={risk.score} />
        {overdue && <span className="chip border border-coral-400/30 bg-coral-500/15 text-coral-300">Overdue</span>}
        <span className="tabular text-xs text-slate-400">{currency(lead.dealValue)}</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onReassign(lead)}
          title="Reassign"
          className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-brand-300"
        >
          <ArrowRightLeft size={15} />
        </button>
        {hasOpenIntervention ? (
          <button
            onClick={() => onResolve(lead)}
            title="Resolve intervention"
            className="rounded-lg p-1.5 text-emerald-400 hover:bg-emerald-500/10"
          >
            <ShieldCheck size={15} />
          </button>
        ) : (
          <button
            onClick={() => onFlag(lead)}
            title="Flag for intervention"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-amber-300"
          >
            <Flag size={15} />
          </button>
        )}
      </div>
    </div>
  );
}

function ReassignModal({ lead, onClose }: { lead: Lead | null; onClose: () => void }) {
  const { salespeople, reassignLead } = useStore();
  const [target, setTarget] = useState(lead?.salespersonId ?? '');
  useEffect(() => {
    setTarget(lead?.salespersonId ?? '');
  }, [lead?.id, lead?.salespersonId]);
  if (!lead) return null;
  return (
    <Modal
      open={!!lead}
      onClose={onClose}
      title="Reassign lead"
      subtitle={`${lead.company} · ${lead.name}`}
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            disabled={!target || target === lead.salespersonId}
            onClick={() => {
              reassignLead(lead.id, target);
              onClose();
            }}
          >
            <ArrowRightLeft size={15} /> Reassign
          </button>
        </>
      }
    >
      <div className="space-y-2">
        {salespeople.map((sp) => {
          const selected = target === sp.id;
          return (
            <button
              key={sp.id}
              onClick={() => setTarget(sp.id)}
              className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition-all ${
                selected ? 'border-brand-400/60 bg-brand-500/15' : 'border-white/10 bg-ink-900/50 hover:bg-white/5'
              }`}
            >
              <Avatar initials={sp.initials} color={sp.color} size="sm" />
              <div>
                <p className="text-sm font-medium text-slate-100">{sp.name}</p>
                <p className="text-xs text-slate-500">{sp.id === lead.salespersonId ? 'Current owner' : 'Salesperson'}</p>
              </div>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}

function InterventionModal({
  lead,
  mode,
  onClose,
}: {
  lead: Lead | null;
  mode: 'flag' | 'resolve';
  onClose: () => void;
}) {
  const { flagIntervention, resolveIntervention } = useStore();
  const [note, setNote] = useState('');
  useEffect(() => {
    if (lead) setNote('');
  }, [lead?.id]);
  if (!lead) return null;
  const openIntervention = lead.interventions.find((i) => i.status === 'open');
  return (
    <Modal
      open={!!lead}
      onClose={onClose}
      title={mode === 'flag' ? 'Flag for intervention' : 'Resolve intervention'}
      subtitle={`${lead.company} · ${lead.name}`}
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className={mode === 'flag' ? 'btn-primary' : 'btn-primary'}
            disabled={!note.trim()}
            onClick={() => {
              if (mode === 'flag') flagIntervention(lead.id, note.trim());
              else if (openIntervention) resolveIntervention(lead.id, openIntervention.id, note.trim());
              setNote('');
              onClose();
            }}
          >
            {mode === 'flag' ? <Flag size={15} /> : <ShieldCheck size={15} />}
            {mode === 'flag' ? 'Flag lead' : 'Resolve'}
          </button>
        </>
      }
    >
      <div>
        <span className="label">{mode === 'flag' ? 'Intervention note' : 'Resolution note'}</span>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={4}
          placeholder={mode === 'flag' ? 'Describe the issue and the action required…' : 'How was this resolved?'}
          className="input resize-none"
        />
      </div>
    </Modal>
  );
}

export function ManagerDashboard({ onOpenLead }: { onOpenLead: (id: string) => void }) {
  const { leads, salespeople, highRiskThreshold, setHighRiskThreshold } = useStore();
  const [reassignLead, setReassignLead] = useState<Lead | null>(null);
  const [flagLead, setFlagLead] = useState<Lead | null>(null);
  const [resolveLead, setResolveLead] = useState<Lead | null>(null);

  const withRisk = leads.map((l) => ({ lead: l, risk: computeRisk(l) }));
  const activeLeads = leads.filter((l) => l.status !== 'Disqualified').length;

  const todayKey = new Date().toISOString().slice(0, 10);
  const callsToday = leads.reduce(
    (sum, l) => sum + l.calls.filter((c) => c.endedAt && c.endedAt.slice(0, 10) === todayKey).length,
    0,
  );

  const followUpsDue = leads.filter((l) => l.status !== 'Disqualified' && l.followUpDate && l.followUpDate <= todayKey).length;

  const atRiskRevenue = withRisk
    .filter((r) => r.risk.band === 'High')
    .reduce((sum, r) => sum + r.lead.dealValue, 0);

  const highRiskQueue = withRisk
    .filter((r) => r.risk.score >= highRiskThreshold && r.lead.status !== 'Disqualified')
    .sort((a, b) => b.risk.score - a.risk.score);

  const overdueQueue = withRisk
    .filter((r) => isFollowUpOverdue(r.lead) && r.lead.status !== 'Disqualified')
    .sort((a, b) => ((a.lead.followUpDate ?? '') < (b.lead.followUpDate ?? '') ? -1 : 1));

  const interventionQueue = leads
    .filter((l) => l.interventions.some((i) => i.status === 'open'))
    .map((l) => ({ lead: l, risk: computeRisk(l) }));

  const repPerformance = salespeople.map((sp) => {
    const repLeads = leads.filter((l) => l.salespersonId === sp.id);
    const calls = repLeads.flatMap((l) => l.calls.filter((c) => c.endedAt));
    const interested = calls.filter((c) => c.outcome === 'Spoke - Interested').length;
    const neg = calls.filter((c) => c.outcome && ['No Answer', 'Left Message', 'Spoke - Not Interested'].includes(c.outcome)).length;
    const avgDur = calls.length ? Math.round(calls.reduce((s, c) => s + (c.durationSec ?? 0), 0) / calls.length) : 0;
    return { sp, leads: repLeads.length, calls: calls.length, interested, neg, avgDur };
  });

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Active Leads"
          value={activeLeads}
          sub="Not disqualified"
          tone="brand"
          icon={<Users size={18} />}
        />
        <KpiCard
          label="Calls Today"
          value={callsToday}
          sub="Completed calls"
          tone="cyan"
          icon={<Phone size={18} />}
        />
        <KpiCard
          label="Follow-ups Due"
          value={followUpsDue}
          sub="Due today or overdue"
          tone="amber"
          icon={<CalendarClock size={18} />}
        />
        <KpiCard
          label="At-Risk Revenue"
          value={currency(atRiskRevenue)}
          sub="High-risk pipeline"
          tone="coral"
          icon={<ShieldAlert size={18} />}
        />
      </div>

      {/* Threshold control */}
      <div className="glass flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-coral-400/20 bg-coral-500/10 text-coral-400">
            <Gauge size={18} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-100">High-risk threshold</p>
            <p className="text-xs text-slate-500">Leads scoring ≥ this value appear in the High-Risk Queue</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={20}
            max={90}
            value={highRiskThreshold}
            onChange={(e) => setHighRiskThreshold(Number(e.target.value))}
            className="w-40 accent-coral-500"
            aria-label="High-risk threshold"
          />
          <span className="tabular w-12 rounded-lg border border-white/10 bg-ink-900/60 px-2 py-1 text-center text-sm font-semibold text-coral-300">
            {highRiskThreshold}
          </span>
        </div>
      </div>

      {/* Queues */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <QueueColumn
          title="High-Risk Queue"
          icon={<ShieldAlert size={16} className="text-coral-400" />}
          accent="coral"
          empty="No high-risk leads right now."
          count={highRiskQueue.length}
        >
          {highRiskQueue.map((r) => (
            <QueueRow
              key={r.lead.id}
              lead={r.lead}
              onOpen={onOpenLead}
              onReassign={setReassignLead}
              onFlag={setFlagLead}
              onResolve={setResolveLead}
              hasOpenIntervention={r.lead.interventions.some((i) => i.status === 'open')}
            />
          ))}
        </QueueColumn>

        <QueueColumn
          title="Overdue Follow-ups"
          icon={<CalendarClock size={16} className="text-amber-400" />}
          accent="amber"
          empty="No overdue follow-ups."
          count={overdueQueue.length}
        >
          {overdueQueue.map((r) => (
            <QueueRow
              key={r.lead.id}
              lead={r.lead}
              onOpen={onOpenLead}
              onReassign={setReassignLead}
              onFlag={setFlagLead}
              onResolve={setResolveLead}
              hasOpenIntervention={r.lead.interventions.some((i) => i.status === 'open')}
            />
          ))}
        </QueueColumn>

        <QueueColumn
          title="Intervention Queue"
          icon={<AlertTriangle size={16} className="text-brand-300" />}
          accent="brand"
          empty="No open interventions."
          count={interventionQueue.length}
        >
          {interventionQueue.map((r) => (
            <div key={r.lead.id} className="space-y-1.5">
              <QueueRow
                lead={r.lead}
                onOpen={onOpenLead}
                onReassign={setReassignLead}
                onFlag={setFlagLead}
                onResolve={setResolveLead}
                hasOpenIntervention
              />
              <p className="px-3 text-xs text-slate-500">
                {r.lead.interventions.find((i) => i.status === 'open')?.note}
              </p>
            </div>
          ))}
        </QueueColumn>
      </div>

      {/* Rep performance */}
      <div className="glass p-5">
        <div className="mb-4 flex items-center gap-2">
          <Users size={16} className="text-cyan-400" />
          <h3 className="text-base font-semibold text-slate-100">Salesperson performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="pb-3 font-medium">Rep</th>
                <th className="pb-3 font-medium">Leads</th>
                <th className="pb-3 font-medium">Calls</th>
                <th className="pb-3 font-medium">Interested</th>
                <th className="pb-3 font-medium">Negative</th>
                <th className="pb-3 font-medium">Avg duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {repPerformance.map((r) => (
                <tr key={r.sp.id} className="table-row-hover">
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar initials={r.sp.initials} color={r.sp.color} size="sm" />
                      <span className="font-medium text-slate-200">{r.sp.name}</span>
                    </div>
                  </td>
                  <td className="py-3 tabular text-slate-300">{r.leads}</td>
                  <td className="py-3 tabular text-slate-300">{r.calls}</td>
                  <td className="py-3 tabular text-emerald-300">{r.interested}</td>
                  <td className="py-3 tabular text-coral-300">{r.neg}</td>
                  <td className="py-3 tabular text-slate-300">{r.avgDur}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <ReassignModal lead={reassignLead} onClose={() => setReassignLead(null)} />
      <InterventionModal lead={flagLead} mode="flag" onClose={() => setFlagLead(null)} />
      <InterventionModal lead={resolveLead} mode="resolve" onClose={() => setResolveLead(null)} />
    </div>
  );
}

function QueueColumn({
  title,
  icon,
  accent,
  empty,
  count,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  accent: 'coral' | 'amber' | 'brand';
  empty: string;
  count: number;
  children: React.ReactNode;
}) {
  const ring =
    accent === 'coral' ? 'border-coral-400/20' : accent === 'amber' ? 'border-amber-400/20' : 'border-brand-400/20';
  return (
    <div className={`glass flex flex-col p-4 ${ring}`}>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
        </div>
        <span className="chip border border-white/10 bg-white/5 text-slate-300">{count}</span>
      </div>
      <div className="space-y-2">
        {count === 0 ? <EmptyState title={empty} /> : children}
      </div>
    </div>
  );
}
