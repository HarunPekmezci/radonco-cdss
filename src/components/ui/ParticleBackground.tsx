'use client';

import React, { memo } from 'react';

// 600 deterministic razor-sharp astronomical star points (avoids SSR hydration mismatches)
const TOTAL_PARTICLES = 600;

const PARTICLES = Array.from({ length: TOTAL_PARTICLES }, (_, i) => {
  const pseudoRand = (seed: number) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };

  const top = `${(pseudoRand(i * 1.37 + 1) * 98 + 1).toFixed(2)}%`;
  const left = `${(pseudoRand(i * 2.71 + 2) * 98 + 1).toFixed(2)}%`;

  // Staggered twinkle duration (1.5s to 4.5s) and delays (0s to 5s)
  const duration = `${(1.5 + pseudoRand(i * 3.14 + 3) * 3.0).toFixed(2)}s`;
  const delay = `${(pseudoRand(i * 4.67 + 4) * 5.0).toFixed(2)}s`;

  // Elevated brightness: min opacity 0.45 - 0.70, peak opacity 0.80 - 0.98
  const minOpacity = (0.45 + pseudoRand(i * 5.12 + 8) * 0.25).toFixed(2);
  const maxOpacity = (0.80 + pseudoRand(i * 6.43 + 9) * 0.18).toFixed(2);

  // Razor-sharp star tiers with boosted luminosity
  const seed = pseudoRand(i * 7.31 + 7);
  let size: string;
  let color: string;

  if (seed >= 0.85) {
    // 15% Crisp glowing stars with radiant white halos
    size = 'w-[2px] h-[2px]';
    color =
      pseudoRand(i * 9.19 + 2) > 0.6
        ? 'bg-cyan-100 shadow-[0_0_5px_1.5px_rgba(34,211,238,0.9)]'
        : 'bg-white shadow-[0_0_5px_1.5px_rgba(255,255,255,0.95)]';
  } else if (seed >= 0.60) {
    // 25% Crisp medium pinpricks
    size = 'w-[1.5px] h-[1.5px]';
    color = 'bg-white';
  } else {
    // 60% Microscopic razor-sharp deep cosmos points
    size = 'w-[1px] h-[1px]';
    color = pseudoRand(i * 8.41 + 6) > 0.5 ? 'bg-white/90' : 'bg-cyan-100/85';
  }

  return { id: i, top, left, size, duration, delay, minOpacity, maxOpacity, color };
});

// 10 prominent JWST Hero Stars with 4-Point Diamond Diffraction Spikes (✦)
const JWST_HERO_STARS = [
  { id: 'jwst-1', top: '12%', left: '16%', delay: '0.2s', duration: '3.2s' },
  { id: 'jwst-2', top: '18%', left: '84%', delay: '1.1s', duration: '3.8s' },
  { id: 'jwst-3', top: '35%', left: '32%', delay: '1.9s', duration: '3.5s' },
  { id: 'jwst-4', top: '48%', left: '72%', delay: '0.6s', duration: '4.1s' },
  { id: 'jwst-5', top: '62%', left: '12%', delay: '2.3s', duration: '3.4s' },
  { id: 'jwst-6', top: '75%', left: '88%', delay: '1.5s', duration: '3.9s' },
  { id: 'jwst-7', top: '85%', left: '42%', delay: '0.8s', duration: '4.3s' },
  { id: 'jwst-8', top: '28%', left: '58%', delay: '2.7s', duration: '3.6s' },
  { id: 'jwst-9', top: '68%', left: '55%', delay: '1.3s', duration: '4.0s' },
  { id: 'jwst-10', top: '92%', left: '24%', delay: '2.1s', duration: '3.7s' },
];

interface ShootingStarBeam {
  id: number;
  top: string;
  left: string;
  delay: string;
  type: 'cyan' | 'amber';
}

