package Model::MedCol;
use Mojo::Base 'Model::Base';
#~ use Util;

our $DATA = ['MedCol.pm.dict.sql'];

#~ has sth_cached => 1;
#~ has [qw(app)];
has время_теста => 3600;# по умолчанию
has задать_вопросов => 60;# по умолчанию

sub init {
  #~ state $self = shift->SUPER::new(@_);
  my $self = shift;
  $self->dbh->do($self->sth('схема'));
  #~ $self->dbh->do($self->sth('функции'));
  #~ return $self;
}

#~ sub defaults {
  #~ my $self = shift;
  #~ my $r = $self->_update("медкол", "умолчания", ['id'], {id=>$id})
  #~ $self->dbh->selectrow_hashref('select * from "медкол"."умолчания" set '
#~ };

sub сессия_или_новая {# текущая
  my ($self, $id) = @_;
  my $s = $self->_select("медкол", "сессии", ['id'], {id=>$id})
    if $id;
  $s ||= $self->_insert_default_values("медкол", "сессии")
  #$self->получить_или_вставить("медкол", "сессии", ['id'], {$id ? (id=>$id) : (),}, {$id ? () : (id=>'default'),})
    or die "Нет такой сессии";
  $self->dbh->selectrow_hashref($self->sth('сессия', where=>' where s.id=? '), undef, (undef) x 3, $s->{id});
  
  
}

sub сессию_продлить {# обновить начало сессии
  my ($self, $id) = @_;
  $self->_update("медкол", "сессии", ['id'], {id=>$id}, {ts=>'now()',});
};

sub сессия {# любая
  my ($self, $id,) = @_;
  $self->dbh->selectrow_hashref($self->sth('сессия', where=>' where s.id=? '), undef, ($self->время_теста) x 3, $id);
}

sub сессия_sha1 {# любая
  my ($self, $sha1,) = @_;
  $self->dbh->selectrow_hashref($self->sth('сессия', where=>' where "сессия/sha1"=? '), undef, ($self->время_теста) x 3, $sha1);
}

sub фиксировать_сессию {# и можно переключить на новую
  my ($self, $id,) = @_;
  my $old = $self->сессия($id)
    or return $self->сессия_или_новая();
  #~ $self->app->log->debug($self->app->dumper($old));
  unless ($old->{'получено ответов'}) {# забыть без ответов
    #~ $self->app->log->debug($self->app->dumper($old));
    $self->удалить_объект("процесс сдачи", $_)
      for @{$old->{"процесс сдачи/id"} || []};
    
    $self->связь_удалить(id1=>$old->{'название теста/id'}, id2=>$id);
    
    my $sess = $self->сессия($id);
    
    #~ $self->app->log->debug($self->app->dumper($sess));
    #~ $self->сессию_продлить($old->{id});
    return $sess; # снова запросить
    
  }
  
  my $cnt = $old->{'тест/задать вопросов'} || $self->задать_вопросов;
  $self->_update("медкол", "сессии", ['id'], {id=>$old->{id}, 'задать вопросов'=>$cnt},);
    #~ if $old->{'получено ответов'};# хоть один ответ
    #$old->{'задано вопросов'} eq $cnt; #
  my $new = $self->сессия_или_новая();
  $self->связь($old->{id}, $new->{id});
  return $new;
}

sub сохранить_название {
  my ($self, $id, $name, $cnt, $sec) = @_;
  my $r = $self->обновить_или_вставить("медкол", "названия тестов", ['id'], {'id'=>$id, 'название'=>$name, 'задать вопросов'=>$cnt, 'всего время'=>$sec, },);
  #~ $self->dbh->selectrow_hashref($self->sth('названия тестов', where=>' where "id"=? '), undef, $r->{'id'});
  
}

sub сохранить_тестовый_вопрос {
  my ($self, $k, $q, $ans, $list) = @_; # код, вопрос, ответы, принадлежность к списку
  my $r = $self->обновить_или_вставить("медкол", "тестовые вопросы", ['код'], {'код'=>$k, 'вопрос'=>$q, 'ответы'=>$ans,},);
  $self->связь(ref $list ? $list->{id} : $list, $r->{id});
  return $r;
}

sub удалить_вопросы_из_списка {# которые не указаны в ids
  my ($self, $test_id, $ids) = @_;
  $self->dbh->selectall_arrayref($self->sth('удалить из теста'), {Slice=>{}}, $test_id, $ids, $test_id);
  
}


sub названия_тестов {
  my ($self, $param) = (shift, ref $_[0] ? shift : {@_});
  $self->dbh->selectall_arrayref($self->sth('названия тестов', where=>$param->{where} || ''), {Slice=>{}},($self->время_теста) x 3, @{$param->{bind} || []},);
  
};

sub тестовые_вопросы {
  my ($self, $param) = (shift, ref $_[0] ? shift : {@_});
  $self->dbh->selectall_hashref($self->sth('тестовые вопросы', where=>$param->{where} || ''), "id", undef,@{$param->{bind} || []},);
  
};

sub вопросы_списка {
  my ($self, $id) = @_;
  $self->dbh->selectall_arrayref($self->sth('вопросы списка', order_by=> 'order by "id" '), {Slice=>{}}, ($id) x 2, );
}

sub связь {
  my ($self, $id1, $id2) = @_;
  $self->вставить_или_обновить("медкол", "связи", ["id1", "id2"], {id1=>$id1, id2=>$id2,});
}

sub заданный_вопрос {# без ответа
  my ($self, $sess_id) = @_;
  $self->dbh->selectrow_hashref($self->sth('заданный вопрос'), undef, $sess_id);
}

