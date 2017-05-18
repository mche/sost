package Model::Waltex::Report;
use Mojo::Base 'Model::Base';
#~ use Mojo::Util qw(dumper);

#~ has sth_cached => 1;
my $main_table ="движение денег";
has "temp_view_name";# => "движение денег-снимок".rand();

sub new {
  state $self = shift->SUPER::new(@_);
  $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  $self->dbh->do($self->sth('временная схема'));
  #~ $self->dbh->do($self->sth('функции'));
  return $self;
}

sub снимок_диапазона {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  $self->dbh->do($self->sth('снимок диапазона', temp_view_name=>$self->temp_view_name), undef, (@{$param->{'интервал'}}, @{$param->{'даты'}}, ($param->{'проект'}) x 2,  ($param->{'кошелек'}) x 2, ($param->{'контрагент'}) x 2,) x 2 );
}

sub движение_интервалы {
  my $self = shift;
  #~ my $param = ref $_[0] ? shift : {@_};
  $self->dbh->selectall_arrayref($self->sth('движение/интервалы', temp_view_name=>$self->temp_view_name), {Slice=>{}}, );# $param->{'проект'}, @{$param->{'даты'}},
}

sub движение_интервалы2 {
  my $self = shift;
  #~ my $param = ref $_[0] ? shift : {@_};
  $self->dbh->selectall_arrayref($self->sth('движение/интервалы/2', temp_view_name=>$self->temp_view_name), {Slice=>{}}, );# $param->{'проект'}, @{$param->{'даты'}},
}

sub движение_итого_интервалы {
  my $self = shift;
  #~ my $param = ref $_[0] ? shift : {@_};
  $self->dbh->selectall_arrayref($self->sth('движение итого/интервалы', temp_view_name=>$self->temp_view_name), {Slice=>{}}, );# $param->{'проект'}, @{$param->{'даты'}},
}

sub всего {
  my $self = shift;
  $self->dbh->selectall_hashref($self->sth('движение всего', temp_view_name=>$self->temp_view_name), 'title', undef, ); # $param->{'проект'}, @{$param->{'даты'}},
}

sub всего_строки {
  my $self = shift;
  $self->dbh->selectall_hashref($self->sth('движение всего/2', temp_view_name=>$self->temp_view_name), 'key', ); # $param->{'проект'}, @{$param->{'даты'}},
}

sub итого_колонки {
  my $self = shift;
  $self->dbh->selectall_hashref($self->sth('движение итого/2', temp_view_name=>$self->temp_view_name), 'sign', undef, ); # $param->{'проект'}, @{$param->{'даты'}},
}



sub итого {
  my $self = shift;
  #~ my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectrow_array($self->sth('движение итого/всего', temp_view_name=>$self->temp_view_name), undef, );# $param->{'проект'}, @{$param->{'даты'}},
  
}

sub остаток_начало {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  $self->dbh->selectrow_array($self->sth('остаток на начало', temp_view_name=>$self->temp_view_name), undef, ($param->{'даты'}[0], ($param->{'проект'}) x 2, ($param->{'кошелек'}) x 2,  ($param->{'контрагент'}) x 2, ) x 2);
}

sub строка_отчета_интервалы {
  my $self = shift;
  
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_arrayref($self->sth('строка отчета/интервалы', temp_view_name=>$self->temp_view_name), {Slice=>{}}, ($param->{"категория"}) x 2, $param->{sign},);#
}


sub строка_отчета_интервалы_2 {
  my $self = shift;
  
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_arrayref($self->sth('строка отчета/интервалы/2', temp_view_name=>$self->temp_view_name), {Slice=>{}}, ($param->{"категория"}) x 2, $param->{"код интервала"} || $param->{key} ,);#
}

sub строка_отчета_всего {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_hashref($self->sth('строка отчета/всего', temp_view_name=>$self->temp_view_name), 'category', undef, ($param->{"категория"}) x 2, $param->{sign},); 
}

sub строка_отчета_всего_2 {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_hashref($self->sth('строка отчета/всего/2', temp_view_name=>$self->temp_view_name), 'category', undef, ($param->{"категория"}) x 2, $param->{"код интервала"} || $param->{key},); 
}

sub строка_отчета_интервалы_позиции {
  my $self = shift;
  
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_arrayref($self->sth('строка отчета/интервалы/позиции', temp_view_name=>$self->temp_view_name), {Slice=>{}}, $param->{"категория"}, $param->{sign},);#
}


sub строка_отчета_интервалы_позиции_2 {
  my $self = shift;
  
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_arrayref($self->sth('строка отчета/интервалы/позиции/2', temp_view_name=>$self->temp_view_name), {Slice=>{}}, $param->{"категория"}, $param->{"код интервала"} || $param->{key},);#
}

1;

