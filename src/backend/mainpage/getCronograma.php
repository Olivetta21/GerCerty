<?php

include "../funcs.php";
$credentials = validUserAndGetDB();
$pdo = $credentials['pdo'];

if (isset($_POST['cert_codi']) && isset($_POST['cert_versao'])) {
    $cert_codi = json_decode($_POST['cert_codi'], true);
    $cert_versao = json_decode($_POST['cert_versao'], true);

    $sql_cronograma = "SELECT id, unome as user, ulogin, type, nota, data, cert_versao from vw_cronograma_completo
    WHERE cert_codi = :cert_codi AND cert_versao = :cert_versao ORDER BY id DESC;";

    try {
        $stmt_cronograma = $pdo->prepare($sql_cronograma);
        $stmt_cronograma->bindParam(":cert_codi", $cert_codi, PDO::PARAM_INT);
        $stmt_cronograma->bindParam(":cert_versao", $cert_versao, PDO::PARAM_INT);
        $stmt_cronograma->execute();
        $res_cronograma = $stmt_cronograma->fetchAll(PDO::FETCH_ASSOC);
        
        if ($res_cronograma){		
			echo correctJson2(["cronograma" => $res_cronograma]);
            exit;
        }

        
        echo correctJson("warn", "nenhum dado retornado");
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
