package Controll::Transport;
use Mojo::Base 'Mojolicious::Controller';


has model => sub {shift->app->models->{'Transport'}};
#~ has model_nomen => sub {shift->app->models->{'Nomen'}};
#~ has model_obj => sub {shift->app->models->{'Object'}};
#~ has model_contragent => sub {shift->app->models->{'Contragent'}};

sub index {
  my $c = shift;
  #~ $c->index;
  return $c->render('transport/ask',
    handler=>'ep',
    'header-title' => 'Транспорт и техника',
    assets=>["transport/ask.js",],
    );
    #~ if $c->is_user_authenticated;
}

1;