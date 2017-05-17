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
  my $prev = $self->позиция($r->{id}, defined($data->{'кошелек2'}));
  
  map {
    if ($data->{$_}) {
      my $rr= $self->связь_получить($prev->{"$_/id"}, $r->{id});
      $r->{"связь/$_"} = $rr && $rr->{id}
        ? $self->связь_обновить($rr->{id}, $data->{$_}, $r->{id})
        : $self->связь($data->{$_}, $r->{id});
    } elsif ($_ eq 'контрагент') {# можно чикать
      $self->связь_удалить(id1=>$prev->{"$_/id"}, id2=>$r->{id});
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
  } qw(кошелек2);

  return $self->позиция($r->{id}, defined($data->{'кошелек2'}));
  
}

sub позиция {
  my ($self, $id, $wallet2) = @_; # $wallet2 - флажок внутреннего перемещения
  
  my $r = $self->dbh->selectrow_hashref($self->sth('список или позиция', wallet2=>$wallet2), undef, (undef) x 2, ($id) x 2,);
  
}

my %type = ("дата"=>'date', "сумма"=>'money');
sub список {
  my ($self, $project, $data) = @_;
  
  my $where = "";
  my @bind = (($project) x 2, (undef) x 2);
  
  while (my ($key, $value) = each %{$data || {}}) {
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
  
  my $r = $self->dbh->selectall_arrayref($self->sth('список или позиция', wallet2=>$data->{wallet2}, where=>$where), {Slice=>{}}, @bind);
  
}

sub удалить {
  my ($self, $id) = @_;
  $self->_delete($self->{template_vars}{schema}, $main_table, ["id"], {id=>$id});
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

@@ список или позиция
---
select * from (
select m.*,
  to_char(m."дата", 'TMdy, DD TMmonth YYYY') as "дата формат",
  c.id as "категория/id", "категории/родители узла/title"(c.id, false) as "категории",
  {%= (!$wallet2  && 'ca.id as "контрагент/id", ca.title as "контрагент",') || '' %}
  {%= ($wallet2 && 'w2.id as "кошелек2/id", w2.title as "кошелек2",') || '' %}
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
      where ?::int is  null or p.id=?
  ) w on w._ref = m.id
  
  {%= (!$wallet2  && $dict->render('контрагент')) || '' %}
  {%= ($wallet2 || '') && $dict->render('кошелек2') %}

where (?::int is null or m.id =?)
) m
{%= $where %}

order by "дата" desc, ts desc
;

@@ контрагент
-- подзапрос
  left join (select c.*, r.id2 as _ref
  from refs r join "контрагенты" c on r.id1=c.id
  ) ca on ca._ref = m.id

@@ кошелек2
  -- обратная связь с внутренним перемещением
  join (
  select w.id, rm.id1 as _ref, p.title || '→' || w.title as title
  from "проекты" p
    join refs r on p.id=r.id1
    join "кошельки" w on w.id=r.id2
    join refs rm on w.id=rm.id2 -- к деньгам
  ) w2 on w2._ref = m.id