export type GameStatus = 'playing' | 'completed' | 'dropped' | 'plan_to_play';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  rarity?: 'common' | 'uncommon' | 'rare' | 'legendary';
}

export interface Game {
  id: string;
  title: string;
  developer: string;
  publisher?: string;
  releaseDate?: string;
  genres: string[];
  rating: number;
  coverImage: string;
  description?: string;
  platforms?: string[];
  achievements?: Achievement[];
  trending?: boolean;
}

export interface Review {
  id: string;
  gameId: string;
  userId: string;
  username: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
  gameTitle?: string;
  isMyReview?: boolean;
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
}

export interface ForumThread {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  replyingTo: string | null;
  comment: string;
  date: string;
  upvotes: number;
  replyCount: number;
  hasUpvoted?: boolean;
  depth?: number;
  replies?: ForumThread[];
}

export interface CuratedList {
  id: string;
  title: string;
  description: string;
  userId?: string;
  username: string;
  avatar: string;
  gameIds: string[];
  gameCount?: number;
  covers?: string[];
  upvotes: number;
  downvotes: number;
  hasUpvoted?: boolean;
}

export interface UserLibraryEntry {
  gameId: string;
  status: GameStatus;
}
