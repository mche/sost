package Controll::TMC::Cert;
use Mojo::Base 'Mojolicious::Controller';

has model => sub {shift->app->models->{'TMC::Cert'}};
#~ has model_nomen => sub {shift->app->models->{'Номенклатура'}};
#~ has model_obj => sub {shift->app->models->{'Object'}};
#~ has model_contragent => sub {shift->app->models->{'Contragent'}};
#~ has model_transport => sub {shift->app->models->{'Transport'}};

sub index {
  my $c = shift;
  return $c->render('тмц/сертификаты',
    handler=>'ep',
    'header-title' => 'Сертификаты ТМЦ',
    assets=>["тмц/сертификаты.js",],
    );
}

sub закупки {
  my $c = shift;
  my $data = $c->model->закупки();
  $c->render(json=>$data);
}

sub папки {
  my $c = shift;
  my $data = $c->model->папки();
  $c->render(json=>$data);
}

sub сохранить_папку {
  my $c = shift;
  my $data = $c->req->json;
  #~ $data->{id}=123
    #~ if !$data->{id};
  #~ $data->{title}=$data->{'наименование'};
  my $r = $c->model->сохранить_папку($data);
  $c->render(json=>ref $r ? {success=>$r} : {error=>$r});
  
}

1;