package Controll::Waltex::Report;
use Mojo::Base 'Mojolicious::Controller';


#~ has model_project => sub {shift->app->models->{'Project'}};
#~ has model_wallet => sub {shift->app->models->{'Wallet'}};
has model => sub {shift->app->models->{'Waltex::Report'}};

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
  $c->session(expiration => 30*7*24*3600);
  return $prefix.$name;
  
};

sub index {
  my $c = shift;
  return $c->render('waltex/report/index',
    handler=>'ep',
    'header-title' => 'Учет денежных средств',
    assets=>["waltex/report.js",],
    );

}

sub data {
  my $c = shift;
  my $param =  $c->req->json;
  return $c->все_кошельки
    if $param->{'все кошельки'};
  return $c->все_контрагенты
    if $param->{'все контрагенты'};
  return $c->все_профили
    if $param->{'все профили'};
  
  my $project = $c->vars('project') || ($param->{'проект'} && $param->{'проект'}{id}) || undef; # 0  - все проекты
  my $кошелек = $param->{'кошелек'} && $param->{'кошелек'}{id};
  my $контрагент = $param->{'контрагент'} && $param->{'контрагент'}{id};
  my $профиль = $param->{'профиль'} && $param->{'профиль'}{id};
  my $date = $param->{'дата'} && $param->{'дата'}{values};
  my @interval = split /\//, $param->{'интервал'};
  
  $c->model->temp_view_name($c->snapshot_name);
  $c->model->снимок_диапазона('проект'=>$project, 'кошелек'=>$кошелек, 'контрагент'=>$контрагент, 'профиль'=>$профиль, 'даты'=>$date, 'интервал'=>\@interval);
  
  
  my $o = $c->model->остатки_период('проект'=>$project, 'кошелек'=>$кошелек, 'даты'=>$date, ) # не отсекать контров и сотр 'контрагент'=>$контрагент, 'профиль'=>$профиль, 
    unless $кошелек || $контрагент || $профиль; ## общие остатки по конкретным позициям не нужны
  #~ $c->app->log->error($c->dumper($o));
  my $data = !$param->{'место интервалов'} || $param->{'место интервалов'} eq 'столбцы'
    ? $c->_по_столбцам
    : $c->_по_строкам($o ? $o->{'сальдо1'} : 0); # вычисляешь накопленное сальдо по интервалам от начального сальдо
  
  
  $data->{'сальдо'}{'начало'} = $o->{'сальдо1'}
    if $o;
  $data->{'сальдо'}{'конец'} = $o->{'сальдо2'}#$c->model->остаток_конец('проект'=>$project, 'кошелек'=>$кошелек, 'контрагент'=>$контрагент,  'даты'=>$date, );
    if $o;
  $data->{'итого'}{'всего'} = $c->model->итого_всего(); # куда засунуть в таблице
  
  $c->render(json=>$data);
}

sub _по_столбцам {
  my $c = shift;

  my $data = $c->model->всего();
  
  my %cols = ();
  $data->{'строки'} = [];
  map {
    $cols{$_->{'код интервала'}} ||= {title=>$_->{"интервал"}, id=>$_->{'код интервала'}};
    unless ($data->{'строки'}[-1] && $data->{'строки'}[-1]{title} eq  $_->{title}) { # новая базовая строка
      my $r = {title=> $_->{title}, sign=>$_->{sign}, 'категория'=>3, 'всего'=>$data->{$_->{title}}{'всего'}, };
      push @{$data->{'строки'}}, $r;
    }
    $data->{'строки'}[-1]{'колонки'}{$_->{"интервал"}} = $_->{sum};
    
  } @{$c->model->движение_интервалы_столбцы()};
  
  $data->{'колонки'} = [map $cols{$_}, sort keys %cols];
  
  map {
    $data->{'сальдо'}{'колонки'}{$_->{"интервал"}} = $_->{sum};
    
  } @{$c->model->движение_итого_интервалы()};
  
  return $data;
  
}

