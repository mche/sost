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
  id,
  "names",
  "last_modified"::bigint+2147483648::bigint as "last_modified",--- секунды
  timestamp_to_json(timestamp with time zone 'epoch' + ("last_modified"::bigint+2147483648::bigint) * INTERVAL '1 second') as "$last_modified/json",--- без  т.к. будет свой JSON.parse
  "size"::bigint+2147483648::bigint as "size",
  "content_type"
  
  from "{%= $schema %}"."файлы"
{%= $where || '' %}
{%= $order_by || '' %}
