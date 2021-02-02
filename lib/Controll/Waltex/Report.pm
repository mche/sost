package Controll::Waltex::Report;
use Mojo::Base 'Mojolicious::Controller';


#~ has model_project => sub {shift->app->models->{'Project'}};
#~ has model_wallet => sub {shift->app->models->{'Wallet'}};
has model => sub { $_[0]->app->models->{'Waltex::Report'}->uid($_[0]->auth_user && $_[0]->auth_user->{id})};

has snapshot_name => sub {
  my $c = shift;
  my $key = 'Waltex::Report';
  my $prefix = 'движение денег-снимок';
  # Manipulate session
  if (my $name = $c->session->{$key}) {
    return $prefix.$name;
  }
  my $name = rand();
  $c->session->{$key} = $name; 
  # Expiration date in seconds from now (persists between requests)
  #~ $c->session(expiration => 30*7*24*3600);
  return $prefix.$name;
  
};

sub index {
  my $c = shift;
  return $c->render('waltex/report/index',
    handler=>'ep',
    'header-title' => 'Отчеты ДC',
    assets=>["waltex/report.js",],
    );

}

sub data {
  my $c = shift;
  $c->inactivity_timeout(10*60);
  my $param =  $c->req->json;
  return $c->to_xls($param)
    if $param->{'data'} || $param->{'строки'} || $param->{'колонки'};
  return $c->все_кошельки
    if $param->{'все кошельки'};
  return $c->все_кассы
    if $param->{'все кассы'};
  return $c->все_кошельки2
    if $param->{'все кошельки2'};
  return $c->все_контрагенты
    if $param->{'все контрагенты'};
  return $c->все_профили
    if $param->{'все профили'};
  return $c->все_объекты
    if $param->{'все объекты'};
  return $c->все_пустое_движение
    if $param->{'все пустое движение'};
  
  my $project = $c->vars('project') || ($param->{'проект'} && $param->{'проект'}{id}) || undef; # 0  - все проекты
  my $кошелек = $param->{'кошелек'} && $param->{'кошелек'}{id};
  my $кошелек2 = $param->{'кошелек2'} && $param->{'кошелек2'}{id};
  my $объект = $param->{'объект'} && $param->{'объект'}{id};
  my $контрагент = $param->{'контрагент'} && $param->{'контрагент'}{id};
  my $контрагенты  = $param->{'контрагенты'};
  my $профиль = $param->{'профиль'} && $param->{'профиль'}{id};
  my $date = $param->{'дата'} && $param->{'дата'}{values};
  my @interval = split /\//, $param->{'интервал'};
  
  $c->model->temp_view_name($c->snapshot_name);
  #~ $c->app->log->debug("снимок_диапазона начало");
  my %args = ('проект'=>$project, 'кошелек'=>$кошелек, 'кошелек2'=>$кошелек2, 'объект'=>$объект, 'контрагент'=>$контрагент, 'контрагенты'=>$контрагенты, 'профиль'=>$профиль, 'даты'=>$date, 'интервал'=>\@interval);
  $c->model->снимок_диапазона(%args);
  
  my $o = $c->model->остатки_период(%args); # не отсекать контров и сотр 'контрагент'=>$контрагент, 'профиль'=>$профиль, 
    #~ unless $объект || $контрагент || $профиль; ## общие остатки по конкретным позициям не нужны 'кошелек'=>$кошелек, 'объект'=>$объект,
  #~ $c->app->log->error($c->dumper($o));
  
  my $data = !$param->{'место интервалов'} || $param->{'место интервалов'} eq 'столбцы'
    ? $c->_по_столбцам
    : $c->_по_строкам($o ? $o->{'сальдо1'} : 0); # вычисляешь накопленное сальдо по интервалам от начального сальдо
  
  
  $data->{'сальдо'}{'начало'} = $o->{'сальдо1'}
    if $o;
  $data->{'сальдо'}{'конец'} = $o->{'сальдо2'}#$c->model->остаток_конец('проект'=>$project, 'кошелек'=>$кошелек, 'контрагент'=>$контрагент,  'даты'=>$date, );
    if $o;
  $data->{'итого'}{'всего'} = $c->model->итого_всего(); # куда засунуть в таблице
  $data->{'итого'}{'колонки'} = $c->model->движение_итого_интервалы_хэш()
    if !$param->{'место интервалов'} || $param->{'место интервалов'} eq 'столбцы';
  
  $c->render(json=>$data);
}

