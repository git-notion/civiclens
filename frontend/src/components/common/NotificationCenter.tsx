import React, { useState, useEffect } from 'react';
import { useGrievance } from '../../context/GrievanceContext';
import { CivicNotification, NotificationType } from '../../types';
import {
  Bell,
  X,
  AlertTriangle,
  CheckCircle2,
  Truck,
  FileText,
  Clock,
  ArrowRight,
  CheckCheck,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const {
    isNotificationOpen,
    setIsNotificationOpen,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    navigateTo,
  } = useGrievance();

  const [activeTab, setActiveTab] = useState<'all' | 'sla_alert' | 'resolution' | 'dispatch'>(
    'all'
  );

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isNotificationOpen) {
        setIsNotificationOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNotificationOpen, setIsNotificationOpen]);

  // Prevent background scrolling when drawer is open
  useEffect(() => {
    if (isNotificationOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isNotificationOpen]);

  if (!isNotificationOpen) return null;

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'all') return true;
    return n.type === activeTab;
  });

  const handleNotificationClick = (notification: CivicNotification) => {
    markNotificationAsRead(notification.id);
    setIsNotificationOpen(false);
    navigateTo('detail', notification.ticketId);
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'sla_alert':
        return <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />;
      case 'resolution':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'dispatch':
        return <Truck className="w-4 h-4 text-sky-600 dark:text-sky-400" />;
      case 'citizen_update':
      default:
        return <FileText className="w-4 h-4 text-[#48234F] dark:text-sky-300" />;
    }
  };

  const getNotificationBadgeColor = (type: NotificationType) => {
    switch (type) {
      case 'sla_alert':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      case 'resolution':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'dispatch':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border-sky-300 dark:border-sky-800';
      case 'citizen_update':
      default:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-300 dark:border-purple-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Dimmed Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => setIsNotificationOpen(false)}
        aria-hidden="true"
      />

      {/* Slide-out Drawer from Right */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside
          className="w-screen max-w-md bg-[#FAF7F0] dark:bg-[#141f2e] text-[#242424] dark:text-[#f1f5f9] border-l border-[#C9B99F] dark:border-[#223a54] shadow-2xl flex flex-col transform transition ease-in-out duration-300"
          role="dialog"
          aria-modal="true"
          aria-label="Municipal Dispatch Alerts & Notification Center"
        >
          {/* Drawer Header */}
          <div className="px-5 py-4 bg-[#242424] text-[#FAF7F0] border-b border-[#C9B99F]/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded bg-[#48234F] text-amber-200 flex items-center justify-center font-bold text-sm border border-[#C9B99F]/30 shadow-xs">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight text-[#FAF7F0]">
                    Notification Center
                  </h3>
                  {unreadNotificationCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white animate-pulse">
                      {unreadNotificationCount} New
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#C9B99F]/70">
                  Real-time ticket resolutions & SLA alerts
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {unreadNotificationCount > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="px-2.5 py-1 text-[11px] font-semibold text-[#C9B99F] hover:text-white hover:bg-white/10 rounded transition flex items-center gap-1"
                  title="Mark all notifications as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsNotificationOpen(false)}
                className="p-1.5 rounded-md text-[#C9B99F] hover:text-white hover:bg-white/10 transition"
                aria-label="Close notification center"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 px-4 py-2 bg-black/5 dark:bg-black/30 border-b border-[#C9B99F]/20 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-2.5 py-1 rounded font-semibold transition shrink-0 ${
                activeTab === 'all'
                  ? 'bg-[#48234F] text-white dark:bg-[#0284c7] shadow-xs'
                  : 'text-[#777064] dark:text-[#94a3b8] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab('sla_alert')}
              className={`px-2.5 py-1 rounded font-semibold transition shrink-0 flex items-center gap-1 ${
                activeTab === 'sla_alert'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'text-[#777064] dark:text-[#94a3b8] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              <span>SLA Alerts</span>
            </button>
            <button
              onClick={() => setActiveTab('resolution')}
              className={`px-2.5 py-1 rounded font-semibold transition shrink-0 flex items-center gap-1 ${
                activeTab === 'resolution'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-[#777064] dark:text-[#94a3b8] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>Resolutions</span>
            </button>
            <button
              onClick={() => setActiveTab('dispatch')}
              className={`px-2.5 py-1 rounded font-semibold transition shrink-0 flex items-center gap-1 ${
                activeTab === 'dispatch'
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'text-[#777064] dark:text-[#94a3b8] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Truck className="w-3 h-3" />
              <span>Dispatches</span>
            </button>
          </div>

          {/* Notifications List Container */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#C9B99F]/20">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 hover:bg-[#F2EEE6] dark:hover:bg-[#1d283a] cursor-pointer transition relative group ${
                    !notif.isRead
                      ? 'bg-white/80 dark:bg-[#172333]'
                      : 'bg-[#FAF7F0] dark:bg-[#141f2e]'
                  }`}
                >
                  {/* Unread indicator dot */}
                  {!notif.isRead && (
                    <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-rose-500 ring-4 ring-rose-500/20" />
                  )}

                  <div className="flex items-start gap-3">
                    {/* Category Icon */}
                    <div
                      className={`p-2 rounded-md border shrink-0 mt-0.5 ${getNotificationBadgeColor(
                        notif.type
                      )}`}
                    >
                      {getNotificationIcon(notif.type)}
                    </div>

                    {/* Content */}
                    <div className="space-y-1 flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#48234F] dark:text-sky-400 tabular-nums">
                          {notif.ticketId}
                        </span>
                        <span className="text-[10px] text-[#777064] dark:text-[#94a3b8] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {notif.timestamp}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-[#242424] dark:text-[#f1f5f9] leading-tight group-hover:text-[#48234F] dark:group-hover:text-sky-400 transition">
                        {notif.title}
                      </h4>

                      <p className="text-[11px] text-[#777064] dark:text-[#94a3b8] leading-relaxed line-clamp-2">
                        {notif.description}
                      </p>

                      <div className="pt-1 flex items-center gap-1 text-[11px] font-semibold text-[#48234F] dark:text-sky-400 group-hover:translate-x-1 transition-transform">
                        <span>Inspect Docket Dossier</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-xs text-[#777064] dark:text-[#94a3b8]">
                <Shield className="w-8 h-8 text-[#C9B99F] mx-auto mb-2 opacity-50" />
                <p className="font-semibold text-[#242424] dark:text-[#f1f5f9]">
                  No notifications in this category
                </p>
                <p className="text-[11px] mt-1">
                  All municipal alerts and service logs are up to date.
                </p>
              </div>
            )}
          </div>

          {/* Drawer Footer */}
          <div className="p-3 bg-black/5 dark:bg-black/30 border-t border-[#C9B99F]/20 flex items-center justify-between text-xs text-[#777064] dark:text-[#94a3b8]">
            <span className="text-[10px]">Municipal Redressal Gateway • v4.2</span>
            <button
              onClick={() => {
                setIsNotificationOpen(false);
                navigateTo('dashboard');
              }}
              className="font-semibold text-[#48234F] dark:text-sky-400 hover:underline text-[11px]"
            >
              View Full Operations Ledger →
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};
