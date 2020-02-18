@@ таблицы
create table IF NOT EXISTS "аренда/объекты" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  "адрес" text, --not null unique переделал на объект (связь)
  "коммент" text
/*
id1("roles")->id2("аренда/объекты")
*/
);

create table IF NOT EXISTS "аренда/помещения" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  "номер-название" text not null, --
  "этаж" smallint not null,
  "площадь" numeric not null,
  "коммент" text
/*
id1("аренда/объекты")->id2("аренда/помещения")
*/
);

create table IF NOT EXISTS "аренда/договоры" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  "номер" text not null, --
  "дата договора" date, --- ALTER TABLE ниже
  "дата расторжения" date, --- ALTER TABLE ниже
  "дата1" date not null, -- начало срока аренды
  "дата2" date not null, -- конец  срока аренды
  "коммент" text,
  "оплата до числа" smallint, --- ALTER TABLE "аренда/договоры" ADD COLUMN IF NOT EXISTS "оплата до числа" smallint;
  "предоплата" boolean --- ALTER TABLE "аренда/договоры" ADD COLUMN IF NOT EXISTS "предоплата" boolean;
  ---"оплата наличкой" boolean --- !!!в реквизит контрагента физ. лицо ALTER TABLE ниже
/* связи:
id1("контрагенты")->id2("аренда/договоры")
id1("аренда/договоры")->id2("аренда/договоры-помещения") 
*/
);
ALTER TABLE "аренда/договоры" ADD COLUMN IF NOT EXISTS "оплата до числа" smallint;
ALTER TABLE "аренда/договоры" ADD COLUMN IF NOT EXISTS "предоплата" boolean;
ALTER TABLE "аренда/договоры" ADD COLUMN IF NOT EXISTS "дата договора" date;
ALTER TABLE "аренда/договоры" ADD COLUMN IF NOT EXISTS "дата расторжения" date;
ALTER TABLE "аренда/договоры" DROP COLUMN IF  EXISTS "оплата наличкой";


create table IF NOT EXISTS "аренда/договоры-помещения" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  "ставка" money, -- кв.м./месяц -- ALTER TABLE "аренда/договоры-помещения" ALTER COLUMN  "ставка" DROP NOT NULL;
  "сумма" money, -- или сумма /месяц -- ALTER TABLE "аренда/договоры-помещения" ADD COLUMN "сумма" money;
  "сумма нал" money, --- доп. наличка --- ALTER TABLE "аренда/договоры-помещения" ADD COLUMN IF NOT EXISTS  "сумма нал" money;
  "коммент" text
---  ALTER TABLE "аренда/договоры-помещения" ADD CONSTRAINT "аренда/договоры-помещения/ставка|сумма" CHECK ( "ставка" is not null or "сумма" is not null );
/* связи:
id1("аренда/договоры")->id2("аренда/договоры-помещения")
id1("аренда/помещения")->id2("аренда/договоры-помещения")
*/
);
ALTER TABLE "аренда/договоры-помещения" ALTER COLUMN  "ставка" DROP NOT NULL;
ALTER TABLE "аренда/договоры-помещения" ADD COLUMN IF NOT EXISTS  "сумма" money;
ALTER TABLE "аренда/договоры-помещения" ADD COLUMN IF NOT EXISTS  "сумма нал" money;

/***********************************/
create table IF NOT EXISTS "аренда/расходы" (---- кроме самой аренды
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  "дата" date not null,
  "вид расхода" int not null,----> "аренда/расходы/виды"
  "количество" numeric not null,
  "ед" text,
  "цена" money,
  "сумма" money,
  "коммент" text
/* связи:
id1("аренда/договоры")->id2("аренда/расходы")
*/
);
create table IF NOT EXISTS "аренда/расходы/виды" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  "наименование расхода" text not null
);


/*******************************************/
CREATE SEQUENCE IF NOT EXISTS "счета";
CREATE SEQUENCE IF NOT EXISTS "акты";
---DROP TABLE IF EXISTS "счета";

create table IF NOT EXISTS "счета/аренда/помещения" ( ---- счета за помещения
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  "номер" text not null DEFAULT nextval('счета'::regclass)::text, --
  "месяц" date not null -- дата выставления счета
/* связи:
id1("аренда/договоры")->id2("счета/аренда/помещения")
*/
);
CREATE INDEX  IF NOT EXISTS "счета/аренда/помещения/idx/месяц" ON "счета/аренда/помещения" ("месяц");---date_trunc('month', "месяц")--- ERROR:  functions in index expression must be marked IMMUTABLE

