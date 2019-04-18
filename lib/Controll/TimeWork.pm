package Controll::TimeWork;
use Mojo::Base 'Mojolicious::Controller';
#~ use Mojolicious::Plugin::RoutesAuthDBI::Util qw(load_class);
#~ use Mojo::Util qw(md5_sum encode);

has model => sub {shift->app->models->{'TimeWork'}};
has model_money => sub {shift->app->models->{'Money'}};
has model_category => sub {shift->app->models->{'Category'}};
has model_object => sub {shift->app->models->{'Object'}};

sub index {
  my $c = shift;
  #~ $c->index;
  return $c->render('timework/form',
    handler=>'ep',
    title=>'Табель рабочего времени',
    'header-title' => 'Учет рабочего времени',
    assets=>["timework/form.js",],
    );
    #~ if $c->is_user_authenticated;
}

sub замстрой {# табель замстрой
  my $c = shift;
  #~ $c->index;
  return $c->render('timework/form-zam',
    handler=>'ep',
    title=>'Табель рабочего времени',
    'header-title' => 'Учет рабочего времени',
    assets=>["timework/form.js",],
    );
    #~ if $c->is_user_authenticated;
}

sub расчет_зп {
  my $c = shift;
  #~ $c->index;
  return $c->render('timework/calc-ZP',
    handler=>'ep',
    title=>'Расчет ЗП',
    'header-title' => 'Учет рабочего времени',
    assets=>["timework/calc-zp.js",],
    );
  
}

sub report_obj {# отчет для спец-та по тендерам
  my $c = shift;
  #~ $c->index;
  return $c->render('timework/report-obj',
    handler=>'ep',
    'header-title' => 'Учет рабочего времени',
    assets=>["timework/report-obj.js",],
    );
  
}


sub объекты {
  my $c = shift;
  
  my $data = $c->model->объекты();
  
  $c->render(json=>$data);#[{name=>'Обект 1', "сотрудники"=>[]}, ]
}

sub доступные_объекты {
  my $c = shift;
  
  my $data = $c->model->доступные_объекты($c->auth_user->{id}, {select=>' row_to_json(o) '});
  
  $c->render(json=>$data);#[{name=>'Обект 1', "сотрудники"=>[]}, ]
}

sub бригады {
  my $c = shift;
  
  my $data = $c->model->бригады({select=>' row_to_json(b) '});
  
  $c->render(json=>$data);#[{name=>'Обект 1', "сотрудники"=>[]}, ]
}

sub data {
  my $c = shift;
  my $json = $c->req->json;
  
  my $data = $c->model->данные($json->{'объект'}{id}, $json->{'месяц'},);
  $data->{'месяц табеля закрыт/interval/json'} = $c->model->месяц_табеля_закрыт()
    if $c->access->access_explicit([3946], [map $_->{id}, @{$c->auth_user->{roles}}]);# доступ есть к Отчету-сводке начислению
  #~ $c->app->log->error();
  
  $c->render(json=>$data);#[{name=>'Обект 1', "сотрудники"=>[]}, ]
}

sub открыть_месяц {# и сразу вернуть данные
  my $c = shift;
  my $param = $c->req->json;
  
  $c->model->открыть_месяц($param->{'объект'}{id}, $param->{'месяц'},$c->auth_user->{id});
  my $data = $c->model->данные($param->{'объект'}{id}, $param->{'месяц'},);
  $c->render(json=>$data);
}

sub profiles {# профили для добавления
  my $c = shift;
  my $data = $c->model->профили({select=>' row_to_json(p) '});
  $c->render(json=>$data);
}


