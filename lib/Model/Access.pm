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
  
  if ($data->{attach}) {
    my $p =  $self->dbh->selectrow_array($self->sth('роль/предок'), undef, $data->{id})
      if $data->{id};
    $self->связь_удалить(id1=>$p, id2=>$data->{id})
      if $p;
    $self->связь($data->{parent}, $data->{attach}{id})
      if $data->{parent};
    $tx_db->commit;
    return {id=>$data->{attach}{id}};
  }
  
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, 'roles', ["id"], $data);
  $self->связь($data->{parent}, $r->{id})
    if $data->{parent};
  
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
  $self->связь_удалить(id1=>$data->{parent}, id2=>$data->{remove})
    if $data->{parent};
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
  my ($self, $user) = @_;
  $self->dbh->selectrow_array($self->sth('роли пользователя'), undef, $user);
  
}

sub маршруты_пользователя {
  my ($self, $user) = @_;
  $self->dbh->selectrow_array($self->sth('маршруты пользователя'), undef, $user);
  
}

sub роли_маршрута {
  my ($self, $route) = @_;
  $self->dbh->selectrow_array($self->sth('роли маршрута'), undef, $route);
  
}

sub пользователи_маршрута {
  my ($self, $route) = @_;
  $self->dbh->selectrow_array($self->sth('пользователи маршрута'), undef, $route);
  
}

sub закачка_маршрута {
  my ($self, $route) = @_;
  unless ($route->{request}) {
    
    my $meth  = join ' ', map uc($_), grep defined($route->{$_}) && $route->{$_} =~ s/\s+//gr, qw(get post put head);
    $meth .= " " if $meth;
    my $path = join '', map $route->{$_},  grep defined($route->{$_}) && $route->{$_} =~ s/\s+//gr, qw(get post put head route)
      or return {error=>"Не указан URL path через (get=> | post=> | put=> | head=> | route=> )"};
    $route->{request} = sprintf '%s%s', $meth || '',  $path;
  } else {
    $route->{request} =~ s/(^\s+|\s+$)//g;
    #~ $route->{request} =~ s/\s{2,}/ /g;
  }
  return {error=>"Не указан request (get post put head route)"}
    unless $route->{request};
  
  if (my $over = delete $route->{over}) {
    my $access  =delete $over->{access};
    my $auth = delete $access->{auth}
      if $access;
    $route->{auth} = $auth
      if $auth;
    my $host = delete($over->{host}) || delete($over->{host_re});
    require Data::Dumper
      and $route->{host_re} = Data::Dumper::Dumper($host) =~ s/(^\$.+=\s*'*|'*;\n*$)//gr
      if $host;
  }
  $route->{descr} ||= $self->app->dumper($route);#Data::Dumper::Dumper($route) =~ s/\$.+=\s*//r;
  $self->вставить_или_обновить($self->{template_vars}{schema}, 'routes', ["request"], $route);
};

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
select array_agg(g.id)
from refs r
  join "routes" g on g.id=r.id1
where r.id2=? -- роль

@@ роли пользователя
select array_agg(p.id)
from refs r
  join "roles" p on p.id=r.id1
where r.id2=? -- профиль вторич

@@ маршруты пользователя
select array_agg(distinct rt.id)
from refs r
  join "roles" g on g.id=r.id1
  join refs r2 on g.id=r2.id2 -- 
  join "routes" rt on rt.id=r2.id1
where r.id2=? -- профиль вторич


@@ роли маршрута
select array_agg(g.id)
from refs r
  join "roles" g on g.id=r.id2
where r.id1=?-- маршрут первич

@@ пользователи маршрута
select array_agg(distinct p.id)
from refs r
  join "roles" g on g.id=r.id2
  join refs r2 on g.id=r2.id1 -- роль первич
  join "профили" p on p.id=r2.id2
where r.id1=? -- маршрут первич

@@ маршруты
select r.*, rl.roles
from "routes" r
left join (
  select rt.id, array_agg(rl.id) as roles
  from routes rt
  join refs r on rt.id=r.id1
  join roles rl on rl.id=r.id2
  group by rt.id
) rl on r.id=rl.id
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



ALTER TABLE roles DROP CONSTRAINT IF EXISTS "roles_name_key";

CREATE OR REPLACE FUNCTION check_role() RETURNS "trigger" AS
$BODY$  

BEGIN 
  IF EXISTS (
    SELECT 1
    FROM (select r.name
      from refs rr
      join roles r on r.id=rr.id2-- childs
    WHERE rr.id1=NEW.id1 -- new parent
    ) e
    join roles r on r.id=NEW.id2 and r.name=e.name
  ) THEN
      RAISE EXCEPTION 'Повтор названия группы/роли на одном уровне' ;
   END IF;   

  RETURN NEW;
  
END; 
$BODY$
  LANGUAGE 'plpgsql';--- VOLATILE;

DROP TRIGGER  IF EXISTS  check_role ON refs;
CREATE  TRIGGER check_role -- CONSTRAINT только дл я AFTER
    BEFORE INSERT OR UPDATE  ON refs
    FOR EACH ROW  EXECUTE PROCEDURE check_role(); 