create table IF NOT EXISTS "акты/аренда/помещения" ( ---- акты вып за помещения
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  "номер" text not null DEFAULT nextval('акты'::regclass)::text, --
  "месяц" date not null -- дата выставления счета
/* связи:
id1("аренда/договоры")->id2("счета/аренда/помещения")
*/
);
CREATE INDEX  IF NOT EXISTS "акты/аренда/помещения/idx/месяц" ON "акты/аренда/помещения" ("месяц");---date_trunc('month', "месяц")--- ERROR:  functions in index expression must be marked IMMUTABLE


CREATE OR REPLACE FUNCTION "номера счетов/аренда помещений"(date/*месяц*/, int[]/*договоры*/,int/* uid */)
RETURNS SETOF "счета/аренда/помещения"
AS $func$
/*
** Присвоение номеров счетов
** на входе:
** 1 - дата месяца счетов
** 2 - массив ид договоров, которым присвоить номера
** 3 - ид профиля
*/
DECLARE
  ---param record;
  drec record;
  ins "счета/аренда/помещения"%rowtype;
BEGIN
  ---select date_trunc('month', $1) as "месяц", $3 as uid into param;
  
  FOR drec IN
    select d.id
    from 
      ---(select param.*) p
      "аренда/договоры" d
      left join (
        select r.id1
        from "счета/аренда/помещения" s 
        join refs r  on s.id=r.id2 
        where  s."месяц"=date_trunc('month', $1) --- только счета этого мес
      ) s on d.id=s.id1
    where 
      date_trunc('month', $1) between date_trunc('month', d."дата1") and (date_trunc('month', coalesce(d."дата расторжения", d."дата2") + interval '1 month') - interval '1 day') ---только действующие договоры
      and d.id=any($2)
      and  s.id1 is null
    order by d."дата1" desc, d.id desc
  LOOP
    insert into "счета/аренда/помещения" ("месяц", uid) values (date_trunc('month', $1), $3) returning * into ins;
    insert into "refs" (id1,id2) values (drec.id, ins.id);
    ---RAISE NOTICE 'New id: %', ins.id;
    ---RETURN NEXT ins;
  END LOOP;

--- возвращать все счета этого мес
RETURN QUERY 
  select s.*
  from
    "счета/аренда/помещения" s ---on s.id=r.id2
  where 
    date_trunc('month', $1)=s."месяц" --- between d."дата1" and d."дата2" ---только действующие договоры
    ---and d.id=any($2)--- НЕТ! 
  ;
END;
$func$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION "номера актов/аренда помещений"(date/*месяц*/, int[]/*договоры*/,int/* uid */)
RETURNS SETOF "акты/аренда/помещения"
AS $func$
/*
** Присвоение номеров счетов
** на входе:
** 1 - дата месяца счетов
** 2 - массив ид договоров, которым присвоить номера
** 3 - ид профиля
*/
DECLARE
  ---param record;
  drec record;
  ins "акты/аренда/помещения"%rowtype;
BEGIN
  ---select date_trunc('month', $1) as "месяц", $3 as uid into param;
  
  FOR drec IN
    select d.id
    from 
      ---(select param.*) p
      "аренда/договоры" d
      left join (
        select r.id1
        from "акты/аренда/помещения" s 
        join refs r  on s.id=r.id2 
        where  s."месяц"=date_trunc('month', $1) --- только счета этого мес
      ) s on d.id=s.id1
    where 
      date_trunc('month', $1) between date_trunc('month', d."дата1") and (date_trunc('month', coalesce(d."дата расторжения", d."дата2") + interval '1 month') - interval '1 day') ---только действующие договоры
      and d.id=any($2)
      and  s.id1 is null
    order by d."дата1" desc, d.id desc
  LOOP
    insert into "акты/аренда/помещения" ("месяц", uid) values (date_trunc('month', $1), $3) returning * into ins;
    insert into "refs" (id1,id2) values (drec.id, ins.id);
    RAISE NOTICE 'New id: %', ins.id;
    ---RETURN NEXT ins;
  END LOOP;

