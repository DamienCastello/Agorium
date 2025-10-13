import Signup from './components/Signup.vue';
import Login from './components/Login.vue'
import Articles from "./components/Articles.vue";
import Validations from "./components/Validations.vue";
import Validate from "./components/Validate.vue";
import ArticlePost from "./components/ArticlePost.vue";
import ArticleDetail from "./components/ArticleDetail.vue";
import ArticleUpdate from "./components/ArticleUpdate.vue";
import Report from './components/Report.vue';
import Profile from './components/Profile.vue';
import Informations from './components/Informations.vue';
import NotFound from "./components/NotFound.vue";
import Roadmap from './components/Roadmap.vue';
import AboutUs from './components/AboutUs.vue';
import GeneralTherms from './components/GeneralTherms.vue';
import VerifyEmail from './components/VerifyEmail.vue';
import ResetPassword from './components/ResetPassword.vue';
import ForgotPassword from './components/ForgotPassword.vue';

export const routes = [
    { path: '/', name: 'Home', component: Articles, meta: { public: true } },
    {
        path: '/:entity/:articleId/report',
        name: 'ReportArticle',
        component: Report,
        props: true,
        meta: { public: true },
    },
    {
        path: '/:entity/:commentId(\\d+)/report',
        name: 'ReportComment',
        component: Report,
        props: true,
        meta: { public: true },
    },
    { path: '/signup', name: 'Signup', component: Signup },
    { path: '/login', name: 'Login', component: Login, meta: { public: true } },
    { path: '/articles', name: 'Articles', component: Articles, meta: { public: true } },
    {
        path: '/articles/private/:privateLink',
        name: 'ArticlePrivate',
        component: ArticleDetail
    },
    { path: '/validations', name: 'Validations', component: Validations, meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/articles/:id(\\d+)', name: 'ArticleDetail', component: ArticleDetail, meta: { public: true } },
    { path: '/articles/edit/:id(\\d+)', name: 'ArticleUpdate', component: ArticleUpdate, meta: { requiresAuth: true } },
    { path: '/articles/private/edit/:privateLink(\\d+)', name: 'ArticlePrivateUpdate', component: ArticleUpdate, meta: { requiresAuth: true } },
    { path: '/validations/:id(\\d+)', name: 'Validate', component: Validate, meta: { requiresAuth: true, requiresAdmin: true } },
    {
        path: '/validations/private/:privateLink',
        name: 'ValidatePrivate',
        component: Validate,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    { path: '/new-article', name: 'ArticlePost', component: ArticlePost, meta: { requiresAuth: true } },
    { path: '/profile/:pseudo', name: 'Profile', component: Profile },
    { path: '/profile/:pseudo/informations', name: 'Informations', component: Informations },
    { path: '/roadmap', name: 'Roadmap', component: Roadmap, meta: { public: true } },
    { path: '/about-us', name: 'AboutUs', component: AboutUs, meta: { public: true } },
    { path: '/general-therms-service', name: 'GeneralTherms', component: GeneralTherms, meta: { public: true } },
    { path: '/verify-email', name: 'VerifyEmail', component: VerifyEmail, meta: { public: true } },
    { path: '/reset-password', name: 'ResetPassword', component: ResetPassword, meta: { public: true } },
    { path: '/forgot-password', name: 'ForgotPassword', component: ForgotPassword, meta: { public: true } },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
];