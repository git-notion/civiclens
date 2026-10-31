import React, { useState } from 'react';
import { useGrievance } from '../../context/GrievanceContext';
import { StatusBadge } from '../common/StatusBadge';
import { SlaCountdown } from '../common/SlaCountdown';
import { filterGrievances, computeTelemetry } from '../../utils/grievanceRules';
import { GrievanceStatus, DepartmentType } from '../../types';
import { PRECINCTS } from '../../data/mockGrievances';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText,
  Filter,
  Eye,
  ArrowUpRight,
  ThumbsUp,
  MapPin,
  ChevronRight,
  TrendingUp,
  Shield,
  Send,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    grievances,
    selectedPrecinct,
    setSelectedPrecinct,
    selectedStatus,
    setSelectedStatus,
    selectedDepartment,
    setSelectedDepartment,
    selectedPriority,
    setSelectedPriority,
    searchQuery,
    navigateTo,
    upvoteGrievance,
  } = useGrievance();

  const [activeTab, setActiveTab] = useState<GrievanceStatus | 'All'>(selectedStatus);

  const handleTabChange = (status: GrievanceStatus | 'All') => {
    setActiveTab(status);
    setSelectedStatus(status);
  };

  const filteredItems = filterGrievances(grievances, {
    status: activeTab,
    precinct: selectedPrecinct,
    department: selectedDepartment,
    priority: selectedPriority,
    search: searchQuery,
  });

  const telemetry = computeTelemetry(grievances);

  return (
    <div className="space-y-6">
      {/* Top Welcome / Municipal Briefing Banner */}
      <div className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-5 sm:p-6 shadow-[0_4px_12px_-2px_rgba(36,36,36,0.08)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#777064] dark:text-[#94a3b8]">
              Municipal Operations Console Active
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#242424] dark:text-[#f1f5f9]">
            Civic Grievance Redressal Command
          </h2>
          <p className="text-xs sm:text-sm text-[#777064] dark:text-[#94a3b8] max-w-2xl mt-1">
            Real-time public service requests, automated SLA monitoring, and municipal field crew
            dispatch. Currently monitoring{' '}
            <strong className="text-[#242424] dark:text-[#f1f5f9]">
              {grievances.length} registered civic cases
            </strong>{' '}
            across all municipal precincts.
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => navigateTo('intake')}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#48234F] hover:bg-[#371B3D] text-white shadow-sm border border-[#C9B99F]/40 transition flex items-center justify-center gap-2"
          >
            <span>+ Submit Complaint</span>
          </button>
          <button
            onClick={() => navigateTo('dispatch')}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-lg text-xs font-semibold bg-[#FAF7F0] hover:bg-[#F2EEE6] dark:bg-[#1a2230] dark:hover:bg-[#223045] text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] dark:border-[#223a54] transition flex items-center justify-center gap-2"
          >
            <span>Field Dispatch</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Telemetry Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Docket Cases */}
        <div className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-4 sm:p-5">
          <div className="flex items-center justify-between text-[#777064] dark:text-[#94a3b8] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Grievances</span>
            <FileText className="w-4 h-4 text-[#48234F] dark:text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#242424] dark:text-[#f1f5f9] tabular-nums">
              {telemetry.total}
            </span>
            <span className="text-[11px] text-[#777064] dark:text-[#94a3b8]">Across 5 Wards</span>
          </div>
          <div className="mt-3 flex items-center gap-2 text-[11px] text-[#777064] dark:text-[#94a3b8]">
            <span className="text-amber-800 dark:text-amber-300 font-semibold tabular-nums">
              {telemetry.underReview} Under Review
            </span>
            <span>•</span>
            <span className="text-blue-800 dark:text-sky-300 font-semibold tabular-nums">
              {telemetry.inProgress} In Field
            </span>
          </div>
        </div>

        {/* Metric 2: SLA Adherence Rate */}
        <div className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-4 sm:p-5">
          <div className="flex items-center justify-between text-[#777064] dark:text-[#94a3b8] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">SLA Adherence</span>
            <Clock className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-emerald-800 dark:text-emerald-400 tabular-nums">
              {telemetry.slaComplianceRate}%
            </span>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
              Target &gt;90%
            </span>
          </div>
          <div className="mt-3 w-full bg-[#EAE7E7] dark:bg-slate-700 h-1.5 rounded overflow-hidden">
            <div
              className="bg-emerald-600 dark:bg-emerald-400 h-full transition-all duration-500"
              style={{ width: `${telemetry.slaComplianceRate}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Critical Escalations */}
        <div className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-4 sm:p-5">
          <div className="flex items-center justify-between text-[#777064] dark:text-[#94a3b8] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Action Required</span>
            <AlertTriangle className="w-4 h-4 text-rose-700 dark:text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#48234F] dark:text-rose-400 tabular-nums">
              {telemetry.escalated}
            </span>
            <span className="text-[11px] font-semibold text-rose-800 dark:text-rose-300">
              Escalated Cases
            </span>
          </div>
          <div className="mt-3 text-[11px] text-[#777064] dark:text-[#94a3b8]">
            Urgent priority requiring executive dispatch
          </div>
        </div>

        {/* Metric 4: Avg Resolution Time */}
        <div className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-4 sm:p-5">
          <div className="flex items-center justify-between text-[#777064] dark:text-[#94a3b8] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Redressal</span>
            <CheckCircle className="w-4 h-4 text-[#48234F] dark:text-sky-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold tracking-tight text-[#242424] dark:text-[#f1f5f9] tabular-nums">
              {telemetry.avgResolutionHours}h
            </span>
            <span className="text-[11px] text-[#777064] dark:text-[#94a3b8]">
              Median turnaround
            </span>
          </div>
          <div className="mt-3 text-[11px] text-emerald-800 dark:text-emerald-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>4.2h faster than last month</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left 8 cols Ledger, Right 4 cols Precinct Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ledger & Table Section (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Filter Bar & Tabs */}
          <div className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-3 sm:p-4 shadow-xs">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#C9B99F]/30 pb-3">
              {/* Status Tabs */}
              <div
                className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0"
                role="tablist"
              >
                {(
                  ['All', 'Under Review', 'In Progress', 'Escalated', 'Resolved'] as (
                    GrievanceStatus | 'All'
                  )[]
                ).map((tab) => {
                  const isActive = activeTab === tab;
                  const count =
                    tab === 'All'
                      ? grievances.length
                      : grievances.filter((g) => g.status === tab).length;

                  return (
                    <button
                      key={tab}
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => handleTabChange(tab)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold transition flex items-center gap-1.5 whitespace-nowrap ${
                        isActive
                          ? 'bg-[#48234F] text-white shadow-xs'
                          : 'text-[#777064] dark:text-[#94a3b8] hover:bg-[#F2EEE6] dark:hover:bg-[#1f2b3e]'
                      }`}
                    >
                      <span>{tab}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-bold tabular-nums ${
                          isActive
                            ? 'bg-black/30 text-white'
                            : 'bg-black/10 text-[#777064] dark:text-slate-300'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Department & Priority quick dropdowns */}
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="text-xs bg-white dark:bg-[#1d283a] border border-[#C9B99F] dark:border-[#223a54] rounded px-2.5 py-1.5 text-[#242424] dark:text-[#f1f5f9] focus:outline-none focus:border-[#48234F]"
                  aria-label="Filter by department"
                >
                  <option value="All">All Departments</option>
                  <option value="Public Works & Roads">Public Works & Roads</option>
                  <option value="Water Supply & Drainage">Water Supply & Drainage</option>
                  <option value="Sanitation & Solid Waste">Sanitation & Solid Waste</option>
                  <option value="Electrical & Street Lighting">Electrical & Street Lighting</option>
                  <option value="Parks & Urban Forestry">Parks & Urban Forestry</option>
                </select>

                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="text-xs bg-white dark:bg-[#1d283a] border border-[#C9B99F] dark:border-[#223a54] rounded px-2.5 py-1.5 text-[#242424] dark:text-[#f1f5f9] focus:outline-none focus:border-[#48234F]"
                  aria-label="Filter by priority"
                >
                  <option value="All">All Severities</option>
                  <option value="Emergency">Emergency</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Standard">Standard</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            {/* Filter result count and search notice */}
            <div className="pt-2.5 flex items-center justify-between text-xs text-[#777064] dark:text-[#94a3b8]">
              <span>
                Showing{' '}
                <strong className="text-[#242424] dark:text-[#f1f5f9]">
                  {filteredItems.length}
                </strong>{' '}
                matching grievances
              </span>
              {(selectedPrecinct !== 'All' || selectedDepartment !== 'All' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedPrecinct('All');
                    setSelectedDepartment('All');
                    setSelectedPriority('All');
                    setSelectedStatus('All');
                    setActiveTab('All');
                  }}
                  className="text-[#48234F] dark:text-sky-400 font-semibold hover:underline"
                >
                  Reset all filters
                </button>
              )}
            </div>
          </div>

          {/* Grievance Ledger List */}
          {filteredItems.length === 0 ? (
            <div className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-12 text-center">
              <Filter className="w-10 h-10 text-[#C9B99F] mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#242424] dark:text-[#f1f5f9]">
                No Grievances Match Selected Parameters
              </h3>
              <p className="text-xs text-[#777064] dark:text-[#94a3b8] max-w-sm mx-auto mt-1">
                Try widening your search terms or clearing the current precinct and department
                filters.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] hover:border-[#48234F] dark:hover:border-sky-500 rounded-lg p-4 sm:p-5 transition shadow-xs hover:shadow-md cursor-pointer group"
                  onClick={() => navigateTo('detail', item.id)}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold font-mono tracking-tight text-[#48234F] dark:text-sky-400 tabular-nums bg-[#48234F]/10 dark:bg-sky-950/50 px-2 py-0.5 rounded border border-[#48234F]/30 dark:border-sky-500/30">
                        {item.id}
                      </span>
                      <span className="text-[11px] font-semibold text-[#777064] dark:text-[#94a3b8] px-2 py-0.5 rounded bg-black/5 dark:bg-slate-800 border border-[#C9B99F]/40 dark:border-slate-700">
                        {item.department}
                      </span>
                      <span className="text-[11px] font-medium text-[#777064] dark:text-[#94a3b8] flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                        {item.precinct}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <StatusBadge status={item.status} size="sm" />
                      <SlaCountdown
                        createdAt={item.createdAt}
                        slaDeadlineHours={item.slaDeadlineHours}
                        isResolved={item.status === 'Resolved'}
                      />
                    </div>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-[#242424] dark:text-[#f1f5f9] group-hover:text-[#48234F] dark:group-hover:text-sky-400 transition mb-1">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#777064] dark:text-[#94a3b8] line-clamp-2 leading-relaxed mb-3">
                    {item.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#C9B99F]/20 dark:border-slate-800 text-[11px] text-[#777064] dark:text-[#94a3b8]">
                    <div className="flex items-center gap-4">
                      <span>
                        Citizen:{' '}
                        <strong className="text-[#242424] dark:text-[#f1f5f9]">
                          {item.citizen.name}
                        </strong>
                      </span>
                      <span>
                        Location: <span className="italic">{item.locationAddress}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          upvoteGrievance(item.id);
                        }}
                        className="flex items-center gap-1 hover:text-[#48234F] dark:hover:text-sky-400 px-2 py-1 rounded hover:bg-[#F2EEE6] dark:hover:bg-slate-800 transition"
                        title="Civic Upvotes / Citizen Endorsements"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span className="font-semibold tabular-nums">{item.upvotes}</span>
                      </button>

                      <div className="flex items-center gap-1 font-semibold text-[#48234F] dark:text-sky-400 group-hover:translate-x-0.5 transition">
                        <span>Inspect Docket</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Telemetry Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Precinct Health & SLA Performance */}
          <div className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4 border-b border-[#C9B99F]/30 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#242424] dark:text-[#f1f5f9]">
                  Precinct SLA Health
                </h3>
                <p className="text-[11px] text-[#777064] dark:text-[#94a3b8]">
                  Compliance rating by ward division
                </p>
              </div>
              <Shield className="w-4 h-4 text-[#48234F] dark:text-sky-400" />
            </div>

            <div className="space-y-3.5">
              {PRECINCTS.map((precinct) => (
                <div
                  key={precinct.id}
                  onClick={() => setSelectedPrecinct(precinct.name)}
                  className={`p-2.5 rounded transition cursor-pointer ${
                    selectedPrecinct === precinct.name
                      ? 'bg-[#48234F]/10 dark:bg-sky-950/40 border border-[#48234F]/30 dark:border-sky-500/40'
                      : 'hover:bg-[#F2EEE6] dark:hover:bg-[#1d283a]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-[#242424] dark:text-[#f1f5f9]">
                      {precinct.name}
                    </span>
                    <span className="font-bold text-emerald-800 dark:text-emerald-400 tabular-nums">
                      {precinct.slaCompliancePercent}%
                    </span>
                  </div>

                  <div className="w-full bg-[#EAE7E7] dark:bg-slate-700 h-1.5 rounded overflow-hidden">
                    <div
                      className={`h-full ${
                        precinct.slaCompliancePercent >= 95
                          ? 'bg-emerald-600'
                          : precinct.slaCompliancePercent >= 90
                            ? 'bg-amber-600'
                            : 'bg-rose-600'
                      }`}
                      style={{ width: `${precinct.slaCompliancePercent}%` }}
                    />
                  </div>

                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-[#777064] dark:text-[#94a3b8]">
                    <span>Supervisor: {precinct.leadOfficer}</span>
                    <span className="font-semibold tabular-nums">
                      {precinct.totalActive} active cases
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setSelectedPrecinct('All')}
              className="mt-4 w-full py-2 text-xs font-semibold text-[#48234F] dark:text-sky-400 hover:bg-[#F2EEE6] dark:hover:bg-slate-800 rounded transition border border-[#C9B99F]/40"
            >
              Reset to All Wards
            </button>
          </div>

          {/* Quick Dispatch Telemetry Widget */}
          <div className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b border-[#C9B99F]/30 pb-2.5">
              <h3 className="text-sm font-bold text-[#242424] dark:text-[#f1f5f9]">
                Active Municipal Crews
              </h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                8 In Field
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded bg-white dark:bg-slate-800/60 border border-[#C9B99F]/30">
                <div className="flex items-center justify-between font-semibold text-[#242424] dark:text-[#f1f5f9]">
                  <span>Rapid Asphalt Unit #4</span>
                  <span className="text-[10px] text-amber-700 font-bold">En Route</span>
                </div>
                <p className="text-[11px] text-[#777064] dark:text-[#94a3b8] mt-0.5">
                  Assigned to #CIV-2026-8812 (Lexington Ave)
                </p>
              </div>

              <div className="p-2.5 rounded bg-white dark:bg-slate-800/60 border border-[#C9B99F]/30">
                <div className="flex items-center justify-between font-semibold text-[#242424] dark:text-[#f1f5f9]">
                  <span>Hydro Valves Crew B</span>
                  <span className="text-[10px] text-blue-700 font-bold">Excavating</span>
                </div>
                <p className="text-[11px] text-[#777064] dark:text-[#94a3b8] mt-0.5">
                  Assigned to #CIV-2026-8813 (Water Main Break)
                </p>
              </div>

              <div className="p-2.5 rounded bg-white dark:bg-slate-800/60 border border-[#C9B99F]/30">
                <div className="flex items-center justify-between font-semibold text-[#242424] dark:text-[#f1f5f9]">
                  <span>Signals Unit 1</span>
                  <span className="text-[10px] text-emerald-700 font-bold">Bench Testing</span>
                </div>
                <p className="text-[11px] text-[#777064] dark:text-[#94a3b8] mt-0.5">
                  Assigned to #CIV-2026-8815 (Traffic Light surge)
                </p>
              </div>
            </div>

            <button
              onClick={() => navigateTo('dispatch')}
              className="mt-4 w-full py-2 text-xs font-semibold bg-[#FAF7F0] hover:bg-[#F2EEE6] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] dark:border-[#223a54] rounded transition flex items-center justify-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 text-[#48234F] dark:text-sky-400" />
              <span>Open Work Order Dispatch Board</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
