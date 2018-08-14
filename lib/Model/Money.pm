package Model::Money;
use Mojo::Base 'Model::Base';
#~ use Mojo::Util qw(dumper);

#~ has sth_cached => 1;
my $main_table ="движение денег";

sub new {
  my $self = shift->SUPER::new(@_);
  $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  
  return $self;
}

sub init {
  my $self = shift;
  $self->dbh->do($self->sth('таблицы'));
  #~ $self->dbh->do($self->sth('функции'));
  
}

sub сохранить {
  my $self = shift;
  my $data = ref $_[0] ? shift : {@_};
  
  my $prev = $self->позиция($data->{id})
    if $data->{id};#$self->позиция($r->{id}, defined($data->{'кошелек2'}))
  #~ my $tx_db = $self->dbh->begin;
  #~ local $self->{dbh} = $tx_db; # временно переключить модели на транзакцию
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, $main_table, ["id"], $data);
  $prev ||= $self->позиция($r->{id});
  
  map {# прямые связи
    if ($data->{$_}) {
      my $rr= $self->связь_получить($prev->{"$_/id"}, $r->{id});
      $r->{"связь/$_"} = $rr && $rr->{id}
        ? $self->связь_обновить($rr->{id}, $data->{$_}, $r->{id})
        : $self->связь($data->{$_}, $r->{id});
    } elsif ($_ ~~ qw'контрагент объект') {# можно чикать/нет
      $self->связь_удалить(id1=>$prev->{"$_/id"}, id2=>$r->{id});
    }
  } qw(категория кошелек контрагент объект);
  
  map {# обратная связь
    if ($data->{$_}) {
      my $rr= $self->связь_получить($r->{id}, $prev->{"$_/id"});
      $r->{"обратная связь/$_"} = $rr && $rr->{id}
        ? $self->связь_обновить($rr->{id}, $r->{id}, $data->{$_},)
        : $self->связь($r->{id}, $data->{$_}, );
    } else {
      $self->связь_удалить(id1=>$r->{id}, id2=>$prev->{"$_/id"}, );
    }
  } qw(кошелек2 профиль);
  
  #~ $tx_db->commit;

  return $self->позиция($r->{id});#позиция($r->{id}, defined($data->{'кошелек2'}))
  
}

sub позиция {
  my ($self, $id) = @_; # $wallet2 - флажок внутреннего перемещения
  $self->dbh->selectrow_hashref($self->sth('список или позиция'), undef, (undef) x 2, ($id) x 2,);
}

