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
  ----extract(day FROM date_trunc('month', d."дата1")+interval '1 month - 1 day') as "дней в месяце",
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
  (select age(date_trunc('month', coalesce(d."дата расторжения", case when d."продление срока" then (now()+interval '1 year')::date else d."дата2" end)), date_trunc('month', d."дата1"+interval '2 month')) as "age") a
  join lateral (
    select generate_series(0, (extract(year from a."age")*12 + extract(month from a."age"))::int/*колич полных месяцев*/, 1) as m
  ) m on true
where cat.id=121952--- аренда офисов

union all
--- тут один  последний месяц договора (возможно неполный)
select  date_trunc('month', coalesce(d."дата расторжения", case when d."продление срока" then (now()+interval '1 year')::date else d."дата2" end)),
  ---extract(day FROM coalesce(d."дата расторжения", d."дата2")/* тут важно до какой даты включительно- interval '1 day'*/)/extract(day FROM date_trunc('month', coalesce(d."дата расторжения", d."дата2")) + interval '1 month - 1 day'),--- доля дней в последнем месяце
  extract(day FROM coalesce(d."дата расторжения", case when d."продление срока" then (now()+interval '1 year')::date else d."дата2" end)/* тут важно до какой даты включительно- interval '1 day'*/), --- дней оплаты
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
  ---/*date_trunc('month', */d."дата1", ---) as "сумма с даты",
  --~ array[null::int]::int[] as "@доп.согл./id",
  null::int as "доп.согл./id", ---null::int as "номер доп.согл.",
  array_agg(distinct ob.id) as "@объекты/id",
  array_agg(p."номер-название" order by p."номер-название") as "@помещения-номера",---для коммента
  coalesce(d."сумма безнал", sum(coalesce(dp."сумма", dp."ставка"*coalesce(dp."площадь", p."площадь")))) as "сумма безнал", --- без налички
  coalesce(d."сумма безнал", sum(coalesce(dp."сумма", dp."ставка"*coalesce(dp."площадь", p."площадь"))) /*+ coalesce(dp."сумма нал", 0::money)*/) + coalesce(d."сумма нал", 0::money) as "сумма"

from
  "аренда/договоры" d
  
  join refs r on d.id=r.id1
  join "аренда/договоры-помещения" dp on dp.id=r.id2

  join refs r1 on dp.id=r1.id2
  join "аренда/помещения" p on p.id=r1.id1
  
  join refs r2 on p.id=r2.id2
  join "аренда/объекты/литеры" lit on lit.id=r2.id1
  
  join refs r3  on lit.id=r3.id2
  join "аренда/объекты" o on o.id=r3.id1
  
  join refs ro on o.id=ro.id2
  join "roles" ob on ob.id=ro.id1
  
group by d.id, d."дата1"

--- доп соглашения
union all
select
  d.id as "договор/id", ---p.id as "помещение/id"
  ----/*date_trunc('month', */dop."дата1",
  --~ array_agg(dop.id order by dop."дата1") as "@доп.согл./id",
  dop.id  as "доп.согл./id", ----row_number() OVER (ORDER BY dop."дата1") as "номер доп.согл.",
  array_agg(distinct ob.id) as "@объекты/id",
  array_agg(p."номер-название" order by p."номер-название") as "@помещения-номера",---для коммента
  coalesce(dop."сумма безнал", sum(coalesce(dp."сумма", dp."ставка"*coalesce(dp."площадь", p."площадь")))) as "сумма безнал", --- без налички
  coalesce(dop."сумма безнал", sum(coalesce(dp."сумма", dp."ставка"*coalesce(dp."площадь", p."площадь"))) /*+ coalesce(dp."сумма нал", 0::money)*/) + coalesce(dop."сумма нал", 0::money) as "сумма"
from 
  "аренда/договоры" d
  
  join "refs" rd on d.id=rd.id1
  join "аренда/договоры/доп.согл." dop on dop.id=rd.id2
  
  join refs r on dop.id=r.id1
  join "аренда/договоры-помещения" dp on dp.id=r.id2

  join refs r1 on dp.id=r1.id2
  join "аренда/помещения" p on p.id=r1.id1
  
  join refs r2 on p.id=r2.id2
  join "аренда/объекты/литеры" lit on lit.id=r2.id1
  
  join refs r3 on lit.id=r3.id2
  join "аренда/объекты" o on o.id=r3.id1
  
  join refs ro on o.id=ro.id2
  join "roles" ob on ob.id=ro.id1
  
