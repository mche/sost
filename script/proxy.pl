#!/usr/bin/env perl
use Mojolicious::Lite;

my $backend = Mojo::URL->new('https://soysuper.com');

any '/' => \&proxy;
any '/*path' => \&proxy;

sub proxy {
    my $c    = shift;
    my $req  = $c->req->clone;

    my $url = $backend->clone;
    $url->path($c->stash('path')) if $c->stash('path');
    $req->url($url);
    $req->headers->header(host => $url->host);

    $c->ua->start(Mojo::Transaction::HTTP->new(req => $req) => sub {
        $c->tx->res(pop->res);
        $c->rendered;
    });
};

app->start;