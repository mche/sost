package Model::Waltex::Report;
use Mojo::Base 'Model::Base';
#~ use Mojo::Util qw(dumper);

has [qw(app)];
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
  
  my @union = ();# дополнительные юнионы
  
  push @union, 'снимок диапазона/union/внутр перемещения'
    unless $param->{'контрагент'} || $param->{'все контрагенты'} || $param->{'профиль'} || $param->{'все профили'};
    
  push @union, 'снимок диапазона/union/начисления сотрудникам'
    if $param->{'профиль'} || $param->{'все профили'};
    
  $self->dbh->do($self->sth('снимок диапазона', temp_view_name=>$self->temp_view_name, union=>\@union), undef, (@{$param->{'интервал'} || [undef, undef]}, @{$param->{'даты'}}, ($param->{'проект'}) x 2,  ($param->{'кошелек'}) x 2, ($param->{'контрагент'}) x 3, $param->{'все контрагенты'}, ($param->{'профиль'}) x 3, $param->{'все профили'},) x (1+scalar @union) );
  #~ $self->app->log->debug("снимок_диапазона");
}

sub движение_интервалы_столбцы {# столбцы
  my $self = shift;
  $self->dbh->selectall_arrayref($self->sth('движение/интервалы/столбцы', temp_view_name=>$self->temp_view_name), {Slice=>{}}, );# $param->{'проект'}, @{$param->{'даты'}},
}

sub движение_интервалы_строки {
  my $self = shift;
  $self->dbh->selectall_hashref($self->sth('движение/интервалы/строки', temp_view_name=>$self->temp_view_name), 'key', );# $param->{'проект'}, @{$param->{'даты'}},
}

sub движение_все_кошельки {
  my $self = shift;
  $self->dbh->selectall_hashref($self->sth('движение/все кошельки', temp_view_name=>$self->temp_view_name), 'key', );
  
}

sub движение_все_контрагенты {
  my $self = shift;
  $self->dbh->selectall_hashref($self->sth('движение/все контрагенты', temp_view_name=>$self->temp_view_name), 'key', );
  
}

sub движение_все_профили {
  my $self = shift;
  $self->dbh->selectall_hashref($self->sth('движение/все профили', temp_view_name=>$self->temp_view_name), 'key', );
  
}

