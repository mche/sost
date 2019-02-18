@@ таблицы
create table IF NOT EXISTS "{%= $schema %}"."транспорт" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int not null,
  "title" varchar not null,
  "descr" text null
/* связи:
id1("категории")->id2("транспорт")
id1("контрагенты")->id2("транспорт") --- перевозчик
id1("транспорт")->id2("транспорт/заявки")
*/
);

create table IF NOT EXISTS "{%= $schema %}"."транспорт/заявки" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int not null,
  "номер" text, --- select nextval(' "public"."транспорт/заявки/номер" ')::text;
  "дата1" date not null, -- начало
  "время1" text, --- время загрузки alter table "транспорт/заявки" add column "время1" text;
  "дата2" date null, --  завершение факт
  "дата3" date null, --  завершение план
  "время3" text, --- время выгрузки alter table "транспорт/заявки" add column "время3" text;
---  "дата3" timestamp without time zone, --- когда фактически отработана/закрыта заявка
  "контрагенты" int[], --- массив связей(id1(контрагент)-id2(заявка)): 1эл-т - ид связи с перевозчиком; 2эл-т - ид связи с заказчиком/ГП; 3эл-т - ид связи с посредником (если есть) 4эл - ид связи с грузоотправителем
  "заказчики" int[], --- вынес из "контрагенты"[2] (их может много), тоже массив связей ид1("контрагенты")-ид2("транспорт/заявки")
  "грузоотправители" int[], --- вынес из "контрагенты"[4] (их может много), тоже массив связей ид1("контрагенты")-ид2("транспорт/заявки")
  "откуда" jsonb,  -- 2-х уровневый масив
  "куда" jsonb, --- 
  "маршрут на круг" boolean, --- с обратом
  "груз" text, 
  "водитель" text[], -- имя, тел, паспорт
  "контакты" text[], --- порядок соотв массиву "контрагенты"
  "контакты заказчиков" text[], --- вынес из "контакты"(соотв массиву "заказчики")
  "контакты грузоотправителей" text[], --- вынес из "контакты"(соотв массиву "грузоотправители")
  ---"контакт1" text[], -- контактное лицо(имя, тел) перевозчика
  ---"контакт2" text[], -- контактное лицо(имя, тел) заказчика/ГП
  ---"контакт3" text[], -- контактное лицо(имя, тел) последника(если есть)
  ---"контакт4" text[], -- контактное лицо(имя, тел) грузоотправителя(если есть)
  "директор1" text[], -- перевозчик в лице руководителя
  "стоимость" money,  --- деньги перевозчику
  "стоимость/с НДС" boolean, --- alter table "транспорт/заявки" add column "стоимость/с НДС" boolean;
  "стоимость/оплата" oplata, --- CREATE TYPE oplata AS ENUM ('безнал', 'наличка', 'карта'); alter table "транспорт/заявки" add column "стоимость/оплата" oplata;
  ---"сумма/посредник-ГП" money, --- если есть посредник, то это сумма его сделки с ГП
  "сумма/посреднику" money[], --- от заказчиков, соотв позиции массива "заказчики"
  "тип стоимости" int, --- 0 - вся сумма, 1- за час, 2 - за км
  "факт" numeric, --- часов или км
  --- сумма="стоимость"*(coalesce("факт",1)^"тип стоимости"::boolean::int)
  "дата получения док" date, --- фактическая дата 
  "дата оплаты по договору" date, --- планикуемая для контроля оплат
  "дата оплаты" date, --- фактический приход денег по заявке
  "док оплаты" text, -- номер: счет/фактура
  "коммент" text, 
  "отозвать" boolean, -- отмена
  "снабженец" int, --- создал заявку (id профиля)
  "с объекта" int, --- перемещение c объекта-промежуточной базы 
  "на объект" int, --- доставка сначала на промежуточную базу
  "без транспорта" boolean --- крыжик для формы снабжения, когда ТМЦ везет сам поставщик (такие заявки не показывать транспортному отделу)
/* связи:
id1("объекты")->id2("транспорт/заявки") --- куда если на наш объект (внутренний получатель)
--- убрал ---id1("проекты")->id2("транспорт/заявки") --- если наш получатель и не объект
id1("контрагенты")->id2("транспорт/заявки") --- таких связей несколько (2 или 3): связи с перевозчиком, заказчиком, посредником(если есть). ИДы этих связей в поле-массиве "контрагенты" 
--- убрал! см поле "контрагенты"!  id1("транспорт/заявки")->id2("контрагенты") ---  получатель/заказчик

id1("транспорт")->id2("транспорт/заявки") --- конкретно транспорт
id1("транспорт/заявки")->id2("транспорт") --- если сцепка тягач-прицеп (прицеп остается в прямой связи как обычный транспорт, а тягач будет в обратной связи)
id1("профили")->id2("транспорт/заявки") --- водитель если своя машина
id1("категории")->id2("транспорт/заявки") --- если еще не указан транспорт (после установки транспорта категория тут разрывается - сам транспорт связан с категорией)
*/
);

create index IF NOT EXISTS "idx/транспорт/заявки/дата" on "транспорт/заявки" ("дата1");

create table IF NOT EXISTS "{%= $schema %}"."разное" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int not null,--- чья запись
  key text not null,--- типа "черновик заявки на транспорт"
  val jsonb not null
/*
связей нет
----------id1("профили")->id2("разное") 

*/
);
create index IF NOT EXISTS "idx/разное/лkey" on "{%= $schema %}"."разное" ("key");

