package Model::MedCol;
use Mojo::Base 'Model::Base';
#~ use Util;

#~ has sth_cached => 1;
has [qw(app)];
has время_теста => 3600;# по умолчанию
has задать_вопросов => 60;# по умолчанию

sub init {
  #~ state $self = shift->SUPER::new(@_);
  my $self = shift;
  $self->dbh->do($self->sth('схема'));
  #~ $self->dbh->do($self->sth('функции'));
  #~ return $self;
}

#~ sub defaults {
  #~ my $self = shift;
  #~ my $r = $self->_update("медкол", "умолчания", ['id'], {id=>$id})
  #~ $self->dbh->selectrow_hashref('select * from "медкол"."умолчания" set '
#~ };

sub сессия_или_новая {# текущая
  my ($self, $id) = @_;
  my $s = $self->_select("медкол", "сессии", ['id'], {id=>$id})
    if $id;
  $s ||= $self->_insert("медкол", "сессии", ['id'], {}, {id=>'default',})
  #$self->получить_или_вставить("медкол", "сессии", ['id'], {$id ? (id=>$id) : (),}, {$id ? () : (id=>'default'),})
    or die "Нет такой сессии";
  $self->dbh->selectrow_hashref($self->sth('сессия', where=>' where s.id=? '), undef, (undef) x 3, $s->{id});
  
  
}

sub сессию_продлить {# обновить начало сессии
  my ($self, $id) = @_;
  $self->_update("медкол", "сессии", ['id'], {id=>$id}, {ts=>'now()',});
};

sub сессия {# любая
  my ($self, $id,) = @_;
  $self->dbh->selectrow_hashref($self->sth('сессия', where=>' where s.id=? '), undef, ($self->время_теста) x 3, $id);
}

sub сессия_sha1 {# любая
  my ($self, $sha1,) = @_;
  $self->dbh->selectrow_hashref($self->sth('сессия', where=>' where "сессия/sha1"=? '), undef, ($self->время_теста) x 3, $sha1);
}

sub фиксировать_сессию {# и можно переключить на новую
  my ($self, $id,) = @_;
  my $old = $self->сессия($id)
    or return $self->сессия_или_новая();
  #~ $self->app->log->debug($self->app->dumper($old));
  unless ($old->{'получено ответов'}) {# забыть без ответов
    #~ $self->app->log->debug($self->app->dumper($old));
    $self->удалить_объект("процесс сдачи", $_)
      for @{$old->{"процесс сдачи/id"} || []};
    
    $self->связь_удалить(id1=>$old->{'название теста/id'}, id2=>$id);
    
    my $sess = $self->сессия($id);
    
    #~ $self->app->log->debug($self->app->dumper($sess));
    #~ $self->сессию_продлить($old->{id});
    return $sess; # снова запросить
    
  }
  
  my $cnt = $old->{'тест/задать вопросов'} || $self->задать_вопросов;
  $self->_update("медкол", "сессии", ['id'], {id=>$old->{id}, 'задать вопросов'=>$cnt},);
    #~ if $old->{'получено ответов'};# хоть один ответ
    #$old->{'задано вопросов'} eq $cnt; #
  my $new = $self->сессия_или_новая();
  $self->связь($old->{id}, $new->{id});
  return $new;
}

sub сохранить_название {
  my ($self, $id, $name, $cnt, $sec) = @_;
  my $r = $self->обновить_или_вставить("медкол", "названия тестов", ['id'], {'id'=>$id, 'название'=>$name, 'задать вопросов'=>$cnt, 'всего время'=>$sec, },);
  #~ $self->dbh->selectrow_hashref($self->sth('названия тестов', where=>' where "id"=? '), undef, $r->{'id'});
  
}

sub сохранить_тестовый_вопрос {
  my ($self, $k, $q, $ans, $list) = @_; # код, вопрос, ответы, принадлежность к списку
  my $r = $self->обновить_или_вставить("медкол", "тестовые вопросы", ['код'], {'код'=>$k, 'вопрос'=>$q, 'ответы'=>$ans,},);
  $self->связь(ref $list ? $list->{id} : $list, $r->{id});
  return $r;
}

sub удалить_вопросы_из_списка {# которые не указаны в ids
  my ($self, $test_id, $ids) = @_;
  $self->dbh->selectall_arrayref($self->sth('удалить из теста'), {Slice=>{}}, $test_id, $ids, $test_id);
  
}


