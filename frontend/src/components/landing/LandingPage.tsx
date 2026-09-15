import React, { useEffect, useState } from 'react';
import {
  ArrowRight, Hexagon, Play, Users, TrendingUp, RefreshCw,
  Sliders, Crosshair, ArrowUpRight, CheckCircle2, ChevronRight,
  Shield, Cpu, Zap, Activity, Eye, Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { setActiveTab } = useApp();
  const { isAuthenticated, switchDemoRole } = useAuth();
  const [activeLens, setActiveLens] = useState<number>(0);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [showNavbar, setShowNavbar] = useState(true);

  useEffect(() => {
    // Show the full 0% -> 100% boot sequence only on the first visit.
    // sessionStorage keeps it from replaying when the user refreshes the page.
    const hasVisited = sessionStorage.getItem('prism_landing_visited') === 'true';

    if (!hasVisited) {
      setIsFirstVisit(true);
      sessionStorage.setItem('prism_landing_visited', 'true');

      let progress = 0;

      const interval = window.setInterval(() => {
        progress += Math.random() * 4 + 1;

        if (progress >= 100) {
          progress = 100;
          setLoadProgress(100);
          window.clearInterval(interval);

          // Keep 100% visible briefly, then reveal the landing page.
          window.setTimeout(() => setIsLoading(false), 450);
        } else {
          setLoadProgress(Math.floor(progress));
        }
      }, 35);

      return () => window.clearInterval(interval);
    }

    // On refresh: use a short/simple loading state instead of the 100% boot animation.
    const timer = window.setTimeout(() => setIsLoading(false), 500);
    return () => window.clearTimeout(timer);
  }, []);

  // Hide the navbar while scrolling and show it again when scrolling stops.
  useEffect(() => {
    let scrollTimeout: number;

    const handleScroll = () => {
      // Hide immediately whenever the page is being scrolled.
      setShowNavbar(false);

      // Restart the timer on every scroll event.
      window.clearTimeout(scrollTimeout);

      // Show the navbar after scrolling has stopped.
      scrollTimeout = window.setTimeout(() => {
        setShowNavbar(true);
      }, 180);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.clearTimeout(scrollTimeout);
    };
  }, []);

  const lenses = [
    {
      id: '01',
      title: '360° Intelligence',
      badge: 'EVAL.MATRIX // 360',
      tagline: 'Multi-directional feedback synthesized with zero bias',
      description: 'Eliminate blind spots. Aggregate peer, manager, and self-evaluations into a singular, unbiased multidimensional matrix. See the true shape of your workforce.',
      telemetry: '100% FORECASTED',
      icon: Users,
      color: 'from-sky-500 to-indigo-500',
      image: 'https://images.unsplash.com/photo-1770031079091-c6356e82ea9b?q=80&w=1080&auto=format&fit=crop'
    },
    {
      id: '02',
      title: 'Predictive Revenue',
      badge: 'REV.MODEL // A4F2C1',
      tagline: 'Direct performance trajectory revenue attribution',
      description: 'Link human capital directly to the bottom line. Our predictive engine maps individual performance trajectories to concrete revenue projections and risk assessments.',
      telemetry: '100% FORECASTED',
      icon: TrendingUp,
      color: 'from-purple-500 to-rose-500',
      image: 'https://images.unsplash.com/photo-1498248529262-f5084e1d0d36?q=80&w=1080&auto=format&fit=crop'
    },
    {
      id: '03',
      title: 'Continuous Calibration',
      badge: 'CALIB.FREQ // REALTIME',
      tagline: 'Replaces obsolete annual reviews with live signals',
      description: 'Feedback that waits for December misses everything in between. Prism keeps the conversation open — small, frequent signals that let you act before small issues become exits.',
      telemetry: 'ACTIVE // LIVE',
      icon: RefreshCw,
      color: 'from-emerald-500 to-teal-500',
      image: 'https://images.unsplash.com/photo-1764268602042-88b05a211378?q=80&w=1080&auto=format&fit=crop'
    },
    {
      id: '04',
      title: 'Executive Clarity',
      badge: 'EXEC.TELEMETRY // SYNC',
      tagline: 'Luminary AI COO real-time narrative briefings',
      description: 'Every OKR, every review cycle, every risk flag — in one place. Built for the leaders who are accountable for the whole picture, not just their slice of it.',
      telemetry: 'SYNCHRONIZED',
      icon: Sliders,
      color: 'from-amber-500 to-orange-500',
      image: 'https://images.unsplash.com/photo-1649182784901-48f5f2d40ecc?q=80&w=1080&auto=format&fit=crop'
    }
  ];

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#020205] text-zinc-100 selection:bg-indigo-500/30 selection:text-white font-sans antialiased overflow-x-hidden relative">
      {isLoading && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black"
          aria-label={isFirstVisit ? `Loading Prism ${loadProgress}%` : 'Loading Prism'}
        >
          {isFirstVisit ? (
            <>
              {/* FIRST VISIT — full 0% to 100% boot sequence */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full bg-indigo-600/[0.10] blur-[90px] pointer-events-none" />

              <div className="relative w-[330px] h-[330px] flex flex-col items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-indigo-500/30 shadow-[0_0_70px_rgba(99,102,241,0.16)]" />
                <div className="absolute inset-[28px] rounded-full border border-purple-400/[0.12]" />

                <div className="relative z-10 flex items-end leading-none select-none">
                  <span className="text-[7rem] sm:text-[8rem] font-black tracking-[-0.09em] text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400">
                    {loadProgress}
                  </span>
                  <span className="mb-3 ml-1 text-[4.5rem] font-black tracking-[-0.08em] text-rose-400">
                    %
                  </span>
                </div>

                <div className="absolute left-[-18px] right-[-18px] top-[58%] h-px bg-white/10">
                  <div
                    className="h-full bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400 shadow-[0_0_12px_rgba(129,140,248,0.8)] transition-[width] duration-75 ease-linear"
                    style={{ width: `${loadProgress}%` }}
                  />
                </div>

                <div className="absolute bottom-[28px] left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 rounded-full border border-white/10 bg-[#05050a]/95 shadow-[0_0_25px_rgba(99,102,241,0.10)] whitespace-nowrap">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 shadow-[0_0_14px_rgba(99,102,241,0.35)] flex items-center justify-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500/30" />
                  </span>
                  <span className="font-mono text-[10px] font-bold tracking-[0.32em] text-zinc-300 uppercase">
                    {loadProgress < 100 ? 'Calibrating Core' : 'Core Ready'}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* REFRESH — lightweight loading state */}
              <div className="relative w-12 h-12 rounded-full border border-cyan-400/30 border-t-purple-400 border-r-indigo-400 animate-spin">
                <span className="absolute inset-[14px] rounded-full bg-cyan-400/40 shadow-[0_0_18px_rgba(34,211,238,0.55)]" />
              </div>
              <span className="absolute mt-28 font-mono text-[9px] tracking-[0.45em] text-cyan-200/35">
                LOADING
              </span>
            </>
          )}
        </div>
      )}
      {/* Background Decorative Grids, Noise & Vignette */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Deep-space ambient glow */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_55%_62%,rgba(122,38,142,0.30)_0%,rgba(37,21,67,0.20)_28%,transparent_62%)]" />
        <div className="absolute -top-[18%] left-[12%] w-[1100px] h-[620px] bg-[radial-gradient(ellipse_at_center,rgba(63,58,145,0.16)_0%,transparent_68%)] blur-[70px]" />
        <div className="absolute top-[45%] left-[34%] w-[850px] h-[520px] bg-[radial-gradient(ellipse_at_center,rgba(205,54,161,0.14)_0%,transparent_70%)] blur-[85px]" />

        {/* Curved light bands inspired by the reference */}
        <div className="absolute -top-[5%] left-[-12%] w-[125%] h-[260px] rounded-[50%] border-t border-white/[0.055] rotate-[-7deg] blur-[1px]" />
        <div className="absolute top-[28%] left-[-12%] w-[125%] h-[430px] rounded-[50%] border-t border-indigo-300/[0.10] rotate-[-7deg] shadow-[0_-10px_45px_rgba(92,73,155,0.08)]" />
        <div className="absolute top-[49%] left-[-14%] w-[128%] h-[470px] rounded-[50%] border-t border-fuchsia-300/[0.075] rotate-[-7deg] shadow-[0_-12px_55px_rgba(185,72,161,0.08)]" />
        <div className="absolute top-[72%] left-[-15%] w-[130%] h-[430px] rounded-[50%] border-t border-white/[0.035] rotate-[-7deg]" />

        {/* Fine vertical grid */}
        <div className="absolute inset-0 opacity-[0.045] bg-[linear-gradient(90deg,transparent_0,transparent_calc(50%-1px),rgba(255,255,255,0.5)_50%,transparent_calc(50%+1px),transparent_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:123px_100%]" />

        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.78)_100%)]" />
        <div className="fixed top-8 left-8 w-4 h-4 border-t border-l border-white/30" />
        <div className="fixed top-8 right-8 w-4 h-4 border-t border-r border-white/30" />
        <div className="fixed bottom-8 left-8 w-4 h-4 border-b border-l border-white/30" />
        <div className="fixed bottom-8 right-8 w-4 h-4 border-b border-r border-white/30" />
      </div>

      {/* Top Standalone Transparent Navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-12 lg:px-[6.7vw] py-6 bg-[#020205]/20 backdrop-blur-[2px] transition-all duration-300 ease-out ${
          showNavbar
            ? 'translate-y-0 opacity-100'
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        {/* Brand Logo */}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <Hexagon className="w-5 h-5 text-zinc-300 stroke-[1.5] group-hover:text-indigo-300 transition-colors" />
          <span className="text-sm font-mono tracking-[0.28em] text-zinc-400 uppercase">PRISM</span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-9 text-sm font-mono tracking-[0.14em] text-zinc-400 uppercase">
          <button onClick={() => scrollToSection('lenses')} className="hover:text-white transition-colors">
            Intelligence
          </button>
          <button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors">
            Forecasting
          </button>
          <button onClick={() => scrollToSection('how-it-works')} className="hover:text-white transition-colors">
            Feedback
          </button>
          <button onClick={() => scrollToSection('cta')} className="hover:text-white transition-colors">
            Platform
          </button>
        </nav>

        {/* Header Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('login')}
            className="text-[10px] font-mono tracking-[0.2em] text-zinc-400 hover:text-white uppercase transition-colors px-3 py-2"
          >
            Sign In
          </button>
          <button
            onClick={() => {
              if (isAuthenticated) {
                setActiveTab('spectrum');
              } else {
                switchDemoRole('ceo');
                setActiveTab('spectrum');
              }
            }}
            className="group relative px-7 py-3 border border-white/20 bg-black/10 text-zinc-300 font-mono text-[10px] uppercase tracking-[0.18em] hover:bg-white hover:text-black transition-all font-bold flex items-center gap-1.5"
          >
            <span>Request Demo</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 pt-32 sm:pt-36 flex flex-col items-center">
        {/* ===================== HERO SECTION ===================== */}
        <section className="w-full max-w-none mx-auto px-8 md:px-12 lg:px-[6.7vw] flex flex-col items-start text-left pb-28 min-h-[860px] relative">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-white/[0.035] border border-white/10 text-[10px] font-mono tracking-[0.24em] uppercase text-zinc-300 mb-14 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            <span>EVERY PERSON. EVERY DIMENSION.</span>
          </div>

          {/* Reference-style hero glow */}
          <div className="absolute left-[18%] top-[31rem] w-[820px] h-[360px] -translate-x-1/2 rounded-full bg-fuchsia-500/[0.11] blur-[95px] pointer-events-none" />

          {/* Headline: People, understood. */}
          <h1 className="text-[5.2rem] sm:text-[7rem] md:text-[9rem] lg:text-[10.5rem] xl:text-[11.5rem] font-bold tracking-[-0.075em] text-white leading-[0.83] select-none max-w-[1100px] flex flex-col gap-3">
            <span className="block">People,</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-zinc-100 via-indigo-100 to-rose-200">
              understood.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-14 text-xl sm:text-3xl text-zinc-300 max-w-[560px] font-semibold tracking-[-0.03em]">
            <span className="block mb-3">
              Your team carries more than
            </span>

            <span className="block mb-3">
              their job titles. Prism brings
            </span>

            <span className="block mb-3">
              together every signal —
            </span>

            <span className="block mb-3">
              reviews, growth, wellbeing,
            </span>

            <span className="block mb-3">
              output — so you can see each
            </span>

            <span className="block mb-3">
              person whole, and lead
            </span>

            <span className="block">
              accordingly.
            </span>
          </p>

          {/* CTA Button Group */}
          <div className="mt-12 flex flex-col sm:flex-row items-start gap-5 w-full max-w-md lg:absolute lg:right-[6.7vw] lg:bottom-[102px] lg:w-auto lg:max-w-none">
            <button
              onClick={() => {
                if (isAuthenticated) {
                  setActiveTab('spectrum');
                } else {
                  switchDemoRole('ceo');
                  setActiveTab('spectrum');
                }
              }}
              className="w-full sm:w-auto px-8 py-5 bg-white text-black font-extrabold text-xs uppercase tracking-widest hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.18)] flex items-center justify-center gap-3"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="w-full sm:w-auto px-8 py-5 bg-black/10 hover:bg-white/10 border border-white/20 text-white font-mono text-xs uppercase tracking-widest backdrop-blur-xl transition-all flex items-center justify-center gap-3"
            >
              <Play className="w-3.5 h-3.5 fill-white text-white" />
              <span>See how it works</span>
            </button>
          </div>
        </section>

        {/* ===================== SECTION 01: THE SHAPE OF YOUR TEAM ===================== */}
        <section id="lenses" className="w-full px-4 sm:px-6 md:px-10 lg:px-16 py-32 border-t border-white/[0.06]">
          {/* Editorial section heading */}
          <div className="max-w-6xl mx-auto text-center mb-24">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 border border-white/20 bg-white/[0.025] text-[10px] font-mono tracking-[0.22em] uppercase text-zinc-300 mb-12">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
              <span>FOUR WAYS TO SEE MORE CLEARLY</span>
            </div>

            <h2
              className="text-[4rem] sm:text-[5.5rem] md:text-[7rem] lg:text-[8rem] font-light tracking-[-0.065em] leading-[0.82] text-white"
              style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 300 }}
            >
              <span className="block">The shape of</span>
              <span
                className="block italic text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-fuchsia-300 to-rose-400"
                style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 300 }}
              >
                your team.
              </span>
            </h2>

            <p className="mt-10 text-sm sm:text-base md:text-lg text-zinc-300/90 max-w-3xl mx-auto font-light leading-relaxed">
              Four lenses. One coherent picture of the people who make your organisation work.
            </p>
          </div>

          {/* Large visual lens cards */}
          <div className="max-w-[1600px] mx-auto space-y-8">
            {lenses.map((lens, index) => {
              const IconComp = lens.icon;

              return (
                <article
                  key={lens.id}
                  onClick={() => setActiveLens(index)}
                  className={`group relative min-h-[560px] lg:min-h-[690px] overflow-hidden cursor-pointer border transition-all duration-700 ${activeLens === index
                    ? 'border-white/20 bg-[#030305]'
                    : 'border-white/[0.11] bg-[#020204] hover:border-white/20'
                    }`}
                  style={{
                    transform: index % 2 === 0 ? 'rotate(-0.15deg)' : 'rotate(0.15deg)',
                  }}
                >
                  {/* Card grid */}
                  <div className="absolute inset-0 opacity-40 bg-[linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:120px_100%]" />
                  <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:100%_120px]" />

                  {/* Soft central glow */}
                  <div className="absolute right-[16%] top-[18%] w-[560px] h-[560px] rounded-full bg-indigo-500/[0.07] blur-[120px] group-hover:bg-fuchsia-500/[0.10] transition-all duration-1000" />

                  {/* Corner brackets */}
                  <div className="absolute top-5 left-5 w-8 h-8 border-t border-l border-white/25" />
                  <div className="absolute top-5 right-5 w-8 h-8 border-t border-r border-white/25" />
                  <div className="absolute bottom-5 left-5 w-8 h-8 border-b border-l border-white/25" />
                  <div className="absolute bottom-5 right-5 w-8 h-8 border-b border-r border-white/25" />

                  <div className="relative z-10 min-h-[560px] lg:min-h-[690px] grid grid-cols-1 lg:grid-cols-2">
                    {/* Left information */}
                    <div className="flex flex-col justify-center px-8 sm:px-14 lg:px-20 py-16 lg:py-20">
                      <div className="flex items-center gap-5 mb-16">
                        <div className="w-14 h-14 border border-indigo-500/30 bg-indigo-500/[0.04] flex items-center justify-center">
                          <IconComp className="w-6 h-6 text-indigo-300" />
                        </div>

                        <div className="font-mono uppercase tracking-[0.16em]">
                          <div className="text-[10px] text-zinc-500 mb-1">METRIC {lens.id}</div>
                          <div className="text-[11px] text-indigo-300">ACTIVE</div>
                        </div>
                      </div>

                      <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-zinc-500 mb-5">
                        {lens.badge}
                      </div>

                      <h3
                        className="text-4xl sm:text-5xl lg:text-[4.2rem] font-light tracking-[-0.045em] leading-none text-white mb-8"
                        style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif", fontWeight: 300 }}
                      >
                        {lens.title}
                      </h3>

                      <p className="max-w-xl text-base sm:text-lg text-zinc-400 font-light leading-[1.8]">
                        {lens.description}
                      </p>

                      <div className="mt-12 flex items-center gap-5">
                        <span className="w-8 h-px bg-indigo-400/60" />
                        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-zinc-500">
                          SIGNAL // {lens.telemetry}
                        </span>
                      </div>
                    </div>

                    {/* Right visual — CSS-only abstract 3D orb */}
                    <div className="relative min-h-[390px] lg:min-h-full overflow-hidden flex items-center justify-center isolate border-l border-white/[0.06]">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.025),transparent_45%)]" />

                      {/* Orbit rings */}
                      <div
                        className="absolute w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] lg:w-[440px] lg:h-[440px] rounded-full border border-white/20 rotate-[25deg] group-hover:rotate-[38deg] transition-transform duration-[1800ms]"
                        style={{ boxShadow: "0 0 50px rgba(105,80,180,0.08)" }}
                      />
                      <div
                        className="absolute w-[240px] h-[370px] sm:w-[290px] sm:h-[450px] lg:w-[350px] lg:h-[520px] rounded-[50%] border border-indigo-300/25 rotate-[-32deg] group-hover:rotate-[-45deg] transition-transform duration-[1800ms]"
                      />
                      <div
                        className="absolute w-[360px] h-[205px] sm:w-[450px] sm:h-[260px] lg:w-[560px] lg:h-[320px] rounded-[50%] border border-fuchsia-300/20 rotate-[22deg] group-hover:rotate-[12deg] transition-transform duration-[1800ms]"
                      />
                      <div
                        className="absolute w-[290px] h-[290px] sm:w-[360px] sm:h-[360px] lg:w-[420px] lg:h-[420px] rounded-full border border-white/10 rotate-[-18deg] group-hover:rotate-[-5deg] transition-transform duration-[1800ms]"
                      />

                      {/* Glass sphere */}
                      <div className="relative w-32 h-32 sm:w-44 sm:h-44 lg:w-52 lg:h-52 rounded-full bg-[radial-gradient(circle_at_32%_25%,rgba(255,255,255,0.38),rgba(255,255,255,0.07)_14%,rgba(65,48,110,0.20)_42%,rgba(0,0,0,0.92)_72%)] border border-white/25 shadow-[inset_-20px_-25px_60px_rgba(0,0,0,0.9),inset_15px_15px_35px_rgba(255,255,255,0.12),0_0_80px_rgba(114,72,190,0.18)] group-hover:scale-105 transition-transform duration-1000">
                        <div className="absolute inset-[14%] rounded-full border border-white/10" />
                        <div className="absolute inset-[27%] rounded-full border border-indigo-300/20" />
                        <div className="absolute top-[18%] left-[23%] w-5 h-5 rounded-full bg-white/30 blur-[5px]" />
                        <div className="absolute inset-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.9)]" />
                      </div>

                      {/* HUD crosshair */}
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 sm:w-72 sm:h-72 border border-white/[0.08] rounded-full">
                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/[0.08]" />
                        <div className="absolute top-1/2 left-0 right-0 h-px bg-white/[0.08]" />
                      </div>

                      {/* Telemetry box */}
                      <div className="absolute bottom-7 right-7 sm:bottom-10 sm:right-10 border border-white/10 bg-black/60 backdrop-blur-md px-5 py-4 font-mono text-[9px] uppercase tracking-[0.14em]">
                        <div className="text-zinc-500">{lens.badge}</div>
                        <div className="text-zinc-400 mt-2">CALCULATING ROI...</div>
                        <div className="text-indigo-300 mt-1">{lens.telemetry}</div>
                      </div>

                      <div className="absolute top-7 right-7 sm:top-10 sm:right-10 text-[9px] font-mono text-zinc-500 tracking-[0.18em]">
                        GRID.LOCK // 0{index + 1}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ===================== SECTION 02: HOW IT WORKS ===================== */}
        <section
          id="how-it-works"
          className="relative w-full overflow-hidden border-t border-white/[0.06] py-32 sm:py-40"
        >
          {/* Ambient glow behind the flow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/2 top-[28%] -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-indigo-600/[0.07] blur-[150px]" />
            <div className="absolute left-[28%] top-[52%] w-[700px] h-[700px] rounded-full bg-fuchsia-600/[0.055] blur-[150px]" />
            <div className="absolute right-[20%] top-[72%] w-[600px] h-[600px] rounded-full bg-rose-600/[0.045] blur-[140px]" />
          </div>

          {/* Section heading — large editorial treatment like the reference */}
          <div className="relative z-10 max-w-[1500px] mx-auto px-6 sm:px-10 lg:px-16 mb-28 sm:mb-36">
            <div className="max-w-5xl mx-auto text-center">
              <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full border border-indigo-400/20 bg-indigo-500/[0.045] shadow-[0_0_30px_rgba(99,102,241,0.12)] text-[10px] font-mono tracking-[0.24em] uppercase text-indigo-200/80 mb-14">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.9)]" />
                <span>HOW IT WORKS</span>
              </div>

              <h2 className="font-black tracking-[-0.055em] leading-[0.88] text-white text-[2.5rem] sm:text-[3.2rem] md:text-[4rem] lg:text-[5rem]">
                <span className="block">From signal</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400">
                  to understanding.
                </span>
              </h2>
            </div>
          </div>
          {/* ===================== PHASE CARDS ===================== */}
          <div className="relative z-10 w-full max-w-[1500px] mx-auto px-5 sm:px-8 lg:px-10">

            {/* SVG flow line */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
              viewBox="0 0 1200 1800"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="prismFlowGradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="100%"
                >
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="48%" stopColor="#a78bfa" />
                  <stop offset="100%" stopColor="#fb7185" />
                </linearGradient>

                <filter
                  id="prismFlowGlow"
                  x="-30%"
                  y="-30%"
                  width="160%"
                  height="160%"
                >
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <path
                d="
        M 610 0
        C 605 120, 730 145, 835 255
        C 930 355, 900 455, 690 570
        C 500 675, 440 780, 575 900
        C 690 1005, 845 1055, 820 1175
        C 795 1300, 605 1385, 610 1510
        C 615 1630, 710 1710, 720 1800
      "
                fill="none"
                stroke="url(#prismFlowGradient)"
                strokeWidth="3"
                strokeLinecap="round"
                filter="url(#prismFlowGlow)"
                opacity="0.95"
              />

              <path
                d="
        M 610 0
        C 605 120, 730 145, 835 255
        C 930 355, 900 455, 690 570
        C 500 675, 440 780, 575 900
        C 690 1005, 845 1055, 820 1175
        C 795 1300, 605 1385, 610 1510
        C 615 1630, 710 1710, 720 1800
      "
                fill="none"
                stroke="rgba(255,255,255,0.14)"
                strokeWidth="1"
                strokeDasharray="9 12"
                strokeLinecap="round"
              />

            </svg>


            {/* ========================================================= */}
            {/* PHASE 01 — CARD RIGHT / DIAMOND OUTSIDE LEFT             */}
            {/* ========================================================= */}

            <div className="relative min-h-[560px] sm:min-h-[620px] lg:min-h-[680px] flex items-center justify-end">

              {/* Diamond OUTSIDE card */}
              <div className="absolute left-[43%] top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 hidden lg:block">

                {/* connector extends RIGHT from the diamond toward the card */}
                <div className="absolute top-1/2 left-full w-24 h-px bg-indigo-300/40" />

                {/* diamond */}
                <div
                  className="
          relative
          w-14 h-14
          rotate-45
          border border-indigo-300/50
          bg-[#090712]/95
          shadow-[0_0_35px_rgba(99,102,241,0.35)]
        "
                >
                  <div
                    className="
            absolute
            left-1/2 top-1/2
            -translate-x-1/2
            -translate-y-1/2
            w-4 h-4
            -rotate-45
            bg-gradient-to-br
            from-indigo-400
            to-blue-500
            shadow-[0_0_25px_rgba(99,102,241,0.95)]
          "
                  />
                </div>
              </div>


              {/* CARD */}
              <article
                className="
        relative
        w-full lg:w-[53%]
        min-h-[390px] sm:min-h-[420px]
        lg:min-h-[420px]
        p-8 sm:p-10 lg:p-14
        rounded-[24px]
        border border-indigo-400/25
        bg-[linear-gradient(120deg,rgba(55,35,70,0.28),rgba(5,5,8,0.88)_60%)]
        backdrop-blur-xl
        shadow-[0_0_80px_rgba(93,57,132,0.12)]
      "
              >
                {/* corners */}
                <div className="absolute top-4 left-4 w-7 h-7 border-t border-l border-white/25" />
                <div className="absolute top-4 right-4 w-7 h-7 border-t border-r border-white/25" />
                <div className="absolute bottom-4 left-4 w-7 h-7 border-b border-l border-white/25" />
                <div className="absolute bottom-4 right-4 w-7 h-7 border-b border-r border-white/25" />

                <div className="flex items-center gap-4 mb-8">
                  <span className="px-3 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 text-white text-[10px] font-mono font-bold tracking-[0.12em]">
                    PHASE.01
                  </span>

                  <span className="h-px flex-1 bg-white/10" />
                </div>

                <h3 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-bold tracking-[-0.045em] text-white mb-7">
                  Gather every signal
                </h3>

                <p className="text-base sm:text-lg lg:text-xl text-zinc-300/90 font-light leading-[1.8] max-w-2xl">
                  Peer reviews, self-assessments, manager observations, learning progress,
                  and wellbeing data — all in one place, weighted and calibrated.
                </p>
              </article>
            </div>


            {/* ========================================================= */}
            {/* PHASE 02 — CARD LEFT / DIAMOND OUTSIDE RIGHT             */}
            {/* ========================================================= */}

            <div className="relative min-h-[560px] sm:min-h-[620px] lg:min-h-[680px] flex items-center justify-start">

              {/* Diamond OUTSIDE RIGHT */}
              <div className="absolute right-[43%] top-1/2 translate-x-1/2 -translate-y-1/2 z-30 hidden lg:block">

                {/* connector extends LEFT from the diamond toward the card */}
                <div className="absolute top-1/2 right-full w-24 h-px bg-purple-300/40" />

                {/* diamond */}
                <div
                  className="
          relative
          w-14 h-14
          rotate-45
          border border-indigo-300/50
          bg-[#090712]/95
          shadow-[0_0_35px_rgba(139,92,246,0.40)]
        "
                >
                  <div
                    className="
            absolute
            left-1/2 top-1/2
            -translate-x-1/2
            -translate-y-1/2
            w-4 h-4
            -rotate-45
            bg-gradient-to-br
            from-indigo-400
            to-purple-500
            shadow-[0_0_25px_rgba(139,92,246,0.95)]
          "
                  />
                </div>
              </div>


              {/* CARD */}
              <article
                className="
        relative
        w-full lg:w-[53%]
        min-h-[390px] sm:min-h-[420px]
        lg:min-h-[420px]
        p-8 sm:p-10 lg:p-14
        rounded-[24px]
        border border-purple-400/25
        bg-[linear-gradient(240deg,rgba(44,29,67,0.24),rgba(5,5,8,0.9)_62%)]
        backdrop-blur-xl
        shadow-[0_0_80px_rgba(99,55,145,0.12)]
      "
              >
                {/* corners */}
                <div className="absolute top-4 left-4 w-7 h-7 border-t border-l border-white/25" />
                <div className="absolute top-4 right-4 w-7 h-7 border-t border-r border-white/25" />
                <div className="absolute bottom-4 left-4 w-7 h-7 border-b border-l border-white/25" />
                <div className="absolute bottom-4 right-4 w-7 h-7 border-b border-r border-white/25" />

                <div className="flex items-center gap-4 mb-8">
                  <span className="h-px flex-1 bg-white/10" />

                  <span className="px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white text-[10px] font-mono font-bold tracking-[0.12em]">
                    PHASE.02
                  </span>
                </div>

                <h3 className="text-center text-3xl sm:text-4xl lg:text-[2.65rem] font-bold tracking-[-0.045em] text-white mb-7">
                  See the full picture
                </h3>

                <p className="text-center text-base sm:text-lg lg:text-xl text-zinc-300/90 font-light leading-[1.8] max-w-2xl mx-auto">
                  Prism connects individual trajectories to team outcomes. Spot the people
                  who are quietly growing, and the ones who need support before they disengage.
                </p>
              </article>
            </div>


            {/* ========================================================= */}
            {/* PHASE 03 — CARD RIGHT / DIAMOND OUTSIDE LEFT             */}
            {/* ========================================================= */}

            <div className="relative min-h-[560px] sm:min-h-[620px] lg:min-h-[680px] flex items-center justify-end">

              {/* Diamond OUTSIDE LEFT */}
              <div className="absolute left-[43%] top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 hidden lg:block">

                {/* connector extends RIGHT from the diamond toward the card */}
                <div className="absolute top-1/2 left-full w-24 h-px bg-rose-300/40" />

                {/* diamond */}
                <div
                  className="
          relative
          w-14 h-14
          rotate-45
          border border-rose-300/50
          bg-[#10070b]/95
          shadow-[0_0_40px_rgba(244,63,94,0.40)]
        "
                >
                  <div
                    className="
            absolute
            left-1/2 top-1/2
            -translate-x-1/2
            -translate-y-1/2
            w-4 h-4
            -rotate-45
            bg-gradient-to-br
            from-purple-500
            to-rose-500
            shadow-[0_0_28px_rgba(244,63,94,1)]
          "
                  />
                </div>
              </div>


              {/* CARD */}
              <article
                className="
        relative
        w-full lg:w-[53%]
        min-h-[390px] sm:min-h-[420px]
        lg:min-h-[420px]
        p-8 sm:p-10 lg:p-14
        rounded-[24px]
        border border-rose-400/25
        bg-[linear-gradient(120deg,rgba(74,31,52,0.25),rgba(5,5,8,0.9)_62%)]
        backdrop-blur-xl
        shadow-[0_0_90px_rgba(167,48,91,0.12)]
      "
              >
                {/* corners */}
                <div className="absolute top-4 left-4 w-7 h-7 border-t border-l border-white/25" />
                <div className="absolute top-4 right-4 w-7 h-7 border-t border-r border-white/25" />
                <div className="absolute bottom-4 left-4 w-7 h-7 border-b border-l border-white/25" />
                <div className="absolute bottom-4 right-4 w-7 h-7 border-b border-r border-white/25" />

                <div className="flex items-center gap-4 mb-8">
                  <span className="px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-rose-500 text-white text-[10px] font-mono font-bold tracking-[0.12em]">
                    PHASE.03
                  </span>

                  <span className="h-px flex-1 bg-white/10" />
                </div>

                <h3 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-bold tracking-[-0.045em] text-white mb-7">
                  Act with confidence
                </h3>

                <p className="text-base sm:text-lg lg:text-xl text-zinc-300/90 font-light leading-[1.8] max-w-2xl">
                  Decisions backed by evidence, not gut feel. Promote the right people.
                  Have the right conversations. Before it's too late to matter.
                </p>
              </article>
            </div>

          </div>
        </section>

        {/* ===================== SECTION 03: PLATFORM CTA ===================== */}
        <section id="cta" className="w-full max-w-7xl mx-auto px-6 md:px-12 py-28">
          <div className="group relative w-full aspect-auto md:aspect-[21/9] flex flex-col items-center justify-center p-10 sm:p-20 overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-[#0a0a0f] to-[#020204] shadow-[0_0_100px_-20px_rgba(99,102,241,0.2)] text-center">
            {/* 2D Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-50 pointer-events-none" />

            {/* Animated Laser Scanning Line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent blur-[1px] animate-scan shadow-[0_0_20px_rgba(99,102,241,0.8)] pointer-events-none" />

            {/* Corner Wireframe Accents */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-indigo-500/50 group-hover:border-white transition-colors duration-700" />
            <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-indigo-500/50 group-hover:border-white transition-colors duration-700" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-indigo-500/50 group-hover:border-white transition-colors duration-700" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-indigo-500/50 group-hover:border-white transition-colors duration-700" />

            <div className="relative z-10 flex flex-col items-center max-w-3xl mx-auto space-y-6">
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-light tracking-tight text-white leading-tight">
                See your people <span className="italic font-serif text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white">clearly.</span>
              </h2>
              <p className="text-base sm:text-xl text-zinc-300 font-light max-w-2xl leading-relaxed">
                Every person on your team contains more than a score. Prism helps you understand what that means — and act on it.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => {
                    if (isAuthenticated) {
                      setActiveTab('spectrum');
                    } else {
                      switchDemoRole('ceo');
                      setActiveTab('spectrum');
                    }
                  }}
                  className="group relative px-10 py-5 bg-white text-black font-bold text-xs tracking-widest uppercase rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.05] active:scale-[0.98] shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] flex items-center gap-3"
                >
                  <Hexagon className="w-4 h-4 text-indigo-600 group-hover:text-black transition-colors" />
                  <span>Request a Demo</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ===================== TECHNICAL FOOTER & WATERMARK ===================== */}
        <footer className="w-full bg-[#010101] border-t border-white/10 pt-24 pb-12 overflow-hidden relative">
          <div className="w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-start mb-24 gap-16 relative z-10">
            {/* Brand Column */}
            <div className="flex flex-col gap-6 max-w-md">
              <div className="flex items-center gap-3">
                <Hexagon className="w-7 h-7 text-white stroke-[1.5]" />
                <span className="text-xl font-light tracking-[0.35em] text-white uppercase">PRISM</span>
              </div>
              <p className="text-sm text-zinc-400 font-light leading-relaxed">
                Every person on your team contains more than their job title. Prism helps you see the whole picture — and act on it.
              </p>
              <div className="flex items-center gap-3 mt-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse" />
                <span className="text-[10px] font-mono tracking-widest text-zinc-300 uppercase">SYS.PRISM.CORE // Online</span>
              </div>
            </div>

            {/* Navigation Directory Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 sm:gap-16 w-full md:w-auto">
              <div className="flex flex-col gap-4 text-sm font-light">
                <span className="text-zinc-500 uppercase tracking-[0.2em] text-[10px] font-mono mb-1">Platform</span>
                <button onClick={() => scrollToSection('lenses')} className="text-zinc-400 hover:text-white transition-colors text-left">Intelligence</button>
                <button onClick={() => scrollToSection('how-it-works')} className="text-zinc-400 hover:text-white transition-colors text-left">Forecasting</button>
                <button onClick={() => scrollToSection('how-it-works')} className="text-zinc-400 hover:text-white transition-colors text-left">Feedback</button>
                <button onClick={() => setActiveTab('sanctum')} className="text-zinc-400 hover:text-white transition-colors text-left">Sanctum</button>
              </div>

              <div className="flex flex-col gap-4 text-sm font-light">
                <span className="text-zinc-500 uppercase tracking-[0.2em] text-[10px] font-mono mb-1">Company</span>
                <span className="text-zinc-400 hover:text-white transition-colors cursor-pointer">About</span>
                <span className="text-zinc-400 hover:text-white transition-colors cursor-pointer">Careers</span>
                <span className="text-zinc-400 hover:text-white transition-colors cursor-pointer">Customer Stories</span>
                <span className="text-zinc-400 hover:text-white transition-colors cursor-pointer">Security</span>
              </div>

              <div className="flex flex-col gap-4 text-sm font-light">
                <span className="text-zinc-500 uppercase tracking-[0.2em] text-[10px] font-mono mb-1">Resources</span>
                <span className="text-zinc-400 hover:text-white transition-colors cursor-pointer">Documentation</span>
                <span className="text-zinc-400 hover:text-white transition-colors cursor-pointer">Help Center</span>
                <span className="text-zinc-400 hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
                <span className="text-zinc-400 hover:text-white transition-colors cursor-pointer">Terms of Service</span>
              </div>
            </div>
          </div>

          {/* Giant PRISM Watermark */}
          <div className="relative w-full flex justify-center mb-12 select-none overflow-hidden pointer-events-none">
            <span
              className="text-[18vw] sm:text-[17vw] md:text-[16vw] lg:text-[15vw] font-black tracking-[-0.085em] leading-[0.78] text-transparent bg-clip-text bg-gradient-to-b from-white/[0.80] via-white/[0.42] to-white/[0.04]"
              style={{
                fontFamily: '"Arial Black", "Helvetica Neue", Arial, sans-serif',
                WebkitTextStroke: '1px rgba(255,255,255,0.035)',
              }}
            >
              PRISM
            </span>
          </div>

          {/* Technical Bottom Row */}
          <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col sm:flex-row items-center justify-between text-[10px] text-zinc-500 tracking-[0.2em] font-mono uppercase border-t border-white/10 pt-8 relative z-10">
            <span>IDENTIFIER: PRISM.HR.2026.V2.0</span>
            <span className="mt-3 sm:mt-0">© 2026 PRISM INC. ALL RIGHTS RESERVED.</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;
