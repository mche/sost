package Model::TMC;
use Mojo::Base 'Model::Base';
use Util;

#~ has sth_cached => 1;
#~ has [qw(app)];
has model_obj => sub {shift->app->models->{'Object'}};
has model_transport => sub {shift->app->models->{'Transport'}};
has model_nomen => sub {shift->app->models->{'Nomen'}};

sub init {
  #~ state $self = shift->SUPER::new(@_);
  my $self = shift;
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
  my $expr = ref $_[0] ? shift : {};
  
  my $prev = ref $_[0] && shift;
  $prev ||= $self->позиция_тмц($data->{id})
    if $data->{id};
  
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, "тмц", ["id"], {map {($_=>$data->{$_})} grep {defined $data->{$_}} (qw(id uid количество цена коммент количество/принято дата/принято принял списать), 'простая поставка')}, $expr);
  
  # связь с заявкой
  my $zid = $data->{'тмц/заявка/id'} || $data->{'$тмц/заявка'} && $data->{'$тмц/заявка'}{id};
  $self->связь_удалить(id1=>$zid, id2=>$r->{id})
    if $zid && $prev && $prev->{'тмц/заявка/id'} ne $zid;
  $self->связь($zid, $r->{id})
    if $zid;
  
  #~ return $self->позиция_тмц($r->{id});
  return $r;
}

sub сохранить_снаб {# обработка снабжения + перемещения сохраняются в транспортную заявку
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
    if ($data->{"с объекта/id"});
  
  $self->обновить($self->{template_vars}{schema}, "транспорт/заявки", ["id"], {id=>$r->{id}, "заказчики"=>$r->{"заказчики"}, "грузоотправители"=>$r->{"грузоотправители"}, "на объект"=>$r->{'на объект'}, "с объекта"=>$r->{'с объекта'},});
  
  map {
    $self->связь_удалить(id1=>$_, id2=>$r->{id})
      unless $ref{"$_:$r->{id}"};
  } @{$tz_prev->{'@заказчики/id'}};
  
  map {
    $self->связь_удалить(id1=>$_, id2=>$r->{id})
      unless $ref{"$_:$r->{id}"};
  } @{$tz_prev->{'@грузоотправители/id'}};
  
  map {
    $self->связь_удалить(id1=>$_, id2=>$r->{id})
      unless $ref{"$_:$r->{id}"};
  } grep {$_} ($tz_prev->{"с объекта/id"}, $tz_prev->{"на объект/id"},);
  #~ my $r = eval {$self->model_transport->сохранить_заявку(
    #~ (map {($_=>$data->{$_})} grep {defined $data->{$_}} ("id", "uid", "дата1", "заказчики/id", "грузоотправители/id", "контакты грузоотправителей", "контакты заказчиков", "откуда", "куда", "груз", "коммент", "снабженец")),
  #~ )};
  #~ return $@
    #~ unless ref $r;
  
  my @pos = grep {$_->{id}} @{$data->{'$позиции'} || $data->{'@позиции тмц'}}
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

  #~ $self->model_transport->позиция_заявки($r->{id}, {join_tmc=>1,});
  return $r;
}

sub удалить_снаб {
  my ($self, $data) = @_; 
  my $rc = $self->_удалить_строку('транспорт/заявки', $data->{id});
  $_->{id} && $self->_удалить_строку('тмц', $_->{id})
    for @{ $data->{'@позиции тмц'} || []};
  return $rc;
}

sub позиция_заявки {
  my ($self, $id) = @_; #
  
   my ($where1, @bind) = $self->SqlAb->where({#основное тело запроса
     " m.id "=>$id,
   });
  
  my $sth = $self->sth('заявки/список или позиция', where1=>$where1,);
  #~ $sth->trace(1);
  my $r = $self->dbh->selectrow_hashref($sth, undef, @bind);
  
}

