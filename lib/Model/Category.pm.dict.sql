@@ таблицы
create table IF NOT EXISTS "{%= $schema %}"."{%= $tables->{main} %}" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  title text not null,
  parent int not null,
  childs int[] not null default '{}'::int[],
  disabled boolean,
  img text, --- имя файла в спец каталоге см $img_path Controll::Category;
  "order" int2
);
--- корень дерева категорий
--- insert into "{%= $schema %}"."{%= $tables->{main} %}" (title, parent) values ('Корень1', 0) returning *;

@@ проверить категорию
--перед вставкой
/*select *
from "категории/потомки узла"(?)
where lower(regexp_replace(title, '\s{2,}', ' ', 'g')) = lower(regexp_replace(?::text, '\s{2,}', ' ', 'g'))
*/
select * from "проверить категорию"(?, ?)--- parent, title
;

@@ узлы родителя
-- expand_node
select * from  "категории/потомки узла/потомки"(?)

;

@@ индексный путь категории?cached=1

select "категории/индексный путь"(?);


@@ категории/родители узла
SELECT c.*
FROM "категории/родители узла"(?, false) x
  join "категории" c on x.id=c.id
order by x.level desc
;

@@ категории для поиска?cached=1
/*
select id, title, "категории/родители узла/title"(id, false) as "selectedTitle", ------random_int_array(5, 6, 40) проверил сортировку по массиву
  "категории/индексный путь"(id) as "selectedIdx"
---from (
---select c.id, array_agg(pc.title) as path ---, array_agg(pc.img) as img
from "категории/ветка узла"(3) ---"категории" c 
---join lateral (select cc.* from "категории/родители узла"(c.id, false) cc order by level desc)  pc on true
where ---"сборка названий категории"(c."id") ~ '\mямо'
  c.id <> 3
---group by c.id
---order by array_to_string(array_agg(pc.title), '/')
--) q
order by 3
;
*/

select row_number() OVER (order by parents_title) "#", -- нумератор для преобразования массива parents_id в массив индексов этой выборки
  id, title, "order",
  parents_id[2:(array_upper(parents_id, 1)-0)] as parents_id,
  parents_title[2:(array_upper(parents_title, 1)-0)] as parents_title, ------random_int_array(5, 6, 40) проверил сортировку по массиву
  "категории/индексный путь"(id) as "selectedIdx"
from (
select c.id, c.title, c."order",
  pc.parents_id, pc.parents_title ---, array_agg(pc.img) as img
from "категории" c 
  join lateral (
    select array_agg(cc.id order by level desc) as parents_id,
      array_agg(cc.title order by level desc) as parents_title
    from "категории/родители узла"(c.id, true) cc
  )  pc on true
where ---"сборка названий категории"(c."id") ~ '\mямо'
  c.id <> 3
---group by c.id
---order by 2 ---array_to_string(array_agg(pc.title), '/')
) q
---where coalesce(3, 3) = any(parents_id) --- если нужно ограничивать только ветку
order by 6 -- по массиву parents_title
;

@@ список?cached=1
select {%= $select || '*' %} from (select g.*, r.parent, r.level, r."parents_id", r."parents_title", c.childs
from "категории/родители"() r
join "категории" g on r.id=g.id
left join (
  select array_agg(c.id) as childs, r.id1 as parent
  from "категории" c
    join refs r on c.id=r.id2
  group by r.id1
) c on r.id= c.parent
where coalesce(?::int, 0)=0 or r."parents_id"[1]=?::int      ---=any(r."parents_id") --- корень
---order by r.id, r.parents_title
) c;

@@ категории транспорта
-- закинул в роли
select {%= $select || '*' %} from (select r.id, r.name, r.descr, r.disable, r.name as title,  r.parent,
  /**array_length(r.parents_id, 1) as***/ r.level,
  r."parents_id", r."parents/id", r."parents/name", r."parents/name" as "parents_title", r."childs/id" as "childs"
from "roles/родители"(null) r
/****join "roles" g on r.id=g.id
left join (
  select array_agg(c.id) as childs, r.id1 as parent
  from "roles" c
    join refs r on c.id=r.id2
  group by r.id1
) c on r.id= c.parent
***/
where coalesce(?::int, 0)=0 or r."parents_id"[1]=?::int      ---=any(r."parents_id") --- корень
---order by r.id, r.parents_title
) c
;

@@ функции

CREATE OR REPLACE FUNCTION "категории/родители"() RETURNS TABLE(id integer, title text, parent int, parents_id integer[], parents_title text[], level int)
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
    select c.*, r.id2
    from "категории" c
      join refs r on c.id=r.id1
    ) p on c.id= p.id2
    
   UNION
   
   SELECT rc.id, rc.title, rc."parent", p.title, p.id, rc.level + 1 --- c."order", 
   FROM rc ---ON c.id = rc.child
      join refs r on r.id2=rc."parent_id"
      join "категории" p on r.id1= p.id
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


/*--------------------------------------------------------------------------*/
CREATE OR REPLACE FUNCTION "категории/потомки узла"(int)
/*
Только на уровне ниже
*/
RETURNS SETOF "категории"
AS $func$

select cc.*
from "категории" c
  join refs r on c.id=r.id1
  join "категории" cc on cc.id=r.id2

where c.id=$1;


$func$ LANGUAGE SQL;

/*----------------------------------------------------------------------------*/
CREATE OR REPLACE FUNCTION "категории/потомки узла/id"(int)
/*
Только на уровне ниже
*/
RETURNS int[]
AS $func$

