package Model::Wallet;
use Mojo::Base 'Model::Base';

#~ has sth_cached => 1;
my $main_table ="кошельки";

sub new {
  state $self = shift->SUPER::new(@_);
  $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  $self->dbh->do($self->sth('таблицы'));
  #~ $self->dbh->do($self->sth('функции'));
  return $self;
}

sub список {
  my ($self, $project) = @_;
  return $self->dbh->selectall_arrayref($self->sth('список'), { Slice=> {} }, $project)
    if $project;
  $self->dbh->selectall_arrayref($self->sth('список/все проекты'), { Slice=> {} },);
  
}


sub сохранить {
  my ($self, $data) = @_;
  my $r = $self->dbh->selectrow_hashref($self->sth('кошелек проекта'), undef, @$data{qw(проект title)});
  return $r
    if $r;
  
  my $new = $self->вставить_или_обновить($self->{template_vars}{schema}, $main_table, ["id"], $data);
  $self->связь($data->{'проект'}, $new->{id});
  return $new;
}

1;


__DATA__
@@ таблицы
create table IF NOT EXISTS "{%= $schema %}"."{%= $tables->{main} %}" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  title text not null
);

@@ список
--
select w.*
from refs r
  join  "{%= $schema %}"."{%= $tables->{main} %}" w on r.id2=w.id

where r.id1 = ? -- проект
;

@@ список/все проекты
--
select w.id, p.id as "проект/id", p.title as "проект", p.title || ': ' || w.title as title
from "проекты" p
  join refs r on p.id=r.id1
  join "{%= $schema %}"."{%= $tables->{main} %}" w on w.id=r.id2
order by 4
;

@@ кошелек проекта
-- по title
select w.*
from refs r
  join "{%= $schema %}"."{%= $tables->{main} %}" w on w.id=r.id2

where 
  r.id1 =?
  and lower(regexp_replace(w.title, '\s{2,}', ' ', 'g')) = lower(regexp_replace(?::text, '\s{2,}', ' ', 'g'))
;
