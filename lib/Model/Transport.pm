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

sub свободный_транспорт {
  my ($self,) = @_;
  $self->dbh->selectall_arrayref($self->sth('свободный транспорт'), {Slice=>{}},);
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
  } qw(категория перевозчик);
  
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
  } qw(перевозчик объект транспорт водитель-профиль категория);
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

sub заявки_адреса {
  my ($self, $id) = @_; #ид заказчик или проект
  $self->dbh->selectall_arrayref($self->sth('заявки/адреса'), {Slice=>{}}, ($id) x 4,);
  
}

sub водители {
  my ($self,) = @_; #
  $self->dbh->selectall_arrayref($self->sth('водители'), {Slice=>{}},);
}

sub заявки_водители {
  my ($self, $id) = @_; #ид перевозчика
  $self->dbh->selectall_arrayref($self->sth('заявки/водители'), {Slice=>{}}, $id,);
  
}

sub заявки_контакт1 {
  my ($self, $id) = @_; #ид перевозчика
  $self->dbh->selectall_arrayref($self->sth('заявки/контакт1'), {Slice=>{}}, $id,);
}

sub заявки_контакт2 {
  my ($self, $id) = @_; #ид заказчика
  $self->dbh->selectall_arrayref($self->sth('заявки/контакт2'), {Slice=>{}}, $id,);
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
id1("контрагенты")->id2("транспорт") --- перевозчик
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
  "откуда" text[],
  "куда" text[], --- null если связь с нашим объектом
  "груз" text, 
  "водитель" text[], -- если не наш водитель/машина
  "стоимость" money,
  "тип стоимости" int, --- 0 - вся сумма, 1- за час, 2 - за км
  "факт" numeric, --- часов или км
  --- сумма="стоимость"*(coalesce("факт",1)^"тип стоимости"::boolean::int)
  "дата получения док" date, --- фактическая дата 
  "дата оплаты по договору" date, --- планикуемая для контроля оплат
  "дата оплаты" date, --- фактический приход денег по заявке
  "док оплаты" text, -- номер: счет/фактура
  "коммент" text
/* связи:
id1("объекты")->id2("транспорт/заявки") --- куда если на наш объект (внутренний получатель)
--- убрал ---id1("проекты")->id2("транспорт/заявки") --- если наш получатель и не объект
id1("контрагенты")->id2("транспорт/заявки") --- перевозчик (внешний транспорт)
id1("транспорт/заявки")->id2("контрагенты") ---  получатель/заказчик

id1("транспорт")->id2("транспорт/заявки") --- конкретно транспорт
id1("профили")->id2("транспорт/заявки") --- водитель если своя машина
id1("категории")->id2("транспорт/заявки") --- если еще не указан транспорт (после установки транспорта категория тут разрывается - сам транспорт связан с категорией)
*/
);

create index IF NOT EXISTS "idx/транспорт/заявки/дата" on "транспорт/заявки" ("дата1");

/*
update "транспорт/заявки" z
set "куда"=u.upd
from (
  select z.id, '{"'||coalesce('#'||o.id::text, "куда")||'"}' as upd
  from "транспорт/заявки" z
    left join (
      select o.*, r.id2
      from "объекты" o
        join refs r on  o.id=r.id1
    ) o on z.id=o.id2
) u
where z.id=u.id;

alter table "транспорт/заявки" alter column "куда" type text[] USING "куда"::text[];

update "транспорт/заявки" z
set "откуда"=u.upd
from (
  select z.id, '{"'||"откуда"||'"}' as upd
  from "транспорт/заявки" z
) u
where z.id=u.id;

alter table "транспорт/заявки" alter column "откуда" type text[] USING "откуда"::text[];

update "транспорт/заявки" z
set "водитель"=u.upd
from (
  select z.id, '{"'||"водитель"||'"}' as upd
  from "транспорт/заявки" z
) u
where z.id=u.id;

alter table "транспорт/заявки" alter column "водитель" type text[] USING "водитель"::text[];

alter table "транспорт/заявки" add column "контакт1" text[]; --- контактное лицо и телефон перевозчика
alter table "транспорт/заявки" add column "контакт2" text[]; --- контактное лицо и телефон заказчика

alter table "транспорт/заявки" add column "дата получения док" date; --- фактическая дата 
alter table "транспорт/заявки" add column "дата оплаты по договору" date; --- планикуемая для контроля оплат
*/



CREATE OR REPLACE VIEW "водители" AS
select p.*, d.name as "должность", d.id as "должность/id"
from "должности" d
  join refs r on d.id=r.id1
  join "профили" p on p.id=r.id2
where d.name = any(array['Водитель', 'Водитель КДМ', 'Машинист автокрана', 'Машинист экскаватора', 'Машинист катка', 'Машинист экскаватора-погрузчика'])
;
--------------

