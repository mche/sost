#!/usr/bin/env perl
# find ~/perl5/lib/ -type f -exec grep -Hni 'Mojolicious (Perl)' {} \;

#~ use utf8::all;
#~ use warnings FATAL => 'all';
#~ use open ':encoding(UTF-8)';
#~ use open        qw< :std  :utf8     >;
#~ use open IO => ':encoding(UTF-8)';

use Mojo::Base::Che 'Mojolicious::Che', -lib, qw(../lib);
#~ use lib 'lib';
#~ use Mojo::Base 'Mojolicious::Che';


__PACKAGE__->new(config =>'Config.pm')->start();