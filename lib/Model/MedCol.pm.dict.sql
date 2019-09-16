@@ схема
CREATE SCHEMA IF NOT EXISTS "медкол";
CREATE SEQUENCE IF NOT EXISTS "медкол"."ИД";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS "медкол"."тестовые вопросы" (
  "id" int NOT NULL PRIMARY KEY default nextval('"медкол"."ИД"'::regclass),
  "ts" timestamp without time zone not null default now(),
  "код" text not null unique,
  "вопрос" text not null,
  "ответы" text[] not null,
  "коммент" text--- alter table "медкол"."тестовые вопросы" add column "коммент" text;
);

CREATE TABLE IF NOT EXISTS "медкол"."названия тестов" (
  "id" int NOT NULL PRIMARY KEY default nextval('"медкол"."ИД"'::regclass),
  "ts" timestamp without time zone not null default now(),
  "название" text not null unique,
  "задать вопросов" int,
  "всего время" int --- секунд
);

CREATE TABLE IF NOT EXISTS "медкол"."связи" (
  "id" int NOT NULL PRIMARY KEY default nextval('"медкол"."ИД"'::regclass),
  "ts" timestamp without time zone not null default now(),
  "id1" int not null,
  "id2" int not null,
  unique(id1, id2)
);
CREATE INDEX  IF NOT EXISTS  "связи/индекс id2"  ON  "медкол"."связи" (id2);

CREATE TABLE IF NOT EXISTS "медкол"."сессии" (
  "id" int NOT NULL PRIMARY KEY default nextval('"медкол"."ИД"'::regclass),
  "ts" timestamp without time zone not null default now(),
  "задать вопросов" int --- из "названия тестов" если изменится
);

CREATE TABLE IF NOT EXISTS "медкол"."процесс сдачи" (
  "id" int NOT NULL PRIMARY KEY default nextval('"медкол"."ИД"'::regclass),
  "ts" timestamp without time zone not null default now(), --время вопроса
  ---это связь---"вопрос" int not null,
  "ответ" int null,--- ответ - это индекс массива ответов
  "время ответа" timestamp without time zone null
);

/**CREATE TABLE IF NOT EXISTS "медкол", "умолчания" (
  "задать вопросов" int,
  "всего время" int --- секунд
);*/

@@ сессия
-- любая
select * from (
select s.*,
  timestamp_to_json(s.ts) as "старт сессии",
  encode(digest(s."ts"::text, 'sha1'),'hex') as "сессия/sha1",
  
  t.id as "название теста/id", t."название" as "название теста",
  t."задать вопросов" as "тест/задать вопросов",
  t."всего время",
  
  EXTRACT(EPOCH from now()-s.ts) as "прошло с начала, сек",
  date_part('hour', (coalesce(t."всего время", ?)::text||' seconds')::interval) as "всего время/часы",
  date_part('minutes', (coalesce(t."всего время", ?)::text||' seconds')::interval) as "всего время/минуты",
  date_part('seconds', (coalesce(t."всего время", ?)::text||' seconds')::interval) as "всего время/секунды",
  p."процесс сдачи/id",
  p."задано вопросов",
  p."получено ответов",
  p."правильных ответов",
  date_part('hour', p."время тестирования") as "время тестирования/часы",
  date_part('minutes', p."время тестирования") as "время тестирования/минуты",
  date_part('seconds', p."время тестирования") as "время тестирования/секунды"
from "медкол"."сессии" s
  left join (
    select t.*, r.id2
    from "медкол"."связи" r
      join "медкол"."названия тестов" t on t.id=r.id1
  ) t  on s.id=t.id2
  
  left join lateral ( ---задано вопросов
    select 
      array_agg(p.id) as "процесс сдачи/id",
      count(p.*) as "задано вопросов",
      sum(case when p."ответ" is not null then 1::int else 0::int end) as "получено ответов",
      sum(case when p."ответ"=1 then 1::int else 0::int end) as "правильных ответов",
      max(p."время ответа")-min(p.ts) as "время тестирования"
    from "медкол"."связи" r
      join "медкол"."процесс сдачи" p on p.id=r.id2
    where r.id1=s.id
  ) p on true
) s
{%= $where || '' %};

