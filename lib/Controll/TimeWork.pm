package Controll::TimeWork;
use Mojo::Base 'Mojolicious::Controller';
#~ use Mojolicious::Plugin::RoutesAuthDBI::Util qw(load_class);
#~ use Mojo::Util qw(md5_sum encode);

has model => sub {shift->app->models->{'TimeWork'}};
has model_money => sub {shift->app->models->{'Money'}};
has model_category => sub {shift->app->models->{'Category'}};

sub index {
  my $c = shift;
  #~ $c->index;
  return $c->render('timework/form',
    handler=>'ep',
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
    'header-title' => 'Учет рабочего времени',
    assets=>["timework/calc-zp.js",],
    );
  
}

sub объекты {
  my $c = shift;
  
  my $data = $c->model->объекты();
  
  $c->render(json=>$data);#[{name=>'Обект 1', "сотрудники"=>[]}, ]
}

sub доступные_объекты {
  my $c = shift;
  
  my $data = $c->model->доступные_объекты($c->auth_user->{id});
  
  $c->render(json=>$data);#[{name=>'Обект 1', "сотрудники"=>[]}, ]
}

sub бригады {
  my $c = shift;
  
  my $data = $c->model->бригады();
  
  $c->render(json=>$data);#[{name=>'Обект 1', "сотрудники"=>[]}, ]
}

sub data {
  my $c = shift;
  my $json = $c->req->json;
  
  my $data = $c->model->данные($json->{'объект'}{id}, $json->{'месяц'});
  
  $c->render(json=>$data);#[{name=>'Обект 1', "сотрудники"=>[]}, ]
}

sub profiles {# профили для добавления
  my $c = shift;
  my $data = $c->model->профили();
  $c->render(json=>$data);
}


sub save {# из формы
# { профиль: 1212, объект: 1392, дата: "2017-06-02", _title: "Ломов Стар  пт, 02.06.2017", _dblclick: false, значение: "13" }
  my $c = shift;
  my $data = $c->req->json;
  
  #~ $c->app->log->error(scalar grep $_, @$data{qw(профиль объект дата значение)});
  
  return $c->render(json=>{error=>"Не хватает данных для сохранения"})
    unless scalar grep(defined, @$data{qw(профиль объект дата значение)}) == 4;
  
  return $c->render(json=>{error=>"Сохранить не получится"})
    if $data->{"значение"} ~~ [qw(Ставка Начислено Суточные/ставка Суточные/начислено)];
  
  $data->{uid} = $c->auth_user->{id};
  my $r =  eval{$data->{'значение'} eq '' || !defined($data->{'значение'}) ? $c->model->удалить_значение($data) : $c->model->сохранить($data)};
  $r = $@
    if $@;
  $c->app->log->error($r)
    and return $c->render(json=>{error=>$r})
    unless ref $r;
  
  $c->render(json=>{($data->{'значение'} eq '' ? 'remove' : 'success')=>$r});
  
}

sub report {
  my $c = shift;
  #~ $c->index;
  return $c->render('timework/report',
    handler=>'ep',
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
  
  my $r = eval{$c->model->данные_отчета($param) || []};
  $r = $@
    and $c->app->log->error($@)
    and return $c->render(json=>{error=>$@})
    if $@;
  
  $c->render(json=>$r);
  
};

sub сохранить_значение {
  my $c = shift;
  my $data = $c->req->json;
  $data->{uid} = $c->auth_user->{id};
  
  $c->app->log->error($c->dumper($data));
  
  my $r = eval{$c->model->сохранить_значение($data)};
  $r = $@
    and $c->app->log->error($@)
    and return $c->render(json=>{error=>$@})
    if $@;
  
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

sub report_obj {# отчет для спец-та по тендерам
  my $c = shift;
  #~ $c->index;
  return $c->render('timework/report-obj',
    handler=>'ep',
    'header-title' => 'Учет рабочего времени',
    assets=>["timework/report-obj.js",],
    );
  
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
    'header-title' => 'Учет рабочего времени',
    #~ 'данные'=>$data,
    assets=>["timework/report-print.js",],
    );
  
}

sub квитки_начислено_данные {
  my $c = shift;
  my $param = $c->req->json;
  my $uid = $c->auth_user->{id};
  my $r = eval{$c->model->квитки_начислено($param, $uid) || []};
  $r = $@
    if $@;
  $c->app->log->error($r)
    and return $c->render(json=>{error=>$r})
    unless ref $r;

$c->render(json=>$r);

}

sub квитки_расчет {
  my $c = shift;
  return $c->render('timework/calc-zp-print',
    handler=>'ep',
    'header-title' => 'Учет рабочего времени',
    #~ 'данные'=>$data,
    assets=>["timework/calc-zp-print.js",],
    );
  
}

sub квитки_расчет_данные {
  my $c = shift;
  my $param = $c->req->json;
  #~ my $uid = $c->auth_user->{id};
  my $r = eval{$c->model->квитки_расчет($param) || []};
  $r = $@
    if $@;
  $c->app->log->error($r)
    and return $c->render(json=>{error=>$r})
    unless ref $r;
    
  
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
  my $r = eval{ $c->model->расчеты_выплаты($profile, $month) };
  #~ $c->app->log->error($c->dumper($r));
  $r = $@
    if $@;
  $c->app->log->error($r)
    and return $c->render(json=>{error=>$r})
    unless $r || ref $r;
  
  #~ unshift @$r, $c->model->статьи_расчетов();
  #~ $c->app->log->error($c->dumper($r));
  unshift @$r, $c->model->строка_табеля("профиль"=>$profile, "дата"=>$month, "значение"=>'РасчетЗП', "объект"=>0);
  unshift @$r, $c->model->сумма_выплат_месяца($profile, $month);
  unshift @$r, $c->model->сумма_начислений_месяца($profile, $month);
  unshift @$r, $c->model_money->баланс_по_профилю("профиль"=>{id=>$profile}, "дата"=>[" (date_trunc('month', ?::date) + interval '1 month') ", $month]);# на 1 число след месяца
  unshift @$r, $c->model_money->баланс_по_профилю("профиль"=>{id=>$profile}, "дата"=>[" date_trunc('month', ?::date) ", $month]);# на 1 число этого месяца
  $c->render(json=>$r);
  
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
  #~ $data->{'коммент'} = $data->{'выплатить'};
  $data->{'значение'} = 'РасчетЗП';
  my $r = eval{$c->model->сохранить_значение($data)};
  $r = $@
    if $@;
  $c->app->log->error($r)
    and return $c->render(json=>{error=>$r})
    unless ref $r;
  
  # к этой строке(id2) привязать/отвязать строки расчетов(id1)
  map {
    if($data->{'коммент'}) { # закрыть расчет
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
  
  my $r = eval{$c->model->расчет_зп_сводка($param) || []};
  $r = $@
    and $c->app->log->error($@)
    and return $c->render(json=>{error=>$@})
    if $@;
  
  $c->render(json=>$r);
}

1;