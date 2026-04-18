import { useState } from 'react';

export default function InputPanel({ label, placeholder, value, onChange, onSubmit, submitLabel = 'Load', extra, error, hint }) {
  const [local, setLocal] = useState(value ?? '');
  return (
    <form
      className="field"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.(local);
      }}
    >
      <label>{label}</label>
      <input
        type="text"
        value={local}
        placeholder={placeholder}
        onChange={(e) => {
          setLocal(e.target.value);
          onChange?.(e.target.value);
        }}
      />
      {hint && <span className="hint">{hint}</span>}
      {error && <span className="err">{error}</span>}
      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
        <button type="submit" className="btn primary">{submitLabel}</button>
        {extra}
      </div>
    </form>
  );
}
