import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Play, 
  Sparkles, 
  Users, 
  MessageSquare, 
  Smile, 
  CheckCircle2, 
  Activity, 
  ShieldCheck, 
  Server, 
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import LoginModal from '../components/LoginModal';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'signup'>('login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDemoModal, setShowDemoModal] = useState(false);

  return (
    <div className="bg-white text-slate-800 flex flex-col min-h-screen selection:bg-brand-100 selection:text-brand-900">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
              className="flex-shrink-0 flex items-center gap-2.5 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-brand-500"></div>
              </div>
              <span className="font-semibold text-xl tracking-tight text-slate-900">AnomIQ</span>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <a href="#product" className="text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium">Product</a>
              <a href="#solutions" className="text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium">Solutions</a>
              <a href="#stories" className="text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium">Customer Stories</a>
              <a href="#pricing" className="text-slate-500 hover:text-slate-900 transition-colors text-sm font-medium">Pricing</a>
            </nav>

            {/* CTA Buttons with Login & Sign Up Options */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setAuthInitialMode('login');
                  setIsLoginOpen(true);
                }}
                className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium px-3.5 py-2 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                Log In
              </button>

              <button
                onClick={() => {
                  setAuthInitialMode('signup');
                  setIsLoginOpen(true);
                }}
                className="hidden sm:inline-flex items-center justify-center px-4 py-2 border border-slate-200 text-xs sm:text-sm font-medium rounded-full text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
              >
                Sign Up
              </button>

              <button
                onClick={() => navigate('/app')}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-full text-white bg-brand-500 hover:bg-brand-600 transition-colors shadow-sm shadow-brand-500/20 cursor-pointer"
              >
                Launch App
              </button>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100 focus:outline-none cursor-pointer"
              >
                {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-100 px-4 pt-2 pb-6 space-y-3">
            <a 
              href="#product" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium"
            >
              Product
            </a>
            <a 
              href="#solutions" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium"
            >
              Solutions
            </a>
            <a 
              href="#stories" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium"
            >
              Customer Stories
            </a>
            <a 
              href="#pricing" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium"
            >
              Pricing
            </a>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsLoginOpen(true);
                }}
                className="w-full py-2.5 rounded-full text-sm font-medium text-slate-700 border border-slate-200 text-center"
              >
                Log In
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsLoginOpen(true);
                }}
                className="w-full py-2.5 rounded-full text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 text-center shadow-sm"
              >
                Book Demo
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative pt-16 sm:pt-20 pb-24 sm:pb-28 overflow-hidden bg-brand-50/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center text-center lg:text-left">
              
              {/* Hero Content */}
              <div className="lg:col-span-6 flex flex-col justify-center space-y-8">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-slate-900 leading-[1.1]">
                  Empowering your team with <span className="text-brand-500">clear anomaly insights</span>
                </h1>

                <p className="text-lg sm:text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light">
                  AnomIQ helps your people identify, understand, and resolve anomalies without the noise. Because the best incident management relies on human context, not just machine alerts.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className="inline-flex items-center justify-center px-6 py-3.5 border border-transparent text-base font-medium rounded-full text-white bg-brand-500 hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 cursor-pointer"
                  >
                    Get Started Free
                  </button>

                  <button
                    onClick={() => setShowDemoModal(true)}
                    className="inline-flex items-center justify-center px-6 py-3.5 border border-slate-200 text-base font-medium rounded-full text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all cursor-pointer shadow-xs"
                  >
                    <Play className="w-4 h-4 mr-2 text-slate-400 fill-slate-400" />
                    See how it works
                  </button>
                </div>

                {/* Trust Metrics */}
                <div className="pt-4 flex items-center justify-center lg:justify-start gap-8 text-xs text-slate-400 border-t border-slate-200/60 font-light">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>0-Noise Alarm Filtering</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-brand-500" />
                    <span>ISO 9001 & OSHA Audit Ready</span>
                  </div>
                </div>
              </div>

              {/* Hero Image (Human-Centric & Interactive Floating Mockup) */}
              <div className="lg:col-span-6 mt-16 lg:mt-0 relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-brand-100 to-white rounded-[2.5rem] transform rotate-3 scale-105 opacity-50 blur-xl"></div>
                
                {/* Visual Card Mockup */}
                <div className="relative w-full rounded-[2rem] shadow-2xl shadow-slate-200/60 object-cover aspect-[4/3] border border-white/60 bg-gradient-to-br from-slate-900 to-slate-950 p-6 flex flex-col justify-between text-left overflow-hidden">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-xs font-mono text-slate-300">SMT Surface Mount Line 1</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-red-950 text-red-400 border border-red-900">
                      CRITICAL VARIANCE
                    </span>
                  </div>

                  <div className="space-y-3 py-4">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-slate-400">Reflow Peak Temperature</span>
                      <span className="font-mono text-red-400 font-bold text-base">268.4 °C</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-red-500 h-full w-[85%] rounded-full"></div>
                    </div>
                    <p className="text-xs text-slate-400 font-light">
                      AI Diagnostic: Thermal drift in Zone 3 thermocouple identified. Solder bridging risk mitigated with automated 8D CAPA recommendation.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Synthesized via Gemini 2.5 Flash</span>
                    <button 
                      onClick={() => navigate('/app')}
                      className="text-brand-400 hover:text-brand-300 flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <span>Open in Console</span>
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
                
                {/* Floating UI Element Mockup (Human Context) */}
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 hidden sm:flex animate-fade-in">
                  <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center font-semibold text-brand-600 text-sm">
                    SJ
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Sarah assigned an issue</p>
                    <p className="text-xs text-slate-500">"Let's review this spike together."</p>
                  </div>
                </div>

                {/* Floating Telemetry Badge */}
                <div className="absolute -top-4 -right-4 bg-white/95 backdrop-blur-xs px-3.5 py-2 rounded-xl shadow-lg border border-slate-100 flex items-center gap-2 hidden sm:flex text-xs">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-slate-700 font-medium">Shopfloor Team Connected</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Cards Grid (Designed for Humans) */}
        <section id="product" className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-brand-500 font-semibold tracking-wide text-sm uppercase mb-3">Designed for Humans</h2>
              <h3 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-6 tracking-tight">Built to foster clarity and teamwork</h3>
              <p className="text-lg text-slate-500 font-light">
                We believe technology should enhance your team's intuition, not replace it. AnomIQ brings the right people and data together exactly when you need them.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              {/* Feature Card 1 */}
              <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 hover:shadow-lg hover:shadow-slate-200/50 transition-all group flex flex-col h-full">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xs mb-6 text-brand-500 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-semibold text-slate-900 mb-3">Collaborative Resolution</h4>
                <p className="text-slate-500 font-light mb-6 flex-grow leading-relaxed">
                  Bring the right experts together instantly. Shared workspaces mean everyone sees the same context at the same time, from operators to plant leadership.
                </p>
                <div className="w-full h-40 bg-gradient-to-tr from-brand-100/60 to-slate-200/60 rounded-xl mt-auto shadow-xs flex flex-col items-center justify-center p-4 border border-brand-100/50 text-center">
                  <div className="flex -space-x-2 overflow-hidden mb-2">
                    <span className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-brand-500 text-white font-medium text-xs flex items-center justify-center">SJ</span>
                    <span className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-emerald-500 text-white font-medium text-xs flex items-center justify-center">DP</span>
                    <span className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-amber-500 text-white font-medium text-xs flex items-center justify-center">AR</span>
                  </div>
                  <span className="text-xs text-slate-600 font-medium">3 Shift Engineers Investigating Incident #101</span>
                </div>
              </div>

              {/* Feature Card 2 */}
              <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 hover:shadow-lg hover:shadow-slate-200/50 transition-all group flex flex-col h-full">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xs mb-6 text-brand-500 group-hover:scale-110 transition-transform">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-semibold text-slate-900 mb-3">Intuitive Context</h4>
                <p className="text-slate-500 font-light mb-6 flex-grow leading-relaxed">
                  Understand the <em>why</em> behind the alert. We provide clear, jargon-free narratives alongside raw telemetry and interactive 5-Whys Socratic inquiry.
                </p>
                <div className="w-full h-40 bg-white rounded-xl mt-auto shadow-xs p-3.5 border border-slate-200/80 flex flex-col justify-between text-left">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-brand-600 uppercase">Gemini 5-Whys Synthesis</span>
                    <p className="text-xs font-medium text-slate-800 line-clamp-2">
                      Thermocouple flux residue reduced thermal transfer coefficient by 18%.
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Confidence: 94.8% &bull; ISO 9001 Compliant</span>
                </div>
              </div>

              {/* Feature Card 3 */}
              <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100 hover:shadow-lg hover:shadow-slate-200/50 transition-all group flex flex-col h-full">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-xs mb-6 text-brand-500 group-hover:scale-110 transition-transform">
                  <Smile className="w-6 h-6" />
                </div>
                <h4 className="text-xl font-semibold text-slate-900 mb-3">Stress-Free Workflow</h4>
                <p className="text-slate-500 font-light mb-6 flex-grow leading-relaxed">
                  Designed to reduce alert fatigue. AnomIQ organizes anomalies so your team can focus on their well-being and what truly matters.
                </p>
                <div className="w-full h-40 bg-gradient-to-br from-white to-slate-100 rounded-xl mt-auto shadow-xs p-4 border border-slate-200/80 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Noise Filter Ratio</span>
                    <span className="font-semibold text-emerald-600">-64% False Alarms</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Mean Time to Resolve</span>
                    <span className="font-semibold text-brand-600">3.2 Hours avg</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Shift Fatigue Index</span>
                    <span className="font-semibold text-slate-800">Optimal (Low)</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Live System Capabilities Bar */}
        <section id="solutions" className="py-16 bg-slate-50 border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <p className="text-3xl sm:text-4xl font-semibold text-slate-900">99.8%</p>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-light">Telemetry Ingestion Reliability</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-semibold text-slate-900">&lt; 150ms</p>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-light">Subtle State Transitions</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-semibold text-slate-900">8D CAPA</p>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-light">ISO 9001 Audit Ready PDF</p>
              </div>
              <div>
                <p className="text-3xl sm:text-4xl font-semibold text-slate-900">Shift + N</p>
                <p className="text-xs sm:text-sm text-slate-500 mt-1 font-light">Terminal Defect Hotkey</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Call to Action Banner */}
        <section id="pricing" className="py-20 bg-brand-50">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-semibold text-slate-900 mb-6">Ready to bring clarity to your team?</h2>
            <p className="text-slate-500 mb-8 font-light text-lg max-w-2xl mx-auto">
              Join hundreds of forward-thinking teams using AnomIQ to humanize their incident response and eliminate shopfloor alarm noise.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={() => setIsLoginOpen(true)}
                className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base sm:text-lg font-medium rounded-full text-white bg-brand-600 hover:bg-brand-700 transition-all shadow-lg shadow-brand-600/30 cursor-pointer"
              >
                Book a personalized demo
              </button>
              <button
                onClick={() => navigate('/app')}
                className="inline-flex items-center justify-center px-8 py-4 border border-slate-300 text-base sm:text-lg font-medium rounded-full text-slate-800 bg-white hover:bg-slate-50 transition-all shadow-sm cursor-pointer"
              >
                Enter App Console
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 pt-16 pb-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-500"></div>
                </div>
                <span className="font-semibold text-lg tracking-tight text-slate-900">AnomIQ</span>
              </div>
              <p className="text-slate-400 text-sm font-light">
                Human-centric anomaly management designed for modern manufacturing and engineering teams.
              </p>
            </div>
            
            <div>
              <h5 className="font-medium text-slate-900 mb-4">Product</h5>
              <ul className="space-y-3 text-sm text-slate-500 font-light">
                <li><a href="#product" className="hover:text-brand-500 transition-colors">Features</a></li>
                <li><a href="#solutions" className="hover:text-brand-500 transition-colors">Integrations</a></li>
                <li><a href="#pricing" className="hover:text-brand-500 transition-colors">Pricing</a></li>
                <li><NavLink to="/app" className="hover:text-brand-500 transition-colors">Live App Console</NavLink></li>
              </ul>
            </div>

            <div>
              <h5 className="font-medium text-slate-900 mb-4">Company</h5>
              <ul className="space-y-3 text-sm text-slate-500 font-light">
                <li><a href="#" className="hover:text-brand-500 transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-brand-500 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-brand-500 transition-colors">Engineering Blog</a></li>
                <li><a href="#" className="hover:text-brand-500 transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h5 className="font-medium text-slate-900 mb-4">Legal</h5>
              <ul className="space-y-3 text-sm text-slate-500 font-light">
                <li><a href="#" className="hover:text-brand-500 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-brand-500 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-brand-500 transition-colors">Security & Compliance</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm font-light">
              &copy; 2026 AnomIQ Technologies. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-slate-400 hover:text-slate-500">
                <span className="sr-only">Twitter</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/></svg>
              </a>
              <a href="#" className="text-slate-400 hover:text-slate-500">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path fill-rule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clip-rule="evenodd"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Interactive Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        initialMode={authInitialMode}
        onClose={() => setIsLoginOpen(false)}
      />

      {/* Quick Demo Preview Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                  <Play className="w-3.5 h-3.5 text-brand-600 fill-brand-600 ml-0.5" />
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
                <strong>2. Human Context & 5-Whys:</strong> Floor operators speak voice memos or tap quick-response chips to drill down to true root cause.
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
                className="px-5 py-2 text-xs font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-full shadow-sm"
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
