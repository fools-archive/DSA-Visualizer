import { NavLink, Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle.jsx';

const links = [
  { to: '/', label: 'Front', end: true },
  { to: '/sorting', label: 'Sorting' },
  { to: '/tree', label: 'Trees' },
  { to: '/graph', label: 'Graphs' },
  { to: '/about', label: 'Colophon' }
];

const chapterForPath = (p) => {
  if (p === '/') return 'Table of Contents';
  if (p.startsWith('/sorting')) return 'Chapter I · Sorting';
  if (p.startsWith('/tree')) return 'Chapter II · Trees';
  if (p.startsWith('/graph')) return 'Chapter III · Graphs';
  if (p.startsWith('/about')) return 'Colophon';
  return '';
};

export default function Masthead() {
  const { pathname } = useLocation();
  return (
    <>
      <header className="masthead">
        <Link to="/" className="masthead-brand">
          <span className="mark">DSA, a reader.</span>
          <span className="vol">Vol. I · No. 1</span>
        </Link>
        <nav className="masthead-nav" aria-label="Primary">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => (isActive ? 'active' : '')}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="masthead-utility">
          <ThemeToggle />
        </div>
      </header>
      <div className="masthead-runline">
        <span>{chapterForPath(pathname)}</span>
        <span>Edited &amp; set in Spectral</span>
      </div>
    </>
  );
}
