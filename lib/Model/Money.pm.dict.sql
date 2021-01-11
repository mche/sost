@@ таблицы
create table IF NOT EXISTS "{%= $schema %}"."{%= $tables->{main} %}" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  "сумма" money not null,
  "дата" date not null,
  "примечание" text null,
  uid int --- кто записал/обновил alter table "движение денег" add column uid int;
);
/*
Обязательные связи:
id1("категории")->id2("движение денег")
id1("кошелек")->id2("движение денег")

Прочие связи:
id1("контрагенты")->id2("движение денег") --- внешний платеж
id1("roles")->id2("движение денег") --- объект, если внешний платеж
id1("движение денег")->id2("кошелек") --- внутр перемещение
id1("движение денег")->id2("профиль") --- расчет с сотрудником

!!!!!!!!!!!!!!!!!!!!!
Эта таблица использ для зарплатных дополнительных начислений/удержаний для расчетов ЗП сотрудников
При этом, вместо обязательной связи id1("кошелек")->id2("движение денег") делается
обязательная связь id2("движение денег")->id1("профиль") (как расчет с сотрудником )
Поэтому эти записи (пока) не попадут в балансовые расчеты по сотрудникам и движению денег

Однако, когда закрывается зарплатный расчет, то к записям доп начислений/удержаний
делается связь id2("движение денег")->id2("табель": "значение"='РасчетЗП', "коммент"=<скорректир сумма к выплате> ...)
и тогда записи попадают в балансовые расчеты и сводки по деньгам (view "движение ДС/начисления сотрудникам")
*/

create index IF NOT EXISTS "idx/движение денег/дата" on "движение денег" ("дата");

------------------------------------------------------

CREATE TABLE  IF NOT EXISTS "движение денег/изменения" (
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  "профиль" int,
  "категория" int,
  "кошелек" int,
  uid int, --- кто обновил
  old text --- строка "движение денег"
);
--DROP FUNCTION IF EXISTS "движение денег/триггер/сотрудник"();
/*
Убрал
CREATE OR REPLACE FUNCTION "движение денег/TG_UPDATE"()
RETURNS trigger language plpgsql as
$FUNC$
DECLARE
  rec RECORD;
BEGIN

---отслеживать измениения по профилям

select into rec 
  p.id as pid, c.id as cid, w.id as wid
from
  "движение денег" m
  join refs r on m.id=r.id1
  join "профили" p on p.id=r.id2
  --- категории
  join refs rc on m.id=rc.id2
  join "категории" c on c.id=rc.id1
  ---кошелек
  join refs rw on m.id=rw.id2
  join "кошельки" w on w.id=rw.id1
where m.id=OLD.id
;

IF rec IS NOT NULL THEN
  --RAISE NOTICE 'Изменяется профиль id=%, кто изменил=%', old_pid, NEW.uid;
  insert into "движение денег/изменения" ("профиль", "категория", "кошелек", uid, "old") values (rec.pid, rec.cid, rec.wid, NEW.uid, (OLD)::text);
---select r.* from "движение денег/изменения" m, json_populate_record(null::"движение денег", m.old) r;
---! select (old::"движение денег").*  from "движение денег/изменения";
END IF;


IF (TG_OP = 'DELETE') THEN
  RETURN OLD;
ELSE 
  RETURN NEW;
END IF;

END
$FUNC$;
*/

--DROP TRIGGER IF EXISTS "движение денег/триггер/сотрудник" on "движение денег";
DROP TRIGGER IF EXISTS "движение денег/TG_UPDATE" on "движение денег";
DROP FUNCTION IF EXISTS "движение денег/TG_UPDATE"();
/*CREATE TRIGGER "движение денег/TG_UPDATE"
BEFORE UPDATE  ON "движение денег"
    FOR EACH ROW EXECUTE FUNCTION "движение денег/TG_UPDATE"();
*/

CREATE OR REPLACE FUNCTION unnest_2dim(ANYARRAY, OUT a ANYARRAY)
  RETURNS SETOF ANYARRAY AS
