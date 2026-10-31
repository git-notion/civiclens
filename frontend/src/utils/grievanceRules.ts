import { Grievance, GrievancePriority, GrievanceStatus } from '../types';

export interface SlaCalculation {
  hoursRemaining: number;
  isBreached: boolean;
  percentElapsed: number;
  formatted: string;
}

/**
 * Calculates remaining SLA time and whether SLA is breached.
 */
export function calculateSlaRemaining(
  createdAtISO: string,
  slaDeadlineHours: number,
  currentTime: Date = new Date()
): SlaCalculation {
  const created = new Date(createdAtISO).getTime();
  const now = currentTime.getTime();
  const totalDurationMs = slaDeadlineHours * 60 * 60 * 1000;
  const elapsedMs = now - created;
  const remainingMs = totalDurationMs - elapsedMs;

  const hoursRemaining = Math.round((remainingMs / (1000 * 60 * 60)) * 10) / 10;
  const isBreached = remainingMs <= 0;
  const percentElapsed = Math.min(
    100,
    Math.max(0, Math.round((elapsedMs / totalDurationMs) * 100))
  );

  let formatted = '';
  if (isBreached) {
    const overdueHours = Math.abs(Math.floor(remainingMs / (1000 * 60 * 60)));
    formatted = `Breached by ${overdueHours}h`;
  } else {
    const hrs = Math.floor(remainingMs / (1000 * 60 * 60));
    const mins = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
    formatted = `${hrs}h ${mins}m left`;
  }

  return {
    hoursRemaining,
    isBreached,
    percentElapsed,
    formatted,
  };
}

/**
 * Formats integer into a standard CivicPulse ticket ID
 */
export function formatTicketId(sequence: number, year: number = 2026): string {
  const padded = String(sequence).padStart(4, '0');
  return `#CIV-${year}-${padded}`;
}

/**
 * Computes an operational urgency score combining priority weight, public impact, and SLA remaining.
 */
export function calculateUrgencyScore(
  priority: GrievancePriority,
  impactScore: number,
  hoursRemaining: number
): number {
  const priorityWeights: Record<GrievancePriority, number> = {
    Emergency: 45,
    Urgent: 30,
    Standard: 15,
    Low: 5,
  };

  const slaBonus =
    hoursRemaining <= 0 ? 30 : hoursRemaining < 12 ? 20 : hoursRemaining < 24 ? 10 : 0;
  const impactWeight = Math.min(25, Math.round(impactScore * 0.25));

  return priorityWeights[priority] + slaBonus + impactWeight;
}

/**
 * Pure filter for grievance collections
 */
export function filterGrievances(
  items: Grievance[],
  query: {
    search?: string;
    status?: GrievanceStatus | 'All';
    precinct?: string;
    department?: string;
    priority?: string;
  }
): Grievance[] {
  return items.filter((item) => {
    if (query.status && query.status !== 'All' && item.status !== query.status) {
      return false;
    }
    if (query.precinct && query.precinct !== 'All' && item.precinct !== query.precinct) {
      return false;
    }
    if (query.department && query.department !== 'All' && item.department !== query.department) {
      return false;
    }
    if (query.priority && query.priority !== 'All' && item.priority !== query.priority) {
      return false;
    }
    if (query.search && query.search.trim().length > 0) {
      const term = query.search.toLowerCase().trim();
      const matchId = item.id.toLowerCase().includes(term);
      const matchTitle = item.title.toLowerCase().includes(term);
      const matchDesc = item.description.toLowerCase().includes(term);
      const matchLoc = item.locationAddress.toLowerCase().includes(term);
      const matchCitizen = item.citizen.name.toLowerCase().includes(term);
      if (!matchId && !matchTitle && !matchDesc && !matchLoc && !matchCitizen) {
        return false;
      }
    }
    return true;
  });
}

export interface LookupResult {
  item: Grievance;
  matchType: 'docket' | 'citizen' | 'content';
  highlightText?: string;
}

/**
 * Fast lookup prioritizes docket number (#CIV-XXXX) and citizen complainant name
 */
