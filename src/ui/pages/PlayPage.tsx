import { useCallback, useEffect, useMemo, useState } from 'react'
import { selectMoveEasy, selectMoveHard, selectMoveMedium } from '../../ai'
import { countScores, createGame, applyMove } from '../../engine/rules'
import { validateDeck } from '../../engine/validate'
import type { GameState, Move, PlayerId } from '../../engine/types'
import { useDeckStore, useGameStore, useSettingsStore } from '../../state'
import { BattleModal } from '../components/BattleModal'
import { BoardView } from '../components/BoardView'
import { CardView } from '../components/CardView'
import { DevPanel } from '../components/DevPanel'

type PlayerType = 'human' | 'ai'
type AiLevel = 'easy' | 'medium' | 'hard'

const aiLevels: AiLevel[] = ['easy', 'medium', 'hard']

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
  const [battleIndex, setBattleIndex] = useState(0)
  const resolvedDeckIds = useMemo<[string, string]>(() => {
    if (decks.length === 0) return ['', '']
    const first = deckIds[0] || decks[0].id
    const second = deckIds[1] || decks[Math.min(1, decks.length - 1)].id || first
    return [first, second]
  }, [deckIds, decks])

  const scores = useMemo(() => (game ? countScores(game) : { 0: 0, 1: 0 }), [game])
  const battleEvents = useMemo(
    () =>
      game
        ? game.events
            .filter((event) => event.type === 'battle')
            .map((event) => (event.type === 'battle' ? event.result : null))
            .filter((result): result is NonNullable<typeof result> => Boolean(result))
        : [],
    [game],
  )
  const activeBattle = battleIndex < battleEvents.length ? battleEvents[battleIndex] : null

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
    setBattleIndex(0)
    setGame(nextGame)
  }

  const resetGame = () => {
    setGame(null)
    setSelectedCardId(null)
    setBattleIndex(0)
  }

  const handleCellClick = (x: number, y: number) => {
    if (!game || game.status !== 'in_progress') return
    if (activeBattle) return
    if (playerTypes[game.activePlayer] !== 'human') return
    if (!selectedCardId) return
    const move: Move = {
      playerId: game.activePlayer,
      cardInstanceId: selectedCardId,
      position: { x, y },
    }
    const nextState = applyMove(game, move)
    if (nextState !== game) {
      updateGame(nextState)
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

  useEffect(() => {
    if (!game || game.status !== 'in_progress') return
    if (activeBattle) return
    const activeType = playerTypes[game.activePlayer]
    if (activeType !== 'ai') return
    const timer = window.setTimeout(() => {
      const move = runAiMove(game, game.activePlayer)
      if (move) {
        updateGame(applyMove(game, move))
      }
    }, settings.reducedMotion ? 0 : 400)
    return () => window.clearTimeout(timer)
  }, [game, playerTypes, runAiMove, settings.reducedMotion, updateGame])

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
          <div className="game__status">
            <div>
              Turn {game.turn} - Active player: {game.activePlayer + 1}
            </div>
            <div className="score">
              <span>Player 1: {scores[0]}</span>
              <span>Player 2: {scores[1]}</span>
            </div>
            {game.status === 'finished' ? (
              <div className="winner">
                {game.winner === 'draw'
                  ? 'Draw!'
                  : `Player ${game.winner + 1} wins the match.`}
              </div>
            ) : null}
          </div>

          <div className="game__board">
            <BoardView game={game} onCellClick={handleCellClick} />
          </div>

          <div className="game__hands">
            {[0, 1].map((playerId) => {
              const player = game.players[playerId]
              const faceDown =
                playerTypes[playerId] === 'ai' ||
                (settings.hideOpponentHand &&
                  playerTypes[0] === 'human' &&
                  playerTypes[1] === 'human' &&
                  game.activePlayer !== playerId)
              return (
                <div key={playerId} className="hand">
                  <h3>Player {playerId + 1} hand</h3>
                  <div className="hand__cards">
                    {player.hand.map((card) => (
                      <CardView
                        key={card.instanceId}
                        card={card}
                        owner={playerId as PlayerId}
                        faceDown={faceDown}
                        selected={selectedCardId === card.instanceId}
                        onClick={() => {
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
            })}
          </div>

          {settings.showDevPanel ? <DevPanel game={game} /> : null}
          {activeBattle ? (
            <BattleModal battle={activeBattle} onComplete={() => setBattleIndex((prev) => prev + 1)} />
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
