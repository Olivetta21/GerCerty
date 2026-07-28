<?php

include "../funcs.php";
$credentials = validUserAndGetDB();
$pdo = $credentials['pdo'];

$user_permissions = getUserPermissions($credentials);
verifPerm(18, $user_permissions);

if (isset($_POST['cert_codi']) && isset($_POST['responsavel'])) {;
    $cert_codi = json_decode($_POST['cert_codi'], true);
    $responsavel = json_decode($_POST['responsavel'], true);

    $sql = "update certificado set responsavel = :responsavel where codi = :cert_codi;";

    try {
        $pdo->beginTransaction();
        $stmt = $pdo->prepare($sql);        
        $stmt->bindParam(':cert_codi', $cert_codi, PDO::PARAM_INT);
        $stmt->bindParam(':responsavel', $responsavel, PDO::PARAM_STR);
        $stmt->execute();

        if ($stmt->rowCount() === 1){
            addAtualizacao("C2", $cert_codi, $credentials);
            $pdo->commit();
			echo correctJson2(["success" => true]);
            exit;
        }
        
        $pdo->rollBack();
        echo correctJson("nenhum", "nao foi modificado o numero correto de certificado");
        exit;
    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        echo correctJson("error", "erro ao modificar o responsavel do certificado" . $e->getMessage());
        exit;
    }

} else {
    echo correctJson("error", "nenhum certificado foi fornecido");
    exit;
}
      

echo correctJson("error", "endline");
exit;
?>