@@ названия тестов
select *, encode(digest("ts"::text || id::text, 'sha1'),'hex') as id_digest,
  date_part('hour', (coalesce("всего время", ?)::text||' seconds')::interval) as "всего время/часы",
  date_part('minutes', (coalesce("всего время", ?)::text||' seconds')::interval) as "всего время/минуты",
  date_part('seconds', (coalesce("всего время", ?)::text||' seconds')::interval) as "всего время/секунды",
  
  q."всего вопросов"

from
  "медкол"."названия тестов" n
  left join (
    select n.id as "тест/id", count(q.*) as "всего вопросов"
    from 
      "медкол"."названия тестов" n
      join "медкол"."связи" r on n.id=r.id1
      join "медкол"."тестовые вопросы" q on q.id=r.id2
    group by n.id
  ) q on n.id=q."тест/id"

{%= $where || '' %}
order by n."название"
;

@@ тестовые вопросы
select *
from "медкол"."тестовые вопросы";

@@ вопросы списка
select {%= $select || '*' %} from (
select n.id as "ид списка", n."название", q.*
from "медкол"."названия тестов" n
  join "медкол"."связи" r on n.id=r.id1
  join "медкол"."тестовые вопросы" q on q.id=r.id2

where (coalesce(?::int, 0)=0 or n.id=?)
) q
{%= $order_by || '' %}


@@ заданный вопрос
--- в сессии, без ответа
select q.*,
  p.id as "процесс сдачи/id",
  p.ts "время вопроса",
  done.cnt as "№" -- по порядку
from "медкол"."связи" r
  join "медкол"."процесс сдачи" p on p.id=r.id2
  join "медкол"."связи" r2 on p.id=r2.id1
  
  ---join "медкол"."тестовые вопросы" q1 on q1.id=r2.id2
  
  join lateral (
    select id, "код", "вопрос",
      array_agg("ответ" order by "rand") as "ответы" ,
      array_agg(idx order by "rand") as "индексы ответов",
      array_agg(encode(digest(p.ts::text || id::text || idx::text, 'sha1'), 'hex') order by "rand") as "sha1" -- значения для крыжиков
    from (
      select q.id, q."код", "вопрос", "ответ", idx, random() as "rand"
      from "медкол"."тестовые вопросы" q,
        unnest("ответы")  WITH ORDINALITY AS a("ответ", idx)
      where q.id=r2.id2  ------ LATERAL-------- "код"='T005152'
    ) q
    group by id, "код", "вопрос"
  ) q on true ----------q.id=r2.id2
  
  join lateral (--- который вопрос по счету
    select count(distinct pp.*) as cnt
    from
      "медкол"."связи" rr
      join "медкол"."процесс сдачи" pp on pp.id=rr.id2
    where rr.id1=r.id1
  ) done on true
  
where r.id1=? -- ид сессии
  and p."ответ" is null
limit 1
;

@@ обрубить сессию от теста
delete from "медкол"."связи" where id in (
  select r1.id
  from "медкол"."названия тестов" t
    join "медкол"."связи" r1 on t.id=r1.id1
    join "медкол"."сессии" s on s.id=r1.id2
  where s.id=?
)
returning *;

@@ обрубить сессию от процесса
delete from "медкол"."связи" where id in (
  select r1.id
  from "медкол"."сессии" s
    join "медкол"."связи" r1 on s.id=r1.id1
    join "медкол"."процесс сдачи" p on p.id=r1.id2
  where s.id=?
)
returning *;

@@ начало теста
--- связать "названия тестов" -> "сессия"
insert into "медкол"."связи" (id1, id2)
select t.id, ?::int as id2 -- ид сессии
from "медкол"."названия тестов" t
where encode(digest(t."ts"::text || t.id::text, 'sha1'),'hex')=?
returning *
;

@@ новый вопрос
--- связать "сессия" -> "процесс сдачи" -> "тестовые вопросы"
select q.id
from "медкол"."названия тестов" t
  join "медкол"."связи" r1 on t.id=r1.id1
  join "медкол"."сессии" s on s.id=r1.id2
  join "медкол"."связи" r2 on t.id=r2.id1
  join "медкол"."тестовые вопросы" q on q.id=r2.id2
  left join (-- которые были в этой сессии
    select q.id, r.id1 --- ид сессии
    from "медкол"."связи" r
      join "медкол"."процесс сдачи" p on p.id=r.id2
      join "медкол"."связи" r2 on p.id=r2.id1
      join "медкол"."тестовые вопросы" q on q.id=r2.id2
  ) pq on s.id=pq.id1