sub _по_строкам {# второй вариант таблицы
  my $c = shift;
  my $cum_ost = shift // '0.00 руб';# начальное сальдо 
  my $data = {};
  
  my $cols = $c->model->итого_колонки();
  $data->{'строки'} = $c->model->всего_строки();
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
  my $param =  $c->req->json;
  
  $c->model->temp_view_name($c->snapshot_name);
  
  return $c->_строка_все_кошельки($param)
    if $param->{'все кошельки'};
  
  return $c->_строка_все_контрагенты($param)
    if $param->{'все контрагенты'};
    
  return $c->_строка_все_профили($param)
    if $param->{'все профили'};
  
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
  my $param =  $c->req->json;
  my $project = $c->vars('project') || ($param->{'проект'} && $param->{'проект'}{id}) || undef; # 0  - все проекты
  my $date = $param->{'дата'} && $param->{'дата'}{values};
  my $кошелек = $param->{'кошелек'} && $param->{'кошелек'}{id};
  my $контрагент = $param->{'контрагент'} && $param->{'контрагент'}{id};
  my $профиль = $param->{'профиль'} && $param->{'профиль'}{id};
  
  $c->model->temp_view_name($c->snapshot_name);
  $c->model->снимок_диапазона('проект'=>$project, 'даты'=>$date,);
  
  my $data = {};
  my $cols = $c->model->итого_колонки();
  $data->{'строки'} = $c->model->всего_остатки_все_кошельки('проект'=>$project, 'даты'=>$date,);#всего_строки_все_кошельки();
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
  
  my $o = $c->model->остатки_период('проект'=>$project, 'даты'=>$date, );
  $data->{'сальдо'}{'начало'} = $o->{'сальдо1'};#$c->model->остаток_начало('проект'=>$project, 'даты'=>$date, );
  $data->{'сальдо'}{'конец'} = $o->{'сальдо2'};#$c->model->остаток_конец('проект'=>$project,  'даты'=>$date, );
  $data->{'итого'}{'всего'} = $c->model->итого_всего(); 
  
  $c->render(json=>$data);
  
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

sub все_контрагенты {# сразу весь список контрагентов
  my $c = shift;
  my $param =  $c->req->json;
  my $project = $c->vars('project') || ($param->{'проект'} && $param->{'проект'}{id}) || undef; # 0  - все проекты
  my $date = $param->{'дата'} && $param->{'дата'}{values};
  #~ my $кошелек = $param->{'кошелек'} && $param->{'кошелек'}{id};
  #~ my $контрагент = $param->{'контрагент'} && $param->{'контрагент'}{id};
  #~ my $профиль = $param->{'профиль'} && $param->{'профиль'}{id};
  
  $c->model->temp_view_name($c->snapshot_name);
  $c->model->снимок_диапазона('проект'=>$project, 'даты'=>$date, 'все контрагенты'=>1,);
  
  my $data = {};
  my $cols = $c->model->итого_колонки();
  $data->{'строки'} = $c->model->всего_остатки_все_контрагенты('проект'=>$project, 'даты'=>$date,);#всего_строки_все_контрагенты();
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
  my $total = $c->model->строка_отчета_всего_все_контрагенты($param);
  
  my @data = ();
  
  map {# -- позиции с конечной категорией
    my $r = $_;
    $r->{'колонки'}{$r->{sign}} = {map {$_  => $r->{$_}} qw(id дата_формат sum кошелек2)};
    push @data, $r;
    
  } @{$c->model->строка_отчета_интервалы_позиции_все_контрагенты($param)};
  
  map {# КАТЕГОРИИ
    push @data, $_
      and $_->{'всего'} = $total->{$_->{"категория"}}{sum}
      unless @data && $data[-1]{title} eq  $_->{title};
    $data[-1]{'колонки'}{$_->{sign}} = $_->{sum};
  } @{$c->model->строка_отчета_интервалы_все_контрагенты($param)};
  
  $c->render(json=>\@data);
  
}

sub все_профили {
  my $c = shift;
  my $param =  $c->req->json;
  my $project = $c->vars('project') || ($param->{'проект'} && $param->{'проект'}{id}) || undef; # 0  - все проекты
  my $date = $param->{'дата'} && $param->{'дата'}{values};
  #~ my $кошелек = $param->{'кошелек'} && $param->{'кошелек'}{id};
  #~ my $контрагент = $param->{'контрагент'} && $param->{'контрагент'}{id};
  #~ my $профиль = $param->{'профиль'} && $param->{'профиль'}{id};
  
  $c->model->temp_view_name($c->snapshot_name);
  $c->model->снимок_диапазона('проект'=>$project, 'даты'=>$date, 'все профили'=>1,);
  
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
    $r->{'колонки'}{$r->{sign}} = {map {$_  => $r->{$_}} qw(id дата_формат sum кошелек2)};
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

1;