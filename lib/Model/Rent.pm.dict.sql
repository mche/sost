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
  "дата" date not null, -- начало
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
  "ставка" money not null, -- кв.м./месяц
  "коммент" text
/* связи:
id1("аренда/договоры")->id2("аренда/договоры-помещения")
id1("аренда/помещения")->id2("аренда/договоры-помещения")
*/
);


@@ объекты/список или позиция
select o.*,
  p."@кабинеты/json", p."@кабинеты/id"
from "аренда/объекты" o
  left join (
    select o.id, jsonb_agg(p order by p.id) as "@кабинеты/json", array_agg(p.id order by p.id) as "@кабинеты/id"
    from "аренда/объекты" o
      join "refs" r on o.id=r.id1
      join "аренда/помещения" p on p.id=r.id2
    group by o.id
  ) p on o.id=p.id
{%= $where || '' %}
{%= $order_by || 'order by o."адрес"  ' %}

@@ договоры
select d.*
  dp.*
from 
  "аренда/договоры" d
  left join (
    select d.id as "договор/id",
      jsonb_agg(p) as "@помещения/json"
    from "аренда/договоры" d
      join refs r on d.id=r.id1
      join (
        {%= $dict->render('договоры/помещения') %}
      ) p on p.id=r.id2
    group by d.id
  ) dp on d.id=dp."договор/id"

@@ договоры/помещения
select p.id as "помещение/id",
  r.*
from "аренда/договоры-помещения" r
  join refs r1 on r.id=r1.id2
  join "аренда/помещения" p on p.id=r1.id1
{%= $where || '' %}
{%= $order_by || '' %}