sub начало_теста {# связать список тестов с сессией
  my ($self, $sess_id, $sha1) = @_;
  $self->dbh->do($self->sth('обрубить сессию от теста'), undef, $sess_id);
  $self->dbh->do($self->sth('обрубить сессию от процесса'), undef, $sess_id);
  $self->dbh->selectrow_hashref($self->sth('начало теста'), undef, ($sess_id) x 1, $sha1)# свяжет сессию с тестом
    or die "Нет такого теста";
  # обновить начало сессии
  $self->сессию_продлить($sess_id); #$self->_update("медкол", "сессии", ['id'], {id=>$sess_id}, {ts=>'now()',});
  $self->dbh->selectrow_hashref($self->sth('сессия', where=>' where s.id=? '), undef, (undef) x 3, $sess_id);
}

sub новый_вопрос {# закинуть в процесс вопрос
  my ($self, $sess_id) = @_;
  my $q = $self->dbh->selectrow_hashref($self->sth('новый вопрос'), undef, $sess_id);
  # связать "сессия" -> "процесс сдачи"(создать запись) -> "тестовые вопросы"(новый вопрос)
  my $p = $self->_insert_default_values("медкол", "процесс сдачи");#, undef, {}, {ts=>'default'});
  $self->связь($sess_id, $p->{id});
  $self->связь($p->{id}, $q->{id});
  return $self->заданный_вопрос($sess_id);
}

sub сохранить_ответ {
  my ($self, $process_id, $idx) = @_;
  $self->_update("медкол", "процесс сдачи", ['id'], {id=>$process_id, 'ответ'=>$idx}, {'время ответа'=>'now()'});
}

sub мои_результаты {
  my ($self, $sess_id) = @_;
  $self->dbh->selectall_arrayref($self->sth('мои результаты'), {Slice=>{}},$sess_id, $self->задать_вопросов);
}

sub результаты_сессий {
  my ($self, $param) = (shift, ref $_[0] ? shift : {@_}) ;
  
  my ($where, @bind)  = $self->SqlAb->where({
    $param->{test_id} ? (' t.id ' => $param->{test_id}) : (),
    $param->{"сессия от"} || $param->{"сессия до"} ? (' s.ts  ' => { -between => \["? AND ?", $param->{"сессия от"} || '2000-01-01', $param->{"сессия до"} || '2100-01-01'] },) : (),
    $param->{'sha1'} ? (q|substring(encode(digest(s."ts"::text, 'sha1'),'hex'), 0, ?)| => \[ "= ?", length($param->{'sha1'})+1, lc($param->{'sha1'}) ]) : (),
    
  });
  
  unshift @bind, $self->задать_вопросов;
  
  $self->app->log->error($where, @bind);
  
  $self->dbh->selectall_arrayref($self->sth('результаты сессий', where=>$where, limit=>'LIMIT '.($param->{limit} || 30), offset=>'OFFSET '.($param->{offset} || 0)), {Slice=>{}}, @bind);
}

sub результаты_сессий_цепочки {
  my ($self, $param) = (shift, ref $_[0] ? shift : {@_}) ;
  my ($where, @bind) = $self->SqlAb->where({
    defined $param->{'успехов'} && $param->{'успехов'} ne '' ? (' "%больше70" ' => {'>=', $param->{'успехов'}}) : (),
    defined $param->{'тест'} && $param->{'тест'} ne '' ? (' ?::int = any("тест/id") ' => { '' => \["", $param->{'тест'}] },) : (),#date_entered => { '>' => \["to_date(?, 'MM/DD/YYYY')", "11/26/2008"] },
    $param->{'sha1'} ? (q|?| => \[ q| = any("сессия/sha1/substr")|, lc($param->{'sha1'}) ]) : (),
  });
  unshift @bind, $self->задать_вопросов;
  unshift @bind, length($param->{'sha1'})+1 # для append_select2
    if $param->{'sha1'};
  $self->dbh->selectall_arrayref($self->sth('результаты сессий/цепочки', $param->{'sha1'} ? (append_select2=>q| ,array_agg(substring("сессия/sha1", 0, ?) order by "сессия/ts" desc) as "сессия/sha1/substr" |) : (), where2=>$where, order_by=> ' order by  "сессия/ts"[1]  desc ', limit=>'LIMIT '.($param->{limit} || 50), offset=>'OFFSET '.($param->{offset} || 0)), {Slice=>{}}, @bind);#array_length("сессия/ts", 1)
}

sub сессия_ответы {
  my ($self, $sess_id) = @_;
  $self->dbh->selectall_arrayref($self->sth('ответы в сессии'), {Slice=>{}},$sess_id);
}

sub статистика_ответы {
  my ($self, $param) = @_;
  $self->dbh->selectall_arrayref($self->sth('статистика по ответам'), {Slice=>{}}, ($param->{test_id} || 0) x 2);
}

sub связь_удалить {
  my $self = shift;
  my $data = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectrow_hashref($self->sth('связь удалить'), undef, (@$data{qw(id id1 id2)}));


}

sub удалить_объект {
  my ($self, $table, $id) = @_;
  $self->dbh->selectrow_hashref($self->sth('удалить объект'), undef, $table, $id);
}

sub сохранить_проверку_результата {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  $self->dbh->selectrow_hashref($self->sth('сохранить проверку результата', expr=>$param->{'значение'} ? 'now()' : 'null'), undef, $param->{sha1});
}

1;

__DATA__
