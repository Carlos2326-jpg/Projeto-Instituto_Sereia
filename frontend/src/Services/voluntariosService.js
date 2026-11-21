import { api } from './api';

export const voluntarioService = {
  listar: async () => {
    const resposta = await api.get('/voluntarios');
    return resposta.data;
  },
  
  buscarPorId: async (id) => {
    const resposta = await api.get(`/voluntarios/${id}`);
    return resposta.data;
  },
  
  criar: async (dados) => {
    return await api.post('/voluntarios', dados);
  },
  
  atualizar: async (id, dados) => {
    return await api.put(`/voluntarios/${id}`, dados);
  },
  
  alterarStatus: async (id, status) => {
    return await api.patch(`/voluntarios/${id}/status`, { status });
  }
};