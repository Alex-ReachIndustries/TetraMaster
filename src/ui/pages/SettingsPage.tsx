import { getEnvArtMode } from '../../services'
import { useSettingsStore } from '../../state'

export const SettingsPage = () => {
  const {
    theme,
    reducedMotion,
    aiRandomness,
    aiThinkTimeMs,
    arrowDensity,
    blockMode,
    blockCount,
    rngSeed,
    showDevPanel,
    artModeOverride,
    hideOpponentHand,
    setTheme,
    setReducedMotion,
    setAiRandomness,
    setAiThinkTime,
    setArrowDensity,
    setBlockMode,
    setBlockCount,
    setRngSeed,
    setShowDevPanel,
    setArtModeOverride,
    setHideOpponentHand,
  } = useSettingsStore()

  return (
    <section className="page">
      <h1>Settings</h1>

      <div className="panel">
        <h2>Appearance</h2>
        <label className="field">
          <span>Theme</span>
          <select value={theme} onChange={(event) => setTheme(event.target.value as never)}>
            <option value="classic">Classic-inspired</option>
            <option value="modern">Modern minimal</option>
          </select>
        </label>
        <label className="field field--toggle">
          <input
            type="checkbox"
            checked={reducedMotion}
            onChange={(event) => setReducedMotion(event.target.checked)}
          />
          <span>Reduced motion</span>
        </label>
      </div>

      <div className="panel">
        <h2>Gameplay defaults</h2>
        <label className="field">
          <span>RNG seed</span>
          <input value={rngSeed} onChange={(event) => setRngSeed(event.target.value)} />
        </label>
        <label className="field">
          <span>Arrow density</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={arrowDensity}
            onChange={(event) => setArrowDensity(Number(event.target.value))}
          />
          <span className="field__hint">{Math.round(arrowDensity * 100)}%</span>
        </label>
        <label className="field">
          <span>Blocked squares</span>
          <select
            value={blockMode}
            onChange={(event) => setBlockMode(event.target.value as never)}
          >
            <option value="random">Random (0-6)</option>
            <option value="fixed">Fixed count</option>
          </select>
        </label>
        {blockMode === 'fixed' ? (
          <label className="field">
            <span>Blocked count</span>
            <input
              type="number"
              min={0}
              max={6}
              value={blockCount}
              onChange={(event) => setBlockCount(Number(event.target.value))}
            />
          </label>
        ) : null}
      </div>

      <div className="panel">
        <h2>AI</h2>
        <label className="field field--toggle">
          <input
            type="checkbox"
            checked={aiRandomness}
            onChange={(event) => setAiRandomness(event.target.checked)}
          />
          <span>Allow AI randomness (otherwise deterministic)</span>
        </label>
        <div className="field-group">
          <label className="field">
            <span>Easy (ms)</span>
            <input
              type="number"
              min={50}
              max={2000}
              value={aiThinkTimeMs.easy}
              onChange={(event) => setAiThinkTime('easy', Number(event.target.value))}
            />
          </label>
          <label className="field">
            <span>Medium (ms)</span>
            <input
              type="number"
              min={50}
              max={2000}
              value={aiThinkTimeMs.medium}
              onChange={(event) => setAiThinkTime('medium', Number(event.target.value))}
            />
          </label>
          <label className="field">
            <span>Hard (ms)</span>
            <input
              type="number"
              min={50}
              max={3000}
              value={aiThinkTimeMs.hard}
              onChange={(event) => setAiThinkTime('hard', Number(event.target.value))}
            />
          </label>
        </div>
        <label className="field field--toggle">
          <input
            type="checkbox"
            checked={hideOpponentHand}
            onChange={(event) => setHideOpponentHand(event.target.checked)}
          />
          <span>Hide opponent hand in hotseat matches</span>
        </label>
      </div>

      <div className="panel">
        <h2>Card art</h2>
        <p className="small">
          Current env default: <strong>{getEnvArtMode()}</strong>
        </p>
        <label className="field">
          <span>Art provider override</span>
          <select
            value={artModeOverride}
            onChange={(event) => setArtModeOverride(event.target.value as never)}
          >
            <option value="env">Use env default</option>
            <option value="procedural">Procedural</option>
            <option value="generated">Generated (public/generated)</option>
            <option value="local">Local service</option>
          </select>
        </label>
      </div>

      <div className="panel">
        <h2>Debug</h2>
        <label className="field field--toggle">
          <input
            type="checkbox"
            checked={showDevPanel}
            onChange={(event) => setShowDevPanel(event.target.checked)}
          />
          <span>Show dev panel during matches</span>
        </label>
      </div>
    </section>
  )
}