/*
Двумерный массив -> одномерные строки
*/
$func$
BEGIN
   FOREACH a SLICE 1 IN ARRAY $1 LOOP
      RETURN NEXT;
   END LOOP;
END
$func$  LANGUAGE plpgsql IMMUTABLE STRICT;

----================================================================

@@ список или позиция?cached=1
---
select {%= $select || '*' %} from (
select m.*,
  "формат даты"(m."дата") as "дата формат",
  timestamp_to_json(m."дата"::timestamp) as "$дата/json",
  ----to_char(m."дата", 'TMdy, DD TMmon' || (case when date_trunc('year', now())=date_trunc('year', m."дата") then '' else ' YYYY' end)) as "дата формат",
  cat.id as "категория/id", /*"категории/родители узла/title"(c.id, false) as*/ cat.parents_title[2:]||cat.title as "категории",
  coalesce(ca.id, rent."контрагент/id") as "контрагент/id", coalesce(ca.title, rent."контрагент/title") as "контрагент", rent."договор аренды/id",
  coalesce(ob.id, rent."@объекты/id"[1]) as "объект/id", coalesce(ob.name, rent."@объекты/name"[1]) as "объект",
  w2.id as "кошелек2/id", w2.title as "кошелек2",
  pp.id as "профиль/id", array_to_string(pp.names, ' ') as "профиль",
  w.id as "кошелек/id", w.title as "кошелек",
  ---w."проект", w."проект/id" -- надо
  p.id as "проект/id", p."name" as "проект",
  row_to_json(u)::jsonb || timestamp_to_json(m.ts)::jsonb as "$создатель/json",
  m1."@id1", m2."@id2"
  ---timestamp_to_json(m.ts) as "$ts/json"

from  "{%= $schema %}"."{%= $tables->{main} %}" m

  --- категории
  join refs rc on m.id=rc.id2
  join "категории/родители"() cat on cat.id=rc.id1
  
  ---кошелек
  join refs rw on m.id=rw.id2
  join "кошельки" w on w.id=rw.id1
  
  ---  проект через кошелек
  join refs rp on w.id=rp.id2
  join "roles" p on p.id=rp.id1
  
  left join ({%= $dict->render('контрагент') %}) ca on m.id=ca."движение денег/id"
  left join ({%= $dict->render('договор аренды') %}) rent on m.id=rent."движение денег/id"
  left join ({%= $dict->render('объект') %}) ob on m.id=ob."движение денег/id"
  left join ({%= $dict->render('кошелек2') %}) w2 on m.id=w2."движение денег/id"
  left join ({%= $dict->render('профиль') %}) pp on m.id=pp."движение денег/id"
  left join "профили" u on m.uid=u.id
  left join (--- связи с другими записями ДС
    select r.id2, array_agg(m.id) as "@id1"
    from "{%= $schema %}"."{%= $tables->{main} %}" m
      join refs r on m.id=r.id1
    group by r.id2
  ) m1 on m.id=m1.id2
  left join (--- связи с другими записями ДС
    select r.id1, array_agg(m.id) as "@id2"
    from "{%= $schema %}"."{%= $tables->{main} %}" m
      join refs r on m.id=r.id2
    group by r.id1
  ) m2 on m.id=m2.id1

{%= $where || '' %}
{%= $order_by || '' %}
---order by m."дата" desc, m.id desc
{%= $limit_offset || '' %}
---where (::int is null or m.id =)
--  and p.id=20962 -- все проекты или проект
) m
%#{%= $where || '' %}


;

@@ контрагент
-- подзапрос
select c.*, m.id as "движение денег/id"  ---r.id2 as _ref
from 
  "{%= $schema %}"."{%= $tables->{main} %}" m
  join refs r on m.id=r.id2
  join "контрагенты" c on c.id=r.id1

@@ договор аренды
select k.id as "контрагент/id", k.title as "контрагент/title",
  d.id as "договор аренды/id", m.id as "движение денег/id",
  ob."@объекты/id", ob."@объекты/name", ob."@объекты/json"
  
