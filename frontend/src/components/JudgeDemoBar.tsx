import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Users, 
  Wrench, 
  HardHat, 
  ClipboardCheck, 
  Zap
} from 'lucide-react';

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  role: 'Floor Operator / Field Technician' | 'Quality Assurance Engineer' | 'Quality Manager / Sign-off Authority';
  roleCategory: 'operator' | 'engineer' | 'quality_signoff';
  facility_id: string;
  facility_name: string;
  facility_code: string;
}

export const DEMO_FACILITIES = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    name: 'Apex Electronics Plant - Line 1',
    code: 'FAC-APEX-01',
    industry: 'ELECTRONICS',
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    name: 'Detroit Assembly Cell 4',
    code: 'FAC-DET-04',
    industry: 'AUTOMOTIVE',
  },
];

export const DEMO_USERS_MAP: Record<string, DemoUser[]> = {
  'a0000000-0000-0000-0000-000000000001': [
    {
      id: 'b0000000-0000-0000-0000-000000000001',
      name: 'Rajesh Kumar',
      email: 'rajesh.operator@apex.com',
      role: 'Floor Operator / Field Technician',
      roleCategory: 'operator',
      facility_id: 'a0000000-0000-0000-0000-000000000001',
      facility_name: 'Apex Electronics Plant - Line 1',
      facility_code: 'FAC-APEX-01',
    },
    {
      id: 'b0000000-0000-0000-0000-000000000002',
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@apex.com',
      role: 'Quality Assurance Engineer',
      roleCategory: 'engineer',
      facility_id: 'a0000000-0000-0000-0000-000000000001',
      facility_name: 'Apex Electronics Plant - Line 1',
      facility_code: 'FAC-APEX-01',
    },
    {
      id: 'b0000000-0000-0000-0000-000000000003',
      name: 'David Ross',
      email: 'david.ross@apex.com',
      role: 'Quality Manager / Sign-off Authority',
      roleCategory: 'quality_signoff',
      facility_id: 'a0000000-0000-0000-0000-000000000001',
      facility_name: 'Apex Electronics Plant - Line 1',
      facility_code: 'FAC-APEX-01',
    },
  ],
  'a0000000-0000-0000-0000-000000000002': [
    {
      id: 'c0000000-0000-0000-0000-000000000001',
      name: 'Marcus Vance',
      email: 'marcus.vance@detroit.com',
      role: 'Floor Operator / Field Technician',
      roleCategory: 'operator',
      facility_id: 'a0000000-0000-0000-0000-000000000002',
      facility_name: 'Detroit Assembly Cell 4',
      facility_code: 'FAC-DET-04',
    },
    {
      id: 'c0000000-0000-0000-0000-000000000002',
      name: 'Elena Rostova',
      email: 'elena.rostova@detroit.com',
      role: 'Quality Assurance Engineer',
      roleCategory: 'engineer',
      facility_id: 'a0000000-0000-0000-0000-000000000002',
      facility_name: 'Detroit Assembly Cell 4',
      facility_code: 'FAC-DET-04',
    },
    {
      id: 'c0000000-0000-0000-0000-000000000003',
      name: 'Arthur Vance',
      email: 'arthur.vance@detroit.com',
      role: 'Quality Manager / Sign-off Authority',
      roleCategory: 'quality_signoff',
      facility_id: 'a0000000-0000-0000-0000-000000000002',
      facility_name: 'Detroit Assembly Cell 4',
      facility_code: 'FAC-DET-04',
    },
  ],
};

