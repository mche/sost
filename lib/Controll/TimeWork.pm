package Controll::TimeWork;
use Mojo::Base 'Mojolicious::Controller';
#~ use Mojolicious::Plugin::RoutesAuthDBI::Util qw(load_class);
#~ use Mojo::Util qw(md5_sum encode);

has model => sub {shift->app->models->{'TimeWork'}};
#~ has model_obj => sub {shift->app->models->{'Object'}};

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
    if $data->{"значение"} ~~ [qw(Ставка Начислено)];
  
  $data->{uid} = $c->auth_user->{id};
  my $r =  eval{$data->{'значение'} eq '' ? $c->model->удалить_значение($data) : $c->model->сохранить($data)};
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

1;