group by d.id, dop."дата1", dop."сумма нал", dop.id

;--- конец view

/*****************************************/

DROP FUNCTION IF EXISTS "аренда/договоры/id/@даты"();
DROP FUNCTION IF EXISTS "аренда/договоры/доп.согл/id/даты"() CASCADE;
CREATE OR REPLACE FUNCTION "аренда/договоры/доп.согл/id/даты"()
RETURNS TABLE("договор/id" int, "доп.согл./id" int, "дата1" date, "дата2" date, "номер доп.согл." int)
AS $func$
/*
** мощная развязка договоров с доп. согл. по границам дат действия
*/
BEGIN

delete from "аренда/договоры/доп.согл." dop
---select * from "аренда/договоры/доп.согл." dop
where not EXISTS (
  select r.id1
  from 
    "refs" r
    join "аренда/договоры-помещения" p  on p.id=r.id2
  where dop.id=r.id1
);

return query
with agg as (
  select 
    d.id as "договор/id",
    d."дата1"
    || dop."@доп.согл./дата1"
    || case when d."дата расторжения" is null and not coalesce(d."продление срока", false) then d."дата2"
          else d."дата расторжения" end as "@даты",
    dop."@доп.согл./id"
  from "аренда/договоры" d
    left join (
      select rd.id1 as "договор/id",
        array_agg(dop.id order by dop."дата1") as "@доп.согл./id",
        array_agg(dop."дата1" order by dop."дата1") as "@доп.согл./дата1"
        ---array_agg(p.id order by dop."дата1") as "@доп.согл./дата1"
      from 
        "аренда/договоры/доп.согл." dop
        join refs rd on dop.id=rd.id2
        ---join refs r on dop.id=r.id1
        ---join "аренда/договоры-помещения" dp on dp.id=r.id2
        ---join refs r1 on dp.id=r1.id2
        ---join "аренда/помещения" p on p.id=r1.id1
      group by rd.id1
    ) dop on d.id=dop."договор/id"
)

select d1."договор/id", d1."@доп.согл./id"[o1.n1-1] as "доп.согл./id", o1.d1, o2.d2, (o1.n1-1)::int
from agg d1, unnest(d1."@даты") with ordinality o1(d1, n1),
  agg d2, unnest(d2."@даты") with ordinality o2(d2, n2)
where d1."договор/id"=d2."договор/id" /*and d1."@границы дат"[1]!=o1*/ /*and o1.d1 < coalesce(o2.d2, now())*/ and o2.n2-o1.n1=1
---order by "договор/id"--, o1.d1, o2.d2

;
END
$func$ LANGUAGE 'plpgsql';

/************************************/
DROP VIEW IF EXISTS "движение ДС/аренда/счета" CASCADE;--- расходные записи движения по аренде

CREATE OR REPLACE VIEW "движение ДС/аренда/счета" as
-- 
select d.id  as "договор/id", d.ts as "договор/ts", sum."дата",
  /*-1::numeric**/sum."сумма"*(sum."дней оплаты"/sum."дней в месяце")*(1-sum."% скидки"/100) as "сумма",
  sum."сумма безнал"*(sum."дней оплаты"/sum."дней в месяце")*(1-sum."% скидки"/100) as "сумма безнал",
  sum."доп.согл./id", sum."номер доп.согл.",
  --~ -1::numeric as "sign", --- счет-расход
  sum."@категории/id" as "категории",
  sum."@категории/title" as "категория",
  k.title as "контрагент", k.id as "контрагент/id",
  sum."@объекты/id", row_to_json(ob) as "$объект/json", ob.id as "объект/id", ob.name as "объект",
  --~ row_to_json(ob) as "$объект/json", ob.id as "объект/id", ob.name as "объект",
  --~ null::int as "кошелек2", --- left join
  --~ null::text as "профиль", null::int as "профиль/id",
  array[[pr."name", null], [null, null]]::text[][] as "кошельки", ---  проект+кошелек, ...
  array[[pr."id", null], [null, null]]::int[][] as "кошельки/id", ---  проект+кошелек, ...
  --~ null::text[][] as "кошельки", --- пока не знаю
  --~ null::int[][] as "кошельки/id",  --- пока не знаю
  'счет ' || coalesce('№'||num1."номер", '') || ' по дог. ' || d."номер" || case when sum."номер доп.согл." > 0 then '(доп. согл. ' || sum."номер доп.согл."::text ||')' else E'' end || ' ★ ' || ob.name /*|| E'\n' || coalesce(d."коммент", ''::text)*/ as "примечание"
  
