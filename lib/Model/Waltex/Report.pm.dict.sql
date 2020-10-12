@@ временная схема
DROP SCHEMA IF EXISTS "tmp" CASCADE;
CREATE SCHEMA "tmp";
CREATE EXTENSION IF NOT EXISTS intarray;

@@ все платежи/from
-- для view (контрагенты+сотрудники!!!)
  ({%= $dict->render('проект/кошелек') %}) w
  join "движение денег" m on m.id=w._ref
  join ({%= $dict->render('категория') %}) c on c._ref = m.id
  left join ({%= $dict->render('кошелек2') %}) w2 on w2._ref = m.id --- чтобы отсечь по w2.id is null
  left join ({%= $dict->render('контрагент') %}) k on k._ref = m.id
  left join ({%= $dict->render('договор аренды') %}) ctr on m.id=ctr."движение денег/id"
  left join ({%= $dict->render('профиль') %}) pp on pp._ref = m.id
  left join ({%= $dict->render('объект') %}) ob on ob._ref = m.id
  

@@ внутренние перемещения/from
-- для view
  ({%= $dict->render('проект/кошелек') %}) w
  join "движение денег" m on m.id=w._ref
  join ({%= $dict->render('категория') %}) c on m.id=c._ref
  join ({%= $dict->render('кошелек2') %}) w2 on w2._ref = m.id
  

@@ движение по сотрудникам/from
-- для view (в расчетах включено во внешние платежи как $dict->render('профиль'))
  ({%= $dict->render('проект/кошелек') %}) w
  join "движение денег" m on m.id=w._ref
  join ({%= $dict->render('категория') %}) c on m.id=c._ref
  join ({%= $dict->render('профиль') %}) pp on pp._ref = m.id

@@ проект/кошелек
select w.*, p.id as "проект/id", p.name as "проект", rm.id2 as _ref
from
 ----"проекты" p
 "roles" p
  join refs rp on p.id=rp.id1
  join "кошельки" w on w.id=rp.id2
  join refs rm on w.id=rm.id1 -- к деньгам

@@ кошелек2
  -- обратная связь с внутренним перемещением
  select /*distinct*/ w.*, rm.id1 as _ref, p.name as "проект", p.id as "проект/id"
  from 
  ---"проекты" p
    "roles" p
    join refs r on p.id=r.id1
    join "кошельки" w on w.id=r.id2
    join refs rm on w.id=rm.id2 -- к деньгам

@@ контрагент
  select k.*, rm.id2 as _ref
  from "контрагенты" k
    join refs rm on k.id=rm.id1 -- к деньгам

@@ договор аренды
select c.*, rent.id as "договор аренды/id", m.id as "движение денег/id"
from
  "{%= $schema %}"."{%= $tables->{main} %}" m
  join refs r on m.id=r.id2
  join "аренда/договоры" rent on rent.id=r.id1
  join refs rc on rent.id=rc.id2
  join "контрагенты" c on c.id=rc.id1

@@ объект
-- подзапрос
select c.*, r.id2 as _ref
from refs r
join "roles" c on r.id1=c.id

@@ профиль
-- расчеты с сотрудниками
-- обратная связь
  select p.*, rm.id1 as _ref
  from "профили" p
    join refs rm on p.id=rm.id2 -- к деньгам

@@ категория
select c.*, rm.id2 as _ref
from "категории" c
  join refs rm on c.id=rm.id1 -- к деньгам

@@ снимок диапазона
--- юнионы: внешние(контрагенты+сотрудники+внутр кошел) внутр(другой кошелек) начисления из табеля(приходы сотрудникам)
-- остатки тут не вычисляются поэтому можно отсекать
---DROP TABLE IF EXISTS "tmp"."{%= $temp_view_name %}";
---CREATE UNLOGGED  TABLE "tmp"."{%= $temp_view_name %}" as
DROP MATERIALIZED VIEW IF EXISTS "tmp"."{%= $temp_view_name %}";
CREATE MATERIALIZED VIEW  "tmp"."{%= $temp_view_name %}" as

{%= join qq'\n union all \n', map($dict->render($_, where=>$where || {}), @$union) %}

--- union all -- внутренние перемещения по кошелькам
--- union all -- расчеты по сотрудникам во внешнех расчетах!
--- union all --- приходы начисления сотрудникам

WITH DATA
;
---REFRESH MATERIALIZED VIEW "{%= $temp_view_name %}" WITH NO DATA;
---REFRESH MATERIALIZED VIEW "{%= $temp_view_name %}" WITH DATA; -- REFRESH MATERIALIZED VIEW CONCURRENTLY

@@ движение всего
select case when "sign" > 0 then 'приход' else 'расход' end as "title",
  "sign",
  sum as "всего"
from (
select "sign", sum("сумма") as sum
from "tmp"."{%= $temp_view_name %}"
group by "sign"
) s
;

@@ снимок диапазона/union/все платежи
select *,
  to_char("дата", ?) as "код интервала", to_char("дата", ?) as "интервал"
from 
  (
  select *
  from "движение ДС/все платежи" --- view
  
  union all

  select 
  "договор/id" as id, "договор/ts" as ts, "дата", -1::numeric*"сумма" as "сумма",
    -1::numeric as "sign", --- счет-расход
    "категории", "категория",
    "контрагент", "контрагент/id",
    "$объект/json", "объект/id", "объект",
    null::int as "кошелек2", --- left join
    null::text as "профиль", null::int as "профиль/id",
    /*null::text[][] as */"кошельки", --- пока не знаю
    /*null::int[][] as*/ "кошельки/id",  --- пока не знаю
    "примечание"
    --~ timestamp_to_json("дата") as "$дата",
    --~ null as "приход",
    --~ "сумма" as "расход"
  from "движение ДС/аренда/счета" ---только аренда помещений и предоплата

  union all

  select *
    --~ timestamp_to_json("дата") as "$дата",
    --~ null as "приход",
    --~ -1::numeric*"сумма" as "расход"
  from "аренда/счета доп платежей" --- по аренде доп платежи арендаторов
) a
{%= ($where && $where->{'снимок диапазона/union/все платежи'}) || '' %}

@@ снимок диапазона/union/внутр перемещения
select *,
  to_char("дата", ?) as "код интервала", to_char("дата", ?) as "интервал"
from 
  "движение ДС/внутр перемещения" --veiw
{%= ($where && $where->{'снимок диапазона/union/внутр перемещения'}) || '' %}


