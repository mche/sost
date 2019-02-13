@@ изменения
alter table "профили" add column tel text[];
alter table "профили" add column descr text;
alter table "профили" add column "дата рождения" date;
alter table "профили" add column "options" jsonb;
---update "профили" set options='{"jsDebug":true}' where id=1732;

alter table "профили" add unique(names);

CREATE OR REPLACE FUNCTION "профили/проверка телефона"(pid integer, tels text[])
RETURNS BOOLEAN AS
$func$
BEGIN
RETURN NOT EXISTS (
  select p.tel
  from ( select right(regexp_replace(unnest(tel), '\D+', '', 'g'), 10) as tel from "профили" where id<>pid) p
    join (select right(regexp_replace(unnest(tels), '\D+', '', 'g'), 10) as tel) c on p.tel=c.tel
);
END;
$func$ LANGUAGE PLpgSQL;

ALTER TABLE "профили" ADD CONSTRAINT "профили/проверка телефона" CHECK ("профили/проверка телефона"(id, tel));

@@ список или позиция
select *
from "профили"
where ?::int is null ---and not coalesce(disable, false))
  or id=?
order by names
;

@@ задать пароль
update "logins"
set pass=?
where login=?
returning *;

@@ список логинов
select p.id as "профиль/id", p.names, l.*
from logins l
  join refs r on l.id=r.id2
  join "профили"  p on p.id=r.id1
order by p.names
;
