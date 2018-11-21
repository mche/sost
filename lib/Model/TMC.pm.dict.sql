@@ таблицы
create table IF NOT EXISTS "тмц/заявки" (
/*** заявки на объектах 
связи:
id1("номенклатура")->id2("тмц/заявки")
id1("объекты")->id2("тмц/заявки") --- куда, на какой объект
id1("тмц/заявки")->id2("тмц") --- 
***/
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи заказчик
  "дата1" date not null, -- дата на объект
  "наименование" text, --- временный текст, номенклатуру укажет снабженец
  "количество" numeric not null, --- по заявке
  ---"ед" varchar, единицы в самой номенклатуре
  "коммент" text
  

);

create table IF NOT EXISTS "тмц" (
/*** снабжение обработка заявок
связи:
id1("тмц/заявки")->id2("тмц") --- одна позиция заявок - одна или несколько позиций обработки снабжения
id1("номенклатура")->id2("тмц") --- если без заявки, то номенклатура здесь
--- упрощенная схема поставки (без связи с поставщиком и транспорт/заявками)
--- расход с баз будет, прихода на объект - нет
id1("объекты")->id2("тмц") --- с объекта (вся или часть поставки) ЕСЛИ этой связи нет - это поставка ИЗВНЕ (поставщик)
id1("тмц")->id2("объекты") --- на какой объект (часть поставки)
***/
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи снабженец
  "количество" numeric not null, --- по отгрузке, повторяет или больше/меньше заявки
  "цена" money, -- 
  "коммент" text,
  
  "количество/принято" numeric, --- подтвержение о поступлении на объект или базу
  "дата/принято" timestamp without time zone, --- 
  "принял" int, --- профиль кто принял
  "списать" boolean --- флажок позволяет принять ТМЦ на получателе без подтверждения и сразу списать
  --- alter table "тмц" add column "списать" boolean;

);

/***
alter table "тмц" add column "количество/принято" numeric; --- подтвержение о поступлении на объект или базу 
alter table "тмц" add column   "дата/принято" timestamp without time zone; --- 
alter table "тмц" add column   "принял" int; --- профиль кто принял
alter table "тмц" add column   "наименование" text; --- временный текст, номенклатуру укажет снабженец
alter table "тмц" add column   "простая поставка" boolean; --- 

alter table "тмц" drop column   "наименование"; --- временный текст, номенклатуру укажет снабженец
alter table "тмц" drop column "дата1";
);
***/

create table IF NOT EXISTS "тмц/инвентаризации" (
/*** 
связи:
id1("объекты")->id2("тмц/инвентаризации") --- на каком объекте
id1("тмц/инвентаризации")->id2("тмц") --- 
***/
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  "дата1" date not null, -- дата инв
  "коммент" text

);

create table IF NOT EXISTS "тмц/резерв" (
/***
запросы-подтверждения резервирования остатков на складе
связи:
id1("объекты")->id2("тмц/резерв") --- на каком объекте
id1("тмц/заявки")->id2("тмц/резерв") --- привязка к заявке
номенклатура остается в заявке
***/
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  "запросил" int not null, --- снабженец
  "количество" numeric not null,
  "резервировал" int, --- кладовщик
  "количество/резерв" numeric,
  "ts/резерв" timestamp without time zone, 
  "коммент/резерв" text

);

@@ функции

-------------------------------------------------------------
DROP VIEW IF EXISTS "тмц/движение/для остатков" CASCADE;
CREATE OR REPLACE VIEW "тмц/движение/для остатков" AS
/* 
** тут движение без простых поставок и сразу списание (не влияют на остатки)
** 
*/ 
select --- приходы из внеш пост или внутр перемещений
  t.id,
  tzo."транспорт/заявки/id",
  'приход' as "движение",
      /***case when tzo."на объект" is not null then 'приход'
               when tzo."с объекта" is not null then 'расход'
               else 'приход' --- внешний приход
      end  as "движение",
      ***/
  
  coalesce(coalesce(tzo.id, z."объект/id"), ot.id) as "объект/id",--- объект получатель
      /***case when tzo."на объект" is not null then tzo.id
               when tzo."с объекта" is not null then tzo.id
               else z."объект/id" --- объект из заявки для внешнего прихода
      end as "объект/id",--- объект получатель
      ***/
  
  case when tzo.id is not null then coalesce(z."объект/id", ot.id)
           else null::int
  end as "объект2/id",--объект-источник
      /***case when tzo."на объект" is not null then z."объект/id" --- объект из заявки
               when tzo."с объекта" is not null then z."объект/id"
               else null::int --- внешний приход
      end as "объект2/id",--- объект -источник
      ***/
  
  coalesce(z."номенклатура/id", n.id) as "номенклатура/id",
  
  t."количество/принято",
  coalesce(t."принял", t.uid) as "принял/профиль/id",
  row_to_json(t) as "$тмц/json",
      /***(case when tzo."на объект" is not null then 1::numeric --- приход из перемещения
               when tzo."с объекта" is not null then -1::numeric --- расход из перемещения
               else 1::numeric --- внешний приход
      end) * t."количество/принято" as "количество/принято",
      ***/
  t."цена",
  t."дата/принято"

