import React, { Suspense } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider, useApp } from './context/AppContext';
import { TopHeader } from './components/common/TopHeader';
import { BottomDock } from './components/common/BottomDock';
import { NotificationsDrawer } from './components/common/NotificationsDrawer';
import { LuminaryDrawer } from './components/common/LuminaryDrawer';
import { ErrorBoundary } from './components/common/ErrorBoundary';

import { LandingPage } from './components/landing/LandingPage';
import { LoginModal } from './components/auth/LoginModal';
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
import { GenesisWizard } from './components/genesis/GenesisWizard';

const WorkspaceRouter: React.FC = () => {
  const { activeTab } = useApp();

  switch (activeTab) {
    case 'landing':
      return <LandingPage />;
    case 'login':
      return <LoginModal />;
    case 'genesis':
      return <GenesisWizard />;
    case 'spectrum':
      return <SpectrumView />;
    case 'team':
      return <TeamView />;
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
    default:
      return <LandingPage />;
  }
};

const AppContent: React.FC = () => {
  const { activeTab } = useApp();
  const isLanding = activeTab === 'landing' || activeTab === 'login';

  return (
    <div className={`min-h-screen relative flex flex-col font-outfit ${isLanding ? '' : 'prism-workspace prism-enter'}`}>
      {!isLanding && <TopHeader />}
      <main className="flex-1">
        <ErrorBoundary fallbackTitle="Prism View Exception Intercepted">
          <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center text-white/40 font-mono text-xs uppercase tracking-widest">Calibrating Core...</div>}>
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
      <AuthProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
