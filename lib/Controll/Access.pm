package Controll::Access;
use Mojo::Base 'Mojolicious::Controller';
#~ use Mojolicious::Plugin::RoutesAuthDBI::Util qw(load_class);
#~ use Mojo::Util qw(md5_sum encode);

has model => sub {shift->app->models->{'Access'}};

sub index {
  my $c = shift;
  #~ $c->index;
  return $c->render('access/index',
    handler=>'ep',
    'header-title' => 'Управление пользователями и доступ',
    assets=>["admin/access.js",],
    );
    #~ if $c->is_user_authenticated;
}

sub users {
  my $c = shift;
  my $data = $c->model->пользователи();
  $c->render(json=>$data);
}

sub roles {
  my $c = shift;
  my $data = $c->model->роли();
  $c->render(json=>$data);
}

sub routes {
  my $c = shift;
  my $data = $c->model->маршруты();
  $c->render(json=>$data);
}

sub user_save {
  my $c = shift;
  my $data = $c->req->json;
  
  delete $data->{ts};
  
  my $p = eval{$c->model->сохранить_профиль($data)}
    or $c->app->log->error($@)
    and return $c->render(json=>{error=>$@});
  
  my $l = eval{$c->model->сохранить_логин(%$data, id=>$data->{'login/id'}, )}
    or $c->app->log->error($@)
    and return $c->render(json=>{error=>$@})
    if grep(length > 3, map($data->{$_} =~ s/(^\s+|\s+$)//gr, qw(login pass)));
  
  my $r = $c->model->связь($p->{id}, $l->{id})
    if $p->{id} && $l->{id};
  @$p{qw(login pass login/id)} = @$l{qw(login pass id)}
    if $l && $l->{id};
  
  $c->render(json=>{success=>$p});
}

sub save_role {
=pod
Создание, правка, удаление - remove
Вставка ветки - attach

=cut
  my $c = shift;
  my $data = $c->req->json;
  my $edit = delete $data->{_edit} ;
  $data->{name} = $edit->{name}
    if $edit;
    
  #~ $c->app->log->error($c->dumper($data));
  
  my $r = eval{$data->{remove} ? $c->model->удалить_роль($data) : $c->model->сохранить_роль($data)}
    or $c->app->log->error($@)
    and return $c->render(json=>{error=>$@}); 
  
  my $rr = $c->model->роли();
  
  $c->render(json=>{roles=>$rr, (ref($r) || ()) && (item=>$r)});

}

sub save_route {
  my $c = shift;
  my $data = $c->req->json;
  
  my $r = eval {$data->{remove} ? $c->model->удалить_маршрут($data) : $c->model->сохранить_маршрут($data)}
    or $c->app->log->error($@)
    and return $c->render(json=>{error=>$@}); 
  
  $c->render(json=>{ref $r ? (success=>$r) : (error=>$r)});
  
}

sub role_users {
  my $c = shift;
  my $role = $c->vars('role');
  $c->render(json=>$c->model->пользователи_роли($role));
  
}

sub role_routes {
  my $c = shift;
  my $role = $c->vars('role');
  $c->render(json=>$c->model->маршруты_роли($role));
  
};

sub user_roles {
  my $c = shift;
  my $user = $c->vars('user');
  $c->render(json=>$c->model->роли_пользователя($user));
  
}

sub связь {
  my $c = shift;
  my $id1 = $c->vars('id1');
  my $id2 = $c->vars('id2');
  my $r = $c->model->связь_получить($id1, $id2);
  return $c->render(json=>{delete=>$c->model->связь_удалить(id1=>$id1, id2=>$id2)})
    if $r;
  $c->render(json=>{ref=>$c->model->связь($id1, $id2)});
}


1;