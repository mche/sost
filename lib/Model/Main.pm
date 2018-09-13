package Model::Main;
use Mojo::Base 'Model::Base';
#~ use Mojo::Util qw(dumper);

#~ has sth_cached => 1;
#~ my $main_table = '';
has [qw(app)];


sub init {
  #~ state $self = shift->SUPER::new(@_);
  my $self = shift;
  #~ $self->{template_vars}{tables}{main} = $main_table;
  #~ $self->dbh->do($self->sth('таблицы'));
  $self->dbh->do($self->sth('функции'));
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
CREATE OR REPLACE FUNCTION "удалить объект"(/*schema*/ text, /*object table*/ text, /*table refs*/ text, /* id object */int)
RETURNS text[] language plpgsql as
$FUNC$
DECLARE
   v_id int;
   v_data json;
   arr_ret text[];---возврат массив удалений
BEGIN
  
/***
1 агрумент - схема БД
2 аргумент - таблица объекта-записи
3 агрумент - таблица связей
4 аргумент - ид объекта-записи

***/
select e.data into /*STRICT*/ v_data
from exec_query_1bind(format('delete from %I.%I as tbl where id=$1 returning row_to_json(tbl)', $1, $2), $4) as e(data json);

IF v_data IS NULL THEN
  RAISE NOTICE 'В таблице "%"."%" нет такого id=%', $1, $2, $4;
  RETURN null;
END IF;

RAISE INFO 'В таблице "%"."%"  удалена запись %', $1, $2, v_data::text;
select array_cat(array[[]]::text[], array[[format('%I.%I', $1, $2), v_data::text]]) into arr_ret;

FOR v_data IN
  select e.data
  from exec_query_1bind(format('delete from %I.%I as tbl where $1=any(array[id1, id2]) returning row_to_json(tbl)', $1, $3), $4) as e(data json)
LOOP
  RAISE INFO 'В таблице "%"."%"  удалена запись %', $1, $3, v_data::text;
  select array_cat(arr_ret, array[[format('%I.%I', $1, $3), v_data::text]]) into arr_ret;
END LOOP;

RETURN arr_ret;

END
$FUNC$;
