import Signup from './components/Signup.vue';
import Login from './components/Login.vue'
import Articles from "./components/Articles.vue";
import PostArticle from "./components/PostArticle.vue";
import ArticleDetail from "./components/ArticleDetail.vue";
import NotFound from "./components/NotFound.vue";

export const routes = [
    { path: '/', component: Articles, meta: { public: true } },
    { path: '/signup', component: Signup },
    { path: '/login', component: Login, meta: { public: true } },
    { path: '/articles', component: Articles, meta: { public: true } },
    { path: '/articles/:id(\\d+)', component: ArticleDetail, meta: { public: true } },
    { path: '/new-article', component: PostArticle, meta: { requiresAuth: true } },
    { path: "/:pathMatch(.*)*", component: NotFound }
]