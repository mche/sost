package Model::MedCol;
use Mojo::Base 'Model::Base';
#~ use Util;

#~ has sth_cached => 1;
has [qw(app)];

sub new {
  state $self = shift->SUPER::new(@_);
  $self->dbh->do($self->sth('схема'));
  #~ $self->dbh->do($self->sth('функции'));
  return $self;
}

sub сессия {
  my ($self, $id) = @_;
  $self->получить_или_вставить("медкол", "сессии", ['id'], {id=>$id}, {id=>'default'});
  #~ $self->dbh->selectrow_hashref($self->sth('сессия'), undef, $id);
  
}

sub сохранить_название {
  my ($self, $id, $name) = @_;
  my $r = $self->dbh->selectrow_hashref($self->sth('названия тестов', where=>' where "название"=? '), undef, $name);
  return $r
    if $r;
  $self->обновить_или_вставить("медкол", "названия тестов", ['id'], {'id'=>$id, 'название'=>$name,},);
}

sub сохранить_тестовый_вопрос {
  my ($self, $k, $q, $ans, $list) = @_; # код, вопрос, ответы, принадлежность к списку
  my $r = $self->обновить_или_вставить("медкол", "тестовые вопросы", ['код'], {'код'=>$k, 'вопрос'=>$q, 'ответы'=>$ans,},);
  $self->связь(ref $list ? $list->{id} : $list, $r->{id});
  return $r;
}

sub названия_тестов {
  my ($self,) = @_;
  $self->dbh->selectall_arrayref($self->sth('названия тестов'), {Slice=>{}},);
  
};

sub вопросы_списка {
  my ($self, $id) = @_;
  $self->dbh->selectall_arrayref($self->sth('вопросы списка', order_by=> 'order by "id" '), {Slice=>{}}, ($id) x 2, );
}

sub связь {
  my ($self, $id1, $id2) = @_;
  $self->вставить_или_обновить("медкол", "связи", ["id1", "id2"], {id1=>$id1, id2=>$id2,});
}

1;

__DATA__
@@ схема
CREATE SCHEMA IF NOT EXISTS "медкол";
CREATE SEQUENCE IF NOT EXISTS "медкол"."ИД";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS "медкол"."тестовые вопросы" (
  "id" int NOT NULL PRIMARY KEY default nextval('"медкол"."ИД"'::regclass),
  "ts" timestamp without time zone not null default now(),
  "код" text not null unique,
  "вопрос" text not null,
  "ответы" text[] not null
);

CREATE TABLE IF NOT EXISTS "медкол"."названия тестов" (
  "id" int NOT NULL PRIMARY KEY default nextval('"медкол"."ИД"'::regclass),
  "ts" timestamp without time zone not null default now(),
  "название" text not null unique
);

CREATE TABLE IF NOT EXISTS "медкол"."связи" (
  "id" int NOT NULL PRIMARY KEY default nextval('"медкол"."ИД"'::regclass),
  "ts" timestamp without time zone not null default now(),
  "id1" int not null,
  "id2" int not null,
  unique(id1, id2)
);
CREATE INDEX  IF NOT EXISTS  "связи/индекс id2"  ON  "медкол"."связи" (id2);

CREATE TABLE IF NOT EXISTS "медкол"."сессии" (
  "id" int NOT NULL PRIMARY KEY default nextval('"медкол"."ИД"'::regclass),
  "ts" timestamp without time zone not null default now()
);

CREATE TABLE IF NOT EXISTS "медкол"."процесс сдачи" (
  "id" int NOT NULL PRIMARY KEY default nextval('"медкол"."ИД"'::regclass),
  "время вопроса" timestamp without time zone not null default now(),
  "вопрос" int not null,
  "ответ" int null,--- ответ - это индекс массива ответов
  "время ответа" timestamp without time zone null
); 

@@ названия тестов
select *
from "медкол"."названия тестов"
{%= $where || '' %}
order by "название"
;

@@ вопросы списка
select {%= $select || '*' %} from (
select n.id as "ид списка", n."название", q.*
from "медкол"."названия тестов" n
  join "медкол"."связи" r on n.id=r.id1
  join "медкол"."тестовые вопросы" q on q.id=r.id2

where (coalesce(?::int, 0)=0 or n.id=?)
) q
{%= $order_by || '' %}

