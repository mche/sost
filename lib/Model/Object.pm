package Model::Object;
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

sub список {
  my $self = shift;
  $self->dbh->selectall_arrayref($self->sth('список'), {Slice=>{}},);
}

sub доступные_объекты {# если $oid undef - значит выбрать все доступные об, конктетный ИД - проверить доступ к этому об, если ИД=0 - значит проверить доступ ко всем об(через топ-группу)
  my ($self, $uid, $oid) = @_; # ид профиля
  $self->dbh->selectall_arrayref($self->sth('доступные объекты'), {Slice=>{},}, $uid, [$oid]);
}

sub объекты_проекты {
  my $self = shift;
  $self->dbh->selectall_arrayref($self->sth('объекты+проекты'), {Slice=>{}},);
}


1;

__DATA__
@@ таблицы
---

@@ функции
CREATE OR REPLACE  VIEW "проекты+объекты" as
select o.*, p.id as "проект/id", p.title as "проект",
  k.id as "контрагент/id"
from 
  "объекты" o
  left join (
    select p.*, r.id2
    from 
      "проекты" p
      join refs r on p.id=r.id1
  ) p on o.id=p.id2
  left join (
    select k.*, r.id1 as p_id
    from refs r
      join "контрагенты" k on k.id=r.id2
  ) k on p.id=k.p_id
;

---CREATE OR REPLACE  VIEW "" as
CREATE OR REPLACE FUNCTION "доступные объекты"(int, int[])
RETURNS SETOF "roles"
LANGUAGE sql
AS $$
/* проверять доступ профиля к объектам или все его доступные объекты
*/
select distinct o.id, o.ts, o.name, o.disable, o.descr ---, array[r1.id2, r3.id2]::int[] as "профиль"
from
   
  (--  все объекты
    select distinct g1.*, r3.id2 as _profile_top
    from roles g1
      join refs r2 on g1.id = r2.id2
      join roles g2 on g2.id=r2.id1 -- 
      left join refs r3 on g2.id = r3.id1 and r3.id2 = $1      --- доступ по топовой группе
    where 
      g2."name"='Объекты и подразделения'
        and not coalesce(g1."disable", false)
) o 

left join refs r1 on o.id=r1.id1

where 
  (o._profile_top is not null or $1=r1.id2) -- по профилю
  and (o.id=any($2) or $2 is null or $2[1] is null or (o._profile_top is not null and $2[1]=0)) --  к объектам
  ---  or ((o.id=any($2) or coalesce($2[1], 0)=0) and $1=r3.id2))--- если 0(все объекты) то проверить связь с топовой группой объектов
;
$$
;

@@ список
--- для отчета все объекты
select *
from "объекты"
where not coalesce("disable", false)
order by name
;

@@ доступные объекты
--- для правки
select *
from "доступные объекты"(?, ?)
order by name;


@@ объекты+проекты
select *
from "проекты+объекты";