select array_agg(id)
from (
select id
from "категории/потомки узла"($1)
order by coalesce("order", id)
) o

$func$ LANGUAGE SQL;

/*----------------------------------------------------------------------------*/
CREATE OR REPLACE FUNCTION "категории/потомки узла/потомки"(int)
/*
expand_node
*/
RETURNS TABLE("id" int, title text, parent int, "order" int2, childs int[])
AS $func$

select id, title, parent, "order", "категории/потомки узла/id"(id) as childs
from "категории/потомки узла"($1)

$func$ LANGUAGE SQL;

/*------------------------------------------------------------------------------*/
CREATE OR REPLACE FUNCTION "категории/ветка узла"(int)
-- вниз
RETURNS TABLE("id" int, title text, parent int, parents_id int[], parents_title text[], "order" int2, level int)
AS $func$

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

$func$ LANGUAGE SQL;

/*----------------------------------------------------------------------------*/
CREATE OR REPLACE FUNCTION "категории/ветка узла/потомки"(int)
/*
Только на уровне ниже
*/
RETURNS TABLE("id" int, title text, parent int, parents_id int[], parents_title text[], "order" int2, level int, childs int[])
AS $func$

select *,"категории/потомки узла/id"(id) as childs
from "категории/ветка узла"($1)

$func$ LANGUAGE SQL;

/*------------------------------------------------------------------------------*/
CREATE OR REPLACE FUNCTION "категории/родители узла"(int, boolean)
-- вверх (2 парам - логич: true - включить топ-корень (нужно для индексного пути) и false в остальных случаях)
RETURNS TABLE("id" int, title text, img text, parent int, "order" int2, level int)
AS $func$

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

$func$ LANGUAGE SQL;

/*----------------------------------------------------------------------------*/
CREATE OR REPLACE FUNCTION "категории/родители узла/потомки"(int, boolean)
/*
(2 парам - логич: true - включить топ-корень (нужно для индексного пути) и false не включать в остальных случаях)
*/
RETURNS TABLE("id" int, title text, img text, parent int, "order" int2, level int, childs int[])
AS $func$

select *,"категории/потомки узла/id"(id) as childs
from "категории/родители узла"($1, $2)

$func$ LANGUAGE SQL;

---select c.id, array_to_string(array_agg(pc.title), '/') from "категории" c join lateral (select cc.* from "категории/родители узла"(c.id, null) cc order by level desc)  pc on true group by c.id;

/*----------------------------------------------------------------------------*/
CREATE OR REPLACE FUNCTION "категории/родители узла/id"(int, boolean)
/*
вверх
*/
RETURNS int[]
AS $func$

select array_agg(id order by level desc)
from "категории/родители узла"($1, $2)


$func$ LANGUAGE SQL;

/*----------------------------------------------------------------------------*/
CREATE OR REPLACE FUNCTION "категории/родители узла/title"(int, boolean)
/*
вверх
*/
RETURNS text[]
AS $func$

select array_agg(title order by level desc)
---from (
---select title
from "категории/родители узла"($1, $2)
---order by level desc
---) s

$func$ LANGUAGE SQL;

/*-----------------------------------------------------------------*/
CREATE OR REPLACE FUNCTION "категории/индексный путь"(int)
RETURNS int[]
AS $func$

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

$func$ LANGUAGE SQL;

/*-----------------------------------------------------------------
проверка уникальности на уровне
*/


/*CREATE OR REPLACE FUNCTION check_category() RETURNS "trigger" AS
$BODY$  

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
$BODY$
  LANGUAGE 'plpgsql';--- VOLATILE;
*/

DROP TRIGGER  IF EXISTS  check_category ON refs;
---CREATE  TRIGGER check_category -- CONSTRAINT только дл я AFTER
--    BEFORE INSERT OR UPDATE  ON refs
---    FOR EACH ROW  EXECUTE PROCEDURE check_category(); 

/*-----------------------------------------------------------------*/

CREATE OR REPLACE FUNCTION "проверить категорию"(int, text) RETURNS SETOF "категории" AS
/*вместо триггера*/
$BODY$
BEGIN
  return query select c.*
  from refs r
    join "категории" c on c.id=r.id2-- childs
  WHERE r.id1=$1 --  parent
    and lower(regexp_replace(regexp_replace(c.title, '\s{2,}', ' ', 'g'),'^\s+|\s+$','', 'g'))=lower(regexp_replace(regexp_replace($2, '\s{2,}', ' ', 'g'),'^\s+|\s+$','', 'g'));
END
$BODY$
LANGUAGE 'plpgsql' ;

/*
CREATE OR REPLACE FUNCTION "сборка названий категории"(int)
RETURNS text
AS $func$
select array_to_string(array_agg(c.title), '/')
from (select * from "категории/родители узла"($1) c order by level desc) c
---group by c.id
;
$func$ LANGUAGE SQL
---- Обязательно IMMUTABLE функция для индекса;
IMMUTABLE;


CREATE INDEX IF NOT EXISTS "категории сборка названий_gin" on "категории" USING gin ("сборка названий категории"("id") gin_trgm_ops);

*/
/*
select array_to_json(array_agg(c))
from (
select c.id, array_agg(pc.title) as path
from "категории" c 
join lateral (select cc.* from "категории/родители узла"(c.id, null) cc order by level desc)  pc on true
where ---"сборка названий категории"(c."id") ~ '\mямо'
  c.id <> 22
group by c.id
order by array_to_string(array_agg(pc.title), '/')
) c
;
*/