__DATA__
@@ временная схема
DROP SCHEMA IF EXISTS "tmp" CASCADE;
CREATE SCHEMA "tmp";
CREATE EXTENSION IF NOT EXISTS intarray;

@@ внешние платежи/from
  "проекты" p
  join refs rp on p.id=rp.id1
  join "кошельки" w on w.id=rp.id2
  join refs rw on w.id=rw.id1
  join "движение денег" m on m.id=rw.id2

@@ внутренние перемещения/from
  "проекты" p
  join refs rp on p.id=rp.id1
  join "кошельки" w on w.id=rp.id2 -- кошелек2 при вводе
  join refs rm on w.id=rm.id2
  join "движение денег" m on m.id=rm.id1

@@ кошелек2
  -- обратная связь с внутренним перемещением
  select w.*, rm.id1 as _ref, p.title as "проект", p.id as "проект/id"
  from "проекты" p
    join refs r on p.id=r.id1
    join "кошельки" w on w.id=r.id2
    join refs rm on w.id=rm.id2 -- к деньгам

@@ контрагент
  select k.*, rm.id2 as _ref
  from "контрагенты" k
    join refs rm on k.id=rm.id1 -- к деньгам

@@ снимок диапазона
---DROP TABLE IF EXISTS "tmp"."{%= $temp_view_name %}";
---CREATE UNLOGGED  TABLE "tmp"."{%= $temp_view_name %}" as
DROP MATERIALIZED VIEW IF EXISTS "tmp"."{%= $temp_view_name %}";
CREATE MATERIALIZED VIEW  "tmp"."{%= $temp_view_name %}" as
select m.id, m.ts, m."дата", m."сумма",
  sign("сумма"::numeric) as "sign", to_char("дата", ?) as "код интервала", to_char("дата", ?) as "интервал",
  "категории/родители узла/id"(c.id, true) as "категории",
  "категории/родители узла/title"(c.id, false) as "категория",
  k.title as "контрагент",
  w2.id as "кошелек2",
  array[[p.title, w.title], [w2."проект", w2.title]]::text[][] as "кошельки"
from 
  {%= $dict->render('внешние платежи/from') %}
  left join ({%= $dict->render('кошелек2') %}) w2 on w2._ref = m.id
  left join ({%= $dict->render('контрагент') %}) k on k._ref = m.id
  join refs rc on m.id=rc.id2
  join "категории" c on c.id=rc.id1
where 
  m."дата" between ?::date and ?::date
  and ((?::int is null or p.id=?) and (?::int is null or w.id=?)) -- проект или кошелек
  and (?::int is null or k.id=?) -- контрагент

union -- внутренние перемещения по кошелькам

select m.id, m.ts, m."дата", -1*m."сумма" as "сумма",
  -1*sign("сумма"::numeric) as "sign", to_char("дата", ?) as "код интервала", to_char("дата", ?) as "интервал",
  "категории/родители узла/id"(c.id, true) as "категории",
  "категории/родители узла/title"(c.id, false) as "категория",
  null as "контрагент",
  w2.id as "кошелек2",
  array[[w2."проект", w2.title] , [p.title, w.title]]::text[][] as "кошельки" -- переворот кошельков 