sub save {# из формы
# { профиль: 1212, объект: 1392, дата: "2017-06-02", _title: "Ломов Стар  пт, 02.06.2017", _dblclick: false, значение: "13" }
  my $c = shift;
  my $data = $c->req->json;
  
  #~ sleep(5);
  #~ $c->app->log->error(scalar grep $_, @$data{qw(профиль объект дата значение)});
  
  return $c->render(json=>{error=>"Не хватает данных для сохранения"})
    unless scalar grep(defined, @$data{qw(профиль объект дата значение)}) == 4;
  
  $data->{uid} = $c->auth_user->{id};
  # проверка доступа к объекту
  my $o = $c->model_object->доступные_объекты($data->{uid}, $data->{"объект"})->[0] 
    or $c->app->log->error("Объект [$data->{'объект'}] недоступен", $c->app->dumper($data))
    and return $c->render(json=>{error=>"Объект недоступен"});
  
  my $access_zamstroy = $c->access->access_explicit([4165], [map $_->{id}, @{$c->auth_user->{roles}}]);# доступ есть к Табель-замстрой
  
  return $c->render(json=>{error=>"Отпускные дни заводит бухгалтерия"})
    if lc($data->{"значение"}) eq 'о' && !($o->{name} =~ /офис/i || $access_zamstroy);
  
  return $c->render(json=>{error=>"Сохранение не выполнено"})
    if $data->{"значение"} ~~ [qw(Ставка  Начислено Суточные/ставка Суточные/сумма Отпускные/ставка Отпускные/сумма Отпускные/начислено Суточные/начислено  РасчетЗП Переработка/ставка Переработка/сумма Переработка/начислено),]
    || $data->{"значение"} ~~ ['КТУ2', 'Доп. часы замстрой', 'Доп. часы замстрой/сумма', 'Доп. часы замстрой/начислено',]
    && !$access_zamstroy;
  
  my $intersect = $c->model->пересечение_объектов_сохранение($data)
    if $data->{"значение"} =~ /^\d/ && !$data->{'подтвердил пересечение'};# часы или отпуск|^о$
  return $c->render(json=>{intersection=>$intersect})
    if $intersect;
  
  
  my $r =  eval{$data->{'значение'} eq '' || !defined($data->{'значение'}) ? $c->model->удалить_значение($data) : $c->model->сохранить($data)};
  $r = $@
    if $@;
  $c->app->log->error($r, $c->dumper($data))
    and return $c->render(json=>{error=>$r})
    unless ref $r;
  
  $c->render(json=>{($data->{'значение'} eq '' ? 'remove' : 'success')=>$r});
  
}

sub report {
  my $c = shift;
  #~ $c->index;
  return $c->render('timework/report',
    handler=>'ep',
    title=>'Сводка-начисление ЗП',
    'header-title' => 'Учет рабочего времени',
    assets=>["timework/report.js",],
    );
    #~ if $c->is_user_authenticated;
}

sub report_data {
  my $c = shift;
  my $param = $c->req->json;
  
  #~ $c->app->log->error($c->dumper($param))
    #~ if $param->{'общий список'};
  
  #~ eval { $c->minion->enqueue(slow_log => ['test 123']) };
  $c->model->чистка_дублей_табеля();##???
  
  
  $param->{select} = ' jsonb_agg(t) ';
  $param->{uid} = $c->auth_user->{id};
  my $r = eval{$c->model->данные_отчета($param) || []};
  $r = $@
    and $c->app->log->error($@)
    and return $c->render(json=>{error=>$@})
    if $@;
  $param->{select} = ' 000jsonb_agg(t) ';# ' row_to_json(t) ';
  # отдельным запросом проверка на пересечение объектов
  push @$r, $c->model->пересечение_объектов($param);# hashref
  
  $c->render(json=>$r);
  
};

sub сохранить_значение {
  my $c = shift;
  my $data = $c->req->json;
  $data->{uid} = $c->auth_user->{id};
  
  #~ sleep(5);
  #~ $c->app->log->error($c->dumper($data));
  
  my $r = eval{$c->model->сохранить_значение($data)};
  $c->app->log->error($r)
    and return $c->render(json=>{error=>$r})
    unless ref $r;
  
  $c->render(json=>$r);
}

sub detail {#показать табель по профилю
  my $c = shift;
  my $param = $c->req->json;
  
  my $r = eval{$c->model->детально_по_профилю($param)};
  $r = $@
    and $c->app->log->error($@)
    and return $c->render(json=>{error=>$@})
    if $@;
  
  $c->render(json=>$r);
  
}



sub report_obj_data {
  my $c = shift;
  my $param = $c->req->json;
  
  #~ $c->app->log->error($c->dumper($param))
    #~ if $param->{'общий список'};
  
  my $r = eval{$c->model->данные_отчета_сотрудники_на_объектах($param) || []};
  $r = $@
    and $c->app->log->error($@)
    and return $c->render(json=>{error=>$@})
    if $@;
  
  $c->render(json=>$r);
  
};

