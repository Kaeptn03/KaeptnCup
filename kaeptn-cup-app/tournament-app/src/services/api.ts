import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://28a80431-0ad1-46e4-95c6-0b87e691682d-00-qcgrb65dz63j.kirk.replit.dev/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const authAPI = {
  register: (data: { username: string; email: string; password: string; inviteCode: string; rank: number }) =>
    api.post('/auth/register', data),
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login', data),
  createInvite: (adminKey: string) =>
    api.post('/auth/create-invite', { adminKey }),
  deleteAccount: () =>
    api.delete('/auth/delete-account'),
  updateRank: (rank: number) =>
    api.patch('/auth/update-rank', { rank }),
  getAllUsers: () =>
    api.get('/auth/users'),
  resetPassword: (data: { userId: number; newPassword: string }) =>
    api.post('/auth/reset-password', data),
};

export const tournamentsAPI = {
  getAll: () => api.get('/tournaments'),
  getById: (id: number) => api.get(`/tournaments/${id}`),
  create: (data: any) => api.post('/tournaments', data),
  register: (id: number) => api.post(`/tournaments/${id}/register`),
  unregister: (id: number) => api.delete(`/tournaments/${id}/unregister`),
  start: (id: number) => api.post(`/tournaments/${id}/start`),
  delete: (id: number) => api.delete(`/tournaments/${id}`),
  toggleRegistration: (id: number) => api.patch(`/tournaments/${id}/toggle-registration`),
};

export const matchesAPI = {
  getByTournament: (tournamentId: number) => api.get(`/matches/tournament/${tournamentId}`),
  reportResult: (matchId: number, data: { player1_score: number; player2_score: number; winner_id: number }) =>
    api.put(`/matches/${matchId}/report`, data),
};

export const rankingsAPI = {
  getAll: () => api.get('/rankings'),
  getByUser: (userId: number) => api.get(`/rankings/user/${userId}`),
};

export const twitchAPI = {
  getStreams: () => api.get('/twitch/streams'),
  addStream: (data: { channel_name: string; display_name?: string; order_position?: number }) =>
    api.post('/twitch/streams', data),
};

export const newsAPI = {
  getAll: () => api.get('/news'),
  getById: (id: number) => api.get(`/news/${id}`),
  create: (data: { type: string; title: string; content?: string; url?: string; image_url?: string }) =>
    api.post('/news', data),
  update: (id: number, data: { type?: string; title?: string; content?: string; url?: string; image_url?: string; is_active?: boolean }) =>
    api.put(`/news/${id}`, data),
  delete: (id: number) => api.delete(`/news/${id}`),
};

export const bracketsAPI = {
  getAll: () => api.get('/brackets'),
  getByTournament: (tournamentId: number) => api.get(`/brackets/tournament/${tournamentId}`),
  createOrUpdate: (data: { tournament_id: number; challonge_url: string }) =>
    api.post('/brackets', data),
  delete: (id: number) => api.delete(`/brackets/${id}`),
};

export default api;
