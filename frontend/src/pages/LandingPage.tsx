import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, 
  ArrowRight, 
  Car, 
  Shirt, 
  Utensils, 
  Cpu, 
  Lock, 
  ChevronDown,
  ShieldCheck,
  Play,
  X
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import LoginModal from '../components/LoginModal';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [industriesDropdownOpen, setIndustriesDropdownOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [showDemoModal, setShowDemoModal] = useState(false);

  const industries = [
    {
      title: 'Automotive',
      desc: 'Zero-defect stamping, powertrain precision, and automated quality control',
      icon: Car,
    },
    {
      title: 'Textiles and Apparels',
      desc: 'High-speed weaving anomaly detection, dye consistency, and yarn tension telemetry',
      icon: Shirt,
    },
    {
      title: 'Food Processing',
      desc: 'Continuous pasteurization monitoring, sealing defect prevention, and HACCP safety',
      icon: Utensils,
    },
    {
      title: 'Electronics and IT Hardware',
      desc: 'SMT component placement validation, solder joint inspection, and PCB yield control',
      icon: Cpu,
    },
  ];

  const handleOpenAuth = (mode: 'login' | 'signup' = 'login') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans">
      {/* Landing Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 rounded-lg bg-[#0f172a] text-white flex items-center justify-center font-bold">
              <Activity className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-base font-bold text-slate-900 tracking-tight">
              AnomIQ<span className="text-blue-600 font-medium text-xs px-1.5 py-0.5 rounded bg-blue-50 ml-1 border border-blue-200">AI</span>
            </span>
          </div>

          {/* Center Links with Hover Dropdown for Target Industries */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
            {/* Target Industries Hover Menu */}
            <div 
              className="relative"
              onMouseEnter={() => setIndustriesDropdownOpen(true)}
              onMouseLeave={() => setIndustriesDropdownOpen(false)}
            >
              <button 
                className="flex items-center gap-1 hover:text-slate-900 py-2 transition-colors cursor-pointer"
                onClick={() => setIndustriesDropdownOpen(!industriesDropdownOpen)}
              >
                <span>Target Industries</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${industriesDropdownOpen ? 'rotate-180 text-slate-900' : ''}`} />
              </button>

              {/* Hover Dropdown Card showing the 4 industries */}
              {industriesDropdownOpen && (
                <div className="absolute top-8 left-0 w-80 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl animate-in fade-in duration-150 z-50">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Supported Industries
                  </div>
                  <div className="space-y-2">
                    {industries.map((ind) => {
                      const Icon = ind.icon;
                      return (
                        <div 
                          key={ind.title}
                          className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800 shrink-0 mt-0.5">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-900">{ind.title}</div>
                            <div className="text-[11px] text-slate-500 line-clamp-1">{ind.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <a href="#impact" className="hover:text-slate-900 transition-colors">Business Impact</a>
          </nav>

          {/* Auth Action Buttons */}
          <div className="flex items-center gap-2.5">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleOpenAuth('login')}
              className="text-xs text-slate-700 hover:text-slate-900"
            >
              <Lock className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Sign In
            </Button>

            <Button
              variant="dark"
              size="sm"
              onClick={() => handleOpenAuth('signup')}
              className="text-xs bg-[#0f172a] text-white hover:bg-slate-800 px-4"
            >
              Sign Up
            </Button>

            <Button
              variant="glow"
              size="sm"
              onClick={() => navigate('/app')}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-4 ml-1"
            >
              Console <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
        <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
          <Badge variant="blue">Autonomous Quality Intelligence</Badge>
        </div>

        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
          Autonomous Manufacturing <br className="hidden sm:inline" />
          <span className="text-blue-600">Operations &amp; CAPA Platform</span>
        </h1>

        <p className="mt-5 text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Real-time failure detection, 5-Whys root-cause inquiry, and automated compliance action plans for shopfloor engineering teams.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button
            variant="dark"
            size="lg"
            onClick={() => navigate('/app')}
            className="text-xs font-semibold bg-[#0f172a] text-white hover:bg-slate-800 px-6 gap-2"
          >
            Launch Operations Console
            <ArrowRight className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowDemoModal(true)}
            className="text-xs font-medium text-slate-700 hover:text-slate-900 px-6"
          >
            <Play className="w-3.5 h-3.5 mr-1.5 text-slate-500 fill-slate-500" />
            Watch Product Tour
          </Button>
        </div>

        {/* Target Industries Grid */}
        <div id="industries" className="mt-20 text-left">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h2 className="text-2xl font-bold text-slate-900">Target Industries</h2>
            <p className="text-xs text-slate-500 mt-1">
              Hover over "Target Industries" in the top bar or view the sectors below
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {industries.map((ind) => {
              const Icon = ind.icon;
              return (
                <div key={ind.title} className="console-card p-5 space-y-2 hover:border-slate-300 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-800">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{ind.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{ind.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Business Impact */}
        <div id="impact" className="mt-20 console-card p-8 text-left bg-gradient-to-br from-slate-900 to-[#0f172a] text-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5 space-y-3">
              <Badge variant="blue" className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                Measurable Impact
              </Badge>
              <h2 className="text-2xl font-bold text-white leading-tight">
                Value Delivered to Manufacturing Operations
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Automated 3-pillar CAPA synthesis slashes downtime, eliminates manual paperwork bottlenecks, and guarantees continuous audit readiness.
              </p>
            </div>

            <div className="lg:col-span-7 grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/10 border border-white/10">
                <div className="text-2xl font-extrabold text-blue-400 font-mono">40-60%</div>
                <div className="text-xs font-semibold text-white mt-1">Faster Resolution</div>
                <div className="text-[11px] text-slate-300 mt-0.5">Automated CAPA synthesis</div>
              </div>
              <div className="p-4 rounded-xl bg-white/10 border border-white/10">
                <div className="text-2xl font-extrabold text-emerald-400 font-mono">100%</div>
                <div className="text-xs font-semibold text-white mt-1">Audit Readiness</div>
                <div className="text-[11px] text-slate-300 mt-0.5">Compliance action plans</div>
              </div>
              <div className="p-4 rounded-xl bg-white/10 border border-white/10">
                <div className="text-2xl font-extrabold text-amber-400 font-mono">-35%</div>
                <div className="text-xs font-semibold text-white mt-1">Operational Risk</div>
                <div className="text-[11px] text-slate-300 mt-0.5">Zero orphaned defect logs</div>
              </div>
              <div className="p-4 rounded-xl bg-white/10 border border-white/10">
                <div className="text-2xl font-extrabold text-purple-400 font-mono">15-25%</div>
                <div className="text-xs font-semibold text-white mt-1">Productivity Increase</div>
                <div className="text-[11px] text-slate-300 mt-0.5">Engineers focus on uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clean Minimal Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div>
            © {new Date().getFullYear()} AnomIQ Platform. All rights reserved.
          </div>
          <div className="text-slate-400 text-[11px] flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Autonomous Quality &amp; Remediation Platform</span>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <LoginModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
      />

      {/* Demo Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Play className="w-3.5 h-3.5 text-blue-600 fill-blue-600 ml-0.5" />
                </div>
                <h4 className="text-lg font-semibold text-slate-900">How AnomIQ Works</h4>
              </div>
              <button 
                onClick={() => setShowDemoModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3 text-sm text-slate-600 font-light">
              <p>
                <strong>1. Telemetric Ingestion:</strong> Continuous sensor streams detect temperature, vibration, and pressure drifts in real time.
              </p>
              <p>
                <strong>2. Socratic 5-Whys Inquiry:</strong> Shopfloor engineers conduct interactive root-cause investigation.
              </p>
              <p>
                <strong>3. Automated 8D CAPA:</strong> Gemini synthesizes containment, corrective, and preventive action protocols with exportable ISO 9001 compliance PDFs.
              </p>
            </div>
            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setShowDemoModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowDemoModal(false);
                  navigate('/app');
                }}
                className="px-5 py-2 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full shadow-sm cursor-pointer"
              >
                Launch Live App
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default LandingPage;