/*
update "транспорт/заявки" z
set "куда"=u.upd
from (
  select z.id, '{"'||coalesce('#'||o.id::text, "куда")||'"}' as upd
  from "транспорт/заявки" z
    left join (
      select o.*, r.id2
      from "объекты" o
        join refs r on  o.id=r.id1
    ) o on z.id=o.id2
) u
where z.id=u.id;

alter table "транспорт/заявки" alter column "куда" type text[] USING "куда"::text[];

update "транспорт/заявки" z
set "откуда"=u.upd
from (
  select z.id, '{"'||"откуда"||'"}' as upd
  from "транспорт/заявки" z
) u
where z.id=u.id;

---alter table "транспорт/заявки" add column "куда2" type text[];
alter table "транспорт/заявки" alter column "куда" type jsonb using array_to_json(array["куда"]);
alter table "транспорт/заявки" alter column "откуда" type jsonb using array_to_json(array["откуда"]);


alter table "транспорт/заявки" alter column "откуда" type text[] USING "откуда"::text[];

update "транспорт/заявки" z
set "водитель"=u.upd
from (
  select z.id, '{"'||"водитель"||'"}' as upd
  from "транспорт/заявки" z
) u
where z.id=u.id;

alter table "транспорт/заявки" alter column "водитель" type text[] USING "водитель"::text[];

alter table "транспорт/заявки" add column "контакт1" text[]; --- контактное лицо и телефон перевозчика
alter table "транспорт/заявки" add column "контакт2" text[]; --- контактное лицо и телефон заказчика

alter table "транспорт/заявки" add column "контакт3" text[]; --- контактное лицо и телефон посредника(наша контора - трансп отдел)
alter table "транспорт/заявки" add column "контакт4" text[]; -- контактное лицо(имя, тел) грузоотправителя(если есть)
alter table "транспорт/заявки" add column "сумма/посредник-ГП" money; --- а поле "стоимость" - между перевозчиком
alter table "транспорт/заявки" add column "контрагенты" int[]; --- см выше в create table
alter table "транспорт/заявки" add column "дата3" date; --- завершение план

alter table "транспорт/заявки" add column "дата получения док" date; --- фактическая дата 
alter table "транспорт/заявки" add column "дата оплаты по договору" date; --- планикуемая для контроля оплат

alter table "транспорт/заявки" add column "контакты" text[]; --- контактные лица порядок соотв массиву "контрагенты"
update "транспорт/заявки" z
  set "контакты"=array["контакт1", "контакт2", coalesce("контакт3", array[null, null]), coalesce("контакт4", array[null, null])]
;

--- массив связей с контрагентами
update "транспорт/заявки" z
set "контрагенты"=u."связи"
from (
select tz.id, con1.id as "перевозчик/id", con2.id as "заказчик/id", array[con1.id_ref, con2.id_ref] as "связи"
from "транспорт/заявки" tz
  left join (-- перевозчик
    select con.*, r.id2, r.id as id_ref
    from refs r
      join "контрагенты" con on con.id=r.id1
  ) con1 on tz.id=con1.id2
  
  left join (-- заказчик
    select con.*,  r.id1, r.id as id_ref
    from refs r
      join "контрагенты" con on con.id=r.id2
  ) con2 on tz.id=con2.id1
) u
where z.id=u.id
;

--- перевернуть связь заявка-заказчик
update refs r
set id1=u."заказчик/id",
  id2=u.tz_id
from (
select tz.id as tz_id, con2.id as "заказчик/id", con2.id_ref----, array[con1.id_ref, con2.id_ref] as "связи"
from "транспорт/заявки" tz
  join (-- заказчик
    select con.*,  r.id1, r.id as id_ref
    from refs r
      join "контрагенты" con on con.id=r.id2
  ) con2 on tz.id=con2.id1
) u
where r.id=u.id_ref
;

---- прочие поля для печатной формы
CREATE SEQUENCE "public"."транспорт/заявки/номер";
ALTER TABLE "транспорт/заявки" add column "номер" int; --- select nextval(' "public"."транспорт/заявки/номер" ')::text;
ALTER TABLE "транспорт/заявки" alter column "номер" type text;
---alter table "транспорт/заявки" add "транспорт/заявки/уник-номер-год" unique("номер", date_part('year', "дата1"));
CREATE UNIQUE INDEX "транспорт/заявки/уник-номер-год_дата1" ON "транспорт/заявки" ( "номер", date_part('year', "дата1") );


alter table "транспорт/заявки" add column "маршрут на круг" boolean;
alter table "транспорт/заявки" add column "отозвать" boolean;

alter table "транспорт/заявки" add column "заказчики" int[]; --- вынес из "контрагенты"(их может много), тоже массив связей ид1("контрагенты")-ид2("транспорт/заявки")
update "транспорт/заявки"
set "заказчики" = array["контрагенты"[2]];

alter table "транспорт/заявки" add column "грузоотправители" int[]; --- вынес из "контрагенты"(их может много), тоже массив связей ид1("контрагенты")-ид2("транспорт/заявки")
update "транспорт/заявки"
set "грузоотправители" = array["контрагенты"[4]];

alter table "транспорт/заявки" add column "контакты заказчиков" text[]; --- вынес из "контакты"(соотв массиву "заказчики")
update "транспорт/заявки"
set "контакты заказчиков" = "контакты"[2:2];

alter table "транспорт/заявки" add column "контакты грузоотправителей" text[]; --- вынес из "контакты"(соотв массиву "грузоотправители")
update "транспорт/заявки"
set "контакты грузоотправителей" = "контакты"[4:4];

alter table "транспорт/заявки" add column "сумма/посреднику" money[];
update "транспорт/заявки"
set "сумма/посреднику" = array["сумма/посредник-ГП"];

alter table "транспорт/заявки" add column "снабженец" int; --- создал заявку

alter table "транспорт/заявки" add column "на объект" int; --- (ид связи) доставка на объект через промежуточные базы
alter table "транспорт/заявки" add column "с объекта" int; --- (ид связи) доставка на объект через промежуточные базы
alter table "транспорт/заявки" add column "без транспорта" boolean; --- выше
CREATE INDEX "трансп/заявки-без трансп-null" ON "транспорт/заявки"("без транспорта") WHERE "без транспорта" IS NULL;

--- заново нумерацию заявок с начала года
alter sequence "транспорт/заявки/номер" restart 1;

update "транспорт/заявки" set "номер"=s.x
from (
  select id, nextval(' "public"."транспорт/заявки/номер" ') as x
  from "транспорт/заявки"
  where ts>'2017-12-31' and "номер" is not null
  order by "номер"
) as s 
where "транспорт/заявки".id=s.id;


--- Гарантия тоже в наш транспорт
insert into refs (id1, id2)
select distinct unnest(array[1393, 10883, 971]), t.id
from "транспорт" t
  join refs r on t.id=r.id2
where r.id1=any(array[1393, 10883, 971])
on conflict DO NOTHING
;

*/