sub позиция_тмц {
  my ($self, $id) = @_; #
  
  my ($where, @bind) = $self->SqlAb->where({
    " id "=> $id,
  });
  
  my $sth = $self->sth('тмц/список или позиция', where=>$where,);
  #~ $sth->trace(1);
  my $r = $self->dbh->selectrow_hashref($sth, undef, @bind);# (undef) x 2
  
}
#~ sub позиции_снаб {
  #~ my ($self, $id) = @_; # id - трансп заявка
  
  #~ my $r = $self->dbh->selectall_arrayref($self->sth('список или позиция'), {Slice=>{}}, (undef) x 2, (undef) x 2, ([$id]) x 2,);
  
#~ }

my %type = ("дата1"=>'date',"дата отгрузки"=>'date');
sub список_заявок {
  my ($self, $param, $cb) = @_;
  my $oid = (ref $param->{объект} ? $param->{объект}{id} : $param->{объект})
    // die "какой объект (или все=0)";
    #~ $self->app->log->error($self->app->dumper($param));
  my $where = $param->{where} || "";
  my ($where1, @bind) = $self->SqlAb->where({#основное тело запроса
    $oid ? (" o.id " => $oid) : (),
    $param->{'транспорт/заявки/id'} ? (' tmc."транспорт/заявки/id" '=>{'&& ?::int[]'=>\['', ref $param->{'транспорт/заявки/id'} ? $param->{'транспорт/заявки/id'} : [$param->{'транспорт/заявки/id'}]]}) : (),
  });
  #~ my @bind = (($oid) x 2, (undef) x 2, ( && (ref $param->{'транспорт/заявки/id'} ? $param->{'транспорт/заявки/id'} : [$param->{'транспорт/заявки/id'}])) x 2,);
  
  
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
  
  my $limit_offset = $param->{limit_offset} // "LIMIT " . ($param->{limit} || 100) . " OFFSET " . ($param->{offset} // 0);
  
  #~ my $sth = $self->sth('заявки/список или позиция', select=>$param->{select} || '*', where=>$where, limit_offset=>$limit_offset);
  my $sql = $self->dict->render('заявки/список или позиция', select=>$param->{select} || '*', where1=>$where1, where=>$where, limit_offset=>$limit_offset, order_by=>$param->{order_by} || $param->{'order by'} || '');
  #~ $sth->trace(1);
  push @bind, $param->{async}
    if $param->{async} && ref $param->{async} eq 'CODE';
  my $r = $self->dbh->selectall_arrayref($sql, {Slice=>{}}, @bind, $cb // ());
  
}

sub удалить_заявку {
  my ($self, $id) = @_;
  my $r = $self->_delete($self->{template_vars}{schema}, 'тмц/заявки', ["id"], {id=>$id});#
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
  my ($self, $param, $cb) = @_;
  my $oid = (ref($param->{объект}) ? $param->{объект}{id} : $param->{объект})
    // die "Нет объекта";

  $param->{where} = <<END_SQL;#' and jsonb_array_elements(jsonb_array_elements("куда"))::text=?::text'
where (coalesce(?::int, 0)=0 or ?::int=any("позиции тмц/объекты/id"|| "с объекта/id" || "на объект/id"))
@{[ $param->{where}  || '']}
END_SQL
  unshift @{ $param->{bind} ||=[] }, ($oid) x 2; #qq|"#$oid"|
    #~ if $oid;
  $param->{join_tmc} = 1;
  $self->model_transport->список_заявок($param, $cb);
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

#~ sub удалить_перемещение {
  #~ my ($self, $id) = @_;
  #~ my $r = $self->_delete($self->{template_vars}{schema}, 'транспорт/заявки', ["id"], {id=>$id});
  #~ $self->связи_удалить(id1=>$r->{id}, id2=>$r->{id});
  #~ return $r;
#~ }

1;

__DATA__
@@ таблицы
create table IF NOT EXISTS "тмц/заявки" (
/*** заявки на объектах 
связи:
id1("номенклатура")->id2("тмц/заявки")
id1("объекты")->id2("тмц/заявки") --- куда, на какой объект
id1("тмц/заявки")->id2("тмц") --- 
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
--- упрощенная схема поставки (без связи с поставщиком и транспорт/заявками)
--- расход с баз будет, прихода на объект - нет
id1("объекты")->id2("тмц") --- с объекта (вся или часть поставки) ЕСЛИ этой связи нет - это поставка ИЗВНЕ (поставщик)
id1("тмц")->id2("объекты") --- на какой объект (часть поставки)
***/
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи снабженец
  "количество" numeric not null, --- по отгрузке, повторяет или больше/меньше заявки
  "цена" money, -- 
  "коммент" text,
  
  "количество/принято" numeric, --- подтвержение о поступлении на объект или базу
  "дата/принято" timestamp without time zone, --- 
  "принял" int, --- профиль кто принял
  "списать" boolean --- флажок позволяет принять ТМЦ на получателе без подтверждения и сразу списать
  --- alter table "тмц" add column "списать" boolean;

);

/***
alter table "тмц" add column "количество/принято" numeric; --- подтвержение о поступлении на объект или базу 
alter table "тмц" add column   "дата/принято" timestamp without time zone; --- 
alter table "тмц" add column   "принял" int; --- профиль кто принял
alter table "тмц" add column   "наименование" text; --- временный текст, номенклатуру укажет снабженец
alter table "тмц" add column   "простая поставка" boolean; --- 

alter table "тмц" drop column   "наименование"; --- временный текст, номенклатуру укажет снабженец
alter table "тмц" drop column "дата1";
);
***/

@@ функции

-------------------------------------------------------------
DROP VIEW IF EXISTS "тмц/движение";
CREATE OR REPLACE VIEW "тмц/движение" AS
select --- приходы из внеш пост или внутр перемещений
  t.id,
  tzo."транспорт/заявки/id",
  'приход' as "движение",
      /***case when tzo."на объект" is not null then 'приход'
               when tzo."с объекта" is not null then 'расход'
               else 'приход' --- внешний приход
      end  as "движение",
      ***/
  
  coalesce(coalesce(tzo.id, z."объект/id"), ot.id) as "объект/id",--- объект получатель
      /***case when tzo."на объект" is not null then tzo.id
               when tzo."с объекта" is not null then tzo.id
               else z."объект/id" --- объект из заявки для внешнего прихода
      end as "объект/id",--- объект получатель
      ***/
  
  case when tzo.id is not null then coalesce(z."объект/id", ot.id)
           else null::int
  end as "объект2/id",--объект-источник
      /***case when tzo."на объект" is not null then z."объект/id" --- объект из заявки
               when tzo."с объекта" is not null then z."объект/id"
               else null::int --- внешний приход
      end as "объект2/id",--- объект -источник
      ***/
  
  coalesce(z."номенклатура/id", n.id) as "номенклатура/id",
  
  t."количество/принято",
  coalesce(t."принял", t.uid) as "принял/профиль/id",
  row_to_json(t) as "$тмц/json",
      /***(case when tzo."на объект" is not null then 1::numeric --- приход из перемещения
               when tzo."с объекта" is not null then -1::numeric --- расход из перемещения
               else 1::numeric --- внешний приход
      end) * t."количество/принято" as "количество/принято",
      ***/
  t."цена",
  t."дата/принято"

from 
  "тмц" t
  ---join "профили" p on t.uid=p.id

  left join (
    select o.* , tz.id as "транспорт/заявки/id",
    ---tz."на объект", tz."с объекта",
    r.id1
    from refs r
      join "транспорт/заявки" tz on r.id2=tz.id
      join refs ro on tz."на объект"=ro.id ----=any(array[, tz."с объекта"])
      join "roles" o on o.id=ro.id1
      ----left join refs ro2 on tz."с объекта"=ro2.id
  ) tzo on tzo.id1=t.id

  left join (--- номенклатура и объект если по заявке
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
          join "roles" o on r.id1=o.id
      ) o on o.id2=m.id

      join (
        select c.*, r.id2
        from refs r
          join "номенклатура" c on r.id1=c.id
      ) n on n.id2=m.id
  
  ) z on t.id=z.id2
  
  left join (---номенклатура если без заявки
      select n.*, r.id2
      from refs r
        join "номенклатура" n on n.id=r.id1
   ) n on n.id2=t.id
   
   left join (---объект если без заявки
    select o.*, r.id2
    from refs r
      join "roles" o on r.id1=o.id
   ) ot on ot.id2=t.id


where t."количество/принято" is not null

union all --- расходы из перемещений

select
  t.id,
  tzo."транспорт/заявки/id",
  'расход' as "движение",
  tzo.id, --- объект получатель (с объекта-расход)
  coalesce(z."объект/id", ot.id) as "объект2/id", -- объект источник
  coalesce(z."номенклатура/id", n.id) as "номенклатура/id",
  -t."количество/принято",
  coalesce(t."принял", t.uid) as "принял/профиль/id",
  row_to_json(t) as "$тмц/json",
  t."цена",
  t."дата/принято"
from
   "тмц" t
   join (
    select o.* , tz.id as "транспорт/заявки/id", r.id1
    from refs r
      join "транспорт/заявки" tz on r.id2=tz.id
      join refs ro on tz."с объекта"=ro.id
      join "roles" o on o.id=ro.id1
      left join refs ro2 on tz."на объект"=ro2.id
  ) tzo on tzo.id1=t.id
  
  left join (--- ---номенклатура и объект если по заявке
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
          join "roles" o on r.id1=o.id
      ) o on o.id2=m.id
      
      join (
        select c.*, r.id2
        from refs r
          join "номенклатура" c on r.id1=c.id
      ) n on n.id2=m.id
  
  ) z on t.id=z.id2
  
  left join (---номенклатура если без заявки
      select n.*, r.id2
      from refs r
        join "номенклатура" n on n.id=r.id1
   ) n on n.id2=t.id
   
   left join (---объект если без заявки
    select o.*, r.id2
    from refs r
      join "roles" o on r.id1=o.id
   ) ot on ot.id2=t.id

