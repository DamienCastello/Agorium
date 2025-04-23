import { createApp } from 'vue';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { routes } from './routes';
import { useAuthStore } from './stores/auth';
import { createPinia } from 'pinia';
import Notifications from '@kyvg/vue3-notification';
import i18n from './i18n/translations'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'


const router = createRouter({
    history: createWebHistory(),
    routes
})

const pinia = createPinia();

router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    if (to.meta.requiresAuth && !authStore.isAuthenticated()) {
      next('/login');
    }
    else if (to.meta.requiresAdmin && !authStore.isAdmin()) {
      next('/login');
    }
    else {
      next();
    }
  });

const app = createApp(App);
app.use(router);
app.use(pinia);
app.use(ElementPlus);
app.use(Notifications);
app.use(i18n);
app.mount('#app');
