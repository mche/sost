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
  
  my $prev = $self->позиция_заявки($data->{id})
    if ($data->{id});
  
  delete $data->{uid}
    if $prev && $prev->{uid};
  
  $data->{$_} = &Util::numeric($data->{$_})
    for qw(количество цена);
  
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, 'тмц/заявки', ["id"], $data);
  
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

  my $pos = $self->позиция_заявки($r->{id});
  #~ $self->app->log->error($self->app->dumper($pos));
  return $pos;
}

sub сохранить_тмц {
  my $self= shift;
  my $data = ref $_[0] ? shift : {@_};
  
  my $prev = $self->позиция_тмц($data->{id})
    if $data->{id};
  
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, "тмц", ["id"], {map {($_=>$data->{$_})} grep {defined $data->{$_}} qw(id uid количество цена коммент количество/принято дата/принято принял)});
  
  # связь с заявкой
  my $zid = $data->{'тмц/заявка/id'} || $data->{'$тмц/заявка'} && $data->{'$тмц/заявка'}{id};
  $self->связь_удалить(id1=>$zid, id2=>$r->{id})
    if $zid && $prev && $prev->{'тмц/заявка/id'} ne $zid;
  $self->связь($zid, $r->{id})
    if $zid;
  
  return $self->позиция_тмц($r->{id});
}

sub сохранить_снаб {# обработка снабжения сохраняется в транспортную заявку
  my $self= shift;
  my $data = ref $_[0] ? shift : {@_};
  
  #~ my $prev = $self->позиции_снаб($data->{id})
    #~ if ($data->{id});#$self->позиция($r->{id}, defined($data->{'кошелек2'}))
  
  #~ return "Редактирование отклонено: транспорт везет груз"
    #~ if $prev->[0] && $prev->[0]{'транспорт/id'};
  
  my $tz_prev = $self->model_transport->позиция_заявки($data->{id}, {join_tmc=>1,})
    if $data->{id};
  return "Редактирование отклонено: транспорт везет тмц"
    if $tz_prev && $tz_prev->{'транспорт/id'};
  
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, "транспорт/заявки", ["id"], {map {($_=>$data->{$_})} grep {defined $data->{$_}} ("id", "uid", "дата1", "контакты грузоотправителей", "контакты заказчиков", "откуда", "куда", "груз", "коммент", "снабженец", "без транспорта")});# "заказчики/id", "грузоотправители/id", 
  
  # обработать связи
  my %ref = (); # кэш сохраненных связей
  $r->{"заказчики"}=undef;#[];
  $r->{"грузоотправители"}=undef;#[];
  $r->{"c объекта"}=undef;#[];
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
  } grep {$_} ($tz_prev->{"с объекта/id"}, $tz_prev->{"на объект/id"},);
  #~ my $r = eval {$self->model_transport->сохранить_заявку(
    #~ (map {($_=>$data->{$_})} grep {defined $data->{$_}} ("id", "uid", "дата1", "заказчики/id", "грузоотправители/id", "контакты грузоотправителей", "контакты заказчиков", "откуда", "куда", "груз", "коммент", "снабженец")),
  #~ )};
  #~ return $@
    #~ unless ref $r;
  
  my @pos = grep {$_->{id}} @{$data->{'$позиции'} || $data->{'$позиции тмц'}}
    or return "Нет позиций ТМЦ";
  
 
  map {# связать все позиции с одной транспортной заявкой
    my $r = $self->связь($_->{id}, $r->{id});
    $ref{"$r->{id1}:$r->{id2}"}++;
  } @pos; 
  
  map {
    $self->связь_удалить(id1=>$_, id2=>$r->{id})
      unless $ref{"$_:$r->{id}"};
  } @{$tz_prev->{'позиции тмц/id'}} if $tz_prev;
  
  #~ $self->app->log->error($self->app->dumper($r));
  #~ $r->{'позиции'} = $self->позиции_снаб($r->{id});

  $self->model_transport->позиция_заявки($r->{id}, {join_tmc=>1,});;
}

sub позиция_заявки {
  my ($self, $id) = @_; #
  
  my $sth = $self->sth('заявки/список или позиция');
  #~ $sth->trace(1);
  my $r = $self->dbh->selectrow_hashref($sth, undef, (undef) x 2, ($id) x 2, (undef) x 2);
  
}

sub позиция_тмц {
  my ($self, $id) = @_; #
  
  my $sth = $self->sth('тмц/список или позиция');
  #~ $sth->trace(1);
  my $r = $self->dbh->selectrow_hashref($sth, undef, (undef) x 2, ($id) x 2,);# (undef) x 2
  
}
#~ sub позиции_снаб {
  #~ my ($self, $id) = @_; # id - трансп заявка
  
  #~ my $r = $self->dbh->selectall_arrayref($self->sth('список или позиция'), {Slice=>{}}, (undef) x 2, (undef) x 2, ([$id]) x 2,);
  
#~ }

