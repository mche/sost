package Model::Access;
use Mojo::Base 'Model::Base';
#~ use Mojo::Util qw(dumper);

#~ has sth_cached => 1;

has [qw(app)];

sub new {
  state $self = shift->SUPER::new(@_);
  #~ $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  #~ $self->dbh->do($self->sth('таблицы'));
  $self->dbh->do($self->sth('функции'));
  return $self;
}

sub пользователи {
  my $self = shift;
  $self->dbh->selectall_arrayref($self->sth('пользователи'), {Slice=>{}},);
  
}

sub роли {
  my $self = shift;
  $self->dbh->selectall_arrayref($self->sth('роли'), {Slice=>{}},);
  
}

sub маршруты {
  my $self = shift;
  $self->dbh->selectall_arrayref($self->sth('маршруты'), {Slice=>{}},);
}

sub сохранить_профиль {
  my $self = shift;
  my $data = ref $_[0] ? shift : {@_};
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, 'профили', ["id"], $data);
  
}

sub сохранить_логин {
  my $self = shift;
  my $data = ref $_[0] ? shift : {@_};
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, 'logins', ["id"], $data);
  
}


sub сохранить_роль {
  my $self = shift;
  my $data = ref $_[0] ? shift : {@_};
  my $tx_db = $self->dbh->begin;
  local $self->{dbh} = $tx_db;
  my $r = $data->{attach}
    ? {id=>$data->{attach}{id}}
    : $self->вставить_или_обновить($self->{template_vars}{schema}, 'roles', ["id"], $data);
  $tx_db->commit
    and return $r
    unless $data->{attach};
  #~ my $p =  $self->dbh->selectrow_array($self->sth('роль/предок'), undef, $r->{id});
  #~ $self->связь_удалить(id1=>$p, id2=>$r->{id})
    #~ if $p && $p ne $data->{parent};
  $self->связь($data->{parent}, $r->{id})
    if defined $data->{parent};
  $tx_db->commit;
  return $r;
}

sub сохранить_маршрут {
  my $self = shift;
  my $data = ref $_[0] ? shift : {@_};
  $self->вставить_или_обновить($self->{template_vars}{schema}, 'routes', ["id"], $data);
}

sub удалить_маршрут {
  my $self = shift;
  my $data = ref $_[0] ? shift : {@_};
  my $cnt = $self->dbh->selectrow_array($self->sth('количество связей'), undef, ($data->{remove}) x 2);
  return "С данным маршрутом есть связи. Сначала удалить связи (с группами)"
    if $cnt;
  $self->_delete($self->{template_vars}{schema}, 'routes', ["id"], id=> $data->{remove});
}


sub удалить_роль {
  my $self = shift;
  my $data = ref $_[0] ? shift : {@_};
  my $tx_db = $self->dbh->begin;
  local $self->{dbh} = $tx_db;
  $self->связь_удалить(id1=>$data->{parent}, id2=>$data->{remove});
  my $cnt = $self->dbh->selectrow_array($self->sth('количество связей'), undef, ($data->{remove}) x 2);
  my $d = $self->_delete($self->{template_vars}{schema}, 'roles', ["id"], id=> $data->{remove})
    unless $cnt;
  $tx_db->commit;
  return $d || {id=>$data->{remove}};
}

sub пользователи_роли {
  my ($self, $role) = @_;
  $self->dbh->selectrow_array($self->sth('пользователи роли'), undef, $role);
}

sub маршруты_роли {
  my ($self, $role) = @_;
  $self->dbh->selectrow_array($self->sth('маршруты роли'), undef, $role);
  
}

sub роли_пользователя {
  my ($self, $role) = @_;
  $self->dbh->selectrow_array($self->sth('роли пользователя'), undef, $role);
  
}

1;

__DATA__

@@ пользователи
select p.*, l.login, l.pass, l.id as "login/id"
from "профили" p
  left join (
  select l.*, r.id1 as p_id
  from logins l
  join refs r on l.id=r.id2
  ) l on l.p_id=p.id
order by array_to_string(p.names, ' ')
;


@@ роли
select r.*, c.childs, p1.parents1
from "роли/родители"() r
left join (
  select array_agg(c.id) as childs, r.id1 as parent
  from "roles" c
    join refs r on c.id=r.id2
  group by r.id1
) c on r.id= c.parent

left join (
  select array_agg(c.id) as parents1, r.id2 as child
  from "roles" c
    join refs r on c.id=r.id1
  group by r.id2
) p1 on r.id= p1.child

order by r.id, array_to_string(r.parents_name, '')
;

@@ роль/предок
select rr.id
from refs r
  join roles rr on rr.id=r.id1
where r.id2=?
;

@@ количество связей
select count(*) as cnt
from refs
where id1=? or id2=?;

@@ пользователи роли
select array_agg(p.id)
from refs r
  join "профили" p on p.id=r.id2
where r.id1=?

@@ маршруты роли
select array_agg(p.id)
from refs r
  join "routes" p on p.id=r.id1
where r.id2=? -- роль

@@ роли пользователя
select array_agg(p.id)
from refs r
  join "roles" p on p.id=r.id1
where r.id2=?

@@ маршруты
select r.*
from "routes" r
order by r.ts - (coalesce(r.interval_ts, 0::int)::varchar || ' second')::interval
;

@@ функции
CREATE OR REPLACE FUNCTION "роли/родители"()
RETURNS TABLE("id" int, name text, disable boolean, parent int, "parents_id" int[], "parents_name" varchar[])
AS $func$

WITH RECURSIVE rc AS (
   SELECT c.id, c.name, c.disable, p.id as "parent", p.name as "parent_name", p.id as "parent_id", 1::int AS level
   FROM "roles" c
    left join (
    select c.*, r.id2 as child
    from "roles" c
      join refs r on c.id=r.id1
    ) p on c.id= p.child
    
   UNION
   
   SELECT rc.id, rc.name, rc.disable, rc."parent", c.name, c.id as parent, rc.level + 1 AS level
   FROM rc ---ON c.id = rc.child
      join refs r on r.id2=rc."parent_id"
      join "roles" c on r.id1= c.id
)

SELECT id, name, disable, parent,  array_agg("parent_id"), array_agg("parent_name")
from (
select *
FROM rc 
order by id, "level" desc
) r
group by id, name, disable, parent;

$func$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION "роль/родители"(int) --- id роли
RETURNS TABLE("id" int, name text, disable boolean, parent int, "parents_id" int[], "parents_name" varchar[])
AS $func$

WITH RECURSIVE rc AS (
   SELECT c.id, c.name, c.disable, p.id as "parent", p.name as "parent_name", p.id as "parent_id", 1::int AS level
   FROM "roles" c
    left join (
    select c.*, r.id2 as child
    from "roles" c
      join refs r on c.id=r.id1
    ) p on c.id= p.child
    where c.id=$1
    
   UNION
   
   SELECT rc.id, rc.name, rc.disable, rc."parent", c.name, c.id as parent, rc.level + 1 AS level
   FROM rc ---ON c.id = rc.child
      join refs r on r.id2=rc."parent_id"
      join "roles" c on r.id1= c.id
)

SELECT id, name, disable, parent,  array_agg("parent_id"), array_agg("parent_name")
from (
select *
FROM rc 
order by id, "level" desc
) r
group by id, name, disable, parent;

$func$ LANGUAGE SQL;

