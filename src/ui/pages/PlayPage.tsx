import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { selectMoveEasy, selectMoveHard, selectMoveMedium } from '../../ai'
import { countScores, createGame, applyMove } from '../../engine/rules'
import { validateDeck } from '../../engine/validate'
import type { BattleResult, GameState, Move, PlayerId, Position } from '../../engine/types'
import { useDeckStore, useGameStore, useSettingsStore } from '../../state'
import { BattleAnimation, type BattlePresentation } from '../components/BattleAnimation'
import { BoardView } from '../components/BoardView'
import { CardView } from '../components/CardView'
import { DevPanel } from '../components/DevPanel'
import { CAPTURE_FLASH_MS, PLACE_FLASH_MS, getAiDelayMs } from '../animationConfig'

type PlayerType = 'human' | 'ai'
type AiLevel = 'easy' | 'medium' | 'hard'

const aiLevels: AiLevel[] = ['easy', 'medium', 'hard']
const positionKey = (position: Position) => `${position.x},${position.y}`

export const PlayPage = () => {
  const settings = useSettingsStore()
  const { decks } = useDeckStore()
  const { game, setGame, updateGame } = useGameStore()
  const [playerTypes, setPlayerTypes] = useState<[PlayerType, PlayerType]>(['human', 'ai'])
  const [aiDifficulty, setAiDifficulty] = useState<[AiLevel, AiLevel]>(['easy', 'medium'])
  const [deckIds, setDeckIds] = useState<[string, string]>(['', ''])
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [matchSeed, setMatchSeed] = useState(settings.rngSeed)
  const [flashByPosition, setFlashByPosition] = useState<Record<string, 'place' | 'capture'>>({})
  const [battleQueue, setBattleQueue] = useState<BattlePresentation[]>([])
  const [activeBattle, setActiveBattle] = useState<BattlePresentation | null>(null)
  const [pendingCaptureFlashes, setPendingCaptureFlashes] = useState<Position[]>([])
  const flashTimersRef = useRef<Record<string, number>>({})
  const flashRafRef = useRef<Record<string, number>>({})
  const aiTimerRef = useRef<number | null>(null)
  const latestGameRef = useRef<GameState | null>(null)
  const resolvedDeckIds = useMemo<[string, string]>(() => {
    if (decks.length === 0) return ['', '']
    const first = deckIds[0] || decks[0].id
    const second = deckIds[1] || decks[Math.min(1, decks.length - 1)].id || first
    return [first, second]
  }, [deckIds, decks])

  const scores = useMemo(() => (game ? countScores(game) : { 0: 0, 1: 0 }), [game])
  const isBattleAnimating = Boolean(activeBattle) || battleQueue.length > 0

  useEffect(() => {
    latestGameRef.current = game
  }, [game])

  useEffect(
    () => () => {
      Object.values(flashTimersRef.current).forEach((timer) => window.clearTimeout(timer))
      Object.values(flashRafRef.current).forEach((raf) => window.cancelAnimationFrame(raf))
      if (aiTimerRef.current !== null) {
        window.clearTimeout(aiTimerRef.current)
      }
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
      if (attackerCell?.type !== 'card' || defenderCell?.type !== 'card') {
        return null
      }
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

  const startGame = () => {
    const deck1 = decks.find((deck) => deck.id === resolvedDeckIds[0])
    const deck2 = decks.find((deck) => deck.id === resolvedDeckIds[1])
    if (!deck1 || !deck2) {
      setError('Select a deck for both players.')
      return
    }
    const validation1 = validateDeck(deck1.cards, { size: 5, allowDuplicates: true })
    const validation2 = validateDeck(deck2.cards, { size: 5, allowDuplicates: true })
    if (!validation1.valid || !validation2.valid) {
      setError('Both decks must contain exactly 5 cards.')
      return
    }
    const nextGame = createGame({
      playerNames: ['Player 1', 'Player 2'],
      playerHands: [deck1.cards, deck2.cards],
      seed: matchSeed || settings.rngSeed,
      blockedCount: settings.blockMode === 'fixed' ? settings.blockCount : undefined,
      useRandomBlocks: settings.blockMode === 'random',
    })
    setError('')
    setSelectedCardId(null)
    resetTransientState()
    setGame(nextGame)
  }

  const resetGame = () => {
    resetTransientState()
    setGame(null)
    setSelectedCardId(null)
  }

  const handleCellClick = (x: number, y: number) => {
    if (!game || game.status !== 'in_progress' || isBattleAnimating) return
    if (playerTypes[game.activePlayer] !== 'human') return
    if (!selectedCardId) return
    const move: Move = {
      playerId: game.activePlayer,
      cardInstanceId: selectedCardId,
      position: { x, y },
    }
    if (processMove(game, move)) {
      setSelectedCardId(null)
    }
  }

  const runAiMove = useCallback(
    (state: GameState, playerId: PlayerId) => {
      const level = aiDifficulty[playerId]
      const config = {
        timeBudgetMs: settings.aiThinkTimeMs[level],
        randomness: settings.aiRandomness,
        rngSeed: `${state.seed}-${state.turn}-${playerId}-${level}`,
      }
      if (level === 'easy') return selectMoveEasy(state, playerId, config)
      if (level === 'medium') return selectMoveMedium(state, playerId, config)
      return selectMoveHard(state, playerId, config)
    },
    [aiDifficulty, settings.aiThinkTimeMs, settings.aiRandomness],
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
          if (event.reason === 'arrow' && lastPlace) {
            captureSources.push(lastPlace)
          }
          if (event.reason === 'battle' && lastBattle) {
            captureSources.push(
              lastBattle.winner === 'attacker' ? lastBattle.attackerPos : lastBattle.defenderPos,
            )
          }
        }
      })

      const uniquePositions = (positions: Position[]) => {
        const map = new Map<string, Position>()
        positions.forEach((pos) => {
          map.set(positionKey(pos), pos)
        })
        return Array.from(map.values())
      }

      updateGame(nextState)

      uniquePositions(placePositions).forEach((pos) => {
        triggerFlash(pos, 'place', PLACE_FLASH_MS)
      })

      const captureFlashes = uniquePositions([...capturePositions, ...captureSources])
      if (battles.length > 0) {
        setPendingCaptureFlashes((prev) => [...prev, ...captureFlashes])
        if (!activeBattle) {
          setActiveBattle(battles[0])
          if (battles.length > 1) {
            setBattleQueue((prev) => [...prev, ...battles.slice(1)])
          }
        } else {
          setBattleQueue((prev) => [...prev, ...battles])
        }
      } else {
        captureFlashes.forEach((pos) => triggerFlash(pos, 'capture', CAPTURE_FLASH_MS))
      }

      return true
    },
    [activeBattle, buildBattlePresentation, triggerFlash, updateGame],
  )

  useEffect(() => {
    if (aiTimerRef.current !== null) {
      window.clearTimeout(aiTimerRef.current)
      aiTimerRef.current = null
    }
    if (!game || game.status !== 'in_progress') return
    if (isBattleAnimating) return
    const activeType = playerTypes[game.activePlayer]
    if (activeType !== 'ai') return

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
      ) {
        return
      }
      if (playerTypes[latest.activePlayer] !== 'ai') return
      const move = runAiMove(latest, latest.activePlayer)
      if (move) {
        processMove(latest, move)
      }
    }, delay)
    return () => {
      if (aiTimerRef.current !== null) {
        window.clearTimeout(aiTimerRef.current)
        aiTimerRef.current = null
      }
    }
  }, [game, isBattleAnimating, playerTypes, processMove, runAiMove, settings.reducedMotion])

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

  return (
    <section className="page">
      <h1>Play</h1>

      <div className="panel">
        <h2>Match setup</h2>
        <div className="field-group">
          <div className="field">
            <span>Player 1</span>
            <select
              value={playerTypes[0]}
              onChange={(event) =>
                setPlayerTypes([event.target.value as PlayerType, playerTypes[1]])
              }
            >
              <option value="human">Human</option>
              <option value="ai">AI</option>
            </select>
          </div>
          <div className="field">
            <span>Player 2</span>
            <select
              value={playerTypes[1]}
              onChange={(event) =>
                setPlayerTypes([playerTypes[0], event.target.value as PlayerType])
              }
            >
              <option value="human">Human</option>
              <option value="ai">AI</option>
            </select>
          </div>
          <div className="field">
            <span>Player 1 deck</span>
            <select
              value={resolvedDeckIds[0]}
              onChange={(event) => setDeckIds([event.target.value, resolvedDeckIds[1]])}
            >
              {decks.map((deck) => (
                <option key={deck.id} value={deck.id}>
                  {deck.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <span>Player 2 deck</span>
            <select
              value={resolvedDeckIds[1]}
              onChange={(event) => setDeckIds([resolvedDeckIds[0], event.target.value])}
            >
              {decks.map((deck) => (
                <option key={deck.id} value={deck.id}>
                  {deck.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <span>Board seed</span>
            <input
              value={matchSeed}
              onChange={(event) => setMatchSeed(event.target.value)}
              placeholder="Optional"
            />
          </div>
        </div>
        <div className="field-group">
          {[0, 1].map((player) => (
            <div className="field" key={`ai-${player}`}>
              <span>Player {player + 1} AI level</span>
              <select
                value={aiDifficulty[player]}
                onChange={(event) => {
                  const value = event.target.value as AiLevel
                  setAiDifficulty((prev) =>
                    player === 0 ? [value, prev[1]] : [prev[0], value],
                  )
                }}
                disabled={playerTypes[player] !== 'ai'}
              >
                {aiLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        {error ? <div className="validation">{error}</div> : null}
        <div className="field-group">
          <button className="button button--primary" onClick={startGame}>
            Start match
          </button>
          <button className="button button--ghost" onClick={resetGame}>
            Reset
          </button>
        </div>
      </div>

      {game ? (
        <div className="game">
          <div className="game__hud">
            <span className="hud__turn">Turn {game.turn}</span>
            {game.status === 'finished' ? (
              <span className="hud__active hud__active--finished">
                {game.winner == null || game.winner === 'draw'
                  ? 'Draw!'
                  : `Player ${game.winner + 1} wins!`}
              </span>
            ) : (
              <span className="hud__active">
                Player {game.activePlayer + 1}&apos;s turn
              </span>
            )}
          </div>

          {game.status === 'finished' ? (
            <div className="winner">
              {game.winner == null || game.winner === 'draw'
                ? 'The match is a draw.'
                : `Player ${game.winner + 1} wins the match!`}
            </div>
          ) : null}

          <div className="game__arena">
            {/* Player 1 hand – left side */}
            {(() => {
              const playerId = 0
              const player = game.players[playerId]
              const faceDown =
                playerTypes[playerId] === 'ai' ||
                (settings.hideOpponentHand &&
                  playerTypes[0] === 'human' &&
                  playerTypes[1] === 'human' &&
                  game.activePlayer !== playerId)
              return (
                <div className="hand hand--left">
                  <div className="hand__header">
                    <span className="hand__name" data-player="0">Player 1</span>
                    <span className="hand__score" data-player="0">{scores[0]}</span>
                  </div>
                  <div className="hand__cards">
                    {player.hand.map((card) => (
                      <CardView
                        key={card.instanceId}
                        card={card}
                        owner={playerId as PlayerId}
                        faceDown={faceDown}
                        selected={selectedCardId === card.instanceId}
                        size="small"
                        onClick={() => {
                          if (isBattleAnimating) return
                          if (playerTypes[game.activePlayer] !== 'human') return
                          if (game.activePlayer !== playerId) return
                          setSelectedCardId((prev) =>
                            prev === card.instanceId ? null : card.instanceId,
                          )
                        }}
                      />
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* Board – center */}
            <div className="game__board-frame">
              <BoardView
                game={game}
                onCellClick={handleCellClick}
                flashByPosition={flashByPosition}
                interactionDisabled={isBattleAnimating}
              />
            </div>

            {/* Player 2 hand – right side */}
            {(() => {
              const playerId = 1
              const player = game.players[playerId]
              const faceDown =
                playerTypes[playerId] === 'ai' ||
                (settings.hideOpponentHand &&
                  playerTypes[0] === 'human' &&
                  playerTypes[1] === 'human' &&
                  game.activePlayer !== playerId)
              return (
                <div className="hand hand--right">
                  <div className="hand__header">
                    <span className="hand__name" data-player="1">Player 2</span>
                    <span className="hand__score" data-player="1">{scores[1]}</span>
                  </div>
                  <div className="hand__cards">
                    {player.hand.map((card) => (
                      <CardView
                        key={card.instanceId}
                        card={card}
                        owner={playerId as PlayerId}
                        faceDown={faceDown}
                        selected={selectedCardId === card.instanceId}
                        size="small"
                        onClick={() => {
                          if (isBattleAnimating) return
                          if (playerTypes[game.activePlayer] !== 'human') return
                          if (game.activePlayer !== playerId) return
                          setSelectedCardId((prev) =>
                            prev === card.instanceId ? null : card.instanceId,
                          )
                        }}
                      />
                    ))}
                  </div>
                </div>
              )
            })()}
          </div>

          {settings.showDevPanel ? <DevPanel game={game} /> : null}
          {activeBattle ? (
            <BattleAnimation
              battle={activeBattle}
              reducedMotion={settings.reducedMotion}
              onComplete={handleBattleComplete}
            />
          ) : null}
        </div>
      ) : (
        <div className="panel">
          <p>Set up a match and start playing.</p>
        </div>
      )}
    </section>
  )
}
