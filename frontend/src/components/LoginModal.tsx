import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, ShieldCheck, User, Lock, Mail, Building, Sparkles } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onLoginSuccess?: (user: { name: string; role: string; email: string }) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onLoginSuccess,
}) => {
  const navigate = useNavigate();
  // By default, first enters login
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  
  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Sign up form state
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [plantRole, setPlantRole] = useState('Quality Engineer');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const demoAccounts = [
    {
      name: 'Sarah Jenkins',
      role: 'Quality Lead (SMT Line 1)',
      email: 'sarah.jenkins@anomiq.industrial',
      initials: 'SJ',
      color: 'bg-brand-100 text-brand-600',
    },
    {
      name: 'Dev Patel',
      role: 'Reliability Engineer (Line A)',
      email: 'dev.patel@anomiq.industrial',
      initials: 'DP',
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      name: 'Anita Roy',
      role: 'Shopfloor Lead (Robotics)',
      email: 'anita.roy@anomiq.industrial',
      initials: 'AR',
      color: 'bg-amber-100 text-amber-700',
    },
  ];

  const handleAuthenticate = (userEmail: string, userName?: string, userRole?: string) => {
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      setIsLoading(false);
      const authenticatedUser = {
        name: userName || (userEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase())),
        role: userRole || 'Operations Engineer',
        email: userEmail || 'engineer@anomiq.industrial',
      };

      try {
        localStorage.setItem('anomiq_user', JSON.stringify(authenticatedUser));
      } catch (e) {
        // LocalStorage fallback
      }

      if (onLoginSuccess) {
        onLoginSuccess(authenticatedUser);
      }
      onClose();
      navigate('/app');
    }, 600);
  };

  const onLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your work email.');
      return;
    }
    handleAuthenticate(email);
  };

  const onSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !signupEmail) {
      setError('Please provide your full name and work email.');
      return;
    }
    handleAuthenticate(signupEmail, fullName, plantRole);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 overflow-hidden animate-fade-in text-slate-800">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center mb-3">
            <div className="w-4 h-4 rounded-full bg-brand-500" />
          </div>
          <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">
            {mode === 'login' ? 'Log in to AnomIQ' : 'Create AnomIQ Account'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-light">
            {mode === 'login'
              ? 'Human-centric anomaly management & collaborative workspace'
              : 'Empower your shopfloor team with real-time anomaly intelligence'}
          </p>
        </div>

        {/* Primary Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-full mb-5 max-w-xs mx-auto border border-slate-200/60">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError(null);
            }}
            className={`flex-1 py-1.5 px-4 rounded-full text-xs font-medium transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`flex-1 py-1.5 px-4 rounded-full text-xs font-medium transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* 1. LOG IN VIEW (Default) */}
        {mode === 'login' && (
          <div className="space-y-5">
            {/* 1-Click Instant Demo Sign-in */}
            <div className="space-y-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Instant Demo Access (1-Click)
              </span>
              <div className="space-y-1.5">
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleAuthenticate(account.email, account.name, account.role)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 transition-all text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full ${account.color} flex items-center justify-center font-semibold text-xs`}>
                        {account.initials}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                          {account.name}
                        </p>
                        <p className="text-[10px] text-slate-500">{account.role}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                ))}
              </div>
            </div>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100"></div>
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="bg-white px-2 text-slate-400 uppercase font-medium">Or enter credentials</span>
              </div>
            </div>

            {/* Credentials Login Form */}
            <form onSubmit={onLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-medium text-slate-700">Password</label>
                  <span className="text-[10px] text-brand-600 hover:underline cursor-pointer">
                    Forgot?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full text-white bg-brand-500 hover:bg-brand-600 transition-all font-medium text-xs sm:text-sm shadow-md shadow-brand-500/20 disabled:opacity-50 mt-2 cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  <span>Log In to Console</span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* 2. SIGN UP VIEW */}
        {mode === 'signup' && (
          <form onSubmit={onSignupSubmit} className="space-y-3">
            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex Morgan"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  placeholder="name@facility.com"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Create Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Minimum 8 characters"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-700 mb-1">Facility Role / Line</label>
              <div className="relative">
                <Building className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                <select
                  value={plantRole}
                  onChange={(e) => setPlantRole(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors cursor-pointer"
                >
                  <option value="Quality Assurance Engineer">Quality Assurance Engineer</option>
                  <option value="SMT Line Supervisor">SMT Line Supervisor</option>
                  <option value="Reliability & Maintenance Engineer">Reliability & Maintenance Engineer</option>
                  <option value="Plant Operations Manager">Plant Operations Manager</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full text-white bg-brand-500 hover:bg-brand-600 transition-all font-medium text-xs sm:text-sm shadow-md shadow-brand-500/20 disabled:opacity-50 mt-3 cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Creating workspace account...
                </span>
              ) : (
                <span>Create Account & Enter Console</span>
              )}
            </button>
          </form>
        )}

        {/* Beneath Options: Sign In / Sign Up Switcher */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{mode === 'login' ? "Don't have an account?" : "Already registered?"}</span>
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-full border border-slate-200/60">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-brand-500 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-brand-500 text-white shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Security assurance */}
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-light">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>SSO & Enterprise ISO 9001 / SOC-2 Compliant</span>
        </div>
      </div>
    </div>
  );
};
export default LoginModal;