from 
  "тмц" t
  ---join "профили" p on t.uid=p.id

  left join (
    select o.* , tz.id as "транспорт/заявки/id",
    ---tz."на объект", tz."с объекта",
    r.id1
    from refs r
      join "транспорт/заявки" tz on r.id2=tz.id
      join refs ro on tz."на объект"=ro.id ----=any(array[, tz."с объекта"])
      join "roles" o on o.id=ro.id1
      ----left join refs ro2 on tz."с объекта"=ro2.id
  ) tzo on tzo.id1=t.id

  left join (--- номенклатура и объект если по заявке
    select
      m.*,
      o.id as "объект/id",
      n.id as "номенклатура/id",
      r.id2
    from
      "тмц/заявки" m
      join refs r on m.id=r.id1
      join (
        select o.*, r.id2
        from refs r
          join "roles" o on r.id1=o.id
      ) o on o.id2=m.id

      join (
        select c.*, r.id2
        from refs r
          join "номенклатура" c on r.id1=c.id
      ) n on n.id2=m.id
  
  ) z on t.id=z.id2
  
  left join (---номенклатура если без заявки
      select n.*, r.id2
      from refs r
        join "номенклатура" n on n.id=r.id1
   ) n on n.id2=t.id
   
   left join (---объект если без заявки
    select o.*, r.id2
    from refs r
      join "roles" o on r.id1=o.id
   ) ot on ot.id2=t.id


where t."количество/принято" is not null

union all --- расходы из перемещений

select
  t.id,
  tzo."транспорт/заявки/id",
  'расход' as "движение",
  tzo.id, --- объект получатель (с объекта-расход)
  coalesce(z."объект/id", ot.id) as "объект2/id", -- объект источник
  coalesce(z."номенклатура/id", n.id) as "номенклатура/id",
  -t."количество/принято",
  coalesce(t."принял", t.uid) as "принял/профиль/id",
  row_to_json(t) as "$тмц/json",
  t."цена",
  t."дата/принято"
from
   "тмц" t
   join (
    select o.* , tz.id as "транспорт/заявки/id", r.id1
    from refs r
      join "транспорт/заявки" tz on r.id2=tz.id
      join refs ro on tz."с объекта"=ro.id
      join "roles" o on o.id=ro.id1
      left join refs ro2 on tz."на объект"=ro2.id
  ) tzo on tzo.id1=t.id
  
  left join (--- ---номенклатура и объект если по заявке
    select
      m.*,
      o.id as "объект/id", -- на какой объект
      n.id as "номенклатура/id",
      r.id2
    from 
      "тмц/заявки" m
      join refs r on m.id=r.id1
      
      left join (--- на объект
        select o.*, r.id2
        from refs r
          join "roles" o on r.id1=o.id
      ) o on o.id2=m.id
      
      join (
        select c.*, r.id2
        from refs r
          join "номенклатура" c on r.id1=c.id
      ) n on n.id2=m.id
  
  ) z on t.id=z.id2
  
  left join (---номенклатура если без заявки
      select n.*, r.id2
      from refs r
        join "номенклатура" n on n.id=r.id1
   ) n on n.id2=t.id
   
   left join (---объект если без заявки
    select o.*, r.id2
    from refs r
      join "roles" o on r.id1=o.id
   ) ot on ot.id2=t.id

where t."количество/принято" is not null

union all --- расходы в списание

select
  t.id,
  tzo."транспорт/заявки/id",
  'расход' as "движение",
  ---tzo.id, --- объект получатель (с объекта-)
  coalesce(z."объект/id", ot.id) as "объект2/id", -- объект расход
  0, --метка списания второго объекта нет
  coalesce(z."номенклатура/id", n.id) as "номенклатура/id",
  -t."количество/принято",
  coalesce(t."принял", t.uid) as "принял/профиль/id",
  row_to_json(t) as "$тмц/json",
  t."цена",
  t."дата/принято"
