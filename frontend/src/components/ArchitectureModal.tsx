import React from 'react';
import { X, Server, Cloud, Terminal, Cpu, Globe } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 md:p-8 shadow-2xl relative text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="blue">Project Reference: IS-2</Badge>
          <Badge variant="slate">Netlink Software Pvt. Ltd.</Badge>
        </div>
        <h3 className="text-xl font-bold text-slate-900">System Architecture & Deployment Guide</h3>
        <p className="text-xs text-slate-500 mt-0.5 mb-5">
          Decoupled Single Page Application architecture connecting React with FastAPI, Supabase, Google Gemini, Render, and Vercel.
        </p>

        {/* Stack Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mb-5">
          {/* Frontend */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-900 text-xs font-bold">
              <Globe className="w-4 h-4 text-blue-600" />
              Frontend UI (Vercel SPA)
            </div>
            <ul className="text-xs text-slate-600 space-y-1 font-mono">
              <li>• Framework: Vite + React 19+ (TypeScript)</li>
              <li>• Styling: Tailwind CSS (Light Minimal Theme)</li>
              <li>• Data Viz: Recharts (Line variance & Donut)</li>
              <li>• Routing: React Router v7 SPA routes</li>
            </ul>
          </div>

          {/* Backend */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-900 text-xs font-bold">
              <Server className="w-4 h-4 text-indigo-600" />
              Backend API (Render Web Service)
            </div>
            <ul className="text-xs text-slate-600 space-y-1 font-mono">
              <li>• Framework: Python FastAPI + Uvicorn</li>
              <li>• Validation: Pydantic v2 schemas</li>
              <li>• Database: Supabase Cloud PostgreSQL</li>
              <li>• Connection: Transaction Pooler (Port 6543)</li>
            </ul>
          </div>

          {/* AI Engine */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-900 text-xs font-bold">
              <Cpu className="w-4 h-4 text-amber-600" />
              AI Engine (Google Gemini)
            </div>
            <ul className="text-xs text-slate-600 space-y-1 font-mono">
              <li>• Models: gemini-3.8-flash</li>
              <li>• 3 Pillars: Containment, Corrective, Preventive</li>
              <li>• Standard: ISO 9001:2015 Clause 10.2 / IATF</li>
            </ul>
          </div>

          {/* Cloud & Hosting */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
            <div className="flex items-center gap-2 text-slate-900 text-xs font-bold">
              <Cloud className="w-4 h-4 text-emerald-600" />
              Hosting & Database
            </div>
            <ul className="text-xs text-slate-600 space-y-1 font-mono">
              <li>• Frontend: Vercel (Auto Git deploy)</li>
              <li>• Backend: Render (Docker/Python service)</li>
              <li>• Database: Supabase (Managed Cloud PostgreSQL)</li>
            </ul>
          </div>
        </div>

        {/* Quick Commands */}
        <div className="p-4 rounded-xl bg-slate-900 text-slate-100 space-y-2.5 font-mono text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-semibold">
            <Terminal className="w-4 h-4" />
            Quick Run Commands:
          </div>
          <div className="text-slate-300 space-y-1">
            <div className="text-slate-500"># Backend</div>
            <div>cd backend && uvicorn main:app --reload --port 8000</div>
            <div className="text-slate-500 pt-1"># Frontend</div>
            <div>cd frontend && npm run dev</div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-end">
          <Button variant="dark" size="sm" onClick={onClose} className="text-xs">
            Close Guide
          </Button>
        </div>
      </div>
    </div>
  );
};
export default ArchitectureModal;
