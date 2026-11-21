// Transforma 1 em VOL-0001
export function formatarCodigo(id, prefixo) {
  if (!id) return '';
  return `${prefixo}-${String(id).padStart(4, '0')}`;
}

// Esconde o CPF (***.***.***-**)
export function formatarCpf(cpf) {
  if (!cpf) return 'Não informado';
  return '***.***.***-**';
}

// Junta os pedaços do endereço em uma linha só
export function formatarEndereco(obj) {
  const partes = [];
  if (obj.logradouro) partes.push(`${obj.logradouro}${obj.numero ? `, ${obj.numero}` : ''}`);
  if (obj.bairro) partes.push(obj.bairro);
  if (obj.cidade) partes.push(obj.cidade);

  if (partes.length === 0) return 'Não informado';
  return partes.join(' — ');
}

// Formata data YYYY-MM-DD para DD/MM/YYYY
export function formatarData(dataString) {
  if (!dataString) return '';
  const [ano, mes, dia] = dataString.split('-');
  return `${dia}/${mes}/${ano}`;
}

export function mascararTelefone(valor) {
  if (!valor) return '';

  // Remove tudo o que não for número
  let apenasNumeros = valor.replace(/\D/g, '');

  // Limita a 11 dígitos (DDD + 9 dígitos)
  apenasNumeros = apenasNumeros.slice(0, 11);

  // Aplica a máscara conforme a quantidade de números digitados
  if (apenasNumeros.length === 0) return '';
  if (apenasNumeros.length <= 2) return `(${apenasNumeros}`;
  if (apenasNumeros.length <= 6) return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`;
  if (apenasNumeros.length <= 10) return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 6)}-${apenasNumeros.slice(6)}`;

  // Formato final para 11 dígitos (Celular): (XX) XXXXX-XXXX
  return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7)}`;
}

export function mascararCep(valor) {
  if (!valor) return '';

  // Remove tudo que não for número
  let apenasNumeros = valor.replace(/\D/g, '');

  // Limita a 8 dígitos
  apenasNumeros = apenasNumeros.slice(0, 8);

  // Aplica a máscara 00000-000
  if (apenasNumeros.length <= 5) {
    return apenasNumeros;
  }
  return `${apenasNumeros.slice(0, 5)}-${apenasNumeros.slice(5)}`;
}