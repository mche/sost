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
  my $s = $self->получить_или_вставить("медкол", "сессии", ['id'], {id=>$id}, {id=>'default'});
  $self->dbh->selectrow_hashref($self->sth('сессия'), undef, $s->{id});
  
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

sub заданный_вопрос {# без ответа
  my ($self, $sess_id) = @_;
  $self->dbh->selectrow_hashref($self->sth('заданный вопрос'), undef, $sess_id);
}

sub начало_теста {# связать список тестов с сессией
  my ($self, $sess_id, $sha1) = @_;
  $self->dbh->selectrow_hashref($self->sth('начало теста'), undef, $sess_id, $sha1);
}

sub новый_вопрос {# закинуть в процесс вопрос
  my ($self, $sess_id) = @_;
  
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
  "ts" timestamp without time zone not null default now(), --время вопроса
  ---это связь---"вопрос" int not null,
  "ответ" int null,--- ответ - это индекс массива ответов
  "время ответа" timestamp without time zone null
);

@@ сессия
selects.*, t.id as "название теста/id", t."название" as "название теста"
from "медкол"."сессии" s
  left join (
    select t.*, r.id2
    from "медкол"."связи" r
      join "медкол"."названия тестов" t on t.id=r.id1
  ) t  on s.id=t.id2
where s.id=?;

@@ названия тестов
select *, encode(digest("ts"::text || id::text, 'sha1'),'hex') as id_digest
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


@@ заданный вопрос
--- в сессии, без ответа
select s.*, q."id" as "вопрос/id", q."вопрос"
from "медкол"."связи" r
  join "медкол"."процесс сдачи" p on p.id=r.id2
  join "медкол"."связи" r2 on p.id=r2.id2
  join "медкол"."тестовые вопросы" q on q.id=r2.id1
where r.id1=? -- ид сессии
  and s."ответ" is null
limit 1
;

@@ начало теста
--- связать "названия тестов" с сессией
insert into "медкол"."связи" (id1, id2)
select t.id, ?::int as id2 -- ид сессии
from "медкол"."названия тестов" t
where encode(digest(t."ts"::text || t.id::text, 'sha1'),'hex')=?
returning *
;

@@ новый вопрос
--- связать "процесс сдачи" -> "тестовые вопросы"
with p as (
  insert into "медкол"."процесс сдачи" (ts) values(default)  returning *
) 
insert into "медкол"."связи" (id1, id2)
select q.id
from "медкол"."названия тестов" t
  join "медкол"."связи" r1 on t.id=r1.id1
  join "медкол"."сессии" s on s.id=r1.id2
  join "медкол"."связи" r2 on t.id=r2.id1
  join "медкол"."тестовые вопросы" q on q.id=r2.id2
  left join (-- которых не было в этой сессии
    select q.id, r.id1 --- ид сессии
    from "медкол"."связи" r
      join "медкол"."процесс сдачи" p on p.id=r.id2
      join "медкол"."связи" r2 on p.id=r2.id2
      join "медкол"."тестовые вопросы" q on q.id=r2.id1
  ) pq on s.id=pq.id1
where s.id=? 
  and pq.id is null 
order by random()
limit 1
;