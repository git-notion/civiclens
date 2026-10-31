import React, { useState, useEffect, useRef } from 'react';
import { useGrievance } from '../../context/GrievanceContext';
import { generateDailyReport, DailyReportData } from '../../utils/grievanceRules';
import { DepartmentType, GrievancePriority } from '../../types';
import {
  Zap,
  PlusCircle,
  FileSpreadsheet,
  Truck,
  Download,
  X,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Printer,
  Copy,
  Check,
  Shield,
  Layers,
  FileText,
} from 'lucide-react';

export const QuickActionsMenu: React.FC = () => {
  const { grievances, addGrievance, navigateTo } = useGrievance();

  const [isOpen, setIsOpen] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [copiedReport, setCopiedReport] = useState(false);
  const [ticketCreatedId, setTicketCreatedId] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Quick ticket modal form state
  const [dept, setDept] = useState<DepartmentType>('Public Works & Roads');
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Pothole & Surface Subsidence');
  const [ticketLocation, setTicketLocation] = useState('');
  const [ticketPrecinct, setTicketPrecinct] = useState('Ward 4 - Metro Center');
  const [ticketPriority, setTicketPriority] = useState<GrievancePriority>('Urgent');
  const [ticketNotes, setTicketNotes] = useState('');
  const [ticketError, setTicketError] = useState<string | null>(null);

  const dailyReport: DailyReportData = generateDailyReport(grievances);

  const handleCopyReport = () => {
    const text = `
=== METROPOLITAN DISTRICT CIVIC GRIEVANCE & REDRESSAL AUTHORITY ===
DAILY EXECUTIVE OPERATIONS REPORT: ${dailyReport.reportId}
Generated: ${dailyReport.generatedAt}
Audited SLA Adherence: ${dailyReport.slaAdherenceRate}%

OVERVIEW:
- Total Logged Dockets: ${dailyReport.totalGrievances}
- Critical Escalated Cases: ${dailyReport.urgentCritical}
- Under Review: ${dailyReport.underReview}
- Active In Field: ${dailyReport.inProgress}
- Certified Resolved: ${dailyReport.resolved}

EXECUTIVE SUMMARY:
${dailyReport.executiveStatusSummary}

DEPARTMENT BREAKDOWN:
${dailyReport.departmentBreakdown.map((d) => `• ${d.department}: ${d.count} dockets (${d.urgent} urgent)`).join('\n')}

TOP URGENT INTERVENTIONS:
${dailyReport.urgentActionItems.map((i) => `• [${i.id}] ${i.title} (${i.precinct}) - Status: ${i.status}`).join('\n')}
===================================================================
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  const handleExportData = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(grievances, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `CivicPulse_Audit_Ledger_${new Date().toISOString().substring(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setIsOpen(false);
  };

  const handleCreateDepartmentTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketTitle.trim()) {
      setTicketError('Please provide a descriptive ticket title.');
      return;
    }
    if (!ticketLocation.trim()) {
      setTicketError('Please specify the municipal site location.');
      return;
    }

    const slaHours = ticketPriority === 'Emergency' ? 12 : ticketPriority === 'Urgent' ? 24 : 48;

    const newId = addGrievance({
      title: ticketTitle.trim(),
      description:
        ticketNotes.trim() ||
        `Internal administrative ticket filed by Duty Superintendent for immediate remediation at ${ticketLocation.trim()}.`,
      category: ticketCategory,
      department: dept,
      precinct: ticketPrecinct,
      locationAddress: ticketLocation.trim(),
      status: 'Under Review',
      priority: ticketPriority,
      citizen: {
        name: 'Dept Operations Dispatcher',
        phone: 'Ext #411',
        email: 'dispatch@civic.gov',
        citizenId: 'ADMIN-DISPATCH-01',
      },
      slaDeadlineHours: slaHours,
      evidence: [],
    });

    setTicketCreatedId(newId);
    setTicketError(null);
  };

  return (
    <>
      {/* Floating Action Trigger Button (Bottom-Right) */}
      <div ref={menuRef} className="fixed bottom-6 right-6 z-40">
        {/* Expanded Popup Menu */}
        {isOpen && (
          <div className="absolute bottom-14 right-0 w-80 sm:w-88 mb-2 bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg shadow-[0_8px_30px_rgb(0,0,0,0.25)] overflow-hidden transition-all duration-150 animate-in fade-in slide-in-from-bottom-2">
            {/* Header */}
            <div className="px-4 py-3 bg-[#242424] text-[#FAF7F0] flex items-center justify-between border-b border-[#C9B99F]/20">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-[#48234F] text-amber-200 flex items-center justify-center font-bold text-xs border border-[#C9B99F]/30">
                  <Zap className="w-3 h-3" />
                </div>
                <div>
                  <h4 className="text-xs font-bold leading-tight">Administrative Quick Actions</h4>
                  <p className="text-[10px] text-[#C9B99F]/80">Municipal Operations Shortcuts</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-white/10 text-[#C9B99F] hover:text-white transition"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Actions List */}
            <div className="p-2 space-y-1 text-xs">
              {/* Shortcut 1: Create New Department Ticket */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setTicketCreatedId(null);
                  setShowTicketModal(true);
                }}
                className="w-full flex items-start gap-3 p-2.5 rounded-md hover:bg-[#F2EEE6] dark:hover:bg-[#1d283a] text-left transition group border border-transparent hover:border-[#C9B99F]/40"
              >
                <div className="p-2 rounded bg-[#48234F]/10 dark:bg-sky-950 text-[#48234F] dark:text-sky-300 group-hover:bg-[#48234F] group-hover:text-white transition shrink-0">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-[#242424] dark:text-[#f1f5f9] block">
                    Create New Department Ticket
                  </span>
                  <span className="text-[11px] text-[#777064] dark:text-[#94a3b8] leading-tight block">
                    Direct staff intake with preset department and urgency SLA
                  </span>
                </div>
              </button>

              {/* Shortcut 2: Generate Daily Report */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setShowReportModal(true);
                }}
                className="w-full flex items-start gap-3 p-2.5 rounded-md hover:bg-[#F2EEE6] dark:hover:bg-[#1d283a] text-left transition group border border-transparent hover:border-[#C9B99F]/40"
              >
                <div className="p-2 rounded bg-[#48234F]/10 dark:bg-sky-950 text-[#48234F] dark:text-sky-300 group-hover:bg-[#48234F] group-hover:text-white transition shrink-0">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-[#242424] dark:text-[#f1f5f9] block">
                    Generate Daily Report
                  </span>
                  <span className="text-[11px] text-[#777064] dark:text-[#94a3b8] leading-tight block">
                    Compile executive briefing with SLA compliance & action items
                  </span>
                </div>
              </button>

              {/* Shortcut 3: Deploy Field Crew */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  navigateTo('dispatch');
                }}
                className="w-full flex items-start gap-3 p-2.5 rounded-md hover:bg-[#F2EEE6] dark:hover:bg-[#1d283a] text-left transition group border border-transparent hover:border-[#C9B99F]/40"
              >
                <div className="p-2 rounded bg-[#48234F]/10 dark:bg-sky-950 text-[#48234F] dark:text-sky-300 group-hover:bg-[#48234F] group-hover:text-white transition shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-[#242424] dark:text-[#f1f5f9] block">
                    Field Dispatch Console
                  </span>
                  <span className="text-[11px] text-[#777064] dark:text-[#94a3b8] leading-tight block">
                    Mobilize emergency repair crews and road units
                  </span>
                </div>
              </button>

              {/* Shortcut 4: Export Audit Ledger */}
              <button
                onClick={handleExportData}
                className="w-full flex items-start gap-3 p-2.5 rounded-md hover:bg-[#F2EEE6] dark:hover:bg-[#1d283a] text-left transition group border border-transparent hover:border-[#C9B99F]/40"
              >
                <div className="p-2 rounded bg-black/5 dark:bg-slate-800 text-[#777064] dark:text-slate-300 group-hover:bg-[#242424] group-hover:text-white transition shrink-0">
                  <Download className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold text-[#242424] dark:text-[#f1f5f9] block">
                    Export Audit Ledger (JSON)
                  </span>
                  <span className="text-[11px] text-[#777064] dark:text-[#94a3b8] leading-tight block">
                    Download full cryptographic municipal docket records
                  </span>
                </div>
              </button>
            </div>

            {/* Footer Telemetry */}
            <div className="px-3.5 py-2 bg-black/5 dark:bg-black/30 border-t border-[#C9B99F]/20 flex items-center justify-between text-[10px] text-[#777064] dark:text-[#94a3b8]">
              <span>System Status: Operational</span>
              <span className="font-mono tabular-nums">{grievances.length} Active Dockets</span>
            </div>
          </div>
        )}

        {/* Floating Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-lg font-bold text-xs shadow-xl transition-all duration-200 border border-[#C9B99F]/40 ${
            isOpen
              ? 'bg-[#242424] text-[#FAF7F0] ring-2 ring-[#48234F]'
              : 'bg-[#48234F] hover:bg-[#371B3D] text-white hover:scale-102'
          }`}
          aria-expanded={isOpen}
          aria-label="Open Quick Actions floating menu"
        >
          <Zap
            className={`w-4 h-4 text-amber-300 transition-transform ${isOpen ? 'rotate-90' : ''}`}
          />
          <span className="tracking-wide">Quick Actions</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      </div>

      {/* Modal 1: Daily Operations Executive Report */}
      {showReportModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto"
          onClick={() => setShowReportModal(false)}
        >
          <div
            className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg max-w-2xl w-full p-6 shadow-2xl relative my-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Report Header */}
            <div className="flex items-start justify-between border-b border-[#C9B99F]/40 pb-4 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#48234F] text-amber-200 flex items-center justify-center font-bold text-xs">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#777064] dark:text-[#94a3b8]">
                    Municipal Operations Briefing
                  </span>
                </div>
                <h3 className="text-xl font-extrabold text-[#242424] dark:text-[#f1f5f9] mt-1">
                  Executive Daily Redressal Report
                </h3>
                <p className="text-xs font-mono text-[#48234F] dark:text-sky-400 mt-0.5">
                  Docket Report Reference: {dailyReport.reportId}
                </p>
              </div>

              <button
                onClick={() => setShowReportModal(false)}
                className="p-1 rounded text-[#777064] hover:text-[#242424] dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Report Content Body */}
            <div className="space-y-4 text-xs">
              {/* Date & SLA Bar */}
              <div className="p-3.5 rounded-lg bg-white dark:bg-[#1a2230] border border-[#C9B99F]/30 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] text-[#777064] dark:text-[#94a3b8] block">
                    Date of Assessment:
                  </span>
                  <strong className="text-[#242424] dark:text-[#f1f5f9]">
                    {dailyReport.generatedAt}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#777064] dark:text-[#94a3b8] block">
                    Audited SLA Adherence:
                  </span>
                  <strong className="text-emerald-800 dark:text-emerald-400 text-sm font-bold tabular-nums">
                    {dailyReport.slaAdherenceRate}%
                  </strong>
                </div>
              </div>

              {/* Volume Counters */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2.5 rounded bg-white dark:bg-[#1a2230] border border-[#C9B99F]/30">
                  <span className="text-[10px] text-[#777064] block">Total Active</span>
                  <span className="text-base font-bold text-[#242424] dark:text-[#f1f5f9] tabular-nums">
                    {dailyReport.totalGrievances}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-white dark:bg-[#1a2230] border border-[#C9B99F]/30">
                  <span className="text-[10px] text-[#777064] block">In Review</span>
                  <span className="text-base font-bold text-amber-800 dark:text-amber-300 tabular-nums">
                    {dailyReport.underReview}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-white dark:bg-[#1a2230] border border-[#C9B99F]/30">
                  <span className="text-[10px] text-[#777064] block">In Field</span>
                  <span className="text-base font-bold text-blue-800 dark:text-sky-300 tabular-nums">
                    {dailyReport.inProgress}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-white dark:bg-[#1a2230] border border-[#C9B99F]/30">
                  <span className="text-[10px] text-[#777064] block">Critical</span>
                  <span className="text-base font-bold text-rose-800 dark:text-rose-300 tabular-nums">
                    {dailyReport.urgentCritical}
                  </span>
                </div>
              </div>

              {/* Executive Summary Statement */}
              <div className="p-3 rounded-lg bg-white/70 dark:bg-slate-900/50 border border-[#C9B99F]/30">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#777064] dark:text-[#94a3b8] block mb-1">
                  Executive Assessment:
                </span>
                <p className="text-[#242424] dark:text-[#f1f5f9] leading-relaxed">
                  {dailyReport.executiveStatusSummary}
                </p>
              </div>

              {/* Department Volume Share Table */}
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#777064] dark:text-[#94a3b8] block mb-1.5">
                  Department Workload Share:
                </span>
                <div className="border border-[#C9B99F]/30 rounded overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-black/5 dark:bg-slate-800 text-[10px] uppercase font-semibold text-[#777064]">
                      <tr>
                        <th className="py-1.5 px-3">Service Division</th>
                        <th className="py-1.5 px-3 text-center">Active Intake</th>
                        <th className="py-1.5 px-3 text-right">Urgency Flag</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#C9B99F]/20 bg-white dark:bg-[#1a2230]">
                      {dailyReport.departmentBreakdown.map((d) => (
                        <tr key={d.department}>
                          <td className="py-2 px-3 font-semibold text-[#242424] dark:text-[#f1f5f9]">
                            {d.department}
                          </td>
                          <td className="py-2 px-3 text-center font-bold tabular-nums">
                            {d.count}
                          </td>
                          <td className="py-2 px-3 text-right font-medium text-rose-700 dark:text-rose-400">
                            {d.urgent > 0 ? `${d.urgent} Escalations` : 'Nominal'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Urgent Action Items */}
              {dailyReport.urgentActionItems.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#777064] dark:text-[#94a3b8] block mb-1.5">
                    High Priority Action Directives:
                  </span>
                  <div className="space-y-1.5">
                    {dailyReport.urgentActionItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setShowReportModal(false);
                          navigateTo('detail', item.id);
                        }}
                        className="p-2 rounded bg-white dark:bg-[#1a2230] border border-[#C9B99F]/30 hover:border-[#48234F] flex items-center justify-between cursor-pointer transition"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#48234F] dark:text-sky-400">
                            {item.id}
                          </span>
                          <span className="font-semibold text-[#242424] dark:text-[#f1f5f9] truncate max-w-xs">
                            {item.title}
                          </span>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold">
                          {item.priority}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#C9B99F]/40 mt-5">
              <button
                onClick={handleCopyReport}
                className="px-4 py-2 rounded text-xs font-semibold bg-white dark:bg-slate-800 text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] hover:bg-[#F2EEE6] transition flex items-center gap-1.5"
              >
                {copiedReport ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Report Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Report Text</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded text-xs font-semibold bg-[#242424] hover:bg-black text-white transition flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Formal Report</span>
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 rounded text-xs font-semibold bg-[#48234F] hover:bg-[#371B3D] text-white transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Create New Department Ticket */}
      {showTicketModal && (
        <div
          className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs overflow-y-auto"
          onClick={() => setShowTicketModal(false)}
        >
          <div
            className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg max-w-lg w-full p-6 shadow-2xl relative my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-[#C9B99F]/40 pb-3 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded bg-[#48234F] text-amber-200 flex items-center justify-center font-bold text-xs">
                    <PlusCircle className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#777064] dark:text-[#94a3b8]">
                    Internal Administrative Intake
                  </span>
                </div>
                <h3 className="text-lg font-bold text-[#242424] dark:text-[#f1f5f9] mt-0.5">
                  Create Department Service Ticket
                </h3>
              </div>
              <button
                onClick={() => setShowTicketModal(false)}
                className="p-1 rounded text-[#777064] hover:text-[#242424]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {ticketCreatedId ? (
              <div className="py-6 text-center space-y-4">
                <div className="w-12 h-12 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center mx-auto border border-emerald-300">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-[#242424] dark:text-[#f1f5f9]">
                    Department Ticket Registered
                  </h4>
                  <p className="text-2xl font-mono font-black text-[#48234F] dark:text-sky-400 tabular-nums mt-1">
                    {ticketCreatedId}
                  </p>
                  <p className="text-xs text-[#777064] dark:text-[#94a3b8] mt-1">
                    Work order committed to {dept} with an immediate SLA clock.
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setShowTicketModal(false);
                      navigateTo('detail', ticketCreatedId);
                    }}
                    className="px-4 py-2 rounded text-xs font-semibold bg-[#48234F] hover:bg-[#371B3D] text-white"
                  >
                    Open Docket Inspector
                  </button>
                  <button
                    onClick={() => {
                      setTicketCreatedId(null);
                      setTicketTitle('');
                      setTicketLocation('');
                    }}
                    className="px-4 py-2 rounded text-xs font-semibold bg-white dark:bg-slate-800 text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F]"
                  >
                    Create Another
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateDepartmentTicket} className="space-y-3.5 text-xs">
                {ticketError && (
                  <div className="p-2.5 rounded bg-rose-50 text-rose-800 border border-rose-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{ticketError}</span>
                  </div>
                )}

                <div>
                  <label className="block font-semibold text-[#242424] dark:text-[#f1f5f9] mb-1">
                    Target Department *
                  </label>
                  <select
                    value={dept}
                    onChange={(e) => {
                      const d = e.target.value as DepartmentType;
                      setDept(d);
                      if (d === 'Public Works & Roads')
                        setTicketCategory('Pothole & Surface Subsidence');
                      if (d === 'Water Supply & Drainage')
                        setTicketCategory('Water Main Rupture / Drainage Open');
                      if (d === 'Sanitation & Solid Waste')
                        setTicketCategory('Commercial Compactor Failure');
                      if (d === 'Electrical & Street Lighting')
                        setTicketCategory('High Voltage Pole Hazard');
                      if (d === 'Parks & Urban Forestry') setTicketCategory('Fallen Branch Hazard');
                    }}
                    className="w-full bg-white dark:bg-[#1a2230] text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] dark:border-[#223a54] rounded p-2 focus:outline-none"
                  >
                    <option value="Public Works & Roads">Public Works & Roads</option>
                    <option value="Water Supply & Drainage">Water Supply & Drainage</option>
                    <option value="Sanitation & Solid Waste">Sanitation & Solid Waste</option>
                    <option value="Electrical & Street Lighting">
                      Electrical & Street Lighting
                    </option>
                    <option value="Parks & Urban Forestry">Parks & Urban Forestry</option>
                    <option value="Traffic & Public Safety">Traffic & Public Safety</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#242424] dark:text-[#f1f5f9] mb-1">
                    Incident Title / Summary *
                  </label>
                  <input
                    type="text"
                    value={ticketTitle}
                    onChange={(e) => setTicketTitle(e.target.value)}
                    placeholder="e.g. Emergency water valve failure flooding sidewalk"
                    className="w-full bg-white dark:bg-[#1a2230] text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] dark:border-[#223a54] rounded p-2 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[#242424] dark:text-[#f1f5f9] mb-1">
                      Precinct Jurisdiction *
                    </label>
                    <select
                      value={ticketPrecinct}
                      onChange={(e) => setTicketPrecinct(e.target.value)}
                      className="w-full bg-white dark:bg-[#1a2230] text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] dark:border-[#223a54] rounded p-2"
                    >
                      <option value="Ward 4 - Metro Center">Ward 4 - Metro Center</option>
                      <option value="Ward 7 - North District">Ward 7 - North District</option>
                      <option value="Ward 12 - Riverside & Harbor">
                        Ward 12 - Riverside & Harbor
                      </option>
                      <option value="Ward 2 - East Industrial Park">
                        Ward 2 - East Industrial Park
                      </option>
                      <option value="Ward 9 - Hillcrest Residential">
                        Ward 9 - Hillcrest Residential
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[#242424] dark:text-[#f1f5f9] mb-1">
                      Severity Urgency *
                    </label>
                    <select
                      value={ticketPriority}
                      onChange={(e) => setTicketPriority(e.target.value as GrievancePriority)}
                      className="w-full bg-white dark:bg-[#1a2230] text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] dark:border-[#223a54] rounded p-2 font-semibold"
                    >
                      <option value="Emergency">Emergency (12h SLA)</option>
                      <option value="Urgent">Urgent (24h SLA)</option>
                      <option value="Standard">Standard (48h SLA)</option>
                      <option value="Low">Low (72h SLA)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#242424] dark:text-[#f1f5f9] mb-1">
                    Street Location Address *
                  </label>
                  <input
                    type="text"
                    value={ticketLocation}
                    onChange={(e) => setTicketLocation(e.target.value)}
                    placeholder="e.g. 500 Broadway, north crosswalk"
                    className="w-full bg-white dark:bg-[#1a2230] text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] dark:border-[#223a54] rounded p-2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#242424] dark:text-[#f1f5f9] mb-1">
                    Operational Directive / Dispatch Notes
                  </label>
                  <textarea
                    value={ticketNotes}
                    onChange={(e) => setTicketNotes(e.target.value)}
                    rows={2}
                    placeholder="Initial dispatch directives for on-call inspectors or repair crews..."
                    className="w-full bg-white dark:bg-[#1a2230] text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] dark:border-[#223a54] rounded p-2 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#C9B99F]/30">
                  <button
                    type="button"
                    onClick={() => setShowTicketModal(false)}
                    className="px-4 py-2 rounded font-semibold bg-white dark:bg-slate-800 text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded font-bold bg-[#48234F] hover:bg-[#371B3D] text-white shadow-sm transition"
                  >
                    Generate Ticket Docket
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
};
