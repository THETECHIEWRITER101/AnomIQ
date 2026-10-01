import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CreateAnomalyModal from './components/CreateAnomalyModal';
import SupabaseLogsModal from './components/SupabaseLogsModal';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Anomalies from './pages/Anomalies';
import CapaReview from './pages/CapaReview';
import Analytics from './pages/Analytics';
import NotificationAlerts from './pages/NotificationAlerts';

import JudgeDemoBar from './components/JudgeDemoBar';

// App Console Layout wrapping internal operational pages
function AppConsoleLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isLogsModalOpen, setLogsModalOpen] = useState(false);

  // Global industrial shopfloor keyboard shortcuts (Shift + N)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === 'N' || e.key === 'n')) {
        e.preventDefault();
        setCreateModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col text-slate-900">
      {/* Top Floating Judge Demo Switcher Bar */}
      <JudgeDemoBar />

      <div className="flex-1 flex text-slate-900">
        {/* Responsive Left Sidebar (Global Page Navigation) */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onOpenCreateModal={() => setCreateModalOpen(true)}
          onOpenLogsModal={() => setLogsModalOpen(true)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:min-w-0 min-h-screen">
          {/* Top Sticky Header */}
          <Header
            onToggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
            onOpenCreateModal={() => setCreateModalOpen(true)}
          />

        {/* Workspace Container */}
        <main className="p-4 md:p-8 flex-1 overflow-auto bg-slate-50">
          <Routes>
            <Route path="/" element={<Dashboard onOpenCreateModal={() => setCreateModalOpen(true)} />} />
            <Route path="/dashboard" element={<Dashboard onOpenCreateModal={() => setCreateModalOpen(true)} />} />
            <Route path="/alerts" element={<NotificationAlerts />} />
            <Route path="/anomalies" element={<Anomalies />} />
            <Route path="/capa" element={<CapaReview />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Production Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">AnomIQ Operations Platform</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <span>Terminal Shortcut:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-slate-700 font-medium">
              Shift + N
            </kbd>
            <span>Log Anomaly</span>
          </div>
        </footer>
      </div>
    </div>

      {/* Global Create Anomaly Modal */}
      <CreateAnomalyModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={() => {
          window.dispatchEvent(new Event('anomaly-created'));
        }}
      />

      {/* Supabase & Render Logs Terminal Modal */}
      <SupabaseLogsModal
        isOpen={isLogsModalOpen}
        onClose={() => setLogsModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public SaaS Landing Page */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />

        {/* Operational Shopfloor Console */}
        <Route path="/app/*" element={<AppConsoleLayout />} />
        <Route path="/dashboard/*" element={<Navigate to="/app" replace />} />
        <Route path="/anomalies" element={<Navigate to="/app/anomalies" replace />} />
        <Route path="/capa" element={<Navigate to="/app/capa" replace />} />
        <Route path="/analytics" element={<Navigate to="/app/analytics" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
