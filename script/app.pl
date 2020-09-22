#!/usr/bin/env perl
# find ~/perl5/lib/ -type f -exec grep -Hni 'Mojolicious (Perl)' {} \;

#~ use utf8::all;
#~ use warnings FATAL => 'all';
#~ use open ':encoding(UTF-8)';
#~ use open        qw< :std  :utf8     >;
#~ use open IO => ':encoding(UTF-8)';

use lib 'lib';
use Mojo::Base 'Mojolicious::Che';
#~ use POSIX 'setsid';

my $app = __PACKAGE__->new(config =>'config/Config.pm',);
# set in Mojolicious as default
#~ $app->types(MojoX::MIME::Types->new);
# инициация моделей - Это обязательно для hypnotoad, который запускает параллельные процессы и возникают конфликты postgresql tuple concurrently updated
#~ $app->models() #унес в хук before_server_start
  #~ unless $ENV{HYPNOTOAD_PID} || $ENV{HYPNOTOAD_STOP};
#~ $app->minion->reset;
#~ $app->log->info("MINION_PID: $ENV{MINION_PID}");
#~ $app->minion->workers->manage();
$app->start();# did not return an application object.