--- возвращать все счета этого мес
RETURN QUERY 
  select s.*
  from
    "акты/аренда/помещения" s ---on s.id=r.id2
  where 
    date_trunc('month', $1)=s."месяц" --- between d."дата1" and d."дата2" ---только действующие договоры
    ---and d.id=any($2)--- НЕТ! 
  ;
END;
$func$ LANGUAGE plpgsql;

/*конец схемы*/


@@ объекты УК
select {%= $select || '*' %}
from "roles/родители"(null)
{%= $where || '' %}
{%= $order_by || '' %}
;


@@ объекты/список или позиция
select o.*,
  ob.id as "объект/id",
  row_to_json(ob) as "$объект/json",
  p."@кабинеты/json", p."@кабинеты/id"
from "аренда/объекты" o
  join refs ro on o.id=ro.id2
  join roles ob on ob.id=ro.id1
  left join (
    select o.id, jsonb_agg(p order by p.id) as "@кабинеты/json", array_agg(p.id order by p.id) as "@кабинеты/id"
    from "аренда/объекты" o
      join "refs" r on o.id=r.id1
      join "аренда/помещения" p on p.id=r.id2
    group by o.id
  ) p on o.id=p.id
{%= $where || '' %}
{%= $order_by || 'order by ob."name"  ' %}

@@ договоры
select d.*,
  timestamp_to_json(d."дата1"::timestamp) as "$дата1/json",
  timestamp_to_json(d."дата2"::timestamp) as "$дата2/json",
  timestamp_to_json(d."дата расторжения"::timestamp) as "$дата расторжения/json",
  row_to_json(k) as "$контрагент/json",
  k.id as "контрагент/id",
  dp.*,
  dp."@кабинеты/id" as "@помещения/id"
from 
  "аренда/договоры" d
  join refs r on d.id=r.id2
  join "контрагенты" k on k.id=r.id1
  left join (
    select d.id as "договор/id",
      jsonb_agg(dp order by dp.id) as "@помещения/json",
      array_agg(dp."помещение/id" order by dp.id) as "@кабинеты/id",
      array_agg(dp.id  order by dp.id) as "@договоры/помещения/id",
      sum(dp."площадь помещения") as "площадь помещений",
      sum(dp."оплата за помещение") as "оплата"
    from "аренда/договоры" d 
      join refs r on d.id=r.id1
      join (
        {%= $dict->render('договоры/помещения') %}
      ) dp on dp.id=r.id2
    group by d.id
  ) dp on d.id=dp."договор/id"
{%= $where || '' %}
{%= $order_by || 'order by d."дата1" desc, d.id desc  ' %}

@@ договоры/помещения
select p.id as "помещение/id", row_to_json(p) as "$помещение/json",
  o.id as "аренда/объект/id", row_to_json(o) as "$аренда/объект/json",
  ob.id as "объект/id", row_to_json(ob) as "$объект/json",
  p."площадь" as "площадь помещения",
  coalesce(r."сумма", r."ставка"*p."площадь") as "оплата за помещение",
  r.*
from "аренда/договоры-помещения" r
  join refs r1 on r.id=r1.id2
  join "аренда/помещения" p on p.id=r1.id1
  join refs r2 on p.id=r2.id2
  join "аренда/объекты" o on o.id=r2.id1
  join refs ro on o.id=ro.id2
  join "roles" ob on ob.id=ro.id1
{%= $where || '' %}
{%= $order_by || '' %}

