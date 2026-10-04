import { ImageResponse } from 'next/og';

export const alt = 'RadOnco CDSS | Radiation Oncology Clinical Decision Support System';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#070b14',
          backgroundImage:
            'radial-gradient(circle at 20% 15%, rgba(14, 165, 233, 0.22) 0%, transparent 50%), radial-gradient(circle at 85% 85%, rgba(99, 102, 241, 0.18) 0%, transparent 50%)',
          padding: '56px 64px',
          fontFamily: 'sans-serif',
          color: '#f8fafc',
          position: 'relative',
        }}
      >
        {/* Ambient Top Glow Line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            display: 'flex',
            background:
              'linear-gradient(90deg, transparent 0%, #0ea5e9 30%, #38bdf8 50%, #6366f1 70%, transparent 100%)',
          }}
        />

        {/* Header: Logo and Portal Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            {/* Custom Glowing RadOnco Logo */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '16px',
                backgroundColor: 'rgba(14, 165, 233, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 32px rgba(14, 165, 233, 0.35)',
              }}
            >
              <svg
                width="38"
                height="38"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="2" />
                <path d="M4.93 4.93a10 10 0 0 1 14.14 0" />
                <path d="M7.76 7.76a6 6 0 0 1 8.48 0" />
                <path d="M4.93 19.07a10 10 0 0 1 0-14.14" />
                <path d="M7.76 16.24a6 6 0 0 1 0-8.48" />
                <path d="M19.07 19.07a10 10 0 0 1-14.14 0" />
                <path d="M16.24 16.24a6 6 0 0 1-8.48 0" />
              </svg>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '28px',
                  fontWeight: 900,
                  letterSpacing: '-0.02em',
                  color: '#ffffff',
                }}
              >
                <span>RadOnco</span>
                <span style={{ color: '#38bdf8' }}>CDSS</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  fontSize: '13px',
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                }}
              >
                Clinical Decision Support System
              </div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '8px 18px',
              borderRadius: '9999px',
              backgroundColor: 'rgba(14, 165, 233, 0.1)',
              border: '1px solid rgba(14, 165, 233, 0.35)',
              color: '#38bdf8',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            ⚛ High-Acuity Medical Cockpit
          </div>
        </div>

        {/* Center: Main Headline and Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              fontSize: '48px',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-0.03em',
              color: '#ffffff',
              maxWidth: '1000px',
            }}
          >
            <div style={{ display: 'flex' }}>Evidence-Based Radiation Oncology &amp;</div>
            <div
              style={{
                display: 'flex',
                color: '#38bdf8',
              }}
            >
              Adaptive Dosimetry Portal
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              fontSize: '20px',
              lineHeight: 1.5,
              color: '#94a3b8',
              maxWidth: '920px',
            }}
          >
            Comprehensive 12-Organ Adaptive Clinical Decision Matrix, ICRU Target Volumes, QUANTEC/HyTEC OAR Ceilings &amp; BED/EQD2 Radiobiology Solvers.
          </div>
        </div>

        {/* Footer: Standards Badges & Official Domain */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid rgba(51, 65, 85, 0.6)',
            paddingTop: '24px',
            width: '100%',
          }}
        >
          <div style={{ display: 'flex', gap: '12px' }}>
            {['NCCN v2025/2026', 'QUANTEC & HyTEC', 'ICRU 50/62/83', 'Van Herk PTV'].map(
              (badge) => (
                <div
                  key={badge}
                  style={{
                    display: 'flex',
                    padding: '6px 14px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(30, 41, 59, 0.7)',
                    border: '1px solid rgba(71, 85, 105, 0.6)',
                    color: '#e2e8f0',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  {badge}
                </div>
              )
            )}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#38bdf8',
              fontSize: '16px',
              fontWeight: 700,
              fontFamily: 'monospace',
            }}
          >
            <span>www.radoncoxia.pro</span>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
