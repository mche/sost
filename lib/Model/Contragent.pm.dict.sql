@@ таблицы
create table IF NOT EXISTS "{%= $schema %}"."{%= $tables->{main} %}" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  title text not null unique
---  "наименование" text, --- полное
---  "реквизиты" jsonb,
---  "в лице" text,
---  "расшифровка подписи"
---  "на основании" text --- действует
  /* alter table "контрагенты" add column "АТИ" text unique; */
);

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
  id =? or lower(regexp_replace(title, '\s{2,}', ' ', 'g')) = lower(regexp_replace(?::text, '\s{2,}', ' ', 'g'))
;


@@ почистить таблицу
---select *
delete
from "контрагенты"
where id not in (
  select k.id
  from "контрагенты" k
    join refs r on k.id=r.id1 or k.id=r.id2
)
returning *
;