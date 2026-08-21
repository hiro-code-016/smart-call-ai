import { useEffect, useMemo, useState } from 'react';
import { useStore, type NewLeadInput } from '@/store';
import type { Lead } from '@/types';
import { computeRisk, currency, isFollowUpOverdue, relativeTime } from '@/lib/risk';
import { Avatar, EmptyState, RiskBadge, StatusBadge, UrgencyDot } from './Badges';
import { Modal } from './Modal';
import { ArrowRightLeft, History, Plus, Search, Users } from 'lucide-react';

export function LeadManagement({ onOpenLead }: { onOpenLead: (id: string) => void }) {
  const { leads, salespeople, createLead, reassignLead } = useStore();
  const [query, setQuery] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [reassignTarget, setReassignTarget] = useState<Lead | null>(null);
  const [historyLead, setHistoryLead] = useState<Lead | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter(
      (l) => l.company.toLowerCase().includes(q) || l.name.toLowerCase().includes(q),
    );
  }, [leads, query]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
          <Search size={15} className="text-slate-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search company or contact…"
            aria-label="Search leads"
            className="w-56 bg-transparent text-slate-200 placeholder:text-slate-500 focus:outline-none"
          />
        </div>
        <button className="btn-primary" onClick={() => setCreateOpen(true)}>
          <Plus size={16} /> Create lead
        </button>
      </div>

      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3 font-medium">Lead</th>
                <th className="px-4 py-3 font-medium">Owner</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Deal value</th>
                <th className="px-4 py-3 font-medium">Follow-up</th>
                <th className="px-4 py-3 font-medium">Risk</th>
                <th className="px-4 py-3 font-medium">Calls</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10">
                    <EmptyState icon={<Users size={22} />} title="No leads found" subtitle="Try a different search or create a new lead." />
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => {
                  const risk = computeRisk(lead);
                  const sp = salespeople.find((s) => s.id === lead.salespersonId);
                  const overdue = isFollowUpOverdue(lead);
                  return (
                    <tr key={lead.id} className="table-row-hover">
                      <td className="px-4 py-3">
                        <button onClick={() => onOpenLead(lead.id)} className="text-left">
                          <p className="font-semibold text-slate-100">{lead.company}</p>
                          <p className="text-xs text-slate-500">{lead.name}</p>
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {sp && <Avatar initials={sp.initials} color={sp.color} size="sm" />}
                          <span className="text-slate-300">{sp?.name ?? '—'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                      <td className="px-4 py-3 tabular text-slate-200">{currency(lead.dealValue)}</td>
                      <td className="px-4 py-3">
                        {lead.followUpDate ? (
                          <span className={`text-xs ${overdue ? 'text-coral-300' : 'text-slate-300'}`}>
                            {lead.followUpDate}
                            {overdue && <span className="ml-1 text-coral-400">· overdue</span>}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-600">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <UrgencyDot score={risk.score} />
                          <RiskBadge score={risk.score} />
                        </div>
                      </td>
                      <td className="px-4 py-3 tabular text-slate-300">{lead.calls.filter((c) => c.endedAt).length}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setHistoryLead(lead)}
                            title="Assignment history"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-cyan-300"
                          >
                            <History size={15} />
                          </button>
                          <button
                            onClick={() => setReassignTarget(lead)}
                            title="Reassign"
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-brand-300"
                          >
                            <ArrowRightLeft size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CreateLeadModal open={createOpen} onClose={() => setCreateOpen(false)} onCreate={createLead} onOpen={onOpenLead} />
      <ReassignModal lead={reassignTarget} onClose={() => setReassignTarget(null)} />
      <HistoryModal lead={historyLead} onClose={() => setHistoryLead(null)} />
    </div>
  );
}

function CreateLeadModal({
  open,
  onClose,
  onCreate,
  onOpen,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (input: NewLeadInput) => Lead;
  onOpen: (id: string) => void;
}) {
  const { salespeople } = useStore();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dealValue, setDealValue] = useState('25000');
  const [salespersonId, setSalespersonId] = useState(salespeople[0]?.id ?? '');

  const valid = name.trim() && company.trim() && salespersonId;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Create new lead"
      subtitle="Assign to a salesperson to begin tracking"
      maxWidth="max-w-xl"
      footer={
        <>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            disabled={!valid}
            onClick={() => {
              const lead = onCreate({
                name: name.trim(),
                company: company.trim(),
                email: email.trim() || undefined,
                phone: phone.trim() || undefined,
                dealValue: Number(dealValue) || 0,
                salespersonId,
              });
              setName(''); setCompany(''); setEmail(''); setPhone(''); setDealValue('25000');
              onClose();
              onOpen(lead.id);
            }}
          >
            <Plus size={15} /> Create & open
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <span className="label">Contact name</span>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Priya Sharma" />
        </div>
        <div>
          <span className="label">Company</span>
          <input className="input" value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Priya Retail" />
        </div>
        <div>
          <span className="label">Email (optional)</span>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="priya@priyaretail.example" />
        </div>
        <div>
          <span className="label">Phone (optional)</span>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="—" />
        </div>
        <div>
          <span className="label">Deal value (USD)</span>
          <input className="input tabular" type="number" min={0} value={dealValue} onChange={(e) => setDealValue(e.target.value)} />
        </div>
        <div>
          <span className="label">Assign to</span>
          <select className="input" value={salespersonId} onChange={(e) => setSalespersonId(e.target.value)}>
            {salespeople.map((sp) => (
              <option key={sp.id} value={sp.id} className="bg-ink-900">{sp.name}</option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
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

function HistoryModal({ lead, onClose }: { lead: Lead | null; onClose: () => void }) {
  const { salespeople } = useStore();
  if (!lead) return null;
  const nameFor = (id: string) => salespeople.find((s) => s.id === id)?.name ?? id;
  const events = [...lead.assignments].sort((a, b) => (a.at < b.at ? 1 : -1));
  return (
    <Modal
      open={!!lead}
      onClose={onClose}
      title="Assignment history"
      subtitle={`${lead.company} · ${lead.name}`}
    >
      <div className="space-y-3">
        {events.map((ev) => {
          const from = ev.fromSalespersonId ? nameFor(ev.fromSalespersonId) : 'Unassigned';
          const to = nameFor(ev.toSalespersonId);
          return (
            <div key={ev.id} className="flex items-start gap-3 rounded-xl border border-white/5 bg-ink-900/40 p-3">
              <div className="mt-1 h-2 w-2 rounded-full bg-brand-400" />
              <div className="flex-1">
                <p className="text-sm text-slate-200">
                  <span className="text-slate-400">{from}</span> → <span className="font-medium text-slate-100">{to}</span>
                </p>
                <p className="text-xs text-slate-500">{new Date(ev.at).toLocaleString()} · {relativeTime(ev.at)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
