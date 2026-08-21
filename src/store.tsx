import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { AssignmentEvent, CallLog, Intervention, Lead, Outcome, Salesperson } from '@/types';
import { SALESPEOPLE, SEED_LEADS } from '@/lib/seed';
import { addDays, defaultFollowUpDays, todayISO } from '@/lib/risk';

export interface NewLeadInput {
  name: string;
  company: string;
  email?: string;
  phone?: string;
  dealValue: number;
  salespersonId: string;
}

interface Store {
  salespeople: Salesperson[];
  leads: Lead[];
  highRiskThreshold: number;
  activeSalespersonId: string;
  setActiveSalesperson: (id: string) => void;
  setHighRiskThreshold: (n: number) => void;
  createLead: (input: NewLeadInput) => Lead;
  reassignLead: (leadId: string, toSalespersonId: string) => void;
  startCall: (leadId: string) => string; // returns callId
  endCall: (leadId: string, callId: string, outcome: Outcome, notes: string) => void;
  setFollowUpDate: (leadId: string, date: string | null) => void;
  flagIntervention: (leadId: string, note: string) => void;
  resolveIntervention: (leadId: string, interventionId: string, note: string) => void;
  getLead: (leadId: string) => Lead | undefined;
  resetAll: () => void;
}

const StoreContext = createContext<Store | null>(null);

let idc = 0;
function uid(prefix: string): string {
  idc += 1;
  return `${prefix}_${Date.now().toString(36)}_${idc}`;
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [salespeople] = useState<Salesperson[]>(SALESPEOPLE);
  const [leads, setLeads] = useState<Lead[]>(() => SEED_LEADS.map((l) => ({ ...l })));
  const [highRiskThreshold, setHighRiskThreshold] = useState(60);
  const [activeSalespersonId, setActiveSalespersonId] = useState<string>('sp_john');

  const updateLead = useCallback((leadId: string, fn: (l: Lead) => Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? fn(l) : l)));
  }, []);

  const createLead = useCallback((input: NewLeadInput): Lead => {
    const lead: Lead = {
      id: uid('lead'),
      name: input.name,
      company: input.company,
      email: input.email,
      phone: input.phone,
      dealValue: input.dealValue,
      status: 'New',
      salespersonId: input.salespersonId,
      createdAt: todayISO(),
      followUpDate: null,
      calls: [],
      assignments: [
        {
          id: uid('asg'),
          at: todayISO(),
          fromSalespersonId: null,
          toSalespersonId: input.salespersonId,
          by: 'manager',
        },
      ],
      interventions: [],
    };
    setLeads((prev) => [lead, ...prev]);
    return lead;
  }, []);

  const reassignLead = useCallback(
    (leadId: string, toSalespersonId: string) => {
      updateLead(leadId, (l) => {
        if (l.salespersonId === toSalespersonId) return l;
        const event: AssignmentEvent = {
          id: uid('asg'),
          at: todayISO(),
          fromSalespersonId: l.salespersonId,
          toSalespersonId,
          by: 'manager',
        };
        return { ...l, salespersonId: toSalespersonId, assignments: [...l.assignments, event] };
      });
    },
    [updateLead],
  );

  const startCall = useCallback(
    (leadId: string): string => {
      const callId = uid('call');
      const call: CallLog = {
        id: callId,
        startedAt: todayISO(),
        endedAt: null,
        durationSec: null,
        outcome: null,
        notes: '',
        salespersonId: activeSalespersonId,
      };
      updateLead(leadId, (l) => ({ ...l, calls: [...l.calls, call] }));
      return callId;
    },
    [activeSalespersonId, updateLead],
  );

  const endCall = useCallback(
    (leadId: string, callId: string, outcome: Outcome, notes: string) => {
      updateLead(leadId, (l) => {
        const calls = l.calls.map((c) => {
          if (c.id !== callId) return c;
          const endedAt = todayISO();
          const durationSec = Math.max(1, Math.round((new Date(endedAt).getTime() - new Date(c.startedAt).getTime()) / 1000));
          return { ...c, endedAt, durationSec, outcome, notes: notes.slice(0, 500) };
        });

        let status = l.status;
        if (outcome === 'Spoke - Interested') status = 'Interested';
        else if (outcome === 'Spoke - Not Interested') status = 'Not Interested';
        else if (outcome === 'Disqualified') status = 'Disqualified';
        else if (l.status === 'New') status = 'In Progress';

        let followUpDate = l.followUpDate;
        const def = defaultFollowUpDays(outcome);
        if (outcome === 'Disqualified') {
          followUpDate = null;
        } else if (def !== null) {
          const base = todayISO().slice(0, 10);
          followUpDate = addDays(base, def);
        }

        return { ...l, calls, status, followUpDate };
      });
    },
    [updateLead],
  );

  const setFollowUpDate = useCallback(
    (leadId: string, date: string | null) => {
      updateLead(leadId, (l) => ({ ...l, followUpDate: date }));
    },
    [updateLead],
  );

  const flagIntervention = useCallback(
    (leadId: string, note: string) => {
      updateLead(leadId, (l) => {
        const iv: Intervention = {
          id: uid('iv'),
          at: todayISO(),
          note,
          status: 'open',
        };
        return { ...l, interventions: [...l.interventions, iv] };
      });
    },
    [updateLead],
  );

  const resolveIntervention = useCallback(
    (leadId: string, interventionId: string, note: string) => {
      updateLead(leadId, (l) => ({
        ...l,
        interventions: l.interventions.map((iv) =>
          iv.id === interventionId ? { ...iv, status: 'resolved', resolvedAt: todayISO(), resolveNote: note } : iv,
        ),
      }));
    },
    [updateLead],
  );

  const getLead = useCallback((leadId: string) => leads.find((l) => l.id === leadId), [leads]);

  const resetAll = useCallback(() => {
    setLeads(SEED_LEADS.map((l) => ({ ...l })));
    setHighRiskThreshold(60);
    setActiveSalespersonId('sp_john');
  }, []);

  const value = useMemo<Store>(
    () => ({
      salespeople,
      leads,
      highRiskThreshold,
      activeSalespersonId,
      setActiveSalesperson: setActiveSalespersonId,
      setHighRiskThreshold,
      createLead,
      reassignLead,
      startCall,
      endCall,
      setFollowUpDate,
      flagIntervention,
      resolveIntervention,
      getLead,
      resetAll,
    }),
    [salespeople, leads, highRiskThreshold, activeSalespersonId, createLead, reassignLead, startCall, endCall, setFollowUpDate, flagIntervention, resolveIntervention, getLead, resetAll],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): Store {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