@@ снимок диапазона/union/начисления сотрудникам
select *,
  to_char("дата", ?) as "код интервала", to_char("дата", ?) as "интервал"
from 
  "движение ДС/начисления сотрудникам" --- view
{%= ($where && $where->{'снимок диапазона/union/начисления сотрудникам'}) || '' %}

@@ снимок диапазона/union/начисления сотрудникам/по объектам
--- тут только часть (копировано из "движение ДС/начисления сотрудникам" + join толко закрытых) - начисления по объектам
select *,
  to_char(t."дата", ?) as "код интервала", to_char(t."дата", ?) as "интервал"
from (
  select t.* from
    ---"движение ДС/начисления по табелю" t
    (--- знак расхода по объекту
    select t.id, t.ts, t."дата", -1::numeric*t."сумма",---как расход
      -1::numeric as "sign",
     --- "категории/родители узла/id"(123439::int, true) as "категории",
      ---"категории/родители узла/title"(123439::int, false) as "категория",
      cat.parents_id||cat.id as "категории", cat.parents_title[2:]||cat.title as "категория",
      null::text as "контрагент", null::int as "контрагент/id",
      row_to_json(null) as "$объект/json", "объект/id", "объект",
      null::int as "кошелек2",
      "профиль", "профиль/id",
      ---! вместо проект+кошелек  - проект+объект
      array[[/*"проект"*/ null, "объект"]]::text[][] as "кошельки", --- проект+объект, ... ---проект нельзя, один объект в разных проектах!!!
      array[[/*"проект/id"*/ null, "объект/id"]]::int[][] as "кошельки/id",  --- проект+объект, ... ---проект нельзя, один объект в разных проектах!!!
      ---'(' || "проект" || ': ' || "объект" || ') ' || coalesce("примечание", ''::text) as "примечание"
      "примечание"
    from 
      "табель/начисления/объекты" t, -- view  в модели Model::TimeWork.pm
      ---(select array_agg("id" order by level desc) as "@id", (array_agg("title" order by level desc))[2:] as "@title" from "категории/родители узла"(123439::int, true)) cc
      "категории/родители"() cat
    where cat.id=123439 --начисление по табелю
    ) t
    -- табель строка РасчетЗП
    join "табель" t2 on date_trunc('month', t2."дата") = date_trunc('month', t."дата")
    join refs rpt on t2.id=rpt.id2 and rpt.id1=t."профиль/id" -- профиль
    
  where 
    t2."значение"='РасчетЗП'
    and t2."коммент" is not null
) t
{%= ($where && $where->{'снимок диапазона/union/начисления сотрудникам/по объектам'}) || '' %}


@@ снимок диапазона/union/аренда
select *,
  to_char("дата", ?) as "код интервала", to_char("дата", ?) as "интервал"
from 
  (
    select 
    "договор/id" as id, "договор/ts" as ts, "дата", -1::numeric*"сумма" as "сумма",
      -1::numeric as "sign", --- счет-расход
      "категории", "категория",
      "контрагент", "контрагент/id",
      "$объект/json", "объект/id", "объект",
      null::int as "кошелек2", --- left join
      null::text as "профиль", null::int as "профиль/id",
      /*null::text[][] as */"кошельки", --- пока не знаю
      /*null::int[][] as*/ "кошельки/id",  --- пока не знаю
      "примечание"
    from "движение ДС/аренда/счета" ---только аренда помещений и предоплата

    union all
    select *
    from "аренда/счета доп платежей" --- по аренде доп платежи арендаторов
  
  ) a
{%= ($where && $where->{'снимок диапазона/union/аренда'}) || '' %}


@@ движение всего/2
-- вертикальная сводная
-- суммы по строкам
select "интервал" as title, "интервал", "код интервала", "код интервала" as "key",
  sum("сумма") as "всего"
from "tmp"."{%= $temp_view_name %}"
group by "интервал", "код интервала"
order by "код интервала"
;



@@ всего/все кошельки
-- вертикальная сводная
-- суммы по строкам
select "кошельки"[1][1:2] as title, array_to_string("кошельки/id"[1][1:2], ':') as "key",
  sum("сумма") as "всего"
from "tmp"."{%= $temp_view_name %}"
group by "кошельки"[1][1:2], "кошельки/id"[1][1:2]
;

@@ всего/все контрагенты
-- вертикальная сводная
-- суммы по строкам
select title, "key", sum("сумма") as "всего"
from (
select coalesce("контрагент", '_пусто_') as title,  coalesce("контрагент/id", 0) as "key",
  "сумма"
from "tmp"."{%= $temp_view_name %}"
---where
---  "профиль/id" is null -- отсекать по сотрудникам
---  and "кошелек2" is null -- отсекать внутренние перемещения
) s
group by "title", "key"
;

@@ всего/все профили
-- вертикальная сводная
-- суммы по строкам
select title, "key", sum("сумма") as "всего"
from (
select "профиль" as title,  "профиль/id" as "key",
  "сумма"
from "tmp"."{%= $temp_view_name %}"
---where
--  "профиль/id" is not null -- отсекать контрагентов
--  and "кошелек2" is null -- отсекать внутренние перемещения
) s
group by "title", "key"
;


@@ движение/интервалы/столбцы
-- гориз таблица
-- колонки
select case when "sign" > 0 then 'приход' else 'расход' end as "title", "sign", "интервал", "код интервала", sum("сумма" * "sign") as sum
from "tmp"."{%= $temp_view_name %}"
group by "sign", "интервал", "код интервала"
order by "sign" desc, "код интервала"
;

@@ движение/интервалы/строки
-- вертикальная сводная
--- основное тело сумм
select "sign", "интервал", "интервал" as title, "код интервала", "код интервала" || ':' || "sign"::text as "key", sum("сумма" * "sign") as sum
  ---3::int as "категория"
from "tmp"."{%= $temp_view_name %}"
group by "sign", "интервал", "код интервала"
---order by "код интервала", "sign" desc;
;

@@ движение/все кошельки
-- вертикальная сводная
--- основное тело сумм
select "sign", "кошельки"[1][1:2] as title,  array_to_string("кошельки/id"[1][1:2], ':') || ':' || "sign"::text as "key", sum("сумма" * "sign") as sum
from "tmp"."{%= $temp_view_name %}"
group by "sign", "кошельки"[1][1:2], "кошельки/id"[1][1:2]
---order by array_to_string("кошельки"[1][1:2], ':'), "sign" desc;
;

