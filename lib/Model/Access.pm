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
  return [map{
    $_->{'навигационный маршрут'} = $self->dbh->selectrow_hashref($self->sth('навигационный маршрут'), undef, $_->{id});
    $_;
  } @{$self->dbh->selectall_arrayref($self->sth('роли'), {Slice=>{}},)}
  ];
  
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
    my $r = $self->связь_получить(@$data{qw(parent id)})# $self->dbh->selectrow_array($self->sth('роль/предок'), undef, $data->{id})
      if $data->{parent} && $data->{id};
    $self->связь_удалить(id=>$r->{id})
      if $r && $r->{id};
    $self->связь($data->{parent}, $data->{attach}{id})
      if $data->{parent};
    $tx_db->commit;
    return {id=>$data->{attach}{id}};
  }
  
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, 'roles', ["id"], $data);
  $self->связь($data->{parent}, $r->{id})
    if $data->{parent} && !$self->связь_получить($data->{parent}, $r->{id});
  
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
  my $cnt = $self->dbh->selectrow_array($self->sth('наличие связей'), undef, ($data->{remove}) x 2);
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
    if $data->{parent} &&  $self->dbh->selectrow_array($self->sth('можно удалить связь'), undef, ($data->{id}) x 2);
  my $cnt = $self->dbh->selectrow_array($self->sth('наличие связей'), undef, ($data->{remove}) x 2);
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
  #~ $route->{descr} ||= $self->app->dumper($route);#Data::Dumper::Dumper($route) =~ s/\$.+=\s*//r;
  $self->вставить_или_обновить($self->{template_vars}{schema}, 'routes', ["name"], $route);
};

sub закачка_пользователя {# +должность
  my ($self, $user) = @_;
  
  my $должности = $self->dbh->selectrow_hashref($self->sth('топ-группы'), undef, ('Должности') x 2)
    or die "Нет топ-группы [Должности]";
  
  my $должность = $self->dbh->selectrow_hashref($self->sth('группа родителя'), undef, $должности->{id}, ($user->{'должность'}) x 2);
  unless ($должность) {
    $должность = $self->вставить_или_обновить($self->{template_vars}{schema}, 'roles', ["id"], {name=>$user->{'должность'}});
    $self->связь($должности->{id}, $должность->{id});
  }
  
  my $пользователь = $self->dbh->selectrow_hashref($self->sth('пользователь по имени'), undef, $user->{'names'})
    || $self->вставить_или_обновить($self->{template_vars}{schema}, 'профили', ["id"], $user);
  
  
  $пользователь->{'связь с должностью'} = $self->связь($должность->{id}, $пользователь->{id});
  
  return $пользователь;
  
}

