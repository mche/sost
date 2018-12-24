package Model::Money;
use Mojo::Base 'Model::Base';
#~ use Mojo::Util qw(dumper);
use Util;

our $DATA = ['Money.pm.dict.sql'];

#~ has [qw(app)];
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
  my $prev = ref $_[-1] eq 'HASH' && pop;
  my $data = ref $_[0] ? shift : {@_};
  #~ $self->app->log->error($self->app->dumper($data, $prev));
  
  $prev ||= $self->позиция($data->{id})
    if $data->{id};#$self->позиция($r->{id}, defined($data->{'кошелек2'}))
  #~ my $tx_db = $self->dbh->begin;
  #~ local $self->{dbh} = $tx_db; # временно переключить модели на транзакцию
  
  $data->{$_} && ($data->{$_} = Util::money($data->{$_}))
    for qw(сумма);#
  
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, $main_table, ["id"], $data);
  #~ $prev ||= $self->позиция($r->{id});
  
  map {# прямые связи
    if ($data->{$_}) {
      if ($prev && $prev->{"$_/id"}) {
        my $rr= $self->связь_получить($prev->{"$_/id"}, $r->{id});
        $r->{"связь/$_"} = $self->связь_обновить($rr->{id}, $data->{$_}, $r->{id});
      } else {
        $r->{"связь/$_"} = $self->связь($data->{$_}, $r->{id});
      }
    } elsif ($_ ~~ [qw'контрагент объект'] && $prev && $prev->{"$_/id"}) {# можно чикать/нет
      $r->{"связь удалена/$_"} = $self->связь_удалить(id1=>$prev->{"$_/id"}, id2=>$r->{id});
    }
  } qw(категория кошелек контрагент объект);
  
  map {# обратная связь
    if ($data->{$_}) {
      if ($prev && $prev->{"$_/id"}) {
        my $rr= $self->связь_получить($r->{id}, $prev->{"$_/id"});
        $r->{"связь/$_"} = $self->связь_обновить($rr->{id}, $r->{id}, $data->{$_});
      } else {
        $r->{"связь/$_"} = $self->связь($r->{id}, $data->{$_});
      }
    } elsif ($prev && $prev->{"$_/id"}) {# можно чикать/нет
      $r->{"связь удалена/$_"} = $self->связь_удалить(id1=>$prev->{"$_/id"}, id2=>$r->{id});
    }
  } qw(кошелек2 профиль);
  
  #~ $tx_db->commit;

  return $r;#$self->позиция($r->{id});#позиция($r->{id}, defined($data->{'кошелек2'}))
  
}

sub позиция {
  my ($self, $id) = @_; # $wallet2 - флажок внутреннего перемещения
  my ($where, @bind) = $self->SqlAb->where({
    ' m.id ' => $id,
    
  });
  $self->dbh->selectrow_hashref($self->sth('список или позиция', where1=>$where), undef, @bind);
}

my %type = ("дата"=>'date', "сумма"=>'money', "примечание"=>'text');

sub список {
  my ($self, $project, $param) = @_;
  
  my ($where1, @bind) = $self->SqlAb->where({
    ' p.id '=>$project,
  });
  
  my $where = "";#дополнительные условия
  while (my ($key, $value) = each %{$param->{table} || {}}) {
    next
      unless ref($value) && ($value->{ready} || $value->{_ready}) ;
    
    if ($key eq 'категория') {
      $where .= ($where ? " and " :  "where ").qq\ "$key/id" in (select id from "категории/родители"() where ?=any(parents_id||id)) \;
      push @bind, $value->{id};
      next;
    }
    
    if ($value->{id}) {
      $where .= ($where ? " and " :  "where ").qq| "$key/id"=? |;
      push @bind, $value->{id};
      next;
    }
    
    if ($value->{values} ) {
      my @values = @{$value->{values} || []};
      next
        unless grep {$_} @values;
      
      $values[1] = 10000000000
        unless $values[1];
      $values[0] = 0
        unless $values[0];
      
      my $sign = $value->{sign};
      
      $where .= ($where ? " and " :  "where ") . sprintf(qq' ("%s" between ?::%s and ?::%s)', $key, ($type{$key}) x 2);
      push @bind, map {s/,/./g; s/[^\d\-\.]//g; $sign ? $sign*$_ : $_;}  (($sign && $sign < 0) ? reverse @values : @values);
      next;
    }
    
    if ($type{$key} eq 'text' && $value->{title}) {
      $where .= ($where ? " and " :  "where ").qq| "$key" ~* ? |;
      push @bind, $value->{title};
      next;
    }
    
    
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
  
  #~ $self->app->log->error($where);
  
  my $r = $self->dbh->selectall_arrayref($self->sth('список или позиция', select => $param->{select} || '*', where1=>$where1, where=>$where, limit_offset=>$limit_offset), {Slice=>{}}, @bind);
  
}

sub удалить {
  my ($self, $id) = @_;
  #~ $self->_delete($self->{template_vars}{schema},  ["id"], {id=>$id});
  $self->_удалить_строку($main_table, $id);
}

sub расчеты_по_профилю {# история начислений и выплат по сотруднику
  my ($self, $param) = @_; #
  
    
  my $profile = [ $param->{table}{"профиль"}{id}, ]
    if $param->{table} && $param->{table}{"профиль"} && $param->{table}{"профиль"}{ready};
  
  $profile = [ map $_->{id}, @{ $param->{table}{"профили"} } ]
    if $param->{table} && $param->{table}{"профили"};
  
  my $where = "";
  my @bind = (($profile) x 2, ($param->{"проект"}{id}) x 2,) x 2;
  
  #~ $self->app->log->error($self->app->dumper($param->{table}));
  while (my ($key, $value) = each %{$param->{table} || {}}) {
    next if $key eq 'профиль' || $key eq 'профили';
    next
      unless ref($value) eq 'HASH' && ($value->{ready} || $value->{_ready}) ;
    
    if ($key eq 'категория') {
      $where .= ($where ? " and " :  "where ").qq\ "$key/id" in (select id from "категории/родители"() where ?=any(parents_id||id)) \;
      push @bind, $value->{id};
      next;
    }
    
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
  
  my $limit_offset = "LIMIT 100 OFFSET ".($param->{offset} // 0);
  
  #~ $self->app->log->error($where);
  
  return $self->dbh->selectall_arrayref($self->sth('расчеты по профилю', select=>$param->{select} || '*', where=>$where || '', limit_offset=>$limit_offset), {Slice=>{},}, @bind);
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
