<?php

include "../funcs.php";
$credentials = validUserAndGetDB();
$pdo = $credentials['pdo'];
$user_permissions = getUserPermissions($credentials);

if (isset($_POST['tipo']) && isset($_POST['data'])){
    $tipo = json_decode($_POST['tipo'], true);
    $data = json_decode($_POST['data'], true);

    $sql = "s";
    $func = null;


    switch ($tipo) {
        case 'AgBeFi': 
        case 'PaFeBe': verifPerm(5, $user_permissions); break;
        case 'CrMaEx': 
        case 'CeMaUs': 
        case 'MaLuBe': verifPerm(4, $user_permissions); break;
    }


    switch ($tipo){
        case 'AgBeFi':{
            $login = $credentials['usuario'];;

            $pagto_id_filter = (isset($_POST['pagto_id'])) ? "and p.id = :pagto_id" : '';

            $sql = "
                select ce.nome cert,
                    cr.cert_versao versao,
                    date(cr.data) data,
                    case when v.id is not null then round(v.valor - v.despesa, 2) else null end venda,
                    case when v.id is not null then round((v.valor - v.despesa) * v.bene_comiss, 2) else null end lucro,
                    p.id as pago
                    from certificado ce
                    join cronograma cr on cr.cert_codi = ce.codi
                    left join venda v on v.cert_codi = ce.codi and v.cert_versao = cr.cert_versao
                    left join pagamento p on p.venda_id = v.id and p.isvendedor = false
                    where cr.type = 'AGND'
                    and cr.usuario_login = :login
                    and date(cr.data) between :datain and :datafi
                    $pagto_id_filter
                    order by ce.codi;
            ";

            try {
                $stmt = $pdo->prepare($sql);
                $stmt->bindParam(':login', $login, PDO::PARAM_STR);
                $stmt->bindParam(':datain', $data[0], PDO::PARAM_STR);
                $stmt->bindParam(':datafi', $data[1], PDO::PARAM_STR);
                if ($pagto_id_filter) {
					$id_pagto = json_decode($_POST['pagto_id'], true);
					$stmt->bindParam(':pagto_id', $id_pagto, PDO::PARAM_INT);
                }
				$stmt->execute();

                $res = $stmt->fetchAll(PDO::FETCH_ASSOC);

                if ($res) {
                    echo correctJson("relatorio", $res);
                    exit;
                }
                else {
                    echo correctJson("warn", "nenhum AgBeFi retornado");
                    exit;
                }
            } catch (PDOException $e){
                echo correctJson("error", $e->getMessage());
                exit;
            }

            echo correctJson("error", "parametro login nao definido");
            exit;
            break;
        }
        case 'PaFeBe':{
            $login = $credentials['usuario'];;

            $sql = "
                select pp.id, date(pp.data) as data, round(sum((v.valor - v.despesa) * v.bene_comiss),2) as valor
                    from venda v
                    join pagamento p on p.venda_id = v.id and p.isvendedor = false
                    join pagamento_info pp on pp.id = p.id
                    join cronograma cr on cr.id = v.cron_agnd
                    join usuario u on u.login = cr.usuario_login
                    where u.login = :login
                    and date(pp.data) between :datain and :datafi
                    group by pp.id
            ";

            try {
                $stmt = $pdo->prepare($sql);
                $stmt->bindParam(':login', $login, PDO::PARAM_STR);
                $stmt->bindParam(':datain', $data[0], PDO::PARAM_STR);
                $stmt->bindParam(':datafi', $data[1], PDO::PARAM_STR);
                $stmt->execute();

                $res = $stmt->fetchAll(PDO::FETCH_ASSOC);

                if ($res) {
                    echo correctJson("relatorio", $res);
                    exit;
                }
                else {
                    echo correctJson("warn", "nenhum PaFeBe retornado");
                    exit;
                }
            } catch (PDOException $e){
                echo correctJson("error", $e->getMessage());
                exit;
            }

            echo correctJson("error", "parametro login nao definido");
            exit;
            break;
        }
        case 'CrMaEx': {
            $sql = "
                select nome, notf, agnd, prbl, revl from
                (
                    select u.nome,
                    sum(case when c.type = 'NOTF' then 1 else 0 end) as notf,
                    sum(case when c.type = 'AGND' then 1 else 0 end) as agnd,
                    sum(case when c.type = 'PRBL' then 1 else 0 end) as prbl,
                    sum(case when c.type = 'REVL' then 1 else 0 end) as revl
                    from usuario u
                    join cronograma c on c.usuario_login = u.login
                    group by u.login
                )
                order by (notf + agnd + prbl + revl) desc
                limit 10;                
            ";

            $func = function($res) {
                $usuario = [];
                $notf = [];
                $agnd = [];
                $prbl = [];
                $revl = [];
            
                foreach ($res as $r){
                    $usuario[] = $r['nome'];
                    $notf[] = $r['notf'];
                    $agnd[] = $r['agnd'];
                    $prbl[] = $r['prbl'];
                    $revl[] = $r['revl'];
                }
                        
                return ["usuario"=>$usuario, "notf"=>$notf, "agnd"=>$agnd, "prbl"=>$prbl, "revl"=>$revl];
            };

            break;
        }
        case 'CeMaUs': {
            $sql = "
                select c.nome as cert,
                count(cron.*) as usos
                from certificado c
                join cronograma cron on cron.cert_codi = c.codi
                where cron.type = 'REVL'
                group by c.nome
                order by count(cron.*) desc, c.nome
                limit 20;
            ";

            $func = function($res) {
                $certs = [];
                $usos = [];

                foreach($res as $r){
                    $certs[] = $r['cert'];
                    $usos[] = $r['usos'];
                }

                return ["certificado"=>$certs, "usos"=>$usos];
            };
            
            break;
        }
        case 'MaLuBe':{
            $sql = "
            select usuario, lucro, pend from (
                select u.nome as usuario,
                sum(case when p.id is not null then (v.valor - v.despesa) * v.bene_comiss else 0 end) as lucro,
                sum(case when p.id is null then (v.valor - v.despesa) * v.bene_comiss else 0 end) as pend
                from usuario u
                join cronograma cr on cr.usuario_login = u.login
                join venda v on v.cron_agnd = cr.id
                left join pagamento p on p.venda_id = v.id and p.isvendedor = false
                group by u.login
                order by u.login
            )
                order by (lucro + pend) desc
                limit 10;

            ";

            
            $func = function($res) {
                $usuarios = [];
                $lucros = [];
                $pends = [];

                foreach($res as $r){
                    $usuarios[] = $r['usuario'];
                    $lucros[] = $r['lucro'];
                    $pends[] = $r['pend'];
                }

                return ["usuarios"=>$usuarios, "lucros"=>$lucros, "pends"=>$pends];
            };
            
            break;
        }
        default: {
            echo correctJson("error", "tipo $tipo nao reconhecido");
            exit;
        }
    }

    try{
        $stmt = $pdo->query($sql);
        $res = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        if ($res) {
            echo correctJson("relatorio", $func($res));
            exit;
        }
        else {
            echo correctJson("nenhum", "nenhum dado");
            exit;
        }

        
    } catch(PDOException $e) {
        echo correctJson("error", $e->getMessage());
        exit;
    }
}


echo correctJson("error", "nenhum parametro em head fornecido!");
exit;
?>