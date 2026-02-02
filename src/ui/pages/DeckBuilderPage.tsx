import { useMemo, useRef, useState } from 'react'
import { cards } from '../../data/cards'
import { createCardInstance, rerollArrows } from '../../engine/cards'
import { createRng } from '../../engine/rng'
import { validateDeck } from '../../engine/validate'
import type { BattleClass, CardDefinition, CardInstance } from '../../engine/types'
import { CardView } from '../components/CardView'
import { useDeckStore, useSettingsStore } from '../../state'

const sortCards = (items: CardDefinition[], sortKey: string) => {
  const copy = [...items]
  if (sortKey === 'name') {
    copy.sort((a, b) => a.name.localeCompare(b.name))
  } else if (sortKey === 'power') {
    copy.sort((a, b) => a.stats.power.localeCompare(b.stats.power))
  } else {
    copy.sort((a, b) => a.id.localeCompare(b.id))
  }
  return copy
}

export const DeckBuilderPage = () => {
  const settings = useSettingsStore()
  const {
    decks,
    activeDeckId,
    createDeck,
    setActiveDeck,
    addCard,
    removeCard,
    updateCard,
    importDecks,
    renameDeck,
  } = useDeckStore()

  const [search, setSearch] = useState('')
  const [classFilter, setClassFilter] = useState<BattleClass | 'all'>('all')
  const [sortKey, setSortKey] = useState('id')
  const [importText, setImportText] = useState('')
  const counterRef = useRef(0)

  const activeDeck = decks.find((deck) => deck.id === activeDeckId) ?? decks[0]

  const filteredCards = useMemo(() => {
    const term = search.trim().toLowerCase()
    let list = cards
    if (term) {
      list = list.filter((card) => card.name.toLowerCase().includes(term))
    }
    if (classFilter !== 'all') {
      list = list.filter((card) => card.stats.class === classFilter)
    }
    return sortCards(list, sortKey)
  }, [search, classFilter, sortKey])

  const ensureDeckId = () => {
    if (!activeDeck) {
      return createDeck('New deck')
    }
    return activeDeck.id
  }

  const handleAddCard = (definition: CardDefinition) => {
    const deckId = ensureDeckId()
    const rng = createRng(
      `${settings.rngSeed}-${definition.id}-${counterRef.current}-${deckId}`,
    )
    counterRef.current += 1
    const { card } = createCardInstance(definition, rng, {
      mode: settings.arrowMode,
      density: settings.arrowDensity,
    })
    addCard(deckId, card)
  }

  const handleReroll = (deckId: string, card: CardInstance) => {
    const rng = createRng(`${settings.rngSeed}-${card.instanceId}-${counterRef.current}`)
    counterRef.current += 1
    const result = rerollArrows(card, rng, {
      mode: settings.arrowMode,
      density: settings.arrowDensity,
    })
    updateCard(deckId, card.instanceId, result.card)
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(decks, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'tetra-master-decks.json'
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    try {
      const parsed = JSON.parse(importText)
      if (!Array.isArray(parsed)) {
        throw new Error('Invalid deck format.')
      }
      const makeId = () =>
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `deck-${Date.now()}-${Math.random().toString(16).slice(2)}`
      const sanitized = parsed.map((deck: { id: string; name: string; cards: CardInstance[] }) => ({
        id: deck.id || makeId(),
        name: deck.name || 'Imported deck',
        cards: Array.isArray(deck.cards) ? deck.cards : [],
        updatedAt: new Date().toISOString(),
      }))
      importDecks(sanitized)
      setImportText('')
    } catch (error) {
      alert((error as Error).message)
    }
  }

  const validation = activeDeck
    ? validateDeck(activeDeck.cards, { size: 5, allowDuplicates: true })
    : { valid: false, errors: ['Create a deck to begin.'] }

  return (
    <section className="page">
      <h1>Deck builder</h1>
      <div className="deck-builder">
        <div className="panel">
          <h2>Available cards</h2>
          <div className="field-group">
            <input
              placeholder="Search cards..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select
              value={classFilter}
              onChange={(event) => setClassFilter(event.target.value as BattleClass | 'all')}
            >
              <option value="all">All classes</option>
              <option value="P">Physical</option>
              <option value="M">Magical</option>
              <option value="X">Flexible</option>
              <option value="A">Assault</option>
            </select>
            <select value={sortKey} onChange={(event) => setSortKey(event.target.value)}>
              <option value="id">Sort by ID</option>
              <option value="name">Sort by name</option>
              <option value="power">Sort by power</option>
            </select>
          </div>
          <div className="card-list">
            {filteredCards.map((card) => (
              <div key={card.id} className="card-row">
                <div>
                  <div className="card-row__title">
                    {card.id} - {card.name}
                  </div>
                  <div className="card-row__stats">
                    {card.stats.power}
                    {card.stats.class}
                    {card.stats.physical}
                    {card.stats.magical}
                  </div>
                </div>
                <button className="button button--ghost" onClick={() => handleAddCard(card)}>
                  Add
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel__header">
            <h2>Current deck</h2>
            <div className="field-group">
              <select
                value={activeDeck?.id ?? ''}
                onChange={(event) => setActiveDeck(event.target.value)}
              >
                {decks.map((deck) => (
                  <option key={deck.id} value={deck.id}>
                    {deck.name}
                  </option>
                ))}
              </select>
              <button className="button button--ghost" onClick={() => createDeck('New deck')}>
                New
              </button>
            </div>
          </div>
          {activeDeck ? (
            <>
              <label className="field">
                <span>Deck name</span>
                <input
                  value={activeDeck.name}
                  onChange={(event) => renameDeck(activeDeck.id, event.target.value)}
                />
              </label>
              <div className="deck-cards">
                {activeDeck.cards.map((card) => (
                  <div key={card.instanceId} className="deck-card">
                    <CardView card={card} owner={0} size="small" interactive={false} />
                    <div className="deck-card__actions">
                      <button
                        className="button button--ghost"
                        onClick={() => handleReroll(activeDeck.id, card)}
                      >
                        Reroll arrows
                      </button>
                      <button
                        className="button button--ghost"
                        onClick={() => removeCard(activeDeck.id, card.instanceId)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {!validation.valid ? (
                <div className="validation">
                  {validation.errors.map((error) => (
                    <div key={error}>- {error}</div>
                  ))}
                </div>
              ) : (
                <div className="validation validation--success">Deck is valid.</div>
              )}
            </>
          ) : (
            <p>Create a deck to start adding cards.</p>
          )}
        </div>
      </div>

      <div className="panel">
        <h2>Export &amp; import</h2>
        <div className="field-group">
          <button className="button button--ghost" onClick={handleExport}>
            Export decks
          </button>
        </div>
        <textarea
          rows={6}
          placeholder="Paste deck JSON here to import."
          value={importText}
          onChange={(event) => setImportText(event.target.value)}
        />
        <button className="button button--primary" onClick={handleImport}>
          Import decks
        </button>
      </div>
    </section>
  )
}
