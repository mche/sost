package Model::TMC;
use Mojo::Base 'Model::Base';
#~ use Mojo::Util qw(dumper);

#~ has sth_cached => 1;

has [qw(app)];

sub new {
  state $self = shift->SUPER::new(@_);
  #~ $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  $self->dbh->do($self->sth('таблицы'));
  #~ $self->dbh->do($self->sth('функции'));
  return $self;
}

sub сохранить_заявку {
  my ($self, $data) = @_;
  my $tx_db = $self->dbh->begin;
  local $self->{dbh} = $tx_db;
  
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, 'тмц/заявки', ["id"], $data);
  $self->связь($data->{'объект'}, $r->{id})
    if $data->{'объект'};
  
  $tx_db->commit;
  return $r;
}

1;

__DATA__
@@ таблицы
create table IF NOT EXISTS "тмц/заявки" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  "коммент" text
);