where t."количество/принято" is not null

union all --- расходы в списание

select
  t.id,
  tzo."транспорт/заявки/id",
  'расход' as "движение",
  ---tzo.id, --- объект получатель (с объекта-)
  coalesce(z."объект/id", ot.id) as "объект2/id", -- объект расход
  0, --метка списания второго объекта нет
  coalesce(z."номенклатура/id", n.id) as "номенклатура/id",
  -t."количество/принято",
  coalesce(t."принял", t.uid) as "принял/профиль/id",
  row_to_json(t) as "$тмц/json",
  t."цена",
  t."дата/принято"
from
   "тмц" t
   join (
    select tz.* , tz.id as "транспорт/заявки/id", r.id1
    from refs r
      join "транспорт/заявки" tz on r.id2=tz.id
      ---join refs ro on tz."с объекта"=ro.id
      ---join "roles" o on o.id=ro.id1
      ---left join refs ro2 on tz."на объект"=ro2.id
  ) tzo on tzo.id1=t.id
  
  left join (--- ---номенклатура и объект если по заявке
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
          join "roles" o on r.id1=o.id
      ) o on o.id2=m.id
      
      join (
        select c.*, r.id2
        from refs r
          join "номенклатура" c on r.id1=c.id
      ) n on n.id2=m.id
  
  ) z on t.id=z.id2
  
  left join (---номенклатура если без заявки
      select n.*, r.id2
      from refs r
        join "номенклатура" n on n.id=r.id1
   ) n on n.id2=t.id
   
   left join (---объект если без заявки
    select o.*, r.id2
    from refs r
      join "roles" o on r.id1=o.id
   ) ot on ot.id2=t.id

