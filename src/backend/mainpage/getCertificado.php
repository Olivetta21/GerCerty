<?php
include "../funcs.php";


$credentials = validUserAndGetDB();
$pdo = $credentials['pdo'];


$sql_pattern = "
select c.codi as id, c.versao as versao, 'escondido' as local, c.empresa as empresa, rfb.nome as resprfb, v.revl as usos, upper(c.nome) as nome, c.vencimento as venc, i.notf as notf, i.agnd as agnd, i.prbl as prbl from certificado c
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
left join (
    select codi, nome from certificado
) rfb on rfb.codi = c.respRFB
";

if (isset($_POST['intervData'])) {
    $arr = json_decode($_POST['intervData'], true);
    $dataIN = $arr[0];
    $dataFI = $arr[1];

    //id: 0, usos: 0, nome: 'null', venc: '0000-00-00', notf: 0, agnd: 0, prbl: 0
    $sql = "
        $sql_pattern
        where c.vencimento between '$dataIN' and '$dataFI'
		order by c.vencimento;
    ";


    try {
        $stmt = $pdo->query($sql);

        $retornar = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Retornar dados como JSON
        header('Content-Type: application/json');
        if ($retornar){
			echo correctJson2(["certificados" => $retornar]);
            exit;
        }
        else {
            echo correctJson("warn", "nenhum dado retornado");
            exit;
        }

    } catch (PDOException $e) {   
        echo correctJson("error", "erro ao recuperar certificados" . $e->getMessage());
        exit;
    }

} 
else if (isset($_POST['cert_codis'])) {
    $certCodis = json_decode($_POST['cert_codis'], true);

    $placeHolderCertCodis = implode(',', array_fill(0, count($certCodis), '?'));

    //id: 0, usos: 0, nome: 'null', venc: '0000-00-00', notf: 0, agnd: 0, prbl: 0
    $sql = "
        $sql_pattern
        where c.codi in ($placeHolderCertCodis)
		order by c.codi;
    ";


    try {
        $stmt = $pdo->prepare($sql);
        
        $getCertOK = (count($certCodis) > 0) ? $stmt->execute($certCodis) : false;
        
        if ($getCertOK){
            $retornar = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            if ($retornar){		
                echo correctJson2(["certificados" => $retornar]);
                exit;
            }
        }
        
        echo correctJson("warn", "nenhum dado retornado");
        exit;

    } catch (PDOException $e) {   
        echo correctJson("error", "erro ao recuperar certificado" . $e->getMessage());
        exit;
    }
}
else if (isset($_POST['nome_cert'])) {
    $nome = json_decode($_POST['nome_cert'], true);

    $sql = "
        $sql_pattern
        where upper(c.nome) like :nome
        order by upper(c.nome)
    ";

    try {
        $upper_nome = strtoupper("%$nome%");
        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':nome', $upper_nome, PDO::PARAM_STR);
        $stmt->execute();
        $retornar = $stmt->fetchAll(PDO::FETCH_ASSOC);

        if ($retornar){	
            echo correctJson2(["certificados" => $retornar]);
            exit;
        }
        else {
            echo correctJson("warn", "nenhum dado retornado");
            exit;
        }
    } catch (PDOException $e) {   
        echo correctJson("error", "erro ao recuperar certificado" . $e->getMessage());
        exit;
    }
}
else {
    echo correctJson("error", "nenhum filtro pro certificado foi fornecido");
    exit;
}
      

echo correctJson("error", "nao foi possivel se conectaro ao banco");
exit;
?>
