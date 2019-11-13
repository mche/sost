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
"химия"."номенклатура"(id1)->"химия"."сырье"(id2) ОБЯЗАТЕЛЬНО
"химия"."контрагенты"(id1)->"химия"."сырье"(id2) ВОЗМОЖНО
***/
);
COMMENT ON TABLE "химия"."сырье" IS 'приход на склад через лабораторию';
---COMMENT ON TABLE "химия"."сырье"."№ ПИ" IS 'номер протокола испытания';
---ERROR:  cross-database references are not implemented: "химия.сырье.№ ПИ"

CREATE TABLE IF NOT EXISTS "химия"."связи" (
  "id" int NOT NULL PRIMARY KEY default nextval('"химия"."ИД"'::regclass),
  "ts" timestamp without time zone not null default now(),
  "id1" int not null,
  "id2" int not null,
  unique(id1, id2)
);
CREATE INDEX  IF NOT EXISTS  "IDX химия/связи/id2"  ON  "химия"."связи" (id2);


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