import { Calendar, Search } from 'lucide-react';
import { useStore } from '@/store';

export function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { salespeople, activeSalespersonId } = useStore();
  const active = salespeople.find((s) => s.id === activeSalespersonId);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-ink-950/60 px-6 py-4 backdrop-blur-md">
      <div>
        <h1 className="text-xl font-semibold text-slate-50">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-400 md:flex">
          <Calendar size={15} className="text-slate-500" />
          <span className="tabular">{today}</span>
        </div>
        <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-500 lg:flex">
          <Search size={15} />
          <span>Demo build</span>
        </div>
        {active && (
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${active.color} text-[11px] font-semibold text-white`}
            >
              {active.initials}
            </span>
            <div className="pr-1">
              <p className="text-xs font-medium text-slate-200">{active.name}</p>
              <p className="text-[10px] text-slate-500">Sales Rep</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