where t."количество/принято" is not null
  and coalesce(t."списать", false)

union all --- простая поставка расходы и приходы по базам

select
  t.id, 
  null, --- нет привязки к "транспорт/заявки",
  o2."движение",
  o2.id,  --- объект получатель
  o1.id, ---null, -- объект источник (всегда внеш постав)
  n.id, -- номенклатура
  (case when o2."движение"='расход' then -1::numeric else 1::numeric end) * t."количество",
  coalesce(t."принял", t.uid) as "принял/профиль/id",
  row_to_json(t) as "$тмц/json",
  t."цена",
  t.ts --- t."дата/принято"
from
  "тмц/заявки" z
  join refs rz on z.id=rz.id1
  join "тмц" t on t.id=rz.id2
  
  join (
    select c.*, r.id2
    from refs r
      join "номенклатура" c on r.id1=c.id
  ) n on n.id2=z.id
  
  join lateral (
    select o.*---, case when o.id=r.id1 then 'расход' when o.id=r.id2 then 'приход' else null end as "движение"
    from refs r
      join "roles" o on o.id=any(array[r.id1, r.id2])
    where z.id=any(array[r.id1, r.id2])
  ) o1 on true
  
  join lateral (
    select o.*, case when o.id=r.id1 then 'расход' when o.id=r.id2 then 'приход' else null end as "движение"
    from refs r
      join "roles" o on o.id=any(array[r.id1, r.id2])
    where t.id=any(array[r.id1, r.id2])
  ) o2 on true
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
  tmc.*,
  row_to_json(p) as "$профиль заказчика/json",
  tmc_easy.* --- простая обработка/поставки

