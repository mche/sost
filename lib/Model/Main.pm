package Model::Main;
use Mojo::Base 'Model::Base';
#~ use Mojo::Util qw(dumper);

#~ our $DATA = ['Main.pm.dict.sql'];

#~ has sth_cached => 1;
#~ my $main_table = '';
has [qw(app)];


sub init {
  #~ state $self = shift->SUPER::new(@_);
  my $self = shift;
  #~ $self->{template_vars}{tables}{main} = $main_table;
  #~ $self->dbh->do($self->sth('таблицы'));
  $self->dbh->do($self->sth('функции'));
  #~ $self->app->log->error($self->dict->render('extra foo'));
  #~ return $self;
}

sub конфиг {
  my ($self) = @_;
  
  $self->dbh->selectall_arrayref($self->sth('конфиг'), {Slice=>{}},);
  
}


1;

__DATA__
@@ конфиг?cache=1&cached=1
select *
from "Конфиг"()
;


/* коммент чтобы не затирать версию, меняй в консоле
CREATE OR REPLACE FUNCTION  "Конфиг"()
RETURNS TABLE("key" text, "value" text) AS $func$
SELECT *
FROM (VALUES
  ('VERSION', '2017-07-27')
) AS s ("key", "value");
$func$ LANGUAGE SQL;

*/

@@ функции

create table IF NOT EXISTS "{%= $schema %}"."таблицы/изменения" (
  id integer  NOT NULL,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  "операция" text not null,
  ---"схема" text not null, --- в каждой схеме такая таблица
  "таблица" text not null,
  data jsonb not null,
  uid int
);

---
CREATE OR REPLACE FUNCTION public.exec_query_1bind(text, anyelement)
RETURNS SETOF RECORD
LANGUAGE 'plpgsql'
AS $BODY$
/*** 
1 аргумент - SQL-зарос
2 аргумент - только одно бинд-значение
***/
BEGIN 
    RETURN QUERY EXECUTE $1 using $2 ; 
END 
$BODY$;

CREATE OR REPLACE FUNCTION public.exec_query_2bind(text, anyelement, anyelement)
RETURNS SETOF RECORD
LANGUAGE 'plpgsql'
AS $BODY$
/***
1 аргумент - SQL-зарос
2 аргумент - первое бинд-значение
3 аргумент - второе бинд-значение
***/
BEGIN 
    RETURN QUERY EXECUTE $1 using $2, $3 ; 
END 
$BODY$;

DROP FUNCTION IF EXISTS "удалить объект"(text,text,text,int);
DROP FUNCTION IF EXISTS "удалить объект"(text,text,text,int, int);
CREATE OR REPLACE FUNCTION "удалить объект"(/* схема */ text, /* таблица */ text, /* таблица связей */ text, /* ИД строки таблицы */ int, /* uid */ int)
RETURNS text[] language plpgsql as
$FUNC$
DECLARE
   rec record;
   a_ret text[] := array[]::text[];---возврат массив удалений
BEGIN
  
/***
1 агрумент - схема БД
2 аргумент - таблица объекта-записи
3 агрумент - таблица связей
4 аргумент - ид объекта-записи
5                    - uid кто

***/
select $4 as "id", 'удаление'::text as "операция", $2 as "таблица", e.data, $5 as uid into /*STRICT*/ rec
from exec_query_1bind(format('delete from %I.%I as tbl where id=$1 returning row_to_json(tbl)', $1, $2), $4) as e(data json);

IF rec IS NULL THEN
  RAISE NOTICE 'В таблице "%"."%" нет такого id=%', $1, $2, $4;
  RETURN null;
END IF;

EXECUTE format('insert into %I."таблицы/изменения" (id, "операция", "таблица", data, uid) values ($1,$2,$3,$4,$5)', $1)
  USING rec.id, rec."операция", rec."таблица", rec.data, rec.uid;

RAISE INFO 'В таблице "%"."%"  удалена запись %', $1, $2, rec.data::text;
---select array_cat(array[[]]::text[], array[[format('%I.%I', $1, $2), rec.data::text]]) into a_ret;
select array_append(a_ret, rec::text) into a_ret;

/* цикл удаления связей */
FOR rec IN
  select e.id, 'удаление'::text as "операция", $3 as "таблица", e.data, $5 as uid
  from exec_query_1bind(format('delete from %I.%I as tbl where ($1=id1 or $1=id2)
  returning tbl.id, row_to_json(tbl)', $1, $3), $4) as e(id int, data json)
LOOP
  
  EXECUTE format('insert into %I."таблицы/изменения" (id, "операция", "таблица", data, uid) values ($1,$2,$3,$4,$5)', $1)
    USING rec.id, rec."операция", rec."таблица", rec.data, rec.uid;

  RAISE INFO 'В таблице "%"."%"  удалена запись %', $1, $3, rec.data::text;
  ---select array_cat(a_ret, array[[format('%I.%I', $1, $3), rec.data::text]]) into a_ret;
  select array_append(a_ret, rec::text) into a_ret;
END LOOP;

RETURN a_ret;

END
$FUNC$;
