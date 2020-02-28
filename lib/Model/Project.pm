package Model::Project;
use Mojo::Base 'Model::Base';

our $DATA = ['Project.pm.dict.sql'];

#~ has sth_cached => 1;
my $main_table ="проекты";

sub new {
  my $self = shift->SUPER::new(@_);
  $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  
  return $self;
}
sub init {
  my $self = shift;
  #~ $self->dbh->do($self->sth('таблицы'));
  $self->dbh->do($self->sth('функции'));
  
}

sub список {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  $self->dbh->selectall_arrayref($self->sth('список', where=>$param->{where}), {Slice=>{}},);
  
  
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