@@ движение/все кошельки2
-- вертикальная сводная
--- основное тело сумм
select m."sign",
  array_to_string(array[w2."проект", w2.title], ': ') as title,
  array_to_string(array[w2."проект/id", w2.id], ':') || ':' || m."sign"::text as "key",
  sum(m."сумма" * m."sign") as sum
from "tmp"."{%= $temp_view_name %}" m
  join (
  select /*distinct*/ w.*, p.id as "проект/id", p.name as "проект"
  from 
  ---"проекты" p
  "roles" p
    join refs r on p.id=r.id1
    join "кошельки" w on w.id=r.id2
  ) w2 on m."кошелек2"=w2.id
group by m."sign", w2."проект/id", w2.id, w2."проект", w2.title

;

@@ движение/все контрагенты
-- вертикальная сводная
--- основное тело сумм
select "sign", "title",  "key", sum("sum") as "sum"
from (
select "sign", coalesce("контрагент", '_пусто_') as "title", array_to_string(array[coalesce("контрагент/id", 0), "sign"], ':') as "key", "сумма" * "sign" as "sum"
from "tmp"."{%= $temp_view_name %}"
--where
--  "профиль/id" is null -- отсекать по сотрудникам
--  and "кошелек2" is null -- отсекать внутренние перемещения
) s
group by "sign", "title",  "key"
---order by "title", "sign" desc;
;

@@ движение/все объекты
-- вертикальная сводная
--- основное тело сумм
select "sign", "title",  "key", sum("sum") as "sum"
from (
select "sign", "объект" as "title", array_to_string(array["объект/id", "sign"], ':') as "key", "сумма" * "sign" as "sum"
from "tmp"."{%= $temp_view_name %}"
) s
group by "sign", "title",  "key"
;

@@ движение/все профили
-- вертикальная сводная
--- основное тело сумм
select "sign", "title",  "key", sum("sum") as "sum"
from (
select "sign", "профиль" as "title", array_to_string(array["профиль/id", "sign"], ':') as "key", "сумма" * "sign" as "sum"
from "tmp"."{%= $temp_view_name %}"
--where
--  "профиль/id" is not null -- отсекать по сотрудникам
--  and "кошелек2" is null -- отсекать внутренние перемещения
) s
group by "sign", "title",  "key"
---order by "title", "sign" desc;
;

@@ движение итого/всего
-- для двух таблиц
select sum("сумма")
from "tmp"."{%= $temp_view_name %}"
;

@@ движение итого/интервалы
-- итоговая строка
select "интервал", "код интервала", sum("сумма") as sum
from "tmp"."{%= $temp_view_name %}"
group by "интервал", "код интервала"
;

@@ движение итого/2
-- вертикальная сводная
-- итоговая строка
select case when "sign" > 0 then 'Приход' else 'Расход' end as "title", "sign", "sign" as "key", sum("сумма") as sum
from "tmp"."{%= $temp_view_name %}"
group by "sign"
---order by 1
;

@@ движение и остатки
--- и начало и конец
-- для двух таблиц
select *,
  case when "дата" < ?::date then "сумма" else 0::money end as "сумма1", -- первая дата
  "сумма" as "сумма2",
   case when "дата" >= ?::date then "сумма" else 0::money end as "сумма движения" -- первая дата
from 
  "движение ДС/все платежи" --veiw

where
  "дата" < (?::date + interval '1 days') -- вторая дата
  and ((?::int is null or "кошельки/id"[1][1]=?) and (?::int is null or "кошельки/id"[1][2]=?)) -- проект или кошелек
  ---and (?::int is null or "объект/id"=?) --- один объект
/* не отсекать для фильтров контрагентов и профилей и не показывать в них глобальные остатки
  and (::int is null or coalesce("контрагент/id", 0)=) -- контрагент
  and (::int is null or (coalesce(::int, 0)::boolean and "профиль/id" is null)) -- контрагент отсекает сотрудников
  and (::int is null or "профиль/id"=) -- один сотрудник
  and (::int is null or (coalesce(::int, 0)::boolean and "профиль/id" is not null)) -- сотрудник отсекает контрагентов
*/

{%= join qq'\n', map(qq'\n union all \n'.$dict->render($_), @$union) %}

---UNION ALL -- внутренние перемещения
---UNION ALL -- начисления-приходы сотрудникам


@@ движение и остатки/union/внутренние перемещения
select *,
  case when "дата" < ?::date then "сумма" else 0::money end as "сумма1", -- первая дата
  "сумма" as "сумма2",
  case when "дата" >= ?::date then "сумма" else 0::money end as "сумма движения" -- первая дата
  
from 
  "движение ДС/внутр перемещения" --veiw

where 
  "дата" < (?::date + interval '1 days') -- вторая дата
  and ((?::int is null or "кошельки/id"[1][1]=?) and (?::int is null or "кошельки/id"[1][2]=?)) -- проект или кошелек
/* не отсекать для фильтров контрагентов и профилей и не показывать в них глобальные остатки
  and (::int is null or coalesce(::int, -1) = -1) -- контрагент отсекает внутренние перемещения
  and (::int is null or ::int is not null) --- заглушка симметричного биндинга
  and (::int is null or coalesce(::int, -1) = -1) -- сотрудник отсекает внутренние перемещения
  and (::int is null or ::int is not null) --- заглушка симметричного биндинга
*/

@@ движение и остатки/union/начисления сотрудникам
-- только приходы из табеля
select *,
  case when "дата" < ?::date then "сумма" else 0::money end as "сумма1", -- первая дата
  "сумма" as "сумма2",
  case when "дата" >= ?::date then "сумма" else 0::money end as "сумма движения" -- первая дата
  
from 
  "движение ДС/начисления сотрудникам" --veiw

where 
  "дата" < (?::date + interval '1 days') -- вторая дата
  and ((?::int is null or "кошельки/id"[1][1]=?) and (?::int is null or "кошельки/id"[1][2]=?)) -- проект или кошелек



@@ всего и остатки/все кошельки1111
-- вертикальная сводная
--- для дат внутри периода не катит!!
--- только две даты начало и конец периода!
--- и начало и конец
select 
  "кошельки"[1][1:2] as title, "кошельки/id"[1][1:2] as "кошельки/id", array_to_string("кошельки/id"[1][1:2], ':') as "key",
  sum("сумма1") as "сальдо1", sum("сумма2") as "сальдо2", sum("сумма движения") as "всего"
from 
  ({%= $dict->render('движение и остатки', union=>$union) %}) o
