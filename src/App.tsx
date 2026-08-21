import { useState } from 'react';
import { StoreProvider, useStore } from '@/store';
import { Sidebar, type NavState, type View } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { ManagerDashboard } from '@/components/ManagerDashboard';
import { LeadManagement } from '@/components/LeadManagement';
import { SalesWorkspace } from '@/components/SalesWorkspace';
import { LeadDetail } from '@/components/LeadDetail';
import { Analytics } from '@/components/Analytics';
import { Radio } from 'lucide-react';

const titles: Record<View, { title: string; subtitle: string }> = {
  dashboard: { title: 'Manager Dashboard', subtitle: 'Execution intelligence across your sales floor' },
  leads: { title: 'Lead Management', subtitle: 'Create, assign, and reassign leads' },
  workspace: { title: 'Sales Workspace', subtitle: 'Your assigned leads, prioritized by risk and follow-up' },
  analytics: { title: 'Analytics & Reports', subtitle: 'Call activity, conversion, and performance insights' },
  detail: { title: 'Lead Detail', subtitle: 'Call tracking, outcomes, and risk intelligence' },
};

function LoadingScreen() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-500 shadow-glow animate-pulse-soft">
        <Radio size={32} className="text-white" />
      </div>
      <p className="text-sm font-medium text-slate-400">Loading Smart Call AI…</p>
      <div className="h-1 w-40 overflow-hidden rounded-full bg-white/10">
        <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-brand-500 to-cyan-500" />
      </div>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-coral-400/30 bg-coral-500/10 text-coral-400">
        <Radio size={32} />
      </div>
      <div>
        <p className="text-lg font-semibold text-slate-100">Something went wrong</p>
        <p className="mt-1 text-sm text-slate-400">{message}</p>
      </div>
      <p className="text-xs text-slate-500">Try refreshing the page. If the problem persists, use "Reset demo data" after the app loads.</p>
    </div>
  );
}

function Shell() {
  const { loading, error } = useStore();
  const [nav, setNav] = useState<NavState>({ view: 'dashboard' });

  if (loading) return <LoadingScreen />;
  if (error) return <ErrorScreen message={error} />;

  const openLead = (leadId: string) => setNav({ view: 'detail', leadId });

  return (
    <div className="min-h-screen">
      <Sidebar nav={nav} onNav={setNav} />
      <div className="pl-64">
        <Topbar title={titles[nav.view].title} subtitle={titles[nav.view].subtitle} />
        <main className="mx-auto max-w-7xl px-6 py-6">
          {nav.view === 'dashboard' && <ManagerDashboard onOpenLead={openLead} />}
          {nav.view === 'leads' && <LeadManagement onOpenLead={openLead} />}
          {nav.view === 'workspace' && <SalesWorkspace onOpenLead={openLead} />}
          {nav.view === 'analytics' && <Analytics />}
          {nav.view === 'detail' && nav.leadId && (
            <LeadDetail leadId={nav.leadId} onBack={() => setNav({ view: 'leads' })} />
          )}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}

export default App;
