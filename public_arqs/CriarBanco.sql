CREATE TABLE usuario (
    login VARCHAR(32) PRIMARY KEY,
    nome VARCHAR(80) NOT NULL,
    senha VARCHAR(16) NOT NULL,
	bene_comiss NUMERIC(10,2) not null DEFAULT 0,
	vend_comiss NUMERIC(10,2) not null DEFAULT 0,
	token text
);


CREATE TABLE logins_usuario (
	id SERIAL PRIMARY key,
	usuario_login VARCHAR(32) not null REFERENCES usuario(login),
	ip VARCHAR(16) not null DEFAULT ' ',
	data TIMESTAMP not null DEFAULT now()
);

CREATE TABLE certificado (
    codi INTEGER PRIMARY KEY,
    nome VARCHAR(80) NOT NULL,
    vencimento DATE NOT NULL,
    local VARCHAR(16),
    
	empresa BOOLEAN DEFAULT FALSE,
    respRFB INTEGER REFERENCES certificado(codi) CHECK (respRFB IS NULL OR empresa = TRUE),
    
    versao INTEGER NOT NULL
);


CREATE TABLE cronograma (
    id SERIAL PRIMARY KEY,
    cert_codi INTEGER NOT NULL REFERENCES certificado(codi),
    cert_versao INTEGER NOT NULL,
    type VARCHAR(4) NOT NULL CHECK (type IN ('NOTF', 'AGND', 'REVL', 'PRBL')),
    usuario_login VARCHAR(32) NOT NULL REFERENCES usuario(login),
    nota VARCHAR(256),
    data TIMESTAMP DEFAULT NOW(),
); CREATE UNIQUE INDEX uni_agnd_p_ver ON cronograma (cert_codi, cert_versao, type) WHERE type = 'AGND';


CREATE TABLE atualizacoes (
    id SERIAL PRIMARY KEY,
    usuario varchar(32) not null REFERENCES usuario(login),
    header VARCHAR(4) NOT NULL,
    body VARCHAR(16) NOT NULL
);


CREATE TABLE venda (
    id SERIAL PRIMARY KEY,
	
    cron_agnd integer REFERENCES cronograma(id) DEFAULT null,
	bene_comiss NUMERIC(5, 2) default 0 CHECK (cron_agnd is not null or bene_comiss = 0),
	
    vend_login varchar(32) NOT NULL REFERENCES usuario(login),
    vend_comiss NUMERIC(5, 2) default 0,

    cert_codi integer NOT NULL REFERENCES certificado(codi),
	cert_versao integer NOT NULL,
    valor NUMERIC(10, 2) NOT NULl,
	despesa NUMERIC(10, 2) DEFAULT 0,
	data TIMESTAMP DEFAULT now(),
	
	unique (cert_codi, cert_versao)
);

create table pagamento_info (
	id serial primary key,
	usuario_login varchar(32) NOT NULL REFERENCES usuario(login),
	data timestamp default now()
);

create table pagamento (
	id integer not null references pagamento_info(id),
	venda_id integer not null references venda(id),
	isvendedor boolean not null,
	unique (venda_id, isvendedor),
	primary key (id, venda_id, isvendedor)
);


create table grupo_usuario_info (
	id serial not null primary key,
	nome varchar(32) not null unique
);

create table grupo_usuario (
	id integer not null references grupo_usuario_info(id),
	usuario_login varchar(32) not null references usuario(login),
	primary key (id, usuario_login)
);

create table tipos_permissao (
	id serial primary key,
	perm varchar(32) not null
);

create table permissoes (
	id serial primary key,
	perm int not null references tipos_permissao(id),
	usuario_login varchar(32) references usuario(login),
	grupo_id integer references grupo_usuario_info(id),
	unique (perm, usuario_login),
	unique (perm, grupo_id),
	constraint usuario_login_xor_grupo_id check (
		(usuario_login is not null and grupo_id is null) or
		(usuario_login is null and grupo_id is not null)
	)
);





-- VIEWS
CREATE VIEW vw_certificado_completo as (
    select c.codi as id, c.versao, 'escondido' as local, c.empresa, rfb.nome as resprfb, v.revl as usos, upper(c.nome) as nome, c.vencimento as venc, i.notf, i.agnd, i.prbl from certificado c
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
    ) as rfb on rfb.codi = c.respRFB
);

CREATE VIEW vw_cronograma_completo as (
    select cron.id, u.nome as unome, u.login as ulogin, cron.type, cron.nota,
    TO_CHAR(cron.data, 'DD/MM/YYYY HH24:MI') AS data, cron.cert_codi, cron.cert_versao
    from cronograma cron
    join usuario u on u.login = cron.usuario_login
);


-- FUNCTIONS

-- Verifica se o usuario existe, se sim, atualiza o token e insere o novo login no logins_usuario, retornando os dados do usuario o ultimo login e a ultima atualizacao do banco.
CREATE OR REPLACE FUNCTION fn_do_user_login(p_login varchar(32), p_senha varchar(16), ip varchar(16), new_token text)
RETURNS TABLE (login varchar(32), nome varchar(80), senha varchar(16), vend_comiss NUMERIC(10,2), last_login timestamp, token text, last_update integer) AS $$
DECLARE
    user_nome varchar(80);
    user_senha varchar(16);
    user_vend_comiss NUMERIC(10,2);
    last_login timestamp;
    last_update integer;
