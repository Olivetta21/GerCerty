<?php

include "../funcs.php";
$credentials = validUserAndGetDB();
$pdo = $credentials['pdo'];


if (isset($_POST['cert_codis'])){
    $cert_codis = json_decode($_POST['cert_codis'], true);

    $codis_placeholder = implode(',',array_fill(0, count($cert_codis), '?'));

    $sql = "
    select id as codi, usos as revl, notf, agnd, prbl
    from vw_certificado_cronograma
    where id in ($codis_placeholder);
    ";
    try {
        $stmt = $pdo->prepare($sql);
        $stmt->execute($cert_codis);
        $res = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($res){
            echo correctJson("infos", $res);
            exit;
        }
        else {
            echo correctJson("nenhum", "");
            exit;
        }
    } catch (PDOException $e){
        correctJson("error", $e->getMessage());
        exit;
    }
}

echo correctJson("error", "fim de linha");
exit;

?>