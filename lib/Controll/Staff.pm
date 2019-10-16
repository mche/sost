package Controll::Staff;
use Mojo::Base 'Mojolicious::Controller';

has model => sub { $_[0]->app->models->{'Staff'}->uid($_[0]->auth_user && $_[0]->auth_user->{id}) };
has model_access => sub { $_[0]->app->models->{'Access'}->uid($_[0]->auth_user && $_[0]->auth_user->{id}) };

sub сотрудники {# 
  my $c = shift;
  #~ $c->index;
  return $c->render('staff/сотрудники',
    handler=>'ep',
    'header-title' => 'Сотрудники',
    assets=>["lib/fileupload.js", "staff/сотрудники.js", "uploader.css"],
    );
}

sub роли {# урезанные
  my $c = shift;
  $c->render(json=>$c->model->роли());
}

sub профили {# без логинов и двойников
  my $c = shift;
  my ($where, @bind) = $c->model->SqlAb->where({
    ' p.id ' => { -not_in => \['select p2.id from "профили" p1 join refs r on p1.id=r.id1 join "профили" p2 on p2.id=r.id2',],},
  });
  #~ $c->render(json=>$c->model->профили());
  $c->render(json=>$c->model_access->пользователи('без логинов'=>1, where=>$where));
}

sub роли_профиля {
  my $c = shift;
  my $user = $c->vars('profile');
  return $c->render(json=>$c->model_access->роли_пользователя($user))
    if $user;
  $c->render(json=>$c->model_access->роли_пользователей());
  
}

sub профили_роли {
  my $c = shift;
  my $role = $c->vars('role');
  
  # разрешенная группа
  $c->model->роли(where=>' and id=? ', bind=>[$role])->[0]
    or $c->render(json=>{error=>"Ошибка"});
  
  $c->render(json=>$c->model_access->пользователи_роли($role));
  
}

sub сохранить_профиль {
  my $c = shift;
  my $data = $c->req->json;
  
  delete @$data{ grep(!($_~~[qw(id names tel descr disable @приемы-увольнения), 'дата рождения']), keys %$data) };
  
  local $c->model->{dbh} = $c->model->dbh->begin; # временно переключить модели на транзакцию
  
  my $p = eval{$c->model_access->сохранить_профиль($data)};
  $p ||= $@;
  $c->app->log->error($p)
    and return $c->render(json=>{error=>"Ошибка сохранения профиля: ".$p})
    unless ref $p;
  
  $c->model->{dbh}->commit;
  
  $p = $c->model_access->пользователи('без логинов'=>1, where=>" where p.id=? ", bind=>[$p->{id}])->[0];
  
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

sub сохранить_группу {
  my $c = shift;
  my $data = $c->req->json;
  my $edit = delete $data->{_edit} ;
  @$data{qw(name descr)} = @$edit{qw(name descr)}
    if $edit;

  #~ $c->app->log->error($c->dumper($data));
  # разрешенная группа
  ($data->{parent} && $c->model->роли(where=>' and id=? ', bind=>[$data->{parent}])->[0])
    or return $c->render(json=>{error=>"Ошибка сохранения"});
  
  local $c->model->{dbh} = $c->model->dbh->begin; # временно переключить модели на транзакцию
  
  my $r = eval{$data->{remove} ? $c->model_access->удалить_роль($data) : $c->model_access->сохранить_роль($data)};
  $r = $@
    and $c->app->log->error($r)
    and return $c->render(json=>{error=>$r})
    if $@; 
  $c->model->{dbh}->commit;
  #~ my $rr = $c->model->роли();
  
  $c->render(json=>{roles=>[], (ref($r) || ()) && (($data->{remove} ? 'remove' : 'item')=>$r)});
  
}

sub фото {# upload
  my $c = shift;
  my $pid = $c->param('profile_id')
    or return $c->render(json=>{error=>'Нет ИД профиля'});
  my $file = $c->req->upload('file')
    or return $c->render(json=>{error=>'Нет тела файла'});
  
  eval { $file->asset->move_to('static/i/p/'.$pid) }
    or return $c->render(json=>{error=>$@ =~ /(.+) at /});
    
  $c->render(json=>{success=>$pid."->".$file->filename});
  
}



1;