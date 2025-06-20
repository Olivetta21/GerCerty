<template>
    <div id="toastcontainer">
        <transition-group name="slide" tag="div">
            <div v-for="(toast, index) in toasts" :key="toast.id" @click="removeToast(index)" :class="['toast', toast.type]">
                <div class="textToast title"> {{ toast.title }} </div>
                <div class="textToast message"> {{ toast.message }} </div>
            </div>
        </transition-group>
    </div>
</template>

<script>
import { getToasts, removeToast } from '../frontend/scripts/toastNotification';

export default {
	data() {
		return {
            toasts: getToasts()
		};
	},
    methods: {
        removeToast: removeToast
    }
}
</script>