@@ таблицы
create table IF NOT EXISTS "{%= $schema %}"."{%= $tables->{main} %}" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  title text not null unique
---  "реквизиты" jsonb,
  /* alter table "контрагенты" add column "АТИ" text unique; */
);


CREATE OR REPLACE FUNCTION "контрагенты/проверка ИНН"(id integer, attrs jsonb)---реквизиты
RETURNS BOOLEAN AS
$func$
BEGIN

IF $2 is null or $2->>'ИНН' is null or $2->>'ИНН'='' THEN
  RETURN true;
END IF;

RETURN NOT EXISTS (
  select k.id
  from "контрагенты" k
  where ($1 is null or k.id!=$1) and coalesce(coalesce(k."реквизиты",'{}'::jsonb)->>'ИНН', '#'||(k.id::text))=coalesce($2,'{}'::jsonb)->>'ИНН'
);
END;
$func$ LANGUAGE PLpgSQL;

/*
ALTER TABLE "контрагенты" ADD CONSTRAINT "контрагенты/проверка ИНН" CHECK ("контрагенты/проверка ИНН"("id", "реквизиты"));
*/

---create table IF NOT EXISTS "{%= $schema %}"."{%= $tables->{main} %}/изменения" () INHERITS ("{%= $schema %}"."{%= $tables->{main} %}");
---alter table "{%= $schema %}"."{%= $tables->{main} %}/изменения" add column  IF NOT EXISTS ts2 timestamp not null DEFAULT now();--- когда изменил
--- НЕТ alter table "{%= $schema %}"."{%= $tables->{main} %}/изменения" add column  IF NOT EXISTS uid_del int not null;--- кто удалил запись


DROP VIEW IF EXISTS "контрагенты/проекты";
CREATE OR REPLACE  VIEW  "контрагенты/проекты" as
select distinct k.*, p.id as "проект/id", p.name as "проект",
  coalesce(k."АТИ", (regexp_match(k.title, 'АТИ\s+(\d+)', 'i'))[1]) as "АТИ title"
from 
  "{%= $schema %}"."{%= $tables->{main} %}" k
  left join (
    select p.*, r.id2
    from "проекты" p
      join refs r on p.id=r.id1
  ) p on k.id=p.id2
---order by k.title
;

/*create table IF NOT EXISTS "{%= $schema %}"."связи/изменение" (
  id integer  NOT NULL,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  old_id1 int, --- бывший ид1
  old_id2 int, --- бывший ид2
  "ordinality" int not null, --- 
  uid int not null --- кто изменил

insert into "связи/изменение" (id, old_id1, old_id2, "ordinality", uid) (select *, 173 from "изменить связи"(90592, 737026) WITH ORDINALITY AS t) returning *;

);*/


/*-----------------------------------------------------------------------------*/
DROP FUNCTION IF EXISTS "изменить связи"(int, int);
CREATE OR REPLACE FUNCTION "изменить связи"(int, int, int)
---RETURNS --SETOF "связи/изменение" AS TABLE (id int, old_id1 int, old_id2 int) AS
RETURNS SETOF "{%= $schema %}"."таблицы/изменения" AS
/*
замены связей объектов
параметры:
1 - id объекта-источника ()
2 - id объекта-получателя 
3 - uid - id профиля

select u.*, r.* from "таблицы/изменения" t join refs r on t.id=r.id, json_populate_record(null::"refs", t.data::json) u where t.id=22383;
*/
$BODY$
BEGIN
  RETURN QUERY 
  with u1 as (
    update refs
    set id1=$2
    where id1=$1
    returning *
  ),
  u2 as (
    update refs
    set id2=$2
    where id2=$1
    returning *
  )

  insert into "{%= $schema %}"."таблицы/изменения" (id, "операция", "таблица", data, uid)
  select u.id, 'обновление', 'refs', row_to_json(u), $3
  from (
    select * from
    (
    select u1.id, $1 as "id1", null as "id2" 
    from u1
    union all
    select u2.id, null, $1
    from u2
    ) u
  ) u
  returning *;

END
$BODY$
LANGUAGE 'plpgsql' ;

/*-----------------------------------------------------------------------------*/
DROP FUNCTION IF EXISTS "почистить контрагентов"();
DROP FUNCTION IF EXISTS "почистить контрагентов"(int);
CREATE OR REPLACE FUNCTION "почистить контрагентов"(int /*uid*/)
RETURNS SETOF "{%= $schema %}"."таблицы/изменения" AS
/*
  находит неиспользуемые (без связей) записи табл "контрагенты"
  Возвращает записанные в табл "таблицы/изменения" удаленные записи
  в формате табл "контрагенты"
*/
$BODY$
BEGIN
  RETURN QUERY 
  WITH del as (
    delete ---select *
    from "контрагенты"
    where id not in (
      select k.id
      from "контрагенты" k
        join refs r on k.id=r.id1 or k.id=r.id2
    )
    returning *
  )
  
  ---тут не надо функцию "удалить объект"
  insert into "{%= $schema %}"."таблицы/изменения" (id, "операция", "таблица", data, uid)
  select del.id, 'удаление', 'контрагенты', row_to_json(del), $1
  from del
  returning *
  ;

END
$BODY$
LANGUAGE 'plpgsql' ;

/*CREATE OR REPLACE FUNCTION "контрагенты/TG"()
RETURNS trigger language plpgsql as
$FUNC$
BEGIN

insert into "{%= $schema %}"."{%= $tables->{main} %}/изменения"
select *, now()
from OLD
;

RETURN OLD;

END
$FUNC$;

DROP TRIGGER IF EXISTS "контрагенты/TG" on "контрагенты";
CREATE TRIGGER   "контрагенты/TG"
AFTER UPDATE or DELETE ON "контрагенты"
    FOR EACH ROW EXECUTE FUNCTION "контрагенты/TG"();
*/

CREATE OR REPLACE FUNCTION "чистый контрагент"(text)
RETURNS text AS
/*
  
*/
$BODY$
BEGIN
  RETURN regexp_replace(regexp_replace(regexp_replace(lower($1), '\s{2,}', ' ', 'g'),'^\s+|\s+$|"|«|»|','', 'g'), '(^|\s)(?:ип|ооо|зао|оао)(\s|$)','', 'g');
END
$BODY$
LANGUAGE 'plpgsql' ;


/*** конец таблицы и функции ***/

@@ список?cached=1
--
select {%= $select || '*' %} from (
  select *
  from "контрагенты/проекты" 
) k
---order by k.title
;

@@ контрагент?cached=1
-- по id || title
select *
from "контрагенты/проекты"
where 
  id =? or "чистый контрагент"(title)="чистый контрагент"(?::text)
;


@@ почистить таблицу
select *---json_agg(d)
from "почистить контрагентов"(?) d;

;


@@ изменить связи
--- замена контрагентов
/*with u as (
  insert into "связи/изменение" (id, old_id1, old_id2, "ordinality", uid)
  (select *, ? from "изменить связи"(?, ?) WITH ORDINALITY AS t)
  returning *
)*/

select json_agg(u)
from "изменить связи"(?, ?, ?) u;

@@ контрагент/ИНН
--- поиск по инн
select *
from "контрагенты"
where coalesce(coalesce("реквизиты",'{}'::jsonb)->>'ИНН', '#'||(id::text))=?
;