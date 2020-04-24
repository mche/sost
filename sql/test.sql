/*выделение новой базы*/
--~ DO
--~ $do$
--~ DECLARE
   --~ d record;
--~ BEGIN
/********************************************/
select *, unnest("суммы"[1:1]), 
from (
  select d1."месяц",
    array_agg(sum."сумма" order by d1."месяц"-sum."дата1") as "суммы",
    array_agg(sum."дата1" order by d1."месяц"-sum."дата1") as "даты1",
    array_agg(d1."месяц"-sum."дата1"/* order by d1."месяц"-sum."дата1"*/) as "дней в месяце"

  from
    (
    values ( '2020-01-04'::date, 1000::money), ( '2020-04-14'::date, 2000::money)
    ) sum("дата1", "сумма")
    join (
      select date_trunc('month', '2020-01-04'::date + interval '0 month')+make_interval(months=>m) "месяц"
      from generate_series(0, 11) m
    ) d1 on date_trunc('month', sum."дата1")<=d1."месяц"
  group by d1."месяц"
) q
---where array_length("дней в месяце", 1) = 1 or "дней в месяце"[2] < interval '0 days'
;

--~ END
--~ $do$;