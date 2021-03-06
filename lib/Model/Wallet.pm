package Model::Wallet;
use Mojo::Base 'Model::Base';

#~ has sth_cached => 1;
my $main_table ="кошельки";

sub new {
  my $self = shift->SUPER::new(@_);
  $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  return $self;
}
sub init {
  my $self = shift;
  $self->dbh->do($self->sth('таблицы'));
  #~ $self->dbh->do($self->sth('функции'));
  
}

sub список {
  my ($self, $project) = @_;
  #~ return $self->dbh->selectall_arrayref($self->sth('список'), { Slice=> {} }, $project)
    #~ if $project;
  my ($where, @bind) = $self->SqlAb->where({
    (not defined $project) || ($project eq 0) ? () : (' p.id '=> $project),
    -not_bool => ' coalesce(p.disable, false) ',
  });
  $self->dbh->selectall_arrayref($self->sth('список/все проекты', where=>$where), { Slice=> {} }, @bind);
  
}

sub кошельки_проекта {
  my ($self, $project, $cb) = @_;
  $cb
    ? $self->dbh->pg->db->query($self->dict->render('кошельки проекта'), ($project), $cb)
    : $self->dbh->selectall_arrayref($self->sth('кошельки проекта'), { Slice=> {} }, ($project));
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

@@ кошельки проекта
----
select w.*
from refs r
  join  "{%= $schema %}"."{%= $tables->{main} %}" w on r.id2=w.id

where r.id1 = ? -- проект
order by w.title
;

@@ список/все проекты
--
select w.id, p.id as "проект/id", p.name as "проект", w.title---p.name || ': ' || w.title as title
from "roles" p
  join refs r on p.id=r.id1
  join "{%= $schema %}"."{%= $tables->{main} %}" w on w.id=r.id2
---where coalesce(::int, 0)=0 or p.id=
{%= $where || '' %}
----order by 4
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
