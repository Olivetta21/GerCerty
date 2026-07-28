import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Login from './frontend/scripts/Janelas/login/Login'

const app = createApp(App)

router.beforeEach(async (to, from) => {
    console.log('Rota atual:', to.path);
    console.log('Rota anterior:', from.path);
    const fromMeta = from.matched.at(-1)?.meta
    const toMeta = to.matched.at(-1)?.meta

    fromMeta?.classe?.before_leave?.()

    if (to.meta?.requiresAuth && !(await Login.isAuthenticated(to.name))) {
        Login.toGoIfFail = to.name
        return { name: 'login' }
    }

    toMeta?.classe?.before_enter?.()
})

router.afterEach((to, from) => {
    const fromMeta = from.matched.at(-1)?.meta
    const toMeta = to.matched.at(-1)?.meta

    fromMeta?.classe?.after_leave?.()
    toMeta?.classe?.after_enter?.()
})

app.use(router).mount('#app')