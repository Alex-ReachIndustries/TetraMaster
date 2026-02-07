import type { ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useSettingsStore } from '../../state'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/deck-builder', label: 'Deck Builder' },
  { to: '/play', label: 'Play' },
  { to: '/settings', label: 'Settings' },
  { to: '/about', label: 'About' },
]

export const Layout = ({ children }: { children: ReactNode }) => {
  const theme = useSettingsStore((state) => state.theme)
  return (
    <div className={`app app--${theme}`}>
      <header className="app__header">
        <div className="brand">
          <span className="brand__title">Tetra Master</span>
          <span className="brand__subtitle">Card Game</span>
        </div>
        <nav className="nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav__link is-active' : 'nav__link')}
              end={item.to === '/'}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="app__main">{children}</main>
    </div>
  )
}
