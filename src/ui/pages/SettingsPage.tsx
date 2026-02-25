import { getEnvArtMode } from '../../services'
import { useSettingsStore } from '../../state'

export const SettingsPage = () => {
  const {
    theme, reducedMotion, aiRandomness, aiThinkTimeMs, arrowMode, arrowDensity,
    blockMode, blockCount, rngSeed, showDevPanel, artModeOverride, hideOpponentHand,
    setTheme, setReducedMotion, setAiRandomness, setAiThinkTime, setArrowMode,
    setArrowDensity, setBlockMode, setBlockCount, setRngSeed, setShowDevPanel,
    setArtModeOverride, setHideOpponentHand,
  } = useSettingsStore()

  return (
    <section className="page page--scroll">
      <h1>Settings</h1>

      <div className="settings-grid">
        <div className="panel">
          <h2>🎨 Appearance</h2>
          <label className="field">
            <span>Theme</span>
            <select value={theme} onChange={(e) => setTheme(e.target.value as never)}>
              <option value="classic">Classic (FF9 inspired)</option>
              <option value="modern">Modern minimal</option>
            </select>
          </label>
          <label className="field field--toggle">
            <input type="checkbox" checked={reducedMotion} onChange={(e) => setReducedMotion(e.target.checked)} />
            <span>Reduced motion</span>
          </label>
          <label className="field">
            <span>Card art</span>
            <select value={artModeOverride} onChange={(e) => setArtModeOverride(e.target.value as never)}>
              <option value="env">Default ({getEnvArtMode()})</option>
              <option value="procedural">Lore art</option>
              <option value="generated">Generated images</option>
              <option value="local">Local service</option>
            </select>
          </label>
        </div>

        <div className="panel">
          <h2>🎯 Gameplay</h2>
          <label className="field">
            <span>RNG seed</span>
            <input value={rngSeed} onChange={(e) => setRngSeed(e.target.value)} />
          </label>
          <label className="field">
            <span>Arrow generation</span>
            <select value={arrowMode} onChange={(e) => setArrowMode(e.target.value as never)}>
              <option value="original">Original distribution</option>
              <option value="density">Density slider</option>
            </select>
          </label>
          {arrowMode === 'density' && (
            <label className="field">
              <span>Arrow density: {Math.round(arrowDensity * 100)}%</span>
              <input type="range" min={0} max={1} step={0.05} value={arrowDensity}
                onChange={(e) => setArrowDensity(Number(e.target.value))} />
            </label>
          )}
          <label className="field">
            <span>Blocked squares</span>
            <select value={blockMode} onChange={(e) => setBlockMode(e.target.value as never)}>
              <option value="random">Random (0-6)</option>
              <option value="fixed">Fixed count</option>
            </select>
          </label>
          {blockMode === 'fixed' && (
            <label className="field">
              <span>Block count</span>
              <input type="number" min={0} max={6} value={blockCount}
                onChange={(e) => setBlockCount(Number(e.target.value))} />
            </label>
          )}
        </div>

        <div className="panel">
          <h2>🤖 AI</h2>
          <label className="field field--toggle">
            <input type="checkbox" checked={aiRandomness} onChange={(e) => setAiRandomness(e.target.checked)} />
            <span>Allow AI randomness</span>
          </label>
          <div className="field-group">
            {(['easy', 'medium', 'hard'] as const).map((level) => (
              <label className="field" key={level}>
                <span>{level} (ms)</span>
                <input type="number" min={50} max={3000} value={aiThinkTimeMs[level]}
                  onChange={(e) => setAiThinkTime(level, Number(e.target.value))} />
              </label>
            ))}
          </div>
          <label className="field field--toggle">
            <input type="checkbox" checked={hideOpponentHand} onChange={(e) => setHideOpponentHand(e.target.checked)} />
            <span>Hide opponent hand in hotseat</span>
          </label>
        </div>

        <div className="panel">
          <h2>🔧 Debug</h2>
          <label className="field field--toggle">
            <input type="checkbox" checked={showDevPanel} onChange={(e) => setShowDevPanel(e.target.checked)} />
            <span>Show dev panel in matches</span>
          </label>
        </div>
      </div>
    </section>
  )
}