from
   "тмц" t
   join (
    select tz.* , tz.id as "транспорт/заявки/id", r.id1
    from refs r
      join "транспорт/заявки" tz on r.id2=tz.id
      ---join refs ro on tz."с объекта"=ro.id
      ---join "roles" o on o.id=ro.id1
      ---left join refs ro2 on tz."на объект"=ro2.id
  ) tzo on tzo.id1=t.id
  
  left join (--- ---номенклатура и объект если по заявке
    select
      m.*,
      o.id as "объект/id", -- на какой объект
      n.id as "номенклатура/id",
      r.id2
    from 
      "тмц/заявки" m
      join refs r on m.id=r.id1
      
      left join (--- на объект
        select o.*, r.id2
        from refs r
          join "roles" o on r.id1=o.id
      ) o on o.id2=m.id
      
      join (
        select c.*, r.id2
        from refs r
          join "номенклатура" c on r.id1=c.id
      ) n on n.id2=m.id
  
  ) z on t.id=z.id2
  
  left join (---номенклатура если без заявки
      select n.*, r.id2
      from refs r
        join "номенклатура" n on n.id=r.id1
   ) n on n.id2=t.id
   
   left join (---объект если без заявки
    select o.*, r.id2
    from refs r
      join "roles" o on r.id1=o.id
   ) ot on ot.id2=t.id

where t."количество/принято" is not null
  and t."списать"

union all --- простая поставка расходы и приходы по складам

select
  t.id, 
  null, --- нет привязки к "транспорт/заявки",
  o2."движение",
  o2.id,  --- объект получатель
  o1.id, ---null, -- объект источник (всегда внеш постав)
  n.id, -- номенклатура
  (case when o2."движение"='расход' then -1::numeric else 1::numeric end) * t."количество",
  coalesce(t."принял", t.uid) as "принял/профиль/id",
  row_to_json(t) as "$тмц/json",
  t."цена",
  t.ts --- t."дата/принято"
from
  "тмц/заявки" z
  join refs rz on z.id=rz.id1
  join "тмц" t on t.id=rz.id2
  
  join (---номенклатура в заявке
    select c.*, z.id as "тмц/заявки/id"--, r.id2
    from 
      "тмц/заявки" z --- избыток
      join refs r on z.id=r.id1
      join "номенклатура" c on r.id1=c.id
      ---join nom on c.id=nom.id
  ) n on z.id=n."тмц/заявки/id"--id2
  
  join  (---объект заявки
    select z.id as "тмц/заявки/id", o.*--, array[r.id1, r.id2] as _r---, case when o.id=r.id1 then 'расход' when o.id=r.id2 then 'приход' else null end as "движение"
    from 
      "тмц/заявки" z --- избыток
      join refs r on z.id=r.id1 or z.id=r.id2
      join "roles" o on o.id=r.id1 or o.id=r.id2 ---any(array[r.id1, r.id2])
    ---where z.id=any(array[r.id1, r.id2])
  ) o1 on z.id=o1."тмц/заявки/id" --z.id=any(o1._r)
  
  join (--- со склада/на склад
    select t.id as "тмц/id", o.*, case when o.id=r.id1 then 'расход' when o.id=r.id2 then 'приход' else null end as "движение",
       array[r.id1, r.id2] as _rid
    from 
      "тмц" t --- избыток
      join refs r on t.id=r.id1 or t.id=r.id2
      join "roles" o on o.id=r.id1 or o.id=r.id2 -- any(array[r.id1, r.id2])
    --where 
  ) o2 on t.id=o2."тмц/id"--- t.id=any(o2._rid)
  
  
  where t."количество" is not null
    and t."простая поставка"

;

-------------------------------------------------------------
DROP VIEW IF EXISTS "тмц/движение";
CREATE OR REPLACE VIEW "тмц/движение" AS
/* 
** тут движение с показом прихода-списания по простым закупкам
** 
*/ 

select *
from "тмц/движение/для остатков"

union all --- простая поставка приходы от поставщика

select
  t.id, 
  null, --- нет привязки к "транспорт/заявки",
  'приход-списание',
  o1.id,  --- объект получатель
  null, -- объект источник (всегда внеш постав)
  n.id, -- номенклатура
  t."количество",
   t.uid as "принял/профиль/id",
  row_to_json(t) as "$тмц/json",
  t."цена",
  t.ts --- t."дата/принято"
from
  "тмц/заявки" z
  join refs rz on z.id=rz.id1
  join "тмц" t on t.id=rz.id2
  
  join (---номенклатура в заявке
    select c.*, z.id as "тмц/заявки/id"--, r.id2
    from 
      "тмц/заявки" z --- избыток
      join refs r on z.id=r.id2
      join "номенклатура" c on r.id1=c.id
      ---join nom on c.id=nom.id
  ) n on z.id=n."тмц/заявки/id"--id2
  
  join  (---объект заявки
    select z.id as "тмц/заявки/id", o.*--, array[r.id1, r.id2] as _r---, case when o.id=r.id1 then 'расход' when o.id=r.id2 then 'приход' else null end as "движение"
    from 
      "тмц/заявки" z --- избыток
      join refs r on z.id=r.id1 or z.id=r.id2
      join "roles" o on o.id=r.id1 or o.id=r.id2 ---any(array[r.id1, r.id2])
    ---where z.id=any(array[r.id1, r.id2])
  ) o1 on z.id=o1."тмц/заявки/id" --z.id=any(o1._r)
  
  where t."количество" is not null
    and t."простая поставка"

