export function Badge({ children, status }) {
  const variant = status === "Ativo" ? "success" : "danger";
  return <span className={`badge badge-${variant}`}>{children}</span>;
}
