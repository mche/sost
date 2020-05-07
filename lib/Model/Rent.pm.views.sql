DROP VIEW IF EXISTS "аренда/даты платежей" CASCADE;
CREATE OR REPLACE VIEW "аренда/даты платежей" as
/* даты платежей за аренду по всем месяцам
  вспомогательно для расстановки сумм платежей
  без доп соглашений
*/
select d.id as "договор/id",
  d1.*
from 
"аренда/договоры" d ----без доп соглашений
join lateral (--- повторить по месяцам договоров
--- тут один первый месяц договора (возможно неполный)
select d."дата1" as "дата", ---date_trunc('month', d."дата1") as "месяц",
---extract(day FROM date_trunc('month', d."дата1"+interval '1 month') - d."дата1")/extract(day FROM date_trunc('month', d."дата1") + interval '1 month - 1 day') as "доля дней",--- первого неполного месяца
  extract(day FROM date_trunc('month', d."дата1"+interval '1 month') - d."дата1") as "дней оплаты",
  ---' за ' || extract(day FROM date_trunc('month', d."дата1"+interval '1 month') - d."дата1")::text || ' дн. неполн. мес.' as "коммент",
  ---null::int[] as "@категории/id", null::text[] as "@категории/title"
  cat.parents_id||cat.id as "@категории/id", cat.parents_title[2:]||cat.title as "@категории/title"
from "категории/родители"() cat
where cat.id=121952--- аренда офисов

union all
--- тут остальные полные месяцы
select date_trunc('month', d."дата1"+interval '1 month')+make_interval(months=>m), /*1,*/
  null/* если нулл - весь месяц*/,
  cat.parents_id||cat.id as "@категории/id", cat.parents_title[2:]||cat.title as "@категории/title"
  ---null,
  --null, null
from
  "категории/родители"() cat,
  (select age(date_trunc('month', coalesce(d."дата расторжения", d."дата2")), date_trunc('month', d."дата1"+interval '2 month')) as "age") a
  join lateral (
    select generate_series(0, (extract(year from a."age")*12 + extract(month from a."age"))::int/*колич полных месяцев*/, 1) as m
  ) m on true
where cat.id=121952--- аренда офисов

union all
--- тут один  последний месяц договора (возможно неполный)
select  date_trunc('month', coalesce(d."дата расторжения", d."дата2")),
  ---extract(day FROM coalesce(d."дата расторжения", d."дата2")/* тут важно до какой даты включительно- interval '1 day'*/)/extract(day FROM date_trunc('month', coalesce(d."дата расторжения", d."дата2")) + interval '1 month - 1 day'),--- доля дней в последнем месяце
  extract(day FROM coalesce(d."дата расторжения", d."дата2")/* тут важно до какой даты включительно- interval '1 day'*/), --- дней оплаты
  ---' за ' || extract(day FROM coalesce(d."дата расторжения", d."дата2")/* тут важно до какой даты включительно- interval '1 day'*/)::text || ' дн. неполн. мес.' as "коммент", 
  --null, null
  cat.parents_id||cat.id as "@категории/id", cat.parents_title[2:]||cat.title as "@категории/title"
from "категории/родители"() cat
where cat.id=121952--- аренда офисов

union all
--- тут возможно предоплата одного мес
select d."дата1",---- /*as "дата"*/ /*1 /*доля - полная сумма*/
  null, 
  ---' предоплата (обеспечительный платеж)', --- 
  ---cc."@id", cc."@title"
  cat.parents_id||cat.id as "@id", cat.parents_title[2:]||cat.title as "@title"
from 
  generate_series(0, 0, 1) s,
  ---(select array_agg("id" order by level desc) as "@id", (array_agg("title" order by level desc))[2:] as "@title" from "категории/родители узла"(929979::int, true)) cc
  "категории/родители"() cat
where d."предоплата"=true and cat.id=929979
) d1 on true
;--- конец view

/************************************/