---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "полный формат даты"(date) RETURNS text AS $$ 
  select array_to_string(array[
    ---to_char($1, 'TMdy') || ',',
    regexp_replace(to_char($1, 'DD'), '^0', ''),
    ---to_char($1, 'TMmon'),
    m.name,
    to_char($1, 'YYYY')
  ]::text[], ' ')
  from (VALUES ('01', 'января'),  ('02', 'февраля'), ('03', 'марта'), ('04', 'апреля'), ('05', 'мая'), ('06', 'июня'), ('07', 'июля'), ('08', 'августа'), ('09', 'сентября'), ('10', 'октября'), ('11', 'ноября'), ('12', 'декабря')) as m (id, name)
  where m.id=to_char($1, 'MM')
  ;
$$ LANGUAGE SQL IMMUTABLE STRICT;

-------------------------------------------------------------------
DROP VIEW IF EXISTS "водители";
CREATE OR REPLACE VIEW "водители" AS
select p.*, d.name as "должность", d.id as "должность/id"
from "должности" d
  join refs r on d.id=r.id1
  join "профили" p on p.id=r.id2
where d.name = any(array['Водитель', 'Водитель КДМ', 'Машинист автокрана', 'Машинист экскаватора', 'Машинист катка', 'Машинист экскаватора-погрузчика'])
;
--------------

@@ 123
/*
CREATE OR REPLACE FUNCTION "транспорт/заявки/куда-адр-об"(text)
RETURNS table("id" int, "адрес" text, "проект/id" int, "проект" text, "объект/id" int, "объект" text) AS $func$ 
--- select "транспорт/заявки/куда-адр-об"('{"dsfds\ dsgfdg", "объект#3406"}');
/*преобразовать текст полей КУДА адресов-объектов в массив и прицепить объекты(если строки вида объект#3406)*/
select a.*,  po.*
from (
select case when un ~ '^объект#' then regexp_replace(un, '^объект#', '')::int else null end as id, un as "адрес"
  from (select unnest($1::text[]) as un) un
) a
left join "проекты/объекты" po on po."объект/id"=a.id
;
$func$ LANGUAGE SQL; --- IMMUTABLE STRICT;
*/

@@ список или позиция транспорта
select {%= $select || '*' %} from (select t.*, ----(case when con.id is null then '★' else '' end) || t.title as title2,
  cat.id as "категория/id", cat.parents_name || cat.name::varchar as "категории", cat.parents_id as "категории/id",
  k.*,
  k."проект/id"[1]::boolean as "наш транспорт",
  v.id as "водитель/id", v.names as "водитель-профиль",  v."водитель"
from "транспорт" t
  join refs r on t.id=r.id2
  join "roles/родители"() cat on cat.id=r.id1
  
  left join /*lateral*/ (-- перевозчик
    select t.id as "транспорт/id",
      array_agg(k.id) as  "перевозчик/id", array_agg(k.title) as "перевозчик", array_agg(p.id) as "проект/id", array_agg(p.name) as "проект"
    from 
      "транспорт" t
      join refs rk on t.id=rk.id2
      join "контрагенты" k on k.id=rk.id1 
      left join (-- может проект
        select distinct p.id, name, p.descr, p.disable, /***p."контрагент/id",***/
          k.id as "контрагенты/id"
        from
          "контрагенты" k
          join refs r on k.id=r.id2
          join "проекты" p on p.id=r.id1
      ) p on k.id=p."контрагенты/id"
    ---where rk.id2=t.id
    group by t.id -- rk.id2
  ) k on t.id=k."транспорт/id"

  
  left join /*lateral*/ ( -- водитель по последней заявке 
    select p.id, p.names, z."водитель", t.id as "транспорт/id"
    from 
      "транспорт" t
      join refs r on t.id=r.id1-- на транспорт
      join "транспорт/заявки" z on z.id=r.id2
      left join (
        select p.*, r.id2
        from  refs r
          join "профили" p on p.id=r.id1
      ) p on p.id2 = z.id
    where 
      (p.names is not null or z."водитель" is not null)
    order by z."дата1" desc
    limit 1
  ) v on t.id=v."транспорт/id"
where 
----cat.parents_id[1]=3
  (coalesce(?::int, 0)=0 or t.id=?)
  and (coalesce(?::int, 0)=0 or ?::int=any(cat.parents_id || cat.id))
  and (coalesce(?::int, 0)=0 or ?=any(k."перевозчик/id"))
) t
;

