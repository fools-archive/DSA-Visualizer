import { useState } from 'react';
import { buildShareUrl, writeSnapshotToHash } from '../engine/persistence.js';

// Small utility dropped in any page's aside. Builds a shareable URL that
// encodes { category, algoId, input, index } into the hash fragment.
export default function SnapshotShare({ category, algoId, input, index }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = buildShareUrl({ category, algoId, input, index });
    writeSnapshotToHash({ category, algoId, input, index });
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      window.prompt('Copy this link', url);
    }
  };

  return (
    <div className="field-row">
      <button type="button" className="btn" onClick={handleCopy}>
        {copied ? 'Link copied' : 'Copy share link'}
      </button>
    </div>
  );
}
