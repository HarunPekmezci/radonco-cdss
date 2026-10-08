'use client';

import React, { memo } from 'react';

// 42 deterministic twinkling quantum points (avoids SSR hydration mismatches)
const PARTICLES = Array.from({ length: 42 }, (_, i) => {
  const pseudoRand = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const top = `${(pseudoRand(i * 1.37 + 1) * 96 + 2).toFixed(2)}%`;
  const left = `${(pseudoRand(i * 2.71 + 2) * 96 + 2).toFixed(2)}%`;
  const size = i % 3 === 0 ? 'w-1 h-1' : 'w-0.5 h-0.5';
  const duration = `${(2.2 + pseudoRand(i * 3.14 + 3) * 3.8).toFixed(1)}s`; // 2.2s to 6.0s
  const delay = `${(2.0 + pseudoRand(i * 4.67 + 4) * 4.0).toFixed(1)}s`; // 2.0s to 6.0s
  // Boosted peak opacities (0.85 to 1.0) for crisp, vivid cosmic sparkle
  const maxOpacity = (0.85 + pseudoRand(i * 5.89 + 5) * 0.15).toFixed(2);
  const color =
    i % 6 === 0
      ? 'bg-cyan-200 shadow-[0_0_8px_rgba(103,232,249,0.95)]'
      : i % 8 === 0
      ? 'bg-amber-200 shadow-[0_0_8px_rgba(252,211,77,0.95)]'
      : 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.9)]';

  return { id: i, top, left, size, duration, delay, maxOpacity, color };
});

interface ShootingStarBeam {
  id: number;
  top: string;
  left: string;
  delay: string;
  type: 'cyan' | 'amber';
}

// 11 continuous soft-gliding streams staggered every 1.8s across the top edge
const BEAMS: ShootingStarBeam[] = [
  { id: 1, top: '-40px', left: '95%', delay: '0s', type: 'cyan' },
  { id: 2, top: '-50px', left: '60%', delay: '1.8s', type: 'amber' },
  { id: 3, top: '-30px', left: '80%', delay: '3.6s', type: 'cyan' },
  { id: 4, top: '-60px', left: '40%', delay: '5.4s', type: 'cyan' },
  { id: 5, top: '-35px', left: '105%', delay: '7.2s', type: 'amber' },
  { id: 6, top: '-45px', left: '70%', delay: '9.0s', type: 'cyan' },
  { id: 7, top: '-25px', left: '25%', delay: '10.8s', type: 'cyan' },
  { id: 8, top: '-55px', left: '88%', delay: '12.6s', type: 'amber' },
  { id: 9, top: '-35px', left: '50%', delay: '14.4s', type: 'cyan' },
  { id: 10, top: '-40px', left: '15%', delay: '16.2s', type: 'cyan' },
  { id: 11, top: '-50px', left: '100%', delay: '18.0s', type: 'amber' },
];

export const ParticleBackground = memo(function ParticleBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden z-0 select-none"
    >
      <style>{`
        @keyframes scintillationPulse {
          0%, 100% {
            opacity: 0.25;
            transform: scale(0.85);
          }
          50% {
            opacity: var(--max-op, 0.95);
            transform: scale(1.4);
          }
        }

        /* 20s cycle where each star glides gracefully for 3.6s (18% of cycle) */
        @keyframes shootingStarFlight {
          0% {
            transform: translate3d(0, 0, 0);
            opacity: 0;
          }
          2.7% {
            /* 15% into flight: gentle flare-up */
            opacity: 0.9;
          }
          13.5% {
            /* 75% into flight: sustained soft glide */
            transform: translate3d(-640px, 640px, 0);
            opacity: 0.7;
          }
          18% {
            /* 100% of flight: gentle fade-out across 850px */
            transform: translate3d(-850px, 850px, 0);
            opacity: 0;
          }
          100% {
            transform: translate3d(-850px, 850px, 0);
            opacity: 0;
          }
        }

        .quantum-particle {
          will-change: opacity, transform;
        }

        .cosmic-beam {
          will-change: transform, opacity;
          animation-name: shootingStarFlight;
          animation-duration: 20s;
          animation-timing-function: cubic-bezier(0.25, 1, 0.5, 1);
          animation-iteration-count: infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .quantum-particle,
          .cosmic-beam {
            animation: none !important;
          }
          .cosmic-beam {
            display: none !important;
          }
        }
      `}</style>

      {/* Twinkling Quantum Points / Scintillation */}
      {PARTICLES.map((p) => (
        <span
          key={p.id}
          className={`quantum-particle absolute rounded-full ${p.size} ${p.color}`}
          style={
            {
              top: p.top,
              left: p.left,
              animation: `scintillationPulse ${p.duration} ease-in-out infinite`,
              animationDelay: p.delay,
              '--max-op': p.maxOpacity,
              opacity: 0.25,
            } as React.CSSProperties
          }
        />
      ))}

      {/* Gentle Celestial Shooting Stars with Soft Glowing Cores */}
      {BEAMS.map((beam) => (
        <div
          key={beam.id}
          className="cosmic-beam absolute pointer-events-none"
          style={{
            top: beam.top,
            left: beam.left,
            animationDelay: beam.delay,
            opacity: 0,
          }}
        >
          <div
            className="relative flex items-center"
            style={{ transform: 'rotate(-45deg)' }}
          >
            {/* Soft Glowing Core Star Head */}
            <div
              className={`w-1.5 h-1.5 rounded-full bg-white shrink-0 z-10 ${
                beam.type === 'amber'
                  ? 'shadow-[0_0_10px_2px_rgba(255,255,255,0.9),0_0_16px_4px_rgba(251,191,36,0.6)]'
                  : 'shadow-[0_0_10px_2px_rgba(255,255,255,0.9),0_0_16px_4px_rgba(34,211,238,0.6)]'
              }`}
            />

            {/* Soft Luminous Elongated Trail */}
            <div
              className={`h-[1.5px] -ml-1 ${
                beam.type === 'amber'
                  ? 'w-[180px] md:w-[240px] bg-gradient-to-r from-white via-amber-300/80 to-transparent shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                  : 'w-[180px] md:w-[240px] bg-gradient-to-r from-white via-cyan-300/80 to-transparent shadow-[0_0_10px_rgba(34,211,238,0.5)]'
              }`}
            />
          </div>
        </div>
      ))}
    </div>
  );
});

export default ParticleBackground;
