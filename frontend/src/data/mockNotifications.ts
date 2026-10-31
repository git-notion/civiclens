import { CivicNotification } from '../types';

export const INITIAL_NOTIFICATIONS: CivicNotification[] = [
  {
    id: 'NOTIF-2026-001',
    ticketId: '#CIV-2026-8812',
    type: 'sla_alert',
    priority: 'Urgent',
    title: 'SLA Breach Risk Alert: #CIV-2026-8812',
    description:
      'Severe asphalt subsidence in Ward 4 has breached standard window. Accelerated field intervention required.',
    timestamp: '10m ago',
    isRead: false,
  },
  {
    id: 'NOTIF-2026-002',
    ticketId: '#CIV-2026-8813',
    type: 'dispatch',
    priority: 'Emergency',
    title: 'Emergency Crew Deployed: #CIV-2026-8813',
    description:
      'Hydro Valves & Isolation Crew B on-site at North Park Blvd. Excavation and pipe isolation active.',
    timestamp: '25m ago',
    isRead: false,
  },
  {
    id: 'NOTIF-2026-003',
    ticketId: '#CIV-2026-8816',
    type: 'resolution',
    priority: 'Standard',
    title: 'Docket Cleared & Certified: #CIV-2026-8816',
    description:
      'Heritage Elm tree limb safely cleared from overhead municipal cables. Public roadway restored.',
    timestamp: '1h ago',
    isRead: false,
  },
  {
    id: 'NOTIF-2026-004',
    ticketId: '#CIV-2026-8815',
    type: 'sla_alert',
    priority: 'Emergency',
    title: 'Critical Signal Surge: #CIV-2026-8815',
    description:
      'Traffic controller blackout at Roosevelt Causeway. Signals Emergency Response Unit 1 engaged.',
    timestamp: '2h ago',
    isRead: true,
  },
  {
    id: 'NOTIF-2026-005',
    ticketId: '#CIV-2026-8817',
    type: 'citizen_update',
    priority: 'Urgent',
    title: 'Citizen Evidence Appended: #CIV-2026-8817',
    description:
      'Complainant Maya Lin added geotagged photo proof of displaced storm drain catch basin in bike lane.',
    timestamp: '3h ago',
    isRead: true,
  },
];
