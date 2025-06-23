<?php

include "../funcs.php";
$credentials = validUserAndGetDB();
$pdo = $credentials['pdo'];

if (isset($_POST['cert_codi']) && isset($_POST['cert_versao']) && isset($_POST['direction'])) {
    $direction = json_decode($_POST['direction'], true);
    $cert_versao = json_decode($_POST['cert_versao'], true);
    $cert_codi = json_decode($_POST['cert_codi'], true);


    $sql = "SELECT newversao from fn_switch_between_cert_versao(:cert_codi, :cert_versao, :direction);";

    try {
        $stmt = $pdo->prepare($sql);        
        $stmt->bindParam(':cert_codi', $cert_codi, PDO::PARAM_INT);
        $stmt->bindParam(':cert_versao', $cert_versao, PDO::PARAM_INT);
        $stmt->bindParam(':direction', $direction, PDO::PARAM_BOOL);
        $stmt->execute();

        $res = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($res[0]['newversao']){		
			echo correctJson2(["sucess" => $res[0]['newversao']]);
            exit;
        }
        
        echo correctJson("nenhum", "nenhum dado retornado");
        exit;

    } catch (PDOException $e) {   
        echo correctJson("error", "erro ao recuperar cronogramas" . $e->getMessage());
        exit;
    }

} else {
    echo correctJson("error", "nenhum certificado foi fornecido");
    exit;
}
      

echo correctJson("error", "endline");
exit;
?>