from
  "{%= $schema %}"."{%= $tables->{main} %}" m
  join refs r on m.id=r.id2
  join "аренда/договоры" d on d.id=r.id1
  
  join refs rk on d.id=rk.id2
  join "контрагенты" k on k.id=rk.id1
  
  left join (--- много строк помещений по объектам
    select d.id as "договор/id",
      array_agg(ob.id) "@объекты/id",
      array_agg(ob.name) "@объекты/name",
      array_agg(ob) as "@объекты/json"
    from
      "аренда/договоры" d
      join refs rdp on d.id=rdp.id1
      join "аренда/договоры-помещения" dp on dp.id=rdp.id2

      join refs rp on dp.id=rp.id2
      join "аренда/помещения" p on p.id=rp.id1
      
      join refs rol on p.id=rol.id2
      join "аренда/объекты/литеры" lit on lit.id=rol.id1
      
      join refs rro on lit.id=rro.id2
      join "аренда/объекты" o on o.id=rro.id1
      
      join refs ro on o.id=ro.id2
      join "roles" ob on ob.id=ro.id1
    
    group by d.id
  ) ob on ob."договор/id"=d.id


@@ объект
-- подзапрос
select o.*, m.id as "движение денег/id"  ---r.id2 as _ref
from 
  "{%= $schema %}"."{%= $tables->{main} %}" m
  join refs r on m.id=r.id2
  join "roles" o on o.id=r.id1

@@ кошелек2
  -- обратная связь с внутренним перемещением
select distinct w.id, p.name || ':' || w.title as title, m.id as "движение денег/id"
from
  "проекты" p
  join refs r on p.id=r.id1
  join "кошельки" w on w.id=r.id2
  join refs rm on w.id=rm.id2 -- к деньгам
  join "{%= $schema %}"."{%= $tables->{main} %}" m on m.id=rm.id1

@@ профиль
--- сотрудник обратная связь
select p.*, m.id as "движение денег/id"
from 
  "{%= $schema %}"."{%= $tables->{main} %}" m
  join refs r on m.id=r.id1
  join "профили" p on p.id=r.id2

@@ расчеты по профилю
-- детализация в сводке табеля
-- список внедряется в компонент-таблицу waltex/money/table

select {%= $select || '*' %}
from (
select id, ts, "дата", timestamp_to_json("дата"::timestamp) as "$дата/json",
  ----to_char("дата", 'TMdy, DD TMmonth' || (case when date_trunc('year', now())=date_trunc('year', "дата") then '' else ' YYYY' end)) as "дата формат",
  "формат даты"("дата") as "дата формат",
  "сумма", sign, "категории", "категория/id",  --- "категории"[2] as "категория/id",
  row_to_json(null) as "$объект/json", null::int as "объект/id", null::text as "объект",
  array_to_string("кошельки", ': ') as "кошелек", "кошельки/id"[1][2] as "кошелек/id",
  "примечание", "профиль/id", "профиль", false as "начислено"
from "движение ДС/по сотрудникам" -- view приход/расход
where (? is null or "профиль/id"=any(?))
  and (coalesce(?::int, 0) = 0 or "кошельки/id"[1][1]=?) -- проект

union all

select 
  null as id, -- не редактировать в форме
  ts,
  "дата", timestamp_to_json("дата"::timestamp) as "$дата/json",
  ----to_char("дата", 'TMdy, DD TMmonth' || (case when date_trunc('year', now())=date_trunc('year', "дата") then '' else ' YYYY' end)) as "дата формат",
  "формат даты"("дата") as "дата формат",
  "сумма", sign, "категория" as "категории", "категории"[2] as "категория/id",
  "$объект/json", "объект/id", "объект",
  null as "кошелек", null as "кошелек/id",
  "примечание", "профиль/id", "профиль", true as "начислено"
from "движение ДС/начисления сотрудникам" -- движение ДС/начисления по табелю view только  приходы по табелю
where (? is null or "профиль/id"=any(?))
  and (coalesce(?::int, 0) = 0 or "кошельки/id"[1][1]=?) -- проект
) u

{%= $where || '' %}
order by "дата" desc, ts desc
{%= $limit_offset || '' %}
;

