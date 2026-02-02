import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './ui/components/Layout'
import { AboutPage } from './ui/pages/AboutPage'
import { DeckBuilderPage } from './ui/pages/DeckBuilderPage'
import { HomePage } from './ui/pages/HomePage'
import { PlayPage } from './ui/pages/PlayPage'
import { SettingsPage } from './ui/pages/SettingsPage'
import { useSettingsStore } from './state'

const App = () => {
  const theme = useSettingsStore((state) => state.theme)
  const reducedMotion = useSettingsStore((state) => state.reducedMotion)

  useEffect(() => {
    document.body.dataset.theme = theme
    document.body.dataset.motion = reducedMotion ? 'reduced' : 'full'
  }, [theme, reducedMotion])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/deck-builder" element={<DeckBuilderPage />} />
        <Route path="/play" element={<PlayPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Layout>
  )
}

export default App
