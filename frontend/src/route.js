import Articles from "./components/Articles.vue";
import PostArticle from "./components/PostArticle.vue";
import SingleArticle from "./components/SingleArticle.vue";
import NotFound from "./components/NotFound.vue";

export const routes = [
    { path: '/articles', component: Articles },
    { path: '/new-article', component: PostArticle },
    { path: '/update-article/:id(\\d+)', component: SingleArticle },
    { path: "/:pathMatch(.*)*", component: NotFound}
]