@@ 123
/*
CREATE OR REPLACE FUNCTION "транспорт/заявки/куда-адр-об"(text)
RETURNS table("id" int, "адрес" text, "проект/id" int, "проект" text, "объект/id" int, "объект" text) AS $func$ 
--- select "транспорт/заявки/куда-адр-об"('{"dsfds\ dsgfdg", "объект#3406"}');
/*преобразовать текст полей КУДА адресов-объектов в массив и прицепить объекты(если строки вида объект#3406)*/
select a.*,  po.*
from (
select case when un ~ '^объект#' then regexp_replace(un, '^объект#', '')::int else null end as id, un as "адрес"
  from (select unnest($1::text[]) as un) un
) a
left join "проекты/объекты" po on po."объект/id"=a.id
;
$func$ LANGUAGE SQL; --- IMMUTABLE STRICT;
*/

@@ список или позиция транспорта
select t.*, ----(case when con.id is null then '★' else '' end) || t.title as title2,
  cat.id as "категория/id", cat.parents_name || cat.name::varchar as "категории", cat.parents_id as "категории/id",
  k.*,
  v.id as "водитель/id", v.names as "водитель-профиль",  v."водитель"
from "транспорт" t
  join refs r on t.id=r.id2
  join "роли/родители"() cat on cat.id=r.id1
  
  /*join (-- перевозчика транспорт или наш
    select z.t_id, con.*
    from (
      select r.id1 as t_id, max(z.id) as z_id
      from refs r
        join "транспорт/заявки" z on z.id=r.id2 ---только отработанные заявки
      group by r.id1
    ) z 
    join refs r on z.z_id=r.id2
    join "контрагенты" con on con.id=r.id1
  
  ) con on t.id=con.t_id*/
  
  /*********join refs rk on t.id=rk.id2
  join "контрагенты" con on con.id=rk.id1 -- перевозчик
  
  LEFT JOIN (-- проект перевозчика
    SELECT p.*,  r.id2 AS k_id
     FROM refs r
       JOIN "проекты" p ON p.id = r.id1
  ) p ON con.id = p.k_id
  **********/
  
  left join lateral (-- перевозчик
    select array_agg(k.id) as  "перевозчик/id", array_agg(k.title) as "перевозчик", array_agg(p.id) as "проект/id", array_agg(p.title) as "проект"
    from 
      refs rk
      join "контрагенты" k on k.id=rk.id1 
      left join (-- может проект
        select p.*,  r.id2
        from refs r
          join "проекты" p on p.id=r.id1
      ) p on k.id=p.id2
    where rk.id2=t.id
  ) k on true

  
  left join lateral ( -- водитель по последней заявке 
    select p.id, p.names, z."водитель"
    from refs r -- на транспорт
      join "транспорт/заявки" z on z.id=r.id2
      left join (
        select p.*, r.id2
        from  refs r
          join "профили" p on p.id=r.id1
      ) p on p.id2 = z.id
    where r.id1= t.id
      and (p.names is not null or z."водитель" is not null)
    order by z."дата1" desc
    limit 1
  ) v on true
where 
----cat.parents_id[1]=3
  (coalesce(?::int, 0)=0 or t.id=?)
  and (coalesce(?::int, 0)=0 or ?::int=any(cat.parents_id || cat.id))
  and (coalesce(?::int, 0)=0 or ?=any(k."перевозчик/id"))

;

