'use client';

import React, { memo } from 'react';

// 330 deterministic twinkling quantum points across 3 cosmic visual tiers (avoids SSR hydration mismatches)
const TOTAL_PARTICLES = 330;

const PARTICLES = Array.from({ length: TOTAL_PARTICLES }, (_, i) => {
  const pseudoRand = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const top = `${(pseudoRand(i * 1.37 + 1) * 98 + 1).toFixed(2)}%`;
  const left = `${(pseudoRand(i * 2.71 + 2) * 98 + 1).toFixed(2)}%`;

  // Staggered twinkle duration (1.5s to 5.0s) and delays (0s to 5s)
  const duration = `${(1.5 + pseudoRand(i * 3.14 + 3) * 3.5).toFixed(2)}s`;
  const delay = `${(pseudoRand(i * 4.67 + 4) * 5.0).toFixed(2)}s`;

  // 3 distinct visual tiers for deep cosmic layering
  const tierSeed = pseudoRand(i * 7.31 + 7);

  let size: string;
  let minOpacity: string;
  let maxOpacity: string;
  let color: string;

  if (tierSeed >= 0.90) {
    // Radiant Diamond Puncta (~10%): ~33 prominent sparkling nodes (w-2 h-2) with colored glowing auras
    size = 'w-2 h-2';
    minOpacity = (0.35 + pseudoRand(i * 5.12 + 8) * 0.15).toFixed(2);
    maxOpacity = (0.92 + pseudoRand(i * 6.43 + 9) * 0.08).toFixed(2);

    const colorSeed = pseudoRand(i * 8.77 + 10);
    if (colorSeed < 0.38) {
      // Pure Diamond White
      color = 'bg-white shadow-[0_0_12px_3px_rgba(255,255,255,0.95)]';
    } else if (colorSeed < 0.72) {
      // High-Energy Cyan
      color = 'bg-cyan-200 shadow-[0_0_12px_3px_rgba(34,211,238,0.9)]';
    } else {
      // Warm Solar Amber
      color = 'bg-amber-200 shadow-[0_0_12px_3px_rgba(251,191,36,0.9)]';
    }
  } else if (tierSeed >= 0.65) {
    // Prominent Twinkling Stars (~25%): ~82 crisp glowing stars (w-1.5 h-1.5) pure white with soft halos
    size = 'w-1.5 h-1.5';
    minOpacity = (0.25 + pseudoRand(i * 5.12 + 8) * 0.15).toFixed(2);
    maxOpacity = (0.85 + pseudoRand(i * 6.43 + 9) * 0.12).toFixed(2);
    color = 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.85)]';
  } else {
    // Deep Space Dust (~65%): ~215 micro-points (w-1 h-1), subtle opacity, slow ambient pulse
    size = 'w-1 h-1';
    minOpacity = (0.15 + pseudoRand(i * 5.12 + 8) * 0.15).toFixed(2);
    maxOpacity = (0.35 + pseudoRand(i * 6.43 + 9) * 0.20).toFixed(2);
    color = 'bg-slate-200/70 shadow-[0_0_3px_rgba(255,255,255,0.4)]';
  }

  return { id: i, top, left, size, duration, delay, minOpacity, maxOpacity, color };
});

// 5 prominent Anchor Stars with delicate 4-point diamond cross sparkles (diffraction spikes)
const ANCHOR_STARS = [
  { id: 'anchor-1', top: '16%', left: '22%', delay: '0.4s', duration: '3.2s' },
  { id: 'anchor-2', top: '24%', left: '82%', delay: '1.2s', duration: '3.8s' },
  { id: 'anchor-3', top: '68%', left: '14%', delay: '2.0s', duration: '3.4s' },
  { id: 'anchor-4', top: '76%', left: '88%', delay: '0.8s', duration: '4.0s' },
  { id: 'anchor-5', top: '48%', left: '46%', delay: '1.6s', duration: '3.6s' },
];

interface ShootingStarBeam {
  id: number;
  top: string;
  left: string;
  delay: string;
  type: 'cyan' | 'amber';
}

