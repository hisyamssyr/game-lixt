'use client';

interface GenrePillProps {
  genre: string;
  selected?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md';
}

export function GenrePill({ genre, selected = false, onClick, size = 'md' }: GenrePillProps) {
  const isClickable = !!onClick;

  return (
    <span
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: size === 'sm' ? '2px 10px' : '5px 14px',
        borderRadius: '24px',
        background: selected ? 'rgba(108, 99, 255, 0.25)' : 'rgba(255, 255, 255, 0.06)',
        color: selected ? '#6C63FF' : '#8888A0',
        fontSize: size === 'sm' ? '0.7rem' : '0.78rem',
        fontWeight: 500,
        border: `1px solid ${selected ? '#6C63FF55' : 'rgba(255,255,255,0.08)'}`,
        cursor: isClickable ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      {genre}
    </span>
  );
}


