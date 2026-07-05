import { NavLink } from 'react-router-dom'
import './Header.css'

function Header() {
  const linkClass = ({ isActive }) => (isActive ? 'is-active' : '')

  return (
    <header className="site-header">
      <div className="container header-inner">
        <NavLink to="/" className="brand" end>
          <span className="brand-tails" aria-hidden="true">
            <span className="tail tail-left" />
            <span className="tail tail-right" />
          </span>
          <span className="brand-text">미쿠마톤 노래책</span>
        </NavLink>
        <nav className="site-nav">
          <NavLink to="/" className={linkClass} end>
            노래 검색
          </NavLink>
          <NavLink to="/request" className={linkClass}>
            노래 요청
          </NavLink>
          <NavLink to="/reviews" className={linkClass}>
            감상평
          </NavLink>
          <NavLink to="/admin" className={({ isActive }) => `nav-admin ${isActive ? 'is-active' : ''}`}>
            관리자
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

export default Header
