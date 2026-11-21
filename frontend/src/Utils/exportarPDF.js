import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function exportarParaPdf(dados, tituloArquivo, colunas) {
  if (!dados || !dados.length) {
    alert('Não há dados para exportar.');
    return;
  }

  // Cria o documento A4 na orientação Paisagem (Landscape) para caber a tabela
  const doc = new jsPDF('landscape', 'mm', 'a4');

  // --- Cabeçalho do PDF ---
  // Fundo azul petróleo para o cabeçalho
  doc.setFillColor(21, 75, 90); // --color-primary: #154b5a
  doc.rect(0, 0, 297, 25, 'F'); // Retângulo ocupando a largura toda (A4 landscape = 297mm)

  // Texto do Cabeçalho
  doc.setTextColor(255, 255, 255); // Branco
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Instituto Sereia", 14, 12);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(tituloArquivo, 14, 18);

  // Data de emissão no canto direito
  const dataEmissao = new Date().toLocaleDateString('pt-BR');
  doc.text(`Emitido em: ${dataEmissao}`, 283, 18, { align: 'right' });

  // --- Tabela de Dados ---
  // Mapeia os dados para o formato que a biblioteca entende
  const corpoTabela = dados.map(item => colunas.map(coluna => item[coluna.chave]));

  autoTable(doc, {
    startY: 30,
    head: [colunas.map(coluna => coluna.titulo)],
    body: corpoTabela,
    theme: 'grid',
    styles: { 
      fontSize: 9, 
      font: 'helvetica',
      cellPadding: 4,
      textColor: [75, 85, 99] // --color-text-body
    },
    headStyles: { 
      fillColor: [230, 240, 242], // --color-primary-light (fundo claro)
      textColor: [21, 75, 90], // --color-primary
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251] // Cinza bem claro para linhas alternadas
    },
    margin: { top: 30, left: 14, right: 14 }
  });

  // --- Rodapé ---
  const totalPaginas = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Dados fictícios para demonstração - Informações pessoais protegidas - Página ${i} de ${totalPaginas}`, 
      14, 
      doc.internal.pageSize.height - 10
    );
  }

  // Salva o arquivo
  doc.save(`${tituloArquivo.toLowerCase().replace(/\s+/g, '_')}.pdf`);
}