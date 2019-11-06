package Model::TMC::Cert;
use Mojo::Base 'Model::Base';
#~ use Util;

our $DATA = ['Cert.pm.dict.sql'];

#~ has model_obj => sub {shift->app->models->{'Object'}};
#~ has model_transport => sub {shift->app->models->{'Transport'}};
has model_nomen => sub {shift->app->models->{'Nomen'}};

sub init {
  #~ state $self = shift->SUPER::new(@_);
  my $self = shift;
  #~ $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  $self->dbh->do($self->sth('таблицы'));
  #~ $self->dbh->do($self->sth('функции'));
  return $self;
}

sub закупки {
  my ($self) = @_;
  $self->dbh->selectall_arrayref($self->sth('закупки'), {Slice=>{}});
}

sub папки {
  my ($self) = shift;
  #~ my $param = ref $_[0] ? shift : {@_};
  $self->dbh->selectall_arrayref($self->sth('папки', nomen=>$self->model_nomen->dict->render('список')), {Slice=>{}}, (154964) x 2);#$param->{id}
}

sub сохранить_папку {
  my ($self, $data, $prev) = @_;
  $prev ||= $self->папки(id=>$data->{id})->[0]
    if $data->{id};
  my $r =  $self->вставить_или_обновить($self->{template_vars}{schema}, "сертификаты/папки", ['id'], $data,);
  $self->связь_удалить(id1=>$prev->{'parent'}, id2=>$r->{id})
    if $prev  && ($prev->{'parent'} ne $data->{parent});
  $self->связь($data->{parent}, $r->{id})
    if $data->{parent};
  return $self->папки(id=>$r->{id})->[0];
}

1;