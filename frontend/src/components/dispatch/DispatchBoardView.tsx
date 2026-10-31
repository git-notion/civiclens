import React, { useState } from 'react';
import { useGrievance } from '../../context/GrievanceContext';
import { StatusBadge } from '../common/StatusBadge';
import { SlaCountdown } from '../common/SlaCountdown';
import { Grievance, GrievanceStatus, DepartmentType } from '../../types';
import {
  Kanban,
  Truck,
  AlertTriangle,
  ArrowRight,
  Send,
  Users,
  CheckCircle,
  Filter,
} from 'lucide-react';

export const DispatchBoardView: React.FC = () => {
  const { grievances, updateGrievanceStatus, dispatchCrew, navigateTo } = useGrievance();

  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [activeDispatchModal, setActiveDispatchModal] = useState<Grievance | null>(null);
  const [selectedCrew, setSelectedCrew] = useState('Rapid Asphalt Patch Unit #4');
  const [dispatchNote, setDispatchNote] = useState('');

  const filtered = grievances.filter((g) => {
    if (deptFilter !== 'All' && g.department !== deptFilter) return false;
    return true;
  });

  const columns: { status: GrievanceStatus; title: string; subtitle: string; color: string }[] = [
    {
      status: 'Under Review',
      title: 'Triage & Engineering Review',
      subtitle: 'Awaiting inspection assessment',
      color: 'border-slate-300 dark:border-slate-700',
    },
    {
      status: 'In Progress',
      title: 'Field Execution / Dispatched',
      subtitle: 'Crews active on site',
      color: 'border-amber-400 dark:border-amber-700',
    },
    {
      status: 'Escalated',
      title: 'Urgent Intervention Required',
      subtitle: 'SLA risk or executive escalation',
      color: 'border-red-400 dark:border-red-800',
    },
    {
      status: 'Resolved',
      title: 'QA Inspection & Cleared',
      subtitle: 'Certified closed by auditor',
      color: 'border-emerald-400 dark:border-emerald-800',
    },
  ];

  const handleOpenDispatch = (g: Grievance, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveDispatchModal(g);
  };

  const handleConfirmDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDispatchModal) return;
    dispatchCrew(activeDispatchModal.id, selectedCrew, dispatchNote);
    setActiveDispatchModal(null);
    setDispatchNote('');
  };

  return (
    <div className="space-y-6">
      {/* Board Briefing & Department Filter */}
      <div className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Kanban className="w-4 h-4 text-[#48234F] dark:text-sky-400" />
            <h2 className="text-base sm:text-lg font-bold text-[#242424] dark:text-[#f1f5f9]">
              Municipal Dispatch Workflow Board
            </h2>
          </div>
          <p className="text-xs text-[#777064] dark:text-[#94a3b8]">
            Organize field work orders, mobilize repair crews, and clear SLA bottlenecks in real
            time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-[#777064] dark:text-[#94a3b8]">
            Filter Department:
          </label>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="text-xs bg-white dark:bg-[#1a2230] text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] dark:border-[#223a54] rounded px-3 py-1.5 focus:outline-none"
          >
            <option value="All">All Municipal Departments</option>
            <option value="Public Works & Roads">Public Works & Roads</option>
            <option value="Water Supply & Drainage">Water Supply & Drainage</option>
            <option value="Sanitation & Solid Waste">Sanitation & Solid Waste</option>
            <option value="Electrical & Street Lighting">Electrical & Street Lighting</option>
            <option value="Parks & Urban Forestry">Parks & Urban Forestry</option>
          </select>
        </div>
      </div>

      {/* 4-Column Responsive Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
        {columns.map((col) => {
          const itemsInCol = filtered.filter((g) => g.status === col.status);

          return (
            <div
              key={col.status}
              className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-3.5 shadow-xs flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="pb-3 mb-3 border-b border-[#C9B99F]/30 flex items-start justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#242424] dark:text-[#f1f5f9]">
                    {col.title}
                  </h3>
                  <p className="text-[10px] text-[#777064] dark:text-[#94a3b8]">{col.subtitle}</p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-black/10 dark:bg-slate-800 text-[#242424] dark:text-[#f1f5f9] tabular-nums">
                  {itemsInCol.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {itemsInCol.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#777064] dark:text-[#94a3b8] italic border border-dashed border-[#C9B99F]/40 rounded-lg">
                    No active dockets in this stage
                  </div>
                ) : (
                  itemsInCol.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => navigateTo('detail', item.id)}
                      className="bg-white dark:bg-[#1a2230] border border-[#C9B99F]/50 dark:border-[#223a54] hover:border-[#48234F] dark:hover:border-sky-400 p-3.5 rounded-lg shadow-xs hover:shadow-md cursor-pointer transition group"
                    >
                      <div className="flex items-center justify-between text-[11px] mb-1.5">
                        <span className="font-mono font-bold text-[#48234F] dark:text-sky-400 tabular-nums">
                          {item.id}
                        </span>
                        <SlaCountdown
                          createdAt={item.createdAt}
                          slaDeadlineHours={item.slaDeadlineHours}
                          isResolved={item.status === 'Resolved'}
                        />
                      </div>

                      <h4 className="text-xs font-bold text-[#242424] dark:text-[#f1f5f9] group-hover:text-[#48234F] dark:group-hover:text-sky-400 line-clamp-2 mb-1.5">
                        {item.title}
                      </h4>

                      <p className="text-[11px] text-[#777064] dark:text-[#94a3b8] truncate mb-2">
                        {item.locationAddress}
                      </p>

                      {item.assignedCrew && (
                        <div className="mb-2 p-1.5 rounded bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-[10px] text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                          <Truck className="w-3 h-3 text-amber-700" />
                          <span className="truncate">{item.assignedCrew}</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-[#C9B99F]/20 flex items-center justify-between text-[10px]">
                        <span className="text-[#777064] dark:text-[#94a3b8]">{item.precinct}</span>

                        <div className="flex items-center gap-1.5">
                          {col.status !== 'Resolved' && (
                            <button
                              onClick={(e) => handleOpenDispatch(item, e)}
                              className="px-2 py-0.5 rounded bg-[#48234F] hover:bg-[#371B3D] text-white font-semibold transition"
                              title="Assign field crew"
                            >
                              Dispatch
                            </button>
                          )}
                          <div className="p-1 rounded text-[#777064] group-hover:text-[#48234F]">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dispatch Modal Dialog */}
      {activeDispatchModal && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setActiveDispatchModal(null)}
        >
          <div
            className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg max-w-md w-full p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#C9B99F]/30 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#242424] dark:text-[#f1f5f9]">
                  Dispatch Field Repair Unit
                </h3>
                <p className="text-xs text-[#777064] dark:text-[#94a3b8]">
                  Docket: {activeDispatchModal.id}
                </p>
              </div>
              <Truck className="w-5 h-5 text-[#48234F] dark:text-sky-400" />
            </div>

            <p className="text-xs text-[#242424] dark:text-[#f1f5f9] font-medium">
              Target Site: {activeDispatchModal.locationAddress}
            </p>

            <form onSubmit={handleConfirmDispatch} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#777064] dark:text-[#94a3b8] mb-1">
                  Select Municipal Crew Unit *
                </label>
                <select
                  value={selectedCrew}
                  onChange={(e) => setSelectedCrew(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-[#1a2230] text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] dark:border-[#223a54] rounded p-2 focus:outline-none"
                >
                  <option value="Rapid Asphalt Patch Unit #4">
                    Rapid Asphalt Patch Unit #4 (Public Works)
                  </option>
                  <option value="Emergency Valves & Isolation Crew B">
                    Emergency Valves & Isolation Crew B (Water)
                  </option>
                  <option value="Signals Emergency Response Unit 1">
                    Signals Emergency Response Unit 1 (Electric)
                  </option>
                  <option value="Bucket Truck & Chipper Unit 3">
                    Bucket Truck & Chipper Unit 3 (Forestry)
                  </option>
                  <option value="Municipal Sanitation Compactor Fleet 8">
                    Municipal Sanitation Compactor Fleet 8 (Sanitation)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#777064] dark:text-[#94a3b8] mb-1">
                  Dispatch Directive & Equipment Instructions
                </label>
                <textarea
                  value={dispatchNote}
                  onChange={(e) => setDispatchNote(e.target.value)}
                  rows={3}
                  placeholder="e.g. Ensure traffic cones deployed before asphalt milling. Coordinate with Ward traffic marshals..."
                  className="w-full text-xs bg-white dark:bg-[#1a2230] text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] dark:border-[#223a54] rounded p-2 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveDispatchModal(null)}
                  className="px-4 py-2 text-xs font-semibold rounded bg-white dark:bg-slate-800 text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded bg-[#48234F] hover:bg-[#371B3D] text-white shadow-sm transition"
                >
                  Deploy Crew to Site
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