group by "кошельки"[1][1:2], "кошельки/id"[1][1:2]
order by 1--- array_to_string("кошельки"[1][1:2], ':')
;

@@ всего и остатки/все кошельки
-- вертикальная сводная
--- для дат внутри периода не катит!!
--- только две даты начало и конец периода!
--- и начало и конец
select
  "кошельки"[1][1:2] as title, "кошельки/id"[1][1:2] as "кошельки/id", array_to_string("кошельки/id"[1][1:2], ':') as "key",
  sum(case when "дата" < ?::date then "сумма" else 0::money end) as "сальдо1", -- первая дата
  sum("сумма") as "сальдо2",
  sum(case when "дата" >= ?::date then "сумма" else 0::money end) as "всего" -- первая дата
from 
  ({%= join qq'\n union all \n', map($dict->render($_, where=>$where || {}), @$union) %}) unions
group by "кошельки"[1][1:2], "кошельки/id"[1][1:2]
order by 1--- array_to_string("кошельки"[1][1:2], ':')
;

@@ всего и остатки/все кошельки2
-- вертикальная сводная
--- для дат внутри периода не катит!!
--- только две даты начало и конец периода!
--- и начало и конец
select 
  array_to_string(array[w2."проект", w2.title], ': ') as title, array[w2."проект/id", w2.id] as "кошельки/id", w2.id as "кошелек2/id",
  array_to_string(array[w2."проект/id", w2.id], ':') as "key",
  sum("сумма1") as "сальдо1", sum("сумма2") as "сальдо2", sum("сумма движения") as "всего"
from 
  ({%= $dict->render('движение и остатки', union=>$union) %}) o
  join (---перемещения
  select /*distinct*/ w.*, p.id as "проект/id", p.name as "проект"
  from 
    ----"проекты" p
    "roles" p
    join refs r on p.id=r.id1
    join "кошельки" w on w.id=r.id2
  ) w2 on o."кошелек2"=w2.id
group by w2."проект", w2."проект/id", w2.id, w2.title
order by 1
;


@@ всего и остатки/все контрагенты1111
-- вертикальная сводная
--- для дат внутри периода не катит!!
--- только две даты начало и конец периода!
--- и начало и конец
select 
  coalesce("контрагент", '_пусто_') as title, coalesce("контрагент/id", 0) as "key", coalesce("контрагент/id", 0) as "контрагент/id",
  sum("сумма1") as "сальдо1", sum("сумма2") as "сальдо2", sum("сумма движения") as "всего"
from 
  
group by coalesce("контрагент", '_пусто_'), coalesce("контрагент/id", 0)
order by 1 --- title
;

@@ всего и остатки/все контрагенты
-- вертикальная сводная
--- для дат внутри периода не катит!!
--- только две даты начало и конец периода!
--- и начало и конец
select 
  coalesce("контрагент", '_пусто_') as title, coalesce("контрагент/id", 0) as "key", coalesce("контрагент/id", 0) as "контрагент/id",
  sum(case when "дата" < ?::date then "сумма" else 0::money end) as "сальдо1", -- первая дата
  sum("сумма") as "сальдо2",
  sum(case when "дата" >= ?::date then "сумма" else 0::money end) as "всего" -- первая дата
from 
  ({%= join qq'\n union all \n', map($dict->render($_, where=>$where || {}), @$union) %}) unions
group by coalesce("контрагент", '_пусто_'), coalesce("контрагент/id", 0)
order by 1 --- title
;

@@ всего и остатки/все объекты11111
-- вертикальная сводная
--- для дат внутри периода не катит!!
--- только две даты начало и конец периода!
--- и начало и конец
select 
  "объект" as title, "объект/id" as "key", "объект/id",
  sum("сумма1") as "сальдо1", sum("сумма2") as "сальдо2", sum("сумма движения") as "всего"
from 
  ({%= $dict->render('движение и остатки', union=>$union) %}) o
where
  ---"профиль/id" is null -- отсекать по сотрудникам
  ---and "кошелек2" is null -- отсекать внутренние перемещения
  "объект/id" is not null
group by "объект", "объект/id"
order by 1 --- title


@@ всего и остатки/все объекты
select 
  "объект" as title, "объект/id" as "key", "объект/id",
  sum("сумма1") as "сальдо1", sum("сумма2") as "сальдо2", sum("сумма движения") as "всего"
from (
  select 
    "объект", "объект/id",
      case when "дата" < ?::date then "сумма" else 0::money end as "сумма1", -- первая дата
    "сумма" as "сумма2",
     case when "дата" >= ?::date then "сумма" else 0::money end as "сумма движения" -- первая дата
  from 
    ({%= join qq'\n union all \n', map($dict->render($_, where=>$where || {}), @$union) %}) unions
  ---where    "объект/id" is not null
) s
group by "объект", "объект/id"
order by 1 --- title

@@ всего и остатки/все профили
-- вертикальная сводная
--- для дат внутри периода не катит!!
--- только две даты начало и конец периода!
--- и начало и конец
select 
  "профиль" as title, "профиль/id" as "key",
  sum("сумма1") as "сальдо1", sum("сумма2") as "сальдо2", sum("сумма движения") as "всего"
from 
  ({%= $dict->render('движение и остатки', union=>$union) %}) o
where
  "профиль/id" is not null -- отсекать по контрагентам
  ----and "кошелек2" is null -- отсекать внутренние перемещения
group by "профиль", "профиль/id"
order by 1 --- title
;

@@ остатки/период
--- для дат внутри периода не катит!!
--- только две даты начало и конец периода!
--- и начало и конец
select ---sum("сумма1") as "сальдо1", sum("сумма2") as "сальдо2", sum("сумма движения") as "всего"
  sum(case when "дата" < ?::date then "сумма" else 0::money end) as "сальдо1", -- первая дата
  sum("сумма") as "сальдо2",
  sum(case when "дата" >= ?::date then "сумма" else 0::money end) as "всего" -- первая дата
from 
%#  ({%= $dict->render('движение и остатки', union=>$union) %}) o
  ({%= join qq'\n union all \n', map($dict->render($_, where=>$where || {}), @$union) %}) unions
;


@@ строка отчета/интервалы/столбцы
--- гориз табл
-- развернуть
---select q.*, c.title ---заголовок категории
---from (
select "level", "категория"["level"] as title, "категории"["level"+1] as "категория", "интервал", "код интервала", sum("сумма" * "sign") as sum
from (
select *,
  idx("категории", ?::int) as level
from "tmp"."{%= $temp_view_name %}"
where ?::int = any("категории")
  and "sign"=?
) q
group by "level", "категория"["level"], "категории"["level"+1], "интервал", "код интервала"
having "категории"["level"+1] is not null
---) q
---  join "категории" c on q."категория"=c.id
order by 2
;

