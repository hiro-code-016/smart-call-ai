import { useEffect, useRef, useState } from 'react';
import { PhoneCall, PhoneOff, Square } from 'lucide-react';
import { useStore } from '@/store';
import type { Lead, Outcome } from '@/types';
import { OUTCOMES } from '@/types';
import { formatDuration } from '@/lib/risk';
import { Modal } from './Modal';
import { OutcomeBadge } from './Badges';

export function CallPanel({ lead }: { lead: Lead }) {
  const { startCall, endCall } = useStore();
  const [callId, setCallId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [notes, setNotes] = useState('');
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, []);

  const activeCall = lead.calls.find((c) => c.id === callId && !c.endedAt);
  const activeCallId = activeCall?.id;
  const activeCallStart = activeCall?.startedAt;

  useEffect(() => {
    if (activeCallId && activeCallStart) {
      const start = new Date(activeCallStart).getTime();
      setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
      timerRef.current = window.setInterval(() => {
        setElapsed(Math.max(0, Math.floor((Date.now() - start) / 1000)));
      }, 1000);
    } else {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
      setElapsed(0);
    }
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [activeCallId, activeCallStart]);

  useEffect(() => {
    if (!lead.calls.some((c) => c.id === callId)) {
      setCallId(null);
      setOutcome(null);
      setNotes('');
    }
  }, [lead.id, lead.calls, callId]);

  const handleStart = () => {
    const id = startCall(lead.id);
    setCallId(id);
  };

  const handleEndClick = () => {
    if (!callId) return;
    setModalOpen(true);
  };

  const handleConfirm = () => {
    if (!callId || !outcome) return;
    endCall(lead.id, callId, outcome, notes);
    setCallId(null);
    setModalOpen(false);
    setOutcome(null);
    setNotes('');
  };

  return (
    <div className="glass p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PhoneCall size={18} className="text-brand-300" />
          <h3 className="text-base font-semibold text-slate-100">Simulated Call</h3>
        </div>
        <span className="text-xs text-slate-500">No real telephony · demo timer</span>
      </div>

      <div className="mt-4 flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-ink-900/50 p-6">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            {activeCall && (
              <span className="absolute inline-flex h-full w-full animate-ring rounded-full bg-emerald-500 opacity-60" />
            )}
            <span
              className={`relative inline-flex h-3 w-3 rounded-full ${activeCall ? 'bg-emerald-500' : 'bg-slate-600'}`}
            />
          </span>
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {activeCall ? 'Call in progress' : 'Ready to call'}
          </span>
        </div>

        <div className="font-mono text-4xl font-semibold tabular text-slate-50">
          {formatDuration(elapsed)}
        </div>

        <div className="flex gap-3">
          {!activeCall ? (
            <button onClick={handleStart} className="btn-primary">
              <PhoneCall size={16} /> Start Call
            </button>
          ) : (
            <button onClick={handleEndClick} className="btn-danger">
              <PhoneOff size={16} /> End Call
            </button>
          )}
        </div>
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Log call outcome"
        subtitle={`Duration ${formatDuration(elapsed)} · ${lead.company}`}
        footer={
          <>
            <button className="btn-ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary" disabled={!outcome} onClick={handleConfirm}>
              <Square size={14} /> Save outcome
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <span className="label">Outcome (required)</span>
            <div className="grid grid-cols-1 gap-2">
              {OUTCOMES.map((o) => {
                const selected = outcome === o;
                return (
                  <button
                    key={o}
                    onClick={() => setOutcome(o)}
                    className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-sm transition-all ${
                      selected
                        ? 'border-brand-400/60 bg-brand-500/15 text-slate-100 shadow-glow'
                        : 'border-white/10 bg-ink-900/50 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <span>{o}</span>
                    {selected && <OutcomeBadge outcome={o} />}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <span className="label mb-0">Notes</span>
              <span className="text-xs text-slate-500">{notes.length}/500</span>
            </div>
            <textarea
              value={notes}
              maxLength={500}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="What happened on this call?"
              className="input resize-none"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
