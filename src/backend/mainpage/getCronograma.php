<?php

include "../funcs.php";
$credentials = validUserAndGetDB();
$pdo = $credentials['pdo'];

if (isset($_POST['cert_codi']) && isset($_POST['cert_versao'])) {
    $cert_codi = json_decode($_POST['cert_codi'], true);
    $cert_versao = json_decode($_POST['cert_versao'], true);

    $sql_cronograma = "
        select cron.id as id, u.nome as user, u.login as ulogin, cron.type as type, cron.nota as nota, TO_CHAR(cron.data, 'DD/MM/YYYY HH24:MI') as data, cron.cert_versao as cert_versao from cronograma cron
            join usuario u
                on u.login = cron.usuario_login
            where cron.cert_codi = $cert_codi and cron.cert_versao = $cert_versao
            order by cron.id desc;
    ";

    try {
        $stmt_cronograma = $pdo->query($sql_cronograma);
        $res_cronograma = $stmt_cronograma->fetchAll(PDO::FETCH_ASSOC);
        
        // Retornar dados como JSON
        header('Content-Type: application/json');
        if ($res_cronograma){		
			echo correctJson2(["cronograma" => $res_cronograma]);
            exit;
        }
        else {
            echo correctJson("warn", "nenhum dado retornado");
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
