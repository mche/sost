package Controll::Access;
use Mojo::Base 'Mojolicious::Controller';
#~ use Mojolicious::Plugin::RoutesAuthDBI::Util qw(load_class);
#~ use Mojo::Util qw(md5_sum encode);

has model => sub { $_[0]->app->models->{'Access'}->uid($_[0]->auth_user && $_[0]->auth_user->{id})};

sub index {
  my $c = shift;
  #~ $c->index;
  return $c->render('access/index',
    handler=>'ep',
    'header-title' => 'Пользователи, группы, маршруты и доступ в системе',
    assets=>["lib/fileupload.js", "admin/access.js", "uploader.css",],
    );
    #~ if $c->is_user_authenticated;
}

sub users {
  my $c = shift;
  my $data = $c->model->пользователи();
  $c->render(json=>$data);
}

sub users2 {
  my $c = shift;
  my $data = $c->model->двойники();
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
  
  delete @$data{qw(ts еще)};
  #~ $data->{tel} = [grep(/[\d\-]/, @{$data->{tel} || []})];
  
  my $tx_db = $c->model->dbh->begin;
  local $c->model->{dbh} = $tx_db; # временно переключить модели на транзакцию
  
  my $p = eval { $c->model->сохранить_профиль($data) };
  $p ||= $@
    #~ and ($c->model->{dbh}->rollback || 1)
    and $c->app->log->error($p)
    and return $c->render(json=>{error=>$p})
    unless ref $p;
  
  if ($data->{'группы2'}) {# только копия групп
    eval {$c->model->связь($_->{id}, $p->{id})}
      for @{$data->{'группы2'}};
  }
  
=pod
  my $l = eval{$c->model->сохранить_логин(%$data, id=>$data->{'login/id'}, )}
    or $c->app->log->error($@)
    and return $c->render(json=>{error=>$@})
    if grep(length > 3, map($data->{$_} && $data->{$_} =~ s/(^\s+|\s+$)//gr, qw(login pass)));
  
  eval{$c->model->удалить_логин($p->{id}, $data->{'login/id'}, )}
    if $data->{'login/id'} && !$data->{login};
  $c->app->log->error($@)
    and return $c->render(json=>{error=>$@})
    if $@;# 
  
  my $r = $p->{id} && $l && $l->{id} && $c->model->связь($p->{id}, $l->{id});
    #~ if $p->{id} && $l && $l->{id};
  @$p{qw(login pass login/id)} = @$l{qw(login pass id)}
    if $l && $l && $l->{id};
=cut

  $tx_db->commit;
  
  $c->render(json=>{success=>$c->model->пользователи(where=>" where p.id=? ", bind=>[$p->{id}])->[0]});
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
  my $tx_db = $c->model->dbh->begin;
  local $c->model->{dbh} = $tx_db; # временно переключить модели на транзакцию
  
  my $r = eval {$data->{remove} ? $c->model->удалить_роль($data) : $c->model->сохранить_роль($data)};
  $r = $@
    and $c->app->log->error($r)
    and return $c->render(json=>{error=>$r})
    if $@;
    
  $tx_db->commit;
  #~ my $rr = $c->model->роли();
  
  $c->render(json=>{roles=>[], (ref($r) || ()) && (($data->{remove} ? 'remove' : 'item')=>$r)});

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
  return $c->render(json=>$c->model->роли_пользователя($user))
    if $user;
  $c->render(json=>$c->model->роли_пользователей())
  
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
  my $param = $c->req->json;
  my $data = $c->model->маршруты($param->{ids});
  my @r = map {
    my @meth_path = split(/\s+/, $_->{request});
    unshift @meth_path, 'route'
      if @meth_path == 1;
    sprintf qq|[%s=>'%s', %s%s to=>'%s', name=>'%s'%s],|,
      lc $meth_path[0],
      $meth_path[1],
      ($_->{auth} || '') && " requires=>{access=>{auth=>q|$_->{auth}|}}, ",
      ($_->{host_re} || '') && " requires=>{host => $_->{host_re}}, ",
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
    
    $c->model->связь($r->{id}, $data->{role})
      if $data->{role};
    
    $r;
  } @$r;
  
  $tx_db->commit;
  $c->render(json=>{success=>\@data});
};


sub users_upload {
  my $c = shift;
  my $data = $c->req->json;
  
  my @data = ();
  
  my $tx_db = $c->model->dbh->begin;
  local $c->model->{dbh} = $tx_db;
  
  for (split /\n/, $data->{data}) {
    my @tab = map s/\s{2,}/ /gr, map s/(^\s+|\s+$)//gr, split /\t/, $_;
    next unless @tab eq 4;
    
    my $r = eval {$c->model->закачка_пользователя({names=>[@tab[0..2]], "должность"=>$tab[3]})};
    $r = $@
      and $c->app->log->error($r)
      and return $c->render(json=>{error=>$r})
      if $@;
    
    push @data, $r;
  }
  $tx_db->commit;
  
  $c->render(json=>{success=>\@data});
  
};

sub users_download {
  my $c = shift;
  my $data = $c->model->пользователи_выгрузка();
  my @r = (join "\t", qw(# Фамилия Имя Отчество Должности уволен));
  push @r, map {
    join "\t", $_->{id}, @{$_->{names}}[0..2], join("; ", @{$_->{"должности"}}),  $_->{"уволен"};
  } @$data;
  $c->render(json=>{success=>join("\n", @r)});
};

sub sql {
  my $c = shift;
  my $data = $c->req->json;
  return $c->render(json=>{error=>'Нет SQL'})
    unless $data->{sql};
  my $r = eval {$c->model->dbh->selectall_arrayref($data->{sql}, {Slice=>{}})};
  $r = $@
      and $c->app->log->error($r)
      and return $c->render(json=>{error=>$r})
      if $@;
  $c->render(json=>{success=>$r});
}

1;