sub названия_тестов {
  my ($self, $param) = (shift, ref $_[0] ? shift : {@_});
  $self->dbh->selectall_arrayref($self->sth('названия тестов', where=>$param->{where} || ''), {Slice=>{}},($self->время_теста) x 3, @{$param->{bind} || []},);
  
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
  $self->dbh->do($self->sth('обрубить сессию от теста'), undef, $sess_id);
  $self->dbh->do($self->sth('обрубить сессию от процесса'), undef, $sess_id);
  $self->dbh->selectrow_hashref($self->sth('начало теста'), undef, ($sess_id) x 1, $sha1)# свяжет сессию с тестом
    or die "Нет такого теста";
  # обновить начало сессии
  $self->сессию_продлить($sess_id); #$self->_update("медкол", "сессии", ['id'], {id=>$sess_id}, {ts=>'now()',});
  $self->dbh->selectrow_hashref($self->sth('сессия', where=>' where s.id=? '), undef, (undef) x 3, $sess_id);
}

sub новый_вопрос {# закинуть в процесс вопрос
  my ($self, $sess_id) = @_;
  my $q = $self->dbh->selectrow_hashref($self->sth('новый вопрос'), undef, $sess_id);
  # связать "сессия" -> "процесс сдачи"(создать запись) -> "тестовые вопросы"(новый вопрос)
  my $p = $self->_insert("медкол", "процесс сдачи", undef, {}, {ts=>'default'});
  $self->связь($sess_id, $p->{id});
  $self->связь($p->{id}, $q->{id});
  return $self->заданный_вопрос($sess_id);
}

sub сохранить_ответ {
  my ($self, $process_id, $idx) = @_;
  $self->_update("медкол", "процесс сдачи", ['id'], {id=>$process_id, 'ответ'=>$idx}, {'время ответа'=>'now()'});
}

sub мои_результаты {
  my ($self, $sess_id) = @_;
  $self->dbh->selectall_arrayref($self->sth('мои результаты'), {Slice=>{}},$sess_id, $self->задать_вопросов);
}

sub результаты_сессий {
  my ($self, $param) = (shift, ref $_[0] ? shift : {@_}) ;
  my @where = ();
  push @where,  ' t.id=? '
    if $param->{test_id};
  push @where,  ' (s."ts" between ?::timestamp and ?::timestamp) '
    if $param->{"сессия от"} || $param->{"сессия до"};
  my @bind = ($self->задать_вопросов);
  push @bind, $param->{test_id}
    if $param->{test_id};
  push @bind, ($param->{"сессия от"} || '2000-01-01', $param->{"сессия до"} || '2100-01-01')
    if $param->{"сессия от"} || $param->{"сессия до"};
  
  $self->dbh->selectall_arrayref($self->sth('результаты сессий', where=>@where && 'where '.join(' and ', @where), limit=>'LIMIT '.($param->{limit} || 30), offset=>'OFFSET '.($param->{offset} || 0)), {Slice=>{}}, @bind);
}

sub неправильные_ответы {
  my ($self, $sess_id) = @_;
  $self->dbh->selectall_arrayref($self->sth('неправильные ответы'), {Slice=>{}},$sess_id);
}

sub связь_удалить {
  my $self = shift;
  my $data = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectrow_hashref($self->sth('связь удалить'), undef, (@$data{qw(id id1 id2)}));


}

sub удалить_объект {
  my ($self, $table, $id) = @_;
  $self->dbh->selectrow_hashref($self->sth('удалить объект'), undef, $table, $id);
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
  "название" text not null unique,
  "задать вопросов" int,
  "всего время" int --- секунд
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
  "ts" timestamp without time zone not null default now(),
  "задать вопросов" int --- из "названия тестов" если изменится
);

CREATE TABLE IF NOT EXISTS "медкол"."процесс сдачи" (
  "id" int NOT NULL PRIMARY KEY default nextval('"медкол"."ИД"'::regclass),
  "ts" timestamp without time zone not null default now(), --время вопроса
  ---это связь---"вопрос" int not null,
  "ответ" int null,--- ответ - это индекс массива ответов
  "время ответа" timestamp without time zone null
);

/**CREATE TABLE IF NOT EXISTS "медкол", "умолчания" (
  "задать вопросов" int,
  "всего время" int --- секунд
);*/