union all --- простая поставка сразу списание

select
  t.id, 
  null, --- нет привязки к "транспорт/заявки",
  'списание',
  o1.id,  --- объект получатель
  null, -- объект источник (всегда внеш постав)
  n.id, -- номенклатура
  -1::numeric * t."количество",
   t.uid as "принял/профиль/id",
  row_to_json(t) as "$тмц/json",
  t."цена",
  t.ts --- t."дата/принято"
from
  "тмц/заявки" z
  join refs rz on z.id=rz.id1
  join "тмц" t on t.id=rz.id2
  
  join (---номенклатура в заявке
    select c.*, z.id as "тмц/заявки/id"--, r.id2
    from 
      "тмц/заявки" z --- избыток
      join refs r on z.id=r.id2
      join "номенклатура" c on r.id1=c.id
      ---join nom on c.id=nom.id
  ) n on z.id=n."тмц/заявки/id"--id2
  
  join  (---объект заявки
    select z.id as "тмц/заявки/id", o.*--, array[r.id1, r.id2] as _r---, case when o.id=r.id1 then 'расход' when o.id=r.id2 then 'приход' else null end as "движение"
    from 
      "тмц/заявки" z --- избыток
      join refs r on z.id=r.id1 or z.id=r.id2
      join "roles" o on o.id=r.id1 or o.id=r.id2 ---any(array[r.id1, r.id2])
    ---where z.id=any(array[r.id1, r.id2])
  ) o1 on z.id=o1."тмц/заявки/id" --z.id=any(o1._r)
  
  where t."количество" is not null
    and t."простая поставка"
;

