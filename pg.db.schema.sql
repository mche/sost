--
-- PostgreSQL database dump
--

-- Dumped from database version 10.5
-- Dumped by pg_dump version 10.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: медкол; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA "медкол";


--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


--
-- Name: intarray; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS intarray WITH SCHEMA public;


--
-- Name: EXTENSION intarray; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION intarray IS 'functions, operators, and index support for 1-D arrays of integers';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: oplata; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.oplata AS ENUM (
    'безнал',
    'наличка',
    'карта'
);


--
-- Name: check_category(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_category() RETURNS trigger
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
-- Name: check_nomen(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_nomen() RETURNS trigger
    LANGUAGE plpgsql
    AS $$  

BEGIN 
  IF EXISTS (
    SELECT 1
    FROM (select r.title
     from refs rr
     join "номенклатура" r on r.id=rr.id2-- потомки одного уровня
     WHERE rr.id1=NEW.id1 -- new parent
    ) e
    join "номенклатура" r on r.id=NEW.id2 and lower(r.title)=lower(e.title)

  ) THEN
      RAISE EXCEPTION 'Повтор названия номенклатуры на одном уровне' ;
   END IF;   

  RETURN NEW;
  
END; 
$$;


--
-- Name: check_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.check_role() RETURNS trigger
    LANGUAGE plpgsql
    AS $$  

BEGIN 
  IF EXISTS (
/*    SELECT 1
    FROM (select g.name, ("роль/родители"(g.id)).parents_id as "parents"
      from refs rr
      join roles g on g.id=rr.id2-- childs
    WHERE rr.id1=NEW.id1 -- new parent
    ) e -- все потомки родителя
    join roles g on g.id=NEW.id2 and g.name=e.name
    join "роль/родители"(g.id) pg on pg.parents_id = e."parents" -- новый потомок хочет связ с родителем
*/
    SELECT 1
    FROM (select r.name
     from refs rr
     join "roles" r on r.id=rr.id2-- childs
     WHERE rr.id1=NEW.id1 -- new parent
    ) e
    join "roles" r on r.id=NEW.id2 and lower(r.name)=lower(e.name)

  ) THEN
      RAISE EXCEPTION 'Повтор названия группы/роли на одном уровне' ;
   END IF;   

  RETURN NEW;
  
END; 
$$;


--
-- Name: exec_query_1bind(text, anyelement); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.exec_query_1bind(text, anyelement) RETURNS SETOF record
    LANGUAGE plpgsql
    AS $_$
/*** 
1 аргумент - SQL-зарос
2 аргумент - только одно бинд-значение
***/
BEGIN 
    RETURN QUERY EXECUTE $1 using $2 ; 
END 
$_$;


--
-- Name: exec_query_2bind(text, anyelement, anyelement); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.exec_query_2bind(text, anyelement, anyelement) RETURNS SETOF record
    LANGUAGE plpgsql
    AS $_$
/***
1 аргумент - SQL-зарос
2 аргумент - первое бинд-значение
3 аргумент - второе бинд-значение
***/
BEGIN 
    RETURN QUERY EXECUTE $1 using $2, $3 ; 
END 
$_$;


--
-- Name: random_int_array(integer, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.random_int_array(dim integer, min integer, max integer) RETURNS integer[]
    LANGUAGE plpgsql
    AS $$
begin
return (select array_agg(round(random() * (max - min)) + min) from generate_series (0, dim));
end
$$;


--
-- Name: roles/родители(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public."roles/родители"() RETURNS TABLE(id integer, name character varying, descr text, disable boolean, parent integer, "parents/id" integer[], parents_id integer[], "parents/name" character varying[], parents_name character varying[], "parents/descr" text[], parents_descr text[], "childs/id" integer[], level integer)
    LANGUAGE sql
    AS $$

/*Базовая функция для дерева*/

WITH RECURSIVE rc AS (
   SELECT c.id, c.name, c.descr, c.disable, p.id as "parent", p.name as "parent/name", p.id as "parent/id", p.descr as "parent_descr", 0::int AS "level"
   FROM "roles" c
    left join (
    select c.*, r.id2 as child
    from "roles" c
      join refs r on c.id=r.id1
    ) p on c.id= p.child
    
   UNION
   
   SELECT rc.id, rc.name, rc.descr, rc.disable, rc."parent", p.name, p.id as parent, p.descr as "parent_descr", rc.level + 1 AS "level"
   FROM rc 
      join refs r on r.id2=rc."parent/id"
      join "roles" p on r.id1= p.id
)

SELECT id, name, descr, disable, parent,
  "parents/id", "parents/id", --- дважды
  "parents/name", "parents/name", -- дважды
  "parents/descr", "parents/descr" as "parents_descr",
  "childs/id", "level"
FROM (
  SELECT rc.id, rc.name, rc.descr, rc.disable, rc.parent,
    array_agg(rc."parent/id" order by rc."level" desc) as "parents/id",  ---уникальность массива вследствие повторение пути ветвей структуры
    array_agg(rc."parent/name" order by rc."level" desc) as "parents/name",
    array_agg(rc."parent_descr" order by rc."level" desc) as "parents/descr",
    c."childs/id",
    max(rc."level") as "level"

  FROM rc
    left join "roles/childs[]" c on rc.id=c.id -- потомки ниже уровня

  group by rc.id, rc.name, rc.descr, rc.disable, rc.parent, c."childs/id"
) a;

$$;


--
-- Name: text2numeric(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.text2numeric(text) RETURNS numeric
    LANGUAGE plpgsql
    AS $_$
DECLARE
  r text;
BEGIN
  r:=regexp_replace($1, '(\S\s*)-+', '\1', 'g'); -- минусы внутри
  r:=regexp_replace(r, '[^\-\d,\.]+', '', 'g'); -- шелуха
  r:=regexp_replace(r, ',', '.', 'g'); --- запятые в точки
  ---r:=regexp_replace(r, '(\.)(?=.*\1)', '', 'g'); --- одна точка последняя это не работает
  r:=regexp_replace(r, '\.+(\S+\.)', '\1', 'g'); --- одна точка последняя
  RETURN case when r='' then null else r::numeric end;
END
$_$;


--
-- Name: timestamp_to_json(timestamp without time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.timestamp_to_json(timestamp without time zone) RETURNS json
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$ 
select row_to_json(d) from (
  select 
  date_part('century', $1) as century,
  date_part('day', $1) as day,
  date_part('decade', $1) as decade,
  date_part('dow', $1) as dow,
  date_part('doy', $1) as doy,
  date_part('epoch', $1) as epoch,
  date_part('hour', $1) as hour,
  date_part('isodow', $1) as isodow,
  date_part('isoyear', $1) as isoyear,
  date_part('microseconds', $1) as microseconds,
  date_part('millennium', $1) as millennium,
  date_part('milliseconds', $1) as milliseconds,
  date_part('minute', $1) as minute,
  date_part('month', $1) as month,
  date_part('quarter', $1) as quarter,
  date_part('second', $1) as second,
--- нужен тип timestamp with time zone
---  date_part('timezone', $1) as timezone,
---  date_part('timezone_hour', $1) as timezone_hour,
---  date_part('timezone_minute', $1) as timezone_minute,
  date_part('week', $1) as week,
  date_part('year', $1) as year,
  to_char($1, 'TMday') as "день недели", ---полное название дня недели в нижнем регистре (дополненное пробелами до 9 символов)
  to_char($1, 'TMdy') as "день нед",---сокращённое название дня недели в нижнем регистре (3 буквы в английском; в других языках длина может меняться)
  to_char($1, 'TMmon') as "мес",
  to_char($1, 'TMmonth') as "месяц"
) d;
$_$;


--
-- Name: ts_md5(timestamp without time zone); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.ts_md5(ts timestamp without time zone) RETURNS character
    LANGUAGE sql IMMUTABLE
    AS $_$
select md5($1::text)::char(32);
$_$;


--
-- Name: unnest_dim2(anyarray); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.unnest_dim2(anyarray) RETURNS SETOF anyarray
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

CREATE FUNCTION public."Конфиг"() RETURNS TABLE(key text, value text)
    LANGUAGE sql
    AS $$
SELECT *
FROM (VALUES
  ('VERSION', '2017-08-03_17:33')
) AS s ("key", "value");
$$;


--
-- Name: движение денег/доп записи расчета (integer, integer, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public."движение денег/доп записи расчета "(integer, integer, date) RETURNS TABLE(id integer, ts timestamp without time zone, "сумма" money, "дата" date, "примечание" text, "категория/id" integer, "категории" integer[], "категория" text[])
    LANGUAGE sql
    AS $_$

select m.*,
  c.id as "категория/id",
  "категории/родители узла/id"(c.id, true) as "категории",
  "категории/родители узла/title"(c.id, false) as "категория"

from refs rp -- к профилю
  join "движение денег" m on m.id=rp.id1
  join refs rc on m.id=rc.id2
  join "категории" c on c.id=rc.id1

where 
  (m.id=$1 --
  or (($2 is null or rp.id2=$2) -- профиль
    and "формат месяц2"(m."дата") = "формат месяц2"($3::date)
    )
  ) and not exists (--- движение по кошелькам не нужно
    select w.id
    from "кошельки" w
      join refs r on w.id=r.id1
    where r.id2=m.id
  )
;

$_$;


--
-- Name: доступные объекты(integer, integer[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public."доступные объекты"(integer, integer[]) RETURNS TABLE(id integer, name character varying, descr text, disable boolean, parent integer, "parents/id" integer[], parents_id integer[], "parents/name" character varying[], parents_name character varying[], "parents/descr" text[], parents_descr text[], "childs/id" integer[], level integer)
    LANGUAGE sql
    AS $_$
/* проверять доступ профиля к объектам или все его доступные объекты
*/
/*select distinct o.id, o.ts, o.name, o.disable, o.descr ---, array[r1.id2, r3.id2]::int[] as "профиль"
from
   
  (--  все объекты
    select distinct g1.*, r3.id2 as _profile_top
    from roles g1
      join refs r2 on g1.id = r2.id2
      join roles g2 on g2.id=r2.id1 -- 
      left join refs r3 on g2.id = r3.id1 and r3.id2 = $1      --- доступ по топовой группе
    where 
      g2."name"='Объекты и подразделения'
        and not coalesce(g1."disable", false)
) o 

left join refs r1 on o.id=r1.id1

where 
  (o._profile_top is not null or $1=r1.id2) -- по профилю
  and (o.id=any($2) or $2 is null or $2[1] is null or (o._profile_top is not null and $2[1]=0)) --  к объектам
  ---  or ((o.id=any($2) or coalesce($2[1], 0)=0) and $1=r3.id2))--- если 0(все объекты) то проверить связь с топовой группой объектов
;*/

select o.*
from "объекты" o
  left join refs r on r.id1=any(o."parents/id" || o.id)
where r.id2=$1
  and (o.id=any($2) or $2 is null or $2[1] is null
    or (o.parent=3403 and $2[1]=0)) --  к объектам
  and coalesce(o.disable, false)=false

$_$;


--
-- Name: категории/ветка узла(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public."категории/ветка узла"(integer) RETURNS TABLE(id integer, title text, parent integer, parents_id integer[], parents_title text[], "order" smallint, level integer)
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

CREATE FUNCTION public."категории/ветка узла/потомки"(integer) RETURNS TABLE(id integer, title text, parent integer, parents_id integer[], parents_title text[], "order" smallint, level integer, childs integer[])
    LANGUAGE sql
    AS $_$

select *,"категории/потомки узла/id"(id) as childs
from "категории/ветка узла"($1)

$_$;


--
-- Name: категории/индексный путь(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public."категории/индексный путь"(integer) RETURNS integer[]
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

CREATE SEQUENCE public."ИД"
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

CREATE TABLE public."категории" (
    id integer DEFAULT nextval('public."ИД"'::regclass) NOT NULL,
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

CREATE FUNCTION public."категории/потомки узла"(integer) RETURNS SETOF public."категории"
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

CREATE FUNCTION public."категории/потомки узла/id"(integer) RETURNS integer[]
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

CREATE FUNCTION public."категории/потомки узла/потомки"(integer) RETURNS TABLE(id integer, title text, parent integer, "order" smallint, childs integer[])
    LANGUAGE sql
    AS $_$

select id, title, parent, "order", "категории/потомки узла/id"(id) as childs
from "категории/потомки узла"($1)

$_$;


--
-- Name: категории/родители(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public."категории/родители"() RETURNS TABLE(id integer, title text, parent integer, parents_id integer[], parents_title text[], level integer)
    LANGUAGE sql
    AS $$

/*
Базовая функция списка данных для компонентов поиска категорий и построения дерева
Использование

select g.*, r.parent, r.level, r."parents_id", r."parents_title", c.childs
from "категории/родители"() r
join "категории" g on r.id=g.id
left join (
  select array_agg(c.id) as childs, r.id1 as parent
  from "категории" c
    join refs r on c.id=r.id2
  group by r.id1
) c on r.id= c.parent
---where coalesce(?::int, 0)=0 or ?::int=any(r."parents_id")
where  3=any(r."parents_id")
order by r.id, r.parents_title
;

*/

WITH RECURSIVE rc AS (
   SELECT c.id, c.title, p.id as "parent", p.title as "parent_title", p.id as "parent_id", 0::int AS level ---c."order", 
   FROM "категории" c
    left join (
    select c.*, r.id2 as child
    from "категории" c
      join refs r on c.id=r.id1
    ) p on c.id= p.child
    
   UNION
   
   SELECT rc.id, rc.title, rc."parent", c.title, c.id as parent, rc.level + 1 AS level --- c."order", 
   FROM rc ---ON c.id = rc.child
      join refs r on r.id2=rc."parent_id"
      join "категории" c on r.id1= c.id
)

/*
SELECT id, title, array_agg("parent_id"), array_agg("parent_title")
from (
select *
FROM rc 
order by id, "level" desc
) r
group by id, title;*/

SELECT id, title, parent,
  array_agg("parent_id" order by "level" desc),
  array_agg("parent_title" order by "level" desc),
  max(level) as level
  ---array_agg("parent_descr" order by "level" desc)
  ---array_agg("level" order by "level" desc) as "level"
---from (
---select rc.*, g.title, g.descr, g.disable
FROM rc
---  join "категории" g on rc.id=g.id
---) r
group by id, title, parent;

$$;


--
-- Name: категории/родители узла(integer, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public."категории/родители узла"(integer, boolean) RETURNS TABLE(id integer, title text, img text, parent integer, "order" smallint, level integer)
    LANGUAGE sql
    AS $_$

WITH RECURSIVE rc AS (
   SELECT c.id, c.title, c.img, p.id1 as parent, c."order",  1::int AS level
   FROM "категории" c
      left join (
      select  r.*
        from refs r 
        join "категории" c2 on r.id1= c2.id
      ) p on p.id2=c.id
   WHERE c.id = $1
   UNION
   SELECT c.id, c.title, c.img, p.id1 as parent, c."order",  rc.level + 1 AS level
   FROM "категории" c
      JOIN rc ON c.id = rc.parent
      left join (
      select  r.*
        from refs r 
        join "категории" c2 on r.id1= c2.id
      ) p on p.id2=rc.parent
    WHERE coalesce($2, false) or p.id1 is not null
)

/*
select c.id, c.title, c.img, 0 as parent, 0::int2 as "order", 1000::int AS level
from "категории" c
where coalesce($2, false) and id=3-- корень
union */
SELECT *
FROM rc
--order by level desc

$_$;


--
-- Name: категории/родители узла/id(integer, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public."категории/родители узла/id"(integer, boolean) RETURNS integer[]
    LANGUAGE sql
    AS $_$

select array_agg(id order by level desc)
from "категории/родители узла"($1, $2)


$_$;


--
-- Name: категории/родители узла/title(integer, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public."категории/родители узла/title"(integer, boolean) RETURNS text[]
    LANGUAGE sql
    AS $_$

select array_agg(title order by level desc)
---from (
---select title
from "категории/родители узла"($1, $2)
---order by level desc
---) s

$_$;


--
-- Name: категории/родители узла/потомки(integer, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public."категории/родители узла/потомки"(integer, boolean) RETURNS TABLE(id integer, title text, img text, parent integer, "order" smallint, level integer, childs integer[])
    LANGUAGE sql
    AS $_$

select *,"категории/потомки узла/id"(id) as childs
from "категории/родители узла"($1, $2)

$_$;


--
-- Name: месяц табеля закрыт(date, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public."месяц табеля закрыт"(date, integer) RETURNS boolean
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$ 
select (date_trunc('month', $1) + coalesce(t.val->>($2::text), '1 month 10 days')::interval) < now() or $1>now()
from "разное" t
where t.key='месяц табеля закрыт/interval'
;
$_$;


--
-- Name: номенклатура; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."номенклатура" (
    id integer DEFAULT nextval('public."ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    uid integer,
    title character varying NOT NULL,
    disable boolean,
    descr text
);


--
-- Name: номенклатура/потомки узла(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public."номенклатура/потомки узла"(integer) RETURNS SETOF public."номенклатура"
    LANGUAGE sql
    AS $_$

select cc.*
from "номенклатура" c
  join refs r on c.id=r.id1
  join "номенклатура" cc on cc.id=r.id2

where c.id=$1;


$_$;


--
-- Name: номенклатура/родители(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public."номенклатура/родители"() RETURNS TABLE(id integer, title character varying, parent integer, parents_id integer[], parents_title character varying[], parents_descr text[], level integer)
    LANGUAGE sql
    AS $$

/*Базовая функция для компонентов поиска-выбора позиции и построения дерева*/

WITH RECURSIVE rc AS (
   SELECT c.id, c.title, p.id as "parent", p.title as "parent_title", p.id as "parent_id", p.descr as parent_descr, 0::int AS "level"
   FROM "номенклатура" c
    left join (
    select c.*, r.id2 as child
    from "номенклатура" c
      join refs r on c.id=r.id1
    ) p on c.id= p.child
    
   UNION
   
   SELECT rc.id, rc.title, rc."parent", c.title, c.id as parent, c.descr, rc.level + 1 AS "level"
   FROM rc ---ON c.id = rc.child
      join refs r on r.id2=rc."parent_id"
      join "номенклатура" c on r.id1= c.id
)

SELECT id, title, parent,
  array_agg("parent_id" order by "level" desc),
  array_agg("parent_title" order by "level" desc),
  array_agg("parent_descr" order by "level" desc),
  max("level") as "level"
---from (
---select rc.*, g.title, g.descr, g.disable
FROM rc
---  join "номенклатура" g on rc.id=g.id
---) r
group by id, title, parent;

$$;


--
-- Name: номенклатура/родители узла(integer, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public."номенклатура/родители узла"(integer, boolean) RETURNS TABLE(id integer, title text, parent integer, level integer)
    LANGUAGE sql
    AS $_$

WITH RECURSIVE rc AS (
   SELECT c.id, c.title, p.id1 as parent, 1::int AS level
   FROM "номенклатура" c
      left join (
      select  r.*
        from refs r 
        join "номенклатура" c2 on r.id1= c2.id
      ) p on p.id2=c.id
   WHERE c.id = $1
   UNION
   SELECT c.id, c.title, p.id1 as parent, rc.level + 1 AS level
   FROM "номенклатура" c
      JOIN rc ON c.id = rc.parent
      left join (
      select  r.*
        from refs r 
        join "номенклатура" c2 on r.id1= c2.id
      ) p on p.id2=rc.parent
    WHERE coalesce($2, false) or p.id1 is not null
)

/*
select c.id, c.title, 0 as parent, 0::int2 as "order", 1000::int AS level
from "категории" c
where coalesce($2, false) and id=3-- корень
union 
*/
SELECT *
FROM rc
--order by level desc

$_$;


--
-- Name: номенклатура/родители узла/title(integer, boolean); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public."номенклатура/родители узла/title"(integer, boolean) RETURNS text[]
    LANGUAGE sql
    AS $_$

select array_agg(title order by level desc) as "full_title"
---from (
---select title
from "номенклатура/родители узла"($1, $2)
--order by level desc
--) s

$_$;


--
-- Name: перекинуть refs id1 и id2(integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public."перекинуть refs id1 и id2"(integer, integer) RETURNS void
    LANGUAGE plpgsql
    AS $_$
declare
  r record;
  c int;
begin
  c := 0;
  for r in select * from refs where id1=$1
  loop
  begin
      update refs
      set id1 = $2
      where id = r.id;
  exception
      when unique_violation then
          raise notice 'refs id=% id1=% id2=% is not updated', r.id, r.id1, r.id2;
  end;
  c := c + 1;
  end loop;
  ----GET DIAGNOSTICS c = ROW_COUNT;
  raise info 'total count on id1 %', c;
  
  c := 0;
  for r in select * from refs where id2=$1
  loop
  begin
      update refs
      set id2 = $2
      where id = r.id;
    
  exception
      when unique_violation then
          raise notice 'refs id=% id1=% id2=% is not updated', r.id, r.id1, r.id2;
  end;
  c := c + 1;
  end loop;
  ---GET DIAGNOSTICS c = ROW_COUNT;
  raise info 'total count on id2 %', c;
end $_$;


--
-- Name: полный формат даты(date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public."полный формат даты"(date) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$ 
  select array_to_string(array[
    ---to_char($1, 'TMdy') || ',',
    regexp_replace(to_char($1, 'DD'), '^0', ''),
    ---to_char($1, 'TMmon'),
    m.name,
    to_char($1, 'YYYY')
  ]::text[], ' ')
  from (VALUES ('01', 'января'),  ('02', 'февраля'), ('03', 'марта'), ('04', 'апреля'), ('05', 'мая'), ('06', 'июня'), ('07', 'июля'), ('08', 'августа'), ('09', 'сентября'), ('10', 'октября'), ('11', 'ноября'), ('12', 'декабря')) as m (id, name)
  where m.id=to_char($1, 'MM')
  ;
$_$;


--
-- Name: роль/родители(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public."роль/родители"(integer) RETURNS TABLE(id integer, name text, disable boolean, parent integer, parents_id integer[], parents_name character varying[])
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
-- Name: табель/пересечение на объектах(date, integer, integer, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public."табель/пересечение на объектах"(date, integer, integer, integer) RETURNS TABLE("дата" date, "профиль/id" integer, "профиль/names" text[], "часы" text[], "объекты/json" json[], "объекты/id" integer[])
    LANGUAGE sql
    AS $_$

select t."дата", p.id, p.names,
  ---count(t.*), 
  array_agg(t."значение" order by t.id), array_agg(row_to_json(o) order by t.id), array_agg(o.id order by t.id)
from "табель" t
  join refs ro on t.id=ro.id2
  ---join "проекты/объекты" o on o.id=ro.id1
  join roles o on o.id=ro.id1
  join refs rp on t.id=rp.id2
  join "профили" p on p.id=rp.id1

where (t."значение"~'^\d+[.,]?\d*$' or lower(t."значение")='о')
  and "формат месяц2"(t."дата")="формат месяц2"($1)
  and ($2 is null or p.id=$2)
  and case when $3<0 then o.id<>(-$3) when $3>0 then o.id=$3 else true end

group by t."дата", /*o.id,*/ p.id
having count(t.*)>=coalesce($4, 1)
--order by 1,3
;

$_$;


--
-- Name: удалить объект(text, text, text, integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public."удалить объект"(text, text, text, integer) RETURNS text[]
    LANGUAGE plpgsql
    AS $_$
DECLARE
   v_data json;
   a_ret text[];---возврат массив удалений
BEGIN
  
/***
1 агрумент - схема БД
2 аргумент - таблица объекта-записи
3 агрумент - таблица связей
4 аргумент - ид объекта-записи

***/
select e.data into /*STRICT*/ v_data
from exec_query_1bind(format('delete from %I.%I as tbl where id=$1 returning row_to_json(tbl)', $1, $2), $4) as e(data json);

IF v_data IS NULL THEN
  RAISE NOTICE 'В таблице "%"."%" нет такого id=%', $1, $2, $4;
  RETURN null;
END IF;

RAISE INFO 'В таблице "%"."%"  удалена запись %', $1, $2, v_data::text;
select array_cat(array[[]]::text[], array[[format('%I.%I', $1, $2), v_data::text]]) into a_ret;

FOR v_data IN
  select e.data
  from exec_query_1bind(format('delete from %I.%I as tbl where $1=any(array[id1, id2]) returning row_to_json(tbl)', $1, $3), $4) as e(data json)
LOOP
  RAISE INFO 'В таблице "%"."%"  удалена запись %', $1, $3, v_data::text;
  select array_cat(a_ret, array[[format('%I.%I', $1, $3), v_data::text]]) into a_ret;
END LOOP;

RETURN a_ret;

END
$_$;


--
-- Name: формат даты(date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public."формат даты"(date) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$ 
  select array_to_string(array[
    to_char($1, 'TMdy') || ',',
    regexp_replace(to_char($1, 'DD'), '^0', ''),
    to_char($1, 'TMmon'),
    case when date_trunc('year', now())=date_trunc('year', $1) then '' else to_char($1, 'YYYY') end
  ]::text[], ' ');
$_$;


--
-- Name: формат месяц(date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public."формат месяц"(date) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$ 
  select to_char($1, 'YYYY-MM');
$_$;


--
-- Name: формат месяц2(date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public."формат месяц2"(date) RETURNS date
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$ 
  select date_trunc('month', $1)::date;
$_$;


--
-- Name: формат телефона(text); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public."формат телефона"(text) RETURNS text
    LANGUAGE sql
    AS $_$
SELECT '(' || regexp_replace(array_to_string(regexp_matches($1, '(\d{1,3})\D*(\d{1,3})?\D*(\d{1,2})?\D*(\d{1,2})?'), '-'), '^(\d+)-', '\1) ');
$_$;


--
-- Name: actions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.actions (
    id integer DEFAULT nextval('public."ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    action character varying NOT NULL,
    callback text,
    descr text
);


--
-- Name: controllers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.controllers (
    id integer DEFAULT nextval('public."ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    controller character varying NOT NULL,
    descr text
);


--
-- Name: logins; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.logins (
    id integer DEFAULT nextval('public."ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    login character varying NOT NULL,
    pass character varying NOT NULL,
    disable boolean
);


--
-- Name: logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.logs (
    ts timestamp without time zone DEFAULT now() NOT NULL,
    user_id integer NOT NULL,
    route_id integer,
    url text,
    status integer NOT NULL,
    elapsed numeric NOT NULL
);


--
-- Name: namespaces; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.namespaces (
    id integer DEFAULT nextval('public."ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    namespace character varying NOT NULL,
    descr text,
    app_ns bit(1),
    interval_ts integer
);


--
-- Name: oauth.sites; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."oauth.sites" (
    id integer DEFAULT nextval('public."ИД"'::regclass) NOT NULL,
    name character varying NOT NULL,
    conf jsonb NOT NULL
);


--
-- Name: oauth.users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."oauth.users" (
    id integer DEFAULT nextval('public."ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    site_id integer NOT NULL,
    user_id character varying NOT NULL,
    profile jsonb,
    profile_ts timestamp without time zone DEFAULT now() NOT NULL
);


--
-- Name: refs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refs (
    id integer DEFAULT nextval('public."ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    id1 integer NOT NULL,
    id2 integer NOT NULL,
    CONSTRAINT "id1 == id2" CHECK ((id1 <> id2))
);


--
-- Name: roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.roles (
    id integer DEFAULT nextval('public."ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    name character varying NOT NULL,
    disable boolean,
    descr text
);


--
-- Name: roles/childs[]; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."roles/childs[]" AS
 SELECT p.id,
    array_agg(DISTINCT c.id) AS "childs/id"
   FROM (public.roles p
     LEFT JOIN ( SELECT c_1.id,
            c_1.ts,
            c_1.name,
            c_1.disable,
            c_1.descr,
            r.id1
           FROM (public.refs r
             JOIN public.roles c_1 ON ((c_1.id = r.id2)))) c ON ((p.id = c.id1)))
  GROUP BY p.id;


--
-- Name: routes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.routes (
    id integer DEFAULT nextval('public."ИД"'::regclass) NOT NULL,
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
-- Name: движение денег; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."движение денег" (
    id integer DEFAULT nextval('public."ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    "сумма" money NOT NULL,
    "дата" date NOT NULL,
    "примечание" text
);


--
-- Name: кошельки; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."кошельки" (
    id integer DEFAULT nextval('public."ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    title text NOT NULL
);


--
-- Name: профили; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."профили" (
    id integer DEFAULT nextval('public."ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    names text[] NOT NULL,
    disable boolean,
    tel text[],
    descr text,
    "дата рождения" date
);


--
-- Name: табель; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."табель" (
    id integer DEFAULT nextval('public."ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    uid integer,
    "дата" date NOT NULL,
    "значение" text NOT NULL,
    "коммент" text
);


--
-- Name: Расчеты ЗП; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."Расчеты ЗП" AS
 SELECT n.pid,
    n.names,
    n."дата",
    n."начислено",
    dop."доп",
    (n."начислено" + COALESCE(dop."доп", (0)::numeric)) AS "расчет ЗП",
    r."сохраненный расчет"
   FROM ((( SELECT p.id AS pid,
            p.names,
            t."дата",
            (sum((public.text2numeric(COALESCE(t."коммент", '0'::text)))::money))::numeric AS "начислено"
           FROM ((public."табель" t
             JOIN public.refs r_1 ON ((t.id = r_1.id2)))
             JOIN public."профили" p ON ((p.id = r_1.id1)))
          WHERE (t."значение" ~* 'начислено'::text)
          GROUP BY p.id, p.names, t."дата") n
     LEFT JOIN ( SELECT p.id,
            t."дата",
            ((public.text2numeric(COALESCE(t."коммент", '0'::text)))::money)::numeric AS "сохраненный расчет"
           FROM ((public."табель" t
             JOIN public.refs r_1 ON ((t.id = r_1.id2)))
             JOIN public."профили" p ON ((p.id = r_1.id1)))
          WHERE (t."значение" ~ 'Расчет'::text)) r ON (((n.pid = r.id) AND (n."дата" = r."дата"))))
     LEFT JOIN ( SELECT rp.id2 AS id,
            date_trunc('month'::text, (m."дата")::timestamp with time zone) AS "дата",
            (sum(m."сумма"))::numeric AS "доп"
           FROM (public.refs rp
             JOIN public."движение денег" m ON ((m.id = rp.id1)))
          WHERE (NOT (EXISTS ( SELECT w.id
                   FROM (public."кошельки" w
                     JOIN public.refs r_1 ON ((w.id = r_1.id1)))
                  WHERE (r_1.id2 = m.id))))
          GROUP BY rp.id2, (date_trunc('month'::text, (m."дата")::timestamp with time zone))) dop ON (((n.pid = dop.id) AND (public."формат месяц2"(n."дата") = dop."дата"))))
  WHERE (n."начислено" <> (0)::numeric);


--
-- Name: должности; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."должности" AS
 SELECT g1.id,
    g1.ts,
    g1.name,
    g1.disable,
    g1.descr
   FROM (((public.roles g1
     JOIN public.refs r2 ON ((g1.id = r2.id2)))
     JOIN public.roles g2 ON (((g2.id = r2.id1) AND ((g2.name)::text = 'Должности'::text))))
     LEFT JOIN ( SELECT r.id2 AS g_id
           FROM (public.refs r
             JOIN public.roles g ON ((g.id = r.id1)))) n ON ((g2.id = n.g_id)))
  WHERE (n.g_id IS NULL);


--
-- Name: водители; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."водители" AS
 SELECT p.id,
    p.ts,
    p.names,
    p.disable,
    p.tel,
    p.descr,
    p."дата рождения",
    d.name AS "должность",
    d.id AS "должность/id"
   FROM ((public."должности" d
     JOIN public.refs r ON ((d.id = r.id1)))
     JOIN public."профили" p ON ((p.id = r.id2)))
  WHERE ((d.name)::text = ANY (ARRAY['Водитель'::text, 'Водитель КДМ'::text, 'Машинист автокрана'::text, 'Машинист экскаватора'::text, 'Машинист катка'::text, 'Машинист экскаватора-погрузчика'::text]));


--
-- Name: гости; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."гости" (
    id integer DEFAULT nextval('public."ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    data jsonb
);


--
-- Name: объекты; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."объекты" AS
 SELECT "roles/родители".id,
    "roles/родители".name,
    "roles/родители".descr,
    "roles/родители".disable,
    "roles/родители".parent,
    "roles/родители"."parents/id",
    "roles/родители".parents_id,
    "roles/родители"."parents/name",
    "roles/родители".parents_name,
    "roles/родители"."parents/descr",
    "roles/родители".parents_descr,
    "roles/родители"."childs/id",
    "roles/родители".level
   FROM public."roles/родители"() "roles/родители"(id, name, descr, disable, parent, "parents/id", parents_id, "parents/name", parents_name, "parents/descr", parents_descr, "childs/id", level)
  WHERE ((3403 = ANY ("roles/родители"."parents/id")) AND ((COALESCE("roles/родители"."childs/id", ARRAY[]::integer[]) = ARRAY[]::integer[]) OR ("roles/родители"."childs/id" = ARRAY[NULL::integer])));


--
-- Name: проекты; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."проекты" AS
 SELECT p.id,
    p.name,
    p.descr,
    p.disable,
    p.parent,
    p."parents/id",
    p.parents_id,
    p."parents/name",
    p.parents_name,
    p."parents/descr",
    p.parents_descr,
    p."childs/id",
    p.level
   FROM (public."roles/родители"() p(id, name, descr, disable, parent, "parents/id", parents_id, "parents/name", parents_name, "parents/descr", parents_descr, "childs/id", level)
     LEFT JOIN public."объекты" o ON ((p.id = o.id)))
  WHERE ((20959 = ANY (p."parents/id")) AND ((COALESCE(p."childs/id", ARRAY[]::integer[]) = ARRAY[]::integer[]) OR (p."childs/id" = ARRAY[NULL::integer]) OR (EXISTS ( SELECT "объекты".id
           FROM public."объекты"
          WHERE ("объекты".id = ANY (p."childs/id"))))) AND (o.id IS NULL));


--
-- Name: движение ДС/внутр перемещения; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."движение ДС/внутр перемещения" AS
 SELECT m.id,
    m.ts,
    m."дата",
    ('-1'::integer * m."сумма") AS "сумма",
    (('-1'::integer)::numeric * sign((m."сумма")::numeric)) AS sign,
    public."категории/родители узла/id"(c.id, true) AS "категории",
    public."категории/родители узла/title"(c.id, false) AS "категория",
    NULL::text AS "контрагент",
    NULL::integer AS "контрагент/id",
    row_to_json(NULL::record) AS "$объект/json",
    NULL::integer AS "объект/id",
    NULL::text AS "объект",
    w2.id AS "кошелек2",
    NULL::text AS "профиль",
    NULL::integer AS "профиль/id",
    ARRAY[ARRAY[(w2."проект")::text, w2.title], ARRAY[(w."проект")::text, w.title]] AS "кошельки",
    ARRAY[ARRAY[w2."проект/id", w2.id], ARRAY[w."проект/id", w.id]] AS "кошельки/id",
    m."примечание"
   FROM (((( SELECT DISTINCT w_1.id,
            w_1.ts,
            w_1.title,
            p.id AS "проект/id",
            p.name AS "проект",
            rm.id2 AS _ref
           FROM (((public."проекты" p
             JOIN public.refs rp ON ((p.id = rp.id1)))
             JOIN public."кошельки" w_1 ON ((w_1.id = rp.id2)))
             JOIN public.refs rm ON ((w_1.id = rm.id1)))) w
     JOIN public."движение денег" m ON ((m.id = w._ref)))
     JOIN ( SELECT c_1.id,
            c_1.ts,
            c_1.title,
            c_1.parent,
            c_1.childs,
            c_1.disabled,
            c_1.img,
            c_1."order",
            rm.id2 AS _ref
           FROM (public."категории" c_1
             JOIN public.refs rm ON ((c_1.id = rm.id1)))) c ON ((m.id = c._ref)))
     JOIN ( SELECT DISTINCT w_1.id,
            w_1.ts,
            w_1.title,
            rm.id1 AS _ref,
            p.name AS "проект",
            p.id AS "проект/id"
           FROM (((public."проекты" p
             JOIN public.refs r ON ((p.id = r.id1)))
             JOIN public."кошельки" w_1 ON ((w_1.id = r.id2)))
             JOIN public.refs rm ON ((w_1.id = rm.id2)))) w2 ON ((w2._ref = m.id)));


--
-- Name: контрагенты; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."контрагенты" (
    id integer DEFAULT nextval('public."ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    title text NOT NULL,
    "реквизиты" jsonb
);


--
-- Name: движение ДС/все платежи; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."движение ДС/все платежи" AS
 SELECT m.id,
    m.ts,
    m."дата",
    m."сумма",
    sign((m."сумма")::numeric) AS sign,
    public."категории/родители узла/id"(c.id, true) AS "категории",
    public."категории/родители узла/title"(c.id, false) AS "категория",
    k.title AS "контрагент",
    k.id AS "контрагент/id",
    row_to_json(ob.*) AS "$объект/json",
    ob.id AS "объект/id",
    ob.name AS "объект",
    w2.id AS "кошелек2",
    array_to_string(pp.names, ' '::text) AS "профиль",
    pp.id AS "профиль/id",
    ARRAY[ARRAY[(w."проект")::text, w.title], ARRAY[(w2."проект")::text, w2.title]] AS "кошельки",
    ARRAY[ARRAY[w."проект/id", w.id], ARRAY[w2."проект/id", w2.id]] AS "кошельки/id",
    m."примечание"
   FROM ((((((( SELECT DISTINCT w_1.id,
            w_1.ts,
            w_1.title,
            p.id AS "проект/id",
            p.name AS "проект",
            rm.id2 AS _ref
           FROM (((public."проекты" p
             JOIN public.refs rp ON ((p.id = rp.id1)))
             JOIN public."кошельки" w_1 ON ((w_1.id = rp.id2)))
             JOIN public.refs rm ON ((w_1.id = rm.id1)))) w
     JOIN public."движение денег" m ON ((m.id = w._ref)))
     JOIN ( SELECT c_1.id,
            c_1.ts,
            c_1.title,
            c_1.parent,
            c_1.childs,
            c_1.disabled,
            c_1.img,
            c_1."order",
            rm.id2 AS _ref
           FROM (public."категории" c_1
             JOIN public.refs rm ON ((c_1.id = rm.id1)))) c ON ((c._ref = m.id)))
     LEFT JOIN ( SELECT DISTINCT w_1.id,
            w_1.ts,
            w_1.title,
            rm.id1 AS _ref,
            p.name AS "проект",
            p.id AS "проект/id"
           FROM (((public."проекты" p
             JOIN public.refs r ON ((p.id = r.id1)))
             JOIN public."кошельки" w_1 ON ((w_1.id = r.id2)))
             JOIN public.refs rm ON ((w_1.id = rm.id2)))) w2 ON ((w2._ref = m.id)))
     LEFT JOIN ( SELECT k_1.id,
            k_1.ts,
            k_1.title,
            k_1."реквизиты",
            rm.id2 AS _ref
           FROM (public."контрагенты" k_1
             JOIN public.refs rm ON ((k_1.id = rm.id1)))) k ON ((k._ref = m.id)))
     LEFT JOIN ( SELECT p.id,
            p.ts,
            p.names,
            p.disable,
            p.tel,
            p.descr,
            p."дата рождения",
            rm.id1 AS _ref
           FROM (public."профили" p
             JOIN public.refs rm ON ((p.id = rm.id2)))) pp ON ((pp._ref = m.id)))
     LEFT JOIN ( SELECT c_1.id,
            c_1.ts,
            c_1.name,
            c_1.disable,
            c_1.descr,
            r.id2 AS _ref
           FROM (public.refs r
             JOIN public.roles c_1 ON ((r.id1 = c_1.id)))) ob ON ((ob._ref = m.id)));


--
-- Name: табель/начисления/объекты; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."табель/начисления/объекты" AS
 SELECT DISTINCT t.id,
    t.ts,
    p.id AS "профиль/id",
    array_to_string(p.names, ' '::text) AS "профиль",
    og.name AS "объект",
    og.id AS "объект/id",
    (public.text2numeric(t."коммент"))::money AS "сумма",
    ((date_trunc('month'::text, (t."дата" + '1 mon'::interval)) - '1 day'::interval))::date AS "дата",
    (((((array_to_string(COALESCE(c."примечание", ARRAY[]::text[]), '
'::text) || ' ('::text) || to_char((t."дата")::timestamp with time zone, 'TMmonth'::text)) || ': '::text) || (og.name)::text) || ')'::text) AS "примечание"
   FROM (((((public."табель" t
     JOIN public.refs ro ON ((t.id = ro.id2)))
     JOIN public.roles og ON ((og.id = ro.id1)))
     JOIN public.refs rp ON ((t.id = rp.id2)))
     JOIN public."профили" p ON ((p.id = rp.id1)))
     LEFT JOIN ( SELECT rp_1.id1 AS pid,
            ro_1.id1 AS oid,
            date_trunc('month'::text, (t_1."дата")::timestamp with time zone) AS "месяц",
            array_agg(t_1."коммент") AS "примечание"
           FROM (((public."табель" t_1
             JOIN public.refs rp_1 ON ((t_1.id = rp_1.id2)))
             JOIN public.refs ro_1 ON ((t_1.id = ro_1.id2)))
             JOIN public.roles og_1 ON ((og_1.id = ro_1.id1)))
          WHERE ((t_1."значение" = 'Примечание'::text) AND (t_1."коммент" IS NOT NULL) AND (t_1."коммент" <> ''::text))
          GROUP BY rp_1.id1, ro_1.id1, (date_trunc('month'::text, (t_1."дата")::timestamp with time zone))) c ON (((p.id = c.pid) AND (og.id = c.oid) AND (public."формат месяц2"(t."дата") = c."месяц"))))
  WHERE ((t."значение" ~* 'начислено$'::text) AND (t."коммент" IS NOT NULL) AND (t."коммент" <> ''::text));


--
-- Name: табель/начисления/отпускные; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."табель/начисления/отпускные" AS
 SELECT t.id,
    t.ts,
    p.id AS "профиль/id",
    array_to_string(p.names, ' '::text) AS "профиль",
    (public.text2numeric(t."коммент"))::money AS "сумма",
    ((date_trunc('month'::text, (t."дата" + '1 mon'::interval)) - '1 day'::interval))::date AS "дата",
    (('('::text || to_char((t."дата")::timestamp with time zone, 'TMmonth'::text)) || ': отпускные)'::text) AS "примечание"
   FROM ((public."табель" t
     JOIN public.refs rp ON ((t.id = rp.id2)))
     JOIN public."профили" p ON ((p.id = rp.id1)))
  WHERE ((t."значение" = 'Отпускные/начислено'::text) AND (t."коммент" IS NOT NULL) AND (t."коммент" <> ''::text));


--
-- Name: табель/начисления/переработка; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."табель/начисления/переработка" AS
 SELECT t.id,
    t.ts,
    p.id AS "профиль/id",
    array_to_string(p.names, ' '::text) AS "профиль",
    (public.text2numeric(t."коммент"))::money AS "сумма",
    ((date_trunc('month'::text, (t."дата" + '1 mon'::interval)) - '1 day'::interval))::date AS "дата",
    (('('::text || to_char((t."дата")::timestamp with time zone, 'TMmonth'::text)) || ': переработка сверх 11 часов)'::text) AS "примечание"
   FROM ((public."табель" t
     JOIN public.refs rp ON ((t.id = rp.id2)))
     JOIN public."профили" p ON ((p.id = rp.id1)))
  WHERE ((t."значение" = 'Переработка/начислено'::text) AND (t."коммент" IS NOT NULL) AND (t."коммент" <> ''::text));


--
-- Name: табель/начисления/суточные; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."табель/начисления/суточные" AS
 SELECT t.id,
    t.ts,
    p.id AS "профиль/id",
    array_to_string(p.names, ' '::text) AS "профиль",
    (public.text2numeric(t."коммент"))::money AS "сумма",
    ((date_trunc('month'::text, (t."дата" + '1 mon'::interval)) - '1 day'::interval))::date AS "дата",
    (('('::text || to_char((t."дата")::timestamp with time zone, 'TMmonth'::text)) || ': суточные)'::text) AS "примечание"
   FROM ((public."табель" t
     JOIN public.refs rp ON ((t.id = rp.id2)))
     JOIN public."профили" p ON ((p.id = rp.id1)))
  WHERE ((t."значение" = 'Суточные/начислено'::text) AND (t."коммент" IS NOT NULL) AND (t."коммент" <> ''::text));


--
-- Name: движение ДС/начисления по табелю; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."движение ДС/начисления по табелю" AS
 SELECT "табель/начисления/объекты".id,
    "табель/начисления/объекты".ts,
    "табель/начисления/объекты"."дата",
    "табель/начисления/объекты"."сумма",
    (1)::numeric AS sign,
    public."категории/родители узла/id"(123439, true) AS "категории",
    public."категории/родители узла/title"(123439, false) AS "категория",
    NULL::text AS "контрагент",
    NULL::integer AS "контрагент/id",
    row_to_json(NULL::record) AS "$объект/json",
    "табель/начисления/объекты"."объект/id",
    "табель/начисления/объекты"."объект",
    NULL::integer AS "кошелек2",
    "табель/начисления/объекты"."профиль",
    "табель/начисления/объекты"."профиль/id",
    ARRAY[ARRAY[NULL::text, ("табель/начисления/объекты"."объект")::text]] AS "кошельки",
    ARRAY[ARRAY[NULL::integer, "табель/начисления/объекты"."объект/id"]] AS "кошельки/id",
    "табель/начисления/объекты"."примечание"
   FROM public."табель/начисления/объекты"
UNION ALL
 SELECT "табель/начисления/переработка".id,
    "табель/начисления/переработка".ts,
    "табель/начисления/переработка"."дата",
    "табель/начисления/переработка"."сумма",
    (1)::numeric AS sign,
    public."категории/родители узла/id"(123441, true) AS "категории",
    public."категории/родители узла/title"(123441, false) AS "категория",
    NULL::text AS "контрагент",
    NULL::integer AS "контрагент/id",
    row_to_json(NULL::record) AS "$объект/json",
    NULL::integer AS "объект/id",
    NULL::character varying AS "объект",
    NULL::integer AS "кошелек2",
    "табель/начисления/переработка"."профиль",
    "табель/начисления/переработка"."профиль/id",
    NULL::text[] AS "кошельки",
    NULL::integer[] AS "кошельки/id",
    "табель/начисления/переработка"."примечание"
   FROM public."табель/начисления/переработка"
UNION ALL
 SELECT "табель/начисления/суточные".id,
    "табель/начисления/суточные".ts,
    "табель/начисления/суточные"."дата",
    "табель/начисления/суточные"."сумма",
    (1)::numeric AS sign,
    public."категории/родители узла/id"(57541, true) AS "категории",
    public."категории/родители узла/title"(57541, false) AS "категория",
    NULL::text AS "контрагент",
    NULL::integer AS "контрагент/id",
    row_to_json(NULL::record) AS "$объект/json",
    NULL::integer AS "объект/id",
    NULL::character varying AS "объект",
    NULL::integer AS "кошелек2",
    "табель/начисления/суточные"."профиль",
    "табель/начисления/суточные"."профиль/id",
    NULL::text[] AS "кошельки",
    NULL::integer[] AS "кошельки/id",
    "табель/начисления/суточные"."примечание"
   FROM public."табель/начисления/суточные"
UNION ALL
 SELECT "табель/начисления/отпускные".id,
    "табель/начисления/отпускные".ts,
    "табель/начисления/отпускные"."дата",
    "табель/начисления/отпускные"."сумма",
    (1)::numeric AS sign,
    public."категории/родители узла/id"(104845, true) AS "категории",
    public."категории/родители узла/title"(104845, false) AS "категория",
    NULL::text AS "контрагент",
    NULL::integer AS "контрагент/id",
    row_to_json(NULL::record) AS "$объект/json",
    NULL::integer AS "объект/id",
    NULL::character varying AS "объект",
    NULL::integer AS "кошелек2",
    "табель/начисления/отпускные"."профиль",
    "табель/начисления/отпускные"."профиль/id",
    NULL::text[] AS "кошельки",
    NULL::integer[] AS "кошельки/id",
    "табель/начисления/отпускные"."примечание"
   FROM public."табель/начисления/отпускные";


--
-- Name: движение ДС/начисления сотрудника; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."движение ДС/начисления сотрудника" AS
 SELECT t.id,
    t.ts,
    t."дата",
    t."сумма",
    t.sign,
    t."категории",
    t."категория",
    t."контрагент",
    t."контрагент/id",
    t."$объект/json",
    t."объект/id",
    t."объект",
    t."кошелек2",
    t."профиль",
    t."профиль/id",
    t."кошельки",
    t."кошельки/id",
    t."примечание"
   FROM public."движение ДС/начисления по табелю" t
UNION ALL
 SELECT m.id,
    m.ts,
    m."дата",
    m."сумма",
    sign((m."сумма")::numeric) AS sign,
    public."категории/родители узла/id"(c.id, true) AS "категории",
    public."категории/родители узла/title"(c.id, false) AS "категория",
    NULL::text AS "контрагент",
    NULL::integer AS "контрагент/id",
    row_to_json(NULL::record) AS "$объект/json",
    NULL::integer AS "объект/id",
    NULL::text AS "объект",
    NULL::integer AS "кошелек2",
    array_to_string(p.names, ' '::text) AS "профиль",
    p.id AS "профиль/id",
    NULL::text[] AS "кошельки",
    ARRAY[ARRAY[pr.id, NULL::integer]] AS "кошельки/id",
    m."примечание"
   FROM ((((((((public."движение денег" m
     JOIN public.refs rc ON ((m.id = rc.id2)))
     JOIN public."категории" c ON ((c.id = rc.id1)))
     JOIN public.refs rp ON ((m.id = rp.id1)))
     JOIN public."профили" p ON ((p.id = rp.id2)))
     LEFT JOIN ( SELECT DISTINCT p_1.id,
            r.id2
           FROM (public."проекты" p_1
             JOIN public.refs r ON ((p_1.id = r.id1)))) pr ON ((p.id = pr.id2)))
     JOIN public.refs rt ON ((m.id = rt.id1)))
     JOIN public."табель" t ON (((t.id = rt.id2) AND (date_trunc('month'::text, (t."дата")::timestamp with time zone) = date_trunc('month'::text, (m."дата")::timestamp with time zone)))))
     JOIN public.refs rpt ON (((t.id = rpt.id2) AND (rpt.id1 = p.id))))
  WHERE (((sign((m."сумма")::numeric) = (1)::numeric) OR (c.id = 74315)) AND (t."значение" = 'РасчетЗП'::text) AND (t."коммент" IS NOT NULL));


--
-- Name: движение ДС/по сотрудникам; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."движение ДС/по сотрудникам" AS
 SELECT m.id,
    m.ts,
    m."дата",
    m."сумма",
    sign((m."сумма")::numeric) AS sign,
    c.id AS "категория/id",
    public."категории/родители узла/id"(c.id, true) AS "категории/id",
    public."категории/родители узла/title"(c.id, false) AS "категории",
    NULL::text AS "контрагент",
    NULL::integer AS "контрагент/id",
    row_to_json(NULL::record) AS "$объект/json",
    NULL::integer AS "объект/id",
    NULL::text AS "объект",
    NULL::integer AS "кошелек2",
    array_to_string(pp.names, ' '::text) AS "профиль",
    pp.id AS "профиль/id",
    ARRAY[ARRAY[(w."проект")::text, w.title]] AS "кошельки",
    ARRAY[ARRAY[w."проект/id", w.id]] AS "кошельки/id",
    m."примечание"
   FROM (((( SELECT DISTINCT w_1.id,
            w_1.ts,
            w_1.title,
            p.id AS "проект/id",
            p.name AS "проект",
            rm.id2 AS _ref
           FROM (((public."проекты" p
             JOIN public.refs rp ON ((p.id = rp.id1)))
             JOIN public."кошельки" w_1 ON ((w_1.id = rp.id2)))
             JOIN public.refs rm ON ((w_1.id = rm.id1)))) w
     JOIN public."движение денег" m ON ((m.id = w._ref)))
     JOIN ( SELECT c_1.id,
            c_1.ts,
            c_1.title,
            c_1.parent,
            c_1.childs,
            c_1.disabled,
            c_1.img,
            c_1."order",
            rm.id2 AS _ref
           FROM (public."категории" c_1
             JOIN public.refs rm ON ((c_1.id = rm.id1)))) c ON ((m.id = c._ref)))
     JOIN ( SELECT p.id,
            p.ts,
            p.names,
            p.disable,
            p.tel,
            p.descr,
            p."дата рождения",
            rm.id1 AS _ref
           FROM (public."профили" p
             JOIN public.refs rm ON ((p.id = rm.id2)))) pp ON ((pp._ref = m.id)));


--
-- Name: контрагенты/проекты; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."контрагенты/проекты" AS
 SELECT DISTINCT k.id,
    k.ts,
    k.title,
    k."реквизиты",
    p.id AS "проект/id",
    p.name AS "проект"
   FROM (public."контрагенты" k
     LEFT JOIN ( SELECT p_1.id,
            p_1.name,
            p_1.descr,
            p_1.disable,
            p_1.parent,
            p_1."parents/id",
            p_1.parents_id,
            p_1."parents/name",
            p_1.parents_name,
            p_1."parents/descr",
            p_1.parents_descr,
            p_1."childs/id",
            p_1.level,
            r.id2
           FROM (public."проекты" p_1
             JOIN public.refs r ON ((p_1.id = r.id1)))) p ON ((k.id = p.id2)));


--
-- Name: проекты/объекты; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."проекты/объекты" AS
 SELECT o.id,
    o.id AS "объект/id",
    o.name,
    o.name AS "объект",
    p.id AS "проект/id",
    p.name AS "проект",
    k.id AS "контрагент/id",
    row_to_json(k.*) AS "$контрагент/json",
    row_to_json(p.*) AS "$проект/json"
   FROM ((public."объекты" o
     LEFT JOIN ( SELECT DISTINCT p_1.id,
            p_1.name,
            r.id2
           FROM (public.refs r
             JOIN public."проекты" p_1 ON ((p_1.id = r.id1)))) p ON ((o.id = p.id2)))
     LEFT JOIN ( SELECT k_1.id,
            k_1.ts,
            k_1.title,
            k_1."реквизиты",
            r.id1
           FROM (public.refs r
             JOIN public."контрагенты" k_1 ON ((k_1.id = r.id2)))) k ON ((p.id = k.id1)));


--
-- Name: проекты000; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."проекты000" (
    id integer DEFAULT nextval('public."ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    title text NOT NULL,
    disabled boolean
);


--
-- Name: профили/приемы-увольнения; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."профили/приемы-увольнения" (
    id integer DEFAULT nextval('public."ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    "дата приема" date NOT NULL,
    "дата увольнения" date,
    "причина увольнения" text
);


--
-- Name: разное; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."разное" (
    id integer DEFAULT nextval('public."ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    uid integer NOT NULL,
    key text NOT NULL,
    val jsonb NOT NULL
);


--
-- Name: тмц; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."тмц" (
    id integer DEFAULT nextval('public."ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    uid integer,
    "количество" numeric NOT NULL,
    "цена" money,
    "коммент" text,
    "количество/принято" numeric,
    "дата/принято" timestamp without time zone,
    "принял" integer,
    "простая поставка" boolean,
    "списать" boolean
);


--
-- Name: тмц/заявки; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."тмц/заявки" (
    id integer DEFAULT nextval('public."ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    uid integer,
    "дата1" date NOT NULL,
    "наименование" text,
    "количество" numeric NOT NULL,
    "коммент" text
);


--
-- Name: транспорт/заявки; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."транспорт/заявки" (
    id integer DEFAULT nextval('public."ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    uid integer NOT NULL,
    "дата1" date NOT NULL,
    "дата2" date,
    "откуда" jsonb,
    "куда" jsonb,
    "груз" text,
    "водитель" text[],
    "стоимость" money,
    "тип стоимости" integer,
    "факт" numeric,
    "дата оплаты" date,
    "док оплаты" text,
    "коммент" text,
    "контакт1" text[],
    "контакт2" text[],
    "дата получения док" date,
    "дата оплаты по договору" date,
    "контакт3" text[],
    "сумма/посредник-ГП" money,
    "контрагенты" integer[],
    "дата3" date,
    "контакт4" text[],
    "номер" text,
    "маршрут на круг" boolean,
    "директор1" text[],
    "отозвать" boolean,
    "контакты" text[],
    "заказчики" integer[],
    "грузоотправители" integer[],
    "контакты заказчиков" text[],
    "контакты грузоотправителей" text[],
    "сумма/посреднику" money[],
    "снабженец" integer,
    "с объекта" integer,
    "на объект" integer,
    "без транспорта" boolean,
    "стоимость/с НДС" boolean,
    "стоимость/оплата" public.oplata
);


--
-- Name: тмц/движение/для остатков; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."тмц/движение/для остатков" AS
 SELECT t.id,
    tzo."транспорт/заявки/id",
    'приход'::text AS "движение",
    COALESCE(COALESCE(tzo.id, z."объект/id"), ot.id) AS "объект/id",
        CASE
            WHEN (tzo.id IS NOT NULL) THEN COALESCE(z."объект/id", ot.id)
            ELSE NULL::integer
        END AS "объект2/id",
    COALESCE(z."номенклатура/id", n.id) AS "номенклатура/id",
    t."количество/принято",
    COALESCE(t."принял", t.uid) AS "принял/профиль/id",
    row_to_json(t.*) AS "$тмц/json",
    t."цена",
    t."дата/принято"
   FROM ((((public."тмц" t
     LEFT JOIN ( SELECT o.id,
            o.ts,
            o.name,
            o.disable,
            o.descr,
            tz.id AS "транспорт/заявки/id",
            r.id1
           FROM (((public.refs r
             JOIN public."транспорт/заявки" tz ON ((r.id2 = tz.id)))
             JOIN public.refs ro ON ((tz."на объект" = ro.id)))
             JOIN public.roles o ON ((o.id = ro.id1)))) tzo ON ((tzo.id1 = t.id)))
     LEFT JOIN ( SELECT m.id,
            m.ts,
            m.uid,
            m."дата1",
            m."наименование",
            m."количество",
            m."коммент",
            o.id AS "объект/id",
            n_1.id AS "номенклатура/id",
            r.id2
           FROM (((public."тмц/заявки" m
             JOIN public.refs r ON ((m.id = r.id1)))
             JOIN ( SELECT o_1.id,
                    o_1.ts,
                    o_1.name,
                    o_1.disable,
                    o_1.descr,
                    r_1.id2
                   FROM (public.refs r_1
                     JOIN public.roles o_1 ON ((r_1.id1 = o_1.id)))) o ON ((o.id2 = m.id)))
             JOIN ( SELECT c.id,
                    c.ts,
                    c.uid,
                    c.title,
                    c.disable,
                    c.descr,
                    r_1.id2
                   FROM (public.refs r_1
                     JOIN public."номенклатура" c ON ((r_1.id1 = c.id)))) n_1 ON ((n_1.id2 = m.id)))) z ON ((t.id = z.id2)))
     LEFT JOIN ( SELECT n_1.id,
            n_1.ts,
            n_1.uid,
            n_1.title,
            n_1.disable,
            n_1.descr,
            r.id2
           FROM (public.refs r
             JOIN public."номенклатура" n_1 ON ((n_1.id = r.id1)))) n ON ((n.id2 = t.id)))
     LEFT JOIN ( SELECT o.id,
            o.ts,
            o.name,
            o.disable,
            o.descr,
            r.id2
           FROM (public.refs r
             JOIN public.roles o ON ((r.id1 = o.id)))) ot ON ((ot.id2 = t.id)))
  WHERE (t."количество/принято" IS NOT NULL)
UNION ALL
 SELECT t.id,
    tzo."транспорт/заявки/id",
    'расход'::text AS "движение",
    tzo.id AS "объект/id",
    COALESCE(z."объект/id", ot.id) AS "объект2/id",
    COALESCE(z."номенклатура/id", n.id) AS "номенклатура/id",
    (- t."количество/принято") AS "количество/принято",
    COALESCE(t."принял", t.uid) AS "принял/профиль/id",
    row_to_json(t.*) AS "$тмц/json",
    t."цена",
    t."дата/принято"
   FROM ((((public."тмц" t
     JOIN ( SELECT o.id,
            o.ts,
            o.name,
            o.disable,
            o.descr,
            tz.id AS "транспорт/заявки/id",
            r.id1
           FROM ((((public.refs r
             JOIN public."транспорт/заявки" tz ON ((r.id2 = tz.id)))
             JOIN public.refs ro ON ((tz."с объекта" = ro.id)))
             JOIN public.roles o ON ((o.id = ro.id1)))
             LEFT JOIN public.refs ro2 ON ((tz."на объект" = ro2.id)))) tzo ON ((tzo.id1 = t.id)))
     LEFT JOIN ( SELECT m.id,
            m.ts,
            m.uid,
            m."дата1",
            m."наименование",
            m."количество",
            m."коммент",
            o.id AS "объект/id",
            n_1.id AS "номенклатура/id",
            r.id2
           FROM (((public."тмц/заявки" m
             JOIN public.refs r ON ((m.id = r.id1)))
             LEFT JOIN ( SELECT o_1.id,
                    o_1.ts,
                    o_1.name,
                    o_1.disable,
                    o_1.descr,
                    r_1.id2
                   FROM (public.refs r_1
                     JOIN public.roles o_1 ON ((r_1.id1 = o_1.id)))) o ON ((o.id2 = m.id)))
             JOIN ( SELECT c.id,
                    c.ts,
                    c.uid,
                    c.title,
                    c.disable,
                    c.descr,
                    r_1.id2
                   FROM (public.refs r_1
                     JOIN public."номенклатура" c ON ((r_1.id1 = c.id)))) n_1 ON ((n_1.id2 = m.id)))) z ON ((t.id = z.id2)))
     LEFT JOIN ( SELECT n_1.id,
            n_1.ts,
            n_1.uid,
            n_1.title,
            n_1.disable,
            n_1.descr,
            r.id2
           FROM (public.refs r
             JOIN public."номенклатура" n_1 ON ((n_1.id = r.id1)))) n ON ((n.id2 = t.id)))
     LEFT JOIN ( SELECT o.id,
            o.ts,
            o.name,
            o.disable,
            o.descr,
            r.id2
           FROM (public.refs r
             JOIN public.roles o ON ((r.id1 = o.id)))) ot ON ((ot.id2 = t.id)))
  WHERE (t."количество/принято" IS NOT NULL)
UNION ALL
 SELECT t.id,
    tzo."транспорт/заявки/id",
    'расход'::text AS "движение",
    COALESCE(z."объект/id", ot.id) AS "объект/id",
    0 AS "объект2/id",
    COALESCE(z."номенклатура/id", n.id) AS "номенклатура/id",
    (- t."количество/принято") AS "количество/принято",
    COALESCE(t."принял", t.uid) AS "принял/профиль/id",
    row_to_json(t.*) AS "$тмц/json",
    t."цена",
    t."дата/принято"
   FROM ((((public."тмц" t
     JOIN ( SELECT tz.id,
            tz.ts,
            tz.uid,
            tz."дата1",
            tz."дата2",
            tz."откуда",
            tz."куда",
            tz."груз",
            tz."водитель",
            tz."стоимость",
            tz."тип стоимости",
            tz."факт",
            tz."дата оплаты",
            tz."док оплаты",
            tz."коммент",
            tz."контакт1",
            tz."контакт2",
            tz."дата получения док",
            tz."дата оплаты по договору",
            tz."контакт3",
            tz."сумма/посредник-ГП",
            tz."контрагенты",
            tz."дата3",
            tz."контакт4",
            tz."номер",
            tz."маршрут на круг",
            tz."директор1",
            tz."отозвать",
            tz."контакты",
            tz."заказчики",
            tz."грузоотправители",
            tz."контакты заказчиков",
            tz."контакты грузоотправителей",
            tz."сумма/посреднику",
            tz."снабженец",
            tz."с объекта",
            tz."на объект",
            tz."без транспорта",
            tz."стоимость/с НДС",
            tz."стоимость/оплата",
            tz.id AS "транспорт/заявки/id",
            r.id1
           FROM (public.refs r
             JOIN public."транспорт/заявки" tz ON ((r.id2 = tz.id)))) tzo ON ((tzo.id1 = t.id)))
     LEFT JOIN ( SELECT m.id,
            m.ts,
            m.uid,
            m."дата1",
            m."наименование",
            m."количество",
            m."коммент",
            o.id AS "объект/id",
            n_1.id AS "номенклатура/id",
            r.id2
           FROM (((public."тмц/заявки" m
             JOIN public.refs r ON ((m.id = r.id1)))
             LEFT JOIN ( SELECT o_1.id,
                    o_1.ts,
                    o_1.name,
                    o_1.disable,
                    o_1.descr,
                    r_1.id2
                   FROM (public.refs r_1
                     JOIN public.roles o_1 ON ((r_1.id1 = o_1.id)))) o ON ((o.id2 = m.id)))
             JOIN ( SELECT c.id,
                    c.ts,
                    c.uid,
                    c.title,
                    c.disable,
                    c.descr,
                    r_1.id2
                   FROM (public.refs r_1
                     JOIN public."номенклатура" c ON ((r_1.id1 = c.id)))) n_1 ON ((n_1.id2 = m.id)))) z ON ((t.id = z.id2)))
     LEFT JOIN ( SELECT n_1.id,
            n_1.ts,
            n_1.uid,
            n_1.title,
            n_1.disable,
            n_1.descr,
            r.id2
           FROM (public.refs r
             JOIN public."номенклатура" n_1 ON ((n_1.id = r.id1)))) n ON ((n.id2 = t.id)))
     LEFT JOIN ( SELECT o.id,
            o.ts,
            o.name,
            o.disable,
            o.descr,
            r.id2
           FROM (public.refs r
             JOIN public.roles o ON ((r.id1 = o.id)))) ot ON ((ot.id2 = t.id)))
  WHERE ((t."количество/принято" IS NOT NULL) AND t."списать")
UNION ALL
 SELECT t.id,
    NULL::integer AS "транспорт/заявки/id",
    o2."движение",
    o2.id AS "объект/id",
    o1.id AS "объект2/id",
    n.id AS "номенклатура/id",
    (
        CASE
            WHEN (o2."движение" = 'расход'::text) THEN (- (1)::numeric)
            ELSE (1)::numeric
        END * t."количество") AS "количество/принято",
    COALESCE(t."принял", t.uid) AS "принял/профиль/id",
    row_to_json(t.*) AS "$тмц/json",
    t."цена",
    t.ts AS "дата/принято"
   FROM (((((public."тмц/заявки" z
     JOIN public.refs rz ON ((z.id = rz.id1)))
     JOIN public."тмц" t ON ((t.id = rz.id2)))
     JOIN ( SELECT c.id,
            c.ts,
            c.uid,
            c.title,
            c.disable,
            c.descr,
            z_1.id AS "тмц/заявки/id"
           FROM ((public."тмц/заявки" z_1
             JOIN public.refs r ON ((z_1.id = r.id1)))
             JOIN public."номенклатура" c ON ((r.id1 = c.id)))) n ON ((z.id = n."тмц/заявки/id")))
     JOIN ( SELECT z_1.id AS "тмц/заявки/id",
            o.id,
            o.ts,
            o.name,
            o.disable,
            o.descr
           FROM ((public."тмц/заявки" z_1
             JOIN public.refs r ON (((z_1.id = r.id1) OR (z_1.id = r.id2))))
             JOIN public.roles o ON (((o.id = r.id1) OR (o.id = r.id2))))) o1 ON ((z.id = o1."тмц/заявки/id")))
     JOIN ( SELECT t_1.id AS "тмц/id",
            o.id,
            o.ts,
            o.name,
            o.disable,
            o.descr,
                CASE
                    WHEN (o.id = r.id1) THEN 'расход'::text
                    WHEN (o.id = r.id2) THEN 'приход'::text
                    ELSE NULL::text
                END AS "движение",
            ARRAY[r.id1, r.id2] AS _rid
           FROM ((public."тмц" t_1
             JOIN public.refs r ON (((t_1.id = r.id1) OR (t_1.id = r.id2))))
             JOIN public.roles o ON (((o.id = r.id1) OR (o.id = r.id2))))) o2 ON ((t.id = o2."тмц/id")))
  WHERE ((t."количество" IS NOT NULL) AND t."простая поставка");


--
-- Name: тмц/движение; Type: VIEW; Schema: public; Owner: -
--

CREATE VIEW public."тмц/движение" AS
 SELECT "тмц/движение/для остатков".id,
    "тмц/движение/для остатков"."транспорт/заявки/id",
    "тмц/движение/для остатков"."движение",
    "тмц/движение/для остатков"."объект/id",
    "тмц/движение/для остатков"."объект2/id",
    "тмц/движение/для остатков"."номенклатура/id",
    "тмц/движение/для остатков"."количество/принято",
    "тмц/движение/для остатков"."принял/профиль/id",
    "тмц/движение/для остатков"."$тмц/json",
    "тмц/движение/для остатков"."цена",
    "тмц/движение/для остатков"."дата/принято"
   FROM public."тмц/движение/для остатков"
UNION ALL
 SELECT t.id,
    NULL::integer AS "транспорт/заявки/id",
    'приход-списание'::text AS "движение",
    o1.id AS "объект/id",
    NULL::integer AS "объект2/id",
    n.id AS "номенклатура/id",
    t."количество" AS "количество/принято",
    t.uid AS "принял/профиль/id",
    row_to_json(t.*) AS "$тмц/json",
    t."цена",
    t.ts AS "дата/принято"
   FROM ((((public."тмц/заявки" z
     JOIN public.refs rz ON ((z.id = rz.id1)))
     JOIN public."тмц" t ON ((t.id = rz.id2)))
     JOIN ( SELECT c.id,
            c.ts,
            c.uid,
            c.title,
            c.disable,
            c.descr,
            z_1.id AS "тмц/заявки/id"
           FROM ((public."тмц/заявки" z_1
             JOIN public.refs r ON ((z_1.id = r.id2)))
             JOIN public."номенклатура" c ON ((r.id1 = c.id)))) n ON ((z.id = n."тмц/заявки/id")))
     JOIN ( SELECT z_1.id AS "тмц/заявки/id",
            o.id,
            o.ts,
            o.name,
            o.disable,
            o.descr
           FROM ((public."тмц/заявки" z_1
             JOIN public.refs r ON (((z_1.id = r.id1) OR (z_1.id = r.id2))))
             JOIN public.roles o ON (((o.id = r.id1) OR (o.id = r.id2))))) o1 ON ((z.id = o1."тмц/заявки/id")))
  WHERE ((t."количество" IS NOT NULL) AND t."простая поставка")
UNION ALL
 SELECT t.id,
    NULL::integer AS "транспорт/заявки/id",
    'списание'::text AS "движение",
    o1.id AS "объект/id",
    NULL::integer AS "объект2/id",
    n.id AS "номенклатура/id",
    ((- (1)::numeric) * t."количество") AS "количество/принято",
    t.uid AS "принял/профиль/id",
    row_to_json(t.*) AS "$тмц/json",
    t."цена",
    t.ts AS "дата/принято"
   FROM ((((public."тмц/заявки" z
     JOIN public.refs rz ON ((z.id = rz.id1)))
     JOIN public."тмц" t ON ((t.id = rz.id2)))
     JOIN ( SELECT c.id,
            c.ts,
            c.uid,
            c.title,
            c.disable,
            c.descr,
            z_1.id AS "тмц/заявки/id"
           FROM ((public."тмц/заявки" z_1
             JOIN public.refs r ON ((z_1.id = r.id2)))
             JOIN public."номенклатура" c ON ((r.id1 = c.id)))) n ON ((z.id = n."тмц/заявки/id")))
     JOIN ( SELECT z_1.id AS "тмц/заявки/id",
            o.id,
            o.ts,
            o.name,
            o.disable,
            o.descr
           FROM ((public."тмц/заявки" z_1
             JOIN public.refs r ON (((z_1.id = r.id1) OR (z_1.id = r.id2))))
             JOIN public.roles o ON (((o.id = r.id1) OR (o.id = r.id2))))) o1 ON ((z.id = o1."тмц/заявки/id")))
  WHERE ((t."количество" IS NOT NULL) AND t."простая поставка");


--
-- Name: тмц/инвентаризации; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."тмц/инвентаризации" (
    id integer DEFAULT nextval('public."ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    uid integer,
    "дата1" date NOT NULL,
    "коммент" text
);


--
-- Name: тмц/резерв; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."тмц/резерв" (
    id integer DEFAULT nextval('public."ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    "запросил" integer NOT NULL,
    "количество" numeric NOT NULL,
    "резервировал" integer,
    "количество/резерв" numeric,
    "ts/резерв" timestamp without time zone,
    "коммент/резерв" text
);


--
-- Name: транспорт; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."транспорт" (
    id integer DEFAULT nextval('public."ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    uid integer NOT NULL,
    title character varying NOT NULL,
    descr text
);


--
-- Name: транспорт/заявки/номер; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public."транспорт/заявки/номер"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ИД; Type: SEQUENCE; Schema: медкол; Owner: -
--

CREATE SEQUENCE "медкол"."ИД"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: названия тестов; Type: TABLE; Schema: медкол; Owner: -
--

CREATE TABLE "медкол"."названия тестов" (
    id integer DEFAULT nextval('"медкол"."ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    "название" text NOT NULL,
    "задать вопросов" integer,
    "всего время" integer
);


--
-- Name: процесс сдачи; Type: TABLE; Schema: медкол; Owner: -
--

CREATE TABLE "медкол"."процесс сдачи" (
    id integer DEFAULT nextval('"медкол"."ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    "ответ" integer,
    "время ответа" timestamp without time zone
);


--
-- Name: связи; Type: TABLE; Schema: медкол; Owner: -
--

CREATE TABLE "медкол"."связи" (
    id integer DEFAULT nextval('"медкол"."ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    id1 integer NOT NULL,
    id2 integer NOT NULL,
    CONSTRAINT "id1 == id2" CHECK ((id1 <> id2))
);


--
-- Name: сессии; Type: TABLE; Schema: медкол; Owner: -
--

CREATE TABLE "медкол"."сессии" (
    id integer DEFAULT nextval('"медкол"."ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    "задать вопросов" integer
);


--
-- Name: тестовые вопросы; Type: TABLE; Schema: медкол; Owner: -
--

CREATE TABLE "медкол"."тестовые вопросы" (
    id integer DEFAULT nextval('"медкол"."ИД"'::regclass) NOT NULL,
    ts timestamp without time zone DEFAULT now() NOT NULL,
    "код" text NOT NULL,
    "вопрос" text NOT NULL,
    "ответы" text[] NOT NULL
);


--
-- Name: actions actions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.actions
    ADD CONSTRAINT actions_pkey PRIMARY KEY (id);


--
-- Name: controllers controllers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.controllers
    ADD CONSTRAINT controllers_pkey PRIMARY KEY (id);


--
-- Name: logins logins_login_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logins
    ADD CONSTRAINT logins_login_key UNIQUE (login);


--
-- Name: logins logins_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.logins
    ADD CONSTRAINT logins_pkey PRIMARY KEY (id);


--
-- Name: namespaces namespaces_namespace_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.namespaces
    ADD CONSTRAINT namespaces_namespace_key UNIQUE (namespace);


--
-- Name: namespaces namespaces_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.namespaces
    ADD CONSTRAINT namespaces_pkey PRIMARY KEY (id);


--
-- Name: oauth.sites oauth.sites_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."oauth.sites"
    ADD CONSTRAINT "oauth.sites_name_key" UNIQUE (name);


--
-- Name: oauth.sites oauth.sites_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."oauth.sites"
    ADD CONSTRAINT "oauth.sites_pkey" PRIMARY KEY (id);


--
-- Name: oauth.users oauth.users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."oauth.users"
    ADD CONSTRAINT "oauth.users_pkey" PRIMARY KEY (id);


--
-- Name: oauth.users oauth.users_site_id_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."oauth.users"
    ADD CONSTRAINT "oauth.users_site_id_user_id_key" UNIQUE (site_id, user_id);


--
-- Name: refs refs_id1_id2_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refs
    ADD CONSTRAINT refs_id1_id2_key UNIQUE (id1, id2);


--
-- Name: refs refs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refs
    ADD CONSTRAINT refs_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: routes routes_name_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.routes
    ADD CONSTRAINT routes_name_key UNIQUE (name);


--
-- Name: routes routes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.routes
    ADD CONSTRAINT routes_pkey PRIMARY KEY (id);


--
-- Name: routes routes_request_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.routes
    ADD CONSTRAINT routes_request_key UNIQUE (request);


--
-- Name: гости гости_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."гости"
    ADD CONSTRAINT "гости_pkey" PRIMARY KEY (id);


--
-- Name: движение денег движение денег_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."движение денег"
    ADD CONSTRAINT "движение денег_pkey" PRIMARY KEY (id);


--
-- Name: категории категории транспорта_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."категории"
    ADD CONSTRAINT "категории транспорта_pkey" PRIMARY KEY (id);


--
-- Name: контрагенты контрагенты_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."контрагенты"
    ADD CONSTRAINT "контрагенты_pkey" PRIMARY KEY (id);


--
-- Name: контрагенты контрагенты_title_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."контрагенты"
    ADD CONSTRAINT "контрагенты_title_key" UNIQUE (title);


--
-- Name: кошельки кошельки_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."кошельки"
    ADD CONSTRAINT "кошельки_pkey" PRIMARY KEY (id);


--
-- Name: номенклатура номенклатура_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."номенклатура"
    ADD CONSTRAINT "номенклатура_pkey" PRIMARY KEY (id);


--
-- Name: проекты000 проекты_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."проекты000"
    ADD CONSTRAINT "проекты_pkey" PRIMARY KEY (id);


--
-- Name: профили/приемы-увольнения профили/приемы-увольнения_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."профили/приемы-увольнения"
    ADD CONSTRAINT "профили/приемы-увольнения_pkey" PRIMARY KEY (id);


--
-- Name: профили профили_names_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."профили"
    ADD CONSTRAINT "профили_names_key" UNIQUE (names);


--
-- Name: профили профили_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."профили"
    ADD CONSTRAINT "профили_pkey" PRIMARY KEY (id);


--
-- Name: разное разное_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."разное"
    ADD CONSTRAINT "разное_pkey" PRIMARY KEY (id);


--
-- Name: табель табель_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."табель"
    ADD CONSTRAINT "табель_pkey" PRIMARY KEY (id);


--
-- Name: тмц/заявки тмц/заявки_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."тмц/заявки"
    ADD CONSTRAINT "тмц/заявки_pkey" PRIMARY KEY (id);


--
-- Name: тмц/инвентаризации тмц/инвентаризации_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."тмц/инвентаризации"
    ADD CONSTRAINT "тмц/инвентаризации_pkey" PRIMARY KEY (id);


--
-- Name: тмц/резерв тмц/резерв_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."тмц/резерв"
    ADD CONSTRAINT "тмц/резерв_pkey" PRIMARY KEY (id);


--
-- Name: тмц тмц_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."тмц"
    ADD CONSTRAINT "тмц_pkey" PRIMARY KEY (id);


--
-- Name: транспорт/заявки транспорт/заявки_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."транспорт/заявки"
    ADD CONSTRAINT "транспорт/заявки_pkey" PRIMARY KEY (id);


--
-- Name: транспорт транспорт_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."транспорт"
    ADD CONSTRAINT "транспорт_pkey" PRIMARY KEY (id);


--
-- Name: названия тестов названия тестов_pkey; Type: CONSTRAINT; Schema: медкол; Owner: -
--

ALTER TABLE ONLY "медкол"."названия тестов"
    ADD CONSTRAINT "названия тестов_pkey" PRIMARY KEY (id);


--
-- Name: названия тестов названия тестов_название_key; Type: CONSTRAINT; Schema: медкол; Owner: -
--

ALTER TABLE ONLY "медкол"."названия тестов"
    ADD CONSTRAINT "названия тестов_название_key" UNIQUE ("название");


--
-- Name: процесс сдачи процесс сдачи_pkey; Type: CONSTRAINT; Schema: медкол; Owner: -
--

ALTER TABLE ONLY "медкол"."процесс сдачи"
    ADD CONSTRAINT "процесс сдачи_pkey" PRIMARY KEY (id);


--
-- Name: связи связи_id1_id2_key; Type: CONSTRAINT; Schema: медкол; Owner: -
--

ALTER TABLE ONLY "медкол"."связи"
    ADD CONSTRAINT "связи_id1_id2_key" UNIQUE (id1, id2);


--
-- Name: связи связи_pkey; Type: CONSTRAINT; Schema: медкол; Owner: -
--

ALTER TABLE ONLY "медкол"."связи"
    ADD CONSTRAINT "связи_pkey" PRIMARY KEY (id);


--
-- Name: сессии сессии_pkey; Type: CONSTRAINT; Schema: медкол; Owner: -
--

ALTER TABLE ONLY "медкол"."сессии"
    ADD CONSTRAINT "сессии_pkey" PRIMARY KEY (id);


--
-- Name: тестовые вопросы тестовые вопросы_pkey; Type: CONSTRAINT; Schema: медкол; Owner: -
--

ALTER TABLE ONLY "медкол"."тестовые вопросы"
    ADD CONSTRAINT "тестовые вопросы_pkey" PRIMARY KEY (id);


--
-- Name: тестовые вопросы тестовые вопросы_код_key; Type: CONSTRAINT; Schema: медкол; Owner: -
--

ALTER TABLE ONLY "медкол"."тестовые вопросы"
    ADD CONSTRAINT "тестовые вопросы_код_key" UNIQUE ("код");


--
-- Name: idx/roles/name; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx/roles/name" ON public.roles USING btree (name);


--
-- Name: idx/движение денег/дата; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx/движение денег/дата" ON public."движение денег" USING btree ("дата");


--
-- Name: idx/разное/лkey; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx/разное/лkey" ON public."разное" USING btree (key);


--
-- Name: idx/транспорт/заявки/дата; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "idx/транспорт/заявки/дата" ON public."транспорт/заявки" USING btree ("дата1");


--
-- Name: refs_id2_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX refs_id2_idx ON public.refs USING btree (id2);


--
-- Name: табель/значение/индекс; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "табель/значение/индекс" ON public."табель" USING btree ("значение");


--
-- Name: табель/индекс по месяцам2; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "табель/индекс по месяцам2" ON public."табель" USING btree (public."формат месяц2"("дата"));


--
-- Name: табель/коммент/индекс; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "табель/коммент/индекс" ON public."табель" USING btree ("коммент");


--
-- Name: табель/коммент/индекс/not null; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "табель/коммент/индекс/not null" ON public."табель" USING btree ((("коммент" IS NOT NULL)));


--
-- Name: трансп/заявки-без трансп-null; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "трансп/заявки-без трансп-null" ON public."транспорт/заявки" USING btree ("без транспорта") WHERE ("без транспорта" IS NULL);


--
-- Name: транспорт/заявки/уник-номер-год_да; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "транспорт/заявки/уник-номер-год_да" ON public."транспорт/заявки" USING btree ("номер", date_part('year'::text, "дата1"));


--
-- Name: связи/индекс id2; Type: INDEX; Schema: медкол; Owner: -
--

CREATE INDEX "связи/индекс id2" ON "медкол"."связи" USING btree (id2);


--
-- Name: refs check_category; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER check_category BEFORE INSERT OR UPDATE ON public.refs FOR EACH ROW EXECUTE PROCEDURE public.check_category();


--
-- Name: refs check_nomen; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER check_nomen BEFORE INSERT OR UPDATE ON public.refs FOR EACH ROW EXECUTE PROCEDURE public.check_nomen();


--
-- Name: refs check_role; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER check_role BEFORE INSERT OR UPDATE ON public.refs FOR EACH ROW EXECUTE PROCEDURE public.check_role();


--
-- PostgreSQL database dump complete
--

