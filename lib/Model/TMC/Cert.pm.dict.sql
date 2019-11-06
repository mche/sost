@@ таблицы
create table IF NOT EXISTS "сертификаты/папки" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  title text not null, --
  "descr" text
);

DROP FUNCTION IF EXISTS "сертификаты/папки/родители"();
CREATE OR REPLACE FUNCTION "сертификаты/папки/родители"(int)
RETURNS TABLE("id" int, title text, parent int, "parents_id" int[], "parents_title" text[],  level int) --, , "level" int[]
AS $func$

/*Базовая функция для компонентов поиска-выбора позиции и построения дерева*/

WITH RECURSIVE rc AS (
   SELECT n.id, n.title, p.id as "parent", p.title as "parent_title", p.id as "parent_id", 0::int AS "level"
   FROM "сертификаты/папки" n
    left join (
    select n.*, r.id2
    from "сертификаты/папки" n
      join refs r on n.id=r.id1
    ) p on n.id= p.id2
    where n.id=coalesce($1, n.id)
    
   UNION
   
   SELECT rc.id, rc.title, rc."parent", p.title, p.id, rc.level + 1 AS "level"
   FROM rc 
      join refs r on r.id2=rc."parent_id"
      join "сертификаты/папки" p on r.id1= p.id
)

SELECT id, title, parent,
  array_agg("parent_id" order by "level" desc),
  array_agg("parent_title" order by "level" desc),
  max("level") as "level"
FROM rc
group by id, title, parent;

$func$ LANGUAGE SQL;

@@ закупки
select
  t."объект/id", t."объект",
  array_agg(t.id order by t.id) as "позиции тмц/id",
  jsonb_agg(t order by t.id) as "@позиции тмц/json"

from

(select
  m.*,
  t.*,
  o.id as "объект/id",
  o.name as "объект",
  n.id as "номенклатура/id",
  ---"номенклатура/родители узла/title"(n.id, true) as "номенклатура"
  ---n.parents_title as "номенклатура"
  row_to_json(n) as "$номенклатура/json",
  row_to_json(z) as "$заявка/json"
--  f."_uploads/json"
from 
  (
    select tz.id as "транспорт/заявки/id",
      tz."дата1", timestamp_to_json(tz."дата1"::timestamp) as "$дата1/json",
      k_go.*
    from 
      "транспорт/заявки" tz
      left join lateral (-- все грузоотправители иды (перевести связи в ид контрагента)
        select
        array_agg(r.id1 order by un.idx) as "@грузоотправители/id",
        jsonb_agg(k order by un.idx) as "@грузоотправители/json"
        from unnest(tz."грузоотправители") WITH ORDINALITY as un(id, idx)
          join refs r on un.id=r.id
          join "контрагенты" k on k.id=r.id1
        ---where r.id2=tz.id
        ---group by r.id2
      ) k_go on true---k_go.id2=tz.id
    where tz."с объекта" is null
  ) m
  
  join refs rt on m."транспорт/заявки/id"=rt.id2
  join "тмц" t on t.id=rt.id1
  
  join refs ro on t.id=ro.id2
  join "roles" o on o.id=ro.id1
  
  join refs rn on t.id=rn.id2
  join "номенклатура/родители"(null) n on n.id=rn.id1
  
  left join (--- id1("тмц/заявки")->id2("тмц") --- одна позиция заявок - одна или несколько позиций тмц
    select z.*, r.id2
    from refs r 
      join "тмц/заявки" z on z.id=r.id1
  ) z on t.id=z.id2
  
  /*
  left join (
    select rf.id1, jsonb_agg(distinct f) as "_uploads/json"
    from refs rf 
      join "файлы" f on f.id=rf.id2
    group by rf.id1
  ) f on t.id=f.id1*/
  
  where n."parents_id"[1]=154964 --- тор стройматериалы
) t

group by t."объект/id", t."объект"
order by t."объект"
;


@@ папки
--- структура
select {%= $select || '*' %} from (
  select n.*, r.title, r."parent", r."parents_id", r."parents_title",  c.childs
  from
    "сертификаты/папки/родители"(?) r
    join "сертификаты/папки" n on r.id=n.id
    
    left join (---для childs
      select array_agg(n.id) as childs, r.id1
      from  "сертификаты/папки" n
        join refs r on n.id=r.id2
      group by r.id1
    ) c on r.id= c.id1
    
) t

{%= $where || ''%}
{%= $order_by || ''%}
;

@@ папки222
select n.*, f."тмц/id", f."_uploads/json", array_to_string(f."_uploads/names", E'\n') as "_uploads/names"
from ( {%= $nomen %} ) n
left join /*lateral*/ (--- файлики
  select t.id as "тмц/id", rn.id1 as "номен/id", jsonb_agg(distinct f) as "_uploads/json",
    array_agg(distinct array_to_string(/*n.parents_title[2:]::text[] || n.title::text||*/ f.names, E'\n')) as "_uploads/names"
  from 
  refs rt
  join "тмц" t on t.id=rt.id1
  join refs rn on t.id=rn.id2
  join refs rf on t.id=rf.id1
  join "файлы" f on f.id=rf.id2
group by t.id, rn.id1
) f on n.id=f."номен/id"