@@ заявки/список или позиция?cached=1
--- 
select {%= $select || '*' %} from (
select
  m.*,
  timestamp_to_json(m.ts::timestamp) as "$ts/json",
  "формат даты"(m."дата1") as "дата1 формат",
  timestamp_to_json(m."дата1"::timestamp) as "$дата1/json",
  o.id as "объект/id", o.name as "объект", row_to_json(o) as "$объект/json",
  n.id as "номенклатура/id", "номенклатура/родители узла/title"(n.id, true) as "номенклатура",
  tmc.*,
  row_to_json(p) as "$профиль заказчика/json",
  tmc_easy.* --- простая обработка/поставки
% if ($tmc->{'резервы остатков'}) {
  , s."@тмц/резервы остатков/json"
  , s."@объекты/id" as "@тмц/резервы остатков/объекты/id"
%}
  

from  "тмц/заявки" m
  join "профили" p on m.uid=p.id
  
  join refs ro on m.id=ro.id2
  join roles o on o.id=ro.id1 --- объект заявки

  left join (
    select c.*, m.id as "тмц/заявки/id"
    from 
      "тмц/заявки" m
      join refs r on m.id=r.id2
      join "номенклатура" c on r.id1=c.id
  ) n on m.id=n."тмц/заявки/id"
  
  left join (--- на одну заявку может несколько тмц
    select 
      array_agg(t.id order by t.id) as "тмц/id", ---t."дата/принято" as "тмц/дата/принято",
      sum(t."количество") as "тмц/количество",
      array_agg(row_to_json(t) order by t.id) as "$тмц/json",
      ---timestamp_to_json(t."дата/принято"::timestamp) as "$тмц/дата/принято/json",
      ---EXTRACT(epoch FROM now()-t."дата/принято")/3600 as "тмц/дата/принято/часов",
      array_agg(tz.id order by t.id) as "транспорт/заявки/id", ---row_to_json(tz) as "$транспорт/заявки/json",
      array_agg(tr.id order by t.id) as "транспорт/id", 
      array_agg(o1.id order by t.id) as "с объекта",
      array_agg(o2.id order by t.id) as "на объект",
      ---r.id1
      m.id as "тмц/заявки/id"
    from 
      "тмц/заявки" m
      join refs r on m.id=r.id1
      join "тмц" t on t.id=r.id2
      join refs rt on t.id=rt.id1
      join "транспорт/заявки" tz on tz.id=rt.id2
      
      left join /*lateral*/ (
        select o.*, tz.id as "транспорт/заявки/id"
        from
        "транспорт/заявки" tz
        join refs r on tz."с объекта"=r.id --- объекты
        join "roles" o on o.id=r.id
      ) o1 on tz.id=o1."транспорт/заявки/id"
      
      left join /*lateral*/ (
        select o.*, tz.id as "транспорт/заявки/id"
        from
        "транспорт/заявки" tz
        join refs r on tz."на объект"=r.id --- объекты
        join "roles" o on o.id=r.id1--- and r.id=tz."на объект" --- объекты
      ) o2 on tz.id=o2."транспорт/заявки/id"
      
      left join (
        select tr.*, tz.id as "транспорт/заявки/id"
        from 
          "транспорт/заявки" tz
          join refs r on tz.id=r.id2
          join "транспорт" tr on tr.id=r.id1
      ) tr on tz.id=tr."транспорт/заявки/id"
      ---where r.id1=m.id
      group by m.id
  ) tmc on m.id=tmc."тмц/заявки/id"
  
  left join /*lateral*/ (--- простая обработка заявок - 1, 2 или три строки "тмц"
    select
      t."тмц/заявки/id", ---id1,
      array_agg(row_to_json(t)) as "@тмц/строки простой поставки/json",
      sum(t."количество") as "простая поставка/количество"
    from (
      select
        t.*,
        row_to_json(p) as "$снабженец/json",
        timestamp_to_json(t.ts) as "$ts/json",
        o.id as "объект/id", o.name as "объект", row_to_json(o) as "$объект/json",
        k.id as "контрагент/id", row_to_json(k) as "$контрагент/json",
        case when o.id = o.id1 then 'с базы' 
                 when o.id = o.id2 then 'на базу'
                 else 'поставщик' --- o.id is null
        end as "строки тмц",
        --r.id1---, r.id2
        m.id as "тмц/заявки/id"
      from 
        "тмц/заявки" m
        join refs r on m.id=r.id1
        join "тмц" t on t.id=r.id2
        
        left join "профили" p on t.uid=p.id
        
        left join /*lateral*/ (
          select o.*, t.id as "тмц/id", r.id1, r.id2
          from 
            "тмц" t
            join refs r on t.id=r.id1 or t.id=r.id2 ---any(array[r.id1, r.id2])
            join "roles" o on o.id=r.id1 or o.id=r.id2 ---any(array[r.id1, r.id2])---проверь объекты
          ---where t.id=any(array[r.id1, r.id2])
        ) o on t.id=o."тмц/id"
        
        left join (
          select k.*, t.id as "тмц/id" ---r.id2
          from 
            "тмц" t
            join refs r on t.id=r.id2
            join "контрагенты" k on k.id=r.id1
        ) k on t.id=k."тмц/id"
        
        where t."простая поставка" = true---(tmc."тмц/id" is null or t.id<>any(tmc."тмц/id"))
      ) t
    ---where t.id1=m.id
    group by t."тмц/заявки/id"--id1
  ) tmc_easy on m.id=tmc_easy."тмц/заявки/id"

% if ($tmc->{'резервы остатков'}) {
    left join (
  {%= $st->dict->render('тмц/резервы остатков') %}
  ) s on m.id=s."тмц/заявки/id"
%}

{%= $where1 || '' %}
) m
{%= $where || '' %}
{%= $order_by || ' order by "дата1", id ' %} --- сортировка в браузере
%#{%= $limit_offset || '' %}
{%= $limit && uc($limit) ne 'ALL' ? 'LIMIT ?' : '' %}
{%= $offset  ? 'OFFSET ?' : '' %}

;

@@ 00000тмц/заявки/простые поставки
select 
  ---row_to_json(z) as "$тмц/заявки/json",
  z.id---, z."дата1",
  array_agg(row_to_json(t)) as "@тмц/строки простой поставки/json",
  sum(t."количество") as "простая поставка/количество"

from "тмц/заявки" z
  join refs rt on z.id=rt.id1
  join "тмц" t on t.id=rt.id2
  
  left join lateral (
    select o.*, r.id1, r.id2
    from refs r
      join "объекты" o on o.id=any(array[r.id1, r.id2])
    where t.id=any(array[r.id1, r.id2])
  ) o on true
where t."простая поставка" = true --- индекс не пошел
{%= $where_append || '' %}
group by z.id---, z."дата1"
---order by z."дата1", z.id;
{%= $order_by || '' %} --- сортировка в браузере
{%= $limit_offset || '' %}
;

@@ контрагент
-- подзапрос
select c.*, r.id2 as _ref
from refs r
join "контрагенты" c on r.id1=c.id

