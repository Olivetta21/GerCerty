<?php	    
    //# DOTENV CONFIG
    define("ENVDIR",__DIR__);
    require ENVDIR . '/vendor/autoload.php';        
    Dotenv\Dotenv::createImmutable(ENVDIR)->load();
    //DOTENV CONFIG #

    define("DEVELOPMENT_ENV",$_ENV['DEVELOPMENT_ENV'] === 'true');

    if (DEVELOPMENT_ENV) {
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods:POST");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
    } else {
        header("Access-Control-Allow-Origin: https://certificados.olivetta.com.br");
        header("Access-Control-Allow-Methods:POST");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
    }


    function getClientIp() {
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            // IP de um proxy compartilhado
            return $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            // IP passado por um proxy
            return explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0];
        } else {
            // IP direto
            return $_SERVER['REMOTE_ADDR'];
        }
    }

    
    function enviarEmail($data, $async) {
        if (!$data['destinatario'] || !$data['mensagem'] || !$data['assunto']) {
            return ["resp"=>3,"msg"=>"incorrect mail parameters"];
        }

        $jsonData = json_encode($data);

        $arqName = ".email_data_".bin2hex(random_bytes(32)).".json";
        file_put_contents($arqName, $jsonData); // Salva os dados em um arquivo

        $command = "powershell -Command Start-Process php -ArgumentList 'Z:\\SITE\\EnvioEmails\\testeEnviarEmail.php ".$arqName."' ";
        if ($async) $command = $command . "-WindowStyle Hidden";
        else $command = $command . "-NoNewWindow";

        $resp_exec = exec($command);
        $resp_decoded = json_decode($resp_exec, true);

        if(json_last_error() !== JSON_ERROR_NONE) return ["resp"=>500,"msg"=>$resp_exec];

        if ($async) return ["resp"=>99,"msg"=>"no return on async"];
        else return $resp_decoded;
    }
	

    function correctJson($type, $str) {
        // Remove todos os caracteres que não sejam letras, números ou espaços
        //$sanitizedStr = preg_replace("/[^a-zA-Z0-9 ]/", "?", $str);
        return json_encode(["$type" => mb_convert_encoding($str, 'UTF-8', 'auto')]);
    }
	
	function correctJson2($data) {
		$result = [];
		
		// Verifica se os dados são um array
		if (is_array($data)) {
			foreach ($data as $key => $value) {
				$result[$key] = mb_convert_encoding($value, 'UTF-8', 'auto');
			}
		}

		return json_encode($result);
	}

    function getDataBase() {
        
        $host = $_ENV['DB_HOST'];
        $dbname = $_ENV['DB_DATABASE'];
        $user = $_ENV['DB_USERNAME'];
        $pass = $_ENV['DB_PASSWORD'];

        try {
            $pdo = new PDO("pgsql:host=$host;dbname=$dbname", $user, $pass);
            if ($pdo) return $pdo;
        } catch (Exception) {

        }

        echo correctJson("error", "erro na conexão do banco de dados");
        exit;
    }
    
    function resetAccessToken() {
        setcookie(
            "access_token",
            "", time()-9999, "/"
        );
    }

    function errorMessage($error_title, $error_message) {
        $message = '' . $error_title . '' . (DEVELOPMENT_ENV ?  ':' . $error_message . '': '');
        return $message;
    }

    
    function getRandomHex($length = 256){
        $length = $length / 2;
        return bin2hex(random_bytes($length));
    }

    function returnJson($data, $type = null) {
		$result = [];
        if (is_array($data) && count($data) > 0) {
            $type = $type ?: array_keys($data)[0];
			foreach ($data as $key => $value) {
				$result[$key] = mb_convert_encoding($value, 'UTF-8', 'auto');
			}
		} else {
            $type = 'in_error';
            $result = 'internal_error';
        }
        
        $responses = [
            'success' => 200,
            'error' => 400,
            'warn' => 409,
            'in_error' => 500,
        ];
        http_response_code($responses[$type] ?? 200);
		echo json_encode($result);
        exit;
	}

    function validUserAndGetDB(){   //Se o usuario for inválido, o fetch fecha aqui mesmo.
        if (isset($_POST['user_and_apikey'])) {
            $user_and_apikey = json_decode($_POST['user_and_apikey'], true);

            $sql = "SELECT * from getUsuarioByToken(:access_token)";

            try {
                $pdo = getDataBase();
                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    "access_token"=> $user_and_apikey[1]
                ]);

                if ($stmt->rowCount() === 1) {
                    $retornar = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    return ["pdo"=>$pdo, "usuario"=>$user_and_apikey[0]];
                } else {
                    echo correctJson("invalid_token",true);
                    exit;
                }
            } catch (Exception) {
                
            }
        }

        //qualquer coisa errada cai aqui.
        usleep(rand(1000, 10000) * 1000);
        http_response_code(500);
        exit;
    }

    function getUserPermissions($credentials){
        $pdo = $credentials['pdo'];
        $login = $credentials['usuario'];

        try {
            $sql = "
                select p.perm
                    from permissoes p
                    join grupo_usuario gu on gu.id = p.grupo_id
                    join usuario u on u.login = gu.usuario_login
                    where u.login = :login
                
                union all
                
                select perm
                    from permissoes
                    where usuario_login = :login
            ";

            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(":login", $login, PDO::PARAM_INT);
            $stmt->execute();

            $res = $stmt->fetchAll(PDO::FETCH_COLUMN);

            if ($res) {
                return $res;
            }
        } catch (PDOException $e) {
            echo correctJson("error", $e->getMessage());
            exit;
        }

        return [];
    }

    function verifPerm($perm, $arr){
        if (!in_array($perm, $arr)){ 
            echo correctJson("nopermission", $perm);
            exit;  
        }       
    }


    function addAtualizacao($header, $body, $credentials){
        $pdo = $credentials['pdo'];
        $login = $credentials['usuario'];

        $sql = "
            insert into atualizacoes (usuario, header, body) values (:u, :h, :b);
        ";

        try {
            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(":u", $login, PDO::PARAM_STR);
            $stmt->bindParam(":h", $header, PDO::PARAM_STR);
            $stmt->bindParam(":b", $body, PDO::PARAM_STR);
            $stmt->execute();
        } catch (PDOException){
        }
    }

    function auditar($credentials, $acao, $info) {
        $pdo = $credentials['pdo'];
        $login = $credentials['usuario'];
        $ip = getClientIp();
        try {
            $sql = "
                insert into auditoria (usuario_login, acao, info, ip) values (:u, :a, :i, :ip);
            ";

            $stmt = $pdo->prepare($sql);
            $stmt->bindParam(":u", $login, PDO::PARAM_STR);
            $stmt->bindParam(":a", $acao, PDO::PARAM_STR);
            $stmt->bindParam(":i", $info, PDO::PARAM_STR);
            $stmt->bindParam(":ip", $ip, PDO::PARAM_STR);
            $stmt->execute();
        } catch (PDOException){
        }
    }

    function removerAcentos($str) {
        return strtr($str, [
            'á'=>'a','à'=>'a','ã'=>'a','â'=>'a','ä'=>'a',
            'é'=>'e','è'=>'e','ê'=>'e','ë'=>'e',
            'í'=>'i','ì'=>'i','î'=>'i','ï'=>'i',
            'ó'=>'o','ò'=>'o','õ'=>'o','ô'=>'o','ö'=>'o',
            'ú'=>'u','ù'=>'u','û'=>'u','ü'=>'u',
            'ç'=>'c',
            'Á'=>'A','À'=>'A','Ã'=>'A','Â'=>'A','Ä'=>'A',
            'É'=>'E','È'=>'E','Ê'=>'E','Ë'=>'E',
            'Í'=>'I','Ì'=>'I','Î'=>'I','Ï'=>'I',
            'Ó'=>'O','Ò'=>'O','Õ'=>'O','Ô'=>'O','Ö'=>'O',
            'Ú'=>'U','Ù'=>'U','Û'=>'U','Ü'=>'U',
            'Ç'=>'C'
        ]);
    }

    function removerEspacos($texto) {
        return str_replace(' ', '', $texto);
    }

?>