@@ заявки/список или позиция?cached=1
select {%= $select || '*' %} from (
select tz.*,
  timestamp_to_json(tz."ts") as "$дата заявки/json",
  tz."откуда" as "$откуда/json", tz."куда" as "$куда/json",
  ask_seq.last_value as "последний номер",
  "полный формат даты"(tz.ts::date) as "дата заявки формат",
  ----"формат даты"(tz.ts::date) as "дата заявки формат списка",
  array_to_string(array[ to_char(tz.ts, 'DD'), to_char(tz.ts, 'MM'),  to_char(tz.ts, 'YY')]::text[], '.') as "дата заявки краткий формат",
  "формат даты"(tz."дата1") as "дата1 формат",
  timestamp_to_json(tz."дата1"::timestamp) as "$дата1/json",
  array_to_string(array[ to_char(tz."дата1", 'DD'), to_char(tz."дата1", 'MM'),  to_char(tz."дата1", 'YYYY')]::text[], '.') as "дата1 краткий формат",
  "формат даты"(tz."дата2") as "дата2 формат",
  timestamp_to_json(tz."дата2"::timestamp) as "$дата2/json",
   "формат даты"(tz."дата3") as "дата3 формат",
   timestamp_to_json(tz."дата3"::timestamp) as "$дата3/json",
  array_to_string(array[ to_char(tz."дата2", 'DD'), to_char(tz."дата2", 'MM'),  to_char(tz."дата2", 'YYYY')]::text[], '.') as "дата2 краткий формат",
  array_to_string(array[ to_char(tz."дата3", 'DD'), to_char(tz."дата3", 'MM'),  to_char(tz."дата3", 'YYYY')]::text[], '.') as "дата3 краткий формат",
  tz."стоимость"*(coalesce(tz."факт",1::numeric)^coalesce(tz."тип стоимости"::boolean::int, 1::int)) as "сумма",

  ka."@контрагенты/id",
  ka."@контрагенты/id"[1] as "перевозчик/id",
  ka."@контрагенты/id"[3] as "посредник/id",
  k_zak."@заказчики/id",
  --k_zak."@заказчики/json",
  k_go."@грузоотправители/id",
  ---k_go."@грузоотправители/json",
  ---con.*, --- разные контрагенты отдельно
  
  tr.id as "транспорт/id", tr.title as "транспорт",---(case when tr.id is null then '★' else '' end) || 
  coalesce(tr."категория/id", cat.id) as "категория/id", ---- coalesce(tr."категории", cat."категории") as "категории", coalesce(tr."категории/id", cat."категории/id") as "категории/id",
  ---cat.id as "категория/id", cat."категории", cat."категории/id",
  tr1.id as "транспорт1/id", tr1.title as "транспорт1", -- тягач может
  v.id as "водитель-профиль/id", v.names as "водитель-профиль", tz."водитель",
  
  ---row_to_json(snab) as "$снабженец/json",
  ---tmc."позиции тмц/id", tmc."@позиции тмц/json", tmc."позиции тмц/объекты/id", tmc."позиции заявок/id",  ----tmc."$позиции заявок/json", 
  ---o1."json" as "$с объекта/json", o1."id" as "с объекта/id",
  ---o2."json" as "$на объект/json", o2."id" as "на объект/id",
  ---array[o1.id, o2.id] as "базы/id",
  ro1."id1" as "с объекта/id",
  ro2."id1" as "на объект/id",
  
% if ($join_tmc) {
  tmc.*,
%}

  row_to_json(tzp) as "$логистик/json",
  row_to_json(tzs) as "$снабженец/json"
  
from "транспорт/заявки" tz
  left join "профили" tzp on tz.uid=tzp.id
  left join "профили" tzs on tz."снабженец"=tzs.id
  join "public"."транспорт/заявки/номер" ask_seq on true
  
  left join lateral (-- все контрагенты (без заказчиков и грузотправителей) иды (перевести связи в ид контрагента)
    select /*r.id2,*/ array_agg(r.id1 order by un.idx) as "@контрагенты/id" ---array_agg(row_to_json(k) order by un.idx) as "все контрагенты"
    from unnest(tz."контрагенты") WITH ORDINALITY as un(id, idx)
      left join refs r on un.id=r.id
      ---join "контрагенты" k on k.id=r.id1
    ---where r.id2=tz.id
    ----group by r.id2
  ) ka on true ---ka.id2=tz.id
  
  
  left join lateral (-- все заказчики (как json)
    select array_agg(r.id1 order by un.idx) as "@заказчики/id"----, array_agg(row_to_json(k) order by un.idx) as "@заказчики/json"
    from unnest(tz."заказчики") WITH ORDINALITY as un(id, idx)
      join refs r on un.id=r.id
      ---join "контрагенты" k on k.id=r.id1
    ---where r.id2=tz.id
    ---group by r.id2
  ) k_zak on true ---k_zak.id2=tz.id
  
  left join lateral (-- все грузоотправители иды (перевести связи в ид контрагента)
    select array_agg(r.id1 order by un.idx) as "@грузоотправители/id"---,  array_agg(row_to_json(k) order by un.idx) as "@грузоотправители/json"
    from unnest(tz."грузоотправители") WITH ORDINALITY as un(id, idx)
      join refs r on un.id=r.id
      ---join "контрагенты" k on k.id=r.id1
    ---where r.id2=tz.id
    ---group by r.id2
  ) k_go on true---k_go.id2=tz.id
  

  {%= $join_transport // 'left' %} join /*lateral*/ (--- транспорт с категорией и !не перевозчиком!
    select tr.*,
      ----cat.id as "категория/id", cat.parents_name || cat.name::varchar as "категории", cat.parents_id as "категории/id",
      c.id as "категория/id",
      tz.id as "транспорт/заявки/id"
      ---con.id as "перевозчик/id", con.title as "перевозчик",
      ---p.id as "проект/id", p.name as "проект"
    from 
      "транспорт/заявки" tz
      join refs r on tz.id=r.id2
      join "транспорт" tr on tr.id=r.id1
      join refs rcat on tr.id=rcat.id2
      join "roles" c on c.id=rcat.id1
    where r.id2=tz.id ----and cat.parents_id[1] = 36668
  ) tr on tz.id=tr."транспорт/заявки/id"
  
  left join /*lateral*/ (--- тягач для прицепов (обратная связь) без категории
    select tr.*, tz.id as "транспорт/заявки/id"
    from 
      "транспорт" tr
      join refs r on tr.id=r.id2
      join "транспорт/заявки" tz on tz.id=r.id1
    where r.id1=tz.id
  ) tr1 on tz.id=tr1."транспорт/заявки/id"
  
  left join /*lateral*/ (-- категория без транспорта
    select ---distinct cat.*, cat.parents_name || cat.name::varchar as "категории", cat.parents_id as "категории/id"
      cat.id, tz.id as "транспорт/заявки/id"
    from 
      ---"roles/родители"() cat
      "roles" cat
      join refs r on  cat.id=r.id1 ----and r.id2=tz.id
      join "транспорт/заявки" tz on tz.id=r.id2
    ----where r.id2=tz.id--- категория по заявке
    ---cat.parents_id[1] = 36668
      ----and cat.id=any(array[r.id1, tr."категория/id"]::int[]) --- категория по транспорту тоже
  
  ) cat on tz.id=cat."транспорт/заявки/id" ---  any(array[cat.tz_id, ])

  left join /*lateral*/ (-- водитель на заявке
  select p.*, tz.id as "транспорт/заявки/id"
    from 
      "транспорт/заявки" tz
      join refs r on tz.id=r.id2
      join "профили" p on p.id=r.id1
    ---where r.id2=tz.id
  ) v on tz.id=v."транспорт/заявки/id"
  
  left join refs ro1 on tz."с объекта"=ro1.id
  left join refs ro2 on tz."на объект"=ro2.id
  
% if ($join_tmc) {
  join (
    {%= $st->dict->render('тмц', where=>$where_tmc) %}--- select=>$select_tmc || '*',
  ) tmc on tmc."транспорт/заявка/id"=tz.id
   
%}

where (coalesce(?::int[], '{0}'::int[])='{0}'::int[] or tz.id=any(?::int[])) -----транспорт/заявки/id
) t
{%= $where || '' %}
{%= $order_by || '' %} --- менять порядок для разных табов-списков
{%= $limit_offset || '' %}
;

