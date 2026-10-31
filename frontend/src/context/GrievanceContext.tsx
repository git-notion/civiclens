import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Grievance,
  GrievanceStatus,
  AppView,
  ThemeMode,
  Milestone,
  CivicNotification,
} from '../types';
import { INITIAL_GRIEVANCES } from '../data/mockGrievances';
import { INITIAL_NOTIFICATIONS } from '../data/mockNotifications';
import { formatTicketId } from '../utils/grievanceRules';

interface GrievanceContextValue {
  grievances: Grievance[];
  selectedGrievance: Grievance | null;
  selectedGrievanceId: string | null;
  currentView: AppView;
  selectedPrecinct: string;
  selectedStatus: GrievanceStatus | 'All';
  selectedDepartment: string;
  selectedPriority: string;
  searchQuery: string;
  theme: ThemeMode;
  isNotificationOpen: boolean;
  notifications: CivicNotification[];
  unreadNotificationCount: number;

  // Setters
  setCurrentView: (view: AppView) => void;
  setSelectedGrievanceId: (id: string | null) => void;
  setSelectedPrecinct: (precinct: string) => void;
  setSelectedStatus: (status: GrievanceStatus | 'All') => void;
  setSelectedDepartment: (dept: string) => void;
  setSelectedPriority: (priority: string) => void;
  setSearchQuery: (query: string) => void;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  setIsNotificationOpen: (open: boolean) => void;
  toggleNotificationCenter: () => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Domain Actions
  navigateTo: (view: AppView, ticketId?: string) => void;
  addGrievance: (
    data: Omit<Grievance, 'id' | 'createdAt' | 'timeline' | 'impactScore' | 'upvotes'>
  ) => string;
  updateGrievanceStatus: (id: string, status: GrievanceStatus, noteText?: string) => void;
  addOfficerNote: (id: string, notes: string, officerName?: string, officerRole?: string) => void;
  dispatchCrew: (id: string, crewName: string, notes: string) => void;
  upvoteGrievance: (id: string) => void;
  resolveGrievance: (id: string, resolutionNote: string, proofUrl?: string) => void;
}

const GrievanceContext = createContext<GrievanceContextValue | undefined>(undefined);