@@ сессия
-- любая
select * from (
select s.*,
  timestamp_to_json(s.ts) as "старт сессии",
  encode(digest(s."ts"::text, 'sha1'),'hex') as "сессия/sha1",
  
  t.id as "название теста/id", t."название" as "название теста",
  t."задать вопросов" as "тест/задать вопросов",
  t."всего время",
  
  EXTRACT(EPOCH from now()-s.ts) as "прошло с начала, сек",
  date_part('hour', (coalesce(t."всего время", ?)::text||' seconds')::interval) as "всего время/часы",
  date_part('minutes', (coalesce(t."всего время", ?)::text||' seconds')::interval) as "всего время/минуты",
  date_part('seconds', (coalesce(t."всего время", ?)::text||' seconds')::interval) as "всего время/секунды",
  p."процесс сдачи/id",
  p."задано вопросов",
  p."получено ответов",
  p."правильных ответов",
  date_part('hour', p."время тестирования") as "время тестирования/часы",
  date_part('minutes', p."время тестирования") as "время тестирования/минуты",
  date_part('seconds', p."время тестирования") as "время тестирования/секунды"
from "медкол"."сессии" s
  left join (
    select t.*, r.id2
    from "медкол"."связи" r
      join "медкол"."названия тестов" t on t.id=r.id1
  ) t  on s.id=t.id2
  
  left join lateral ( ---задано вопросов
    select 
      array_agg(p.id) as "процесс сдачи/id",
      count(p.*) as "задано вопросов",
      sum(case when p."ответ" is not null then 1::int else 0::int end) as "получено ответов",
      sum(case when p."ответ"=1 then 1::int else 0::int end) as "правильных ответов",
      max(p."время ответа")-min(p.ts) as "время тестирования"
    from "медкол"."связи" r
      join "медкол"."процесс сдачи" p on p.id=r.id2
    where r.id1=s.id
  ) p on true
) s
{%= $where || '' %};

@@ названия тестов
select *, encode(digest("ts"::text || id::text, 'sha1'),'hex') as id_digest,
  date_part('hour', (coalesce("всего время", ?)::text||' seconds')::interval) as "всего время/часы",
  date_part('minutes', (coalesce("всего время", ?)::text||' seconds')::interval) as "всего время/минуты",
  date_part('seconds', (coalesce("всего время", ?)::text||' seconds')::interval) as "всего время/секунды"

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
select q.*,
  p.id as "процесс сдачи/id",
  p.ts "время вопроса",
  done.cnt as "№" -- по порядку
from "медкол"."связи" r
  join "медкол"."процесс сдачи" p on p.id=r.id2
  join "медкол"."связи" r2 on p.id=r2.id1
  
  ---join "медкол"."тестовые вопросы" q1 on q1.id=r2.id2
  
  join lateral (
    select id, "код", "вопрос",
      array_agg("ответ" order by "rand") as "ответы" ,
      array_agg(idx order by "rand") as "индексы ответов",
      array_agg(encode(digest(p.ts::text || id::text || idx::text, 'sha1'), 'hex') order by "rand") as "sha1" -- значения для крыжиков
    from (
      select q.id, q."код", "вопрос", "ответ", idx, random() as "rand"
      from "медкол"."тестовые вопросы" q,
        unnest("ответы")  WITH ORDINALITY AS a("ответ", idx)
      where q.id=r2.id2  ------ LATERAL-------- "код"='T005152'
    ) q
    group by id, "код", "вопрос"
  ) q on true ----------q.id=r2.id2
  
  join lateral (--- который вопрос по счету
    select count(distinct pp.*) as cnt
    from
      "медкол"."связи" rr
      join "медкол"."процесс сдачи" pp on pp.id=rr.id2
    where rr.id1=r.id1
  ) done on true
  
where r.id1=? -- ид сессии
  and p."ответ" is null
limit 1
;

@@ обрубить сессию от теста
delete from "медкол"."связи" where id in (
  select r1.id
  from "медкол"."названия тестов" t
    join "медкол"."связи" r1 on t.id=r1.id1
    join "медкол"."сессии" s on s.id=r1.id2
  where s.id=?
)
returning *;

@@ обрубить сессию от процесса
delete from "медкол"."связи" where id in (
  select r1.id
  from "медкол"."сессии" s
    join "медкол"."связи" r1 on s.id=r1.id1
    join "медкол"."процесс сдачи" p on p.id=r1.id2
  where s.id=?
)
returning *;

@@ начало теста
--- связать "названия тестов" -> "сессия"
insert into "медкол"."связи" (id1, id2)
select t.id, ?::int as id2 -- ид сессии
from "медкол"."названия тестов" t
where encode(digest(t."ts"::text || t.id::text, 'sha1'),'hex')=?
returning *
;

