import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  allCampaignNodes,
  isNodeAvailable,
  getCardDef,
  type CampaignNode,
} from '../../data/campaign'
import { createCardInstance } from '../../engine/cards'
import { createRng } from '../../engine/rng'
import type { CardInstance } from '../../engine/types'
import { useCampaignStore, type ActiveChallenge } from '../../state/campaignStore'
import { CardView } from '../components/CardView'
import { WorldMap } from '../components/WorldMap'
import { AchievementToast } from '../components/AchievementToast'
import { AchievementList } from '../components/AchievementList'

export const CampaignPage = () => {
  const campaign = useCampaignStore()
  const navigate = useNavigate()
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [deckEditing, setDeckEditing] = useState(false)
  const [showAchievements, setShowAchievements] = useState(false)

  const selectedNode = useMemo(
    () => (selectedNodeId ? allCampaignNodes.find((n) => n.id === selectedNodeId) ?? null : null),
    [selectedNodeId],
  )

  const challenge = useMemo(
    () =>
      selectedNodeId
        ? campaign.activeChallenges.find((c) => c.nodeId === selectedNodeId) ?? null
        : null,
    [selectedNodeId, campaign.activeChallenges],
  )

  if (!campaign.started) {
    return (
      <section className="page">
        <div className="campaign-intro">
          <p className="eyebrow">Single-player campaign</p>
          <h1>Journey Mode</h1>
          <p className="lede">
            Travel across the world, defeat opponents, and build your card
            collection from a humble starter deck to a legendary arsenal.
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
          <span className="campaign-stat">Wins {campaign.wins}</span>
          <span className="campaign-stat">Losses {campaign.losses}</span>
          <span className="campaign-stat">Cards {campaign.collection.length}/100</span>
          <span className="campaign-stat">Progress {campaign.completedNodes.length}/15</span>
          <button className="campaign-stat campaign-stat--trophy" onClick={() => setShowAchievements(true)}>
            🏆 {campaign.unlockedAchievements.length}
          </button>
        </div>
      </div>

      <div className="campaign-layout">
        <div className="campaign-map">
          <WorldMap
            completedNodes={campaign.completedNodes}
            activeChallenges={campaign.activeChallenges}
            selectedNodeId={selectedNodeId}
            onSelectNode={setSelectedNodeId}
          />
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
              <p className="small">Click a node on the map to view details.</p>
              <h3>Your Deck</h3>
              <div className="campaign-deck-row">
                {campaign.campaignDeck.map((card) => (
                  <CardView key={card.instanceId} card={card} owner={0} size="small" interactive={false} />
                ))}
              </div>
              <button className="button button--ghost" onClick={() => setDeckEditing(true)}>
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

      {showAchievements && (
        <AchievementList
          unlocked={campaign.unlockedAchievements}
          onClose={() => setShowAchievements(false)}
        />
      )}

      <AchievementToast />
    </section>
  )
}

const NodeDetail = ({
  node, available, completed, challenge, deck, onBattle, onEditDeck,
}: {
  node: CampaignNode; available: boolean; completed: boolean
  challenge: ActiveChallenge | null; deck: CardInstance[]
  onBattle: () => void; onEditDeck: () => void
}) => {
  const opponentDeck = useMemo(() => buildNodeOpponentDeck(node), [node])
  const canBattle = (available && !completed) || challenge !== null

  return (
    <div className="panel campaign-detail">
      <div className="campaign-detail__header">
        <h2>{node.name}</h2>
        {node.isBoss && <span className="campaign-badge campaign-badge--boss">Boss</span>}
        {completed && !challenge && <span className="campaign-badge campaign-badge--done">Cleared</span>}
        {challenge && <span className="campaign-badge campaign-badge--challenge">Challenge</span>}
      </div>
      <p className="small">{node.description}</p>

      {challenge && (
        <div className="campaign-challenge-info"><p>{challenge.modifier.description}</p></div>
      )}

      <div className="campaign-opponent">
        <h3>{node.opponent.name} <span className="small">— {node.opponent.title}</span></h3>
        <p className="campaign-dialogue">&ldquo;{node.opponent.dialogue.intro}&rdquo;</p>
        <p className="campaign-meta">Difficulty: {node.opponent.aiLevel}</p>
        <h4>Opponent&apos;s Deck</h4>
        <div className="campaign-deck-row">
          {opponentDeck.map((card) => (
            <CardView key={card.instanceId} card={card} owner={1} size="small" interactive={false} faceDown={!completed} />
          ))}
        </div>
      </div>

      <div className="campaign-your-deck">
        <h4>Your Deck</h4>
        <div className="campaign-deck-row">
          {deck.map((card) => (
            <CardView key={card.instanceId} card={card} owner={0} size="small" interactive={false} />
          ))}
        </div>
        <button className="button button--ghost" onClick={onEditDeck}>Edit Deck</button>
      </div>

      <div className="field-group">
        <button className="button button--primary" onClick={onBattle} disabled={!canBattle || deck.length !== 5}>
          {challenge ? 'Accept Challenge' : completed ? 'Cleared' : 'Battle'}
        </button>
      </div>
    </div>
  )
}

const DeckEditor = ({
  collection, deck, onSave, onCancel,
}: {
  collection: CardInstance[]; deck: CardInstance[]
  onSave: (deck: CardInstance[]) => void; onCancel: () => void
}) => {
  const [editDeck, setEditDeck] = useState<CardInstance[]>([...deck])
  const [search, setSearch] = useState('')
  const deckIds = useMemo(() => new Set(editDeck.map((c) => c.instanceId)), [editDeck])

  const filtered = useMemo(() => {
    if (!search) return collection
    const s = search.toLowerCase()
    return collection.filter((c) => c.name.toLowerCase().includes(s))
  }, [collection, search])

  const addCard = useCallback((card: CardInstance) => {
    if (editDeck.length >= 5 || deckIds.has(card.instanceId)) return
    setEditDeck((prev) => [...prev, card])
  }, [editDeck.length, deckIds])

  const removeCard = useCallback((id: string) => {
    setEditDeck((prev) => prev.filter((c) => c.instanceId !== id))
  }, [])

  return (
    <div className="panel campaign-deck-editor">
      <h2>Edit Deck ({editDeck.length}/5)</h2>
      <div className="campaign-deck-row">
        {editDeck.map((card) => (
          <div key={card.instanceId} className="campaign-deck-slot">
            <CardView card={card} owner={0} size="small" interactive={false} />
            <button className="campaign-deck-remove" onClick={() => removeCard(card.instanceId)}>✕</button>
          </div>
        ))}
        {Array.from({ length: 5 - editDeck.length }).map((_, i) => (
          <div key={`e-${i}`} className="campaign-deck-empty"><span>Empty</span></div>
        ))}
      </div>
      <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="campaign-search" />
      <div className="campaign-collection">
        {filtered.map((card) => {
          const inDeck = deckIds.has(card.instanceId)
          return (
            <button key={card.instanceId}
              className={`campaign-collection-card ${inDeck ? 'campaign-collection-card--in-deck' : ''}`}
              onClick={() => (inDeck ? removeCard(card.instanceId) : addCard(card))}
              disabled={!inDeck && editDeck.length >= 5}>
              <CardView card={card} owner={0} size="small" interactive={false} />
              {inDeck && <span className="campaign-collection-card__badge">In Deck</span>}
            </button>
          )
        })}
      </div>
      <div className="field-group">
        <button className="button button--primary" onClick={() => onSave(editDeck)} disabled={editDeck.length !== 5}>Save</button>
        <button className="button button--ghost" onClick={onCancel}>Cancel</button>
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
