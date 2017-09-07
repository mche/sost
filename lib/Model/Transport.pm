package Model::Transport;
use Mojo::Base 'Model::Base';

#~ has sth_cached => 1;
has [qw(app)];
#~ has model_obj => sub {shift->app->models->{'Object'}};

sub new {
  state $self = shift->SUPER::new(@_);
  #~ $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  $self->dbh->do($self->sth('таблицы'));
  #~ $self->dbh->do($self->sth('функции'));
  return $self;
}

sub список_транспорта {
  my ($self, $category, $contragent) = @_;
  $self->dbh->selectall_arrayref($self->sth('список или позиция транспорта'), {Slice=>{}}, (undef) x 2, ($category) x 2, ($contragent) x 2);
  
}

sub список_заявок {
  my ($self, $param) = @_;
  my $where = "";
  my @bind = ((undef) x 2);
  
  my $limit_offset = "LIMIT 100 OFFSET ".($param->{offset} // 0);
  
  $self->dbh->selectall_arrayref($self->sth('список или позиция заявок', where => $where, order_by=>'order by "дата1" desc, ts desc', limit_offset => $limit_offset), {Slice=>{}}, @bind);
}

sub сохранить_транспорт {
  my ($self, $data) = @_;
  my $prev = $self->позиция_транспорта($data->{id})
    if $data->{id};
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, "транспорт", ["id"], $data);
  $prev ||= $self->позиция_транспорта($r->{id});
  
  map {# прямые связи
    if ($data->{$_}) {
      my $rr= $self->связь_получить($prev->{"$_/id"}, $r->{id});
      $r->{"связь/$_"} = $rr && $rr->{id}
        ? $self->связь_обновить($rr->{id}, $data->{$_}, $r->{id})
        : $self->связь($data->{$_}, $r->{id});
    } 
    #~ else {# можно чикать/нет
      #~ $self->связь_удалить(id1=>$prev->{"$_/id"}, id2=>$r->{id});
    #~ }
  } qw(категория);
  
  return $r;#$self->позиция_транспорта($r->{id});
}

sub позиция_транспорта {
  my ($self, $id) = @_;
  $self->dbh->selectrow_hashref($self->sth('список или позиция транспорта'), undef, ($id) x 2, (undef) x 4);
}

sub сохранить_заявку {
  my $self = shift;
  my $data = ref $_[0] ? shift : {@_};
  my $prev = $self->позиция_заявки($data->{id})
    if $data->{id};
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, "транспорт/заявки", ["id"], $data);
  $prev ||= $self->позиция_заявки($r->{id});
  
  # обработать связи
  map {# прямые связи
    if ($data->{$_}) {
      my $rr= $self->связь_получить($prev->{"$_/id"}, $r->{id});
      $r->{"связь/$_"} = $rr && $rr->{id}
        ? $self->связь_обновить($rr->{id}, $data->{$_}, $r->{id})
        : $self->связь($data->{$_}, $r->{id});
    } else {# можно чикать/нет
      $self->связь_удалить(id1=>$prev->{"$_/id"}, id2=>$r->{id});
    }
  } qw(перевозчик проект объект транспорт водитель категория);
  map {# обратная связь
    if ($data->{$_}) {
      my $rr= $self->связь_получить($r->{id}, $prev->{"$_/id"});
      $r->{"обратная связь/$_"} = $rr && $rr->{id}
        ? $self->связь_обновить($rr->{id}, $r->{id}, $data->{$_},)
        : $self->связь($r->{id}, $data->{$_}, );
    } else {
      $self->связь_удалить(id1=>$r->{id}, id2=>$prev->{"$_/id"}, );
    }
  } qw(заказчик);
  
  return $self->позиция_заявки($r->{id});
}

sub позиция_заявки {
  my ($self, $id) = @_; # $wallet2 - флажок внутреннего перемещения
  $self->dbh->selectrow_hashref($self->sth('список или позиция заявок'), undef, ($id) x 2,);
}

sub заявки_куда {
  my ($self, $id) = @_; #ид заказчик или проект
  $self->dbh->selectall_arrayref($self->sth('заявки/куда адрес'), {Slice=>{}}, $id,);
  
}

