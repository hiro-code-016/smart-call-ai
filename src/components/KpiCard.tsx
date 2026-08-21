import type { ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: ReactNode;
  tone?: 'brand' | 'cyan' | 'emerald' | 'amber' | 'coral';
  trend?: 'up' | 'down' | 'flat';
  trendLabel?: string;
}

const toneMap: Record<string, string> = {
  brand: 'text-brand-300 bg-brand-500/10 border-brand-400/20',
  cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-400/20',
  emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-400/20',
  amber: 'text-amber-400 bg-amber-500/10 border-amber-400/20',
  coral: 'text-coral-400 bg-coral-500/10 border-coral-400/20',
};

export function KpiCard({ label, value, sub, icon, tone = 'brand', trend, trendLabel }: KpiCardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus;
  return (
    <div className="glass relative overflow-hidden p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold tabular text-slate-50">{value}</p>
          {sub && <p className="mt-1 text-xs text-slate-500">{sub}</p>}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${toneMap[tone]}`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs">
          <TrendIcon
            className={
              trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-coral-400' : 'text-slate-500'
            }
            size={14}
          />
          <span className="text-slate-400">{trendLabel}</span>
        </div>
      )}
    </div>
  );
}
