import { useState } from 'react'
import { useNavigate, useLocation, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_LINKS = [
  { to: '/', label: 'Dashboard' },
  { to: '/expenses', label: 'Gastos' },
  { to: '/fixed-costs', label: 'Custos Fixos' },
  { to: '/categories', label: 'Categorias' },
  { to: '/loans', label: 'Empréstimos' },
]

export default function Navbar() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [open, setOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <nav style={styles.nav}>
      <span style={styles.brand}> Controle de Gastos</span>

      <div className="nav-links-desktop">
        {NAV_LINKS.map(({ to, label }) => {
          const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
          return (
            <NavLink key={to} to={to} style={{ ...styles.link, ...(isActive ? styles.linkActive : {}) }}>
              {label}
            </NavLink>
          )
        })}
      </div>

      <button className="logout-desktop" style={styles.logoutBtn} onClick={handleLogout}>Sair</button>

      <button className="hamburger" onClick={() => setOpen(o => !o)} aria-label="Menu">
        {open ? '✕' : '☰'}
      </button>

      {open && (
        <div style={styles.mobileMenu}>
          {NAV_LINKS.map(({ to, label }) => {
            const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to)
            return (
              <NavLink
                key={to}
                to={to}
                style={{ ...styles.mobileLink, ...(isActive ? styles.mobileLinkActive : {}) }}
                onClick={() => setOpen(false)}
              >
                {label}
              </NavLink>
            )
          })}
          <button style={styles.mobileLogoutBtn} onClick={() => { handleLogout(); setOpen(false) }}>
            Sair
          </button>
        </div>
      )}
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex', alignItems: 'center', gap: '0.5rem',
    background: '#6366f1', padding: '0 1.5rem', height: 56,
    fontFamily: 'system-ui, sans-serif', position: 'sticky', top: 0, zIndex: 100,
    boxShadow: '0 2px 8px rgba(99,102,241,0.18)',
  },
  brand: { color: '#fff', fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em', marginRight: 'auto' },
  link: {
    color: 'rgba(255,255,255,0.82)', textDecoration: 'none',
    padding: '0.35rem 0.85rem', borderRadius: 8, fontSize: '0.9rem', fontWeight: 500,
  },
  linkActive: { background: 'rgba(255,255,255,0.18)', color: '#fff', fontWeight: 600 },
  logoutBtn: {
    background: 'rgba(255,255,255,0.15)', color: '#fff',
    border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8,
    padding: '0.35rem 0.9rem', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer',
    marginLeft: '1rem',
  },
  mobileMenu: {
    position: 'absolute', top: 56, left: 0, right: 0,
    background: '#6366f1',
    display: 'flex', flexDirection: 'column',
    padding: '0.25rem 1.5rem 1rem',
    boxShadow: '0 8px 20px rgba(0,0,0,0.2)',
    zIndex: 99,
    borderTop: '1px solid rgba(255,255,255,0.15)',
  },
  mobileLink: {
    color: 'rgba(255,255,255,0.9)', textDecoration: 'none',
    padding: '0.85rem 0', fontSize: '1rem', fontWeight: 500,
    borderBottom: '1px solid rgba(255,255,255,0.12)',
    display: 'block',
  },
  mobileLinkActive: { color: '#fff', fontWeight: 700 },
  mobileLogoutBtn: {
    background: 'transparent', color: 'rgba(255,255,255,0.85)',
    border: 'none', textAlign: 'left', padding: '0.85rem 0',
    fontSize: '1rem', fontWeight: 500, cursor: 'pointer',
  },
}
