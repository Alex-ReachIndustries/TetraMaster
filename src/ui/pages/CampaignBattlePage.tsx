import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { selectMoveEasy, selectMoveHard, selectMoveMedium } from '../../ai'
import {
  getCampaignNode,
  getCardDef,
  type AiLevel,
  type CampaignNode,
} from '../../data/campaign'
import { createCardInstance } from '../../engine/cards'
import { createGame, applyMove, countScores } from '../../engine/rules'
import { createRng } from '../../engine/rng'
import type {
  BattleResult,
  CardInstance,
  GameState,
  Move,
  PlayerId,
  Position,
} from '../../engine/types'
import { useSettingsStore } from '../../state'
import { useCampaignStore } from '../../state/campaignStore'
import { BattleAnimation, type BattlePresentation } from '../components/BattleAnimation'
import { BoardView } from '../components/BoardView'
import { CardView } from '../components/CardView'
import { CAPTURE_FLASH_MS, PLACE_FLASH_MS, getAiDelayMs } from '../animationConfig'
import { AchievementToast } from '../components/AchievementToast'

const positionKey = (position: Position) => `${position.x},${position.y}`

type MatchPhase = 'playing' | 'victory' | 'defeat'

export const CampaignBattlePage = () => {
  const { nodeId } = useParams<{ nodeId: string }>()
  const [searchParams] = useSearchParams()
  const isChallenge = searchParams.get('challenge') === '1'
  const navigate = useNavigate()
  const settings = useSettingsStore()
  const campaign = useCampaignStore()

  const node = useMemo(
    () => (nodeId ? getCampaignNode(nodeId) : undefined),
    [nodeId],
  )

  const challenge = useMemo(
    () =>
      isChallenge && nodeId
        ? campaign.activeChallenges.find((c) => c.nodeId === nodeId) ?? null
        : null,
    [isChallenge, nodeId, campaign.activeChallenges],
  )

  if (!node) {
    return (
      <section className="page">
        <h1>Location not found</h1>
        <button className="button button--primary" onClick={() => navigate('/campaign')}>
          Back to Map
        </button>
      </section>
    )
  }

  return (
    <CampaignMatch
      node={node}
      challenge={challenge}
      playerDeck={campaign.campaignDeck}
      settings={settings}
      campaign={campaign}
      navigate={navigate}
    />
  )
}