@@ строка отчета/интервалы/строки
-- для вертикальной таблицы
-- развернуть
---select q.*, c.title ---заголовок категории
---from (
select "level", "категория"["level"] as title, "категории"["level"+1] as "категория", "sign", sum("сумма" * "sign") as sum
from (
select *,
  idx("категории", ?::int) as level
from "tmp"."{%= $temp_view_name %}"
where ?::int = any("категории")
  and "код интервала"=?
) q
group by "level", "категория"["level"], "категории"["level"+1], "sign"
having "категории"["level"+1] is not null
---) q
---  join "категории" c on q."категория"=c.id
order by 2
;

@@ строка отчета/интервалы/все кошельки
-- для вертикальной таблицы
-- развернуть
---select q.*, c.title ---заголовок категории
---from (
select "level", "категория"["level"] as title, "категории"["level"+1] as "категория", "sign", sum("сумма" * "sign") as sum
from (
select *,
  idx("категории", ?::int) as level
from "tmp"."{%= $temp_view_name %}"
where
  ?::int = any("категории")
  and "кошельки/id"[1][2]=?
) q
group by "level", "категория"["level"], "категории"["level"+1], "sign"
having "категории"["level"+1] is not null
---) q
---  join "категории" c on q."категория"=c.id
order by 2
;

@@ строка отчета/интервалы/все кошельки2
-- для вертикальной таблицы
-- развернуть
---select q.*, c.title ---заголовок категории
---from (
select "level", "категория"["level"] as title, "категории"["level"+1] as "категория", "sign", sum("сумма" * "sign") as sum
from (
select *,
  idx("категории", ?::int) as level
from "tmp"."{%= $temp_view_name %}"
where
  ?::int = any("категории")
  and "кошелек2"=?
) q
group by "level", "категория"["level"], "категории"["level"+1], "sign"
having "категории"["level"+1] is not null
---) q
---  join "категории" c on q."категория"=c.id
order by 2
;

@@ строка отчета/интервалы/все контрагенты
-- для вертикальной таблицы
-- развернуть
---select q.*, c.title ---заголовок категории
---from (
select "level", "категория"["level"] as title, "категории"["level"+1] as "категория", "sign", sum("сумма" * "sign") as sum
from (
select *,
  idx("категории", ?::int) as level
from "tmp"."{%= $temp_view_name %}"
where
  ?::int = any("категории")
  and coalesce("контрагент/id", 0)=?
) q
group by "level", "категория"["level"], "категории"["level"+1], "sign"
having "категории"["level"+1] is not null
--) q
---  join "категории" c on q."категория"=c.id
order by 2
;

@@ строка отчета/интервалы/все объекты
-- для вертикальной таблицы
-- развернуть
select "level", "категория"["level"] as title, "категории"["level"+1] as "категория", "sign", sum("сумма" * "sign") as sum
from (
select *,
  idx("категории", ?::int) as level
from "tmp"."{%= $temp_view_name %}"
where
  ?::int = any("категории")
  and "объект/id"=?
) q
group by "level", "категория"["level"], "категории"["level"+1], "sign"
having "категории"["level"+1] is not null
order by 2
;

@@ строка отчета/интервалы/все профили
-- для вертикальной таблицы
-- развернуть
---select q.*, c.title ---заголовок категории
---from (
select "level", "категория"["level"] as title, "категории"["level"+1] as "категория", "sign", sum("сумма" * "sign") as sum
from (
select *,
  idx("категории", ?::int) as level
from "tmp"."{%= $temp_view_name %}"
where
  ?::int = any("категории")
  and "профиль/id"=?
) q
group by "level", "категория"["level"], "категории"["level"+1], "sign"
having "категории"["level"+1] is not null
--) q
---  join "категории" c on q."категория"=c.id
order by 2
;

@@ строка отчета/всего/столбцы
-- для гориз табл
-- развернуть
select "категории"["level"+1] as "category", sum("сумма" * "sign") as sum
from (
select *,
  idx("категории", ?::int) as level
from "tmp"."{%= $temp_view_name %}"
where ?::int = any("категории")
  and "sign"=?
) q
group by "категории"["level"+1]
;

@@ строка отчета/всего/строки
-- для вертикальной таблицы
-- развернуть
select "категории"["level"+1] as "category", sum("сумма") as sum
from (
select *,
  idx("категории", ?::int) as level
from "tmp"."{%= $temp_view_name %}"
where ?::int = any("категории")
  and "код интервала"=?
) q
group by "категории"["level"+1]
;

@@ строка отчета/интервалы/позиции/столбцы
-- для гориз табл
-- конечная детализация позиций
select *, "формат даты"("дата") as "дата_формат", "сумма" * "sign" as sum
from "tmp"."{%= $temp_view_name %}"
where 
  "категории"[array_length("категории", 1)] = ?::int
  and "sign"=?
order by "дата"
;

@@ строка отчета/интервалы/позиции/строки
--- для вертикальной таблицы
-- конечная детализация позиций
select *, "формат даты"("дата") as "дата_формат", "сумма" * "sign" as sum
from "tmp"."{%= $temp_view_name %}"
where ---!::int = any("категории")
  "категории"[array_length("категории", 1)] = ?::int
  and "код интервала"=?
order by "дата"
;

@@ строка отчета/интервалы/позиции/все кошельки
--- для вертикальной таблицы
-- конечная детализация позиций
select *, "формат даты"("дата") as "дата_формат", "сумма" * "sign" as sum
from "tmp"."{%= $temp_view_name %}"
where ---!::int = any("категории")
  "категории"[array_length("категории", 1)] = ?::int
  and "кошельки/id"[1][2]=?
order by "дата"
;

@@ строка отчета/интервалы/позиции/все кошельки2
--- для вертикальной таблицы
-- конечная детализация позиций
select *, "формат даты"("дата") as "дата_формат", "сумма" * "sign" as sum
from "tmp"."{%= $temp_view_name %}"
where ---!::int = any("категории")
  "категории"[array_length("категории", 1)] = ?::int
  and "кошелек2"=?
order by "дата"
;