export const JudgeDemoBar: React.FC = () => {
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>(
    DEMO_FACILITIES[0].id
  );
  const [currentUser, setCurrentUser] = useState<DemoUser>(
    DEMO_USERS_MAP[DEMO_FACILITIES[0].id][1] // default to QA Engineer
  );

  // Sync state from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('anomiq_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        const facId = parsed.facility_id || DEMO_FACILITIES[0].id;
        setSelectedFacilityId(facId);

        const usersInFac = DEMO_USERS_MAP[facId] || DEMO_USERS_MAP[DEMO_FACILITIES[0].id];
        const match = usersInFac.find((u) => u.email === parsed.email || u.id === parsed.id);
        if (match) {
          setCurrentUser(match);
        } else {
          // If stored user doesn't match map, use parsed attributes
          setCurrentUser({
            id: parsed.id || 'b0000000-0000-0000-0000-000000000002',
            name: parsed.name || 'Sarah Jenkins',
            email: parsed.email || 'sarah.jenkins@apex.com',
            role: parsed.role || 'Quality Assurance Engineer',
            roleCategory: parsed.role?.toLowerCase().includes('operator')
              ? 'operator'
              : parsed.role?.toLowerCase().includes('manager') || parsed.role?.toLowerCase().includes('sign-off')
              ? 'quality_signoff'
              : 'engineer',
            facility_id: parsed.facility_id || facId,
            facility_name: parsed.facility_name || 'Apex Electronics Plant - Line 1',
            facility_code: parsed.facility_code || 'FAC-APEX-01',
          });
        }
      } else {
        // Initialize with default QA Engineer on Apex
        const defaultUser = DEMO_USERS_MAP[DEMO_FACILITIES[0].id][1];
        localStorage.setItem('anomiq_user', JSON.stringify(defaultUser));
        setCurrentUser(defaultUser);
      }
    } catch (e) {}
  }, []);

  const handleFacilityChange = (facId: string) => {
    setSelectedFacilityId(facId);
    const usersInFac = DEMO_USERS_MAP[facId] || DEMO_USERS_MAP[DEMO_FACILITIES[0].id];
    // Keep current role type or default to first user in new facility
    const roleCat = currentUser.roleCategory;
    const nextUser = usersInFac.find((u) => u.roleCategory === roleCat) || usersInFac[0];
    applyUser(nextUser);
  };

  const handleRoleChange = (userId: string) => {
    const usersInFac = DEMO_USERS_MAP[selectedFacilityId] || DEMO_USERS_MAP[DEMO_FACILITIES[0].id];
    const nextUser = usersInFac.find((u) => u.id === userId);
    if (nextUser) {
      applyUser(nextUser);
    }
  };

  const applyUser = (user: DemoUser) => {
    setCurrentUser(user);
    localStorage.setItem('anomiq_user', JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('anomiq-user-switched', { detail: user }));
    // Also trigger custom storage event for multi-tab/window sync
    window.dispatchEvent(new Event('storage'));
  };

  const getRoleIcon = (cat: string) => {
    switch (cat) {
      case 'operator':
        return <HardHat className="w-3.5 h-3.5 text-amber-500" />;
      case 'engineer':
        return <Wrench className="w-3.5 h-3.5 text-blue-500" />;
      case 'quality_signoff':
        return <ClipboardCheck className="w-3.5 h-3.5 text-emerald-500" />;
      default:
        return <Users className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  const usersInCurrentFacility =
    DEMO_USERS_MAP[selectedFacilityId] || DEMO_USERS_MAP[DEMO_FACILITIES[0].id];

  return (
    <div className="bg-slate-900 border-b border-slate-800 text-white px-4 py-2 text-xs relative z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Judge Bar Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 text-amber-300 font-bold text-[10px] tracking-wider uppercase">
            <Zap className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>Judge Demo Bar</span>
          </div>
          <span className="text-[11px] text-slate-400 hidden sm:inline">
            Multi-Tenant &amp; Role Routing
          </span>
        </div>

        {/* Center: Dropdown 1 (Facility) & Dropdown 2 (Role) */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Dropdown 1: Facility */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 rounded-lg px-2.5 py-1 border border-slate-700">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="text-[11px] text-slate-400 font-medium">Facility:</span>
            <select
              value={selectedFacilityId}
              onChange={(e) => handleFacilityChange(e.target.value)}
              className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer pr-1"
            >
              {DEMO_FACILITIES.map((f) => (
                <option key={f.id} value={f.id} className="bg-slate-900 text-white">
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dropdown 2: User / Role under same facility */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 rounded-lg px-2.5 py-1 border border-slate-700">
            {getRoleIcon(currentUser.roleCategory)}
            <span className="text-[11px] text-slate-400 font-medium">Role:</span>
            <select
              value={currentUser.id}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="bg-transparent text-white font-medium text-xs focus:outline-none cursor-pointer pr-1"
            >
              {usersInCurrentFacility.map((u) => (
                <option key={u.id} value={u.id} className="bg-slate-900 text-white">
                  {u.name} — {u.role.split('/')[0].trim()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Right: Quick Role Switcher Buttons & Capabilities Pill */}
        <div className="flex items-center gap-2">
          {/* Capability indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700/60 text-[11px]">
            <span className="text-slate-400">Permissions:</span>
            {currentUser.roleCategory === 'operator' && (
              <span className="text-amber-400 font-medium">Log Anomaly &amp; Telemetry Voice</span>
            )}
            {currentUser.roleCategory === 'engineer' && (
              <span className="text-blue-400 font-medium">Receive Alert, 5-Whys &amp; CAPA Draft</span>
            )}
            {currentUser.roleCategory === 'quality_signoff' && (
              <span className="text-emerald-400 font-medium">Dual Logs Audit &amp; Official Sign-Off</span>
            )}
          </div>

          {/* Persona Quick Chips */}
          <div className="flex items-center gap-1">
            {usersInCurrentFacility.map((u) => {
              const active = u.id === currentUser.id;
              return (
                <button
                  key={u.id}
                  onClick={() => applyUser(u)}
                  className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                    active
                      ? u.roleCategory === 'operator'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : u.roleCategory === 'engineer'
                        ? 'bg-blue-500 text-white font-bold'
                        : 'bg-emerald-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                  title={`${u.name} (${u.role})`}
                >
                  {u.roleCategory === 'operator' && '👷 Operator'}
                  {u.roleCategory === 'engineer' && '🛠️ Engineer'}
                  {u.roleCategory === 'quality_signoff' && '📋 Sign-off'}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JudgeDemoBar;