@@ тмц
 --- привязанные позиции тмц
select
  "транспорт/заявка/id",
  array_agg(t.id order by t.id) as "позиции тмц/id",
--    array_agg(row_to_json(t) order by t.id) as "@позиции тмц/json",
  jsonb_agg(t order by t.id) as "@позиции тмц/json",
  array_agg("объект/id" order by t.id) as "позиции тмц/объекты/id"  --- для фильтрации по объекту
  ---array_agg("номенклатура/id" order by t.id) as "позиции тмц/номенклатура/id"  --- для фильтрации 
from (
  select t.*,
    timestamp_to_json(t."ts") as "$ts/json",
    tz.id as "транспорт/заявка/id",
    z.id as "тмц/заявка/id",
    row_to_json(z) as "$тмц/заявка/json",
    case when z.id is null then true else false end as "без заявки",
    coalesce(z."объект/id", ot.id) as "объект/id",
    z."объект/id" as "тмц/заявка/объект/id",
    ot.id as "тмц/объект/id",
    coalesce(z."$объект/json", ot."$объект/json") as "$объект/json",
    coalesce(z."номенклатура/id", n.id) as "номенклатура/id",
    coalesce(z."номенклатура", n."номенклатура") as "номенклатура",
    t."количество"*t."цена" as "сумма",
    k.id as "контрагент/id", row_to_json(k) as "$контрагент/json",--- если простая поставка поставщик
    z."$профиль заказчика/json",
    timestamp_to_json(t."дата/принято"::timestamp) as "$дата/принято/json",
    EXTRACT(epoch FROM now()-t."дата/принято")/3600 as "дата/принято/часов",
    ro1.id1 as "с объекта/id", ro2.id1 as "на объект/id",
    row_to_json(pp) as "$принял/json"
    
    ----
  from
    "транспорт/заявки" tz
    join refs rt on tz.id=rt.id2
    join "тмц" t on t.id=rt.id1
    ---join refs rz on t.id=rz.id2
     
    left join (---номенклатура и объект если по заявке
      select
        z.*,
        timestamp_to_json(z."дата1"::timestamp) as "$дата1/json",
        row_to_json(p) as "$профиль заказчика/json",
        o.id as "объект/id", /***o.name as "объект",***/ row_to_json(o) as "$объект/json",
        n.id as "номенклатура/id", "номенклатура/родители узла/title"(n.id, true) as "номенклатура",
        t.id as "тмц/id"
      from
        "тмц" t
        join refs r on t.id=r.id2
        join "тмц/заявки" z on z.id=r.id1 --- связь с тмц-строкой
        join "профили" p on z.uid=p.id
        
        left join (
          select n.*, rn.id2
          from refs rn ---on z.id=rn.id2
          join "номенклатура" n on rn.id1=n.id
        ) n on z.id=n.id2
        
        join refs ro on z.id=ro.id2
        join "объекты" o on ro.id1=o.id
    ) z on t.id=z."тмц/id"
   
   left join (---номенклатура если без заявки
      select n.*, 
      "номенклатура/родители узла/title"(n.id, true) as "номенклатура",
      t.id as "тмц/id"
      from
        "тмц" t
        join refs r on t.id=r.id2
        join "номенклатура" n on n.id=r.id1
   ) n on t.id=n."тмц/id"      /***coalesce(t."простая поставка", false)=false and***/
   
   left join (---объект если без заявки
    select o.*,
      row_to_json(o) as "$объект/json",
      t.id as "тмц/id"
    from 
      "тмц" t 
      join refs r on t.id=r.id2
      join "объекты" o on r.id1=o.id
   ) ot on t.id=ot."тмц/id" /***coalesce(t."простая поставка", false)=false and***/
   
   left join (--- если простая поставка: поставщик
      select k.*, t.id as "тмц/id"
      from 
        "тмц" t 
        join refs r on t.id=r.id2
        join "контрагенты" k on k.id=r.id1
    ) k on t.id=k."тмц/id"
    
    left join refs ro1 on tz."с объекта"=ro1.id
    left join refs ro2 on tz."на объект"=ro2.id
    
    left join "профили" pp on t."принял"=pp.id
  
  ) t
{%= $where || '' %}
group by "транспорт/заявка/id"


