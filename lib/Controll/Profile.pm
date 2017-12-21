package Controll::Profile;
use Mojo::Base 'Mojolicious::Controller';
#~ use Mojolicious::Plugin::RoutesAuthDBI::Util qw(load_class);
use Mojo::Util qw(md5_sum encode);

has model => sub {shift->app->models->{'Profile'}};

sub index {
  my $c = shift;
  #~ my $r = $c->dbh->selectall_arrayref($c->sth->sth('profile oauth.users'), {Slice=>{}}, ($c->auth_user->{id}));
  return $c->render('profile/sign',
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
  
  return $c->redirect_to('profile')
    if $c->is_user_authenticated;
  
  my $json = $c->req->json;
  my $data = $json || $c->req->params->to_hash;

  my $check = $c->проверить_логин($data);
  
  if ($check->{ok}) {
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

    return {error=>"Неверный логин/пароль"}
      unless ($p->{pass} eq $data->{passwd}) || md5_sum(encode 'UTF-8', $p->{pass}) eq $data->{passwd};
    
    return {error=>"Логин заблокирован"}
      if $p->{disable};
    
    $c->authenticate(undef, undef, $p);# закинуть в сессию
    
    return {ok=>{%$p}};
  }
  
  
  return {error=>"Неверный логин/пароль"};
}

sub список {
  my ($c) = @_;
  $c->render(json=>$c->model->список());
}

#~ sub _time_fmt {
  #~ my ($c, $time) = @_;
  #~ my ($sec,$min,$hour,$mday,$mon,$year,) = localtime( $time );#$wday,$yday,$isdst
  #~ $mon++;
  #~ $year += 1900;
  #~ return sprintf("%s.%s.%s %s:%s:%s", length($mday) eq 1 ? "0$mday" : $mday, length($mon) eq 1 ? "0$mon" : $mon, $year, length($hour) eq 1 ? "0$hour" : $hour, length($min) eq 1 ? "0$min" : $min, length($sec) eq 1 ? "0$sec" : $sec );
#~ }

#~ sub out {# толлько для приложения, логаут из сайта в модулеMojolicious/Plugin/RoutesAuthDBI/OAuth.pm
  #~ my $c = shift;
  #~ $c->logout;
  #~ $c->render(json=>{logout=>'ok'});
#~ }

#~ sub data {# редактирование профиля
  #~ my $c = shift;
  #~ my $profile = {%{$c->auth_user}};
  #~ delete @$profile{qw(ts)};
  #~ ##~ $profile->{auth_cookie} = $c->access->auth_cookie($c);
  #~ $c->render(json=>$profile);
#~ }






1;