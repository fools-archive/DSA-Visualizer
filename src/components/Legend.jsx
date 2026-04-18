export default function Legend({ items }) {
  return (
    <div className="legend">
      {items.map((i) => (
        <div key={i.label} className="legend-item">
          <span className="legend-swatch" style={{ background: i.color }} />
          {i.label}
        </div>
      ))}
    </div>
  );
}
