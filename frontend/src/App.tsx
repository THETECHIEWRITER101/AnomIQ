import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import CreateAnomalyModal from './components/CreateAnomalyModal';
import Dashboard from './pages/Dashboard';
import Anomalies from './pages/Anomalies';
import CapaReview from './pages/CapaReview';
import Analytics from './pages/Analytics';

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Global industrial shopfloor keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shift + N to open Log Anomaly Modal
      if (e.shiftKey && (e.key === 'N' || e.key === 'n')) {
        e.preventDefault();
        setIsModalOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-orange-500/30 selection:text-orange-200">
        {/* Sticky Header */}
        <Navbar onOpenCreateModal={() => setIsModalOpen(true)} />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard onOpenCreateModal={() => setIsModalOpen(true)} />} />
            <Route path="/anomalies" element={<Anomalies />} />
            <Route path="/capa" element={<CapaReview />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Create Anomaly Modal */}
        <CreateAnomalyModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            window.dispatchEvent(new Event('anomaly-created'));
          }}
        />

        {/* Footer */}
        <footer className="border-t border-zinc-900 bg-zinc-950 py-6 text-center text-xs text-zinc-600 flex flex-col sm:flex-row items-center justify-between max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 gap-2">
          <p>
            AnomIQ &bull; Sistec Innovation Hackathon (SIH) 2026 &bull; Distributed Manufacturing AI Platform
          </p>
          <div className="flex items-center gap-2 text-[11px] text-zinc-500">
            <span>Terminal Shortcut:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 font-mono text-zinc-400">Shift + N</kbd>
            <span>Log Anomaly</span>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
