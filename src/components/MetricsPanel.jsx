import { useMemo } from 'react';
import { computeMetrics, metricFieldsByCategory, metricLabels } from '../engine/metrics.js';

export default function MetricsPanel({ player, category = 'sorting' }) {
  const { steps, index, elapsedMs } = player;
  const metrics = useMemo(() => computeMetrics(steps, index), [steps, index]);
  const fields = metricFieldsByCategory[category] ?? metricFieldsByCategory.sorting;

  return (
    <section className="metrics">
      <h3 className="marginalia-head">Metrics</h3>
      <dl className="metrics-list">
        {fields.map((f) => (
          <div className="metrics-row" key={f}>
            <dt>{metricLabels[f] ?? f}</dt>
            <dd>{metrics[f] ?? 0}</dd>
          </div>
        ))}
        <div className="metrics-row">
          <dt>Elapsed</dt>
          <dd>{formatMs(elapsedMs)}</dd>
        </div>
      </dl>
    </section>
  );
}

function formatMs(ms) {
  if (!ms) return '0 ms';
  if (ms < 1000) return `${Math.round(ms)} ms`;
  return `${(ms / 1000).toFixed(2)} s`;
}
