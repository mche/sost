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
  
);

DROP VIEW IF EXISTS "контрагенты/проекты";
CREATE OR REPLACE  VIEW  "контрагенты/проекты" as
select distinct k.*, p.id as "проект/id", p.name as "проект"
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
