import { fetchJson } from './fetcher';
import Main from './Janelas/main/Main';
import { tratarRetornosApi } from "./commonactions";
import MainModal from './Janelas/main/MainModal';
import Login from './Janelas/login/Login';

class pgUpdates {
    static lastKnowUpdateId = -1;
    static checkUpdtsH = -1;

    static async start(initLKU) {
        this.lastKnowUpdateId = initLKU;
        console.log("Starting LKU at", initLKU);
        
        const myId = ++this.checkUpdtsH;
        while (myId === this.checkUpdtsH) {
            await this.checkUpdates(myId);
        }
        console.log("updt stopped");
    }

    static stop(){
        console.log("stopping updt");
        this.checkUpdtsH++;
    }

    static async checkUpdates(myId) {

        const data = await fetchJson('/getAtualizacoes.php', [{"h":"lku","b":this.lastKnowUpdateId}]);

        if (myId !== this.checkUpdtsH) return;

        if (data['atualizacoes']){
            if (data['atualizacoes'].length > 0){
                const res1 = data['atualizacoes'];
                this.lastKnowUpdateId = res1[res1.length - 1].id;
                
                //CERT--------------//
                let group_C1 = [];  //
                let group_C2 = [];  //
                //#CERT-------------//

                // Iteração sobre cada atualização recebida
                res1.forEach(updtData => {
                    if (updtData.usuario !== Login.login){                    
                        switch (updtData.header) {
                        case "C1": {  //exemplo: { id: 1, header: "C1", body: -1602 }
                            group_C1.push(Number(updtData.body));
                            break;
                        }
                        case "C2": {  //exemplo: { id: 1, header: "C2", body: -1602 }
                            group_C2.push(Number(updtData.body));
                            break;
                        }
                        default:
                            console.error("Atualização desconhecida: ", updtData.header);
                        }
                    }
                });
                
                
                //CERT--------------------------------------------------------------
                if (group_C1.length > 0){
                    group_C1 = group_C1.filter(cod => Main.findCertIndex(cod) > -1);
                    //console.log("Certificados Atualizados:",group_C1);
                    Main.addNotification("Cert. Att: " + group_C1);
                    Main.atualizaCerts(group_C1);
                }
                if (group_C2.length > 0){
                    if (group_C1.length > 0) {
                        group_C2 = group_C2.filter(cod => !group_C1.includes(cod) && Main.findCertIndex(cod) > -1);
                    }
                    Main.addNotification("Info. Att: " + group_C2);
                    MainModal.attCronOnCert(group_C2);
                }
                //#CERT--------------------------------------------------------------
            }
            else {
                console.error("sem dados em getAtualizacao-success");
            }
        }
        else if (data['warn']){
            console.warn("ckupdt", data['warn']);
        }
        else tratarRetornosApi(data, "Buscando atualizacoes");

    }
    
}

export default pgUpdates;