sub квитки_начислено {
  my $c = shift;
  return $c->render('timework/report-print',
    handler=>'ep',
    title=>'Квитки ЗП',
    'header-title' => 'Учет рабочего времени',
    #~ 'данные'=>$data,
    assets=>["timework/report-print.js",],
    );
  
}

sub квитки_начислено_данные {
  my $c = shift;
  my $param = $c->req->json;
  $c->inactivity_timeout(10*60);
  my $uid = $c->auth_user->{id};
  $param->{select} = ' row_to_json(t)  ';
  my $r = $c->model->квитки_начислено($param, $uid);
  #~ $r = $@
    #~ if $@;
  #~ $c->app->log->error($r)
    #~ and return $c->render(json=>{error=>$r})
    #~ unless ref $r;

$c->render(json=>$r);

}

sub квитки_расчет {
  my $c = shift;
  return $c->render('timework/calc-zp-print',
    handler=>'ep',
    title=>'Квитки к выдаче ЗП',
    'header-title' => 'Учет рабочего времени',
    #~ 'данные'=>$data,
    assets=>["timework/calc-zp-print.js",],
    );
  
}

sub квитки_расчет_данные {
  my $c = shift;
  my $param = $c->req->json;
  $c->inactivity_timeout(10*60);
  #~ my $uid = $c->auth_user->{id};
  $param->{select} = ' row_to_json(t)  ';
  my $r = $c->model->квитки_расчет($param);
  #~ $r = $@
    #~ if $@;
  #~ $c->app->log->error($r)
    #~ and return $c->render(json=>{error=>$r})
    #~ unless ref $r;
    
  
  $c->render(json=>$r);

}



