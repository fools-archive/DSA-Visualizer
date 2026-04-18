// Trace export — serialize a step sequence + metadata to a downloadable
// JSON blob. Used by DebugPanel's "export trace" action.

export function buildTrace({ category, algoId, input, steps, index }) {
  return {
    format: 'dsa-visualizer/trace@1',
    exportedAt: new Date().toISOString(),
    category,
    algoId,
    input,
    indexAtExport: index,
    totalSteps: steps.length,
    steps,
  };
}

export function downloadTrace(trace, filename) {
  if (typeof window === 'undefined') return;
  const blob = new Blob([JSON.stringify(trace, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `trace-${trace.algoId ?? 'export'}-${Date.now()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
