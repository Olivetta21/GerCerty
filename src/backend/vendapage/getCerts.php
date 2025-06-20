<?php
include "../funcs.php";
$credentials = validUserAndGetDB();
$pdo = $credentials['pdo'];

$pesq = null;
if (isset($_POST['TIPO'])) {
    $pesq = json_decode($_POST['TIPO'], true);
}
else {
    correctJson("error", "TIPO nao presente!");
    exit;
}
  
if ($pesq['head'] === 'AGND') {
    $sql = "
        select c.codi, c.nome, c.vencimento, c.versao, c.local, crono.id as cron_agnd_id, u.nome as nomebene, u.bene_comiss, crono.nota from certificado c
            join cronograma crono on crono.cert_codi = c.codi and crono.cert_versao = c.versao and crono.type = 'AGND'
            join usuario u on u.login = crono.usuario_login;
    ";

    try {
        $stmt = $pdo->query($sql);
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($result){
            echo correctJson("success", $result);
            exit;
        }
        else {
            echo correctJson("warn", "nenhum");
            exit;
        }
    } catch (PDOException $e){
        echo correctJson("error", "agnd" . $e->getMessage());
        exit;
    }
}
else if ($pesq['head'] === 'NOTF') {
    $sql = "
        select c.codi, c.nome, c.vencimento, c.versao, c.local, cronoagnd.id as cron_agnd_id, u.nome as nomebene, u.bene_comiss, cronoagnd.nota from certificado c
        join cronograma crono on crono.cert_codi = c.codi and crono.cert_versao = c.versao and crono.type = 'NOTF'
        left join cronograma cronoagnd on cronoagnd.cert_codi = c.codi and cronoagnd.cert_versao = c.versao and cronoagnd.type = 'AGND'
        left join usuario u on u.login = cronoagnd.usuario_login;
    ";

    try {
        $stmt = $pdo->query($sql);
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($result){
            echo correctJson("success", $result);
            exit;
        }
        else {
            echo correctJson("warn", "nenhum");
            exit;
        }
    } catch (PDOException $e){
        echo correctJson("error", "notf" . $e->getMessage());
        exit;
    }
}
else if ($pesq['head'] === 'PESQ') {
    $sql = "
        select c.codi, c.nome, c.vencimento, c.versao, c.local, crono.id as cron_agnd_id, u.nome as nomebene, u.bene_comiss, crono.nota from certificado c
        left join cronograma crono on crono.cert_codi = c.codi and crono.cert_versao = c.versao and crono.type = 'AGND'
        left join usuario u on u.login = crono.usuario_login
        where upper(c.nome) like :nome;
    ";

    try {
        $stmt = $pdo->prepare($sql);
        $idkkk = strtoupper("%".$pesq['body']."%");
        $stmt->bindParam(':nome', $idkkk, PDO::PARAM_STR);
        $stmt->execute();
        $result = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($result){
            echo correctJson("success", $result);
            exit;
        }
        else {
            echo correctJson("warn", "nenhum");
            exit;
        }
    } catch (PDOException $e){
        echo correctJson2(["error"=> $e->getMessage()]);
        exit;
    }
}
else {
    echo correctJson("error", "head incorreto");
    exit;
}

echo correctJson("error", "fim de linha");
exit;
?>