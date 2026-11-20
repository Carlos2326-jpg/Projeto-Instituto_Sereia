export function Input({ label, id, error, ...props }) {
  return (
    <div className="input-group">
      {label && (
        <label htmlFor={id} className="input-label">
          {label}
        </label>
      )}
      <input id={id} className="input-field" {...props} />
      {error && (
        <span
          style={{ color: "var(--color-danger-text)", fontSize: "0.75rem" }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
