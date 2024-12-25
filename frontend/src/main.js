import { createApp } from 'vue';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { routes } from './routes';
import { useAuthStore } from './stores/auth';
import { createPinia } from 'pinia';

const router = createRouter({
    history: createWebHistory(),
    routes
})

const pinia = createPinia();

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    if (to.meta.requiresAuth && !authStore.isAuthenticated()) {
      next('/login');
    } else {
      next();
    }
  });

const app = createApp(App);
app.use(router);
app.use(pinia);
app.mount('#app');
