package Model::Money;
use Mojo::Base 'Model::Base';
#~ use Mojo::Util qw(dumper);

#~ has sth_cached => 1;
my $main_table ="движение денег";

sub new {
  state $self = shift->SUPER::new(@_);
  $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  $self->dbh->do($self->sth('таблицы'));
  #~ $self->dbh->do($self->sth('функции'));
  return $self;
}


sub сохранить {
  my $self = shift;
  my $data = ref $_[0] ? shift : {@_};
  
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, $main_table, ["id"], $data);
  my $prev = $self->позиция($r->{id});
  
  map {
    my $rr= $self->связь_получить($prev->{$_}, $r->{id});
    $r->{"связь/$_"} = $rr && $rr->{id}
      ? $self->связь_обновить($rr->{id}, $data->{$_}, $r->{id})
      : $self->связь($data->{$_}, $r->{id});
  } qw(категория кошелек);

  return $r;
  
}

sub позиция {
  my ($self, $id) = @_;
  
  my $r = $self->dbh->selectrow_hashref($self->sth('позиция'), undef, $id);
  
}


1;


__DATA__
@@ таблицы
create table IF NOT EXISTS "{%= $schema %}"."{%= $tables->{main} %}" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  "сумма" money not null,
  "дата" date not null,
  "примечание" text null
);


@@ позиция
select m.*, c.id as "категория", w.id as "кошелек"---, w."проект"
from  "{%= $schema %}"."{%= $tables->{main} %}" m
  join (select c.*, r.id2 as _ref
  from refs r join "категории" c on r.id1=c.id
  ) c on c._ref = m.id
  
  join (select w.*, r.id2 as _ref---, p.id as "проект"
  from refs r join "кошельки" w on r.id1=w.id
    ---join refs rp on w.id=rp.id2
    ---join "проекты" p on rp.id1=p.id
  ) w on w._ref = m.id

where m.id =?
;