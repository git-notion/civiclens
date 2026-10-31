import React from 'react';
import { useGrievance } from '../../context/GrievanceContext';
import { PRECINCTS } from '../../data/mockGrievances';
import { computeTelemetry } from '../../utils/grievanceRules';
import {
  BarChart3,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Building2,
  Calendar,
  ExternalLink,
  Award,
} from 'lucide-react';

export const AnalyticsView: React.FC = () => {
  const { grievances, navigateTo } = useGrievance();
  const telemetry = computeTelemetry(grievances);

  const resolvedCases = grievances.filter((g) => g.status === 'Resolved');

  // Compute category volume
  const categoryCounts: Record<string, number> = {};
  grievances.forEach((g) => {
    categoryCounts[g.department] = (categoryCounts[g.department] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-5 sm:p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-[#48234F] dark:text-sky-400" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#777064] dark:text-[#94a3b8]">
              Public Service Transparency Audit
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#242424] dark:text-[#f1f5f9]">
            Municipal SLA Metrics & Public Bulletin
          </h2>
          <p className="text-xs text-[#777064] dark:text-[#94a3b8] max-w-2xl mt-0.5">
            Published under the Municipal Freedom of Information & Civic Accountability Act. All
            records are cryptographically verified and updated continuously.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-[#777064] dark:text-[#94a3b8] block">
              Audited Compliance
            </span>
            <span className="text-xl font-black text-emerald-800 dark:text-emerald-400 tabular-nums">
              {telemetry.slaComplianceRate}%
            </span>
          </div>
          <div className="w-10 h-10 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 flex items-center justify-center font-bold border border-emerald-300">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Ward Performance Benchmark Table */}
      <div className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 border-b border-[#C9B99F]/30 pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#242424] dark:text-[#f1f5f9]">
              Precinct Ward Resolution Scorecard
            </h3>
            <p className="text-xs text-[#777064] dark:text-[#94a3b8]">
              Comparison across 5 metropolitan divisions
            </p>
          </div>
          <span className="text-xs font-mono text-[#777064] dark:text-[#94a3b8] tabular-nums">
            Quarterly Audit Q4 2026
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#C9B99F]/40 text-[#777064] dark:text-[#94a3b8] uppercase font-semibold">
                <th className="py-2.5 px-3">Ward Jurisdiction</th>
                <th className="py-2.5 px-3">Lead Superintendent</th>
                <th className="py-2.5 px-3 text-center">Active Intake</th>
                <th className="py-2.5 px-3 text-center">Critical Esc.</th>
                <th className="py-2.5 px-3 text-right">SLA Adherence</th>
                <th className="py-2.5 px-3 text-right">Grade</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#C9B99F]/20">
              {PRECINCTS.map((p) => {
                const grade =
                  p.slaCompliancePercent >= 95 ? 'A+' : p.slaCompliancePercent >= 90 ? 'A' : 'B+';
                return (
                  <tr
                    key={p.id}
                    className="hover:bg-[#F2EEE6] dark:hover:bg-slate-800/50 transition cursor-pointer"
                    onClick={() => navigateTo('dashboard')}
                  >
                    <td className="py-3 px-3 font-bold text-[#242424] dark:text-[#f1f5f9]">
                      {p.name}
                    </td>
                    <td className="py-3 px-3 text-[#777064] dark:text-[#94a3b8]">
                      {p.leadOfficer}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-[#242424] dark:text-[#f1f5f9] tabular-nums">
                      {p.totalActive}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {p.criticalEscalations > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold tabular-nums">
                          {p.criticalEscalations} Urgent
                        </span>
                      ) : (
                        <span className="text-emerald-700 font-medium">0 Esc</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-emerald-800 dark:text-emerald-400 tabular-nums">
                      {p.slaCompliancePercent}%
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-[#48234F] text-white font-black text-[10px]">
                        {grade}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Grid: Category Volumes & Resolution Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Department Volume Share */}
        <div className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-5 shadow-xs">
          <h3 className="text-sm font-bold text-[#242424] dark:text-[#f1f5f9] mb-1">
            Department Grievance Share
          </h3>
          <p className="text-xs text-[#777064] dark:text-[#94a3b8] mb-4">
            Total complaints filed by municipal service department
          </p>

          <div className="space-y-3">
            {Object.entries(categoryCounts).map(([dept, count]) => {
              const percent = Math.round((count / grievances.length) * 100);
              return (
                <div key={dept} className="text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-[#242424] dark:text-[#f1f5f9]">{dept}</span>
                    <span className="text-[#777064] dark:text-[#94a3b8] tabular-nums">
                      {count} cases ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#EAE7E7] dark:bg-slate-700 h-2 rounded overflow-hidden">
                    <div
                      className="bg-[#48234F] dark:bg-sky-500 h-full transition-all"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Resolution Speed & Turnaround Stats */}
        <div className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-5 shadow-xs">
          <h3 className="text-sm font-bold text-[#242424] dark:text-[#f1f5f9] mb-1">
            Key SLA Performance Indicators
          </h3>
          <p className="text-xs text-[#777064] dark:text-[#94a3b8] mb-4">
            Audited against metropolitan charter benchmarks
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded bg-white dark:bg-[#1a2230] border border-[#C9B99F]/30">
              <span className="text-[11px] text-[#777064] dark:text-[#94a3b8] block">
                Median First Response
              </span>
              <strong className="text-lg text-[#242424] dark:text-[#f1f5f9] tabular-nums">
                1.4 Hours
              </strong>
              <p className="text-[10px] text-emerald-700 mt-1">✓ Well within 4h target</p>
            </div>

            <div className="p-3 rounded bg-white dark:bg-[#1a2230] border border-[#C9B99F]/30">
              <span className="text-[11px] text-[#777064] dark:text-[#94a3b8] block">
                Full Redressal Speed
              </span>
              <strong className="text-lg text-[#242424] dark:text-[#f1f5f9] tabular-nums">
                38 Hours
              </strong>
              <p className="text-[10px] text-emerald-700 mt-1">✓ Target: &lt; 48h</p>
            </div>

            <div className="p-3 rounded bg-white dark:bg-[#1a2230] border border-[#C9B99F]/30">
              <span className="text-[11px] text-[#777064] dark:text-[#94a3b8] block">
                Citizen Satisfaction
              </span>
              <strong className="text-lg text-[#242424] dark:text-[#f1f5f9] tabular-nums">
                91.8%
              </strong>
              <p className="text-[10px] text-emerald-700 mt-1">Based on 1,420 reviews</p>
            </div>

            <div className="p-3 rounded bg-white dark:bg-[#1a2230] border border-[#C9B99F]/30">
              <span className="text-[11px] text-[#777064] dark:text-[#94a3b8] block">
                Repeat Incident Rate
              </span>
              <strong className="text-lg text-[#242424] dark:text-[#f1f5f9] tabular-nums">
                2.1%
              </strong>
              <p className="text-[10px] text-emerald-700 mt-1">Historical low</p>
            </div>
          </div>
        </div>
      </div>

      {/* Public Transparency Bulletin (Resolved Grievances with Before & After Verification) */}
      <div className="bg-[#FAF7F0] dark:bg-[#141f2e] border border-[#C9B99F] dark:border-[#223a54] rounded-lg p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 border-b border-[#C9B99F]/30 pb-3">
          <div>
            <h3 className="text-sm font-bold text-[#242424] dark:text-[#f1f5f9]">
              Public Clearance Bulletin
            </h3>
            <p className="text-xs text-[#777064] dark:text-[#94a3b8]">
              Recent certified resolutions published for public verification
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            {resolvedCases.length} Verified Closed
          </span>
        </div>

        {resolvedCases.length === 0 ? (
          <p className="text-xs text-[#777064] italic text-center py-6">
            No resolved dockets in current session.
          </p>
        ) : (
          <div className="space-y-4">
            {resolvedCases.map((item) => (
              <div
                key={item.id}
                onClick={() => navigateTo('detail', item.id)}
                className="p-4 rounded-lg bg-white dark:bg-[#1a2230] border border-[#C9B99F]/40 dark:border-[#223a54] hover:border-[#48234F] cursor-pointer transition shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#48234F] dark:text-sky-400 tabular-nums">
                      {item.id}
                    </span>
                    <span className="font-semibold text-[#242424] dark:text-[#f1f5f9]">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-800 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Resolved {item.resolvedAt?.substring(0, 10)}
                  </span>
                </div>

                <p className="text-xs text-[#777064] dark:text-[#94a3b8] mb-3">
                  Location: <strong>{item.locationAddress}</strong> ({item.precinct})
                </p>

                {/* Evidence thumbnails */}
                {item.evidence.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {item.evidence.map((ev) => (
                      <div
                        key={ev.id}
                        className="rounded overflow-hidden border border-[#C9B99F]/40"
                      >
                        <img
                          src={ev.url}
                          alt={ev.caption}
                          className="w-full h-24 object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                        <p className="text-[10px] text-[#777064] dark:text-[#94a3b8] p-1.5 truncate bg-[#FAF7F0] dark:bg-slate-800">
                          {ev.caption}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