export const GrievanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [grievances, setGrievances] = useState<Grievance[]>(() => {
    const saved = localStorage.getItem('civicpulse_grievances');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_GRIEVANCES;
      }
    }
    return INITIAL_GRIEVANCES;
  });

  const [selectedGrievanceId, setSelectedGrievanceId] = useState<string | null>('#CIV-2026-8812');
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [selectedPrecinct, setSelectedPrecinct] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<GrievanceStatus | 'All'>('All');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('civicpulse_theme') as ThemeMode;
    return saved === 'dark-cerulean' ? 'dark-cerulean' : 'civic-heritage';
  });

  // Sync theme attribute and dark class on document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark-cerulean') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('civicpulse_theme', theme);
  }, [theme]);

  // Persist grievances to localStorage
  useEffect(() => {
    localStorage.setItem('civicpulse_grievances', JSON.stringify(grievances));
  }, [grievances]);

  // Notifications state
  const [notifications, setNotifications] = useState<CivicNotification[]>(() => {
    const saved = localStorage.getItem('civicpulse_notifications');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_NOTIFICATIONS;
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('civicpulse_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const unreadNotificationCount = notifications.filter((n) => !n.isRead).length;

  const toggleNotificationCenter = () => {
    setIsNotificationOpen((prev) => !prev);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'civic-heritage' ? 'dark-cerulean' : 'civic-heritage'));
  };

  const selectedGrievance =
    grievances.find((g) => g.id === selectedGrievanceId) || grievances[0] || null;

  const navigateTo = (view: AppView, ticketId?: string) => {
    setCurrentView(view);
    if (ticketId) {
      setSelectedGrievanceId(ticketId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addGrievance = (
    data: Omit<Grievance, 'id' | 'createdAt' | 'timeline' | 'impactScore' | 'upvotes'>
  ): string => {
    const nextSeq = 8818 + Math.floor(Math.random() * 900);
    const newId = formatTicketId(nextSeq, 2026);
    const nowIso = new Date().toISOString();
    const formattedNow = new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC';

    const initialMilestone: Milestone = {
      id: `milestone-${Date.now()}`,
      title: 'Grievance Docket Created & Verified',
      timestamp: formattedNow,
      officerName: 'Citizen Digital Portal',
      officerRole: 'Automated Intake Intake System',
      notes:
        'Initial formal grievance logged with GPS verification. Assigned standard SLA tracking window.',
      status: 'completed',
    };

    const newGrievance: Grievance = {
      ...data,
      id: newId,
      createdAt: nowIso,
      timeline: [initialMilestone],
      impactScore: data.priority === 'Emergency' ? 92 : data.priority === 'Urgent' ? 75 : 45,
      upvotes: 1,
    };

    setGrievances((prev) => [newGrievance, ...prev]);
    setSelectedGrievanceId(newId);
    return newId;
  };

  const updateGrievanceStatus = (id: string, status: GrievanceStatus, noteText?: string) => {
    const formattedNow = new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC';
    setGrievances((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;

        const newMilestone: Milestone = {
          id: `status-chg-${Date.now()}`,
          title: `Status Transition: ${status}`,
          timestamp: formattedNow,
          officerName: g.assignedOfficer ? `Insp. ${g.assignedOfficer.name}` : 'Command Center',
          officerRole: g.assignedOfficer ? g.assignedOfficer.role : 'Municipal Operations',
          notes: noteText || `Case status shifted to ${status} following review.`,
          status: status === 'Resolved' ? 'completed' : 'in_progress',
        };

        return {
          ...g,
          status,
          resolvedAt: status === 'Resolved' ? new Date().toISOString() : g.resolvedAt,
          timeline: [...g.timeline, newMilestone],
        };
      })
    );
  };

  const addOfficerNote = (
    id: string,
    notes: string,
    officerName: string = 'Field Inspector Vance',
    officerRole: string = 'District Operations'
  ) => {
    const formattedNow = new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC';
    setGrievances((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const newMilestone: Milestone = {
          id: `note-${Date.now()}`,
          title: 'Field Audit & Inspection Note',
          timestamp: formattedNow,
          officerName,
          officerRole,
          notes,
          status: 'completed',
        };
        return {
          ...g,
          timeline: [...g.timeline, newMilestone],
        };
      })
    );
  };

  const dispatchCrew = (id: string, crewName: string, notes: string) => {
    const formattedNow = new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC';
    setGrievances((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const dispatchMilestone: Milestone = {
          id: `dispatch-${Date.now()}`,
          title: `Work Order Dispatched: ${crewName}`,
          timestamp: formattedNow,
          officerName: 'Central Dispatch Command',
          officerRole: 'Municipal Logistics',
          notes: notes || `Field repair unit ${crewName} deployed with equipment.`,
          status: 'in_progress',
        };
        return {
          ...g,
          status: 'In Progress',
          assignedCrew: crewName,
          timeline: [...g.timeline, dispatchMilestone],
        };
      })
    );
  };

  const upvoteGrievance = (id: string) => {
    setGrievances((prev) => prev.map((g) => (g.id === id ? { ...g, upvotes: g.upvotes + 1 } : g)));
  };

  const resolveGrievance = (id: string, resolutionNote: string, proofUrl?: string) => {
    const formattedNow = new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC';
    setGrievances((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const resolutionMilestone: Milestone = {
          id: `resolve-${Date.now()}`,
          title: 'Grievance Resolved & Signed Off',
          timestamp: formattedNow,
          officerName: g.assignedOfficer ? `Insp. ${g.assignedOfficer.name}` : 'Quality Auditor',
          officerRole: 'Quality & Field Clearance',
          notes: resolutionNote || 'Work order completed and verified against municipal standards.',
          status: 'completed',
        };

        const updatedEvidence = proofUrl
          ? [
              ...g.evidence,
              {
                id: `proof-${Date.now()}`,
                url: proofUrl,
                caption: 'Post-resolution verification proof photograph',
                uploadedAt: new Date().toISOString(),
                type: 'image' as const,
              },
            ]
          : g.evidence;

        return {
          ...g,
          status: 'Resolved',
          resolvedAt: new Date().toISOString(),
          evidence: updatedEvidence,
          timeline: [...g.timeline, resolutionMilestone],
        };
      })
    );
  };

  return (
    <GrievanceContext.Provider
      value={{
        grievances,
        selectedGrievance,
        selectedGrievanceId,
        currentView,
        selectedPrecinct,
        selectedStatus,
        selectedDepartment,
        selectedPriority,
        searchQuery,
        theme,
        isNotificationOpen,
        notifications,
        unreadNotificationCount,
        setCurrentView,
        setSelectedGrievanceId,
        setSelectedPrecinct,
        setSelectedStatus,
        setSelectedDepartment,
        setSelectedPriority,
        setSearchQuery,
        setTheme,
        toggleTheme,
        setIsNotificationOpen,
        toggleNotificationCenter,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        navigateTo,
        addGrievance,
        updateGrievanceStatus,
        addOfficerNote,
        dispatchCrew,
        upvoteGrievance,
        resolveGrievance,
      }}
    >
      {children}
    </GrievanceContext.Provider>
  );
};

export const useGrievance = (): GrievanceContextValue => {
  const context = useContext(GrievanceContext);
  if (!context) {
    throw new Error('useGrievance must be used within a GrievanceProvider');
  }
  return context;
};
