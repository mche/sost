@@ таблицы
/* посылка своего контакта боту */
create table IF NOT EXISTS "{%= $schema %}"."tg_contact" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  user_id integer unique,
  first_name text,
  last_name text,
  phone_number text
);

@@ профиль-контакты
--- на один профиль может несколько контактов-номеров тел
select p.*, row_to_json(c) as "tg_contact"
from 
  "профили" p
  {%= $join_contact || 'left' %} join (
    select c.*, r.id1
    from "{%= $schema %}"."tg_contact" c 
    join refs r on c.id=r.id2
  ) c on p.id=c.id1
{%= $where || '' %}