my %type = ("дата1"=>'date',"дата отгрузки"=>'date');
sub список_заявок {
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
    
    $where .= ($where ? " and " :  "where ") . sprintf(qq' ("%s" between ?::%s and ?::%s)', $key, ($type{$key}) x 2);
    push @bind, map {s/,/./g; s/[^\d\-\.]//gr;}  @values;
    
  }
  
  my $limit_offset = $param->{limit_offset} // "LIMIT " . ($param->{limit} || 100) . " OFFSET " . ($param->{offset} || 0);
  
  my $sth = $self->sth('заявки/список или позиция', select=>$param->{select} || '*', where=>$where, limit_offset=>$limit_offset);
  #~ $sth->trace(1);
  push @bind, $param->{async}
    if $param->{async} && ref $param->{async} eq 'CODE';
  my $r = $self->dbh->selectall_arrayref($sth, {Slice=>{}}, @bind);
  
}

sub удалить_заявку {
  my ($self, $id) = @_;
  my $r = $self->_delete($self->{template_vars}{schema}, 'тмц', ["id"], {id=>$id});
  $self->связи_удалить(id2=>$r->{id});
  return $r;
  
};

=pod
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

=cut

sub список_снаб {#обработанные позиции(трансп заявки)
  my ($self, $param) = @_;
  my $oid = (ref($param->{объект}) ? $param->{объект}{id} : $param->{объект})
    // die "Нет объекта";

  $param->{where} = <<END_SQL;#' and jsonb_array_elements(jsonb_array_elements("куда"))::text=?::text'
where (coalesce(?::int, 0)=0 or ?::int=any("позиции тмц/объекты/id"|| "с объекта/id" || "на объект/id"))
@{[ $param->{where}  || '']}
END_SQL
  unshift @{ $param->{bind} ||=[] }, ($oid) x 2; #qq|"#$oid"|
    #~ if $oid;
  $param->{join_tmc} = 1;
  $self->model_transport->список_заявок($param);
}

#~ sub адреса_отгрузки {
  #~ my ($self, $id) = @_;
  #~ $self->dbh->selectcol_arrayref($self->sth('адреса отгрузки'), undef, $id);
#~ };

=pod
sub заявки_с_транспортом {
  my ($self, $param) = @_;
  my $oid = (ref($param->{объект}) ? $param->{объект}{id} : $param->{объект})
    // die "Нет объекта";
  #~ $param->{where} = ' where  ?::int=any("позиции тмц/объекты/id"|| "базы/id") /*and "позиции тмц/id" is not null*/ and "транспорт/id" is not null ';
  $param->{where} = ' where ?::int=any("позиции тмц/объекты/id"|| "с объекта/id" || "на объект/id") ';
  #~ $param->{where_tmc} = ' and (o1.id=? or o2.id=? or o.id=?) ';
  push @{ $param->{bind} ||=[] }, ($oid) x 1;
  $param->{join_tmc} = 1;
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
  $param->{join_tmc} = 1;
  #~ $self->список_снаб($param);
  $self->model_transport->список_заявок($param);
  
}
=cut

sub текущие_остатки {# массив ИД  объектов
  my ($self, $uid, $oids, $param) = @_;
  #~ my $oid = (ref($param->{объект}) ? $param->{объект}{id} : $param->{объект});
  my @bind = ($uid, $oids);
  push @bind, $param->{async}
    if $param && $param->{async} && ref $param->{async} eq 'CODE';
  my $r = $self->dbh->selectall_arrayref($self->sth('текущие остатки', select=>$param->{select} || '*',), {Slice=>{}}, @bind);
  
}

sub движение_тмц {
  my ($self, $param) = @_;
  my $oid = $param->{'объект/id'} eq 0 ? undef : [$param->{'объект/id'}];
  my $r = $self->dbh->selectall_arrayref($self->sth('движение', select=>$param->{select} || '*',), {Slice=>{}}, $param->{uid}, $oid, ($param->{'объект/id'}) x 2, ($param->{'номенклатура/id'}) x 2,);
}

sub удалить_перемещение {
  my ($self, $id) = @_;
  my $r = $self->_delete($self->{template_vars}{schema}, 'транспорт/заявки', ["id"], {id=>$id});
  $self->связи_удалить(id1=>$r->{id}, id2=>$r->{id});
  return $r;
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
  "наименование" text, --- временный текст, номенклатуру укажет снабженец
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
  
  ) z on m.id=z.id2


where m."количество/принято" is not null

union all --- перемещения

select
  m.id, 'расход' as "движение",
  tzo.id, --- с объекта
  z."объект/id" as "объект2/id", -- на какой объект
  z."номенклатура/id",
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

