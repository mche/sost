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

sub сохранить_тест {
  my ($self, $k, $q, $ans) = @_;
  $self->обновить_или_вставить("медкол", "тесты", ['код'], {'код'=>$k, 'вопрос'=>$q, 'ответы'=>$ans,},);
}


1;

__DATA__
@@ схема
CREATE SCHEMA IF NOT EXISTS "медкол";
CREATE SEQUENCE IF NOT EXISTS "медкол"."ИД";
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS "медкол"."тесты" (
  "id" int NOT NULL PRIMARY KEY default nextval('"медкол"."ИД"'::regclass),
  "код" text not null unique,
  "вопрос" text not null,
  "ответы" text[] not null
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

