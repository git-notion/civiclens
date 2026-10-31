import React, { useState } from 'react';
import { GrievanceProvider, useGrievance } from './context/GrievanceContext';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { GisMapView } from './components/map/GisMapView';
import { IntakeView } from './components/intake/IntakeView';
import { TicketDetailView } from './components/inspection/TicketDetailView';
import { DispatchBoardView } from './components/dispatch/DispatchBoardView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { CitizenTrackingView } from './components/tracking/CitizenTrackingView';
import { QuickActionsMenu } from './components/common/QuickActionsMenu';
import { NotificationCenter } from './components/common/NotificationCenter';
import { ShieldCheck, Building2, PhoneCall, Globe, CheckCircle } from 'lucide-react';

function AppContent() {
  const { currentView, navigateTo } = useGrievance();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#242424] text-[#FAF7F0] flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Persistent Left Navigation Rail (Desktop) / Drawer (Mobile) */}
      <Sidebar mobileOpen={mobileMenuOpen} setMobileOpen={setMobileMenuOpen} />

      {/* Main Administrative Container (Offset by 280px on desktop) */}
      <div className="lg:pl-[280px] flex-1 flex flex-col min-w-0 relative">
        {/* Top Header Console */}
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        {/* The Document Viewport: CSS variable-based canvas nesting inside Dark Charcoal */}
        <main className="flex-1 bg-[var(--civic-canvas)] text-[var(--civic-text)] p-4 sm:p-6 lg:p-8 transition-colors duration-200">
          <div className="max-w-[1440px] mx-auto">
            {currentView === 'dashboard' && <DashboardView />}
            {currentView === 'map' && <GisMapView />}
            {currentView === 'intake' && <IntakeView />}
            {currentView === 'detail' && <TicketDetailView />}
            {currentView === 'dispatch' && <DispatchBoardView />}
            {currentView === 'analytics' && <AnalyticsView />}
            {currentView === 'tracking' && <CitizenTrackingView />}
          </div>
        </main>

        {/* Quick Actions Floating Menu in Bottom-Right Corner */}
        <QuickActionsMenu />

        {/* Slide-out Notification Center Drawer from Right */}
        <NotificationCenter />

        {/* Municipal Transparency Footer */}
        <footer className="bg-[#242424] text-[#FAF7F0] border-t border-[#C9B99F]/20 px-6 py-6 text-xs">
          <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-[#48234F] text-amber-200 flex items-center justify-center font-bold text-xs border border-[#C9B99F]/30">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-semibold text-[#FAF7F0]">
                  Metropolitan District Civic Grievance & Redressal Authority
                </p>
                <p className="text-[11px] text-[#C9B99F]/70">
                  Operating in compliance with Municipal Charter § 104-B • SLA Gateway Online
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#C9B99F]/80">
              <button onClick={() => navigateTo('intake')} className="hover:text-white transition">
                File Citizen Complaint
              </button>
              <span>•</span>
              <button
                onClick={() => navigateTo('tracking')}
                className="hover:text-white transition"
              >
                Track Case Docket
              </button>
              <span>•</span>
              <button
                onClick={() => navigateTo('analytics')}
                className="hover:text-white transition"
              >
                SLA Compliance Bulletin
              </button>
              <span>•</span>
              <span className="tabular-nums">Precinct Hotline: 311 (24/7 Dispatch)</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <GrievanceProvider>
      <AppContent />
    </GrievanceProvider>
  );
}