from  "тмц/заявки" m
  join "профили" p on m.uid=p.id

  join (
    select o.*, r.id2
    from refs r
      join "объекты" o on r.id1=o.id
    ---where coalesce(\?::int, 0)=0 or o.id=\? -- все объекты или один
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
        from refs r join "roles" o on o.id=r.id1 and r.id=tz."с объекта" --- объекты
      ) o1 on true
      left join lateral (
        select o.*
        from refs r join "roles" o on o.id=r.id1 and r.id=tz."на объект" --- объекты
      ) o2 on true
      left join (
        select tr.*, r.id2
        from refs r
          join "транспорт" tr on tr.id=r.id1
      ) tr on tz.id=tr.id2
      ---where r.id1=m.id
      group by r.id1
  ) tmc on tmc.id1=m.id
  
  left join /*lateral*/ (--- простая обработка заявок - 1, 2 или три строки "тмц"
    select
      t.id1,
      array_agg(row_to_json(t)) as "@тмц/строки простой поставки/json",
      sum(t."количество") as "простая поставка/количество"
    from (
      select
        t.*,
        row_to_json(p) as "$снабженец/json",
        timestamp_to_json(t.ts) as "$ts/json",
        o.id as "объект/id", o.name as "объект", row_to_json(o) as "$объект/json",
        k.id as "контрагент/id", row_to_json(k) as "$контрагент/json",
        case when o.id = o.id1 then 'с базы' 
                 when o.id = o.id2 then 'на базу'
                 else 'поставщик' --- o.id is null
        end as "строки тмц",
        r.id1---, r.id2
      from 
        refs r
        join "тмц" t on t.id=r.id2
        
        left join "профили" p on t.uid=p.id
        
        left join lateral (
          select o.*, r.id1, r.id2
          from refs r
            join "roles" o on o.id=any(array[r.id1, r.id2])---проверь объекты
          where t.id=any(array[r.id1, r.id2])
        ) o on true
        
        left join (
          select k.*, r.id2
          from refs r
            join "контрагенты" k on k.id=r.id1
        ) k on k.id2=t.id
        
        where t."простая поставка" = true---(tmc."тмц/id" is null or t.id<>any(tmc."тмц/id"))
      ) t
    ---where t.id1=m.id
    group by t.id1
  ) tmc_easy on tmc_easy.id1=m.id

