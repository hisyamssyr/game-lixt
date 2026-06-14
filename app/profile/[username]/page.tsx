import Link from 'next/link';
import { count, eq, or } from 'drizzle-orm';
import { Calendar, List, Star, Trophy, UserRound } from 'lucide-react';
import { list as userLists, reviews, user_achievements, user_library, users } from '@/db/schema';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { ProfileTabs } from '@/components/pages/ProfileTabs';
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
}

export default async function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const identifier = decodeURIComponent(username);
  const profile = await getProfile(identifier);

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
  const avatar = profile.avatar_url ?? 'https://picsum.photos/seed/game-lixt-user/120/120';
  const stats = [
    { label: 'Games', value: profile.stats.game_count, color: '#6C63FF', icon: UserRound },
    { label: 'Reviews', value: profile.stats.review_count, color: '#FFB547', icon: Star },
    { label: 'Lists', value: profile.stats.list_count, color: '#39FF85', icon: List },
    { label: 'Achievements', value: profile.stats.achievement_count, color: '#3B82F6', icon: Trophy },
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
              <h1 style={{ margin: '0 0 10px', fontFamily: 'Space Grotesk, sans-serif', fontSize: '2rem', fontWeight: 700, color: '#F0F0F5' }}>{profile.username}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#8888A0', fontSize: '0.86rem' }}>
                <Calendar size={14} />
                Joined {joined}
              </div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', borderTop: '1px solid var(--gl-border)' }}>
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} style={{ padding: '18px 22px', borderRight: index < stats.length - 1 ? '1px solid var(--gl-border)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: stat.color }}>
                    <Icon size={15} />
                    <span style={{ color: '#8888A0', fontSize: '0.76rem' }}>{stat.label}</span>
                  </div>
                  <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '1.45rem', fontWeight: 700, color: stat.color, lineHeight: 1 }}>{stat.value.toLocaleString()}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <ProfileTabs />
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

  return {
    ...user,
    join_date: user.join_date.toISOString(),
    stats: {
      game_count,
      review_count,
      list_count,
      achievement_count,
    },
  };
}
