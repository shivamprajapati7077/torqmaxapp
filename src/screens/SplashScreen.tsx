import React from 'react';

interface SplashScreenProps {
  fading: boolean;
  onDismiss?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ fading, onDismiss }) => {
  return (
    <div
      className={`splash ${fading ? 'fade-out' : ''}`}
      onClick={onDismiss}
      style={{ cursor: 'pointer' }}
    >
      {/* Glowing ring behind logo */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        {/* Glow circle */}
        <div style={{
          position: 'absolute',
          width: 130,
          height: 130,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(229,39,46,0.25) 0%, transparent 70%)',
          animation: 'pulseGlow 1.5s ease-in-out infinite',
        }} />

        {/* Real TorqMax logo with screen blend */}
        <img
          src="./torqmax-logo.png"
          alt="TorqMax"
          style={{
            width: 110,
            height: 'auto',
            mixBlendMode: 'screen',
            filter: 'brightness(1.1) saturate(1.2)',
            position: 'relative',
            zIndex: 1,
          }}
        />
      </div>

      {/* Tagline */}
      <div className="splash-tagline" style={{ marginTop: 16 }}>Auto Accessories · Surat, India</div>

      {/* Progress Bar */}
      <div className="splash-bar">
        <div className="splash-progress" />
      </div>

      <style>{`
        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.15); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
