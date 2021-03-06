package Controll::Profile;
use Mojo::Base 'Mojolicious::Controller';
#~ use Mojolicious::Plugin::RoutesAuthDBI::Util qw(load_class);
use Mojo::Util qw(md5_sum encode);

has model => sub {shift->app->models->{'Profile'}};
has model_access => sub { $_[0]->app->models->{'Access'}->uid($_[0]->auth_user && $_[0]->auth_user->{id}) };

sub index {
  my $c = shift;
  #~ my $r = $c->dbh->selectall_arrayref($c->sth->sth('profile oauth.users'), {Slice=>{}}, ($c->auth_user->{id}));
  return $c->render('profile/sign',
    #~ handler=>'cgi.pl', format=>'html',
    title=>'Вход',
    'header-title' => 'Вход в систему',
    #~ assets => ['profile/form-auth.js'], убрал всегда в main.js
    #~ captcha_path => $c->url_for('captcha'),
  )
    unless $c->is_user_authenticated;
  #~ $c->render(
  #~ 'header-title' => 'Мой профиль',
  #~ assets => ['profile/form.js',],
  #~ );
}


sub sign {# name=>'обычная авторизация/регистрация'
  my $c = shift;
  
  #~ return $c->redirect_to('profile')
    #~ if $c->is_user_authenticated;
  
  my $json = $c->req->json;
  my $data = $json || $c->req->params->to_hash;

  my $check = $c->проверить_логин($data);
  
  if ($check->{ok}) {
    #~ my $match = Mojolicious::Routes::Match->new(root => $c->app->routes);#
    #~ $c->app->log->error($match->find($c, {method => 'GET', path => $data->{'from'}}), $data->{'from'})
      #~ if  $data->{'from'};
    $check->{ok}{redirect} = $check->{redirect} || 'home';
    $check->{ok}{uid} = $check->{ok}{id};
    
    return $c->render(json=> $check->{ok})
      if $json;
    
    return $c->redirect_to($check->{ok}{redirect});
    
  }
  
  return $c->render(json=>$check)
    if $json;
  return $c->render(%$check);
  
}

sub проверить_логин {
  my ($c, $data) = @_;
  
  my $model_profiles = $c->access->plugin->model('Profiles');
  my $model_logins = $c->access->plugin->model('Logins');
  #~ my $model_refs = $c->access->plugin->model('Refs');
  
  return +{error=>"Нет данных для авторизации"}
    unless $data->{login};
  
  
  if (my $p = $model_profiles->get_profile(undef, $data->{login})) {
    
    return {error=>"Логин заблокирован"}
      if $p->{disable};
    
    if ($p->{pass} eq 'задать пароль') {#сам пользователь ставит пароль
      $c->model->задать_пароль($data->{login}, $data->{passwd});
    } else {
      return {error=>"Неверный логин/пароль"}
        unless ($p->{pass} eq $data->{passwd}) || md5_sum(encode 'UTF-8', $p->{pass}) eq $data->{passwd} ;
    }
    
    $c->authenticate(undef, undef, $p);# закинуть в сессию
    $p->{version} = $c->app->config->{'версия'}; # для модальной авторизации
    
    return {ok=>{%$p}};
  }
  
  
  return {error=>"Неверный логин/пароль"};
}

sub список {
  my ($c) = @_;
  $c->render(json=>$c->model->список());
}

sub сотрудники {
  my $c = shift;
  #~ $c->render(json=>$c->model->сотрудники());
  $c->render(json=>$c->model_access->пользователи('без логинов'=>1,));
}

#~ sub _time_fmt {
  #~ my ($c, $time) = @_;
  #~ my ($sec,$min,$hour,$mday,$mon,$year,) = localtime( $time );#$wday,$yday,$isdst
  #~ $mon++;
  #~ $year += 1900;
  #~ return sprintf("%s.%s.%s %s:%s:%s", length($mday) eq 1 ? "0$mday" : $mday, length($mon) eq 1 ? "0$mon" : $mon, $year, length($hour) eq 1 ? "0$hour" : $hour, length($min) eq 1 ? "0$min" : $min, length($sec) eq 1 ? "0$sec" : $sec );
#~ }

sub log_out {# толлько для приложения, логаут из сайта в модулеMojolicious/Plugin/RoutesAuthDBI/OAuth.pm
  my $c = shift;
  $c->logout;
  #~ $c->render(json=>{logout=>'ok'});
  $c->redirect_to($c->param('redirect') || '/');
}

#~ sub data {# редактирование профиля
  #~ my $c = shift;
  #~ my $profile = {%{$c->auth_user}};
  #~ delete @$profile{qw(ts)};
  #~ ##~ $profile->{auth_cookie} = $c->access->auth_cookie($c);
  #~ $c->render(json=>$profile);
#~ }

sub перелогин {
  my ($c) = @_;
  
  return $c->render('profile/relogin',
    handler=>'ep', #format=>'html',
    title=>'Перелогиниться',
    'header-title' => 'Перелогиниться',
    logins => $c->model->список_логинов(),
    #~ assets => ['profile/form-auth.js'], убрал всегда в main.js
    #~ captcha_path => $c->url_for('captcha'),
  );
  
}

sub relogin_id {
  my $c = shift;
  my $id = shift || $c->param('id')
    or return $c->render(text=>"Нет профиль ID");
  
  my $model_profiles = $c->access->plugin->model('Profiles');
  
  my $p = $model_profiles->get_profile($id, undef)
    or return $c->render(text=>"Нет такого профиля [$id]");
  
  #~ $c->logout;
  $c->authenticate(undef, undef, $p);# закинуть в сессию
  
  $c->redirect_to('home');
  
  #~ $c->render(text=>$id);
  
}

sub sign_cookie {
  require Mojo::Util;# qw(b64_decode b64_encode);
  my ($c) = @_;
  my $value = $c->param('crypt');
  my ($valid, $signature);
  my $sess = $c->app->sessions;
  my $name = $sess->cookie_name;
  # Check signature with rotating secrets
  if ($value =~ s/--([^\-]+)$//) {
    $signature = $1;

    for my $secret (@{ $c->app->secrets }) {
      my $check = Mojo::Util::hmac_sha1_sum("$name=$value", $secret);
      ++$valid and last if Mojo::Util::secure_compare($signature, $check);
    }

  }
  $c->helpers->log->error(qq{ Cookie "$value" has bad signature "$signature" })
    and return $c->redirect_to('home')
    unless $valid;
  
  my $decr = $sess->deserialize->(Mojo::Util::b64_decode $value)
    or $c->helpers->log->error(qq{  Bad Base64 "$value" })
    and return $c->redirect_to('home');
  
  my $auth_name = $c->access->plugin->merge_conf->{auth}{session_key} || 'auth_data';#https://metacpan.org/release/Mojolicious-Plugin-Authentication/source/lib/Mojolicious/Plugin/Authentication.pm#L28
  my $profile_id = $decr->{$auth_name}
    or $c->helpers->log->error(qq{ Нет профиля в логине })
    and return $c->redirect_to('home');
  
  return $c->relogin_id($profile_id)
    if $decr->{expires} && $decr->{expires} >= time;
  
  $c->log->error("Не смог авторизовать", $c->dumper($decr), "просрочка=".($decr->{expires} && $decr->{expires} >= time));
  $c->redirect_to('home');
}


1;