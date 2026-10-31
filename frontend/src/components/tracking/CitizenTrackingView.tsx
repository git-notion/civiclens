import React, { useState } from 'react';
import { useGrievance } from '../../context/GrievanceContext';
import { StatusBadge } from '../common/StatusBadge';
import { SlaCountdown } from '../common/SlaCountdown';
import { Grievance } from '../../types';
import {
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  Building,
  User,
  ArrowRight,
  Send,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react';

export const CitizenTrackingView: React.FC = () => {
  const { grievances, navigateTo, addOfficerNote } = useGrievance();

  const [inputQuery, setInputQuery] = useState('#CIV-2026-8812');
  const [activeGrievance, setActiveGrievance] = useState<Grievance | null>(() => {
    return grievances.find((g) => g.id === '#CIV-2026-8812') || grievances[0] || null;
  });
  const [citizenFeedback, setCitizenFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const term = inputQuery.trim().toLowerCase();
    const match = grievances.find(
      (g) =>
        g.id.toLowerCase() === term ||
        g.id.toLowerCase().includes(term) ||
        g.citizen.phone.includes(term) ||
        g.citizen.name.toLowerCase().includes(term)
    );
    setActiveGrievance(match || null);
    setFeedbackSent(false);
  };

  const handleSendFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!citizenFeedback.trim() || !activeGrievance) return;
    addOfficerNote(
      activeGrievance.id,
      `Citizen Follow-up Inquiry: "${citizenFeedback.trim()}"`,
      activeGrievance.citizen.name,
      'Complainant Citizen'
    );
    setFeedbackSent(true);
    setCitizenFeedback('');
  };

  // Determine active step in milestone chain
  const getStageIndex = (g: Grievance): number => {
    if (g.status === 'Resolved') return 4;
    if (g.status === 'In Progress' && g.assignedCrew) return 3;
    if (g.status === 'In Progress') return 2;
    if (g.status === 'Escalated') return 2;
    return 1; // Under Review
  };

  const stageSteps = [
    { num: 1, title: 'Intake Registered', desc: 'Case received & logged' },
    { num: 2, title: 'Field Triage & SLA', desc: 'Engineering assessment' },
    { num: 3, title: 'Crew Dispatched', desc: 'Repair unit deployed' },
    { num: 4, title: 'Cleared & Certified', desc: 'Work inspected & closed' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Header */}
      <div className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-6 shadow-xs text-center">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#242424] dark:text-[#f1f5f9]">
          Track Your Municipal Grievance Status
        </h2>
        <p className="text-xs sm:text-sm text-[#777064] dark:text-[#94a3b8] max-w-lg mx-auto mt-1 mb-5">
          Enter your official <strong>#CIV-2026-XXXX</strong> reference ticket number or registered
          phone number to view live field milestones.
        </p>

        <form onSubmit={handleSearch} className="max-w-md mx-auto flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#777064]" />
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="e.g. #CIV-2026-8812 or phone"
              className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-[#1a2230] text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] dark:border-[#223a54] rounded focus:outline-none focus:border-[#48234F] font-mono"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-semibold bg-[#48234F] hover:bg-[#371B3D] text-white rounded transition shadow-sm"
          >
            Track Docket
          </button>
        </form>

        {/* Quick sample chips */}
        <div className="mt-3 flex items-center justify-center gap-2 flex-wrap text-xs text-[#777064]">
          <span>Quick Samples:</span>
          {grievances.slice(0, 3).map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => {
                setInputQuery(g.id);
                setActiveGrievance(g);
              }}
              className="font-mono text-[#48234F] dark:text-sky-400 hover:underline"
            >
              {g.id}
            </button>
          ))}
        </div>
      </div>

      {/* Case Result Card */}
      {!activeGrievance ? (
        <div className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-10 text-center">
          <ShieldAlert className="w-10 h-10 text-amber-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-[#242424] dark:text-[#f1f5f9]">
            No Docket Found for "{inputQuery}"
          </h3>
          <p className="text-xs text-[#777064] dark:text-[#94a3b8] mt-1">
            Please verify the ticket ID sequence or check if your grievance was filed under a
            different phone number.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Status & Stepper Card */}
          <div className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-6 shadow-xs space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#C9B99F]/30 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#777064] dark:text-[#94a3b8]">
                  Official Case Dossier
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <h3 className="text-xl font-black font-mono text-[#48234F] dark:text-sky-400 tabular-nums">
                    {activeGrievance.id}
                  </h3>
                  <StatusBadge status={activeGrievance.status} />
                </div>
                <p className="text-sm font-semibold text-[#242424] dark:text-[#f1f5f9] mt-1">
                  {activeGrievance.title}
                </p>
              </div>

              <div className="text-right">
                <SlaCountdown
                  createdAt={activeGrievance.createdAt}
                  slaDeadlineHours={activeGrievance.slaDeadlineHours}
                  isResolved={activeGrievance.status === 'Resolved'}
                />
                <p className="text-[11px] text-[#777064] dark:text-[#94a3b8] mt-1">
                  {activeGrievance.precinct}
                </p>
              </div>
            </div>

            {/* Visual Stepper */}
            <div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stageSteps.map((step) => {
                  const stageIndex = getStageIndex(activeGrievance);
                  const isDone = stageIndex >= step.num;
                  const isCurrent = stageIndex === step.num;

                  return (
                    <div
                      key={step.num}
                      className={`p-3 rounded-lg border text-xs transition ${
                        isDone
                          ? 'border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20'
                          : 'border-[#C9B99F]/40 bg-white/60 dark:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                            isDone
                              ? 'bg-emerald-700 text-white'
                              : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                          }`}
                        >
                          {isDone ? '✓' : step.num}
                        </div>
                        <span
                          className={`font-bold ${
                            isDone ? 'text-emerald-900 dark:text-emerald-300' : 'text-[#777064]'
                          }`}
                        >
                          {step.title}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#777064] dark:text-[#94a3b8] pl-7">
                        {step.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Details Summary Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2 border-t border-[#C9B99F]/30">
              <div className="p-3 rounded bg-white dark:bg-[#1a2230] border border-[#C9B99F]/30">
                <span className="text-[10px] text-[#777064] dark:text-[#94a3b8] block">
                  Assigned Superintendent
                </span>
                <strong className="text-[#242424] dark:text-[#f1f5f9]">
                  {activeGrievance.assignedOfficer?.name || 'Central Command Lead'}
                </strong>
                <p className="text-[10px] text-[#777064] mt-0.5">
                  Badge: {activeGrievance.assignedOfficer?.badge || 'CIV-ADM'}
                </p>
              </div>

              <div className="p-3 rounded bg-white dark:bg-[#1a2230] border border-[#C9B99F]/30">
                <span className="text-[10px] text-[#777064] dark:text-[#94a3b8] block">
                  Field Crew Status
                </span>
                <strong className="text-[#242424] dark:text-[#f1f5f9]">
                  {activeGrievance.assignedCrew || 'Awaiting dispatch confirmation'}
                </strong>
                <p className="text-[10px] text-[#777064] mt-0.5">
                  Priority: {activeGrievance.priority}
                </p>
              </div>

              <div className="p-3 rounded bg-white dark:bg-[#1a2230] border border-[#C9B99F]/30">
                <span className="text-[10px] text-[#777064] dark:text-[#94a3b8] block">
                  Location Verified
                </span>
                <strong className="text-[#242424] dark:text-[#f1f5f9] truncate block">
                  {activeGrievance.locationAddress}
                </strong>
                <p className="text-[10px] text-[#777064] mt-0.5">{activeGrievance.precinct}</p>
              </div>
            </div>
          </div>

          {/* Citizen Live Timeline */}
          <div className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-6 shadow-xs">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#777064] dark:text-[#94a3b8] border-b border-[#C9B99F]/30 pb-2 mb-4">
              Chronological Audit Trail & Officer Dispatch Logs
            </h3>

            <div className="relative pl-6 space-y-5 before:content-[''] before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#C9B99F]">
              {activeGrievance.timeline.map((mile) => (
                <div key={mile.id} className="relative text-xs">
                  <div className="absolute -left-[20px] top-1 w-3 h-3 rounded-full bg-[#48234F] ring-2 ring-[#FAF7F0] dark:ring-[#141f2e]" />
                  <div className="flex items-baseline justify-between">
                    <h4 className="font-bold text-[#242424] dark:text-[#f1f5f9]">{mile.title}</h4>
                    <span className="text-[10px] font-mono text-[#777064] tabular-nums">
                      {mile.timestamp}
                    </span>
                  </div>
                  {mile.officerName && (
                    <p className="text-[11px] text-[#777064]">{mile.officerName}</p>
                  )}
                  <p className="mt-1 text-xs text-[#242424] dark:text-[#cbd5e1] leading-relaxed bg-white/70 dark:bg-slate-800/70 p-2.5 rounded border border-[#C9B99F]/20">
                    {mile.notes}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Citizen Feedback / Follow-up Inquiry Box */}
          <div className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-[#48234F] dark:text-sky-400" />
              <h3 className="text-sm font-bold text-[#242424] dark:text-[#f1f5f9]">
                Submit Citizen Follow-up or Inquiry
              </h3>
            </div>
            <p className="text-xs text-[#777064] dark:text-[#94a3b8] mb-4">
              Have additional details or need to notify the field crew about site changes? Your note
              is immediately appended to the officer docket.
            </p>

            {feedbackSent && (
              <div className="mb-4 p-3 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 text-xs text-emerald-800 dark:text-emerald-200">
                ✓ Thank you. Your inquiry has been appended to the official municipal audit trail.
              </div>
            )}

            <form onSubmit={handleSendFeedback} className="space-y-3">
              <textarea
                value={citizenFeedback}
                onChange={(e) => setCitizenFeedback(e.target.value)}
                rows={3}
                placeholder="Enter your message or update for District Inspector Chen..."
                className="w-full text-xs bg-white dark:bg-[#1a2230] text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] dark:border-[#223a54] rounded p-3 focus:outline-none focus:border-[#48234F]"
              />
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => navigateTo('detail', activeGrievance.id)}
                  className="text-xs font-semibold text-[#48234F] dark:text-sky-400 hover:underline"
                >
                  Inspect Full Administrative Dossier →
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded bg-[#48234F] hover:bg-[#371B3D] text-white shadow-sm transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Transmit Note to Officer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