sub _по_столбцам {
  my $c = shift;

  my $data = $c->model->всего();
  
  
  
  my %cols = ();
  $data->{'строки'} = [];
  map {
    $cols{$_->{'код интервала'}} ||= {title=>$_->{"интервал"}, id=>$_->{'код интервала'}, key=>$_->{'код интервала'},};
    unless ($data->{'строки'}[-1] && $data->{'строки'}[-1]{title} eq  $_->{title}) { # новая базовая строка
      my $r = {title=> $_->{title}, sign=>$_->{sign}, 'категория'=>3, 'всего'=>$data->{$_->{title}}{'всего'}, };
      push @{$data->{'строки'}}, $r;
    }
    $data->{'строки'}[-1]{'колонки'}{$_->{"интервал"}} = $_->{sum};
    $data->{'строки'}[-1]{'колонки'}{$_->{"код интервала"}} = $_->{sum};
    
  } @{$c->model->движение_интервалы_столбцы()};
  
  $data->{'колонки'} = [map $cols{$_}, sort keys %cols];
  
  map {
    $data->{'сальдо'}{'колонки'}{$_->{"интервал"}} = $_->{sum};
    $data->{'сальдо'}{'колонки'}{$_->{"код интервала"}} = $_->{sum};
  } @{$c->model->движение_итого_интервалы()};
  #~ $c->log->error($c->dumper($data));
  return $data;
  
}

sub _по_строкам {# второй вариант таблицы
  my $c = shift;
  my $cum_ost = shift // '0.00 руб';# начальное сальдо 
  my $data = {};
  
  my $cols = $c->model->итого_колонки();
  $data->{'строки'} = $c->model->всего_строки();
  #~ $c->app->log->error($c->dumper($cols, $data->{'строки'}{'всего'}));
  my $body = $c->model->движение_интервалы_строки();
  
  map {
    #~ my $r = $rows->{$_->{'код интервала'}};
    my $r = $_;
    $r->{'категория'} = 3;
    $r->{'сальдо1'} =$cum_ost;
    $cum_ost = $c->model->сумма_двух_денег($cum_ost, $r->{'всего'});
    $r->{'сальдо2'} = $cum_ost;
    
    map {
      my $sum = $body->{$r->{key}.":".$_};
      $r->{'колонки'}{$_} = $sum->{sum};
      
    } (1, -1);
  } @{$data->{'строки'}};
  
  $data->{'колонки'} = [ map $cols->{$_} || {sign=>$_, key=>$_, title=> $_ > 0 ? 'Приход' : 'Расход'}, (1, -1)]; #[{title=>'Приход', id=>"1"}, {title=>'Расход', id=>"-1"}];
  
  
  map {
    $data->{'сальдо'}{'колонки'}{$cols->{$_}{sign}} = $cols->{$_}{sum};
    
  } keys %$cols;
  
  
  return $data;
}

sub row {
  my $c = shift;
  my $param =  shift || $c->req->json;
  
  $c->model->temp_view_name($c->snapshot_name);
  
  #~ 
  
  return $c->_строка_все_кошельки($param)
    if $param->{'все кошельки'} || $param->{'все кассы'};
    
  return $c->_строка_все_кошельки2($param)
    if $param->{'все кошельки2'};
  
  return $c->_строка_все_контрагенты($param)
    if $param->{'все контрагенты'};
    
  return $c->_строка_все_профили($param)
    if $param->{'все профили'};
  
  return $c->_строка_все_объекты($param)
    if $param->{'все объекты'};
  
  my $data = !$param->{'место интервалов'} || $param->{'место интервалов'} eq 'столбцы'
    ? $c->_строка_по_столбцам($param)
    : $c->_строка_по_строкам($param);
  
  $c->render(json=>$data);
  
}

sub _строка_по_столбцам {
  my ($c, $param) = @_;
  my $total = $c->model->строка_отчета_всего_столбцы($param);
  
  my @data = ();
  
  map {# -- позиции с конечной категорией
    #~ $_->{sign} = $param->{sign};
    my $r = $_;
    $r->{'колонки'}{$r->{"интервал"}} = {map {$_  => $r->{$_}} qw(id дата_формат sum кошелек2)};
    push @data, $r;
    
  } @{$c->model->строка_отчета_интервалы_позиции_столбцы($param)};
  
  map {# КАТЕГОРИИ
    $_->{sign} = $param->{sign};
    push @data, $_
      and $_->{'всего'} = $total->{$_->{"категория"}}{sum}
      unless @data && $data[-1]{title} eq  $_->{title};
    $data[-1]{'колонки'}{$_->{"интервал"}} = $_->{sum};
    $data[-1]{'колонки'}{$_->{"код интервала"}} = $_->{sum};
  } @{$c->model->строка_отчета_интервалы_столбцы($param)};
  
  return \@data;
  
}

sub _строка_по_строкам {
  my ($c, $param) = @_;
  my $total = $c->model->строка_отчета_всего_строки($param);
  
  my @data = ();
  
  map {# -- позиции с конечной категорией
    my $r = $_;
    $r->{'колонки'}{$r->{sign}} = {map {$_  => $r->{$_}} qw(id дата_формат sum кошелек2)};
    push @data, $r;
    
  } @{$c->model->строка_отчета_интервалы_позиции_строки($param)};
  
  map {# КАТЕГОРИИ
    push @data, $_
      and $_->{'всего'} = $total->{$_->{"категория"}}{sum}
      unless @data && $data[-1]{title} eq  $_->{title};
    $data[-1]{'колонки'}{$_->{sign}} = $_->{sum};
  } @{$c->model->строка_отчета_интервалы_строки($param)};
  
  return \@data;
  
}

