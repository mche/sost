package Controll::GuardWare;
use Mojo::Base 'Mojolicious::Controller';

has model => sub {shift->app->models->{'Спецодежда'}};


1;