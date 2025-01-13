import Signup from './components/Signup.vue';
import Login from './components/Login.vue'
import Articles from "./components/Articles.vue";
import Validations from "./components/Validations.vue";
import Validate from "./components/Validate.vue";
import PostArticle from "./components/PostArticle.vue";
import ArticleDetail from "./components/ArticleDetail.vue";
import Report from './components/Report.vue';
import Profile from './components/Profile.vue';
import NotFound from "./components/NotFound.vue";

export const routes = [
    { path: '/', name: 'Home', component: Articles, meta: { public: true } },
    { path: '/articles/:id(\\d+)/report', name: 'ReportArticle', component: Report, meta: { public: true } },
    { path: '/signup', name: 'Signup', component: Signup },
    { path: '/login', name: 'Login', component: Login, meta: { public: true } },
    { path: '/articles', name: 'Articles', component: Articles, meta: { public: true } },
    { path: '/validations', name: 'Validations', component: Validations, meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/articles/:id(\\d+)', name: 'ArticleDetail', component: ArticleDetail, meta: { public: true } },
    { path: '/validations/:id(\\d+)', name: 'Validate', component: Validate, meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/new-article', name: 'PostArticle', component: PostArticle, meta: { requiresAuth: true } },
    { path: '/profile', component: Profile, meta: { requiresAuth: true } },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
];