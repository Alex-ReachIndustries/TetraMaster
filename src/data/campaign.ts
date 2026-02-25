import type { CardDefinition } from '../engine/types'
import allCards from './cards.json'

const cards = allCards as CardDefinition[]

export type AiLevel = 'easy' | 'medium' | 'hard'

export interface Opponent {
  name: string
  title: string
  aiLevel: AiLevel
  deckCardIds: string[]
  hardDeckCardIds: string[]
  dialogue: {
    intro: string
    win: string
    lose: string
  }
}

export interface CampaignNode {
  id: string
  regionId: string
  name: string
  description: string
  opponent: Opponent
  isBoss: boolean
  rewardPool: string[]
  hardRewardPool: string[]
  position: { x: number; y: number }
}

export interface CampaignRegion {
  id: string
  name: string
  description: string
  icon: string
  nodes: CampaignNode[]
  unlockAfter: string | null
}

export interface ChallengeModifier {
  id: string
  name: string
  description: string
  extraBlocks?: number
  aiLevelOverride?: AiLevel
}

export const challengeModifiers: ChallengeModifier[] = [
  {
    id: 'extra-blocks',
    name: 'Narrow Field',
    description: 'The board has extra blocked squares.',
    extraBlocks: 4,
  },
  {
    id: 'hard-mode',
    name: 'Serious Match',
    description: 'Your opponent plays at full strength.',
    aiLevelOverride: 'hard',
  },
]

export const starterCardIds = ['007', '008', '009', '010', '012']

export const getCardDef = (id: string): CardDefinition | undefined =>
  cards.find((c) => c.id === id)

export const getCardDefs = (ids: string[]): CardDefinition[] =>
  ids.map((id) => getCardDef(id)).filter((c): c is CardDefinition => c !== undefined)

