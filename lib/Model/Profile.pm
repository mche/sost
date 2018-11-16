package Model::Profile;
use Mojo::Base 'Model::Base';
#~ use Mojo::Util qw(dumper);

our $DATA = ['Profile.pm.dict.sql'];

#~ has sth_cached => 1;
my $main_table = 'профили';
#~ has [qw(app)];


sub new {
  my $self = shift->SUPER::new(@_);
  $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  #~ $self->dbh->do($self->sth('таблицы'));
  #~ $self->dbh->do($self->sth('функции'));
  return $self;
}
sub init {
  my $self = shift;
  
}

sub список {
  my ($self) = @_;
  
  $self->dbh->selectall_arrayref($self->sth('список или позиция'), {Slice=>{},}, (undef) x 2);
  
}

sub задать_пароль {
  my ($self, $login, $pass) = @_;
  $self->dbh->selectall_arrayref($self->sth('задать пароль'), {Slice=>{},}, $pass, $login);
}

sub список_логинов {
  my ($self) = @_;
  $self->dbh->selectall_arrayref($self->sth('список логинов'), {Slice=>{},},);
}

1;

