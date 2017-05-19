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
  $self->dbh->do($self->sth('снимок диапазона', temp_view_name=>$self->temp_view_name), undef, (@{$param->{'интервал'} || [undef, undef]}, @{$param->{'даты'}}, ($param->{'проект'}) x 2,  ($param->{'кошелек'}) x 2, ($param->{'контрагент'}) x 2,) x 2 );
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

sub движение_все_кошельки {
  my $self = shift;
  #~ my $param = ref $_[0] ? shift : {@_};
  $self->dbh->selectall_arrayref($self->sth('движение/все кошельки', temp_view_name=>$self->temp_view_name), {Slice=>{}}, );
  
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

sub всего_строки_все_кошельки {
  my $self = shift;
  $self->dbh->selectall_hashref($self->sth('всего/все кошельки', temp_view_name=>$self->temp_view_name), 'key', ); # $param->{'проект'}, @{$param->{'даты'}},
}

sub итого_колонки {
  my $self = shift;
  $self->dbh->selectall_hashref($self->sth('движение итого/2', temp_view_name=>$self->temp_view_name), 'sign', undef, ); # $param->{'проект'}, @{$param->{'даты'}},
}



sub итого_всего {
  my $self = shift;
  #~ my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectrow_array($self->sth('движение итого/всего', temp_view_name=>$self->temp_view_name), undef, );# $param->{'проект'}, @{$param->{'даты'}},
  
}

sub остаток_начало {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  $self->dbh->selectrow_array($self->sth('остаток на дату', temp_view_name=>$self->temp_view_name), undef, ($param->{'даты'}[0], '0 days', ($param->{'проект'}) x 2, ($param->{'кошелек'}) x 2,  ($param->{'контрагент'}) x 2, ) x 2);
}

sub остаток_конец { # на вторую дату
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  $self->dbh->selectrow_array($self->sth('остаток на дату', temp_view_name=>$self->temp_view_name), undef, ($param->{'даты'}[1], '1 days', ($param->{'проект'}) x 2, ($param->{'кошелек'}) x 2,  ($param->{'контрагент'}) x 2, ) x 2);
}

sub остатки_кошельки_или_контрагенты {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  $self->dbh->selectrow_hashref($self->sth('остатки/кошельки или контрагенты', temp_view_name=>$self->temp_view_name), undef, (@{$param->{'даты'}}, ($param->{'проект'}) x 2, ($param->{'кошелек'}) x 2,  ($param->{'контрагент'}) x 2, ) x 2);
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

sub строка_отчета_интервалы_все_кошельки {
  my $self = shift;
  
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_arrayref($self->sth('строка отчета/интервалы/все кошельки', temp_view_name=>$self->temp_view_name), {Slice=>{}}, ($param->{"категория"}) x 2, $param->{key} ,);#
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

sub строка_отчета_всего_все_кошельки {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_hashref($self->sth('строка отчета/всего/все кошельки', temp_view_name=>$self->temp_view_name), 'category', undef, ($param->{"категория"}) x 2, $param->{key},); 
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

sub строка_отчета_интервалы_позиции_все_кошельки {
  my $self = shift;
  
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_arrayref($self->sth('строка отчета/интервалы/позиции/все кошельки', temp_view_name=>$self->temp_view_name), {Slice=>{}}, $param->{"категория"}, $param->{key},);#
}

sub сумма_двух_денег {
  my $self = shift;
  $self->dbh->selectrow_array($self->sth('сумма двух денег'), undef, @_);
  
}


1;

__DATA__
@@ временная схема
DROP SCHEMA IF EXISTS "tmp" CASCADE;
CREATE SCHEMA "tmp";
CREATE EXTENSION IF NOT EXISTS intarray;

@@ внешние платежи/from
  ({%= $dict->render('проект/кошелек') %}) w
  join "движение денег" m on m.id=w._ref
  join ({%= $dict->render('категория') %}) c on m.id=c._ref
  left join ({%= $dict->render('кошелек2') %}) w2 on w2._ref = m.id
  left join ({%= $dict->render('контрагент') %}) k on k._ref = m.id
  

@@ внутренние перемещения/from
  ({%= $dict->render('проект/кошелек') %}) w
  join "движение денег" m on m.id=w._ref
  join ({%= $dict->render('категория') %}) c on m.id=c._ref
  join ({%= $dict->render('кошелек2') %}) w2 on w2._ref = m.id
  

@@ проект/кошелек
select w.*, p.id as "проект/id", p.title as "проект", rm.id2 as _ref
from "проекты" p
  join refs rp on p.id=rp.id1
  join "кошельки" w on w.id=rp.id2
  join refs rm on w.id=rm.id1 -- к деньгам

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

@@ категория
select c.*, rm.id2 as _ref
from "категории" c
  join refs rm on c.id=rm.id1 -- к деньгам

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
  array[[w."проект", w.title], [w2."проект", w2.title]]::text[][] as "кошельки",
  array[[w."проект/id", w.id], [w2."проект/id", w2.id]]::int[][] as "кошельки/id"
from 
  {%= $dict->render('внешние платежи/from') %}
  
where 
  m."дата" between ?::date and ?::date
  and ((?::int is null or w."проект/id"=?) and (?::int is null or w.id=?)) -- проект или кошелек
  and (?::int is null or k.id=?) -- контрагент

union all -- внутренние перемещения по кошелькам

select m.id, m.ts, m."дата", -1*m."сумма" as "сумма",
  -1*sign("сумма"::numeric) as "sign", to_char("дата", ?) as "код интервала", to_char("дата", ?) as "интервал",
  "категории/родители узла/id"(c.id, true) as "категории",
  "категории/родители узла/title"(c.id, false) as "категория",
  null as "контрагент",
  w2.id as "кошелек2",
  array[[w2."проект", w2.title] , [w."проект", w.title]]::text[][] as "кошельки", -- переворот кошельков
  array[[w2."проект/id", w2.id] , [w."проект/id", w.id]]::int[][] as "кошельки/id"
from 
  {%= $dict->render('внутренние перемещения/from') %}

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
select "sign", sum("сумма") as sum
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

@@ всего/все кошельки
-- вертикальная сводная
-- суммы по строкам
select "кошельки"[1][1:2] as title, array_to_string("кошельки/id"[1][1:2], ': ') as "key",
  sum("сумма") as "всего"
from "tmp"."{%= $temp_view_name %}"
group by "кошельки"[1][1:2], "кошельки/id"[1][1:2]
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
select "sign", "интервал", "интервал" as title, "код интервала", sum("сумма" * "sign") as sum
  ---3::int as "категория"
from "tmp"."{%= $temp_view_name %}"
group by "sign", "интервал", "код интервала"
order by "код интервала", "sign" desc;
;

@@ движение/все кошельки
-- вертикальная сводная
--- основное тело сумм
select "sign", "кошельки"[1][1:2] as title, "кошельки/id"[1][1:2] as "кошельки/id", array_to_string("кошельки/id"[1][1:2], ': ') as "key", sum("сумма" * "sign") as sum
from "tmp"."{%= $temp_view_name %}"
group by "sign", "кошельки"[1][1:2], "кошельки/id"[1][1:2]
order by array_to_string("кошельки"[1][1:2], ': '), "sign" desc;
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
select case when "sign" > 0 then 'Приход' else 'Расход' end as "title", "sign", "sign" as "key", sum("сумма") as sum
from "tmp"."{%= $temp_view_name %}"
group by "sign"
---order by 1
;

@@ остаток на дату
--- и начало и конец
-- для двух таблиц
select sum("сумма") as sum
from (
select m."сумма"
from 
  {%= $dict->render('внешние платежи/from') %}

where
  m."дата" < (?::date + interval ?)
  and ((?::int is null or w."проект/id"=?) and (?::int is null or w.id=?)) -- проект или кошелек
  and (?::int is null or k.id=?) -- контрагент


union all -- внутренние перемещения по кошелькам

select -1*m."сумма" as "сумма"
from 
  {%= $dict->render('внутренние перемещения/from') %}

where
  m."дата" < (?::date + interval ?)
  and ((?::int is null or w2."проект/id"=?) and (?::int is null or w2.id=?)) -- проект или кошелек
  and (?::int is null or not coalesce(?::int, 0)::boolean) -- контрагент отсекает внутренние перемещения
  
) s;

@@ остатки/кошельки или контрагенты
-- вертикальная сводная
--- для интервалов дат не катит!!
--- и начало и конец
select sum("сумма1") as "сальдо1", sum("сумма2") as "сальдо2"
from (
select ---"код интервала" as key,
  case when m."дата" < ?::date then m."сумма" else 0::money end as "сумма1", -- первая дата
  m."сумма" as "сумма2"
from 
  {%= $dict->render('внешние платежи/from') %}

where
  m."дата" < (?::date + interval '1 days') -- вторая дата
  and ((?::int is null or w."проект/id"=?) and (?::int is null or w.id=?)) -- проект или кошелек
  and (?::int is null or k.id=?) -- контрагент

UNION ALL -- внутренние перемещения по кошелькам

select ----"код интервала" as key,
  case when m."дата" < ?::date then -1*m."сумма" else 0::money end as "сумма1", -- первая дата
  -1*m."сумма" as "сумма2"
from 
  {%= $dict->render('внутренние перемещения/from') %}

where
  m."дата" < (?::date + interval '1 days') -- вторая дата
  and ((?::int is null or w2."проект/id"=?) and (?::int is null or w2.id=?)) -- проект или кошелек
  and (?::int is null or not coalesce(?::int, 0)::boolean) -- контрагент отсекает внутренние перемещения
) s
;



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

@@ строка отчета/интервалы/все кошельки
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
  and "кошельки/id"[1][2]=?
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

@@ строка отчета/интервалы/позиции/все кошельки
--- для вертикальной таблицы
-- конечная детализация позиций
select *, to_char("дата", 'DD.MM.YY') as "дата_формат", "сумма" * "sign" as sum
from "tmp"."{%= $temp_view_name %}"
where ---!::int = any("категории")
  "категории"[array_length("категории", 1)] = ?::int
  and "кошельки/id"[1][2]=?
order by "дата"
;

@@ строка отчета/всего/все кошельки
-- для вертикальной таблицы
-- развернуть
select "категории"["level"+1] as "category", sum("сумма") as sum
from (
select *,
  idx("категории", ?::int) as level
from "tmp"."{%= $temp_view_name %}"
where ?::int = any("категории")
  and "кошельки/id"[1][2]=?
) q
group by "категории"["level"+1]
;

@@ сумма двух денег
select ?::money + ?::money;

@@ функции
-- не надо
CREATE OR REPLACE FUNCTION "array_indexOf"(needle ANYELEMENT, haystack ANYARRAY)
RETURNS INT AS $$
    SELECT i
      FROM generate_subscripts($2, 1) AS i
     WHERE $2[i] = $1
  ORDER BY i
$$ LANGUAGE sql STABLE;
