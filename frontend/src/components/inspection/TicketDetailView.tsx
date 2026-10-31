import React, { useState } from 'react';
import { useGrievance } from '../../context/GrievanceContext';
import { StatusBadge } from '../common/StatusBadge';
import { SlaCountdown } from '../common/SlaCountdown';
import { GrievanceStatus } from '../../types';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Shield,
  Send,
  CheckCircle,
  AlertTriangle,
  User,
  Phone,
  Mail,
  Camera,
  FileCheck,
  ChevronRight,
  ExternalLink,
  ThumbsUp,
  Maximize2,
} from 'lucide-react';

export const TicketDetailView: React.FC = () => {
  const {
    selectedGrievance,
    grievances,
    setSelectedGrievanceId,
    updateGrievanceStatus,
    addOfficerNote,
    dispatchCrew,
    resolveGrievance,
    upvoteGrievance,
    navigateTo,
  } = useGrievance();

  const [activeOfficerNote, setActiveOfficerNote] = useState('');
  const [activeCrewName, setActiveCrewName] = useState('Rapid Asphalt Patch Unit #4');
  const [dispatchNotes, setDispatchNotes] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolutionProofUrl, setResolutionProofUrl] = useState('');
  const [selectedImageModal, setSelectedImageModal] = useState<string | null>(null);

  if (!selectedGrievance) {
    return (
      <div className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-10 text-center">
        <h3 className="text-base font-bold text-[#242424] dark:text-[#f1f5f9]">
          No Docket Selected
        </h3>
        <p className="text-xs text-[#777064] dark:text-[#94a3b8] mt-1 mb-4">
          Please select a municipal grievance from the console to inspect its dossier.
        </p>
        <button
          onClick={() => navigateTo('dashboard')}
          className="px-4 py-2 rounded text-xs font-semibold bg-[#48234F] text-white"
        >
          Return to Console
        </button>
      </div>
    );
  }

  const g = selectedGrievance;

  const handleStatusChange = (newStatus: GrievanceStatus) => {
    updateGrievanceStatus(
      g.id,
      newStatus,
      `Superintendent reassigned case status to ${newStatus}.`
    );
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOfficerNote.trim()) return;
    addOfficerNote(g.id, activeOfficerNote.trim(), 'Insp. Sarah Chen', 'District Superintendent');
    setActiveOfficerNote('');
  };

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatchCrew(g.id, activeCrewName, dispatchNotes);
    setDispatchNotes('');
  };

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    resolveGrievance(
      g.id,
      resolutionNotes ||
        'Field inspection confirmed complete redressal per municipal building code.',
      resolutionProofUrl || undefined
    );
    setResolutionNotes('');
    setResolutionProofUrl('');
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('dashboard')}
            className="p-1.5 rounded hover:bg-[#F2EEE6] dark:hover:bg-slate-800 text-[#242424] dark:text-[#f1f5f9] transition"
            title="Return to console"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black font-mono text-[#48234F] dark:text-sky-400 tabular-nums">
                {g.id}
              </span>
              <StatusBadge status={g.status} size="sm" />
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-black/10 text-[#777064] dark:text-slate-300">
                {g.priority} Priority
              </span>
            </div>
            <p className="text-xs text-[#777064] dark:text-[#94a3b8] mt-0.5">{g.department}</p>
          </div>
        </div>

        {/* Quick Ticket Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#777064] dark:text-[#94a3b8] hidden sm:inline">
            Jump to Docket:
          </span>
          <select
            value={g.id}
            onChange={(e) => setSelectedGrievanceId(e.target.value)}
            className="text-xs bg-white dark:bg-[#1a2230] text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] dark:border-[#223a54] rounded px-2.5 py-1.5 focus:outline-none focus:border-[#48234F]"
          >
            {grievances.map((item) => (
              <option key={item.id} value={item.id}>
                {item.id} — {item.title.substring(0, 32)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Evidence, Geolocation, Statement */}
        <div className="lg:col-span-7 space-y-5">
          {/* Factual Statement Card */}
          <div className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-5 shadow-xs">
            <div className="flex items-start justify-between gap-3 border-b border-[#C9B99F]/30 pb-3 mb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#777064] dark:text-[#94a3b8]">
                  Verified Municipal Incident Statement
                </span>
                <h2 className="text-base sm:text-lg font-bold text-[#242424] dark:text-[#f1f5f9] mt-0.5">
                  {g.title}
                </h2>
              </div>
              <SlaCountdown
                createdAt={g.createdAt}
                slaDeadlineHours={g.slaDeadlineHours}
                isResolved={g.status === 'Resolved'}
              />
            </div>

            <p className="text-xs sm:text-sm text-[#242424] dark:text-[#f1f5f9] leading-relaxed whitespace-pre-line bg-white/70 dark:bg-slate-900/40 p-3.5 rounded border border-[#C9B99F]/30">
              {g.description}
            </p>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded bg-white/50 dark:bg-slate-800/40 border border-[#C9B99F]/20">
                <span className="text-[10px] text-[#777064] dark:text-[#94a3b8] block">
                  Precinct Ward
                </span>
                <strong className="text-[#242424] dark:text-[#f1f5f9]">{g.precinct}</strong>
              </div>
              <div className="p-2.5 rounded bg-white/50 dark:bg-slate-800/40 border border-[#C9B99F]/20">
                <span className="text-[10px] text-[#777064] dark:text-[#94a3b8] block">
                  Public Impact Score
                </span>
                <strong className="text-[#48234F] dark:text-sky-400 tabular-nums">
                  {g.impactScore} / 100
                </strong>
              </div>
              <div className="p-2.5 rounded bg-white/50 dark:bg-slate-800/40 border border-[#C9B99F]/20 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-[#777064] dark:text-[#94a3b8] block">
                  Citizen Endorsements
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <strong className="text-[#242424] dark:text-[#f1f5f9] tabular-nums">
                    {g.upvotes}
                  </strong>
                  <button
                    onClick={() => upvoteGrievance(g.id)}
                    className="p-1 hover:text-[#48234F] dark:hover:text-sky-400"
                    title="Endorse this civic issue"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* GIS Location & Precinct Coordinates Widget */}
          <div className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b border-[#C9B99F]/30 pb-2.5">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#242424] dark:text-[#f1f5f9]">
                  Jurisdiction GIS & Geolocation
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#777064] dark:text-[#94a3b8] tabular-nums">
                Lat: {g.gpsCoordinates?.lat || 40.7359}, Lng: {g.gpsCoordinates?.lng || -73.9882}
              </span>
            </div>

            <p className="text-xs text-[#242424] dark:text-[#f1f5f9] font-medium mb-3">
              Official Location: <strong className="underline">{g.locationAddress}</strong>
            </p>

            {/* Stylized Architectural GIS Map Simulator */}
            <div className="w-full h-44 rounded border border-[#C9B99F] dark:border-[#223a54] bg-[#242424] relative overflow-hidden flex items-center justify-center">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'radial-gradient(#C9B99F 1px, transparent 1px), radial-gradient(#C9B99F 1px, #242424 1px)',
                  backgroundSize: '20px 20px',
                  backgroundPosition: '0 0, 10px 10px',
                }}
              />

              {/* Grid Lines simulating municipal road network */}
              <div className="absolute inset-x-0 top-1/2 h-[2px] bg-[#C9B99F]/30" />
              <div className="absolute inset-y-0 left-1/3 w-[2px] bg-[#C9B99F]/30" />
              <div className="absolute inset-y-0 right-1/4 w-[2px] bg-[#C9B99F]/30" />

              {/* Pin Landmark */}
              <div className="relative z-10 flex flex-col items-center animate-bounce">
                <div className="px-2 py-1 rounded bg-[#48234F] text-white text-[10px] font-bold shadow-lg border border-amber-300">
                  {g.id} Incident Site
                </div>
                <div className="w-3 h-3 bg-red-600 rounded-full border-2 border-white shadow" />
              </div>

              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 text-[10px] text-[#C9B99F] font-mono">
                Precinct Sector Grid #42-B • Live Telemetry
              </div>
            </div>
          </div>

          {/* Photographic Evidence Gallery */}
          <div className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3 border-b border-[#C9B99F]/30 pb-2.5">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#48234F] dark:text-sky-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#242424] dark:text-[#f1f5f9]">
                  Photographic Evidence & Site Inspection ({g.evidence.length})
                </h3>
              </div>
              <span className="text-[10px] text-[#777064] dark:text-[#94a3b8]">
                Click image to inspect high-resolution
              </span>
            </div>

            {g.evidence.length === 0 ? (
              <p className="text-xs text-[#777064] dark:text-[#94a3b8] italic">
                No photographic evidence attached to this docket.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {g.evidence.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedImageModal(ev.url)}
                    className="group relative rounded border border-[#C9B99F] dark:border-[#223a54] bg-white dark:bg-slate-800 overflow-hidden cursor-pointer"
                  >
                    <img
                      src={ev.url}
                      alt={ev.caption}
                      className="w-full h-44 object-cover group-hover:scale-102 transition duration-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div className="p-2.5 bg-white/90 dark:bg-slate-900/90 text-[11px] text-[#242424] dark:text-[#f1f5f9]">
                      <p className="font-semibold">{ev.caption}</p>
                      <p className="text-[10px] text-[#777064] dark:text-[#94a3b8]">
                        Uploaded {ev.uploadedAt.substring(0, 10)}
                      </p>
                    </div>
                    <div className="absolute top-2 right-2 p-1.5 rounded bg-black/60 text-white opacity-0 group-hover:opacity-100 transition">
                      <Maximize2 className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Citizen Complainant Profile */}
          <div className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-4 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#777064] dark:text-[#94a3b8] block mb-2">
              Complainant Identity & Verification
            </span>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded bg-[#48234F]/10 dark:bg-sky-950 text-[#48234F] dark:text-sky-300 flex items-center justify-center font-bold text-sm border border-[#48234F]/30">
                  {g.citizen.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-[#242424] dark:text-[#f1f5f9]">{g.citizen.name}</p>
                  <p className="text-[10px] text-[#777064] dark:text-[#94a3b8]">
                    Citizen ID: {g.citizen.citizenId || 'Verified Resident'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[#777064] dark:text-[#94a3b8]">
                {g.citizen.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-[#48234F] dark:text-sky-400" />
                    {g.citizen.phone}
                  </span>
                )}
                {g.citizen.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3 text-[#48234F] dark:text-sky-400" />
                    {g.citizen.email}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Civic Timeline & Officer Actions */}
        <div className="lg:col-span-5 space-y-5">
          {/* Officer Command & Status Transitions */}
          <div className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#C9B99F]/30 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#48234F] dark:text-sky-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#242424] dark:text-[#f1f5f9]">
                  Superintendent Actions
                </h3>
              </div>
              <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                Authorized
              </span>
            </div>

            {/* Quick Status Shift Buttons */}
            <div className="mb-4">
              <label className="text-[11px] font-semibold text-[#777064] dark:text-[#94a3b8] block mb-1.5">
                Shift Docket Status:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  ['Under Review', 'In Progress', 'Escalated', 'Resolved'] as GrievanceStatus[]
                ).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(st)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded border transition ${
                      g.status === st
                        ? 'bg-[#48234F] text-white border-[#48234F] shadow-xs'
                        : 'bg-white dark:bg-slate-800 hover:bg-[#F2EEE6] text-[#242424] dark:text-[#f1f5f9] border-[#C9B99F]/50'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Fast Field Inspection Note Form */}
            <form onSubmit={handleAddNote} className="space-y-2 pt-2 border-t border-[#C9B99F]/20">
              <label className="text-[11px] font-semibold text-[#777064] dark:text-[#94a3b8] block">
                Log Formal Field Inspection Note:
              </label>
              <textarea
                value={activeOfficerNote}
                onChange={(e) => setActiveOfficerNote(e.target.value)}
                placeholder="Enter engineering notes, barricade confirmation, soil test results..."
                rows={2}
                className="w-full text-xs bg-white dark:bg-[#1a2230] text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] dark:border-[#223a54] rounded p-2 focus:outline-none focus:border-[#48234F]"
              />
              <button
                type="submit"
                className="w-full py-1.5 text-xs font-semibold bg-[#48234F] hover:bg-[#371B3D] text-white rounded transition"
              >
                + Commit Note to Civic Audit Trail
              </button>
            </form>

            {/* Fast Dispatch Work Order */}
            <form
              onSubmit={handleDispatch}
              className="mt-4 pt-3 border-t border-[#C9B99F]/20 space-y-2"
            >
              <label className="text-[11px] font-semibold text-[#777064] dark:text-[#94a3b8] block">
                Dispatch Crew Work Order:
              </label>
              <div className="flex gap-2">
                <select
                  value={activeCrewName}
                  onChange={(e) => setActiveCrewName(e.target.value)}
                  className="flex-1 text-xs bg-white dark:bg-[#1a2230] text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] dark:border-[#223a54] rounded px-2 py-1.5 focus:outline-none"
                >
                  <option value="Rapid Asphalt Patch Unit #4">Rapid Asphalt Patch Unit #4</option>
                  <option value="Emergency Valves & Isolation Crew B">
                    Emergency Valves & Isolation Crew B
                  </option>
                  <option value="Signals Emergency Response Unit 1">
                    Signals Emergency Response Unit 1
                  </option>
                  <option value="Bucket Truck & Chipper Unit 3">
                    Bucket Truck & Chipper Unit 3
                  </option>
                  <option value="Heavy Machinery Excavator Unit 7">
                    Heavy Machinery Excavator Unit 7
                  </option>
                </select>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs font-semibold bg-[#242424] dark:bg-slate-700 text-white rounded hover:bg-black transition"
                >
                  Dispatch
                </button>
              </div>
            </form>

            {/* Formal Close Docket */}
            {g.status !== 'Resolved' && (
              <div className="mt-4 pt-3 border-t border-[#C9B99F]/20">
                <details className="text-xs group">
                  <summary className="font-semibold text-emerald-800 dark:text-emerald-400 cursor-pointer hover:underline flex items-center justify-between">
                    <span>Close Case with Verification Proof</span>
                    <span className="text-[10px] text-[#777064]">Expand</span>
                  </summary>
                  <form onSubmit={handleResolve} className="mt-2 space-y-2 pt-2">
                    <input
                      type="text"
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Resolution summary (e.g. Sinkhole milled, filled & steam rolled)"
                      className="w-full text-xs bg-white dark:bg-[#1a2230] text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] dark:border-[#223a54] rounded p-2"
                    />
                    <input
                      type="url"
                      value={resolutionProofUrl}
                      onChange={(e) => setResolutionProofUrl(e.target.value)}
                      placeholder="Optional proof photograph URL"
                      className="w-full text-xs bg-white dark:bg-[#1a2230] text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] dark:border-[#223a54] rounded p-2"
                    />
                    <button
                      type="submit"
                      className="w-full py-2 text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white rounded transition shadow-xs"
                    >
                      Formal Resolution Sign-Off
                    </button>
                  </form>
                </details>
              </div>
            )}
          </div>

          {/* Civic Timeline & Audit Log (Continuous 2px guide rule per design system) */}
          <div className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-[#C9B99F]/30 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#48234F] dark:text-sky-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#242424] dark:text-[#f1f5f9]">
                  Civic Timeline & Audit Log
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#777064] dark:text-[#94a3b8] tabular-nums">
                {g.timeline.length} Milestones
              </span>
            </div>

            {/* Continuous 2px vertical guide rule in #C9B99F */}
            <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#C9B99F] dark:before:bg-slate-700">
              {g.timeline.map((mile) => {
                const isCompleted = mile.status === 'completed';
                const isInProgress = mile.status === 'in_progress';

                return (
                  <div key={mile.id} className="relative group text-xs">
                    {/* 12px Milestone node dot */}
                    <div
                      className={`absolute -left-[20px] top-1 w-3 h-3 rounded-full transition ${
                        isCompleted
                          ? 'bg-[#48234F] dark:bg-sky-500 ring-2 ring-[#FAF7F0] dark:ring-[#141f2e]'
                          : isInProgress
                            ? 'bg-amber-500 ring-2 ring-[#FAF7F0] dark:ring-[#141f2e] animate-pulse'
                            : 'bg-[#FAF7F0] dark:bg-slate-800 border-2 border-[#C9B99F] dark:border-slate-600'
                      }`}
                    />

                    <div>
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className="font-bold text-[#242424] dark:text-[#f1f5f9] leading-snug">
                          {mile.title}
                        </h4>
                        <span className="text-[10px] font-mono text-[#777064] dark:text-[#94a3b8] shrink-0 tabular-nums">
                          {mile.timestamp}
                        </span>
                      </div>

                      {mile.officerName && (
                        <p className="text-[11px] font-medium text-[#777064] dark:text-[#94a3b8] mt-0.5">
                          {mile.officerName} {mile.officerRole ? `(${mile.officerRole})` : ''}
                        </p>
                      )}

                      <p className="mt-1 text-xs text-[#242424] dark:text-[#cbd5e1] leading-relaxed bg-white/60 dark:bg-slate-800/60 p-2 rounded border border-[#C9B99F]/20">
                        {mile.notes}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* High-Resolution Evidence Modal */}
      {selectedImageModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs"
          onClick={() => setSelectedImageModal(null)}
        >
          <div
            className="max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-lg overflow-hidden border border-[#C9B99F] p-2 relative shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImageModal}
              alt="High resolution inspect"
              className="max-h-[75vh] w-auto mx-auto object-contain rounded"
            />
            <div className="p-3 text-right">
              <button
                onClick={() => setSelectedImageModal(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-[#242424] text-white rounded hover:bg-black transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
