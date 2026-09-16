import React, { useState, useEffect, useRef, useInsertionEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useMotionValue, type MotionValue } from 'framer-motion';
import {
  Hexagon,
  ArrowRight,
  Play,
  Users,
  TrendingUp,
  RefreshCw,
  ArrowUpRight,
  Menu,
  X,
  Fingerprint,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

// Custom lucide-like Icon for chart-no-axes-column-increasing
const ChartColumnIncreasing: React.FC<{ className?: string; strokeWidth?: number }> = ({ className, strokeWidth = 2 }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="12" x2="12" y1="20" y2="10" />
    <line x1="18" x2="18" y1="20" y2="4" />
    <line x1="6" x2="6" y1="20" y2="16" />
  </svg>
);

const NAV_LINKS = [
  { label: 'Intelligence', id: 'intelligence' },
  { label: 'Forecasting', id: 'forecasting' },
  { label: 'Feedback', id: 'intelligence' },
  { label: 'Platform', id: 'platform' },
];

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

// -------------------------------------------------------------
// 1. Navigation Header Component
// -------------------------------------------------------------
const Navbar: React.FC = () => {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { setActiveTab } = useApp();

  useInsertionEffect(() => {
    return scrollY.on('change', (latest) => {
      const prev = scrollY.getPrevious() ?? 0;
      if (latest > 150 && latest > prev) {
        setHidden(true);
      } else {
        setHidden(false);
      }
    });
  }, [scrollY]);

  return (
    <>
      <motion.nav
        variants={{
          visible: { y: 0, opacity: 1 },
          hidden: { y: '-100%', opacity: 0 },
        }}
        animate={hidden ? 'hidden' : 'visible'}
        transition={{ duration: 0.35, ease: 'easeInOut' }}
        className="fixed top-0 left-0 right-0 z-50 flex justify-center py-6 pointer-events-none mix-blend-difference"
      >
        <div className="w-full px-6 md:px-12 lg:px-24 flex items-center justify-between pointer-events-auto">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-4 text-white font-light tracking-[0.3em] text-sm uppercase group cursor-pointer"
          >
            <Hexagon className="w-6 h-6 text-white group-hover:text-indigo-400 transition-colors" />
            <span className="tracking-[0.2em] text-sm uppercase font-sans">PRISM</span>
          </button>

          <div className="hidden md:flex items-center gap-8 text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-300">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollToSection(link.id)}
                className="hover:text-white transition-all duration-300 flex flex-col items-center gap-1 group"
              >
                {link.label}
                <div className="w-1 h-1 bg-indigo-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setActiveTab('login')}
              className="text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-300 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => setActiveTab('login')}
              className="px-6 py-3 border border-white/30 text-[10px] font-mono tracking-[0.2em] uppercase text-white hover:bg-white hover:text-black transition-colors"
            >
              Request Demo
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 text-white pointer-events-auto"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center border-x border-white/10 mx-4"
          >
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-8 right-8 p-2 text-white"
            >
              <X className="w-8 h-8" />
            </button>
            <div className="flex flex-col items-center gap-12 text-[10px] font-mono uppercase tracking-[0.3em]">
              {NAV_LINKS.map((link, idx) => (
                <motion.button
                  key={link.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => {
                    scrollToSection(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className="text-zinc-400 hover:text-white transition-colors text-2xl font-sans"
                >
                  {link.label}
                </motion.button>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setActiveTab('login');
                  }}
                  className="mt-12 px-12 py-5 border border-white/30 text-white hover:bg-white hover:text-black transition-colors block text-[10px] font-mono tracking-[0.2em] uppercase"
                >
                  Request Demo
                </button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// -------------------------------------------------------------
// 2. Hero Section Component
// -------------------------------------------------------------
const HeroSection: React.FC = () => {
  const { setActiveTab } = useApp();
  const targetRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 50, damping: 20 });
  const scale = useTransform(smoothProgress, [0, 1], [1, 1.25]);
  const bgOpacity = useTransform(smoothProgress, [0, 1], [0.8, 0]);
  const yTranslate = useTransform(smoothProgress, [0, 1], [0, 150]);
  const textOpacity = useTransform(smoothProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={targetRef}
      className="relative w-full min-h-screen bg-[#010101] flex flex-col items-center justify-center pt-32 pb-20 [perspective:1000px]"
    >
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div style={{ scale, opacity: bgOpacity }} className="w-full h-full relative">
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/80 z-10" />
          <img
            src="https://images.unsplash.com/photo-1649182784901-48f5f2d40ecc?q=80&w=2000&auto=format&fit=crop"
            alt=""
            aria-hidden="true"
            loading="eager"
            className="w-full h-full object-cover object-center opacity-70 brightness-125 saturate-[1.3] contrast-110 mix-blend-lighten"
          />
          <div
            className="hero-blob absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-500/40 rounded-full blur-[120px] mix-blend-screen"
            style={{ animation: 'hero-blob-a 15s linear infinite', willChange: 'transform, opacity' }}
          />
          <div
            className="hero-blob absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-rose-500/30 rounded-full blur-[150px] mix-blend-screen"
            style={{ animation: 'hero-blob-b 20s linear infinite', willChange: 'transform, opacity' }}
          />
          <div
            className="hero-blob absolute top-[20%] right-[20%] w-[40%] h-[40%] bg-purple-500/30 rounded-full blur-[100px] mix-blend-screen"
            style={{ animation: 'hero-blob-c 10s ease-in-out infinite', willChange: 'transform, opacity' }}
          />
        </motion.div>
      </div>

      {/* Decorative corner reticles */}
      <div className="absolute top-8 left-8 w-4 h-4 border-t-2 border-l-2 border-white/50 z-20 pointer-events-none" />
      <div className="absolute top-8 right-8 w-4 h-4 border-t-2 border-r-2 border-white/50 z-20 pointer-events-none" />
      <div className="absolute bottom-8 left-8 w-4 h-4 border-b-2 border-l-2 border-white/50 z-20 pointer-events-none" />
      <div className="absolute bottom-8 right-8 w-4 h-4 border-b-2 border-r-2 border-white/50 z-20 pointer-events-none" />

      <motion.div
        style={{ y: yTranslate, opacity: textOpacity }}
        className="relative z-10 w-full px-6 md:px-12 lg:px-24 flex flex-col items-start justify-center flex-1"
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="flex items-center gap-3 mb-8 md:mb-12 bg-white/5 backdrop-blur-md px-4 py-2 border border-white/10 rounded-full"
        >
          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-500/20">
            <div className="w-2 h-2 bg-indigo-400 rounded-full shadow-[0_0_10px_rgba(129,140,248,1)] animate-pulse" />
          </div>
          <span className="text-xs sm:text-sm font-mono tracking-[0.2em] text-white uppercase font-medium">
            Every person. Every dimension.
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40, rotateX: 20 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.1, type: 'spring', stiffness: 50 }}
          className="text-[4rem] sm:text-[6.5rem] md:text-[8.5rem] lg:text-[11rem] font-bold tracking-tighter leading-[0.85] text-white mb-10 drop-shadow-2xl"
        >
          People,
          <span className="relative inline-block mt-2">
            <span className="absolute -inset-4 bg-gradient-to-r from-indigo-500/30 via-purple-500/30 to-rose-500/30 blur-3xl z-0" />
            <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-rose-200 pr-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              understood.
            </span>
          </span>
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full items-end mt-4">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
            className="md:col-span-6 lg:col-span-5 text-xl sm:text-2xl md:text-3xl text-zinc-200 font-medium tracking-wide leading-relaxed drop-shadow-md font-sans"
          >
            Your team carries more than their job titles. Prism brings together every signal — reviews, growth, wellbeing, output — so you can see each person whole, and lead accordingly.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
            className="md:col-span-6 lg:col-span-7 flex flex-col sm:flex-row items-start md:items-end justify-end gap-6 w-full mt-8 md:mt-0"
          >
            <button
              onClick={() => setActiveTab('login')}
              className="group relative px-8 py-6 bg-white text-black font-bold text-sm tracking-widest uppercase overflow-hidden transition-all duration-300 hover:scale-[1.05] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] active:scale-[0.98] w-full sm:w-auto"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                Get started
                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </button>
            <button
              onClick={() => setActiveTab('login')}
              className="group px-8 py-6 font-bold text-sm tracking-widest uppercase text-white hover:text-white transition-all duration-300 flex items-center justify-center gap-3 border-2 border-white/30 hover:border-indigo-400 hover:bg-indigo-500/20 hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] bg-black/40 backdrop-blur-md w-full sm:w-auto"
            >
              <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
              See how it works
            </button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

// -------------------------------------------------------------
// 3. Stacking Intelligence Cards Section
// -------------------------------------------------------------
interface FeatureCardProps {
  i: number;
  title: string;
  description: string;
  icon: any;
  image: string;
  color: string;
  progress: MotionValue<number>;
  targetScale: number;
}

const FEATURE_DATA = [
  {
    icon: Users,
    title: '360° Intelligence',
    description:
      'Eliminate blind spots. Aggregate peer, manager, and self-evaluations into a singular, unbiased multidimensional matrix. See the true shape of your workforce.',
    image: 'https://images.unsplash.com/photo-1770031079091-c6356e82ea9b?q=80&w=1080&auto=format&fit=crop',
    color: 'indigo',
  },
  {
    icon: TrendingUp,
    title: 'Predictive Revenue',
    description:
      'Link human capital directly to the bottom line. Our predictive engine maps individual performance trajectories to concrete revenue projections and risk assessments.',
    image: 'https://images.unsplash.com/photo-1498248529262-f5084e1d0d36?q=80&w=1080&auto=format&fit=crop',
    color: 'zinc',
  },
  {
    icon: RefreshCw,
    title: 'Continuous Calibration',
    description:
      'Feedback that waits for December misses everything in between. Prism keeps the conversation open — small, frequent signals that let you act before small issues become exits.',
    image: 'https://images.unsplash.com/photo-1764268602042-88b05a211378?q=80&w=1080&auto=format&fit=crop',
    color: 'purple',
  },
  {
    icon: ChartColumnIncreasing,
    title: 'Executive Clarity',
    description:
      'Every OKR, every review cycle, every risk flag — in one place. Built for the leaders who are accountable for the whole picture, not just their slice of it.',
    image: 'https://images.unsplash.com/photo-1649182784901-48f5f2d40ecc?q=80&w=1080&auto=format&fit=crop',
    color: 'rose',
  },
];

const FeatureCard: React.FC<FeatureCardProps> = ({
  i,
  title,
  description,
  icon: Icon,
  image,
  color,
  progress,
  targetScale,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const smooth = useSpring(progress, { stiffness: 100, damping: 20 });
  const scale = useTransform(smooth, [i * 0.25, 1], [1, targetScale]);
  const yParallax = useTransform(smooth, [0, 1], ['-10%', '10%']);

  const borderClass =
    color === 'indigo'
      ? 'border-indigo-500/50'
      : color === 'purple'
      ? 'border-purple-500/50'
      : color === 'rose'
      ? 'border-rose-500/50'
      : 'border-zinc-500/50';

  const textClass =
    color === 'indigo'
      ? 'text-indigo-400'
      : color === 'purple'
      ? 'text-purple-400'
      : color === 'rose'
      ? 'text-rose-400'
      : 'text-zinc-400';

  const shadowClass =
    color === 'indigo'
      ? 'shadow-[0_0_50px_-10px_rgba(99,102,241,0.3)]'
      : color === 'purple'
      ? 'shadow-[0_0_50px_-10px_rgba(168,85,247,0.3)]'
      : color === 'rose'
      ? 'shadow-[0_0_50px_-10px_rgba(244,63,94,0.3)]'
      : 'shadow-[0_0_50px_-10px_rgba(161,161,170,0.3)]';

  return (
    <div
      ref={containerRef}
      className="h-screen w-full flex items-center justify-center sticky top-0 z-10 [perspective:1000px] overflow-hidden"
    >
      <motion.div
        style={{ scale, top: `calc(-5vh + ${i * 30}px)` } as any}
        className={`group relative flex flex-col lg:flex-row w-full h-auto min-h-[65vh] lg:h-[600px] bg-[#0A0A0A] overflow-hidden border border-white/20 shadow-2xl ${borderClass} ${shadowClass} transition-colors duration-500 mx-0 max-w-[1400px] px-0`}
      >
        <div
          className="absolute inset-0 z-20 pointer-events-none opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage:
              "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.95%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')",
          }}
        />
        <div className="w-full lg:w-5/12 p-8 sm:p-12 lg:p-16 flex flex-col justify-center relative z-10 border-b lg:border-b-0 lg:border-r border-white/10 bg-black/90 backdrop-blur-3xl">
          <div className="flex items-center gap-4 mb-8">
            <div
              className={`flex items-center justify-center w-12 h-12 border ${borderClass} bg-white/[0.05] group-hover:bg-white/[0.1] transition-colors`}
            >
              <Icon className={`w-5 h-5 ${textClass} drop-shadow-[0_0_8px_currentColor]`} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">
                Metric 0{i + 1}
              </span>
              <span className={`text-xs font-mono uppercase tracking-widest ${textClass}`}>
                Active
              </span>
            </div>
          </div>
          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-light tracking-tighter text-white mb-6 leading-[1.1]">
            {title}
          </h3>
          <p className="text-sm sm:text-base lg:text-lg text-zinc-300 font-light leading-relaxed">
            {description}
          </p>
        </div>

        <div className="w-full lg:w-7/12 h-64 lg:h-full relative overflow-hidden bg-black flex items-center justify-center">
          <motion.div style={{ y: yParallax } as any} className="absolute inset-0 w-full h-[120%]">
            <img
              src={image}
              alt={title}
              className="w-full h-full object-cover object-center opacity-90 brightness-125 saturate-[1.2] contrast-125 group-hover:scale-105 transition-transform duration-[1.5s] ease-out"
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-l from-[#0A0A0A] via-black/40 to-transparent" />
          <div
            className={`absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700 bg-gradient-to-tr from-${color}-500/50 to-transparent mix-blend-overlay pointer-events-none`}
          />

          <div className="absolute inset-0 z-10 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/30 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
              <div className="w-1 h-1 bg-white rounded-full shadow-[0_0_10px_white]" />
              <div className="absolute w-[120%] h-[1px] bg-white/20 group-hover:bg-white/40 transition-colors" />
              <div className="absolute w-[1px] h-[120%] bg-white/20 group-hover:bg-white/40 transition-colors" />
            </div>
            <div className="absolute bottom-6 right-6 flex flex-col items-end gap-1 font-mono text-[9px] text-zinc-300 tracking-widest bg-black/50 backdrop-blur-md px-3 py-2 border border-white/10">
              <span>REV.MODEL // {['A4F2C1', 'B9E3D7', 'C1A8F4', 'D6B2E9'][i % 4]}</span>
              <span>CALCULATING ROI...</span>
              <span className={`${textClass} font-medium animate-pulse`}>100% FORECASTED</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const IntelligenceSection: React.FC = () => {
  const targetRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ['start start', 'end end'],
  });

  return (
    <section id="intelligence" ref={targetRef} className="relative w-full bg-[#010101] pb-[10vh] overflow-hidden">
      <div className="w-full px-6 md:px-12 lg:px-24 py-32 sm:py-48 z-10 relative pointer-events-none flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 border border-white/20 bg-white/5 backdrop-blur-sm mb-8">
          <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
          <span className="text-[10px] font-mono text-white uppercase tracking-widest">
            Four ways to see more clearly
          </span>
        </div>
        <h2 className="text-4xl sm:text-6xl lg:text-[7rem] font-light tracking-tighter leading-[0.9] text-white mb-6 font-sans">
          The shape of <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400 drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]">
            your team.
          </span>
        </h2>
        <p className="text-lg text-zinc-300 font-light max-w-2xl mx-auto font-sans">
          Four lenses. One coherent picture of the people who make your organisation work.
        </p>
      </div>

      <div className="relative z-20">
        {FEATURE_DATA.map((card, idx) => {
          const targetScale = 1 - (FEATURE_DATA.length - idx) * 0.05;
          return <FeatureCard key={card.title} i={idx} {...card} progress={scrollYProgress} targetScale={targetScale} />;
        })}
      </div>
    </section>
  );
};

// -------------------------------------------------------------
// 4. Wave Path / How It Works Section
// -------------------------------------------------------------
const PHASES = [
  {
    top: '9%',
    align: 'right',
    color: 'from-indigo-500 to-blue-500',
    colorBorder: 'border-indigo-500/40',
    colorGlow: 'rgba(99,102,241,0.25)',
    title: 'Gather every signal',
    desc: 'Peer reviews, self-assessments, manager observations, learning progress, and wellbeing data — all in one place, weighted and calibrated.',
  },
  {
    top: '43%',
    align: 'left',
    color: 'from-blue-500 to-purple-500',
    colorBorder: 'border-purple-500/40',
    colorGlow: 'rgba(168,85,247,0.25)',
    title: 'See the full picture',
    desc: 'Prism connects individual trajectories to team outcomes. Spot the people who are quietly growing, and the ones who need support before they disengage.',
  },
  {
    top: '77%',
    align: 'right',
    color: 'from-purple-500 to-rose-500',
    colorBorder: 'border-rose-500/40',
    colorGlow: 'rgba(244,63,94,0.25)',
    title: 'Act with confidence',
    desc: 'Decisions backed by evidence, not gut feel. Promote the right people. Have the right conversations. Before it\'s too late to matter.',
  },
];

const HowItWorksSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start center', 'end center'],
  });

  const smooth = useSpring(scrollYProgress, { stiffness: 50, damping: 20 });
  const pathLength = useTransform(smooth, [0.05, 0.95], [0, 1]);
  const opacityVal = useTransform(smooth, [0.05, 0.25], [0, 1]);
  const yIndigo = useTransform(smooth, [0, 1], ['0%', '40%']);
  const yRose = useTransform(smooth, [0, 1], ['0%', '-40%']);

  return (
    <section
      id="forecasting"
      ref={sectionRef}
      className="relative w-full bg-black border-y border-white/5"
      style={{ minHeight: '220vh' }}
    >
      <div className="absolute inset-0 z-0 opacity-30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-black to-black pointer-events-none" />
      <div
        className="absolute inset-0 z-0 opacity-[0.025] mix-blend-screen pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <motion.div
        style={{ y: yIndigo }}
        className="absolute top-1/4 left-1/4 w-[40rem] h-[40rem] bg-indigo-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none z-0"
      />
      <motion.div
        style={{ y: yRose }}
        className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-rose-500/10 rounded-full blur-[100px] mix-blend-screen pointer-events-none z-0"
      />

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: 'easeOut' }}
        viewport={{ once: true, margin: '-100px' }}
        className="relative z-10 w-full px-6 md:px-12 lg:px-24 pt-32 pb-24 flex flex-col items-center text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 border border-indigo-500/20 bg-indigo-500/10 backdrop-blur-md mb-6 text-[10px] font-mono tracking-widest text-indigo-300 uppercase rounded-full shadow-[0_0_30px_rgba(99,102,241,0.15)] ring-1 ring-white/5">
          <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(129,140,248,0.8)]" />
          How it works
        </div>
        <h2 className="text-4xl sm:text-6xl md:text-[5rem] font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 mb-6 leading-[1.1]">
          From signal <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400">
            to understanding.
          </span>
        </h2>
      </motion.div>

      <div className="relative w-full z-10" style={{ height: '160vh' }}>
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none" fill="none">
            <path
              d="M 500 0 C 500 50, 680 90, 720 180 C 760 270, 560 360, 500 450 C 440 540, 260 610, 280 700 C 300 790, 480 840, 500 1000"
              stroke="rgba(255,255,255,0.10)"
              strokeWidth="2"
              strokeDasharray="6 6"
            />
          </svg>
          <svg
            className="absolute inset-0 w-full h-full hidden md:block"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="none"
            fill="none"
            style={{ filter: 'drop-shadow(0 0 14px rgba(168,85,247,0.5))' }}
          >
            <defs>
              <linearGradient id="pg" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#818cf8" />
                <stop offset="50%" stopColor="#c084fc" />
                <stop offset="100%" stopColor="#fb7185" />
              </linearGradient>
            </defs>
            <motion.path
              d="M 500 0 C 500 50, 680 90, 720 180 C 760 270, 560 360, 500 450 C 440 540, 260 610, 280 700 C 300 790, 480 840, 500 1000"
              stroke="url(#pg)"
              strokeWidth="3"
              strokeLinecap="round"
              style={{ pathLength }}
            />
          </svg>
        </div>

        {PHASES.map((phase, idx) => {
          const isRight = phase.align === 'right';
          return (
            <motion.div
              key={phase.title}
              className="absolute w-full"
              style={{ top: phase.top, opacity: opacityVal }}
            >
              <div className="flex flex-row items-start gap-4 px-6 md:hidden">
                <div className="relative shrink-0 w-8 h-8 flex items-center justify-center mt-1">
                  <div className="absolute inset-0 border border-white/25 rotate-45" />
                  <div className={`relative z-10 w-2 h-2 bg-gradient-to-r ${phase.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`inline-block px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest text-white bg-gradient-to-r ${phase.color} rounded-sm mb-2`}>
                    Phase.0{idx + 1}
                  </span>
                  <h3 className="text-xl font-semibold tracking-tight text-white mb-2 leading-tight">
                    {phase.title}
                  </h3>
                  <p className="text-sm text-zinc-300 font-light leading-relaxed">{phase.desc}</p>
                </div>
              </div>

              {isRight ? (
                <div
                  className="absolute hidden md:flex flex-row items-stretch gap-0 group"
                  style={{ left: 'calc(50% - 24px)', right: '4%' }}
                >
                  <div className="relative shrink-0 w-12 h-12 self-center flex items-center justify-center z-20">
                    <div className="absolute inset-0 border-[1.5px] border-white/25 rotate-45 group-hover:rotate-180 group-hover:scale-125 transition-all duration-700 bg-black/50" />
                    <div className={`relative z-10 w-3 h-3 bg-gradient-to-r ${phase.color} shadow-[0_0_20px_rgba(255,255,255,0.7)] group-hover:scale-150 transition-transform duration-500`} />
                    <div className={`absolute inset-0 bg-gradient-to-r ${phase.color} blur-md opacity-40 group-hover:opacity-80 transition-opacity duration-500`} />
                    <div className="absolute top-1/2 left-full w-8 h-px bg-gradient-to-r from-white/40 to-transparent" />
                  </div>
                  <div className={`relative flex-1 ml-10 flex flex-col justify-center p-8 lg:p-12 border ${phase.colorBorder} border-t-white/20 bg-gradient-to-br from-white/[0.05] to-transparent backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_8px_40px_0_rgba(0,0,0,0.7)] ring-1 ring-white/5 rounded-xl group-hover:from-white/[0.08] group-hover:-translate-y-1 transition-all duration-500`}>
                    <div
                      className="absolute -inset-4 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
                      style={{ background: `radial-gradient(ellipse at 20% 50%, ${phase.colorGlow}, transparent 70%)` }}
                    />
                    <div className="absolute top-3 left-3 w-2 h-2 border-t border-l border-white/30 group-hover:border-white/70 transition-colors" />
                    <div className="absolute top-3 right-3 w-2 h-2 border-t border-r border-white/30 group-hover:border-white/70 transition-colors" />
                    <div className="absolute bottom-3 left-3 w-2 h-2 border-b border-l border-white/30 group-hover:border-white/70 transition-colors" />
                    <div className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-white/30 group-hover:border-white/70 transition-colors" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`px-2 py-1 text-[9px] font-mono uppercase tracking-widest text-white font-bold rounded-sm bg-gradient-to-r ${phase.color}`}>
                          Phase.0{idx + 1}
                        </span>
                        <div className="flex-1 h-px bg-white/10 group-hover:bg-white/30 transition-colors" />
                      </div>
                      <h3 className="text-2xl lg:text-3xl xl:text-4xl font-semibold tracking-tight text-white mb-3 leading-tight">
                        {phase.title}
                      </h3>
                      <p className="text-base lg:text-lg text-zinc-300 leading-relaxed font-light group-hover:text-zinc-100 transition-colors max-w-2xl">
                        {phase.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="absolute hidden md:flex flex-row-reverse items-stretch gap-0 group"
                  style={{ right: 'calc(50% - 24px)', left: '4%' }}
                >
                  <div className="relative shrink-0 w-12 h-12 self-center flex items-center justify-center z-20">
                    <div className="absolute inset-0 border-[1.5px] border-white/25 rotate-45 group-hover:rotate-180 group-hover:scale-125 transition-all duration-700 bg-black/50" />
                    <div className={`relative z-10 w-3 h-3 bg-gradient-to-r ${phase.color} shadow-[0_0_20px_rgba(255,255,255,0.7)] group-hover:scale-150 transition-transform duration-500`} />
                    <div className={`absolute inset-0 bg-gradient-to-r ${phase.color} blur-md opacity-40 group-hover:opacity-80 transition-opacity duration-500`} />
                    <div className="absolute top-1/2 right-full w-8 h-px bg-gradient-to-l from-white/40 to-transparent" />
                  </div>
                  <div className={`relative flex-1 mr-10 flex flex-col justify-center p-8 lg:p-12 text-right border ${phase.colorBorder} border-t-white/20 bg-gradient-to-bl from-white/[0.05] to-transparent backdrop-blur-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.08),0_8px_40px_0_rgba(0,0,0,0.7)] ring-1 ring-white/5 rounded-xl group-hover:from-white/[0.08] group-hover:-translate-y-1 transition-all duration-500`}>
                    <div
                      className="absolute -inset-4 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
                      style={{ background: `radial-gradient(ellipse at 80% 50%, ${phase.colorGlow}, transparent 70%)` }}
                    />
                    <div className="absolute top-3 left-3 w-2 h-2 border-t border-l border-white/30 group-hover:border-white/70 transition-colors" />
                    <div className="absolute top-3 right-3 w-2 h-2 border-t border-r border-white/30 group-hover:border-white/70 transition-colors" />
                    <div className="absolute bottom-3 left-3 w-2 h-2 border-b border-l border-white/30 group-hover:border-white/70 transition-colors" />
                    <div className="absolute bottom-3 right-3 w-2 h-2 border-b border-r border-white/30 group-hover:border-white/70 transition-colors" />
                    <div className="relative z-10">
                      <div className="flex items-center justify-end gap-3 mb-4">
                        <div className="flex-1 h-px bg-white/10 group-hover:bg-white/30 transition-colors" />
                        <span className={`px-2 py-1 text-[9px] font-mono uppercase tracking-widest text-white font-bold rounded-sm bg-gradient-to-r ${phase.color}`}>
                          Phase.0{idx + 1}
                        </span>
                      </div>
                      <h3 className="text-2xl lg:text-3xl xl:text-4xl font-semibold tracking-tight text-white mb-3 leading-tight">
                        {phase.title}
                      </h3>
                      <p className="text-base lg:text-lg text-zinc-300 leading-relaxed font-light group-hover:text-zinc-100 transition-colors">
                        {phase.desc}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

// -------------------------------------------------------------
// 5. Platform / Call-to-Action Scanner Section
// -------------------------------------------------------------
const PlatformSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { setActiveTab } = useApp();
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start end', 'end end'] });
  const smooth = useSpring(scrollYProgress, { stiffness: 60, damping: 20 });
  const scale = useTransform(smooth, [0, 1], [0.9, 1]);
  const opacity = useTransform(smooth, [0, 0.6], [0, 1]);
  const y = useTransform(smooth, [0, 1], [150, 0]);
  const rotateX = useTransform(smooth, [0, 1], [10, 0]);

  return (
    <section
      id="platform"
      ref={sectionRef}
      className="relative min-h-screen bg-[#010101] flex items-center justify-center py-32 overflow-hidden [perspective:2000px]"
    >
      <motion.div
        style={{ scale, opacity, y, rotateX }}
        className="group relative w-full aspect-square md:aspect-[21/9] flex flex-col items-center justify-center p-8 sm:p-24 overflow-hidden border-t border-b border-white/20 bg-gradient-to-b from-[#0A0A0A] to-[#020202] shadow-[0_0_100px_-20px_rgba(99,102,241,0.2)] max-w-[1760px] mx-auto"
      >
        <div className="absolute inset-0 z-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-50 group-hover:opacity-70 transition-opacity duration-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,#010101_80%)] z-0" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1/2 h-1/2 bg-indigo-500/10 rounded-full blur-[100px] group-hover:bg-indigo-500/20 group-hover:scale-150 transition-all duration-[2s] z-0" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-[1px] animate-[scan_3s_ease-in-out_infinite] z-0 shadow-[0_0_20px_rgba(99,102,241,0.8)]" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <motion.h2
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, type: 'spring' }}
            viewport={{ once: true }}
            className="text-5xl sm:text-7xl md:text-[8rem] font-light tracking-tighter text-white mb-8 leading-[0.85] drop-shadow-2xl"
          >
            See your people <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-zinc-300 to-zinc-600">
              clearly.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-lg sm:text-2xl text-zinc-300 font-light max-w-2xl mx-auto mb-16 leading-relaxed"
          >
            Every person on your team contains more than a score. Prism helps you understand what that means — and act on it.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto items-center justify-center"
          >
            <button
              onClick={() => setActiveTab('login')}
              className="group relative w-full sm:w-auto px-12 py-6 bg-white text-black font-bold text-sm tracking-widest uppercase overflow-hidden transition-all duration-300 hover:scale-[1.05] active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)]"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <Fingerprint className="w-5 h-5 text-indigo-600 group-hover:text-black transition-colors" />
                Request a Demo
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </motion.div>
        </div>

        {/* Framing corner Reticles */}
        <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-indigo-500/50 group-hover:border-white transition-colors duration-700" />
        <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-indigo-500/50 group-hover:border-white transition-colors duration-700" />
        <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-indigo-500/50 group-hover:border-white transition-colors duration-700" />
        <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-indigo-500/50 group-hover:border-white transition-colors duration-700" />
      </motion.div>
    </section>
  );
};

// -------------------------------------------------------------
// 6. Footer Component
// -------------------------------------------------------------
const Footer: React.FC = () => {
  const companyLinks = ['Twitter', 'LinkedIn', 'Customer Stories', 'Help Center'];

  return (
    <footer className="relative w-full bg-[#010101] overflow-hidden border-t border-white/10 pt-32 pb-12">
      <div className="w-full px-6 md:px-12 lg:px-24 flex flex-col md:flex-row justify-between items-start mb-32 gap-16 relative z-10">
        <div className="flex flex-col gap-8 w-full max-w-md">
          <div className="flex items-center gap-3">
            <Hexagon className="w-8 h-8 text-white" />
            <span className="text-xl font-light tracking-[0.35em] text-white uppercase font-sans">
              Prism
            </span>
          </div>
          <p className="text-lg text-zinc-400 font-light leading-relaxed font-sans">
            Every person on your team contains more than their job title. Prism helps you see the whole picture — and act on it.
          </p>
          <div className="flex items-center gap-4 mt-4">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest text-zinc-300 uppercase">
              SYS.PRISM.CORE // Online
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 sm:gap-24 w-full md:w-auto">
          <div className="flex flex-col gap-6">
            <span className="text-zinc-500 uppercase tracking-[0.2em] text-[10px] font-mono mb-2">
              Platform
            </span>
            {['Intelligence', 'Forecasting', 'Feedback', 'Security'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-zinc-300 hover:text-white transition-colors flex items-center gap-2 group text-sm"
              >
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500">{'>'}</span>
                {item}
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-6">
            <span className="text-zinc-500 uppercase tracking-[0.2em] text-[10px] font-mono mb-2">
              Company
            </span>
            {companyLinks.map((item) => (
              <a
                key={item}
                href="#"
                className="text-zinc-300 hover:text-white transition-colors flex items-center gap-2 group text-sm"
              >
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500">{'>'}</span>
                {item}
                <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity ml-auto" />
              </a>
            ))}
          </div>

          <div className="flex flex-col gap-6">
            <span className="text-zinc-500 uppercase tracking-[0.2em] text-[10px] font-mono mb-2">
              Legal
            </span>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map((item) => (
              <a
                key={item}
                href="#"
                className="text-zinc-300 hover:text-white transition-colors flex items-center gap-2 group text-sm"
              >
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500">{'>'}</span>
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="relative w-full flex justify-center mb-16 select-none overflow-hidden mix-blend-difference pointer-events-none">
        <motion.h1
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="text-[18vw] font-bold tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-900 font-sans"
        >
          PRISM
        </motion.h1>
      </div>

      <div className="w-full px-6 md:px-12 lg:px-24 flex flex-col sm:flex-row items-center justify-between text-[10px] text-zinc-500 tracking-[0.2em] font-mono uppercase border-t border-white/20 pt-8 relative z-10">
        <p>IDENTIFIER: PRISM.HR.2026.V2.0</p>
        <p className="mt-4 sm:mt-0">© 2026 PRISM INC. ALL RIGHTS RESERVED.</p>
      </div>
    </footer>
  );
};

// -------------------------------------------------------------
// 7. Custom Cursor Component
// -------------------------------------------------------------
const CustomCursor: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [cursorText, setCursorText] = useState('');
  const cursorX = useMotionValue(0);
  const cursorY = useMotionValue(0);

  const springConfig = { damping: 26, stiffness: 120, mass: 0.8 };
  const smoothX = useSpring(cursorX, springConfig);
  const smoothY = useSpring(cursorY, springConfig);

  const dotConfig = { damping: 28, stiffness: 480, mass: 0.2 };
  const dotX = useSpring(cursorX, dotConfig);
  const dotY = useSpring(cursorY, dotConfig);

  const isMoving = useRef(false);

  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (!isMoving.current) {
        isMoving.current = true;
        setVisible(true);
      }
    };

    const handleOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive =
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'a' ||
        !!target.closest('button') ||
        !!target.closest('a');
      setHovered(isInteractive);

      const text =
        target.getAttribute('data-cursor') ||
        target.closest('[data-cursor]')?.getAttribute('data-cursor') ||
        '';
      setCursorText(text);
    };

    const handleLeave = () => {
      isMoving.current = false;
      setVisible(false);
    };

    const handleEnter = () => {
      isMoving.current = true;
      setVisible(true);
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('mouseover', handleOver, { passive: true });
    document.body.addEventListener('mouseleave', handleLeave);
    document.body.addEventListener('mouseenter', handleEnter);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseover', handleOver);
      document.body.removeEventListener('mouseleave', handleLeave);
      document.body.removeEventListener('mouseenter', handleEnter);
    };
  }, [cursorX, cursorY]);

  const [hasFinePointer, setHasFinePointer] = useState(() =>
    typeof window === 'undefined' ? false : window.matchMedia('(pointer: fine)').matches,
  );

  useEffect(() => {
    const media = window.matchMedia('(pointer: fine)');
    const onChange = (e: MediaQueryListEvent) => setHasFinePointer(e.matches);
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  if (!hasFinePointer) return null;

  const size = cursorText ? 76 : 48;

  return (
    <>
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998] rounded-full flex items-center justify-center mix-blend-[var(--p-cursor-blend)]"
        style={{
          x: smoothX,
          y: smoothY,
          translateX: '-50%',
          translateY: '-50%',
          border: '1px solid',
        }}
        animate={{
          width: hovered ? size : 0,
          height: hovered ? size : 0,
          opacity: hovered ? 1 : 0,
          borderColor: hovered ? 'rgba(129,140,248,0.4)' : 'rgba(255,255,255,0.35)',
          backgroundColor: hovered ? 'rgba(99,102,241,0.10)' : 'rgba(255,255,255,0)',
        }}
        transition={{
          width: { type: 'spring', stiffness: 240, damping: 22 },
          height: { type: 'spring', stiffness: 240, damping: 22 },
          opacity: { duration: 0.15 },
          borderColor: { duration: 0.2 },
          backgroundColor: { duration: 0.2 },
        }}
      >
        <motion.span
          animate={{ opacity: cursorText ? 1 : 0, scale: cursorText ? 1 : 0.5 }}
          transition={{ duration: 0.12 }}
          className="text-[10px] font-mono uppercase tracking-widest text-white whitespace-nowrap"
        >
          {cursorText}
        </motion.span>
      </motion.div>

      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] rounded-full mix-blend-[var(--p-cursor-blend)] bg-white"
        style={{
          x: dotX,
          y: dotY,
          translateX: '-50%',
          translateY: '-50%',
          width: 6,
          height: 6,
        }}
        animate={{
          scale: hovered && cursorText ? 0 : [1, 2, 1],
          opacity: visible ? 1 : 0,
        }}
        transition={{
          scale: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' },
          opacity: { duration: 0.15 },
        }}
      />
    </>
  );
};

// -------------------------------------------------------------
// 8. Intro Loading Calibration Screen
// -------------------------------------------------------------
const IntroLoader: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [exploding, setExploding] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const totalDuration = 2000;
    const intervalTime = 20;
    const totalSteps = totalDuration / intervalTime;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      setProgress(Math.min((step / totalSteps) * 100, 100));
      if (step >= totalSteps) {
        clearInterval(interval);
        setExploding(true);
        setTimeout(() => {
          document.body.style.overflow = '';
          onComplete();
        }, 1200);
      }
    }, intervalTime);

    return () => {
      clearInterval(interval);
      document.body.style.overflow = '';
    };
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#010101] overflow-hidden"
      animate={{ backgroundColor: exploding ? 'rgba(1,1,1,0)' : 'rgba(1,1,1,1)' }}
      transition={{ duration: 1, ease: 'easeInOut' }}
    >
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-indigo-500/30 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 shadow-[0_0_100px_rgba(99,102,241,0.5)] z-0 mix-blend-screen"
        initial={{ width: '10vw', height: '10vw', opacity: 0 }}
        animate={
          exploding
            ? {
                width: '150vw',
                height: '150vw',
                opacity: [0.8, 0],
                borderWidth: '0px',
              }
            : { width: '20vw', height: '20vw', opacity: 1 }
        }
        transition={{ duration: exploding ? 1.2 : 2, ease: 'easeInOut' }}
      />

      <AnimatePresence>
        {!exploding && (
          <motion.div
            className="relative z-10 flex flex-col items-center"
            exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-6xl md:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400 mb-6 font-mono drop-shadow-[0_0_20px_rgba(168,85,247,0.4)]">
              {Math.round(progress)}%
            </div>
            <div className="w-64 h-[2px] bg-white/10 overflow-hidden relative">
              <motion.div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-400 to-rose-400 shadow-[0_0_15px_rgba(225,29,72,0.8)]"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-8 text-[10px] font-mono tracking-[0.3em] uppercase text-zinc-300 flex items-center gap-3 bg-black/50 px-4 py-2 rounded-full border border-white/10 backdrop-blur-md">
              <div className="w-2 h-2 bg-indigo-500 animate-[ping_1s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full" />
              Calibrating Core
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// -------------------------------------------------------------
// 9. Main LandingPage Export
// -------------------------------------------------------------
const INTRO_SEEN_KEY = 'prism_intro_seen';

export const LandingPage: React.FC = () => {
  const [showIntro, setShowIntro] = useState(() => {
    try {
      return !sessionStorage.getItem(INTRO_SEEN_KEY);
    } catch {
      return false;
    }
  });

  const handleIntroComplete = () => {
    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, '1');
    } catch {}
    setShowIntro(false);
  };

  return (
    <div className="min-h-screen bg-[#010101] text-zinc-100 selection:bg-indigo-500/30 selection:text-white overflow-x-clip w-full font-sans antialiased">
      {/* Noise Texture Background */}
      <div
        className="fixed inset-0 pointer-events-none z-[9998] opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.95%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')",
        }}
      />

      {/* Background Architectural Grid Lines */}
      <div className="fixed inset-0 pointer-events-none z-[9997] flex justify-center opacity-[0.03]">
        <div className="w-full h-full grid grid-cols-4 md:grid-cols-12 gap-4 px-6 md:px-12 lg:px-24">
          {Array.from({ length: 12 }).map((_, idx) => (
            <div key={idx} className="h-full border-l border-white hidden md:block" />
          ))}
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={`mob-${idx}`} className="h-full border-l border-white md:hidden" />
          ))}
        </div>
      </div>

      {/* Dark Vignette Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[9996] bg-[radial-gradient(circle_at_center,transparent_40%,rgba(1,1,1,0.8)_120%)]" />

      {/* Dynamic Interactive Cursor */}
      <CustomCursor />

      {/* Intro Loader */}
      <AnimatePresence>
        {showIntro && <IntroLoader onComplete={handleIntroComplete} />}
      </AnimatePresence>

      {/* Navigation */}
      <Navbar />

      {/* Main Sections */}
      <main className="relative z-10 flex flex-col w-full">
        <HeroSection />
        <IntelligenceSection />
        <HowItWorksSection />
        <PlatformSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;
