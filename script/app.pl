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
$app->types->type(docx => ['application/vnd.openxmlformats-officedocument.wordprocessingml.document']);
# инициация моделей - Это обязательно для hypnotoad, который запускает параллельные процессы и возникают конфликты postgresql tuple concurrently updated
$app->init_models();
$app->start();# did not return an application object.