@@ баланс по профилю
-- возможно на дату 
select sum("сумма") as "баланс"
from (
select "сумма", "профиль/id"
from "движение ДС/по сотрудникам" -- view приход/расход
where (? is null or "профиль/id"=any(?))
  and (?::date is null or "дата" < {%= $date_expr || '?' %}::date)

union all --- начисления зп

select "сумма", "профиль/id"
from "движение ДС/начисления сотрудникам" -- движение ДС/начисления по табелю view только  приходы по табелю
where (? is null or "профиль/id"=any(?))
  and (?::date is null or "дата" < {%= $date_expr || '?' %}::date)

/*уже включено в движение ДС/начисления сотрудникам
union all --- расчетные начисления без кошелька

select m."сумма", p.id
from "движение денег" m
  join refs r on m.id=r.id2
  join "профили" p on p.id=r.id1
where sign(m."сумма"::numeric)=1 --- только приходы, расходы будут одной цифрой - выплата
  and (X::int is null or p.id=X)
  and (X::date is null or m."дата" < {%= $date_expr || 'X::date' %})
*/
) u
----group by "профиль/id"
;

@@ пакетное сохранение
WITH cat as (
  select c.*---c.id, jsonb_agg(cat order by cat.level desc) as "@категории"
  from 
    "категории/родители"() c--, ---on c.id=rc.id1,
    ---"категории/родители узла"(c.id, false) cat
  ---group by c.id
)

select
  v.val[1]::date as "дата",
  timestamp_to_json(v.val[1]::timestamp) as "$дата/json",
  trim(' ' from v.val[2]) as "ИНН",
  v.val[3]::money as "сумма",
  w.id as "кошелек/id", to_json(w) as "$кошелек/json",---v.val[4]
  cat.id as "категория/id", cat.parents_title[2:]||cat.title as "@категории", ----cat."@категории" as "@категории/json",---v.val[5]
  ob.id as "объект/id", to_json(ob) as "$объект/json",---v.val[6]
  v.val[7] as "примечание",
  v.val[8:] as "прочие колонки",
  k.id as "контрагент/id", to_json(k) as "$контрагент/json",
  to_json(m) as "$похожая запись/json",
  case when m.id::boolean then false when k.id::boolean then true else false end as "крыжик"
from
  unnest_2dim(?::text[][]) WITH ORDINALITY AS  v(val,n)
  join cat on cat.id=v.val[5]::int
  ---кошелек
  join "кошельки" w on w.id=v.val[4]::int
    ---  проект через кошелек для похожих записей
  join refs rpr on w.id=rpr.id2
  join "roles" pr on pr.id=rpr.id1
  
  left join "roles" ob on ob.id=v.val[6]::int
  
  left join "контрагенты" k on coalesce(trim(' ' from coalesce("реквизиты",'{}'::jsonb)->>'ИНН'), '0'||(k.id::text))=trim(' ' from v.val[2])
  left join (--- ловим похожие записи
    select m.*, cat.parents_title[2:]||cat.title as "@категории",/*to_json(c) as "$категория",*/ pr.id as "проект/id", w.id as "кошелек/id", to_json(w) as "$кошелек", k.id as "контрагент/id", to_json(ob) as "$объект"
    from 
      "{%= $schema %}"."{%= $tables->{main} %}" m

      --- категории
      join refs rc on m.id=rc.id2
      --join "категории" c on c.id=rc.id1
      join cat on cat.id=rc.id1
      
      
      ---кошелек
      join refs rw on m.id=rw.id2
      join "кошельки" w on w.id=rw.id1
        ---  проект через кошелек
      join refs rpr on w.id=rpr.id2
      join "roles" pr on pr.id=rpr.id1
      
      join ({%= $dict->render('контрагент') %}) k on m.id=k."движение денег/id"
      left join ({%= $dict->render('объект') %}) ob on m.id=ob."движение денег/id"
  ) m on m."проект/id"=pr.id and m."дата"=v.val[1]::date and m."контрагент/id"=k.id and m."сумма"=v.val[3]::money
order by v.n

