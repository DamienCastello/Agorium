import { defineStore } from 'pinia';
import axios from 'axios';
import url from '@/utils/url';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
  }),
  actions: {
    async login(credentials) {
      try {
        const response = await axios.post(`${url.baseUrl}/api/v1/auth/signin`, credentials, { withCredentials: true });
        this.token = response.data.token;
        this.user = response.data.user;
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
      } catch (error) {
        console.error('Login failed:', error);
        throw error;
      }
    },
    logout() {
      this.token = null;
      this.user = null;
      delete axios.defaults.headers.common['Authorization'];
    },
    isAuthenticated() {
      return !!this.token;
    },
    isAdmin() {
      return this.user?.isAdmin;
    }
  }
});
