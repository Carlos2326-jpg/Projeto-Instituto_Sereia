import axios from 'axios';

export const api = axios.create({
  baseURL: 'http://localhost:3001', // URL do seu backend
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepta as requisições para adicionar o Token JWT
api.interceptors.request.use(
  (config) => {
    const sessao = JSON.parse(sessionStorage.getItem('sessao') || 'null');
    if (sessao && sessao.token) {
      config.headers.Authorization = `Bearer ${sessao.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepta as respostas para tratar sessão expirada
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Se o token expirou, remove a sessão e recarrega a página (volta pro login)
      sessionStorage.removeItem('sessao');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);