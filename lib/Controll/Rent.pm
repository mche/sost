package Controll::Rent;
use Mojo::Base 'Mojolicious::Controller';
use Util;

has model => sub {shift->app->models->{'Аренда'}};
#~ has model_nomen => sub {shift->app->models->{'Номенклатура'}};
#~ has model_obj => sub {shift->app->models->{'Object'}};
#~ has model_contragent => sub {shift->app->models->{'Contragent'}};

sub index {
  my $c = shift;
  return $c->render('аренда/index',
    handler=>'ep',
    'header-title' => 'Аренда помещений',
    assets=>["аренда.js",],
    );
}

sub объекты_список {
  my $c = shift;
  $c->render(json=>$c->model->список_объектов());
}


sub договоры_список {
  my $c = shift;
  $c->render(json=>[]);
}

sub сохранить_объект {
  my $c = shift;
  my $data = $c->req->json;
  map {
    my $room = $_;
    
    $data->{$_} = &Util::numeric($data->{$_})
    for qw(площадь);
    
    return $c->render(json=>{error=>"Не заполнен кабинет"})
      unless (scalar grep($room->{$_}, qw(номер-название этаж площадь))) eq 3;
    
    $room->{uid} = $c->auth_user->{id}
      unless $room->{id};
    
    $room->{id} = $c->model->сохранить_кабинет($room)->{id};
  } @{ $data->{'@кабинеты'}};
  
  $data->{uid} = $c->auth_user->{id}
      unless $data->{id};
  
  my $r = $c->model->сохранить_объект($data);
  $c->render(json=>{success=>$r});
  
}

1;