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
  $self->dbh->do($self->sth('функции'));
  return $self;
}

sub снимок_диапазона {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  $self->dbh->do($self->sth('снимок диапазона', temp_view_name=>$self->temp_view_name), undef, (@{$param->{'интервал'} || [undef, undef]}, @{$param->{'даты'}}, ($param->{'проект'}) x 2,  ($param->{'кошелек'}) x 2, ($param->{'контрагент'}) x 4,) x 2 );
}

sub движение_интервалы {
  my $self = shift;
  #~ my $param = ref $_[0] ? shift : {@_};
  $self->dbh->selectall_arrayref($self->sth('движение/интервалы', temp_view_name=>$self->temp_view_name), {Slice=>{}}, );# $param->{'проект'}, @{$param->{'даты'}},
}

sub движение_интервалы2 {
  my $self = shift;
  #~ my $param = ref $_[0] ? shift : {@_};
  $self->dbh->selectall_hashref($self->sth('движение/интервалы/2', temp_view_name=>$self->temp_view_name), 'key', );# $param->{'проект'}, @{$param->{'даты'}},
}

sub движение_все_кошельки {
  my $self = shift;
  #~ my $param = ref $_[0] ? shift : {@_};
  $self->dbh->selectall_hashref($self->sth('движение/все кошельки', temp_view_name=>$self->temp_view_name), 'key', );
  
}

sub движение_все_контрагенты {
  my $self = shift;
  #~ my $param = ref $_[0] ? shift : {@_};
  $self->dbh->selectall_hashref($self->sth('движение/все контрагенты', temp_view_name=>$self->temp_view_name), 'key', );
  
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
  $self->dbh->selectall_arrayref($self->sth('движение всего/2', temp_view_name=>$self->temp_view_name), {Slice=>{}}, ); # $param->{'проект'}, @{$param->{'даты'}},
}

sub всего_строки_все_кошельки0000 {
  my $self = shift;
  $self->dbh->selectall_hashref($self->sth('всего/все кошельки', temp_view_name=>$self->temp_view_name), 'key', ); # $param->{'проект'}, @{$param->{'даты'}},
}

