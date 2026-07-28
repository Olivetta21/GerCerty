<?php

include "../funcs.php";
$credentials = validUserAndGetDB();
$pdo = $credentials['pdo'];

if (isset($_POST['cert_codi'])) {;
    $cert_codi = json_decode($_POST['cert_codi'], true);


    try {
        $pdo->beginTransaction();


        $sql = "select fn_insert_cronograma(:cert_codi, :usuario_login, (select versao from certificado where codi = :cert_codi), 'DVLV', '');";
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':cert_codi', $cert_codi, PDO::PARAM_STR);
        $stmt->bindParam(':usuario_login', $credentials['usuario'], PDO::PARAM_STR);
        
        $stmt->execute();

        if ($stmt->rowCount() != 1) {
            $pdo->rollback();
		    echo correctJson2(["error" => "não inseriu corretamente"]);
            exit;
        }


        $sql = "update certificado set emusopor = null where codi = :cert_codi and emusopor = :usuario_login returning local;";
        $stmt = $pdo->prepare($sql);        
        $stmt->bindParam(':cert_codi', $cert_codi, PDO::PARAM_INT);
        $stmt->bindParam(':usuario_login', $credentials['usuario'], PDO::PARAM_STR);
        $stmt->execute();

        if ($stmt->rowCount() === 1){
            addAtualizacao("C2", $cert_codi, $credentials);

            $local = $stmt->fetch(PDO::FETCH_ASSOC)['local'];

            $pdo->commit();
			echo correctJson2(["success" => true, "local" => $local]);
            exit;
        }
        
        $pdo->rollBack();
        echo correctJson("nenhum", "nao foi cancelado o numero correto de certificado");
        exit;
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        echo correctJson("error", "erro ao cancelar uso dos certificado" . $e->getMessage());
        exit;
    }

} else {
    echo correctJson("error", "nenhum certificado foi fornecido");
    exit;
}
      

echo correctJson("error", "endline");
exit;
?>