from 
  {%#= $dict->render('внутренние перемещения/from') %}
  {%= $dict->render('внешние платежи/from') %}
  join ({%= $dict->render('кошелек2') %}) w2 on w2._ref = m.id
  join refs rc on m.id=rc.id2
  join "категории" c on c.id=rc.id1

where 
  m."дата" between ?::date and ?::date
  and ((?::int is null or w2."проект/id"=?) and (?::int is null or w2.id=?)) -- проект или кошелек
  and (?::int is null or not coalesce(?::int, 0)::boolean) -- контрагент отсекает внутренние перемещения

WITH DATA
;
---REFRESH MATERIALIZED VIEW "{%= $temp_view_name %}" WITH NO DATA;
---REFRESH MATERIALIZED VIEW "{%= $temp_view_name %}" WITH DATA; -- REFRESH MATERIALIZED VIEW CONCURRENTLY

@@ движение всего
select case when "sign" > 0 then 'приход' else 'расход' end as "title",
  "sign",
  sum as "всего"
from (
select "sign", sum("сумма" * "sign") as sum
from "tmp"."{%= $temp_view_name %}"
group by "sign"
) s
;

@@ движение всего/2
-- вертикальная сводная
-- суммы по строкам
select "интервал" as title, "интервал", "код интервала", "код интервала" as "key",
  sum("сумма") as "всего"
from "tmp"."{%= $temp_view_name %}"
group by "интервал", "код интервала"
;

@@ движение/интервалы
-- колонки
select case when "sign" > 0 then 'приход' else 'расход' end as "title", "sign", "интервал", "код интервала", sum("сумма" * "sign") as sum
from "tmp"."{%= $temp_view_name %}"
group by "sign", "интервал", "код интервала"
order by "sign" desc, "код интервала"
;

@@ движение/интервалы/2
-- вертикальная сводная
--- основное тело сумм
select "sign", "интервал", "интервал" as title, "код интервала", sum("сумма" * "sign") as sum,
  3::int as "категория"
from "tmp"."{%= $temp_view_name %}"
group by "sign", "интервал", "код интервала"
order by "код интервала", "sign" desc;
;

@@ движение итого/всего
-- для двух таблиц
select sum("сумма")
from "tmp"."{%= $temp_view_name %}"
;

@@ движение итого/интервалы
-- итоговая строка
select "интервал", "код интервала", sum("сумма") as sum
from "tmp"."{%= $temp_view_name %}"
group by "интервал", "код интервала"
;

@@ движение итого/2
-- вертикальная сводная
-- итоговая строка
select case when "sign" > 0 then 'Приход' else 'Расход' end as "title", "sign", "sign" as "key", sum("сумма" * "sign") as sum
from "tmp"."{%= $temp_view_name %}"
group by "sign"
---order by 1
;

@@ остаток на начало
-- для двух таблиц
select sum("сумма") as sum
from (
select m."сумма"
from 
  {%= $dict->render('внешние платежи/from') %}
  left join ({%= $dict->render('контрагент') %}) k on k._ref = m.id

where
  m."дата" < ?::date
  and ((?::int is null or p.id=?) and (?::int is null or w.id=?)) -- проект или кошелек
  and (?::int is null or k.id=?) -- контрагент

union -- внутренние перемещения по кошелькам

select -1*m."сумма" as "сумма"
from 
  {%= $dict->render('внутренние перемещения/from') %}

where
  m."дата" < ?::date
  and ((?::int is null or p.id=?) and (?::int is null or w.id=?)) -- проект или кошелек
  and (?::int is null or not coalesce(?::int, 0)::boolean) -- контрагент отсекает внутренние перемещения
) s


@@ строка отчета/интервалы
-- развернуть
select q.*, c.title ---заголовок категории
from (
select "level", "категории"["level"+1] as "категория", "интервал", "код интервала", sum("сумма" * "sign") as sum
from (
select *,
  idx("категории", ?::int) as level
from "tmp"."{%= $temp_view_name %}"
where ?::int = any("категории")
  and "sign"=?
) q
group by "level", "категории"["level"+1], "интервал", "код интервала"
) q
  join "категории" c on q."категория"=c.id
order by c.title
;

@@ строка отчета/интервалы/2
-- для вертикальной таблицы
-- развернуть
select q.*, c.title ---заголовок категории
from (
select "level", "категории"["level"+1] as "категория", "sign", sum("сумма" * "sign") as sum
from (
select *,
  idx("категории", ?::int) as level
from "tmp"."{%= $temp_view_name %}"
where ?::int = any("категории")
  and "код интервала"=?
) q
group by "level", "категории"["level"+1], "sign"
) q
  join "категории" c on q."категория"=c.id
order by c.title
;

@@ строка отчета/всего
-- развернуть
select "категории"["level"+1] as "category", sum("сумма" * "sign") as sum
from (
select *,
  idx("категории", ?::int) as level
from "tmp"."{%= $temp_view_name %}"
where ?::int = any("категории")
  and "sign"=?
) q
group by "категории"["level"+1]
;

@@ строка отчета/всего/2
-- для вертикальной таблицы
-- развернуть
select "категории"["level"+1] as "category", sum("сумма") as sum
from (
select *,
  idx("категории", ?::int) as level
from "tmp"."{%= $temp_view_name %}"
where ?::int = any("категории")
  and "код интервала"=?
) q
group by "категории"["level"+1]
;

@@ строка отчета/интервалы/позиции
-- конечная детализация позиций
select *, to_char("дата", 'DD.MM.YY') as "дата_формат", "сумма" * "sign" as sum
from "tmp"."{%= $temp_view_name %}"
where 
  "категории"[array_length("категории", 1)] = ?::int
  and "sign"=?
order by "дата" 
;

@@ строка отчета/интервалы/позиции/2
--- для вертикальной таблицы
-- конечная детализация позиций
select *, to_char("дата", 'DD.MM.YY') as "дата_формат", "сумма" * "sign" as sum
from "tmp"."{%= $temp_view_name %}"
where ---!::int = any("категории")
  "категории"[array_length("категории", 1)] = ?::int
  and "код интервала"=?
order by "дата"
;




@@ функции
-- не надо
CREATE OR REPLACE FUNCTION "array_indexOf"(needle ANYELEMENT, haystack ANYARRAY)
RETURNS INT AS $$
    SELECT i
      FROM generate_subscripts($2, 1) AS i
     WHERE $2[i] = $1
  ORDER BY i
$$ LANGUAGE sql STABLE;