@@ строка отчета/интервалы/позиции/все контрагенты
--- для вертикальной таблицы
-- конечная детализация позиций
select *, "формат даты"("дата") as "дата_формат", "сумма" * "sign" as sum
from "tmp"."{%= $temp_view_name %}"
where ---!::int = any("категории")
  "категории"[array_length("категории", 1)] = ?::int
  and coalesce("контрагент/id", 0)=?
order by "дата"
;

@@ строка отчета/интервалы/позиции/все объекты
--- для вертикальной таблицы
-- конечная детализация позиций
select *, "формат даты"("дата") as "дата_формат", "сумма" * "sign" as sum
from "tmp"."{%= $temp_view_name %}"
where ---!::int = any("категории")
  "категории"[array_length("категории", 1)] = ?::int
  and "объект/id"=?
order by "дата"
;

@@ строка отчета/интервалы/позиции/все профили
--- для вертикальной таблицы
-- конечная детализация позиций
select *, "формат даты"("дата") as "дата_формат", "сумма" * "sign" as sum
from "tmp"."{%= $temp_view_name %}"
where ---!::int = any("категории")
  "категории"[array_length("категории", 1)] = ?::int
  and "профиль/id"=?
order by "дата"
;

@@ строка отчета/всего/все контрагенты
-- для вертикальной таблицы
-- развернуть
select "категории"["level"+1] as "category", sum("сумма") as sum
from (
select *,
  idx("категории", ?::int) as level
from "tmp"."{%= $temp_view_name %}"
where
  ?::int = any("категории")
  and coalesce("контрагент/id", 0)=?
) q
group by "категории"["level"+1]
;

@@ строка отчета/всего/все объекты
-- для вертикальной таблицы
-- развернуть
select "категории"["level"+1] as "category", sum("сумма") as sum
from (
select *,
  idx("категории", ?::int) as level
from "tmp"."{%= $temp_view_name %}"
where
  ?::int = any("категории")
  and "объект/id"=?
) q
group by "категории"["level"+1]
;

@@ строка отчета/всего/все профили
-- для вертикальной таблицы
-- развернуть
select "категории"["level"+1] as "category", sum("сумма") as sum
from (
select *,
  idx("категории", ?::int) as level
from "tmp"."{%= $temp_view_name %}"
where
  ?::int = any("категории")
  and "профиль/id"=?
) q
group by "категории"["level"+1]
;

@@ строка отчета/всего/все кошельки
-- для вертикальной таблицы
-- развернуть
select "категории"["level"+1] as "category", sum("сумма") as sum
from (
select *,
  idx("категории", ?::int) as level
from "tmp"."{%= $temp_view_name %}"
where ?::int = any("категории")
  and "кошельки/id"[1][2]=?
) q
group by "категории"["level"+1]
;

@@ строка отчета/всего/все кошельки2
-- для вертикальной таблицы
-- развернуть
select "категории"["level"+1] as "category", sum("сумма") as sum
from (
select *,
  idx("категории", ?::int) as level
from "tmp"."{%= $temp_view_name %}"
where ?::int = any("категории")
  and "кошелек2"=?
) q
group by "категории"["level"+1]
;

@@ сумма двух денег
select ?::money + ?::money;

@@ функции


DROP VIEW IF EXISTS "движение ДС/внешние платежи";---переименовал
DROP VIEW IF EXISTS "движение ДС/все платежи";
CREATE OR REPLACE VIEW "движение ДС/все платежи" as
-- контрагенты и сотрудники
select m.id, m.ts, m."дата", m."сумма",
  sign("сумма"::numeric) as "sign", ---to_char("дата", ---) as "код интервала", to_char("дата", ---) as "интервал",
  --"категории/родители узла/id"(c.id, true) as "категории",
  ---"категории/родители узла/title"(c.id, false) as "категория",
  cat.parents_id||cat.id as "категории", cat.parents_title[2:]||cat.title as "категория",
  --~ k.title as "контрагент", k.id as "контрагент/id",
  coalesce(k.title, ctr.title) as "контрагент", coalesce(k.id, ctr.id) as "контрагент/id",  ---rent."договор аренды/id",
  coalesce(row_to_json(ob), row_to_json(rent."@объекты/json"[1])) as "$объект/json",
  coalesce(ob.id, rent."@объекты/id"[1]) as "объект/id",
  coalesce(ob.name, rent."@объекты/name"[1]) as "объект",
  w2.id as "кошелек2", --- left join
  array_to_string(pp.names, ' ') as "профиль", pp.id as "профиль/id",
  array[[w."проект", w.title], [w2."проект", w2.title]]::text[][] as "кошельки", ---  проект+кошелек, ...
  array[[w."проект/id", w.id], [w2."проект/id", w2.id]]::int[][] as "кошельки/id" ---  проект+кошелек, ...
  ,m."примечание"
from 
  {%= $dict->render('все платежи/from') %}
  ---left join lateral (select array_agg("id" order by level desc) as "@id", (array_agg("title" order by level desc))[2:] as "@title" from "категории/родители узла"(c.id, true)) cc on true
  left join "категории/родители"() cat on cat.id=c.id
  
  left join lateral /*ради лимита 1 строки для двух договоров*/ ( --- по какому объекту приход аренды
    select *
    from (
      select
        k.id as"контрагент/id",
        d.id as "договор/id",
        ---array_agg(array[d."дата1", d."дата2"]::date[]) as "даты договора",
        d."дата1", coalesce(d."дата расторжения", d."дата2") as "дата2",
        array_agg(ob.id) "@объекты/id",
        array_agg(ob.name) "@объекты/name",
        array_agg(ob) as "@объекты/json"
      from 
        "контрагенты" k
          join refs rd on k.id=rd.id1
          join "аренда/договоры" d on d.id=rd.id2
          
          join refs r on d.id=r.id1
          join "аренда/договоры-помещения" dp on dp.id=r.id2
        
          join refs r1 on dp.id=r1.id2
          join "аренда/помещения" p on p.id=r1.id1
          
          join refs r2 on p.id=r2.id2
          join "аренда/объекты/литеры" lit on lit.id=r2.id1
          
          join refs r3 on lit.id=r3.id2
          join "аренда/объекты" o on o.id=r3.id1
          
          join refs ro on o.id=ro.id2
          join "roles" ob on ob.id=ro.id1
      
      --- можно сюда даты и без d.id
      --- where  m."дата" between d."дата1" and coalesce(d."дата расторжения", d."дата2")
      --- group by k.id--, d.id---, d."дата1", coalesce(d."дата расторжения", d."дата2")
      
      group by k.id, d.id, d."дата1", coalesce(d."дата расторжения", d."дата2")
      ) rd
      where k.id=rd."контрагент/id" and m."дата" between rd."дата1" and rd."дата2"
      order by "договор/id" desc
      limit 1
  ) rent on true
  
