<template>
    <div id="logincontainer" style="background-image: url('/api/imagens/login-wallpaper.jpeg');">
        <form @submit.prevent id="loginform">
            <p> Login </p>
            <input v-model="login_" name="login" placeholder="digite seu login" required>
            <input v-model="senha_" name="senha" type="password" placeholder="digite sua senha" required>
            <button v-if="!Login.loadingVerificando" @click="Login.fazerLogin(login_, senha_)"> entrar </button>
            <div v-else class="loading-indicator"> 
                <div class="spinner"> </div>    
            </div>
        </form>
    </div>
</template>

<script>
    import Login from '../frontend/scripts/Janelas/login/Login';

    export default {
        data() {
            return {
                Login,

                login_: "",
                senha_: "",
            }
        }
    }
</script>

<style>
@import '../../src/frontend/styles/login.css';  /* loginpage */
</style>