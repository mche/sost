    select 
      "договор/id", "дата", 
      "@объекты/id",
      "@категории/id", "@категории/title", 
       "сумма безнал", "сумма", "% скидки",
       "всего дней в месяце",
      case
        when "даты1" is null or not "это начало доп соглашения" then coalesce("дней оплаты", "всего дней в месяце")
        else "всего дней в месяце"-coalesce("дней оплаты", 0)
      end as "дней оплаты",
      --~ "@доп.согл./id", 
      "@доп.согл./id"[case when "даты1" is null then 2 else 1 end] as "доп.согл./id",
      "@номера доп.согл."[case when "даты1" is null then 2 else 1 end] as "номер доп.согл."
    from (

      select  a."договор/id", "дата"::date,---"месяц"
        case when "@категории/id"[array_length("@категории/id",1)]=929979 then 0::numeric else coalesce(dc."%", 0::numeric) end as "% скидки",
        "@объекты/id",
        "@категории/id", "@категории/title",
        unnest("суммы безнал"[1\:case when /*array_length("дней", 1) = 1 or*/ "дней оплаты доп"[1] < interval '0 days' then 2 else 1 end]) as "сумма безнал",
        unnest("суммы"[1\:case when /*array_length("дней", 1) = 1 or*/ "дней оплаты доп"[1] < interval '0 days' then 2 else 1 end]) as "сумма",
        unnest("даты1"[1:1])  as "даты1",
        "@доп.согл./id", "@номера доп.согл.",
        ---generate_subscripts("@доп.согл./id"[1:1], 1) as "номер доп.согл.",
        extract(day FROM date_trunc('month', "дата") + interval '1 month - 1 day') as "всего дней в месяце",
        case when array_length("дней оплаты доп", 1) > 1 and "дней оплаты доп"[1] < interval '0 days' then extract(day FROM -1*"дней оплаты доп"[1]) else "дней оплаты осн" end as "дней оплаты",
        "дней оплаты доп"[1] < interval '0 days' as "это начало доп соглашения"
        ---"номер доп.согл."
      from (
        select d1."договор/id", d1."дата", d1."дней оплаты" as "дней оплаты осн", sum."@объекты/id", ---sum."@доп.согл./id",
          d1."@категории/id", d1."@категории/title",
          array_agg(sum."доп.согл./id" order by d1."дата"-sum."дата1") as "@доп.согл./id",
          array_agg(sum."номер доп.согл." order by d1."дата"-sum."дата1") as "@номера доп.согл.",
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
      --~ where sum."договор/id"=1010760 --- --946000
        group by d1."договор/id", d1."дата", d1."дней оплаты", sum."@объекты/id", d1."@категории/id", d1."@категории/title"---, sum."@доп.согл./id"


      ) a
      left join (--- скидки по месяцам
        select
          dc.*,
          d.id as "договор/id"
        from "аренда/договоры" d
          join "refs" r on d.id=r.id1
          join "аренда/договоры/скидки" dc on dc.id=r.id2
      ) dc on dc."договор/id"=a."договор/id" and date_trunc('month', a."дата"::date)=date_trunc('month', dc."месяц")
      ---unnest("даты1") with ordinality as d ("_даты1", "номер доп.согл.")
      ---generate_subscripts("даты1", 1) as "номер доп.согл."
    ) a
    
   join (-- проекты-арендодатели
    select p.*, r.id2
    from refs r
      join "проекты" p on p.id=r.id1
  ) pr on a."договор/id"=pr.id2 

where pr.id=74325;

select "договор/id","дата", "сумма безнал"
from "движение ДС/аренда/счета"
where "кошельки/id"[1][1]=74325
order by 1, 2 desc
;


