#!/usr/bin/env perl
# find ~/perl5/lib/ -type f -exec grep -Hni 'Mojolicious (Perl)' {} \;


use Mojo::Base::Che 'Mojolicious::Che', -lib, qw(../lib);


__PACKAGE__->new(config =>'Config.pm')->start();