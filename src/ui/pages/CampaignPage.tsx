import { useCallback, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  allCampaignNodes,
  isNodeAvailable,
  type CampaignNode,
} from '../../data/campaign'
import type { CardInstance } from '../../engine/types'
import { useCampaignStore, type ActiveChallenge } from '../../state/campaignStore'
import { CardView } from '../components/CardView'
import { WorldMap } from '../components/WorldMap'
import { CharacterPortrait } from '../../services/characterArt'
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
          <div className="field-group">
            <button className="button button--primary" onClick={campaign.startCampaign}>
              Begin Journey
            </button>
            <LoadButton onImport={campaign.importSave} />
          </div>
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
          <span className="campaign-stat">Progress {campaign.completedNodes.length}/40</span>
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
              <NodeDetail
                node={selectedNode}
                available={isNodeAvailable(selectedNode, campaign.completedNodes)}
                completed={campaign.completedNodes.includes(selectedNode.id)}
                hardCompleted={campaign.completedHardNodes.includes(selectedNode.id)}
                challenge={challenge}
                deck={campaign.campaignDeck}
                onBattle={() =>
                  navigate(`/campaign/battle/${selectedNode.id}${challenge ? '?challenge=1' : ''}`)
                }
                onBattleHard={() =>
                  navigate(`/campaign/battle/${selectedNode.id}?hard=1`)
                }
                onEditDeck={() => setDeckEditing(true)}
              />
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

          <SaveLoadBar
            onExport={campaign.exportSave}
            onImport={campaign.importSave}
            onReset={() => {
              if (window.confirm('Reset your campaign? All progress will be lost.')) {
                campaign.resetCampaign()
                setSelectedNodeId(null)
              }
            }}
          />
        </div>
      </div>

      {deckEditing && (
        <DeckEditor
          collection={campaign.collection}
          deck={campaign.campaignDeck}
          onSave={(deck) => {
            campaign.setCampaignDeck(deck)
            setDeckEditing(false)
          }}
          onCancel={() => setDeckEditing(false)}
        />
      )}

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
  node, available, completed, hardCompleted, challenge, deck, onBattle, onBattleHard, onEditDeck,
}: {
  node: CampaignNode; available: boolean; completed: boolean; hardCompleted: boolean
  challenge: ActiveChallenge | null; deck: CardInstance[]
  onBattle: () => void; onBattleHard: () => void; onEditDeck: () => void
}) => {
  const canBattle = (available && !completed) || challenge !== null
  const canHardBattle = completed && !hardCompleted

  return (
    <div className="panel campaign-detail">
      <div className="campaign-detail__header">
        <h2>{node.name}</h2>
        {node.isBoss && <span className="campaign-badge campaign-badge--boss">Boss</span>}
        {completed && <span className="campaign-badge campaign-badge--done">Cleared</span>}
        {hardCompleted && <span className="campaign-badge campaign-badge--hard">Hard Cleared</span>}
        {challenge && <span className="campaign-badge campaign-badge--challenge">Challenge</span>}
      </div>
      <p className="small">{node.description}</p>

      <div className="campaign-opponent">
        <div className="campaign-opponent__row">
          <CharacterPortrait nodeId={node.id} />
          <div>
            <h3>{node.opponent.name} <span className="small">— {node.opponent.title}</span></h3>
            <p className="campaign-dialogue">&ldquo;{node.opponent.dialogue.intro}&rdquo;</p>
            <p className="campaign-meta">Difficulty: {node.opponent.aiLevel}</p>
          </div>
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
        {canBattle && (
          <button className="button button--primary" onClick={onBattle} disabled={deck.length !== 5}>
            Battle
          </button>
        )}
        {canHardBattle && (
          <button className="button button--primary" onClick={onBattleHard} disabled={deck.length !== 5}
            style={{ background: '#dc2626' }}>
            Hard Battle
          </button>
        )}
        {challenge && (
          <button className="button button--primary" onClick={onBattle} disabled={deck.length !== 5}>
            Accept Challenge
          </button>
        )}
        {completed && !canHardBattle && !challenge && (
          <span className="small">All battles cleared!</span>
        )}
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
    <div className="inventory-overlay">
      <div className="inventory">
        <div className="inventory__header">
          <h2>Deck Management</h2>
          <span className="small">{editDeck.length}/5 cards selected</span>
          <div className="inventory__header-actions">
            <button className="button button--primary" onClick={() => onSave(editDeck)} disabled={editDeck.length !== 5}>Save Deck</button>
            <button className="button button--ghost" onClick={onCancel}>Cancel</button>
          </div>
        </div>

        <div className="inventory__body">
          <div className="inventory__deck-section">
            <h3>Active Deck</h3>
            <div className="inventory__deck-slots">
              {Array.from({ length: 5 }).map((_, i) => {
                const card = editDeck[i]
                return card ? (
                  <div key={card.instanceId} className="inventory__deck-slot inventory__deck-slot--filled">
                    <CardView card={card} owner={0} size="small" interactive={false} />
                    <button className="inventory__deck-remove" onClick={() => removeCard(card.instanceId)}>✕</button>
                    <span className="inventory__card-label">{card.name}</span>
                  </div>
                ) : (
                  <div key={`e-${i}`} className="inventory__deck-slot inventory__deck-slot--empty">
                    <span>Slot {i + 1}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="inventory__collection-section">
            <div className="inventory__collection-header">
              <h3>Collection ({collection.length} cards)</h3>
              <input type="text" placeholder="Search cards..." value={search}
                onChange={(e) => setSearch(e.target.value)} className="inventory__search" />
            </div>
            <div className="inventory__collection-grid">
              {filtered.map((card) => {
                const inDeck = deckIds.has(card.instanceId)
                return (
                  <button key={card.instanceId}
                    className={`inventory__collection-card ${inDeck ? 'inventory__collection-card--selected' : ''}`}
                    onClick={() => (inDeck ? removeCard(card.instanceId) : addCard(card))}
                    disabled={!inDeck && editDeck.length >= 5}>
                    <CardView card={card} owner={0} size="small" interactive={false} />
                    <span className="inventory__card-label">{card.name}</span>
                    {inDeck && <span className="inventory__in-deck-badge">In Deck</span>}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const LoadButton = ({ onImport }: { onImport: (json: string) => boolean }) => {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const ok = onImport(reader.result as string)
      if (!ok) alert('Invalid save file.')
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  return (
    <>
      <input ref={fileRef} type="file" accept=".json" onChange={handleFile} style={{ display: 'none' }} />
      <button className="button button--ghost" onClick={() => fileRef.current?.click()}>
        Load Save
      </button>
    </>
  )
}

const SaveLoadBar = ({
  onExport,
  onImport,
  onReset,
}: {
  onExport: () => void
  onImport: (json: string) => boolean
  onReset: () => void
}) => (
  <div className="campaign-actions">
    <button className="button button--ghost" onClick={onExport}>Save</button>
    <LoadButton onImport={onImport} />
    <button className="button button--ghost" onClick={onReset}>Reset</button>
  </div>
)

