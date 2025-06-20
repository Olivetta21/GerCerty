<?php

include "../funcs.php";
$credentials = validUserAndGetDB();
$pdo = $credentials['pdo'];

if (isset($_POST['cert_codi']) && isset($_POST['cert_versao']) && isset($_POST['direction'])) {
    $direction = json_decode($_POST['direction'], true);
    $cert_versao = json_decode($_POST['cert_versao'], true);
    $cert_codi = json_decode($_POST['cert_codi'], true);


    $sql = "";

    if ($direction) $sql = "select min(cert_versao) as new from cronograma where cert_codi = :cert_codi and cert_versao > :cert_versao;";
    else $sql = "select max(cert_versao) as new from cronograma where cert_codi = :cert_codi and cert_versao < :cert_versao;";


    try {
        $stmt = $pdo->prepare($sql);
        
        $stmt->bindParam(':cert_codi', $cert_codi, PDO::PARAM_INT);
        $stmt->bindParam(':cert_versao', $cert_versao, PDO::PARAM_INT);
        $stmt->execute();

        $res = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Retornar dados como JSON
        header('Content-Type: application/json');
        if ($res[0]['new']){		
			echo correctJson2(["sucess" => $res[0]['new']]);
            exit;
        }
        else {
            if ($direction) { //pega a versao atual do certificado, caso a mesma nao conter cronogramas ainda.
                $sql_act = "select versao from certificado where codi = :cert_codi;";
                $stmt_act = $pdo->prepare($sql_act);
                $stmt_act->bindParam(":cert_codi", $cert_codi, PDO::PARAM_INT);
                $stmt_act->execute();
                $res_act = $stmt_act->fetchAll(PDO::FETCH_COLUMN)[0];

                if ($res_act > $cert_versao){
                    echo correctJson2(["sucess" => $res_act]);
                    exit;
                }
            }

            echo correctJson("nenhum", "nenhum dado retornado");
            exit;
        }

    } catch (PDOException $e) {   
        echo correctJson("error", "erro ao recuperar cronogramas" . $e->getMessage());
        exit;
    }

} else {
    echo correctJson("error", "nenhum certificado foi fornecido");
    exit;
}
      

echo correctJson("error", "nao foi possivel se conectar ao banco");
exit;

?>
