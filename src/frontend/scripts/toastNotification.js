import { ref } from 'vue';

let toasts = ref([]); // Tornando o vetor reativo

export function getToasts(){
    return toasts;
}

export function addToast(title, message, type, _console){
    if (!title || !message || !type) {
        message = `parâmetro incorreto ao adicionar toast!\nValores recebidos:\n${title}\n${message}\n${type}`;
        title = "addToast";
        type = "error";
        _console = true;
    }
    const id = Date.now();
    
    toasts.value.unshift({id, title, message, type});

    if (_console){
        if (typeof console[type] === 'function') console[type](title, message);
        else {
            console.error("tipo de console nao reconhecido", type);
            console.log(title, message);
        }
    }

    setTimeout(() => {
        removeToastById(id);
    }, 8000);
}

export function removeToast(index) {
    // Remove a notificação quando o usuário clica
    toasts.value.splice(index, 1);
}

export function removeToastById(id){
    toasts.value = toasts.value.filter(toast => toast.id !== id);
}