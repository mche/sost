package Model::TMC;
use Mojo::Base 'Model::Base';

#~ has sth_cached => 1;
has [qw(app)];
has model_obj => sub {shift->app->models->{'Object'}};

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
  
  my $prev = $self->позиция_тмц($data->{id})
    if ($data->{id});#$self->позиция($r->{id}, defined($data->{'кошелек2'}))
  
  #~ my $tx_db = $self->dbh->begin;
  #~ local $self->{dbh} = $tx_db;
  
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, 'тмц', ["id"], $data);
  #~ $self->связь($data->{'объект'}, $r->{id})
    #~ if $data->{'объект'};
  $prev ||= $self->позиция_тмц($r->{id});
  
  map {# прямые связи
    if ($data->{$_}) {
      my $rr= $self->связь_получить($prev->{"$_/id"}, $r->{id});
      $r->{"связь/$_"} = $rr && $rr->{id}
        ? $self->связь_обновить($rr->{id}, $data->{$_}, $r->{id})
        : $self->связь($data->{$_}, $r->{id});
    } #else {die "Не указан [$_] для записи"}
    #~ elsif ($_ ~~ qw'контрагент') {# можно чикать/нет
      #~ $self->связь_удалить(id1=>$prev->{"$_/id"}, id2=>$r->{id});
    #~ }
  } qw(объект номенклатура);
  
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

  return $self->позиция_тмц($r->{id});
}

sub сохранить_оплату {
  my $self= shift;
  my $data = ref $_[0] ? shift : {@_};
  
  my $prev = $self->позиции_оплаты($data->{id})
    if ($data->{id});#$self->позиция($r->{id}, defined($data->{'кошелек2'}))
  
  #~ my $tx_db = $self->dbh->begin;
  #~ local $self->{dbh} = $tx_db;
  
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, 'тмц/оплата', ["id"], $data);
  
  my @refs = @{$data->{'позиции тмц'} || $data->{'позиции'}}
    or die "Нет позиций ТМЦ в сохранении оплаты";
    
  if($data->{id}){
    map {# прямые связи
      if ($data->{$_}) {
        my $rr= $self->связь_получить($prev->[0]{"$_/id"}, $r->{id});
        $r->{"связь/$_"} = $rr && $rr->{id}
          ? $self->связь_обновить($rr->{id}, $data->{$_}, $r->{id})
          : $self->связь($data->{$_}, $r->{id});
      }
    } qw(контрагент);
    
    
    map {# удаление позиций 
      my $rr = $_;
      
      $self->связь_удалить(id=>$rr->{id})
        unless (grep $_->{id} eq $rr->{id1}, @refs);

    } @{ $self->dbh->selectall_arrayref($self->sth('связи/тмц/оплата'), {Slice=>{}}, ($r->{id}) x 2, (undef) x 2,) }
      if @refs;
  
  } else {# новая поз
    map { $self->связь($data->{$_}, $r->{id}); } qw(контрагент);
  }
  map { $self->связь($_->{id}, $r->{id}); } @refs;# добавление позиций

  return $self->позиции_оплаты($r->{id});
}

sub позиция_тмц {
  my ($self, $id) = @_; # $wallet2 - флажок внутреннего перемещения
  
  my $r = $self->dbh->selectrow_hashref($self->sth('список или позиция'), undef, (undef) x 2, ($id) x 2,);
  
}

sub позиции_оплаты {
  my ($self, $id) = @_; # $wallet2 - флажок внутреннего перемещения
  
  my $r = $self->dbh->selectall_arrayref($self->sth('список или позиция/оплата'), {Slice=>{}}, (undef) x 2, ($id) x 2,);
  
}

