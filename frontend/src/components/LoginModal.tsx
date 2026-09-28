import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, ShieldCheck, User, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess?: (user: { name: string; role: string; email: string }) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleLogin = (userEmail: string, userName?: string, userRole?: string) => {
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
    }, 700);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide an email address.');
      return;
    }
    handleLogin(email);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 overflow-hidden animate-fade-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center mb-3">
            <div className="w-4 h-4 rounded-full bg-brand-500" />
          </div>
          <h3 className="text-2xl font-semibold text-slate-900 tracking-tight">Sign in to AnomIQ</h3>
          <p className="text-sm text-slate-500 mt-1 font-light">
            Human-centric anomaly management & collaborative workspace
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        {/* 1-Click Quick Demo Sign-in */}
        <div className="mb-6 space-y-2.5">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Instant Demo Sign-in (1-Click)
          </span>
          <div className="space-y-2">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                type="button"
                disabled={isLoading}
                onClick={() => handleLogin(account.email, account.name, account.role)}
                className="w-full flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-brand-500 hover:bg-brand-50/40 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full ${account.color} flex items-center justify-center font-semibold text-xs`}>
                    {account.initials}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900 group-hover:text-brand-600 transition-colors">
                      {account.name}
                    </p>
                    <p className="text-[11px] text-slate-500">{account.role}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-slate-400 uppercase font-medium">Or enter credentials</span>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Work Email</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-slate-700">Password</label>
              <span className="text-[11px] text-brand-600 hover:underline cursor-pointer">
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
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-full text-white bg-brand-500 hover:bg-brand-600 transition-all font-medium text-sm shadow-md shadow-brand-500/20 disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              <span>Sign In to Console</span>
            )}
          </button>
        </form>

        {/* Security assurance */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-light">
          <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
          <span>SSO & Enterprise ISO 9001 / SOC-2 Compliant</span>
        </div>
      </div>
    </div>
  );
};
export default LoginModal;
