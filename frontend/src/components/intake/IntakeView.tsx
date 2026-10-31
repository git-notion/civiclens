import React, { useState } from 'react';
import { useGrievance } from '../../context/GrievanceContext';
import { DepartmentType, GrievancePriority, GrievanceEvidence } from '../../types';
import {
  FileText,
  MapPin,
  Camera,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  Trash2,
  HelpCircle,
  Building,
} from 'lucide-react';

export const IntakeView: React.FC = () => {
  const { addGrievance, navigateTo } = useGrievance();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);

  // Form Fields
  const [citizenName, setCitizenName] = useState('');
  const [citizenPhone, setCitizenPhone] = useState('');
  const [citizenEmail, setCitizenEmail] = useState('');
  const [citizenId, setCitizenId] = useState('');
  const [precinct, setPrecinct] = useState('Ward 4 - Metro Center');
  const [locationAddress, setLocationAddress] = useState('');

  const [department, setDepartment] = useState<DepartmentType>('Public Works & Roads');
  const [category, setCategory] = useState('Potholes & Pavement Failure');
  const [priority, setPriority] = useState<GrievancePriority>('Standard');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [evidenceList, setEvidenceList] = useState<GrievanceEvidence[]>([]);
  const [evidenceUrlInput, setEvidenceUrlInput] = useState('');
  const [evidenceCaption, setEvidenceCaption] = useState('');

  const [consentPublic, setConsentPublic] = useState(true);
  const [declarationTruth, setDeclarationTruth] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Sample quick pre-fill for fast testing
  const handleQuickPreFill = () => {
    setCitizenName('Beatrice Dupont');
    setCitizenPhone('+1 (555) 782-4411');
    setCitizenEmail('b.dupont@civic.org');
    setCitizenId('CIT-9041-NY');
    setPrecinct('Ward 7 - North District');
    setLocationAddress('412 Pine Street, adjacent to St. Jude Hospital');
    setDepartment('Traffic & Public Safety');
    setCategory('Broken Pedestrian Crossing Beacon');
    setPriority('Urgent');
    setTitle('Flashing crosswalk signal unpowered causing vehicle near-misses');
    setDescription(
      'The solar powered pedestrian crossing beacon directly outside the hospital entrance stopped functioning 3 days ago. Multiple elderly patients and medical staff have reported near misses with speeding commercial vehicles during twilight hours.'
    );
    setEvidenceList([
      {
        id: 'ev-demo-1',
        url: 'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?auto=format&fit=crop&w=800&q=80',
        caption: 'Pedestrian crossing post showing unpowered LED lens',
        uploadedAt: new Date().toISOString(),
        type: 'image',
      },
    ]);
    setDeclarationTruth(true);
  };

  const handleAddEvidence = () => {
    if (!evidenceUrlInput.trim()) return;
    const newEv: GrievanceEvidence = {
      id: `ev-${Date.now()}`,
      url: evidenceUrlInput.trim(),
      caption: evidenceCaption.trim() || 'Citizen submitted visual evidence',
      uploadedAt: new Date().toISOString(),
      type: 'image',
    };
    setEvidenceList([...evidenceList, newEv]);
    setEvidenceUrlInput('');
    setEvidenceCaption('');
  };

  const handleRemoveEvidence = (id: string) => {
    setEvidenceList(evidenceList.filter((e) => e.id !== id));
  };

  const validateStep = (step: number): boolean => {
    setFormError(null);
    if (step === 1) {
      if (!citizenName.trim()) {
        setFormError('Citizen full name is required for formal docket filing.');
        return false;
      }
      if (!citizenPhone.trim() && !citizenEmail.trim()) {
        setFormError('Please provide at least a phone number or email address.');
        return false;
      }
      if (!locationAddress.trim()) {
        setFormError('Please specify the exact street location or municipal landmark.');
        return false;
      }
    }
    if (step === 2) {
      if (!department || !category) {
        setFormError('Please choose the municipal department and service category.');
        return false;
      }
    }
    if (step === 3) {
      if (!title.trim() || title.length < 5) {
        setFormError('Please provide a descriptive incident title (min 5 characters).');
        return false;
      }
      if (!description.trim() || description.length < 15) {
        setFormError('Please describe the issue in detail so municipal crews can respond.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(4, prev + 1));
    }
  };

  const handleBack = () => {
    setFormError(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!declarationTruth) {
      setFormError('You must formally declare the truthfulness of this municipal grievance.');
      return;
    }

    const slaHours = priority === 'Emergency' ? 12 : priority === 'Urgent' ? 24 : 48;

    const newId = addGrievance({
      title,
      description,
      category,
      department,
      precinct,
      locationAddress,
      status: 'Under Review',
      priority,
      citizen: {
        name: citizenName,
        phone: citizenPhone,
        email: citizenEmail,
        citizenId: citizenId || undefined,
      },
      slaDeadlineHours: slaHours,
      evidence: evidenceList,
    });

    setSubmittedTicketId(newId);
  };

  if (submittedTicketId) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-6 sm:p-8 shadow-[0_4px_12px_-2px_rgba(36,36,36,0.08)] text-center">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-lg flex items-center justify-center mx-auto mb-4 border border-emerald-300">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-[11px] font-bold tracking-wider uppercase text-[#777064] dark:text-[#94a3b8]">
            Formal Civic Intake Registered
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-[#242424] dark:text-[#f1f5f9] mt-1">
            Grievance Docket Created
          </h2>

          <div className="my-6 p-4 bg-white dark:bg-[#1a2230] border border-[#C9B99F]/40 dark:border-[#223a54] rounded-lg inline-block">
            <p className="text-xs text-[#777064] dark:text-[#94a3b8] mb-1">
              Official Reference Ticket ID
            </p>
            <p className="text-2xl font-black font-mono text-[#48234F] dark:text-sky-400 tabular-nums">
              {submittedTicketId}
            </p>
            <p className="text-[11px] text-[#777064] dark:text-[#94a3b8] mt-1">
              Assigned to {precinct} • SLA Window: {priority === 'Emergency' ? '12h' : '48h'}
            </p>
          </div>

          <p className="text-xs sm:text-sm text-[#777064] dark:text-[#94a3b8] max-w-lg mx-auto mb-6">
            Your grievance has been formally logged into the Municipal Dispatch Gateway. A tracking
            confirmation has been queued for {citizenEmail || citizenPhone}. Field engineers for{' '}
            {department} have received automated notification.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => navigateTo('detail', submittedTicketId)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-semibold bg-[#48234F] hover:bg-[#371B3D] text-white shadow-sm transition"
            >
              Inspect Docket & Audit Log
            </button>
            <button
              onClick={() => navigateTo('tracking', submittedTicketId)}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg text-xs font-semibold bg-[#FAF7F0] hover:bg-[#F2EEE6] dark:bg-[#1a2230] text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] dark:border-[#223a54] transition"
            >
              Citizen Live Tracker
            </button>
            <button
              onClick={() => {
                setSubmittedTicketId(null);
                setCurrentStep(1);
                setTitle('');
                setDescription('');
                setEvidenceList([]);
              }}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg text-xs font-medium text-[#777064] dark:text-[#94a3b8] hover:underline"
            >
              Submit Another Case
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header & Pre-fill helper */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-4 sm:p-5">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#242424] dark:text-[#f1f5f9]">
            Municipal Grievance Filing Portal
          </h2>
          <p className="text-xs text-[#777064] dark:text-[#94a3b8]">
            Follow the 4 structured steps to log a verified civic complaint with legal
            accountability.
          </p>
        </div>
        <button
          type="button"
          onClick={handleQuickPreFill}
          className="text-xs font-semibold px-3 py-1.5 rounded bg-black/5 dark:bg-slate-800 text-[#48234F] dark:text-sky-400 hover:bg-black/10 transition border border-[#C9B99F]/40"
        >
          Auto-Fill Realistic Sample
        </button>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-4">
        <div className="grid grid-cols-4 gap-2 text-center text-xs">
          {[
            { num: 1, label: 'Citizen & Ward' },
            { num: 2, label: 'Categorization' },
            { num: 3, label: 'Incident & Evidence' },
            { num: 4, label: 'Review & Sign-Off' },
          ].map((s) => {
            const isDone = currentStep > s.num;
            const isCurrent = currentStep === s.num;
            return (
              <div key={s.num} className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded flex items-center justify-center font-bold text-xs mb-1 transition ${
                    isDone
                      ? 'bg-emerald-700 text-white'
                      : isCurrent
                        ? 'bg-[#48234F] text-white shadow-xs'
                        : 'bg-[#EAE7E7] dark:bg-slate-800 text-[#777064] dark:text-slate-400'
                  }`}
                >
                  {isDone ? '✓' : s.num}
                </div>
                <span
                  className={`text-[11px] font-semibold hidden sm:inline ${
                    isCurrent
                      ? 'text-[#242424] dark:text-[#f1f5f9]'
                      : 'text-[#777064] dark:text-[#94a3b8]'
                  }`}
                >
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Error Banner */}
      {formError && (
        <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{formError}</span>
        </div>
      )}

      {/* Step Content Container */}
      <div className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-5 sm:p-7 shadow-xs">
        {/* Step 1: Citizen & Jurisdiction */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#777064] dark:text-[#94a3b8] border-b border-[#C9B99F]/30 pb-2">
              Step 1: Citizen Identity & Jurisdiction
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#242424] dark:text-[#f1f5f9] mb-1">
                  Full Name of Citizen *
                </label>
                <input
                  type="text"
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                  placeholder="e.g. Julian Vance"
                  className="w-full text-xs bg-white dark:bg-[#1a2230] text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] dark:border-[#223a54] rounded px-3 py-2 focus:outline-none focus:border-[#48234F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#242424] dark:text-[#f1f5f9] mb-1">
                  National / Voter ID (Optional)
                </label>
                <input
                  type="text"
                  value={citizenId}
                  onChange={(e) => setCitizenId(e.target.value)}
                  placeholder="e.g. CIT-7882-NY"
                  className="w-full text-xs bg-white dark:bg-[#1a2230] text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] dark:border-[#223a54] rounded px-3 py-2 focus:outline-none focus:border-[#48234F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#242424] dark:text-[#f1f5f9] mb-1">
                  Mobile Contact Phone *
                </label>
                <input
                  type="tel"
                  value={citizenPhone}
                  onChange={(e) => setCitizenPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full text-xs bg-white dark:bg-[#1a2230] text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] dark:border-[#223a54] rounded px-3 py-2 focus:outline-none focus:border-[#48234F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#242424] dark:text-[#f1f5f9] mb-1">
                  Email Address (For SLA Notifications) *
                </label>
                <input
                  type="email"
                  value={citizenEmail}
                  onChange={(e) => setCitizenEmail(e.target.value)}
                  placeholder="citizen@example.com"
                  className="w-full text-xs bg-white dark:bg-[#1a2230] text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] dark:border-[#223a54] rounded px-3 py-2 focus:outline-none focus:border-[#48234F]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-[#242424] dark:text-[#f1f5f9] mb-1">
                  Precinct Ward Jurisdiction *
                </label>
                <select
                  value={precinct}
                  onChange={(e) => setPrecinct(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-[#1a2230] text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] dark:border-[#223a54] rounded px-3 py-2 focus:outline-none focus:border-[#48234F]"
                >
                  <option value="Ward 4 - Metro Center">Ward 4 - Metro Center</option>
                  <option value="Ward 7 - North District">Ward 7 - North District</option>
                  <option value="Ward 12 - Riverside & Harbor">Ward 12 - Riverside & Harbor</option>
                  <option value="Ward 2 - East Industrial Park">
                    Ward 2 - East Industrial Park
                  </option>
                  <option value="Ward 9 - Hillcrest Residential">
                    Ward 9 - Hillcrest Residential
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#242424] dark:text-[#f1f5f9] mb-1">
                  Specific Street Location & Nearest Cross-Street *
                </label>
                <input
                  type="text"
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  placeholder="e.g. 248 Lexington Ave, corner with 14th St"
                  className="w-full text-xs bg-white dark:bg-[#1a2230] text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] dark:border-[#223a54] rounded px-3 py-2 focus:outline-none focus:border-[#48234F]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Categorization & Urgency */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#777064] dark:text-[#94a3b8] border-b border-[#C9B99F]/30 pb-2">
              Step 2: Department Categorization & Severity
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#242424] dark:text-[#f1f5f9] mb-1">
                  Responsible Municipal Department *
                </label>
                <select
                  value={department}
                  onChange={(e) => {
                    const d = e.target.value as DepartmentType;
                    setDepartment(d);
                    if (d === 'Public Works & Roads') setCategory('Potholes & Pavement Failure');
                    if (d === 'Water Supply & Drainage') setCategory('Water Main Break & Leakage');
                    if (d === 'Sanitation & Solid Waste')
                      setCategory('Solid Waste & Garbage Cleansing');
                    if (d === 'Electrical & Street Lighting')
                      setCategory('Streetlight Blackout & Hazards');
                    if (d === 'Parks & Urban Forestry')
                      setCategory('Hazardous Trees & Storm Debris');
                    if (d === 'Traffic & Public Safety')
                      setCategory('Broken Traffic Signal / Crossing');
                  }}
                  className="w-full text-xs bg-white dark:bg-[#1a2230] text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] dark:border-[#223a54] rounded px-3 py-2 focus:outline-none focus:border-[#48234F]"
                >
                  <option value="Public Works & Roads">Public Works & Roads</option>
                  <option value="Water Supply & Drainage">Water Supply & Drainage</option>
                  <option value="Sanitation & Solid Waste">Sanitation & Solid Waste</option>
                  <option value="Electrical & Street Lighting">Electrical & Street Lighting</option>
                  <option value="Parks & Urban Forestry">Parks & Urban Forestry</option>
                  <option value="Traffic & Public Safety">Traffic & Public Safety</option>
                  <option value="Building & Code Compliance">Building & Code Compliance</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#242424] dark:text-[#f1f5f9] mb-1">
                  Specific Grievance Sub-Category *
                </label>
                <input
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. Broken Storm Grate, Manhole defect"
                  className="w-full text-xs bg-white dark:bg-[#1a2230] text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] dark:border-[#223a54] rounded px-3 py-2 focus:outline-none focus:border-[#48234F]"
                />
              </div>
            </div>

            {/* Severity Radio Cards */}
            <div>
              <label className="block text-xs font-semibold text-[#242424] dark:text-[#f1f5f9] mb-2">
                Severity Level & Public Safety Impact *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                {[
                  {
                    level: 'Low' as GrievancePriority,
                    label: 'Low Priority',
                    desc: 'Aesthetic, non-blocking maintenance (SLA: 72h)',
                    border: 'border-slate-300',
                  },
                  {
                    level: 'Standard' as GrievancePriority,
                    label: 'Standard',
                    desc: 'Regular municipal service failure (SLA: 48h)',
                    border: 'border-amber-400',
                  },
                  {
                    level: 'Urgent' as GrievancePriority,
                    label: 'Urgent',
                    desc: 'Traffic blockage or public safety risk (SLA: 24h)',
                    border: 'border-orange-500',
                  },
                  {
                    level: 'Emergency' as GrievancePriority,
                    label: 'Emergency',
                    desc: 'Immediate hazard to human life or infrastructure (SLA: 12h)',
                    border: 'border-red-600',
                  },
                ].map((item) => {
                  const isSelected = priority === item.level;
                  return (
                    <div
                      key={item.level}
                      onClick={() => setPriority(item.level)}
                      className={`p-3 rounded-lg border cursor-pointer transition ${
                        isSelected
                          ? 'border-[#48234F] bg-[#48234F]/10 dark:bg-sky-950/40 dark:border-sky-400 ring-1 ring-[#48234F]'
                          : 'border-[#C9B99F]/50 bg-white dark:bg-[#1a2230] hover:bg-[#F2EEE6] dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-[#242424] dark:text-[#f1f5f9]">
                          {item.label}
                        </span>
                        <div
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-[#48234F] bg-[#48234F]' : 'border-[#C9B99F]'
                          }`}
                        >
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                      </div>
                      <p className="text-[10px] text-[#777064] dark:text-[#94a3b8] leading-tight">
                        {item.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Incident Details & Evidence Upload */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#777064] dark:text-[#94a3b8] border-b border-[#C9B99F]/30 pb-2">
              Step 3: Incident Description & Visual Evidence
            </h3>

            <div>
              <label className="block text-xs font-semibold text-[#242424] dark:text-[#f1f5f9] mb-1">
                Grievance Title / Summary *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Deep sinkhole in eastbound lane near school crosswalk"
                className="w-full text-xs bg-white dark:bg-[#1a2230] text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] dark:border-[#223a54] rounded px-3 py-2 focus:outline-none focus:border-[#48234F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#242424] dark:text-[#f1f5f9] mb-1">
                Comprehensive Incident Statement *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe when the issue began, exact dimensions or impact, whether vehicles or pedestrians are impaired, and any ongoing risks..."
                className="w-full text-xs bg-white dark:bg-[#1a2230] text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] dark:border-[#223a54] rounded px-3 py-2 focus:outline-none focus:border-[#48234F] leading-relaxed"
              />
            </div>

            {/* Evidence dropzone & list */}
            <div>
              <label className="block text-xs font-semibold text-[#242424] dark:text-[#f1f5f9] mb-1">
                Attach Photographic or Documentary Evidence
              </label>

              <div className="flex flex-col sm:flex-row gap-2 mb-3">
                <input
                  type="url"
                  value={evidenceUrlInput}
                  onChange={(e) => setEvidenceUrlInput(e.target.value)}
                  placeholder="Paste image URL (e.g. https://...)"
                  className="flex-1 text-xs bg-white dark:bg-[#1a2230] text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] dark:border-[#223a54] rounded px-3 py-2 focus:outline-none focus:border-[#48234F]"
                />
                <input
                  type="text"
                  value={evidenceCaption}
                  onChange={(e) => setEvidenceCaption(e.target.value)}
                  placeholder="Caption / description"
                  className="sm:w-64 text-xs bg-white dark:bg-[#1a2230] text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] dark:border-[#223a54] rounded px-3 py-2 focus:outline-none focus:border-[#48234F]"
                />
                <button
                  type="button"
                  onClick={handleAddEvidence}
                  className="px-3.5 py-2 text-xs font-semibold bg-[#48234F] hover:bg-[#371B3D] text-white rounded transition shrink-0"
                >
                  Add Evidence
                </button>
              </div>

              {/* Uploaded Evidence Previews */}
              {evidenceList.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                  {evidenceList.map((ev) => (
                    <div
                      key={ev.id}
                      className="relative rounded-lg overflow-hidden border border-[#C9B99F] dark:border-[#223a54] bg-white dark:bg-slate-800 p-1 group"
                    >
                      <img
                        src={ev.url}
                        alt={ev.caption}
                        className="w-full h-24 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <p className="text-[10px] text-[#777064] dark:text-[#94a3b8] truncate mt-1 px-1">
                        {ev.caption}
                      </p>
                      <button
                        type="button"
                        onClick={() => handleRemoveEvidence(ev.id)}
                        className="absolute top-2 right-2 p-1 rounded bg-black/70 text-white hover:bg-red-600 transition"
                        title="Remove evidence"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Review & Legal Declaration */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#777064] dark:text-[#94a3b8] border-b border-[#C9B99F]/30 pb-2">
              Step 4: Formal Audit Summary & Citizen Declaration
            </h3>

            {/* Structured Summary Card */}
            <div className="bg-white dark:bg-[#1a2230] border border-[#C9B99F]/40 dark:border-[#223a54] rounded-lg p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-[#C9B99F]/20 pb-2">
                <span className="font-semibold text-[#777064] dark:text-[#94a3b8]">Citizen:</span>
                <span className="font-bold text-[#242424] dark:text-[#f1f5f9]">
                  {citizenName} ({citizenPhone || citizenEmail})
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-[#C9B99F]/20 pb-2">
                <span className="font-semibold text-[#777064] dark:text-[#94a3b8]">
                  Precinct Jurisdiction:
                </span>
                <span className="font-bold text-[#242424] dark:text-[#f1f5f9]">{precinct}</span>
              </div>
              <div className="flex items-center justify-between border-b border-[#C9B99F]/20 pb-2">
                <span className="font-semibold text-[#777064] dark:text-[#94a3b8]">Address:</span>
                <span className="font-medium text-[#242424] dark:text-[#f1f5f9]">
                  {locationAddress}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-[#C9B99F]/20 pb-2">
                <span className="font-semibold text-[#777064] dark:text-[#94a3b8]">
                  Service Area:
                </span>
                <span className="font-bold text-[#242424] dark:text-[#f1f5f9]">
                  {department} ({category})
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-[#C9B99F]/20 pb-2">
                <span className="font-semibold text-[#777064] dark:text-[#94a3b8]">
                  Severity Rating:
                </span>
                <span className="font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
                  {priority} (SLA Window: {priority === 'Emergency' ? '12h' : '48h'})
                </span>
              </div>
              <div>
                <p className="font-semibold text-[#777064] dark:text-[#94a3b8] mb-1">
                  Grievance Statement:
                </p>
                <p className="text-[#242424] dark:text-[#f1f5f9] bg-[#FAF7F0] dark:bg-[#141f2e] p-2.5 rounded border border-[#C9B99F]/30 leading-relaxed">
                  <strong>{title}</strong> — {description}
                </p>
              </div>
            </div>

            {/* Legal / Civic Consent Checkboxes */}
            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-[#242424] dark:text-[#f1f5f9]">
                <input
                  type="checkbox"
                  checked={consentPublic}
                  onChange={(e) => setConsentPublic(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-[#48234F] border-[#C9B99F] focus:ring-[#48234F]"
                />
                <span>
                  Publish to Municipal Civic Transparency Board (Location & issue summary will be
                  public for civic oversight, personal phone/email remains confidential).
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer text-xs font-semibold text-[#242424] dark:text-[#f1f5f9]">
                <input
                  type="checkbox"
                  checked={declarationTruth}
                  onChange={(e) => setDeclarationTruth(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-[#48234F] border-[#C9B99F] focus:ring-[#48234F]"
                />
                <span>
                  I solemnly declare that the facts described in this grievance are truthful to the
                  best of my knowledge under municipal public service regulations. *
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Action Navigation Footer */}
        <div className="flex items-center justify-between pt-6 border-t border-[#C9B99F]/30 mt-6">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 text-xs font-semibold rounded bg-[#FAF7F0] hover:bg-[#F2EEE6] dark:bg-slate-800 dark:hover:bg-slate-700 text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] dark:border-[#223a54] transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2 text-xs font-semibold rounded bg-[#48234F] hover:bg-[#371B3D] text-white shadow-sm transition flex items-center gap-1.5"
            >
              <span>Continue to Step {currentStep + 1}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2.5 text-xs font-bold rounded bg-[#48234F] hover:bg-[#371B3D] text-white shadow-md transition flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>Submit Grievance to Municipal Docket</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
