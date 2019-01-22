package Model::Object;
use Mojo::Base 'Model::Base';
#~ use Mojo::Util qw(dumper);

our $DATA = ['Object.pm.dict.sql'];
#~ has sth_cached => 1;

#~ has [qw(app)];

sub init {
  #~ state $self = shift->SUPER::new(@_);
  my $self = shift;
  #~ $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  #~ $self->dbh->do($self->sth('таблицы'));
  $self->dbh->do($self->sth('функции'));
  #~ return $self;
}

sub список {
  my ($self, $param) = (shift, ref $_[0] ? shift : {@_});
  $self->dbh->selectall_arrayref($self->sth('список', select=>$param->{select} || '*',), {Slice=>{}},);
}


sub доступные_объекты {# если $oid undef - значит выбрать все доступные об, конктетный ИД - проверить доступ к этому об, если ИД=0 - значит проверить доступ ко всем об(через топ-группу)
  my ($self, $uid, $oid, $param) = (shift, shift, ref $_[0] ? shift : [shift], ref $_[0] ? shift : {@_}); # ид профиля
  $self->dbh->selectall_arrayref($self->sth('доступные объекты', select=>$param->{select} || '*',), {Slice=>{},}, $uid, $oid);
}

sub объекты_проекты {
  my $self = shift;
  my $oid = ref $_[0] ? shift : [@_];
  my $param = ref $_[0] ? shift : {};
  $self->dbh->selectall_arrayref($self->sth('объекты+проекты', select=>$param->{select} || '*',), {Slice=>{}}, ($oid) x 2);
}

sub объекты_проекты_хэш {
  my $self = shift;
  my $oid = ref $_[0] ? shift : [@_];
  my $param = ref $_[0] ? shift : {};
  $self->dbh->selectall_hashref($self->sth('объекты+проекты', select=>$param->{select} || '*',), 'id', undef, ($oid) x 2);
  
}

sub доступ_все_объекты {
  my ($self, $uid) = @_;
  $self->dbh->selectrow_array($self->sth('доступ все объекты'), undef, $uid);
}


1;

__DATA__


