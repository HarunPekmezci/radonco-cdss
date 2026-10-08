'use client';

import React, { memo } from 'react';

// 320 deterministic razor-sharp astronomical star points (avoids SSR hydration mismatches)
const TOTAL_PARTICLES = 320;

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

  // Razor-sharp star sizing (no blurry circles or firefly bokeh)
  const seed = pseudoRand(i * 7.31 + 7);
  let size: string;
  let color: string;

  if (seed >= 0.90) {
    // 10% Bright pinpoint starlets
    size = 'w-[2px] h-[2px]';
    color = pseudoRand(i * 9.19 + 2) > 0.6 ? 'bg-cyan-100' : 'bg-white';
  } else if (seed >= 0.65) {
    // 25% Crisp medium pinpricks
    size = 'w-[1.5px] h-[1.5px]';
    color = 'bg-white/90';
  } else {
    // 65% Microscopic razor-sharp deep cosmos points
    size = 'w-[1px] h-[1px]';
    color = pseudoRand(i * 8.41 + 6) > 0.5 ? 'bg-white/80' : 'bg-cyan-100/70';
  }

  const minOpacity = (0.2 + pseudoRand(i * 5.12 + 8) * 0.2).toFixed(2);
  const maxOpacity = (0.75 + pseudoRand(i * 6.43 + 9) * 0.2).toFixed(2);

  return { id: i, top, left, size, duration, delay, minOpacity, maxOpacity, color };
});

// 5 JWST Hero Stars with 4-Point Diffraction Spikes (✦)
const JWST_HERO_STARS = [
  { id: 'jwst-1', top: '15%', left: '18%', delay: '0.3s', duration: '3.4s' },
  { id: 'jwst-2', top: '22%', left: '82%', delay: '1.2s', duration: '4.0s' },
  { id: 'jwst-3', top: '65%', left: '14%', delay: '2.0s', duration: '3.6s' },
  { id: 'jwst-4', top: '78%', left: '86%', delay: '0.7s', duration: '4.2s' },
  { id: 'jwst-5', top: '44%', left: '50%', delay: '1.5s', duration: '3.8s' },
];

interface ShootingStarBeam {
  id: number;
  top: string;
  left: string;
  delay: string;
  type: 'cyan' | 'amber';
}

// 9 delicate high-velocity meteor streaks gliding diagonally (-45 deg)
const BEAMS: ShootingStarBeam[] = [
  { id: 1, top: '-30px', left: '96%', delay: '0s', type: 'cyan' },
  { id: 2, top: '-55px', left: '72%', delay: '1.5s', type: 'amber' },
  { id: 3, top: '-20px', left: '85%', delay: '3.0s', type: 'cyan' },
  { id: 4, top: '-65px', left: '48%', delay: '4.5s', type: 'cyan' },
  { id: 5, top: '-35px', left: '106%', delay: '6.0s', type: 'amber' },
  { id: 6, top: '-45px', left: '62%', delay: '7.5s', type: 'cyan' },
  { id: 7, top: '-25px', left: '30%', delay: '9.0s', type: 'cyan' },
  { id: 8, top: '-60px', left: '90%', delay: '10.5s', type: 'amber' },
  { id: 9, top: '-35px', left: '42%', delay: '12.0s', type: 'cyan' },
];

export const ParticleBackground = memo(function ParticleBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden z-0 select-none"
    >
      <style>{`
        /* Pure luminosity twinkle without blurry scaling expansion */
        @keyframes scintillationPulse {
          0%, 100% {
            opacity: var(--min-op, 0.25);
          }
          50% {
            opacity: var(--max-op, 0.85);
          }
        }

        /* 13.5s cycle where each star glides smoothly for 3.2s */
        @keyframes shootingStarFlight {
          0% {
            transform: translate3d(0, 0, 0);
            opacity: 0;
          }
          3% {
            opacity: 0.95;
          }
          18% {
            transform: translate3d(-700px, 700px, 0);
            opacity: 0.75;
          }
          23.7% {
            transform: translate3d(-950px, 950px, 0);
            opacity: 0;
          }
          100% {
            transform: translate3d(-950px, 950px, 0);
            opacity: 0;
          }
        }

        .quantum-particle {
          will-change: opacity;
        }

        .cosmic-beam {
          will-change: transform, opacity;
          animation-name: shootingStarFlight;
          animation-duration: 13.5s;
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

      {/* Razor-sharp Astronomical Cosmic Starfield (320 Crisp Pinpricks) */}
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

      {/* JWST Hero Stars with 4-Point Diffraction Spikes (✦) */}
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
              '--min-op': 0.5,
              '--max-op': 1.0,
            } as React.CSSProperties
          }
        >
          {/* Luminous Core with 4-Point Diffraction Spikes */}
          <div className="relative w-[2px] h-[2px] rounded-full bg-white shadow-[0_0_5px_rgba(255,255,255,1)] before:absolute before:w-[14px] before:h-[1px] before:bg-cyan-300 before:top-1/2 before:-translate-y-1/2 before:-left-[6px] after:absolute after:h-[14px] after:w-[1px] after:bg-cyan-300 after:left-1/2 after:-translate-x-1/2 after:-top-[6px]" />
        </div>
      ))}

      {/* Plasma Particle Trails (Meteor Streams) */}
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
            {/* White Glowing Meteor Head */}
            <div className="w-1.5 h-1.5 rounded-full bg-white shrink-0 z-10 shadow-[0_0_8px_rgba(255,255,255,1)]" />

            {/* Translucent Plasma Tail */}
            <div
              className={`h-[1px] -ml-0.5 ${
                beam.type === 'amber'
                  ? 'w-[180px] md:w-[240px] bg-gradient-to-r from-white via-amber-300/60 to-transparent'
                  : 'w-[180px] md:w-[240px] bg-gradient-to-r from-white via-cyan-300/60 to-transparent'
              }`}
            />
          </div>
        </div>
      ))}
    </div>
  );
});

export default ParticleBackground;

