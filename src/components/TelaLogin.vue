<template>
    <div id="logincontainer">
        <form @submit.prevent id="loginform">
            <p> Login </p>
            <input v-model="login_Login" name="login" placeholder="digite seu login" required>
            <input v-model="login_PassWd" name="senha" type="password" placeholder="digite sua senha" required>
            <button v-if="!login_LoaVer" @click="Login.verifLogin()"> entrar </button>
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
                login_Login: Login.login_,
                login_PassWd: Login.password_,
                login_LoaVer: Login.loadingVerificando_
            }
        }
    }
</script>

<style>
@import '../../src/frontend/styles/login.css';  /* loginpage */
</style>