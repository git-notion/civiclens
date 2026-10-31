import React, { useState } from 'react';
import { useGrievance } from '../../context/GrievanceContext';
import { Grievance, GrievancePriority, DepartmentType } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { SlaCountdown } from '../common/SlaCountdown';
import {
  MapPin,
  Layers,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Compass,
  Building,
  AlertTriangle,
  ArrowRight,
  Filter,
  Eye,
  Flame,
  Truck,
  Shield,
  X,
} from 'lucide-react';

export const GisMapView: React.FC = () => {
  const { grievances, navigateTo, selectedPrecinct, setSelectedPrecinct } = useGrievance();

  const [activeMarkerId, setActiveMarkerId] = useState<string | null>('#CIV-2026-8812');
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showBoundaries, setShowBoundaries] = useState(true);
  const [deptFilter, setDeptFilter] = useState<string>('All');
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  const filteredGrievances = grievances.filter((g) => {
    if (selectedPrecinct !== 'All' && g.precinct !== selectedPrecinct) return false;
    if (deptFilter !== 'All' && g.department !== deptFilter) return false;
    return true;
  });

  const selectedTicket = grievances.find((g) => g.id === activeMarkerId) || null;

  // Precinct coordinate centroids on the SVG coordinate plane (width 900, height 550)
  const wardPositions: Record<string, { x: number; y: number; label: string }> = {
    'Ward 4 - Metro Center': { x: 450, y: 260, label: 'Ward 4 • Metro Center' },
    'Ward 7 - North District': { x: 380, y: 120, label: 'Ward 7 • North District' },
    'Ward 12 - Riverside & Harbor': { x: 670, y: 350, label: 'Ward 12 • Riverside' },
    'Ward 2 - East Industrial Park': { x: 220, y: 380, label: 'Ward 2 • East Industrial' },
    'Ward 9 - Hillcrest Residential': { x: 650, y: 140, label: 'Ward 9 • Hillcrest' },
  };

  // Generate deterministic map coordinates for tickets
  const getTicketCoordinates = (g: Grievance, index: number): { x: number; y: number } => {
    const base = wardPositions[g.precinct] || { x: 450, y: 260 };
    // Offset slightly based on ticket hash so multiple tickets in same ward spread naturally
    const charCode = g.id.charCodeAt(g.id.length - 1) + index * 23;
    const offsetX = ((charCode * 17) % 110) - 55;
    const offsetY = ((charCode * 29) % 90) - 45;
    return {
      x: Math.max(80, Math.min(820, base.x + offsetX)),
      y: Math.max(60, Math.min(490, base.y + offsetY)),
    };
  };

  return (
    <div className="space-y-6">
      {/* Top Briefing & Layer Controls */}
      <div className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Compass className="w-4 h-4 text-[#48234F] dark:text-sky-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#777064] dark:text-[#94a3b8]">
              Geographic Information System (GIS) Command
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#242424] dark:text-[#f1f5f9]">
            Live Metropolitan Incident GIS Map
          </h2>
          <p className="text-xs text-[#777064] dark:text-[#94a3b8] max-w-xl">
            Spatial monitoring of reported civic hazards, road closures, and municipal field unit
            allocations across all precinct sectors.
          </p>
        </div>

        {/* View Toggles & Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Heatmap Toggle */}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`px-3 py-1.5 rounded text-xs font-semibold border transition flex items-center gap-1.5 ${
              showHeatmap
                ? 'bg-rose-700 text-white border-rose-800 shadow-xs'
                : 'bg-white dark:bg-[#1a2230] text-[#242424] dark:text-[#f1f5f9] border-[#C9B99F] dark:border-[#223a54]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Density Heatmap</span>
          </button>

          {/* Boundaries Toggle */}
          <button
            onClick={() => setShowBoundaries(!showBoundaries)}
            className={`px-3 py-1.5 rounded text-xs font-semibold border transition flex items-center gap-1.5 ${
              showBoundaries
                ? 'bg-[#48234F] text-white border-[#48234F]'
                : 'bg-white dark:bg-[#1a2230] text-[#242424] dark:text-[#f1f5f9] border-[#C9B99F] dark:border-[#223a54]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Ward Polygons</span>
          </button>

          {/* Department Filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="text-xs bg-white dark:bg-[#1a2230] text-[#242424] dark:text-[#f1f5f9] border border-[#C9B99F] dark:border-[#223a54] rounded px-2.5 py-1.5 focus:outline-none"
            aria-label="Filter GIS map by department"
          >
            <option value="All">All Departments</option>
            <option value="Public Works & Roads">Public Works</option>
            <option value="Water Supply & Drainage">Water Supply</option>
            <option value="Electrical & Street Lighting">Electrical Grid</option>
            <option value="Sanitation & Solid Waste">Sanitation</option>
            <option value="Parks & Urban Forestry">Urban Forestry</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Interactive Map (8 cols) and Selected Incident Inspector (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive GIS Map Canvas Container (8 cols) */}
        <div className="lg:col-span-8 bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-3 shadow-xs relative overflow-hidden">
          {/* Zoom Controls Overlay */}
          <div className="absolute top-6 right-6 z-20 flex flex-col gap-1.5 bg-[#242424]/90 p-1 rounded-md border border-[#C9B99F]/30 backdrop-blur-xs">
            <button
              onClick={() => setZoomLevel((z) => Math.min(1.4, z + 0.1))}
              className="p-1.5 text-white hover:text-amber-300 transition"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.8, z - 0.1))}
              className="p-1.5 text-white hover:text-amber-300 transition"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="p-1.5 text-white hover:text-amber-300 transition"
              title="Reset Zoom"
              aria-label="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Map Status Bar */}
          <div className="absolute bottom-6 left-6 z-20 px-3 py-1.5 bg-[#242424]/90 text-white rounded text-[11px] font-mono border border-[#C9B99F]/30 flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              GIS Telemetry Live
            </span>
            <span>•</span>
            <span className="tabular-nums">{filteredGrievances.length} Active Incidents</span>
            <span>•</span>
            <span>Scale 1:25,000</span>
          </div>

          {/* SVG Vector Map Viewport */}
          <div className="w-full h-[520px] bg-[#1a1f26] rounded-md overflow-hidden relative cursor-crosshair">
            <svg
              viewBox="0 0 900 550"
              className="w-full h-full transition-transform duration-200 ease-out"
              style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
            >
              <defs>
                {/* Municipal Grid Pattern */}
                <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#2a3542" strokeWidth="0.75" />
                </pattern>

                {/* Heatmap blur filter */}
                <filter id="heatBlur">
                  <feGaussianBlur stdDeviation="24" />
                </filter>
              </defs>

              {/* Background Map Grid */}
              <rect width="900" height="550" fill="#13181f" />
              <rect width="900" height="550" fill="url(#grid)" />

              {/* River / Water Channel Corridor */}
              <path
                d="M 520 0 Q 560 180 610 270 T 730 450 T 890 550 L 900 550 L 900 0 Z"
                fill="#1b2a3d"
                stroke="#2a4563"
                strokeWidth="1.5"
                opacity="0.85"
              />

              {/* Ward Jurisdiction Polygons (If enabled) */}
              {showBoundaries && (
                <g className="transition-opacity duration-300">
                  {/* Ward 7 North */}
                  <polygon
                    points="180,30 490,20 530,200 240,210"
                    fill="#48234F"
                    fillOpacity="0.08"
                    stroke="#C9B99F"
                    strokeWidth="1"
                    strokeDasharray="4 3"
                  />
                  <text x="320" y="70" fill="#C9B99F" opacity="0.6" fontSize="11" fontWeight="bold">
                    WARD 7 • NORTH DISTRICT
                  </text>

                  {/* Ward 4 Metro Center */}
                  <polygon
                    points="240,210 530,200 620,380 320,390"
                    fill="#0284c7"
                    fillOpacity="0.08"
                    stroke="#C9B99F"
                    strokeWidth="1"
                    strokeDasharray="4 3"
                  />
                  <text
                    x="380"
                    y="270"
                    fill="#C9B99F"
                    opacity="0.6"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    WARD 4 • METRO CORE
                  </text>

                  {/* Ward 12 Riverside */}
                  <polygon
                    points="530,200 880,180 880,480 620,380"
                    fill="#10b981"
                    fillOpacity="0.08"
                    stroke="#C9B99F"
                    strokeWidth="1"
                    strokeDasharray="4 3"
                  />
                  <text
                    x="690"
                    y="280"
                    fill="#C9B99F"
                    opacity="0.6"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    WARD 12 • RIVERSIDE & HARBOR
                  </text>

                  {/* Ward 2 East Industrial */}
                  <polygon
                    points="30,240 240,210 320,390 80,510"
                    fill="#f59e0b"
                    fillOpacity="0.08"
                    stroke="#C9B99F"
                    strokeWidth="1"
                    strokeDasharray="4 3"
                  />
                  <text
                    x="110"
                    y="360"
                    fill="#C9B99F"
                    opacity="0.6"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    WARD 2 • EAST INDUSTRIAL
                  </text>

                  {/* Ward 9 Hillcrest */}
                  <polygon
                    points="490,20 880,20 880,180 530,200"
                    fill="#8b5cf6"
                    fillOpacity="0.08"
                    stroke="#C9B99F"
                    strokeWidth="1"
                    strokeDasharray="4 3"
                  />
                  <text x="640" y="80" fill="#C9B99F" opacity="0.6" fontSize="11" fontWeight="bold">
                    WARD 9 • HILLCREST
                  </text>
                </g>
              )}

              {/* Major Arterial Municipal Roadways */}
              <path
                d="M 50 260 L 850 260 M 360 20 L 360 520 M 600 20 L 600 520 M 120 100 L 800 450"
                stroke="#374558"
                strokeWidth="2.5"
                fill="none"
              />
              <path
                d="M 200 480 Q 450 320 800 220"
                stroke="#475569"
                strokeWidth="3.5"
                strokeDasharray="6 4"
                fill="none"
              />

              {/* Heatmap Layer (If enabled) */}
              {showHeatmap && (
                <g filter="url(#heatBlur)" opacity="0.75">
                  {filteredGrievances.map((g, idx) => {
                    const pos = getTicketCoordinates(g, idx);
                    const isUrgent = g.priority === 'Emergency' || g.priority === 'Urgent';
                    return (
                      <circle
                        key={`heat-${g.id}`}
                        cx={pos.x}
                        cy={pos.y}
                        r={isUrgent ? 55 : 35}
                        fill={isUrgent ? '#ef4444' : '#f59e0b'}
                      />
                    );
                  })}
                </g>
              )}

              {/* Incident Markers */}
              {filteredGrievances.map((g, idx) => {
                const pos = getTicketCoordinates(g, idx);
                const isSelected = activeMarkerId === g.id;
                const isEmergency = g.priority === 'Emergency';
                const isUrgent = g.priority === 'Urgent';

                const markerColor =
                  g.status === 'Resolved'
                    ? '#10b981'
                    : isEmergency
                      ? '#ef4444'
                      : isUrgent
                        ? '#f97316'
                        : '#0ea5e9';

                return (
                  <g
                    key={g.id}
                    className="cursor-pointer group"
                    onClick={() => setActiveMarkerId(g.id)}
                  >
                    {/* Pulsing ring for urgent/emergency */}
                    {(isEmergency || isUrgent) && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r="18"
                        fill="none"
                        stroke={markerColor}
                        strokeWidth="1.5"
                        opacity="0.6"
                      >
                        <animate
                          attributeName="r"
                          values="12;24;12"
                          dur={isEmergency ? '1.5s' : '2.5s'}
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.8;0.1;0.8"
                          dur={isEmergency ? '1.5s' : '2.5s'}
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}

                    {/* Outer marker pin circle */}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={isSelected ? '12' : '9'}
                      fill={markerColor}
                      stroke="#ffffff"
                      strokeWidth={isSelected ? '2.5' : '1.5'}
                      className="transition-all duration-200"
                    />

                    {/* Inner core pip */}
                    <circle cx={pos.x} cy={pos.y} r="3" fill="#ffffff" />

                    {/* Label chip */}
                    <g
                      transform={`translate(${pos.x - 32}, ${pos.y - 24})`}
                      className={`transition-opacity duration-150 ${
                        isSelected ? 'opacity-100' : 'opacity-85 group-hover:opacity-100'
                      }`}
                    >
                      <rect
                        width="64"
                        height="15"
                        rx="3"
                        fill="#242424"
                        stroke={markerColor}
                        strokeWidth="1"
                      />
                      <text
                        x="32"
                        y="11"
                        textAnchor="middle"
                        fill="#ffffff"
                        fontSize="8.5"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        {g.id}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Selected Incident Inspector Drawer (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {selectedTicket ? (
            <div className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-5 shadow-xs space-y-4">
              <div className="flex items-start justify-between border-b border-[#C9B99F]/30 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#777064] dark:text-[#94a3b8]">
                    Selected Pinpoint Dossier
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-base font-black font-mono text-[#48234F] dark:text-sky-400 tabular-nums">
                      {selectedTicket.id}
                    </span>
                    <StatusBadge status={selectedTicket.status} size="sm" />
                  </div>
                </div>

                <SlaCountdown
                  createdAt={selectedTicket.createdAt}
                  slaDeadlineHours={selectedTicket.slaDeadlineHours}
                  isResolved={selectedTicket.status === 'Resolved'}
                />
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#242424] dark:text-[#f1f5f9] leading-snug">
                  {selectedTicket.title}
                </h3>
                <p className="text-xs text-[#777064] dark:text-[#94a3b8] mt-1 line-clamp-3 leading-relaxed">
                  {selectedTicket.description}
                </p>
              </div>

              {/* Photo preview if available */}
              {selectedTicket.evidence.length > 0 && (
                <div className="rounded border border-[#C9B99F]/40 overflow-hidden">
                  <img
                    src={selectedTicket.evidence[0].url}
                    alt={selectedTicket.evidence[0].caption}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <p className="text-[10px] text-[#777064] dark:text-[#94a3b8] p-1.5 truncate bg-white/80 dark:bg-slate-900/80">
                    {selectedTicket.evidence[0].caption}
                  </p>
                </div>
              )}

              {/* Key Location & Assigned Officer details */}
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded bg-white dark:bg-[#1a2230] border border-[#C9B99F]/30 flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#242424] dark:text-[#f1f5f9] block">
                      {selectedTicket.locationAddress}
                    </span>
                    <span className="text-[10px] text-[#777064] dark:text-[#94a3b8]">
                      {selectedTicket.precinct}
                    </span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-white dark:bg-[#1a2230] border border-[#C9B99F]/30 flex items-center justify-between">
                  <span className="text-[#777064] dark:text-[#94a3b8]">Service Area:</span>
                  <span className="font-semibold text-[#242424] dark:text-[#f1f5f9]">
                    {selectedTicket.department}
                  </span>
                </div>

                <div className="p-2.5 rounded bg-white dark:bg-[#1a2230] border border-[#C9B99F]/30 flex items-center justify-between">
                  <span className="text-[#777064] dark:text-[#94a3b8]">Severity Priority:</span>
                  <span className="font-bold uppercase text-rose-700 dark:text-rose-400">
                    {selectedTicket.priority} Priority
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => navigateTo('detail', selectedTicket.id)}
                className="w-full py-2.5 text-xs font-bold rounded bg-[#48234F] hover:bg-[#371B3D] text-white transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>Inspect Full Case Dossier & Logs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-8 text-center text-xs text-[#777064] dark:text-[#94a3b8]">
              <MapPin className="w-8 h-8 text-[#C9B99F] mx-auto mb-2 opacity-60" />
              <p className="font-semibold text-[#242424] dark:text-[#f1f5f9]">
                No Incident Selected on Map
              </p>
              <p className="text-[11px] mt-1">
                Click on any map marker node to inspect its real-time dossier.
              </p>
            </div>
          )}

          {/* Quick GIS Map Legend */}
          <div className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-4 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#777064] dark:text-[#94a3b8] block mb-2">
              Spatial Marker Legend:
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 border border-white" />
                <span>Emergency (12h)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500 border border-white" />
                <span>Urgent (24h)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-sky-500 border border-white" />
                <span>Standard (48h)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 border border-white" />
                <span>Resolved</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