// 13 continuous soft-gliding streams staggered every 1.3s across the top edge
const BEAMS: ShootingStarBeam[] = [
  { id: 1, top: '-30px', left: '98%', delay: '0s', type: 'cyan' },
  { id: 2, top: '-55px', left: '72%', delay: '1.3s', type: 'amber' },
  { id: 3, top: '-20px', left: '86%', delay: '2.6s', type: 'cyan' },
  { id: 4, top: '-65px', left: '50%', delay: '3.9s', type: 'cyan' },
  { id: 5, top: '-35px', left: '108%', delay: '5.2s', type: 'amber' },
  { id: 6, top: '-45px', left: '62%', delay: '6.5s', type: 'cyan' },
  { id: 7, top: '-25px', left: '32%', delay: '7.8s', type: 'cyan' },
  { id: 8, top: '-60px', left: '92%', delay: '9.1s', type: 'amber' },
  { id: 9, top: '-35px', left: '44%', delay: '10.4s', type: 'cyan' },
  { id: 10, top: '-40px', left: '18%', delay: '11.7s', type: 'amber' },
  { id: 11, top: '-50px', left: '80%', delay: '13.0s', type: 'cyan' },
  { id: 12, top: '-30px', left: '60%', delay: '14.3s', type: 'amber' },
  { id: 13, top: '-45px', left: '102%', delay: '15.6s', type: 'cyan' },
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
            opacity: var(--min-op, 0.2);
            transform: scale(0.85);
          }
          50% {
            opacity: var(--max-op, 0.95);
            transform: scale(1.35);
          }
        }

        /* 17s cycle where each star glides gracefully for 3.6s (21.2% of cycle) */
        @keyframes shootingStarFlight {
          0% {
            transform: translate3d(0, 0, 0);
            opacity: 0;
          }
          3% {
            /* Gentle flare-up */
            opacity: 0.95;
          }
          16% {
            /* Sustained soft glide */
            transform: translate3d(-700px, 700px, 0);
            opacity: 0.8;
          }
          21.2% {
            /* Gentle fade-out across 960px */
            transform: translate3d(-960px, 960px, 0);
            opacity: 0;
          }
          100% {
            transform: translate3d(-960px, 960px, 0);
            opacity: 0;
          }
        }

        .quantum-particle {
          will-change: opacity, transform;
        }

        .cosmic-beam {
          will-change: transform, opacity;
          animation-name: shootingStarFlight;
          animation-duration: 17s;
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

      {/* Twinkling Quantum Points / Scintillation (330 Points Across 3 Cosmic Tiers) */}
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
              '--min-op': p.minOpacity,
              '--max-op': p.maxOpacity,
              opacity: p.minOpacity,
            } as React.CSSProperties
          }
        />
      ))}

      {/* 5 Anchor Stars with Delicate 4-Point Diamond Cross Sparkles (Diffraction Spikes) */}
      {ANCHOR_STARS.map((anchor) => (
        <div
          key={anchor.id}
          className="quantum-particle absolute flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
          style={
            {
              top: anchor.top,
              left: anchor.left,
              animation: `scintillationPulse ${anchor.duration} ease-in-out infinite`,
              animationDelay: anchor.delay,
              '--min-op': 0.6,
              '--max-op': 1.0,
            } as React.CSSProperties
          }
        >
          {/* Horizontal diffraction spike */}
          <span className="absolute w-8 h-[1px] bg-gradient-to-r from-transparent via-cyan-200/90 to-transparent pointer-events-none" />
          {/* Vertical diffraction spike */}
          <span className="absolute h-8 w-[1px] bg-gradient-to-b from-transparent via-cyan-200/90 to-transparent pointer-events-none" />
          {/* Glowing Anchor Core */}
          <span className="w-2 h-2 rounded-full bg-white shadow-[0_0_16px_4px_rgba(255,255,255,1),0_0_24px_6px_rgba(56,189,248,0.8)] shrink-0 z-10" />
        </div>
      ))}

      {/* Continuous Celestial Shooting Stars with Soft Glowing Cores (13 Streams) */}
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
            {/* Radiant Glowing Star Head */}
            <div
              className={`w-2 h-2 rounded-full bg-white shrink-0 z-10 ${
                beam.type === 'amber'
                  ? 'shadow-[0_0_14px_rgba(255,255,255,1),0_0_22px_6px_rgba(251,191,36,0.7)]'
                  : 'shadow-[0_0_14px_rgba(255,255,255,1),0_0_22px_6px_rgba(34,211,238,0.7)]'
              }`}
            />

            {/* Long, Elegant Tail Gradient (200px - 280px) */}
            <div
              className={`h-[1.5px] -ml-1 ${
                beam.type === 'amber'
                  ? 'w-[200px] md:w-[280px] bg-gradient-to-r from-white via-amber-300/80 to-transparent shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                  : 'w-[200px] md:w-[280px] bg-gradient-to-r from-white via-cyan-300/80 to-transparent shadow-[0_0_10px_rgba(34,211,238,0.5)]'
              }`}
            />
          </div>
        </div>
      ))}
    </div>
  );
});

export default ParticleBackground;

