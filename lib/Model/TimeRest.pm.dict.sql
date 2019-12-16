@@ отпускные дни
---- для компонента календарь
select d.*, nach."@отпускные начисления/json"
from (---даты отпусков
  select 
    date_part('year', t."дата") as "year",
    ---count(t.*), 
    array_agg(distinct t."дата" /*order by t."дата", t.id*/) as "@отпускные даты"
  from 
    "профили" p
    join refs rp on p.id=rp.id1
    join "табель" t on t.id=rp.id2

  where
    p.id=?
    and lower(t."значение")='о'
  group by date_part('year', t."дата")
) d
  
left join (--- начисления отпусков
  select "year",
  jsonb_agg(nach order by "year", "month") as "@отпускные начисления/json"
  from (
    select 
      date_part('year', t."дата") as "year",
      date_part('month', t."дата") as "month",
      m.title as "месяц",
      sum(text2numeric(t."коммент")) as "начислено"
    from 
      "профили" p
      join refs rp on p.id=rp.id1
      join "табель" t on t.id=rp.id2
      join (VALUES (1, 'январь'), (2, 'февраль'), (3, 'март'), (4, 'апрель'), (5, 'май'), (6, 'июнь'), (7, 'июль'), (8, 'август'), (9, 'сентябрь'), (10, 'октябрь'), (11, 'ноябрь'), (12, 'декабрь'))
  as m(num, title) on m.num=date_part('month', t."дата")
    where 
      p.id=?
      and t."значение" = 'Отпускные/начислено'
    group by date_part('year', t."дата"), date_part('month', t."дата"), m.title
    ) nach
    where EXISTS (---
      {%= $st->dict->render('доступ к расчету начислений') %}
    )
  group by "year"
) nach on nach."year"=d."year"

@@ начисления 12 месяцев
----  деньги для расчета отпускной ставки
WiTH nach as (
select-- p.id as pid,
  "year",
  "month",
  "дата мес",
  sum("начислено") as "начислено"

from (
  select p.id, t."дата",
    date_part('year', t."дата") as "year", date_part('month', t."дата") as "month",
    date_trunc('month', t."дата")::date as "дата мес",
    text2numeric(t."коммент") as "начислено"
  from 
    "профили" p
    join refs rt on p.id=rt.id1
    join "табель" t on t.id=rt.id2
    
  where 
    p.id=?
    and t."значение" ~* 'начислено$' and t."значение" != 'Суточные/начислено' and t."значение" != 'Отпускные/начислено'
    and t."коммент" is not null
      
  union all---двойники

  select
    p1.id, t."дата", date_part('year', t."дата") as "year", date_part('month', t."дата") as "month",
     date_trunc('month', t."дата")::date as "дата мес",
    text2numeric(t."коммент") as "начислено"
  from 
    "профили" p1
    join refs rp on p1.id=rp.id1
    join "профили" p2 on p2.id=rp.id2
    join refs rt on p2.id=rt.id1
    join "табель" t on t.id=rt.id2
  where
    p1.id=?
    and t."значение" ~* 'начислено$' and t."значение" != 'Суточные/начислено' and t."значение" != 'Отпускные/начислено'
    and t."коммент" is not null
) u

group by "year", "month", "дата мес"
---order by 1 desc, 2 desc
---limit 12
)--- конец WITH

select /*"year",*/ jsonb_agg(sum order by sum."дата мес" desc) as "@суммы по месяцам/json"
from 
(
select
  nach.*,
  date_part('day', nach."дата мес" + interval '1 month - 1 day') as "дней в месяце",
  ---to_char(("year"::text||'-'||"month"::text||'-01')::date, 'tmmonth') as "месяц"
  m.title as "месяц"
from (--- для расчета последней даты периода 12 мес
  select *
  from nach
  order by "дата мес" desc
  limit 1
) n1
join nach on nach."дата мес" > (n1."дата мес"-interval '1 year')
join 
(VALUES (1, 'январь'), (2, 'февраль'), (3, 'март'), (4, 'апрель'), (5, 'май'), (6, 'июнь'), (7, 'июль'), (8, 'август'), (9, 'сентябрь'), (10, 'октябрь'), (11, 'ноябрь'), (12, 'декабрь'))
  as m(num, title) on m.num=nach."month"

) sum
where EXISTS (---
  {%= $st->dict->render('доступ к расчету начислений') %}
)
---order by sum."дата мес" desc


@@ доступ к расчету начислений
---- или прямой крыжик
---- или вложение группы в 'Расчет отпускной ставки'
select g1.*
from
  refs r
  join roles g1 on r.id2=g1.id
  join refs r2 on g1.id=r2.id1
  left join (
    select g.id
    from roles g
      join refs r on g.id=r.id1
    where r.id2=?-- профиль auth_user
  ) g2 on g2.id=r2.id2
  where
    r.id1=3886 and g1.name='Расчет отпускной ставки'
    and (r2.id2=? or g2.id is not null)-- профиль auth_user