sub водители {
  my ($self,) = @_; #
  $self->dbh->selectall_arrayref($self->sth('водители'), {Slice=>{}},);
}

sub заявки_интервал {
  my ($self, $param) = @_; #
  my @bind = ((undef) x 2, $param->{'дата1'}, $param->{'дата2'},);
  $self->dbh->selectall_arrayref($self->sth('список или позиция заявок', where => qq! where "транспорт/id" is not null and "дата1" between coalesce(?::date, (now()-interval '9 days')::date) and coalesce(?::date, now()::date) !, ), {Slice=>{}}, @bind);
  
  
}

1;


__DATA__
@@ таблицы
create table IF NOT EXISTS "{%= $schema %}"."транспорт" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int not null,
  "title" varchar not null,
  "descr" text null
/* связи:
id1("категории")->id2("транспорт")
не тут id1("контрагенты")->id2("транспорт") --- если внешний транспорт (наш транспорт без этой связи)
id1("транспорт")->id2("транспорт/заявки")
*/
);

create table IF NOT EXISTS "{%= $schema %}"."транспорт/заявки" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int not null,
  "дата1" date not null, -- начало
  "дата2" date null, --  завершение
---  "дата3" timestamp without time zone, --- когда фактически отработана/закрыта заявка
  "откуда" text,
  "куда" text, --- null если связь с нашим объектом
  "груз" text, 
  "стоимость" money,
  "тип стоимости" int, --- 0 - вся сумма, 1- за час, 2 - за км
  "факт" numeric, --- часов или км
  --- сумма="стоимость"*(coalesce("факт",1)^"тип стоимости"::boolean::int)
  "коммент" text
/* связи:
id1("объекты")->id2("транспорт/заявки") --- куда если на наш объект (внутренний получатель)
id1("проекты")->id2("транспорт/заявки") --- если наш получатель и не объект
id1("контрагенты")->id2("транспорт/заявки") --- перевозчик (внешний транспорт)
id1("транспорт/заявки")->id2("контрагенты") --- если внешний получатель/заказчик

id1("транспорт")->id2("транспорт/заявки") --- конкретно транспорт
id1("профили")->id2("транспорт/заявки") --- водитель если своя машина
id1("категории")->id2("транспорт/заявки") --- если еще не указан транспорт (после установки транспорта категория тут разрывается - сам транспорт связан с категорией)
*/
);

create index IF NOT EXISTS "idx/транспорт/заявки/дата" on "транспорт/заявки" ("дата1");

CREATE OR REPLACE VIEW "водители" AS
select p.*, d.name as "должность", d.id as "должность/id"
from "должности" d
  join refs r on d.id=r.id1
  join "профили" p on p.id=r.id2
where d.name = any(array['Водитель', 'Водитель КДМ', 'Машинист автокрана', 'Машинист экскаватора', 'Машинист катка', 'Машинист экскаватора-погрузчика'])
;

@@ список или позиция транспорта
select t.*, (case when con.id is null then '★' else '' end) || t.title as title2, cat.id as "категория/id", cat.parents_name || cat.name::varchar as "категории", cat.parents_id as "категории/id",
  con.id as "перевозчик/id", con.title as "перевозчик",
  p.id as "водитель/id", p.names as "водитель"
from "транспорт" t
  join refs r on t.id=r.id2
  join "роли/родители"() cat on cat.id=r.id1
  
  left join (-- перевозчика транспорт или наш
    select z.t_id, con.*
    from (
      select r.id1 as t_id, max(z.id) as z_id
      from refs r
        join "транспорт/заявки" z on z.id=r.id2 ---только отработанные заявки?
      group by r.id1
    ) z 
    join refs r on z.z_id=r.id2
    join "контрагенты" con on con.id=r.id1
  
  ) con on t.id=con.t_id
  
  left join lateral ( -- водитель по последней заявке 
    select p.*
    from refs r -- на транспорт
      join "транспорт/заявки" z on z.id=r.id2
      join refs rr on z.id=rr.id2
      join "профили" p on p.id=rr.id1
    where r.id1= t.id
    order by z."дата1" desc
    limit 1
  ) p on true
