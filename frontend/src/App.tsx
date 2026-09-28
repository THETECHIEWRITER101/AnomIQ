import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import CreateAnomalyModal from './components/CreateAnomalyModal';
import SupabaseLogsModal from './components/SupabaseLogsModal';
import Dashboard from './pages/Dashboard';
import Anomalies from './pages/Anomalies';
import CapaReview from './pages/CapaReview';
import Analytics from './pages/Analytics';

export default function App() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [isLogsModalOpen, setLogsModalOpen] = useState(false);

  // Global industrial shopfloor keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shift + N to open Log Anomaly Modal
      if (e.shiftKey && (e.key === 'N' || e.key === 'n')) {
        e.preventDefault();
        setCreateModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-slate-50 font-sans flex text-slate-900">
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
              <Route
                path="/"
                element={<Dashboard onOpenCreateModal={() => setCreateModalOpen(true)} />}
              />
              <Route path="/anomalies" element={<Anomalies />} />
              <Route path="/capa" element={<CapaReview />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {/* Production Footer */}
          <footer className="border-t border-slate-200 bg-white py-4 px-6 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">AnomIQ Platform</span>
              <span>&bull;</span>
              <span>Gemini 2.5 Flash & Supabase Engine</span>
              <span>&bull;</span>
              <span className="font-mono text-[11px] text-slate-400">v1.0.0-production</span>
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
    </BrowserRouter>
  );
}
