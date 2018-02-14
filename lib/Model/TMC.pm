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
  
  my $prev = $self->позиция_тмц($data->{id})
    if ($data->{id});
  
  $data->{$_} = &Util::numeric($data->{$_})
    for qw(количество цена);
  
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, 'тмц', ["id"], $data);
  
  my %ref = ();#
  map {# прямые связи
    my $r = $self->связь($data->{"$_/id"} || $data->{$_}, $r->{id});
    $ref{"$r->{id1}:$r->{id2}"}++;
  } qw(объект номенклатура);
  map {
    my $id1 = $prev->{"$_/id"};
    $self->связь_удалить(id1=>$id1, id2=>$r->{id})
      unless $ref{"$id1:$r->{id}"};
  }  qw(объект номенклатура)
    if $prev;

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
  
  my $tz_prev = $self->model_transport->позиция_заявки($data->{id})
    if $data->{id};
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, "транспорт/заявки", ["id"], {map {($_=>$data->{$_})} grep {defined $data->{$_}} ("id", "uid", "дата1", "контакты грузоотправителей", "контакты заказчиков", "откуда", "куда", "груз", "коммент", "снабженец")});# "заказчики/id", "грузоотправители/id", 
  $tz_prev ||= $self->model_transport->позиция_заявки($r->{id});
  # обработать связи
  my %ref = (); # кэш сохраненных связей
  $r->{"заказчики"}=undef;#[];
  $r->{"грузоотправители"}=undef;#[];
  $r->{"на объект"}=undef;#[];
  map {
    my $rr = $self->связь($_, $r->{id});
    push @{$r->{"заказчики"} ||= []}, $rr->{id};
    $ref{"$rr->{id1}:$rr->{id2}"}++;
    $ref{"id$rr->{id}"}++;
  } grep {$_} @{$data->{"заказчики/id"}}
    if $data->{"заказчики/id"};
  map {
    my $rr = $self->связь($_, $r->{id});
    push @{$r->{"грузоотправители"} ||= []}, $rr->{id};
    $ref{"$rr->{id1}:$rr->{id2}"}++;
    $ref{"id$rr->{id}"}++;
  } grep {$_} @{$data->{"грузоотправители/id"}}
    if $data->{"грузоотправители/id"};
  map {
    my $rr = $self->связь($_, $r->{id});
    $r->{"на объект"} = $rr->{id};
    $ref{"$rr->{id1}:$rr->{id2}"}++;
    $ref{"id$rr->{id}"}++;
  } ($data->{"на объект/id"},)
    if $data->{"на объект/id"};
  
  $self->обновить($self->{template_vars}{schema}, "транспорт/заявки", ["id"], {id=>$r->{id}, "заказчики"=>$r->{"заказчики"}, "грузоотправители"=>$r->{"грузоотправители"}, "на объект"=>$r->{'на объект'}, });
  
  map {
    $self->связь_удалить(id1=>$_, id2=>$r->{id})
      unless $ref{"$_:$r->{id}"};
  } @{$tz_prev->{"заказчики/id"}};
  
  map {
    $self->связь_удалить(id1=>$_, id2=>$r->{id})
      unless $ref{"$_:$r->{id}"};
  } @{$tz_prev->{"грузоотправители/id"}};
  
  map {
    $self->связь_удалить(id1=>$_, id2=>$r->{id})
      unless $ref{"$_:$r->{id}"};
  } @{$tz_prev->{"базы/id"}};
  #~ my $r = eval {$self->model_transport->сохранить_заявку(
    #~ (map {($_=>$data->{$_})} grep {defined $data->{$_}} ("id", "uid", "дата1", "заказчики/id", "грузоотправители/id", "контакты грузоотправителей", "контакты заказчиков", "откуда", "куда", "груз", "коммент", "снабженец")),
  #~ )};
  #~ return $@
    #~ unless ref $r;
  
  my @pos = grep {$_->{id}} @{$data->{'позиции'} || $data->{'позиции тмц'}}
    or return "Нет позиций ТМЦ в сохранении оплаты";
  
  #~ if ($data->{'автор снаб->трансп/id'}) {
    #~ my $r = $self->связь($data->{'автор снаб->трансп/id'}, $r->{id});
    #~ $ref{"$r->{id1}:$r->{id2}"}++;
  #~ } else {
    #~ return "Кто автор обработки снабжение->танспорт?";
    
  #~ }
  
  
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
  my $oid = (ref($param->{объект}) ? $param->{объект}{id} : $param->{объект})
    // die "Нет объекта";
  $param->{where} = ' where "позиции тмц" is not null ';
  $param->{where} .= <<END_SQL#' and jsonb_array_elements(jsonb_array_elements("куда"))::text=?::text'
