import React from 'react';
import { useGrievance } from '../../context/GrievanceContext';
import { AppView } from '../../types';
import {
  LayoutDashboard,
  FilePlus2,
  FileSearch,
  Kanban,
  BarChart3,
  SearchCode,
  ShieldCheck,
  Building2,
  Layers,
  Sparkles,
  Map,
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const {
    currentView,
    navigateTo,
    grievances,
    selectedPrecinct,
    setSelectedPrecinct,
    theme,
    toggleTheme,
  } = useGrievance();

  const totalActive = grievances.filter((g) => g.status !== 'Resolved').length;
  const escalatedCount = grievances.filter((g) => g.status === 'Escalated').length;

  const navItems: {
    view: AppView;
    label: string;
    icon: React.ReactNode;
    badge?: number | string;
  }[] = [
    {
      view: 'dashboard',
      label: 'Grievance Console',
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: totalActive,
    },
    {
      view: 'map',
      label: 'GIS Incident Map',
      icon: <Map className="w-4 h-4" />,
      badge: 'Live',
    },
    {
      view: 'intake',
      label: 'Submit Complaint',
      icon: <FilePlus2 className="w-4 h-4" />,
    },
    {
      view: 'detail',
      label: 'Docket Inspector',
      icon: <FileSearch className="w-4 h-4" />,
      badge: escalatedCount > 0 ? `${escalatedCount} Urg` : undefined,
    },
    {
      view: 'dispatch',
      label: 'Field Dispatch Board',
      icon: <Kanban className="w-4 h-4" />,
    },
    {
      view: 'analytics',
      label: 'Civic Transparency',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      view: 'tracking',
      label: 'Citizen Case Tracker',
      icon: <SearchCode className="w-4 h-4" />,
    },
  ];

  const handleNavClick = (view: AppView) => {
    navigateTo(view);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-[280px] bg-[#242424] text-[#FAF7F0] flex flex-col border-r border-[#C9B99F]/20 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand & Municipal Authority Crest */}
        <div className="p-5 border-b border-[#C9B99F]/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-[#48234F] text-white flex items-center justify-center font-bold text-lg shadow-sm border border-[#C9B99F]/30">
              <ShieldCheck className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold tracking-tight text-base text-[#FAF7F0]">
                  CivicPulse
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-[#48234F]/60 text-amber-200 border border-[#C9B99F]/30">
                  Gov
                </span>
              </div>
              <p className="text-[11px] text-[#C9B99F]/80 font-medium tracking-wide">
                Metro Grievance Redressal
              </p>
            </div>
          </div>
        </div>

        {/* Jurisdiction Switcher */}
        <div className="px-5 py-3.5 bg-black/25 border-b border-[#C9B99F]/15">
          <label className="text-[10px] font-semibold tracking-wider uppercase text-[#C9B99F]/70 block mb-1.5 flex items-center justify-between">
            <span>Jurisdiction Scope</span>
            <Building2 className="w-3 h-3 text-[#C9B99F]/60" />
          </label>
          <select
            value={selectedPrecinct}
            onChange={(e) => setSelectedPrecinct(e.target.value)}
            className="w-full text-xs font-medium bg-[#1d1d1d] text-[#FAF7F0] border border-[#C9B99F]/30 rounded px-2.5 py-1.5 focus:outline-none focus:border-[#48234F]"
            aria-label="Select precinct jurisdiction"
          >
            <option value="All">All Municipal Wards (Citywide)</option>
            <option value="Ward 4 - Metro Center">Ward 4 - Metro Center</option>
            <option value="Ward 7 - North District">Ward 7 - North District</option>
            <option value="Ward 12 - Riverside & Harbor">Ward 12 - Riverside & Harbor</option>
            <option value="Ward 2 - East Industrial Park">Ward 2 - East Industrial Park</option>
            <option value="Ward 9 - Hillcrest Residential">Ward 9 - Hillcrest Residential</option>
          </select>
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto" aria-label="Main Navigation">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[#C9B99F]/60">
            Operations & Grievances
          </div>
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => handleNavClick(item.view)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#48234F] text-white shadow-sm font-semibold'
                    : 'text-[#FAF7F0]/80 hover:bg-[#303030] hover:text-[#FAF7F0]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-amber-200' : 'text-[#C9B99F]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-semibold tabular-nums ${
                      isActive
                        ? 'bg-black/30 text-white'
                        : 'bg-[#373737] text-[#C9B99F] border border-[#C9B99F]/20'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Theme Switching & Operational Status Footprint */}
        <div className="p-4 border-t border-[#C9B99F]/20 bg-black/20 space-y-3">
          {/* Quick Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded text-xs bg-[#2f2f2f] hover:bg-[#383838] border border-[#C9B99F]/25 text-[#FAF7F0] transition"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span className="text-[11px] font-medium">Theme Mode</span>
            </div>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/40 text-[#C9B99F]">
              {theme === 'civic-heritage' ? 'Heritage Slate' : 'Cerulean Blue'}
            </span>
          </button>

          {/* Telemetry Indicator */}
          <div className="p-2.5 rounded bg-[#1f1f1f] border border-[#C9B99F]/20">
            <div className="flex items-center justify-between text-[11px] mb-1 font-semibold text-[#FAF7F0]">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                Live SLA Gateway
              </span>
              <span className="text-emerald-400 font-bold tabular-nums">94.6%</span>
            </div>
            <div className="w-full bg-black/50 h-1.5 rounded overflow-hidden">
              <div className="bg-emerald-500 h-full w-[94.6%]" />
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-[#C9B99F]/70">
              <span>SLA Target: 90%</span>
              <span className="tabular-nums">Svc #CIV-OS-4.2</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
