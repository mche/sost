package Model::Waltex::Report;
use Mojo::Base 'Model::Base';
#~ use Mojo::Util qw(dumper);

#~ has sth_cached => 1;
my $main_table ="движение денег";
has "temp_table_name" => "движение денег-снимок-".rand();

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
  $self->dbh->do($self->sth('снимок диапазона', temp_table_name=>$self->temp_table_name), undef, $param->{'проект'}, @{$param->{'даты'}});
}

sub движение_интервалы {
  my $self = shift;
  #~ my $param = ref $_[0] ? shift : {@_};
  $self->dbh->selectall_arrayref($self->sth('движение/интервалы', temp_table_name=>$self->temp_table_name), {Slice=>{}}, );# $param->{'проект'}, @{$param->{'даты'}},
}

sub движение_итого_интервалы {
  my $self = shift;
  #~ my $param = ref $_[0] ? shift : {@_};
  $self->dbh->selectall_arrayref($self->sth('движение итого/интервалы', temp_table_name=>$self->temp_table_name), {Slice=>{}}, );# $param->{'проект'}, @{$param->{'даты'}},
}

sub всего {
  my $self = shift;
  #~ my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_hashref($self->sth('движение всего', temp_table_name=>$self->temp_table_name), 'title', undef, ); # $param->{'проект'}, @{$param->{'даты'}},
  
}

sub итого {
  my $self = shift;
  #~ my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectrow_array($self->sth('движение итого/всего', temp_table_name=>$self->temp_table_name), undef, );# $param->{'проект'}, @{$param->{'даты'}},
  
}

sub строка_отчета_интервалы {
  my $self = shift;
  
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_arrayref($self->sth('строка отчета/интервалы', temp_table_name=>$self->temp_table_name), {Slice=>{}}, ($param->{"категория"}) x 2, $param->{sign},);#
}

sub строка_отчета_всего {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_hashref($self->sth('строка отчета/всего', temp_table_name=>$self->temp_table_name), 'category', undef, ($param->{"категория"}) x 2, $param->{sign},); 
}

1;

__DATA__
@@ временная схема
DROP SCHEMA IF EXISTS "tmp" CASCADE;
CREATE SCHEMA "tmp";
CREATE EXTENSION IF NOT EXISTS intarray;

@@ снимок диапазона
---DROP TABLE IF EXISTS "tmp"."{%= $temp_table_name %}";
---CREATE UNLOGGED  TABLE "tmp"."{%= $temp_table_name %}" as
DROP MATERIALIZED VIEW IF EXISTS "tmp"."{%= $temp_table_name %}";
CREATE MATERIALIZED VIEW  "tmp"."{%= $temp_table_name %}" as
select m.*, sign("сумма"::numeric) as "sign", to_char("дата", 'TMmonth YY') as "интервал", to_char("дата", 'mmYYYY') as "код интервала",
  "категории/родители узла/id"(c.id, true) as "категории"
from "кошельки" w
  join refs rp on w.id=rp.id2 --к проекту
  join refs rm on w.id=rm.id1-- к деньгам
  join "движение денег" m on m.id=rm.id2
  join refs rc on m.id=rc.id2
  join "категории" c on c.id=rc.id1
where rp.id1=? -- проект
  and m."дата" between ?::date and ?::date

WITH DATA
;
---REFRESH MATERIALIZED VIEW "{%= $temp_table_name %}" WITH NO DATA;
---REFRESH MATERIALIZED VIEW "{%= $temp_table_name %}" WITH DATA; -- REFRESH MATERIALIZED VIEW CONCURRENTLY

@@ движение всего
select case when "sign" > 0 then 'приход' else 'расход' end as "title",
  "sign",
  sum as "всего"
from (
select "sign", sum("сумма" * "sign") as sum
from "tmp"."{%= $temp_table_name %}"
group by "sign"
) s
;

@@ движение/интервалы
-- колонки
select case when "sign" > 0 then 'приход' else 'расход' end as "title", "sign", "интервал", "код интервала", sum("сумма" * "sign") as sum
from "tmp"."{%= $temp_table_name %}"
group by "sign", "интервал", "код интервала"
;

@@ движение итого/всего
select sum("сумма")
from "tmp"."{%= $temp_table_name %}"
;

@@ движение итого/интервалы
-- итоговая строка
select "интервал", "код интервала", sum("сумма") as sum
from "tmp"."{%= $temp_table_name %}"
group by "интервал", "код интервала"
;


@@ строка отчета/интервалы
-- развернуть
select q.*, c.title ---заголовок категории
from (
select "level", "категории"["level"+1] as "категория", "интервал", "код интервала", sum("сумма" * "sign") as sum
from (
select *,
  idx("категории", ?::int) as level
from "tmp"."{%= $temp_table_name %}"
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
from "tmp"."{%= $temp_table_name %}"
where ?::int = any("категории")
  and "sign"=?
) q
group by "категории"["level"+1]
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