/*** поиск объекта в адресе (потом может пригодится)
and exists ( --- объект-куда
  select id
  from (----- развернуть два уровня jsonb-массива "куда"
    select jsonb_array_elements(jsonb_array_elements("куда"))::text as ob, id
    from "транспорт/заявки"
    where id=t.id
  ) ob
  where ob.ob=\?::text
)***/
and ?::int=any("позиции тмц/объекты/id"|| "базы/id")
END_SQL
    and push @{ $param->{bind} ||=[] }, $oid #qq|"#$oid"|
    if $oid;
  $self->model_transport->список_заявок($param);
}

#~ sub адреса_отгрузки {
  #~ my ($self, $id) = @_;
  #~ $self->dbh->selectcol_arrayref($self->sth('адреса отгрузки'), undef, $id);
#~ };

sub база_заявки {
  my ($self, $param) = @_;
  my $oid = (ref($param->{объект}) ? $param->{объект}{id} : $param->{объект})
    // die "Нет объекта";
  $param->{where} = ' where  ?::int=any("позиции тмц/объекты/id"|| "базы/id") and "позиции тмц/json" is not null and "транспорт/id" is not null ';
  push @{ $param->{bind} ||=[] }, $oid;
  #~ $self->список_снаб($param);
  $self->model_transport->список_заявок($param);
}

1;

__DATA__
@@ таблицы
create table IF NOT EXISTS "тмц" (
/* заявки на объектах 
связи:
id1("номенклатура")->id2("тмц")
id1("объекты")->id2("тмц") --- куда, на какой объект
id1("тмц")->id2("объекты") --- (возможно) откуда, с какого объекта (перемещение)
*/
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи заказчик
  "дата1" date not null, -- дата на объект
  ---"номенклатура" int not null,
  "количество" numeric not null, --- по заявке
  ---"ед" varchar, единицы в самой номенклатуре
  "цена" money, -- дополняет сюда менеджер снабжения
  "коммент" text,
  
  "количество/принято" numeric, --- подтвержение о поступлении на объект или базу
  "дата/принято" timestamp without time zone, --- 
  "принял" int --- профиль кто принял
);

/*
alter table "тмц" add column "количество/принято" numeric; --- подтвержение о поступлении на объект или базу 
alter table "тмц" add column   "дата/принято" timestamp without time zone; --- 
alter table "тмц" add column   "принял" int; --- профиль кто принял
);


*/
--- удалить таблицу
drop table IF EXISTS "тмц/снаб";
--- обработка снабжением создает транспортную заявку связанную с позициями таблицы "тмц"
---create table IF NOT EXISTS "тмц/снаб" (
/* заявки обработал снабженец
связи:
id1("контрагенты")->id2("тмц/снаб")
id1("тмц")->id2("тмц/снаб")
*/

/*id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  "дата отгрузки" date not null,
  "адрес отгрузки" text,
  "коммент" text
);*/

@@ список или позиция
--- 
select * from (
select m.*,
  "формат даты"(m."дата1") as "дата1 формат",
  timestamp_to_json(m."дата1"::timestamp) as "$дата1",
  timestamp_to_json(m."дата/принято"::timestamp) as "$дата/принято",
  EXTRACT(epoch FROM now()-"дата/принято")/3600 as "дата/принято/часов",
  o.id as "объект/id", o.name as "объект", row_to_json(o) as "объект/json",
  n.id as "номенклатура/id", "номенклатура/родители узла/title"(n.id, true) as "номенклатура",
  tz.id as "транспорт/заявки/id", -- позиция обработана
  p.names as "профиль заказчика"

from  "тмц" m
  join "профили" p on m.uid=p.id

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
  timestamp_to_json(m."дата1"::timestamp) as "$дата1",
  timestamp_to_json(t."дата/принято"::timestamp) as "$дата/принято",
  ----to_char(m."дата1", 'TMdy, DD TMmon' || (case when date_trunc('year', now())=date_trunc('year', m."дата1") then '' else ' YYYY' end)) as "дата1 формат",
  o.id as "объект/id", o.name as "объект", row_to_json(o) as "объект/json",
  n.id as "номенклатура/id", "номенклатура/родители узла/title"(n.id, true) as "номенклатура",
  p.names as "профиль заказчика"

from 
  "тмц" m

  join "профили" p on m.uid=p.id

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