@@ заявки/адреса/откуда
-- откуда (без объектов)
select {%= $select || '*' %}
from (
  select k.id as "контрагент/id", jsonb_array_elements_text(j."addr") as "адрес"
  from "транспорт/заявки" tz
    join jsonb_array_elements(tz."откуда") as j ("addr") on true
    join refs r on tz.id=r.id2
    join "контрагенты" k on k.id=r.id1
  where tz."откуда" is not null
    and (r.id=any(tz."заказчики") or r.id=any(tz."грузоотправители"))---tz."контрагенты"[2] -- заказчик
    and ((coalesce(?::int[], array[0]))[1]=0 or k.id=any(?))
) tz
where not "адрес" ~ '^#\d+'
{%= $group_by || '' %}

@@ заявки/адреса/куда
-- куда  (без объектов)
select {%= $select || '*' %}
from (
  select k.id as "контрагент/id", jsonb_array_elements_text(j."addr") as "адрес"
  from "транспорт/заявки" tz
    join jsonb_array_elements(tz."куда") as j ("addr") on true
    join refs r on tz.id=r.id2
    join "контрагенты" k on k.id=r.id1
  where tz."куда" is not null
    and (r.id=any(tz."заказчики") or r.id=any(tz."грузоотправители"))---tz."контрагенты"[2] -- заказчик
    and ((coalesce(?::int[], array[0]))[1]=0 or k.id=any(?))
) tz
where not "адрес" ~ '^#\d+'
{%= $group_by || '' %}

@@ заявки/адреса
-- куда и откуда (без объектов)
select "адрес" as name, count(*) as cnt
from (

{%= $st->dict->render('заявки/адреса/откуда') %}
union
{%= $st->dict->render('заявки/адреса/куда') %}

) u
group by "адрес"
;

@@ водители
-- наши
select {%= $select || '*' %} from (select v.*, tz."водитель"[2] as phone, tz."водитель"[3] as doc -- паспорт
from "водители" v 
  left join lateral (-- доп поля из заявок
    select tz."водитель", max(tz.id) as max_id
    from "транспорт/заявки" tz
      join refs r on tz.id=r.id2
    where r.id1=v.id and (tz."водитель" is not null and (tz."водитель"[2] is not null or tz."водитель"[3] is not null) )
    group by tz."водитель"
  
  ) tz on true
order by v.names, tz.max_id desc
) v
;

@@ заявки/водители
select distinct tz."водитель"[1] as title,  tz."водитель"[2] as phone, tz."водитель"[3] as doc -- паспорт
from "транспорт" t
  join refs rk on t.id=rk.id2
  join "контрагенты" k on k.id=rk.id1 -- перевозчик
  
  join refs rz on t.id=rz.id1
  join "транспорт/заявки" tz on tz.id=rz.id2

where tz."водитель" is not null
  and tz."водитель"[1] is not null
  and coalesce(k.id, 0)=?
;

@@ заявки/контакты
--- не важно все типы контрагентов
select distinct "контакты"[1][1] as title,  coalesce("контакты"[1][2], '') as phone
from (
select tz."контакты"[un.idx\:un.idx]
from "транспорт/заявки" tz,
  unnest(tz."контрагенты")  WITH ORDINALITY as un(id, idx),
  refs r
where un.id=r.id and tz.id=r.id2 and r.id1=? -- ид КА

union 

select tz."контакты заказчиков"[un.idx\:un.idx]
from "транспорт/заявки" tz,
  unnest(tz."заказчики")  WITH ORDINALITY as un(id, idx),
  refs r
where un.id=r.id and tz.id=r.id2 and r.id1=? -- ид КА

union 

select tz."контакты грузоотправителей"[un.idx\:un.idx]
from "транспорт/заявки" tz,
  unnest(tz."грузоотправители")  WITH ORDINALITY as un(id, idx),
  refs r
where un.id=r.id and tz.id=r.id2 and r.id1=? -- ид КА
)   u
where "контакты"[1][1] is not null
;

