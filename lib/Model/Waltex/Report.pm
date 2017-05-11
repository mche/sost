package Model::Waltex::Report;
use Mojo::Base 'Model::Base';
#~ use Mojo::Util qw(dumper);

#~ has sth_cached => 1;
my $main_table ="движение денег";

sub new {
  state $self = shift->SUPER::new(@_);
  $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  #~ $self->dbh->do($self->sth('таблицы'));
  #~ $self->dbh->do($self->sth('функции'));
  return $self;
}

sub движение_интервалы {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  $self->dbh->selectall_arrayref($self->sth('движение/интервалы'), {Slice=>{}}, $param->{'проект'}, @{$param->{'даты'}},);
}

sub движение_итого_интервалы {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  $self->dbh->selectall_arrayref($self->sth('движение итого/интервалы'), {Slice=>{}}, $param->{'проект'}, @{$param->{'даты'}},);
}

sub всего {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_hashref($self->sth('движение всего'), 'sign', undef, $param->{'проект'}, @{$param->{'даты'}},);
  
}

sub итого {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectrow_array($self->sth('движение итого/всего'), undef, $param->{'проект'}, @{$param->{'даты'}},);
  
}

1;

__DATA__




@@ движение всего
select case when "sign" > 0 then 'приход' else 'расход' end as "sign",
  sum as "всего"
from (
select sign("сумма"::numeric) as sign, sum("сумма"*sign("сумма"::numeric)) as sum
from "кошельки" w
  join refs rp on w.id=rp.id2 --к проекту
  join refs rm on w.id=rm.id1-- к деньгам
  join "движение денег" m on m.id=rm.id2
where rp.id1=? -- проект
  and m."дата" between ?::date and ?::date
group by sign("сумма"::numeric)
) s
;

@@ движение/интервалы
-- колонки
select case when "sign" > 0 then 'приход' else 'расход' end as "sign", "интервал", "код интервала", sum("сумма" * "sign") as sum
from (
select m.*, sign("сумма"::numeric) as "sign", to_char("дата", 'TMmonth YY') as "интервал", to_char("дата", 'mmYYYY') as "код интервала"
from "кошельки" w
  join refs rp on w.id=rp.id2 --к проекту
  join refs rm on w.id=rm.id1-- к деньгам
  join "движение денег" m on m.id=rm.id2
where rp.id1=? -- проект
  and m."дата" between ?::date and ?::date
) t
group by "sign", "интервал", "код интервала"
;

@@ движение итого/всего
select sum("сумма")
from "кошельки" w
  join refs rp on w.id=rp.id2 --к проекту
  join refs rm on w.id=rm.id1-- к деньгам
  join "движение денег" m on m.id=rm.id2
where rp.id1=? -- проект
  and m."дата" between ?::date and ?::date
;

@@ движение итого/интервалы
-- итоговая строка
select "интервал", "код интервала", sum("сумма") as sum
from (
select m.*, to_char("дата", 'TMmonth YY') as "интервал", to_char("дата", 'mmYYYY') as "код интервала"
from "кошельки" w
  join refs rp on w.id=rp.id2 --к проекту
  join refs rm on w.id=rm.id1-- к деньгам
  join "движение денег" m on m.id=rm.id2
where rp.id1=? -- проект
  and m."дата" between ?::date and ?::date
) t
group by "интервал", "код интервала"
;

