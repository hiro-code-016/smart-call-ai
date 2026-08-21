import { useState } from 'react';
import { StoreProvider } from '@/store';
import { Sidebar, type NavState, type View } from '@/components/Sidebar';
import { Topbar } from '@/components/Topbar';
import { ManagerDashboard } from '@/components/ManagerDashboard';
import { LeadManagement } from '@/components/LeadManagement';
import { SalesWorkspace } from '@/components/SalesWorkspace';
import { LeadDetail } from '@/components/LeadDetail';
import { Analytics } from '@/components/Analytics';

const titles: Record<View, { title: string; subtitle: string }> = {
  dashboard: { title: 'Manager Dashboard', subtitle: 'Execution intelligence across your sales floor' },
  leads: { title: 'Lead Management', subtitle: 'Create, assign, and reassign leads' },
  workspace: { title: 'Sales Workspace', subtitle: 'Your assigned leads, prioritized by risk and follow-up' },
  analytics: { title: 'Analytics & Reports', subtitle: 'Call activity, conversion, and performance insights' },
  detail: { title: 'Lead Detail', subtitle: 'Call tracking, outcomes, and risk intelligence' },
};

function Shell() {
  const [nav, setNav] = useState<NavState>({ view: 'dashboard' });

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