export function quickLookupGrievances(
  items: Grievance[],
  query: string,
  limit: number = 6
): LookupResult[] {
  if (!query || !query.trim()) return [];
  const term = query.toLowerCase().trim();

  const docketMatches: LookupResult[] = [];
  const citizenMatches: LookupResult[] = [];
  const contentMatches: LookupResult[] = [];

  for (const item of items) {
    const idLower = item.id.toLowerCase();
    const citizenLower = item.citizen.name.toLowerCase();
    const citizenIdLower = item.citizen.citizenId?.toLowerCase() || '';

    if (idLower.includes(term)) {
      docketMatches.push({ item, matchType: 'docket', highlightText: item.id });
    } else if (citizenLower.includes(term) || citizenIdLower.includes(term)) {
      citizenMatches.push({ item, matchType: 'citizen', highlightText: item.citizen.name });
    } else if (
      item.title.toLowerCase().includes(term) ||
      item.locationAddress.toLowerCase().includes(term)
    ) {
      contentMatches.push({ item, matchType: 'content', highlightText: item.title });
    }
  }

  // Prioritize docket number, then citizen name, then general content
  return [...docketMatches, ...citizenMatches, ...contentMatches].slice(0, limit);
}

/**
 * Computes live operational dashboard metrics
 */
export function computeTelemetry(items: Grievance[]) {
  const total = items.length;
  let underReview = 0;
  let inProgress = 0;
  let escalated = 0;
  let resolved = 0;

  let totalResolutionHours = 0;
  let resolvedCount = 0;
  let slaCompliantCount = 0;

  const now = new Date();

  items.forEach((item) => {
    if (item.status === 'Under Review') underReview++;
    if (item.status === 'In Progress') inProgress++;
    if (item.status === 'Escalated') escalated++;
    if (item.status === 'Resolved') {
      resolved++;
      resolvedCount++;
      if (item.resolvedAt) {
        const createdMs = new Date(item.createdAt).getTime();
        const resMs = new Date(item.resolvedAt).getTime();
        const durationHours = (resMs - createdMs) / (1000 * 60 * 60);
        totalResolutionHours += Math.max(1, durationHours);
        if (durationHours <= item.slaDeadlineHours) {
          slaCompliantCount++;
        }
      } else {
        slaCompliantCount++;
      }
    } else {
      // Check active items SLA
      const { isBreached } = calculateSlaRemaining(item.createdAt, item.slaDeadlineHours, now);
      if (!isBreached) {
        slaCompliantCount++;
      }
    }
  });

  const slaComplianceRate = total > 0 ? Math.round((slaCompliantCount / total) * 100) : 100;
  const avgResolutionHours =
    resolvedCount > 0 ? Math.round(totalResolutionHours / resolvedCount) : 36;

  return {
    total,
    underReview,
    inProgress,
    escalated,
    resolved,
    slaComplianceRate,
    avgResolutionHours,
  };
}

export interface DailyReportData {
  reportId: string;
  generatedAt: string;
  totalGrievances: number;
  urgentCritical: number;
  underReview: number;
  inProgress: number;
  resolved: number;
  slaAdherenceRate: number;
  departmentBreakdown: { department: string; count: number; urgent: number }[];
  urgentActionItems: {
    id: string;
    title: string;
    precinct: string;
    priority: string;
    status: string;
  }[];
  executiveStatusSummary: string;
}

/**
 * Compiles a formal daily administrative operations briefing report
 */
export function generateDailyReport(items: Grievance[], date: Date = new Date()): DailyReportData {
  const telemetry = computeTelemetry(items);
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const reportId = `MDR-${dateStr}-EXEC`;

  const deptMap: Record<string, { count: number; urgent: number }> = {};
  items.forEach((item) => {
    if (!deptMap[item.department]) {
      deptMap[item.department] = { count: 0, urgent: 0 };
    }
    deptMap[item.department].count++;
    if (item.priority === 'Emergency' || item.priority === 'Urgent') {
      deptMap[item.department].urgent++;
    }
  });

  const departmentBreakdown = Object.entries(deptMap).map(([department, data]) => ({
    department,
    count: data.count,
    urgent: data.urgent,
  }));

  const urgentActionItems = items
    .filter((i) => i.priority === 'Emergency' || i.priority === 'Urgent')
    .slice(0, 5)
    .map((i) => ({
      id: i.id,
      title: i.title,
      precinct: i.precinct,
      priority: i.priority,
      status: i.status,
    }));

  const executiveStatusSummary =
    telemetry.slaComplianceRate >= 90
      ? `Municipal SLA readiness is optimal at ${telemetry.slaComplianceRate}%. All priority sectors are actively staffed with emergency response units deployed.`
      : `Warning: Municipal SLA compliance has dipped to ${telemetry.slaComplianceRate}%. Accelerated crew dispatch is mandated for high-urgency dockets.`;

  return {
    reportId,
    generatedAt: date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    totalGrievances: telemetry.total,
    urgentCritical: telemetry.escalated,
    underReview: telemetry.underReview,
    inProgress: telemetry.inProgress,
    resolved: telemetry.resolved,
    slaAdherenceRate: telemetry.slaComplianceRate,
    departmentBreakdown,
    urgentActionItems,
    executiveStatusSummary,
  };
}
