import { Routes, Route, Navigate } from 'react-router-dom';
import Masthead from './components/Masthead.jsx';
import HomePage from './pages/HomePage.jsx';
import SortingPage from './pages/SortingPage.jsx';
import TreePage from './pages/TreePage.jsx';
import GraphPage from './pages/GraphPage.jsx';
import AboutPage from './pages/AboutPage.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <Masthead />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/sorting" element={<SortingPage />} />
          <Route path="/tree" element={<TreePage />} />
          <Route path="/graph" element={<GraphPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <footer className="colophon">
        <span>
          <em>DSA, a reader.</em> — a step-event platform for algorithms.
        </span>
        <span>© MMXXVI</span>
      </footer>
    </div>
  );
}