BEGIN
    -- Usuario
    SELECT u.nome, u.senha, u.vend_comiss INTO user_nome, user_senha, user_vend_comiss from usuario u
    WHERE u.login = p_login AND u.senha = p_senha;
    IF NOT FOUND THEN
        RETURN;
    END IF;

    -- Ultimo login
    SELECT data INTO last_login
    FROM logins_usuario
    WHERE usuario_login = p_login
    ORDER BY data DESC
    LIMIT 1;

    -- Atualiza o token
    UPDATE usuario
    SET token = new_token
    WHERE usuario.login = p_login;

    -- Insere o novo login no logins_usuario
    INSERT INTO logins_usuario (usuario_login, ip)
    VALUES (p_login, ip);

    -- Pega a ultima atualizacao do banco
    SELECT MAX(id) INTO last_update
    FROM atualizacoes;

    -- Retorna os dados do usuario e o ultimo login
    RETURN QUERY SELECT p_login, user_nome, user_senha, user_vend_comiss, last_login, new_token, last_update;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION fn_get_certificado_filtered(p_codi text, p_nome text, p_dataini date, p_datafim date)
RETURNS SETOF vw_certificado_completo
AS $$
DECLARE
    sql text := 'SELECT * FROM vw_certificado_completo WHERE true';
BEGIN
    -- Recebe uma string representando um array de codigos separados por ;
    IF p_codi IS NOT NULL AND p_codi <> '' THEN
        sql := sql || format(' AND id = ANY (string_to_array(%L, '','')::int[])',
                             replace(p_codi, ';', ','));
    END IF;

    IF p_nome IS NOT NULL THEN
        sql := sql || format(' AND nome ILIKE %L', '%'||p_nome||'%');
    END IF;

    IF p_dataini IS NOT NULL THEN
        sql := sql || format(' AND venc >= %L', p_dataini);
    END IF;

    IF p_datafim IS NOT NULL THEN
        sql := sql || format(' AND venc <= %L', p_datafim);
    END IF;

    RETURN QUERY EXECUTE sql;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION fn_switch_between_cert_versao(p_codi integer, p_versao integer, forward boolean)
RETURNS TABLE (newversao integer) as $$
DECLARE
    r_newversao integer;
BEGIN
    IF forward THEN
        SELECT min(cert_versao) INTO r_newversao FROM cronograma
        WHERE cert_codi = p_codi AND cert_versao > p_versao;
    ELSE
        SELECT max(cert_versao) INTO r_newversao FROM cronograma
        WHERE cert_codi = p_codi AND cert_versao < p_versao;
    END IF;

    IF NOT FOUND OR r_newversao IS NULL THEN
        -- Se não encontrou uma nova versão, retorna a versão atual do certificado
        IF forward THEN
            select versao INTO r_newversao FROM certificado
            WHERE codi = p_codi;
        ELSE -- Mas se estiver indo para trás, retorna a versao do parametro
            r_newversao := p_versao;
        END IF;
    END IF;

    RETURN QUERY SELECT r_newversao;
END;
$$ LANGUAGE plpgsql;



CREATE OR REPLACE FUNCTION fn_delete_cronograma(p_id integer)
RETURNS TABLE (id integer, cert_codi integer) AS $$
DECLARE
    r_cron_id integer;
    r_cert_codi integer;
BEGIN
    -- Certifica que esse cronograma pertence a versao atual do certificado
    SELECT cron.id, c.codi INTO r_cron_id, r_cert_codi FROM cronograma cron
    join certificado c on c.codi = cron.cert_codi and c.versao = cron.cert_versao
    WHERE cron.id = p_id;

    IF NOT FOUND OR r_cron_id IS NULL THEN
        RETURN;
    END IF;

    -- Deleta
    DELETE FROM cronograma WHERE cronograma.id = r_cron_id;

    IF FOUND THEN
        RETURN QUERY SELECT r_cron_id, r_cert_codi;
    END IF;

    RETURN;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION fn_insert_cronograma(p_cert_codi integer, p_user_login varchar(32),p_cert_versao integer,p_type varchar(4), p_nota varchar(256))
RETURNS SETOF cronograma AS $$
DECLARE
    newcronograma cronograma%ROWTYPE;
    isActVers boolean;
BEGIN
    -- Ver se o cronograma esta pra ser inserido na versao atual do certificado
    select true INTO isActVers from certificado where codi = p_cert_codi and versao = p_cert_versao;
    IF NOT FOUND OR NOT isActVers THEN
        RETURN;
    END IF;

    INSERT INTO cronograma (cert_codi, usuario_login, cert_versao, type, nota)
    VALUES (p_cert_codi, p_user_login, p_cert_versao, p_type, p_nota)
    RETURNING * INTO newcronograma;

    RETURN NEXT newcronograma;
END;
$$ LANGUAGE plpgsql;














--ADD


insert into usuario (login, nome, senha) values ('admin', 'administrador', '11111111');

insert into grupo_usuario_info (nome) values ('admins');
insert into grupo_usuario (id, usuario_login) values (1, 'admin');
insert into tipos_permissao (id, perm) values 
										(1,'Vender'),
										(2,'Pagar'),
										(3,'Ver Pagamento'),
										(4,'Ver Relatorio Geral'),
										(5,'Ver Relatorio Pessoal'),
										(6,'Agendar Cliente'),
										(7,'Notificar Cliente'),
										(8,'Ver Local Certificado'),
										(9,'Deletar Cronograma'),
										(10,'Modificar Usuarios'),
										(11,'Ver Permissoes de Usuario'),
										(12,'Configurar Sistema'),
										(13,'Gerenciar Certificado'),
										(14,'Ver Advertências');
insert into permissoes (grupo_id, perm) select 1, id from tipos_permissao where id not in (select id from permissoes where grupo_id = 1);




insert into certificado (codi, nome, vencimento, local, empresa, versao) values (8,'Certificado De Teste','2024-05-27','pg1',false,1);
