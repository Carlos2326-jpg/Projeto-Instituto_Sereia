export function Avatar({ nome }) {
  // Se não houver nome, usa um padrão
  const nomeCompleto = nome || "Usuário";

  // Pega a primeira letra do primeiro e do último nome
  const partes = nomeCompleto.trim().split(" ");
  const primeiraLetra = partes[0]?.[0] || "";
  const ultimaLetra = partes.length > 1 ? partes[partes.length - 1][0] : "";
  const iniciais = (primeiraLetra + ultimaLetra).toUpperCase();

  // Gera uma cor baseada no nome para ficar dinâmico
  const cores = [
    "#154b5a",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f59e0b",
    "#10b981",
  ];
  let hash = 0;
  for (let i = 0; i < nomeCompleto.length; i++) {
    hash = nomeCompleto.charCodeAt(i) + ((hash << 5) - hash);
  }
  const corFundo = cores[Math.abs(hash) % cores.length];

  return (
    <div
      style={{
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        backgroundColor: corFundo,
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: "bold",
        fontSize: "0.75rem",
        flexShrink: 0,
      }}
      title={nomeCompleto}
    >
      {iniciais}
    </div>
  );
}
