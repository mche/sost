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
select *
from "роли/родители"()
;


@@ функции
CREATE OR REPLACE FUNCTION "роли/родители"()
RETURNS TABLE("id" int, name text, disable boolean, "parents_id" int[], "parents_name" varchar[])
AS $func$

WITH RECURSIVE rc AS (
   SELECT c.id, c.name, c.disable, p.name as "parent_name", p.id as "parent_id", 1::int AS level
   FROM "roles" c
    left join (
    select c.*, r.id2 as child
    from "roles" c
      join refs r on c.id=r.id1
    ) p on c.id= p.child
    
   UNION
   
   SELECT rc.id, rc.name, rc.disable, c.name, c.id as parent, rc.level + 1 AS level
   FROM rc ---ON c.id = rc.child
      join refs r on r.id2=rc."parent_id"
      join "roles" c on r.id1= c.id
)

SELECT id, name, disable, array_agg("parent_id"), array_agg("parent_name")
from (
select *
FROM rc 
order by id, "level" desc
) r
group by id, name, disable;

$func$ LANGUAGE SQL;

