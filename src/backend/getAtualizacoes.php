<?php
include "funcs.php";
$credentials = validUserAndGetDB();
$pdo = $credentials['pdo'];


if (isset($_POST['lku'])) {
    $lku = json_decode($_POST['lku'], true);

    $sql = "
        SELECT id, usuario, header, body from atualizacoes where id > :lku;
    ";

    try {
        $counter = 0;
        while ($counter++ < 90) {
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(':lku', $lku, PDO::PARAM_INT);
            $stmt->execute();
            $retornar = $stmt->fetchAll(PDO::FETCH_ASSOC);
            if ($retornar){		
                echo correctJson2(["atualizacoes"=>$retornar]);
                exit;
            }
            usleep(1000000);
        }

        echo correctJson("warn", "nenhum dado retornado");
        exit;

    } catch (PDOException $e) {   
        echo correctJson("error", "erro ao recuperar atualizações" . $e->getMessage());
        exit;
    }

} else {
    echo correctJson("error", "o id da ultima atualização não foi fornecido");
    exit;
}
      

echo correctJson("error", "fim de linha");
exit;

?>
