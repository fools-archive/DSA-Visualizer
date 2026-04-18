import { Link } from 'react-router-dom';

const chapters = [
  {
    num: 'I',
    to: '/sorting',
    title: 'Sorting',
    desc: 'Compare, swap, overwrite — the elementary grammar of order.',
    folio: 'p. 01'
  },
  {
    num: 'II',
    to: '/tree',
    title: 'Trees',
    desc: 'Binary search tree insertion, deletion, and the three orderings of traversal.',
    folio: 'p. 02'
  },
  {
    num: 'III',
    to: '/graph',
    title: 'Graphs',
    desc: 'Frontiers and visits: breadth-first and depth-first over a small graph.',
    folio: 'p. 03'
  },
  {
    num: '§',
    to: '/about',
    title: 'Colophon & Architecture',
    desc: 'How the book is set: the four layers, the step event, and how to add an entry.',
    folio: 'p. 04'
  }
];

export default function HomePage() {
  return (
    <>
      <section className="frontispiece">
        <div className="kicker">An illustrated reader · 2026 edition</div>
        <h1>
          Algorithms,<br/>
          read as <em>figures</em>.
        </h1>
        <p className="lede">
          <span className="dropcap">A</span>lgorithms here are pure functions that emit an ordered
          sequence of events. A playback engine advances through them; each visualizer folds the
          events into a frame. What you see is the algorithm thinking aloud — no more, no less.
          Turn the page, or read straight through.
        </p>
      </section>

      <nav className="contents" aria-label="Table of contents">
        {chapters.map((c) => (
          <Link key={c.to} to={c.to} className="contents-row">
            <span className="num">{c.num}</span>
            <span className="body">
              <span className="title">{c.title}</span>
              <span className="desc">{c.desc}</span>
            </span>
            <span className="folio">{c.folio}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