sub расчеты_выплаты {
=pod
Для формы данные

  первая строка - баланс на конец указ месяца
  вторая строка - общее начисление на указ месяц
  третья строка - hashref c строка табеля 'РасчетЗП' (как признак закрытия расчетов)
  4 строка - массив строк автоподстановки статей/заголовков расчетых строк
  последующие строки - расчеты
=cut
  my $c = shift;
  my $profile = $c->vars('profile');
  my $month = $c->vars('month');
  
=pod
  my $r = $c->model->расчеты_выплаты($profile, $month, {select=>' row_to_json(m) '});
  #~ $c->app->log->error($c->dumper($r));
  #~ $r = $@
    #~ if $@;
  #~ $c->app->log->error($r)
    #~ and return $c->render(json=>{error=>$r})
    #~ unless $r || ref $r;
  
  #~ unshift @$r, $c->model->статьи_расчетов();
  #~ $c->app->log->error($c->dumper($r));
  unshift @$r, $c->model->расчеты_выплаты_других_месяцев($profile, $month);
  unshift @$r, $c->model->строка_табеля("профиль"=>$profile, "дата"=>$month, "значение"=>'РасчетЗП', "объект"=>0);
  unshift @$r, $c->model->сумма_выплат_месяца($profile, $month);
  unshift @$r, $c->model->сумма_начислений_месяца($profile, $month);
  unshift @$r, $c->model_money->баланс_по_профилю("профиль"=>{id=>$profile}, "дата"=>[" (date_trunc('month', ?::date) + interval '1 month') ", $month]);# на 1 число след месяца
  unshift @$r, $c->model_money->баланс_по_профилю("профиль"=>{id=>$profile}, "дата"=>[" date_trunc('month', ?::date) ", $month]);# на 1 число этого месяца
  $c->render(json=>$r);
=cut
  my @r = ();
  $c->render_later;
  my $render = sub { $c->render(json=>\@r) if scalar grep(exists $r[$_], (0..$#r)) eq 6 ; };
  #~ $c->app->log->error($c->model->dbh->db->dbh->{pg_socket});
  $c->model->расчеты_выплаты($profile, $month, {select=>' row_to_json(m) ', Async000=>1,}, sub { $r[5] = $_[2]->hashes; $render->(); });#; 
  $c->model->строка_расчета_зп("профиль"=>$profile, "дата"=>$month, sub { $r[4] = $_[2]->hash; $render->(); });
  #~ $c->model->расчеты_выплаты_других_месяцев($profile, $month, sub { $r[5] = $_[2]->hashes; $render->(); });# $c->render(json=>\@r) if scalar grep(exists $r[$_], (0..$#r)) eq 7;
  $c->model->сумма_выплат_месяца($profile, $month, sub { $r[3] = $_[2]->hash; $render->(); });#$c->render(json=>\@r) if scalar grep(exists $r[$_], (0..$#r)) eq 7
  $c->model->сумма_начислений_месяца($profile, $month, sub { $r[2] = $_[2]->hash; $render->(); });# $c->render(json=>\@r) if scalar grep(exists $r[$_], (0..$#r)) eq 7
  $c->model_money->баланс_по_профилю("профиль"=>{id=>$profile}, "дата"=>[" (date_trunc('month', ?::date) + interval '1 month') ", $month], sub { $r[1] = $_[2]->hash; $render->(); });# на 1 число след месяца
  $c->model_money->баланс_по_профилю("профиль"=>{id=>$profile}, "дата"=>[" date_trunc('month', ?::date) ", $month], sub { $r[0] = $_[2]->hash; $render->(); });# на 1 число этого месяца
  Mojo::IOLoop->start unless Mojo::IOLoop->is_running;
  #~ $c->app->log->error(scalar grep(exists $r[$_], (0..$#r)));
  #~ $r[6] = $$cb->()->hashes;
  #~ $c->render(json=>\@r);
  
}

sub расчеты_других_месяцев {
  my $c = shift;
  my $param = $c->req->json;
  $c->render(json=>$c->model->расчеты_выплаты_других_месяцев($param));
}

sub расчеты_выплаты_сохранить {# сохранение строк расчета
  my $c = shift;
  my $data = $c->req->json;
  
  return $c->render(json=>{error=>"Какой профиль?"})
    unless $data->{'профиль'};
  
  return $c->render(json=>{error=>"Какой месяц?"})
    unless $data->{'дата'};
  
  $data->{'сумма'} = $data->{'начислить'} || ($data->{'удержать'} ? '-'.$data->{'удержать'} : 0);
  #~ $data->{'примечание'} = [$data->{'заголовок'}, $data->{'коммент'}];
  
  return $c->render(json=>{remove=>eval{$c->model->расчеты_выплаты_удалить($data)}})
    if $data->{id} && !$data->{'сумма'};
  
  my $rc = $c->model_category->сохранить_категорию($data->{category});
  return $c->render(json=>{error=>$rc})
    unless ref $rc;
  
  $data->{'категория'} = $data->{category}{id};
  
  my $r = eval{$c->model->расчеты_выплаты_сохранить($data)}
  #~ $r = $@
    #~ if $@;
  or $c->app->log->error($@)
    and return $c->render(json=>{error=>$@});
    #~ unless ref $r;
  
  $c->render(json=>$r);
}

sub закрыть_расчет {
  my $c = shift;
  my $data = $c->req->json;
  $data->{uid} = $c->auth_user->{id};
  $data->{'объект'} = 0;
  $data->{'коммент'} = $c->model->расчет_ЗП($data->{'профиль'}, $data->{'дата'})->{'расчет ЗП'}#$data->{'выплатить'};
    if $data->{'коммент'};# пересчитать
  $data->{'значение'} = 'РасчетЗП';
  my $r = eval{$c->model->сохранить_значение($data)};
  $r = $@
    if $@;
  $c->app->log->error($r)
    and return $c->render(json=>{error=>$r})
    unless ref $r;
  
  # к этой строке(id2) привязать/отвязать строки расчетов(id1)
  map {
    if($data->{'коммент'} || $data->{'коммент'} eq 0) { # закрыть расчет
      $c->model->связь($_->{id}, $r->{id});
    } else {#заново открыть расчеты
      $c->model->связь_удалить(id1=>$_->{id}, id2=> $r->{id});
    }
  } @{$c->model->расчеты_выплаты($data->{"профиль"}, $data->{"дата"})};
  
  $c->render(json=>$r);
  
}

sub расчет_зп_данные {
  my $c = shift;
  
  my $param = $c->req->json;
  
  #~ $c->app->log->error($c->dumper($param))
    #~ if $param->{'общий список'};
  $param->{select} = ' row_to_json(t) ';
  my $r = $c->model->расчет_зп_сводка($param);
  #~ $r = $@
    #~ and $c->app->log->error($@)
    #~ and return $c->render(json=>{error=>$@})
    #~ if $@;
  
  unshift @$r, $c->model_object->список({select=>' row_to_json(o) '});
  
  $c->render(json=>$r);
}

1;