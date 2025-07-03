<?php	
	header("Access-Control-Allow-Origin: *");
	header("Access-Control-Allow-Methods:POST");
	header("Access-Control-Allow-Headers: Content-Type, Authorization");
    
    //# DOTENV CONFIG
    define("ENVDIR",__DIR__);
    require ENVDIR . '/vendor/autoload.php';        
    Dotenv\Dotenv::createImmutable(ENVDIR)->load();
    //DOTENV CONFIG #

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

    function genTK(){
        return bin2hex(random_bytes(32));
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

    function validUserAndGetDB(){   //Se o usuario for inválido, o fetch fecha aqui mesmo.
        if (isset($_POST['user_and_apikey'])) {
            $user_and_apikey = json_decode($_POST['user_and_apikey'], true);

            $sql = "
                SELECT token from usuario where login = :login;
            ";

            try {
                $pdo = getDataBase();
                $stmt = $pdo->prepare($sql);
                $stmt->bindParam(':login', $user_and_apikey[0], PDO::PARAM_STR);
                $stmt->execute();
                $retornar = $stmt->fetchAll(PDO::FETCH_ASSOC);

                
                if ($retornar) {
                    if ($user_and_apikey[1] === $retornar[0]['token']) return ["pdo"=>$pdo, "usuario"=>$user_and_apikey[0]]; 
                    else {
                        echo correctJson("invalid_token",true);
                        exit;
                    }
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

?>