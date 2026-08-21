import { useEffect, useState } from 'react';
import { useStore } from '@/store';
import { computeRisk, currency, formatDuration, isFollowUpOverdue, relativeTime } from '@/lib/risk';
import { Avatar, OutcomeBadge, StatusBadge } from './Badges';
import { CallPanel } from './CallPanel';
import { RiskBreakdown } from './RiskBreakdown';
import { ArrowLeft, Building2, CalendarClock, Mail, Phone as PhoneIcon, User, History, Clock, Flag, ShieldCheck } from 'lucide-react';
import { Modal } from './Modal';

export function LeadDetail({ leadId, onBack }: { leadId: string; onBack: () => void }) {
  const { getLead, salespeople, setFollowUpDate, flagIntervention, resolveIntervention } = useStore();
  const lead = getLead(leadId);
  const [editFollowUp, setEditFollowUp] = useState(false);
  const [fuDate, setFuDate] = useState('');
  const [flagOpen, setFlagOpen] = useState(false);
  const [flagNote, setFlagNote] = useState('');
  const [resolveOpen, setResolveOpen] = useState(false);
  const [resolveNote, setResolveNote] = useState('');

  useEffect(() => {
    setFuDate(lead?.followUpDate ?? '');
  }, [lead?.id, lead?.followUpDate]);

  if (!lead) {
    return (
      <div className="glass p-10 text-center text-slate-400">
        Lead not found.{' '}
        <button className="text-brand-300 underline" onClick={onBack}>Go back</button>
      </div>
    );
  }

  const risk = computeRisk(lead);
  const sp = salespeople.find((s) => s.id === lead.salespersonId);
  const overdue = isFollowUpOverdue(lead);
  const completedCalls = lead.calls.filter((c) => c.endedAt).reverse();
  const openIntervention = lead.interventions.find((i) => i.status === 'open');

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Header card */}
      <div className="glass p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-500 shadow-glow">
              <Building2 size={26} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-50">{lead.company}</h2>
              <p className="text-sm text-slate-400">{lead.name}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusBadge status={lead.status} />
                <span className="chip border border-white/10 bg-white/5 text-slate-300">
                  <span className="tabular">{currency(lead.dealValue)}</span> deal
                </span>
                {overdue && (
                  <span className="chip border border-coral-400/30 bg-coral-500/15 text-coral-300">
                    <CalendarClock size={12} /> Follow-up overdue
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            {sp && (
              <div className="flex items-center gap-2">
                <Avatar initials={sp.initials} color={sp.color} size="sm" />
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-200">{sp.name}</p>
                  <p className="text-xs text-slate-500">Owner</p>
                </div>
              </div>
            )}
            <div className="flex gap-2">
              {openIntervention ? (
                <button className="btn-ghost" onClick={() => setResolveOpen(true)}>
                  <ShieldCheck size={15} /> Resolve intervention
                </button>
              ) : (
                <button className="btn-ghost" onClick={() => setFlagOpen(true)}>
                  <Flag size={15} /> Flag for intervention
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <InfoChip icon={<Mail size={14} />} label="Email" value={lead.email || '—'} />
          <InfoChip icon={<PhoneIcon size={14} />} label="Phone" value={lead.phone || '—'} />
          <InfoChip icon={<User size={14} />} label="Created" value={relativeTime(lead.createdAt)} />
          <InfoChip
            icon={<CalendarClock size={14} />}
            label="Follow-up"
            value={lead.followUpDate ?? '—'}
            tone={overdue ? 'text-coral-300' : 'text-slate-200'}
            action={
              <button onClick={() => { setFuDate(lead.followUpDate ?? ''); setEditFollowUp(true); }} className="text-xs text-brand-300 hover:underline">
                edit
              </button>
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-5">
          <CallPanel lead={lead} />

          {/* Call history */}
          <div className="glass p-5">
            <div className="mb-4 flex items-center gap-2">
              <History size={18} className="text-cyan-400" />
              <h3 className="text-base font-semibold text-slate-100">Call history</h3>
              <span className="chip border border-white/10 bg-white/5 text-slate-400">{completedCalls.length}</span>
            </div>
            {completedCalls.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">No calls logged yet. Start a call to begin.</p>
            ) : (
              <div className="space-y-3">
                {completedCalls.map((c) => (
                  <div key={c.id} className="rounded-xl border border-white/5 bg-ink-900/40 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-slate-500" />
                        <span className="text-xs text-slate-400">{new Date(c.startedAt).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {c.outcome && <OutcomeBadge outcome={c.outcome} />}
                        <span className="tabular text-xs text-slate-400">{formatDuration(c.durationSec ?? 0)}</span>
                      </div>
                    </div>
                    {c.notes && <p className="mt-2 text-sm text-slate-300">{c.notes}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <RiskBreakdown lead={lead} />

          {/* Assignment history */}
          <div className="glass p-5">
            <div className="mb-3 flex items-center gap-2">
              <History size={16} className="text-brand-300" />
              <h3 className="text-sm font-semibold text-slate-100">Assignment history</h3>
            </div>
            <div className="space-y-2.5">
              {[...lead.assignments].reverse().map((ev) => {
                const from = ev.fromSalespersonId
                  ? salespeople.find((s) => s.id === ev.fromSalespersonId)?.name ?? '—'
                  : 'Unassigned';
                const to = salespeople.find((s) => s.id === ev.toSalespersonId)?.name ?? '—';
                return (
                  <div key={ev.id} className="flex items-start gap-2.5">
                    <div className="mt-1.5 h-2 w-2 rounded-full bg-brand-400" />
                    <div>
                      <p className="text-xs text-slate-300">
                        <span className="text-slate-500">{from}</span> → <span className="font-medium text-slate-100">{to}</span>
                      </p>
                      <p className="text-[11px] text-slate-500">{new Date(ev.at).toLocaleString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interventions */}
          {lead.interventions.length > 0 && (
            <div className="glass p-5">
              <div className="mb-3 flex items-center gap-2">
                <Flag size={16} className="text-amber-400" />
                <h3 className="text-sm font-semibold text-slate-100">Interventions</h3>
              </div>
              <div className="space-y-2.5">
                {lead.interventions.map((iv) => (
                  <div key={iv.id} className="rounded-xl border border-white/5 bg-ink-900/40 p-3">
                    <div className="flex items-center justify-between">
                      <span className={`chip ${iv.status === 'open' ? 'border border-amber-400/30 bg-amber-500/15 text-amber-300' : 'border border-emerald-400/30 bg-emerald-500/15 text-emerald-300'}`}>
                        {iv.status}
                      </span>
                      <span className="text-[11px] text-slate-500">{new Date(iv.at).toLocaleString()}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">{iv.note}</p>
                    {iv.resolveNote && <p className="mt-1 text-xs text-emerald-300">Resolved: {iv.resolveNote}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Follow-up edit modal */}
      <Modal
        open={editFollowUp}
        onClose={() => setEditFollowUp(false)}
        title="Edit follow-up date"
        subtitle={lead.company}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setEditFollowUp(false)}>Cancel</button>
            <button
              className="btn-primary"
              onClick={() => {
                setFollowUpDate(lead.id, fuDate || null);
                setEditFollowUp(false);
              }}
            >
              Save date
            </button>
          </>
        }
      >
        <div>
          <span className="label">Follow-up date</span>
          <input type="date" className="input tabular" value={fuDate} onChange={(e) => setFuDate(e.target.value)} />
          <p className="mt-2 text-xs text-slate-500">
            Default rules: No Answer +1d · Left Message +1d · Interested +3d · Not Interested +7d · Disqualified none.
          </p>
        </div>
      </Modal>

      {/* Flag modal */}
      <Modal
        open={flagOpen}
        onClose={() => setFlagOpen(false)}
        title="Flag for intervention"
        subtitle={lead.company}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setFlagOpen(false)}>Cancel</button>
            <button
              className="btn-primary"
              disabled={!flagNote.trim()}
              onClick={() => {
                flagIntervention(lead.id, flagNote.trim());
                setFlagNote('');
                setFlagOpen(false);
              }}
            >
              <Flag size={15} /> Flag lead
            </button>
          </>
        }
      >
        <div>
          <span className="label">Intervention note</span>
          <textarea
            value={flagNote}
            onChange={(e) => setFlagNote(e.target.value)}
            rows={4}
            placeholder="Describe the issue and the action required…"
            className="input resize-none"
          />
        </div>
      </Modal>

      {/* Resolve modal */}
      <Modal
        open={resolveOpen}
        onClose={() => setResolveOpen(false)}
        title="Resolve intervention"
        subtitle={lead.company}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setResolveOpen(false)}>Cancel</button>
            <button
              className="btn-primary"
              disabled={!resolveNote.trim() || !openIntervention}
              onClick={() => {
                if (openIntervention) resolveIntervention(lead.id, openIntervention.id, resolveNote.trim());
                setResolveNote('');
                setResolveOpen(false);
              }}
            >
              <ShieldCheck size={15} /> Resolve
            </button>
          </>
        }
      >
        <div>
          <span className="label">Resolution note</span>
          <textarea
            value={resolveNote}
            onChange={(e) => setResolveNote(e.target.value)}
            rows={4}
            placeholder="How was this resolved?"
            className="input resize-none"
          />
        </div>
      </Modal>
    </div>
  );
}

function InfoChip({
  icon,
  label,
  value,
  tone = 'text-slate-200',
  action,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  tone?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-ink-900/40 p-3">
      <div className="flex items-center justify-between">
        <span className="text-[11px] uppercase tracking-wider text-slate-500">{label}</span>
        {action}
      </div>
      <div className={`mt-1 flex items-center gap-1.5 text-sm ${tone}`}>
        {icon}
        <span className="truncate">{value}</span>
      </div>
    </div>
  );
}
