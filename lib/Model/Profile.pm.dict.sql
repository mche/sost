@@ изменения
alter table "профили" add column tel text[];
alter table "профили" add column descr text;
alter table "профили" add column "дата рождения" date;

alter table "профили" add unique(names);

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
