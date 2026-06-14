import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: number;
}

export function StarRating({ rating, maxRating = 10, size = 14 }: StarRatingProps) {
  const stars = 5;
  const filled = (rating / maxRating) * stars;

  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {Array.from({ length: stars }, (_, i) => {
        const fill = Math.max(0, Math.min(1, filled - i));
        return (
          <div key={i} style={{ position: 'relative', width: size, height: size }}>
            <Star
              size={size}
              style={{ color: '#22222F', fill: '#22222F', position: 'absolute', top: 0, left: 0 }}
            />
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: `${fill * 100}%`,
                overflow: 'hidden',
              }}
            >
              <Star size={size} style={{ color: '#FFB547', fill: '#FFB547' }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}