;

DROP VIEW IF EXISTS "движение ДС/внутр перемещения";
CREATE OR REPLACE VIEW "движение ДС/внутр перемещения" as
select m.id, m.ts, m."дата", -1*m."сумма" as "сумма",
  -1*sign("сумма"::numeric) as "sign", ---to_char("дата", ---) as "код интервала", to_char("дата", ---) as "интервал",
  ---"категории/родители узла/id"(c.id, true) as "категории",
  ---"категории/родители узла/title"(c.id, false) as "категория",
  ---cc."@id" as "категории", cc."@title" as "категория",
  cat.parents_id||cat.id as "категории", cat.parents_title[2:]||cat.title as "категория",
  null::text as "контрагент", null::int as "контрагент/id",
  row_to_json(null) as "$объект/json", null::int as "объект/id", null as "объект",
  w2.id as "кошелек2",
  null::text as "профиль", null::int as "профиль/id",
  array[[w2."проект", w2.title] , [w."проект", w.title]]::text[][] as "кошельки", -- переворот кошельков
  array[[w2."проект/id", w2.id] , [w."проект/id", w.id]]::int[][] as "кошельки/id"  -- переворот кошельков
  ,m."примечание"
from 
  {%= $dict->render('внутренние перемещения/from') %}
  ---left join lateral (select array_agg("id" order by level desc) as "@id", (array_agg("title" order by level desc))[2:] as "@title" from "категории/родители узла"(c.id, true)) cc on true
  left join "категории/родители"() cat on cat.id=c.id
;

DROP VIEW IF EXISTS "движение ДС/по сотрудникам";
CREATE OR REPLACE VIEW "движение ДС/по сотрудникам" as
-- только сотрудники
select m.id, m.ts, m."дата", m."сумма",
  sign("сумма"::numeric) as "sign", ---to_char("дата", ---) as "код интервала", to_char("дата", ---) as "интервал",
  c.id as "категория/id",
  ---"категории/родители узла/id"(c.id, true) as "категории/id",
  ---"категории/родители узла/title"(c.id, false) as "категории",
  ---cc."@id" as "категории/id", cc."@title" as "категории",
  cat.parents_id||cat.id as "категории/id", cat.parents_title[2:]||cat.title as "категории",
  null::text as "контрагент", null::int as "контрагент/id",
  row_to_json(null) as "$объект/json", null::int as "объект/id", null as "объект",
  null::int as "кошелек2",
  array_to_string(pp.names, ' ') as "профиль", pp.id as "профиль/id",
  array[[w."проект", w.title]]::text[][] as "кошельки",
  array[[w."проект/id", w.id]]::int[][] as "кошельки/id",
  m."примечание"
  ---'(' || w."проект" || ': ' || w.title || ') ' || coalesce(m."примечание", ''::text) as "примечание"
from 
  {%= $dict->render('движение по сотрудникам/from') %}
  ---left join lateral (select array_agg("id" order by level desc) as "@id", (array_agg("title" order by level desc))[2:] as "@title" from "категории/родители узла"(c.id, true)) cc on true
  left join "категории/родители"() cat on cat.id=c.id
;

DROP VIEW IF EXISTS "движение ДС/начисления по табелю" CASCADE;
CREATE OR REPLACE VIEW "движение ДС/начисления по табелю" as
-- только приходы-начисления из табеля(view "табель/начисления/объекты" в модели Model::TimeWork.pm)
--- ПЛЮС суточные (без объекта)
--- + отпускные (без объекта)
select t.id, t.ts, t."дата", t."сумма",
  1::numeric as "sign",
  ---"категории/родители узла/id"(123439::int, true) as "категории",
  ---"категории/родители узла/title"(123439::int, false) as "категория",
  ---cc."@id" as "категории", cc."@title" as "категория",
  cat.parents_id||cat.id as "категории", cat.parents_title[2:]||cat.title as "категория",
  null::text as "контрагент", null::int as "контрагент/id",
  row_to_json(null) as "$объект/json", "объект/id", "объект",
  null::int as "кошелек2",
  "профиль", "профиль/id",
  ---! вместо проект+кошелек  - проект+объект
  array[[/*"проект"*/ null, "объект"]]::text[][] as "кошельки", --- проект+объект, ... ---проект нельзя, один объект в разных проектах!!!
  array[[/*"проект/id"*/ null, "объект/id"]]::int[][] as "кошельки/id",  --- проект+объект, ... ---проект нельзя, один объект в разных проектах!!!
  ---'(' || "проект" || ': ' || "объект" || ') ' || coalesce("примечание", ''::text) as "примечание"
  "примечание"
from 
  "табель/начисления/объекты" t,-- view  в модели Model::TimeWork.pm
  ---(select array_agg("id" order by level desc) as "@id", (array_agg("title" order by level desc))[2:] as "@title" from "категории/родители узла"(123439::int, true)) cc
  "категории/родители"() cat
where cat.id=123439

union all --- переработка без объекта!

select t.id, t.ts, t."дата", t."сумма",
  1::numeric as "sign",
  ---"категории/родители узла/id"(123441::int, true) as "категории", -- категория з/п переработка
  ---"категории/родители узла/title"(123441::int, false) as "категория", -- категория з/п переработка
  ---cc."@id" as "категории", cc."@title" as "категория",
  cat.parents_id||cat.id as "категории", cat.parents_title[2:]||cat.title as "категория",
  null::text as "контрагент", null::int as "контрагент/id",
  row_to_json(null) as "$объект/json", null::int as "объект/id", null as "объект",
  null::int as "кошелек2",
  "профиль", "профиль/id",
  ---! вместо проект+кошелек  - проект+объект
  null, ---array[[null, null]]::text[][] as "кошельки", --- проект+объект, ...
  null, ---array[[0, 0]]::int[][] as "кошельки/id",  --- проект+объект, ...
  "примечание"
from 
  "табель/начисления/переработка" t,-- view  в модели Model::TimeWork.pm
  --- (select array_agg("id" order by level desc) as "@id", (array_agg("title" order by level desc))[2:] as "@title" from "категории/родители узла"(123441::int, true)) cc
  "категории/родители"() cat
where cat.id=123441

union all --- суточные без объекта!

