import Link from 'next/link';
import { count, eq, or } from 'drizzle-orm';
import { Calendar, List, Star, Trophy, UserRound, Edit2 } from 'lucide-react';
import { list as userLists, reviews, user_achievements, user_library, users, games } from '@/db/schema';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { ProfileTabs, LibraryItem } from '@/components/pages/ProfileTabs';
import { db } from '@/lib/db';

interface ProfileResponse {
  user_id: string;
  username: string;
  join_date: string;
  avatar_url: string | null;
  stats: {
    game_count: number;
    review_count: number;
    list_count: number;
    achievement_count: number;
  };
  library: LibraryItem[];
  reviews: Review[];
  gameTitles: Record<string, string>;
}

import { getServerSession } from '@/lib/auth';
import { toGame, toList, toReview } from '@/lib/ui-data';
import type { Review } from '@/types/app';

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000';
  const identifier = decodeURIComponent(username);
  
  const [profile, session] = await Promise.all([
    getProfile(identifier),
    getServerSession()
  ]);

  if (!profile) {
    return (
      <div style={{ minHeight: '70vh', background: 'var(--gl-bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ textAlign: 'center', color: '#8888A0' }}>
          <UserRound size={42} style={{ margin: '0 auto 14px', opacity: 0.5 }} />
          <h1 style={{ margin: '0 0 8px', color: '#F0F0F5', fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.5rem' }}>User not found</h1>
          <Link href="/" style={{ color: '#6C63FF', textDecoration: 'none', fontWeight: 700 }}>Go home</Link>
        </div>
      </div>
    );
  }

  const joined = profile.join_date ? new Date(profile.join_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Unknown';
  const avatar = profile.avatar_url ?? 'https://www.nicepng.com/png/detail/115-1150821_default-avatar-comments-sign-in-icon-png.png';

  const { desc, sql } = await import('drizzle-orm');
  const { list_items } = await import('@/db/schema');

  const [userListsRaw, gamesListRaw] = await Promise.all([
    db
      .select({
        list_id: userLists.list_id,
        title: userLists.title,
        description: userLists.description,
        list_cover_url: userLists.list_cover_url,
        created_at: userLists.created_at,
        username: users.username,
        vote_score: sql<number>`count_list_vote(${userLists.list_id})`.as('vote_score'),
        game_count: sql<number>`CAST(COUNT(DISTINCT ${list_items.item_id}) AS INTEGER)`.as('game_count'),
        covers: sql<string[]>`array_agg(DISTINCT ${games.cover_url}) FILTER (WHERE ${games.cover_url} IS NOT NULL)`.as('covers'),
        has_upvoted: sql<boolean>`EXISTS(SELECT 1 FROM list_votes WHERE list_id = ${userLists.list_id} AND user_id = ${session?.user?.user_id ? session.user.user_id : '00000000-0000-0000-0000-000000000000'}::uuid AND vote_type = true)`.as('has_upvoted')
      })
      .from(userLists)
      .innerJoin(users, eq(userLists.user_id, users.user_id))
      .leftJoin(list_items, eq(userLists.list_id, list_items.list_id))
      .leftJoin(games, eq(list_items.game_id, games.game_id))
      .where(eq(userLists.user_id, profile.user_id))
      .groupBy(userLists.list_id, users.username)
      .orderBy(desc(userLists.created_at)),
    db
      .select({
        game_id: games.game_id,
        title: games.title,
        developer: games.developer,
        release_date: games.release_date,
        average_rating: games.average_rating,
        cover_url: games.cover_url,
      })
      .from(games)
      .orderBy(desc(games.average_rating))
      .limit(80)
  ]);

  const profileUserLists = userListsRaw.map(toList);
  const gamesList = gamesListRaw.map(toGame);
  const stats = [
    { label: 'Games', value: profile.stats.game_count, color: '#6C63FF' },
    { label: 'Reviews', value: profile.stats.review_count, color: '#FFB547' },
    { label: 'Lists', value: profile.stats.list_count, color: '#39FF85' },
  ];

  return (
    <div style={{ background: 'var(--gl-bg-base)', minHeight: '100vh', paddingBottom: 64 }}>
      <section style={{ background: 'var(--gl-bg-surface)', borderBottom: '1px solid var(--gl-border)', padding: '48px 24px 0' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32, flexWrap: 'wrap' }}>
            <div style={{ width: 96, height: 96, borderRadius: '50%', overflow: 'hidden', border: '3px solid rgba(108,99,255,0.4)', boxShadow: '0 0 0 4px rgba(108,99,255,0.1)' }}>
              <ImageWithFallback src={avatar} alt={profile.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 10 }}>
                <h1 style={{ margin: 0, fontFamily: 'Space Grotesk, sans-serif', fontSize: '2rem', fontWeight: 700, color: '#F0F0F5' }}>{profile.username}</h1>

              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#8888A0', fontSize: '0.86rem' }}>
                <Calendar size={14} />
                Joined {joined}
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', borderTop: '1px solid var(--gl-border)' }}>
            {stats.map((stat, index) => {
              return (
                <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', borderRight: index < stats.length - 1 ? '1px solid var(--gl-border)' : 'none' }}>
                  <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '2rem', fontWeight: 700, color: stat.color, lineHeight: 1, marginBottom: 8 }}>{stat.value.toLocaleString()}</div>
                  <span style={{ color: '#8888A0', fontSize: '0.9rem', fontWeight: 500 }}>{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <ProfileTabs 
        library={profile.library} 
        lists={profileUserLists} 
        games={gamesList} 
        reviews={profile.reviews}
        gameTitles={profile.gameTitles}
        isOwnProfile={session?.user?.user_id === profile.user_id} 
      />
    </div>
  );
}

async function getProfile(identifier: string): Promise<ProfileResponse | null> {
  const normalizedEmail = identifier.trim().toLowerCase();
  const [user] = await db
    .select({
      user_id: users.user_id,
      username: users.username,
      join_date: users.join_date,
      avatar_url: users.avatar_url,
    })
    .from(users)
    .where(or(eq(users.username, identifier), eq(users.email, normalizedEmail)))
    .limit(1);

  if (!user) return null;

  const [{ count: game_count }] = await db
    .select({ count: count() })
    .from(user_library)
    .where(eq(user_library.user_id, user.user_id));

  const [{ count: review_count }] = await db
    .select({ count: count() })
    .from(reviews)
    .where(eq(reviews.user_id, user.user_id));

  const [{ count: list_count }] = await db
    .select({ count: count() })
    .from(userLists)
    .where(eq(userLists.user_id, user.user_id));

  const [{ count: achievement_count }] = await db
    .select({ count: count() })
    .from(user_achievements)
    .where(eq(user_achievements.user_id, user.user_id));

  const library = await db
    .select({
      library_id: user_library.library_id,
      game_id: user_library.game_id,
      play_status: user_library.play_status,
      added_at: user_library.added_at,
      title: games.title,
      cover_url: games.cover_url,
    })
    .from(user_library)
    .innerJoin(games, eq(user_library.game_id, games.game_id))
    .where(eq(user_library.user_id, user.user_id))
    .orderBy(user_library.added_at);

  const rawReviews = await db
    .select({
      id: reviews.review_id,
      gameId: reviews.game_id,
      userId: reviews.user_id,
      username: users.username,
      avatar: users.avatar_url,
      rating: reviews.rating,
      text: reviews.review_text,
      date: reviews.created_at,
      gameTitle: games.title
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.user_id, users.user_id))
    .innerJoin(games, eq(reviews.game_id, games.game_id))
    .where(eq(reviews.user_id, user.user_id))
    .orderBy(reviews.created_at);

  const mappedReviews = rawReviews.map(r => toReview(r));
  const gameTitles: Record<string, string> = {};
  rawReviews.forEach(r => {
    gameTitles[r.gameId] = r.gameTitle;
  });

  return {
    ...user,
    join_date: user.join_date.toISOString(),
    stats: {
      game_count,
      review_count,
      list_count,
      achievement_count,
    },
    library: library.map(l => ({ ...l, added_at: l.added_at.toISOString() })),
    reviews: JSON.parse(JSON.stringify(mappedReviews.reverse())),
    gameTitles
  };
}
