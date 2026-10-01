import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Sun, Moon, User as UserIcon, Layers } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useApp } from '../../context/AppContext';

export const TopHeader: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { notificationsOpen, setNotificationsOpen, notifications, setActiveTab, activeTab } = useApp();

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-[#050507]/80 backdrop-blur-2xl px-5 md:px-10 py-3 flex items-center justify-between transition-colors"
    >
      {/* Brand & Workspace Info */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="flex items-center space-x-3 cursor-pointer"
        onClick={() => setActiveTab('landing')}
      >
        <div className="w-9 h-9 rounded-full border border-white/20 bg-white/[0.03] flex items-center justify-center shadow-[0_0_24px_rgba(129,140,248,0.14)]">
          <Layers className="w-4 h-4 text-indigo-200" strokeWidth={1.4} />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span
              className="font-outfit font-light text-lg tracking-[0.28em] text-slate-100 uppercase"
              onClick={(e) => { e.stopPropagation(); setActiveTab('spectrum'); }}
            >
              PRISM
            </span>
            {currentUser && (currentUser.role === 'CEO' || (currentUser as any).role === 'owner' || currentUser.role === 'DEPT_HEAD') ? (
              <span
                className="px-2 py-0.5 text-[9px] font-mono tracking-widest bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-400/25 text-indigo-300 rounded-full cursor-pointer transition-colors"
                onClick={(e) => { e.stopPropagation(); setActiveTab('tenant_admin'); }}
                title="Organization Admin Console"
              >
                Axiora Technologies • Admin
              </span>
            ) : (
              <span
                className="px-2 py-0.5 text-[9px] font-mono tracking-widest bg-white/5 border border-white/10 text-zinc-400 rounded-full select-none"
              >
                Axiora Technologies
              </span>
            )}
          </div>
          <p className="text-[9px] text-zinc-500 font-mono tracking-[0.16em]">
            ENTERPRISE SaaS • axiora.prism.ai
          </p>
        </div>
      </motion.div>

      {/* Center Navigation quick links (if logged in) */}
      {isAuthenticated && activeTab !== 'landing' && (
        <div className="hidden lg:flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/[0.02] border border-white/[0.08] text-[10px] font-mono tracking-[0.12em] uppercase text-zinc-400 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <span>Luminary Operational Grid Active</span>
        </div>
      )}

      {/* Right Controls */}
      <div className="flex items-center space-x-3">
        {/* Theme Switcher */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Theme`}
          className="p-2 rounded-full bg-white/[0.03] hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-sky-400" />}
        </motion.button>

        {/* Notifications Tray Bell */}
        {isAuthenticated && (
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            title="Notifications & Signals"
            className="relative p-2 rounded-full bg-white/[0.03] hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce shadow-[0_0_10px_rgba(244,63,94,0.8)]">
                {unreadCount}
              </span>
            )}
          </motion.button>
        )}

        {/* User Account / Login Button */}
        {isAuthenticated ? (
          <div className="flex items-center space-x-3 border-l border-white/10 pl-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-zinc-200">{currentUser?.name}</p>
              <p className="text-[10px] font-mono text-indigo-400">{currentUser?.title}</p>
            </div>
            <motion.img
              whileHover={{ scale: 1.1 }}
              src={currentUser?.avatar}
              alt={currentUser?.name}
              className="w-8 h-8 rounded-full border border-indigo-400/50 object-cover cursor-pointer shadow-[0_0_12px_rgba(99,102,241,0.3)]"
              onClick={() => setActiveTab('calibration')}
              title="View Calibration & Account Settings"
            />
          </div>
        ) : (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab('login')}
            className="flex items-center space-x-2 px-4 py-2 border border-white/20 bg-white text-black hover:bg-zinc-200 font-mono uppercase tracking-widest font-bold text-[10px] transition-all shadow-[0_0_20px_rgba(255,255,255,0.08)] cursor-pointer"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </motion.button>
        )}
      </div>
    </motion.header>
  );
};

export default TopHeader;
