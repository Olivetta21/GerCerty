import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.config.globalProperties.$historicoNavegacao = []

router.afterEach((to, from) => {
  const historico = app.config.globalProperties.$historicoNavegacao
  historico.push({
    caminho: to.fullPath,
    nome: to.name,
    dataHora: new Date().toLocaleString()
  })

  console.log("de", from.fullPath)
})

app.use(router).mount('#app')