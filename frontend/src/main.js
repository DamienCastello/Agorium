import { createApp } from 'vue';
import App from './App.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { routes } from './routes';
import { useAuthStore } from './stores/auth';
import { createPinia } from 'pinia';
import Notifications from '@kyvg/vue3-notification';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import { createI18n } from "vue-i18n";
import messages from './i18n/translations';

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


const savedLanguage = localStorage.getItem('selectedLanguage') || 'fr';

const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: savedLanguage,
  fallbackLocale: 'fr',
  messages,
});

i18n.global.locale.value = savedLanguage;

const app = createApp(App);
app.use(router);
app.use(pinia);
app.use(ElementPlus);
app.use(Notifications);
app.use(i18n);
app.mount('#app');
