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
  my $self= shift;
  my $data = ref $_[0] ? shift : {@_};
  my $prev = $self->позиция($data->{id})
    if ($data->{id});#$self->позиция($r->{id}, defined($data->{'кошелек2'}))
  
  #~ my $tx_db = $self->dbh->begin;
  #~ local $self->{dbh} = $tx_db;
  
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, 'тмц', ["id"], $data);
  #~ $self->связь($data->{'объект'}, $r->{id})
    #~ if $data->{'объект'};
  $prev ||= $self->позиция($r->{id});
  
  map {# прямые связи
    if ($data->{$_}) {
      my $rr= $self->связь_получить($prev->{"$_/id"}, $r->{id});
      $r->{"связь/$_"} = $rr && $rr->{id}
        ? $self->связь_обновить($rr->{id}, $data->{$_}, $r->{id})
        : $self->связь($data->{$_}, $r->{id});
    } elsif ($_ ~~ qw'контрагент') {# можно чикать/нет
      $self->связь_удалить(id1=>$prev->{"$_/id"}, id2=>$r->{id});
    }
  } qw(объект номенклатура контрагент);
  
  #~ map {# обратная связь OK
    #~ if ($data->{$_}) {
      #~ my $rr= $self->связь_получить($r->{id}, $prev->{"$_/id"});
      #~ $r->{"обратная связь/$_"} = $rr && $rr->{id}
        #~ ? $self->связь_обновить($rr->{id}, $r->{id}, $data->{$_},)
        #~ : $self->связь($r->{id}, $data->{$_}, );
    #~ } else {
      #~ $self->связь_удалить(id1=>$r->{id}, id2=>$prev->{"$_/id"}, );
    #~ }
  #~ } qw(кошелек2 профиль);
  
  #~ $tx_db->commit;

  return $self->позиция($r->{id});
  
  #~ $tx_db->commit;
  return $r;
}

sub позиция {
  my ($self, $id) = @_; # $wallet2 - флажок внутреннего перемещения
  
  my $r = $self->dbh->selectrow_hashref($self->sth('список или позиция'), undef, ($id) x 2,);
  
}

my %type = ("дата1"=>'date',);
sub список {
  my ($self, $obj, $param) = @_;
  
  my $where = "";
  my @bind = (($obj) x 2, (undef) x 2);
  
  
  while (my ($key, $value) = each %{$param->{table} || {}}) {
    next
      unless ref($value) && ($value->{ready} || $value->{_ready}) ;
    
    if ($value->{id}) {
      $where .= ($where ? " and " :  "where ").qq| "$key/id"=? |;
      push @bind, $value->{id};
      next;
    }
    
    my @values = @{$value->{values} || []};
    next
      unless @values;
    #~ $values[1] = 10000000000
      #~ unless $values[1];
    #~ $values[0] = 0
      #~ unless $values[0];
    
    #~ my $sign = $value->{sign};
    
    $where .= ($where ? " and " :  "where ") . sprintf(qq' ("%s" between ?::%s and ?::%s)', $key, ($type{$key}) x 2);
    push @bind, map {s/,/./g; s/[^\d\-\.]//gr;}  @values;
    
  }
  
  my $limit_offset = "LIMIT 100 OFFSET ".($param->{offset} // 0);
  
  my $r = $self->dbh->selectall_arrayref($self->sth('список или позиция', where=>$where, limit_offset=>$limit_offset), {Slice=>{}}, @bind);
  
}

1;

__DATA__
@@ таблицы
create table IF NOT EXISTS "тмц" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  "дата1" date not null, -- дата на объект
  ---"номенклатура" int not null,
  "количество" numeric not null,
  "ед" varchar,
  "коммент" text
);

@@ список или позиция
---
select * from (
select m.*,
  to_char(m."дата1", 'TMdy, DD TMmonth' || (case when date_trunc('year', now())=date_trunc('year', m."дата1") then '' else ' YYYY' end)) as "дата формат",
  o.id as "объект/id", o.name as "объект",
  n.id as "номенклатура/id", "номенклатура/родители узла/title"(n.id, true) as "номенклатура",
  ca.id as "контрагент/id", ca.title as "контрагент"

from  "тмц" m

  join (
    select o.*, r.id2 as _ref
    from refs r join "объекты" o on r.id1=o.id
    where coalesce(?::int, 0)=0 or o.id=? -- все объекты или один
  ) o on o._ref = m.id

  join (
    select c.*, r.id2 as _ref
    from refs r join "номенклатура" c on r.id1=c.id
  ) n on n._ref = m.id
  
  left join ({%= $dict->render('контрагент') %}) ca on ca._ref = m.id


where (?::int is null or m.id =?)
) m
{%= $where || '' %}

order by "дата1" desc, ts desc
{%= $limit_offset || '' %}
;

@@ контрагент
-- подзапрос
select c.*, r.id2 as _ref
from refs r
join "контрагенты" c on r.id1=c.id