@@ список или позиция заявок
select * from (
select tz.*,
  "формат даты"(tz."дата1") as "дата1 формат",
  "формат даты"(tz."дата2") as "дата2 формат",
  tz."стоимость"*(coalesce(tz."факт",1::numeric)^coalesce(tz."тип стоимости"::boolean::int, 1::int)) as "сумма",

  con1.id as "перевозчик/id", con1.title as "перевозчик",
  con1."проект/id" as "перевозчик/проект/id", con1."проект" as "перевозчик/проект",
  con2.id as "заказчик/id", con2.title as "заказчик",
  con2."проект/id" as "заказчик/проект/id", con2."проект" as "заказчик/проект",
  ----coalesce(ob."проект/id", pr.id) as "проект/id", coalesce(ob."проект", pr.title) as "проект",
  ---tr."проект/id" as "перевозчик/проект/id", tr."проект" as "перевозчик/проект",
  
  ---ob.id as "объект/id", ob.name as "объект",
  tr.id as "транспорт/id", tr.title as "транспорт",---(case when tr.id is null then '★' else '' end) || 
  coalesce(tr."категория/id", cat.id) as "категория/id", coalesce(tr."категории", cat."категории") as "категории", coalesce(tr."категории/id", cat."категории/id") as "категории/id",
  v.id as "водитель-профиль/id", v.names as "водитель-профиль", tz."водитель"
  
from "транспорт/заявки" tz
  left join (-- перевозчик (!не в транспорте!)
    select con.*,
      p.id as "проект/id", p.title as "проект",
      r.id2 as tz_id
    from refs r
      join "контрагенты" con on con.id=r.id1
      left join (-- проект 
        select p.*,  r.id2
        from refs r
          join "проекты" p on p.id=r.id1
      ) p on con.id=p.id2
  ) con1 on tz.id=con1.tz_id
  
  left join (-- заказчик
    select con.*,
      p.id as "проект/id", p.title as "проект",
      r.id1 as tz_id
    from refs r
      join "контрагенты" con on con.id=r.id2
      left join (-- проект 
        select p.*,  r.id2
        from refs r
          join "проекты" p on p.id=r.id1
      ) p on con.id=p.id2
  ) con2 on tz.id=con2.tz_id
  
  /*left join (-- проект или через объект
    select pr.*,  r.id2 as tz_id
    from refs r
      join "проекты" pr on pr.id=r.id1
  ) pr on tz.id=pr.tz_id
  */
  
  /*left join (
    select ob.*, r.id2 as tz_id
    from refs r
      join "объекты" ob on ob.id=r.id1
  ) ob on tz.id=ob.tz_id*/
  
  left join (-- категория без транспорта
    select cat.*, cat.parents_name || cat.name::varchar as "категории", cat.parents_id as "категории/id", r.id2 as tz_id
    from refs r
      join "роли/родители"() cat on cat.id=r.id1
      where cat.parents_id[1] = 36668
  
  ) cat on tz.id=cat.tz_id
  
  left join (--- транспорт с категорией и !не перевозчиком!
    select tr.*,
      cat.id as "категория/id", cat.parents_name || cat.name::varchar as "категории", cat.parents_id as "категории/id", r.id2 as tz_id
      ---con.id as "перевозчик/id", con.title as "перевозчик",
      ---p.id as "проект/id", p.title as "проект"
    from refs r
      join "транспорт" tr on tr.id=r.id1
      join refs r2 on tr.id=r2.id2
      join "роли/родители"() cat on cat.id=r2.id1
      /*********join refs rk on tr.id=rk.id2
      join "контрагенты" con on con.id=rk.id1
      left join (-- проект 
        select p.*,  r.id2
        from refs r
          join "проекты" p on p.id=r.id1
      ) p on con.id=p.id2
      **********/
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

@@ заявки/адреса

select "адрес" as name, count(*) as cnt
from (
select *
from (
  select k.id as "контрагент/id", unnest(tz."куда") as "адрес"---, 
  from "транспорт/заявки" tz
    join refs r on tz.id=r.id1
    join "контрагенты" k on k.id=r.id2 -- заказчик
  where tz."куда" is not null
    and (?::int is null or k.id=?)
) tz
where not "адрес" ~ '^#\d+'

union

select *
from (
  select k.id as "контрагент/id", unnest(tz."откуда") as "адрес"---, 
  from "транспорт/заявки" tz
    join refs r on tz.id=r.id1
    join "контрагенты" k on k.id=r.id2 -- заказчик
  where tz."откуда" is not null
    and (?::int is null or k.id=?)
) tz
where not "адрес" ~ '^#\d+'
) u
group by "адрес"
;

@@ водители
select *
from "водители"
order by names
;

@@ заявки/водители
select distinct tz."водитель"[1] as title,  tz."водитель"[2] as phone
from "транспорт" t
  join refs rk on t.id=rk.id2
  join "контрагенты" k on k.id=rk.id1 -- перевозчик
  
  join refs rz on t.id=rz.id1
  join "транспорт/заявки" tz on tz.id=rz.id2

where tz."водитель" is not null
  and tz."водитель"[1] is not null
  and coalesce(k.id, 0)=?
;

@@ заявки/контакт1
select distinct tz."контакт1"[1] as title,  tz."контакт1"[2] as phone
from "транспорт" t
  join refs rk on t.id=rk.id2
  join "контрагенты" k on k.id=rk.id1 -- перевозчик
  
  join refs rz on t.id=rz.id1
  join "транспорт/заявки" tz on tz.id=rz.id2

where tz."контакт1" is not null
  and tz."контакт1"[1] is not null
  and coalesce(k.id, 0)=?
;

@@ заявки/контакт2
select distinct tz."контакт2"[1] as title,  tz."контакт2"[2] as phone
from "контрагенты" k 
  
  join refs r on k.id=r.id2 -- заказчик
  join "транспорт/заявки" tz on tz.id=r.id1

where tz."контакт2" is not null
  and tz."контакт2"[1] is not null
  and coalesce(k.id, 0)=?
;

@@ свободный транспорт
select t.*,
  cat.id as "категория/id", cat.parents_name || cat.name::varchar as "категории", cat.parents_id as "категории/id",
  k.*
from "транспорт" t

  join refs rc on t.id=rc.id2
  join "роли/родители"() cat on cat.id=rc.id1

  join lateral ( -- перевозчик c нашим проектом
    select array_agg(k.id) as  "перевозчик/id", array_agg(k.title) as "перевозчик", array_agg(p.id) as "проект/id", array_agg(p.title) as "проект"
    from 
      refs rk
      join "контрагенты" k on k.id=rk.id1
      join (-- только наши проекты 
        select p.*,  r.id2
        from refs r
          join "проекты" p on p.id=r.id1
      ) p on k.id=p.id2
    where rk.id2=t.id
  ) k on k."перевозчик/id" is not null --- ??? странно
  
  left join (-- незавершенные заявки
    select distinct t.id
    from "транспорт" t
      join refs r on t.id=r.id1
      join "транспорт/заявки" z on z.id=r.id2
    where z."дата2" is null
  ) nz on t.id=nz.id
where nz.id is null -- нет незавершенных заявок
;