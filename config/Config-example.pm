
=pod

=head1 Это главный Конфиг сервиса (Mojolicious::Che)

  use Mojo::Base::Che 'Mojolicious::Che', -lib, qw(../lib);
  __PACKAGE__->new(config =>'Config.pm')->start();

=head2 Еще конфиг плугина AssetPack::Che Config-AssetPack.pm

=head2 Еще конфиг маршрутов Config-Routes.pm

=head2 Еще конфиг базы данных Config-DB.pm

=head1 Тестовый сертификат

  openssl req -x509 -nodes -days 365 -newkey rsa:1024  -keyout ssl.key -out ssl.crt <<EOF
  RU
  Дубай

  Система-1050
  Development
  calculate

  EOF

=head1 Обновление сертификатов HTTPS

  #остановить hypnotoad
  su
  certbot renew
  #...
  #Congratulations, all renewals succeeded. The following certs have been renewed:
  #  /etc/letsencrypt/live/www.000.ru/fullchain.pem (success)
  #  /etc/letsencrypt/live/000.ru/fullchain.pem (success)

  cp /etc/letsencrypt/live/000.ru/privkey.pem .
  cp /etc/letsencrypt/live/000.ru/fullchain.pem .
  cp /etc/letsencrypt/live/www.000.ru/privkey.pem www.privkey.pem
  cp /etc/letsencrypt/live/www.000.ru/fullchain.pem www.fullchain.pem

=head1 Шифруемся концы в воду

  cat Config.pm | gpg -q --batch --yes -e -r my@email.ru --trust-model always -z 9 > Config.pm.gpg

=cut


use Mojo::Home;
use Mojolicious::Plugin::RoutesAuthDBI::Util qw(load_class);
use JSON::PP;
use lib '.';

{
  'Проект'=>'000',
  # установка лог файла раньше установки режима, поэтому всегда log/development.log!!!!
  #mojo_mode=>$ENV{PLACK_ENV} ? 'production' : 'development', #  production $ENV{ MOJO_MODE}
  # для жабы надо setcap cap_net_bind_service=+ep /путь/к/перлу
  # запускать жабу из корня проекта
  hypnotoad=>{
    listen => [
    'https://*:443?000.ru_cert=fullchain.pem&000.ru_key=privkey.pem'
      .'&www.000.ru_cert=www.fullchain.pem&www.000.ru_key=www.privkey.pem'
      .'&calculate_cert=ssl.crt&calculate_key=ssl.key'
      .'&test_cert=ssl.crt&test_key=ssl.key'
      ,
    'http://*:80'],
    pid_file => 'hypnotoad.pid',
    workers => 1,
  },
  mojo_home => Mojo::Home->new->detect,
  mojo_static_paths => ["static", ],#~ push @{$app->static->paths}, '/home/sri/public';
  mojo_renderer_classes => ['Controll::Main'],
  #~ mojo_mode=> 'production',#   development
  # mode принудительно production если увидит $ENV{PLACK_ENV}
  mojo_log=>{level => 'debug', path=>'log/mojo.log', paths=>{error=>'log/error.log', remote_log=>'log/remote.log'}, trace000=> 0},#$ENV{PLACK_ENV} ? 'error' : 'debug', 
  mojo_plugins=>[ # map $self->plugin($_)
    ['EDumper', helper =>'dumper'],
    ['Helper::Vars',],
    [RoutesAuthDBI =>
        dbh=>sub{ shift->dbh->{'main'}},
        #~ auth=>{current_user_fn=>'auth_user'},
        template=>{schema => 'public', sequence=> '"public"."ИД"', tables=>{profiles=>'профили', guests=>"гости",}},
        access=> {
          fail_auth_cb=>sub{shift->reply->not_found;},
          fail_access_cb=>sub{shift->reply->not_found;},
          #~ pos=>{},
        },
        admin=>{prefix=>'admin', trust=>'foo', role_admin=>'Администраторы'},
        guest=>{},
    ],
    [RenderCGI => default=>1,],
    ['EPRenderer::Che'],
    [ StaticLog => {level=>'debug'}],
    do 'Config-AssetPack.pm',
    ['RenderFile'],
    ['Minion::Workers' => {Pg => sub {  shift->dbh->{'main'}->pg }, workers=>2, manage=>1, tasks => {slow_log => sub {
        my ($job, $arg1) = @_;
        $job->app->log->info(qq{slow_log ARG="$arg1", pid $$});#, keys %{$app->models}
      },},},

  ],
  'сессия' => {cookie_name => '000', default_expiration=>600, secure000=>1,},#2592000 1 day 86400
  # Хуки
  mojo_hooks=>{
    before_dispatch => [
      sub {
        my $c = shift;
        my $origin = $c->req->headers->origin; # origin	null
        return 1
          if !defined $origin;
        $c->res->headers->header('Access-Control-Allow-Origin' => '*');#$origin
        1;
      },
      sub {# redirector
        my $c = shift;
        my $url = $c->req->url->to_abs;
        return 1
          if $url->scheme eq 'https' || $url->port;
        $url->scheme('https');
        #~ $url->host('000.ru');
        $c->res->code('301');
        $c->redirect_to($url);
      },
    ],
    after_dispatch => sub {
      my $c = shift;
      $c->tx->res->headers->server('000');
      $c->tx->res->headers->add('X-Foo' => 'bar');
    }
  },
  mojo_has => {
    dbh => sub {
      require Mojo::Pg::Che;
      {'main' => Mojo::Pg::Che->connect('dbname=dev1', 'postgres', undef,)}; #max_connections(1);
    },
    models => sub {
      my $app = shift;
      return +{map {
        my $class = load_class("Model::$_");
        $class ? ($_ => $class->new(app=>$app)) : ();
      } qw( Main Category Wallet Contragent Project TimeWork Money Waltex::Report Access Profile TMC Nomen Object)
      };
    },
    json => sub { JSON::PP->new->utf8(0); },
  },
  'шифры' => ['000', '000'],
  namespaces => ['Controll'],
  routes => do 'Config-Routes.pm',
};


