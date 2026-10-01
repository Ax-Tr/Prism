import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

const SPECTRA = [
  { color: '#C8001A', dark: '#ff4433', label: 'Output' },
  { color: '#D55000', dark: '#ff7733', label: 'Risk' },
  { color: '#B88000', dark: '#ffcc22', label: 'Return' },
  { color: '#006835', dark: '#00dd77', label: 'Growth' },
  { color: '#005878', dark: '#00bbee', label: 'Presence' },
  { color: '#3C0882', dark: '#9944ff', label: 'Wellbeing' },
];

const PATHS = [
  'M 8,12   Q 22,38  18,72  Q 16,85  20,94',
  'M 30,5   Q 38,35  36,65  Q 34,80  38,96',
  'M 50,8   Q 52,42  54,68  Q 55,82  52,96',
  'M 68,6   Q 64,38  66,62  Q 67,80  65,95',
  'M 85,10  Q 80,40  82,65  Q 83,82  80,95',
  'M 12,30  Q 50,48  88,30',
];

const POSITIONS = [
  { left: '3%', top: '38%' },
  { left: '23%', top: '8%' },
  { left: '44%', top: '6%' },
  { left: '62%', top: '8%' },
  { left: '79%', top: '38%' },
  { left: '3%', top: '52%' },
];

const SHARDS = [
  { clip: 'polygon(0% 0%, 32% 0%, 26% 32%, 0% 36%)', drift: { x: -90, y: -70, r: -7 } },
  { clip: 'polygon(32% 0%, 66% 0%, 58% 34%, 26% 32%)', drift: { x: -10, y: -90, r: 3 } },
  { clip: 'polygon(66% 0%, 100% 0%, 100% 30%, 58% 34%)', drift: { x: 100, y: -65, r: 8 } },
  { clip: 'polygon(0% 36%, 26% 32%, 34% 56%, 0% 62%)', drift: { x: -110, y: 15, r: -10 } },
  { clip: 'polygon(26% 32%, 58% 34%, 62% 58%, 34% 56%)', drift: { x: 0, y: -20, r: 5 } },
  { clip: 'polygon(58% 34%, 100% 30%, 100% 60%, 62% 58%)', drift: { x: 115, y: 25, r: 9 } },
  { clip: 'polygon(0% 62%, 34% 56%, 62% 58%, 100% 60%, 100% 100%, 0% 100%)', drift: { x: 10, y: 100, r: -4 } },
];