DROP VIEW IF EXISTS "аренда/суммы платежей" CASCADE;
CREATE OR REPLACE VIEW "аренда/суммы платежей" as
/* суммы аренды с учетом изменений по до соглашениям
*/
select
  d.id as "договор/id", ---p.id as "помещение/id"
  /*date_trunc('month', */d."дата1", ---) as "сумма с даты",
  --~ array[null::int]::int[] as "@доп.согл./id",
  null::int as "доп.согл./id", null::int as "номер доп.согл.",
  array_agg(distinct ob.id) as "@объекты/id",
  array_agg(p."номер-название" order by p."номер-название") as "@помещения-номера",---для коммента
  sum(coalesce(dp."сумма", dp."ставка"*coalesce(dp."площадь", p."площадь"))) as "сумма безнал", --- без налички
  sum(coalesce(dp."сумма", dp."ставка"*coalesce(dp."площадь", p."площадь")) /*+ coalesce(dp."сумма нал", 0::money)*/) + coalesce(d."сумма нал", 0::money) as "сумма"

from
  "аренда/договоры" d
  
  join refs r on d.id=r.id1
  join "аренда/договоры-помещения" dp on dp.id=r.id2

  join refs r1 on dp.id=r1.id2
  join "аренда/помещения" p on p.id=r1.id1
  
  join refs r2 on p.id=r2.id2
  join "аренда/объекты" o on o.id=r2.id1
  
  join refs ro on o.id=ro.id2
  join "roles" ob on ob.id=ro.id1
  
group by d.id, d."дата1"

--- доп соглашения
union all
select
  d.id as "договор/id", ---p.id as "помещение/id"
  /*date_trunc('month', */dop."дата1",
  --~ array_agg(dop.id order by dop."дата1") as "@доп.согл./id",
  dop.id  as "доп.согл./id", row_number() OVER (ORDER BY dop."дата1") as "номер доп.согл.",
  array_agg(distinct ob.id) as "@объекты/id",
  array_agg(p."номер-название" order by p."номер-название") as "@помещения-номера",---для коммента
  sum(coalesce(dp."сумма", dp."ставка"*coalesce(dp."площадь", p."площадь"))) as "сумма безнал", --- без налички
  sum(coalesce(dp."сумма", dp."ставка"*coalesce(dp."площадь", p."площадь")) /*+ coalesce(dp."сумма нал", 0::money)*/) + coalesce(dop."сумма нал", 0::money) as "сумма"
from 
  "аренда/договоры" d
  
  join "refs" rd on d.id=rd.id1
  join "аренда/договоры/доп.согл." dop on dop.id=rd.id2
  
  join refs r on dop.id=r.id1
  join "аренда/договоры-помещения" dp on dp.id=r.id2

  join refs r1 on dp.id=r1.id2
  join "аренда/помещения" p on p.id=r1.id1
  
  join refs r2 on p.id=r2.id2
  join "аренда/объекты" o on o.id=r2.id1
  
  join refs ro on o.id=ro.id2
  join "roles" ob on ob.id=ro.id1
  
group by d.id, dop."дата1", dop."сумма нал", dop.id

;--- конец view


/************************************/
DROP VIEW IF EXISTS "движение ДС/аренда/счета" CASCADE;--- расходные записи движения по аренде
CREATE OR REPLACE VIEW "движение ДС/аренда/счета" as
-- 
select d.id  as "договор/id", d.ts as "договор/ts", sum."дата",
  /*-1::numeric**/sum."сумма"*(sum."дней оплаты"/sum."всего дней в месяце") as "сумма", sum."сумма безнал"*(sum."дней оплаты"/sum."всего дней в месяце") as "сумма безнал",
  sum."доп.согл./id", sum."номер доп.согл.",
  --~ -1::numeric as "sign", --- счет-расход
  sum."@категории/id" as "категории",
  sum."@категории/title" as "категория",
  k.title as "контрагент", k.id as "контрагент/id",
  sum."@объекты/id", row_to_json(ob) as "$объект/json", ob.id as "объект/id", ob.name as "объект",
  --~ row_to_json(ob) as "$объект/json", ob.id as "объект/id", ob.name as "объект",
  --~ null::int as "кошелек2", --- left join
  --~ null::text as "профиль", null::int as "профиль/id",
  --~ null::text[][] as "кошельки", --- пока не знаю
  --~ null::int[][] as "кошельки/id",  --- пока не знаю
  'счет по дог. ' || d."номер" || case when sum."номер доп.согл." is not null then '(доп. согл. ' || sum."номер доп.согл."::text ||')' else E'' end || ' ★ ' || ob.name || E'\n' || coalesce(d."коммент", ''::text) as "примечание"
  
