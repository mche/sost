package Model::Project;
use Mojo::Base 'Model::Base';

#~ has sth_cached => 1;
my $main_table ="проекты";

sub new {
  state $self = shift->SUPER::new(@_);
  $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  #~ $self->dbh->do($self->sth('таблицы'));
  #~ $self->dbh->do($self->sth('функции'));
  return $self;
}

sub список {
  my ($self) = @_;
  
  $self->dbh->selectall_arrayref($self->sth('список'), {Slice=>{}},);
  
  
}

sub сохранить {
  my ($self, $data) = @_;
  $data->{title} =~ s/^\s+|\s+$//g;
  $data->{title} =~ s/\s{2,}/ /g;
  my $r = $self->_select($self->{template_vars}{schema}, $main_table, ["title"], $data);
  return $r
    if $r && $r->{id};
  $self->вставить_или_обновить($self->{template_vars}{schema}, $main_table, ["id"], $data);
  
}




1;


__DATA__
@@ таблицы
/*
create table IF NOT EXISTS "{%= $schema %}"."{%= $tables->{main} %}" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  title text not null,
  disabled boolean
);

alter table "проекты" rename to "проекты000";

CREATE OR REPLACE  VIEW "проекты" as
select g1.id, g1.ts, g1.name as title, g1.disable as disabled, g1.descr
from
  roles g1 --on g1.id=r1.id1 -- это надо
  join refs r2 on g1.id=r2.id2
  join roles g2 on g2.id=r2.id1 and g2.name='Проекты' --- жесткое название топовой группы
  left join (
    select r.id2 as g_id
    from refs r
    join roles g on g.id=r.id1 -- еще родитель
  ) n on g2.id=n.g_id
where n.g_id is null --- нет родителя топовой группы
;

with p as (
select p0.id as id0, p.id
from "проекты000" p0
  join "проекты" p on p0.title=p.title
)

UPDATE refs AS r
SET id1 = p.id
FROM p
WHERE r.id1 = p.id0
;

with p as (
select p0.id as id0, p.id
from "проекты000" p0
  join "проекты" p on p0.title=p.title
)

UPDATE refs AS r
SET id2 = p.id
FROM p
WHERE r.id2 = p.id0
;

*/




@@ список
select *
from "{%= $schema %}"."{%= $tables->{main} %}"
order by title
;


