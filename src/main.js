import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Login from './frontend/scripts/Janelas/login/Login'

const app = createApp(App)

app.config.globalProperties.$historicoNavegacao = []

router.beforeEach((to, from, next) => {
    if (from.matched.length > 0) from.meta.classe.saindo();
    to.meta.classe.entrando();

    if (to.meta.requiresAuth && !Login.USERLOGGED) {
        next('/');
    } else {
        next();
    }
})

app.use(router).mount('#app')