@@ таблицы
create table IF NOT EXISTS "{%= $schema %}"."{%= $tables->{main} %}" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  ---"объект" int not null, -- таблица roles
  "дата" date not null, --
  ----"сотрудник" int not null, -- таблица  профили
  "значение" text not null,
  "коммент" text
);


---CREATE INDEX IF NOT EXISTS "табель/индекс по месяцам" ON "табель" ("формат месяц"("дата"));
DROP INDEX IF EXISTS "табель/индекс по месяцам";
CREATE INDEX IF NOT EXISTS "табель/индекс по месяцам2" ON "табель" ("формат месяц2"("дата"));
CREATE INDEX IF NOT EXISTS "табель/значение/индекс" on "табель"("значение");
---CREATE INDEX IF NOT EXISTS "табель/коммент/индекс" ON "табель"("коммент"); не использовался
CREATE INDEX IF NOT EXISTS "табель/коммент/индекс/not null" ON "табель"(("коммент" IS NOT NULL));
------------
CREATE OR REPLACE FUNCTION "формат месяц"(date) RETURNS text AS $$ 
  select to_char($1, 'YYYY-MM');
$$ LANGUAGE SQL IMMUTABLE STRICT;
------------
CREATE OR REPLACE FUNCTION "формат месяц2"(date) RETURNS date AS $$ 
  select date_trunc('month', $1)::date;
$$ LANGUAGE SQL IMMUTABLE STRICT;

--------------
CREATE OR REPLACE FUNCTION "формат даты"(date) RETURNS text AS $$ 
  select array_to_string(array[
    to_char($1, 'TMdy,'),
    regexp_replace(to_char($1, 'DD'), '^0', ''),
    to_char($1, 'TMmon'),
    case when extract(year from now())=extract(year from $1) then '' else to_char($1, 'YYYY') end
  ]::text[], ' ');
$$ LANGUAGE SQL IMMUTABLE STRICT;
-------------------
---update "разное" set val='{}'  where key='месяц табеля закрыт/interval';---на умолчание в функции
---- update "разное" set val='{"2": "2 month 10 days"}'  where key='месяц табеля закрыт/interval';---для каждого объекта своя блокировка

DROP FUNCTION IF EXISTS "месяц табеля закрыт"(date);
CREATE OR REPLACE FUNCTION "месяц табеля закрыт"(date, int) RETURNS boolean AS $$ 
select (date_trunc('month', $1) + coalesce(t.val->>($2::text), '1 month 15 days')::interval) < now() or $1>now()
from "разное" t
where t.key='месяц табеля закрыт/interval'
;
$$ LANGUAGE SQL IMMUTABLE STRICT;
--------------------

@@ функции
CREATE OR REPLACE FUNCTION text2numeric(text)
/*
*/
RETURNS numeric
AS $func$
DECLARE
  r text;
BEGIN
  r:=regexp_replace($1, '(\S\s*)-+', '\1', 'g'); -- минусы внутри
  r:=regexp_replace(r, '[^\-\d,\.]+', '', 'g'); -- шелуха
  r:=regexp_replace(r, ',', '.', 'g'); --- запятые в точки
  ---r:=regexp_replace(r, '(\.)(?=.*\1)', '', 'g'); --- одна точка последняя это не работает
  r:=regexp_replace(r, '\.+(\S+\.)', '\1', 'g'); --- одна точка последняя
  RETURN case when r='' then null else r::numeric end;
END
$func$ LANGUAGE plpgsql;


CREATE OR REPLACE VIEW "должности" AS
select g1.*
from roles g1
  join refs r2 on g1.id=r2.id2
  join roles g2 on g2.id=r2.id1 and g2.name='Должности' --- жесткое название топовой группы
  left join (
    select r.id2 as g_id
    from refs r
    join roles g on g.id=r.id1 -- еще родитель
  ) n on g2.id=n.g_id

where n.g_id is null --- нет родителя топовой группы
;

DROP VIEW IF EXISTS "табель/начисления/объекты" CASCADE;
CREATE OR REPLACE VIEW "табель/начисления/объекты" AS
--- для отчета по деньгам
select distinct
  t.id, t.ts,
  p.id as "профиль/id",
  array_to_string(p.names, ' ') as "профиль",
  ---row_to_json(og) as "$объект/json",
  og.name as "объект",
  og.id as "объект/id",
  ---pr.name as "проект", pr.id as "проект/id",---проект нельзя, один объект в разных проектах!!!
  text2numeric(t."коммент")::money as "сумма",
  (date_trunc('month', t."дата"+interval '1 month') - interval '1 day')::date as "дата",
  array_to_string(coalesce(c."примечание", array[]::text[]), E'\n') || ' (' || to_char(t."дата", 'TMMon YYYY') || ': ' || og.name || ')' as "примечание"