@@ заявки/список или позиция
--- 
select {%= $select || '*' %} from (
select
  m.*,
  timestamp_to_json(m.ts::timestamp) as "$ts/json",
  "формат даты"(m."дата1") as "дата1 формат",
  timestamp_to_json(m."дата1"::timestamp) as "$дата1/json",
  o.id as "объект/id", o.name as "объект", row_to_json(o) as "$объект/json",
  n.id as "номенклатура/id", "номенклатура/родители узла/title"(n.id, true) as "номенклатура",
  t.*,
  row_to_json(p) as "профиль заказчика/json"

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
  
  left join (--- на одну заявку может несколько тмц
    select 
      array_agg(t.id order by t.id) as "тмц/id", ---t."дата/принято" as "тмц/дата/принято",
      sum(t."количество") as "тмц/количество",
      array_agg(row_to_json(t) order by t.id) as "$тмц/json",
      ---timestamp_to_json(t."дата/принято"::timestamp) as "$тмц/дата/принято/json",
      ---EXTRACT(epoch FROM now()-t."дата/принято")/3600 as "тмц/дата/принято/часов",
      array_agg(tz.id order by t.id) as "транспорт/заявки/id", ---row_to_json(tz) as "$транспорт/заявки/json",
      array_agg(tr.id order by t.id) as "транспорт/id", 
      array_agg(o1.id order by t.id) as "с объекта",
      array_agg(o2.id order by t.id) as "на объект",
      r.id1
    from 
      refs r
      join "тмц" t on t.id=r.id2
      join refs rt on t.id=rt.id1
      join "транспорт/заявки" tz on tz.id=rt.id2
      left join lateral (
        select o.*
        from refs r join "объекты" o on o.id=r.id1 and r.id=tz."с объекта"
      ) o1 on true
      left join lateral (
        select o.*
        from refs r join "объекты" o on o.id=r.id1 and r.id=tz."на объект"
      ) o2 on true
      left join (
        select tr.*, r.id2
        from refs r
          join "транспорт" tr on tr.id=r.id1
      ) tr on tz.id=tr.id2
      ---where r.id1=m.id
      group by r.id1
  ) t on t.id1=m.id

where (?::int is null or m.id = ?)-- позиция
  and (coalesce(?::int[], '{0}'::int[])='{0}'::int[] or t."транспорт/заявки/id" && ?::int[])  ---=any(\?::int[])) -- по идам транпортных заявок
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

@@ тмц/список или позиция
--- для снабжения
--- без  траспорт/заявки
--- одна позиция "тмц" - одна позиция "тмц/заявки"
select {%= $select || '*' %}
from (
select 
  m.*,
  --timestamp_to_json(m.ts::timestamp) as "$тмц/ts/json",
  --timestamp_to_json(t."дата/принято"::timestamp) as "$дата/принято/json",
  EXTRACT(epoch FROM now()-m."дата/принято")/3600 as "дата/принято/часов",
  z.id as "тмц/заявка/id", row_to_json(z) as "$тмц/заявка/json",
  z."объект/id", z."объект",
  z."номенклатура/id", z."номенклатура",
  z."профиль заказчика/id", z."профиль заказчика/names",
  p.id as "снабженец/id", p.names as "снабженец/names", row_to_json(p) as "профиль/снабженец/json"
  ---tz.id as "транспорт/заявки/id"

from 
  "тмц" m
  join "профили" p on m.uid=p.id
  
  join (--- связь с заявкой
    select
      m.*, 
      timestamp_to_json(m.ts) as "$тмц/заявка/ts/json",
      ---"формат даты"(m."дата1") as "дата1 формат",
      timestamp_to_json(m."дата1"::timestamp) as "$дата1/json",
      o.id as "объект/id", o.name as "объект", row_to_json(o) as "$объект/json",
      n.id as "номенклатура/id", "номенклатура/родители узла/title"(n.id, true) as "номенклатура",
      p.id as "профиль заказчика/id", p.names as "профиль заказчика/names", row_to_json(p) as "профиль заказчика/json",
      r.id2
    from 
      "тмц/заявки" m
      join "профили" p on m.uid=p.id
      join refs r on m.id=r.id1--- связь с тмц-строкой
      
      join refs rn on m.id=rn.id2
      join "номенклатура" n on rn.id1=n.id
      join refs ro on m.id=ro.id2
      join "объекты" o on ro.id1=o.id
      
    where coalesce(?::int, 0)=0 or o.id=? -- все объекты или один
  
  ) z on m.id=z.id2
  
  ---join refs rtz on m.id=rtz.id1
  ---join "транспорт/заявки" tz on tz.id=rtz.id2
  
  where 
    (coalesce(?::int, 0)=0 or m.id=?)
    ----and (coalesce(?::int, 0)=0 or tz.id=\?)
    /***and exists (
    select tz.id
    from refs r
      join "транспорт/заявки" tz on r.id2=tz.id
    where 
      coalesce(\?::int, 0)=0 or tz.id=\? -- все  или одна
      and r.id1=m.id
  )****/
) m
{%= $where || '' %}
{%= $order_by || '' %}
{%= $limit_offset || '' %}
;


@@ текущие остатки
--тмц
-- по доступным объектам

select {%= $select || '*' %} from (select
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
) o
;

@@ движение
-- тмц
select {%= $select || '*' %} from (select d.*, timestamp_to_json(d."дата/принято"::timestamp) as "$дата/принято/json",
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
) d
;