export const EnterApp: React.FC<{ onFinish?: () => void }> = ({ onFinish }) => {
  const { currentUser } = useAuth();
  const { setActiveTab, setSelectedEmployeeProfile } = useApp();
  const [phase, setPhase] = useState<'white' | 'name' | 'cracking' | 'drifting' | 'dissolve' | 'out'>('white');
  const [activeBeams, setActiveBeams] = useState<boolean[]>(Array(6).fill(false));
  const isMounted = useRef(true);

  const fullName = currentUser?.name || 'Arjun Sharma';
  const firstName = fullName.split(' ')[0] || fullName;
  const lastName = fullName.split(' ').slice(1).join(' ') || '';

  useEffect(() => {
    isMounted.current = true;

    const timers = [
      setTimeout(() => isMounted.current && setPhase('name'), 340),
      setTimeout(() => isMounted.current && setPhase('cracking'), 1445),
      setTimeout(() => isMounted.current && setPhase('drifting'), 3230),
      setTimeout(() => isMounted.current && setPhase('dissolve'), 4165),
      setTimeout(() => isMounted.current && setPhase('out'), 4760),
    ];

    SPECTRA.forEach((_, idx) => {
      timers.push(
        setTimeout(() => {
          if (isMounted.current) {
            setActiveBeams(prev => {
              const updated = [...prev];
              updated[idx] = true;
              return updated;
            });
          }
        }, 1445 + idx * 300)
      );
    });

    const handleFinish = () => {
      if (onFinish) {
        onFinish();
      } else {
        const role = (currentUser?.role || '').toLowerCase();
        if (role === 'employee') {
          setActiveTab('employee_detail');
        } else if (role === 'manager') {
          setActiveTab('team');
        } else if (role === 'dept_head') {
          setActiveTab('kpis');
        } else {
          setActiveTab('spectrum');
        }
      }
    };

    const completionTimer = setTimeout(() => {
      if (isMounted.current) {
        handleFinish();
      }
    }, 5270);

    timers.push(completionTimer);

    return () => {
      isMounted.current = false;
      timers.forEach(clearTimeout);
    };
  }, [currentUser, setActiveTab, onFinish]);

  const showName = ['name', 'cracking', 'drifting'].includes(phase);
  const showRays = ['cracking', 'drifting'].includes(phase);
  const isDrifting = phase === 'drifting';

  const skipNow = () => {
    const role = (currentUser?.role || '').toLowerCase();
    if (onFinish) onFinish();
    else if (role === 'employee') setActiveTab('employee_detail');
    else if (role === 'manager') setActiveTab('team');
    else if (role === 'dept_head') setActiveTab('kpis');
    else setActiveTab('spectrum');
  };

  return (
    <div
      onClick={skipNow}
      title="Click to enter workspace"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: '#f4f2ed',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: phase === 'dissolve' ? 'background 0.9s ease' : 'none',
      }}
    >
      <div className="absolute top-8 right-8 z-30 font-mono text-[10px] tracking-[0.2em] uppercase text-zinc-400/80 hover:text-zinc-600 transition-colors">
        Skip →
      </div>
      {showName && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          {/* Sharded polygon pieces that drift on refraction */}
          {SHARDS.map((shard, idx) => (
            <motion.div
              key={idx}
              animate={
                isDrifting
                  ? { x: shard.drift.x, y: shard.drift.y, rotate: shard.drift.r, opacity: 0 }
                  : { x: 0, y: 0, rotate: 0, opacity: 1 }
              }
              transition={
                isDrifting
                  ? {
                      duration: 1.5,
                      delay: idx * 0.07,
                      ease: [0.16, 1, 0.3, 1],
                      opacity: { duration: 0.8, delay: 0.4 + idx * 0.07 },
                    }
                  : {}
              }
              style={{
                position: 'absolute',
                inset: 0,
                clipPath: shard.clip,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                gap: 0,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
                <span
                  style={{
                    fontFamily: '"Playfair Display", Georgia, serif',
                    fontWeight: 300,
                    fontSize: 'clamp(72px, 13vw, 160px)',
                    color: 'rgba(28,26,22,0.85)',
                    letterSpacing: '-0.02em',
                    display: 'block',
                    userSelect: 'none',
                  }}
                >
                  {firstName}
                </span>
                {lastName && (
                  <span
                    style={{
                      fontFamily: '"Playfair Display", Georgia, serif',
                      fontStyle: 'italic',
                      fontWeight: 300,
                      fontSize: 'clamp(72px, 13vw, 160px)',
                      color: 'rgba(28,26,22,0.45)',
                      letterSpacing: '-0.02em',
                      display: 'block',
                      userSelect: 'none',
                    }}
                  >
                    {lastName}
                  </span>
                )}
              </div>
            </motion.div>
          ))}

          {/* Glowing Refracted Spectral Light Beams */}
          {showRays && (
            <svg
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 20,
              }}
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <defs>
                {SPECTRA.map((s, idx) => (
                  <filter key={idx} id={`glow${idx}`} x="-100%" y="-100%" width="300%" height="300%">
                    <feGaussianBlur stdDeviation="0.8" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                ))}
              </defs>
              {PATHS.map((pathD, idx) => (
                <motion.path
                  key={idx}
                  d={pathD}
                  fill="none"
                  stroke={SPECTRA[idx].color}
                  strokeWidth="0.3"
                  strokeLinecap="round"
                  filter={`url(#glow${idx})`}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={activeBeams[idx] ? { pathLength: 1, opacity: 0.95 } : { pathLength: 0, opacity: 0 }}
                  transition={{ pathLength: { duration: 0.7, ease: [0.4, 0, 0.2, 1] }, opacity: { duration: 0.15 } }}
                />
              ))}
            </svg>
          )}

          {/* Spectral Domain Labels (Output, Risk, Return, Growth, Presence, Wellbeing) */}
          {showRays &&
            SPECTRA.map((spectrum, idx) =>
              activeBeams[idx] ? (
                <motion.p
                  key={idx}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 0.6, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  style={{
                    position: 'absolute',
                    ...POSITIONS[idx],
                    fontFamily: 'monospace',
                    fontSize: 'clamp(8px, 0.75vw, 11px)',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: spectrum.color,
                    pointerEvents: 'none',
                    zIndex: 25,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {spectrum.label}
                </motion.p>
              ) : null
            )}
        </motion.div>
      )}
    </div>
  );
};

export default EnterApp;
