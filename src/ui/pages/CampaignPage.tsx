import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  campaignRegions,
  isRegionAvailable,
  isRegionComplete,
  isNodeAvailable,
  getCardDef,
  type CampaignNode,
  type CampaignRegion,
} from '../../data/campaign'
import { createCardInstance } from '../../engine/cards'
import { createRng } from '../../engine/rng'
import type { CardInstance } from '../../engine/types'
import { useCampaignStore, type ActiveChallenge } from '../../state/campaignStore'
import { CardView } from '../components/CardView'

export const CampaignPage = () => {
  const campaign = useCampaignStore()
  const navigate = useNavigate()
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [deckEditing, setDeckEditing] = useState(false)

  const selectedNode = useMemo(
    () =>
      campaignRegions
        .flatMap((r) => r.nodes)
        .find((n) => n.id === selectedNodeId) ?? null,
    [selectedNodeId],
  )

  const challenge = useMemo(
    () =>
      selectedNodeId
        ? campaign.activeChallenges.find((c) => c.nodeId === selectedNodeId) ?? null
        : null,
    [selectedNodeId, campaign.activeChallenges],
  )

  const collectionCount = campaign.collection.length
  const totalCards = 100

  if (!campaign.started) {
    return (
      <section className="page">
        <div className="campaign-intro">
          <h1>Journey Mode</h1>
          <p className="lede">
            Begin your quest as a card player. Travel across the world, defeat opponents,
            and build your collection from a humble starter deck to a legendary arsenal.
          </p>
          <div className="campaign-intro__features">
            <div className="hero__tile">15 opponents</div>
            <div className="hero__tile">5 regions</div>
            <div className="hero__tile">100 cards to collect</div>
            <div className="hero__tile">Challenges &amp; bosses</div>
          </div>
          <button className="button button--primary" onClick={campaign.startCampaign}>
            Begin Journey
          </button>
        </div>
      </section>
    )
  }

  return (
    <section className="page">
      <div className="campaign-header">
        <h1>Journey Mode</h1>
        <div className="campaign-stats">
          <span className="campaign-stat">
            Wins: {campaign.wins}
          </span>
          <span className="campaign-stat">
            Losses: {campaign.losses}
          </span>
          <span className="campaign-stat">
            Cards: {collectionCount}/{totalCards}
          </span>
          <span className="campaign-stat">
            Progress: {campaign.completedNodes.length}/15
          </span>
        </div>
      </div>

      <div className="campaign-layout">
        <div className="campaign-map">
          {campaignRegions.map((region) => (
            <RegionRow
              key={region.id}
              region={region}
              completedNodes={campaign.completedNodes}
              selectedNodeId={selectedNodeId}
              activeChallenges={campaign.activeChallenges}
              onSelectNode={setSelectedNodeId}
            />
          ))}
        </div>

        <div className="campaign-sidebar">
          {selectedNode ? (
            deckEditing ? (
              <DeckEditor
                collection={campaign.collection}
                deck={campaign.campaignDeck}
                onSave={(deck) => {
                  campaign.setCampaignDeck(deck)
                  setDeckEditing(false)
                }}
                onCancel={() => setDeckEditing(false)}
              />
            ) : (
              <NodeDetail
                node={selectedNode}
                available={isNodeAvailable(selectedNode, campaign.completedNodes)}
                completed={campaign.completedNodes.includes(selectedNode.id)}
                challenge={challenge}
                deck={campaign.campaignDeck}
                onBattle={() =>
                  navigate(
                    `/campaign/battle/${selectedNode.id}${challenge ? '?challenge=1' : ''}`,
                  )
                }
                onEditDeck={() => setDeckEditing(true)}
              />
            )
          ) : (
            <div className="panel">
              <h2>Select a location</h2>
              <p className="small">Click a node on the map to see details and battle opponents.</p>
              <h3>Your Deck</h3>
              <div className="campaign-deck-row">
                {campaign.campaignDeck.map((card) => (
                  <CardView
                    key={card.instanceId}
                    card={card}
                    owner={0}
                    size="small"
                    interactive={false}
                  />
                ))}
              </div>
              <button
                className="button button--ghost"
                onClick={() => setDeckEditing(true)}
              >
                Edit Deck
              </button>
            </div>
          )}

          <div className="campaign-actions">
            <button
              className="button button--ghost"
              onClick={() => {
                if (window.confirm('Reset your campaign? All progress will be lost.')) {
                  campaign.resetCampaign()
                  setSelectedNodeId(null)
                }
              }}
            >
              Reset Campaign
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

const RegionRow = ({
  region,
  completedNodes,
  selectedNodeId,
  activeChallenges,
  onSelectNode,
}: {
  region: CampaignRegion
  completedNodes: string[]
  selectedNodeId: string | null
  activeChallenges: ActiveChallenge[]
  onSelectNode: (id: string) => void
}) => {
  const available = isRegionAvailable(region, completedNodes)
  const complete = isRegionComplete(region.id, completedNodes)

  return (
    <div
      className={`campaign-region ${!available ? 'campaign-region--locked' : ''} ${complete ? 'campaign-region--complete' : ''}`}
    >
      <div className="campaign-region__header">
        <span className="campaign-region__icon">{region.icon}</span>
        <div>
          <h3 className="campaign-region__name">{region.name}</h3>
          <p className="campaign-region__desc small">{region.description}</p>
        </div>
      </div>
      <div className="campaign-region__nodes">
        {region.nodes.map((node, idx) => {
          const nodeAvailable = available && isNodeAvailable(node, completedNodes)
          const nodeComplete = completedNodes.includes(node.id)
          const hasChallenge = activeChallenges.some((c) => c.nodeId === node.id)
          const isSelected = selectedNodeId === node.id
          return (
            <div key={node.id} className="campaign-node-wrapper">
              {idx > 0 && (
                <div
                  className={`campaign-path ${nodeComplete || nodeAvailable ? 'campaign-path--active' : ''}`}
                />
              )}
              <button
                className={`campaign-node ${node.isBoss ? 'campaign-node--boss' : ''} ${nodeComplete ? 'campaign-node--complete' : ''} ${nodeAvailable && !nodeComplete ? 'campaign-node--available' : ''} ${!nodeAvailable && !nodeComplete ? 'campaign-node--locked' : ''} ${isSelected ? 'campaign-node--selected' : ''} ${hasChallenge ? 'campaign-node--challenge' : ''}`}
                onClick={() => (nodeAvailable || nodeComplete) && onSelectNode(node.id)}
                disabled={!nodeAvailable && !nodeComplete}
                title={node.name}
              >
                <span className="campaign-node__icon">
                  {nodeComplete
                    ? hasChallenge
                      ? '⚔'
                      : '✓'
                    : node.isBoss
                      ? '★'
                      : '●'}
                </span>
              </button>
              <span className="campaign-node__label">{node.name}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const NodeDetail = ({
  node,
  available,
  completed,
  challenge,
  deck,
  onBattle,
  onEditDeck,
}: {
  node: CampaignNode
  available: boolean
  completed: boolean
  challenge: ActiveChallenge | null
  deck: CardInstance[]
  onBattle: () => void
  onEditDeck: () => void
}) => {
  const opponentDeck = useMemo(
    () => buildNodeOpponentDeck(node),
    [node],
  )

  const canBattle = (available && !completed) || challenge !== null
  const hasDeck = deck.length === 5

  return (
    <div className="panel campaign-detail">
      <div className="campaign-detail__header">
        <h2>{node.name}</h2>
        {node.isBoss && <span className="campaign-badge campaign-badge--boss">Boss</span>}
        {completed && !challenge && (
          <span className="campaign-badge campaign-badge--done">Cleared</span>
        )}
        {challenge && (
          <span className="campaign-badge campaign-badge--challenge">
            Challenge: {challenge.modifier.name}
          </span>
        )}
      </div>
      <p className="small">{node.description}</p>

      {challenge && (
        <div className="campaign-challenge-info">
          <p>{challenge.modifier.description}</p>
        </div>
      )}

      <div className="campaign-opponent">
        <h3>
          {node.opponent.name}{' '}
          <span className="small">— {node.opponent.title}</span>
        </h3>
        <p className="campaign-dialogue">"{node.opponent.dialogue.intro}"</p>
        <div className="campaign-meta">
          <span>Difficulty: {node.opponent.aiLevel}</span>
        </div>
        <h4>Opponent&apos;s Deck</h4>
        <div className="campaign-deck-row">
          {opponentDeck.map((card) => (
            <CardView
              key={card.instanceId}
              card={card}
              owner={1}
              size="small"
              interactive={false}
              faceDown={!completed}
            />
          ))}
        </div>
      </div>

      <div className="campaign-your-deck">
        <h4>Your Deck</h4>
        <div className="campaign-deck-row">
          {deck.map((card) => (
            <CardView
              key={card.instanceId}
              card={card}
              owner={0}
              size="small"
              interactive={false}
            />
          ))}
        </div>
        <button className="button button--ghost" onClick={onEditDeck}>
          Edit Deck
        </button>
      </div>

      <div className="field-group">
        <button
          className="button button--primary"
          onClick={onBattle}
          disabled={!canBattle || !hasDeck}
        >
          {challenge ? 'Accept Challenge' : completed ? 'Cleared' : 'Battle'}
        </button>
      </div>
    </div>
  )
}

const DeckEditor = ({
  collection,
  deck,
  onSave,
  onCancel,
}: {
  collection: CardInstance[]
  deck: CardInstance[]
  onSave: (deck: CardInstance[]) => void
  onCancel: () => void
}) => {
  const [editDeck, setEditDeck] = useState<CardInstance[]>([...deck])
  const [search, setSearch] = useState('')

  const deckInstanceIds = useMemo(
    () => new Set(editDeck.map((c) => c.instanceId)),
    [editDeck],
  )

  const filteredCollection = useMemo(() => {
    if (!search) return collection
    const lower = search.toLowerCase()
    return collection.filter((c) => c.name.toLowerCase().includes(lower))
  }, [collection, search])

  const addCard = useCallback(
    (card: CardInstance) => {
      if (editDeck.length >= 5) return
      if (deckInstanceIds.has(card.instanceId)) return
      setEditDeck((prev) => [...prev, card])
    },
    [editDeck.length, deckInstanceIds],
  )

  const removeCard = useCallback((instanceId: string) => {
    setEditDeck((prev) => prev.filter((c) => c.instanceId !== instanceId))
  }, [])

  return (
    <div className="panel campaign-deck-editor">
      <h2>Edit Deck</h2>
      <p className="small">Select 5 cards from your collection ({editDeck.length}/5)</p>

      <h3>Current Deck</h3>
      <div className="campaign-deck-row">
        {editDeck.map((card) => (
          <div key={card.instanceId} className="campaign-deck-slot">
            <CardView card={card} owner={0} size="small" interactive={false} />
            <button
              className="button button--ghost campaign-deck-remove"
              onClick={() => removeCard(card.instanceId)}
            >
              ✕
            </button>
          </div>
        ))}
        {Array.from({ length: 5 - editDeck.length }).map((_, i) => (
          <div key={`empty-${i}`} className="campaign-deck-empty">
            <span>Empty</span>
          </div>
        ))}
      </div>

      <h3>Collection ({collection.length} cards)</h3>
      <input
        type="text"
        placeholder="Search cards..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="campaign-search"
      />
      <div className="campaign-collection">
        {filteredCollection.map((card) => {
          const inDeck = deckInstanceIds.has(card.instanceId)
          return (
            <button
              key={card.instanceId}
              className={`campaign-collection-card ${inDeck ? 'campaign-collection-card--in-deck' : ''}`}
              onClick={() => (inDeck ? removeCard(card.instanceId) : addCard(card))}
              disabled={!inDeck && editDeck.length >= 5}
            >
              <CardView card={card} owner={0} size="small" interactive={false} />
              {inDeck && <span className="campaign-collection-card__badge">In Deck</span>}
            </button>
          )
        })}
      </div>

      <div className="field-group">
        <button
          className="button button--primary"
          onClick={() => onSave(editDeck)}
          disabled={editDeck.length !== 5}
        >
          Save Deck
        </button>
        <button className="button button--ghost" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </div>
  )
}

function buildNodeOpponentDeck(node: CampaignNode): CardInstance[] {
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
