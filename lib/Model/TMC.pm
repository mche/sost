package Model::TMC;
use Mojo::Base 'Model::Base';
use Util;

#~ has sth_cached => 1;
has [qw(app)];
has model_obj => sub {shift->app->models->{'Object'}};
has model_transport => sub {shift->app->models->{'Transport'}};

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
  
  #~ my $prev = $self->позиция_тмц($data->{id})
    #~ if ($data->{id});
  
  $data->{$_} = &Util::numeric($data->{$_})
    for qw(количество цена);
  
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, 'тмц', ["id"], $data);
  
  my %ref = ();#
  map {# прямые связи
    my $r = $self->связь($data->{$_}, $r->{id});
    $ref{"$r->{id1}:$r->{id2}"}++;
  } qw(объект номенклатура);
  map {
    my $id1 = $data->{_prev}{"$_/id"};
    $self->связь_удалить(id1=>$id1, id2=>$r->{id})
      unless $ref{"$id1:$r->{id}"};
  }  qw(объект номенклатура)
    if $data->{_prev};

  #~ my $pos = $self->позиция_тмц($r->{id});
  #~ $self->app->log->error($self->app->dumper($pos));
  return $r;
}

sub сохранить_снаб {
  my $self= shift;
  my $data = ref $_[0] ? shift : {@_};
  
  #~ $self->app->log->error($self->app->dumper($data));
  
  my $prev = $self->позиции_снаб($data->{id})
    if ($data->{id});#$self->позиция($r->{id}, defined($data->{'кошелек2'}))
  
  #~ my $tx_db = $self->dbh->begin;
  #~ local $self->{dbh} = $tx_db;
  
  #~ my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, 'тмц/снаб', ["id"], $data);
  
  my $r = eval {$self->model_transport->сохранить_заявку(
    (map {($_=>$data->{$_})} grep {defined $data->{$_}} ("id", "uid", "дата1", "заказчики/id", "грузоотправители/id", "контакты грузоотправителей", "откуда", "куда", "груз", "коммент", "снабженец")),
      #~ "uid"=>0,#>auth_user->{id},
  )};
  return $@
    unless ref $r;
  
  my @pos = grep {$_->{id}} @{$data->{'позиции тмц'} || $data->{'позиции'}}
    or return "Нет позиций ТМЦ в сохранении оплаты";
  
  #~ if ($data->{'автор снаб->трансп/id'}) {
    #~ my $r = $self->связь($data->{'автор снаб->трансп/id'}, $r->{id});
    #~ $ref{"$r->{id1}:$r->{id2}"}++;
  #~ } else {
    #~ return "Кто автор обработки снабжение->танспорт?";
    
  #~ }
  
  my %ref = (); # кэш сохраненных связей
  map {# связать все позиции с одной транспортной заявкой
    my $r = $self->связь($_->{id}, $r->{id});
    $ref{"$r->{id1}:$r->{id2}"}++;
  } @pos; #@{ $self->dbh->selectall_arrayref($self->sth('связи/тмц/снаб'), {Slice=>{}}, ($r->{id}) x 2, (undef) x 2,) };
  
  map {
    $self->связь_удалить(id1=>$_->{id}, id2=>$r->{id})
      unless $ref{"$_->{id}:$r->{id}"};
  } @$prev if $prev;
  
  #~ $self->app->log->error($self->app->dumper($r));
  $r->{'позиции'} = $self->позиции_снаб($r->{id});

  return $r;
}

sub позиция_тмц {
  my ($self, $id) = @_; #
  
  my $sth = $self->sth('список или позиция');
  #~ $sth->trace(1);
  my $r = $self->dbh->selectrow_hashref($sth, undef, (undef) x 2, ($id) x 2, (undef) x 2);
  
}

sub позиции_снаб {
  my ($self, $id) = @_; # id - трансп заявка
  
  my $r = $self->dbh->selectall_arrayref($self->sth('список или позиция'), {Slice=>{}}, (undef) x 2, (undef) x 2, ([$id]) x 2,);
  
}

my %type = ("дата1"=>'date',"дата отгрузки"=>'date');
sub список {
  my ($self, $obj, $param) = @_;
    #~ $self->app->log->error($self->app->dumper($param));
  my $where = $param->{where} || "";
  my @bind = (($obj) x 2, (undef) x 2, ($param->{'транспорт/заявки/id'} && (ref $param->{'транспорт/заявки/id'} ? $param->{'транспорт/заявки/id'} : [$param->{'транспорт/заявки/id'}])) x 2,);
  
  
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
  
  my $sth = $self->sth('список или позиция', where=>$where, limit_offset=>$limit_offset);
  #~ $sth->trace(1);
  my $r = $self->dbh->selectall_arrayref($sth, {Slice=>{}}, @bind);
  
}

sub удалить_заявку {
  my ($self, $id) = @_;
  my $r = $self->_delete($self->{template_vars}{schema}, 'тмц', ["id"], {id=>$id});
  $self->связи_удалить(id2=>$r->{id});
  return $r;
  
};

