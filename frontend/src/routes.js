import Signup from './components/Signup.vue';
import Login from './components/Login.vue'
import Articles from "./components/Articles.vue";
import PostArticle from "./components/PostArticle.vue";
import SingleArticle from "./components/SingleArticle.vue";
import NotFound from "./components/NotFound.vue";

export const routes = [
    { path: '/signup', component: Signup },
    { path: '/login', component: Login, meta: { public: true } },
    { path: '/articles', component: Articles, meta: { public: true } },
    { path: '/new-article', component: PostArticle },
    { path: '/update-article/:id(\\d+)', component: SingleArticle },
    { path: "/:pathMatch(.*)*", component: NotFound}
]