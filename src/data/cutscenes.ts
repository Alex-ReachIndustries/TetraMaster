export interface CutsceneSlide {
  speaker?: string
  text: string
  bg: [string, string]
  icon?: string
}

export interface Cutscene {
  id: string
  slides: CutsceneSlide[]
}

const sky: [string, string] = ['#0c1a30', '#060e1c']
const dawn: [string, string] = ['#2a1a10', '#1a0e08']
const night: [string, string] = ['#06060e', '#020208']
const green: [string, string] = ['#0a1a0a', '#040e04']
const sand: [string, string] = ['#2a200a', '#1a1406']
const purple: [string, string] = ['#14082a', '#0a041a']
const red: [string, string] = ['#2a0808', '#1a0404']
const crystal: [string, string] = ['#08082a', '#04041a']

export const cutscenes: Record<string, Cutscene> = {
  'journey-start': {
    id: 'journey-start',
    slides: [
      { text: 'In the world of Gaia, a card game captivates the hearts of people across every kingdom...', bg: sky, icon: '🌍' },
      { text: 'Tetra Master — a game of strategy, arrows, and fate. From village squares to royal courts, card players battle for glory.', bg: dawn, icon: '🃏' },
      { speaker: 'You', text: 'I may be a beginner, but I\'ll build my collection and become the greatest Card Master this world has ever seen!', bg: sky, icon: '⭐' },
      { text: 'Your journey begins in the kingdom of Alexandria...', bg: dawn, icon: '🏰' },
    ],
  },

  'region-alexandria-complete': {
    id: 'region-alexandria-complete',
    slides: [
      { text: 'Word of your victories spreads through Alexandria. Even Captain Steiner acknowledges your skill.', bg: dawn, icon: '🏰' },
      { speaker: 'Steiner', text: 'Impressive... You have the makings of a true card player. But Alexandria is just the beginning.', bg: sky, icon: '🛡️' },
      { text: 'The grand city of Lindblum awaits. Its card players are sharper, their decks more refined.', bg: sky, icon: '🏙️' },
    ],
  },

  'region-lindblum-complete': {
    id: 'region-lindblum-complete',
    slides: [
      { text: 'Lindblum\'s finest have fallen to your cards. Minister Artania sends word of a worthy challenger.', bg: sky, icon: '🏙️' },
      { speaker: 'Artania', text: 'The rain kingdom of Burmecia holds warriors who fight with cards as fiercely as with spears.', bg: sky, icon: '📜' },
      { text: 'You board an airship bound for Burmecia, rain already visible on the horizon...', bg: night, icon: '🌧️' },
    ],
  },

  'region-burmecia-complete': {
    id: 'region-burmecia-complete',
    slides: [
      { text: 'Even the legendary Dragon Knight Reis could not stop your advance. The rain of Burmecia salutes you.', bg: sky, icon: '🌧️' },
      { speaker: 'Reis', text: 'You fight with honour. Seek the city of Treno — its tournament will test you like nothing before.', bg: night, icon: '🐉' },
      { text: 'Treno, the city of eternal night. Nobles and thieves alike compete in its legendary card tournaments.', bg: night, icon: '🌙' },
    ],
  },

  'region-treno-complete': {
    id: 'region-treno-complete',
    slides: [
      { text: 'The Card King\'s crown falls. You are the new champion of Treno\'s underground tournaments.', bg: night, icon: '👑' },
      { text: 'Whispers speak of an ancient settlement hidden within a great tree — Cleyra, where the oldest cards are kept.', bg: green, icon: '🌳' },
      { speaker: 'Card King', text: 'I underestimated you. Go to Cleyra. But beware — its guardians play by ancient rules.', bg: night, icon: '🌙' },
    ],
  },

  'region-cleyra-complete': {
    id: 'region-cleyra-complete',
    slides: [
      { text: 'The Oracle\'s visions shattered against your strategy. Cleyra\'s ancient cards are yours.', bg: green, icon: '🌳' },
      { speaker: 'Kildea', text: 'I foresaw many futures... but not this one. You are destined for something greater.', bg: green, icon: '👁️' },
      { text: 'A dark palace rises from the desert sands. Kuja\'s domain — where the most dangerous players gather.', bg: sand, icon: '🏜️' },
    ],
  },

  'region-desert-palace-complete': {
    id: 'region-desert-palace-complete',
    slides: [
      { text: 'The Desert Palace crumbles behind you. Even Kuja\'s enchanted cards could not prevail.', bg: sand, icon: '🏜️' },
      { text: 'An inverted castle hangs in the sky — Ipsen\'s Castle, where the rules of the world are reversed.', bg: purple, icon: '🏚️' },
      { speaker: 'You', text: 'Cards that defy logic... opponents that break convention. I\'m ready for anything.', bg: sky, icon: '⚔️' },
    ],
  },

  'region-ipsens-castle-complete': {
    id: 'region-ipsens-castle-complete',
    slides: [
      { text: 'The impossible castle yields. Its guardian acknowledges you as a true master.', bg: purple, icon: '🏚️' },
      { text: 'Only one place remains — Memoria, where the memories of all card players crystallize for eternity.', bg: crystal, icon: '💎' },
      { speaker: 'You', text: 'This is it. The final challenge. Everything I\'ve learned, every card I\'ve earned... it all leads here.', bg: night, icon: '🌟' },
    ],
  },

  'journey-complete': {
    id: 'journey-complete',
    slides: [
      { text: 'Ozma, the ultimate entity, falls silent. The crystals of Memoria shatter and reform around you.', bg: crystal, icon: '💎' },
      { text: 'From a humble beginner in Alexandria\'s village square to the conqueror of Memoria itself...', bg: night, icon: '🌟' },
      { speaker: 'Ozma', text: '...You have earned this title. You are the Card Master.', bg: purple, icon: '🔮' },
      { text: 'Your legend will be remembered across all of Gaia. But the cards still call — there are always harder battles to fight.', bg: dawn, icon: '👑' },
      { text: '— THE END —\n\nThank you for playing Tetra Master: Journey Mode', bg: night, icon: '🃏' },
    ],
  },

  'first-boss-defeat': {
    id: 'first-boss-defeat',
    slides: [
      { text: 'You\'ve defeated your first regional boss! Their rare cards strengthen your collection.', bg: dawn, icon: '⭐' },
      { text: 'Each region\'s boss guards the path forward. Defeat them all to reach Memoria.', bg: sky, icon: '🗺️' },
    ],
  },

  'first-hard-clear': {
    id: 'first-hard-clear',
    slides: [
      { text: 'A hard battle, won! These premium cards are rewards for true masters.', bg: red, icon: '🔥' },
      { speaker: 'You', text: 'Hard mode... the real challenge. These cards will make my deck unstoppable.', bg: night, icon: '💪' },
    ],
  },
}

export type CutsceneTrigger =
  | 'journey-start'
  | `region-${string}-complete`
  | 'journey-complete'
  | 'first-boss-defeat'
  | 'first-hard-clear'

export function getCutsceneForTrigger(
  trigger: CutsceneTrigger,
  seenCutscenes: string[],
): Cutscene | null {
  const scene = cutscenes[trigger]
  if (!scene) return null
  if (seenCutscenes.includes(trigger)) return null
  return scene
}
