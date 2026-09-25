import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import CreateAnomalyModal from './components/CreateAnomalyModal';
import Dashboard from './pages/Dashboard';
import Anomalies from './pages/Anomalies';
import CapaReview from './pages/CapaReview';
import Analytics from './pages/Analytics';

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

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
            // Can trigger a refresh or window event if needed
            window.dispatchEvent(new Event('anomaly-created'));
          }}
        />

        {/* Footer */}
        <footer className="border-t border-zinc-900 bg-zinc-950 py-6 text-center text-xs text-zinc-600">
          <p>
            AnomIQ &bull; Smart India Hackathon 2026 &bull; Distributed Manufacturing AI Platform
          </p>
        </footer>
      </div>
    </BrowserRouter>
  );
}
