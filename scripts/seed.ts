import { config } from 'dotenv';
config({ path: '.env.local' });
import { db } from '../lib/db';
import {
  users,
  games,
  genres,
  game_genres,
  achievements,
  user_achievements,
  reviews,
  user_library,
  list,
  list_items,
  list_votes,
  thread,
  thread_votes,
} from '../db/schema';
import { eq, sql } from 'drizzle-orm';
import crypto from 'crypto';

function generateId() {
  return crypto.randomUUID();
}

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Clear existing data (optional, but good for idempotent seeding)
    console.log('Clearing existing data...');
    await db.execute(sql`TRUNCATE TABLE thread_votes, thread, list_votes, list_items, list, user_library, reviews, user_achievements, achievements, game_genres, genres, games, users, audit_log CASCADE`);

    // 2. Insert Users
    console.log('Inserting users...');
    const userIds = Array.from({ length: 15 }, () => generateId());
    
    // Hash a common password for simplicity
    const password_hash = '$2a$10$X8O9.C1L4.h8E6hO0I0t9.X.a0r.0.A1A1.A1A1.A1A1.A1A1.A1A1'; // Dummy bcrypt hash for 'password123'
    
    const usersData = [
      { user_id: userIds[0], username: 'hisyamssyr', email: 'hisyam@example.com', password_hash, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hisyam' },
      { user_id: userIds[1], username: 'gamer_king', email: 'king@example.com', password_hash, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=king' },
      { user_id: userIds[2], username: 'rpg_fanatic', email: 'rpg@example.com', password_hash, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=rpg' },
      { user_id: userIds[3], username: 'noobmaster69', email: 'noob@example.com', password_hash, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=noob' },
      { user_id: userIds[4], username: 'pro_player', email: 'pro@example.com', password_hash, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pro' },
      { user_id: userIds[5], username: 'casual_gamer', email: 'casual@example.com', password_hash, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=casual' },
      { user_id: userIds[6], username: 'speedrunner_x', email: 'speed@example.com', password_hash, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=speedrunner' },
      { user_id: userIds[7], username: 'retro_lover', email: 'retro@example.com', password_hash, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=retro' },
      { user_id: userIds[8], username: 'moba_god', email: 'moba@example.com', password_hash, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=moba' },
      { user_id: userIds[9], username: 'fps_shooter', email: 'fps@example.com', password_hash, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fps' },
      { user_id: userIds[10], username: 'indie_supporter', email: 'indie@example.com', password_hash, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=indie' },
      { user_id: userIds[11], username: 'story_enjoyer', email: 'story@example.com', password_hash, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=story' },
      { user_id: userIds[12], username: 'achievement_hunter', email: 'hunter@example.com', password_hash, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=hunter' },
      { user_id: userIds[13], username: 'coop_buddy', email: 'coop@example.com', password_hash, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=coop' },
      { user_id: userIds[14], username: 'esports_fan', email: 'esports@example.com', password_hash, avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=esports' }
    ];
    await db.insert(users).values(usersData);

    // 3. Insert Genres
    console.log('Inserting genres...');
    const genreIds = Array.from({ length: 12 }, () => generateId());
    const genresData = [
      { genre_id: genreIds[0], genre_name: 'Action', description: 'Games focused on physical challenges' },
      { genre_id: genreIds[1], genre_name: 'Adventure', description: 'Games featuring exploration and puzzle solving' },
      { genre_id: genreIds[2], genre_name: 'RPG', description: 'Role-playing games' },
      { genre_id: genreIds[3], genre_name: 'Shooter', description: 'Games featuring weapon-based combat' },
      { genre_id: genreIds[4], genre_name: 'Strategy', description: 'Games focusing on skillful thinking and planning' },
      { genre_id: genreIds[5], genre_name: 'Simulation', description: 'Games simulating real-world activities' },
      { genre_id: genreIds[6], genre_name: 'Puzzle', description: 'Games emphasizing logic and conceptual challenges' },
      { genre_id: genreIds[7], genre_name: 'Sports', description: 'Games simulating traditional physical sports' },
      { genre_id: genreIds[8], genre_name: 'Racing', description: 'Games focused on competing in vehicles' },
      { genre_id: genreIds[9], genre_name: 'Fighting', description: 'Games featuring close-combat between characters' },
      { genre_id: genreIds[10], genre_name: 'Platformer', description: 'Games involving navigating environments by jumping' },
      { genre_id: genreIds[11], genre_name: 'Horror', description: 'Games designed to scare the player' }
    ];
    await db.insert(genres).values(genresData);

    // 4. Insert Games
    console.log('Inserting games...');
    const gameIds = Array.from({ length: 25 }, () => generateId());
    const gamesData = [
      { game_id: gameIds[0], title: 'The Witcher 3: Wild Hunt', developer: 'CD Projekt Red', release_date: '2015-05-19', description: 'A story-driven, next-generation open world role-playing game.', average_rating: '9.90', cover_url: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/292030/library_600x900.jpg' },
      { game_id: gameIds[1], title: 'Red Dead Redemption 2', developer: 'Rockstar Games', release_date: '2018-10-26', description: 'An epic tale of life in America’s unforgiving heartland.', average_rating: '9.80', cover_url: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1174180/library_600x900.jpg' },
      { game_id: gameIds[2], title: 'Grand Theft Auto V', developer: 'Rockstar North', release_date: '2013-09-17', description: 'When a young street hustler, a retired bank robber and a terrifying psychopath find themselves entangled with some of the most frightening and deranged elements of the criminal underworld.', average_rating: '9.60', cover_url: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/271590/library_600x900.jpg' },
      { game_id: gameIds[3], title: 'Elden Ring', developer: 'FromSoftware', release_date: '2022-02-25', description: 'THE NEW FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring.', average_rating: '9.70', cover_url: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1245620/library_600x900.jpg' },
      { game_id: gameIds[4], title: 'Cyberpunk 2077', developer: 'CD Projekt Red', release_date: '2020-12-10', description: 'An open-world, action-adventure story set in Night City.', average_rating: '8.40', cover_url: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1091500/library_600x900.jpg' },
      { game_id: gameIds[5], title: 'Minecraft', developer: 'Mojang Studios', release_date: '2011-11-18', description: 'Explore your own unique world, survive the night, and create anything you can imagine!', average_rating: '9.80', cover_url: 'https://upload.wikimedia.org/wikipedia/en/5/51/Minecraft_cover.png' },
      { game_id: gameIds[6], title: 'Hades', developer: 'Supergiant Games', release_date: '2020-09-17', description: 'Defy the god of the dead as you hack and slash out of the Underworld.', average_rating: '9.76', cover_url: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1145360/library_600x900.jpg' },
      { game_id: gameIds[7], title: 'Stardew Valley', developer: 'ConcernedApe', release_date: '2016-02-26', description: 'You\'ve inherited your grandfather\'s old farm plot in Stardew Valley. Armed with hand-me-down tools and a few coins, you set out to begin your new life.', average_rating: '9.84', cover_url: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/413150/library_600x900.jpg' },
      { game_id: gameIds[8], title: 'Hollow Knight', developer: 'Team Cherry', release_date: '2017-02-24', description: 'Forge your own path in Hollow Knight! An epic action adventure through a vast ruined kingdom of insects and heroes.', average_rating: '9.74', cover_url: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/367520/library_600x900.jpg' },
      { game_id: gameIds[9], title: 'Persona 5 Royal', developer: 'Atlus', release_date: '2019-10-31', description: 'Prepare for an all-new RPG experience in Persona 5 Royal based in the universe of the award-winning series, Persona!', average_rating: '9.90', cover_url: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1687950/library_600x900.jpg' },
      { game_id: gameIds[10], title: 'The Legend of Zelda: Breath of the Wild', developer: 'Nintendo EPD', release_date: '2017-03-03', description: 'Step into a world of discovery, exploration and adventure in The Legend of Zelda: Breath of the Wild.', average_rating: '9.90', cover_url: 'https://upload.wikimedia.org/wikipedia/en/c/c6/The_Legend_of_Zelda_Breath_of_the_Wild.jpg' },
      { game_id: gameIds[11], title: 'Super Mario Odyssey', developer: 'Nintendo EPD', release_date: '2017-10-27', description: 'Explore incredible places far from the Mushroom Kingdom as you join Mario and his new ally Cappy on a massive, globe-trotting 3D adventure.', average_rating: '9.70', cover_url: 'https://upload.wikimedia.org/wikipedia/en/8/8d/Super_Mario_Odyssey.jpg' },
      { game_id: gameIds[12], title: 'Doom Eternal', developer: 'id Software', release_date: '2020-03-20', description: 'Hell’s armies have invaded Earth. Become the Slayer in an epic single-player campaign to conquer demons across dimensions and stop the final destruction of humanity.', average_rating: '9.50', cover_url: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/782330/library_600x900.jpg' },
      { game_id: gameIds[13], title: 'God of War', developer: 'Santa Monica Studio', release_date: '2018-04-20', description: 'His vengeance against the Gods of Olympus years behind him, Kratos now lives as a man in the realm of Norse Gods and monsters.', average_rating: '9.80', cover_url: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1593500/library_600x900.jpg' },
      { game_id: gameIds[14], title: 'Bloodborne', developer: 'FromSoftware', release_date: '2015-03-24', description: 'Hunt your nightmares as you search for answers in the ancient city of Yharnam, now cursed with a strange endemic illness spreading through the streets like wildfire.', average_rating: '9.76', cover_url: 'https://upload.wikimedia.org/wikipedia/en/6/68/Bloodborne_Cover_Wallpaper.jpg' },
      { game_id: gameIds[15], title: 'Sekiro: Shadows Die Twice', developer: 'FromSoftware', release_date: '2019-03-22', description: 'In Sekiro: Shadows Die Twice you are the "one-armed wolf", a disgraced and disfigured warrior rescued from the brink of death.', average_rating: '9.60', cover_url: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/814380/library_600x900.jpg' },
      { game_id: gameIds[16], title: 'Half-Life 2', developer: 'Valve', release_date: '2004-11-16', description: '1998. HALF-LIFE sends a shock through the game industry with its combination of pounding action and continuous, immersive storytelling.', average_rating: '9.84', cover_url: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/220/library_600x900.jpg' },
      { game_id: gameIds[17], title: 'Portal 2', developer: 'Valve', release_date: '2011-04-18', description: 'Portal 2 draws from the award-winning formula of innovative gameplay, story, and music that earned the original Portal over 70 industry accolades and created a cult following.', average_rating: '9.90', cover_url: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/620/library_600x900.jpg' },
      { game_id: gameIds[18], title: 'Terraria', developer: 'Re-Logic', release_date: '2011-05-16', description: 'Dig, fight, explore, build! Nothing is impossible in this action-packed adventure game.', average_rating: '9.60', cover_url: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/105600/library_600x900.jpg' },
      { game_id: gameIds[19], title: 'Baldur\'s Gate 3', developer: 'Larian Studios', release_date: '2023-08-03', description: 'Gather your party, and return to the Forgotten Realms in a tale of fellowship and betrayal, sacrifice and survival, and the lure of absolute power.', average_rating: '9.96', cover_url: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1086940/library_600x900.jpg' },
      { game_id: gameIds[20], title: 'Celeste', developer: 'Extremely OK Games', release_date: '2018-01-25', description: 'Help Madeline survive her inner demons on her journey to the top of Celeste Mountain, in this super-tight platformer.', average_rating: '9.70', cover_url: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/504230/library_600x900.jpg' },
      { game_id: gameIds[21], title: 'Subnautica', developer: 'Unknown Worlds Entertainment', release_date: '2018-01-23', description: 'Descend into the depths of an alien underwater world filled with wonder and peril.', average_rating: '9.60', cover_url: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/264710/library_600x900.jpg' },
      { game_id: gameIds[22], title: 'Outer Wilds', developer: 'Mobius Digital', release_date: '2019-05-28', description: 'Named Game of the Year 2019 by Giant Bomb, Polygon, Eurogamer, and The Guardian, Outer Wilds is a critically-acclaimed and award-winning open world mystery about a solar system trapped in an endless time loop.', average_rating: '9.80', cover_url: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1062000/library_600x900.jpg' },
      { game_id: gameIds[23], title: 'Factorio', developer: 'Wube Software', release_date: '2020-08-14', description: 'Factorio is a game about building and creating automated factories to produce items of increasing complexity.', average_rating: '9.70', cover_url: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/427520/library_600x900.jpg' },
      { game_id: gameIds[24], title: 'Monster Hunter: World', developer: 'Capcom', release_date: '2018-01-26', description: 'Welcome to a new world! In Monster Hunter: World, the latest installment in the series, you can enjoy the ultimate hunting experience.', average_rating: '9.50', cover_url: 'https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/582010/library_600x900.jpg' }
    ];
    await db.insert(games).values(gamesData);

    // 5. Game Genres Links
    console.log('Inserting game-genres relations...');
    const gameGenresData = [
      { game_id: gameIds[0], genre_id: genreIds[2] }, // Witcher 3 - RPG
      { game_id: gameIds[0], genre_id: genreIds[0] }, // Witcher 3 - Action
      { game_id: gameIds[1], genre_id: genreIds[0] }, // RDR2 - Action
      { game_id: gameIds[1], genre_id: genreIds[1] }, // RDR2 - Adventure
      { game_id: gameIds[2], genre_id: genreIds[0] }, // GTA V - Action
      { game_id: gameIds[3], genre_id: genreIds[2] }, // Elden Ring - RPG
      { game_id: gameIds[3], genre_id: genreIds[0] }, // Elden Ring - Action
      { game_id: gameIds[4], genre_id: genreIds[2] }, // Cyberpunk 2077 - RPG
      { game_id: gameIds[5], genre_id: genreIds[1] }, // Minecraft - Adventure
      { game_id: gameIds[5], genre_id: genreIds[5] }, // Minecraft - Simulation
      { game_id: gameIds[6], genre_id: genreIds[0] }, // Hades - Action
      { game_id: gameIds[6], genre_id: genreIds[2] }, // Hades - RPG
      { game_id: gameIds[7], genre_id: genreIds[2] }, // Stardew - RPG
      { game_id: gameIds[7], genre_id: genreIds[5] }, // Stardew - Simulation
      { game_id: gameIds[8], genre_id: genreIds[0] }, // Hollow Knight - Action
      { game_id: gameIds[8], genre_id: genreIds[10] },// Hollow Knight - Platformer
      { game_id: gameIds[9], genre_id: genreIds[2] }, // Persona 5 - RPG
      { game_id: gameIds[10], genre_id: genreIds[0] },// BotW - Action
      { game_id: gameIds[10], genre_id: genreIds[1] },// BotW - Adventure
      { game_id: gameIds[11], genre_id: genreIds[10] },// Mario - Platformer
      { game_id: gameIds[12], genre_id: genreIds[0] },// Doom - Action
      { game_id: gameIds[12], genre_id: genreIds[3] },// Doom - Shooter
      { game_id: gameIds[13], genre_id: genreIds[0] },// God of War - Action
      { game_id: gameIds[13], genre_id: genreIds[1] },// God of War - Adventure
      { game_id: gameIds[14], genre_id: genreIds[0] },// Bloodborne - Action
      { game_id: gameIds[14], genre_id: genreIds[2] },// Bloodborne - RPG
      { game_id: gameIds[15], genre_id: genreIds[0] },// Sekiro - Action
      { game_id: gameIds[16], genre_id: genreIds[0] },// Half-Life 2 - Action
      { game_id: gameIds[16], genre_id: genreIds[3] },// Half-Life 2 - Shooter
      { game_id: gameIds[17], genre_id: genreIds[6] },// Portal 2 - Puzzle
      { game_id: gameIds[18], genre_id: genreIds[1] },// Terraria - Adventure
      { game_id: gameIds[19], genre_id: genreIds[2] },// BG3 - RPG
      { game_id: gameIds[19], genre_id: genreIds[4] },// BG3 - Strategy
      { game_id: gameIds[20], genre_id: genreIds[10] },// Celeste - Platformer
      { game_id: gameIds[21], genre_id: genreIds[1] },// Subnautica - Adventure
      { game_id: gameIds[22], genre_id: genreIds[1] },// Outer Wilds - Adventure
      { game_id: gameIds[22], genre_id: genreIds[6] },// Outer Wilds - Puzzle
      { game_id: gameIds[23], genre_id: genreIds[4] },// Factorio - Strategy
      { game_id: gameIds[23], genre_id: genreIds[5] },// Factorio - Simulation
      { game_id: gameIds[24], genre_id: genreIds[0] },// MHW - Action
      { game_id: gameIds[24], genre_id: genreIds[2] } // MHW - RPG
    ];
    await db.insert(game_genres).values(gameGenresData);

    // 6. Insert Achievements
    console.log('Inserting achievements...');
    const achievementIds = Array.from({ length: 40 }, () => generateId());
    const achievementsData = [
      { achievement_id: achievementIds[0], game_id: gameIds[0], achievement_name: 'Passed the Trial', description: 'Finish the game on any difficulty.' },
      { achievement_id: achievementIds[1], game_id: gameIds[0], achievement_name: 'Geralt: The Professional', description: 'Complete all witcher contracts.' },
      { achievement_id: achievementIds[2], game_id: gameIds[1], achievement_name: 'Legend of the West', description: 'Legend of the West.' },
      { achievement_id: achievementIds[3], game_id: gameIds[1], achievement_name: 'Best in the West', description: 'Attain 100% completion.' },
      { achievement_id: achievementIds[4], game_id: gameIds[2], achievement_name: 'Welcome to Los Santos', description: 'You repo\'d a car and raced it through the heart of a sun-soaked metropolis.' },
      { achievement_id: achievementIds[5], game_id: gameIds[3], achievement_name: 'Elden Ring', description: 'Earned all achievements.' },
      { achievement_id: achievementIds[6], game_id: gameIds[4], achievement_name: 'Never Fade Away', description: 'Unlock all Trophies.' },
      { achievement_id: achievementIds[7], game_id: gameIds[5], achievement_name: 'Taking Inventory', description: 'Open your inventory.' },
      { achievement_id: achievementIds[8], game_id: gameIds[5], achievement_name: 'The End?', description: 'Enter an End Portal.' },
      { achievement_id: achievementIds[9], game_id: gameIds[6], achievement_name: 'Is There No Escape?', description: 'Clear a run attempt.' },
      { achievement_id: achievementIds[10], game_id: gameIds[7], achievement_name: 'Greenhorn', description: 'Earn 15,000g' },
      { achievement_id: achievementIds[11], game_id: gameIds[7], achievement_name: 'Master Angler', description: 'Catch every fish.' },
      { achievement_id: achievementIds[12], game_id: gameIds[8], achievement_name: 'Charmed', description: 'Acquire your first Charm.' },
      { achievement_id: achievementIds[13], game_id: gameIds[9], achievement_name: 'The Phantom Thieves', description: 'Form the Phantom Thieves of Hearts.' },
      { achievement_id: achievementIds[14], game_id: gameIds[12], achievement_name: 'Heavy Metal', description: 'Earn all trophies.' },
      { achievement_id: achievementIds[15], game_id: gameIds[13], achievement_name: 'Father and Son', description: 'Obtain all other trophies.' },
      { achievement_id: achievementIds[16], game_id: gameIds[14], achievement_name: 'Bloodborne', description: 'All trophies acquired. Hats off!' },
      { achievement_id: achievementIds[17], game_id: gameIds[15], achievement_name: 'Sekiro', description: 'All trophies have been unlocked.' },
      { achievement_id: achievementIds[18], game_id: gameIds[16], achievement_name: 'Trusty Hardware', description: 'Get the crowbar.' },
      { achievement_id: achievementIds[19], game_id: gameIds[17], achievement_name: 'Wake Up Call', description: 'Survive the manual override.' },
      { achievement_id: achievementIds[20], game_id: gameIds[18], achievement_name: 'Timber!', description: 'Chop down your first tree.' },
      { achievement_id: achievementIds[21], game_id: gameIds[19], achievement_name: 'Descent from Avernus', description: 'Take control of the nautiloid and escape the Hells.' },
      { achievement_id: achievementIds[22], game_id: gameIds[20], achievement_name: 'Strawberry', description: 'Collect a strawberry.' },
      { achievement_id: achievementIds[23], game_id: gameIds[21], achievement_name: 'Getting Your Feet Wet', description: 'Dive for the very first time.' },
      { achievement_id: achievementIds[24], game_id: gameIds[22], achievement_name: 'You\'ve met a terrible fate.', description: 'You know what you did.' },
      { achievement_id: achievementIds[25], game_id: gameIds[23], achievement_name: 'Smoke me a kipper', description: 'Finish the game.' },
      { achievement_id: achievementIds[26], game_id: gameIds[24], achievement_name: 'Welcome to the New World', description: 'Earn the right to take on two-star assignments.' },
      { achievement_id: achievementIds[27], game_id: gameIds[0], achievement_name: 'Dendrologist', description: 'Acquire all the Abilities in one tree.' },
      { achievement_id: achievementIds[28], game_id: gameIds[1], achievement_name: 'Lending a Hand', description: 'Complete all optional Honor story missions.' },
      { achievement_id: achievementIds[29], game_id: gameIds[2], achievement_name: 'Solid Gold, Baby!', description: 'Earn 70 Gold Medals across Missions, Strangers and Freaks.' },
      { achievement_id: achievementIds[30], game_id: gameIds[3], achievement_name: 'Shardbearer Godrick', description: 'Defeat Shardbearer Godrick.' },
      { achievement_id: achievementIds[31], game_id: gameIds[4], achievement_name: 'Breathtaking', description: 'Collect all items that once belonged to Johnny Silverhand.' },
      { achievement_id: achievementIds[32], game_id: gameIds[5], achievement_name: 'Diamonds!', description: 'Acquire diamonds with your iron pickaxe.' },
      { achievement_id: achievementIds[33], game_id: gameIds[6], achievement_name: 'Escaped the Underworld', description: 'Successfully escape the Underworld 10 times.' },
      { achievement_id: achievementIds[34], game_id: gameIds[7], achievement_name: 'Millionaire', description: 'Earn 1,000,000g' },
      { achievement_id: achievementIds[35], game_id: gameIds[8], achievement_name: 'Hollow Knight', description: 'Defeat the Hollow Knight and become the Vessel.' },
      { achievement_id: achievementIds[36], game_id: gameIds[9], achievement_name: 'Great Phantom Thieves Convene', description: 'Max out all Confidants.' },
      { achievement_id: achievementIds[37], game_id: gameIds[12], achievement_name: 'Treasure Hunter', description: 'Beat all encounters and Mission Challenges.' },
      { achievement_id: achievementIds[38], game_id: gameIds[13], achievement_name: 'Chooser of the Slain', description: 'Defeat the nine Valkyries.' },
      { achievement_id: achievementIds[39], game_id: gameIds[14], achievement_name: 'Yharnam Sunrise', description: 'You lived through the hunt, and saw another day.' }
    ];
    await db.insert(achievements).values(achievementsData);

    // 7. User Library
    console.log('Inserting user libraries...');
    const libraryStatuses = ['Playing', 'Completed', 'Plan to Play', 'Dropped'];
    const userLibraryData = [];
    for (let i = 0; i < userIds.length; i++) {
      // Each user has 5-15 random games
      const numGames = Math.floor(Math.random() * 11) + 5;
      const shuffledGames = [...gameIds].sort(() => 0.5 - Math.random());
      for (let j = 0; j < numGames; j++) {
        userLibraryData.push({
          user_id: userIds[i],
          game_id: shuffledGames[j],
          play_status: libraryStatuses[Math.floor(Math.random() * libraryStatuses.length)],
        });
      }
    }
    await db.insert(user_library).values(userLibraryData);

    // 8. Reviews
    console.log('Inserting reviews...');
    const reviewData = [];
    // Just a sample of reviews based on the library
    for (const item of userLibraryData) {
      // 50% chance a user reviews a game they have
      if (Math.random() > 0.5) {
        let rating = 0;
        let review_text = '';
        if (item.play_status === 'Completed') {
          rating = (Math.random() * 3) + 7; // 7 to 10
          review_text = 'Amazing game, definitely one of the best I have played. Highly recommended to everyone!';
        } else if (item.play_status === 'Dropped') {
          rating = (Math.random() * 4) + 1; // 1 to 5
          review_text = 'Could not get into it. The controls felt clunky and the story was boring.';
        } else {
          rating = (Math.random() * 9) + 1; // 1 to 10
          review_text = 'Playing it right now, having a decent time. Will update when finished.';
        }
        rating = Math.round(rating * 10) / 10; // 1 decimal place

        reviewData.push({
          user_id: item.user_id,
          game_id: item.game_id,
          rating: rating.toString(),
          review_text: review_text,
        });
      }
    }
    if (reviewData.length > 0) {
      await db.insert(reviews).values(reviewData);
    }

    // 9. User Achievements
    console.log('Inserting user achievements...');
    const userAchData = [];
    for (const item of userLibraryData) {
      if (item.play_status === 'Completed' || item.play_status === 'Playing') {
        const gameAchs = achievementsData.filter(a => a.game_id === item.game_id);
        if (gameAchs.length > 0) {
          // Grant 1 to all available achievements
          const numAch = Math.floor(Math.random() * gameAchs.length) + 1;
          for (let k = 0; k < numAch; k++) {
            userAchData.push({
              user_id: item.user_id,
              achievement_id: gameAchs[k].achievement_id,
            });
          }
        }
      }
    }
    // Remove duplicates
    const uniqueUserAchData = userAchData.filter((v,i,a)=>a.findIndex(v2=>(v2.user_id===v.user_id && v2.achievement_id===v.achievement_id))===i);
    if (uniqueUserAchData.length > 0) {
      await db.insert(user_achievements).values(uniqueUserAchData);
    }

    // 10. Lists & List Items
    console.log('Inserting lists and items...');
    const listIds = Array.from({ length: 8 }, () => generateId());
    const listsData = [
      { list_id: listIds[0], user_id: userIds[0], title: 'My Top 10 Games of All Time', description: 'The absolute best games ever created.', list_cover_url: gamesData[0].cover_url },
      { list_id: listIds[1], user_id: userIds[1], title: 'Games with the Best Story', description: 'Masterpieces in narrative design.', list_cover_url: gamesData[4].cover_url },
      { list_id: listIds[2], user_id: userIds[2], title: 'Must Play RPGs', description: 'If you love RPGs, you must play these.', list_cover_url: gamesData[3].cover_url },
      { list_id: listIds[3], user_id: userIds[3], title: 'Cozy Games for Weekend', description: 'Relax and farm.', list_cover_url: gamesData[7].cover_url },
      { list_id: listIds[4], user_id: userIds[4], title: 'Hardest Games Ever', description: 'Prepare to cry.', list_cover_url: gamesData[14].cover_url },
      { list_id: listIds[5], user_id: userIds[5], title: 'Greatest Indie Hits', description: 'Support independent developers.', list_cover_url: gamesData[8].cover_url },
      { list_id: listIds[6], user_id: userIds[6], title: 'Speedrun Potential', description: 'Gotta go fast.', list_cover_url: gamesData[20].cover_url },
      { list_id: listIds[7], user_id: userIds[7], title: 'Nostalgic Classics', description: 'Takes me back.', list_cover_url: gamesData[16].cover_url }
    ];
    await db.insert(list).values(listsData);

    const listItemsData = [];
    const listVotesData = [];
    for (let i = 0; i < listIds.length; i++) {
      const numItems = Math.floor(Math.random() * 6) + 4; // 4 to 9 items
      const shuffled = [...gameIds].sort(() => 0.5 - Math.random());
      for (let j = 0; j < numItems; j++) {
        listItemsData.push({
          list_id: listIds[i],
          game_id: shuffled[j],
        });
      }

      // Votes for list
      const possibleVoters = userIds.filter(id => id !== listsData[i].user_id);
      const numVotes = Math.floor(Math.random() * Math.min(10, possibleVoters.length));
      const shuffledUsers = [...possibleVoters].sort(() => 0.5 - Math.random());
      for(let v = 0; v < numVotes; v++) {
        listVotesData.push({
          list_id: listIds[i],
          user_id: shuffledUsers[v],
          vote_type: Math.random() > 0.2 // 80% upvote
        });
      }
    }
    await db.insert(list_items).values(listItemsData);
    if (listVotesData.length > 0) {
      await db.insert(list_votes).values(listVotesData);
    }

    // 11. Threads
    console.log('Inserting threads (forum/comments)...');
    const threadIds = Array.from({ length: 20 }, () => generateId());
    const threadsData = [
      { thread_id: threadIds[0], user_id: userIds[0], comment: 'What is everyone playing this weekend? I just started The Witcher 3!', replying_to: null },
      { thread_id: threadIds[1], user_id: userIds[1], comment: 'I highly recommend playing Gwent in that game!', replying_to: threadIds[0] },
      { thread_id: threadIds[2], user_id: userIds[2], comment: 'Is Elden Ring too hard for a beginner?', replying_to: null },
      { thread_id: threadIds[3], user_id: userIds[3], comment: 'Yes, but it is worth it. Just level up Vigor.', replying_to: threadIds[2] },
      { thread_id: threadIds[4], user_id: userIds[4], comment: 'What are the best mods for Stardew Valley?', replying_to: null },
      { thread_id: threadIds[5], user_id: userIds[5], comment: 'Stardew Valley Expanded is a must-have!', replying_to: threadIds[4] },
      { thread_id: threadIds[6], user_id: userIds[6], comment: 'Cyberpunk 2077 is completely fixed now. Absolute masterpiece.', replying_to: null },
      { thread_id: threadIds[7], user_id: userIds[7], comment: 'I agree, the Phantom Liberty DLC is incredible.', replying_to: threadIds[6] },
      { thread_id: threadIds[8], user_id: userIds[8], comment: 'I miss the old days of Half-Life 2.', replying_to: null },
      { thread_id: threadIds[9], user_id: userIds[9], comment: 'We still need Half-Life 3...', replying_to: threadIds[8] },
      { thread_id: threadIds[10], user_id: userIds[10], comment: 'Does anyone still play Team Fortress 2?', replying_to: null },
      { thread_id: threadIds[11], user_id: userIds[11], comment: 'Yes! The community is still very active.', replying_to: threadIds[10] },
      { thread_id: threadIds[12], user_id: userIds[12], comment: 'What is the most underrated indie game?', replying_to: null },
      { thread_id: threadIds[13], user_id: userIds[13], comment: 'Outer Wilds, hands down. Do not look up anything about it, just play it.', replying_to: threadIds[12] },
      { thread_id: threadIds[14], user_id: userIds[14], comment: 'I can never beat the pantheons in Hollow Knight.', replying_to: null },
      { thread_id: threadIds[15], user_id: userIds[15] || userIds[0], comment: 'Just keep practicing! Use unbreakable strength.', replying_to: threadIds[14] },
      { thread_id: threadIds[16], user_id: userIds[1] || userIds[1], comment: 'What game has the best soundtrack?', replying_to: null },
      { thread_id: threadIds[17], user_id: userIds[2] || userIds[2], comment: 'Persona 5 Royal. No contest.', replying_to: threadIds[16] },
      { thread_id: threadIds[18], user_id: userIds[3] || userIds[3], comment: 'Doom Eternal’s soundtrack makes me want to punch a wall.', replying_to: threadIds[16] },
      { thread_id: threadIds[19], user_id: userIds[4] || userIds[4], comment: 'Is BG3 really that good?', replying_to: null }
    ];
    await db.insert(thread).values(threadsData);

    const threadVotesData = [];
    for (let i = 0; i < threadsData.length; i++) {
      const possibleVoters = userIds.filter(id => id !== threadsData[i].user_id);
      const numVotes = Math.floor(Math.random() * Math.min(5, possibleVoters.length));
      const shuffledUsers = [...possibleVoters].sort(() => 0.5 - Math.random());
      for(let v = 0; v < numVotes; v++) {
        threadVotesData.push({
          thread_id: threadsData[i].thread_id,
          user_id: shuffledUsers[v],
          vote_type: Math.random() > 0.1 // 90% upvote
        });
      }
    }
    if (threadVotesData.length > 0) {
      await db.insert(thread_votes).values(threadVotesData);
    }

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    process.exit(0);
  }
}

seed();