sub все_кошельки {# сразу весь список кошельков
  my $c = shift;
  my $param = shift || $c->req->json;
  my $project = $c->vars('project') || ($param->{'проект'} && $param->{'проект'}{id}) || undef; # 0  - все проекты
  my $date = $param->{'дата'} && $param->{'дата'}{values};
  my $кошелек = $param->{'кошелек'} && $param->{'кошелек'}{id};
  my $кошелек2 = $param->{'кошелек2'} && $param->{'кошелек2'}{id};
  my $контрагент = $param->{'контрагент'} && $param->{'контрагент'}{id};
  my $объект = $param->{'объект'} && $param->{'объект'}{id};
  my $профиль = $param->{'профиль'} && $param->{'профиль'}{id};
  
  $c->model->temp_view_name($c->snapshot_name);
  my %args = ('проект'=>$project, 'даты'=>$date, 'кошелек2'=>$кошелек2, 'кошельки'=>$param->{'кошельки'}, 'кошельки/IN'=>$param->{'кошельки/IN'}, 'объект'=>$объект, 'контрагент'=>$контрагент, 'профиль'=>$профиль,);
  $c->model->снимок_диапазона(%args);#'все кошельки'=>установлен, потому что не указ кошелек в передаче
  
  my $data = {};
  my $cols = $c->model->итого_колонки();
  $data->{'строки'} = $c->model->всего_остатки_все_кошельки(%args);#всего_строки_все_кошельки();
  my $body = $c->model->движение_все_кошельки();
  
  map {
    my $r = $_;
    $r->{'категория'} = 3;
    $r->{'кошелек/id'} = $r->{'кошельки/id'}[0][1];
    
    map {
      my $sum = $body->{$r->{key}.":".$_};# в теле длинный ключ со знаком
      $r->{'колонки'}{$_} = $sum->{sum};
    } (1, -1);
  } @{$data->{'строки'}};
  
  $data->{'колонки'} = [ map $cols->{$_} || {sign=>$_, key=>$_, title=> $_ > 0 ? 'Приход' : 'Расход'}, (1, -1)]; #[{title=>'Приход', id=>"1"}, {title=>'Расход', id=>"-1"}];
  
  
  map {
    $data->{'сальдо'}{'колонки'}{$cols->{$_}{sign}} = $cols->{$_}{sum};
    
  } keys %$cols;
  
  my $o = $c->model->остатки_период(%args);
  $data->{'сальдо'}{'начало'} = $o->{'сальдо1'};#$c->model->остаток_начало('проект'=>$project, 'даты'=>$date, );
  $data->{'сальдо'}{'конец'} = $o->{'сальдо2'};#$c->model->остаток_конец('проект'=>$project,  'даты'=>$date, );
  $data->{'итого'}{'всего'} = $c->model->итого_всего(); 
  
  $c->render(json=>$data);
  
}

sub все_кассы {# выборочные кошельки
  my $c = shift;
  my $param = shift || $c->req->json;
  $param->{'кошельки/IN'}=q! select id from "кошельки" where title~*'касса' !;
  delete $param->{'кошелек'};
  $c->все_кошельки($param);
}

sub _строка_все_кошельки {
  my ($c, $param) = @_;
  my $total = $c->model->строка_отчета_всего_все_кошельки($param);
  
  my @data = ();
  
  map {# -- позиции с конечной категорией
    my $r = $_;
    $r->{'колонки'}{$r->{sign}} = {map {$_  => $r->{$_}} qw(id дата_формат sum кошелек2)};
    push @data, $r;
    
  } @{$c->model->строка_отчета_интервалы_позиции_все_кошельки($param)};
  
  map {# КАТЕГОРИИ
    push @data, $_
      and $_->{'всего'} = $total->{$_->{"категория"}}{sum}
      unless @data && $data[-1]{title} eq  $_->{title};
    $data[-1]{'колонки'}{$_->{sign}} = $_->{sum};
  } @{$c->model->строка_отчета_интервалы_все_кошельки($param)};
  
  $c->render(json=>\@data);
  
}

