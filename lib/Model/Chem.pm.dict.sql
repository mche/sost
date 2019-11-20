@@ схема
CREATE SCHEMA IF NOT EXISTS "химия";
CREATE SEQUENCE IF NOT EXISTS "химия"."ИД";

create table IF NOT EXISTS "химия"."номенклатура" (
  id integer  NOT NULL DEFAULT nextval('"химия"."ИД"'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  "title" text not null
);
CREATE  INDEX IF NOT EXISTS  "IDX:химия/номенклатура/title" ON "химия"."номенклатура" ("title");

--- корневые позиции
insert into "химия"."номенклатура" (title)
select v.title
from 
  unnest(array['★ сырьё ★', '★ продукция ★']::text[]) v(title)
  left join "химия"."номенклатура" n on v.title=n.title
where n.id is null
;

create table IF NOT EXISTS "химия"."контрагенты" (
  id integer  NOT NULL DEFAULT nextval('"химия"."ИД"'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  "title" text not null unique
);

create table IF NOT EXISTS "химия"."сырье" (---приход на склад через лабораторию
  id integer  NOT NULL DEFAULT nextval('"химия"."ИД"'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  "дата" date not null,
  "количество" numeric not null,
  "ед" text,
  "№ ПИ" text, --- номер протокола испытания
  "коммент" text
/***
связи:
"химия"."номенклатура"(id1)->"химия"."сырье"(id2) ОБЯЗАТЕЛЬНО один-один
"химия"."контрагенты"(id1)->"химия"."сырье"(id2) ВОЗМОЖНО
***/
);
COMMENT ON TABLE "химия"."сырье" IS 'приход на склад через лабораторию';
---COMMENT ON TABLE "химия"."сырье"."№ ПИ" IS 'номер протокола испытания';
---ERROR:  cross-database references are not implemented: "химия.сырье.№ ПИ"

create table IF NOT EXISTS "химия"."продукция" (---
  id integer  NOT NULL DEFAULT nextval('"химия"."ИД"'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  "дата" date not null,
  "количество" numeric not null,
  "ед" text,
  "№ партии" text, 
  "коммент" text
/***
связи:
"химия"."номенклатура"(id1)->"химия"."продукция"(id2) ОБЯЗАТЕЛЬНО один-один
"химия"."продукция"(id1)->"химия"."продукция/сырье"(id2) -- позиции расхода сырья
***/
);

create table IF NOT EXISTS "химия"."продукция/сырье" (--- подчиненная таблица расхода сырья на продукцию
  id integer  NOT NULL DEFAULT nextval('"химия"."ИД"'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  "количество" numeric not null,
  "коммент" text
/***
связи:
"химия"."сырье"(id1)->"химия"."продукция/сырье"(id2) один-один
"химия"."продукция"(id1)->"химия"."продукция/сырье"(id2) -- позиции расхода сырья
***/
);

CREATE TABLE IF NOT EXISTS "химия"."связи" (
  "id" int NOT NULL PRIMARY KEY default nextval('"химия"."ИД"'::regclass),
  "ts" timestamp without time zone not null default now(),
  "id1" int not null,
  "id2" int not null,
  unique(id1, id2)
);
CREATE INDEX  IF NOT EXISTS  "IDX химия/связи/id2"  ON  "химия"."связи" (id2);

create table IF NOT EXISTS "химия"."таблицы/изменения" (
  id integer  NOT NULL,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  "операция" text not null,
  ---"схема" text not null, --- в каждой схеме такая таблица
  "таблица" text not null,
  data jsonb not null,
  uid int
);

--- конец таблицы

@@ функции
---DROP FUNCTION IF EXISTS "химия"."номенклатура/родители"(int);
CREATE OR REPLACE FUNCTION "химия"."номенклатура/родители"(int)
RETURNS TABLE("id" int, title text, parent int, "parents_id" int[], "parents_title" text[], level int) --, , "level" int[]
AS $func$

/*Базовая функция для компонентов поиска-выбора позиции и построения дерева*/

WITH RECURSIVE rc AS (
   SELECT n.id, n.title, p.id as "parent", p.title as "parent_title", p.id as "parent_id", 0::int AS "level"
   FROM "химия"."номенклатура" n
    left join (
    select n.*, r.id2
    from "химия"."номенклатура" n
      join "химия"."связи" r on n.id=r.id1
    ) p on n.id= p.id2
    where n.id=coalesce($1, n.id)
    
   UNION
   
   SELECT rc.id, rc.title, rc."parent", p.title, p.id, rc.level + 1 AS "level"
   FROM rc 
      join "химия"."связи" r on r.id2=rc."parent_id"
      join "химия"."номенклатура" p on r.id1= p.id
)

SELECT id, title, parent,
  array_agg("parent_id" order by "level" desc),
  array_agg("parent_title" order by "level" desc),
 --- array_agg("parent_descr" order by "level" desc),
  max("level") as "level"

FROM rc
group by id, title, parent;

$func$ LANGUAGE SQL;

/****************************************************************************/
CREATE OR REPLACE FUNCTION "химия"."проверить номенклатуру"(int, text)
RETURNS SETOF "химия"."номенклатура" AS
/*вместо триггера*/
$BODY$
BEGIN
  return query select n.*
  from "химия"."связи" r
    join "химия"."номенклатура" n on n.id=r.id2-- childs
  WHERE r.id1=$1 --  parent
    and lower(regexp_replace(regexp_replace(n.title, '\s{2,}', ' ', 'g'),'^\s+|\s+$','', 'g'))=lower(regexp_replace(regexp_replace($2, '\s{2,}', ' ', 'g'),'^\s+|\s+$','', 'g'));
END
$BODY$
LANGUAGE 'plpgsql' ;

/****************************************************************************/
CREATE OR REPLACE  VIEW "химия"."движение сырья" AS
/* поступления */
select s.id /*as "движение/id"*/, n.id as "номенклатура/id", s."№ ПИ", s."дата", s."количество", s."ед", s."коммент"
from "химия"."сырье" s
  join "химия"."связи" r on s.id=r.id2
  join "химия"."номенклатура" n on n.id=r.id1

/*union расход тоже в детализации протоколов исп*/
union all
select s.id /*as "движение/id"*/, ns.id, s."№ ПИ", p."дата", -ps."количество", s."ед", s."коммент"
from
  "химия"."продукция" p 
  join "химия"."связи" rps on p.id=rps.id1
  join "химия"."продукция/сырье" ps on ps.id=rps.id2
  join "химия"."связи" rs on ps.id=rs.id2
  join "химия"."сырье" s on s.id=rs.id1
  join "химия"."связи" rn on s.id=rn.id2
  join "химия"."номенклатура" ns on ns.id=rn.id1
;

DROP  VIEW IF EXISTS "химия"."позиции сырья в продукции";
CREATE OR REPLACE  VIEW "химия"."позиции сырья в продукции" AS
---- расход в продукции
select
  p.id as "продукция/id",
  ps.*,-- ид продукция/сырье
  p."связь/продукция/сырье/id",
  ---ps.id as "продукция/сырье/id",
  ---row_to_json(ps) as "$продукция/сырье/json",
  s.id as "сырье/id",
  row_to_json(s) as "$сырье/json",
  s."номенклатура/id"
  ---s."$номенклатура/json"
from
  "химия"."продукция/сырье" ps 
  join "химия"."связи" rs on ps.id=rs.id2
  join (
    select s.*,
      ns.id as "номенклатура/id",
      row_to_json(ns) as "$номенклатура/json"
    from 
      "химия"."сырье" s 
      join "химия"."связи" rn on s.id=rn.id2
      join "химия"."номенклатура/родители"(null) ns on ns.id=rn.id1
  ) s on s.id=rs.id1
  
  left join (
    select r.id2 as "продукция/сырье/id", r.id as "связь/продукция/сырье/id", p.*
    from 
      "химия"."продукция" p 
      join "химия"."связи" r on p.id=r.id1
  ) p on ps.id=p."продукция/сырье/id"
;

@@ номенклатура
--- 
select {%= $select || '*' %} from (
select n.*
from "химия"."номенклатура/родители"(null) n
{%= $where || '' %}
) n

@@ проверить номенклатуру
select *
from "химия"."проверить номенклатуру"(?::int, ?::text);

@@ поступление сырья
select {%= $select || '*' %} from (
select s.*,
  n.id as "номенклатура/id",
  row_to_json(n) as "$номенклатура/json"
from "химия"."сырье" s
  join "химия"."связи" r on s.id=r.id2
  join "химия"."номенклатура/родители"(null) n on n.id=r.id1
) q
{%= $where || '' %}
{%= $order_by || '' %}

@@ остатки сырья
--- на дату или текущую дату
select o.*,
  row_to_json(n) as "$номенклатура/json"
from (
  select id, "номенклатура/id", "ед", "№ ПИ",
    sum("количество") as "остаток"
  from "химия"."движение сырья"
  where "дата"<=coalesce(?::date, now()::date)
  group by id, "номенклатура/id", "ед", "№ ПИ"
) o
  join "химия"."номенклатура/родители"(null) n on n.id=o."номенклатура/id"
{%= $where || '' %}
{%= $order_by || '' %}

@@ производство продукции
select {%= $select || '*' %} from (
select p.*,
  np.id as "номенклатура/id",
  row_to_json(np) as "$номенклатура/json",
  s.*
  
from 
  "химия"."продукция" p 
  join "химия"."связи" rn on p.id=rn.id2
  join "химия"."номенклатура/родители"(null) np on np.id=rn.id1
  
  join (--- позициии сырья
    select
      "продукция/id",
      array_agg(id order by "связь/продукция/сырье/id") as "@продукция/сырье/id",
      jsonb_agg(s order by "связь/продукция/сырье/id") as "@продукция/сырье/json",
      array_agg("сырье/id" order by "связь/продукция/сырье/id") as "@сырье/id",
      array_agg("$сырье/json" order by "связь/продукция/сырье/id") as "@сырье/json",
      array_agg("номенклатура/id" order by "связь/продукция/сырье/id") as "@номенклатура/сырье/id"--- сырье/
      ---array_agg("$номенклатура/json" order by "связь/продукция/сырье/id") as "@номенклатура/сырье/json" --- сырье/
    from "химия"."позиции сырья в продукции" s
    {%= $where_stock || '' %}
    group by "продукция/id"
  ) s on p.id=s."продукция/id"
) q
{%= $where || '' %}
{%= $order_by || '' %}

@@ позиции сырья в продукции
select {%= $select || '*' %}
from "химия"."позиции сырья в продукции"
{%= $where || '' %}
{%= $order_by || '' %}