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
    if ($data->{$_}) {
      my $rr= $self->связь_получить($prev->{"$_/id"}, $r->{id});
      $r->{"связь/$_"} = $rr && $rr->{id}
        ? $self->связь_обновить($rr->{id}, $data->{$_}, $r->{id})
        : $self->связь($data->{$_}, $r->{id});
    } else {
      $self->связь_удалить(id1=>$prev->{"$_/id"}, id2=>$r->{id});
    }
  } qw(категория кошелек контрагент);

  return $r;
  
}

sub позиция {
  my ($self, $id) = @_;
  
  my $r = $self->dbh->selectrow_hashref($self->sth('список или позиция'), undef, (undef) x 2, ($id) x 2,);
  
}

my %type = ("дата"=>'date', "сумма"=>'money');
sub список {
  my ($self, $project, $data) = @_;
  
  my $where = "";
  my @bind = (($project) x 2, (undef) x 2);
  
  while (my ($key, $value) = each %{$data || {}}) {
    next
      unless $value->{ready} || $value->{_ready} ;
    
    if ($value->{id}) {
      $where .= ($where ? " and " :  "where ").qq| "$key/id"=? |;
      push @bind, $value->{id};
      next;
    }
    
    my @values = @{$value->{values} || []};
    next
      unless @values;
    $values[1] = 10000000000
      unless $values[1];
    $values[0] = 0
      unless $values[0];
    
    my $sign = $value->{sign};
    
    $where .= ($where ? " and " :  "where ") . sprintf(qq' ("%s" between ?::%s and ?::%s)', $key, ($type{$key}) x 2);
    push @bind, map {s/,/./g; s/[^\d\-\.]//g; $sign ? $sign*$_ : $_;}  (($sign && $sign < 0) ? reverse @values : @values);
    
  }
  
  my $r = $self->dbh->selectall_arrayref($self->sth('список или позиция', where=>$where), {Slice=>{}}, @bind);
  
}

sub удалить {
  my ($self, $id) = @_;
  $self->_delete($self->{template_vars}{schema}, $main_table, ["id"], {id=>$id});
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


@@ список или позиция
---
select * from (
select m.*,
  to_char(m."дата", 'TMdy, DD TMmonth YYYY') as "дата формат",
  c.id as "категория/id", "категории/родители узла/title"(c.id, false) as "категории",
  w.id as "кошелек/id", w.title as "кошелек",
  ca.id as "контрагент/id", ca.title as "контрагент"
  ---, w."проект"
from  "{%= $schema %}"."{%= $tables->{main} %}" m
  left join (select c.*, r.id2 as _ref
  from refs r join "категории" c on r.id1=c.id
  ) c on c._ref = m.id
  
  left join (select w.*, r.id2 as _ref
  from refs r join "кошельки" w on r.id1=w.id
    join refs rp on w.id=rp.id2
    ---join "проекты" p on rp.id1=p.id
    where ?::int is  null or rp.id1=?
  ) w on w._ref = m.id
  
  left join (select c.*, r.id2 as _ref
  from refs r join "контрагенты" c on r.id1=c.id
  ) ca on ca._ref = m.id

where (?::int is null or m.id =?)
) m
{%= $where %}

order by "дата" desc, ts desc
;