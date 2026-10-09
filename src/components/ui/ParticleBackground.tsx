'use client';

import React, { memo } from 'react';

// 600 deterministic polychromatic astronomical star points (avoids SSR hydration mismatches)
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

  // Polychromatic Astrophysical Spectrum Allocation (H-alpha, O-III, Solar Gold, Diamond)
  const colorSeed = pseudoRand(i * 7.31 + 7);
  let size: string;
  let color: string;

  if (colorSeed < 0.15) {
    // 15% Aurora Emerald green puncta (O-III emission, harmonizes with RadOnco Academy)
    size = 'w-[1.5px] h-[1.5px]';
    color = 'bg-emerald-300 shadow-[0_0_6px_rgba(52,211,153,0.85)]';
  } else if (colorSeed < 0.25) {
    // 10% Crimson / Rose red puncta (H-alpha stellar ionization)
    size = 'w-[1.5px] h-[1.5px]';
    color = 'bg-rose-300 shadow-[0_0_6px_rgba(251,113,133,0.85)]';
  } else if (colorSeed < 0.40) {
    // 15% Solar Amber / Gold puncta (harmonizes with RadOnco CDSS)
    size = 'w-[1.5px] h-[1.5px]';
    color = 'bg-amber-300 shadow-[0_0_6px_rgba(251,191,36,0.85)]';
  } else if (colorSeed < 0.65) {
    // 25% Crisp Diamond White with bright radiant halo
    size = 'w-[2px] h-[2px]';
    color = 'bg-white shadow-[0_0_5px_1.5px_rgba(255,255,255,0.95)]';
  } else if (colorSeed < 0.82) {
    // 17% Pure white medium pinpricks
    size = 'w-[1.5px] h-[1.5px]';
    color = 'bg-white';
  } else {
    // 18% Microscopic Ice-Blue stellar points
    size = 'w-[1px] h-[1px]';
    color = 'bg-cyan-100/90';
  }

  return { id: i, top, left, size, duration, delay, minOpacity, maxOpacity, color };
});

type SpectralColor = 'emerald' | 'crimson' | 'cyan' | 'amber';

// 10 prominent JWST Hero Stars with 4-Point Diamond Diffraction Spikes (✦)
interface JwstHeroStar {
  id: string;
  top: string;
  left: string;
  delay: string;
  duration: string;
  type: SpectralColor;
}

const JWST_HERO_STARS: JwstHeroStar[] = [
  { id: 'jwst-1', top: '12%', left: '16%', delay: '0.2s', duration: '3.2s', type: 'cyan' },
  { id: 'jwst-2', top: '18%', left: '84%', delay: '1.1s', duration: '3.8s', type: 'emerald' },
  { id: 'jwst-3', top: '35%', left: '32%', delay: '1.9s', duration: '3.5s', type: 'crimson' },
  { id: 'jwst-4', top: '48%', left: '72%', delay: '0.6s', duration: '4.1s', type: 'amber' },
  { id: 'jwst-5', top: '62%', left: '12%', delay: '2.3s', duration: '3.4s', type: 'emerald' },
  { id: 'jwst-6', top: '75%', left: '88%', delay: '1.5s', duration: '3.9s', type: 'cyan' },
  { id: 'jwst-7', top: '85%', left: '42%', delay: '0.8s', duration: '4.3s', type: 'crimson' },
  { id: 'jwst-8', top: '28%', left: '58%', delay: '2.7s', duration: '3.6s', type: 'amber' },
  { id: 'jwst-9', top: '68%', left: '55%', delay: '1.3s', duration: '4.0s', type: 'emerald' },
  { id: 'jwst-10', top: '92%', left: '24%', delay: '2.1s', duration: '3.7s', type: 'cyan' },
];

const HERO_DIFFRACTION_STYLES: Record<
  SpectralColor,
  { spikeColor: string; coreGlow: string }
> = {
  cyan: {
    spikeColor: 'before:bg-cyan-300 after:bg-cyan-300',
    coreGlow:
      'shadow-[0_0_8px_2px_rgba(255,255,255,1),0_0_14px_4px_rgba(34,211,238,0.85)]',
  },
  emerald: {
    spikeColor: 'before:bg-emerald-400 after:bg-emerald-400',
    coreGlow:
      'shadow-[0_0_8px_2px_rgba(255,255,255,1),0_0_14px_4px_rgba(52,211,153,0.85)]',
  },
  crimson: {
    spikeColor: 'before:bg-rose-400 after:bg-rose-400',
    coreGlow:
      'shadow-[0_0_8px_2px_rgba(255,255,255,1),0_0_14px_4px_rgba(251,113,133,0.85)]',
  },
  amber: {
    spikeColor: 'before:bg-amber-400 after:bg-amber-400',
    coreGlow:
      'shadow-[0_0_8px_2px_rgba(255,255,255,1),0_0_14px_4px_rgba(251,191,36,0.85)]',
  },
};

interface ShootingStarBeam {
  id: number;
  top: string;
  left: string;
  delay: string;
  type: SpectralColor;
}

