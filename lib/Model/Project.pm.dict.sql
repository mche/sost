@@ таблицы
/*
create table IF NOT EXISTS "{%= $schema %}"."{%= $tables->{main} %}" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  title text not null,
  disabled boolean
);

alter table "проекты" rename to "проекты000";

CREATE OR REPLACE  VIEW "проекты/сотрудники" as
-- все проекты left сотрудники
select p.*, u.id as "сотрудник/id", u.names as "сотрудник"
from "проекты" p
  left join (
    select u.*, r.id1
    from "профили" u
      join refs r on u.id=r.id2
  ) u on u.id1=p.id
;

with p as (
select p0.id as id0, p.id
from "проекты000" p0
  join "проекты" p on p0.name=p.name
)

UPDATE refs AS r
SET id1 = p.id
FROM p
WHERE r.id1 = p.id0
;

with p as (
select p0.id as id0, p.id
from "проекты000" p0
  join "проекты" p on p0.name=p.name
)

UPDATE refs AS r
SET id2 = p.id
FROM p
WHERE r.id2 = p.id0
;

dev7=# select * from "проекты";
  id   |             ts             |    title     | disabled | descr 
-------+----------------------------+--------------+----------+-------
 20960 | 2017-07-25 15:14:08.216663 | ИнтехБурение |          | 
 20962 | 2017-07-25 15:14:31.790417 | ТехДорГрупп  |          | 
 20964 | 2017-07-25 15:15:22.185695 | Керамзит     |          | 
(3 строки)

dev7=# select * from "контрагенты" where title='ТехДорГрупп';
  id   |             ts             |    title    
-------+----------------------------+-------------
 16307 | 2017-07-05 18:12:42.012313 | ТехДорГрупп
(1 строка)

dev7=# select * from "контрагенты" where title='ИнТехБурение';
  id   |             ts             |    title     
-------+----------------------------+--------------
 16404 | 2017-07-05 18:23:43.825678 | ИнТехБурение
(1 строка)

insert into refs ("id1", "id2") values (20960, 16404); --- ИнТехБурение
insert into refs ("id1", "id2") values (20962, 16307); --- ТехДорГрупп

*/

@@ функции



---drop VIEW if exists "проекты" CASCADE;
CREATE OR REPLACE  VIEW "проекты" as
---select * from ( --- финальные позиции проектов в самом конце
select /*distinct*/ p.*
  ---k.id as "контрагент/id",
  ---k.title as "контрагент/title", k.title as "контрагент/name",
  ---row_to_json(k) as "$контрагент/json"
  ---row_to_json(o) as "$объект/json"
from

  "roles/родители"(null) p
  
  left join "объекты" o on p.id=o.id

where 20959=any(p."parents/id") --- Проекты (но с вложенными объектами)
  and ((coalesce(p."childs/id", array[]::int[])=array[]::int[] or p."childs/id"=array[null]::int[])  -- вообще нет потомков
    or exists ( --- есть потомок из объектов
      select id
      from "объекты"
      where id=any(p."childs/id")
  ))
  and o.id is null --- без объектов
;

---DROP VIEW IF EXISTS  "проекты/объекты";
---DROP VIEW IF EXISTS  "проекты+контрагенты+объекты";---контрагенты уже в "проекты"
CREATE OR REPLACE VIEW "проекты/объекты" AS
select
  o.id,
  o.id as "объект/id",
  o.name,
  o.name as "объект",
  p.id as "проект/id",
  p.name as "проект",
  k.id as "контрагент/id", ---p."контрагент/title", p."контрагент/name",
  row_to_json(k) as "$контрагент/json",
  row_to_json(p) as "$проект/json"

from 
  "объекты" o
  left join (
    select distinct p.id, p.name,  r.id2
    from "refs" r
      join "проекты" p on p.id=r.id1
  ) p on o.id=p.id2
  
  left join (
    select k.*, r.id1
    from  refs r
      join "контрагенты" k on k.id=r.id2
  ) k on p.id=k.id1
;

/****************** ЗАПРОСЫ ***************/

@@ список
select p.*,
  k.id as "контрагент/id", ---p."контрагент/title", p."контрагент/name",
  row_to_json(k) as "$контрагент/json"
from
  (
  select distinct id, name, descr, disable
  from "{%= $schema %}"."{%= $tables->{main} %}"
  ) p
  
  /*left*/ join (
    select k.*, r.id1
    from  refs r
      join "контрагенты" k on k.id=r.id2
  ) k on p.id=k.id1

order by name
;