sub все_кошельки2 {# сразу весь список кошельков перемещения
  my $c = shift;
  my $param =  $c->req->json;
  my $project = $c->vars('project') || ($param->{'проект'} && $param->{'проект'}{id}) || undef; # 0  - все проекты
  my $date = $param->{'дата'} && $param->{'дата'}{values};
  my $кошелек = $param->{'кошелек'} && $param->{'кошелек'}{id};
  #~ my $кошелек2 = $param->{'кошелек2'} && $param->{'кошелек2'}{id};
  my $контрагент = $param->{'контрагент'} && $param->{'контрагент'}{id};
  my $объект = $param->{'объект'} && $param->{'объект'}{id};
  my $профиль = $param->{'профиль'} && $param->{'профиль'}{id};
  
  $c->model->temp_view_name($c->snapshot_name);
  my %args = ('проект'=>$project, 'даты'=>$date, 'кошелек'=>$кошелек, 'все кошельки2'=>1);
  $c->model->снимок_диапазона(%args);#'все кошельки'=>установлен, потому что не указ кошелек в передаче
  
  my $data = {};
  my $cols = $c->model->итого_колонки();
  $data->{'строки'} = $c->model->всего_остатки_все_кошельки2('проект'=>$project, 'даты'=>$date, );#всего_строки_все_кошельки();
  my $body = $c->model->движение_все_кошельки2();
  
  map {
    my $r = $_;
    $r->{'категория'} = 3;
    #~ $r->{'кошелек/id'} = $r->{'кошельки/id'}[0][1];
    
    map {
      my $sum = $body->{$r->{key}.":".$_};# в теле длинный ключ со знаком
      $r->{'колонки'}{$_} = $sum->{sum};
    } (1, -1);
  } @{$data->{'строки'}};
  
  $data->{'колонки'} = [ map $cols->{$_} || {sign=>$_, key=>$_, title=> $_ > 0 ? 'Приход' : 'Расход'}, (1, -1)]; #[{title=>'Приход', id=>"1"}, {title=>'Расход', id=>"-1"}];
  
  
  map {
    $data->{'сальдо'}{'колонки'}{$cols->{$_}{sign}} = $cols->{$_}{sum};
    
  } keys %$cols;
  
  my $o = $c->model->остатки_период(%args );
  $data->{'сальдо'}{'начало'} = $o->{'сальдо1'};#$c->model->остаток_начало('проект'=>$project, 'даты'=>$date, );
  $data->{'сальдо'}{'конец'} = $o->{'сальдо2'};#$c->model->остаток_конец('проект'=>$project,  'даты'=>$date, );
  $data->{'итого'}{'всего'} = $c->model->итого_всего(); 
  
  $c->render(json=>$data);
  
}

sub _строка_все_кошельки2 {
  my ($c, $param) = @_;
  my $total = $c->model->строка_отчета_всего_все_кошельки2($param);
  
  my @data = ();
  
  map {# -- позиции с конечной категорией
    my $r = $_;
    $r->{'колонки'}{$r->{sign}} = {map {$_  => $r->{$_}} qw(id дата_формат sum кошелек2)};
    push @data, $r;
    
  } @{$c->model->строка_отчета_интервалы_позиции_все_кошельки2($param)};
  
  map {# КАТЕГОРИИ
    push @data, $_
      and $_->{'всего'} = $total->{$_->{"категория"}}{sum}
      unless @data && $data[-1]{title} eq  $_->{title};
    $data[-1]{'колонки'}{$_->{sign}} = $_->{sum};
  } @{$c->model->строка_отчета_интервалы_все_кошельки2($param)};
  
  $c->render(json=>\@data);
  
}

sub все_контрагенты {# сразу весь список контрагентов/или выботочные ид контрагентов
  my $c = shift;
  my $param = shift || $c->req->json;
  my $project = $c->vars('project') || ($param->{'проект'} && $param->{'проект'}{id}) || undef; # 0  - все проекты
  my $date = $param->{'дата'} && $param->{'дата'}{values};
  my $кошелек = $param->{'кошелек'} && $param->{'кошелек'}{id};
  #~ my $кошелек2 = $param->{'кошелек2'} && $param->{'кошелек2'}{id};
  my $контрагенты = $param->{'контрагенты'};
  my $объект = $param->{'объект'} && $param->{'объект'}{id};
  #~ my $профиль = $param->{'профиль'} && $param->{'профиль'}{id};
  $c->model->temp_view_name($c->snapshot_name);
  my %args = ('проект'=>$project, 'даты'=>$date, 'кошелек'=>$кошелек, 'объект'=>$объект, $контрагенты ? ('контрагенты'=>$контрагенты) : ('все контрагенты'=>1), $param->{'аренда'} ? ('аренда'=>1) : ());
  $c->model->снимок_диапазона(\%args);
  
  my $data = {};
  my $cols = $c->model->итого_колонки();
  $data->{'строки'} = $c->model->всего_остатки_все_контрагенты(\%args);#всего_строки_все_контрагенты();
  my $body = $c->model->движение_все_контрагенты();
  
  
  map {
    my $r = $_;
    $r->{'категория'} = 3;
    #~ $r->{'контрагент/id'} //= $r->{key};
    
    map {
      my $sum = $body->{$r->{key}.":".$_};# в теле длинный ключ со знаком
      $r->{'колонки'}{$_} = $sum->{sum};
    } (1, -1);
  } @{$data->{'строки'}};
  
  $data->{'колонки'} = [ map $cols->{$_} || {sign=>$_, key=>$_, title=> $_ > 0 ? 'Приход' : 'Расход'}, (1, -1)]; #[{title=>'Приход', id=>"1"}, {title=>'Расход', id=>"-1"}];
  
  
  map {
    $data->{'сальдо'}{'колонки'}{$cols->{$_}{sign}} = $cols->{$_}{sum};
    
  } keys %$cols;
  
  # нет смысла общих остатков
  #~ my $o = $c->model->остатки_период('проект'=>$project, 'даты'=>$date, );
  #~ $data->{'сальдо'}{'начало'} = $o->{'сальдо1'};#$c->model->остаток_начало('проект'=>$project, 'даты'=>$date, );
  #~ $data->{'сальдо'}{'конец'} = $o->{'сальдо2'};#$c->model->остаток_конец('проект'=>$project,  'даты'=>$date, );
  $data->{'итого'}{'всего'} = $c->model->итого_всего(); 
  
  $c->render(json=>$data);
  
}

