@@ таблицы
create table IF NOT EXISTS "{%= $schema %}"."файлы" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- кто записал
  "names" text[] not null,--- param('relativePath')
  "last_modified" int not null, ---  (param('last_modified')::bigint)/1000-2147483648::bigint;  select timestamp with time zone 'epoch' + (?::bigint+2147483648::bigint)::int * INTERVAL '1 second';
  "size" int not null, ---  (param('totalSize')::bigint)-2147483648::bigint; 
  "content_type" text not null ---$upload->headers->content_type
  ---"коммент" text null
/***
связи

***/
);


@@ файлы
select
  f.id,
  timestamp_to_json(f.ts) as "$ts/json",
  f.uid,
  u.names as "@автор",
  f."names",
  f."last_modified"::bigint+2147483648::bigint as "last_modified",--- секунды
  timestamp_to_json(timestamp with time zone 'epoch' + ("last_modified"::bigint+2147483648::bigint) * INTERVAL '1 second') as "$last_modified/json",--- без  т.к. будет свой JSON.parse
  f."size"::bigint+2147483648::bigint as "size",
  f."content_type",
  encode(digest(f.id::text||f.ts::text, 'sha1'),'hex') as "sha1",
  r.id1 as "parent_id"
  
  from "{%= $schema %}"."файлы" f
    left join refs r on f.id=r.id2
    join "профили" u on f.uid=u.id
{%= $where || '' %}
{%= $order_by || '' %}

@@ переименовать папку
--- топ папку
update "{%= $schema %}"."файлы" f
set "names"= ?::text[] || names[(case when array_length("names", 1)>1 then 2 else 1 end):]
from refs r
{%= $where || '' %}
returning *
;

@@ переместить в папку
--- топ папку
update "{%= $schema %}"."файлы" f
set "names"= ?::text[] || names[(case when array_length("names", 1)>1 then 2 else 1 end):]
{%= $where || '' %}
returning *
;

