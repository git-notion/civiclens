export type GrievanceStatus = 'Under Review' | 'In Progress' | 'Escalated' | 'Resolved';

export type GrievancePriority = 'Low' | 'Standard' | 'Urgent' | 'Emergency';

export type DepartmentType =
  | 'Public Works & Roads'
  | 'Water Supply & Drainage'
  | 'Sanitation & Solid Waste'
  | 'Electrical & Street Lighting'
  | 'Parks & Urban Forestry'
  | 'Traffic & Public Safety'
  | 'Building & Code Compliance';

export interface Milestone {
  id: string;
  title: string;
  timestamp: string;
  officerName?: string;
  officerRole?: string;
  notes: string;
  status: 'completed' | 'in_progress' | 'pending';
}

export interface GrievanceEvidence {
  id: string;
  url: string;
  caption: string;
  uploadedAt: string;
  type: 'image' | 'document';
}

export interface CitizenInfo {
  name: string;
  phone: string;
  email: string;
  citizenId?: string;
  isAnonymous?: boolean;
}

export interface Grievance {
  id: string; // e.g. #CIV-2026-8812
  title: string;
  description: string;
  category: string;
  department: DepartmentType;
  precinct: string; // e.g. Ward 4 - Metro Center
  locationAddress: string;
  gpsCoordinates?: { lat: number; lng: number };
  status: GrievanceStatus;
  priority: GrievancePriority;
  citizen: CitizenInfo;
  createdAt: string; // ISO date
  slaDeadlineHours: number; // e.g. 48 or 72
  resolvedAt?: string;
  assignedOfficer?: {
    id: string;
    name: string;
    badge: string;
    role: string;
    department: DepartmentType;
  };
  assignedCrew?: string;
  evidence: GrievanceEvidence[];
  timeline: Milestone[];
  impactScore: number; // 1 to 100
  upvotes: number;
}

export interface PrecinctMetric {
  id: string;
  name: string;
  wardNumber: number;
  totalActive: number;
  slaCompliancePercent: number;
  criticalEscalations: number;
  leadOfficer: string;
}

export type ThemeMode = 'civic-heritage' | 'dark-cerulean';
export type AppView =
  'dashboard' | 'map' | 'intake' | 'detail' | 'dispatch' | 'analytics' | 'tracking';

export type NotificationType = 'sla_alert' | 'resolution' | 'dispatch' | 'citizen_update';

export interface CivicNotification {
  id: string;
  ticketId: string;
  type: NotificationType;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  priority: GrievancePriority;
}
