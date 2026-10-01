import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ArrowRight, ShieldCheck, User, Lock, Mail, Building2, Sparkles, Plus, Key } from 'lucide-react';
import { apiClient } from '../services/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onLoginSuccess?: (user: { id?: number | string; name: string; role: string; email: string; facility_id?: any; facility_name?: string; facility_code?: string }) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onLoginSuccess,
}) => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  
  // Login form state
  const [email, setEmail] = useState('');
  const [loginFacilityCode, setLoginFacilityCode] = useState('');
  const [password, setPassword] = useState('');
  
  // Sign up form state
  const [fullName, setFullName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  
  // Facility Onboarding state
  const [facilityMode, setFacilityMode] = useState<'create' | 'join'>('create');
  const [facilityName, setFacilityName] = useState('');
  const [facilityCode, setFacilityCode] = useState('');
  const [joinFacilityCode, setJoinFacilityCode] = useState('');
  const [facilityIndustry, setFacilityIndustry] = useState('AUTOMOTIVE');
  const [existingFacilities, setExistingFacilities] = useState<Array<{ id: any; name: string; code: string }>>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<any>(null);

  // Role state (Custom Role addition supported)
  const [plantRole, setPlantRole] = useState('Quality Assurance Engineer');
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [customRoleText, setCustomRoleText] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch facilities list when opening or switching to signup
  useEffect(() => {
    if (isOpen) {
      fetch('/api/facilities')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setExistingFacilities(data);
            if (data.length > 0) {
              setSelectedFacilityId(data[0].id);
              if (!joinFacilityCode) setJoinFacilityCode(data[0].code);
            }
          }
        })
        .catch(() => {});
    }
  }, [isOpen, mode]);

  if (!isOpen) return null;

  const demoAccounts = [
    {
      name: 'Sarah Jenkins',
      role: 'Facility Admin',
      email: 'sarah.jenkins@anomiq.industrial',
      facility_name: 'Apex Robotics Plant 1',
      facility_code: 'FAC-APEX-01',
      facility_id: 1,
      initials: 'SJ',
      color: 'bg-brand-100 text-brand-600',
    },
    {
      name: 'Dev Patel',
      role: 'Operations Manager',
      email: 'dev.patel@anomiq.industrial',
      facility_name: 'Apex Robotics Plant 1',
      facility_code: 'FAC-APEX-01',
      facility_id: 1,
      initials: 'DP',
      color: 'bg-emerald-100 text-emerald-700',
    },
    {
      name: 'Anita Roy',
      role: 'SMT Line Supervisor',
      email: 'anita.roy@anomiq.industrial',
      facility_name: 'Apex Electronics Line 2',
      facility_code: 'FAC-APEX-02',
      facility_id: 2,
      initials: 'AR',
      color: 'bg-amber-100 text-amber-700',
    },
  ];

  const handleAuthenticate = async (
    userEmail: string,
    facCodeReq?: string,
    userName?: string,
    userRole?: string,
    facId?: any,
    facName?: string
  ) => {
    setIsLoading(true);
    setError(null);

    const effectiveRole = isCustomRole ? customRoleText : (userRole || 'Quality Assurance Engineer');

    try {
      let backendUser = null;
      if (mode === 'signup') {
        const payload = {
          full_name: userName || fullName,
          email: userEmail || signupEmail,
          role: effectiveRole,
          facility_id: facilityMode === 'join' ? selectedFacilityId : null,
          facility_name: facilityMode === 'create' ? facilityName : null,
          facility_code: facilityMode === 'create' ? facilityCode : (facCodeReq || joinFacilityCode),
          facility_industry: facilityIndustry,
        };
        const res = await apiClient.post('/api/users/signup', payload);
        backendUser = res.data;
      } else {
        const payload = {
          email: userEmail || email,
          facility_code: facCodeReq || loginFacilityCode,
        };
        const res = await apiClient.post('/api/users/login', payload);
        backendUser = res.data;
      }

      const authenticatedUser = {
        id: backendUser?.id || Math.floor(Math.random() * 1000) + 1,
        name: backendUser?.full_name || userName || userEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        role: backendUser?.role || effectiveRole,
        email: backendUser?.email || userEmail,
        facility_id: backendUser?.facility_id || facId || selectedFacilityId || 1,
        facility_name: backendUser?.facility_name || facName || facilityName || 'Apex Electronics Plant',
        facility_code: backendUser?.facility_code || facCodeReq || facilityCode || 'FAC-1001',
      };

      try {
        localStorage.setItem('anomiq_user', JSON.stringify(authenticatedUser));
      } catch (e) {}

      if (onLoginSuccess) {
        onLoginSuccess(authenticatedUser);
      }
      setIsLoading(false);
      onClose();
      navigate('/app');
    } catch (err: any) {
      setIsLoading(false);
      let errMsg = err?.response?.data?.detail || err?.message || 'Authentication error';
      if (errMsg === 'Network Error' || err?.code === 'ERR_NETWORK') {
        errMsg = 'Backend server is not reachable on http://localhost:8000. Please ensure the FastAPI backend is running (python backend/main.py).';
      }
      setError(errMsg);
    }
  };

  const onLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginFacilityCode.trim()) {
      setError('Facility ID is required to log in.');
      return;
    }
    if (!email.trim()) {
      setError('Work Email is required.');
      return;
    }
    handleAuthenticate(email, loginFacilityCode);
  };

  const onSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !signupEmail) {
      setError('Please provide your full name and work email.');
      return;
    }
    if (facilityMode === 'create') {
      if (!facilityName.trim()) {
        setError('Please enter your Facility Name.');
        return;
      }
      if (!facilityCode.trim()) {
        setError('Please assign a unique Facility ID (Code) for your new facility.');
        return;
      }
    } else {
      if (!joinFacilityCode.trim() && !selectedFacilityId) {
        setError('Please enter or select a registered Facility ID.');
        return;
      }
    }
    if (isCustomRole && !customRoleText.trim()) {
      setError('Please specify your custom role name.');
      return;
    }
    handleAuthenticate(signupEmail, facilityMode === 'create' ? facilityCode : joinFacilityCode, fullName, plantRole);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-8 overflow-hidden my-8 text-slate-800">
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
            {mode === 'login' ? 'Log in to Facility Workspace' : 'Create Organization Workspace'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-light">
            {mode === 'login'
              ? 'Enter registered Facility ID and work email to authenticate'
              : 'Setup your facility organization & team role permissions'}
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

        {/* 1. LOG IN VIEW */}
        {mode === 'login' && (
          <div className="space-y-5">
            {/* 1-Click Instant Demo Sign-in */}
            <div className="space-y-2">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Instant Demo Role Access (1-Click)
              </span>
              <div className="space-y-1.5">
                {demoAccounts.map((account) => (
                  <button
                    key={account.email}
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleAuthenticate(account.email, account.facility_code, account.name, account.role, account.facility_id, account.facility_name)}
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
                        <p className="text-[10px] text-slate-500">{account.role} • {account.facility_name} ({account.facility_code})</p>
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
                <span className="bg-white px-2 text-slate-400 uppercase font-medium">Or enter facility credentials</span>
              </div>
            </div>

            {/* Credentials Login Form */}
            <form onSubmit={onLoginSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Registered Facility ID *</label>
                <div className="relative">
                  <Key className="absolute left-3.5 top-3 w-4 h-4 text-brand-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. FAC-APEX-01 or FAC-1001"
                    value={loginFacilityCode}
                    onChange={(e) => setLoginFacilityCode(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Registered Work Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="name@facility.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-medium text-slate-700">Password</label>
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
                    Authenticating facility credentials...
                  </span>
                ) : (
                  <span>Log In to Facility Console</span>
                )}
              </button>
            </form>
          </div>
        )}

        {/* 2. SIGN UP VIEW (FACILITY ONBOARDING & ADMIN AUTO-ASSIGNMENT) */}
        {mode === 'signup' && (
          <form onSubmit={onSignupSubmit} className="space-y-4">
            {/* Step A: Facility / Organization Onboarding */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-brand-500" />
                  Step 1: Organization / Facility
                </span>
                <div className="flex bg-slate-200 p-0.5 rounded-lg text-[10px]">
                  <button
                    type="button"
                    onClick={() => setFacilityMode('create')}
                    className={`px-2 py-1 rounded-md font-medium transition-all ${
                      facilityMode === 'create' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    + Create Facility
                  </button>
                  <button
                    type="button"
                    onClick={() => setFacilityMode('join')}
                    className={`px-2 py-1 rounded-md font-medium transition-all ${
                      facilityMode === 'join' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Join Existing
                  </button>
                </div>
              </div>

              {facilityMode === 'create' ? (
                <div className="space-y-2.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Facility Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Apex Robotics Plant 3"
                        value={facilityName}
                        onChange={(e) => setFacilityName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Custom Facility ID (Code) *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. FAC-APEX-03"
                        value={facilityCode}
                        onChange={(e) => setFacilityCode(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Industry Sector</label>
                    <select
                      value={facilityIndustry}
                      onChange={(e) => setFacilityIndustry(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-brand-500 cursor-pointer"
                    >
                      <option value="AUTOMOTIVE">Automotive</option>
                      <option value="ELECTRONICS">Electronics</option>
                      <option value="FOOD_PROCESSING">Food Processing</option>
                      <option value="TEXTILES">Textiles</option>
                    </select>
                  </div>

                  <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[10px] text-amber-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                    <span>The first user registering a new facility will automatically be granted <strong>Facility Admin</strong> access.</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-600 mb-0.5">Registered Facility ID *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. FAC-APEX-01"
                      value={joinFacilityCode}
                      onChange={(e) => setJoinFacilityCode(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-brand-500 font-mono"
                    />
                  </div>
                  {existingFacilities.length > 0 && (
                    <div>
                      <span className="block text-[9px] text-slate-400 mb-0.5 uppercase tracking-wider font-semibold">Or pick registered facility:</span>
                      <select
                        value={selectedFacilityId || ''}
                        onChange={(e) => {
                          const fac = existingFacilities.find(f => String(f.id) === e.target.value);
                          if (fac) {
                            setSelectedFacilityId(fac.id);
                            setJoinFacilityCode(fac.code);
                          }
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none cursor-pointer font-mono"
                      >
                        {existingFacilities.map((fac) => (
                          <option key={fac.id} value={fac.id}>
                            {fac.name} ({fac.code})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Step B: User Details */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Full Name *</label>
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
                <label className="block text-[11px] font-medium text-slate-700 mb-1">Work Email *</label>
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

              {/* Step C: Role Selection & Custom Role Option */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-medium text-slate-700">Facility Role / Designation</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomRole(!isCustomRole);
                      if (!isCustomRole) setCustomRoleText('');
                    }}
                    className="text-[10px] text-brand-600 hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    {isCustomRole ? 'Use standard role' : 'Add custom role'}
                  </button>
                </div>

                {!isCustomRole ? (
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <select
                      value={plantRole}
                      onChange={(e) => {
                        if (e.target.value === '__CUSTOM__') {
                          setIsCustomRole(true);
                        } else {
                          setPlantRole(e.target.value);
                        }
                      }}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors cursor-pointer"
                    >
                      <option value="Quality Assurance Engineer">Quality Assurance Engineer</option>
                      <option value="Facility Head / Operations Manager">Facility Head / Operations Manager</option>
                      <option value="SMT Line Supervisor">SMT Line Supervisor</option>
                      <option value="Reliability & Maintenance Engineer">Reliability & Maintenance Engineer</option>
                      <option value="Lab & Chemical Inspector">Lab & Chemical Inspector</option>
                      <option value="__CUSTOM__">+ Add Custom Role...</option>
                    </select>
                  </div>
                ) : (
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-3 w-4 h-4 text-brand-500" />
                    <input
                      type="text"
                      required
                      placeholder="Enter custom role (e.g. Chief Quality Inspector)"
                      value={customRoleText}
                      onChange={(e) => setCustomRoleText(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-brand-50/30 border border-brand-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-brand-500 focus:bg-white transition-colors"
                    />
                  </div>
                )}
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
                  Registering organization workspace...
                </span>
              ) : (
                <span>Register & Enter Workspace</span>
              )}
            </button>
          </form>
        )}

        {/* Sign In / Sign Up Switcher */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>{mode === 'login' ? "Need a facility workspace?" : "Already registered?"}</span>
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