---where (\?::int is null or m.id = \?)-- позиция
  --- ' tmc."транспорт/заявки/id" '=>{'&& \?::int[]'=>\['', $arrayref]
  ---and (coalesce(\?::int[], '{0}'::int[])='{0}'::int[] or tmc."транспорт/заявки/id" && \?::int[])  ---=any(\?::int[])) -- по идам транпортных заявок
{%= $where1 || '' %}
) m
{%= $where || '' %}
{%= $order_by || ' order by "дата1", id ' %} --- сортировка в браузере
{%= $limit_offset || '' %}
;

@@ 00000тмц/заявки/простые поставки
select 
  ---row_to_json(z) as "$тмц/заявки/json",
  z.id---, z."дата1",
  array_agg(row_to_json(t)) as "@тмц/строки простой поставки/json",
  sum(t."количество") as "простая поставка/количество"

from "тмц/заявки" z
  join refs rt on z.id=rt.id1
  join "тмц" t on t.id=rt.id2
  
  left join lateral (
    select o.*, r.id1, r.id2
    from refs r
      join "объекты" o on o.id=any(array[r.id1, r.id2])
    where t.id=any(array[r.id1, r.id2])
  ) o on true
where t."простая поставка" = true --- индекс не пошел
{%= $where_append || '' %}
group by z.id---, z."дата1"
---order by z."дата1", z.id;
{%= $order_by || '' %} --- сортировка в браузере
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
  t.*,
  timestamp_to_json(t."ts") as "$тмц/ts/json",
  EXTRACT(epoch FROM now()-t."дата/принято")/3600 as "дата/принято/часов",
  z.id as "тмц/заявка/id", row_to_json(z) as "$тмц/заявка/json",
  case when z.id is null then true else false end as "без заявки",
  coalesce(z."объект/id", ot.id) as "объект/id",
  coalesce(z."объект", ot.name) as "объект",
  coalesce(z."$объект/json", ot."$объект/json") as "$объект/json",
  coalesce(z."номенклатура/id", n.id) as "номенклатура/id",
  coalesce(z."номенклатура", n."номенклатура") as "номенклатура",
  k.id as "контрагент/id", row_to_json(k) as "$контрагент/json",
  z."профиль заказчика/id", z."профиль заказчика/names",  z."$профиль заказчика/json",
  p.id as "снабженец/id", p.names as "снабженец/names", row_to_json(p) as "$профиль/снабженец/json",
  row_to_json(pp) as "$профиль/принял/json",
  tz."объект/id" as "через базу/id"

