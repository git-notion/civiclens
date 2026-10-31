import React, { useState, useEffect, useRef } from 'react';
import { useGrievance } from '../../context/GrievanceContext';
import { quickLookupGrievances, LookupResult } from '../../utils/grievanceRules';
import { StatusBadge } from './StatusBadge';
import { ThemeToggle } from './ThemeToggle';
import {
  Menu,
  Search,
  PlusCircle,
  Sun,
  Moon,
  Bell,
  MapPin,
  CheckCircle2,
  X,
  User,
  ArrowRight,
  Clock,
  Sparkles,
  FileText,
  Command,
} from 'lucide-react';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const {
    currentView,
    navigateTo,
    searchQuery,
    setSearchQuery,
    selectedPrecinct,
    theme,
    toggleTheme,
    grievances,
    toggleNotificationCenter,
    unreadNotificationCount,
    isNotificationOpen,
  } = useGrievance();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const escalatedCount = grievances.filter((g) => g.status === 'Escalated').length;

  // Global keyboard shortcut to focus search: Cmd+K or /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchFocused(true);
      } else if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchFocused(true);
      } else if (e.key === 'Escape' && isSearchFocused) {
        setIsSearchFocused(false);
        searchInputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchFocused]);

  // Click outside listener for search popover
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const lookupResults: LookupResult[] = quickLookupGrievances(grievances, searchQuery, 6);

  const handleSelectResult = (ticketId: string) => {
    navigateTo('detail', ticketId);
    setIsSearchFocused(false);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lookupResults.length > 0) {
      handleSelectResult(lookupResults[0].item.id);
    } else {
      navigateTo('dashboard');
      setIsSearchFocused(false);
    }
  };

  const viewLabels: Record<string, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Municipal Grievance Operations Ledger',
      subtitle: 'Real-time intake tracking, SLA adherence, and dispatch verification',
    },
    map: {
      title: 'Geographic Information System (GIS) Map',
      subtitle: 'Spatial incident coordinates, sector boundaries, and hazard density',
    },
    intake: {
      title: 'Citizen Grievance Registration',
      subtitle: 'Formal multi-step intake with geolocation and evidence cataloging',
    },
    detail: {
      title: 'Grievance Docket & Field Audit',
      subtitle: 'Complete case dossier, evidence inspection, and chronological civic timeline',
    },
    dispatch: {
      title: 'Department Resolution & Crew Dispatch',
      subtitle: 'Work order allocation, crew assignments, and field status workflow',
    },
    analytics: {
      title: 'Municipal Civic Transparency & SLA Metrics',
      subtitle: 'Precinct redressing performance, resolution speeds, and public bulletin',
    },
    tracking: {
      title: 'Citizen Case Self-Service Portal',
      subtitle: 'Track resolution milestones in real time by reference docket number',
    },
  };

  const currentLabel = viewLabels[currentView] || viewLabels.dashboard;

  return (
    <header className="sticky top-0 z-30 bg-[#242424] text-[#FAF7F0] border-b border-[#C9B99F]/20 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 transition-colors">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded bg-[#333] text-[#FAF7F0] hover:bg-[#444] focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#FAF7F0]">
              {currentLabel.title}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-black/40 text-[#C9B99F] border border-[#C9B99F]/20">
              <MapPin className="w-3 h-3 text-amber-300" />
              {selectedPrecinct === 'All' ? 'Citywide Scope' : selectedPrecinct}
            </span>
          </div>
          <p className="text-xs text-[#C9B99F]/80 hidden md:block">{currentLabel.subtitle}</p>
        </div>
      </div>

      {/* Right: Global Search Bar, Theme Toggle, New Grievance Button & Officer Badge */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
        {/* Interactive Global Search Input Container */}
        <div ref={searchContainerRef} className="relative flex-1 sm:w-80 md:w-96 max-w-md">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#C9B99F]/70 pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
              }}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search docket #CIV or citizen name..."
              className="w-full pl-9 pr-14 py-2 text-xs bg-[#1a1a1a] text-[#FAF7F0] placeholder-[#777064] border border-[#C9B99F]/30 rounded focus:outline-none focus:border-[#48234F] focus:ring-1 focus:ring-[#48234F] transition font-medium"
              aria-label="Global search grievances by docket number or citizen name"
            />
            {/* Keyboard shortcut hint or clear button */}
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    searchInputRef.current?.focus();
                  }}
                  className="p-1 rounded text-[#C9B99F] hover:text-white transition"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-[#C9B99F]/60 bg-black/40 border border-[#C9B99F]/20 rounded">
                  <Command className="w-2.5 h-2.5" /> K
                </kbd>
              )}
            </div>
          </form>

          {/* Instant Search Results Popover Dropdown */}
          {isSearchFocused && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#FAF7F0] dark:bg-[#141f2e] text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] dark:border-[#223a54] rounded-lg shadow-[0_10px_35px_rgba(0,0,0,0.35)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-1">
              {/* Header Indicator */}
              <div className="px-3.5 py-2 bg-black/5 dark:bg-black/30 border-b border-[#C9B99F]/20 flex items-center justify-between text-[11px] text-[#777064] dark:text-[#94a3b8]">
                <span className="font-semibold uppercase tracking-wider text-[10px]">
                  {searchQuery.trim()
                    ? `Matching Dockets (${lookupResults.length})`
                    : 'Quick Docket & Citizen Lookups'}
                </span>
                <span className="text-[10px]">Press Esc to close</span>
              </div>

              {/* Search Active with Results */}
              {searchQuery.trim() ? (
                lookupResults.length > 0 ? (
                  <div className="max-h-80 overflow-y-auto divide-y divide-[#C9B99F]/20">
                    {lookupResults.map(({ item, matchType }) => (
                      <div
                        key={item.id}
                        onClick={() => handleSelectResult(item.id)}
                        className="p-3 hover:bg-[#F2EEE6] dark:hover:bg-[#1d283a] cursor-pointer transition flex items-start justify-between gap-3 group"
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-[#48234F] dark:text-sky-400 tabular-nums">
                              {item.id}
                            </span>
                            <StatusBadge status={item.status} size="sm" />
                            {matchType === 'docket' && (
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#48234F]/10 text-[#48234F] dark:text-sky-300">
                                Docket Match
                              </span>
                            )}
                            {matchType === 'citizen' && (
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                                Citizen Match
                              </span>
                            )}
                          </div>

                          <h4 className="text-xs font-bold text-[#242424] dark:text-[#f1f5f9] group-hover:text-[#48234F] dark:group-hover:text-sky-400 truncate">
                            {item.title}
                          </h4>

                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#777064] dark:text-[#94a3b8]">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3 text-[#48234F] dark:text-sky-400" />
                              <strong>{item.citizen.name}</strong>
                            </span>
                            <span>•</span>
                            <span className="truncate">{item.precinct}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 text-xs font-semibold text-[#48234F] dark:text-sky-400 opacity-0 group-hover:opacity-100 transition shrink-0 pt-1">
                          <span>Inspect</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    ))}

                    <div className="p-2.5 bg-black/5 dark:bg-black/30 text-center">
                      <button
                        onClick={() => {
                          navigateTo('dashboard');
                          setIsSearchFocused(false);
                        }}
                        className="text-xs font-semibold text-[#48234F] dark:text-sky-400 hover:underline"
                      >
                        Filter all matching items in Operations Ledger →
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-[#777064] dark:text-[#94a3b8]">
                    <Search className="w-6 h-6 text-[#C9B99F] mx-auto mb-2 opacity-60" />
                    <p className="font-semibold text-[#242424] dark:text-[#f1f5f9]">
                      No dockets found matching "{searchQuery}"
                    </p>
                    <p className="text-[11px] mt-1">
                      Try searching with docket sequence (e.g. <code>8812</code>) or citizen name
                      (e.g. <code>Julian</code>).
                    </p>
                  </div>
                )
              ) : (
                /* Empty query suggested lookups */
                <div className="p-3 space-y-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#777064] dark:text-[#94a3b8] block mb-1.5">
                      Frequent Complainants (Click to Lookup):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Julian Vance',
                        'Nadia Thorne',
                        'Mateo Morales',
                        'Kenneth Wright',
                        'Maya Lin',
                      ].map((name) => (
                        <button
                          key={name}
                          type="button"
                          onClick={() => {
                            setSearchQuery(name);
                            searchInputRef.current?.focus();
                          }}
                          className="px-2 py-1 rounded text-xs bg-white dark:bg-[#1a2230] text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F]/40 hover:border-[#48234F] dark:hover:border-sky-400 transition flex items-center gap-1"
                        >
                          <User className="w-3 h-3 text-[#48234F] dark:text-sky-400" />
                          <span>{name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#777064] dark:text-[#94a3b8] block mb-1.5">
                      Recent High-Priority Dockets:
                    </span>
                    <div className="space-y-1">
                      {grievances.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleSelectResult(item.id)}
                          className="p-2 rounded hover:bg-[#F2EEE6] dark:hover:bg-[#1d283a] cursor-pointer transition flex items-center justify-between text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-mono font-bold text-[#48234F] dark:text-sky-400">
                              {item.id}
                            </span>
                            <span className="truncate text-[#242424] dark:text-[#f1f5f9]">
                              {item.title}
                            </span>
                          </div>
                          <span className="text-[10px] text-[#777064] dark:text-[#94a3b8] shrink-0">
                            {item.citizen.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Interactive Light/Dark Theme Switcher */}
        <ThemeToggle variant="header" showLabel={true} />

        {/* Notification Center Trigger Bell */}
        <button
          onClick={toggleNotificationCenter}
          className={`relative p-2 rounded transition focus:outline-none border ${
            isNotificationOpen
              ? 'bg-[#48234F] text-white border-white/30 ring-2 ring-amber-300'
              : 'bg-[#313131] hover:bg-[#3d3d3d] border-[#C9B99F]/20 text-[#FAF7F0]'
          }`}
          aria-label={`Open notifications center (${unreadNotificationCount} unread alerts)`}
          aria-expanded={isNotificationOpen}
        >
          <Bell className="w-4 h-4 text-[#C9B99F] group-hover:text-white" />
          {unreadNotificationCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-600 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse shadow-sm">
              {unreadNotificationCount}
            </span>
          )}
        </button>

        {/* Action: + Submit Complaint */}
        <button
          onClick={() => navigateTo('intake')}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-semibold bg-[#48234F] hover:bg-[#371B3D] text-white shadow-sm border border-[#C9B99F]/30 transition focus:outline-none"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">File Grievance</span>
        </button>

        {/* Officer Avatar Chip */}
        <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-[#C9B99F]/20">
          <div className="w-8 h-8 rounded bg-[#48234F] text-amber-200 border border-[#C9B99F]/40 flex items-center justify-center font-bold text-xs">
            SC
          </div>
          <div className="text-left text-xs leading-tight">
            <p className="font-semibold text-[#FAF7F0] flex items-center gap-1">
              Insp. S. Chen
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            </p>
            <p className="text-[10px] text-[#C9B99F]/70">Superintendent</p>
          </div>
        </div>
      </div>
    </header>
  );
};