@@ тмц/список или позиция
--- для снабжения
--- без  траспорт/заявки
--- одна позиция "тмц" - одна позиция "тмц/заявки"
select {%= $select || '*' %}
from (
select 
  t.*,
  timestamp_to_json(t."ts") as "$тмц/ts/json",
  EXTRACT(epoch FROM now()-t."дата/принято")/3600 as "дата/принято/часов",
  z.id as "тмц/заявка/id", row_to_json(z) as "$тмц/заявка/json",
  case when z.id is null then true else false end as "без заявки",
  coalesce(z."объект/id", ot.id) as "объект/id",
  z."объект/id" as "тмц/заявка/объект/id",
  ot.id as "тмц/объект/id",--- когда сохраняешь
  coalesce(z."объект", ot.name) as "объект",
  coalesce(z."$объект/json", ot."$объект/json") as "$объект/json",
  coalesce(z."номенклатура/id", n.id) as "номенклатура/id",
  coalesce(z."номенклатура", n."номенклатура") as "номенклатура",
  k.id as "контрагент/id", row_to_json(k) as "$контрагент/json",
  z."профиль заказчика/id", z."профиль заказчика/names",  z."$профиль заказчика/json",
  p.id as "снабженец/id", p.names as "снабженец/names", row_to_json(p) as "$профиль/снабженец/json",
  row_to_json(pp) as "$профиль/принял/json",
  tz."объект/id" as "через базу/id"

from 
  "тмц" t
  join "профили" p on t.uid=p.id
  
  left join (--- через базу
   select tz.*, o.id as "объект/id",  rt.id1
   from 
    refs rt
     join "транспорт/заявки" tz on tz.id=rt.id2
      ---join "тмц" t on t.id=
    join refs ro on ro.id=tz."на объект"
    join "roles" o on o.id=ro.id1
  
  ) tz on tz.id1=t.id
  
  left join (--- связь с заявкой
    select
      m.*, 
      timestamp_to_json(m.ts) as "$тмц/заявка/ts/json",
      ---"формат даты"(m."дата1") as "дата1 формат",
      timestamp_to_json(m."дата1"::timestamp) as "$дата1/json",
      o.id as "объект/id", o.name as "объект", row_to_json(o) as "$объект/json",
      n.id as "номенклатура/id", "номенклатура/родители узла/title"(n.id, true) as "номенклатура",
      p.id as "профиль заказчика/id", p.names as "профиль заказчика/names", row_to_json(p) as "$профиль заказчика/json",
      r.id2
    from 
      refs r
      join "тмц/заявки" m on m.id=r.id1--- связь с тмц-строкой
      join "профили" p on m.uid=p.id
      
      join refs rn on m.id=rn.id2
      join "номенклатура" n on rn.id1=n.id
      join refs ro on m.id=ro.id2
      join "объекты" o on ro.id1=o.id
      
    ---where coalesce(\?::int, 0)=0 or o.id=\? -- все объекты или один
  
  ) z on t.id=z.id2
  
  left join (---номенклатура если без заявки
    select n.*, 
    "номенклатура/родители узла/title"(n.id, true) as "номенклатура",
    r.id2
    from refs r
      join "номенклатура" n on n.id=r.id1
 ) n on n.id2=t.id
 
 left join (---объект если без заявки
  select o.*,
    row_to_json(o) as "$объект/json",
    r.id2
  from refs r
    join "объекты" o on r.id1=o.id
 ) ot on ot.id2=t.id
 
 left join (--- если простая поставка: поставщик
  select k.*, r.id2
  from refs r
    join "контрагенты" k on k.id=r.id1
 ) k on k.id2=t.id
 
 left join "профили" pp on t."принял"=pp.id
  
  ----where 
   ---- (coalesce\(?::int, 0)=0 or t.id=\?)
    ----and (coalesce(\?::int, 0)=0 or tz.id=\?)
) t
{%= $where || '' %}
{%= $order_by || '' %}
{%= $limit_offset || '' %}
;


@@ текущие остатки
--тмц
-- по доступным объектам

WITH inv AS (--- последняя инвентаризация
select o.id as "объект/id", n.id as "номенклатура/id",
          array_agg(m."дата1" order by m."дата1" desc) as "дата", 
          array_agg(t."количество" order by m."дата1" desc) as "количество"
        from "тмц/инвентаризации" m
          
          join refs ro on m.id=ro.id2
          join "roles" o on ro.id1=o.id
          
          ---строки тмц номенклатура
          join refs rt on m.id=rt.id1
          join "тмц" t on t.id=rt.id2
          join refs rn on t.id=rn.id2
          join "номенклатура" n on rn.id1=n.id
        group by o.id, n.id

), dob as (
  select * from "доступные объекты"(?, ?)

)

select {%= $select || '*' %} from (
  select
  "объект/id", 
  "номенклатура/id",
  "остаток"

from ---два юнион в суммирование: движ(позже инв) и инв
  (
    select "объект/id","номенклатура/id",
      sum("количество/принято") as "остаток"
    from (
      select d."объект/id", d."номенклатура/id", d."количество/принято"
      from
        (
          select d.*
          from "тмц/движение" d---/для остатков
            join dob on d."объект/id"=dob.id
          ---where d."объект/id"=154921
        ) d
        ---отбросить записи ранее инвентаризаций
        left  join inv on d."объект/id"=inv."объект/id" and d."номенклатура/id"=inv."номенклатура/id" and d."дата/принято"<=inv."дата"[1]
      
        where inv."объект/id" is null
  
      union all --- сами инвентаризации
      
      select "объект/id", "номенклатура/id", "количество"[1]
      from inv
        join dob on inv."объект/id"=dob.id
      ---where "объект/id"=154921
  
  ) o
    group by "объект/id", "номенклатура/id"
  ) o

where "остаток" is not null ---or "остаток"<>0
) o
;

