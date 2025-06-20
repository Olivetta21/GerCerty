<?php

include "../funcs.php";
$credentials = validUserAndGetDB();
$pdo = $credentials['pdo'];
$user_permissions = getUserPermissions($credentials);


$params = '';
$params = $params . (isset($_POST['cert_codi']) ? '1' : '0');
$params = $params . (isset($_POST['cert_versao']) ? '1' : '0');
$params = $params . (isset($_POST['type']) ? '1' : '0');
$params = $params . (isset($_POST['nota']) ? '1' : '0');


if ($params === '1111') {
    $usuario_login = $credentials['usuario'];
    $cert_codi = json_decode($_POST['cert_codi'], true);
    $cert_versao = json_decode($_POST['cert_versao'], true);
    $type = json_decode($_POST['type'], true);
    $nota = json_decode($_POST['nota'], true);

    switch ($type) {
        case 'REVL':{
            verifPerm(8, $user_permissions);
            break;
        }
        case 'AGND':{
            verifPerm(6, $user_permissions);
            break;
        }
        case 'NOTF':{
            verifPerm(7, $user_permissions);
            break;
        }
    }

    $sql_actVers = "select versao from certificado where codi = :cert_codi and versao = :cert_versao";

    try {
        $stmt_av = $pdo->prepare($sql_actVers);
        $stmt_av->bindParam(':cert_codi', $cert_codi, PDO::PARAM_INT);
        $stmt_av->bindParam(':cert_versao', $cert_versao, PDO::PARAM_INT);
        $stmt_av->execute();

        if ($stmt_av->rowCount() < 1) {
            echo correctJson("error", "Essa não é a versão atual!");
            exit;
        }
        
        $sql = "insert into cronograma (cert_codi, cert_versao, type, usuario_login, nota) values (
            :cert_codi, 
            :cert_versao,
            :type,
            :usuario_login,
            :nota
        );";

        $stmt = $pdo->prepare($sql);
        $stmt->bindParam(':cert_codi', $cert_codi, PDO::PARAM_STR);
        $stmt->bindParam(':usuario_login', $usuario_login, PDO::PARAM_STR);
        $stmt->bindParam(':cert_versao', $cert_versao, PDO::PARAM_INT);
        $stmt->bindParam(':type', $type, PDO::PARAM_STR);
        $stmt->bindParam(':nota', $nota, PDO::PARAM_STR);
        
        $stmt->execute();

        if ($stmt->rowCount() > 0) {
            addAtualizacao("C2", $cert_codi, $credentials);
			
			if ($type != 'REVL') {//Envio do email
				$data = [
					"destinatario" => "arquivo@orteco.com.br",
					"assunto" => "Cronograma Certificados Olivetta",
					"mensagem" => "<p style='color: blue;'> O usuario " . $usuario_login . " inseriu o cronograma: " . $type . "</p>
									<p style='color: gray;'>".
                                        "Nota: " . $nota ."<br>".
                                        "Certificado: " . $cert_codi ."<br>".
                                        "Versão: " . $cert_versao .
                                    "</p>"
				];
				enviarEmail($data, true);
			}

            echo correctJson2(["success" => true]);
            exit;
        }

        echo correctJson("error", "nenhum cronograma adicionado");
        exit;

    } catch (PDOException $e) {   
        echo correctJson("error", "erro ao inserir Cronograma" . $e->getMessage());
        exit;
    }
} 
else {
    echo correctJson("error", "sem parametros $params");
    exit;
}
      

echo correctJson("error", "nao foi possivel se conectar ao banco");
exit;

?>
