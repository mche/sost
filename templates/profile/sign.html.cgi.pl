$c->layout('main', handler=>'ep', );
  #~ unless $c->req->headers->to_hash->{'X-Content-Only'};
my $error = $c->vars('error', 'err');

$error && div({-style=>"color:red;"}, 'Ошибка авторизации: ', $error),

#~ $c->req->headers->to_hash->{'X-Content-Only'} && $c->asset('profile.form-auth.js'),

div({-class000=>"row", "ng-app"=>"formAuth", "ng-controller"=>"formAuthControll as ctrl",}, 

  div({-class0000=>"col l4 m6 s12"},
    #~ h4('Авторизация/регистрация'),
      #~ form({-id00=>"formAuth", -class=>"", -method=>"post", -action000=>$c->url_for("обычная авторизация/регистрация"), },
        div({'ng-hide'=>"ctrl.ready", 'ng-include'=>" 'progress/load' ",}, ''),
        #~ div({'ng-if'=>"ctrl.ready", 'ng-include'=>" 'profile/form-auth' "}, ''),
        form_auth({'ng-if'=>"ctrl.ready", 'data-param'=> 'param'}, ''),
      #~ ),
  ),
  #~ div({-class=>"col l4 m12 s12"},
    #~ form_oauth({'ng-if'=>"ctrl.ready",}, ''),
  #~ ),
),