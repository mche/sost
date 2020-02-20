WITH param as (
  select *, to_char(d."дата", 'YYYY') as "год", date_trunc('month', d."дата") as "month"
  from (VALUES (1, 'январь'), (2, 'февраль'), (3, 'март'), (4, 'апрель'), (5, 'май'), (6, 'июнь'), (7, 'июль'), (8, 'август'), (9, 'сентябрь'), (10, 'октябрь'), (11, 'ноябрь'), (12, 'декабрь'))
    m(num, "месяц")
  join (VALUES ('2020-01-25'::date)) d("дата") on m.num=date_part('month', d."дата")
)
---конец with

select
  --coalesce(num1."номер", '000')/*(random()*1000)::int*/ as "номер счета",
  ---coalesce(num1.ts, now())::date as "дата счета",
  
  coalesce(num2."номер", '000')/*(random()*1000)::int*/ as "номер акта",
  coalesce(/*num2.ts*/(date_trunc('month', num2."месяц")+interval '1 month'-interval '1 day')::timestamp, now()) as "дата акта",--- на последнее число мес
  
  d."номер" as "договор",
  k.title as "контрагент",
  coalesce(k."реквизиты",'{}'::jsonb)->>'ИНН' as "ИНН",
  --(coalesce(k."реквизиты",'{}'::jsonb)->'физ. лицо')::boolean,
  dp."объект",
  dp."сумма",
  /*** хитрая функция sql/пропись.sql ***/
  ---firstCap(to_text(dp."сумма"::numeric, 'рубль', scale_mode => 'int')) as "сумма прописью",
  dp."@позиции",
  dp."всего позиций"
from
  param
  join (
    select d.*,
      ---upper(replace(d."номер", '№', '')) as "номер",
      timestamp_to_json(coalesce(d."дата договора", d."дата1")::timestamp) as "$дата договора",
      timestamp_to_json(d."дата1"::timestamp) as "$дата1",
      timestamp_to_json(d."дата2"::timestamp) as "$дата2"
    from "аренда/договоры" d
  ) d on param."month" between date_trunc('month', d."дата1") and (date_trunc('month', coalesce(d."дата расторжения", d."дата2") + interval '1 month') - interval '1 day') ---только действующие договоры
  join refs r on d.id=r.id2
  join "контрагенты" k on k.id=r.id1
  
  /*** Waltex/Report.pm.dict.sql ***/
  join lateral (
    select
      dp."объект",
      sum(dp."сумма") as "сумма",
      array_agg(row_to_json(dp) order by dp."order_by") as "@позиции",
      count(dp) as "всего позиций"
    from (
      select
        -1::numeric*dp."сумма" as "сумма",
        dp."объект",
        not 929979=any(dp."категории") as "order_by",
        case when 929979=any(dp."категории")---ид категории
          then ('{"Обеспечительный платеж"}')::text[]
          else ('{"Арендная плата за нежилое помещение за '||param."месяц"||' '||param."год"||' г."}')::text[]
        end  as "номенклатура"
      from "движение ДС/аренда/счета" dp
        ---join "аренда/договоры" dd on dp.id=dd.id
      where  d.id=dp.id
        and param."month"=date_trunc('month', dp."дата")
        and not 929979::int = any("категории")
       --- and not coalesce(dd."оплата наличкой", false)
    ) dp
    group by dp."объект"
  ) dp on true
  
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

where not coalesce((coalesce(k."реквизиты",'{}'::jsonb)->'физ. лицо'), 'false')::boolean
  ---left join num on d.id=num.id1
order by d."дата1" desc, d.id desc  
