import React from 'react';
import { Bell, Sun, Moon, Sparkles, User as UserIcon, Shield, Layers } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';

export const TopHeader: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notificationsOpen, setNotificationsOpen, notifications, setActiveTab, activeTab } = useApp();

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/10 px-4 md:px-8 py-3.5 flex items-center justify-between transition-colors">
      {/* Brand & Workspace Info */}
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-sky-500/20">
          <Layers className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-outfit font-bold text-lg tracking-wider text-slate-100 dark:text-slate-100 light:text-slate-900 uppercase">
              PRISM
            </span>
            <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-full">
              v2.4
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono tracking-wide">
            PERFORMANCE REFRACTED
          </p>
        </div>
      </div>

      {/* Center Navigation quick links (if logged in) */}
      {isAuthenticated && activeTab !== 'landing' && (
        <div className="hidden lg:flex items-center space-x-1 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Luminary Operational Grid Active</span>
        </div>
      )}

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
          className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-600" />}
        </button>

        {/* Notifications Tray Bell */}
        {isAuthenticated && (
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            title="Notifications & Signals"
            className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>
        )}

        {/* User Account / Login Button */}
        {isAuthenticated ? (
          <div className="flex items-center space-x-3 border-l border-white/10 pl-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-slate-200">{currentUser?.name}</p>
              <p className="text-[10px] font-mono text-sky-400">{currentUser?.title}</p>
            </div>
            <img
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-8 h-8 rounded-full border border-sky-400/50 object-cover cursor-pointer"
              onClick={() => setActiveTab('calibration')}
              title="View Calibration & Account Settings"
            />
          </div>
        ) : (
          <button
            onClick={() => setActiveTab('login')}
            className="flex items-center space-x-2 px-4 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs transition-all shadow-md shadow-sky-500/20"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