from
---  {%###= $st->dict->render('табель/join') %}
  "табель" t
  join refs ro on t.id=ro.id2 --- на объект
  ---join "проекты/объекты" po on og.id=po."объект/id"
  join roles og on og.id=ro.id1 -- группы-объекты
  ---join refs rpr on og.id=rpr.id2
  ---join "проекты" pr on pr.id=rpr.id1
  join refs rp on t.id=rp.id2 -- на профили
  join "профили" p on p.id=rp.id1
  left join ( --- сборка примечание за все начисления месяца
    select
      rp.id1 as pid,
      ro.id1 as oid,
      date_trunc('month', t."дата") as "месяц",
      array_agg(t."коммент") as "примечание" --- || ' (' || og.name || ')'
    from
      "табель" t
      join refs rp on t.id=rp.id2 -- на профили
      join refs ro on t.id=ro.id2 -- на объекты
      join roles og on og.id=ro.id1 -- группы-объекты
      ---join "профили" p on p.id=rp.id1
    where "значение"='Примечание'
      and "коммент" is not null and "коммент"<>''
    group by rp.id1, ro.id1, date_trunc('month', t."дата")
  ) c on 
    p.id=c.pid
    and og.id=c.oid
    and "формат месяц2"(t."дата")=c."месяц"
where t."значение"~*'начислено$'
  and t."коммент" is not null and t."коммент"<>''

/***
union

select distinct --- потому что "проекты/объекты" в котором один объект в разных проектах
  t.id, t.ts,
  p.id as "профиль/id",
  array_to_string(p.names, ' ') as "профиль",
  og.name as "объект",
  og.id as "объект/id",
  po."проект", po."проект/id",
  text2numeric(t."коммент")::money as "сумма",
  (date_trunc('month', t."дата"+interval '1 month') - interval '1 day')::date as "дата",
  '(доп. часы на '||og.name || ')' as "примечание"
from
---  {%###= $st->dict->render('табель/join') %}
  "табель" t
  join refs ro on t.id=ro.id2 --- на объект
  join roles og on og.id=ro.id1 -- группы-объекты
  join "проекты/объекты" po on og.id=po."объект/id"
  join refs rp on t.id=rp.id2 -- на профили
  join "профили" p on p.id=rp.id1

where t."значение"='Доп. часы замстрой/начислено'
  and t."коммент" is not null and t."коммент"<>''
***/
;

CREATE OR REPLACE VIEW "табель/начисления/переработка" AS
--- для отчета по деньгам
--- переработка одна цифра за все объекты
select
  t.id, t.ts,
  p.id as "профиль/id",
  array_to_string(p.names, ' ') as "профиль",
  text2numeric(t."коммент")::money as "сумма",
  (date_trunc('month', t."дата"+interval '1 month') - interval '1 day')::date as "дата",
  '('::text || to_char(t."дата", 'TMMon YYYY') || ': переработка сверх 11 часов)'::text as "примечание"
from
  "табель" t
  join refs rp on t.id=rp.id2 -- на профили
  join "профили" p on p.id=rp.id1
where t."значение"='Переработка/начислено'
  and t."коммент" is not null and "коммент"<>''
;

---DROP VIEW IF EXISTS "табель/начисления/суточные" CASCADE;
CREATE OR REPLACE VIEW "табель/начисления/суточные" AS
--- для отчета по деньгам
--- суточные одна цифра за все объекты
select
  t.id, t.ts,
  p.id as "профиль/id",
  array_to_string(p.names, ' ') as "профиль",
  text2numeric(t."коммент")::money as "сумма",
  (date_trunc('month', t."дата"+interval '1 month') - interval '1 day')::date as "дата",
  '('::text || to_char(t."дата", 'TMMon YYYY') || ': суточные)'::text as "примечание"
from
  "табель" t
  join refs rp on t.id=rp.id2 -- на профили
  join "профили" p on p.id=rp.id1
where t."значение"='Суточные/начислено'
  and t."коммент" is not null and "коммент"<>''
;

---DROP VIEW IF EXISTS "табель/начисления/отпускные" CASCADE;
CREATE OR REPLACE VIEW "табель/начисления/отпускные" AS
--- для отчета по деньгам
--- отпускные одна цифра за все объекты
select
  t.id, t.ts,
  p.id as "профиль/id",
  array_to_string(p.names, ' ') as "профиль",
  text2numeric(t."коммент")::money as "сумма",
  (date_trunc('month', t."дата"+interval '1 month') - interval '1 day')::date as "дата",
  '('::text || to_char(t."дата", 'TMMon YYYY') || ': отпускные)'::text as "примечание"
from
  "табель" t
  join refs rp on t.id=rp.id2 -- на профили
  join "профили" p on p.id=rp.id1
where t."значение"='Отпускные/начислено'
  and t."коммент" is not null and "коммент"<>''
;

/*----------------------------------------------------------------------------*/
DROP FUNCTION IF EXISTS "движение денег/расчеты ЗП"(int, int, date);---это переименовал
DROP FUNCTION IF EXISTS "движение денег/доп записи расчета ЗП"(int, int, date);
CREATE OR REPLACE FUNCTION "движение денег/доп записи расчета ЗП"(int, int, date)
/*
  1 - id строки "движение денег" (или null)
  или 
  2 - ИД профиля(или null все профили)
  3 - месяц (обязательно)
*/
RETURNS TABLE("id" int, ts timestamp without time zone, "сумма" money, "дата" date, "примечание" text, uid int, "категория/id" int, "категории" int[], "категория" text[], "профиль/id" int)
AS $func$

select m.*,
  c.id as "категория/id",
  ---"категории/родители узла/id"(c.id, true) as "категории",
  ---"категории/родители узла/title"(c.id, false) as "категория",
  cc."@id" as "категории", cc."@title" as "категория",
  rp.id2 as "профиль/id"

from refs rp -- к профилю
  join "движение денег" m on m.id=rp.id1
  join refs rc on m.id=rc.id2
  join "категории" c on c.id=rc.id1
  left join lateral (select array_agg("id" order by level desc) as "@id", (array_agg("title" order by level desc))[2:] as "@title" from "категории/родители узла"(c.id, true)) cc on true

where 
  (m.id=$1 --
  or (($2 is null or rp.id2=$2) -- профиль
    and "формат месяц2"(m."дата") = "формат месяц2"($3::date)
    )
  ) and not exists (--- движение по кошелькам не нужно
    select w.id
    from "кошельки" w
      join refs r on w.id=r.id1
    where r.id2=m.id
  )
;

$func$ LANGUAGE SQL;

CREATE OR REPLACE VIEW "Расчеты ЗП" as
select n.*, dop."доп", "начислено"+coalesce("доп", 0::numeric) as "расчет ЗП", "сохраненный расчет" -----coalesce("расчет", 0::numeric)---должен 0
from (---все начисления
    select p.id as pid, p.names, t."дата", sum(text2numeric(coalesce(t."коммент", '0'))::money)::numeric as "начислено"
    from "табель" t
      join refs r on t.id=r.id2
    join "профили" p on p.id=r.id1
    where
      t."значение"~*'начислено'
    group by p.id, p.names, t."дата"
  ) n
  left join (-- закрытый расчет
    select p.id, t."дата", text2numeric(coalesce(t."коммент", '0'))::numeric as "сохраненный расчет"
    from "табель" t
      join refs r on t.id=r.id2
      join "профили" p on p.id=r.id1
    where 
      t."значение"~'Расчет'
  ) r on n.pid=r.id and n."дата"=r."дата"

  left join ( --- из "движение денег/доп записи расчета ЗП"(...)
    select rp.id2 as id, date_trunc('month', m."дата") as "дата", sum(m."сумма")::numeric as "доп"

    from refs rp -- к профилю
      join "движение денег" m on m.id=rp.id1

    where 
      /**(m.id=$1 --
      or (($2 is null or rp.id2=$2) -- профиль
        and date_trunc('month', m."дата") = date_trunc('month', $3::date)
        )
      ) and*/ 
      not exists (--- движение по кошелькам не нужно
        select w.id
        from "кошельки" w
          join refs r on w.id=r.id1
        where r.id2=m.id
      )
    group by rp.id2, date_trunc('month', m."дата")

  ) dop on n.pid=dop.id and date_trunc('month', n."дата")=dop."дата"

where "начислено"<>0
;

/*----------------------------------------------------------------------------*/
DROP FUNCTION IF EXISTS "табель/пересечение на объектах"(date, integer);
DROP FUNCTION IF EXISTS "табель/пересечение на объектах"(date,integer,integer);
DROP FUNCTION IF EXISTS "табель/пересечение на объектах"(date,integer,integer,integer);
CREATE OR REPLACE FUNCTION "табель/пересечение на объектах"(date, int, int, int)
/*
  Если работал/отпуск на двух и более объектах в один день
  1 - дата, проверка только в этом одном месяце
  2 - ИД профиля (null - все)
  3 - ИД объекта (null - все) минус ИД - исключить этот объект, плюс ИД - только этот объект
  4 - группировка count>=$3 (null - 1)
*/
RETURNS TABLE("дата" date, "профиль/id" int, "профиль/names" text[], "часы" text[], "объекты/json" jsonb, "объекты/id" int[] )
AS $func$

select t."дата", p.id, p.names,
  ---count(t.*), 
  array_agg(t."значение" order by t.id),
  ---array_agg(row_to_json(o) order by t.id),
  jsonb_agg(o order by t.id),
  array_agg(o.id order by t.id)
from "табель" t
  join refs ro on t.id=ro.id2
  ---join "проекты/объекты" o on o.id=ro.id1
  join roles o on o.id=ro.id1
  join refs rp on t.id=rp.id2
  join "профили" p on p.id=rp.id1

where (t."значение"~'^\d+[.,]?\d*$' or lower(t."значение")='о')
  and "формат месяц2"(t."дата")="формат месяц2"($1)
  and ($2 is null or p.id=$2)
  and case when $3<0 then o.id<>(-$3) when $3>0 then o.id=$3 else true end

group by t."дата", /*o.id,*/ p.id
having count(t.*)>=coalesce($4, 1)
--order by 1,3
;

$func$ LANGUAGE SQL;

/****************************************************************************/
/******************************     ЗАПРОСЫ     *********************************/
/****************************************************************************/

@@ бригады
---  для отчета без контроля доступа
select {%= $select || '*' %} from (select g2.*
from {%= $st->dict->render('бригады/join') %}
where 
  (?::int is null or g2.id=any(?::int[])) -- 
order by g2.name
) b
;

@@ бригады/join
  -- к бригадам
  roles g1
  join refs r1 on g1.id = r1.id1 and g1."name"='Бригады'
  join roles g2 on g2.id=r1.id2 and not coalesce(g2."disable", false)

@@ табель/join
"табель" t
  {%= $join_obj || '' %}  join (--- на объект left
    select og.*, t.id as "табель/id"
    from
      "табель" t
      join refs ro on t.id=ro.id2 
      join roles og on og.id=ro.id1 -- группы-объекты
  ) og on t.id=og."табель/id"
  join refs rp on t.id=rp.id2-- на профили
  join "профили" p on p.id=rp.id1

@@ табель/бригады/join
-- для отчета по бригадам
"табель" t
   -- на профили
  join refs rp on t.id=rp.id2
  join "профили" p on p.id=rp.id1
  -- на группы-бригады
  join refs ro on p.id=ro.id2 
  join roles og on og.id=ro.id1 -- это бригады
  join refs rb on og.id=rb.id2
  join roles bg on bg.id=rb.id1 and bg.name='Бригады'

@@ значения за месяц
-- по объекту или профилю
select t.*, og.id as "объект", p.id as "профиль"
from {%= $st->dict->render('табель/join', join_obj=>'left') %}---вроде не надо left
{%= $where || 'ошибка!' %}
/*where "формат месяц2"(t."дата")="формат месяц2"(\?::date) 
  and (\?::int is null or og.id=\?) -- объект
  and (\?::int is null or p.id=\?) -- профиль
  and (\?::text is null or t."значение" ~ \?::text) -- регулярку типа '^.{1,2}$' только часы
*/
{%= $order_by %}
;


@@ сотрудники объекта
select p.*
from refs r1
  join roles g1 on g1.id=r1.id2 -- вниз 1 ур
  join refs r3 on g1.id = r3.id1 -- к профилям
  join "профили" p on p.id=r3.id2

where r1.id1=? -- объект
  and g1.name=? -- жесткое название группы внутри каждого объекта
order by array_to_string(p.names, ' ')
;

@@ должности/join
---!!! refs r1
  join roles g1 on g1.id=r1.id1 -- это надо
  join refs r2 on g1.id=r2.id2
  join roles g2 on g2.id=r2.id1 and g2.name='Должности' --- жесткое название топовой группы
  left join (
    select r.id2 as g_id
    from refs r
    join roles g on g.id=r.id1 -- еще родитель
  ) n on g2.id=n.g_id

@@ должности сотрудника
select g1.*
from refs r1
  {%= $st->dict->render('должности/join') %}
  
where r1.id2=? --- профиль
  and g2.name='Должности' --- жесткое название топовой группы
  and n.g_id is null --- нет родителя топовой группы

order by g1.name
;

@@ профили
-- и должности/бригады
select {%= $select || '*' %} from (select pd.*, br."бригады/id"
from (
  select p.id, p.names, p.disable,
    array_agg(g1.name) as "должности",
    sum((g1.name='ИТР')::int) as "ИТР?"
  from
    "профили" p
  
    left join (--- должности сотрудника
      select g1.*, r1.id2 as pid
      from refs r1 
      {%= $st->dict->render('должности/join') %}
      where n.g_id is null --- нет родителя топовой группы
    ) g1 on p.id=g1.pid
  where 
    (? is null or p.id=any(?)) --- профили кучей
    ---and not coalesce(p.disable, false)
  group by p.id, p.names
) pd
  left join (-- бригады не у всех
    select r.id2 as profile_id, array_agg(b.id) as "бригады/id" ---array_agg(row_to_json(b)) as "бригады/json"
    from refs r
    join (select g2.* from {%= $st->dict->render('бригады/join') %}) b on b.id=r.id1
    group by r.id2
  ) br on pd.id=br.profile_id
order by pd.names
) p
;

@@ профили за прошлый месяц
-- и должности

select array_agg(distinct p.id)
from
  {%= $st->dict->render('табель/join') %}
  left join (
    select t.*, og.id as "объект/id", p.id as "профиль/id"
    from {%= $st->dict->render('табель/join') %}
    where t."значение"='_не показывать_'
  ) t2 on "формат месяц2"(t."дата")="формат месяц2"(t2."дата") and og.id=t2."объект/id" and p.id=t2."профиль/id"
where 
  not p.id=any(?) --- профили не скрытые
  and not coalesce(p.disable, false)
  and "формат месяц2"(t."дата")="формат месяц2"((?::date - interval ?)::date) 
  and og.id=? -- объект
  and t2.id is null
;

@@ 0000значение на дату
--- для ставки, КТУ
select t.*
from 
  {%= $st->dict->render('табель/join') %}
where p.id=?
  and ro.id1=? -- объект
  ---and extract(day from t."дата")=1
  and (t."дата"<=?::date or "формат месяц2"(t."дата")="формат месяц2"(?::date))  -- последнее значение (СТАВКА) или на этот месяц (КТУ)
  and t."значение" = ?
order by t."дата" desc
limit 1;

@@ 0000значение на дату/все объекты
--- для ставки
--- если нет ставки по конкретному объекту взять последнюю ставку по любому объекту
select t.*
from 
  {%= $st->dict->render('табель/join') %}
where p.id=?
  ---and ro.id1= -- объект
  ---and extract(day from t."дата")=1
  and t."дата"<=?::date -- последнее значение (СТАВКА)
  and t."значение" = ? -- Ставка допустим
order by t."дата" desc, ts desc
limit 1;

@@ сводка за месяц/суммы
--- тут по объектам
% if ($join_access_obj){
with with_acc_ob as (
  select id from "доступные объекты"(?, null, null)
)
% }
select sum(coalesce(text2numeric(t."значение"), 0::numeric)) as "всего часов",
  count(t."значение") as "всего смен",
  sum(case when (coalesce(text2numeric(t."значение"), 0::numeric)>11::numeric)::boolean and og.id<>132389 /*километраж нет*/ then text2numeric(t."значение")-11::numeric else null end) as "переработка/часов",
  count(case when (coalesce(text2numeric(t."значение"), 0::numeric)>11::numeric)::boolean and og.id<>132389 /*километраж нет*/ then 1 else null end) as "переработка/смен",
  og.id as "объект", p.id as "профиль", p.names, og.name as "объект/name" ---, array_agg(g1.name) as "должности"
  , /*"формат месяц"(t."дата") as "формат месяц",*/ date_trunc('month', t."дата") as "дата месяц",
  null::int as "профиль1/id"
from 
  {%= $st->dict->render('табель/join') %}---, $join_access_obj ? () : (join_obj=>'left')
% if ($join_access_obj){
  join with_acc_ob on og.id = with_acc_ob.id
% }
{%= $where || '' %}
---where 
---  (coalesce(\?::int,0)=0 or og.id=?) -- объект
---  and "формат месяц2"(t."дата")="формат месяц2"(\?::date)
---  and t."значение" ~ '^\d+[.,]?\d*$' --- только цифры часов в строке
---  and /*(\?::boolean is null or */coalesce(og."disable", false)=\?::boolean -- отключенные/не отключенные объекты
group by og.id, og.name,  p.id,  /*"формат месяц"(t."дата"),*/ date_trunc('month', t."дата")        ---, p.names
---order by og.name, p.names

% if ($union_double_profiles){

union all ---двойники (привязывать к объекту)

select 0, 0, 0, 0, o.id, p2.id, p2.names, o.name, /*"формат месяц"(?::date) as "формат месяц",*/ date_trunc('month', ?::date) as "дата месяц",
  p1.id as "профиль1/id"
from 
  "профили" p1
  join refs r on p1.id=r.id1
  join "профили" p2 on p2.id=r.id2
  join refs ro on p2.id=ro.id2
  join "объекты" o on o.id=ro.id1
  ---join "roles" o on o.id=ro.id1
---where o.id=any(array[90152, 100194]::int[]) ---o.name=''
% }
--- конец @@ сводка за месяц/суммы

@@ сводка за месяц
--- тут по объектам
select *,
  coalesce("_КТУ1", 1.0::numeric) as "КТУ1",
  coalesce("_КТУ2", coalesce("_КТУ1", 1.0::numeric)) as "КТУ2"
  ----(case when "_Ставка"='' then null else "_Ставка" end)::int "Ставка"
from (
select sum.*,
  text2numeric(k1."коммент") as "_КТУ1",
  text2numeric(k2."коммент") as "_КТУ2",
  text2numeric(st1."коммент") as "Ставка",
 --- text2numeric(coalesce(sm1."коммент", sm2."коммент")) as "Сумма",
  text2numeric(sm1."коммент") as "Сумма",
  text2numeric(pay."коммент") as "Начислено",
  text2numeric(dop."коммент") as "Доп. часы замстрой",
  text2numeric(dop_sum."коммент") as "Доп. часы замстрой/сумма",
  text2numeric(dop_pay."коммент") as "Доп. часы замстрой/начислено",
  ----day."Суточные",
  ---text2numeric(day_st."коммент") as "Суточные/ставка",
  ---day."Суточные" as "Суточные/смены",---умнож * sum."всего смен"
  descr."коммент" as "Примечание",
  p2.id as "профиль2/id", p2.names as "профиль2"
from (
  {%= $st->dict->render('сводка за месяц/суммы', join_access_obj=>$join_access_obj,  where=>$where, union_double_profiles=>$union_double_profiles) %}
) sum
-------КТУ1--------
left join lateral (
select t.*
from 
  {%= $st->dict->render('табель/join') %}
where p.id=sum."профиль"
  and og.id=sum."объект" -- объект
  and  sum."дата месяц"="формат месяц2"(t."дата") -- 
  and t."значение" = 'КТУ1'
  and t."коммент" is not null
order by t."дата" desc, t.ts desc
limit 1
) k1 on true
--------КТУ2-----------
left join lateral (
select t.*
from 
  {%= $st->dict->render('табель/join') %}
where p.id=sum."профиль"
  and og.id=sum."объект" -- объект
  and sum."дата месяц"="формат месяц2"(t."дата") -- 
  and t."значение" = 'КТУ2'
  and t."коммент" is not null
order by t."дата" desc, t.ts desc
limit 1
) k2 on true
--------Ставка по этому объекту или другим-----------
left join lateral (
select * from (
  select t.*, og.id=sum."объект" as "этот объект"
  from 
    {%= $st->dict->render('табель/join') %}
  where p.id=sum."профиль"
    ---and og.id=sum."объект" -- объект
    ---and  t."дата"<=\?::date
    and t."значение" = 'Ставка'
    and t."коммент" is not null
  ) t
order by t."этот объект" desc, t."дата" desc, t.ts desc
limit 1
) st1 on true
--------последняя Ставка по всем объектам-----------
/***left join lateral (
select t.*
from 
  {%= $st->dict->render('табель/join') %}
where p.id=sum."профиль"
  and t."значение" = 'Ставка'
  and t."коммент" is not null
order by t."дата" desc, t.ts desc
limit 1
) st2 on true
***/
--------Сумма по этому объекту-----------
left join lateral (
select t.*
from 
  {%= $st->dict->render('табель/join') %}
where p.id=sum."профиль"
  and og.id=sum."объект" -- объект
  ---and  t."дата"<=::date нельзя переносить начисленную сумму
  and sum."дата месяц"="формат месяц2"(t."дата")
  and t."значение" = 'Сумма'
  and t."коммент" is not null
order by t."дата" desc, t.ts desc
limit 1
) sm1 on true
----------------Начислено по этому объекту---------------------
left join lateral (
select t.*
from 
  {%= $st->dict->render('табель/join') %}
where p.id=sum."профиль"
  and og.id=sum."объект" -- объект
  and  sum."дата месяц"="формат месяц2"(t."дата") -- 
  and t."значение" = 'Начислено'
  and t."коммент" is not null
order by t."дата" desc
limit 1
) pay on true
-------- Доп. часы замстрой по этому объекту-----------
left join lateral (
select t.*
from 
  {%= $st->dict->render('табель/join') %}
where p.id=sum."профиль"
  and og.id=sum."объект" -- объект
  ---and  t."дата"<=::date нельзя переносить начисленную сумму
  and sum."дата месяц"="формат месяц2"(t."дата")
  and t."значение" = 'Доп. часы замстрой'
  and t."коммент" is not null
order by t."дата" desc, t.ts desc
limit 1
) dop on true
-------- Доп. часы замстрой/сумма по этому объекту-----------
left join lateral (
select t.*
from 
  {%= $st->dict->render('табель/join') %}
where p.id=sum."профиль"
  and og.id=sum."объект" -- объект
  ---and  t."дата"<=::date нельзя переносить начисленную сумму
  and sum."дата месяц"="формат месяц2"(t."дата")
  and t."значение" = 'Доп. часы замстрой/сумма'
  and t."коммент" is not null
order by t."дата" desc, t.ts desc
limit 1
) dop_sum on true
---------------- Доп. часы замстрой/начислено по этому объекту---------------------
left join lateral (
select t.*
from 
  {%= $st->dict->render('табель/join') %}
where p.id=sum."профиль"
  and og.id=sum."объект" -- объект
  and  sum."дата месяц"="формат месяц2"(t."дата") -- 
  and t."значение" = 'Доп. часы замстрой/начислено'
  and t."коммент" is not null
order by t."дата" desc
limit 1
) dop_pay on true
----------------Примечание---------------------
left join lateral (
select t.*
from 
  {%= $st->dict->render('табель/join') %}
where p.id=sum."профиль"
  and og.id=sum."объект" -- объект
  and  sum."дата месяц"="формат месяц2"(t."дата") -- 
  and t."значение" = 'Примечание'
  and t."коммент" is not null
order by t."дата" desc
limit 1
) descr on true
----------------Суточные (теперь не по объектам)---------------------
/****left join lateral (
select sum(text2numeric(t."коммент")) as "Суточные"
from 
  {%= $st->dict->render('табель/join') %}
where p.id=sum."профиль"
  ---and og.id=sum."объект" -- объект
  and  sum."дата месяц"="формат месяц2"(t."дата") -- 
  and t."значение" = 'Суточные'
  ---and t."коммент" is not null
  and t."коммент" ~ '^\d+[.,]?\d*$'
---order by t."дата" desc
---limit 1
---group by p.id, "формат месяц2"(t."дата")
) day on true
***/
----------------Суточные/ставка (теперь не по объектам)---------------------
/****left join lateral (
select t.*
from 
  {%= $st->dict->render('табель/join') %}
where p.id=sum."профиль"
  and og.id=sum."объект" -- объект
  and  sum."дата месяц"="формат месяц2"(t."дата") -- 
  and t."значение" = 'Суточные/ставка'
  and t."коммент" is not null
order by t."дата" desc
limit 1
) day_st on true
***/

-------Двойники--------
left join lateral (-- профиль двойника
select p.*
from 
  refs r,
  "профили" p
where (sum."профиль"=r.id1 and p.id=r.id2) --- or (sum."профиль"=r.id2 and p.id=r.id1)
  and p.id <> sum."профиль"
--limit 1
) p2 on true

) sum

--- конец @@ сводка за месяц

@@ сводка за месяц/общий список?cached=1
--- сворачивает объекты
select {%= $select || '*' %} from (select coalesce(work."профиль", otp."профиль") as "профиль",
  coalesce(work.names, otp.names) as names,
  ---coalesce(work."дата месяц", otp."дата месяц") as "дата месяц",
  work."профиль2/id", work."профиль2",
  work."профиль1/id",
  coalesce(work."объекты", array[]::int[]) as "объекты",
  work."объекты/name",
  work."всего часов",
  work."всего смен",
  work."переработка/часов",
  work."переработка/смен",
  work."КТУ1",
  work."КТУ2",
  work."Ставка",
  coalesce(work."Сумма", array[]::numeric[]) as "Сумма",
  coalesce(work."Начислено", array[]::numeric[]) as "Начислено",
  coalesce(work."Доп. часы замстрой", array[]::numeric[]) as "Доп. часы замстрой",
  coalesce(work."Доп. часы замстрой/сумма", array[]::numeric[]) as "Доп. часы замстрой/сумма",
  coalesce(work."Доп. часы замстрой/начислено", array[]::numeric[]) as "Доп. часы замстрой/начислено",
  work."Суточные",
  work."Суточные/ставка",
  work."Суточные/смены",
  work."Суточные/сумма",
  work."Суточные/начислено",
  work."Переработка/ставка",
  work."Переработка/сумма",
  work."Переработка/начислено",
  otp."отпускных дней",
  otp."Отпускные/ставка",
  otp."Отпускные/сумма",
  otp."Отпускные/начислено",
  calc_zp."расчет ЗП" as "РасчетЗП",--это в запросе
  calc_zp1."РасчетЗП/флажок",--это сохраненный строкой
  coalesce(work."Примечание", otp."Примечания") as "Примечание"
from (
  select sum."профиль", sum.names, sum."дата месяц", /* sum."формат месяц",*/ sum."профиль2/id", sum."профиль2", sum."профиль1/id",
    array_agg(sum."объект" order by sum."объект") as "объекты",
    array_agg(sum."объект/name" order by sum."объект") as "объекты/name",
    array_agg(sum."всего часов" order by sum."объект") as "всего часов",
    array_agg(sum."всего смен" order by sum."объект") as "всего смен",
    array_agg(sum."переработка/часов" order by sum."объект") as "переработка/часов",
    array_agg(sum."переработка/смен" order by sum."объект") as "переработка/смен",
    array_agg(sum."КТУ1" order by sum."объект") as "КТУ1",
    array_agg(sum."КТУ2" order by sum."объект") as "КТУ2",
    array_agg(sum."Ставка" order by sum."объект") as "Ставка",
    array_agg(sum."Сумма" order by sum."объект") as "Сумма",
    array_agg(sum."Начислено" order by sum."объект") as "Начислено",
    array_agg(sum."Доп. часы замстрой" order by sum."объект") as "Доп. часы замстрой",
    array_agg(sum."Доп. часы замстрой/сумма" order by sum."объект") as "Доп. часы замстрой/сумма",
    array_agg(sum."Доп. часы замстрой/начислено" order by sum."объект") as "Доп. часы замстрой/начислено",
    ---array_agg(sum."Суточные" order by sum."объект") as "Суточные",
    ---array_agg(sum."Суточные/ставка" order by sum."объект") as "Суточные/ставка",
    ---sum(sum."Суточные/смены") as "Суточные/смены",
    ---day_cnt."коммент" as "Суточные/смены",
    day."Суточные",
    day."Суточные" as "Суточные/смены",
    text2numeric(day_st."коммент") as "Суточные/ставка",
    ---text2numeric(day_sum."коммент") as "Суточные/сумма",
    day_sum."Суточные/сумма",
    ---text2numeric(day_money."коммент") as "Суточные/начислено",
    day_money."Суточные/начислено",
    text2numeric(overwork_st."коммент") as "Переработка/ставка",
    ---text2numeric(overwork_sum."коммент") as "Переработка/сумма",
    overwork_sum."Переработка/сумма",
    ---text2numeric(overwork_money."коммент") as "Переработка/начислено",
    overwork_money."Переработка/начислено",
    array_agg(sum."Примечание" order by sum."объект") as "Примечание"
  from (
    {%= $st->dict->render('сводка за месяц', join_access_obj=>$join_access_obj, where=>$where, union_double_profiles=>$union_double_profiles) %}
  ) sum
----------------Суточные (теперь не по объектам)---------------------
left join /*lateral*/ (
  select 
    p.id as "профиль/id",
    ----"формат месяц2"(t."дата") as "дата месяц",
    sum(text2numeric(t."коммент")) as "Суточные"
  from 
    "табель" t
      join refs rp on t.id=rp.id2 -- на профили
      join "профили" p on p.id=rp.id1
  where /*p.id=sum."профиль"
    and sum."дата месяц"="формат месяц2"(t."дата")*/
    "формат месяц2"(t."дата")="формат месяц2"(?::date)
    and  t."значение" = 'Суточные'
    ---and t."коммент" is not null
    and t."коммент" ~ '^\d+[.,]?\d*$'
  ---order by t."дата" desc
  ---limit 1
  group by p.id---, "формат месяц2"(t."дата")
) day on  sum."профиль"=day."профиль/id" ---and sum."дата месяц"=day."дата месяц" and---true
----------------Суточные/ставка (теперь не по объектам)---------------------
left join lateral (--- этот месяц или предыдущий
select * from (
  select t.*, sum."дата месяц"=date_trunc('month', t."дата") as "в этом месяце"
  from 
    "табель" t
      join refs rp on t.id=rp.id2 -- на профили
      join "профили" p on p.id=rp.id1
  where p.id=sum."профиль"
    ----and og.id=sum."объект" -- объект
    ---and sum."дата месяц"=date_trunc('month', t."дата")
    and t."значение" = 'Суточные/ставка'
    and t."коммент" is not null
) t
order by t."в этом месяце" desc, t."дата" desc
limit 1
) day_st on true

  ----------------Суточные/сумма (не по объектам)---------------------
  left join /*lateral*/ (
  select 
    p.id as "профиль/id",
   ---- "формат месяц2"(t."дата") as "дата месяц",
    sum(text2numeric(t."коммент")) as "Суточные/сумма"
  from 
  "табель" t
    join refs rp on t.id=rp.id2 -- на профили
    join "профили" p on p.id=rp.id1
  where /*p.id=sum."профиль"
    and sum."дата месяц"="формат месяц2"(t."дата")*/
    "формат месяц2"(t."дата")="формат месяц2"(?::date)
    and t."значение" = 'Суточные/сумма'
    and t."коммент"  ~ '^\d+[.,]?\d*$'---is not null
  ---order by t."дата" desc
  --limit 1
  group by p.id---, "формат месяц2"(t."дата")
  ) day_sum on sum."профиль"=day_sum."профиль/id"--- and sum."дата месяц"=day_sum."дата месяц"---true
  ----------------Суточные/начислено (не по объектам)---------------------
  left join /*lateral*/ (
  select 
    p.id as "профиль/id",
    ---"формат месяц2"(t."дата") as "дата месяц",
    sum(text2numeric(t."коммент")) as "Суточные/начислено"
  from 
    "табель" t
      join refs rp on t.id=rp.id2 -- на профили
      join "профили" p on p.id=rp.id1
  where /*p.id=sum."профиль"
    and sum."дата месяц"="формат месяц2"(t."дата")*/
    "формат месяц2"(t."дата")="формат месяц2"(?::date)
    and t."значение" = 'Суточные/начислено'
    and t."коммент"  ~ '^\d+[.,]?\d*$'---is not null
  ---order by t."дата" desc
  ---limit 1
  group by p.id---, "формат месяц2"(t."дата")
  ) day_money on /*true*/ sum."профиль"=day_money."профиль/id" ---and sum."дата месяц"=day_money."дата месяц"

----------------Переработка/ставка (не по объектам)---------------------
  left join lateral (
  select * from (
  select t.*, sum."дата месяц"=date_trunc('month', t."дата") as "в этом месяце"
  from 
    "табель" t
      join refs rp on t.id=rp.id2 -- на профили
      join "профили" p on p.id=rp.id1
  where p.id=sum."профиль"
    ---and sum."дата месяц"=date_trunc('month', t."дата")
    and t."значение" = 'Переработка/ставка'
    and t."коммент" is not null
  ) t
  order by t."в этом месяце" desc, t."дата" desc
  limit 1
  ) overwork_st on true
----------------Переработка/сумма (не по объектам)---------------------
  left join lateral (
  select 
    ---p.id as "профиль/id",
    ---"формат месяц2"(t."дата") as "дата месяц",
    sum(text2numeric(t."коммент")) as "Переработка/сумма"
  from 
    "табель" t
      join refs rp on t.id=rp.id2 -- на профили
      join "профили" p on p.id=rp.id1
  where p.id=sum."профиль"
    ---and sum."дата месяц"="формат месяц2"(t."дата")
    and "формат месяц2"(t."дата")="формат месяц2"(?::date)
    and t."значение" = 'Переработка/сумма'
    and t."коммент"  ~ '^\d+[.,]?\d*$'---is not null
  ---order by t."дата" desc
  ---limit 1
  --group by p.id---, "формат месяц2"(t."дата")
  ) overwork_sum on true --sum."профиль"=overwork_sum."профиль/id" ---and sum."дата месяц"=overwork_sum."дата месяц"
----------------Переработка/начислено (не по объектам)---------------------
  left join lateral (
  select ---t.*
    ---p.id as "профиль/id",
    ---"формат месяц2"(t."дата") as "дата месяц",
    sum(text2numeric(t."коммент")) as "Переработка/начислено"
  from 
    "табель" t
      join refs rp on t.id=rp.id2 -- на профили
      join "профили" p on p.id=rp.id1
  where p.id=sum."профиль"
    ---and sum."дата месяц"="формат месяц2"(t."дата")
    and "формат месяц2"(t."дата")="формат месяц2"(?::date)
    and t."значение" = 'Переработка/начислено'
    and t."коммент"  ~ '^\d+[.,]?\d*$'---is not null
  --order by t."дата" desc
  --limit 1
  ---group by p.id---,  "формат месяц2"(t."дата")
  ) overwork_money on true --- sum."профиль"=overwork_money."профиль/id" ---and sum."дата месяц"=overwork_money."дата месяц"
  
  group by sum."профиль", sum.names, day."Суточные", day_st."коммент", day_sum."Суточные/сумма", day_money."Суточные/начислено", sum."дата месяц", overwork_st."коммент", overwork_sum."Переработка/сумма", overwork_money."Переработка/начислено", /*sum."формат месяц", */ sum."профиль2/id", sum."профиль2", sum."профиль1/id"
) work

full outer join (
  select days.*,
    ----text2numeric(coalesce(st."коммент", st_prev."коммент")) as "Отпускные/ставка",
    text2numeric(st."коммент") as "Отпускные/ставка",
    text2numeric(sum."коммент") as "Отпускные/сумма",
    text2numeric(money."коммент") as "Отпускные/начислено"
  from 
    (----------------Отпускные дни (со всех объектов)---------------------
    select p.id as "профиль", p.names, 
      count(distinct t."дата") as "отпускных дней",
      array_agg(t."коммент") as "Примечания"
    from {%= $st->dict->render('табель/join', join_obj=>'left') %}
    where 
      "формат месяц2"(t."дата")="формат месяц2"(?::date)  --- парам месяц 1
      and lower(t."значение") = 'о'-- заглавная
    group by p.id, p.names
    ) days
  ----------------Отпускные/ставка заданный месяц или другой (не по объектам)---------------------
  left join lateral (
  select * from(
  select t.*, date_trunc('month', ?::date)=date_trunc('month', t."дата") as "в этом месяце"
  from 
    {%= $st->dict->render('табель/join', join_obj=>'left') %}
  where p.id=days."профиль"
    ---and  days."дата месяц"="формат месяц2"(t."дата") --- парам месяц 2
    ---and date_trunc('month', ?::date)=date_trunc('month', t."дата")
    and t."значение" = 'Отпускные/ставка'
    and t."коммент" is not null
  ) t
  order by t."в этом месяце" desc, t."дата" desc
  limit 1
  ) st on true
  ----------------Отпускные/сумма (не по объектам)---------------------
  left join lateral (
  select t.*
  from 
    {%= $st->dict->render('табель/join', join_obj=>'left') %}
  where p.id=days."профиль"
    ---and  days."дата месяц"="формат месяц2"(t."дата") --- парам месяц 3
    and "формат месяц2"(t."дата")="формат месяц2"(?::date)
    and t."значение" = 'Отпускные/сумма'
    and t."коммент" is not null
  order by t."дата" desc
  limit 1
  ) sum on true
  ----------------Отпускные/начислено (не по объектам)---------------------
  left join lateral (
  select t.*
  from 
    {%= $st->dict->render('табель/join', join_obj=>'left') %}
  where p.id=days."профиль"
    and "формат месяц2"(t."дата")="формат месяц2"(?::date)  --- парам месяц 4
    and t."значение" = 'Отпускные/начислено'
    and t."коммент" is not null
  order by t."дата" desc
  limit 1
  ) money on true

) otp on work."профиль"=otp."профиль" ---and work."формат месяц"=otp."формат месяц"

-----------------Расчет ЗП (не по объектам)---------------------
/* после доп начислений и удержаний */
left join (
select p.id as "профиль", 
    array_to_string(array_agg(text2numeric(t."коммент")), '!ошибка!') as "РасчетЗП/флажок"
from 
  {%= $st->dict->render('табель/join', join_obj=>'left') %}
where ---p.id=sum."профиль"
  "формат месяц2"(t."дата")="формат месяц2"(?::date) 
  and t."значение" = 'РасчетЗП'
  and t."коммент" is not null
group by p.id
) calc_zp1 on calc_zp1."профиль"=coalesce(work."профиль", otp."профиль")

left join "Расчеты ЗП" calc_zp on calc_zp.pid=coalesce(work."профиль", otp."профиль")
  and calc_zp."дата" = date_trunc('month', ?::date)

/*** не катит - в отдельный запрос
left join lateral (
  select true as "пересечение объектов есть"
  where exists (select * from "табель/пересечение на объектах"(work."дата месяц"::date, work."профиль"))
)  as tpo on true
***/
/***left join lateral (
  select * from "табель/пересечение на объектах/exists"(work."дата месяц"::date, work."профиль")
) as tpo on true***/
) t
--- конец @@ сводка за месяц/общий список

@@ пересечение объектов
--- проверка что сотрудник был на двух и более объектах в один день
select {%= $select || '*' %} from (
select "профиль/id" as pid,
  ---array_agg(row_to_json(t)) as "пересечения/json"
  jsonb_agg(t) as "пересечения/json"
from (
  select "профиль/id", "дата", timestamp_to_json("дата") as "$дата/json", "объекты/json", "часы"
  from "табель/пересечение на объектах"(?::date, null, null, 2) -- два и больше пересечения
) t
group by "профиль/id"
) t


@@ пересечение объектов/сохранение
--- проверка при сохранении из формы табеля
select *, timestamp_to_json("дата"::timestamp) as "$дата/json"
from "табель/пересечение на объектах"(?::date, ?::int, -(?::int), 1::int) -- минус - исключить этот объект
where "дата"=?::date
;


@@ строка табеля?cached=1
---   для сохранения ставки
select t.*, p.id as "профиль", og.id as "объект"
from {%= $st->dict->render('табель/join', join_obj=>'left') %}
--- нет точки -запятой! подзапрос?
{%= $where || '' %}


@@ сотрудники на объектах
--- для отчета спец-та по тендерам
select
  "профиль", "ФИО", "должности",
  array_agg("объект") as "объекты",
  array_agg("объект/название") as "объекты/название",
  array_agg("всего смен") as "всего смен",
  array_agg(array_to_string("дни", ', ')) as "дни"
from (
select              
---sum(coalesce(text2numeric(t."значение"), 0::numeric)) as "всего часов",
  count(t."значение") as "всего смен",
  array_agg(date_part('day', t."дата") order by date_part('day', t."дата") ) as "дни",
  og.id as "объект", og.name as "объект/название",
  p.id as "профиль", array_to_string(p.names, ' ') as "ФИО",
  g1."должности"
from 
  {%= $st->dict->render('табель/join') %}
  left join (--- должности 
    select array_agg(g1.name) as "должности" , r1.id2 as pid
    from refs r1 
    {%= $st->dict->render('должности/join') %}
    where n.g_id is null --- нет родителя топовой группы
    group by r1.id2
  ) g1 on p.id=g1.pid
{%= $where || '' %}
---where 
---  (\?::int=0 or og.id=\?) -- объект
---  and "формат месяц2"(t."дата")="формат месяц2"(\?::date) 
---  and t."значение" ~ '^\d+[.,]?\d*$' --- только цифры часов в  строке
  ---and coalesce(og."disable", false)=Х::boolean -- отключенные/не отключенные объекты
group by p.id, g1."должности", og.id, og.name  ---, p.names
---order by p.names
) s
group by "профиль", "ФИО",  "должности"
order by "ФИО"
;

@@ квитки начислено
--- на принтер для табельщиков
select {%= $select || '*' %} from (select s.*, d."должности", o.id::boolean as "печать"
from (
select sum."профиль", sum.names, 
  array_agg(sum."объект") as "объекты",
  array_agg(sum."объект/name") as "объекты/name",
  array_agg(sum."всего часов") as "всего часов",
  array_agg(sum."всего смен") as "всего смен"
  ---array_agg(pay."начислено"::int::boolean) as "начислено"
  
from (
    {%= $st->dict->render('сводка за месяц/суммы', where=>$where) %}
  ) sum
/****  ----------------Начислено---------------------
  left join lateral (
  select text2numeric(t."коммент") as "начислено"
  from 
    {%= $st->dict->render('табель/join') %}
  where p.id=sum."профиль"
    and og.id=sum."объект" -- объект
    and  sum."дата месяц"="формат месяц2"(t."дата") -- 
    and t."значение" = 'Начислено'
    and t."коммент" is not null and "коммент"<>''
  order by t."дата" desc
  limit 1
  ) pay on true
***/
where sum."профиль1/id" is null --- без двойников
  group by sum."профиль", sum.names
) s 

left join (--- должности

    select array_agg(g1.name) as "должности" , r1.id2 as pid
    from refs r1 
    {%= $st->dict->render('должности/join') %}
    where n.g_id is null --- нет родителя топовой группы
    group by r1.id2

) d on s."профиль" = d.pid

left join lateral ( --- установить крыжик печать для сотрудников доступных объектов
  select id
  from "доступные объекты"(?, s."объекты", null)
  limit 1
) o on true
order by s.names
) t;

@@ квитки расчет
--- на принтер для сергея
select {%= $select || '*' %} from (select s.*,
  g1."должности", g1."ИТР?"
  ---"строки расчетов" нет - асинхронно (доп расчеты ЗП)

from (
    {%= $st->dict->render('сводка за месяц/общий список', where=>$where1, union_double_profiles=>1) %}---
  ) s

/*left join lateral (--- хитрая или нет агрегация строк как json
  select ---array_agg("json" order by  "сумма" desc) as "строки расчетов"
    jsonb_agg(m order by  "сумма" desc)  as "строки расчетов"
  from 
  "движение денег/доп записи расчета ЗП"(null::int, s."профиль", ?::date) m
) calc_rows on true
*/


left join /*lateral*/ (--- должности сотрудника
  select
    array_agg(g1.name) as "должности",
    sum((g1.name='ИТР')::int) as "ИТР?",
    r1.id2
  from refs r1 
    {%= $st->dict->render('должности/join') %}
  where /*r1.id2=s."профиль"
    and*/ n.g_id is null --- нет родителя топовой группы
  group by r1.id2
) g1 on g1.id2=s."профиль"

---where s."РасчетЗП/флажок" is not null and s."РасчетЗП/флажок"<>'' ---and s."РасчетЗП"<>''
{%= $where || '' %}
  ---and s."профиль1/id" is null --- без двойников
order by s.names
) t;

@@ доп расчеты ЗП
select ---array_agg("json" order by  "сумма" desc) as "строки расчетов"
  "профиль/id" as pid,
  jsonb_agg(m order by  "сумма" desc)  as "строки расчетов/json"
from 
"движение денег/доп записи расчета ЗП"(null::int, null::int, ?::date) m
group by "профиль/id"
;

@@ расчеты выплаты
-- из табл "движение денег"
select {%= $select || 'm.*' %}
from "движение денег/доп записи расчета ЗП"(?, ?, ?) m
---order by m.ts
{%= $order_by || '' %}
;

@@ сумма начислений месяца
-- по профилю
select sum("сумма") as "начислено", array_agg("примечание") as "примечания"
from "движение ДС/начисления по табелю"-- движение ДС/начисления сотрудникам --  view только  приходы по табелю
where "профиль/id"=?
  and "формат месяц2"("дата") = "формат месяц2"(?::date)
;

@@ сумма выплат месяца
-- по профилю
select sum("сумма") as "выплачено", array_agg('(' || "кошельки"[1][1] || ': ' || "кошельки"[1][2] || ') ' || coalesce("примечание", ''::text)) as "примечания"
from "движение ДС/по сотрудникам"
where "профиль/id"=?
  and "формат месяц2"("дата") = "формат месяц2"(?::date)
  and sign=-1
;


@@ сводка расчета ЗП
--- сворачивает объекты
select {%= $select || '*' %} from (select sum."профиль",
  sum."объекты",
  ---sum."объекты/name",
  sum."Сумма",
  sum."Начислено",
  sum."Доп. часы замстрой",
  sum."Доп. часы замстрой/сумма",
  sum."Доп. часы замстрой/начислено",
  sum."Суточные/сумма",
  sum."Суточные/начислено",
  sum."Отпускные/сумма",
  sum."Отпускные/начислено",
  sum."Переработка/сумма",
  sum."Переработка/начислено",

  sum."РасчетЗП", --из запроса
  sum."РасчетЗП/флажок",---сохраненная строка
  sum."Примечание"
from (
  {%= $st->dict->render('сводка за месяц/общий список', where=>$where) %}---без двойников
) sum


where 
  0::numeric<any(sum."Начислено"||sum."Доп. часы замстрой/начислено"||sum."Отпускные/начислено"||sum."Переработка/начислено"||sum."Суточные/начислено")
  ---or coalesce(, 0::numeric)<>0::numeric
  ---or coalesce(, 0::numeric)<>0::numeric
  ---or coalesce(, 0::numeric)<>0::numeric
  /*** двойники в силе!  and not exists (
    select g1.*
    from refs r1 
    {%= $st->dict->render('должности/join') %}
    where n.g_id is null --- нет родителя топовой группы
      and sum."профиль"=r1.id2
      and g1.name='ИТР'
  ) ***/

---order by sum.names
) t
;

@@ месяц табеля закрыт
select "месяц табеля закрыт"(?::date, ?::int);

@@ месяц табеля закрыт/interval
-- вся запись о всех интервалах для объектов
select row_to_json(t)
from (
select t.* ---, t.val as "val/json"
from "разное" t
where t.key='месяц табеля закрыт/interval'
) t;

@@ открыть месяц объекта
-- ид объекта без пробелов
update "разное"
set val=val || ('{"' || ?::text || '": " ' || (now()-date_trunc('month', ?::date)+'1 day'::interval)::text || ' "}')::jsonb,
  ts=default,
  uid=?
where key='месяц табеля закрыт/interval'
returning *
;

@@ расчеты выплаты не в этом месяце
---
select {%= $select || '*' %}
from (
select m.id, m.ts, m."дата", timestamp_to_json(m."дата"::timestamp) as "$дата/json", m."сумма",m."примечание", "формат даты"(m."дата") as "дата формат",
  sign("сумма"::numeric) as "sign", 
  ---"категории/родители узла/id"(c.id, true) as "категории",
  ---"категории/родители узла/title"(c.id, false) as "категория"
  cc."@id" as "категории", cc."@title" as "категория"
  ---array_to_string(p.names, ' ') as "профиль", p.id as "профиль/id",
  ---null, ---array[[null, null]]::text[][] as "кошельки", --- проект+объект, ...
  ---array[[pr.id, null]]::int[][] as "кошельки/id",  --- проект 0 -- запись для всех проектов
  

from "движение денег" m
  join refs rc on m.id=rc.id2
  join "категории" c on c.id=rc.id1
  left join lateral (select array_agg("id" order by level desc) as "@id", (array_agg("title" order by level desc))[2:] as "@title" from "категории/родители узла"(c.id, true)) cc on true
  
  join refs rp on m.id=rp.id1
  join "профили" p on p.id=rp.id2
  
where 
  p.id = ?
  and "формат месяц2"(m."дата") <> "формат месяц2"(?::date)
  and exists (--- закрыли расчет привязали строки денег к строке расчета (табель)
    select t.*
      from refs rm 
        join "табель" t on t.id=rm.id2
        join refs rp on t.id=rp.id2
      
      where rm.id1= m.id
        and rp.id1=p.id -- профиль
        and "формат месяц2"(t."дата") = "формат месяц2"(m."дата")
        and t."значение"='РасчетЗП'
        and (t."коммент" is not null or t."коммент"::numeric<>0)
  )

) t
;

@@ расчет ЗП
--- закрываем расчет по профилю
select *
from "Расчеты ЗП"
where pid=? and "дата"="формат месяц2"(?::date);

@@ чистка дублей табеля
---непонятно, пока костыль

---select t.*, p.names, o.name
---from (

delete from "табель"
where id in (

select ---t."дата", p.id as pid, o.id as oid,  array_agg(t."значение"), array_agg(t.id), min(t.id), array_agg(t."коммент")
  min(t.id)
from "табель" t
  join refs ro on t.id=ro.id2
  join "roles" o on o.id=ro.id1
  join refs rp on t.id=rp.id2
  join "профили" p on p.id=rp.id1
----where t."коммент" is not null
---(t."значение"~'^\d+[.,]?\d*$' or lower(t."значение")='о')
where length(t."значение") < 4 or t."значение"~'^\d+[.,]?\d*$'
group by t."дата", o.id, p.id ---, t."значение"
having count(distinct t.*)>=2
) ---t
---join "профили" p on p.id=t.pid
---join "roles" o on o.id=t.oid;
returning *;