@@ заявки/контакты000
--- $cont_num=1|2|3|4 (соотв перевозчика |заказчика/ГП | посредника | грузоотправителя)
select distinct coalesce(tz."контакты"[{%= $cont_num %}][1], '') as title,  coalesce(tz."контакты"[{%= $cont_num %}][2], '') as phone
from 
  "транспорт/заявки" tz
  join refs r on r.id=tz."контрагенты"[{%= $cont_num %}]

where 
  ---tz."контакты"[{%= $cont_num %}] is not null
  (tz."контакты"[{%= $cont_num %}][1] is not null or tz."контакты"[{%= $cont_num %}][2] is not null)
  and ((?::int[])[1] = 0 or r.id1 = any(?)) --- ид ка
;

@@ заявки/контакты заказчиков0000
--- 
select distinct coalesce("контакты заказчиков"[1][1], '') as title,  coalesce("контакты заказчиков"[1][2], '') as phone
from (
  select tz."контакты заказчиков"[un.idx\:un.idx] --- срез сохраняет многоразмерность
  from "транспорт/заявки" tz,
  unnest(tz."заказчики")  WITH ORDINALITY as un(id, idx),
  refs r
  where un.id=r.id
  and ((?::int[])[1] = 0 or r.id1 = any(?)) --- ид ка
  and tz.id=r.id2  --- избыток
) с
where 
  "контакты заказчиков"[1][1] is not null or "контакты заказчиков"[1][2] is not null
;

@@ заявки/контакты грузоотправителей000
--- 
select distinct coalesce("контакты грузоотправителей"[1][1], '') as title,  coalesce("контакты грузоотправителей"[1][2], '') as phone
from (
  select tz."контакты грузоотправителей"[un.idx : un.idx] --- срез сохраняет многоразмерность
  from "транспорт/заявки" tz,
  unnest(tz."грузоотправители")  WITH ORDINALITY as un(id, idx),
  refs r
  where un.id=r.id
  and ((?::int[])[1] = 0 or r.id1 = any(?)) --- ид ка
  and tz.id=r.id2  --- избыток
) с
where 
  "контакты грузоотправителей"[1][1] is not null or "контакты грузоотправителей"[1][2] is not null
;

@@ заявки/директор
--- $cont_num=1|2|3 (соотв перевозчика, заказчика/ГП и посредника)
select distinct tz."директор{%= $cont_num %}"[1] as title,  tz."директор{%= $cont_num %}"[2] as phone
from "контрагенты" k 
  join refs r on k.id=r.id1 
  join "транспорт/заявки" tz on tz.id=r.id2

where tz."директор{%= $cont_num %}" is not null
  and tz."директор{%= $cont_num %}"[1] is not null
  and r.id=tz."контрагенты"[{%= $cont_num %}]
  ---and tz."контрагенты"[{%= $cont_num %}] is not null
  and ((?::int[])[1] = 0 or k.id = any(?)) --- coalesce(k.id, 0)=
;

@@ наш транспорт
--- и состояние свободный
select {%= $select || '*' %} from (
select t.*,
  cat.id as "категория/id",---- cat.parents_name || cat.name::varchar as "категории", cat.parents_id as "категории/id",
  (busy.id is not null and busy."дата2" is null) as "занят",
  case when busy."дата2" is null then busy.id else null end as "транспорт/заявка/id"
  ---k.*
from "транспорт" t

  join refs rc on t.id=rc.id2
  ---join "roles/родители"() cat on cat.id=rc.id1
  join "roles" cat on cat.id=rc.id1
  
  left join lateral (-- занятый транспорт
    select z.id, z."дата2"--- на какой последней заявке
     --- t.id as "транспорт/id"
    from 
      ---"транспорт" t,
      refs r
      join "транспорт/заявки" z on z.id=r.id2
      left join refs r2 on z.id=r2.id1

    where ---z."дата2" is null -- занят
      t.id=any(array[r.id1, r2.id2])
    
    order by z."дата1" desc, z.id desc
    limit 1
  
  ) busy on true ---t.id=busy."транспорт/id"

  
where 
  
  exists (
    select id
    from refs
    where 
      id1=any(array[1393, 10883, 971, 207975, 16307]) --- наши контрагенты
      and t.id=id2
  )
) t
;

@@ черновик заявки
select *, val as "data/json"
from "разное"
where (?::int is null or uid=?) ---
  and key=?
;

@@ заявка.docx
# -*- coding: utf-8 -*-
'''
https://github.com/elapouya/python-docx-template
http://docxtpl.readthedocs.io/en/latest/

pip install docxtpl

'''

from docxtpl import DocxTemplate, InlineImage, R, Listing
#from docx.shared import Mm, Inches, Pt
from docx.shared import Mm
tpl=DocxTemplate(u'{%= $docx_template_file %}')#/home/guest/Ostanin-dev/static/transport-ask-ostanina.template.docx
logo=InlineImage(tpl,u'''{%= $logo_image %}''', width=Mm(70)) if u'''{%= $logo_image %}''' else ''
logo_big=InlineImage(tpl,u'''{%= $logo_image_big %}''', width=Mm(187)) if u'''{%= $logo_image_big %}''' else ''
#'top_details': [{%= $top_details %}], # шапка реквизитов

