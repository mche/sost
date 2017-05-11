package Controll::Waltex::Report;
use Mojo::Base 'Mojolicious::Controller';


#~ has model_project => sub {shift->app->models->{'Project'}};
#~ has model_wallet => sub {shift->app->models->{'Wallet'}};
has model => sub {shift->app->models->{'Waltex::Report'}};

sub index {
  my $c = shift;
  return $c->render('waltex/report/index',
    handler=>'ep',
    'header-title' => 'Отчет - Учет денежных средств',
    assets=>["waltex/report.js",],
    );

}

sub data {
  my $c = shift;
  my $param =  $c->req->json;
  my $project = $c->vars('project');
  my $date = $param->{'дата'} && $param->{'дата'}{values};
  
  my $data = $c->model->всего('проект'=>$project, 'даты'=>$date);
  
  
  my %cols = ();
  map {
    $cols{$_->{'код интервала'}} ||= $_->{"интервал"};
    $data->{$_->{sign}}{'колонки'}{$_->{"интервал"}} = $_->{sum};
    
  } @{$c->model->движение_интервалы('проект'=>$project, 'даты'=>$date)};
  
  $data->{'колонки'} = [map $cols{$_}, sort keys %cols];
  
  map {
    $data->{'итого'}{'колонки'}{$_->{"интервал"}} = $_->{sum};
    
  } @{$c->model->движение_итого_интервалы('проект'=>$project, 'даты'=>$date)};
  
  $data->{'итого'}{'всего'} = $c->model->итого('проект'=>$project, 'даты'=>$date);
  
  $c->render(json=>$data);
}

1;