sub _строка_все_контрагенты {
  my ($c, $param) = @_;
  #~ $c->log->error($c->snapshot_name, $c->dumper($param));
  my $total = $c->model->строка_отчета_всего_все_контрагенты($param);
  #~ $c->log->error($c->snapshot_name, $c->dumper($total));
  my @data = ();
  
  map {# -- позиции с конечной категорией
    my $r = $_;
    $r->{'колонки'}{$r->{sign}} = {map {$_  => $r->{$_}} qw(id дата_формат sum кошелек2)};
    push @data, $r;
    
  } @{$c->model->строка_отчета_интервалы_позиции_все_контрагенты($param)};
  
  my $r = $c->model->строка_отчета_интервалы_все_контрагенты($param);
  map {# КАТЕГОРИИ
    push(@data, $_)
      and $_->{'всего'} = $total->{$_->{"категория"}}{sum}
      unless @data && $data[-1]{title} eq  $_->{title};
    $data[-1]{'колонки'}{$_->{sign}} = $_->{sum};
  } @$r;
  
  $c->render(json=>\@data);
}

sub все_профили {
  my $c = shift;
  my $param =  $c->req->json;
  my $project = $c->vars('project') || ($param->{'проект'} && $param->{'проект'}{id}) || undef; # 0  - все проекты
  my $date = $param->{'дата'} && $param->{'дата'}{values};
  my $кошелек = $param->{'кошелек'} && $param->{'кошелек'}{id};
  #~ my $контрагент = $param->{'контрагент'} && $param->{'контрагент'}{id};
  my $профиль = $param->{'профиль'} && $param->{'профиль'}{id};
  $c->model->temp_view_name($c->snapshot_name);
  $c->model->снимок_диапазона('проект'=>$project, 'даты'=>$date, 'кошелек'=>$кошелек, 'профиль'=>$профиль, 'все профили'=>1,);
  
  my $data = {};
  my $cols = $c->model->итого_колонки();
  $data->{'строки'} = $c->model->всего_остатки_все_профили('проект'=>$project, 'даты'=>$date,);#всего_строки_все_контрагенты();
  my $body = $c->model->движение_все_профили();
  
  
  map {
    my $r = $_;
    $r->{'категория'} = 3;
    $r->{'профиль/id'} //= $r->{key};
    
    map {
      my $sum = $body->{$r->{key}.":".$_};# в теле длинный ключ со знаком
      $r->{'колонки'}{$_} = $sum->{sum};
    } (1, -1);
  } @{$data->{'строки'}};
  
  $data->{'колонки'} = [ map {
    $cols->{$_}{title} = $_ > 0 ? 'Начислено' : 'Выплачено'
      if $cols->{$_};
    $cols->{$_} || {sign=>$_, key=>$_, title=> $_ > 0 ? 'Начислено' : 'Выплачено'};
  } (1, -1)]; #[{title=>'Приход', id=>"1"}, {title=>'Расход', id=>"-1"}];
  
  
  map {
    $data->{'сальдо'}{'колонки'}{$cols->{$_}{sign}} = $cols->{$_}{sum};
    
  } keys %$cols;
  
  # нет смысла общих остатков
  #~ my $o = $c->model->остатки_период('проект'=>$project, 'даты'=>$date, );
  #~ $data->{'сальдо'}{'начало'} = $o->{'сальдо1'};#$c->model->остаток_начало('проект'=>$project, 'даты'=>$date, );
  #~ $data->{'сальдо'}{'конец'} = $o->{'сальдо2'};#$c->model->остаток_конец('проект'=>$project,  'даты'=>$date, );
  $data->{'итого'}{'всего'} = $c->model->итого_всего(); 
  
  $c->render(json=>$data);
  
  
}