where s.id=?
  and  q.id<>coalesce(pq.id, 0)  ----pq.id is null 
order by random()
limit 1
;

@@ мои результаты
--- цепочка сессия за сессией
WITH RECURSIVE rc AS (
   SELECT s.id, p.id as parent_id, 0::int AS "step"
   FROM "медкол"."сессии" s --- от новых сессий к старым
    join "медкол"."связи" r on s.id=r.id2
    join "медкол"."сессии" p on p.id=r.id1
    where s.id=?---5828
    
   UNION
   
   SELECT rc.id, p.id as parent, rc.step + 1
   FROM rc 
      join "медкол"."связи" r on rc.parent_id=r.id2
      join "медкол"."сессии" p on p.id=r.id1
)
{%= $DICT->render('результаты') %}
;

@@ результаты
select *, timestamp_to_json("сессия/ts") as "старт сессии"
from (---ради distinct
select distinct
  t.id as "тест/id", t."название" as "тест/название", t."задать вопросов",
  s.ts as "сессия/ts",
  
  s.id as "сессия/id",
  s."задать вопросов" as "сессия/задать вопросов",--- признак завершенной сессии для вычисления процента
  def."/задать вопросов",
  encode(digest(s."ts"::text, 'sha1'),'hex') as "сессия/sha1",
  p."задано вопросов",
  p."правильных ответов",
  (p."правильных ответов"::numeric / case when coalesce(s."задать вопросов", t."задать вопросов")::numeric = 0::numeric  then def."/задать вопросов" else coalesce(s."задать вопросов", t."задать вопросов")::numeric end *100::numeric)::numeric as "%",---
  date_part('hour', p."время тестирования") as "время тестирования/часы",
  date_part('minutes', p."время тестирования") as "время тестирования/минуты",
  date_part('seconds', p."время тестирования") as "время тестирования/секунды"
  {%= $append_select || '' %}
from (select ?::int as "/задать вопросов") def, rc
  join "медкол"."сессии" s on rc.parent_id=s.id
  join "медкол"."связи" r on s.id=r.id2
  join "медкол"."названия тестов" t on t.id=r.id1
  
  join lateral (-- вопросы в этой сессии
    select 
      count(p.*) as "задано вопросов",
      sum(case when p."ответ"=1 then 1::int else 0::int end) as "правильных ответов",
      max(p."время ответа")-min(p.ts) as "время тестирования"
    from 
      "медкол"."связи" rr
          join "медкол"."процесс сдачи" p on p.id=rr.id2
        where rr.id1=s.id
  ) p on true
---group by t."название", s.id, s.ts
{%= $where || '' %}
{%= $order_by // 'order by s.ts desc' %}
{%= $limit || '' %} {%= $offset || '' %}
) s
---;--- подзапрос

@@ результаты сессий
--- всех
WITH  rc AS (--RECURSIVE
   SELECT s.id as parent_id
   FROM "медкол"."сессии" s
    where s."задать вопросов" is not null
)
{%= $DICT->render('результаты', where=>$where || '', limit=>$limit || '', offset=>$offset || '',) %}
;

@@ результаты сессий/цепочки
--- общий список
WITH rc AS (
WITH RECURSIVE rc AS (
--- от топ сессий
   SELECT s.id, s.ts, array[]::int[] as parents_id, 0::int AS "step"
   FROM "медкол"."сессии" s 
   left join (---нет родительской сессии
    select p.id, r.id2
    from 
      "медкол"."связи" r ---on s.id=r.id2
      join "медкол"."сессии" p on p.id=r.id1
   ) p on s.id=p.id2
    
    where s."задать вопросов" is not null--- признак завершенной сессии для вычисления процента
      and p.id2 is null---5828
    
   UNION
   
   --- по дочерним сессиям
   SELECT c.id, c.ts, rc.parents_id || rc.id, rc.step + 1
   FROM rc 
      join "медкол"."связи" r on rc.id=r.id1
      join "медкол"."сессии" c on c.id=r.id2
) ---конец рекурсии

select rc.id, unnest(rc.parents_id) as parent_id, /*m.id1 as parent_id,*/ rc.ts, rc.step
from rc
  join (
    select parents_id[1] as id1, max(ts) as ts, max(step) as step
    from rc
    group by parents_id[1]
  ) m on rc.parents_id[1]=m.id1 and rc.step=m.step---rc.ts=m.ts---

) ---конец with, далее rc

select {%= $select || '*' %} from (
select 
  "последняя сессия/id", "последняя сессия/ts", "всего сессий",
  timestamp_to_json("последняя сессия/ts") as "последняя сессия/ts/json",
  array_agg("%" order by "сессия/ts" desc) as "%",
  sum(case when "%">=70::numeric then 1 else 0 end) as "%больше70",
  array_agg("сессия/id" order by "сессия/ts" desc) as "сессия/id",
  array_agg("сессия/sha1" order by "сессия/ts" desc) as "сессия/sha1",
  array_agg("сессия/ts" order by "сессия/ts" desc) as "сессия/ts",
  array_agg(timestamp_to_json("сессия/ts") order by "сессия/ts" desc) as "сессия/ts/json",
  array_agg("тест/id" order by "сессия/ts" desc) as "тест/id",
  array_agg("тест/название" order by "сессия/ts" desc) as "тест/название"
  
from (
%# обязательно order_by пустая строка
{%= $DICT->render('результаты', order_by=>'', append_select=>', rc.step as "всего сессий", rc.ts as "последняя сессия/ts", rc.id as "последняя сессия/id" ') %}
) g 
group by "всего сессий",  "последняя сессия/ts", "последняя сессия/id"
) g
{%= $where || '' %}
{%= $order_by || '' %}
;

@@ ответы в сессии
select q.*, p."ответ"
from "медкол"."связи" r
  join "медкол"."процесс сдачи" p on p.id=r.id2
  join "медкол"."связи" rq on p.id=rq.id1
  join "медкол"."тестовые вопросы" q on q.id=rq.id2

where r.id1=? -- ид сессии
  ---and coalesce(p."ответ", 0)<>1
order by p.ts
;


@@ связь удалить
delete
from "медкол"."связи"
where id=? or (id1=? and id2=?)
returning *;

@@ удалить объект
select "удалить объект"('медкол', ?, 'связи', ?);


@@ удалить из теста
delete from "медкол"."связи"
where id in (
  select r.id
  from "медкол"."названия тестов" t
    join "медкол"."связи" r on t.id=r.id1
    join "медкол"."тестовые вопросы" q on q.id=r.id2
  left join (--- 
    select r.id
    from "медкол"."названия тестов" t
    join "медкол"."связи" r on t.id=r.id1
    join "медкол"."тестовые вопросы" q on q.id=r.id2
    where t.id=? and q.id=any(?)
  ) ok on r.id=ok.id
  where 
  t.id=?
  and ok.id is null
);

@@ статистика по ответам
select *, ("количество правильных ответов"::numeric/"количество ответов"::numeric)*100 as "% успеха",
  date_part('minutes', "время ответа") as "время ответа/минуты",
  date_part('seconds', "время ответа") as "время ответа/секунды"
from (
select 
% if ($by_test) {
  t.id as "названия тестов/id",
% }

  q.id as "тестовые вопросы/id",
  count(p."ответ") as "количество ответов",
  sum(case when p."ответ"=1 then 1::int else 0::int end) as "количество правильных ответов",
  sum(case when p."ответ"=2 then 1::int else 0::int end) as "количество неправильно/2",
  sum(case when p."ответ"=3 then 1::int else 0::int end) as "количество неправильно/3",
  sum(case when p."ответ"=4 then 1::int else 0::int end) as "количество неправильно/4",
  sum(case when p."ответ"=5 then 1::int else 0::int end) as "количество неправильно/5",
  avg(p."время ответа"-p.ts) as "время ответа"

from 
  "медкол"."сессии" s
  
%# if ($by_test) {
  join "медкол"."связи" rt on s.id=rt.id2
  join "медкол"."названия тестов" t on t.id=rt.id1
%# }

  join "медкол"."связи" rp on rp.id1=s.id
  join "медкол"."процесс сдачи" p on p.id=rp.id2
  
  join "медкол"."связи" rq on p.id=rq.id1
  join "медкол"."тестовые вопросы" q on q.id=rq.id2
  
where 
  (coalesce(?::int, 0)=0 or t.id=?)
  and s."задать вопросов" is not null
  and p."ответ" is not null
group by 
% if ($by_test) {
  t.id,
% }
  q.id
) q
where "количество ответов">2
order by 9, "количество ответов"
;