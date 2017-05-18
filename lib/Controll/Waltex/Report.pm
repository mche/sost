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
  my $project = $c->vars('project') || ($param->{'проект'} && $param->{'проект'}{id}) || undef; # 0  - все проекты
  my $wallet = $param->{'кошелек'} && $param->{'кошелек'}{id};
  my $контрагент = $param->{'контрагент'} && $param->{'контрагент'}{id};
  my $date = $param->{'дата'} && $param->{'дата'}{values};
  my @interval = split /\//, $param->{'интервал'};
  
  $c->model->temp_view_name($c->snapshot_name);
  
  $c->model->снимок_диапазона('проект'=>$project, 'кошелек'=>$wallet, 'контрагент'=>$контрагент, 'даты'=>$date, 'интервал'=>\@interval);
  
  my $data = !$param->{'место интервалов'} || $param->{'место интервалов'} eq 'столбцы'
    ? $c->_по_столбцам
    : $c->_по_строкам;
  
  $data->{'сальдо'}{'начало'} = $c->model->остаток_начало('проект'=>$project, 'кошелек'=>$wallet, 'контрагент'=>$контрагент,  'даты'=>$date, );
  $data->{'сальдо'}{'всего'} = $c->model->итого();
  
  $c->render(json=>$data);
}

sub _по_столбцам {
  my $c = shift;
  my $data = $c->model->всего();
  
  
  my %cols = ();
  $data->{'строки'} = [];
  map {
    $cols{$_->{'код интервала'}} ||= {title=>$_->{"интервал"}, id=>$_->{'код интервала'}};
    push @{$data->{'строки'}}, {title=> $_->{title}, sign=>$_->{sign}, 'категория'=>3, 'всего'=>$data->{$_->{title}}{'всего'},}
      unless $data->{'строки'}[-1] && $data->{'строки'}[-1]{title} eq  $_->{title} ;
    $data->{'строки'}[-1]{'колонки'}{$_->{"интервал"}} = $_->{sum};
    
  } @{$c->model->движение_интервалы()};
  
  $data->{'колонки'} = [map $cols{$_}, sort keys %cols];
  
  map {
    $data->{'сальдо'}{'колонки'}{$_->{"интервал"}} = $_->{sum};
    
  } @{$c->model->движение_итого_интервалы()};
  
  return $data;
  
}

sub _по_строкам {# второй вариант таблицы
  my $c = shift;
  my $data = {};
  
  my $cols = $c->model->итого_колонки();
  my $rows = $c->model->всего_строки();
  my $body = $c->model->движение_интервалы2();
  
  $data->{'строки'} = [];
  map {
    my $r = $rows->{$_->{'код интервала'}};
    $r->{'категория'} = 3;
    push @{$data->{'строки'}}, $r
      unless $data->{'строки'}[-1] && $data->{'строки'}[-1]{title} eq  $_->{title};
    $data->{'строки'}[-1]{'колонки'}{$_->{sign}} = $_->{sum};
  } @$body;
  
  $data->{'колонки'} = [map $cols->{$_}, sort {$cols->{$a}{title} cmp $cols->{$b}{title}} keys %$cols];; #[{title=>'Приход', id=>"1"}, {title=>'Расход', id=>"-1"}];
  
  
  map {
    $data->{'сальдо'}{'колонки'}{$cols->{$_}{sign}} = $cols->{$_}{sum};
    
  } keys %$cols;
  
  
  return $data;
}

sub row {
  my $c = shift;
  my $param =  $c->req->json;
  
  $c->model->temp_view_name($c->snapshot_name);
  
  my $data = !$param->{'место интервалов'} || $param->{'место интервалов'} eq 'столбцы'
    ? $c->_строка_по_столбцам($param)
    : $c->_строка_по_строкам($param);
  
  $c->render(json=>$data);
  
}

sub _строка_по_столбцам {
  my ($c, $param) = @_;
  my $total = $c->model->строка_отчета_всего($param);
  
  my @data = ();
  
  map {# -- позиции с конечной категорией
    #~ $_->{sign} = $param->{sign};
    my $r = $_;
    $r->{'колонки'}{$r->{"интервал"}} = {map {$_  => $r->{$_}} qw(id дата_формат sum кошелек2)};
    push @data, $r;
    
  } @{$c->model->строка_отчета_интервалы_позиции($param)};
  
  map {# КАТЕГОРИИ
    $_->{sign} = $param->{sign};
    push @data, $_
      and $_->{'всего'} = $total->{$_->{"категория"}}{sum}
      unless @data && $data[-1]{title} eq  $_->{title};
    $data[-1]{'колонки'}{$_->{"интервал"}} = $_->{sum};
  } @{$c->model->строка_отчета_интервалы($param)};
  
  return \@data;
  
}

sub _строка_по_строкам {
  my ($c, $param) = @_;
  my $total = $c->model->строка_отчета_всего_2($param);
  
  my @data = ();
  
  map {# -- позиции с конечной категорией
    my $r = $_;
    $r->{'колонки'}{$r->{sign}} = {map {$_  => $r->{$_}} qw(id дата_формат sum кошелек2)};
    push @data, $r;
    
  } @{$c->model->строка_отчета_интервалы_позиции_2($param)};
  
  map {# КАТЕГОРИИ
    push @data, $_
      and $_->{'всего'} = $total->{$_->{"категория"}}{sum}
      unless @data && $data[-1]{title} eq  $_->{title};
    $data[-1]{'колонки'}{$_->{sign}} = $_->{sum};
  } @{$c->model->строка_отчета_интервалы_2($param)};
  
  return \@data;
  
}





1;