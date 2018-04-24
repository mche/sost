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

CREATE OR REPLACE FUNCTION "удалить объект"(/*schema*/ text, /*object table*/ text, /*table refs*/ text, /* id object */int)
RETURNS void language plpgsql as
$FUNC$
DECLARE
   v_id int;
BEGIN
/***
1 агрумент - схема БД
2 аргумент - таблица объекта-записи
3 агрумент - таблица связей
4 аргумент - ид объекта-записи

***/
select e.id into /*STRICT*/ v_id
from exec_query_1bind(format('delete from %I.%I as tbl where id=$1 returning id', $1, $2), $4) as e(id int);

IF v_id IS NULL THEN
  RAISE NOTICE 'В таблице "%"."%" нет такого id=%', $1, $2, $4;
  RETURN;
END IF;

RAISE INFO 'В таблице "%"."%"  удалена запись id=%', $1, $2, v_id;

FOR v_id IN
  select e.id
  from exec_query_1bind(format('delete from %I.%I as tbl where $1=any(array[id1, id2]) returning id', $1, $3), v_id) as e(id int)
LOOP
  RAISE INFO 'В таблице "%"."%"  удалена запись id=%', $1, $3, v_id;
END LOOP;


END
$FUNC$;
