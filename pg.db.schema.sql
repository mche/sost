--
-- PostgreSQL database dump
--

-- Dumped from database version 9.6.3
-- Dumped by pg_dump version 9.6.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

SET search_path = public, pg_catalog;

--
-- Name: check_category(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION check_category() RETURNS trigger
    LANGUAGE plpgsql
    AS $$  

BEGIN 
  IF EXISTS (
    SELECT 1
    FROM (select r.title
      from refs rr
      join "категории" r on r.id=rr.id2-- childs
    WHERE rr.id1=NEW.id1 -- new parent
    ) e
    join "категории" r on r.id=NEW.id2 and r.title=e.title
  ) THEN
      RAISE EXCEPTION 'Повтор названия категории на одном уровне' ;
   END IF;   

  RETURN NEW;
  
END; 
$$;


--
-- Name: check_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION check_role() RETURNS trigger
    LANGUAGE plpgsql
    AS $$  

BEGIN 
  IF EXISTS (
    SELECT 1
    FROM (select g.name, ("роль/родители"(g.id)).parents_id as "parents"
      from refs rr
      join roles g on g.id=rr.id2-- childs
    WHERE rr.id1=NEW.id1 -- new parent
    ) e -- все потомки родителя
    join roles g on g.id=NEW.id2 and g.name=e.name
    join "роль/родители"(g.id) pg on pg.parents_id = e."parents" -- новый потомок хочет связ с родителем
  ) THEN
      RAISE EXCEPTION 'Повтор названия группы/роли на одном уровне' ;
   END IF;   

  RETURN NEW;
  
END; 
$$;


--
-- Name: random_int_array(integer, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION random_int_array(dim integer, min integer, max integer) RETURNS integer[]
    LANGUAGE plpgsql
    AS $$
begin
return (select array_agg(round(random() * (max - min)) + min) from generate_series (0, dim));
end
$$;


--
-- Name: text2numeric(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION text2numeric(text) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
DECLARE
  r text;
BEGIN
  r:=regexp_replace(regexp_replace($1, '[^\d,\.]+', '', 'g'), ',', '.', 'g');
  RETURN case when r='' then null else r::numeric end;
END
$_$;


--
-- Name: ts_md5(timestamp without time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION ts_md5(ts timestamp without time zone) RETURNS character
    LANGUAGE sql IMMUTABLE
    AS $_$
select md5($1::text)::char(32);
$_$;


--
-- Name: unnest_dim2(anyarray); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION unnest_dim2(anyarray) RETURNS SETOF anyarray
    LANGUAGE plpgsql IMMUTABLE
    AS $_$
DECLARE
    s $1%TYPE;
BEGIN
    FOREACH s SLICE 1  IN ARRAY $1 LOOP
        RETURN NEXT s;
    END LOOP;
    RETURN;
END;
$_$;


--
-- Name: Конфиг(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "Конфиг"() RETURNS TABLE(key text, value text)
    LANGUAGE sql
    AS $$
SELECT *
FROM (VALUES
  ('VERSION', '2017-07-27 11:11')
) AS s ("key", "value");
$$;


--
-- Name: категории/ветка узла(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "категории/ветка узла"(integer) RETURNS TABLE(id integer, title text, parent integer, parents_id integer[], parents_title text[], "order" smallint, level integer)
    LANGUAGE sql
    AS $_$

WITH RECURSIVE rc AS (
   SELECT cc.id, cc.title, c.id as parent, array[c.id]::int[]  as parents_id,  array[c.title]::text[]  as parents_title, cc."order", 1::int AS level
   FROM "категории" c
      join refs r on c.id=r.id1
      join "категории" cc on r.id2= cc.id -- child
   WHERE c.id = $1
   UNION
   SELECT cc.id, cc.title, rc.id as parent, array_append(rc.parents_id, rc.id) as parents_id, array_append(rc.parents_title, rc.title) as parents_title, cc."order", rc.level + 1 AS level
   FROM "категории" c
      JOIN rc ON c.id = rc.id
      join refs r on r.id1=rc.id
      join "категории" cc on r.id2= cc.id --child
       
   ---where coalesce($2, false) or c.parent<>0 --   кроме топа
)

SELECT *
FROM rc
--order by level desc

$_$;


--
-- Name: категории/ветка узла/потомки(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "категории/ветка узла/потомки"(integer) RETURNS TABLE(id integer, title text, parent integer, parents_id integer[], parents_title text[], "order" smallint, level integer, childs integer[])
    LANGUAGE sql
    AS $_$

select *,"категории/потомки узла/id"(id) as childs
from "категории/ветка узла"($1)

$_$;


--
-- Name: категории/индексный путь(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "категории/индексный путь"(integer) RETURNS integer[]
    LANGUAGE sql
    AS $_$

WITH x AS (
  SELECT * FROM "категории/родители узла/потомки"($1, true)
)

select array_agg(idx)::int[]
from (
  select id1, idx-1 as idx, x2.id
    from
      x as x1
        join x as x2 on x1.id=x2.parent,
      unnest(x1.childs) WITH ORDINALITY x0(id1, idx)
    order by x2.level desc
) q 
where id1 =id
;

$_$;


--
-- Name: ИД; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "ИД"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: категории; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "категории" (
    id integer DEFAULT nextval('"ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    title text NOT NULL,
    parent integer,
    childs integer[] DEFAULT '{}'::integer[],
    disabled boolean,
    img text,
    "order" smallint
);


--
-- Name: категории/потомки узла(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "категории/потомки узла"(integer) RETURNS SETOF "категории"
    LANGUAGE sql
    AS $_$

select cc.*
from "категории" c
  join refs r on c.id=r.id1
  join "категории" cc on cc.id=r.id2

where c.id=$1;


$_$;


--
-- Name: категории/потомки узла/id(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "категории/потомки узла/id"(integer) RETURNS integer[]
    LANGUAGE sql
    AS $_$

select array_agg(id)
from (
select id
from "категории/потомки узла"($1)
order by coalesce("order", id)
) o

$_$;


--
-- Name: категории/потомки узла/потомки(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "категории/потомки узла/потомки"(integer) RETURNS TABLE(id integer, title text, parent integer, "order" smallint, childs integer[])
    LANGUAGE sql
    AS $_$

select id, title, parent, "order", "категории/потомки узла/id"(id) as childs
from "категории/потомки узла"($1)

$_$;


--
-- Name: категории/родители(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "категории/родители"() RETURNS TABLE(id integer, title text, parents_id integer[], parents_title text[])
    LANGUAGE sql
    AS $$


WITH RECURSIVE rc AS (
   SELECT c.id, c.title, p.title as "parent_title", p.id as "parent_id", c."order", 1::int AS level
   FROM "категории" c
    left join (
    select c.*, r.id2 as child
    from "категории" c
      join refs r on c.id=r.id1
    ) p on c.id= p.child
    
   UNION
   
   SELECT rc.id, rc.title, c.title, c.id as parent, c."order", rc.level + 1 AS level
   FROM rc ---ON c.id = rc.child
      join refs r on r.id2=rc."parent_id"
      join "категории" c on r.id1= c.id
)

SELECT id, title, array_agg("parent_id"), array_agg("parent_title")
from (
select *
FROM rc 
order by id, "level" desc
) r
group by id, title;

$$;


--
-- Name: категории/родители узла(integer, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "категории/родители узла"(integer, boolean) RETURNS TABLE(id integer, title text, img text, parent integer, "order" smallint, level integer)
    LANGUAGE sql
    AS $_$

WITH RECURSIVE rc AS (
   SELECT c.id, c.title, c.img, r.id1 as parent, c."order", 1::int AS level
   FROM "категории" c
      join refs r on c.id=r.id2
      join "категории" c2 on r.id1= c2.id -- parent
   WHERE c.id = $1
   UNION
   SELECT c.id, c.title, c.img, r.id1 as parent, c."order", rc.level + 1 AS level
   FROM "категории" c
      JOIN rc ON c.id = rc.parent
      join refs r on r.id2=rc.parent
      join "категории" c2 on r.id1= c2.id
       
   ---where coalesce($2, false) or c.parent<>0 --   кроме топа
)

select c.id, c.title, c.img, 0 as parent, 0::int2 as "order", 1000::int AS level
from "категории" c
where coalesce($2, false) and id=3-- корень
union 
SELECT *
FROM rc
--order by level desc

$_$;


--
-- Name: категории/родители узла/id(integer, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "категории/родители узла/id"(integer, boolean) RETURNS integer[]
    LANGUAGE sql
    AS $_$

select array_agg(id)
from (
select id
from "категории/родители узла"($1, $2)
order by level desc
) s

$_$;


--
-- Name: категории/родители узла/title(integer, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "категории/родители узла/title"(integer, boolean) RETURNS text[]
    LANGUAGE sql
    AS $_$

select array_agg(title)
from (
select title
from "категории/родители узла"($1, $2)
order by level desc
) s

$_$;


--
-- Name: категории/родители узла/потомки(integer, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "категории/родители узла/потомки"(integer, boolean) RETURNS TABLE(id integer, title text, img text, parent integer, "order" smallint, level integer, childs integer[])
    LANGUAGE sql
    AS $_$

select *,"категории/потомки узла/id"(id) as childs
from "категории/родители узла"($1, $2)

$_$;


--
-- Name: роли/родители(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "роли/родители"() RETURNS TABLE(id integer, name text, descr text, disable boolean, parent integer, parents_id integer[], parents_name character varying[], parents_descr text[])
    LANGUAGE sql
    AS $$

WITH RECURSIVE rc AS (
   SELECT c.id, p.id as "parent", p.name as "parent_name", p.id as "parent_id", p.descr as parent_descr, 1::int AS level
   FROM "roles" c
    left join (
    select c.*, r.id2 as child
    from "roles" c
      join refs r on c.id=r.id1
    ) p on c.id= p.child
    
   UNION
   
   SELECT rc.id, rc."parent", c.name, c.id as parent, c.descr, rc.level + 1 AS level
   FROM rc ---ON c.id = rc.child
      join refs r on r.id2=rc."parent_id"
      join "roles" c on r.id1= c.id
)

SELECT id, name, descr, disable, parent,
  array_agg("parent_id" order by "level" desc),
  array_agg("parent_name" order by "level" desc),
  array_agg("parent_descr" order by "level" desc)
---, array_agg(level order by "level" desc) as level
from (
select rc.*, g.name, g.descr, g.disable
FROM rc
  join roles g on rc.id=g.id
) r
group by id, name, descr, disable, parent;

$$;


--
-- Name: роль/родители(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "роль/родители"(integer) RETURNS TABLE(id integer, name text, disable boolean, parent integer, parents_id integer[], parents_name character varying[])
    LANGUAGE sql
    AS $_$

WITH RECURSIVE rc AS (
   SELECT c.id, c.name, c.disable, p.id as "parent", p.name as "parent_name", p.id as "parent_id", 1::int AS level
   FROM "roles" c
    left join (
    select c.*, r.id2 as child
    from "roles" c
      join refs r on c.id=r.id1
    ) p on c.id= p.child
    where c.id=$1
    
   UNION
   
   SELECT rc.id, rc.name, rc.disable, rc."parent", c.name, c.id as parent_id, rc.level + 1 AS level
   FROM rc ---ON c.id = rc.child
      join refs r on r.id2=rc."parent_id"
      join "roles" c on r.id1= c.id
)

SELECT id, name, disable, parent,  array_agg("parent_id"), array_agg("parent_name")
from (
select *
FROM rc 
order by id, "level" desc
) r
group by id, name, disable, parent;

$_$;


--
-- Name: формат месяц(date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "формат месяц"(date) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$ 
  select to_char($1, 'YYYY-MM');
$_$;


--
-- Name: формат телефона(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "формат телефона"(text) RETURNS text
    LANGUAGE sql
    AS $_$
SELECT '(' || regexp_replace(array_to_string(regexp_matches($1, '(\d{1,3})\D*(\d{1,3})?\D*(\d{1,2})?\D*(\d{1,2})?'), '-'), '^(\d+)-', '\1) ');
$_$;


--
-- Name: actions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE actions (
    id integer DEFAULT nextval('"ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    action character varying NOT NULL,
    callback text,
    descr text
);


--
-- Name: controllers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE controllers (
    id integer DEFAULT nextval('"ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    controller character varying NOT NULL,
    descr text
);


--
-- Name: logins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE logins (
    id integer DEFAULT nextval('"ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    login character varying NOT NULL,
    pass character varying NOT NULL,
    disable boolean
);


--
-- Name: namespaces; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE namespaces (
    id integer DEFAULT nextval('"ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    namespace character varying NOT NULL,
    descr text,
    app_ns bit(1),
    interval_ts integer
);


--
-- Name: oauth.sites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "oauth.sites" (
    id integer DEFAULT nextval('"ИД"'::regclass) NOT NULL,
    name character varying NOT NULL,
    conf jsonb NOT NULL
);


--
-- Name: oauth.users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "oauth.users" (
    id integer DEFAULT nextval('"ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    site_id integer NOT NULL,
    user_id character varying NOT NULL,
    profile jsonb,
    profile_ts timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: refs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE refs (
    id integer DEFAULT nextval('"ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    id1 integer NOT NULL,
    id2 integer NOT NULL
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE roles (
    id integer DEFAULT nextval('"ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    name character varying NOT NULL,
    disable boolean,
    descr text
);


--
-- Name: routes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE routes (
    id integer DEFAULT nextval('"ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    request character varying NOT NULL,
    "to" character varying,
    name character varying NOT NULL,
    descr text,
    auth character varying,
    interval_ts integer,
    disable boolean,
    host_re character varying,
    namespace character varying
);


--
-- Name: гости; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "гости" (
    id integer DEFAULT nextval('"ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    data jsonb
);


--
-- Name: движение денег; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "движение денег" (
    id integer DEFAULT nextval('"ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    "сумма" money NOT NULL,
    "дата" date NOT NULL,
    "примечание" text
);


--
-- Name: контрагенты; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "контрагенты" (
    id integer DEFAULT nextval('"ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    title text NOT NULL
);


--
-- Name: кошельки; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "кошельки" (
    id integer DEFAULT nextval('"ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    title text NOT NULL
);


--
-- Name: проекты; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW "проекты" AS
 SELECT g1.id,
    g1.ts,
    g1.name AS title,
    g1.disable AS disabled,
    g1.descr
   FROM (((roles g1
     JOIN refs r2 ON ((g1.id = r2.id2)))
     JOIN roles g2 ON (((g2.id = r2.id1) AND ((g2.name)::text = 'Проекты'::text))))
     LEFT JOIN ( SELECT r.id2 AS g_id
           FROM (refs r
             JOIN roles g ON ((g.id = r.id1)))) n ON ((g2.id = n.g_id)))
  WHERE (n.g_id IS NULL);


--
-- Name: профили; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "профили" (
    id integer DEFAULT nextval('"ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    names text[] NOT NULL,
    disable boolean
);


--
-- Name: движение ДС/внешние платежи; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW "движение ДС/внешние платежи" AS
 SELECT m.id,
    m.ts,
    m."дата",
    m."сумма",
    sign((m."сумма")::numeric) AS sign,
    "категории/родители узла/id"(c.id, true) AS "категории",
    "категории/родители узла/title"(c.id, false) AS "категория",
    k.title AS "контрагент",
    k.id AS "контрагент/id",
    w2.id AS "кошелек2",
    array_to_string(pp.names, ' '::text) AS "профиль",
    pp.id AS "профиль/id",
    ARRAY[ARRAY[(w."проект")::text, w.title], ARRAY[(w2."проект")::text, w2.title]] AS "кошельки",
    ARRAY[ARRAY[w."проект/id", w.id], ARRAY[w2."проект/id", w2.id]] AS "кошельки/id",
    m."примечание"
   FROM (((((( SELECT w_1.id,
            w_1.ts,
            w_1.title,
            p.id AS "проект/id",
            p.title AS "проект",
            rm.id2 AS _ref
           FROM ((("проекты" p
             JOIN refs rp ON ((p.id = rp.id1)))
             JOIN "кошельки" w_1 ON ((w_1.id = rp.id2)))
             JOIN refs rm ON ((w_1.id = rm.id1)))) w
     JOIN "движение денег" m ON ((m.id = w._ref)))
     JOIN ( SELECT c_1.id,
            c_1.ts,
            c_1.title,
            c_1.parent,
            c_1.childs,
            c_1.disabled,
            c_1.img,
            c_1."order",
            rm.id2 AS _ref
           FROM ("категории" c_1
             JOIN refs rm ON ((c_1.id = rm.id1)))) c ON ((m.id = c._ref)))
     LEFT JOIN ( SELECT w_1.id,
            w_1.ts,
            w_1.title,
            rm.id1 AS _ref,
            p.title AS "проект",
            p.id AS "проект/id"
           FROM ((("проекты" p
             JOIN refs r ON ((p.id = r.id1)))
             JOIN "кошельки" w_1 ON ((w_1.id = r.id2)))
             JOIN refs rm ON ((w_1.id = rm.id2)))) w2 ON ((w2._ref = m.id)))
     LEFT JOIN ( SELECT k_1.id,
            k_1.ts,
            k_1.title,
            rm.id2 AS _ref
           FROM ("контрагенты" k_1
             JOIN refs rm ON ((k_1.id = rm.id1)))) k ON ((k._ref = m.id)))
     LEFT JOIN ( SELECT p.id,
            p.ts,
            p.names,
            p.disable,
            rm.id1 AS _ref
           FROM ("профили" p
             JOIN refs rm ON ((p.id = rm.id2)))) pp ON ((pp._ref = m.id)));


--
-- Name: движение ДС/внутр перемещения; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW "движение ДС/внутр перемещения" AS
 SELECT m.id,
    m.ts,
    m."дата",
    ('-1'::integer * m."сумма") AS "сумма",
    (('-1'::integer)::numeric * sign((m."сумма")::numeric)) AS sign,
    "категории/родители узла/id"(c.id, true) AS "категории",
    "категории/родители узла/title"(c.id, false) AS "категория",
    NULL::text AS "контрагент",
    NULL::integer AS "контрагент/id",
    w2.id AS "кошелек2",
    NULL::text AS "профиль",
    NULL::integer AS "профиль/id",
    ARRAY[ARRAY[(w2."проект")::text, w2.title], ARRAY[(w."проект")::text, w.title]] AS "кошельки",
    ARRAY[ARRAY[w2."проект/id", w2.id], ARRAY[w."проект/id", w.id]] AS "кошельки/id",
    m."примечание"
   FROM (((( SELECT w_1.id,
            w_1.ts,
            w_1.title,
            p.id AS "проект/id",
            p.title AS "проект",
            rm.id2 AS _ref
           FROM ((("проекты" p
             JOIN refs rp ON ((p.id = rp.id1)))
             JOIN "кошельки" w_1 ON ((w_1.id = rp.id2)))
             JOIN refs rm ON ((w_1.id = rm.id1)))) w
     JOIN "движение денег" m ON ((m.id = w._ref)))
     JOIN ( SELECT c_1.id,
            c_1.ts,
            c_1.title,
            c_1.parent,
            c_1.childs,
            c_1.disabled,
            c_1.img,
            c_1."order",
            rm.id2 AS _ref
           FROM ("категории" c_1
             JOIN refs rm ON ((c_1.id = rm.id1)))) c ON ((m.id = c._ref)))
     JOIN ( SELECT w_1.id,
            w_1.ts,
            w_1.title,
            rm.id1 AS _ref,
            p.title AS "проект",
            p.id AS "проект/id"
           FROM ((("проекты" p
             JOIN refs r ON ((p.id = r.id1)))
             JOIN "кошельки" w_1 ON ((w_1.id = r.id2)))
             JOIN refs rm ON ((w_1.id = rm.id2)))) w2 ON ((w2._ref = m.id)));


--
-- Name: объекты; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW "объекты" AS
 SELECT g1.id,
    g1.ts,
    g1.name,
    g1.disable,
    g1.descr
   FROM ((roles g1
     JOIN refs r2 ON ((g1.id = r2.id2)))
     JOIN roles g2 ON ((g2.id = r2.id1)))
  WHERE ((g2.name)::text = 'Объекты и подразделения'::text);


--
-- Name: проекты/объекты; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW "проекты/объекты" AS
 SELECT p.id AS "проект/id",
    p.title AS "проект",
    o.id AS "объект/id",
    o.name AS "объект"
   FROM (("проекты" p
     JOIN refs r ON ((p.id = r.id1)))
     JOIN "объекты" o ON ((o.id = r.id2)));


--
-- Name: табель; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "табель" (
    id integer DEFAULT nextval('"ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    uid integer,
    "дата" date NOT NULL,
    "значение" text NOT NULL,
    "коммент" text
);


--
-- Name: табель/начисления; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW "табель/начисления" AS
 SELECT t.id,
    t.ts,
    p.id AS "профиль/id",
    array_to_string(p.names, ' '::text) AS "профиль",
    og.name AS "объект",
    og.id AS "объект/id",
    po."проект",
    po."проект/id",
    (t."коммент")::money AS "сумма",
    ((date_trunc('month'::text, (t."дата" + '1 mon'::interval)) - '1 day'::interval))::date AS "дата",
    (((array_to_string(COALESCE(c."примечание", ARRAY[]::text[]), '
'::text) || ' ('::text) || (og.name)::text) || ')'::text) AS "примечание"
   FROM (((((("табель" t
     JOIN refs ro ON ((t.id = ro.id2)))
     JOIN roles og ON ((og.id = ro.id1)))
     JOIN "проекты/объекты" po ON ((og.id = po."объект/id")))
     JOIN refs rp ON ((t.id = rp.id2)))
     JOIN "профили" p ON ((p.id = rp.id1)))
     LEFT JOIN ( SELECT rp_1.id1 AS pid,
            ro_1.id1 AS oid,
            date_trunc('month'::text, (t_1."дата")::timestamp with time zone) AS "месяц",
            array_agg(t_1."коммент") AS "примечание"
           FROM ((("табель" t_1
             JOIN refs rp_1 ON ((t_1.id = rp_1.id2)))
             JOIN refs ro_1 ON ((t_1.id = ro_1.id2)))
             JOIN roles og_1 ON ((og_1.id = ro_1.id1)))
          WHERE ((t_1."значение" = 'Примечание'::text) AND (t_1."коммент" IS NOT NULL) AND (t_1."коммент" <> ''::text))
          GROUP BY rp_1.id1, ro_1.id1, (date_trunc('month'::text, (t_1."дата")::timestamp with time zone))) c ON (((p.id = c.pid) AND (og.id = c.oid) AND (date_trunc('month'::text, (t."дата")::timestamp with time zone) = c."месяц"))))
  WHERE ((t."значение" = 'Начислено'::text) AND (t."коммент" IS NOT NULL) AND (t."коммент" <> ''::text));


--
-- Name: движение ДС/начисления по табелю; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW "движение ДС/начисления по табелю" AS
 SELECT "табель/начисления".id,
    "табель/начисления".ts,
    "табель/начисления"."дата",
    "табель/начисления"."сумма",
    (1)::numeric AS sign,
    "категории/родители узла/id"(569, true) AS "категории",
    "категории/родители узла/title"(569, false) AS "категория",
    NULL::text AS "контрагент",
    NULL::integer AS "контрагент/id",
    NULL::integer AS "кошелек2",
    "табель/начисления"."профиль",
    "табель/начисления"."профиль/id",
    ARRAY[ARRAY[("табель/начисления"."проект")::text, ("табель/начисления"."объект")::text]] AS "кошельки",
    ARRAY[ARRAY["табель/начисления"."проект/id", "табель/начисления"."объект/id"]] AS "кошельки/id",
    "табель/начисления"."примечание"
   FROM "табель/начисления";


--
-- Name: движение ДС/по сотрудникам; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW "движение ДС/по сотрудникам" AS
 SELECT m.id,
    m.ts,
    m."дата",
    m."сумма",
    sign((m."сумма")::numeric) AS sign,
    "категории/родители узла/id"(c.id, true) AS "категории",
    "категории/родители узла/title"(c.id, false) AS "категория",
    NULL::text AS "контрагент",
    NULL::integer AS "контрагент/id",
    NULL::integer AS "кошелек2",
    array_to_string(pp.names, ' '::text) AS "профиль",
    pp.id AS "профиль/id",
    ARRAY[ARRAY[(w."проект")::text, w.title]] AS "кошельки",
    ARRAY[ARRAY[w."проект/id", w.id]] AS "кошельки/id",
    m."примечание"
   FROM (((( SELECT w_1.id,
            w_1.ts,
            w_1.title,
            p.id AS "проект/id",
            p.title AS "проект",
            rm.id2 AS _ref
           FROM ((("проекты" p
             JOIN refs rp ON ((p.id = rp.id1)))
             JOIN "кошельки" w_1 ON ((w_1.id = rp.id2)))
             JOIN refs rm ON ((w_1.id = rm.id1)))) w
     JOIN "движение денег" m ON ((m.id = w._ref)))
     JOIN ( SELECT c_1.id,
            c_1.ts,
            c_1.title,
            c_1.parent,
            c_1.childs,
            c_1.disabled,
            c_1.img,
            c_1."order",
            rm.id2 AS _ref
           FROM ("категории" c_1
             JOIN refs rm ON ((c_1.id = rm.id1)))) c ON ((m.id = c._ref)))
     JOIN ( SELECT p.id,
            p.ts,
            p.names,
            p.disable,
            rm.id1 AS _ref
           FROM ("профили" p
             JOIN refs rm ON ((p.id = rm.id2)))) pp ON ((pp._ref = m.id)));


--
-- Name: проекты000; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "проекты000" (
    id integer DEFAULT nextval('"ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    title text NOT NULL,
    disabled boolean
);


--
-- Name: actions actions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY actions
    ADD CONSTRAINT actions_pkey PRIMARY KEY (id);


--
-- Name: controllers controllers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY controllers
    ADD CONSTRAINT controllers_pkey PRIMARY KEY (id);


--
-- Name: logins logins_login_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY logins
    ADD CONSTRAINT logins_login_key UNIQUE (login);


--
-- Name: logins logins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY logins
    ADD CONSTRAINT logins_pkey PRIMARY KEY (id);


--
-- Name: namespaces namespaces_namespace_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY namespaces
    ADD CONSTRAINT namespaces_namespace_key UNIQUE (namespace);


--
-- Name: namespaces namespaces_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY namespaces
    ADD CONSTRAINT namespaces_pkey PRIMARY KEY (id);


--
-- Name: oauth.sites oauth.sites_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "oauth.sites"
    ADD CONSTRAINT "oauth.sites_name_key" UNIQUE (name);


--
-- Name: oauth.sites oauth.sites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "oauth.sites"
    ADD CONSTRAINT "oauth.sites_pkey" PRIMARY KEY (id);


--
-- Name: oauth.users oauth.users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "oauth.users"
    ADD CONSTRAINT "oauth.users_pkey" PRIMARY KEY (id);


--
-- Name: oauth.users oauth.users_site_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "oauth.users"
    ADD CONSTRAINT "oauth.users_site_id_user_id_key" UNIQUE (site_id, user_id);


--
-- Name: refs refs_id1_id2_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY refs
    ADD CONSTRAINT refs_id1_id2_key UNIQUE (id1, id2);


--
-- Name: refs refs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY refs
    ADD CONSTRAINT refs_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: routes routes_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY routes
    ADD CONSTRAINT routes_name_key UNIQUE (name);


--
-- Name: routes routes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY routes
    ADD CONSTRAINT routes_pkey PRIMARY KEY (id);


--
-- Name: routes routes_request_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY routes
    ADD CONSTRAINT routes_request_key UNIQUE (request);


--
-- Name: гости гости_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "гости"
    ADD CONSTRAINT "гости_pkey" PRIMARY KEY (id);


--
-- Name: движение денег движение денег_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "движение денег"
    ADD CONSTRAINT "движение денег_pkey" PRIMARY KEY (id);


--
-- Name: категории категории транспорта_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "категории"
    ADD CONSTRAINT "категории транспорта_pkey" PRIMARY KEY (id);


--
-- Name: контрагенты контрагенты_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "контрагенты"
    ADD CONSTRAINT "контрагенты_pkey" PRIMARY KEY (id);


--
-- Name: контрагенты контрагенты_title_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "контрагенты"
    ADD CONSTRAINT "контрагенты_title_key" UNIQUE (title);


--
-- Name: кошельки кошельки_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "кошельки"
    ADD CONSTRAINT "кошельки_pkey" PRIMARY KEY (id);


--
-- Name: проекты000 проекты_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "проекты000"
    ADD CONSTRAINT "проекты_pkey" PRIMARY KEY (id);


--
-- Name: профили профили_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "профили"
    ADD CONSTRAINT "профили_pkey" PRIMARY KEY (id);


--
-- Name: табель табель_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "табель"
    ADD CONSTRAINT "табель_pkey" PRIMARY KEY (id);


--
-- Name: idx/roles/name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx/roles/name" ON roles USING btree (name);


--
-- Name: idx/движение денег/дата; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx/движение денег/дата" ON "движение денег" USING btree ("дата");


--
-- Name: refs_id2_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX refs_id2_idx ON refs USING btree (id2);


--
-- Name: табель/значение/индекс; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "табель/значение/индекс" ON "табель" USING btree ("значение");


--
-- Name: табель/индекс по месяцам; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "табель/индекс по месяцам" ON "табель" USING btree ("формат месяц"("дата"));


--
-- Name: refs check_category; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER check_category BEFORE INSERT OR UPDATE ON refs FOR EACH ROW EXECUTE PROCEDURE check_category();


--
-- Name: refs check_role; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER check_role BEFORE INSERT OR UPDATE ON refs FOR EACH ROW EXECUTE PROCEDURE check_role();


--
-- PostgreSQL database dump complete
--

