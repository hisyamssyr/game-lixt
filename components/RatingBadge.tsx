interface RatingBadgeProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function RatingBadge({ rating, size = 'md', className = '' }: RatingBadgeProps) {
  const color =
    rating >= 7 ? '#39FF85' :
    rating >= 4 ? '#FFB547' :
    '#FF4D6A';

  const bg =
    rating >= 7 ? 'rgba(57, 255, 133, 0.12)' :
    rating >= 4 ? 'rgba(255, 181, 71, 0.12)' :
    'rgba(255, 77, 106, 0.12)';

  const padding = size === 'sm' ? '2px 6px' : size === 'lg' ? '6px 14px' : '4px 10px';
  const fontSize = size === 'sm' ? '0.7rem' : size === 'lg' ? '1.1rem' : '0.8rem';

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding,
        borderRadius: '24px',
        background: bg,
        color,
        fontSize,
        fontWeight: 700,
        fontFamily: 'Space Grotesk, sans-serif',
        border: `1px solid ${color}33`,
        letterSpacing: '0.02em',
        whiteSpace: 'nowrap',
      }}
    >
      {rating.toFixed(1)}
    </span>
  );
}


