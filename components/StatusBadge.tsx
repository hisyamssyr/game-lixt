import type { GameStatus } from '@/types/app';

const STATUS_CONFIG: Record<GameStatus, { label: string; color: string; bg: string }> = {
  playing: { label: 'Playing', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' },
  completed: { label: 'Completed', color: '#39FF85', bg: 'rgba(57, 255, 133, 0.12)' },
  dropped: { label: 'Dropped', color: '#FF4D6A', bg: 'rgba(255, 77, 106, 0.12)' },
  plan_to_play: { label: 'Plan to Play', color: '#8888A0', bg: 'rgba(136, 136, 160, 0.12)' },
};

interface StatusBadgeProps {
  status: GameStatus;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const { label, color, bg } = STATUS_CONFIG[status];

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        padding: '3px 10px',
        borderRadius: '24px',
        background: bg,
        color,
        fontSize: '0.72rem',
        fontWeight: 600,
        border: `1px solid ${color}33`,
        whiteSpace: 'nowrap',
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
      {label}
    </span>
  );
}