@@ движение
-- тмц
select {%= $select || '*' %} from (
select * from (
select d.*, timestamp_to_json(d."дата/принято"::timestamp) as "$дата/принято/json",
  tz.id as "транспорт/заявки/id",
  tz."с объекта/id", tz."на объект/id",
  tz."@грузоотправители/id",---,  tz."@грузоотправители/json"
  row_to_json(z) as "$тмц/заявка/json",
  row_to_json(k) as "$проще/строка поставщика/json",
  row_to_json(p) as "$принял/профиль/json"
from
  "тмц/движение" d
  join "доступные объекты"(?, ?) o on d."объект/id"=o.id
  
  left join "профили" p on p.id=d."принял/профиль/id" ---кто принял
  
  left join (
    select tz.id,
      ro1.id1 as "с объекта/id", ro2.id1 as "на объект/id",
      k_go."@грузоотправители/id",
      ----k_go."@грузоотправители/json",
      r.id1
    from refs r
      join "транспорт/заявки" tz on r.id2=tz.id
      --- грузоотправителя
      
      left join lateral (-- все грузоотправители иды (перевести связи в ид контрагента)
        select array_agg(r.id1 order by un.idx) as "@грузоотправители/id"---,  array_agg(row_to_json(k) order by un.idx) as "@грузоотправители/json"
        from unnest(tz."грузоотправители") WITH ORDINALITY as un(id, idx)
          join refs r on un.id=r.id
      ) k_go on true ---k_go.id2=tz.id
      
      left join refs ro1 on ro1.id=tz."с объекта"
      left join refs ro2 on ro2.id=tz."на объект"
      
  ) tz on tz.id1=d.id
  
  left join (---заявка
    select z.*, r.id2
    from refs r
      join "тмц/заявки" z on z.id=r.id1
  ) z on z.id2=d.id --- ид тмц
  
  left join (--- простая поставка: поставщик (через другую строку тмц)
    select tt.*, row_to_json(k) as "$контрагент/json", r.id2
    from refs r
      join "тмц/заявки" z on z.id=r.id1
      join refs rr on z.id=rr.id1
      join "тмц" tt on tt.id=rr.id2
      join refs rk on tt.id=rk.id2
      join "контрагенты" k on k.id=rk.id1
      ---left join "профили" p on p.id=coalesce(tt."принял", t.uid) --- списал с базы и принял - одно лицо снабженец
  ) k on k.id2=d.id --- ид тмц

  
/***where (coalesce(\?::int, 0)=0 or d."объект/id"=\?)
  and (coalesce(\?::int, 0)=0 or d."номенклатура/id"=\?)
  and d."движение" <> 'списание' --- 
***/
{%= $where_d || '' %}

) d

union all --- инвентаризация

select
   t.id,
  null, ---транспорт/заявки/id
  'инвентаризация', --- движение            | text    
  o.id, ---объект/id
  null, ----объект2/id
  t."номенклатура/id",
  t."количество", ----/принято
  t.uid, ---принял/профиль/id
  row_to_json(t) as "$тмц/json",
  null, ---цена
  m."дата1", ---дата/принято
  ----
   timestamp_to_json(m."дата1"::timestamp), null, null, null, null, null, null, 
   row_to_json(p)
from 
  "тмц/инвентаризации" m
  
    join "профили" p on p.id=m.uid --- принял кто инв
    
    join refs ro on m.id=ro.id2
    join "roles" o on ro.id1=o.id
    join "доступные объекты"(?, ?) od on od.id=o.id
    
    join (---строки тмц
      {%= $st->dict->render('тмц/инвентаризация/позиции-строки') %}
    ) t on m.id=t."тмц/инвентаризации/id"
  {%= $where_inv || '' %}
) d
{%= $order_by || qq|order by d."дата/принято"::date desc, d."движение"='инвентаризация' desc, d."объект2/id", d.id desc | %} ---- при списании одинаковые строки
;