sub _строка_все_профили {
  my ($c, $param) = @_;
  my $total = $c->model->строка_отчета_всего_все_профили($param);
  
  my @data = ();
  
  map {# -- позиции с конечной категорией
    my $r = $_;
    $r->{'колонки'}{$r->{sign}} = {map {$_  => $r->{$_}} qw(id дата_формат sum кошелек2 профиль/id)};# убрал 
    #~ $r->{'колонки'}{$r->{sign}}{} = 
    push @data, $r;
    
  } @{$c->model->строка_отчета_интервалы_позиции_все_профили($param)};
  
  map {# КАТЕГОРИИ
    push @data, $_
      and $_->{'всего'} = $total->{$_->{"категория"}}{sum}
      unless @data && $data[-1]{title} eq  $_->{title};
    $data[-1]{'колонки'}{$_->{sign}} = $_->{sum};
  } @{$c->model->строка_отчета_интервалы_все_профили($param)};
  
  $c->render(json=>\@data);
  
}

sub все_объекты {# сразу весь список объектов
  my $c = shift;
  my $param =  $c->req->json;
  my $project = $c->vars('project') || ($param->{'проект'} && $param->{'проект'}{id}) || undef; # 0  - все проекты
  my $date = $param->{'дата'} && $param->{'дата'}{values};
  my $кошелек = $param->{'кошелек'} && $param->{'кошелек'}{id};
  my $контрагент = $param->{'контрагент'} && $param->{'контрагент'}{id};
  #~ my $профиль = $param->{'профиль'} && $param->{'профиль'}{id};
  $c->model->temp_view_name($c->snapshot_name);
  $c->model->снимок_диапазона('проект'=>$project, 'даты'=>$date, 'кошелек'=>$кошелек, 'контрагент'=>$контрагент, 'все объекты'=>1,);
  
  my $data = {};
  my $cols = $c->model->итого_колонки();
  $data->{'строки'} = $c->model->всего_остатки_все_объекты('проект'=>$project, 'даты'=>$date, 'кошелек'=>$кошелек, 'контрагент'=>$контрагент, 'все объекты'=>1,);#всего_строки_все_контрагенты();
  my $body = $c->model->движение_все_объекты();
  
  
  map {
    my $r = $_;
    $r->{'категория'} = 3;
    #~ $r->{'всего'} = 0;
    #~ $r->{'контрагент/id'} //= $r->{key};
    
    map {
      my $sum = $body->{$r->{key}.":".$_};# в теле длинный ключ со знаком
      $r->{'колонки'}{$_} = $sum->{sum};
    } (1, -1);
  } @{$data->{'строки'}};
  
  $data->{'колонки'} = [ map $cols->{$_} || {sign=>$_, key=>$_, title=> $_ > 0 ? 'Приход' : 'Расход'}, (1, -1)]; #[{title=>'Приход', id=>"1"}, {title=>'Расход', id=>"-1"}];
  
  
  map {
    $data->{'сальдо'}{'колонки'}{$cols->{$_}{sign}} = $cols->{$_}{sum};
    
  } keys %$cols;
  
  # нет смысла общих остатков
  #~ my $o = $c->model->остатки_период('проект'=>$project, 'даты'=>$date, );
  #~ $data->{'сальдо'}{'начало'} = $o->{'сальдо1'};#$c->model->остаток_начало('проект'=>$project, 'даты'=>$date, );
  #~ $data->{'сальдо'}{'конец'} = $o->{'сальдо2'};#$c->model->остаток_конец('проект'=>$project,  'даты'=>$date, );
  $data->{'итого'}{'всего'} = $c->model->итого_всего(); 
  
  $c->render(json=>$data);
  
}

sub _строка_все_объекты {
  my ($c, $param) = @_;
  my $total = $c->model->строка_отчета_всего_все_объекты($param);
  
  my @data = ();
  
  map {# -- позиции с конечной категорией
    my $r = $_;
    $r->{'колонки'}{$r->{sign}} = {map {$_  => $r->{$_}} qw(id дата_формат sum кошелек2 объект объект/id)};
    push @data, $r;
    
  } @{$c->model->строка_отчета_интервалы_позиции_все_объекты($param)};
  
  map {# КАТЕГОРИИ
    push @data, $_
      and $_->{'всего'} = $total->{$_->{"категория"}}{sum}
      unless @data && $data[-1]{title} eq  $_->{title};
    $data[-1]{'колонки'}{$_->{sign}} = $_->{sum};
  } @{$c->model->строка_отчета_интервалы_все_объекты($param)};
  
  $c->render(json=>\@data);
  
}

