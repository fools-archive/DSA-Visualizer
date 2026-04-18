# DSA Visualizer

A step-event-driven platform for visualizing data structures and algorithms. Algorithms are pure functions that emit an ordered list of events; a playback engine advances through them; SVG visualizers fold events into a view.

See `README.md` for architecture details and `src/` layout.

---

## Design Context

### Users
Primary audience: **recruiters, hiring managers, and fellow engineers** evaluating the creator's craft. The DSA Visualizer functions as a portfolio showcase — it must demonstrate technical depth (a clean step-event engine, pure-function algorithms, SVG visualizers) AND design taste in the same breath. Secondary audience: CS students or curious visitors who stumble on it and want to actually learn from the visualizations.

Context of use: desktop-first, exploratory. Someone lands on a link from a resume or GitHub profile, spends 30–90 seconds forming an impression, then either dismisses it or digs in. The interface has to *earn the dig* within the first few seconds.

Job to be done: make the visitor feel "whoever built this cares about details I care about" — both algorithmically and visually.

### Brand Personality
Three words: **editorial, precise, considered**.

Voice/tone: like a well-designed textbook or a Pelican Books cover reissue — scholarly without being stuffy, confident in typography, unafraid of whitespace. The algorithms are the content; the UI is the page.

Emotional goals: calm focus, quiet confidence, the pleasure of a well-set page. The visitor should feel they've walked into a small museum exhibit, not a SaaS dashboard.

### Aesthetic Direction
Tone: **editorial / textbook-inspired**. Think print-first thinking brought to the web — strong typographic hierarchy, generous margins, figure numbers, small caps for metadata, rules instead of boxes. Algorithms presented as *specimens* rather than products.

Theme: **both light and dark**, with a toggle. Each must feel native, not inverted.
- Light = warm paper, ink-black text, a single restrained accent. Daytime-study / archive feel.
- Dark = deep ink (not black), warm off-white body text, muted accent. Late-night study feel, not terminal.
Both themes should tint neutrals slightly toward the accent hue for cohesion.

Anti-references (hard bans):
- **No generic SaaS dashboard look.** No Linear/Vercel/Stripe card-grid clone. No purple-to-blue gradients. No icon-above-heading repeating cards.
- **No VisuAlgo / typical DSA-site look.** No cluttered toolbars, no rainbow legend keys shouting for attention, no dated educational-tool chrome.
- **No crypto / neon cyberpunk.** No cyan-on-black. No glowing borders. No synthwave accents.
- **No Bootstrap / Material defaults.** No component-library "tells" — no default blue primary buttons, no Material ripples, no stock shadows.

Additional bans to stay vigilant about:
- Inter, DM Sans, Plus Jakarta, Space Grotesk, IBM Plex, Fraunces, Playfair, Instrument Serif (the reflex fonts)
- Card-in-card nesting, identical card grids, hero "big number + label" blocks
- Gradient text, colored side-stripe borders on callouts, glassmorphism
- Pure `#000` / `#fff` — always tint

### Design Principles

1. **Treat it like a printed page, not a dashboard.** Typographic hierarchy and whitespace do the work that cards and shadows do in a SaaS UI. Rules (`hr`-style lines), figure numbers, running heads, and small caps beat boxes.

2. **One accent, used sparingly.** 60-30-10 by visual weight. The accent should be unexpected (a muted oxblood, a deep teal, a mustard — not blue, not purple) and appear only where it truly earns a glance: the active element in a visualization, one button, a single rule.

3. **Algorithms are specimens.** Each visualization is a *figure* with a caption, number, and quiet frame. Invite slow looking. Resist the urge to decorate — the algorithm IS the decoration.

4. **Motion serves comprehension, nothing else.** State transitions in the visualizer must be legible (ease-out, 180–320ms, transform/opacity only). No page-load flourishes, no parallax, no "delightful" micro-interactions on chrome. The play/step/reset controls should feel instrument-precise.

5. **Every typographic choice is load-bearing.** Pair one distinctive display/serif face with one refined text face (neither from the reflex list). Use a 1.25+ modular scale, OpenType features where they exist (small caps, oldstyle figures, tabular nums in the visualizer), and cap body measure at 65–75ch.