sub список_снаб {#обработанные позиции(трансп заявки) с агрегацией позиций тмц
  my ($self, $param) = @_;
  $self->model_transport->список_заявок($param)
}

#~ sub адреса_отгрузки {
  #~ my ($self, $id) = @_;
  #~ $self->dbh->selectcol_arrayref($self->sth('адреса отгрузки'), undef, $id);
#~ };

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
  ---"ед" varchar,
  "цена" money, -- дополняет сюда менеджер снабжения
  "коммент" text
);

--- удалить таблицу
--- обработка снабжением создает транспортную заявку связанную с позициями таблицы "тмц"
create table IF NOT EXISTS "тмц/снаб" (
/* заявки обработал снабженец
связи:
id1("контрагенты")->id2("тмц/снаб")
id1("тмц")->id2("тмц/снаб")
*/
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  "дата отгрузки" date not null,
  "адрес отгрузки" text,
  "коммент" text
);

@@ список или позиция
--- 
select * from (
select m.*,
  "формат даты"(m."дата1") as "дата1 формат",
  timestamp_to_json(m."дата1"::timestamp) as "$дата1",
  o.id as "объект/id", o.name as "объект",
  n.id as "номенклатура/id", "номенклатура/родители узла/title"(n.id, true) as "номенклатура",
  tz.id as "транспорт/заявки/id" -- позиция обработана

from  "тмц" m

  left join (
    select tz.*, r.id1
    from refs r
      join "транспорт/заявки" tz on r.id2=tz.id
  ) tz on tz.id1=m.id

  join (
    select o.*, r.id2
    from refs r
      join "объекты" o on r.id1=o.id
    where coalesce(?::int, 0)=0 or o.id=? -- все объекты или один
  ) o on o.id2=m.id

  join (
    select c.*, r.id2
    from refs r
      join "номенклатура" c on r.id1=c.id
  ) n on n.id2=m.id

where (?::int is null or m.id = ?)-- позиция
  and coalesce(?::int[], '{0}'::int[])='{0}'::int[] or tz.id=any(?::int[]) -- по идам транпортных заявок
) m
{%= $where || '' %}
{%= $order_by || ' order by "дата1", id ' %} --- сортировка в браузере
{%= $limit_offset || '' %}
;

@@ контрагент
-- подзапрос
select c.*, r.id2 as _ref
from refs r
join "контрагенты" c on r.id1=c.id

@@ список или позиция/снаб
--- для снабжения
---задача: обработанные(связанные с траспорт/заявки) позиции
select * from (
select 
  m.*,
  "формат даты"(m."дата1") as "дата1 формат",
  ----to_char(m."дата1", 'TMdy, DD TMmon' || (case when date_trunc('year', now())=date_trunc('year', m."дата1") then '' else ' YYYY' end)) as "дата1 формат",
  o.id as "объект/id", o.name as "объект",
  n.id as "номенклатура/id", "номенклатура/родители узла/title"(n.id, true) as "номенклатура"
---  ca.id as "контрагент/id", ca.title as "контрагент",
---  mo._ref as "связь/тмц/снаб",
---  mo.id as "тмц/снаб/id",
---  mo."дата отгрузки", "формат даты"(mo."дата отгрузки") as "дата отгрузки/формат",
---  mo."адрес отгрузки",
--- mo."коммент" as "тмц/снаб/коммент"

from 
  "тмц" m

  join (
    select o.*, r.id2
    from refs r
      join "объекты" o on r.id1=o.id
    where coalesce(?::int, 0)=0 or o.id=? -- все объекты или один
  ) o on o.id2=m.id
  
  join (
    select c.*, r.id2
    from refs r
      join "номенклатура" c on r.id1=c.id
  ) n on n.id2=m.id
  
  where ---(#::int is null or mo.id =#)
    exists (
    select tz.id
    from refs r
      join "транспорт/заявки" tz on r.id2=tz.id
    where 
      coalesce(?::int, 0)=0 or tz.id=? -- все  или одна
      and r.id1=m.id
  )
) m
{%= $where || '' %}
{%= $order_by || '' %} ----order by "дата отгрузки" desc, "связь/тмц/снаб" --- + сортировка в браузере
{%= $limit_offset || '' %}
;

@@ 000000связь/тмц/снаб
-- подзапрос
select o.*, r.id1 as _id1, r.id as _ref
from refs r
join "тмц/снаб" o on r.id2=o.id

@@ 00000связи/тмц/снаб
--- только ИДы связей
--- для пересохранения/удаления позиций
select r.*
from "тмц/снаб" o
  join refs r on o.id=r.id2
  join "тмц" t on t.id=r.id1
where 
  (?::int is null or o.id=?) --- по ИДу оплаты
  and
  (?::int is null or t.id=?) --- по ИДу тмц
  
@@ 000000адреса отгрузки
-- удалить это не нужно
select distinct t."адрес отгрузки"
from (
  select t.*
  from "тмц/снаб" t
    join refs r on t.id=r.id2
  where 
    r.id1=? -- ид контрагента
    and  t."адрес отгрузки" is not null
  order by t.ts desc
  limit 100
) t
order by "адрес отгрузки"
limit 10;