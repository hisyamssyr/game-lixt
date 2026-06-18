import { Gamepad2 } from 'lucide-react';

export default function Loading() {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--gl-bg-base)',
      zIndex: 9999,
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse-glow {
          0%, 100% {
            transform: scale(1);
            filter: drop-shadow(0 0 15px rgba(108, 99, 255, 0.4));
            opacity: 1;
          }
          50% {
            transform: scale(1.05);
            filter: drop-shadow(0 0 30px rgba(108, 99, 255, 0.8));
            opacity: 0.8;
          }
        }
        @keyframes loading-dots {
          0% { content: ''; }
          25% { content: '.'; }
          50% { content: '..'; }
          75% { content: '...'; }
          100% { content: ''; }
        }
        .glowing-gamepad {
          animation: pulse-glow 1.5s ease-in-out infinite;
          color: #6C63FF;
        }
        .loading-text::after {
          content: '';
          animation: loading-dots 1.5s infinite;
        }
      `}} />
      
      <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Decorative background rings */}
        <div style={{ position: 'absolute', width: 100, height: 100, borderRadius: '50%', background: 'radial-gradient(circle, rgba(108, 99, 255, 0.2) 0%, transparent 70%)' }} />
        
        {/* Main Icon */}
        <Gamepad2 size={64} strokeWidth={1.5} className="glowing-gamepad" style={{ position: 'relative', zIndex: 2 }} />
      </div>

      <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <h2 style={{ 
          margin: 0, 
          fontFamily: 'Space Grotesk, sans-serif', 
          fontSize: '1.4rem', 
          fontWeight: 700, 
          color: '#F0F0F5',
          letterSpacing: '1px'
        }}>
          GameLixt
        </h2>
        <p className="loading-text" style={{ 
          margin: 0, 
          color: '#8888A0', 
          fontSize: '0.9rem',
          fontWeight: 500,
          letterSpacing: '2px',
          textTransform: 'uppercase'
        }}>
          Loading
        </p>
      </div>
    </div>
  );
}
