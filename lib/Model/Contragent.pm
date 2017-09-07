package Model::Contragent;
use Mojo::Base 'Model::Base';

#~ has sth_cached => 1;
my $main_table ="контрагенты";

sub new {
  state $self = shift->SUPER::new(@_);
  $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  $self->dbh->do($self->sth('таблицы'));
  #~ $self->dbh->do($self->sth('функции'));
  return $self;
}

sub список {
  my ($self,) = @_;
  $self->dbh->selectall_arrayref($self->sth('список'), { Slice=> {} },);
}


sub сохранить {
  my ($self, $data) = @_;
  my $r = $self->dbh->selectrow_hashref($self->sth('контрагент'), undef, @$data{qw(id title)});
  return $r
    if $r;
  
  delete $data->{id};
  
  my $new = $self->вставить_или_обновить($self->{template_vars}{schema}, $main_table, ["id"], $data);

  return $new;
}

1;


__DATA__
@@ таблицы
create table IF NOT EXISTS "{%= $schema %}"."{%= $tables->{main} %}" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  title text not null unique
);

CREATE OR REPLACE  VIEW "контрагенты/проекты" as
select k.*, p.id as "проект/id"
from {%= $dict->render('_from') %}
---order by k.title
;

@@ _from
"{%= $schema %}"."{%= $tables->{main} %}" k
  left join (
    select p.*, r.id2 as k_id
    from refs r
      join "проекты" p on p.id=r.id1
  ) p on k.id=p.k_id

@@ список
--
select *
from "контрагенты/проекты"
---order by k.title
;

@@ контрагент
-- по id || title
select *
from "контрагенты/проекты"
where 
  id =? or lower(regexp_replace(title, '\s{2,}', ' ', 'g')) = lower(regexp_replace(?::text, '\s{2,}', ' ', 'g'))
;
