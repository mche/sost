@@ таблицы
create table IF NOT EXISTS "номенклатура" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  "title" varchar not null, --
  "disable" boolean,
  "descr" text
);


@@ функции
CREATE OR REPLACE FUNCTION "номенклатура/родители"()
RETURNS TABLE("id" int, title varchar, parent int, "parents_id" int[], "parents_title" varchar[], parents_descr text[], level int) --, , "level" int[]
AS $func$

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

$func$ LANGUAGE SQL;

/*------------------------------------------------------------------------------*/
CREATE OR REPLACE FUNCTION "номенклатура/родители узла"(int, boolean)
-- вверх (2 парам - логич: true - включить топ-корень (нужно для индексного пути) и false в остальных случаях)
RETURNS TABLE("id" int, title text, parent int, level int)
AS $func$

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

$func$ LANGUAGE SQL;

/*----------------------------------------------------------------------------*/
CREATE OR REPLACE FUNCTION "номенклатура/родители узла/title"(int, boolean)
/*
вверх
*/
RETURNS text[]
AS $func$

select array_agg(title order by level desc) as "full_title"
---from (
---select title
from "номенклатура/родители узла"($1, $2)
--order by level desc
--) s

$func$ LANGUAGE SQL;

/*--------------------------------------------------------------------------*/
CREATE OR REPLACE FUNCTION "номенклатура/потомки узла"(int)
/*
Только на уровне ниже
*/
RETURNS SETOF "номенклатура"
AS $func$

select cc.*
from "номенклатура" c
  join refs r on c.id=r.id1
  join "номенклатура" cc on cc.id=r.id2

where c.id=$1;


$func$ LANGUAGE SQL;

/*CREATE OR REPLACE FUNCTION check_nomen() RETURNS "trigger" AS
$BODY$  

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
$BODY$
  LANGUAGE 'plpgsql';--- VOLATILE;
*/

DROP TRIGGER  IF EXISTS  check_nomen ON refs;
/*CREATE  TRIGGER check_nomen -- CONSTRAINT только для AFTER
    BEFORE INSERT OR UPDATE  ON refs
    FOR EACH ROW  EXECUTE PROCEDURE check_nomen(); 
*/

/*-----------------------------------------------------------------------------*/
CREATE OR REPLACE FUNCTION "проверить номенклатуру"(int, text) RETURNS SETOF "номенклатура" AS
/*вместо триггера*/
$BODY$
BEGIN
  return query select c.*
  from refs r
    join "номенклатура" c on c.id=r.id2-- childs
  WHERE r.id1=$1 --  parent
    and lower(regexp_replace(regexp_replace(c.title, '\s{2,}', ' ', 'g'),'^\s+|\s+$','', 'g'))=lower(regexp_replace(regexp_replace($2, '\s{2,}', ' ', 'g'),'^\s+|\s+$','', 'g'));
END
$BODY$
LANGUAGE 'plpgsql' ;

/******************конец функций******************/

@@ список?cached=1
select {%= $select || '*' %} from (select g.*, r."parent", r."parents_id", r."parents_title", c.childs, 'спр. поз. '||g.id::text as _title
from "номенклатура/родители"() r
join "номенклатура" g on r.id=g.id
left join (
  select array_agg(c.id) as childs, r.id1 as parent
  from "номенклатура" c
    join refs r on c.id=r.id2
  group by r.id1
) c on r.id= c.parent

where (coalesce(?::int, 0)=0 or r."parents_id"[1]=?::int)                         ----=any(r."parents_id") -- может ограничить корнем
{%= $where %}
) t
;

@@ позиция
select {%= $select || '*' %} from (
select g.*, r."parent", r."parents_id", r."parents_title"---, c.childs
from "номенклатура/родители"() r
join "номенклатура" g on r.id=g.id
) n
{%= $where %}

@@ проверить
--перед вставкой
/*select *
from "номенклатура/потомки узла"(?)
where lower(regexp_replace(title, '\s{2,}', ' ', 'g')) = lower(regexp_replace(?::text, '\s{2,}', ' ', 'g'))
*/
select * from "проверить номенклатуру"(?, ?) -- parent, title
;

@@ проверить путь
--- если topParent null
select *
from "номенклатура/родители"()
where regexp_replace(lower(array_to_string(parents_title||title, '\t')), '\s+', '', 'g')=regexp_replace(lower(array_to_string(?::varchar[], '\t')), '\s+', '', 'g');---array['цемент', 'мкр,т', 'т']