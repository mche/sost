#!/usr/bin/env perl
# find ~/perl5/lib/ -type f -exec grep -Hni 'Mojolicious (Perl)' {} \;

#~ use utf8::all;
#~ use warnings FATAL => 'all';
#~ use open ':encoding(UTF-8)';
#~ use open        qw< :std  :utf8     >;
#~ use open IO => ':encoding(UTF-8)';

use lib 'lib';
use Mojo::Base 'Mojolicious::Che';
#~ use MojoX::MIME::Types;

my $app = __PACKAGE__->new(config =>'config/Config.pm',);
# set in Mojolicious as default
#~ $app->types(MojoX::MIME::Types->new);
# инициация моделей - Это обязательно для hypnotoad, который запускает параллельные процессы и возникают конфликты postgresql tuple concurrently updated
$app->init_models();


  Mojo::IOLoop::Subprocess->new->run(
    sub {
      my $subprocess = shift;
      #~ sleep 5;
      $app->log->error("Minion has been stated pid $$");
      $app->start('minion', 'worker');
      return $$;
    },
    sub {
      my ($subprocess, $err, @results) = @_;
      $app->log->error('Minion has done ....', @results);
      #~ say "Subprocess error: $err" and return if $err;
    }
  ) if $app->renderer->get_helper('minion');

$app->start();# did not return an application object.
