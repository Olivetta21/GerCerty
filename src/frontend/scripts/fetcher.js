import Login from "./Janelas/login/Login";
import { addToast } from "./toastNotification";

export async function fetchJson(endereco, arrayValores){
    //[{"h": "head", "b": "body"}]
    if (arrayValores && !Array.isArray(arrayValores)) {
        addToast("fetchJson", "o parametro: " + arrayValores + " não é um array!", "error");
        return [null];
    }

    try {
        const formData = new FormData();
        formData.append("user_and_apikey", JSON.stringify([Login.login, Login.token]));

        if (arrayValores != null && arrayValores.length > 0) {
            arrayValores.forEach(e => {
                formData.append(e.h, JSON.stringify(e.b));
            });
        }
        
        let prod = false;
        const dest_api = (prod) ? "https://api.olivetta.com.br/certificados/backend" : "http://gercert.serv";
        //const dest_api = "http://192.168.0.100";

        const response = await fetch(dest_api + endereco, {
            method: 'POST',
            body: formData
        });

        try {
            const result = await response.json();
            return result;
        }
        catch (error) {
            console.error("fetchjson-json", response);
        }
        
    } catch (error) {
        console.error("fetchjson", error);
    }

    return [null];
}