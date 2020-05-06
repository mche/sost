/*выделение новой базы*/
--~ DO
--~ $do$
--~ DECLARE
   --~ d record;
--~ BEGIN
/********************************************/
select 
  "договор/id", "дата",
   "сумма безнал", "сумма",
   "всего дней в месяце",
  case when "даты1" is null then "дней оплаты доп" else coalesce("всего дней в месяце"-"дней оплаты осн", "всего дней в месяце")  end as "дней оплаты"
from (

select  "договор/id", "дата",---"месяц"
  ---"@объекты/id",
  ---"@категории/id", "@категории/title",
  unnest("суммы безнал"[1:case when /*array_length("дней", 1) = 1 or*/ "дней оплаты доп"[1] < interval '0 days' then 2 else 1 end]) as "сумма безнал",
  unnest("суммы"[1:case when /*array_length("дней", 1) = 1 or*/ "дней оплаты доп"[1] < interval '0 days' then 2 else 1 end]) as "сумма",
  unnest("даты1"[1:1]) as "даты1",
  extract(day FROM date_trunc('month', "дата") + interval '1 month - 1 day') as "всего дней в месяце",
  case when "даты1" is null and array_length("дней оплаты доп", 1) > 1 and "дней оплаты доп"[1] < interval '0 days' then extract(day FROM -1*"дней оплаты доп"[1]) else "дней оплаты осн" end as "дней оплаты осн",
  /*else "дней оплаты" end as*/ "дней оплаты доп"
from (
  select d1."договор/id", d1."дата", d1."дней оплаты" as "дней оплаты осн", sum."@объекты/id",
    d1."@категории/id", d1."@категории/title",
    array_agg(sum."сумма безнал" order by d1."дата"-sum."дата1") as "суммы безнал",
    array_agg(sum."сумма" order by d1."дата"-sum."дата1") as "суммы",
    array_agg(sum."дата1" order by d1."дата"-sum."дата1") as "даты1",
    array_agg(d1."дата"-sum."дата1"order by d1."дата"-sum."дата1") as "дней оплаты доп" --- если тут первый интервал отрицательный - месяц разделяется доп соглашением (две суммы)

  from
    --~ (
    --~ values ( '2020-01-04'::date, 1000::money), ( '2020-04-14'::date, 2000::money),  ( '2020-08-20'::date, 3000::money)
    --~ ) sum("дата1", "сумма")
    -- сумма в мес по договору и доп соглашениям
    "аренда/суммы платежей" sum
    --~ join (
      --~ select date_trunc('month', '2020-01-04'::date + interval '0 month')+make_interval(months=>m) "месяц"
      --~ from generate_series(0, 11) m
    --~ ) d1 on date_trunc('month', sum."дата1")<=d1."месяц"
    --~ group by d1."месяц"
    join  "аренда/даты платежей" d1 on d1."договор/id"=sum."договор/id" and date_trunc('month', sum."дата1")<=d1."дата"
where sum."договор/id"=1010760
  group by d1."договор/id", d1."дата", d1."дней оплаты", sum."@объекты/id", d1."@категории/id", d1."@категории/title"


) a
) a
;

--~ END
--~ $do$;