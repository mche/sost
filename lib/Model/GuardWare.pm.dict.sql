@@ таблицы
create table IF NOT EXISTS "спецодежда" (
/* выдача спецодежды
** связи:
** id1("профили")->id2("спецодежда") --- много, на каких сотрудников записано
*/
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int not null, --- автор записи
  "дата1" date not null, -- дата выдачи
  "наименование" text not null, --- спецодежды
  "количество" numeric not null, --- 
  "ед" varchar, --- 
  "цена" money, ---
  "срок" numeric not null,--- использовования, месяцев
  "коммент"  text  --- 
);

@@ список спецодежды/профили
--- подзапрос
select s.id, array_agg(p.id) as "@профили/id"
from "спецодежда" s
  join (
    select p.*, r.id2
    from refs r
      join "профили" p on p.id=r.id1
  ) p on s.id=p.id2
group by s.id

@@ список спецодежды
select s."наименование", s."ед", jsonb_agg(s) as "@спецодежда/json"
from (
  select s.*, timestamp_to_json(s."дата1"::timestamp) as "$дата1/json", p."@профили/id"
  from "спецодежда" s
   left join ({%= $dict->render('список спецодежды/профили') %}) p on s.id=p.id
  {%= $where1 || '' %}
) s
group by s."наименование", s."ед"
order  by 1,2;