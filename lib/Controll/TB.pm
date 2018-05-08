package Controll::TB;
use Mojo::Base 'Mojolicious::Controller';

has model => sub {shift->app->models->{'TB'}};

1;