sub навигация {
  my ($self, $roles) = @_;
  $self->dbh->selectall_arrayref($self->sth('навигация'), {Slice=>{}}, $roles);
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
select g.*, r."parent", r."parents_id", r."parents_name", c.childs, p1.parents1
from "роли/родители"() r
join "roles" g on r.id=g.id
left join (
  select array_agg(c.id) as childs, r.id1 as parent
  from "roles" c
    join refs r on c.id=r.id2
  group by r.id1
) c on r.id= c.parent

left join (
  select array_agg(g.id) as parents1, g.child
    from (
      select c.id, r.id2 as child
      from "roles" c
        join refs r on c.id=r.id1
      order by r.id
    ) g
    group by g.child
) p1 on r.id= p1.child
order by r.id, array_to_string(r.parents_name, '')
;

@@ навигационный маршрут
select rt.*
from refs r
join routes rt on rt.id=r.id2 -- маршрут вторич
where r.id1=? -- роль первич
;

@@ можно удалить связь
select EXISTS( select c.*, p.*
from ( --- вообще связи этой группы
select count(r.*) as cnt
  from "roles" g
  join refs r on g.id=any(array[r.id1, r.id2])
  where g.id=?
) c
left join ( --- родительские связи к группам
  select array_agg(c.id) as parents
  from "roles" c
    join refs r on c.id=r.id1
  where r.id2=?
) p on true
where c.cnt=1 or array_length(p."parents",1)>1
);


@@ наличие связей
select EXISTS(
  select id
  from refs
  where id1=? or id2=?
);

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
order by regexp_replace(r.request, '^.* ', '') ---r.ts - (coalesce(r.interval_ts, 0::int)::varchar || ' second')::interval
;

@@ пользователь по имени
select *
from "профили"
where lower(array_to_string(names, ' '))=lower(array_to_string(?::text[], ' '))
;

@@ топ-группы
select g.*
from roles g
  left join (
  select r.id2 as child
  from  refs r
    join roles g on g.id=r.id1 -- parent
  ) p on g.id=p.child
where 
  (?::text is null or lower(g.name) = lower(?)) --'Должности'
  and p.child is null;

@@ группа родителя
select g.*
from refs r
  join roles g on g.id=r.id2
where 
  r.id1=? -- родитель
  and  (?::text is null or lower(g.name) = lower(?)) -- может одну
;


@@ навигация000?cached=1
--- для меню
select r1.*, m.name as url_for, array_length(r1.parents_name, 1) as level
from 
  (select * from "роли/родители"() where 'Навигация и доступ в системе'=any(parents_name)) r1
  left join -- исключить аттач группы
  (select * from "роли/родители"() where 'Навигация и доступ в системе'<>all(parents_name)) r2
    on r1.id=r2.id
  left join (
    select rt.*, r.id1 as role_id -- роль первич
    from refs r
    join routes rt on rt.id=r.id2 -- маршрут вторич
  ) m on r1.id=m.role_id
where 
  r1.id = any(?)-- роли пользователя уже развернуты доверху
  and r2.id is null
order by array_to_string(r1.parents_name, '') || r1.name;


@@ навигация?cached=1
--- для меню
select g.*, rt.name as url_for, array_length(g.parents_name, 1) as level
from 
  "роли/родители"() g
  join refs r on g.id=r.id1 -- роль первич
  join routes rt on rt.id=r.id2 -- маршрут вторич
where g.id = any(?)-- роли пользователя уже развернуты доверху
order by array_to_string(g.parents_name, '') ||  g.name;

@@ функции
CREATE OR REPLACE FUNCTION "роли/родители"()
RETURNS TABLE("id" int, name text, descr text, disable boolean, parent int, "parents_id" int[], "parents_name" varchar[], parents_descr text[]) --, level int[]
AS $func$

WITH RECURSIVE rc AS (
   SELECT c.id, p.id as "parent", p.name as "parent_name", p.id as "parent_id", p.descr as parent_descr, 1::int AS level
   FROM "roles" c
    left join (
    select c.*, r.id2 as child
    from "roles" c
      join refs r on c.id=r.id1
    ) p on c.id= p.child
    
   UNION
   
   SELECT rc.id, rc."parent", c.name, c.id as parent, c.descr, rc.level + 1 AS level
   FROM rc ---ON c.id = rc.child
      join refs r on r.id2=rc."parent_id"
      join "roles" c on r.id1= c.id
)

SELECT id, name, descr, disable, parent,
  array_agg("parent_id" order by "level" desc),
  array_agg("parent_name" order by "level" desc),
  array_agg("parent_descr" order by "level" desc)
---, array_agg(level order by "level" desc) as level
from (
select rc.*, g.name, g.descr, g.disable
FROM rc
  join roles g on rc.id=g.id
) r
group by id, name, descr, disable, parent;

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
   
   SELECT rc.id, rc.name, rc.disable, rc."parent", c.name, c.id as parent_id, rc.level + 1 AS level
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
    FROM (select g.name, ("роль/родители"(g.id)).parents_id as "parents"
      from refs rr
      join roles g on g.id=rr.id2-- childs
    WHERE rr.id1=NEW.id1 -- new parent
    ) e -- все потомки родителя
    join roles g on g.id=NEW.id2 and g.name=e.name
    join "роль/родители"(g.id) pg on pg.parents_id = e."parents" -- новый потомок хочет связ с родителем
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