const regions: CampaignRegion[] = [
  // ═══════════════════════════════════════════════════════════════
  // REGION 1: ALEXANDRIA — Starter area, easy opponents
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'alexandria',
    name: 'Alexandria',
    description:
      'The royal city where Tetra Master is a beloved pastime among citizens and soldiers alike.',
    icon: '🏰',
    unlockAfter: null,
    nodes: [
      {
        id: 'alex-1',
        regionId: 'alexandria',
        name: 'Village Square',
        description:
          'A friendly kid challenges passing travelers to casual card games.',
        isBoss: false,
        position: { x: 80, y: 80 },
        opponent: {
          name: 'Hippaul',
          title: 'Aspiring Card Player',
          aiLevel: 'easy',
          deckCardIds: ['001', '002', '003', '005', '006'],
          hardDeckCardIds: ['015', '016', '017', '018', '019'],
          dialogue: {
            intro: "Hey! Wanna play some cards? I've been practicing all week!",
            win: 'Wow, you beat me! Here, pick a card from my collection.',
            lose: "Ha! I win! Don't worry, you'll get better!",
          },
        },
        rewardPool: ['010', '011', '012', '013', '014', '015', '016', '077', '080'],
        hardRewardPool: ['035', '036', '037', '038', '039', '040'],
      },
      {
        id: 'alex-2',
        regionId: 'alexandria',
        name: 'Town Gates',
        description:
          'A Pluto Knight guards the entrance and plays cards to pass the time.',
        isBoss: false,
        position: { x: 140, y: 90 },
        opponent: {
          name: 'Pluto Knight Dan',
          title: 'Gate Guard',
          aiLevel: 'easy',
          deckCardIds: ['003', '006', '007', '008', '009'],
          hardDeckCardIds: ['016', '018', '020', '021', '022'],
          dialogue: {
            intro: 'Halt! ...Actually, want to play a quick round? Guard duty is boring.',
            win: 'Good match! Take one of these for your trouble.',
            lose: "That's the Pluto Knight training for ya!",
          },
        },
        rewardPool: ['011', '012', '013', '014', '015', '016', '017', '089', '090'],
        hardRewardPool: ['036', '037', '038', '039', '041', '042'],
      },
      {
        id: 'alex-3',
        regionId: 'alexandria',
        name: "Alchemist's Shop",
        description:
          'An alchemist brews potions and plays cards between customers.',
        isBoss: false,
        position: { x: 200, y: 80 },
        opponent: {
          name: 'Alchemist Mary',
          title: 'Potion Brewer',
          aiLevel: 'easy',
          deckCardIds: ['004', '007', '008', '009', '011'],
          hardDeckCardIds: ['017', '019', '021', '023', '025'],
          dialogue: {
            intro: "Care for a game while your potion brews? It'll be a few minutes.",
            win: "Well played! Choose a card—consider it a bonus with your purchase.",
            lose: 'Back to the cauldron for you! My potions and my cards are top-shelf.',
          },
        },
        rewardPool: ['012', '013', '014', '015', '016', '017', '018', '091', '092'],
        hardRewardPool: ['037', '038', '040', '041', '043', '044'],
      },
      {
        id: 'alex-4',
        regionId: 'alexandria',
        name: 'Ticket Booth',
        description:
          'A ticket seller near the theater plays to pass the time.',
        isBoss: false,
        position: { x: 260, y: 100 },
        opponent: {
          name: 'Nicole',
          title: 'Ticket Seller',
          aiLevel: 'easy',
          deckCardIds: ['005', '008', '009', '010', '012'],
          hardDeckCardIds: ['018', '020', '023', '026', '028'],
          dialogue: {
            intro: "The show doesn't start for an hour. How about a card game to pass the time?",
            win: "You've got talent! Here, a prize worthy of the stage.",
            lose: 'I sell tickets AND collect wins. Better luck next time!',
          },
        },
        rewardPool: ['013', '014', '015', '016', '017', '018', '019', '020', '093'],
        hardRewardPool: ['038', '039', '041', '043', '044', '045'],
      },
      {
        id: 'alex-5',
        regionId: 'alexandria',
        name: 'Castle Keep',
        description:
          'Captain Steiner is the strongest card player in Alexandria. Defeat him to prove your worth.',
        isBoss: true,
        position: { x: 320, y: 80 },
        opponent: {
          name: 'Captain Steiner',
          title: 'Knight Commander',
          aiLevel: 'easy',
          deckCardIds: ['007', '009', '010', '011', '012'],
          hardDeckCardIds: ['020', '023', '025', '027', '030'],
          dialogue: {
            intro: 'I am Adelbert Steiner, Captain of the Pluto Knights! En garde—with cards!',
            win: 'A worthy opponent! Choose a prize from the castle armory.',
            lose: 'The honor of Alexandria is upheld! None shall best the Captain!',
          },
        },
        rewardPool: ['014', '015', '016', '017', '018', '019', '020', '021', '094'],
        hardRewardPool: ['039', '040', '042', '044', '045', '046', '047'],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // REGION 2: LINDBLUM — City of industry, easy-medium
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'lindblum',
    name: 'Lindblum',
    description:
      'The grand city of industry and airships. Card enthusiasts gather from across the continent.',
    icon: '🏙️',
    unlockAfter: 'alexandria',
    nodes: [
      {
        id: 'lind-1',
        regionId: 'lindblum',
        name: 'Business District',
        description:
          'A traveling card collector hunts for rare finds in the bustling market.',
        isBoss: false,
        position: { x: 500, y: 80 },
        opponent: {
          name: 'Card Collector Gon',
          title: 'Rare Card Hunter',
          aiLevel: 'easy',
          deckCardIds: ['008', '009', '010', '013', '015'],
          hardDeckCardIds: ['025', '026', '027', '028', '029'],
          dialogue: {
            intro: "Ooh, nice collection you've got! Let me see what you can do.",
            win: "Impressive! Here, take a look at what I'm willing to trade.",
            lose: 'Better luck next time! I know my cards inside and out.',
          },
        },
        rewardPool: ['016', '017', '018', '019', '020', '021', '022', '023', '084'],
        hardRewardPool: ['045', '046', '047', '048', '049', '050'],
      },
      {
        id: 'lind-2',
        regionId: 'lindblum',
        name: 'Theater District',
        description:
          'A famous actor challenges opponents with dramatic flair between performances.',
        isBoss: false,
        position: { x: 560, y: 90 },
        opponent: {
          name: 'Lowell',
          title: 'Star Actor',
          aiLevel: 'easy',
          deckCardIds: ['010', '011', '014', '016', '017'],
          hardDeckCardIds: ['026', '028', '030', '031', '032'],
          dialogue: {
            intro: 'The stage is set! Let our cards perform a grand drama!',
            win: 'Bravo! A standing ovation for you! Choose your curtain call prize.',
            lose: 'The show must go on—and I remain the star!',
          },
        },
        rewardPool: ['017', '018', '019', '020', '021', '022', '023', '024', '087'],
        hardRewardPool: ['046', '047', '048', '049', '050', '051'],
      },
      {
        id: 'lind-3',
        regionId: 'lindblum',
        name: 'Industrial Way',
        description:
          'An engineer tinkers with airships and cards alike in the smoky workshops.',
        isBoss: false,
        position: { x: 620, y: 80 },
        opponent: {
          name: 'Engineer Zebolt',
          title: 'Airship Mechanic',
          aiLevel: 'easy',
          deckCardIds: ['012', '013', '015', '017', '018'],
          hardDeckCardIds: ['027', '029', '031', '033', '035'],
          dialogue: {
            intro: "These hands fix airships and shuffle cards. Think you can keep up?",
            win: "You've got precision! Take a part from my collection—I mean, a card.",
            lose: "Gears and cards—both need the right timing. You'll learn.",
          },
        },
        rewardPool: ['018', '019', '020', '021', '022', '023', '024', '025', '090'],
        hardRewardPool: ['047', '048', '050', '051', '052', '057'],
      },
      {
        id: 'lind-4',
        regionId: 'lindblum',
        name: 'Dragon Gate',
        description:
          'A spear-wielding dragoon guards the passage and relishes a good card duel.',
        isBoss: false,
        position: { x: 680, y: 100 },
        opponent: {
          name: 'Dragoon Nell',
          title: 'Spear Dancer',
          aiLevel: 'easy',
          deckCardIds: ['013', '014', '016', '018', '019'],
          hardDeckCardIds: ['028', '030', '032', '035', '036'],
          dialogue: {
            intro: "A dragoon's reflexes are unmatched. Let's see if your cards can keep up.",
            win: "Swift as a dragon's descent! You've earned this reward.",
            lose: 'The sky belongs to the dragoons—and so does this victory.',
          },
        },
        rewardPool: ['019', '020', '021', '022', '023', '024', '025', '026', '093'],
        hardRewardPool: ['048', '049', '051', '052', '057', '058'],
      },
      {
        id: 'lind-5',
        regionId: 'lindblum',
        name: 'Grand Castle',
        description:
          "Regent Cid's trusted minister is a formidable card strategist.",
        isBoss: true,
        position: { x: 740, y: 80 },
        opponent: {
          name: 'Minister Artania',
          title: 'Grand Strategist',
          aiLevel: 'easy',
          deckCardIds: ['014', '016', '017', '019', '020'],
          hardDeckCardIds: ['029', '031', '034', '036', '040'],
          dialogue: {
            intro: 'Strategy in cards mirrors strategy in governance. Show me yours.',
            win: "Excellent strategy! The Regent's vaults hold these rewards.",
            lose: 'A minister must never lose composure—or a card game.',
          },
        },
        rewardPool: ['020', '021', '022', '023', '024', '025', '026', '027', '028', '095'],
        hardRewardPool: ['049', '050', '052', '053', '057', '058', '060'],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // REGION 3: BURMECIA — Rainy kingdom, medium
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'burmecia',
    name: 'Burmecia',
    description:
      'The Realm of Eternal Rain. Its proud warriors test outsiders with fierce card duels.',
    icon: '🌧️',
    unlockAfter: 'lindblum',
    nodes: [
      {
        id: 'burm-1',
        regionId: 'burmecia',
        name: 'Outer Gate',
        description:
          'A rain sentry watches the eternal downpour and challenges all who approach.',
        isBoss: false,
        position: { x: 80, y: 220 },
        opponent: {
          name: 'Rain Sentry Pell',
          title: 'Gate Watcher',
          aiLevel: 'medium',
          deckCardIds: ['015', '016', '017', '019', '020'],
          hardDeckCardIds: ['035', '036', '037', '038', '039'],
          dialogue: {
            intro: 'The rain never stops here, and neither do I. Ready your cards.',
            win: 'You weathered the storm. Take this as proof of your resilience.',
            lose: 'The gates of Burmecia remain sealed. Come back stronger.',
          },
        },
        rewardPool: ['025', '026', '027', '028', '029', '030', '031', '032', '084'],
        hardRewardPool: ['055', '056', '057', '058', '060', '061'],
      },
      {
        id: 'burm-2',
        regionId: 'burmecia',
        name: 'Flooded Streets',
        description:
          'A soldier patrols the waterlogged roads, ever ready for a duel.',
        isBoss: false,
        position: { x: 140, y: 230 },
        opponent: {
          name: 'Soldier Vahn',
          title: 'Frontline Fighter',
          aiLevel: 'medium',
          deckCardIds: ['016', '018', '020', '021', '022'],
          hardDeckCardIds: ['036', '038', '039', '041', '043'],
          dialogue: {
            intro: "A soldier's discipline extends to every battle—even cards.",
            win: 'You fight well. Take your spoils, warrior.',
            lose: "Burmecia's soldiers never retreat. Not even in cards.",
          },
        },
        rewardPool: ['026', '027', '028', '029', '030', '031', '032', '033', '087'],
        hardRewardPool: ['056', '057', '058', '060', '061', '062'],
      },
      {
        id: 'burm-3',
        regionId: 'burmecia',
        name: 'Armory',
        description:
          'A lancer sharpens her skills between card games in the rain-soaked armory.',
        isBoss: false,
        position: { x: 200, y: 220 },
        opponent: {
          name: 'Lancer Meera',
          title: 'Rain Dancer',
          aiLevel: 'medium',
          deckCardIds: ['017', '019', '021', '023', '025'],
          hardDeckCardIds: ['037', '040', '042', '044', '047'],
          dialogue: {
            intro: 'My dance summons the storm. My cards harness its fury.',
            win: 'The rain blesses you today. Choose your prize wisely.',
            lose: 'The storm dances for me alone. Perhaps next season.',
          },
        },
        rewardPool: ['027', '028', '029', '030', '031', '032', '033', '034', '093'],
        hardRewardPool: ['057', '058', '061', '062', '063', '064'],
      },
      {
        id: 'burm-4',
        regionId: 'burmecia',
        name: 'Storm Tower',
        description:
          "An oracle reads the storm's patterns from the highest tower in Burmecia.",
        isBoss: false,
        position: { x: 260, y: 240 },
        opponent: {
          name: 'Oracle Wei',
          title: 'Storm Reader',
          aiLevel: 'medium',
          deckCardIds: ['018', '020', '023', '026', '028'],
          hardDeckCardIds: ['038', '041', '044', '047', '049'],
          dialogue: {
            intro: 'The thunder speaks to me. It says... you will lose.',
            win: 'The skies were wrong about you. Accept this tribute.',
            lose: 'Thunder and lightning confirm—I am the stronger player.',
          },
        },
        rewardPool: ['028', '029', '030', '031', '032', '033', '034', '035', '046'],
        hardRewardPool: ['058', '060', '063', '064', '065', '066'],
      },
      {
        id: 'burm-5',
        regionId: 'burmecia',
        name: 'Palace Ruins',
        description:
          'The legendary Dragon Knight awaits at the heart of the ruined palace.',
        isBoss: true,
        position: { x: 320, y: 220 },
        opponent: {
          name: 'Dragon Knight Reis',
          title: 'Legendary Dragoon',
          aiLevel: 'medium',
          deckCardIds: ['020', '023', '025', '028', '030'],
          hardDeckCardIds: ['039', '043', '047', '049', '050'],
          dialogue: {
            intro: 'I have fought dragons and won. Your cards do not frighten me.',
            win: "A warrior's honor—you have earned this dragon's treasure.",
            lose: 'The legacy of the Dragon Knights endures. You cannot break it.',
          },
        },
        rewardPool: ['029', '030', '031', '032', '033', '034', '035', '036', '037', '062'],
        hardRewardPool: ['060', '061', '064', '065', '066', '067', '068'],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // REGION 4: TRENO — City of nobles, medium
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'treno',
    name: 'Treno',
    description:
      'The city of eternal night. Nobles and thieves alike compete in underground card tournaments.',
    icon: '🌙',
    unlockAfter: 'burmecia',
    nodes: [
      {
        id: 'tren-1',
        regionId: 'treno',
        name: 'Card Stadium',
        description:
          'The official tournament grounds where seasoned players test their mettle.',
        isBoss: false,
        position: { x: 500, y: 220 },
        opponent: {
          name: 'Cardmaster Tristam',
          title: 'Tournament Regular',
          aiLevel: 'medium',
          deckCardIds: ['025', '026', '027', '028', '030'],
          hardDeckCardIds: ['045', '046', '047', '048', '049'],
          dialogue: {
            intro: "Welcome to the Stadium. I've been tournament champion three years running.",
            win: "You broke my streak! Fair is fair—take your pick.",
            lose: 'Four years and counting!',
          },
        },
        rewardPool: ['035', '036', '037', '038', '039', '040', '041', '042', '057'],
        hardRewardPool: ['064', '065', '066', '067', '068', '069'],
      },
      {
        id: 'tren-2',
        regionId: 'treno',
        name: 'Slum District',
        description:
          'A notorious thief plays cards with stolen goods as stakes.',
        isBoss: false,
        position: { x: 560, y: 230 },
        opponent: {
          name: 'Alleyway Jack',
          title: 'Card Thief',
          aiLevel: 'medium',
          deckCardIds: ['026', '028', '029', '031', '033'],
          hardDeckCardIds: ['046', '048', '050', '051', '053'],
          dialogue: {
            intro: "In the slums, cards are currency. Let's see what you're worth.",
            win: "Quick hands, quick mind. You've earned this.",
            lose: "Don't feel bad—I steal from the best.",
          },
        },
        rewardPool: ['036', '037', '038', '039', '040', '041', '042', '043', '078'],
        hardRewardPool: ['065', '066', '067', '068', '069', '070'],
      },
      {
        id: 'tren-3',
        regionId: 'treno',
        name: "Scholar's Hall",
        description:
          'A bishop studies card theory obsessively in the candlelit library.',
        isBoss: false,
        position: { x: 620, y: 220 },
        opponent: {
          name: 'Bishop Sera',
          title: 'Card Scholar',
          aiLevel: 'medium',
          deckCardIds: ['027', '029', '032', '034', '035'],
          hardDeckCardIds: ['047', '049', '052', '055', '057'],
          dialogue: {
            intro: 'I have studied every card in existence. Theory always defeats instinct.',
            win: 'Empirical evidence suggests you are skilled. Take your data—er, reward.',
            lose: 'As my research predicted. You need more study.',
          },
        },
        rewardPool: ['037', '038', '039', '040', '041', '042', '043', '044', '074'],
        hardRewardPool: ['066', '067', '069', '070', '073', '075'],
      },
      {
        id: 'tren-4',
        regionId: 'treno',
        name: 'Noble Quarter',
        description:
          'A wealthy patron wagers rare cards in his gilded parlor.',
        isBoss: false,
        position: { x: 680, y: 240 },
        opponent: {
          name: 'Nobleman Ector',
          title: 'Wealthy Patron',
          aiLevel: 'medium',
          deckCardIds: ['028', '030', '033', '036', '038'],
          hardDeckCardIds: ['048', '050', '053', '057', '060'],
          dialogue: {
            intro: 'I wager only the finest cards. Can your deck match my collection?',
            win: "A rare defeat for me. Take this—it's worth more than you know.",
            lose: 'Wealth and skill—I possess both in abundance.',
          },
        },
        rewardPool: ['038', '039', '040', '041', '042', '043', '044', '045', '082'],
        hardRewardPool: ['067', '068', '070', '073', '075', '081'],
      },
      {
        id: 'tren-5',
        regionId: 'treno',
        name: "King's Mansion",
        description:
          "The legendary Card King holds court in Treno's finest estate.",
        isBoss: true,
        position: { x: 740, y: 220 },
        opponent: {
          name: 'Card King',
          title: 'Undisputed Champion',
          aiLevel: 'medium',
          deckCardIds: ['030', '033', '035', '038', '040'],
          hardDeckCardIds: ['049', '052', '055', '058', '060'],
          dialogue: {
            intro: 'You stand before the Card King. Few have bested me. None twice.',
            win: 'Impossible! Take your reward. I must reconsider my strategy.',
            lose: 'The crown remains where it belongs. I am the Card King!',
          },
        },
        rewardPool: ['039', '040', '041', '042', '043', '044', '045', '046', '047', '085'],
        hardRewardPool: ['068', '069', '070', '073', '075', '081', '083'],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // REGION 5: CLEYRA — Hidden tree settlement, medium-hard
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'cleyra',
    name: 'Cleyra',
    description:
      'The hidden settlement in the great tree. Its guardians are disciplined and tactical.',
    icon: '🌳',
    unlockAfter: 'treno',
    nodes: [
      {
        id: 'cley-1',
        regionId: 'cleyra',
        name: 'Trunk Base',
        description:
          'A vigilant sentinel tests all who seek passage up the great tree.',
        isBoss: false,
        position: { x: 80, y: 360 },
        opponent: {
          name: 'Sentinel Nero',
          title: 'Tree Guardian',
          aiLevel: 'medium',
          deckCardIds: ['035', '036', '037', '038', '039'],
          hardDeckCardIds: ['055', '056', '057', '058', '059'],
          dialogue: {
            intro: 'None may pass without proving their worth. Draw your cards.',
            win: 'You have earned passage. Take this as a token of the tree.',
            lose: 'The tree is well guarded. Train more and return.',
          },
        },
        rewardPool: ['045', '046', '047', '048', '049', '050', '051', '052', '060'],
        hardRewardPool: ['070', '071', '072', '073', '075', '076'],
      },
      {
        id: 'cley-2',
        regionId: 'cleyra',
        name: 'Sandstorm Plaza',
        description:
          'A dancer channels sandstorm energy into mesmerizing card techniques.',
        isBoss: false,
        position: { x: 140, y: 370 },
        opponent: {
          name: 'Dancer Leila',
          title: 'Sandstorm Dancer',
          aiLevel: 'medium',
          deckCardIds: ['036', '038', '040', '041', '043'],
          hardDeckCardIds: ['056', '058', '060', '063', '064'],
          dialogue: {
            intro: 'The sandstorm is my partner. Together, we are unstoppable.',
            win: 'The winds favor you today. Accept this gift of sand and starlight.',
            lose: 'The desert swallows the unworthy. Dance better next time.',
          },
        },
        rewardPool: ['046', '047', '048', '049', '050', '051', '052', '053', '061'],
        hardRewardPool: ['071', '072', '073', '075', '081', '083'],
      },
      {
        id: 'cley-3',
        regionId: 'cleyra',
        name: "Elder's Grove",
        description:
          'An elder speaks with the roots of the tree and draws wisdom for her cards.',
        isBoss: false,
        position: { x: 200, y: 360 },
        opponent: {
          name: 'Elder Nymia',
          title: 'Root Speaker',
          aiLevel: 'medium',
          deckCardIds: ['037', '039', '042', '044', '047'],
          hardDeckCardIds: ['057', '060', '064', '065', '066'],
          dialogue: {
            intro: 'The roots whisper of your coming. They say you seek wisdom.',
            win: 'The great tree acknowledges you. Take a piece of its bounty.',
            lose: 'Listen to the roots more carefully. They have much to teach.',
          },
        },
        rewardPool: ['047', '048', '049', '050', '051', '052', '053', '054', '062'],
        hardRewardPool: ['072', '073', '075', '076', '081', '083'],
      },
      {
        id: 'cley-4',
        regionId: 'cleyra',
        name: 'Sacred Temple',
        description:
          'The high priests guard ancient cards with mystical power.',
        isBoss: false,
        position: { x: 260, y: 380 },
        opponent: {
          name: 'High Priest Caleb',
          title: 'Temple Guardian',
          aiLevel: 'hard',
          deckCardIds: ['038', '041', '044', '047', '049'],
          hardDeckCardIds: ['058', '063', '065', '066', '069'],
          dialogue: {
            intro: 'The ancient cards speak to those with true spirit. Let us see yours.',
            win: 'The spirits favor you. Choose wisely from these sacred cards.',
            lose: 'The temple remains sealed to the unworthy.',
          },
        },
        rewardPool: ['048', '049', '050', '051', '052', '053', '054', '055', '063'],
        hardRewardPool: ['073', '075', '076', '081', '083', '086'],
      },
      {
        id: 'cley-5',
        regionId: 'cleyra',
        name: 'Crown Summit',
        description:
          "At the peak of the great tree, Cleyra's greatest card master awaits.",
        isBoss: true,
        position: { x: 320, y: 360 },
        opponent: {
          name: 'Oracle Kildea',
          title: 'Seer of the Summit',
          aiLevel: 'hard',
          deckCardIds: ['040', '043', '047', '049', '050'],
          hardDeckCardIds: ['060', '064', '066', '069', '075'],
          dialogue: {
            intro: 'I have foreseen your arrival... and your defeat.',
            win: "Impossible—my visions were wrong! Take this rare treasure.",
            lose: 'The future unfolds as I predicted.',
          },
        },
        rewardPool: ['049', '050', '051', '052', '053', '054', '055', '056', '064', '065'],
        hardRewardPool: ['075', '076', '081', '083', '086', '088'],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // REGION 6: DESERT PALACE — Kuja's domain, hard
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'desert-palace',
    name: 'Desert Palace',
    description:
      "Kuja's opulent stronghold deep in the desert. Only the cunning survive its trials.",
    icon: '🏜️',
    unlockAfter: 'cleyra',
    nodes: [
      {
        id: 'desp-1',
        regionId: 'desert-palace',
        name: 'Palace Gates',
        description:
          'A sentinel guards the entrance to the palace, testing all who dare approach.',
        isBoss: false,
        position: { x: 500, y: 360 },
        opponent: {
          name: 'Sentinel Dagger',
          title: 'Palace Guard',
          aiLevel: 'medium',
          deckCardIds: ['045', '046', '047', '048', '049'],
          hardDeckCardIds: ['065', '066', '067', '068', '069'],
          dialogue: {
            intro: "Kuja's palace welcomes no intruders. State your business—or play.",
            win: 'You have some nerve... and skill. Take this and leave while you can.',
            lose: 'Return to the sands. The palace has no room for the weak.',
          },
        },
        rewardPool: ['055', '056', '057', '058', '059', '060', '061', '062', '063'],
        hardRewardPool: ['081', '082', '083', '085', '086', '088'],
      },
      {
        id: 'desp-2',
        regionId: 'desert-palace',
        name: 'Enchanted Hall',
        description:
          'A lamia enchantress deals cards with hypnotic grace in the gilded hallway.',
        isBoss: false,
        position: { x: 560, y: 370 },
        opponent: {
          name: 'Lamia Enchantress',
          title: 'Hypnotic Dealer',
          aiLevel: 'medium',
          deckCardIds: ['046', '048', '050', '051', '053'],
          hardDeckCardIds: ['066', '068', '070', '073', '075'],
          dialogue: {
            intro: "Look into my eyes... let's play a game you'll never forget.",
            win: 'You resist my charm? How rare. Take this enchanted prize.',
            lose: "Sweet dreams. You never stood a chance.",
          },
        },
        rewardPool: ['056', '057', '058', '059', '060', '061', '062', '063', '064'],
        hardRewardPool: ['082', '083', '085', '086', '088', '096'],
      },
      {
        id: 'desp-3',
        regionId: 'desert-palace',
        name: 'Arcane Library',
        description:
          'A mage studies forbidden card techniques among towering shelves of tomes.',
        isBoss: false,
        position: { x: 620, y: 360 },
        opponent: {
          name: 'Mage Valia',
          title: 'Arcane Scholar',
          aiLevel: 'hard',
          deckCardIds: ['047', '049', '052', '055', '057'],
          hardDeckCardIds: ['067', '069', '073', '081', '083'],
          dialogue: {
            intro: 'The arcane arts extend to card magic. Allow me to demonstrate.',
            win: 'Your technique disrupted my spell. Take this arcane artifact.',
            lose: 'Magic always triumphs. Study harder.',
          },
        },
        rewardPool: ['057', '058', '059', '060', '061', '062', '063', '064', '065'],
        hardRewardPool: ['083', '085', '086', '088', '096', '098'],
      },
      {
        id: 'desp-4',
        regionId: 'desert-palace',
        name: 'Sand Garden',
        description:
          'A desert warden commands the shifting sands from an impossible floating garden.',
        isBoss: false,
        position: { x: 680, y: 380 },
        opponent: {
          name: 'Sand Golem Master',
          title: 'Desert Warden',
          aiLevel: 'hard',
          deckCardIds: ['048', '050', '053', '057', '059'],
          hardDeckCardIds: ['068', '070', '075', '083', '086'],
          dialogue: {
            intro: 'My golems guard these halls. Beat me, or be buried in sand.',
            win: 'The sands shift in your favor. Claim your prize before they change.',
            lose: 'The desert reclaims all. You are no exception.',
          },
        },
        rewardPool: ['058', '059', '060', '061', '062', '063', '064', '065', '066'],
        hardRewardPool: ['085', '086', '088', '096', '098', '099'],
      },
      {
        id: 'desp-5',
        regionId: 'desert-palace',
        name: 'Throne Room',
        description:
          "Black Waltz No. 3 enforces Kuja's will from the heart of the palace.",
        isBoss: true,
        position: { x: 740, y: 360 },
        opponent: {
          name: 'Black Waltz No. 3',
          title: "Kuja's Enforcer",
          aiLevel: 'hard',
          deckCardIds: ['050', '053', '055', '058', '060'],
          hardDeckCardIds: ['069', '073', '081', '086', '088'],
          dialogue: {
            intro: "I am Kuja's instrument of destruction. Your cards will burn.",
            win: 'IMPOSSIBLE! Master Kuja will hear of this... take your spoils.',
            lose: 'As Master Kuja commands, all who oppose us fall.',
          },
        },
        rewardPool: ['059', '060', '061', '062', '063', '064', '065', '066', '067', '068'],
        hardRewardPool: ['086', '088', '096', '098', '099', '100'],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // REGION 7: IPSEN'S CASTLE — Inverted castle, hard-expert
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'ipsens-castle',
    name: "Ipsen's Castle",
    description:
      'An ancient inverted castle where gravity defies logic. Only the strongest dare enter.',
    icon: '🏚️',
    unlockAfter: 'desert-palace',
    nodes: [
      {
        id: 'ipse-1',
        regionId: 'ipsens-castle',
        name: 'Inverted Foyer',
        description:
          'Gravity plays tricks on card games in this upside-down entrance hall.',
        isBoss: false,
        position: { x: 80, y: 500 },
        opponent: {
          name: 'Inverter Clyde',
          title: 'Gravity Bender',
          aiLevel: 'hard',
          deckCardIds: ['055', '056', '057', '058', '059'],
          hardDeckCardIds: ['070', '071', '072', '073', '075'],
          dialogue: {
            intro: 'Up is down here, and weak is strong. Can you adapt?',
            win: "You've bent gravity to your will. Take this inverted treasure.",
            lose: "The castle's rules favor those who understand them. I do. You don't.",
          },
        },
        rewardPool: ['065', '066', '067', '068', '069', '070', '073', '074', '075'],
        hardRewardPool: ['083', '086', '088', '096', '098', '099'],
      },
      {
        id: 'ipse-2',
        regionId: 'ipsens-castle',
        name: 'Phantom Gallery',
        description:
          'A spectral knight haunts the corridors, replaying battles from ages past.',
        isBoss: false,
        position: { x: 140, y: 510 },
        opponent: {
          name: 'Phantom Haze',
          title: 'Spectral Knight',
          aiLevel: 'hard',
          deckCardIds: ['056', '058', '060', '063', '064'],
          hardDeckCardIds: ['071', '073', '075', '081', '083'],
          dialogue: {
            intro: 'I am what remains when a knight falls but refuses to rest.',
            win: "You've banished my shade... for now. Take what I leave behind.",
            lose: 'Phantoms cannot be defeated. We merely reform.',
          },
        },
        rewardPool: ['066', '067', '068', '069', '070', '073', '074', '075', '081'],
        hardRewardPool: ['086', '088', '096', '098', '099', '100'],
      },
      {
        id: 'ipse-3',
        regionId: 'ipsens-castle',
        name: 'Rust Hall',
        description:
          'A corroded guardian has stood watch for centuries, strategy sharpened by time.',
        isBoss: false,
        position: { x: 200, y: 500 },
        opponent: {
          name: 'Rust Guardian',
          title: 'Corroded Sentinel',
          aiLevel: 'hard',
          deckCardIds: ['057', '059', '063', '065', '066'],
          hardDeckCardIds: ['072', '075', '081', '083', '086'],
          dialogue: {
            intro: 'I have stood watch for centuries. Rust cannot dull my strategy.',
            win: 'Time corrodes all things... except your skill. Take this relic.',
            lose: 'Centuries of patience. You cannot rush past a guardian.',
          },
        },
        rewardPool: ['067', '068', '069', '070', '073', '074', '075', '081', '082'],
        hardRewardPool: ['071', '083', '088', '096', '098', '100'],
      },
      {
        id: 'ipse-4',
        regionId: 'ipsens-castle',
        name: 'Mirror Chamber',
        description:
          "A shapeshifter studies opponents' decks through enchanted mirrors.",
        isBoss: false,
        position: { x: 260, y: 520 },
        opponent: {
          name: 'Mimic Queen',
          title: 'Shapeshifter',
          aiLevel: 'hard',
          deckCardIds: ['058', '060', '064', '066', '069'],
          hardDeckCardIds: ['073', '076', '083', '086', '088'],
          dialogue: {
            intro: "I've studied your deck already. I know your every move.",
            win: "You surprised me—a rare feat. Take this shapeshifting card.",
            lose: 'I became your perfect counter. Adapt faster.',
          },
        },
        rewardPool: ['068', '069', '070', '073', '074', '075', '081', '082', '085'],
        hardRewardPool: ['072', '076', '086', '098', '099', '100'],
      },
      {
        id: 'ipse-5',
        regionId: 'ipsens-castle',
        name: 'Gravity Core',
        description:
          'The castle overlord commands twisted space at the heart of the inverted fortress.',
        isBoss: true,
        position: { x: 320, y: 500 },
        opponent: {
          name: 'Taharka',
          title: 'Castle Overlord',
          aiLevel: 'hard',
          deckCardIds: ['060', '064', '066', '069', '073'],
          hardDeckCardIds: ['076', '081', '086', '088', '096'],
          dialogue: {
            intro: 'This castle is mine. All who enter play by my rules.',
            win: "You've conquered my domain... impossible. Take the castle's greatest treasure.",
            lose: 'The castle swallows another challenger. You will not be the last.',
          },
        },
        rewardPool: ['069', '070', '073', '074', '075', '076', '081', '082', '083', '085'],
        hardRewardPool: ['071', '072', '076', '088', '098', '099', '100'],
      },
    ],
  },

  // ═══════════════════════════════════════════════════════════════
  // REGION 8: MEMORIA — Final area, expert
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'memoria',
    name: 'Memoria',
    description:
      'The place where memories crystallize. Only the strongest card masters survive its trials.',
    icon: '💎',
    unlockAfter: 'ipsens-castle',
    nodes: [
      {
        id: 'mem-1',
        regionId: 'memoria',
        name: 'Entrance Hall',
        description:
          'Echoes of past card masters linger as shades, eternally replaying their greatest games.',
        isBoss: false,
        position: { x: 500, y: 500 },
        opponent: {
          name: 'Memory Shade',
          title: 'Echo of the Past',
          aiLevel: 'hard',
          deckCardIds: ['065', '066', '067', '068', '069'],
          hardDeckCardIds: ['075', '076', '083', '086', '088'],
          dialogue: {
            intro: 'I am the echo of a champion long gone. Match my eternal skill.',
            win: 'My memory fades... but take this remnant of my power.',
            lose: 'Echoes never die. Return when you are stronger.',
          },
        },
        rewardPool: ['073', '074', '075', '076', '078', '081', '082', '085', '086'],
        hardRewardPool: ['088', '096', '098', '099', '100', '071'],
      },
      {
        id: 'mem-2',
        regionId: 'memoria',
        name: 'Time Warp',
        description:
          'Time flows strangely here. Your opponent seems to know your moves before you make them.',
        isBoss: false,
        position: { x: 560, y: 510 },
        opponent: {
          name: 'Chrono Phantom',
          title: 'Time Walker',
          aiLevel: 'hard',
          deckCardIds: ['066', '068', '070', '073', '074'],
          hardDeckCardIds: ['076', '081', '083', '088', '096'],
          dialogue: {
            intro: 'I have already seen how this game ends. Shall we play anyway?',
            win: 'You changed the timeline? Remarkable. Claim your prize.',
            lose: 'Time cannot be rewritten. Not by you.',
          },
        },
        rewardPool: ['074', '075', '076', '078', '081', '082', '085', '086', '088'],
        hardRewardPool: ['096', '098', '099', '100', '071', '072'],
      },
      {
        id: 'mem-3',
        regionId: 'memoria',
        name: 'Inferno Gate',
        description:
          'The Fiend of Fire guards this passage with blazing card techniques.',
        isBoss: false,
        position: { x: 620, y: 500 },
        opponent: {
          name: 'Maliris',
          title: 'Fiend of Fire',
          aiLevel: 'hard',
          deckCardIds: ['067', '069', '073', '075', '078'],
          hardDeckCardIds: ['081', '083', '086', '088', '098'],
          dialogue: {
            intro: 'I am the flame that consumes all. Your cards will be ash.',
            win: 'The fire... you quenched it?! Take this ember of my power.',
            lose: 'All things burn in the end. Your defeat was inevitable.',
          },
        },
        rewardPool: ['075', '076', '078', '081', '082', '085', '086', '088', '096'],
        hardRewardPool: ['098', '099', '100', '071', '072', '076'],
      },
      {
        id: 'mem-4',
        regionId: 'memoria',
        name: 'Earth Sanctum',
        description:
          'The Fiend of Earth blocks the path to the crystal core.',
        isBoss: false,
        position: { x: 680, y: 520 },
        opponent: {
          name: 'Lich',
          title: 'Fiend of Earth',
          aiLevel: 'hard',
          deckCardIds: ['068', '070', '075', '081', '082'],
          hardDeckCardIds: ['083', '086', '088', '098', '099'],
          dialogue: {
            intro: 'The earth remembers all who have fallen here. You will join them.',
            win: 'The earth trembles? You are strong. Take this relic of the deep.',
            lose: 'Dust to dust. The earth reclaims another.',
          },
        },
        rewardPool: ['076', '078', '081', '082', '085', '086', '088', '096', '098'],
        hardRewardPool: ['099', '100', '071', '072', '076', '083'],
      },
      {
        id: 'mem-5',
        regionId: 'memoria',
        name: 'Crystal Core',
        description:
          'The final challenge. Ozma, the ultimate entity, guards the most powerful cards in existence.',
        isBoss: true,
        position: { x: 740, y: 500 },
        opponent: {
          name: 'Ozma',
          title: 'Ultimate Entity',
          aiLevel: 'hard',
          deckCardIds: ['069', '073', '081', '083', '086'],
          hardDeckCardIds: ['088', '096', '098', '099', '100'],
          dialogue: {
            intro: '...',
            win: '...! Take what you have earned. You are the true Card Master.',
            lose: '...',
          },
        },
        rewardPool: ['078', '081', '082', '085', '086', '088', '096', '098', '099', '100'],
        hardRewardPool: ['071', '072', '076', '083', '088', '098', '099', '100'],
      },
    ],
  },
]

export const campaignRegions = regions

export const allCampaignNodes: CampaignNode[] = regions.flatMap((r) => r.nodes)

export const getCampaignNode = (nodeId: string): CampaignNode | undefined =>
  allCampaignNodes.find((n) => n.id === nodeId)

export const getRegionForNode = (nodeId: string): CampaignRegion | undefined => {
  const node = getCampaignNode(nodeId)
  if (!node) return undefined
  return regions.find((r) => r.id === node.regionId)
}

export const isRegionComplete = (regionId: string, completedNodes: string[]): boolean => {
  const region = regions.find((r) => r.id === regionId)
  if (!region) return false
  return region.nodes.every((n) => completedNodes.includes(n.id))
}

export const isNodeAvailable = (node: CampaignNode, completedNodes: string[]): boolean => {
  const region = regions.find((r) => r.id === node.regionId)
  if (!region) return false
  if (!region.unlockAfter) {
    const idx = region.nodes.indexOf(node)
    if (idx === 0) return true
    return completedNodes.includes(region.nodes[idx - 1].id)
  }
  if (!isRegionComplete(region.unlockAfter, completedNodes)) return false
  const idx = region.nodes.indexOf(node)
  if (idx === 0) return true
  return completedNodes.includes(region.nodes[idx - 1].id)
}

export const isRegionAvailable = (region: CampaignRegion, completedNodes: string[]): boolean => {
  if (!region.unlockAfter) return true
  return isRegionComplete(region.unlockAfter, completedNodes)
}
