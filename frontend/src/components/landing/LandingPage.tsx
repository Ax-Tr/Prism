import React, { useState } from 'react';
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

  const lenses = [
    {
      id: '01',
      title: '360° Intelligence',
      badge: 'EVAL.MATRIX // 360',
      tagline: 'Multi-directional feedback synthesized with zero bias',
      description: 'Aggregates peer, manager, and self-evaluations into an unbiased multidimensional matrix. Removes recency bias and highlights hidden team catalysts.',
      telemetry: '94.2% CONSENSUS',
      icon: Users,
      color: 'from-sky-500 to-indigo-500',
      image: 'https://images.unsplash.com/photo-1770031079091-c6356e82ea9b?q=80&w=1080&auto=format&fit=crop'
    },
    {
      id: '02',
      title: 'Predictive Revenue',
      badge: 'REV.MODEL // A4F2C1',
      tagline: 'Direct performance trajectory revenue attribution',
      description: 'Maps individual engineering and operational velocity directly to enterprise revenue projections, deal milestones, and delivery risk assessments.',
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
      description: 'Frequent real-time proof submissions and checkpoint approvals ensure performance evaluations reflect actual verifiable daily execution.',
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
      description: 'Consolidated leadership command center across OKR milestones, review cycles, continuity matrices, and automated exception detection.',
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
    <div className="min-h-screen bg-[#010101] text-zinc-100 selection:bg-indigo-500/30 selection:text-white font-sans antialiased overflow-x-hidden relative">
      {/* Background Decorative Grids, Noise & Vignette */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Ambient Colored Blobs */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.12)_0%,rgba(168,85,247,0.06)_40%,transparent_70%)] blur-[100px]" />
        <div className="absolute top-[30%] -left-[200px] w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.08)_0%,transparent_60%)] blur-[120px]" />
        <div className="absolute top-[60%] -right-[200px] w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.08)_0%,transparent_60%)] blur-[120px]" />
        
        {/* Subtle 12-Column Grid Lines */}
        <div className="w-full h-full grid grid-cols-4 md:grid-cols-12 gap-4 px-6 md:px-12 lg:px-24 opacity-[0.03]">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-full border-l border-white" />
          ))}
        </div>
        
        {/* Radial Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(1,1,1,0.85)_100%)]" />
      </div>

      {/* Top Standalone Transparent Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 lg:px-20 py-5 bg-[#010101]/60 backdrop-blur-md border-b border-white/10">
        {/* Brand Logo */}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <Hexagon className="w-6 h-6 text-white stroke-[1.5] group-hover:text-indigo-400 transition-colors" />
          <span className="text-xl font-light tracking-[0.35em] text-white uppercase">PRISM</span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-mono tracking-widest text-zinc-400 uppercase">
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
            className="text-xs font-mono tracking-widest text-zinc-300 hover:text-white uppercase transition-colors px-3 py-2"
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
            className="group relative px-5 py-2.5 rounded-full bg-white text-black font-mono text-xs uppercase tracking-widest hover:bg-zinc-200 transition-all font-bold shadow-[0_0_20px_rgba(255,255,255,0.15)] flex items-center gap-1.5"
          >
            <span>Request Demo</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="relative z-10 pt-36 sm:pt-44 flex flex-col items-center">
        {/* ===================== HERO SECTION ===================== */}
        <section className="w-full max-w-7xl mx-auto px-6 md:px-12 flex flex-col items-center text-center pb-28">
          {/* Eyebrow Pill */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-300 mb-10 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
            <span>EVERY PERSON. EVERY DIMENSION.</span>
          </div>

          {/* Headline: People, understood. */}
          <h1 className="text-6xl sm:text-8xl md:text-9xl lg:text-[10.5rem] font-light tracking-tight text-white leading-[0.88] select-none">
            <span className="block font-sans font-light">People,</span>
            <span className="block font-sans italic font-normal text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-zinc-400">
              understood.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-10 text-base sm:text-xl text-zinc-400 max-w-2xl mx-auto font-light leading-relaxed">
            Your team carries more than their job titles. Prism brings together every signal — reviews, growth, wellbeing, output — so you can see each person whole, and lead accordingly.
          </p>

          {/* CTA Button Group */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5 w-full max-w-md">
            <button
              onClick={() => {
                if (isAuthenticated) {
                  setActiveTab('spectrum');
                } else {
                  switchDemoRole('ceo');
                  setActiveTab('spectrum');
                }
              }}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-black font-extrabold text-xs uppercase tracking-widest hover:bg-zinc-200 hover:scale-105 active:scale-95 transition-all shadow-[0_0_30px_rgba(255,255,255,0.25)] flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/20 text-white font-mono text-xs uppercase tracking-widest backdrop-blur-xl transition-all flex items-center justify-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-white text-white" />
              <span>See how it works</span>
            </button>
          </div>
        </section>

        {/* ===================== SECTION 01: FOUR LENSES ===================== */}
        <section id="lenses" className="w-full max-w-7xl mx-auto px-6 md:px-12 py-28 border-t border-white/10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="space-y-3">
              <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-500 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                <span>FOUR WAYS TO SEE MORE CLEARLY</span>
              </div>
              <h2 className="text-4xl sm:text-6xl font-light tracking-tight text-white">
                The shape of <span className="italic font-serif text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white">your team.</span>
              </h2>
            </div>
            <p className="text-zinc-400 text-sm sm:text-base max-w-md font-light leading-relaxed">
              Prism breaks performance down into four lenses. Each one reveals something the others miss.
            </p>
          </div>

          {/* Full Width Sticky Interactive Lens Cards */}
          <div className="flex flex-col gap-6">
            {lenses.map((lens, index) => {
              const IconComp = lens.icon;
              return (
                <div
                  key={lens.id}
                  onClick={() => setActiveLens(index)}
                  className={`group relative w-full rounded-3xl p-8 sm:p-12 border transition-all duration-500 cursor-pointer overflow-hidden backdrop-blur-2xl ${
                    activeLens === index
                      ? 'bg-gradient-to-br from-[#0c0f1d] to-[#04060c] border-indigo-500/40 shadow-[0_0_50px_-10px_rgba(99,102,241,0.2)]'
                      : 'bg-[#06080e]/80 border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Corner Accent Brackets */}
                  <div className="absolute top-4 left-4 w-3 h-3 border-t border-l border-white/20 group-hover:border-white/60 transition-colors" />
                  <div className="absolute top-4 right-4 w-3 h-3 border-t border-r border-white/20 group-hover:border-white/60 transition-colors" />
                  <div className="absolute bottom-4 left-4 w-3 h-3 border-b border-l border-white/20 group-hover:border-white/60 transition-colors" />
                  <div className="absolute bottom-4 right-4 w-3 h-3 border-b border-r border-white/20 group-hover:border-white/60 transition-colors" />

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                    {/* Left Details */}
                    <div className="lg:col-span-7 space-y-6">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-indigo-400 font-bold tracking-widest">{lens.id} //</span>
                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-zinc-300">
                          {lens.badge}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <IconComp className="w-6 h-6 text-white" />
                          <h3 className="text-3xl sm:text-4xl font-light text-white tracking-tight">
                            {lens.title}
                          </h3>
                        </div>
                        <p className="text-xs font-mono uppercase tracking-wider text-indigo-300">
                          {lens.tagline}
                        </p>
                      </div>

                      <p className="text-sm sm:text-base text-zinc-400 font-light leading-relaxed max-w-xl">
                        {lens.description}
                      </p>

                      <div className="pt-2 flex items-center gap-4 text-xs font-mono">
                        <span className="text-zinc-500">TELEMETRY:</span>
                        <span className="text-emerald-400 font-bold tracking-widest">{lens.telemetry}</span>
                      </div>
                    </div>

                    {/* Right Visual Frame with HUD overlay */}
                    <div className="lg:col-span-5 relative rounded-2xl overflow-hidden aspect-[16/10] border border-white/15 bg-black/40 shadow-inner">
                      <img
                        src={lens.image}
                        alt={lens.title}
                        className="w-full h-full object-cover opacity-60 group-hover:scale-105 group-hover:opacity-80 transition-all duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                      
                      {/* Targeting HUD Overlay */}
                      <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
                        <div className="flex justify-between items-center text-[9px] font-mono text-zinc-400">
                          <div className="flex items-center gap-1.5">
                            <Crosshair className="w-3.5 h-3.5 text-indigo-400" />
                            <span>GRID.LOCK // 0{index + 1}</span>
                          </div>
                          <span className="text-emerald-400">ONLINE</span>
                        </div>
                        <div className="flex justify-between items-end">
                          <span className="text-[10px] font-mono text-zinc-300 bg-black/70 px-2.5 py-1 rounded border border-white/10">
                            SIGNAL STRENGTH: 99.8%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ===================== SECTION 02: HOW IT WORKS ===================== */}
        <section id="how-it-works" className="w-full max-w-7xl mx-auto px-6 md:px-12 py-28 border-t border-white/10">
          <div className="text-center mb-20 space-y-3">
            <div className="text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-500 flex items-center justify-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              <span>02 // HOW IT WORKS</span>
            </div>
            <h2 className="text-4xl sm:text-6xl font-light tracking-tight text-white">
              From signal to <span className="italic font-serif text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white">understanding.</span>
            </h2>
            <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto font-light leading-relaxed">
              A continuous loop of real inputs turned into clear direction.
            </p>
          </div>

          {/* Continuous 3-Phase Interactive Flow */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Phase 1 */}
            <div className="group p-8 sm:p-10 rounded-3xl bg-[#06080e] border border-white/10 hover:border-white/20 transition-all duration-300 space-y-6 relative">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-indigo-400 font-bold tracking-widest">PHASE.01</span>
                <span className="text-zinc-500">INPUT</span>
              </div>
              <h3 className="text-2xl font-light text-white tracking-tight">Gather every signal</h3>
              <p className="text-sm text-zinc-400 font-light leading-relaxed">
                Peer reviews, self-assessments, manager observations, learning progress, and wellbeing data — collected continuously without survey fatigue.
              </p>
              <div className="pt-4 border-t border-white/5 text-[10px] font-mono text-zinc-500">
                SOURCE: MULTI-DIRECTIONAL TELEMETRY
              </div>
            </div>

            {/* Phase 2 */}
            <div className="group p-8 sm:p-10 rounded-3xl bg-[#06080e] border border-white/10 hover:border-white/20 transition-all duration-300 space-y-6 relative">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-purple-400 font-bold tracking-widest">PHASE.02</span>
                <span className="text-zinc-500">PROCESSING</span>
              </div>
              <h3 className="text-2xl font-light text-white tracking-tight">See the full picture</h3>
              <p className="text-sm text-zinc-400 font-light leading-relaxed">
                Prism synthesizes noisy data into high-contrast execution vectors, spotting quiet top performers and disengagement risks.
              </p>
              <div className="pt-4 border-t border-white/5 text-[10px] font-mono text-zinc-500">
                CORE: LUMINARY AI COO ENGINE
              </div>
            </div>

            {/* Phase 3 */}
            <div className="group p-8 sm:p-10 rounded-3xl bg-[#06080e] border border-white/10 hover:border-white/20 transition-all duration-300 space-y-6 relative">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-emerald-400 font-bold tracking-widest">PHASE.03</span>
                <span className="text-zinc-500">OUTPUT</span>
              </div>
              <h3 className="text-2xl font-light text-white tracking-tight">Act with confidence</h3>
              <p className="text-sm text-zinc-400 font-light leading-relaxed">
                Decisions backed by evidence, not gut feel — from promotion calibration to 1:1 conversations and team design.
              </p>
              <div className="pt-4 border-t border-white/5 text-[10px] font-mono text-zinc-500">
                RESULT: MECHANICAL PERFORMANCE CLARITY
              </div>
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
            <span className="text-[18vw] font-bold tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white/10 to-transparent">
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
