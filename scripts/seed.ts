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
import * as crypto from 'crypto';

function generateId() {
  return crypto.randomUUID();
}

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    console.log('Clearing existing data...');
    await db.execute(sql`TRUNCATE TABLE thread_votes, thread, list_votes, list_items, list, user_library, reviews, user_achievements, achievements, game_genres, genres, games, users, audit_log CASCADE`);

    // 1. Insert Users
    console.log('Inserting users...');
    const userIds = Array.from({ length: 30 }, () => generateId());
    const password_hash = '$2a$10$X8O9.C1L4.h8E6hO0I0t9.X.a0r.0.A1A1.A1A1.A1A1.A1A1.A1A1'; // dummy hash
    const usernames = [
      'hisyamssyr', 'gamer_king', 'rpg_fanatic', 'noobmaster69', 'pro_player',
      'casual_gamer', 'speedrunner_x', 'retro_lover', 'moba_god', 'fps_shooter',
      'indie_supporter', 'story_enjoyer', 'achievement_hunter', 'coop_buddy', 'esports_fan',
      'looter_shooter', 'souls_vet', 'tactical_mind', 'gacha_whale', 'rts_commander',
      'fighting_champ', 'horror_survivor', 'platform_jumper', 'racing_driver', 'puzzle_solver',
      'stealth_ninja', 'openworld_explorer', 'mmo_grinder', 'vr_enthusiast', 'arcade_master'
    ];
    
    const usersData = userIds.map((id, index) => ({
      user_id: id,
      username: usernames[index],
      email: `${usernames[index]}@example.com`,
      password_hash,
      avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${usernames[index]}`
    }));
    await db.insert(users).values(usersData);

    // 2. Insert Genres
    console.log('Inserting genres...');
    const genreIds = Array.from({ length: 14 }, () => generateId());
    const genresList = ['Action', 'Adventure', 'RPG', 'Shooter', 'Strategy', 'Simulation', 'Puzzle', 'Sports', 'Racing', 'Fighting', 'Platformer', 'Horror', 'Survival', 'Stealth'];
    const genresData = genresList.map((g, i) => ({
      genre_id: genreIds[i],
      genre_name: g,
      description: `Games focused on ${g.toLowerCase()} elements.`
    }));
    await db.insert(genres).values(genresData);

    // 3. Insert Games
    console.log('Inserting games...');
    const gamesRaw = [
      { t: 'The Witcher 3: Wild Hunt', d: 'CD Projekt Red', rd: '2015-05-19', desc: 'A story-driven, next-generation open world role-playing game.', ar: '9.90', img: '292030' },
      { t: 'Red Dead Redemption 2', d: 'Rockstar Games', rd: '2018-10-26', desc: 'An epic tale of life in America’s unforgiving heartland.', ar: '9.80', img: '1174180' },
      { t: 'Grand Theft Auto V', d: 'Rockstar North', rd: '2013-09-17', desc: 'When a young street hustler, a retired bank robber and a terrifying psychopath find themselves entangled...', ar: '9.60', img: '271590' },
      { t: 'Elden Ring', d: 'FromSoftware', rd: '2022-02-25', desc: 'THE NEW FANTASY ACTION RPG. Rise, Tarnished, and be guided by grace to brandish the power of the Elden Ring.', ar: '9.70', img: '1245620' },
      { t: 'Cyberpunk 2077', d: 'CD Projekt Red', rd: '2020-12-10', desc: 'An open-world, action-adventure story set in Night City.', ar: '8.40', img: '1091500' },
      { t: 'Hades', d: 'Supergiant Games', rd: '2020-09-17', desc: 'Defy the god of the dead as you hack and slash out of the Underworld.', ar: '9.76', img: '1145360' },
      { t: 'Stardew Valley', d: 'ConcernedApe', rd: '2016-02-26', desc: 'You\'ve inherited your grandfather\'s old farm plot in Stardew Valley. Armed with hand-me-down tools and a few coins, you set out to begin your new life.', ar: '9.84', img: '413150' },
      { t: 'Hollow Knight', d: 'Team Cherry', rd: '2017-02-24', desc: 'Forge your own path in Hollow Knight! An epic action adventure through a vast ruined kingdom of insects and heroes.', ar: '9.74', img: '367520' },
      { t: 'Persona 5 Royal', d: 'Atlus', rd: '2019-10-31', desc: 'Prepare for an all-new RPG experience in Persona 5 Royal based in the universe of the award-winning series, Persona!', ar: '9.90', img: '1687950' },
      { t: 'Doom Eternal', d: 'id Software', rd: '2020-03-20', desc: 'Hell’s armies have invaded Earth. Become the Slayer in an epic single-player campaign to conquer demons across dimensions and stop the final destruction of humanity.', ar: '9.50', img: '782330' },
      { t: 'God of War', d: 'Santa Monica Studio', rd: '2018-04-20', desc: 'His vengeance against the Gods of Olympus years behind him, Kratos now lives as a man in the realm of Norse Gods and monsters.', ar: '9.80', img: '1593500' },
      { t: 'Sekiro: Shadows Die Twice', d: 'FromSoftware', rd: '2019-03-22', desc: 'In Sekiro: Shadows Die Twice you are the "one-armed wolf", a disgraced and disfigured warrior rescued from the brink of death.', ar: '9.60', img: '814380' },
      { t: 'Half-Life 2', d: 'Valve', rd: '2004-11-16', desc: '1998. HALF-LIFE sends a shock through the game industry with its combination of pounding action and continuous, immersive storytelling.', ar: '9.84', img: '220' },
      { t: 'Portal 2', d: 'Valve', rd: '2011-04-18', desc: 'Portal 2 draws from the award-winning formula of innovative gameplay, story, and music that earned the original Portal over 70 industry accolades and created a cult following.', ar: '9.90', img: '620' },
      { t: 'Terraria', d: 'Re-Logic', rd: '2011-05-16', desc: 'Dig, fight, explore, build! Nothing is impossible in this action-packed adventure game.', ar: '9.60', img: '105600' },
      { t: 'Baldur\'s Gate 3', d: 'Larian Studios', rd: '2023-08-03', desc: 'Gather your party, and return to the Forgotten Realms in a tale of fellowship and betrayal, sacrifice and survival, and the lure of absolute power.', ar: '9.96', img: '1086940' },
      { t: 'Celeste', d: 'Extremely OK Games', rd: '2018-01-25', desc: 'Help Madeline survive her inner demons on her journey to the top of Celeste Mountain, in this super-tight platformer.', ar: '9.70', img: '504230' },
      { t: 'Subnautica', d: 'Unknown Worlds Entertainment', rd: '2018-01-23', desc: 'Descend into the depths of an alien underwater world filled with wonder and peril.', ar: '9.60', img: '264710' },
      { t: 'Outer Wilds', d: 'Mobius Digital', rd: '2019-05-28', desc: 'Named Game of the Year 2019 by Giant Bomb, Polygon, Eurogamer, and The Guardian, Outer Wilds is a critically-acclaimed and award-winning open world mystery about a solar system trapped in an endless time loop.', ar: '9.80', img: '1062000' },
      { t: 'Factorio', d: 'Wube Software', rd: '2020-08-14', desc: 'Factorio is a game about building and creating automated factories to produce items of increasing complexity.', ar: '9.70', img: '427520' },
      { t: 'Monster Hunter: World', d: 'Capcom', rd: '2018-01-26', desc: 'Welcome to a new world! In Monster Hunter: World, the latest installment in the series, you can enjoy the ultimate hunting experience.', ar: '9.50', img: '582010' },
      { t: 'The Elder Scrolls V: Skyrim Special Edition', d: 'Bethesda Game Studios', rd: '2016-10-28', desc: 'Winner of more than 200 Game of the Year Awards, Skyrim Special Edition brings the epic fantasy to life in stunning detail.', ar: '9.80', img: '489830' },
      { t: 'Fallout: New Vegas', d: 'Obsidian Entertainment', rd: '2010-10-19', desc: 'Welcome to Vegas. New Vegas. It’s the kind of town where you dig your own grave prior to being shot in the head.', ar: '9.60', img: '22380' },
      { t: 'Fallout 4', d: 'Bethesda Game Studios', rd: '2015-11-10', desc: 'Bethesda Game Studios, the award-winning creators of Fallout 3 and The Elder Scrolls V: Skyrim, welcome you to the world of Fallout 4.', ar: '9.10', img: '377160' },
      { t: 'Mass Effect™ Legendary Edition', d: 'BioWare', rd: '2021-05-14', desc: 'One person is all that stands between humanity and the greatest threat it’s ever faced. Relive the legend of Commander Shepard.', ar: '9.50', img: '1328670' },
      { t: 'BioShock Infinite', d: 'Irrational Games', rd: '2013-03-26', desc: 'Indebted to the wrong people, with his life on the line, veteran of the U.S. Cavalry and now hired gun, Booker DeWitt has only one opportunity to wipe his slate clean.', ar: '9.40', img: '8870' },
      { t: 'DARK SOULS™ III', d: 'FromSoftware', rd: '2016-04-12', desc: 'Dark Souls continues to push the boundaries with the latest, ambitious chapter in the critically-acclaimed and genre-defining series.', ar: '9.50', img: '374320' },
      { t: 'DARK SOULS™: REMASTERED', d: 'QLOC', rd: '2018-05-24', desc: 'Then, there was fire. Re-experience the critically acclaimed, genre-defining game that started it all.', ar: '9.30', img: '570940' },
      { t: 'Ghost of Tsushima DIRECTOR\'S CUT', d: 'Sucker Punch Productions', rd: '2024-05-16', desc: 'A storm is coming. Discover the expanded Ghost of Tsushima experience in this Director’s Cut on PC.', ar: '9.60', img: '2215430' },
      { t: 'Marvel’s Spider-Man Remastered', d: 'Insomniac Games', rd: '2022-08-12', desc: 'Developed by Insomniac Games in collaboration with Marvel, and optimized for PC by Nixxes Software.', ar: '9.70', img: '1817070' },
      { t: 'Horizon Zero Dawn™ Complete Edition', d: 'Guerrilla', rd: '2020-08-07', desc: 'Experience Aloy’s legendary quest to unravel the mysteries of a future Earth ruled by Machines.', ar: '9.40', img: '1151640' },
      { t: 'The Last of Us™ Part I', d: 'Naughty Dog LLC', rd: '2023-03-28', desc: 'Experience the emotional storytelling and unforgettable characters in The Last of Us™, winner of over 200 Game of the Year awards.', ar: '9.50', img: '1888930' },
      { t: 'UNCHARTED™: Legacy of Thieves Collection', d: 'Naughty Dog LLC', rd: '2022-10-19', desc: 'Play as Nathan Drake and Chloe Frazer in their own standalone adventures as they confront their pasts and forge their own legacies.', ar: '9.30', img: '1659420' },
      { t: 'DEATH STRANDING DIRECTOR\'S CUT', d: 'KOJIMA PRODUCTIONS', rd: '2022-03-30', desc: 'From legendary game creator Hideo Kojima comes a genre-defying experience, now expanded in this definitive DIRECTOR’S CUT.', ar: '9.20', img: '1850570' },
      { t: 'Half-Life', d: 'Valve', rd: '1998-11-08', desc: 'Named Game of the Year by over 50 publications, Valve\'s debut title blends action and adventure with award-winning technology.', ar: '9.80', img: '70' },
      { t: 'Left 4 Dead 2', d: 'Valve', rd: '2009-11-17', desc: 'Set in the zombie apocalypse, Left 4 Dead 2 (L4D2) is the highly anticipated sequel to the award-winning Left 4 Dead.', ar: '9.70', img: '550' },
      { t: 'Counter-Strike 2', d: 'Valve', rd: '2023-09-27', desc: 'For over two decades, Counter-Strike has offered an elite competitive experience, one shaped by millions of players from across the globe.', ar: '9.50', img: '730' },
      { t: 'Dota 2', d: 'Valve', rd: '2013-07-09', desc: 'Every day, millions of players worldwide enter battle as one of over a hundred Dota heroes.', ar: '9.60', img: '570' },
      { t: 'Apex Legends™', d: 'Respawn Entertainment', rd: '2020-11-05', desc: 'Apex Legends is the award-winning, free-to-play Hero Shooter from Respawn Entertainment.', ar: '9.20', img: '1172470' },
      { t: 'Destiny 2', d: 'Bungie', rd: '2019-10-01', desc: 'Dive into the world of Destiny 2 to explore the mysteries of the solar system and experience responsive first-person shooter combat.', ar: '9.00', img: '1085660' },
      { t: 'FINAL FANTASY VII REMAKE INTERGRADE', d: 'Square Enix', rd: '2022-06-17', desc: 'By exploiting mako, the life-blood of the planet, through their mako reactors, the Shinra Electric Power Company has all but seized control of the entire world.', ar: '9.40', img: '1462040' },
      { t: 'NieR:Automata™', d: 'Square Enix', rd: '2017-03-17', desc: 'NieR: Automata tells the story of androids 2B, 9S and A2 and their battle to reclaim the machine-driven dystopia overrun by powerful machines.', ar: '9.50', img: '524220' },
      { t: 'Resident Evil 4', d: 'CAPCOM', rd: '2023-03-24', desc: 'Survival is just the beginning. Six years have passed since the biological disaster in Raccoon City.', ar: '9.80', img: '2050650' },
      { t: 'Resident Evil 2', d: 'CAPCOM', rd: '2019-01-25', desc: 'A deadly virus engulfs the residents of Raccoon City in September of 1998, plunging the city into chaos as flesh eating zombies roam the streets for survivors.', ar: '9.70', img: '883710' },
      { t: 'Devil May Cry 5', d: 'CAPCOM', rd: '2019-03-08', desc: 'The ultimate Devil Hunter is back in style, in the game action fans have been waiting for.', ar: '9.60', img: '601150' },
      { t: 'MONSTER HUNTER RISE', d: 'CAPCOM', rd: '2022-01-12', desc: 'Rise to the challenge and join the hunt! The critically acclaimed action-RPG series returns.', ar: '9.40', img: '1446780' },
      { t: 'Street Fighter™ 6', d: 'CAPCOM', rd: '2023-06-02', desc: 'Here comes Capcom’s newest challenger! Street Fighter 6 spans three distinct game modes, including World Tour, Fighting Ground and Battle Hub.', ar: '9.50', img: '1364780' },
      { t: 'TEKKEN 8', d: 'Bandai Namco Studios Inc.', rd: '2024-01-26', desc: 'Get ready for the next chapter in the legendary fighting game franchise, TEKKEN 8.', ar: '9.60', img: '1778820' },
      { t: 'Mortal Kombat 1', d: 'NetherRealm Studios', rd: '2023-09-19', desc: 'Discover a reborn Mortal Kombat Universe created by the Fire God Liu Kang.', ar: '9.00', img: '1971870' },
      { t: 'Cuphead', d: 'Studio MDHR Entertainment Inc.', rd: '2017-09-29', desc: 'Cuphead is a classic run and gun action game heavily focused on boss battles.', ar: '9.80', img: '268910' },
      { t: 'Ori and the Will of the Wisps', d: 'Moon Studios GmbH', rd: '2020-03-11', desc: 'Play the critically acclaimed masterpiece. Embark on a new journey in a vast, exotic world where you’ll encounter towering enemies and challenging puzzles.', ar: '9.70', img: '1057090' },
      { t: 'Dead Cells', d: 'Motion Twin', rd: '2018-08-07', desc: 'Dead Cells is a rogue-lite, metroidvania inspired, action-platformer.', ar: '9.60', img: '588650' },
      { t: 'Slay the Spire', d: 'Mega Crit Games', rd: '2019-01-23', desc: 'We fused card games and roguelikes together to make the best single player deckbuilder we could.', ar: '9.80', img: '646570' },
      { t: 'Vampire Survivors', d: 'poncle', rd: '2022-10-20', desc: 'Mow down thousands of night creatures and survive until dawn! Vampire Survivors is a gothic horror casual game with rogue-lite elements.', ar: '9.70', img: '1566590' },
      { t: 'Disco Elysium - The Final Cut', d: 'ZA/UM', rd: '2019-10-15', desc: 'Disco Elysium - The Final Cut is a groundbreaking role playing game. You’re a detective with a unique skill system at your disposal.', ar: '9.80', img: '632470' },
      { t: 'Rust', d: 'Facepunch Studios', rd: '2018-02-08', desc: 'The only aim in Rust is to survive. Everything wants you to die - the island’s wildlife and other inhabitants, the environment, other survivors.', ar: '9.00', img: '252490' },
      { t: 'Garry\'s Mod', d: 'Facepunch Studios', rd: '2006-11-29', desc: 'Garry\'s Mod is a physics sandbox. There aren\'t any predefined aims or goals. We give you the tools and leave you to play.', ar: '9.80', img: '4000' }
    ];

    const gameIds = Array.from({ length: gamesRaw.length }, () => generateId());
    const gamesData = gamesRaw.map((g, i) => ({
      game_id: gameIds[i],
      title: g.t,
      developer: g.d,
      release_date: g.rd,
      description: g.desc,
      average_rating: g.ar,
      cover_url: `https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/${g.img}/library_600x900.jpg`
    }));
    await db.insert(games).values(gamesData);

    // 4. Game Genres Links
    console.log('Inserting game-genres relations...');
    const gameGenresData: { game_id: string, genre_id: string }[] = [];
    gamesRaw.forEach((g, i) => {
      // Assign genres randomly based on keywords in title/desc or just pseudo-random
      // But we can do better: map to specific genres for the first few, then pseudo-random
      const assign = (genreNames: string[]) => {
        genreNames.forEach(gn => {
          const idx = genresList.indexOf(gn);
          if (idx !== -1) {
            gameGenresData.push({ game_id: gameIds[i], genre_id: genreIds[idx] });
          }
        });
      };
      const text = (g.t + ' ' + g.desc).toLowerCase();
      const matched = [];
      if (text.includes('rpg') || text.includes('role-playing')) matched.push('RPG');
      if (text.includes('action')) matched.push('Action');
      if (text.includes('adventure')) matched.push('Adventure');
      if (text.includes('shooter') || text.includes('gun') || text.includes('fps')) matched.push('Shooter');
      if (text.includes('strategy')) matched.push('Strategy');
      if (text.includes('simulation') || text.includes('farm')) matched.push('Simulation');
      if (text.includes('puzzle')) matched.push('Puzzle');
      if (text.includes('racing') || text.includes('vehicle')) matched.push('Racing');
      if (text.includes('fight') || text.includes('kombat') || text.includes('street fighter')) matched.push('Fighting');
      if (text.includes('platform') || text.includes('jump')) matched.push('Platformer');
      if (text.includes('horror') || text.includes('scare') || text.includes('zombie')) matched.push('Horror');
      if (text.includes('surviv')) matched.push('Survival');
      if (text.includes('stealth')) matched.push('Stealth');

      if (matched.length === 0) matched.push('Action', 'Adventure'); // fallback
      
      // Deduplicate
      const uniqueGenres = [...new Set(matched)];
      assign(uniqueGenres);
    });
    await db.insert(game_genres).values(gameGenresData);

    // 5. Insert Achievements
    console.log('Inserting achievements...');
    const achievementsData: { achievement_id: string, game_id: string, achievement_name: string, description: string }[] = [];
    gamesData.forEach((game) => {
      // Create 3 achievements per game
      for(let i=1; i<=3; i++) {
        achievementsData.push({
          achievement_id: generateId(),
          game_id: game.game_id,
          achievement_name: `Achievement ${i} for ${game.title}`,
          description: `Unlock this by completing a specific task in ${game.title}.`
        });
      }
    });
    // Add some custom ones for realism
    achievementsData[0].achievement_name = 'Passed the Trial'; achievementsData[0].description = 'Finish the game on any difficulty.';
    achievementsData[1].achievement_name = 'Geralt: The Professional'; achievementsData[1].description = 'Complete all witcher contracts.';
    achievementsData[3].achievement_name = 'Legend of the West'; achievementsData[3].description = 'Attain 100% completion.';
    await db.insert(achievements).values(achievementsData);

    // 6. User Library
    console.log('Inserting user libraries...');
    const libraryStatuses = ['Playing', 'Completed', 'Plan to Play', 'Dropped'];
    const userLibraryData: { user_id: string, game_id: string, play_status: string }[] = [];
    for (const userId of userIds) {
      const numGames = Math.floor(Math.random() * 20) + 10; // 10 to 30 games per user
      const shuffledGames = [...gameIds].sort(() => 0.5 - Math.random());
      for (let j = 0; j < numGames; j++) {
        userLibraryData.push({
          user_id: userId,
          game_id: shuffledGames[j],
          play_status: libraryStatuses[Math.floor(Math.random() * libraryStatuses.length)],
        });
      }
    }
    await db.insert(user_library).values(userLibraryData);

    // 7. Reviews
    console.log('Inserting reviews...');
    const reviewData: { user_id: string, game_id: string, rating: string, review_text: string }[] = [];
    for (const item of userLibraryData) {
      if (Math.random() > 0.4) { // 60% chance to review
        let rating = 0;
        let review_text = '';
        if (item.play_status === 'Completed') {
          rating = (Math.random() * 2.9) + 7; // max 9.9
          review_text = 'Amazing game, definitely one of the best I have played. Highly recommended to everyone!';
        } else if (item.play_status === 'Dropped') {
          rating = (Math.random() * 4) + 1; // max 5
          review_text = 'Could not get into it. The controls felt clunky and the story was boring.';
        } else {
          rating = (Math.random() * 8.9) + 1; // max 9.9
          review_text = 'Playing it right now, having a decent time. Will update when finished.';
        }
        rating = Math.round(rating * 10) / 10;

        reviewData.push({
          user_id: item.user_id,
          game_id: item.game_id,
          rating: rating.toString(),
          review_text: review_text,
        });
      }
    }
    await db.insert(reviews).values(reviewData);

    // 8. User Achievements
    console.log('Inserting user achievements...');
    const userAchData: { user_id: string, achievement_id: string }[] = [];
    for (const item of userLibraryData) {
      if (item.play_status === 'Completed' || item.play_status === 'Playing') {
        const gameAchs = achievementsData.filter(a => a.game_id === item.game_id);
        if (gameAchs.length > 0) {
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
    const uniqueUserAchData = userAchData.filter((v,i,a)=>a.findIndex(v2=>(v2.user_id===v.user_id && v2.achievement_id===v.achievement_id))===i);
    await db.insert(user_achievements).values(uniqueUserAchData);

    // 9. Lists & List Items
    console.log('Inserting lists and items...');
    const listCount = 40; // 40 lists
    const listIds = Array.from({ length: listCount }, () => generateId());
    const listThemes = ['My Top 10 Games', 'Games with the Best Story', 'Must Play RPGs', 'Cozy Games for Weekend', 'Hardest Games Ever', 'Greatest Indie Hits', 'Speedrun Potential', 'Nostalgic Classics', 'Best Multiplayer Games', 'Scariest Horror Games'];
    const listsData = listIds.map((id, index) => {
      const theme = listThemes[index % listThemes.length] + (index >= listThemes.length ? ` Part ${Math.floor(index/listThemes.length) + 1}` : '');
      return {
        list_id: id,
        user_id: userIds[Math.floor(Math.random() * userIds.length)],
        title: theme,
        description: `A curated collection for: ${theme}.`,
        list_cover_url: gamesData[Math.floor(Math.random() * gamesData.length)].cover_url
      };
    });
    await db.insert(list).values(listsData);

    const listItemsData: { list_id: string, game_id: string }[] = [];
    const listVotesData: { list_id: string, user_id: string, vote_type: boolean }[] = [];
    
    for (let i = 0; i < listIds.length; i++) {
      const numItems = Math.floor(Math.random() * 8) + 4; // 4 to 11 items
      const shuffled = [...gameIds].sort(() => 0.5 - Math.random());
      for (let j = 0; j < numItems; j++) {
        listItemsData.push({
          list_id: listIds[i],
          game_id: shuffled[j],
        });
      }

      const possibleVoters = userIds.filter(id => id !== listsData[i].user_id);
      const numVotes = Math.floor(Math.random() * Math.min(15, possibleVoters.length));
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
    if (listVotesData.length > 0) await db.insert(list_votes).values(listVotesData);

    // 10. Threads
    console.log('Inserting threads (forum/comments)...');
    const threadCount = 100; // 100 thread messages
    const threadIds = Array.from({ length: threadCount }, () => generateId());
    
    const threadStarters = [
      'What is everyone playing this weekend?',
      'Is Elden Ring too hard for a beginner?',
      'What are the best mods for Stardew Valley?',
      'Cyberpunk 2077 is completely fixed now. Absolute masterpiece.',
      'I miss the old days of Half-Life 2.',
      'Does anyone still play Team Fortress 2?',
      'What is the most underrated indie game?',
      'I can never beat the pantheons in Hollow Knight.',
      'What game has the best soundtrack?',
      'Is BG3 really that good?',
      'I finally beat Sekiro, my hands are shaking!',
      'Unpopular opinion: Fallout 4 is better than New Vegas.',
      'Any tips for starting Destiny 2 in 2024?',
      'Who is your main in Street Fighter 6?',
      'The Last of Us Part I made me cry again.'
    ];

    const threadReplies = [
      'I highly recommend playing Gwent in that game!',
      'Yes, but it is worth it. Just level up Vigor.',
      'Stardew Valley Expanded is a must-have!',
      'I agree, the Phantom Liberty DLC is incredible.',
      'We still need Half-Life 3...',
      'Yes! The community is still very active.',
      'Outer Wilds, hands down. Do not look up anything about it, just play it.',
      'Just keep practicing! Use unbreakable strength.',
      'Persona 5 Royal. No contest.',
      'Doom Eternal’s soundtrack makes me want to punch a wall.',
      'Congratulations! That final boss took me days.',
      'Hard disagree on that Fallout opinion, but to each their own.',
      'Destiny 2 can be overwhelming, just follow the New Light quests.',
      'I play Ken, yes I know I am basic.',
      'The intro always gets me every time.'
    ];

    const threadsData: { thread_id: string, user_id: string, comment: string, replying_to: string | null }[] = [];
    
    // First insert starters
    let currentStarterId: string | null = null;
    for (let i = 0; i < threadCount; i++) {
      const isStarter = i % 5 === 0; // Every 5th message is a new starter
      const uId = userIds[Math.floor(Math.random() * userIds.length)];
      
      if (isStarter) {
        currentStarterId = threadIds[i];
        const comment = threadStarters[Math.floor(Math.random() * threadStarters.length)];
        threadsData.push({ thread_id: threadIds[i], user_id: uId, comment, replying_to: null });
      } else {
        const comment = threadReplies[Math.floor(Math.random() * threadReplies.length)];
        threadsData.push({ thread_id: threadIds[i], user_id: uId, comment, replying_to: currentStarterId });
      }
    }
    await db.insert(thread).values(threadsData);

    const threadVotesData: { thread_id: string, user_id: string, vote_type: boolean }[] = [];
    for (let i = 0; i < threadsData.length; i++) {
      const possibleVoters = userIds.filter(id => id !== threadsData[i].user_id);
      const numVotes = Math.floor(Math.random() * Math.min(10, possibleVoters.length));
      const shuffledUsers = [...possibleVoters].sort(() => 0.5 - Math.random());
      for(let v = 0; v < numVotes; v++) {
        threadVotesData.push({
          thread_id: threadsData[i].thread_id,
          user_id: shuffledUsers[v],
          vote_type: Math.random() > 0.15 // 85% upvote
        });
      }
    }
    if (threadVotesData.length > 0) await db.insert(thread_votes).values(threadVotesData);

    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
  } finally {
    process.exit(0);
  }
}

seed();
