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
    'header-title' => 'Пользователи, группы, маршруты и доступ в системе',
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
  @$data{qw(name descr)} = @$edit{qw(name descr)}
    if $edit;
    
  #~ $c->app->log->error($c->dumper($data));
  
  my $r = eval{$data->{remove} ? $c->model->удалить_роль($data) : $c->model->сохранить_роль($data)};
  $r = $@
    and $c->app->log->error($r)
    and return $c->render(json=>{error=>$r})
    if $@; 
  
  my $rr = $c->model->роли();
  
  $c->render(json=>{roles=>$rr, (ref($r) || ()) && (($data->{remove} ? 'remove' : 'item')=>$r)});

}

sub save_route {
  my $c = shift;
  my $data = $c->req->json;
  
  my $r = eval {$data->{remove} ? $c->model->удалить_маршрут($data) : $c->model->сохранить_маршрут($data)};
  $r = $@
    and $c->app->log->error($r)
    and return $c->render(json=>{error=>$r})
    if $@;
    
    
  
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

sub user_routes {
  my $c = shift;
  my $user = $c->vars('user');
  $c->render(json=>$c->model->маршруты_пользователя($user));
  
}

sub route_roles {
  my $c = shift;
  my $route = $c->vars('route');
  $c->render(json=>$c->model->роли_маршрута($route));
  
}

sub route_users {
  my $c = shift;
  my $route = $c->vars('route');
  $c->render(json=>$c->model->пользователи_маршрута($route));
  
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

sub routes_download {
  my $c = shift;
  my $data = $c->model->маршруты();
  my @r = map {
    my @meth_path = split(/\s+/, $_->{request});
    unshift @meth_path, 'route'
      if @meth_path == 1;
    sprintf qq|[%s=>'%s', %s%s to=>'%s', name=>'%s'%s],|,
      lc $meth_path[0],
      $meth_path[1],
      ($_->{auth} || '') && " over=>{access=>{auth=>q|$_->{auth}|}}, ",
      ($_->{host_re} || '') && " over=>{host => $_->{host_re}}, ",
      $_->{to},
      $_->{name},
      ($_->{descr} || '') && ", descr=>q|$_->{descr}|, ",
      
    ;
    
  } @$data;
  $c->render(json=>{success=>join("\n", @r)});
};

sub routes_upload {
  my $c = shift;
  my $data = $c->req->json;
  
  my $r = eval "[$data->{data}]";
  
  $r = $@
    and $c->app->log->error($r)
    and return $c->render(json=>{error=>$r})
    if $@;
  
  my $tx_db = $c->model->dbh->begin;
  local $c->model->{dbh} = $tx_db;
  
  my @data = map {
    my $route = ref eq 'HASH' ? $_ : {@$_};
    my $r = eval{$c->model->закачка_маршрута($route)};
    $r = $@
      and $c->app->log->error($r)
      and return $c->render(json=>{error=>$r})
      if $@;
    $r;
  } @$r;
  
  $tx_db->commit;
  $c->render(json=>{success=>\@data});
};


1;