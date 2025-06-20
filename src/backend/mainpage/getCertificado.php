<?php
include "../funcs.php";


$credentials = validUserAndGetDB();
$pdo = $credentials['pdo'];

try {
    $p_codi = null;
    $p_nome = null;
    $p_dataini = null;
    $p_datafim = null;

    if (isset($_POST['intervData'])) {
        $arr = json_decode($_POST['intervData'], true);
        $p_dataini = $arr[0];
        $p_datafim = $arr[1];
    } 
    else if (isset($_POST['cert_codis'])) {
        $certCodis = json_decode($_POST['cert_codis'], true);
        if (count($certCodis) > 0) {
            $p_codi = implode(',', $certCodis);
        } else {
            echo correctJson("warn", "nenhum dado retornado");
            exit;
        }
    }
    else if (isset($_POST['nome_cert'])) {
        $p_nome = json_decode($_POST['nome_cert'], true);
    }
    else {
        echo correctJson("error", "nenhum filtro pro certificado foi fornecido");
        exit;
    }

    $sql = "SELECT * FROM fn_get_certificado_filtered(:p_codi, :p_nome, :p_dataini, :p_datafim)";
    $stmt = $pdo->prepare($sql);
    $stmt->bindParam(':p_codi', $p_codi, PDO::PARAM_STR);
    $stmt->bindParam(':p_nome', $p_nome, PDO::PARAM_STR);
    $stmt->bindParam(':p_dataini', $p_dataini, PDO::PARAM_STR);
    $stmt->bindParam(':p_datafim', $p_datafim, PDO::PARAM_STR);
    $stmt->execute();
    
    $retornar = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if ($retornar && count($retornar) > 0) {
        echo correctJson2(["certificados" => $retornar]);
        exit;
    } else {
        echo correctJson("warn", "nenhum dado retornado");
        exit;
    }
} catch (PDOException $e) {   
    echo correctJson("error", "erro ao recuperar certificados: " . $e->getMessage());
    exit;
}

echo correctJson("error", "endline");
exit;
?>
