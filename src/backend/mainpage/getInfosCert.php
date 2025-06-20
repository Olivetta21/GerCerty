<?php

include "../funcs.php";
$credentials = validUserAndGetDB();
$pdo = $credentials['pdo'];


if (isset($_POST['cert_codis'])){
    $cert_codis = json_decode($_POST['cert_codis'], true);

    $codis_placeholder = implode(',',array_fill(0, count($cert_codis), '?'));

    $sql = "
    select c.codi, v.revl, i.notf, i.agnd, i.prbl
    from certificado c
    left join (
        SELECT 
            cert_codi, cert_versao,
            bool_or(type = 'AGND') AS agnd,
            bool_or(type = 'NOTF') AS notf,
            count (*) FILTER (where type = 'PRBL') AS prbl
        FROM 
            cronograma
        group by cert_codi, cert_versao
    ) as i on i.cert_codi = c.codi and i.cert_versao = c.versao
    left join (
        SELECT 
            cert_codi, count(*) as revl
        FROM 
            cronograma
        WHERE type = 'REVL'
        group by cert_codi
    ) as v on v.cert_codi = c.codi
    where c.codi in ($codis_placeholder);
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