const CampaignMatch = ({
  node,
  challenge,
  playerDeck,
  settings,
  campaign,
  navigate,
}: {
  node: CampaignNode
  challenge: ReturnType<typeof useCampaignStore.getState>['activeChallenges'][0] | null
  playerDeck: CardInstance[]
  settings: ReturnType<typeof useSettingsStore.getState>
  campaign: ReturnType<typeof useCampaignStore.getState>
  navigate: ReturnType<typeof useNavigate>
}) => {
  const aiLevel: AiLevel = challenge?.modifier.aiLevelOverride ?? node.opponent.aiLevel

  const opponentDeck = useMemo(
    () => buildOpponentDeck(node),
    [node],
  )

  const buildInitialGame = useCallback(() => {
    const extraBlocks = challenge?.modifier.extraBlocks ?? 0
    return createGame({
      playerNames: ['You', node.opponent.name],
      playerHands: [playerDeck, opponentDeck],
      seed: `campaign-${node.id}-${Date.now()}`,
      blockedCount:
        settings.blockMode === 'fixed'
          ? settings.blockCount + extraBlocks
          : undefined,
      useRandomBlocks: settings.blockMode === 'random',
    })
  }, [node, playerDeck, opponentDeck, settings, challenge])

  const [game, setGameState] = useState<GameState | null>(() => buildInitialGame())
  const [matchPhase, setMatchPhase] = useState<MatchPhase>('playing')
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [flashByPosition, setFlashByPosition] = useState<Record<string, 'place' | 'capture'>>({})
  const [battleQueue, setBattleQueue] = useState<BattlePresentation[]>([])
  const [activeBattle, setActiveBattle] = useState<BattlePresentation | null>(null)
  const [pendingCaptureFlashes, setPendingCaptureFlashes] = useState<Position[]>([])
  const [rewardCards, setRewardCards] = useState<CardInstance[]>([])
  const [rewardPicked, setRewardPicked] = useState(false)

  const flashTimersRef = useRef<Record<string, number>>({})
  const flashRafRef = useRef<Record<string, number>>({})
  const aiTimerRef = useRef<number | null>(null)
  const latestGameRef = useRef<GameState | null>(null)

  const scores = useMemo(
    () => (game ? countScores(game) : { 0: 0, 1: 0 }),
    [game],
  )

  const isBattleAnimating = Boolean(activeBattle) || battleQueue.length > 0

  useEffect(() => {
    latestGameRef.current = game
  }, [game])

  useEffect(
    () => () => {
      Object.values(flashTimersRef.current).forEach((timer) => window.clearTimeout(timer))
      Object.values(flashRafRef.current).forEach((raf) => window.cancelAnimationFrame(raf))
      if (aiTimerRef.current !== null) window.clearTimeout(aiTimerRef.current)
    },
    [],
  )

  const clearFlashAt = useCallback((key: string) => {
    if (flashTimersRef.current[key]) {
      window.clearTimeout(flashTimersRef.current[key])
      delete flashTimersRef.current[key]
    }
    if (flashRafRef.current[key]) {
      window.cancelAnimationFrame(flashRafRef.current[key])
      delete flashRafRef.current[key]
    }
    setFlashByPosition((prev) => {
      if (!prev[key]) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  const resetTransientState = useCallback(() => {
    Object.values(flashTimersRef.current).forEach((timer) => window.clearTimeout(timer))
    Object.values(flashRafRef.current).forEach((raf) => window.cancelAnimationFrame(raf))
    flashTimersRef.current = {}
    flashRafRef.current = {}
    if (aiTimerRef.current !== null) {
      window.clearTimeout(aiTimerRef.current)
      aiTimerRef.current = null
    }
    setFlashByPosition({})
    setBattleQueue([])
    setActiveBattle(null)
    setPendingCaptureFlashes([])
  }, [])

  const triggerFlash = useCallback(
    (position: Position, type: 'place' | 'capture', durationMs: number) => {
      const key = positionKey(position)
      clearFlashAt(key)
      flashRafRef.current[key] = window.requestAnimationFrame(() => {
        setFlashByPosition((prev) => ({ ...prev, [key]: type }))
        delete flashRafRef.current[key]
      })
      flashTimersRef.current[key] = window.setTimeout(() => {
        clearFlashAt(key)
      }, durationMs)
    },
    [clearFlashAt],
  )

  const buildBattlePresentation = useCallback(
    (result: BattleResult, state: GameState): BattlePresentation | null => {
      const attackerCell = state.board[result.attackerPos.y]?.[result.attackerPos.x]
      const defenderCell = state.board[result.defenderPos.y]?.[result.defenderPos.x]
      if (attackerCell?.type !== 'card' || defenderCell?.type !== 'card') return null
      return {
        attacker: attackerCell.card,
        defender: defenderCell.card,
        attackerPlayer: result.attackerPlayer,
        defenderPlayer: result.defenderPlayer,
        roll: result.roll,
        winner: result.winner,
      }
    },
    [],
  )

  const processMove = useCallback(
    (state: GameState, move: Move) => {
      const nextState = applyMove(state, move)
      if (nextState === state) return false
      const newEvents = nextState.events.slice(state.events.length)
      const placePositions: Position[] = []
      const capturePositions: Position[] = []
      const captureSources: Position[] = []
      const battles: BattlePresentation[] = []
      let lastPlace: Position | null = null
      let lastBattle: BattleResult | null = null

      newEvents.forEach((event) => {
        if (event.type === 'place') {
          placePositions.push(event.position)
          lastPlace = event.position
          return
        }
        if (event.type === 'battle') {
          lastBattle = event.result
          const presentation = buildBattlePresentation(event.result, nextState)
          if (presentation) battles.push(presentation)
          return
        }
        if (event.type === 'capture') {
          capturePositions.push(event.position)
          if (event.reason === 'arrow' && lastPlace) captureSources.push(lastPlace)
          if (event.reason === 'battle' && lastBattle) {
            captureSources.push(
              lastBattle.winner === 'attacker'
                ? lastBattle.attackerPos
                : lastBattle.defenderPos,
            )
          }
        }
      })

      const uniquePositions = (positions: Position[]) => {
        const map = new Map<string, Position>()
        positions.forEach((pos) => map.set(positionKey(pos), pos))
        return Array.from(map.values())
      }

      setGameState(nextState)

      uniquePositions(placePositions).forEach((pos) =>
        triggerFlash(pos, 'place', PLACE_FLASH_MS),
      )

      const captureFlashes = uniquePositions([...capturePositions, ...captureSources])
      if (battles.length > 0) {
        setPendingCaptureFlashes((prev) => [...prev, ...captureFlashes])
        if (!activeBattle) {
          setActiveBattle(battles[0])
          if (battles.length > 1) setBattleQueue((prev) => [...prev, ...battles.slice(1)])
        } else {
          setBattleQueue((prev) => [...prev, ...battles])
        }
      } else {
        captureFlashes.forEach((pos) => triggerFlash(pos, 'capture', CAPTURE_FLASH_MS))
      }
      return true
    },
    [activeBattle, buildBattlePresentation, triggerFlash],
  )

  const runAiMove = useCallback(
    (state: GameState, playerId: PlayerId) => {
      const config = {
        timeBudgetMs: settings.aiThinkTimeMs[aiLevel],
        randomness: settings.aiRandomness,
        rngSeed: `${state.seed}-${state.turn}-${playerId}-${aiLevel}`,
      }
      if (aiLevel === 'easy') return selectMoveEasy(state, playerId, config)
      if (aiLevel === 'medium') return selectMoveMedium(state, playerId, config)
      return selectMoveHard(state, playerId, config)
    },
    [aiLevel, settings.aiThinkTimeMs, settings.aiRandomness],
  )

  const matchEndHandled = useRef(false)

  const startMatch = useCallback(() => {
    resetTransientState()
    setSelectedCardId(null)
    setMatchPhase('playing')
    setRewardCards([])
    setRewardPicked(false)
    matchEndHandled.current = false
    setGameState(buildInitialGame())
  }, [buildInitialGame, resetTransientState])
  const matchCounter = useRef(0)

  useEffect(() => {
    if (!game || game.status !== 'finished' || matchPhase !== 'playing') return
    if (isBattleAnimating) return
    if (matchEndHandled.current) return
    matchEndHandled.current = true
    const playerWon = game.winner === 0
    const finalScores = countScores(game)
    const matchScore = { player: finalScores[0], opponent: finalScores[1] }
    if (playerWon) {
      const seed = `reward-${node.id}-${matchCounter.current}`
      matchCounter.current += 1
      setMatchPhase('victory')
      setRewardCards(generateRewards(node, seed))
      if (challenge) {
        campaign.completeChallenge(node.id)
      } else {
        campaign.completeNode(node.id)
      }
      campaign.rollChallenges()
      campaign.evaluateAchievements(matchScore, Boolean(challenge))
    } else {
      setMatchPhase('defeat')
      campaign.addLoss()
      campaign.evaluateAchievements(matchScore, false)
    }
  }, [game, matchPhase, isBattleAnimating, node, challenge, campaign])

  useEffect(() => {
    if (aiTimerRef.current !== null) {
      window.clearTimeout(aiTimerRef.current)
      aiTimerRef.current = null
    }
    if (!game || game.status !== 'in_progress') return
    if (isBattleAnimating) return
    if (game.activePlayer !== 1) return

    const snapshot = {
      seed: game.seed,
      turn: game.turn,
      activePlayer: game.activePlayer,
    }
    const delay = getAiDelayMs(game.seed, game.turn, game.activePlayer, settings.reducedMotion)
    aiTimerRef.current = window.setTimeout(() => {
      const latest = latestGameRef.current
      if (!latest || latest.status !== 'in_progress') return
      if (
        latest.seed !== snapshot.seed ||
        latest.turn !== snapshot.turn ||
        latest.activePlayer !== snapshot.activePlayer
      )
        return
      if (latest.activePlayer !== 1) return
      const move = runAiMove(latest, 1)
      if (move) processMove(latest, move)
    }, delay)
    return () => {
      if (aiTimerRef.current !== null) {
        window.clearTimeout(aiTimerRef.current)
        aiTimerRef.current = null
      }
    }
  }, [game, isBattleAnimating, processMove, runAiMove, settings.reducedMotion])

  useEffect(() => {
    if (activeBattle || battleQueue.length === 0) return
    setActiveBattle(battleQueue[0])
    setBattleQueue((prev) => prev.slice(1))
  }, [activeBattle, battleQueue])

  const handleBattleComplete = useCallback(() => {
    setActiveBattle(null)
  }, [])

  useEffect(() => {
    if (activeBattle || battleQueue.length > 0) return
    if (pendingCaptureFlashes.length === 0) return
    pendingCaptureFlashes.forEach((pos) => triggerFlash(pos, 'capture', CAPTURE_FLASH_MS))
    setPendingCaptureFlashes([])
  }, [activeBattle, battleQueue.length, pendingCaptureFlashes, triggerFlash])

  const handleCellClick = (x: number, y: number) => {
    if (!game || game.status !== 'in_progress' || isBattleAnimating) return
    if (game.activePlayer !== 0) return
    if (!selectedCardId) return
    const move: Move = {
      playerId: 0,
      cardInstanceId: selectedCardId,
      position: { x, y },
    }
    if (processMove(game, move)) setSelectedCardId(null)
  }

  const pickReward = (card: CardInstance) => {
    campaign.addCardToCollection(card)
    setRewardPicked(true)
  }

  if (!game) return null

  return (
    <section className="page">
      <div className="campaign-battle-header">
        <button className="button button--ghost" onClick={() => navigate('/campaign')}>
          ← Back to Map
        </button>
        <h2>
          {node.opponent.name}{' '}
          <span className="small">— {node.name}</span>
        </h2>
      </div>

      {matchPhase === 'victory' && (
        <div className="campaign-result campaign-result--victory">
          <h2>Victory!</h2>
          <p className="campaign-dialogue">"{node.opponent.dialogue.win}"</p>
          {!rewardPicked && rewardCards.length > 0 && (
            <div className="campaign-reward">
              <h3>Choose a card reward</h3>
              <div className="campaign-reward__cards">
                {rewardCards.map((card) => (
                  <button
                    key={card.instanceId}
                    className="campaign-reward__pick"
                    onClick={() => pickReward(card)}
                  >
                    <CardView card={card} owner={0} size="medium" interactive={false} />
                  </button>
                ))}
              </div>
            </div>
          )}
          {rewardPicked && (
            <p className="campaign-reward-confirmation">Card added to your collection!</p>
          )}
          <div className="field-group">
            <button
              className="button button--primary"
              onClick={() => navigate('/campaign')}
            >
              Return to Map
            </button>
          </div>
        </div>
      )}

      {matchPhase === 'defeat' && (
        <div className="campaign-result campaign-result--defeat">
          <h2>Defeat</h2>
          <p className="campaign-dialogue">"{node.opponent.dialogue.lose}"</p>
          <div className="field-group">
            <button className="button button--primary" onClick={startMatch}>
              Try Again
            </button>
            <button
              className="button button--ghost"
              onClick={() => navigate('/campaign')}
            >
              Return to Map
            </button>
          </div>
        </div>
      )}

      <div className="game game--classic">
        <div className="game__status">
          <div>
            Turn {game.turn} — {game.status === 'finished' ? 'Match over' : game.activePlayer === 0 ? 'Your turn' : `${node.opponent.name}'s turn`}
          </div>
          <div className="score">
            <span>You: {scores[0]}</span>
            <span>{node.opponent.name}: {scores[1]}</span>
          </div>
        </div>

        <div className="game__field">
          <div className="hand hand--left">
            <div className="hand__label">{node.opponent.name}</div>
            <div className="hand__cards hand__cards--vertical">
              {Array.from({ length: 5 }).map((_, i) => {
                const card = game.players[1].hand[i]
                return card ? (
                  <CardView key={card.instanceId} card={card} owner={1} size="small" faceDown />
                ) : (
                  <div key={`empty-l-${i}`} className="hand-slot--empty" />
                )
              })}
            </div>
          </div>

          <div className="game__board">
            <BoardView
              game={game}
              onCellClick={handleCellClick}
              flashByPosition={flashByPosition}
              interactionDisabled={isBattleAnimating || matchPhase !== 'playing'}
            />
          </div>

          <div className="hand hand--right">
            <div className="hand__label">You</div>
            <div className="hand__cards hand__cards--vertical">
              {Array.from({ length: 5 }).map((_, i) => {
                const card = game.players[0].hand[i]
                return card ? (
                  <CardView
                    key={card.instanceId}
                    card={card}
                    owner={0}
                    size="small"
                    selected={selectedCardId === card.instanceId}
                    onClick={() => {
                      if (isBattleAnimating || game.activePlayer !== 0 || matchPhase !== 'playing') return
                      setSelectedCardId((prev) => prev === card.instanceId ? null : card.instanceId)
                    }}
                  />
                ) : (
                  <div key={`empty-r-${i}`} className="hand-slot--empty" />
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {activeBattle && (
        <BattleAnimation
          battle={activeBattle}
          reducedMotion={settings.reducedMotion}
          onComplete={handleBattleComplete}
        />
      )}

      <AchievementToast />
    </section>
  )
}

function buildOpponentDeck(node: CampaignNode): CardInstance[] {
  const cards: CardInstance[] = []
  let rng = createRng(`opponent-${node.id}`)
  for (const id of node.opponent.deckCardIds) {
    const def = getCardDef(id)
    if (!def) continue
    const result = createCardInstance(def, rng, { mode: 'original', density: 0.5, minArrows: 2 })
    cards.push(result.card)
    rng = result.rng
  }
  return cards
}

function generateRewards(node: CampaignNode, seed: string): CardInstance[] {
  const pool = node.rewardPool
  let rng = createRng(seed)
  const shuffled = [...pool]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.abs(rng.state) / 4294967296 * (i + 1))
    rng = { state: (rng.state + 0x6d2b79f5) >>> 0 }
    const temp = shuffled[i]
    shuffled[i] = shuffled[j < 0 ? 0 : j >= shuffled.length ? shuffled.length - 1 : j]
    shuffled[j < 0 ? 0 : j >= shuffled.length ? shuffled.length - 1 : j] = temp
  }
  const picked = shuffled.slice(0, 3)
  const rewards: CardInstance[] = []
  for (const id of picked) {
    const def = getCardDef(id)
    if (!def) continue
    const result = createCardInstance(def, rng, { mode: 'original', density: 0.5, minArrows: 2 })
    rewards.push(result.card)
    rng = result.rng
  }
  return rewards
}