from
  "аренда/договоры" d
  
  join refs rk on d.id=rk.id2
  join "контрагенты" k on k.id=rk.id1
  
  
  join (-- суммы в мес по договору и доп согл
    select 
      "договор/id", "дата", 
      "@объекты/id",
      "@категории/id", "@категории/title", 
       "сумма безнал", "сумма",
       "всего дней в месяце",
      case
        when "даты1" is null or not "это начало доп соглашения" then coalesce("дней оплаты", "всего дней в месяце")
        else "всего дней в месяце"-coalesce("дней оплаты", 0)
      end as "дней оплаты",
      --~ "@доп.согл./id", 
      "@доп.согл./id"[case when "даты1" is null then 2 else 1 end] as "доп.согл./id",
      "@номера доп.согл."[case when "даты1" is null then 2 else 1 end] as "номер доп.согл."
    from (

      select  "договор/id", "дата"::date,---"месяц"
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
      ---unnest("даты1") with ordinality as d ("_даты1", "номер доп.согл.")
      ---generate_subscripts("даты1", 1) as "номер доп.согл."
    ) a
  ) sum on sum."договор/id"=d.id
  
  join  "roles" ob on ob.id=sum."@объекты/id"[1]
;

/*****************************/
DROP VIEW IF EXISTS "аренда/счета доп платежей" CASCADE;--- расходные записи движения по аренде
CREATE OR REPLACE VIEW "аренда/счета доп платежей" as
-- 
select r.id, r.ts, /*d."дата1", */r."дата"::date, -1::numeric*coalesce(pos."сумма", pos."сумма2") as "сумма",
  -1::numeric as "sign", --- счет-расход
  pos."категории", pos."категория",
  k.title as "контрагент", k.id as "контрагент/id",
  to_json(ob) as "$объект/json", ob.id as "объект/id", ob.name as "объект",
  null::int as "кошелек2", --- left join
  null::text as "профиль", null::int as "профиль/id",
  array[[pr.name, /*w.title*/ null], [/*w2."проект", w2.title*/null, null]]::text[][] as "кошельки", ---  проект+кошелек, ...
  array[[pr.id, /*w.id*/ null], [/*w2."проект/id", w2.id]*/null, null]]::int[][] as "кошельки/id", ---  проект+кошелек, ...
  'счет доп платежей арендатора по дог. № ' || d."номер" || E'\n' || ' ★ ' || ob.name /*|| ' (' || array_to_string(sum."@помещения-номера", ', ') || case when d1."доля дней"=1 and coalesce(d1."коммент", '')!~'предоплата' then '' else d1."коммент" end || E')\n'*/ || E'\n' || coalesce(r."коммент", ''::text) as "примечание"
  
