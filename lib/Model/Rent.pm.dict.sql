@@ таблицы
create table IF NOT EXISTS "аренда/объекты" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  "адрес" text not null unique, --
  "коммент" text
);

create table IF NOT EXISTS "аренда/помещения" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  "номер-название" text not null, --
  "этаж" smallint not null,
  "площадь" numeric not null,
  "коммент" text
/*
id1("аренда/объекты")->id2("аренда/помещения")
*/
);

create table IF NOT EXISTS "аренда/договоры" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  "номер" text not null, --
  "дата1" date not null, -- начало
  "дата2" date not null, -- конец
  "коммент" text
/* связи:
id1("контрагенты")->id2("аренда/договоры")
id1("аренда/договоры")->id2("аренда/договоры-помещения") 
*/
);

create table IF NOT EXISTS "аренда/договоры-помещения" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  "ставка" money, -- кв.м./месяц -- ALTER TABLE "аренда/договоры-помещения" ALTER COLUMN  "ставка" DROP NOT NULL;
  "сумма" money, -- или сумма /месяц -- ALTER TABLE "аренда/договоры-помещения" ADD COLUMN "сумма" money;
  "коммент" text
---  ALTER TABLE "аренда/договоры-помещения" ADD CONSTRAINT "аренда/договоры-помещения/ставка|сумма" CHECK ( "ставка" is not null or "сумма" is not null );
/* связи:
id1("аренда/договоры")->id2("аренда/договоры-помещения")
id1("аренда/помещения")->id2("аренда/договоры-помещения")
*/
);


@@ объекты/список или позиция
select o.*,
  ob.id as "объект/id",
  row_to_json(ob) as "$объект/json",
  p."@кабинеты/json", p."@кабинеты/id"
from "аренда/объекты" o
  join refs ro on o.id=ro.id2
  join roles ob on ob.id=ro.id1
  left join (
    select o.id, jsonb_agg(p order by p.id) as "@кабинеты/json", array_agg(p.id order by p.id) as "@кабинеты/id"
    from "аренда/объекты" o
      join "refs" r on o.id=r.id1
      join "аренда/помещения" p on p.id=r.id2
    group by o.id
  ) p on o.id=p.id
{%= $where || '' %}
{%= $order_by || 'order by ob."name"  ' %}

@@ договоры
select d.*,
  timestamp_to_json(d."дата1"::timestamp) as "$дата1/json",
  timestamp_to_json(d."дата2"::timestamp) as "$дата2/json",
  row_to_json(k) as "$контрагент/json",
  k.id as "контрагент/id",
  dp.*,
  dp."@кабинеты/id" as "@помещения/id"
from 
  "аренда/договоры" d
  join refs r on d.id=r.id2
  join "контрагенты" k on k.id=r.id1
  left join (
    select d.id as "договор/id",
      jsonb_agg(p order by p.id) as "@помещения/json",
      array_agg(p."помещение/id" order by p.id) as "@кабинеты/id",
      array_agg(p.id  order by p.id) as "@договоры/помещения/id"
    from "аренда/договоры" d
      join refs r on d.id=r.id1
      join (
        {%= $dict->render('договоры/помещения') %}
      ) p on p.id=r.id2
    group by d.id
  ) dp on d.id=dp."договор/id"
{%= $where || '' %}
{%= $order_by || 'order by d."дата1" desc, d.id desc  ' %}

@@ договоры/помещения
select p.id as "помещение/id", row_to_json(p) as "$помещение/json",
  o.id as "аренда/объект/id", row_to_json(o) as "$аренда/объект/json",
  ob.id as "объект/id", row_to_json(ob) as "$объект/json",
  r.*
from "аренда/договоры-помещения" r
  join refs r1 on r.id=r1.id2
  join "аренда/помещения" p on p.id=r1.id1
  join refs r2 on p.id=r2.id2
  join "аренда/объекты" o on o.id=r2.id1
  join refs ro on o.id=ro.id2
  join "roles" ob on ob.id=ro.id1
{%= $where || '' %}
{%= $order_by || '' %}