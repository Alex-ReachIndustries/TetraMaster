import type { CardDefinition } from '../engine/types'
import allCards from './cards.json'

const cards = allCards as CardDefinition[]

export type AiLevel = 'easy' | 'medium' | 'hard'

export interface Opponent {
  name: string
  title: string
  aiLevel: AiLevel
  deckCardIds: string[]
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

export const starterCardIds = ['023', '028', '030', '031', '036']

export const getCardDef = (id: string): CardDefinition | undefined =>
  cards.find((c) => c.id === id)

export const getCardDefs = (ids: string[]): CardDefinition[] =>
  ids.map((id) => getCardDef(id)).filter((c): c is CardDefinition => c !== undefined)

const regions: CampaignRegion[] = [
  {
    id: 'alexandria',
    name: 'Alexandria',
    description: 'The royal city where Tetra Master is a beloved pastime among citizens and soldiers alike.',
    icon: '🏰',
    unlockAfter: null,
    nodes: [
      {
        id: 'alex-village',
        regionId: 'alexandria',
        name: 'Village Square',
        description: 'A friendly kid challenges passing travelers to casual card games.',
        isBoss: false,
        position: { x: 0, y: 0 },
        opponent: {
          name: 'Hippaul',
          title: 'Aspiring Card Player',
          aiLevel: 'easy',
          deckCardIds: ['001', '002', '003', '005', '089'],
          dialogue: {
            intro: "Hey! Wanna play some cards? I've been practicing!",
            win: 'Wow, you beat me! Here, pick a card from my collection.',
            lose: "Ha! I win! Don't worry, you'll get better!",
          },
        },
        rewardPool: ['006', '007', '008', '009', '010', '077', '080', '091'],
      },
      {
        id: 'alex-gates',
        regionId: 'alexandria',
        name: 'Town Gates',
        description: 'A Pluto Knight guards the entrance and plays cards to pass the time.',
        isBoss: false,
        position: { x: 1, y: 0 },
        opponent: {
          name: 'Pluto Knight Dan',
          title: 'Gate Guard',
          aiLevel: 'easy',
          deckCardIds: ['003', '006', '007', '009', '010'],
          dialogue: {
            intro: 'Halt! ...Actually, want to play a quick round? Guard duty is boring.',
            win: 'Good match! Take one of these for your trouble.',
            lose: "That's the Pluto Knight training for ya!",
          },
        },
        rewardPool: ['008', '011', '012', '013', '014', '090', '092', '093'],
      },
      {
        id: 'alex-castle',
        regionId: 'alexandria',
        name: 'Alexandria Castle',
        description: 'Captain Steiner is the strongest card player in Alexandria. Defeat him to prove your worth.',
        isBoss: true,
        position: { x: 2, y: 0 },
        opponent: {
          name: 'Captain Steiner',
          title: 'Knight Captain',
          aiLevel: 'easy',
          deckCardIds: ['007', '009', '010', '012', '014'],
          dialogue: {
            intro: 'I am Adelbert Steiner, Captain of the Pluto Knights! En garde... with cards!',
            win: 'A worthy opponent! Choose a prize from the Castle armory.',
            lose: 'The honor of Alexandria is upheld!',
          },
        },
        rewardPool: ['015', '016', '017', '018', '019', '020', '046', '094'],
      },
    ],
  },
  {
    id: 'lindblum',
    name: 'Lindblum',
    description: 'The grand city of industry and airships. Card enthusiasts gather from across the continent.',
    icon: '🏙️',
    unlockAfter: 'alexandria',
    nodes: [
      {
        id: 'lind-business',
        regionId: 'lindblum',
        name: 'Business District',
        description: 'A traveling card collector hunts for rare finds in the bustling market.',
        isBoss: false,
        position: { x: 0, y: 1 },
        opponent: {
          name: 'Card Collector Gon',
          title: 'Rare Card Hunter',
          aiLevel: 'easy',
          deckCardIds: ['010', '013', '015', '016', '020'],
          dialogue: {
            intro: "Ooh, nice collection you've got! Let me see what you can do.",
            win: "Impressive! Here, take a look at what I'm willing to trade.",
            lose: 'Better luck next time! I know my cards inside and out.',
          },
        },
        rewardPool: ['017', '018', '019', '021', '022', '023', '084', '087'],
      },
      {
        id: 'lind-theater',
        regionId: 'lindblum',
        name: 'Theater District',
        description: 'A famous actor challenges opponents with dramatic flair between performances.',
        isBoss: false,
        position: { x: 1, y: 1 },
        opponent: {
          name: 'Lowell',
          title: 'Star Actor',
          aiLevel: 'medium',
          deckCardIds: ['014', '017', '019', '021', '023'],
          dialogue: {
            intro: 'The stage is set! Let our cards perform a grand drama!',
            win: 'Bravo! A standing ovation for you! Choose your curtain call prize.',
            lose: 'The show must go on... and I remain the star!',
          },
        },
        rewardPool: ['020', '024', '025', '026', '027', '028', '029', '097'],
      },
      {
        id: 'lind-castle',
        regionId: 'lindblum',
        name: 'Grand Castle',
        description: "Regent Cid's trusted minister is a formidable card strategist.",
        isBoss: true,
        position: { x: 2, y: 1 },
        opponent: {
          name: 'Minister Artania',
          title: 'Grand Strategist',
          aiLevel: 'medium',
          deckCardIds: ['018', '023', '024', '026', '030'],
          dialogue: {
            intro: 'Strategy in cards mirrors strategy in governance. Show me yours.',
            win: "Excellent strategy! The Regent's vaults hold these rewards.",
            lose: 'A minister must never lose composure—or a card game.',
          },
        },
        rewardPool: ['028', '029', '030', '031', '032', '033', '034', '060', '062', '095'],
      },
    ],
  },
  {
    id: 'treno',
    name: 'Treno',
    description: 'The city of eternal night. Nobles and thieves alike compete in underground card tournaments.',
    icon: '🌙',
    unlockAfter: 'lindblum',
    nodes: [
      {
        id: 'treno-stadium',
        regionId: 'treno',
        name: 'Card Stadium',
        description: 'The official tournament grounds where seasoned players test their mettle.',
        isBoss: false,
        position: { x: 0, y: 2 },
        opponent: {
          name: 'Cardmaster Tristam',
          title: 'Tournament Regular',
          aiLevel: 'medium',
          deckCardIds: ['024', '028', '030', '032', '035'],
          dialogue: {
            intro: "Welcome to the Stadium. I've been tournament champion three years running.",
            win: 'You broke my streak! Fair is fair—take your pick.',
            lose: 'Four years and counting!',
          },
        },
        rewardPool: ['033', '034', '035', '036', '037', '038', '057', '078'],
      },
      {
        id: 'treno-slum',
        regionId: 'treno',
        name: 'Slum District',
        description: 'A notorious thief plays cards with stolen goods as stakes.',
        isBoss: false,
        position: { x: 1, y: 2 },
        opponent: {
          name: 'Alleyway Jack',
          title: 'Card Thief',
          aiLevel: 'medium',
          deckCardIds: ['029', '031', '034', '037', '046'],
          dialogue: {
            intro: "In the slums, cards are currency. Let's see what you're worth.",
            win: "Quick hands, quick mind. You've earned this.",
            lose: "Don't feel bad—I steal from the best.",
          },
        },
        rewardPool: ['036', '038', '039', '040', '041', '042', '043', '074'],
      },
      {
        id: 'treno-mansion',
        regionId: 'treno',
        name: "King's Mansion",
        description: "The legendary Card King holds court in Treno's finest estate.",
        isBoss: true,
        position: { x: 2, y: 2 },
        opponent: {
          name: 'Card King',
          title: 'Undisputed Champion',
          aiLevel: 'medium',
          deckCardIds: ['032', '035', '036', '038', '046'],
          dialogue: {
            intro: 'You stand before the Card King. Few have bested me. None twice.',
            win: 'Impossible! ...Take your reward. I must reconsider my strategy.',
            lose: "The crown remains where it belongs. I am the Card King!",
          },
        },
        rewardPool: ['039', '040', '041', '042', '043', '044', '045', '061', '063', '068'],
      },
    ],
  },
  {
    id: 'cleyra',
    name: 'Cleyra',
    description: 'The hidden settlement in the great tree. Its guardians are disciplined and tactical.',
    icon: '🌳',
    unlockAfter: 'treno',
    nodes: [
      {
        id: 'cleyra-trunk',
        regionId: 'cleyra',
        name: 'Trunk Base',
        description: 'A vigilant sentinel tests all who seek passage up the great tree.',
        isBoss: false,
        position: { x: 0, y: 3 },
        opponent: {
          name: 'Sentinel Nero',
          title: 'Tree Guardian',
          aiLevel: 'medium',
          deckCardIds: ['036', '039', '041', '043', '047'],
          dialogue: {
            intro: 'None may pass without proving their worth. Draw your cards.',
            win: 'You have earned passage. Take this as a token.',
            lose: 'The tree is well guarded. Train more and return.',
          },
        },
        rewardPool: ['044', '045', '047', '048', '049', '050', '065', '069'],
      },
      {
        id: 'cleyra-temple',
        regionId: 'cleyra',
        name: 'Sacred Temple',
        description: 'The high priests guard ancient cards with mystical power.',
        isBoss: false,
        position: { x: 1, y: 3 },
        opponent: {
          name: 'High Priest Caleb',
          title: 'Temple Guardian',
          aiLevel: 'hard',
          deckCardIds: ['040', '044', '047', '049', '060'],
          dialogue: {
            intro: 'The ancient cards speak to those with true spirit. Let us see yours.',
            win: 'The spirits favor you. Choose wisely from these sacred cards.',
            lose: 'The temple remains sealed to the unworthy.',
          },
        },
        rewardPool: ['048', '050', '051', '052', '053', '057', '064', '066'],
      },
      {
        id: 'cleyra-crown',
        regionId: 'cleyra',
        name: 'Crown Summit',
        description: "At the peak of the great tree, Cleyra's greatest card master awaits.",
        isBoss: true,
        position: { x: 2, y: 3 },
        opponent: {
          name: 'Oracle Kildea',
          title: 'Seer of the Summit',
          aiLevel: 'hard',
          deckCardIds: ['047', '049', '050', '052', '063'],
          dialogue: {
            intro: 'I have foreseen your arrival... and your defeat.',
            win: 'Impossible—my visions were wrong! Take this rare treasure.',
            lose: 'The future unfolds as I predicted.',
          },
        },
        rewardPool: ['051', '052', '053', '054', '058', '065', '066', '073', '075', '081'],
      },
    ],
  },
  {
    id: 'memoria',
    name: 'Memoria',
    description: 'The place where memories crystallize. Only the strongest card masters survive its trials.',
    icon: '💎',
    unlockAfter: 'cleyra',
    nodes: [
      {
        id: 'mem-entrance',
        regionId: 'memoria',
        name: 'Entrance Hall',
        description: 'Echoes of past card masters linger as shades, eternally replaying their greatest games.',
        isBoss: false,
        position: { x: 0, y: 4 },
        opponent: {
          name: 'Memory Shade',
          title: 'Echo of the Past',
          aiLevel: 'hard',
          deckCardIds: ['050', '052', '053', '058', '064'],
          dialogue: {
            intro: 'I am the echo of a champion long gone. Match my eternal skill.',
            win: 'My memory fades... but take this remnant of my power.',
            lose: 'Echoes never die. Return when you are stronger.',
          },
        },
        rewardPool: ['054', '055', '056', '067', '069', '070', '076', '083', '086'],
      },
      {
        id: 'mem-warp',
        regionId: 'memoria',
        name: 'Time Warp',
        description: 'Time flows strangely here. Your opponent seems to know your moves before you make them.',
        isBoss: false,
        position: { x: 1, y: 4 },
        opponent: {
          name: 'Chrono Phantom',
          title: 'Time Walker',
          aiLevel: 'hard',
          deckCardIds: ['053', '054', '064', '066', '069'],
          dialogue: {
            intro: 'I have already seen how this game ends. Shall we play anyway?',
            win: 'You... changed the timeline? Remarkable. Claim your prize.',
            lose: 'Time cannot be rewritten. Not by you.',
          },
        },
        rewardPool: ['055', '056', '067', '070', '071', '072', '075', '079', '088', '098'],
      },
      {
        id: 'mem-crystal',
        regionId: 'memoria',
        name: 'Crystal Core',
        description: 'The final challenge. Ozma, the ultimate entity, guards the most powerful cards in existence.',
        isBoss: true,
        position: { x: 2, y: 4 },
        opponent: {
          name: 'Ozma',
          title: 'Ultimate Entity',
          aiLevel: 'hard',
          deckCardIds: ['054', '055', '056', '070', '083'],
          dialogue: {
            intro: '...',
            win: '...! Take what you have earned. You are the true Card Master.',
            lose: '...',
          },
        },
        rewardPool: ['055', '056', '067', '070', '071', '072', '073', '076', '079', '083', '088', '098', '099', '100'],
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