from 
  "тмц" t
  join "профили" p on t.uid=p.id
  
  left join (--- через базу
   select tz.*, o.id as "объект/id",  rt.id1
   from 
    refs rt
     join "транспорт/заявки" tz on tz.id=rt.id2
      ---join "тмц" t on t.id=
    join refs ro on ro.id=tz."на объект"
    join "roles" o on o.id=ro.id1
  
  ) tz on tz.id1=t.id
  
  left join (--- связь с заявкой
    select
      m.*, 
      timestamp_to_json(m.ts) as "$тмц/заявка/ts/json",
      ---"формат даты"(m."дата1") as "дата1 формат",
      timestamp_to_json(m."дата1"::timestamp) as "$дата1/json",
      o.id as "объект/id", o.name as "объект", row_to_json(o) as "$объект/json",
      n.id as "номенклатура/id", "номенклатура/родители узла/title"(n.id, true) as "номенклатура",
      p.id as "профиль заказчика/id", p.names as "профиль заказчика/names", row_to_json(p) as "$профиль заказчика/json",
      r.id2
    from 
      refs r
      join "тмц/заявки" m on m.id=r.id1--- связь с тмц-строкой
      join "профили" p on m.uid=p.id
      
      join refs rn on m.id=rn.id2
      join "номенклатура" n on rn.id1=n.id
      join refs ro on m.id=ro.id2
      join "объекты" o on ro.id1=o.id
      
    ---where coalesce(\?::int, 0)=0 or o.id=\? -- все объекты или один
  
  ) z on t.id=z.id2
  
  left join (---номенклатура если без заявки
    select n.*, 
    "номенклатура/родители узла/title"(n.id, true) as "номенклатура",
    r.id2
    from refs r
      join "номенклатура" n on n.id=r.id1
 ) n on n.id2=t.id
 
 left join (---объект если без заявки
  select o.*,
    row_to_json(o) as "$объект/json",
    r.id2
  from refs r
    join "объекты" o on r.id1=o.id
 ) ot on ot.id2=t.id
 
 left join (--- если простая поставка: поставщик
  select k.*, r.id2
  from refs r
    join "контрагенты" k on k.id=r.id1
 ) k on k.id2=t.id
 
 left join "профили" pp on t."принял"=pp.id
  
  ----where 
   ---- (coalesce\(?::int, 0)=0 or t.id=\?)
    ----and (coalesce(\?::int, 0)=0 or tz.id=\?)
) t
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
select {%= $select || '*' %} from (
select d.*, timestamp_to_json(d."дата/принято"::timestamp) as "$дата/принято/json",
  tz.id as "транспорт/заявки/id",
  tz."с объекта/id", tz."на объект/id",
  tz."@грузоотправители/id",---,  tz."@грузоотправители/json"
  row_to_json(z) as "$тмц/заявка/json",
  row_to_json(k) as "$проще/строка поставщика/json",
  row_to_json(p) as "$принял/профиль/json"
from
  "тмц/движение" d
  join "доступные объекты"(?, ?) o on d."объект/id"=o.id
  
  left join "профили" p on p.id=d."принял/профиль/id" ---кто принял
  
  left join (
    select tz.id,
      ro1.id1 as "с объекта/id", ro2.id1 as "на объект/id",
      k_go."@грузоотправители/id",
      ----k_go."@грузоотправители/json",
      r.id1
    from refs r
      join "транспорт/заявки" tz on r.id2=tz.id
      --- грузоотправителя
      
      left join lateral (-- все грузоотправители иды (перевести связи в ид контрагента)
        select array_agg(r.id1 order by un.idx) as "@грузоотправители/id"---,  array_agg(row_to_json(k) order by un.idx) as "@грузоотправители/json"
        from unnest(tz."грузоотправители") WITH ORDINALITY as un(id, idx)
          join refs r on un.id=r.id
      ) k_go on true ---k_go.id2=tz.id
      
      left join refs ro1 on ro1.id=tz."с объекта"
      left join refs ro2 on ro2.id=tz."на объект"
      
  ) tz on tz.id1=d.id
  
  left join (---заявка
    select z.*, r.id2
    from refs r
      join "тмц/заявки" z on z.id=r.id1
  ) z on z.id2=d.id --- ид тмц
  
  left join (--- простая поставка: поставщик (через другую строку тмц)
    select tt.*, row_to_json(k) as "$контрагент/json", r.id2
    from refs r
      join "тмц/заявки" z on z.id=r.id1
      join refs rr on z.id=rr.id1
      join "тмц" tt on tt.id=rr.id2
      join refs rk on tt.id=rk.id2
      join "контрагенты" k on k.id=rk.id1
      ---left join "профили" p on p.id=coalesce(tt."принял", t.uid) --- списал с базы и принял - одно лицо снабженец
  ) k on k.id2=d.id --- ид тмц

  
where (coalesce(?::int, 0)=0 or d."объект/id"=?)
  and (coalesce(?::int, 0)=0 or d."номенклатура/id"=?)
order by d."дата/принято" desc, d."объект2/id" ---- при списании одинаковые строки
) d
;