sub движение_итого_интервалы {
  my $self = shift;
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

sub остатки_период {# общие осттатки строка
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  
  my @union = ();
  
  push @union, 'движение и остатки/union/внутренние перемещения';
    #~ unless $param->{'контрагент'} || $param->{'все контрагенты'} || $param->{'профиль'} || $param->{'все профили'};
  
  #~ push @union, 'движение и остатки/union/начисления сотрудникам'
    #~ if $param->{'профиль'} || $param->{'все профили'};
  
  my $r = $self->dbh->selectrow_hashref($self->sth('остатки/период', union=>\@union,), undef, ($param->{'даты'}[0], @{$param->{'даты'}}, ($param->{'проект'}) x 2, ($param->{'кошелек'}) x 2, ) x (1+scalar @union));# не отсекать контрагентов и сотрудников  ($param->{'контрагент'}) x 4,  ($param->{'профиль'}) x 4,
  #~ $self->app->log->debug("остатки_период");
  return $r;
}


sub всего_остатки_все_кошельки {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  
  my @union = ();
  
  push @union, 'движение и остатки/union/внутренние перемещения';
    #~ unless $param->{'контрагент'} || $param->{'все контрагенты'} || $param->{'профиль'} || $param->{'все профили'};
  
  #~ push @union, 'движение и остатки/union/начисления сотрудникам'
    #~ if $param->{'профиль'} || $param->{'все профили'};

  $self->dbh->selectall_arrayref($self->sth('всего и остатки/все кошельки', union=>\@union,), {Slice=>{}}, ($param->{'даты'}[0], @{$param->{'даты'}}, ($param->{'проект'}) x 2, ($param->{'кошелек'}) x 2,) x (1+scalar @union)); # не отсекать контров и сотр  ($param->{'контрагент'}) x 4, ($param->{'профиль'}) x 4,
}

sub всего_остатки_все_контрагенты {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  
  my @union = ();
  
  #~ push @union, 'движение и остатки/union/внутренние перемещения'
    #~ unless $param->{'контрагент'} || $param->{'все контрагенты'} || $param->{'профиль'} || $param->{'все профили'};
  
  #~ push @union, 'движение и остатки/union/начисления сотрудникам'
    #~ if $param->{'профиль'} || $param->{'все профили'};

$self->dbh->selectall_arrayref($self->sth('всего и остатки/все контрагенты', union=>\@union,), {Slice=>{}}, ($param->{'даты'}[0], @{$param->{'даты'}}, ($param->{'проект'}) x 2, ($param->{'кошелек'}) x 2, ) x (1+scalar @union)); # не отсекать контров и сотр  ($param->{'контрагент'}) x 4, ($param->{'профиль'}) x 4,
}

sub всего_остатки_все_профили {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  
  my @union = ();
  
  #~ push @union, 'движение и остатки/union/внутренние перемещения'
    #~ unless $param->{'контрагент'} || $param->{'все контрагенты'} || $param->{'профиль'} || $param->{'все профили'};
  
  push @union, 'движение и остатки/union/начисления сотрудникам';
    #~ if $param->{'профиль'} || $param->{'все профили'};

  $self->dbh->selectall_arrayref($self->sth('всего и остатки/все профили', union=>\@union,), {Slice=>{}}, ($param->{'даты'}[0], @{$param->{'даты'}}, ($param->{'проект'}) x 2, ($param->{'кошелек'}) x 2, ) x (1+scalar @union)); # не отсекать контров и сотр  ($param->{'контрагент'}) x 4, ($param->{'профиль'}) x 4,
}

sub строка_отчета_интервалы_столбцы {
  my $self = shift;
  
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_arrayref($self->sth('строка отчета/интервалы/столбцы', temp_view_name=>$self->temp_view_name), {Slice=>{}}, ($param->{"категория"}) x 2, $param->{sign},);#
}


sub строка_отчета_интервалы_строки {
  my $self = shift;
  
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_arrayref($self->sth('строка отчета/интервалы/строки', temp_view_name=>$self->temp_view_name), {Slice=>{}}, ($param->{"категория"}) x 2, $param->{"код интервала"} || $param->{key} ,);#
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

sub строка_отчета_интервалы_все_профили {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_arrayref($self->sth('строка отчета/интервалы/все профили', temp_view_name=>$self->temp_view_name), {Slice=>{}}, ($param->{"категория"}) x 2, $param->{key} ,);#
}

sub строка_отчета_всего_столбцы {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_hashref($self->sth('строка отчета/всего/столбцы', temp_view_name=>$self->temp_view_name), 'category', undef, ($param->{"категория"}) x 2, $param->{sign},); 
}

sub строка_отчета_всего_строки {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_hashref($self->sth('строка отчета/всего/строки', temp_view_name=>$self->temp_view_name), 'category', undef, ($param->{"категория"}) x 2, $param->{"код интервала"} || $param->{key},); 
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

sub строка_отчета_всего_все_профили {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_hashref($self->sth('строка отчета/всего/все профили', temp_view_name=>$self->temp_view_name), 'category', undef, ($param->{"категория"}) x 2, $param->{key},); 
}

sub строка_отчета_интервалы_позиции_столбцы {
  my $self = shift;
  
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_arrayref($self->sth('строка отчета/интервалы/позиции/столбцы', temp_view_name=>$self->temp_view_name), {Slice=>{}}, $param->{"категория"}, $param->{sign},);#
}


sub строка_отчета_интервалы_позиции_строки {
  my $self = shift;
  
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_arrayref($self->sth('строка отчета/интервалы/позиции/строки', temp_view_name=>$self->temp_view_name), {Slice=>{}}, $param->{"категория"}, $param->{"код интервала"} || $param->{key},);#
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

sub строка_отчета_интервалы_позиции_все_профили {
  my $self = shift;
  
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_arrayref($self->sth('строка отчета/интервалы/позиции/все профили', temp_view_name=>$self->temp_view_name), {Slice=>{}}, $param->{"категория"}, $param->{key},);#
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
  

@@ движение по сотрудникам/from
-- для view (в расчетах включено во внешние платежи как $dict->render('профиль'))
  ({%= $dict->render('проект/кошелек') %}) w
  join "движение денег" m on m.id=w._ref
  join ({%= $dict->render('категория') %}) c on m.id=c._ref
  join ({%= $dict->render('профиль') %}) pp on pp._ref = m.id

@@ проект/кошелек
select w.*, p.id as "проект/id", p.name as "проект", rm.id2 as _ref
from "проекты" p
  join refs rp on p.id=rp.id1
  join "кошельки" w on w.id=rp.id2
  join refs rm on w.id=rm.id1 -- к деньгам

@@ кошелек2
  -- обратная связь с внутренним перемещением
  select w.*, rm.id1 as _ref, p.name as "проект", p.id as "проект/id"
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
--- юнионы: внешние(контрагенты+сотрудники+внутр кошел) внутр(другой кошелек) начисления из табеля(приходы сотрудникам)
-- остатки тут не вычисляются поэтому можно отсекать
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
  and (?::int is null or "контрагент/id"=?) -- один контрагент
  and ((?::int is null and ?::int is null) or ("профиль/id" is null and "кошелек2" is null)) -- [один контрагент] или [все контрагенты] отсекает сотрудников и внутр кошел
  and (?::int is null or "профиль/id"=?) -- один сотрудник
  and ((?::int is null and ?::int is null) or ("профиль/id" is not null and "кошелек2" is null)) -- [один сотрудник] или [все сотрудники] отсекает контрагентов и внутр кошел



{%= join qq'\n', map(qq'\n union all \n'.$dict->render($_), @$union) %}

--- union all -- внутренние перемещения по кошелькам
--- union all -- расчеты по сотрудникам во внешнех расчетах!
--- union all --- приходы начисления сотрудникам

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

@@ снимок диапазона/union/внутр перемещения
select *,
  to_char("дата", ?) as "код интервала", to_char("дата", ?) as "интервал"
from 
  "движение ДС/внутр перемещения" --veiw

where 
  "дата" between ?::date and ?::date
  and ((?::int is null or "кошельки/id"[1][1]=?) and (?::int is null or "кошельки/id"[1][2]=?)) -- проект или кошелек
  and (?::int is null or ?::int is null) -- один контрагент отсекает внутренние перемещения (двойная заглушка одного)
  and (?::int is null and ?::int is null) --- [один контрагент] или [все контрагенты] отсекает внутренние перемещения
  and (?::int is null or ?::int is null) -- один сотрудник отсекает внутренние перемещения (двойная заглушка одного)
  and (?::int is null and ?::int is null) --- [один сотрудник] или [все сотрудники] отсекает внутренние перемещения

@@ снимок диапазона/union/начисления сотрудникам
select *,
  to_char("дата", ?) as "код интервала", to_char("дата", ?) as "интервал"
from 
  "движение ДС/начисления сотрудникам" --- view
  
where
  "дата" between ?::date and ?::date
  and ((?::int is null or "кошельки/id"[1][1]=?) and (?::int is null or "кошельки/id"[1][2]=?)) -- проект или кошелек
  and (?::int is null or "контрагент/id"=?) -- один контрагент
  and ((?::int is null and ?::int is null) or ("профиль/id" is null and "кошелек2" is null)) -- [один контрагент] или [все контрагенты] отсекает сотрудников и внутр кошел
  and (?::int is null or "профиль/id"=?) -- один сотрудник
  and ((?::int is null and ?::int is null) or ("профиль/id" is not null and "кошелек2" is null)) -- [один сотрудник] или [все сотрудники] отсекает контрагентов и внутр кошел


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
---where
---  "профиль/id" is null -- отсекать по сотрудникам
---  and "кошелек2" is null -- отсекать внутренние перемещения
) s
group by "title", "key"
;

@@ всего/все профили
-- вертикальная сводная
-- суммы по строкам
select title, "key", sum("сумма") as "всего"
from (
select "профиль" as title,  "профиль/id" as "key",
  "сумма"
from "tmp"."{%= $temp_view_name %}"
---where
--  "профиль/id" is not null -- отсекать контрагентов
--  and "кошелек2" is null -- отсекать внутренние перемещения
) s
group by "title", "key"
;


@@ движение/интервалы/столбцы
-- гориз таблица
-- колонки
select case when "sign" > 0 then 'приход' else 'расход' end as "title", "sign", "интервал", "код интервала", sum("сумма" * "sign") as sum
from "tmp"."{%= $temp_view_name %}"
group by "sign", "интервал", "код интервала"
order by "sign" desc, "код интервала"
;

@@ движение/интервалы/строки
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
--where
--  "профиль/id" is null -- отсекать по сотрудникам
--  and "кошелек2" is null -- отсекать внутренние перемещения
) s
group by "sign", "title",  "key"
---order by "title", "sign" desc;
;

@@ движение/все профили
-- вертикальная сводная
--- основное тело сумм
select "sign", "title",  "key", sum("sum") as "sum"
from (
select "sign", "профиль" as "title", array_to_string(array["профиль/id", "sign"], ':') as "key", "сумма" * "sign" as "sum"
from "tmp"."{%= $temp_view_name %}"
--where
--  "профиль/id" is not null -- отсекать по сотрудникам
--  and "кошелек2" is null -- отсекать внутренние перемещения
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
/* не отсекать для фильтров контрагентов и профилей и не показывать в них глобальные остатки
  and (::int is null or coalesce("контрагент/id", 0)=) -- контрагент
  and (::int is null or (coalesce(::int, 0)::boolean and "профиль/id" is null)) -- контрагент отсекает сотрудников
  and (::int is null or "профиль/id"=) -- один сотрудник
  and (::int is null or (coalesce(::int, 0)::boolean and "профиль/id" is not null)) -- сотрудник отсекает контрагентов
*/

{%= join qq'\n', map(qq'\n union all \n'.$dict->render($_), @$union) %}

---UNION ALL -- внутренние перемещения
---UNION ALL -- начисления-приходы сотрудникам


@@ движение и остатки/union/внутренние перемещения
select *,
  case when "дата" < ?::date then "сумма" else 0::money end as "сумма1", -- первая дата
  "сумма" as "сумма2",
  case when "дата" >= ?::date then "сумма" else 0::money end as "сумма движения" -- первая дата
  
from 
  "движение ДС/внутр перемещения" --veiw

where 
  "дата" < (?::date + interval '1 days') -- вторая дата
  and ((?::int is null or "кошельки/id"[1][1]=?) and (?::int is null or "кошельки/id"[1][2]=?)) -- проект или кошелек
/* не отсекать для фильтров контрагентов и профилей и не показывать в них глобальные остатки
  and (::int is null or coalesce(::int, -1) = -1) -- контрагент отсекает внутренние перемещения
  and (::int is null or ::int is not null) --- заглушка симметричного биндинга
  and (::int is null or coalesce(::int, -1) = -1) -- сотрудник отсекает внутренние перемещения
  and (::int is null or ::int is not null) --- заглушка симметричного биндинга
*/

@@ движение и остатки/union/начисления сотрудникам
-- только приходы из табеля
select *,
  case when "дата" < ?::date then "сумма" else 0::money end as "сумма1", -- первая дата
  "сумма" as "сумма2",
  case when "дата" >= ?::date then "сумма" else 0::money end as "сумма движения" -- первая дата
  
from 
  "движение ДС/начисления сотрудникам" --veiw

where 
  "дата" < (?::date + interval '1 days') -- вторая дата
  and ((?::int is null or "кошельки/id"[1][1]=?) and (?::int is null or "кошельки/id"[1][2]=?)) -- проект или кошелек


@@ всего и остатки/все кошельки
-- вертикальная сводная
--- для дат внутри периода не катит!!
--- только две даты начало и конец периода!
--- и начало и конец
select 
  "кошельки"[1][1:2] as title, "кошельки/id"[1][1:2] as "кошельки/id", array_to_string("кошельки/id"[1][1:2], ':') as "key",
  sum("сумма1") as "сальдо1", sum("сумма2") as "сальдо2", sum("сумма движения") as "всего"
from 
  ({%= $dict->render('движение и остатки', union=>$union) %}) o
group by "кошельки"[1][1:2], "кошельки/id"[1][1:2]
order by 1--- array_to_string("кошельки"[1][1:2], ':')
;

@@ всего и остатки/все контрагенты
-- вертикальная сводная
--- для дат внутри периода не катит!!
--- только две даты начало и конец периода!
--- и начало и конец
select 
  coalesce("контрагент", '_пусто_') as title, coalesce("контрагент/id", 0) as "key", coalesce("контрагент/id", 0) as "контрагент/id",
  sum("сумма1") as "сальдо1", sum("сумма2") as "сальдо2", sum("сумма движения") as "всего"
from 
  ({%= $dict->render('движение и остатки', union=>$union) %}) o
where
  "профиль/id" is null -- отсекать по сотрудникам
  and "кошелек2" is null -- отсекать внутренние перемещения
group by coalesce("контрагент", '_пусто_'), coalesce("контрагент/id", 0)
order by 1 --- title
;

@@ всего и остатки/все профили
-- вертикальная сводная
--- для дат внутри периода не катит!!
--- только две даты начало и конец периода!
--- и начало и конец
select 
  "профиль" as title, "профиль/id" as "key",
  sum("сумма1") as "сальдо1", sum("сумма2") as "сальдо2", sum("сумма движения") as "всего"
from 
  ({%= $dict->render('движение и остатки', union=>$union) %}) o
where
  "профиль/id" is not null -- отсекать по контрагентам
  and "кошелек2" is null -- отсекать внутренние перемещения
group by "профиль", "профиль/id"
order by 1 --- title
;

@@ остатки/период
--- для дат внутри периода не катит!!
--- только две даты начало и конец периода!
--- и начало и конец
select sum("сумма1") as "сальдо1", sum("сумма2") as "сальдо2", sum("сумма движения") as "всего"
from 
  ({%= $dict->render('движение и остатки', union=>$union) %}) o
;


@@ строка отчета/интервалы/столбцы
--- гориз табл
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

@@ строка отчета/интервалы/строки
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
where
  ?::int = any("категории")
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
where
  ?::int = any("категории")
  and coalesce("контрагент/id", 0)=?
) q
group by "level", "категория"["level"], "категории"["level"+1], "sign"
having "категории"["level"+1] is not null
--) q
---  join "категории" c on q."категория"=c.id
order by 2
;

@@ строка отчета/интервалы/все профили
-- для вертикальной таблицы
-- развернуть
---select q.*, c.title ---заголовок категории
---from (
select "level", "категория"["level"] as title, "категории"["level"+1] as "категория", "sign", sum("сумма" * "sign") as sum
from (
select *,
  idx("категории", ?::int) as level
from "tmp"."{%= $temp_view_name %}"
where
  ?::int = any("категории")
  and "профиль/id"=?
) q
group by "level", "категория"["level"], "категории"["level"+1], "sign"
having "категории"["level"+1] is not null
--) q
---  join "категории" c on q."категория"=c.id
order by 2
;

@@ строка отчета/всего/столбцы
-- для гориз табл
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

@@ строка отчета/всего/строки
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

@@ строка отчета/интервалы/позиции/столбцы
-- для гориз табл
-- конечная детализация позиций
select *, to_char("дата", 'DD.MM.YY') as "дата_формат", "сумма" * "sign" as sum
from "tmp"."{%= $temp_view_name %}"
where 
  "категории"[array_length("категории", 1)] = ?::int
  and "sign"=?
order by "дата" 
;

@@ строка отчета/интервалы/позиции/строки
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

@@ строка отчета/интервалы/позиции/все профили
--- для вертикальной таблицы
-- конечная детализация позиций
select *, to_char("дата", 'DD.MM.YY') as "дата_формат", "сумма" * "sign" as sum
from "tmp"."{%= $temp_view_name %}"
where ---!::int = any("категории")
  "категории"[array_length("категории", 1)] = ?::int
  and "профиль/id"=?
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
where
  ?::int = any("категории")
  and coalesce("контрагент/id", 0)=?
) q
group by "категории"["level"+1]
;

@@ строка отчета/всего/все профили
-- для вертикальной таблицы
-- развернуть
select "категории"["level"+1] as "category", sum("сумма") as sum
from (
select *,
  idx("категории", ?::int) as level
from "tmp"."{%= $temp_view_name %}"
where
  ?::int = any("категории")
  and "профиль/id"=?
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
---DROP VIEW IF EXISTS "движение ДС/внешние платежи";
CREATE OR REPLACE VIEW "движение ДС/внешние платежи" as
-- контрагенты и сотрудники
select m.id, m.ts, m."дата", m."сумма",
  sign("сумма"::numeric) as "sign", ---to_char("дата", ---) as "код интервала", to_char("дата", ---) as "интервал",
  "категории/родители узла/id"(c.id, true) as "категории",
  "категории/родители узла/title"(c.id, false) as "категория",
  k.title as "контрагент", k.id as "контрагент/id",
  w2.id as "кошелек2", --- left join
  array_to_string(pp.names, ' ') as "профиль", pp.id as "профиль/id",
  array[[w."проект", w.title], [w2."проект", w2.title]]::text[][] as "кошельки", ---  проект+кошелек, ...
  array[[w."проект/id", w.id], [w2."проект/id", w2.id]]::int[][] as "кошельки/id" ---  проект+кошелек, ...
  ,m."примечание"
from 
  {%= $dict->render('внешние платежи/from') %}
---where w2.id is null --- отсечь внутр
;

---DROP VIEW IF EXISTS "движение ДС/внутр перемещения";
CREATE OR REPLACE VIEW "движение ДС/внутр перемещения" as
select m.id, m.ts, m."дата", -1*m."сумма" as "сумма",
  -1*sign("сумма"::numeric) as "sign", ---to_char("дата", ---) as "код интервала", to_char("дата", ---) as "интервал",
  "категории/родители узла/id"(c.id, true) as "категории",
  "категории/родители узла/title"(c.id, false) as "категория",
  null::text as "контрагент", null::int as "контрагент/id",
  w2.id as "кошелек2",
  null::text as "профиль", null::int as "профиль/id",
  array[[w2."проект", w2.title] , [w."проект", w.title]]::text[][] as "кошельки", -- переворот кошельков
  array[[w2."проект/id", w2.id] , [w."проект/id", w.id]]::int[][] as "кошельки/id"  -- переворот кошельков
  ,m."примечание"
from 
  {%= $dict->render('внутренние перемещения/from') %}
;

---DROP VIEW IF EXISTS "движение ДС/по сотрудникам";
CREATE OR REPLACE VIEW "движение ДС/по сотрудникам" as
-- только сотрудники
select m.id, m.ts, m."дата", m."сумма",
  sign("сумма"::numeric) as "sign", ---to_char("дата", ---) as "код интервала", to_char("дата", ---) as "интервал",
  c.id as "категория/id",
  "категории/родители узла/id"(c.id, true) as "категории/id",
  "категории/родители узла/title"(c.id, false) as "категории",
  null::text as "контрагент", null::int as "контрагент/id",
  null::int as "кошелек2",
  array_to_string(pp.names, ' ') as "профиль", pp.id as "профиль/id",
  array[[w."проект", w.title]]::text[][] as "кошельки",
  array[[w."проект/id", w.id]]::int[][] as "кошельки/id",
  m."примечание"
  ---'(' || w."проект" || ': ' || w.title || ') ' || coalesce(m."примечание", ''::text) as "примечание"
from 
  {%= $dict->render('движение по сотрудникам/from') %}
;

---DROP VIEW IF EXISTS "движение ДС/начисления по табелю" CASCADE;
CREATE OR REPLACE VIEW "движение ДС/начисления по табелю" as
-- только приходы-начисления из табеля(view "табель/начисления/объекты" в модели Model::TimeWork.pm)
--- ПЛЮС суточные (без объекта)
--- + отпускные (без объекта)
select id, ts, "дата", "сумма",
  1::numeric as "sign",
  "категории/родители узла/id"(123439::int, true) as "категории",
  "категории/родители узла/title"(123439::int, false) as "категория",
  null::text as "контрагент", null::int as "контрагент/id",
  null::int as "кошелек2",
  "профиль", "профиль/id",
  ---! вместо проект+кошелек  - проект+объект
  array[["проект", "объект"]]::text[][] as "кошельки", --- проект+объект, ...
  array[["проект/id", "объект/id"]]::int[][] as "кошельки/id",  --- проект+объект, ...
  ---'(' || "проект" || ': ' || "объект" || ') ' || coalesce("примечание", ''::text) as "примечание"
  "примечание"
from 
  "табель/начисления/объекты" -- view  в модели Model::TimeWork.pm

union all --- переработка без объекта!

select id, ts, "дата", "сумма",
  1::numeric as "sign",
  "категории/родители узла/id"(123441::int, true) as "категории", -- категория з/п переработка
  "категории/родители узла/title"(123441::int, false) as "категория", -- категория з/п переработка
  null::text as "контрагент", null::int as "контрагент/id",
  null::int as "кошелек2",
  "профиль", "профиль/id",
  ---! вместо проект+кошелек  - проект+объект
  null, ---array[[null, null]]::text[][] as "кошельки", --- проект+объект, ...
  null, ---array[[0, 0]]::int[][] as "кошельки/id",  --- проект+объект, ...
  "примечание"
from 
  "табель/начисления/переработка" -- view  в модели Model::TimeWork.pm

union all --- суточные без объекта!

select id, ts, "дата", "сумма",
  1::numeric as "sign",
  "категории/родители узла/id"(57541::int, true) as "категории", -- категория з/п/суточные
  "категории/родители узла/title"(57541::int, false) as "категория", -- категория з/п/суточные
  null::text as "контрагент", null::int as "контрагент/id",
  null::int as "кошелек2",
  "профиль", "профиль/id",
  ---! вместо проект+кошелек  - проект+объект
  null, ---array[[null, null]]::text[][] as "кошельки", --- проект+объект, ...
  null, ---array[[0, 0]]::int[][] as "кошельки/id",  --- проект+объект, ...
  "примечание"
from 
  "табель/начисления/суточные" -- view  в модели Model::TimeWork.pm

union all --- отпускные тоже без объекта!

select id, ts, "дата", "сумма",
  1::numeric as "sign",
  "категории/родители узла/id"(104845::int, true) as "категории", -- категория з/п/отпускные
  "категории/родители узла/title"(104845::int, false) as "категория", -- категория з/п/отпускные
  null::text as "контрагент", null::int as "контрагент/id",
  null::int as "кошелек2",
  "профиль", "профиль/id",
  ---! вместо проект+кошелек  - проект+объект
  null, ---array[[null, null]]::text[][] as "кошельки", --- проект+объект, ...
  null, ---array[[0, 0]]::int[][] as "кошельки/id",  --- проект+объект, ...
  "примечание"
from 
  "табель/начисления/отпускные" -- view  в модели Model::TimeWork.pm
;



DROP VIEW IF EXISTS "движение ДС/начисления сотрудникам";
CREATE OR REPLACE VIEW "движение ДС/начисления сотрудникам" as
/*здесь только начисления по табелю и расчетные начисления
без кошельков!
*/

select * from "движение ДС/начисления по табелю"

union all --- расчетные начисления  (закрытого расчета)
-- расчетные удержания уйдут в одну цифру - выплачено
-- но удержание по категории штраф(74315) тоже тут как деньги

select m.id, m.ts, m."дата", m."сумма",
  sign("сумма"::numeric) as "sign", 
  "категории/родители узла/id"(c.id, true) as "категории",
  "категории/родители узла/title"(c.id, false) as "категория",
  null::text as "контрагент", null::int as "контрагент/id",
  null::int as "кошелек2",
  array_to_string(p.names, ' ') as "профиль", p.id as "профиль/id",
  null, ---array[[null, null]]::text[][] as "кошельки", --- проект+объект, ...
  array[[pr.id, null]]::int[][] as "кошельки/id",  --- проект 0 -- запись для всех проектов
  m."примечание"

from "движение денег" m
  join refs rc on m.id=rc.id2
  join "категории" c on c.id=rc.id1
  
  join refs rp on m.id=rp.id1
  join "профили" p on p.id=rp.id2
  
  left join (
    select p.*, r.id2
    from "проекты" p
      join refs r on p.id=r.id1
  ) pr on p.id=pr.id2

--- 74315 это категория штрафа будет тоже как деньги
where (sign(m."сумма"::numeric)=1 or c.id=74315) --- только (+) начисления, (-)расходы будут одной цифрой - выплата

  and exists (--- закрыли расчет привязали строки денег к строке расчета (табель)
    select t.*
      from refs rm 
        join "табель" t on t.id=rm.id2
        join refs rp on t.id=rp.id2
      
      where rm.id1= m.id
        and rp.id1=p.id -- профиль
        and date_trunc('month', t."дата") = date_trunc('month', m."дата")
        and t."значение"='РасчетЗП'
        and t."коммент" is not null
  )
;
