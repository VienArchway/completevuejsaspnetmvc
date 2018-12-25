import Router from "vue-router";
import About from "./views/about/about.vue";
import Contact from "./views/contact/contact.vue";
import Home from "./views/home/home.vue";

Vue.use(Router);

export default new Router({
    mode: "history",
    routes: [
        {
            path: "/",
            name: "home",
            component: Home
        },
        {
            path: "/about",
            name: "about",
            component: About
        },
        {
            path: "/contact",
            name: "contact",
            component: Contact
        }
    ]
});