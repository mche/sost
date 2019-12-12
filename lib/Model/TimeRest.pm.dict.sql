@@ отпускные дни
select 
  d.*, sum."@суммы по месяцам"
from (
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

left join (---- отпускные деньги
  select "year", jsonb_agg(s) as "@суммы по месяцам"
  from (
    select-- p.id as pid,
      date_part('year', t."дата") as "year",
      date_part('month', t."дата") as "month",
      sum(text2numeric(t."коммент")) as "сумма"
    from 
      "профили" p
      join refs rt on p.id=rt.id1
      join "табель" t on t.id=rt.id2
    where 
      p.id=?
      and t."значение" = 'Отпускные/начислено'
      and t."коммент" is not null
    group by date_part('year', t."дата"), date_part('month', t."дата")
  ) s
  group by "year"
) sum on d."year"=sum."year"