sub все_пустое_движение {# как интервалы по столбцам
  my $c = shift;
  my $param =  $c->req->json;
  my $project = $c->vars('project') || ($param->{'проект'} && $param->{'проект'}{id}) || undef; # 0  - все проекты
  my $date = $param->{'дата'} && $param->{'дата'}{values};
  my $кошелек = $param->{'кошелек'} && $param->{'кошелек'}{id};
  #~ my $контрагент = $param->{'контрагент'} && $param->{'контрагент'}{id};
  #~ my $профиль = $param->{'профиль'} && $param->{'профиль'}{id};
  my @interval = split /\//, $param->{'интервал'};
  $c->model->temp_view_name($c->snapshot_name);
  $c->model->снимок_диапазона('проект'=>$project, 'даты'=>$date, 'кошелек'=>$кошелек,  'интервал'=>\@interval, 'пустое движение'=>1,);
  
  #~ my $o = $c->model->остатки_период('проект'=>$project,  'даты'=>$date, );
  my $data = !$param->{'место интервалов'} || $param->{'место интервалов'} eq 'столбцы'
    ? $c->_по_столбцам
    : $c->_по_строкам(0); # вычисляешь накопленное сальдо по интервалам от начального сальдо
  
  
  #~ $data->{'сальдо'}{'начало'} = $o->{'сальдо1'}
    #~ if $o;
  #~ $data->{'сальдо'}{'конец'} = $o->{'сальдо2'}#$c->model->остаток_конец('проект'=>$project, 'кошелек'=>$кошелек, 'контрагент'=>$контрагент,  'даты'=>$date, );
    #~ if $o;
  $data->{'итого'}{'всего'} = $c->model->итого_всего(); # куда засунуть в таблице
  
  $c->render(json=>$data);
  
}

