import type { CuratedList, Game, GameStatus, Review } from '@/types/app';

export const ALL_GENRES = [
  'Action', 'RPG', 'Strategy', 'Horror', 'Sci-Fi', 'Adventure',
  'Puzzle', 'Racing', 'Sports', 'Fighting', 'Simulation', 'Stealth',
  'Platformer', 'Survival', 'Open World',
];

export function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'http://localhost:3000';
}

export async function apiGet<T>(path: string, fallback: T, cookieString?: string): Promise<T> {
  try {
    const baseUrl = getBaseUrl();
    const headers: Record<string, string> = {};
    if (cookieString) {
      headers.Cookie = cookieString;
    }
    const res = await fetch(`${baseUrl}${path}`, { cache: 'no-store', headers });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch {
    return fallback;
  }
}

export function mapStatus(status?: string | null): GameStatus | null {
  if (!status) return null;
  const normalized = status.toLowerCase().replaceAll(' ', '_');
  if (normalized === 'plan_to_play' || normalized === 'playing' || normalized === 'completed' || normalized === 'dropped') return normalized;
  return null;
}

export function toGame(raw: any): Game {
  return {
    id: raw.game_id ?? raw.id,
    title: raw.title ?? 'Untitled Game',
    developer: raw.developer ?? 'Unknown Studio',
    publisher: raw.publisher ?? raw.developer ?? 'Unknown Publisher',
    releaseDate: raw.release_date ?? raw.releaseDate ?? '',
    genres: Array.isArray(raw.genres) ? raw.genres.map((g: any) => typeof g === 'string' ? g : g.genre_name).filter(Boolean) : [],
    rating: Number(raw.average_rating ?? raw.rating ?? 0),
    coverImage: raw.cover_url ?? raw.coverImage ?? 'https://picsum.photos/seed/game-lixt/300/450',
    description: raw.description ?? '',
    platforms: raw.platforms ?? ['PC'],
    achievements: Array.isArray(raw.achievements) ? raw.achievements.map((a: any) => ({
      id: a.achievement_id ?? a.id,
      name: a.achievement_name ?? a.name,
      description: a.description ?? '',
      rarity: a.rarity ?? 'common',
    })) : [],
    trending: Boolean(raw.trending ?? Number(raw.average_rating ?? raw.rating ?? 0) >= 8),
  };
}

export function toReview(raw: any, gameId?: string): Review {
  return {
    id: raw.review_id ?? raw.id,
    gameId: raw.game_id ?? raw.gameId ?? gameId ?? '',
    userId: raw.userId ?? raw.user_id,
    username: raw.username ?? 'Player',
    avatar: raw.avatar_url ?? raw.avatar ?? 'https://picsum.photos/seed/user/60/60',
    rating: Number(raw.rating ?? 0),
    text: raw.review_text ?? raw.text ?? '',
    date: raw.created_at ?? raw.date ?? new Date().toISOString(),
    upvotes: Number(raw.upvotes ?? 0),
    downvotes: Number(raw.downvotes ?? 0),
    userVote: raw.userVote === true ? 'up' : raw.userVote === false ? 'down' : null,
  };
}

export function toList(raw: any): CuratedList {
  const items = raw.items ?? [];
  return {
    id: raw.list_id ?? raw.id,
    title: raw.title ?? 'Untitled List',
    description: raw.description ?? '',
    userId: raw.user_id,
    username: raw.username ?? raw.owner?.username ?? 'Player',
    avatar: raw.avatar_url ?? raw.owner?.avatar_url ?? 'https://picsum.photos/seed/user/60/60',
    gameIds: raw.gameIds ?? items.map((item: any) => item.game_id).filter(Boolean),
    gameCount: Number(raw.game_count ?? raw.gameIds?.length ?? items.length ?? 0),
    covers: raw.covers ?? [],
    upvotes: Number(raw.vote_score ?? raw.upvotes ?? 0),
    downvotes: Number(raw.downvotes ?? 0),
    hasUpvoted: raw.has_upvoted ?? false,
  };
}

export function toThread(raw: any): import('@/types/app').ForumThread {
  return {
    id: raw.thread_id ?? raw.id,
    userId: raw.user_id ?? raw.userId,
    username: raw.username ?? 'Unknown',
    avatar: raw.avatar_url ?? raw.avatar ?? '/default-avatar.png',
    replyingTo: raw.replying_to ?? null,
    comment: raw.comment ?? '',
    date: raw.created_at ?? new Date().toISOString(),
    upvotes: Number(raw.vote_score ?? raw.net_votes ?? 0),
    replyCount: Number(raw.reply_count ?? raw.replies?.length ?? 0),
    hasUpvoted: raw.has_upvoted ?? false,
  };
}