// 18 continuous cascading meteor streams across 4 astrophysical spectral colors
const BEAMS: ShootingStarBeam[] = [
  { id: 1, top: '-30px', left: '98%', delay: '0.0s', type: 'emerald' },
  { id: 2, top: '-55px', left: '72%', delay: '1.0s', type: 'amber' },
  { id: 3, top: '-20px', left: '85%', delay: '2.0s', type: 'cyan' },
  { id: 4, top: '-65px', left: '48%', delay: '3.0s', type: 'crimson' },
  { id: 5, top: '-35px', left: '106%', delay: '4.0s', type: 'emerald' },
  { id: 6, top: '-45px', left: '62%', delay: '5.0s', type: 'cyan' },
  { id: 7, top: '-25px', left: '30%', delay: '6.0s', type: 'amber' },
  { id: 8, top: '-60px', left: '92%', delay: '7.0s', type: 'crimson' },
  { id: 9, top: '-35px', left: '42%', delay: '8.0s', type: 'emerald' },
  { id: 10, top: '-40px', left: '78%', delay: '9.0s', type: 'cyan' },
  { id: 11, top: '-50px', left: '20%', delay: '10.0s', type: 'amber' },
  { id: 12, top: '-30px', left: '112%', delay: '11.0s', type: 'emerald' },
  { id: 13, top: '-45px', left: '55%', delay: '12.0s', type: 'crimson' },
  { id: 14, top: '-60px', left: '88%', delay: '13.0s', type: 'cyan' },
  { id: 15, top: '-25px', left: '35%', delay: '14.0s', type: 'emerald' },
  { id: 16, top: '-50px', left: '68%', delay: '15.0s', type: 'amber' },
  { id: 17, top: '-35px', left: '95%', delay: '16.0s', type: 'crimson' },
  { id: 18, top: '-40px', left: '25%', delay: '17.0s', type: 'cyan' },
];

const METEOR_STYLES: Record<
  SpectralColor,
  { headShadow: string; tailClass: string }
> = {
  emerald: {
    headShadow:
      'shadow-[0_0_10px_2px_rgba(255,255,255,0.9),0_0_16px_4px_rgba(16,185,129,0.85)]',
    tailClass:
      'w-[160px] md:w-[210px] bg-gradient-to-r from-white via-teal-300 via-emerald-400 to-transparent shadow-[0_0_10px_rgba(16,185,129,0.7)]',
  },
  crimson: {
    headShadow:
      'shadow-[0_0_10px_2px_rgba(255,255,255,0.9),0_0_16px_4px_rgba(244,63,94,0.85)]',
    tailClass:
      'w-[160px] md:w-[210px] bg-gradient-to-r from-white via-pink-400 via-rose-500 to-transparent shadow-[0_0_10px_rgba(244,63,94,0.7)]',
  },
  cyan: {
    headShadow:
      'shadow-[0_0_10px_2px_rgba(255,255,255,0.9),0_0_16px_4px_rgba(34,211,238,0.85)]',
    tailClass:
      'w-[160px] md:w-[210px] bg-gradient-to-r from-white via-sky-300 via-cyan-400 to-transparent shadow-[0_0_10px_rgba(34,211,238,0.7)]',
  },
  amber: {
    headShadow:
      'shadow-[0_0_10px_2px_rgba(255,255,255,0.9),0_0_16px_4px_rgba(251,191,36,0.85)]',
    tailClass:
      'w-[160px] md:w-[210px] bg-gradient-to-r from-white via-orange-300 via-amber-400 to-transparent shadow-[0_0_10px_rgba(251,191,36,0.7)]',
  },
};

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

      {/* Polychromatic Astronomical Cosmic Starfield (600 Luminous Points) */}
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

      {/* 10 Spectral JWST Hero Stars with 4-Point Diamond Diffraction Spikes (✦) */}
      {JWST_HERO_STARS.map((star) => {
        const style = HERO_DIFFRACTION_STYLES[star.type];
        return (
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
            {/* Luminous Core with Spectral 4-Point Diffraction Spikes */}
            <div
              className={`relative w-[2.5px] h-[2.5px] rounded-full bg-white ${style.coreGlow} before:absolute before:w-[16px] before:h-[1px] ${style.spikeColor} before:top-1/2 before:-translate-y-1/2 before:-left-[7px] after:absolute after:h-[16px] after:w-[1px] ${style.spikeColor} after:left-1/2 after:-translate-x-1/2 after:-top-[7px]`}
            />
          </div>
        );
      })}

      {/* 18 Continuous 4-Color Spectral Cascading Meteors */}
      {BEAMS.map((beam) => {
        const style = METEOR_STYLES[beam.type];
        return (
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
              {/* Spectral Radiant Glowing Meteor Head */}
              <div
                className={`w-[5px] h-[5px] rounded-full bg-white shrink-0 z-10 ${style.headShadow}`}
              />

              {/* Spectral Elongated Glowing Plasma Tail */}
              <div
                className={`h-[1.2px] -ml-0.5 ${style.tailClass}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
});

export default ParticleBackground;