where 
----cat.parents_id[1]=3
  (coalesce(?::int, 0)=0 or t.id=?)
  and (coalesce(?::int, 0)=0 or ?::int=any(cat.parents_id || cat.id))
  and (coalesce(?::int, 0)=0 or con.id=?)

;

@@ список или позиция заявок
select * from (
select tz.*,
  "формат даты"(tz."дата1") as "дата1 формат",
  "формат даты"(tz."дата2") as "дата2 формат",
  tz."стоимость"*(coalesce(tz."факт",1::numeric)^coalesce(tz."тип стоимости"::boolean::int, 1::int)) as "сумма",

  con1.id as "перевозчик/id", con1.title as "перевозчик",
  con2.id as "заказчик/id", con2.title as "заказчик",
  coalesce(ob."проект/id", pr.id) as "проект/id", coalesce(ob."проект", pr.title) as "проект", 
  ob.id as "объект/id", ob.name as "объект",
  tr.id as "транспорт/id", (case when con1.id is null then '★' else '' end) || tr.title as "транспорт",
  coalesce(tr."категория/id", cat.id) as "категория/id", coalesce(tr."категории", cat."категории") as "категории", coalesce(tr."категории/id", cat."категории/id") as "категории/id",
  v.id as "водитель/id", v.names as "водитель"
  
from "транспорт/заявки" tz
  left join (-- перевозчик
    select con.*, r.id2 as tz_id
    from refs r
      join "контрагенты" con on con.id=r.id1
  ) con1 on tz.id=con1.tz_id
  
  left join (-- заказчик
    select con.*, r.id1 as tz_id
    from refs r
      join "контрагенты" con on con.id=r.id2
  ) con2 on tz.id=con2.tz_id
  
  left join (-- проект или через объект
    select pr.*,  r.id2 as tz_id
    from refs r
      join "проекты" pr on pr.id=r.id1
  ) pr on tz.id=pr.tz_id
  
  left join (
    select ob.*, r.id2 as tz_id
    from refs r
      join "проекты+объекты" ob on ob.id=r.id1
  ) ob on tz.id=ob.tz_id
  
  left join (-- категория без транспорта
    select cat.*, cat.parents_name || cat.name::varchar as "категории", cat.parents_id as "категории/id", r.id2 as tz_id
    from refs r
      join "роли/родители"() cat on cat.id=r.id1
      where cat.parents_id[1] = 36668
  
  ) cat on tz.id=cat.tz_id
  
  left join (--- транспорт с категорией
    select tr.*, cat.id as "категория/id", cat.parents_name || cat.name::varchar as "категории", cat.parents_id as "категории/id", r.id2 as tz_id
    from refs r
      join "транспорт" tr on tr.id=r.id1
      join refs r2 on tr.id=r2.id2
      join "роли/родители"() cat on cat.id=r2.id1
    where cat.parents_id[1] = 36668
  ) tr on tz.id=tr.tz_id
  
  left join (-- водитель на заявке
  select p.*, r.id2 as tz_id
    from refs r
      join "профили" p on p.id=r.id1
  ) v on tz.id=v.tz_id

where coalesce(?::int, 0)=0 or tz.id=?
) t
{%= $where || '' %}
{%= $order_by || '' %} --- менять порядок для разных табов-списков
{%= $limit_offset || '' %}
;

@@ заявки/куда адрес
select tz."куда" as name, count(tz.*) as cnt
from "транспорт/заявки" tz
  
  left join (-- заказчик
    select con.*, r.id1 as tz_id
    from refs r
      join "контрагенты" con on con.id=r.id2
  ) con2 on tz.id=con2.tz_id
  
  left join (-- проект или через объект
    select pr.*,  r.id2 as tz_id
    from refs r
      join "проекты" pr on pr.id=r.id1
  ) pr on tz.id=pr.tz_id
  
  left join (
    select ob.*, r.id2 as tz_id
    from refs r
      join "проекты+объекты" ob on ob.id=r.id1
  ) ob on tz.id=ob.tz_id
where tz."куда" is not null
  and coalesce(con2.id, coalesce(pr.id, ob."проект/id"))=?
group by tz."куда"
;

@@ водители
select *
from "водители"
order by names
;