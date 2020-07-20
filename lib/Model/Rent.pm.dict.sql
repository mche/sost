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
  "предоплата" boolean, --- ALTER TABLE "аренда/договоры" ADD COLUMN IF NOT EXISTS "предоплата" boolean;
  "сумма нал" money, --- ALTER TABL
  "продление срока" boolean --- ALTER TABLE
  ---"оплата наличкой" boolean --- !!!в реквизит контрагента физ. лицо ALTER TABLE ниже
/* связи:
id1("контрагенты")->id2("аренда/договоры")
id1("аренда/договоры")->id2("аренда/договоры-помещения") 
*/
);
ALTER TABLE "аренда/договоры" ADD COLUMN IF NOT EXISTS "оплата до числа" smallint;
ALTER TABLE "аренда/договоры" ADD COLUMN IF NOT EXISTS "предоплата" boolean;
ALTER TABLE "аренда/договоры" ADD COLUMN IF NOT EXISTS "сумма нал" money;
ALTER TABLE "аренда/договоры" ADD COLUMN IF NOT EXISTS "продление срока" boolean;
ALTER TABLE "аренда/договоры" ADD COLUMN IF NOT EXISTS "дата договора" date;
ALTER TABLE "аренда/договоры" ADD COLUMN IF NOT EXISTS "дата расторжения" date;
ALTER TABLE "аренда/договоры" DROP COLUMN IF  EXISTS "оплата наличкой";
---ALTER TABLE "аренда/договоры" ADD CONSTRAINT "аренда/договоры/дата2>дата1" check("дата2">="дата1");

create table IF NOT EXISTS "аренда/договоры/доп.согл." (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  "дата1" date not null, -- доп соглашение с этой даты
  "сумма нал" money, --- ALTER TABL
  "коммент" text
/* связи:
id1("аренда/договоры")->id2("аренда/договоры/доп.согл.")
id1("аренда/договоры/доп.согл.")->id2("аренда/договоры-помещения") 
*/
);

create table IF NOT EXISTS "аренда/договоры/скидки" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  "месяц" date not null, -- 
    "%" numeric not null, -- процент
  "коммент" text
  
);

create table IF NOT EXISTS "аренда/договоры-помещения" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  "ставка" money, -- кв.м./месяц -- ALTER TABLE "аренда/договоры-помещения" ALTER COLUMN  "ставка" DROP NOT NULL;
  "сумма" money, -- или сумма /месяц -- ALTER TABLE "аренда/договоры-помещения" ADD COLUMN "сумма" money;
  ---"сумма нал" money, --- доп. наличка --- ALTER TABLE "аренда/договоры-помещения" ADD COLUMN IF NOT EXISTS  "сумма нал" money;
  "площадь" numeric, --- если тут указана площадь, то не из "аренда/помещения"
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
ALTER TABLE "аренда/договоры-помещения" ADD COLUMN IF NOT EXISTS "площадь" numeric ;

/***********************************/
---drop  table IF  EXISTS "аренда/расходы";

create table IF NOT EXISTS "аренда/расходы" (---- кроме самой аренды --- возмещения доп расходов
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  "дата" date not null,
  "номер" text not null DEFAULT nextval('счета'::regclass)::text, --
  "коммент" text
/* связи:
id1("аренда/договоры")->id2("аренда/расходы")
id1("аренда/расходы")->id2("аренда/расходы/позиции")
*/
);
ALTER TABLE "аренда/расходы" ADD COLUMN IF NOT EXISTS  "номер" text not null DEFAULT nextval('счета'::regclass)::text;


create table IF NOT EXISTS "аренда/расходы/позиции" (---- кроме самой аренды --- возмещения доп расходов
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  "количество" numeric, --- not null,
  "ед" text,
  "цена" money,
  "сумма" money,
  "коммент" text
/* связи:
id1("номенклатура")->id2("аренда/расходы/позиции")
id1("аренда/расходы")->id2("аренда/расходы/позиции")
*/
);
---ALTER TABLE "аренда/расходы/позиции" DROP COLUMN IF EXISTS  "сумма";
ALTER TABLE "аренда/расходы/позиции" ADD COLUMN IF NOT EXISTS  "сумма" money;
ALTER TABLE "аренда/расходы/позиции" ALTER COLUMN  "количество" DROP NOT NULL;
drop  table IF  EXISTS "аренда/расходы/виды";

