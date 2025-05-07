import { defineStore } from 'pinia';
import axios from 'axios';
import url from '@/utils/url';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
  }),
  persist: true,
  actions: {
    async login(credentials) {
      try {
        const response = await axios.post(`${url.baseUrl}/api/v1/auth/signin`, credentials, { withCredentials: true });
        this.token = response.data.token;
        this.user = response.data.user;

        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(this.user));

        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
        return response.data.user;
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },
    logout() {
      this.token = null;
      this.user = null;

      localStorage.removeItem('token');
      localStorage.removeItem('user');

      delete axios.defaults.headers.common['Authorization'];
    },
    isAuthenticated() {
      return !!this.token && !!this.user?.emailVerified;
    },
    isAdmin() {
      return this.user?.isAdmin;
    }
  }
});