my %type = ("дата1"=>'date',"дата отгрузки"=>'date');
sub список {
  my ($self, $obj, $param) = @_;
    #~ $self->app->log->error($self->app->dumper($param));
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
    
    $where .= ($where ? " and " :  "where ") . sprintf(qq' ("%s" between ?::%s and ?::%s)', $key, ($type{$key}) x 2);
    push @bind, map {s/,/./g; s/[^\d\-\.]//gr;}  @values;
    
  }
  
  my $limit_offset = "LIMIT 100 OFFSET ".($param->{offset} // 0);
  
  my $r = $self->dbh->selectall_arrayref($self->sth($param->{'список оплаты'} ? 'список или позиция/оплата' : 'список или позиция', where=>$where, limit_offset=>$limit_offset), {Slice=>{}}, @bind);
  
}

1;

__DATA__
@@ таблицы
create table IF NOT EXISTS "тмц" (
/* заявки на объектах 
связи:
id1("номенклатура")->id2("тмц")
id1("объекты")->id2("тмц")
*/
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  "дата1" date not null, -- дата на объект
  ---"номенклатура" int not null,
  "количество" numeric not null,
  "ед" varchar,
  "цена" money, -- дополняет сюда менеджер снабжения
  "коммент" text
);

create table IF NOT EXISTS "тмц/оплата" (
/* заявки обработал снабженец
связи:
id1("контрагенты")->id2("тмц/оплата")
id1("тмц")->id2("тмц/оплата")
*/
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  "дата отгрузки" date not null,
  "адрес отгрузки" text,
  "коммент" text
);

@@ список или позиция
--- тут без оплаты
select * from (
select m.*,
  "формат даты"(m."дата1") as "дата1 формат",
  ----to_char(m."дата1", 'TMdy, DD TMmon' || (case when date_trunc('year', now())=date_trunc('year', m."дата1") then '' else ' YYYY' end)) as "дата1 формат",
  o.id as "объект/id", o.name as "объект",
  n.id as "номенклатура/id", "номенклатура/родители узла/title"(n.id, true) as "номенклатура"
%#  ca.id as "контрагент/id", ca.title as "контрагент"

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
  
%#  left join ({%= $dict->render('контрагент') %}) ca on ca._ref = m.id


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

@@ список или позиция/оплата
--- 
select * from (
select 
  m.*,
  "формат даты"(m."дата1") as "дата1 формат",
  ----to_char(m."дата1", 'TMdy, DD TMmon' || (case when date_trunc('year', now())=date_trunc('year', m."дата1") then '' else ' YYYY' end)) as "дата1 формат",
  o.id as "объект/id", o.name as "объект",
  n.id as "номенклатура/id", "номенклатура/родители узла/title"(n.id, true) as "номенклатура",
  ca.id as "контрагент/id", ca.title as "контрагент",
  mo._ref as "связь/тмц/оплата",
  mo.id as "тмц/оплата/id",
  mo."дата отгрузки", "формат даты"(mo."дата отгрузки") as "дата отгрузки/формат",
  mo."адрес отгрузки",
  mo."коммент" as "тмц/оплата/коммент"

from  "тмц" m
  left join ({%= $dict->render('связь/тмц/оплата') %}) mo on mo._id1 = m.id
  left join ({%= $dict->render('контрагент') %}) ca on ca._ref = mo.id

  join (
    select o.*, r.id2 as _ref
    from refs r join "объекты" o on r.id1=o.id
    where coalesce(?::int, 0)=0 or o.id=? -- все объекты или один
  ) o on o._ref = m.id

  join (
    select c.*, r.id2 as _ref
    from refs r join "номенклатура" c on r.id1=c.id
  ) n on n._ref = m.id

where (?::int is null or mo.id =?)
) m
{%= $where || '' %}

order by "дата1" desc, ts desc
{%= $limit_offset || '' %}
;

@@ связь/тмц/оплата
-- подзапрос
select o.*, r.id1 as _id1, r.id as _ref
from refs r
join "тмц/оплата" o on r.id2=o.id

@@ связи/тмц/оплата
--- только ИДы связей
--- для пересохранения/удаления позиций
select r.*
from "тмц/оплата" o
  join refs r on o.id=r.id2
  join "тмц" t on t.id=r.id1
where 
  (?::int is null or o.id=?) --- по ИДу оплаты
  and
  (?::int is null or t.id=?) --- по ИДу тмц