/*******************************************/
CREATE SEQUENCE IF NOT EXISTS "счета";
CREATE SEQUENCE IF NOT EXISTS "акты";
---DROP TABLE IF EXISTS "счета";

create table IF NOT EXISTS "счета/аренда/помещения" ( ---- счета за аренду помещений (без других платежей)
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

create table IF NOT EXISTS "акты/аренда/помещения" ( ---- акты вып за аренду помещений (без других платежей)
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

      /***left join (--- доп соглашения
        select dop.*, r.id1
        from "refs" r
          join "аренда/договоры" dop on dop.id=r.id2
        where
          ---date_trunc('month', $1) between date_trunc('month', dop."дата1") and (date_trunc('month', d."дата2" + interval '1 month') - interval '1 day') ---только действующие соглашения
          date_trunc('month', $1) >= date_trunc('month', dop."дата1")
        order by date_trunc('month', $1) - date_trunc('month', dop."дата1")--- минимальная разница
        limit 1
      ) dop on dop.id1=d.id***/
      
      left join (
        select r.id1
        from "счета/аренда/помещения" s 
        join refs r  on s.id=r.id2 
        where  s."месяц"=date_trunc('month', $1) --- только счета этого мес
      ) s on d.id=s.id1
    where 
      date_trunc('month', $1) between date_trunc('month', d."дата1") and (date_trunc('month', coalesce(d."дата расторжения", case when d."продление срока" then (now()+interval '1 year')::date else d."дата2" end) + interval '1 month') - interval '1 day') ---только действующие договоры
      and ($2 is null or d.id=any($2))
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
      date_trunc('month', $1) between date_trunc('month', d."дата1") and (date_trunc('month', coalesce(d."дата расторжения", case when d."продление срока" then (now()+interval '1 year')::date else d."дата2" end) + interval '1 month') - interval '1 day') ---только действующие договоры
      and ($2 is null or d.id=any($2))
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

/*************** Много вьюх отдельным файлом *********************/
{%= $st->mt->render_file('lib/Model/Rent.pm.views.sql', {DICT=>$DICT}) %}


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
  p."@кабинеты/json", p."@кабинеты/id", p."@помещение в договоре аренды"
from "аренда/объекты" o
  join refs ro on o.id=ro.id2
  join roles ob on ob.id=ro.id1
  left join (
    select o.id, 
      jsonb_agg(p {%= $order_by_room || ' order by p.id' %}) as "@кабинеты/json",
      array_agg(p.id {%= $order_by_room || ' order by p.id' %}) as "@кабинеты/id",
      array_agg(p."помещение в договоре аренды" {%= $order_by_room || ' order by p.id' %}) as "@помещение в договоре аренды"
    from "аренда/объекты" o
      join "refs" r on o.id=r.id1
      join (
        select distinct p.*, coalesce(dp.id, 0)::boolean as "помещение в договоре аренды"--- проверка
        from
          "аренда/помещения" p 
          left join (--- для проверки удаления строк помещений из объекта
            select p.*, r.id1
            from "аренда/договоры-помещения" p
              join "refs" r on p.id=r.id2
          ) dp on p.id=dp.id1
    ) p on p.id=r.id2
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
  pr.id as "проект/id", ---to_json(pr) as "$проект/json",
  dp.*,
  dp."@кабинеты/id" as "@помещения/id",
  dop."@доп.соглашения/json", dop."@доп.соглашения/id",
  dc."@скидки/json", dc."@скидки/id"
from 
  "аренда/договоры" d
  join refs r on d.id=r.id2
  join "контрагенты" k on k.id=r.id1
  
  left join (---арендодатель
    select pr.*, r.id2
    from "roles" pr
      join refs r on pr.id=r.id1
  ) pr on pr.id2=d.id
  
  left join (--- список помещений
    select dp."договор/id",
      jsonb_agg(dp order by dp.id) as "@помещения/json",
      array_agg(dp."помещение/id" order by dp.id) as "@кабинеты/id",
      array_agg(dp.id  order by dp.id) as "@договоры/помещения/id",
      array_agg(dp."объект/id" order by dp.id) as "@объекты/id",
      sum(dp."площадь помещения") as "площадь помещений",
      sum(dp."оплата за помещение") as "оплата"
    from ---"аренда/договоры" d 
      ---join refs r on d.id=r.id1
      --join (
        ( {%= $dict->render('договоры/помещения') %} ) dp
      --) dp on dp."договор/id"=d.id
    group by "договор/id"--d.id
  ) dp on d.id=dp."договор/id"
  
  left join "аренда/доп.соглашения"/*view*/ dop on d.id=dop."договор/id"
  
  left join (--- скидки
    select
      jsonb_agg(dc order by dc."месяц") as "@скидки/json",
      array_agg(d.id order by dc."месяц") as "@скидки/id",
      d.id as "договор/id"
    from "аренда/договоры" d
      join "refs" r on d.id=r.id1
      join "аренда/договоры/скидки" dc on dc.id=r.id2
    group by d.id
  ) dc on dc."договор/id"=d.id
  
{%= $where || '' %}
{%= $order_by || 'order by d."дата1" desc, d.id desc  ' %}

@@ договоры/помещения
select
  p.id as "помещение/id", row_to_json(p) as "$помещение/json",
  o.id as "аренда/объект/id", row_to_json(o) as "$аренда/объект/json",
  ob.id as "объект/id", row_to_json(ob) as "$объект/json",
  p."площадь" as "площадь помещения",
  coalesce(r."сумма", r."ставка"*p."площадь") as "оплата за помещение",
  r.*,
  d.id as "договор/id"
from 
  "аренда/договоры" d 
  join refs _r on d.id=_r.id1
  join "аренда/договоры-помещения" r on r.id=_r.id2
  join refs r1 on r.id=r1.id2
  join "аренда/помещения" p on p.id=r1.id1
  join refs r2 on p.id=r2.id2
  join "аренда/объекты" o on o.id=r2.id1
  join refs ro on o.id=ro.id2
  join "roles" ob on ob.id=ro.id1
{%= $where || '' %}
{%= $order_by || '' %}
{%= $limit || '' %}

@@ счета и акты
--- за аренду помещений и предоплату для docx
/*WITH param as (
  select *, to_char(d."дата", 'YYYY') as "год", date_trunc('month', d."дата") as "month"
  from (VALUES (1, 'январь'), (2, 'февраль'), (3, 'март'), (4, 'апрель'), (5, 'май'), (6, 'июнь'), (7, 'июль'), (8, 'август'), (9, 'сентябрь'), (10, 'октябрь'), (11, 'ноябрь'), (12, 'декабрь'))
    m(num, "месяц")
  join (VALUES (?::date)) d("дата") on m.num=date_part('month', d."дата")
)*/
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

select {%= $select || '*' %} from (
select
  pr."проект" as "проект",
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
  ---param  join
 (
    select d.*,
      upper(replace(d."номер", '№', '')) as "номер!",
      timestamp_to_json(coalesce(d."дата договора", d."дата1")::timestamp) as "$дата договора",
      timestamp_to_json(d."дата1"::timestamp) as "$дата1",
      timestamp_to_json(d."дата2"::timestamp) as "$дата2"
      ---case when d."дата расторжения" then false when "продление срока" then true else false end as "продлеваемый договор"
      ---case when "продление срока" then (now()+interval '1 year')::date else d."дата2" end 
    from "аренда/договоры" d
  ) d ---on param."month" between date_trunc('month', d."дата1") and (date_trunc('month', coalesce(d."дата расторжения", case when d."продление срока" then (now()+interval '1 year')::date else d."дата2" end) + interval '1 month') - interval '1 day') ---только действующие договоры
  join refs r on d.id=r.id2
  join "контрагенты" k on k.id=r.id1
  
  left join (---арендодатель
    select pr.*, r.id2
    from "контрагенты/проекты"  pr
      join refs r on pr."проект/id"=r.id1
  ) pr on pr.id2=d.id
  
  /*** Waltex/Report.pm.dict.sql ***/
  ---join "движение ДС/аренда/счета" dp on d.id=dp.id and param."month"=date_trunc('month', dp."дата") and dp."примечание"!~'предоплата'
  join /*lateral*/ (
    select 
      dp."договор/id", dp."дата",
      sum(dp."сумма") as "сумма",
      jsonb_agg(dp order by dp."order_by") as "@позиции",
      array_agg(dp."объект/id" order by dp."order_by") as "@объекты/id",
      count(dp) as "всего позиций"
    from (
      select
        dp."договор/id", dp."дата",
        /*-1::numeric**/dp."сумма безнал" as "сумма",
        dp."объект/id", dp."номер доп.согл.",
        not 929979=any(dp."категории") as "order_by",
        case when 929979=any(dp."категории")---ид категории
          then ('{"Обеспечительный платеж"}')::text[]
          ---'||param."месяц"||' '||param."год"||'
          else ('{"Арендная плата за нежилое помещение за ' || m."месяц"|| ' ' || to_char(dp."дата", 'YYYY') ||' г.' || (case when dp."номер доп.согл." is not null then ' (доп. согл. ' || dp."номер доп.согл."::text || ')' else '' end) || '"}')::text[]
        end  as "номенклатура"
      from "движение ДС/аренда/счета" dp
        join  (VALUES (1, 'январь'), (2, 'февраль'), (3, 'март'), (4, 'апрель'), (5, 'май'), (6, 'июнь'), (7, 'июль'), (8, 'август'), (9, 'сентябрь'), (10, 'октябрь'), (11, 'ноябрь'), (12, 'декабрь'))
    m(num, "месяц") on m.num=date_part('month', dp."дата")
       --- join "аренда/договоры" dd on dp.id=dd.id
      where --d.id=dp."договор/id" and param."month"
        date_trunc('month', dp."дата") between date_trunc('month', ?::date) and date_trunc('month', ?::date)+interval '1 month -1 day'
        and not ?::int = any(dp."категории")
        ---and not coalesce(dd."оплата наличкой", false)
    ) dp
    group by dp."договор/id", dp."дата"
  ) dp on d.id=dp."договор/id"
  
  join  "roles" ob on ob.id=dp."@объекты/id"[1]
  
  ---нумерация счетов (может быть отключена)
  left join (
    select n.*, r.id1
    from 
      "refs" r
      join "счета/аренда/помещения" n on n.id=r.id2
  ) num1 on d.id=num1.id1 and num1."месяц"=date_trunc('month', dp."дата")---param."month"
  
  ---нумерация актов (может быть отключена)
  left join (
    select n.*, r.id1
    from 
      "refs" r
      join "акты/аренда/помещения" n on n.id=r.id2
  ) num2 on d.id=num2.id1 and num2."месяц"=date_trunc('month', dp."дата")---param."month"
  
  ---left join num on d.id=num.id1
{%= $where || '' %}
{%= $order_by || 'order by dp."дата", d."дата1" desc, d.id desc  ' %}
) s

@@ счета и акты/доп расходы
---  для docx
WITH param as (
  select *, to_char(param."дата", 'YYYY') as "год", date_trunc('month', param."дата") as "month"
  from (VALUES (1, 'январь'), (2, 'февраль'), (3, 'март'), (4, 'апрель'), (5, 'май'), (6, 'июнь'), (7, 'июль'), (8, 'август'), (9, 'сентябрь'), (10, 'октябрь'), (11, 'ноябрь'), (12, 'декабрь'))
    m(num, "месяц")
  join (VALUES (?::date, ?::int[])) param("дата", "аренда/расходы/id") on m.num=date_part('month', param."дата")
)
---конец with

select {%= $select || '*' %} from (
select
   pr."реквизиты"||to_jsonb(pr) as "$арендодатель", ---as "арендодатель/реквизиты", --- item['арендодатель/реквизиты']
/***
%# {{ (item['$арендодатель'] and item['$арендодатель']['банк'] ) or seller['банк'] }}
%# {{ (item['$арендодатель'] and item['$арендодатель']['БИК']) or seller['БИК'] }}
%# {{ (item['$арендодатель'] and item['$арендодатель']['кор. счет']) or seller['кор. счет'] }}
%# {{ (item['$арендодатель'] and item['$арендодатель']['расч. счет']) or seller['расч. счет'] }}
%# {{ (item['$арендодатель'] and item['$арендодатель']['КПП']) or seller['КПП'] }}
%# {{ (item['$арендодатель'] and item['$арендодатель']['ИНН']) or seller['ИНН'] }}
%# {{ (item['$арендодатель'] and (item['$арендодатель']['полное наименование'] or item['$арендодатель']['наименование'] or item['$арендодатель']['title'] )) or seller['полное наименование'] or seller['наименование'] }}
%# {{  (item['$арендодатель'] and item['$арендодатель']['title']) or seller['наименование'] }}, ИНН {{  (item['$арендодатель'] and item['$арендодатель']['ИНН']) or seller['ИНН'] }}, {{ (item['$арендодатель'] and (item['$арендодатель']['юр. адрес'] or item['$арендодатель']['почт. адрес'] or item['$арендодатель']['адрес'])) or seller['юр. адрес'] or seller['почт. адрес'] or seller['адрес'] }}, тел. {{ (item['$арендодатель'] and item['$арендодатель']['тел'] and item['$арендодатель']['тел'][0]) or (seller['тел'] and seller['тел'][0]) }}
%# {{ (item['$арендодатель'] and item['$арендодатель']['расшифровка подписи']) or seller['расшифровка подписи'] }}
%# {{ (item['$арендодатель'] and (item['$арендодатель']['полное наименование'] or item['$арендодатель']['наименование'] or item['$арендодатель']['title'])) or seller['полное наименование'] or seller['наименование'] }}, ИНН {{ (item['$арендодатель'] and item['$арендодатель']['ИНН']) or seller['ИНН'] }}, {{ (item['$арендодатель'] and (item['$арендодатель']['юр. адрес'] or item['$арендодатель']['почт. адрес'] or item['$арендодатель']['адрес'])) or seller['юр. адрес'] or seller['почт. адрес'] or seller['адрес'] }}, тел. {{ (item['$арендодатель'] and item['$арендодатель']['тел'] and item['$арендодатель']['тел'][0]) or (seller['тел'] and seller['тел'][0]) }}, р/с {{ (item['$арендодатель'] and item['$арендодатель']['расч. счет']) or seller['расч. cчет'] }}, в банке {{ (item['$арендодатель'] and item['$арендодатель']['банк'] ) or seller['банк'] }}, БИК {{ (item['$арендодатель'] and item['$арендодатель']['БИК']) or seller['БИК'] }}, к/с {{ (item['$арендодатель'] and item['$арендодатель']['кор. счет']) or seller['кор. счет'] }}
***/
  coalesce(r."номер", '000')/*(random()*1000)::int*/ as "номер счета",
  r."дата" as "дата счета",
  timestamp_to_json(r."дата"::timestamp) as "$дата счета",
  
  ---coalesce(num2."номер", '000')/*(random()*1000)::int*/ as "номер акта",
  ---coalesce(/*num2.ts*/date_trunc('month', num2."месяц")+interval '1 month'-interval '1 day', /*now()*/null)::date as "дата акта",--- на последнее число мес
  ---timestamp_to_json(coalesce(/*num2.ts*/(date_trunc('month', num2."месяц")+interval '1 month'-interval '1 day')::timestamp, now())) as "$дата акта",--- на последнее число мес
  
  ob.name as "объект",
  row_to_json(d) as "$договор", 
  d."номер!" as "договор/номер",
  d."дата1" as "договор/дата начала",
  coalesce(d."дата расторжения", d."дата2") as "договор/дата завершения",
  row_to_json(k) as "$контрагент",
  k.id as "контрагент/id",
  k.title as "контрагент/title", coalesce(k."реквизиты",'{}'::jsonb)->>'ИНН' as "ИНН",
  pos."сумма", replace(pos."сумма"::numeric::text, '.', ',') as "сумма/num",
  /*** хитрая функция sql/пропись.sql ***/
  firstCap(to_text(pos."сумма"::numeric, 'рубль', scale_mode => 'int')) as "сумма прописью",
  ---ARRAY(select (select to_json(a) from (select ('{"Арендная плата за нежилое помещение за '||param."месяц"||' '||param."год"||' г."}')::text[] as "номенклатура", -1::numeric*dp."сумма" as "сумма" ) a)) as "@позиции",
  pos."@позиции",
  pos."всего позиций"
from
  param,
  (
    select d.*,
      upper(replace(d."номер", '№', '')) as "номер!",
      timestamp_to_json(coalesce(d."дата договора", d."дата1")::timestamp) as "$дата договора",
      timestamp_to_json(d."дата1"::timestamp) as "$дата1",
      timestamp_to_json(d."дата2"::timestamp) as "$дата2"
    from "аренда/договоры" d
  ) d
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
  join "контрагенты/проекты"  pr on pr."проект/id"=_rpr.id1
  
  join (--- позиции
    select 
      "расход/id",
      sum(coalesce(pos."сумма", pos."сумма2")) as "сумма",
      array_agg(row_to_json(pos) order by pos."order_by") as "@позиции",
      count(pos) as "всего позиций"
    from (
      select 
        r.id as "расход/id",
        ---to_json(r) as "$расход/json",
        ---d.id as "договор/id",
        ---to_json(d) as "$договор/json",
        cat.id as "категория/id",
        ---to_json(cat) as "$категория/json",
        ---cat.parents_id||cat.id as "категории",
        ---cat.parents_title[2:]||cat.title as "категория",
        ('{"' || cat.title || ' за '||param."месяц"||' '||param."год"||' г."}')::text[]  as "номенклатура",
        pos.id as "order_by",
        pos.*,
        pos."количество"*pos."цена" as "сумма2"
      from
        param,
        "аренда/расходы" r
        join refs r1 on r.id=r1.id1
        join "аренда/расходы/позиции" pos on pos.id=r1.id2
        join refs rn on pos.id=rn.id2
        join "категории/родители"() cat on cat.id=rn.id1
      where r.id IN (---=any(param."аренда/расходы/id")-- сделать IN unnest
        select id from unnest(param."аренда/расходы/id") un(id)
      )
    ) pos
    group by pos."расход/id"
  ) pos on pos."расход/id"=r.id

where r.id IN (---=any(param."аренда/расходы/id")-- сделать IN unnest
        select id from unnest(param."аренда/расходы/id") un(id)
      )
) a

@@ категории
--- для расходов с ед и ценой
select {%= $select || '*' %} from (
select cat.*, pos.*
from "категории/родители"() cat
left join lateral (
  select to_json(pos) as "$позиция/json"
  from
    "аренда/расходы/позиции" pos
    join refs r on r.id1=cat.id and pos.id=r.id2
  order by pos.id desc
  limit 1
) pos on true
{%= $where || '' %}
{%= $order_by || '' %}
) q

@@ расходы/join
  "аренда/договоры" d
  join refs _r on d.id=_r.id2
  join "контрагенты" k on k.id=_r.id1
  
  --- по объекту (одна строка из арендованных помещений)
  ---join refs _rp on d.id=_rp.id1
  left join (
    select dp."договор/id",
      ---jsonb_agg(dp order by dp.id) as "@помещения/json",
      ---array_agg(dp."помещение/id" order by dp.id) as "@кабинеты/id",
      ---array_agg(dp.id  order by dp.id) as "@договоры/помещения/id",
      array_agg(dp."$объект/json"  order by dp.id) as "@объекты/json",
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
  
  join refs _rr on d.id=_rr.id1
  join "аренда/расходы" r on r.id=_rr.id2
  
  join refs _rp on r.id=_rp.id2
  join "roles" pr on pr.id=_rp.id1
  --~ join (
    --~ select distinct id, name, descr, disable
    --~ from "проекты"
  --~ ) pr on pr.id=_rp.id1
  
  left join (
    select pos."расход/id",
      jsonb_agg(pos order by pos.id) as "@позиции/json",
      array_agg(pos.id  order by pos.id) as "@позиции/id",
      sum(coalesce(pos."сумма", pos."сумма2")) as "сумма"
      
    from ---"аренда/расходы" r
      ---join refs _r on r.id=_r.id1
      (
        {%= $dict->render('расходы/позиции') %}
      ) pos ----on pos."расход/id"=_r.id2
    group by pos."расход/id"
  ) pos on r.id=pos."расход/id"


@@ расходы
select {%= $select || '*' %} from (
select 
  to_json(d) as "$договор/json",
  d.id as "договор/id",
  to_json(k) as "$контрагент/json",
  k.id as "контрагент/id",
  dp."@объекты/id"[1] as "объект/id", dp."@объекты/json"[1] as "$объект/json",
  pr.id as "проект/id",
  r.*,
  timestamp_to_json(r."дата"::timestamp) as "$дата/json",
  pos.*--- позиции сгруппированы
from 
{%= $DICT->render('расходы/join') %}
{%= $where || '' %}
{%= $order_by || '' %} ---order by d."дата1" desc, d.id desc  
) q

@@ расходы/позиции
select 
  r.id as "расход/id",
  ---to_json(r) as "$расход/json",
  d.id as "договор/id",
  ---to_json(d) as "$договор/json",
  cat.id as "категория/id",
  to_json(cat) as "$категория/json",
  pos.*,
  pos."количество"*pos."цена" as "сумма2"
from "аренда/расходы" r
  join refs r1 on r.id=r1.id1
  join "аренда/расходы/позиции" pos on pos.id=r1.id2
  join refs rn on pos.id=rn.id2
  join "категории/родители"() cat on cat.id=rn.id1
  join refs r2 on r.id=r2.id2
  join "аренда/договоры" d on d.id=r2.id1
  ---join refs ro on o.id=ro.id2
  ---join "roles" ob on ob.id=ro.id1
{%= $where || '' %}
{%= $order_by || '' %}

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
import os.path
%#os.path.exists(file_path)
%#os.path.isfile(file_path)
tpl=DocxTemplate(u'{%= $docx_template_file %}')
%#logo=InlineImage(tpl, u'''{%= $logo_image %}''', width=Mm(70)) if u'''{%= $logo_image %}''' else ''
%#sign_image=InlineImage(tpl, u'''{%= $sign_image %}''', width=Mm(40)) if u'''{%= $sign_image %}''' else ''
undefined = ''
true = ''
false = ''
null = ''
seller={}# %= $seller %
sign_images={}
if seller.get('id') and os.path.exists('static/i/logo/sign-'+str(seller.get('id'))+'.png'):
    sign_images[str(seller.get('id'))]=InlineImage(tpl, 'static/i/logo/sign-'+str(seller.get('id'))+'.png', width=Mm(40))

%#'top_details': [{%= $top_details %}], # 
items={%= $data %}

for it in items:
    if it.get('$арендодатель') and not sign_images.get(str(it['$арендодатель']['id'])):
        file_path='static/i/logo/sign-'+str(it['$арендодатель']['id'])+'.png'
        if os.path.exists(file_path):
          sign_images[str(it['$арендодатель']['id'])]=InlineImage(tpl, file_path, width=Mm(40))

context = {
    'items' : items,
    'seller': seller,
    'sign_images': sign_images,
    'str':str,
}



tpl.render(context)
tpl.save(u'{%= $docx_out_file %}')