from
  "аренда/договоры" d
  
  join refs rk on d.id=rk.id2
  join "контрагенты" k on k.id=rk.id1
  
  left join (-- проекты-арендодатели
    select p.*, r.id2
    from refs r
      join "roles" p on p.id=r.id1--- нет "проекты"
  ) pr on d.id=pr.id2 
  --~ join refs rp on p.id=rp.id1
  --~ join "кошельки" w on w.id=rp.id2
  
  
  join (-- суммы в мес по договору и доп согл

      select  sum."договор/id",  "доп.согл./id", "номер доп.согл.", "дата"::date,---"месяц"
        "@объекты/id", "@категории/id", "@категории/title",  "дней оплаты", "дней в месяце",
        "сумма безнал", "сумма", case when "@категории/id"[array_length("@категории/id",1)]=929979 then 0::numeric else coalesce(dc."%", 0::numeric) end as "% скидки"
        
      from (
        select d.*, m."дата", m."@категории/id", m."@категории/title",
          coalesce(m."дней оплаты", 
          case 
            when date_trunc('month', m."дата"::date)=date_trunc('month', d."дата1") and date_trunc('month', m."дата"::date)=date_trunc('month',  d."дата2")
              then d."дата2"-d."дата1"
            when date_trunc('month', m."дата"::date)=date_trunc('month',  d."дата2")
              then d."дата2"-m."дата"::date
            when date_trunc('month', m."дата"::date)=date_trunc('month',  d."дата1")
              then (m."дата"+interval '1 month')::date-d."дата1"
            else
               extract(day FROM date_trunc('month', m."дата"::date)+interval '1 month - 1 day' )
            end
            ) as "дней оплаты",
            extract(day FROM date_trunc('month', m."дата"::date)+interval '1 month - 1 day' ) as "дней в месяце",
            sum."@объекты/id", sum."@помещения-номера", sum."сумма безнал", sum."сумма"
            ---
            
        ---select *
        from "аренда/договоры/доп.согл/id/даты"() d ---where "договор/id"=872495;
          join "аренда/даты платежей" m on d."договор/id"=m."договор/id" and (m."дата" between d."дата1" and coalesce(d."дата2"-interval '1 day', (now()+interval '1 year')::date) or date_trunc('month', m."дата"::date)=date_trunc('month', d."дата1") or date_trunc('month', m."дата"::date)=date_trunc('month',  d."дата2"-interval '1 day'))
          
          join  "аренда/суммы платежей"  sum on coalesce(d."доп.согл./id", d."договор/id")=coalesce(sum."доп.согл./id", sum."договор/id")
      ) sum
      left join (--- скидки по месяцам
        select
          dc.*,
          d.id as "договор/id"
        from "аренда/договоры" d
          join "refs" r on d.id=r.id1
          join "аренда/договоры/скидки" dc on dc.id=r.id2
      ) dc on dc."договор/id"=sum."договор/id" and date_trunc('month', sum."дата"::date)=date_trunc('month', dc."месяц")
  ) sum on sum."договор/id"=d.id
  
    ---нумерация счетов (может быть отключена)
  left join (
    select n.*, r.id1
    from 
      "refs" r
      join "счета/аренда/помещения" n on n.id=r.id2
  ) num1 on d.id=num1.id1 and num1."месяц"=date_trunc('month', sum."дата")---param."month"
  
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
  join "roles" pr on pr.id=_rpr.id1
  
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
            lit.id as "литер/id", row_to_json(lit) as "$литер/json",
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
            join "аренда/объекты/литеры" lit on lit.id=r2.id1
            join refs r3 on lit.id=r3.id2
            join "аренда/объекты" o on o.id=r3.id1
            join refs ro on o.id=ro.id2
            join "roles" ob on ob.id=ro.id1
          ) dp
        group by dp."доп.согл./id"
    ) dp on dop.id=dp."доп.согл./id"
  ) dop on dop.id=r.id2
group by d.id
;

