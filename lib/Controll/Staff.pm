package Controll::Staff;
use Mojo::Base 'Mojolicious::Controller';

has model => sub {shift->app->models->{'Staff'}};
has model_access => sub {shift->app->models->{'Access'}};

sub сотрудники {# 
  my $c = shift;
  #~ $c->index;
  return $c->render('staff/сотрудники',
    handler=>'ep',
    'header-title' => 'Сотрудники',
    assets=>["staff/emp.js",],
    );
}

sub роли {# урезанные
  my $c = shift;
  $c->render(json=>$c->model->роли());
}

sub профили {# без логинов
  my $c = shift;
  $c->render(json=>$c->model->профили());
}

sub роли_профиля {
  my $c = shift;
  my $user = $c->vars('profile');
  $c->render(json=>$c->model_access->роли_пользователя($user));
  
}

sub сохранить_профиль {
  my $c = shift;
  my $data = $c->req->json;
  
  delete @$data{ grep(!($_~~[qw(id names tel descr)]), keys %$data) };
  
  $data->{tel} = [grep(/[\d\-]/, @{$data->{tel} || []})];
  
  my $p = eval{$c->model_access->сохранить_профиль($data)};
  $p ||=$@;
  $c->app->log->error($p)
    and return $c->render(json=>{error=>"Ошибка сохранения профиля"})
    unless ref $p;
  
  $c->render(json=>{success=>$p});
}

sub сохранить_связь {
  my $c = shift;
  my $id1 = $c->vars('id1');# группа
  my $id2 = $c->vars('id2');# профиль
  # разрешенная группа
  $c->model->роли(where=>' and id=? ', bind=>[$id1])->[0]
    or $c->render(json=>{error=>"Ошибка сохранения связи"});
  
  my $r = $c->model->связь_получить($id1, $id2);
  return $c->render(json=>{delete=>$c->model->связь_удалить(id1=>$id1, id2=>$id2)})
    if $r;
  $c->render(json=>{ref=>$c->model->связь($id1, $id2)});
  
}



1;