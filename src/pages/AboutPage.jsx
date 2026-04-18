export default function AboutPage() {
  return (
    <>
      <header className="page-head">
        <div className="chapter">
          <span className="chapter-num">Colophon</span>
          <span className="chapter-tag">— on how this reader is set</span>
        </div>
        <h1>Architecture &amp; notes.</h1>
        <p className="dek">
          A short account of how the book is made: four layers of code, one modest kind of event,
          and a brief table of complexities for the curious.
        </p>
      </header>

      <div className="reading">
        <p>
          Each chapter of this reader is generated the same way. An <em>algorithm</em> — a pure
          JavaScript function — takes some input and returns an ordered array of <em>step events</em>.
          A <em>player</em> indexes into that array, advancing on a timer or one step at a time. A
          <em> visualizer</em> folds the prefix <code className="inline">steps[0..index]</code> into
          a view and paints it with SVG. Nothing more happens. There is no state machine hiding
          behind the animation; the animation <em>is</em> the state.
        </p>

        <h2>The four layers.</h2>
        <p>
          The <em>algorithm</em> layer lives under <code className="inline">src/algorithms</code>.
          Its files do not import from visualizers, pages, or components. They receive input and
          return steps. Determinism is the rule.
        </p>
        <p>
          The <em>engine</em> layer, in <code className="inline">src/engine</code>, holds the step-type
          factories (<code className="inline">compare</code>, <code className="inline">swap</code>,
          <code className="inline"> visitNode</code>, and so on) and the <code className="inline">usePlayer</code>
          hook, which is oblivious to domain and simply walks an array.
        </p>
        <p>
          The <em>visualization</em> layer, in <code className="inline">src/visualizers</code>, is pure
          in its props. It accepts an initial snapshot, the array of steps, and an index; it reduces
          them into a frame.
        </p>
        <p>
          The <em>page</em> layer wires the parts together: input controls, the algorithm selector,
          the canvas, and the player. Pages do no algorithmic work of their own.
        </p>

        <h2>A step, written out.</h2>
        <pre>{`// Emitted by bubbleSort while passing over an array:
{ type: 'compare', indices: [3, 4] }
{ type: 'swap',    indices: [3, 4] }
{ type: 'mark-sorted', index: 4 }`}</pre>
        <p>
          Events are small and named. A visualizer that understands <code className="inline">compare</code>,
          <code className="inline"> swap</code>, <code className="inline">overwrite</code>, and
          <code className="inline"> mark-sorted</code> can render every sorting method in this book.
        </p>

        <h2>Complexity reference.</h2>
        <table className="complexity">
          <thead>
            <tr><th>Method</th><th>Time (avg)</th><th>Time (worst)</th><th>Space</th></tr>
          </thead>
          <tbody>
            <tr><td>Bubble Sort</td><td><code>O(n²)</code></td><td><code>O(n²)</code></td><td><code>O(1)</code></td></tr>
            <tr><td>Selection Sort</td><td><code>O(n²)</code></td><td><code>O(n²)</code></td><td><code>O(1)</code></td></tr>
            <tr><td>Insertion Sort</td><td><code>O(n²)</code></td><td><code>O(n²)</code></td><td><code>O(1)</code></td></tr>
            <tr><td>BST insert / delete</td><td><code>O(log n)</code></td><td><code>O(n)</code></td><td><code>O(h)</code></td></tr>
            <tr><td>BFS</td><td><code>O(V + E)</code></td><td><code>O(V + E)</code></td><td><code>O(V)</code></td></tr>
            <tr><td>DFS</td><td><code>O(V + E)</code></td><td><code>O(V + E)</code></td><td><code>O(V)</code></td></tr>
          </tbody>
        </table>

        <h2>Adding an entry.</h2>
        <ol>
          <li>Write <code className="inline">src/algorithms/&lt;category&gt;/yourAlgo.js</code> — a pure function that returns an array of steps.</li>
          <li>Import factories from <code className="inline">engine/stepTypes.js</code>; do not invent step shapes inline.</li>
          <li>Register the method in its page's <code className="inline">ALGOS</code> map.</li>
          <li>If the step type is new, extend the visualizer's reducer and the read-out in <code className="inline">PlayerControls.jsx</code>.</li>
        </ol>
      </div>
    </>
  );
}
