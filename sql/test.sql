WITH param as (
  select *, to_char(d."дата", 'YYYY') as "год", date_trunc('month', d."дата") as "month"
  from (VALUES (1, 'январь'), (2, 'февраль'), (3, 'март'), (4, 'апрель'), (5, 'май'), (6, 'июнь'), (7, 'июль'), (8, 'август'), (9, 'сентябрь'), (10, 'октябрь'), (11, 'ноябрь'), (12, 'декабрь'))
    m(num, "месяц")
  join (VALUES ('2020-5-2'::date)) d("дата") on m.num=date_part('month', d."дата")
)
/*** ЭТО НЕ ПОШЛО, функция не возвращала вставленные строки, вынес вызов функции отдельно перед этим статементом
num as (---нумерация счетов 
  select n.*, r.id1
  from 
    param,
    "refs" r
    join "номера счетов/аренда помещений"(param."дата", ?::int[]массив ид договоров для присвоения номеров/,?uid/) n on n.id=r.id2
    --- если не нужно присвоение номеров - передать 2 параметр - пустой массив идов договоров []
)*/
---конец with

select  *  from (
select
  pr."реквизиты"||to_jsonb(pr) as "$арендодатель", --- as "арендодатель/реквизиты",

  coalesce(num1."номер", '000')/*(random()*1000)::int*/ as "номер счета",
  coalesce(num1.ts, now())::date as "дата счета",
  timestamp_to_json(coalesce(num1.ts, now())) as "$дата счета",
  
  coalesce(num2."номер", '000')/*(random()*1000)::int*/ as "номер акта",
  coalesce(/*num2.ts*/date_trunc('month', num2."месяц")+interval '1 month'-interval '1 day', /*now()*/null)::date as "дата акта",--- на последнее число мес
  timestamp_to_json(coalesce(/*num2.ts*/(date_trunc('month', num2."месяц")+interval '1 month'-interval '1 day')::timestamp, now())) as "$дата акта",--- на последнее число мес
  
  ob.name as "объект",
  row_to_json(d) as "$договор", 
  row_to_json(k) as "$контрагент",
  k.id as "контрагент/id",
  d."номер!" as "договор/номер",
  d."дата1" as "договор/дата начала",
   coalesce(d."дата расторжения", d."дата2") as "договор/дата завершения",
  k.title as "контрагент/title",
  coalesce(k."реквизиты",'{}'::jsonb)->>'ИНН' as "ИНН",
  dp."сумма", replace(dp."сумма"::numeric::text, '.', ',') as "сумма/num",
  /*** хитрая функция sql/пропись.sql ***/
  firstCap(to_text(dp."сумма"::numeric, 'рубль', scale_mode => 'int')) as "сумма прописью",
  ---ARRAY(select (select to_json(a) from (select ('{"Арендная плата за нежилое помещение за '||param."месяц"||' '||param."год"||' г."}')::text[] as "номенклатура", -1::numeric*dp."сумма" as "сумма" ) a)) as "@позиции",
  dp."@позиции",
  dp."всего позиций"
from
  param
  join (
    select d.*,
      upper(replace(d."номер", '№', '')) as "номер!",
      timestamp_to_json(coalesce(d."дата договора", d."дата1")::timestamp) as "$дата договора",
      timestamp_to_json(d."дата1"::timestamp) as "$дата1",
      timestamp_to_json(d."дата2"::timestamp) as "$дата2"
      ---case when d."дата расторжения" then false when "продление срока" then true else false end as "продлеваемый договор"
      ---case when "продление срока" then (now()+interval '1 year')::date else d."дата2" end 
    from "аренда/договоры" d
  ) d on param."month" between date_trunc('month', d."дата1") and (date_trunc('month', coalesce(d."дата расторжения", case when d."продление срока" then (now()+interval '1 year')::date else d."дата2" end) + interval '1 month') - interval '1 day') ---только действующие договоры
  join refs r on d.id=r.id2
  join "контрагенты" k on k.id=r.id1
  
  left join (---арендодатель
    select pr.*, r.id2
    from "контрагенты/проекты"  pr
      join refs r on pr."проект/id"=r.id1
  ) pr on pr.id2=d.id
  
  /*** Waltex/Report.pm.dict.sql ***/
  ---join "движение ДС/аренда/счета" dp on d.id=dp.id and param."month"=date_trunc('month', dp."дата") and dp."примечание"!~'предоплата'
  join lateral (
    select 
      sum(dp."сумма") as "сумма",
      jsonb_agg(dp order by dp."order_by") as "@позиции",
      array_agg(dp."объект/id" order by dp."order_by") as "@объекты/id",
      count(dp) as "всего позиций"
    from (
      select
        /*-1::numeric**/dp."сумма безнал" as "сумма",
        dp."объект/id", dp."номер доп.согл.",
        not 929979=any(dp."категории") as "order_by",
        case when 929979=any(dp."категории")---ид категории
          then ('{"Обеспечительный платеж"}')::text[]
          else ('{"Арендная плата за нежилое помещение за '||param."месяц"||' '||param."год"||' г.' || (case when dp."номер доп.согл." is not null then ' (доп. согл. ' || dp."номер доп.согл."::text || ')' else '' end) || '"}')::text[]
        end  as "номенклатура"
      from "движение ДС/аренда/счета" dp
       --- join "аренда/договоры" dd on dp.id=dd.id
      where  d.id=dp."договор/id"
        and param."month"=date_trunc('month', dp."дата")
        and not 929979::int = any(dp."категории")
        ---and not coalesce(dd."оплата наличкой", false)
    ) dp
  ) dp on true
  
  join  "roles" ob on ob.id=dp."@объекты/id"[1]
  
  ---нумерация счетов (может быть отключена)
  left join (
    select n.*, r.id1
    from 
      "refs" r
      join "счета/аренда/помещения" n on n.id=r.id2
  ) num1 on d.id=num1.id1 and num1."месяц"=param."month"
  
  ---нумерация актов (может быть отключена)
  left join (
    select n.*, r.id1
    from 
      "refs" r
      join "акты/аренда/помещения" n on n.id=r.id2
  ) num2 on d.id=num2.id1 and num2."месяц"=param."month"
  
  ---left join num on d.id=num.id1
 WHERE (  not coalesce((coalesce(k."реквизиты",'{}'::jsonb)->'физ. лицо'), 'false')::boolean   )
order by d."дата1" desc, d.id desc  
) s
