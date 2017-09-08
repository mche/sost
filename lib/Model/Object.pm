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

sub доступные_объекты {
  my ($self, $uid, $oid) = @_; # ид профиля
  $self->dbh->selectall_arrayref($self->sth('доступные объекты'), {Slice=>{},}, ($uid)x2, $oid, [$oid]);
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
from "проекты" p
  join refs r on p.id=r.id1
  join "объекты" o on o.id=r.id2
  left join (
    select k.*, r.id1 as p_id
    from refs r
      join "контрагенты" k on k.id=r.id2
  ) k on p.id=k.p_id
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
select distinct g1.*
from
  -- к объектам стрительства
  refs r1 
  join roles g1 on g1.id=r1.id1
  join refs r2 on g1.id = r2.id2
  join roles g2 on g2.id=r2.id1 -- 
  left join refs r3 on g2.id = r3.id1 --- доступ по топовой группе
  -- к навигации/доступу
  --join refs r3 on r1.id2 = r3.id2 -- снова профиль
  --join roles g3 on g3.id=r3.id1 -- 
  --join refs r4 on g3.id = r4.id2
  --join roles g4 on g4.id=r4.id1 -- 

where (r1.id2=? or r3.id2=?)-- профиль
  and (coalesce(?::int, 0)=0 or g1.id=any(?::int[])) -- можно проверить доступ к объекту
  and g2."name"='Объекты и подразделения'
  and not coalesce(g1."disable", false)
  
  ---and g3."name"='Ведение табеля'
  ---and g4."name"='Табель рабочего времени'

order by g1.name
;

@@ объекты+проекты
select *
from "проекты+объекты"

