import { useState } from 'react';
import { useAuthStore } from '../store/auth.store';
import { LeadList } from '../components/leads/LeadList';
import { LeadModal } from '../components/leads/LeadModal';

export function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-brand">
          <span className="brand-dot" />
          <h1>Lead Workflow</h1>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            + New Lead
          </button>
          <button className="btn btn-ghost" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="section-header">
          <h2>Leads</h2>
          <p className="section-hint">Click a row to see the workflow breakdown.</p>
        </div>
        <LeadList />
      </main>

      <LeadModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
