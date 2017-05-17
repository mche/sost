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
  $self->dbh->do($self->sth('снимок диапазона', temp_view_name=>$self->temp_view_name), undef, (@{$param->{'интервал'}}, ($param->{'проект'}) x 2,  ($param->{'кошелек'}) x 2, @{$param->{'даты'}}) x 2 );
}

sub движение_интервалы {
  my $self = shift;
  #~ my $param = ref $_[0] ? shift : {@_};
  $self->dbh->selectall_arrayref($self->sth('движение/интервалы', temp_view_name=>$self->temp_view_name), {Slice=>{}}, );# $param->{'проект'}, @{$param->{'даты'}},
}

sub движение_итого_интервалы {
  my $self = shift;
  #~ my $param = ref $_[0] ? shift : {@_};
  $self->dbh->selectall_arrayref($self->sth('движение итого/интервалы', temp_view_name=>$self->temp_view_name), {Slice=>{}}, );# $param->{'проект'}, @{$param->{'даты'}},
}

sub всего {
  my $self = shift;
  #~ my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_hashref($self->sth('движение всего', temp_view_name=>$self->temp_view_name), 'title', undef, ); # $param->{'проект'}, @{$param->{'даты'}},
  
}

sub итого {
  my $self = shift;
  #~ my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectrow_array($self->sth('движение итого/всего', temp_view_name=>$self->temp_view_name), undef, );# $param->{'проект'}, @{$param->{'даты'}},
  
}

sub остаток_начало {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  $self->dbh->selectrow_array($self->sth('остаток на начало', temp_view_name=>$self->temp_view_name), undef, (($param->{'проект'}) x 2, ($param->{'кошелек'}) x 2, $param->{'даты'}[0]) x 2);
}

sub строка_отчета_интервалы {
  my $self = shift;
  
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_arrayref($self->sth('строка отчета/интервалы', temp_view_name=>$self->temp_view_name), {Slice=>{}}, ($param->{"категория"}) x 2, $param->{sign},);#
}

sub строка_отчета_всего {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_hashref($self->sth('строка отчета/всего', temp_view_name=>$self->temp_view_name), 'category', undef, ($param->{"категория"}) x 2, $param->{sign},); 
}

sub строка_отчета_интервалы_позиции {
  my $self = shift;
  
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_arrayref($self->sth('строка отчета/интервалы/позиции', temp_view_name=>$self->temp_view_name), {Slice=>{}}, $param->{"категория"}, $param->{sign},);#
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
where ((?::int is null or p.id=?) and (?::int is null or w.id=?)) -- проект или кошелек
  and m."дата" between ?::date and ?::date

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

where ((?::int is null or w2."проект/id"=?) and (?::int is null or w2.id=?)) -- проект или кошелек
  and m."дата" between ?::date and ?::date

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

@@ движение/интервалы
-- колонки
select case when "sign" > 0 then 'приход' else 'расход' end as "title", "sign", "интервал", "код интервала", sum("сумма" * "sign") as sum
from "tmp"."{%= $temp_view_name %}"
group by "sign", "интервал", "код интервала"
order by "sign" desc, "код интервала"
;

@@ движение итого/всего
select sum("сумма")
from "tmp"."{%= $temp_view_name %}"
;

@@ движение итого/интервалы
-- итоговая строка
select "интервал", "код интервала", sum("сумма") as sum
from "tmp"."{%= $temp_view_name %}"
group by "интервал", "код интервала"
;

@@ остаток на начало
select sum("сумма") as sum
from (
select m."сумма"
from 
  {%= $dict->render('внешние платежи/from') %}

where ((?::int is null or p.id=?) and (?::int is null or w.id=?)) -- проект или кошелек
  and m."дата" < ?::date

union -- внутренние перемещения по кошелькам

select -1*m."сумма" as "сумма"
from 
  {%= $dict->render('внутренние перемещения/from') %}

where ((?::int is null or p.id=?) and (?::int is null or w.id=?)) -- проект или кошелек
  and m."дата" < ?::date
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

@@ строка отчета/интервалы/позиции
-- конечная детализация позиций
select *, to_char("дата", 'DD.MM.YY') as "дата_формат", "сумма" * "sign" as sum
from "tmp"."{%= $temp_view_name %}"
where ---!::int = any("категории")
  "категории"[array_length("категории", 1)] = ?::int
  and "sign"=?
order by "дата" desc;

@@ функции
-- не надо
CREATE OR REPLACE FUNCTION "array_indexOf"(needle ANYELEMENT, haystack ANYARRAY)
RETURNS INT AS $$
    SELECT i
      FROM generate_subscripts($2, 1) AS i
     WHERE $2[i] = $1
  ORDER BY i
$$ LANGUAGE sql STABLE;