sub to_xls {# выгрузка строк таблицы отчета в ексцель
  my ($c, $data) = @_;
  #~ $c->log->error($c->dumper($data));
  #~ return $c->render(json=>$data);
  
  require Excel::Writer::XLSX;
  my $tmp = Mojo::File::tempfile(DIR=>'static/tmp');
  $$tmp .= '.xlsx';
  #~ open my $xfh, '>', \my $fdata or die "Failed to open filehandle: $!";
  open my $xfh, '>', $tmp->to_string
    or die "Failed to open filehandle: $!";
  my $workbook  = Excel::Writer::XLSX->new( $xfh );
  my $worksheet = $workbook->add_worksheet();
  
  my ($row, $col) = (0,0);
  $worksheet->set_column( 0, 0, 50 );
  $worksheet->set_column( 1, 4+(scalar @{ $data->{data}{'колонки'} }), 20 );
  
  
  $worksheet->set_row($row, 20);
  $worksheet->write($row, 0, 'Проект');
  $worksheet->write($row++, 1, ($data->{param}{'проект'} && $data->{param}{'проект'}{name}) || 'все', $workbook->add_format(bold=>1, color=>'purple', size=>14,));
   #~ if $data->{param}{'проект'} && $data->{param}{'проект'}{name};
  
  
  $worksheet->write($row++, 0, 'Период');
  $worksheet->write($row, 0, 'От', $workbook->add_format( align=>'right'));
  $worksheet->write($row++, 1, $data->{param}{'дата'}{'формат'}[0], $workbook->add_format(bold=>1, bg_color=>'#CCFFCC'));
  $worksheet->write($row, 0, 'До', $workbook->add_format( align=>'right'));
  $worksheet->write($row++, 1, $data->{param}{'дата'}{'формат'}[1], $workbook->add_format(bold=>1, bg_color=>'#CCFFCC'));
  
  my $num_format = '# ##0.00 [$₽-419];[RED]-# ##0.00 [$₽-419]'; #$workbook->add_format( num_format=> '# ##0.00 [$₽-419];[RED]-# ##0.00 [$₽-419]');
  my %колонки = ();
  $row++;
  $worksheet->set_row($row, 30);
  $worksheet->write($row++, 0, [
    'Интервалы / Категории',
    "Сальдо на\n$data->{param}{'дата'}{'формат'}[0]",
    (map {$_->{'номер колонки'}++; $колонки{$_->{key}} = $_; $c->_title_format($_->{title});} @{ $data->{data}{'колонки'} }),
    "Всего",
    "Сальдо на\n$data->{param}{'дата'}{'формат'}[1]",
  ], $workbook->add_format(top=>1, bottom=>1, align=>'center', bold=>1, bg_color=>'#B2DFDB', size=>13,));
  #$data->{data}{'сальдо'}{'начало'}
  
  my $parent_title = '';
  my $level = 0;
  my $ncol = scalar keys %колонки;
  for my $r (@{$data->{data}{'строки'}}) {
    next
      unless !defined($r->{show}) || !!$r->{show} ;
    #~ $parent_title = ''
      #~ unless $_->{level};
    $r->{level} //= 0;
    
    if ($r->{id}){# финальная запись
      $row--;
      #~ my $n = $колонки{$r->{'код интервала'}}{'номер колонки'};
      #~ $worksheet->write($row, 0, [
          #~ undef,
          #~ undef,
          #~ $n ? ((undef) x ($n)) : (),
        #~ ],
        #~ $workbook->add_format(bg_color=>'#DDDDDD'),
      #~ );
      #~ $worksheet->write($row, 2+$n, 
        #~ join("\n", ($r->{sign} eq 1 ? '' : '-').$r->{sum}, $r->{дата_формат}, "$r->{'кошельки'}[1][0]:$r->{'кошельки'}[1][1]", "$r->{'кошельки'}[0][0]:$r->{'кошельки'}[0][1]", $r->{'примечание'}),# "кошельки" => [["С.В.", "касса"],["Гарантия","--- расходы по объектам" ]],
        #~ $workbook->add_format(valign => 'top',),
      #~ );
      #~ $worksheet->write($row, 3+$n, [
          #~ ($n+1)<$ncol ? ((undef) x ($ncol-$n-1)) : (),
          #~ undef,
          #~ undef,
        #~ ],
        #~ $workbook->add_format(bg_color=>'#DDDDDD'),
      #~ );
      #~ $worksheet->set_row($row, 50);
      
    } else {
      my $title = !$r->{level} ? $r->{title} : $level eq $r->{level} ? $parent_title || $r->{title} :  $r->{title};#"$parent_title/".
      $worksheet->write($row, 0, $c->_title_format(($r->{level} ? "       " x $r->{level} : '').$title), $workbook->add_format( text_wrap=>1,bottom=>4, !$r->{level} ? (top=>1, bold=>1, size=>12,) :(bg_color => $r->{sign} eq 1 ? '#A5D6A7' : '#FFCC80'),));
      $worksheet->write($row, 1, [
        #~ $c->_title_format(($r->{level} ? "   " x $r->{level} : '').$title),
        $r->{'сальдо1'} && $c->_money($r->{'сальдо1'}),
        (map {
          $r->{'колонки'}{$_} && $c->_money($r->{'колонки'}{$_})
        } sort {($a<0 ? (-1*$a).'000' : $a) cmp ($b<0 ?  (-1*$b).'000' : $b)} keys %колонки),#
        $r->{'всего'} && $c->_money($r->{'всего'}),
        $r->{'сальдо2'} && $c->_money($r->{'сальдо2'}),
      ],
      $workbook->add_format(num_format=> $num_format, right=>4, bottom=>4, !$r->{level} ? (align=>'center', top=>1, size=>12,) :(bg_color=> $r->{sign} eq 1 ? '#A5D6A7' : '#FFCC80',),)# 
      );
      $worksheet->set_row($row, 30)
        if length($title) > 35;
    }
    
    #~ $parent_title = $title
      #~ if $level ne $r->{level};
    $level = $r->{level} // 0;
    $row++;
  }
  
  $worksheet->set_row($row, 20);
  $worksheet->write($row++, 0, [
      'ИТОГО',
      $c->_money($data->{data}{'сальдо'}{'начало'}),
      (map {$data->{data}{'сальдо'}{'колонки'} ? $c->_money($data->{data}{'сальдо'}{'колонки'}{$_}) : $c->_money($data->{data}{'итого'}{'колонки'}{$_}{sum}) } sort {($a<0 ? (-1*$a).'000' : $a) cmp ($b<0 ?  (-1*$b).'000' : $b)}  keys %колонки),#
      $c->_money($data->{data}{'итого'}{'всего'}),
      $c->_money($data->{data}{'сальдо'}{'конец'}),
    ],
    $workbook->add_format(num_format=> $num_format, right=>4, top=>1, bottom=>1, align=>'center', size=>14, bold=>1, bg_color=>'#B2DFDB',)
  );
  
  $workbook->close();
  #~ $c->render_file('data' => $fdata, format=>'xlsx');
  return $c->render(json=>{file=>$tmp->basename, filename => 'отчет.xlsx', format=>'xlsx', });
}

sub _title_format {
  my ($c, $title) = @_;
  $title =~ s/ря(\s+\d+)$/"рь$1"/ier
    =~ s/ля(\s+\d+)$/"ль$1"/ier
    =~ s/марта(\s+\d+)$/"март$1"/ier
    =~ s/мая(\s+\d+)$/"май$1"/ier
    =~ s/марта(\s+\d+)$/"март$1"/ier
    =~ s/июня(\s+\d+)$/"июнь$1"/ier
    =~ s/августа(\s+\d+)$/"август$1"/ier
}

sub _money {
  my ($c, $num) = @_;
  $num =~ s/(\d+)\s+(\d+)/"$1$2"/egr
    =~ s/\s+|₽//gr
    =~ s/,/./r
}

#~ sub _финальная_запись {
  #~ my ($c, $workbook, $worksheet, $row, $r) = @_;
  
#~ }

1;