@@ инвентаризация/список или позиция
select {%= $select|| '*' %} from (
  select m.*,
  timestamp_to_json(m."дата1"::timestamp) as "$дата1/json",
  row_to_json(p) as "$профиль/json",
  o.id as "объект/id", row_to_json(o) as "$объект/json"
% if ($join_tmc) {
  ,t."@позиции тмц/json",
  t."@позиции тмц/id"
% }

from
  "тмц/инвентаризации" m
    join "профили" p on m.uid=p.id
    
    join refs ro on m.id=ro.id2
    join "roles" o on ro.id1=o.id
    
% if ($join_tmc) {
    join (---строки тмц
      select array_agg(row_to_json(t) order by t.id) as "@позиции тмц/json",
        array_agg(t.id order by t.id) as "@позиции тмц/id",
       "тмц/инвентаризации/id"
      from ({%= $st->dict->render('тмц/инвентаризация/позиции-строки') %}) t
      group by "тмц/инвентаризации/id"
    ) t on m.id=t."тмц/инвентаризации/id"
% }

) m
      
{%= $where || '' %}
{%= $order_by || '' %}
{%= $limit_offset || '' %}

@@ тмц/заявки/номенклатура
--- для обработки заявки номенклатуры (снаб)
select m.id, n.*
from 
  "тмц/заявки" m
  left join (
    select m.id as "тмц/заявки/id",
      r.id as "тмц/заявка/номенклатура/refs/id",
      n.id as "номенклатура/id"
    from 
      "тмц/заявки" m
      join refs r on m.id=r.id2
      join "номенклатура" n on n.id=r.id1
  ) n on m.id=n."тмц/заявки/id"
{%= $where || '' %}


@@ тмц/резервы остатков
--- подзапрос [тмц/резервы остатков]
select m.id as "тмц/заявки/id", array_agg(row_to_json(s)) as "@тмц/резервы остатков/json",
  array_agg(s."объект/id") as "@объекты/id" --- для where когда показать по складу
from 
  "тмц/заявки" m
  join refs rs on m.id=rs.id1
  join (
    select s.*,
      o.id as "объект/id", o.name as "объект",
      timestamp_to_json(s.ts) as "$ts/json",
      p1.names as "запросил/names",
      timestamp_to_json(s."ts/резерв") as "$ts/резерв/json",
      p2.names as "резервировал/names"
    from "тмц/резерв" s
    join refs ro on s.id=ro.id2
    join "roles" o on o.id=ro.id1
    join "профили" p1 on s."запросил"=p1.id
    left join "профили" p2 on s."резервировал"=p2.id
    
  ) s on s.id=rs.id2
{%= $where || '' %}
group by m.id


@@ тмц/инвентаризация/позиции-строки
select t.*, /*row_to_json(t) as "$тмц/json",*/
  n.id as "номенклатура/id",
  m.id as "тмц/инвентаризации/id"
  ---row_to_json(m) as "$тмц/инвентаризация/json"
from 
  "тмц/инвентаризации" m
  join refs r on m.id=r.id1
  join "тмц" t on t.id=r.id2
  join refs rn on t.id=rn.id2
  join "номенклатура" n on rn.id1=n.id
{%= $where || '' %}
{%= $order_by || '' %}
{%= $limit_offset || '' %}

@@ накладная.docx
# -*- coding: utf-8 -*-
'''
https://github.com/elapouya/python-docx-template
http://docxtpl.readthedocs.io/en/latest/

pip install docxtpl

'''

from docxtpl import DocxTemplate, InlineImage, R, Listing
#from docx.shared import Mm, Inches, Pt
from docx.shared import Mm
tpl=DocxTemplate(u'{%= $docx_template_file %}')
#logo=InlineImage(tpl,u'''{%= $logo_image %}''', width=Mm(70)) if u'''{%= $logo_image %}''' else ''
#logo_big=InlineImage(tpl,u'''{%= $logo_image_big %}''', width=Mm(187)) if u'''{%= $logo_image_big %}''' else ''
#'top_details': [{%= $top_details %}], # 
context = {
    'date': {'day': u'{%= $date->{"day"} %}', 'month' : u'{%= $date->{"месяц"} %}', 'year':  u'{%= $date->{"year"} %}'},
    'num': u'{%= $num %}',
    'profile': {'names': u'{%= join ' ', @{$profile->{names}} %}'},
    'from': {'title': u'{%= ($from->{name} && '★ '.$from->{name}) || $from->{title} %}'},
    'to': {'title': u'{%=  ($to->{name} && '★ '.$to->{name}) || $to->{title} || $model->app->dumper($to) %}'},
    'pos' : {%= $pos %},
    #[{'kol' : '2015', 'nomen' : " шапка реквизитов ", 'sum' : 'CRITICAL', 'bg': 'FF0000' },    {'kol' : '3', 'nomen' : u''' накладная ''', 'sum' : 'WARNING', 'bg': 'FFDD00' },{'kol' : '12', 'nomen' : u'''{%= 'авпувп еукрпекр' %}''', 'sum' : 'INFO', 'bg': '8888FF' },{'kol' : '13', 'nomen' : u''' авкпук ек екнго ''', 'sum' : 'DEBUG', 'bg': 'FF00FF' },],
}

tpl.render(context)
tpl.save(u'{%= $docx_out_file %}')