my %type = ("дата"=>'date', "сумма"=>'money');
sub список {
  my ($self, $project, $param) = @_;
  
  my $where = "";
  my @bind = (($project) x 2, (undef) x 2);
  
  
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
    $values[1] = 10000000000
      unless $values[1];
    $values[0] = 0
      unless $values[0];
    
    my $sign = $value->{sign};
    
    $where .= ($where ? " and " :  "where ") . sprintf(qq' ("%s" between ?::%s and ?::%s)', $key, ($type{$key}) x 2);
    push @bind, map {s/,/./g; s/[^\d\-\.]//g; $sign ? $sign*$_ : $_;}  (($sign && $sign < 0) ? reverse @values : @values);
    
  }
  
  if($param->{move}) {
    if ($param->{move}{id} eq 1){ # внешние контрагенты
      my $w2 = '"кошелек2/id" is null and "профиль/id" is null';
      $where .= $where ? "\n and $w2" : "where $w2";
    }
    elsif ($param->{move}{id} eq 2){ # внутр кошельки
      my $w2 = '"кошелек2/id" is not null';
      $where .= $where ? "\n and $w2" : "where $w2";
    }
    elsif ($param->{move}{id} eq 3){ # сотрудники
      my $w2 = '"профиль/id" is not null';
      $where .= $where ? "\n and $w2" : "where $w2";
    }
  } else {# все платежи
    
    
  }
  
  my $limit_offset = "LIMIT 100 OFFSET ".($param->{offset} // 0);
  
  my $r = $self->dbh->selectall_arrayref($self->sth('список или позиция', select => $param->{select} || '*', where=>$where, limit_offset=>$limit_offset), {Slice=>{}}, @bind);
  
}

sub удалить {
  my ($self, $id) = @_;
  $self->_delete($self->{template_vars}{schema}, $main_table, ["id"], {id=>$id});
}

sub расчеты_по_профилю {# история начислений и выплат по сотруднику
  my ($self, $param) = @_; #
  
  my $limit_offset = "LIMIT 100 OFFSET ".($param->{offset} // 0);
  
  my $profile = [ $param->{table}{"профиль"}{id}, ]
    if $param->{table} && $param->{table}{"профиль"} && $param->{table}{"профиль"}{ready};
  
  $profile = [ map $_->{id}, @{ $param->{table}{"профили"} } ]
    if $param->{table} && $param->{table}{"профили"};
  
  
  return $self->dbh->selectall_arrayref($self->sth('расчеты по профилю', select=>$param->{select} || '*', limit_offset=>$limit_offset), {Slice=>{},}, (($profile) x 2, ($param->{"проект"}{id}) x 2,) x 2);
}

sub баланс_по_профилю {# возможно на дату
  my $self = shift; #
  my $cb = ref $_[-1] eq 'CODE' ? pop : undef;
  my $param =  ref $_[0] ? shift : {@_};
  my ($date_expr, $date) = @{$param->{"дата"}}
    if ref $param->{"дата"} eq 'ARRAY';
  
  my $profile = [ $param->{"профиль"}{id}, ]
    if $param->{"профиль"};
  
  $profile = [ map $_->{id}, @{ $param->{"профили"} } ]
    if $param->{"профили"};
  
  return $self->dbh->selectrow_hashref($self->dict->render('баланс по профилю', date_expr=>$date_expr), undef, (($profile) x 2, ($date || $param->{"дата"}) x 2) x 2, $cb // ());
}


1;


__DATA__
@@ таблицы
create table IF NOT EXISTS "{%= $schema %}"."{%= $tables->{main} %}" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  "сумма" money not null,
  "дата" date not null,
  "примечание" text null
);
/*
Обязательные связи:
id1("категории")->id2("движение денег")
id1("кошелек")->id2("движение денег")

Прочие связи:
id1("контрагенты")->id2("движение денег") --- внешний платеж
id1("roles")->id2("движение денег") --- объект, если внешний платеж
id1("движение денег")->id2("кошелек") --- внутр перемещение
id1("движение денег")->id2("профиль") --- расчет с сотрудником

!!!!!!!!!!!!!!!!!!!!!
Эта таблица использ для зарплатных дополнительных начислений/удержаний для расчетов ЗП сотрудников
При этом, вместо обязательной связи id1("кошелек")->id2("движение денег") делается
обязательная связь id2("движение денег")->id1("профиль") (как расчет с сотрудником )
Поэтому эти записи (пока) не попадут в балансовые расчеты по сотрудникам и движению денег

Однако, когда закрывается зарплатный расчет, то к записям доп начислений/удержаний
делается связь id2("движение денег")->id2("табель": "значение"='РасчетЗП', "коммент"=<скорректир сумма к выплате> ...)
и тогда записи попадают в балансовые расчеты и сводки по деньгам (view "движение ДС/начисления сотрудникам")
*/

create index IF NOT EXISTS "idx/движение денег/дата" on "движение денег" ("дата");

@@ список или позиция
---
select {%= $select || '*' %} from (
select m.*,
  "формат даты"(m."дата") as "дата формат",
  timestamp_to_json(m."дата"::timestamp) as "@дата",
  ----to_char(m."дата", 'TMdy, DD TMmon' || (case when date_trunc('year', now())=date_trunc('year', m."дата") then '' else ' YYYY' end)) as "дата формат",
  c.id as "категория/id", "категории/родители узла/title"(c.id, false) as "категории",
  ca.id as "контрагент/id", ca.title as "контрагент",
  ob.id as "объект/id", ob.name as "объект",
  w2.id as "кошелек2/id", w2.title as "кошелек2",
  pp.id as "профиль/id", array_to_string(pp.names, ' ') as "профиль",
  w.id as "кошелек/id", w.title as "кошелек",
  w."проект", w."проект/id" -- надо

from  "{%= $schema %}"."{%= $tables->{main} %}" m

  join (
    select c.*, r.id2 as _ref
    from refs r join "категории" c on r.id1=c.id
  ) c on c._ref = m.id
  
  join (
    select distinct w.*, p.id as "проект/id", p."name" as "проект", rm.id2 as _ref
    from 
      "проекты" p -- надо
      join refs rp on p.id=rp.id1
      join "кошельки" w on w.id=rp.id2
      join refs rm on w.id=rm.id1
      where coalesce(?::int, 0)=0 or p.id=? -- все проекты или проект
  ) w on w._ref = m.id
  
  left join ({%= $dict->render('контрагент') %}) ca on ca._ref = m.id
  left join ({%= $dict->render('объект') %}) ob on ob._ref = m.id
  left join ({%= $dict->render('кошелек2') %}) w2 on w2._ref = m.id
  left join ({%= $dict->render('профиль') %}) pp on pp._ref = m.id

where (?::int is null or m.id =?)
) m
{%= $where || '' %}

order by "дата" desc, ts desc
{%= $limit_offset || '' %}
;

@@ контрагент
-- подзапрос
select c.*, r.id2 as _ref
from refs r
join "контрагенты" c on r.id1=c.id

@@ объект
-- подзапрос
select c.*, r.id2 as _ref
from refs r
join "roles" c on r.id1=c.id

@@ кошелек2
  -- обратная связь с внутренним перемещением
select distinct w.id, rm.id1 as _ref, p.name || ':' || w.title as title
from "проекты" p
  join refs r on p.id=r.id1
  join "кошельки" w on w.id=r.id2
  join refs rm on w.id=rm.id2 -- к деньгам

@@ профиль
--- сотрудник обратная связь
select p.*, r.id1 as _ref
from refs r
join "профили" p on r.id2=p.id

@@ расчеты по профилю
-- детализация в сводке табеля
-- список внедряется в компонент-таблицу waltex/money/table

select {%= $select || '*' %}
from (
select id, ts, "дата", timestamp_to_json("дата"::timestamp) as "@дата",
  ----to_char("дата", 'TMdy, DD TMmonth' || (case when date_trunc('year', now())=date_trunc('year', "дата") then '' else ' YYYY' end)) as "дата формат",
  "формат даты"("дата") as "дата формат",
  "сумма", sign, "категории", "категория/id",  --- "категории"[2] as "категория/id",
  array_to_string("кошельки", ': ') as "кошелек", "кошельки/id"[1][2] as "кошелек/id",
  "примечание", "профиль/id", "профиль", false as "начислено"
from "движение ДС/по сотрудникам" -- view приход/расход
where (? is null or "профиль/id"=any(?))
  and (coalesce(?::int, 0) = 0 or "кошельки/id"[1][1]=?) -- проект

union all

select 
  null as id, -- не редактировать в форме
  ts,
  "дата", timestamp_to_json("дата"::timestamp) as "@дата",
  ----to_char("дата", 'TMdy, DD TMmonth' || (case when date_trunc('year', now())=date_trunc('year', "дата") then '' else ' YYYY' end)) as "дата формат",
  "формат даты"("дата") as "дата формат",
  "сумма", sign, "категория" as "категории", null as "категория/id",
  null as "кошелек", null as "кошелек/id",
  "примечание", "профиль/id", "профиль", true as "начислено"
from "движение ДС/начисления сотрудникам" -- движение ДС/начисления по табелю view только  приходы по табелю
where (? is null or "профиль/id"=any(?))
  and (coalesce(?::int, 0) = 0 or "кошельки/id"[1][1]=?) -- проект
) u
order by "дата" desc, ts desc
{%= $limit_offset || '' %}
;

@@ баланс по профилю
-- возможно на дату 
select sum("сумма") as "баланс"
from (
select "сумма", "профиль/id"
from "движение ДС/по сотрудникам" -- view приход/расход
where (? is null or "профиль/id"=any(?))
  and (?::date is null or "дата" < {%= $date_expr || '?' %}::date)

union all --- начисления зп

select "сумма", "профиль/id"
from "движение ДС/начисления сотрудникам" -- движение ДС/начисления по табелю view только  приходы по табелю
where (? is null or "профиль/id"=any(?))
  and (?::date is null or "дата" < {%= $date_expr || '?' %}::date)

/*уже включено в движение ДС/начисления сотрудникам
union all --- расчетные начисления без кошелька

select m."сумма", p.id
from "движение денег" m
  join refs r on m.id=r.id2
  join "профили" p on p.id=r.id1
where sign(m."сумма"::numeric)=1 --- только приходы, расходы будут одной цифрой - выплата
  and (X::int is null or p.id=X)
  and (X::date is null or m."дата" < {%= $date_expr || 'X::date' %})
*/
) u
----group by "профиль/id"
;