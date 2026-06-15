import { pgTable, uuid, varchar, text, timestamp, decimal, date, boolean } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  user_id: uuid('user_id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 50 }).notNull(),
  email: varchar('email', { length: 100 }).notNull(),
  password_hash: varchar('password_hash', { length: 255 }).notNull(),
  join_date: timestamp('join_date').notNull().defaultNow(),
  avatar_url: varchar('avatar_url', { length: 255 }),
})

export const games = pgTable('games', {
  game_id: uuid('game_id').primaryKey().defaultRandom(),
  title: varchar('title', { length: 150 }).notNull(),
  developer: varchar('developer', { length: 100 }),
  release_date: date('release_date'),
  description: text('description'),
  average_rating: decimal('average_rating', { precision: 3, scale: 2 }).default('0.00'),
  cover_url: varchar('cover_url', { length: 255 }),
})

export const genres = pgTable('genres', {
  genre_id: uuid('genre_id').primaryKey().defaultRandom(),
  genre_name: varchar('genre_name', { length: 50 }).notNull(),
  description: text('description'),
})

export const game_genres = pgTable('game_genres', {
  game_id: uuid('game_id').notNull(),
  genre_id: uuid('genre_id').notNull(),
})

export const achievements = pgTable('achievements', {
  achievement_id: uuid('achievement_id').primaryKey().defaultRandom(),
  game_id: uuid('game_id').notNull(),
  achievement_name: varchar('achievement_name', { length: 100 }).notNull(),
  description: text('description'),
})

export const user_achievements = pgTable('user_achievements', {
  user_id: uuid('user_id').notNull(),
  achievement_id: uuid('achievement_id').notNull(),
})

export const reviews = pgTable('reviews', {
  review_id: uuid('review_id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  game_id: uuid('game_id').notNull(),
  rating: decimal('rating', { precision: 3, scale: 2 }).notNull(),
  review_text: text('review_text').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
})

export const user_library = pgTable('user_library', {
  library_id: uuid('library_id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  game_id: uuid('game_id').notNull(),
  play_status: varchar('play_status', { length: 20 }).notNull(),
  added_at: timestamp('added_at').notNull().defaultNow(),
})

export const list = pgTable('list', {
  list_id: uuid('list_id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  title: varchar('title', { length: 100 }).notNull(),
  description: text('description'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  list_cover_url: varchar('list_cover_url', { length: 255 }),
})

export const list_items = pgTable('list_items', {
  item_id: uuid('item_id').primaryKey().defaultRandom(),
  list_id: uuid('list_id').notNull(),
  game_id: uuid('game_id').notNull(),
  added_at: timestamp('added_at').notNull().defaultNow(),
})

export const list_votes = pgTable('list_votes', {
  list_id: uuid('list_id').notNull(),
  user_id: uuid('user_id').notNull(),
  vote_type: boolean('vote_type').notNull(),
})

export const review_votes = pgTable('review_votes', {
  review_id: uuid('review_id').notNull(),
  user_id: uuid('user_id').notNull(),
  vote_type: boolean('vote_type').notNull(), // true = upvote, false = downvote
})

export const thread = pgTable('thread', {
  thread_id: uuid('thread_id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').notNull(),
  replying_to: uuid('replying_to'),
  comment: text('comment').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
})

export const thread_votes = pgTable('thread_votes', {
  thread_id: uuid('thread_id').notNull(),
  user_id: uuid('user_id').notNull(),
  vote_type: boolean('vote_type').notNull(),
})

export const audit_log = pgTable('audit_log', {
  log_id: uuid('log_id').primaryKey().defaultRandom(),
  table_name: varchar('table_name', { length: 50 }).notNull(),
  record_id: uuid('record_id').notNull(),
  action_type: varchar('action_type', { length: 20 }).notNull(),
  old_data: text('old_data'),
  action_timestamp: timestamp('action_timestamp').notNull().defaultNow(),
})