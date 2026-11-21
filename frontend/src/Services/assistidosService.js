import { api } from './api';

export const assistidoService = {
  listar: async () => {
    const resposta = await api.get('/assistidos');
    return resposta.data;
  },
  
  buscarPorId: async (id) => {
    const resposta = await api.get(`/assistidos/${id}`);
    return resposta.data;
  },
  
  criar: async (dados) => {
    return await api.post('/assistidos', dados);
  },
  
  atualizar: async (id, dados) => {
    return await api.put(`/assistidos/${id}`, dados);
  },
  
  alterarStatus: async (id, status) => {
    return await api.patch(`/assistidos/${id}/status`, { status });
  }
};