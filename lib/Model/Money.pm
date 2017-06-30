package Model::Money;
use Mojo::Base 'Model::Base';
#~ use Mojo::Util qw(dumper);

#~ has sth_cached => 1;
my $main_table ="движение денег";

sub new {
  state $self = shift->SUPER::new(@_);
  $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  $self->dbh->do($self->sth('таблицы'));
  #~ $self->dbh->do($self->sth('функции'));
  return $self;
}


sub сохранить {
  my $self = shift;
  my $data = ref $_[0] ? shift : {@_};
  
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, $main_table, ["id"], $data);
  my $prev = $self->позиция($r->{id});#$self->позиция($r->{id}, defined($data->{'кошелек2'}))
  
  map {# прямые связи
    if ($data->{$_}) {
      my $rr= $self->связь_получить($prev->{"$_/id"}, $r->{id});
      $r->{"связь/$_"} = $rr && $rr->{id}
        ? $self->связь_обновить($rr->{id}, $data->{$_}, $r->{id})
        : $self->связь($data->{$_}, $r->{id});
    } elsif ($_ ~~ qw'контрагент') {# можно чикать/нет
      #~ $self->связь_удалить(id1=>$prev->{"$_/id"}, id2=>$r->{id});
    }
  } qw(категория кошелек контрагент);
  
  map {# обратная связь
    if ($data->{$_}) {
      my $rr= $self->связь_получить($r->{id}, $prev->{"$_/id"});
      $r->{"обратная связь/$_"} = $rr && $rr->{id}
        ? $self->связь_обновить($rr->{id}, $r->{id}, $data->{$_},)
        : $self->связь($r->{id}, $data->{$_}, );
    } else {
      #~ $self->связь_удалить(id1=>$r->{id}, id2=>$prev->{"$_/id"}, );
    }
  } qw(кошелек2 профиль);

  return $self->позиция($r->{id});#позиция($r->{id}, defined($data->{'кошелек2'}))
  
}

sub позиция {
  my ($self, $id) = @_; # $wallet2 - флажок внутреннего перемещения
  
  my $r = $self->dbh->selectrow_hashref($self->sth('список или позиция'), undef, (undef) x 2, ($id) x 2,);
  
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
  
  
  if ($param->{move} && $param->{move}{id} eq 1){
    my $w2 = '"кошелек2/id" is null and "профиль/id" is null';
    $where .= $where ? "\n and $w2" : "where $w2";
  }
  elsif ($param->{move} && $param->{move}{id} eq 2){
    my $w2 = '"кошелек2/id" is not null';
    $where .= $where ? "\n and $w2" : "where $w2";
  }
  elsif ($param->{move} && $param->{move}{id} eq 3){
    my $w2 = '"профиль/id" is not null';
    $where .= $where ? "\n and $w2" : "where $w2";
  }
  
  my $limit_offset = "LIMIT 100 OFFSET ".($param->{offset} // 0);
  
  my $r = $self->dbh->selectall_arrayref($self->sth('список или позиция', where=>$where, limit_offset=>$limit_offset), {Slice=>{}}, @bind);
  
}

sub удалить {
  my ($self, $id) = @_;
  $self->_delete($self->{template_vars}{schema}, $main_table, ["id"], {id=>$id});
}

sub расчеты_по_профилю {# история начислений и выплат по сотруднику
  my ($self, $param) = @_; #
  
  my $limit_offset = "LIMIT 100 OFFSET ".($param->{offset} // 0);
  
  return $self->dbh->selectall_arrayref($self->sth('расчеты по профилю', limit_offset=>$limit_offset), {Slice=>{},}, ($param->{table}{"профиль"}{id}) x 4);
}

sub баланс_по_профилю {#
  my ($self, $param) = @_; #
  
  return $self->dbh->selectrow_hashref($self->sth('баланс по профилю'), {Slice=>{},}, ($param->{"профиль"}{id}) x 4);
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
create index IF NOT EXISTS "idx/движение денег/дата" on "движение денег" ("дата");

@@ список или позиция
---
select * from (
select m.*,
  to_char(m."дата", 'TMdy, DD TMmonth' || (case when date_trunc('year', now())=date_trunc('year', m."дата") then '' else ' YYYY' end)) as "дата формат",
  c.id as "категория/id", "категории/родители узла/title"(c.id, false) as "категории",
  ca.id as "контрагент/id", ca.title as "контрагент",
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
    select w.*, p.id as "проект/id", p."title" as "проект", rm.id2 as _ref
    from 
      "проекты" p -- надо
      join refs rp on p.id=rp.id1
      join "кошельки" w on w.id=rp.id2
      join refs rm on w.id=rm.id1
      where coalesce(?::int, 0)=0 or p.id=? -- все проекты или проект
  ) w on w._ref = m.id
  
  left join ({%= $dict->render('контрагент') %}) ca on ca._ref = m.id
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

@@ кошелек2
  -- обратная связь с внутренним перемещением
select w.id, rm.id1 as _ref, p.title || '→' || w.title as title
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

select *
from (
select id, ts, "дата",
  to_char("дата", 'TMdy, DD TMmonth' || (case when date_trunc('year', now())=date_trunc('year', "дата") then '' else ' YYYY' end)) as "дата формат",
  "сумма", sign, "категория" as "категории",
  array_to_string("кошельки", ': ') as "кошелек",
  "примечание", "профиль/id", "профиль", false as "начислено"
from "движение ДС/по сотрудникам" -- view приход/расход
where (?::int is null or "профиль/id"=?)

union all

select 
  null as id, -- не редактировать в форме
  ts,
  "дата",
  to_char("дата", 'TMdy, DD TMmonth' || (case when date_trunc('year', now())=date_trunc('year', "дата") then '' else ' YYYY' end)) as "дата формат",
  "сумма", sign, "категория" as "категории",
  null as "кошелек",
  "примечание", "профиль/id", "профиль", true as "начислено"
from "движение ДС/начисления сотрудникам" -- view только  приходы по табелю
where (?::int is null or "профиль/id"=?)
) u
order by "дата" desc, ts desc
{%= $limit_offset || '' %}
;

@@ баланс по профилю

select "профиль/id", sum("сумма") as "баланс"
from (
select "сумма", "профиль/id"
from "движение ДС/по сотрудникам" -- view приход/расход
where (?::int is null or "профиль/id"=?)

union all

select "сумма", "профиль/id"
from "движение ДС/начисления сотрудникам" -- view только  приходы по табелю
where (?::int is null or "профиль/id"=?)
) u
group by "профиль/id"
;