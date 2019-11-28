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

create table IF NOT EXISTS "химия"."отгрузка" (---
  id integer  NOT NULL DEFAULT nextval('"химия"."ИД"'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  "дата" date not null,
  "коммент" text
/***
связи:
"химия"."контрагенты"(id1)->"химия"."отгрузка"(id2) ОБЯЗАТЕЛЬНО один-один
"химия"."отгрузка"(id1)->"химия"."отгрузка/позиии"(id2) -- позиции много
***/
);

create table IF NOT EXISTS "химия"."отгрузка/позиции" (--- подчиненная таблица строк отгрузки
  id integer  NOT NULL DEFAULT nextval('"химия"."ИД"'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  "количество" numeric not null,
  "коммент" text
/***
связи:
"химия"."отгрузка"(id1)->"химия"."отгрузка/позиии"(id2) -- позиции много
"химия"."сырье"(id1)->"химия"."отгрузка/позиии"(id2) (один-один)
или отгружена продукция
"химия"."продукция"(id1)->"химия"."отгрузка/позиии"(id2) -- (один-один)
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
-----------------------------------
---DROP FUNCTION IF EXISTS "химия"."номенклатура/удалить концы"();
---DROP FUNCTION IF EXISTS "химия"."номенклатура/удалить концы"(int[]);
CREATE OR REPLACE FUNCTION "химия"."номенклатура/почистить"(int/* uid*/)
RETURNS int[] --SETOF public."номенклатура"
AS $func$
/*
** на входе uid
*/
DECLARE
   d record;
   result int[] := array[]::int[];
BEGIN
  FOR d IN
    select n.id
    from (
    ---номенклатура без потомков
    select n1.id
    from "химия"."номенклатура" n1
      left join (
        select n1.id --- у этого есть потомки
        from "химия"."номенклатура" n1 --- родитель
          join "химия"."связи" r on n1.id=r.id1
          join "химия"."номенклатура" n2 on n2.id=r.id2
      ) n2 on n1.id=n2.id
      where ---($1 is null or n1.id<>any($1))
        ---and 
        n2.id is null
    ) n
      ---только одна связь (с родителем)
      join "химия"."связи" r on n.id=r.id1 or n.id=r.id2---any(array[r.id1, r.id2])

    group by n.id
    having count(*)=1

  LOOP
    PERFORM "удалить объект"('химия', 'номенклатура', 'связи', d.id, $1);
    result := result || d.id;
    ---RAISE NOTICE 'New role id: %', new_id;
  END LOOP;
RETURN result;
END;
$func$ LANGUAGE plpgsql;

/****************************************************************************/
DROP FUNCTION IF EXISTS "химия"."почистить контрагентов"(int);
CREATE OR REPLACE FUNCTION "химия"."почистить контрагентов"(int /*uid*/)
RETURNS SETOF "химия"."таблицы/изменения" AS
/*
  находит неиспользуемые (без связей) записи табл "контрагенты"
  Возвращает записанные в табл "таблицы/изменения" удаленные записи
  в формате табл "контрагенты"
*/
$BODY$
BEGIN
  RETURN QUERY 
  WITH del as (
    delete ---select *
    from "химия"."контрагенты"
    where id not in (
      select k.id
      from "химия"."контрагенты" k
        join  "химия"."связи"r on k.id=r.id1 or k.id=r.id2
    )
    returning *
  )
  
  ---тут не надо функцию "удалить объект"
  insert into "химия"."таблицы/изменения" (id, "операция", "таблица", data, uid)
  select del.id, 'удаление', 'контрагенты', row_to_json(del), $1
  from del
  returning *
  ;

END
$BODY$
LANGUAGE 'plpgsql' ;
/****************************************************************************/
CREATE OR REPLACE  VIEW "химия"."сырье/расход/id" AS
/* в производство */
select s.id /*as "движение/id"*/, p."дата", n.id as "номенклатура/id", s."№ ПИ", ps."количество", s."ед", s."коммент"
from
  "химия"."продукция" p 
  join "химия"."связи" rps on p.id=rps.id1
  join "химия"."продукция/сырье" ps on ps.id=rps.id2
  join "химия"."связи" rs on ps.id=rs.id2
  join "химия"."сырье" s on s.id=rs.id1
  join "химия"."связи" rn on s.id=rn.id2
  join "химия"."номенклатура" n on n.id=rn.id1

union all
/*отгрузки*/
select s.id /*as "движение/id"*/, o."дата", n.id as "номенклатура/id", s."№ ПИ", pos."количество", s."ед", pos."коммент"
from
  "химия"."отгрузка" o
  join "химия"."связи" rpos on o.id=rpos.id1
  join "химия"."отгрузка/позиции" pos on pos.id=rpos.id2
  join "химия"."связи" rs on pos.id=rs.id2
  join "химия"."сырье" s on s.id=rs.id1
  join "химия"."связи" rn on s.id=rn.id2
  join "химия"."номенклатура" n on n.id=rn.id1
;

CREATE OR REPLACE  VIEW "химия"."сырье/приход/id" AS
/* поступления */
select s.id /*as "движение/id"*/, s."дата", n.id as "номенклатура/id", s."№ ПИ", s."количество", s."ед", s."коммент"
from "химия"."сырье" s
  join "химия"."связи" r on s.id=r.id2
  join "химия"."номенклатура" n on n.id=r.id1
;

DROP VIEW IF EXISTS "химия"."движение сырья";
CREATE OR REPLACE  VIEW "химия"."сырье/движение" AS
/* поступления */
select id /*as "движение/id"*/, "дата", "номенклатура/id", "№ ПИ", "количество", "ед", "коммент"
from "химия"."сырье/приход/id"

/*union расход тоже в детализации протоколов исп*/
union all
select id /*as "движение/id"*/, "дата", "номенклатура/id", "№ ПИ", -"количество", "ед", "коммент"
from "химия"."сырье/расход/id"
;

/****************************************************************************/
CREATE OR REPLACE  VIEW "химия"."продукция/расход/id" AS
select p.id /*as "движение/id"*/, o."дата", n.id as "номенклатура/id", p."№ партии", pos."количество", p."ед", pos."коммент"
from
  "химия"."отгрузка" o
  join "химия"."связи" rpos on o.id=rpos.id1
  join "химия"."отгрузка/позиции" pos on pos.id=rpos.id2
  join "химия"."связи" rp on pos.id=rp.id2
  join "химия"."продукция" p on p.id=rp.id1
  join "химия"."связи" rn on p.id=rn.id2
  join "химия"."номенклатура" n on n.id=rn.id1
;

CREATE OR REPLACE  VIEW "химия"."продукция/приход/id" AS
/* производство */
select p.id /*as "движение/id"*/, p."дата", n.id as "номенклатура/id", p."№ партии", p."количество", p."ед", p."коммент"
from 
  "химия"."продукция" p 
  join "химия"."связи" r on p.id=r.id2
  join "химия"."номенклатура" n on n.id=r.id1
;

DROP VIEW IF EXISTS "химия"."движение продукции";
CREATE OR REPLACE  VIEW "химия"."продукция/движение" AS
/* производство */
select id /*as "движение/id"*/, "дата", "номенклатура/id", "№ партии", "количество", "ед", "коммент"
from "химия"."продукция/приход/id"

union all
/*отгрузки*/
select id /*as "движение/id"*/, "дата", "номенклатура/id", "№ партии", -"количество", "ед", "коммент"
from "химия"."продукция/расход/id"
;

/****************************************************************************/
---DROP  VIEW IF EXISTS "химия"."позиции сырья в продукции";
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

/****************************************************************************/
DROP  VIEW IF EXISTS "химия"."позиции в отгрузке";
CREATE OR REPLACE  VIEW "химия"."позиции в отгрузке" AS
---- расход в отгрузке
select
  o.id as "отгрузка/id",
  pos.*,-- ид продукция/сырье
  o."позиция/связь/id",
  coalesce(s.id, p.id) as "продукция или сырье/id",
  coalesce(row_to_json(s), row_to_json(p)) as "$продукция или сырье/json",
  coalesce(s."номенклатура/id", p."номенклатура/id") as "номенклатура/id"
from
  "химия"."отгрузка/позиции" pos
  join "химия"."связи" rp on pos.id=rp.id2
  left join (--- отгружено сырье
    select s.*,
      ns.id as "номенклатура/id",
      row_to_json(ns) as "$номенклатура/json"
    from 
      "химия"."сырье" s 
      join "химия"."связи" rn on s.id=rn.id2
      join "химия"."номенклатура/родители"(null) ns on ns.id=rn.id1
  ) s on s.id=rp.id1
  
  left join (--- или отгружена продукция
    select p.*,
      ns.id as "номенклатура/id",
      row_to_json(ns) as "$номенклатура/json"
    from 
      "химия"."продукция" p
      join "химия"."связи" rn on p.id=rn.id2
      join "химия"."номенклатура/родители"(null) ns on ns.id=rn.id1
  ) p on p.id=rp.id1
  
  left join (
    select r.id2 as "позиция/id", r.id as "позиция/связь/id", o.*
    from 
      "химия"."отгрузка" o
      join "химия"."связи" r on o.id=r.id1
  ) o on pos.id=o."позиция/id"
where coalesce(s.id, p.id) is not null
;

/****************************************************************************/
/**************************          конец схемы           *****************************/
/**************************                                              *****************************/
/****************************************************************************/

@@ номенклатура
--- 
select {%= $select || '*' %} from (
select n.*, array_to_string(n.parents_title[2:]||n.title, '') as _match
from "химия"."номенклатура/родители"(null) n
{%= $where || '' %}
) n

@@ номенклатура/первая группа
select n.parents_title[1] as "группа1", jsonb_agg(n order by n.parents_title || n.title) as "@позиции/json"
from (
select n.*, array_to_string(n.parents_title[2:]||n.title, '') as _match
from "химия"."номенклатура/родители"(null) n
{%= $where || '' %}
) n
where n.parents_title[1] is not null
group by n.parents_title[1]

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
{%= $where || '' %}
{%= $order_by || '' %}
) q



@@ остатки сырья
--- на дату или текущую дату
select {%= $select || '*' %} from (
select o.*,
  row_to_json(n) as "$номенклатура/json"
from (
  select id, "номенклатура/id", "ед", "№ ПИ",
    sum("количество") as "остаток"
  from "химия"."сырье/движение"
  ---where "дата"<=coalesce(::date, now()::date)
  {%= $where1 || '' %}
  group by id, "номенклатура/id", "ед", "№ ПИ"
) o
  join "химия"."номенклатура/родители"(null) n on n.id=o."номенклатура/id"
{%= $where || '' %}
{%= $order_by || '' %}
) o

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
      --array_agg("$сырье/json" order by "связь/продукция/сырье/id") as "@сырье/json",
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

@@ почистить номенклатуру
select "химия"."номенклатура/почистить"(?);

@@ контрагенты
---------
select {%= $select || '*' %}
from "химия"."контрагенты"
{%= $where || '' %}
{%= $order_by || '' %}

@@ остатки продукции
--- на дату или текущую дату
select o.*,
  row_to_json(n) as "$номенклатура/json"
from (
  select id, "номенклатура/id", "ед", "№ партии",
    sum("количество") as "остаток"
  from "химия"."продукция/движение"
  {%= $where1 || '' %}
  group by id, "номенклатура/id", "ед", "№ партии"
) o
  join "химия"."номенклатура/родители"(null) n on n.id=o."номенклатура/id"
{%= $where || '' %}
{%= $order_by || '' %}

@@ отгрузки
--------------------
select {%= $select || '*' %} from (
select ot.*,
  k.id as "контрагент/id",
  row_to_json(k) as "$контрагент/json",
  pos.*
  
from 
  "химия"."отгрузка" ot
  join "химия"."связи" rk on ot.id=rk.id2
  join "химия"."контрагенты" k on k.id=rk.id1
  
  join (--- позициии
    select
      "отгрузка/id",
      array_agg(id order by "позиция/связь/id") as "@позиции/id",
      jsonb_agg(pos order by "позиция/связь/id") as "@позиции/json",
      array_agg("продукция или сырье/id" order by "позиция/связь/id") as "@продукция или сырье/id",
      ---array_agg("$продукция или сырье/json" order by "позиция/связь/id") as "@продукция или сырье/json",
      array_agg("номенклатура/id" order by "позиция/связь/id") as "@позиции/номенклатура/id"--- сырье/
      ---array_agg("$номенклатура/json" order by "связь/продукция/сырье/id") as "@номенклатура/сырье/json" --- сырье/
    from "химия"."позиции в отгрузке" pos
    {%= $where_pos || '' %}
    group by "отгрузка/id"
  ) pos on ot.id=pos."отгрузка/id"
) q
{%= $where || '' %}
{%= $order_by || '' %}

@@ сводка отгрузок
--------------------------------
select {%= $select || '*' %} from (
/*select --- вторая группировка
  "номенклатура/id" as nid,
  jsonb_agg(g1) as "@reduce/json"
from (--- первая группировка
*/
  select ---ot.*,
    k.id as "контрагент/id",
    pos."номенклатура/id",
    jsonb_agg(pos) as "@отгрузка/позиции/json"
    
  from 
    "химия"."отгрузка" ot
    join "химия"."связи" rk on ot.id=rk.id2
    join "химия"."контрагенты" k on k.id=rk.id1
    
    join (--- позициии
      select
        pos.*
        ---row_to_json(ot) as "$отгрузка"
      from 
        ---"химия"."отгрузка" ot
        "химия"."позиции в отгрузке" pos ---on ot.id=pos."отгрузка/id"
      {%= $where_pos || '' %}
    ) pos on ot.id=pos."отгрузка/id"
    {%= $where || '' %}
    group by k.id, pos."номенклатура/id"
  ) g1
/*  group by "номенклатура/id"
) g2*/
{%= $order_by || '' %}

@@ позиции в отгрузке
--------------------------------------
select {%= $select || '*' %}
from "химия"."позиции в отгрузке"
{%= $where || '' %}
{%= $order_by || '' %}

@@ почистить контрагентов
----------------------------------------------
select *---json_agg(d)
from "химия"."почистить контрагентов"(?) d;
;