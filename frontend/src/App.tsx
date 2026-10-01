import React, { Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';
import { SubdomainProvider, useSubdomain } from './context/SubdomainContext';
import { TopHeader } from './components/common/TopHeader';
import { BottomDock } from './components/common/BottomDock';
import { NotificationsDrawer } from './components/common/NotificationsDrawer';
import { LuminaryDrawer } from './components/common/LuminaryDrawer';
import { ErrorBoundary } from './components/common/ErrorBoundary';

import { LandingPage } from './components/landing/LandingPage';
import { LoginModal } from './components/auth/LoginModal';
import { SuperAdminLogin } from './components/auth/SuperAdminLogin';
import { TenantLogin } from './components/auth/TenantLogin';
import { SpectrumView } from './components/app/SpectrumView';
import { TeamView } from './components/app/TeamView';
import { KpiView } from './components/app/KpiView';
import { SanctumView } from './components/app/SanctumView';
import { TasksView } from './components/app/TasksView';
import { LeaderboardView } from './components/app/LeaderboardView';
import { Review360View } from './components/app/Review360View';
import { AttendanceView } from './components/app/AttendanceView';
import { MeridianView } from './components/app/MeridianView';
import { CheckpointView } from './components/app/CheckpointView';
import { SynthesisView } from './components/app/SynthesisView';
import { CalibrationView } from './components/app/CalibrationView';
import { AuditLogView } from './components/app/AuditLogView';
import { ExceptionsView } from './components/app/ExceptionsView';
import { CapacitySkillsView } from './components/app/CapacitySkillsView';
import { TenantAdminView } from './components/app/TenantAdminView';
import { PrismSuperAdminView } from './components/app/PrismSuperAdminView';
import { GenesisWizard } from './components/genesis/GenesisWizard';
import { EnterApp } from './components/auth/EnterApp';
import { EmployeeDetailView } from './components/app/EmployeeDetailView';

import { motion, AnimatePresence } from 'framer-motion';

import { AccessDeniedView } from './components/common/AccessDeniedView';
import { useAuth } from './context/AuthContext';

/**
 * Workspace Router — renders the appropriate view based on active tab.
 * This is the standard org workspace router used for tenant mode and
 * backward-compatible platform mode.
 */
const WorkspaceRouter: React.FC = () => {
  const { activeTab } = useApp();
  const { currentUser } = useAuth();

  const isOrgAdmin = currentUser && (
    currentUser.role === 'CEO' ||
    (currentUser as any).role === 'owner' ||
    currentUser.role === 'DEPT_HEAD'
  );

  const renderView = () => {
    switch (activeTab) {
      case 'landing':
        return <LandingPage />;
      case 'login':
        return <LoginModal />;
      case 'enter':
        return <EnterApp />;
      case 'genesis':
        return <GenesisWizard />;
      case 'spectrum':
        return <SpectrumView />;
      case 'team':
        return <TeamView />;
      case 'employee_detail':
        return <EmployeeDetailView />;
      case 'kpis':
        return <KpiView />;
      case 'sanctum':
        return <SanctumView />;
      case 'tasks':
        return <TasksView />;
      case 'the':
        return <LeaderboardView />;
      case '360':
        return <Review360View />;
      case 'attendance':
        return <AttendanceView />;
      case 'meridian':
        return <MeridianView />;
      case 'checkpoint':
        return <CheckpointView />;
      case 'synthesis':
        return <SynthesisView />;
      case 'calibration':
        return <CalibrationView />;
      case 'audit':
        return <AuditLogView />;
      case 'exceptions':
        return <ExceptionsView />;
      case 'capacity':
        return <CapacitySkillsView />;
      case 'tenant_admin':
        return isOrgAdmin ? (
          <TenantAdminView />
        ) : (
          <AccessDeniedView requiredRole="Organization Owner or Department Head" title="403 Forbidden • Admin Restricted" />
        );
      case 'super_admin':
        return <PrismSuperAdminView />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
        className="w-full h-full"
      >
        {renderView()}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Subdomain-Aware App Shell
 * 
 * Routes the application based on detected subdomain:
 *   - PLATFORM mode:    Show landing page → standard login → workspace
 *   - SUPER_ADMIN mode: Show isolated SuperAdmin login → fleet command center
 *   - TENANT mode:      Show org-branded login → org workspace
 */
const SubdomainAwareContent: React.FC = () => {
  const { appMode, isSuperAdmin, isTenantDomain } = useSubdomain();
  const { activeTab } = useApp();
  const { isAuthenticated, currentUser } = useAuth();
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';

  // ═══════════════════════════════════════════════════════════
  // MODE 1: SUPER_ADMIN — /admin/login route or admin.prism.com
  // ═══════════════════════════════════════════════════════════
  if (isSuperAdmin || pathname.startsWith('/admin')) {
    // Check if root operator is already authenticated via sessionStorage
    const rootToken = sessionStorage.getItem('prism_root_token');
    
    if (rootToken && activeTab === 'super_admin') {
      // Show the SuperAdmin fleet command center
      return (
        <div className="min-h-screen relative flex flex-col font-outfit prism-workspace prism-enter">
          <TopHeader />
          <main className="flex-1">
            <ErrorBoundary fallbackTitle="Fleet Command Exception">
              <PrismSuperAdminView />
            </ErrorBoundary>
          </main>
        </div>
      );
    }

    // Show isolated SuperAdmin login
    return <SuperAdminLogin />;
  }

  // ═══════════════════════════════════════════════════════════
  // MODE 2: TENANT — org.prism.com
  // ═══════════════════════════════════════════════════════════
  if (isTenantDomain) {
    // If user is authenticated and has accessed workspace
    if (isAuthenticated && currentUser && activeTab !== 'landing' && activeTab !== 'login') {
      const isLanding = activeTab === 'enter';
      return (
        <div className={`min-h-screen relative flex flex-col font-outfit ${isLanding ? '' : 'prism-workspace prism-enter'}`}>
          {!isLanding && <TopHeader />}
          <main className="flex-1">
            <ErrorBoundary fallbackTitle="Prism View Exception Intercepted">
              <Suspense fallback={
                <div className="min-h-[50vh] flex items-center justify-center text-white/40 font-mono text-xs uppercase tracking-widest">
                  Calibrating Core...
                </div>
              }>
                <WorkspaceRouter />
              </Suspense>
            </ErrorBoundary>
          </main>
          {!isLanding && <NotificationsDrawer />}
          {!isLanding && <LuminaryDrawer />}
          {!isLanding && <BottomDock />}
        </div>
      );
    }

    // Show tenant-branded login
    return <TenantLogin />;
  }

  // ═══════════════════════════════════════════════════════════
  // MODE 3: PLATFORM — prism.com (landing + full flow)
  // ═══════════════════════════════════════════════════════════
  const isLanding = activeTab === 'landing' || activeTab === 'login' || activeTab === 'enter';

  return (
    <div className={`min-h-screen relative flex flex-col font-outfit ${isLanding ? '' : 'prism-workspace prism-enter'}`}>
      {!isLanding && <TopHeader />}
      <main className="flex-1">
        <ErrorBoundary fallbackTitle="Prism View Exception Intercepted">
          <Suspense fallback={
            <div className="min-h-[50vh] flex items-center justify-center text-white/40 font-mono text-xs uppercase tracking-widest">
              Calibrating Core...
            </div>
          }>
            <WorkspaceRouter />
          </Suspense>
        </ErrorBoundary>
      </main>
      {!isLanding && <NotificationsDrawer />}
      {!isLanding && <LuminaryDrawer />}
      {!isLanding && <BottomDock />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <SubdomainProvider>
        <AuthProvider>
          <AppProvider>
            <SubdomainAwareContent />
          </AppProvider>
        </AuthProvider>
      </SubdomainProvider>
    </ThemeProvider>
  );
};

export default App;