@@ новый вопрос
--- связать "сессия" -> "процесс сдачи" -> "тестовые вопросы"
select q.id
from "медкол"."названия тестов" t
  join "медкол"."связи" r1 on t.id=r1.id1
  join "медкол"."сессии" s on s.id=r1.id2
  join "медкол"."связи" r2 on t.id=r2.id1
  join "медкол"."тестовые вопросы" q on q.id=r2.id2
  left join (-- которые были в этой сессии
    select q.id, r.id1 --- ид сессии
    from "медкол"."связи" r
      join "медкол"."процесс сдачи" p on p.id=r.id2
      join "медкол"."связи" r2 on p.id=r2.id1
      join "медкол"."тестовые вопросы" q on q.id=r2.id2
  ) pq on s.id=pq.id1
where s.id=?
  and  q.id<>coalesce(pq.id, 0)  ----pq.id is null 
order by random()
limit 1
;

@@ мои результаты
--- цепочка сессия за сессией
WITH RECURSIVE rc AS (
   SELECT s.id, p.id as parent_id, 0::int AS "step"
   FROM "медкол"."сессии" s --- от новых сессий к старым
    join "медкол"."связи" r on s.id=r.id2
    join "медкол"."сессии" p on p.id=r.id1
    where s.id=?---5828
    
   UNION
   
   SELECT rc.id, p.id as parent, rc.step + 1
   FROM rc 
      join "медкол"."связи" r on rc.parent_id=r.id2
      join "медкол"."сессии" p on p.id=r.id1
)
{%= $DICT->render('результаты') %}
;

@@ результаты
select t.*,
  timestamp_to_json(s.ts) as "старт сессии", s.id as "сессия/id",
  s."задать вопросов" as "сессия/задать вопросов",--- признак завершенной сессии для вычисления процента
  ?::int as "/задать вопросов",
  encode(digest(s."ts"::text, 'sha1'),'hex') as "сессия/sha1",
  p."задано вопросов",
  p."правильных ответов",
  date_part('hour', p."время тестирования") as "время тестирования/часы",
  date_part('minutes', p."время тестирования") as "время тестирования/минуты",
  date_part('seconds', p."время тестирования") as "время тестирования/секунды"
from rc
  join "медкол"."сессии" s on rc.parent_id=s.id
  join "медкол"."связи" r on s.id=r.id2
  join "медкол"."названия тестов" t on t.id=r.id1
  
  join lateral (-- вопросы в этой сессии
    select 
      count(p.*) as "задано вопросов",
      sum(case when p."ответ"=1 then 1::int else 0::int end) as "правильных ответов",
      max(p."время ответа")-min(p.ts) as "время тестирования"
    from 
      "медкол"."связи" rr
          join "медкол"."процесс сдачи" p on p.id=rr.id2
        where rr.id1=s.id
  ) p on true
---group by t."название", s.id, s.ts
{%= $where || '' %}
order by s.ts desc
{%= $limit || '' %} {%= $offset || '' %}
---;--- подзапрос

@@ результаты сессий
--- всех
WITH RECURSIVE rc AS (
   SELECT s.id as parent_id
   FROM "медкол"."сессии" s
    where s."задать вопросов" is not null
)
{%= $DICT->render('результаты', where=>$where || '', limit=>$limit || '', offset=>$offset=>'',) %}
;

@@ неправильные ответы
--- в сессии
select q.*, p."ответ"
from "медкол"."связи" r
  join "медкол"."процесс сдачи" p on p.id=r.id2
  join "медкол"."связи" rq on p.id=rq.id1
  join "медкол"."тестовые вопросы" q on q.id=rq.id2

where r.id1=? -- ид сессии
  and coalesce(p."ответ", 0)<>1
order by p.ts
;

@@ связь удалить
delete
from "медкол"."связи"
where id=? or (id1=? and id2=?)
returning *;

@@ удалить объект
select "удалить объект"('медкол', ?, 'связи', ?);


@@ удалить из теста
delete from "медкол"."связи"
where id in (
  select r.id
  from "медкол"."названия тестов" t
    join "медкол"."связи" r on t.id=r.id1
    join "медкол"."тестовые вопросы" q on q.id=r.id2
  left join (--- 
    select r.id
    from "медкол"."названия тестов" t
    join "медкол"."связи" r on t.id=r.id1
    join "медкол"."тестовые вопросы" q on q.id=r.id2
    where t.id=? and q.id=any(?)
  ) ok on r.id=ok.id
  where 
  t.id=?
  and ok.id is null
);
