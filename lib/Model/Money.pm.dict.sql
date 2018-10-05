@@ таблицы
create table IF NOT EXISTS "{%= $schema %}"."{%= $tables->{main} %}" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  "сумма" money not null,
  "дата" date not null,
  "примечание" text null
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

@@ список или позиция?cached=1
---
select {%= $select || '*' %} from (
select m.*,
  "формат даты"(m."дата") as "дата формат",
  timestamp_to_json(m."дата"::timestamp) as "$дата/json",
  ----to_char(m."дата", 'TMdy, DD TMmon' || (case when date_trunc('year', now())=date_trunc('year', m."дата") then '' else ' YYYY' end)) as "дата формат",
  c.id as "категория/id", "категории/родители узла/title"(c.id, false) as "категории",
  ca.id as "контрагент/id", ca.title as "контрагент",
  ob.id as "объект/id", ob.name as "объект",
  w2.id as "кошелек2/id", w2.title as "кошелек2",
  pp.id as "профиль/id", array_to_string(pp.names, ' ') as "профиль",
  w.id as "кошелек/id", w.title as "кошелек",
  ---w."проект", w."проект/id" -- надо
  p.id as "проект/id", p."name" as "проект"

from  "{%= $schema %}"."{%= $tables->{main} %}" m

  --- категории
  join refs rc on m.id=rc.id2
  join "категории" c on c.id=rc.id1
  
  ---кошелек
  join refs rw on m.id=rw.id2
  join "кошельки" w on w.id=rw.id1
  
  ---  проект через кошелек
  join refs rp on w.id=rp.id2
  join "roles" p on p.id=rp.id1
  
  left join ({%= $dict->render('контрагент') %}) ca on m.id=ca."движение денег/id"
  left join ({%= $dict->render('объект') %}) ob on m.id=ob."движение денег/id"
  left join ({%= $dict->render('кошелек2') %}) w2 on m.id=w2."движение денег/id"
  left join ({%= $dict->render('профиль') %}) pp on m.id=pp."движение денег/id"

{%= $where1 || '' %}
---where (::int is null or m.id =)
--  and p.id=20962 -- все проекты или проект
) m
{%= $where || '' %}

order by "дата" desc, ts desc
{%= $limit_offset || '' %}
;

@@ контрагент
-- подзапрос
select c.*, m.id as "движение денег/id"  ---r.id2 as _ref
from 
  "{%= $schema %}"."{%= $tables->{main} %}" m
  join refs r on m.id=r.id2
  join "контрагенты" c on c.id=r.id1

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