select t.id, t.ts, t."дата", t."сумма",
  1::numeric as "sign",
  ---"категории/родители узла/id"(57541::int, true) as "категории", -- категория з/п/суточные
  ---"категории/родители узла/title"(57541::int, false) as "категория", -- категория з/п/суточные
  ---cc."@id" as "категории", cc."@title" as "категория",
  cat.parents_id||cat.id as "категории", cat.parents_title[2:]||cat.title as "категория",
  null::text as "контрагент", null::int as "контрагент/id",
  row_to_json(null) as "$объект/json", null::int as "объект/id", null as "объект",
  null::int as "кошелек2",
  "профиль", "профиль/id",
  ---! вместо проект+кошелек  - проект+объект
  null, ---array[[null, null]]::text[][] as "кошельки", --- проект+объект, ...
  null, ---array[[0, 0]]::int[][] as "кошельки/id",  --- проект+объект, ...
  "примечание"
from 
  "табель/начисления/суточные" t,-- view  в модели Model::TimeWork.pm
  --- (select array_agg("id" order by level desc) as "@id", (array_agg("title" order by level desc))[2:] as "@title" from "категории/родители узла"(57541::int, true)) cc
  "категории/родители"() cat
where cat.id=57541

union all --- отпускные тоже без объекта!

select t.id, t.ts, t."дата", t."сумма",
  1::numeric as "sign",
  ---"категории/родители узла/id"(104845::int, true) as "категории", -- категория з/п/отпускные
  ---"категории/родители узла/title"(104845::int, false) as "категория", -- категория з/п/отпускные
  ---cc."@id" as "категории", cc."@title" as "категория",
  cat.parents_id||cat.id as "категории", cat.parents_title[2:]||cat.title as "категория",
  null::text as "контрагент", null::int as "контрагент/id",
  row_to_json(null) as "$объект/json", null::int as "объект/id", null as "объект",
  null::int as "кошелек2",
  "профиль", "профиль/id",
  ---! вместо проект+кошелек  - проект+объект
  null, ---array[[null, null]]::text[][] as "кошельки", --- проект+объект, ...
  null, ---array[[0, 0]]::int[][] as "кошельки/id",  --- проект+объект, ...
  "примечание"
from 
  "табель/начисления/отпускные" t,-- view  в модели Model::TimeWork.pm
  ---(select array_agg("id" order by level desc) as "@id", (array_agg("title" order by level desc))[2:] as "@title" from "категории/родители узла"(104845::int, true)) cc
  "категории/родители"() cat
where cat.id=104845
;



DROP VIEW IF EXISTS "движение ДС/начисления сотрудникам";
CREATE OR REPLACE VIEW "движение ДС/начисления сотрудникам" as
/*здесь только начисления по табелю и расчетные начисления
без кошельков!
*/

select t.* from
  "движение ДС/начисления по табелю" t
  -- табель строка РасчетЗП
/***  жесткий косяк, не нужно
  join "табель" t2 on date_trunc('month', t2."дата") = date_trunc('month', t."дата")
  join refs rpt on t2.id=rpt.id2 and rpt.id1=t."профиль/id" -- профиль
  
where 
  t2."значение"='РасчетЗП'
  and t2."коммент" is not null
***/

union all --- расчетные начисления  (закрытого расчета)
-- расчетные удержания уйдут в одну цифру - выплачено
-- но удержание по категории штраф(74315) тоже тут как деньги
-- нет объекта!

select m.id, m.ts, m."дата", m."сумма",
  sign("сумма"::numeric) as "sign", 
  --"категории/родители узла/id"(c.id, true) as "категории",
  ---"категории/родители узла/title"(c.id, false) as "категория",
  ---cc."@id" as "категории", cc."@title" as "категория",
  cat.parents_id||cat.id as "категории", cat.parents_title[2:]||cat.title as "категория",
  null::text as "контрагент", null::int as "контрагент/id",
  row_to_json(null) as "$объект/json", null::int as "объект/id", null::text as "объект",
  null::int as "кошелек2",
  array_to_string(p.names, ' ') as "профиль", p.id as "профиль/id",
  null, ---array[[null, null]]::text[][] as "кошельки", --- проект+объект, ...
  array[[pr.id, null]]::int[][] as "кошельки/id",  --- проект 0 -- запись для всех проектов
  m."примечание"

from "движение денег" m
  join refs rc on m.id=rc.id2
  --join "категории" c on c.id=rc.id1
  ---left join lateral (select array_agg("id" order by level desc) as "@id", (array_agg("title" order by level desc))[2:] as "@title" from "категории/родители узла"(c.id, true)) cc on true
  join "категории/родители"() cat on cat.id=rc.id1
  
  join refs rp on m.id=rp.id1
  join "профили" p on p.id=rp.id2
  
  left join (
    select /*distinct*/  p.id, /*p."контрагент/id",*/ r.id2
    from 
    ---"проекты" p
    "roles" p
      join refs r on p.id=r.id1
  ) pr on p.id=pr.id2
  
  --- закрыли расчет привязали строки денег к строке расчета (табель)
  -- табель строка РасчетЗП
  join refs rt on m.id= rt.id1
  join "табель" t on t.id=rt.id2 and date_trunc('month', t."дата") = date_trunc('month', m."дата")
  join refs rpt on t.id=rpt.id2 and rpt.id1=p.id -- профиль
  
  --join refs ro on t.id=ro.id2 --- на объект
  --join roles og on og.id=ro.id1 -- группы-объекты
  ---join refs rpr on og.id=rpr.id2
  ---join "проекты" pr on pr.id=rpr.id1
  --join "проекты/объекты" po on ro.id1=po."объект/id"
      
      /***where rt.id1= m.id
        and rp.id1=p.id -- профиль
        and t."значение"='РасчетЗП'
        and date_trunc('month', t."дата") = date_trunc('month', m."дата")
        and t."коммент" is not null
      ***/

where 
    --- 74315 это категория штрафа будет тоже как деньги
    (sign(m."сумма"::numeric)=1 or cat.id=74315) --- только (+) начисления, (-)расходы будут одной цифрой - выплата
    and t."значение"='РасчетЗП'
    and t."коммент" is not null

  /***and exists ( 
      select t.*
      from refs rm 
        join "табель" t on t.id=rm.id2
        join refs rp on t.id=rp.id2
      
      where rm.id1= m.id
        and rp.id1=p.id -- профиль
        and date_trunc('month', t."дата") = date_trunc('month', m."дата")
        and t."значение"='РасчетЗП'
        and t."коммент" is not null
  )***/

;


/*конец функции*/