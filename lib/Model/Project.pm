package Model::Project;
use Mojo::Base 'Model::Base';

#~ has sth_cached => 1;
my $main_table ="проекты";

sub new {
  state $self = shift->SUPER::new(@_);
  $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  $self->dbh->do($self->sth('таблицы'));
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
create table IF NOT EXISTS "{%= $schema %}"."{%= $tables->{main} %}" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  title text not null,
  disabled boolean
);


@@ список
select *
from "{%= $schema %}"."{%= $tables->{main} %}"
order by title
;



