<template>
    <ToastNotification/>
    <RouterView/>
</template>

<script>
import ToastNotification from './components/ToastNotification.vue';

export default {
    components: {
        ToastNotification
    }
};
</script>

<style>
@import '../src/frontend/styles/default.css';  /* mainpage */
</style>