undefined = ''
true = ''
false = ''
null = ''
context = {
    'logo': logo,
    'logo_big': logo_big,
    'contragent3_title': u'''{%= $contragent3_title %}''',
    'contragent3_name': u'''{%= $contragent3_name %}''',
    'contragent0_title': u'''{%= $contragent0_title %}''',
    'contragent0_INN': u'''{%= $contragent0_INN %}''',
    'contragent0_KPP': u'''{%= $contragent0_KPP %}''',
    'contragent0_BIK': u'''{%= $contragent0_BIK %}''',
    'contragent0_OGRN_Title': u'''{%= $contragent0_OGRN_Title %}''',
    'contragent0_OGRNIP': u'''{%= $contragent0_OGRNIP %}''',
    'contragent0_OGRN': u'''{%= $contragent0_OGRN %}''',
    'contragent0_korr_schet': u'''{%= $contragent0_korr_schet %}''',
    'contragent0_ras_schet': u'''{%= $contragent0_ras_schet %}''',
    'contragent0_bank': u'''{%= $contragent0_bank %}''',
    'contragent0_ur_addr': u'''{%= $contragent0_ur_addr %}''',
    'contragent0_post_addr': u'''{%= $contragent0_post_addr %}''',#+"\n" if  u'''{%= $contragent0_post_addr %}''' else "",
    'contragent0_tel': u'''{%= $contragent0_tel %}''',#+"\n" if u'''{%= $contragent0_tel %}''' else "",
    'contragent0_email': u'''{%= $contragent0_email %}''',#+"\n" if u'''{%= $contragent0_email %}''' else "",
    'contragent0_TopList': Listing(u'''{%= $contragent0_TopList %}'''),
    'contragent3_face': u'''{%= $contragent3_face %}''',
    'contragent3_name': u'''{%= $contragent3_name %}''',
    'contragent3_face_title': u'''{%= $contragent3_face_title %}''',
    'contragent3_osn': u'''{%= $contragent3_osn %}''',
    
    'contragent1_face_title': u'''{%= $contragent1_face_title %}''',
    'contragent1_osn': u'''{%= $contragent1_osn %}''',

    'id': u'{%= $id %}',
    'num': u'{%= $num %}', #441
    'bad_num':u'{%= $bad_num %}',
    'date': u'{%= $date %}', # 19 октября 2017
    'bad_date':u'{%= $bad_date %}',

    'contragent1' : u'''{%= $contragent1 %}''', # перевозчик ООО «ДанаТрансТорг»
    'director1': u'''{%= $director1 %}''', # генерального директора Федоровой Натальи Владимировны# перевозчик  в лице
    'bad_director1':u'{%= $bad_director1 %}',
    'contact1': u'''{%= $contact1 %}''', #Наталья# контактное лицо перевозчика
    'phone1': u'''{%= $phone1 %}''', #+7(919) 474 70 70# телефон контактного лица перевозчика
    
    'route': u'''{%= $route %}''', #г . Екатеринбург - г. Пермь# Маршрут/ расстояние
    'gruz': u'''{%= $gruz %}''', # Плитка гранитная  20 т на паллетах
    'contragent4': u'''{%= $contragent4 %}''',#ООО ТД «Сибирский гранит»# грузоотправитель
    'contact4': u'''{%= $contact4 %}''', #Илья# контактное лицо грузоотправителя
    'phone4': u'''{%= $phone4 %}''', #+7 904 162 18 30# телефон контактного лица грузоотправителя
    'address1': u'''{%= $address1 %}''', #г. Екатеринбург, Сибирский тракт 7 км  загруз - верх# Адрес загрузки  откуда
    'date1': u'''{%= $date1 %}''', #20.10.2017 с 11:00 до 15:00# Дата и время загрузки
    'time1': u'''{%= $time1 %}''',
    
    'contragent2': u'''{%= $contragent2 %}''', #ООО «ТехДорГрупп»# грузополучатель
    'contact2': u'''{%= $contact2 %}''', #Максим# контактное лицо грузополучатель
    'phone2': u'''{%= $phone2 %}''', #8 963-877-21-23# телефон контактного лица грузополучателя
    'address2': u'''{%= $address2 %}''', #г. Пермь, ул. Решетниковский спуск 1 к2   разгруз - верх# Адрес выгрузки
    'date2': u'''{%= $date2 %}''', #21.10.2017     с 9:00 до 15:00# Дата и время выгрузки
    'time2': u'''{%= $time2 %}''',
    
    'money': u'''{%== $money %}''', #14 000(четырнадцать) тысяч руб. 00 коп., без НДС по оригиналам ОТТН и бух.документов 1-3 б.д. Документы подписать , печать, подпись, расшифровка#Стоимость перевозки
    'comment': u'''{%== $comment %}''', #Счет, акт выставлять на ООО «ТехДорГрупп» (реквизиты во вложении), в счете прописывать маршрут и дату погрузки!!!# Особые условия
    
    'contact3': u'''{%= $contact3 %}''', #Ольга# Решение вопросов
    'phone3': u'''{%= $phone3 %}''',#+7 982 351 66 78
    
    'transport1': u'''{%= $transport1 %}''',# DAF-XF95-430 №  а/м А 063 УК159
    'transport2': u'''{%= $transport2 %}''', #п/п АН 0263 59
    'driver': u'''{%= $driver %}''', #Ежов Юрий Викторович
    'driver_phone': u'''{%= $driver_phone %}''', #8-922-33-98-306 / 8-902-635-46-67
    'driver_doc': u'''{%= $driver_doc %}''', # паспорт
    

}

tpl.render(context)
tpl.save(u'{%= $docx_out_file %}') # /home/guest/Документы/transport-ask-template.ok.docx