// 18 continuous cascading meteor streams (70% Cosmic Cyan, 30% Solar Gold)
const BEAMS: ShootingStarBeam[] = [
  { id: 1, top: '-30px', left: '98%', delay: '0.0s', type: 'cyan' },
  { id: 2, top: '-55px', left: '72%', delay: '1.0s', type: 'amber' },
  { id: 3, top: '-20px', left: '85%', delay: '2.0s', type: 'cyan' },
  { id: 4, top: '-65px', left: '48%', delay: '3.0s', type: 'cyan' },
  { id: 5, top: '-35px', left: '106%', delay: '4.0s', type: 'amber' },
  { id: 6, top: '-45px', left: '62%', delay: '5.0s', type: 'cyan' },
  { id: 7, top: '-25px', left: '30%', delay: '6.0s', type: 'cyan' },
  { id: 8, top: '-60px', left: '92%', delay: '7.0s', type: 'amber' },
  { id: 9, top: '-35px', left: '42%', delay: '8.0s', type: 'cyan' },
  { id: 10, top: '-40px', left: '78%', delay: '9.0s', type: 'cyan' },
  { id: 11, top: '-50px', left: '20%', delay: '10.0s', type: 'cyan' },
  { id: 12, top: '-30px', left: '112%', delay: '11.0s', type: 'amber' },
  { id: 13, top: '-45px', left: '55%', delay: '12.0s', type: 'cyan' },
  { id: 14, top: '-60px', left: '88%', delay: '13.0s', type: 'cyan' },
  { id: 15, top: '-25px', left: '35%', delay: '14.0s', type: 'cyan' },
  { id: 16, top: '-50px', left: '68%', delay: '15.0s', type: 'amber' },
  { id: 17, top: '-35px', left: '95%', delay: '16.0s', type: 'cyan' },
  { id: 18, top: '-40px', left: '25%', delay: '17.0s', type: 'cyan' },
];

export const ParticleBackground = memo(function ParticleBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden z-0 select-none"
    >
      <style>{`
        /* Pure luminosity twinkle with elevated brightness */
        @keyframes scintillationPulse {
          0%, 100% {
            opacity: var(--min-op, 0.45);
          }
          50% {
            opacity: var(--max-op, 0.95);
          }
        }

        /* 18s continuous cascading cycle with 3.2s flight per meteor */
        @keyframes shootingStarFlight {
          0% {
            transform: translate3d(0, 0, 0);
            opacity: 0;
          }
          2.5% {
            opacity: 1;
          }
          13.5% {
            transform: translate3d(-700px, 700px, 0);
            opacity: 0.85;
          }
          17.8% {
            transform: translate3d(-960px, 960px, 0);
            opacity: 0;
          }
          100% {
            transform: translate3d(-960px, 960px, 0);
            opacity: 0;
          }
        }

        .quantum-particle {
          will-change: opacity;
        }

        .cosmic-beam {
          will-change: transform, opacity;
          animation-name: shootingStarFlight;
          animation-duration: 18s;
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

      {/* Razor-sharp Astronomical Cosmic Starfield (600 Crisp Luminous Points) */}
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

      {/* 10 JWST Hero Stars with 4-Point Diamond Diffraction Spikes (✦) */}
      {JWST_HERO_STARS.map((star) => (
        <div
          key={star.id}
          className="quantum-particle absolute pointer-events-none -translate-x-1/2 -translate-y-1/2"
          style={
            {
              top: star.top,
              left: star.left,
              animation: `scintillationPulse ${star.duration} ease-in-out infinite`,
              animationDelay: star.delay,
              '--min-op': 0.6,
              '--max-op': 1.0,
            } as React.CSSProperties
          }
        >
          {/* Luminous Core with 4-Point Diffraction Spikes */}
          <div className="relative w-[2.5px] h-[2.5px] rounded-full bg-white shadow-[0_0_8px_2px_rgba(255,255,255,1),0_0_14px_4px_rgba(34,211,238,0.8)] before:absolute before:w-[16px] before:h-[1px] before:bg-cyan-300 before:top-1/2 before:-translate-y-1/2 before:-left-[7px] after:absolute after:h-[16px] after:w-[1px] after:bg-cyan-300 after:left-1/2 after:-translate-x-1/2 after:-top-[7px]" />
        </div>
      ))}

      {/* 18 Continuous Cascading Plasma Meteors */}
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
            {/* Radiant Glowing Meteor Head */}
            <div
              className={`w-2 h-2 rounded-full bg-white shrink-0 z-10 ${
                beam.type === 'amber'
                  ? 'shadow-[0_0_18px_5px_rgba(255,255,255,1),0_0_28px_8px_rgba(251,191,36,0.95)]'
                  : 'shadow-[0_0_18px_5px_rgba(255,255,255,1),0_0_28px_8px_rgba(34,211,238,0.95)]'
              }`}
            />

            {/* Elongated Glowing Plasma Tail */}
            <div
              className={`h-[2px] -ml-0.5 w-[220px] md:w-[320px] ${
                beam.type === 'amber'
                  ? 'bg-gradient-to-r from-white via-amber-300 via-amber-400 to-transparent shadow-[0_0_20px_rgba(251,191,36,0.95)]'
                  : 'bg-gradient-to-r from-white via-cyan-400 via-cyan-300 to-transparent shadow-[0_0_20px_rgba(34,211,238,0.95)]'
              }`}
            />
          </div>
        </div>
      ))}
    </div>
  );
});

export default ParticleBackground;