@@ счета
--- для docx
WITH param as (
  select *, to_char(d."дата", 'YYYY') as "год", date_trunc('month', d."дата") as "month"
  from (VALUES (1, 'январь'), (2, 'февраль'), (3, 'март'), (4, 'апрель'), (5, 'май'), (6, 'июнь'), (7, 'июль'), (8, 'август'), (9, 'сентябрь'), (10, 'октябрь'), (11, 'ноябрь'), (12, 'декабрь'))
    m(num, "месяц")
  join (VALUES (?::date)) d("дата") on m.num=date_part('month', d."дата")
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

select jsonb_agg(s) as "json" from (
select
  coalesce(num1."номер", '000')/*(random()*1000)::int*/ as "номер счета",
  timestamp_to_json(coalesce(num1.ts, now())) as "$дата счета",
  
  coalesce(num2."номер", '000')/*(random()*1000)::int*/ as "номер акта",
  timestamp_to_json(coalesce(/*num2.ts*/(date_trunc('month', num2."месяц")+interval '1 month'-interval '1 day')::timestamp, now())) as "$дата акта",--- на последнее число мес
  
  row_to_json(d) as "$договор", 
  row_to_json(k) as "$контрагент",
  k.id as "контрагент/id",
  dp."сумма",
  /*** хитрая функция sql/пропись.sql ***/
  firstCap(to_text(dp."сумма"::numeric, 'рубль', scale_mode => 'int')) as "сумма прописью",
  ---ARRAY(select (select to_json(a) from (select ('{"Арендная плата за нежилое помещение за '||param."месяц"||' '||param."год"||' г."}')::text[] as "номенклатура", -1::numeric*dp."сумма" as "сумма" ) a)) as "@позиции",
  dp."@позиции",
  dp."всего позиций"
from
  param
  join (
    select d.*,
      upper(replace(d."номер", '№', '')) as "номер",
      timestamp_to_json(coalesce(d."дата договора", d."дата1")::timestamp) as "$дата договора",
      timestamp_to_json(d."дата1"::timestamp) as "$дата1",
      timestamp_to_json(d."дата2"::timestamp) as "$дата2"
    from "аренда/договоры" d
  ) d on param."month" between date_trunc('month', d."дата1") and (date_trunc('month', coalesce(d."дата расторжения", d."дата2") + interval '1 month') - interval '1 day') ---только действующие договоры
  join refs r on d.id=r.id2
  join "контрагенты" k on k.id=r.id1
  /*left join (
    select d.id as "договор/id",
      jsonb_agg(dp order by dp.id) as "@помещения/json",
      array_agg(dp."помещение/id" order by dp.id) as "@кабинеты/id",
      array_agg(dp.id  order by dp.id) as "@договоры/помещения/id",
      sum(dp."площадь помещения") as "площадь помещений",
      sum(dp."оплата за помещение") as "оплата"
    from "аренда/договоры" d 
      join refs r on d.id=r.id1
      join (
        {%= $dict->render('договоры/помещения') %}
      ) dp on dp.id=r.id2
    group by d.id
  ) dp on d.id=dp."договор/id"*/
  
  /*** Waltex/Report.pm.dict.sql ***/
  ---join "движение ДС/аренда/счета" dp on d.id=dp.id and param."month"=date_trunc('month', dp."дата") and dp."примечание"!~'предоплата'
  join lateral (
    select 
      sum(dp."сумма") as "сумма",
      array_agg(row_to_json(dp) order by dp."order_by") as "@позиции",
      count(dp) as "всего позиций"
    from (
      select
        -1::numeric*dp."сумма" as "сумма",
        not 929979=any(dp."категории") as "order_by",
        case when 929979=any(dp."категории")---ид категории
          then ('{"Обеспечительный платеж"}')::text[]
          else ('{"Арендная плата за нежилое помещение за '||param."месяц"||' '||param."год"||' г."}')::text[]
        end  as "номенклатура"
      from "движение ДС/аренда/счета" dp
       --- join "аренда/договоры" dd on dp.id=dd.id
      where  d.id=dp.id
        and param."month"=date_trunc('month', dp."дата")
        and not ?::int = any(dp."категории")
        ---and not coalesce(dd."оплата наличкой", false)
    ) dp
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
  
  ---left join num on d.id=num.id1
{%= $where || '' %}
{%= $order_by || 'order by d."дата1" desc, d.id desc  ' %}
) s

@@ счет.docx
# -*- coding: utf-8 -*-
'''
https://github.com/elapouya/python-docx-template
http://docxtpl.readthedocs.io/en/latest/

pip install docxtpl

'''

from docxtpl import DocxTemplate, InlineImage, R, Listing
%#from docx.shared import Mm, Inches, Pt
from docx.shared import Mm
tpl=DocxTemplate(u'{%= $docx_template_file %}')
%#logo=InlineImage(tpl,u'''{%= $logo_image %}''', width=Mm(70)) if u'''{%= $logo_image %}''' else ''
sign_image=InlineImage(tpl,u'''{%= $sign_image %}''', width=Mm(40)) if u'''{%= $sign_image %}''' else ''
%#'top_details': [{%= $top_details %}], # 

undefined = ''
true = ''
false = ''
null = ''
context = {
    'items' : {%= $data %},
    'seller': {%= $seller %},
    'sign_image': sign_image,
}

tpl.render(context)
tpl.save(u'{%= $docx_out_file %}')


