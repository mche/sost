package Model::Contragent;
use Mojo::Base 'Model::Base';

our $DATA = ['Contragent.pm.dict.sql'];
#~ has sth_cached => 1;
my $main_table ="контрагенты";

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
  my ($self, $param) = @_;
  $self->dbh->selectall_arrayref($self->sth('список', select=>$param->{select} || '*',), { Slice=> {} },);
}

sub позиция {
  my ($self, $id, $title) = @_;
  $self->dbh->selectrow_hashref($self->sth('контрагент'), undef, $id, $title);
}

sub сохранить_контрагент {
  my ($self, $data) = @_;
  my $k = $self->_select($self->{template_vars}{schema}, $main_table, ["id"], $data);
  return $k
    if $k && $k->{id};
  return $data #"Не указан контрагент"
    unless $data && $data->{'title'};
  
  $data->{new} = eval {$self->сохранить($data)};# || $@;
  $self->app->log->error($@)
    and return "Ошибка сохранения: $@"
    unless ref $data->{new};
  
  $data->{id}=$data->{new}{id};
  
  return $data;
  
}

sub сохранить {
  my ($self, $data) = @_;
  my $r = $self->dbh->selectrow_hashref($self->sth('контрагент'), undef, @$data{qw(id title)});
  return $r
    if $r;
  
  delete $data->{id};
  
  my $new = $self->вставить_или_обновить($self->{template_vars}{schema}, $main_table, ["id"], $data);
  
  #~ $self->почистить_таблицу; # НЕТ, это после связей!

  return $new;
}

sub сохранить_АТИ {
  my ($self, $data) = @_;
  return
    unless $data->{id} || $data->{'АТИ'};
  $self->обновить($self->{template_vars}{schema}, $main_table, ["id"], {id=>$data->{id}, 'АТИ'=>$data->{'АТИ'}});
}

sub почистить_таблицу {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  $self->dbh->selectall_arrayref($self->sth('почистить таблицу'), {Slice=>{}}, $param->{uid} || 0);#  
}

sub заменить_контрагента {
  my ($self, $data) = @_;
  #~ my $r1 = $self->dbh->selectrow_hashref($self->sth('обновить связи', set=>' set "id1"=? ', where=>' where "id1"=? ', returning=>' , ? as "old_id1" '), undef, $data->[1]{id}, ($data->[0]{id}) x 2, );
  #~ my $r2 = $self->dbh->selectrow_hashref($self->sth('обновить связи', set=>' set "id2"=? ', where=>' where "id2"=? ', returning=>' , ? as "old_id2" '), undef, $data->[1]{id}, ($data->[0]{id}) x 2);
  $self->dbh->selectrow_hashref($self->sth('изменить связи'), undef,  $data->[0]{id}, $data->[1]{id}, $data->[2],);
  #~ return [$r1, $r2];
}

1;


__DATA__