from
  "аренда/договоры" d
  join refs _r on d.id=_r.id2
  join "контрагенты" k on k.id=_r.id1
  
  --- по объекту (одна строка из арендованных помещений)
  ---join refs _rp on d.id=_rp.id1
  /*left*/ join (
    select dp."договор/id",
      ---jsonb_agg(dp order by dp.id) as "@помещения/json",
      ---array_agg(dp."помещение/id" order by dp.id) as "@кабинеты/id",
      ---array_agg(dp.id  order by dp.id) as "@договоры/помещения/id",
      ---array_agg(dp."$объект/json"  order by dp.id) as "@объекты/json",
      array_agg(dp."объект/id" order by dp.id) as "@объекты/id"
      ---sum(dp."площадь помещения") as "площадь помещений",
      ---sum(dp."оплата за помещение") as "оплата"
    from ---"аренда/договоры" d 
      ---join refs r on d.id=r.id1
      --join (
        ( {%= $DICT->render('договоры/помещения') %} ) dp
      --) dp on dp."договор/id"=d.id
    group by "договор/id"--d.id
  ) dp on d.id=dp."договор/id"
  
  join  "roles" ob on ob.id=dp."@объекты/id"[1]--- один объект
  
  join refs _rr on d.id=_rr.id1
  join "аренда/расходы" r on r.id=_rr.id2
  
  join refs _rpr on r.id=_rpr.id2
  join (
    select distinct id, name---, descr, disable
    from "проекты"
  ) pr on pr.id=_rpr.id1
  
  join (--- позиции
    select 
      r.id as "расход/id",
      ---to_json(r) as "$расход/json",
      ---d.id as "договор/id",
      ---to_json(d) as "$договор/json",
      cat.id as "категория/id",
      ---to_json(cat) as "$категория/json",
      cat.parents_id||cat.id as "категории",
      cat.parents_title[2:]||cat.title as "категория",
      pos.*,
      pos."количество"*pos."цена" as "сумма2"
    from "аренда/расходы" r
      join refs r1 on r.id=r1.id1
      join "аренда/расходы/позиции" pos on pos.id=r1.id2
      join refs rn on pos.id=rn.id2
      join "категории/родители"() cat on cat.id=rn.id1
  ) pos on pos."расход/id"=r.id
;

/***********************************************/
CREATE OR REPLACE VIEW "аренда/доп.соглашения" as
/***
сборка доп соглашений в договоры
***/
select
  d.id as "договор/id", ---dop.id as "доп.согл./id"
  jsonb_agg(dop order by dop.id) as "@доп.соглашения/json",
  array_agg(dop.id order by dop.id) as "@доп.соглашения/id"
from
  "аренда/договоры" d
  join "refs" r on d.id=r.id1
  join (
    select
      dop.*,
      timestamp_to_json(dop."дата1"::timestamp) as "$дата1/json",
      dp.*
    from 
      "аренда/договоры/доп.согл." dop ---on dop.id=rd.id2
      join (---- список помещений по доп
        select dp."доп.согл./id",
          jsonb_agg(dp order by dp.id) as "@помещения/json",
          array_agg(dp."помещение/id" order by dp.id) as "@кабинеты/id",
          array_agg(dp.id  order by dp.id) as "@договоры/помещения/id",
          array_agg(dp."объект/id" order by dp.id) as "@объекты/id",
          sum(dp."площадь помещения") as "площадь помещений",
          sum(dp."оплата за помещение") as "оплата"
        from (
          select
            p.id as "помещение/id", row_to_json(p) as "$помещение/json",
            o.id as "аренда/объект/id", row_to_json(o) as "$аренда/объект/json",
            ob.id as "объект/id", row_to_json(ob) as "$объект/json",
            p."площадь" as "площадь помещения",
            coalesce(dp."сумма", dp."ставка"*p."площадь") as "оплата за помещение",
            dp.*,
            dop.id as "доп.согл./id"
          from 
             "аренда/договоры/доп.согл." dop
            join refs r on dop.id=r.id1
            join "аренда/договоры-помещения" dp on dp.id=r.id2
            join refs r1 on dp.id=r1.id2
            join "аренда/помещения" p on p.id=r1.id1
            join refs r2 on p.id=r2.id2
            join "аренда/объекты" o on o.id=r2.id1
            join refs ro on o.id=ro.id2
            join "roles" ob on ob.id=ro.id1
          ) dp
        group by dp."доп.согл./id"
    ) dp on dop.id=dp."доп.согл./id"
  ) dop on dop.id=r.id2
group by d.id
;