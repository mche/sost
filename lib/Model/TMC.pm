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
  $self->dbh->do($self->sth('функции'));
  return $self;
}

sub сохранить_заявку {
  my $self= shift;
  my $data = ref $_[0] ? shift : {@_};
  
  my $prev = $self->позиция_тмц($data->{id})
    if ($data->{id});
  
  delete $data->{uid}
    if $prev && $prev->{uid};
  
  $data->{$_} = &Util::numeric($data->{$_})
    for qw(количество цена);
  
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, 'тмц', ["id"], $data);
  
  my %ref = ();#
  map {# прямые связи
    my $id = $data->{"$_/id"} || $data->{$_};
    my $r = $self->связь( $id, $r->{id})
      if $id;
    $ref{"$r->{id1}:$r->{id2}"}++
      if $r;
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
  
  return "Редактирование отклонено: транспорт везет груз"
    if $prev->[0] && $prev->[0]{'транспорт/id'};
  
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
  map {
    my $rr = $self->связь($_, $r->{id});
    $r->{"с объекта"} = $rr->{id};
    $ref{"$rr->{id1}:$rr->{id2}"}++;
    $ref{"id$rr->{id}"}++;
  } ($data->{"с объекта/id"},)
    if $data->{"с объекта/id"};
  
  $self->обновить($self->{template_vars}{schema}, "транспорт/заявки", ["id"], {id=>$r->{id}, "заказчики"=>$r->{"заказчики"}, "грузоотправители"=>$r->{"грузоотправители"}, "на объект"=>$r->{'на объект'}, "с объекта"=>$r->{'с объекта'},});
  
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
  
  my @pos = grep {$_->{id}} @{$data->{'$позиции'} || $data->{'$позиции тмц'}}
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
  my ($self, $param) = @_;
  my $oid = (ref $param->{объект} ? $param->{объект}{id} : $param->{объект})
    // die "какой объект (или все=0)";
    #~ $self->app->log->error($self->app->dumper($param));
  my $where = $param->{where} || "";
  my @bind = (($oid) x 2, (undef) x 2, ($param->{'транспорт/заявки/id'} && (ref $param->{'транспорт/заявки/id'} ? $param->{'транспорт/заявки/id'} : [$param->{'транспорт/заявки/id'}])) x 2,);
  
  
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
  
  my $limit_offset = $param->{limit_offset} // "LIMIT " . ($param->{limit} || 100) . " OFFSET " . ($param->{offset} || 0);
  
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
  $param->{where} = ' where "позиции тмц/id" is not null ';
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

sub заявки_с_транспортом {
  my ($self, $param) = @_;
  my $oid = (ref($param->{объект}) ? $param->{объект}{id} : $param->{объект})
    // die "Нет объекта";
  #~ $param->{where} = ' where  ?::int=any("позиции тмц/объекты/id"|| "базы/id") /*and "позиции тмц/id" is not null*/ and "транспорт/id" is not null ';
  $param->{where} = ' where ?::int=any("позиции тмц/объекты/id"|| "базы/id") ';
  #~ $param->{where_tmc} = ' and (o1.id=? or o2.id=? or o.id=?) ';
  push @{ $param->{bind} ||=[] }, ($oid) x 1;
  $param->{join_tmc} = '';
  $param->{join_transport} = '';
  $param->{order_by} = '';
  #~ $self->список_снаб($param);
  $self->model_transport->список_заявок($param);
}

sub заявки_перемещение {# без транспорта
  my ($self, $param) = @_;
  my $oid = (ref($param->{объект}) ? $param->{объект}{id} : $param->{объект})
    // die "Нет объекта";
  $param->{where} = ' where ("с объекта/id"=?::int or "на объект/id"=?::int) /*and "позиции тмц/id" is not null*/ and "транспорт/id" is null ';
  push @{ $param->{bind} ||=[] }, ($oid) x 2;
  $param->{join_tmc} = '';
  #~ $self->список_снаб($param);
  $self->model_transport->список_заявок($param);
  
}

sub текущие_остатки {# массив ИД  объектов
  my ($self, $uid, $oids) = @_;
  #~ my $oid = (ref($param->{объект}) ? $param->{объект}{id} : $param->{объект});
  my $r = $self->dbh->selectall_arrayref($self->sth('текущие остатки'), {Slice=>{}}, $uid, $oids);
  
}

sub движение_тмц {
  my ($self, $param) = @_;
  my $oid = $param->{'объект/id'} eq 0 ? undef : [$param->{'объект/id'}];
  my $r = $self->dbh->selectall_arrayref($self->sth('движение'), {Slice=>{}}, $param->{uid}, $oid, ($param->{'объект/id'}) x 2, ($param->{'номенклатура/id'}) x 2,);
}

1;

__DATA__
@@ таблицы
create table IF NOT EXISTS "тмц/заявки" (
/*** заявки на объектах 
связи:
id1("номенклатура")->id2("тмц/заявки")
id1("объекты")->id2("тмц/заявки") --- куда, на какой объект
***/
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи заказчик
  "дата1" date not null, -- дата на объект
  "наименование" text --- временный текст, номенклатуру укажет снабженец
  "количество" numeric not null, --- по заявке
  ---"ед" varchar, единицы в самой номенклатуре
  "коммент" text
  

);

create table IF NOT EXISTS "тмц" (
/*** снабжение обработка заявок
связи:
id1("тмц/заявки")->id2("тмц") --- одна позиция заявок - одна или несколько позиций обработки снабжения
***/
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи снабженец
  "количество" numeric not null, --- по отгрузке, повторяет или больше/меньше заявки
  "цена" money, -- 
  "коммент" text,
  
  "количество/принято" numeric, --- подтвержение о поступлении на объект или базу
  "дата/принято" timestamp without time zone, --- 
  "принял" int --- профиль кто принял
  

);

/***
alter table "тмц" add column "количество/принято" numeric; --- подтвержение о поступлении на объект или базу 
alter table "тмц" add column   "дата/принято" timestamp without time zone; --- 
alter table "тмц" add column   "принял" int; --- профиль кто принял
alter table "тмц" add column   "наименование" text; --- временный текст, номенклатуру укажет снабженец

alter table "тмц" drop column   "наименование"; --- временный текст, номенклатуру укажет снабженец
alter table "тмц" drop column "дата1";
);
***/

@@ функции

-------------------------------------------------------------
CREATE OR REPLACE VIEW "тмц/движение" AS
select
  m.id,
  'приход' as "движение",
  coalesce(tzo.id, z."объект/id") as "объект/id", null::int as "объект2/id",--на объект
  z."номенклатура/id",
  m."количество/принято",
  m."цена",
  m."дата/принято"

from 
  "тмц" m
  ---join "профили" p on m.uid=p.id

  left join (
    select o.* , tz.id as "транспорт/заявки/id", /*ro2.id1 as "с объекта/id",*/
    r.id1
    from refs r
      join "транспорт/заявки" tz on r.id2=tz.id
      join refs ro on tz."на объект"=ro.id
      join "объекты" o on o.id=ro.id1
      ----left join refs ro2 on tz."с объекта"=ro2.id
  ) tzo on tzo.id1=m.id

  join (
    select
      m.*,
      o.id as "объект/id",
      n.id as "номенклатура/id",
      r.id2
    from
      "тмц/заявки" m
      join refs r on m.id=r.id1
      join (
        select o.*, r.id2
        from refs r
          join "объекты" o on r.id1=o.id
      ) o on o.id2=m.id

      join (
        select c.*, r.id2
        from refs r
          join "номенклатура" c on r.id1=c.id
      ) n on n.id2=m.id
  
  ) z 


where m."количество/принято" is not null

union all --- перемещения

select
  m.id, 'расход' as "движение",
  tzo.id, --- с объекта
  o."объект/id" as "объект2/id", -- на какой объект
  n."номенклатура/id",
  -m."количество/принято",
  m."цена",
  m."дата/принято"
from
   "тмц" m
   join (
    select o.* , tz.id as "транспорт/заявки/id", r.id1
    from refs r
      join "транспорт/заявки" tz on r.id2=tz.id
      join refs ro on tz."с объекта"=ro.id
      join "объекты" o on o.id=ro.id1
      left join refs ro2 on tz."на объект"=ro2.id
  ) tzo on tzo.id1=m.id
  
  join (
    select
      m.*,
      o.id as "объект/id", -- на какой объект
      n.id as "номенклатура/id",
      r.id2
    from 
      "тмц/заявки" m
      join refs r on m.id=r.id1
      
      left join (--- на объект
        select o.*, r.id2
        from refs r
          join "объекты" o on r.id1=o.id
      ) o on o.id2=m.id
      
      join (
        select c.*, r.id2
        from refs r
          join "номенклатура" c on r.id1=c.id
      ) n on n.id2=m.id
  
  ) z on m.id=z.id2

where m."количество/принято" is not null
;

@@ список или позиция
--- заявки
select * from (
select
  m.*,
  timestamp_to_json(m.ts::timestamp) as "$ts/json",
  "формат даты"(m."дата1") as "дата1 формат",
  timestamp_to_json(m."дата1"::timestamp) as "$дата1/json",
  o.id as "объект/id", o.name as "объект", row_to_json(o) as "$объект/json",
  n.id as "номенклатура/id", "номенклатура/родители узла/title"(n.id, true) as "номенклатура",
  tz.*,
  p.names as "профиль заказчика"

from  "тмц/заявки" m
  join "профили" p on m.uid=p.id

  join (
    select o.*, r.id2
    from refs r
      join "объекты" o on r.id1=o.id
    where coalesce(?::int, 0)=0 or o.id=? -- все объекты или один
  ) o on o.id2=m.id

  left join (
    select c.*, r.id2
    from refs r
      join "номенклатура" c on r.id1=c.id
  ) n on n.id2=m.id
  
  left join (
    select 
      m.id as "тмц/id", m."дата/принято" as "тмц/дата/принято", row_to_json(m) as "$тмц/json",
      timestamp_to_json(m."дата/принято"::timestamp) as "$тмц/дата/принято/json",
      EXTRACT(epoch FROM now()-m."дата/принято")/3600 as "тмц/дата/принято/часов",
      tz.id as "транспорт/заявки/id", row_to_json(tz) as "$транспорт/заявки/json",
      tr.id as "транспорт/id",  tz."с объекта", tz."на объект",
      r.id1
    from 
      "тмц" m
      join refs r on m.id=r.id2
      join refs rt on m.id=r.id1
      join "транспорт/заявки" tz on r.id2=tz.id
      left join (
        select tr.*, r.id2
        from refs r
          join "транспорт" tr on tr.id=r.id1
      
      ) tr on tz.id=tr.id2
  ) tz on tz.id1=m.id

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
  timestamp_to_json(m.ts::timestamp) as "$тмц/ts/json",
  timestamp_to_json(t."дата/принято"::timestamp) as "$дата/принято/json",
  ----to_char(m."дата1", 'TMdy, DD TMmon' || (case when date_trunc('year', now())=date_trunc('year', m."дата1") then '' else ' YYYY' end)) as "дата1 формат",
  z.*
  p.names as "профиль заказчика"

from 
  "тмц" m
  join "профили" p on m.uid=p.id
  
  join (
    select
      m.id as "тмц/заявки/id", row_to_json(m) as "$тмц/заявки/json",
      timestamp_to_json(m.ts::timestamp) as "$тмц/заявки/ts/json",
      "формат даты"(m."дата1") as "дата1 формат",
      timestamp_to_json(m."дата1"::timestamp) as "$дата1/json",
      o.id as "объект/id", o.name as "объект", row_to_json(o) as "$объект/json",
      n.id as "номенклатура/id", "номенклатура/родители узла/title"(n.id, true) as "номенклатура",
      r.id2
    from "тмц/заявки" m
    join refs r on m.id=r.id1
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
  
  ) z on m.id=z.id2

  
  
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


@@ текущие остатки
--тмц
-- по доступным объектам

select
  d."объект/id", ---row_to_json(o) as "$объект/json",
  d."номенклатура/id", ---n."$номенклатура/json",
  d."остаток"

from 
  (
    select "объект/id", "номенклатура/id",
    sum("количество/принято") as "остаток"
    from "тмц/движение"
    ---where coalesce(?::int, 0)=0 or "объект/id"=any(?)
    group by "объект/id", "номенклатура/id"
  ) d
  ---join "проекты/объекты" o on d."объект/id"=o.id
  join "доступные объекты"(?, ?) o on d."объект/id"=o.id
  
  /***join lateral (
    select o.*, p.id as "проект/id", p.name as "проект"
    from 
    "доступные объекты"(?, ?) o
    left join (
      select distinct p.id, p.name, r.id2
      from "refs" r
        join "проекты" p on p.id=r.id1
      ) p on o.id=p.id2
    where d."объект/id"=o.id -- lateral
    ) o on true
  
  join lateral (
    select array_agg(row_to_json(n) order by n.level desc) as "$номенклатура/json"
    from "номенклатура/родители узла"(d."номенклатура/id", true) n
  ) n on true
  ***/

where d."остаток" is not null or d."остаток"<>0
;

@@ движение
-- тмц
select d.*, timestamp_to_json(d."дата/принято"::timestamp) as "$дата/принято/json",
  tz.id as "транспорт/заявки/id",
  tz."с объекта/id", tz."на объект/id",
  tz."грузоотправители/id",
  tz."$грузоотправители/json"
from
  "тмц/движение" d
  join "доступные объекты"(?, ?) o on d."объект/id"=o.id
  
  left join (
    select tz.id,
      ro1.id1 as "с объекта/id", ro2.id1 as "на объект/id",
      k_go."грузоотправители/id",
      k_go."$грузоотправители/json",
      r.id1
    from refs r
      join "транспорт/заявки" tz on r.id2=tz.id
      --- грузоотправителя
      
      left join lateral (-- все грузоотправители иды (перевести связи в ид контрагента)
        select array_agg(r.id1 order by un.idx) as "грузоотправители/id",  array_agg(row_to_json(k) order by un.idx) as "$грузоотправители/json"
        from unnest(tz."грузоотправители") WITH ORDINALITY as un(id, idx)
          join refs r on un.id=r.id
          join (
            select distinct k.*,  p.id as "проект/id", p.name as "проект"
            from "контрагенты" k
              left join (-- проект 
                select p.*,  r.id2
                from refs r
                  join "проекты" p on p.id=r.id1
              ) p on k.id=p.id2 
          ) k on k.id=r.id1
        where r.id2=tz.id
        group by tz.id
      ) k_go on true
      
      left join refs ro1 on ro1.id=tz."с объекта"
      left join refs ro2 on ro2.id=tz."на объект"
      
  ) tz on tz.id1=d.id

  
where (coalesce(?::int, 0)=0 or d."объект/id"=?)
  and (coalesce(?::int, 0)=0 or d."номенклатура/id"=?)
order by d."дата/принято" desc
;
