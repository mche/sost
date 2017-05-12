package Controll::Waltex::Report;
use Mojo::Base 'Mojolicious::Controller';


#~ has model_project => sub {shift->app->models->{'Project'}};
#~ has model_wallet => sub {shift->app->models->{'Wallet'}};
has model => sub {shift->app->models->{'Waltex::Report'}};

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
  my $project = $c->vars('project') || $param->{'проект'}{id};
  my $date = $param->{'дата'} && $param->{'дата'}{values};
  
  $c->model->снимок_диапазона('проект'=>$project, 'даты'=>$date);
  
  my $data = $c->model->всего();# 'проект'=>$project, 'даты'=>$date
  
  
  my %cols = ();
  $data->{'строки'} = [];
  map {
    $cols{$_->{'код интервала'}} ||= $_->{"интервал"};
    push @{$data->{'строки'}}, {title=> $_->{title}, sign=>$_->{sign}, 'категория'=>3, 'всего'=>$data->{$_->{title}}{'всего'},}
      unless $data->{'строки'}[-1] && $data->{'строки'}[-1]{title} eq  $_->{title} ;
    $data->{'строки'}[-1]{'колонки'}{$_->{"интервал"}} = $_->{sum};
    
  } @{$c->model->движение_интервалы()};# 'проект'=>$project, 'даты'=>$date
  
  $data->{'колонки'} = [map $cols{$_}, sort keys %cols];
  
  map {
    $data->{'сальдо'}{'колонки'}{$_->{"интервал"}} = $_->{sum};
    
  } @{$c->model->движение_итого_интервалы()}; # 'проект'=>$project, 'даты'=>$date
  
  $data->{'сальдо'}{'всего'} = $c->model->итого(); # 'проект'=>$project, 'даты'=>$date
  
  $c->render(json=>$data);
}

sub row {
  my $c = shift;
  my $param =  $c->req->json;
  
  my $total = $c->model->строка_отчета_всего($param);
  
  my @data = ();
  map {
    $_->{sign} = $param->{sign};
    push @data, $_
      and $_->{'всего'} = $total->{$_->{"категория"}}{sum}
      unless @data && $data[-1]{title} eq  $_->{title};
    $data[-1]{'колонки'}{$_->{"интервал"}} = $_->{sum};
  } @{$c->model->строка_отчета_интервалы($param)};
  
  $c->render(json=>\@data);
  
}

1;