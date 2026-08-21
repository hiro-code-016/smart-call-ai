import { LayoutDashboard, Users, Phone, ShieldAlert, Radio, RotateCcw, BarChart3 } from 'lucide-react';
import { useStore } from '@/store';

export type View = 'dashboard' | 'leads' | 'workspace' | 'analytics' | 'detail';

export interface NavState {
  view: View;
  leadId?: string;
}

interface SidebarProps {
  nav: NavState;
  onNav: (n: NavState) => void;
}

export function Sidebar({ nav, onNav }: SidebarProps) {
  const { salespeople, activeSalespersonId, setActiveSalesperson, resetAll } = useStore();

  const items: { key: View; label: string; icon: typeof LayoutDashboard; role: 'manager' | 'rep' }[] = [
    { key: 'dashboard', label: 'Manager Dashboard', icon: LayoutDashboard, role: 'manager' },
    { key: 'leads', label: 'Lead Management', icon: Users, role: 'manager' },
    { key: 'workspace', label: 'Sales Workspace', icon: Phone, role: 'rep' },
    { key: 'analytics', label: 'Analytics & Reports', icon: BarChart3, role: 'manager' },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-white/10 bg-ink-900/80 backdrop-blur-md">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-cyan-500 shadow-glow">
          <Radio size={20} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-tight text-slate-50">SMART CALL AI</p>
          <p className="text-[11px] text-slate-500">Sales Execution Intelligence</p>
        </div>
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-3">
        {items.map((item) => {
          const Icon = item.icon;
          const active = nav.view === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNav({ view: item.key })}
              aria-current={active ? 'page' : undefined}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                active
                  ? 'bg-brand-500/15 text-brand-200 shadow-glow'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <Icon size={18} className={active ? 'text-brand-300' : 'text-slate-500'} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-2">
        <p className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">
          Acting as salesperson
        </p>
        <div className="space-y-1">
          {salespeople.map((sp) => {
            const active = activeSalespersonId === sp.id;
            return (
              <button
                key={sp.id}
                onClick={() => {
                  setActiveSalesperson(sp.id);
                  onNav({ view: 'workspace' });
                }}
                className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-all ${
                  active ? 'bg-white/10 text-slate-100' : 'text-slate-400 hover:bg-white/5'
                }`}
              >
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br ${sp.color} text-[11px] font-semibold text-white`}
                >
                  {sp.initials}
                </span>
                {sp.name}
                {active && <ShieldAlert size={14} className="ml-auto text-emerald-400" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="border-t border-white/10 px-3 py-3">
        <button
          onClick={() => {
            if (confirm('Reset all demo data to seeded state?')) resetAll();
          }}
          className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs text-slate-500 hover:bg-white/5 hover:text-slate-300"
        >
          <RotateCcw size={14} /> Reset demo data
        </button>
      </div>
    </aside>
  );
}