sub всего_строки_все_контрагенты {
  my $self = shift;
  $self->dbh->selectall_hashref($self->sth('всего/все контрагенты', temp_view_name=>$self->temp_view_name), 'key', ); # $param->{'проект'}, @{$param->{'даты'}},
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

#~ sub остаток_начало000 {
  #~ my $self = shift;
  #~ my $param = ref $_[0] ? shift : {@_};
  #~ $self->dbh->selectrow_array($self->sth('остаток на дату', temp_view_name=>$self->temp_view_name), undef, ($param->{'даты'}[0], '0 days', ($param->{'проект'}) x 2, ($param->{'кошелек'}) x 2,  ($param->{'контрагент'}) x 2, ) x 2);
#~ }

#~ sub остаток_конец000 { # на вторую дату
  #~ my $self = shift;
  #~ my $param = ref $_[0] ? shift : {@_};
  #~ $self->dbh->selectrow_array($self->sth('остаток на дату', temp_view_name=>$self->temp_view_name), undef, ($param->{'даты'}[1], '1 days', ($param->{'проект'}) x 2, ($param->{'кошелек'}) x 2,  ($param->{'контрагент'}) x 2, ) x 2);
#~ }

sub остатки_период {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  $self->dbh->selectrow_hashref($self->sth('остатки/период'), undef, ($param->{'даты'}[0], @{$param->{'даты'}}, ($param->{'проект'}) x 2, ($param->{'кошелек'}) x 2,  ($param->{'контрагент'}) x 4, ) x 2);
  
}


sub всего_остатки_все_кошельки {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  #~ $self->dbh->selectall_hashref($self->sth('всего и остатки/все кошельки'), 'key',  undef, ($param->{'даты'}[0], @{$param->{'даты'}}, ($param->{'проект'}) x 2, ($param->{'кошелек'}) x 2,  ($param->{'контрагент'}) x 2, ) x 2);
  $self->dbh->selectall_arrayref($self->sth('всего и остатки/все кошельки'), {Slice=>{}}, ($param->{'даты'}[0], @{$param->{'даты'}}, ($param->{'проект'}) x 2, ($param->{'кошелек'}) x 2,  ($param->{'контрагент'}) x 4, ) x 2);
}

sub всего_остатки_все_контрагенты {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  #~ $self->dbh->selectall_hashref($self->sth('всего и остатки/все контрагенты'), 'key', undef, ($param->{'даты'}[0], @{$param->{'даты'}}, ($param->{'проект'}) x 2, ($param->{'кошелек'}) x 2,  ($param->{'контрагент'}) x 2, ) x 2);
  $self->dbh->selectall_arrayref($self->sth('всего и остатки/все контрагенты'), {Slice=>{}}, ($param->{'даты'}[0], @{$param->{'даты'}}, ($param->{'проект'}) x 2, ($param->{'кошелек'}) x 2,  ($param->{'контрагент'}) x 4, ) x 2);
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

sub строка_отчета_интервалы_все_контрагенты {
  my $self = shift;
  
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_arrayref($self->sth('строка отчета/интервалы/все контрагенты', temp_view_name=>$self->temp_view_name), {Slice=>{}}, ($param->{"категория"}) x 2, $param->{key} ,);#
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

sub строка_отчета_всего_все_контрагенты {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_hashref($self->sth('строка отчета/всего/все контрагенты', temp_view_name=>$self->temp_view_name), 'category', undef, ($param->{"категория"}) x 2, $param->{key},); 
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

sub строка_отчета_интервалы_позиции_все_контрагенты {
  my $self = shift;
  
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_arrayref($self->sth('строка отчета/интервалы/позиции/все контрагенты', temp_view_name=>$self->temp_view_name), {Slice=>{}}, $param->{"категория"}, $param->{key},);#
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
-- для view (контрагенты+сотрудники!!!)
  ({%= $dict->render('проект/кошелек') %}) w
  join "движение денег" m on m.id=w._ref
  join ({%= $dict->render('категория') %}) c on m.id=c._ref
  left join ({%= $dict->render('кошелек2') %}) w2 on w2._ref = m.id --- чтобы отсечь по w2.id is null
  left join ({%= $dict->render('контрагент') %}) k on k._ref = m.id
  left join ({%= $dict->render('профиль') %}) pp on pp._ref = m.id
  

@@ внутренние перемещения/from
-- для view
  ({%= $dict->render('проект/кошелек') %}) w
  join "движение денег" m on m.id=w._ref
  join ({%= $dict->render('категория') %}) c on m.id=c._ref
  join ({%= $dict->render('кошелек2') %}) w2 on w2._ref = m.id
  

@@ расчеты по сотрудникам/from
-- для view (в расчетах включено во внешние платежи как $dict->render('профиль'))
  ({%= $dict->render('проект/кошелек') %}) w
  join "движение денег" m on m.id=w._ref
  join ({%= $dict->render('категория') %}) c on m.id=c._ref
  join ({%= $dict->render('профиль') %}) pp on pp._ref = m.id

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

@@ профиль
-- расчеты с сотрудниками
-- обратная связь
  select p.*, rm.id1 as _ref
  from "профили" p
    join refs rm on p.id=rm.id2 -- к деньгам

@@ категория
select c.*, rm.id2 as _ref
from "категории" c
  join refs rm on c.id=rm.id1 -- к деньгам

@@ снимок диапазона
--- юнионы: внешние(контрагенты+сотрудники) внутр(другой кошелек)
---DROP TABLE IF EXISTS "tmp"."{%= $temp_view_name %}";
---CREATE UNLOGGED  TABLE "tmp"."{%= $temp_view_name %}" as
DROP MATERIALIZED VIEW IF EXISTS "tmp"."{%= $temp_view_name %}";
CREATE MATERIALIZED VIEW  "tmp"."{%= $temp_view_name %}" as
select *,
  to_char("дата", ?) as "код интервала", to_char("дата", ?) as "интервал"
from 
  "движение ДС/внешние платежи" --- view
  
where 
  "дата" between ?::date and ?::date
  and ((?::int is null or "кошельки/id"[1][1]=?) and (?::int is null or "кошельки/id"[1][2]=?)) -- проект или кошелек
  and (?::int is null or "контрагент/id"=?) -- контрагент
  and (?::int is null or (coalesce(?::int, 0)::boolean and "профиль/id" is null)) -- контрагент отсекает сотрудников

union all -- внутренние перемещения по кошелькам

select *,
  to_char("дата", ?) as "код интервала", to_char("дата", ?) as "интервал"
from 
  "движение ДС/внутр перемещения" --veiw

where 
  "дата" between ?::date and ?::date
  and ((?::int is null or "кошельки/id"[1][1]=?) and (?::int is null or "кошельки/id"[1][2]=?)) -- проект или кошелек
  and (?::int is null or not coalesce(?::int, 0)::boolean) -- контрагент отсекает внутренние перемещения
  and (?::int is null or ?::int is not null) --- заглушка симметричного биндинга

--- во внешнех расчетах union all -- расчеты по сотрудникам

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
order by "код интервала"
;



@@ всего/все кошельки
-- вертикальная сводная
-- суммы по строкам
select "кошельки"[1][1:2] as title, array_to_string("кошельки/id"[1][1:2], ':') as "key",
  sum("сумма") as "всего"
from "tmp"."{%= $temp_view_name %}"
group by "кошельки"[1][1:2], "кошельки/id"[1][1:2]
;

@@ всего/все контрагенты
-- вертикальная сводная
-- суммы по строкам
select title, "key", sum("сумма") as "всего"
from (
select coalesce("контрагент", '_пусто_') as title,  coalesce("контрагент/id", 0) as "key",
  "сумма"
from "tmp"."{%= $temp_view_name %}"
) s
group by "title", "key"
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
select "sign", "интервал", "интервал" as title, "код интервала", "код интервала" || ':' || "sign"::text as "key", sum("сумма" * "sign") as sum
  ---3::int as "категория"
from "tmp"."{%= $temp_view_name %}"
group by "sign", "интервал", "код интервала"
---order by "код интервала", "sign" desc;
;

@@ движение/все кошельки
-- вертикальная сводная
--- основное тело сумм
select "sign", "кошельки"[1][1:2] as title,  array_to_string("кошельки/id"[1][1:2], ':') || ':' || "sign"::text as "key", sum("сумма" * "sign") as sum
from "tmp"."{%= $temp_view_name %}"
group by "sign", "кошельки"[1][1:2], "кошельки/id"[1][1:2]
---order by array_to_string("кошельки"[1][1:2], ':'), "sign" desc;
;

@@ движение/все контрагенты
-- вертикальная сводная
--- основное тело сумм
select "sign", "title",  "key", sum("sum") as "sum"
from (
select "sign", coalesce("контрагент", '_пусто_') as "title", array_to_string(array[coalesce("контрагент/id", 0), "sign"], ':') as "key", "сумма" * "sign" as "sum"
from "tmp"."{%= $temp_view_name %}"
) s
group by "sign", "title",  "key"
---order by "title", "sign" desc;
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

@@ движение и остатки
--- и начало и конец
-- для двух таблиц
select *,
  case when "дата" < ?::date then "сумма" else 0::money end as "сумма1", -- первая дата
  "сумма" as "сумма2",
   case when "дата" >= ?::date then "сумма" else 0::money end as "сумма движения" -- первая дата
from 
  "движение ДС/внешние платежи" --veiw

where
  "дата" < (?::date + interval '1 days') -- вторая дата
  and ((?::int is null or "кошельки/id"[1][1]=?) and (?::int is null or "кошельки/id"[1][2]=?)) -- проект или кошелек
  and (?::int is null or coalesce("контрагент/id", 0)=?) -- контрагент
  and (?::int is null or (coalesce(?::int, 0)::boolean and "профиль/id" is null)) -- контрагент отсекает сотрудников

UNION ALL -- внутренние перемещения

select *,
  case when "дата" < ?::date then "сумма" else 0::money end as "сумма1", -- первая дата
  "сумма" as "сумма2",
  case when "дата" >= ?::date then "сумма" else 0::money end as "сумма движения" -- первая дата
  
from 
  "движение ДС/внутр перемещения" --veiw

where 
  "дата" < (?::date + interval '1 days') -- вторая дата
  and ((?::int is null or "кошельки/id"[1][1]=?) and (?::int is null or "кошельки/id"[1][2]=?)) -- проект или кошелек
  and (?::int is null or coalesce(?::int, -1) = -1) -- контрагент отсекает внутренние перемещения
  and (?::int is null or ?::int is not null) --- заглушка симметричного биндинга

@@ всего и остатки/все кошельки
-- вертикальная сводная
--- для дат внутри периода не катит!!
--- только две даты начало и конец периода!
--- и начало и конец
select 
  "кошельки"[1][1:2] as title, "кошельки/id"[1][1:2] as "кошельки/id", array_to_string("кошельки/id"[1][1:2], ':') as "key",
  sum("сумма1") as "сальдо1", sum("сумма2") as "сальдо2", sum("сумма движения") as "всего"
from 
  ({%= $dict->render('движение и остатки') %}) o
group by "кошельки"[1][1:2], "кошельки/id"[1][1:2]
order by 1--- array_to_string("кошельки"[1][1:2], ':')
;

@@ всего и остатки/все контрагенты
-- вертикальная сводная
--- для дат внутри периода не катит!!
--- только две даты начало и конец периода!
--- и начало и конец
select 
  coalesce("контрагент", '_пусто_') as title, coalesce("контрагент/id", 0) as "key",
  sum("сумма1") as "сальдо1", sum("сумма2") as "сальдо2", sum("сумма движения") as "всего"
from 
  ({%= $dict->render('движение и остатки') %}) o
group by coalesce("контрагент", '_пусто_'), coalesce("контрагент/id", 0)
order by 1 --- title
;


@@ остатки/период
--- для дат внутри периода не катит!!
--- только две даты начало и конец периода!
--- и начало и конец
select sum("сумма1") as "сальдо1", sum("сумма2") as "сальдо2", sum("сумма движения") as "всего"
from 
  ({%= $dict->render('движение и остатки') %}) o
;


@@ строка отчета/интервалы
-- развернуть
---select q.*, c.title ---заголовок категории
---from (
select "level", "категория"["level"] as title, "категории"["level"+1] as "категория", "интервал", "код интервала", sum("сумма" * "sign") as sum
from (
select *,
  idx("категории", ?::int) as level
from "tmp"."{%= $temp_view_name %}"
where ?::int = any("категории")
  and "sign"=?
) q
group by "level", "категория"["level"], "категории"["level"+1], "интервал", "код интервала"
having "категории"["level"+1] is not null
---) q
---  join "категории" c on q."категория"=c.id
order by 2
;

@@ строка отчета/интервалы/2
-- для вертикальной таблицы
-- развернуть
---select q.*, c.title ---заголовок категории
---from (
select "level", "категория"["level"] as title, "категории"["level"+1] as "категория", "sign", sum("сумма" * "sign") as sum
from (
select *,
  idx("категории", ?::int) as level
from "tmp"."{%= $temp_view_name %}"
where ?::int = any("категории")
  and "код интервала"=?
) q
group by "level", "категория"["level"], "категории"["level"+1], "sign"
having "категории"["level"+1] is not null
---) q
---  join "категории" c on q."категория"=c.id
order by 2
;

@@ строка отчета/интервалы/все кошельки
-- для вертикальной таблицы
-- развернуть
---select q.*, c.title ---заголовок категории
---from (
select "level", "категория"["level"] as title, "категории"["level"+1] as "категория", "sign", sum("сумма" * "sign") as sum
from (
select *,
  idx("категории", ?::int) as level
from "tmp"."{%= $temp_view_name %}"
where ?::int = any("категории")
  and "кошельки/id"[1][2]=?
) q
group by "level", "категория"["level"], "категории"["level"+1], "sign"
having "категории"["level"+1] is not null
---) q
---  join "категории" c on q."категория"=c.id
order by 2
;

@@ строка отчета/интервалы/все контрагенты
-- для вертикальной таблицы
-- развернуть
---select q.*, c.title ---заголовок категории
---from (
select "level", "категория"["level"] as title, "категории"["level"+1] as "категория", "sign", sum("сумма" * "sign") as sum
from (
select *,
  idx("категории", ?::int) as level
from "tmp"."{%= $temp_view_name %}"
where ?::int = any("категории")
  and coalesce("контрагент/id", 0)=?
) q
group by "level", "категория"["level"], "категории"["level"+1], "sign"
having "категории"["level"+1] is not null
--) q
---  join "категории" c on q."категория"=c.id
order by 2
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

@@ строка отчета/интервалы/позиции/все контрагенты
--- для вертикальной таблицы
-- конечная детализация позиций
select *, to_char("дата", 'DD.MM.YY') as "дата_формат", "сумма" * "sign" as sum
from "tmp"."{%= $temp_view_name %}"
where ---!::int = any("категории")
  "категории"[array_length("категории", 1)] = ?::int
  and coalesce("контрагент/id", 0)=?
order by "дата"
;

@@ строка отчета/всего/все контрагенты
-- для вертикальной таблицы
-- развернуть
select "категории"["level"+1] as "category", sum("сумма") as sum
from (
select *,
  idx("категории", ?::int) as level
from "tmp"."{%= $temp_view_name %}"
where ?::int = any("категории")
  and coalesce("контрагент/id", 0)=?
) q
group by "категории"["level"+1]
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
DROP VIEW IF EXISTS "движение ДС/внешние платежи";
CREATE OR REPLACE VIEW "движение ДС/внешние платежи" as
-- контрагенты и сотрудники
select m.id, m.ts, m."дата", m."сумма",
  sign("сумма"::numeric) as "sign", ---to_char("дата", ---) as "код интервала", to_char("дата", ---) as "интервал",
  "категории/родители узла/id"(c.id, true) as "категории",
  "категории/родители узла/title"(c.id, false) as "категория",
  k.title as "контрагент", k.id as "контрагент/id",
  w2.id as "кошелек2", --- w2.id
  array_to_string(pp.names, ' ') as "профиль", pp.id as "профиль/id",
  array[[w."проект", w.title], [w2."проект", w2.title]]::text[][] as "кошельки", --- 
  array[[w."проект/id", w.id], [w2."проект/id", w2.id]]::int[][] as "кошельки/id" ---
from 
  {%= $dict->render('внешние платежи/from') %}
---where w2.id is null --- отсечь внутр
;

DROP VIEW IF EXISTS "движение ДС/внутр перемещения";
CREATE OR REPLACE VIEW "движение ДС/внутр перемещения" as
select m.id, m.ts, m."дата", -1*m."сумма" as "сумма",
  -1*sign("сумма"::numeric) as "sign", ---to_char("дата", ---) as "код интервала", to_char("дата", ---) as "интервал",
  "категории/родители узла/id"(c.id, true) as "категории",
  "категории/родители узла/title"(c.id, false) as "категория",
  null::text as "контрагент", null::int as "контрагент/id",
  w2.id as "кошелек2",
  null::text as "профиль", null::int as "профиль/id",
  array[[w2."проект", w2.title] , [w."проект", w.title]]::text[][] as "кошельки", -- переворот кошельков
  array[[w2."проект/id", w2.id] , [w."проект/id", w.id]]::int[][] as "кошельки/id"
from 
  {%= $dict->render('внутренние перемещения/from') %}
;

DROP VIEW IF EXISTS "движение ДС/расчеты по сотрудникам";
CREATE OR REPLACE VIEW "движение ДС/расчеты по сотрудникам" as
-- только сотрудники
select m.id, m.ts, m."дата", m."сумма",
  sign("сумма"::numeric) as "sign", ---to_char("дата", ---) as "код интервала", to_char("дата", ---) as "интервал",
  "категории/родители узла/id"(c.id, true) as "категории",
  "категории/родители узла/title"(c.id, false) as "категория",
  null::text as "контрагент", null::int as "контрагент/id",
  null::int as "кошелек2",
  array_to_string(pp.names, ' ') as "профиль", pp.id as "профиль/id",
  array[[w."проект", w.title]]::text[][] as "кошельки",
  array[[w."проект/id", w.id]]::int[][] as "кошельки/id"
from 
  {%= $dict->render('расчеты по сотрудникам/from') %}
;