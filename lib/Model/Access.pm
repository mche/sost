package Model::Access;
use Mojo::Base 'Model::Base';
#~ use Mojo::Util qw(dumper);

our $DATA = ['Access.pm.dict.sql'];

#~ has sth_cached => 1;

#~ has [qw(app)];
has model_staff => sub {shift->app->models->{'Staff'}};

sub new {
  my $self = shift->SUPER::new(@_);
  #~ $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  
  return $self;
}
sub init {
  #~ state $self = shift->SUPER::new(@_);
  my $self = shift;
  #~ $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  #~ $self->dbh->do($self->sth('таблицы'));
  $self->dbh->do($self->sth('функции'));
  #~ return $self;
}


sub пользователи {
  my ($self, $param) = (shift, ref $_[0] ? shift : {@_});
  $self->dbh->selectall_arrayref($self->sth('пользователи', where=>$param->{where}, param=>$param), {Slice=>{}}, @{$param->{bind} || []},);
}

sub двойники {
  my ($self,) = @_;
  $self->dbh->selectall_arrayref($self->sth('двойники'), {Slice=>{}}, );
}

sub пользователи_выгрузка {
  my $self = shift;
  $self->dbh->selectall_arrayref($self->sth('пользователи/выгрузка'), {Slice=>{}},);
}

sub роли {
  my $self = shift;
  return [map{
    $_->{'навигационный маршрут'} = $self->dbh->selectrow_hashref($self->sth('навигационный маршрут'), undef, $_->{id});
    $_;
  } @{$self->dbh->selectall_arrayref($self->sth('роли'), {Slice=>{}},)}
  ];
  
}

sub маршруты {
  my ($self, $ids) = @_;
  $self->dbh->selectall_arrayref($self->sth('маршруты'), {Slice=>{}}, ($ids) x 2);
}

sub сохранить_профиль {
  my $self = shift;
  my $data = ref $_[0] ? shift : {@_};
  return "Дубликат ФИО"
    if !$data->{id} && $self->dbh->selectrow_hashref($self->sth('пользователь по имени'), undef, $data->{'names'});
    
  my $pu = $data->{'@приемы-увольнения'} && $data->{'@приемы-увольнения'}[-1] && ($data->{'@приемы-увольнения'}[-1]{"дата приема"} || $data->{'@приемы-увольнения'}[-1]{id}) && $data->{'@приемы-увольнения'}[-1];#только последня строка
  my $pu2 = $data->{'@приемы-увольнения'}  && $data->{'@приемы-увольнения'}[-2]; # предыдущая строка
  
  $data->{disable} = $pu
    ? ($pu->{"дата увольнения"} ? 1 : $pu->{"дата приема"} ? 0 : 1)
    : ($pu2->{"дата увольнения"} ? 1 : $pu2->{"дата приема"} ? 0 : 1)
    if $pu || $pu2;
  
  $data->{tel} = [grep {/[\d\-]/} @{$data->{tel} || []}];
  
  my $p = $self->вставить_или_обновить($self->{template_vars}{schema}, 'профили', ["id"], $data);
  
  my $l = grep(length > 3, map($data->{$_} && $data->{$_} =~ s/(^\s+|\s+$)//gr, qw(login pass))) && $self->сохранить_логин(%$data, id=>$data->{'login/id'}, );
    #~ if grep(length > 3, map($data->{$_} && $data->{$_} =~ s/(^\s+|\s+$)//gr, qw(login pass)));
  
  $self->удалить_логин($p->{id}, $data->{'login/id'}, )
    if $data->{'login/id'} && !$data->{login};
  
  my $r = $p->{id} && $l && $l->{id} && $self->связь($p->{id}, $l->{id});
    #~ if $p->{id} && $l && $l->{id};
  @$p{qw(login pass login/id)} = @$l{qw(login pass id)}
    if $l && $l && $l->{id};
  
  if ($pu) {
    if ($pu->{"дата приема"}) {
      $pu = $self->model_staff->сохранить_прием_увольнение($pu);
      $self->связь($p->{id}, $pu->{id});
      
    } elsif ($pu->{id}) {
      $self->связь_удалить(id1=>$p->{id}, id2=>$pu->{id});
    }
    
  } elsif ($pu2) {# править предыдущую строку
    eval{$self->model_staff->сохранить_прием_увольнение($pu2)};#{id=>$pu->{id}, "причина увольнения"=>$pu->{'причина увольнения'}}
  }
  
  return $p;
  
}

sub сохранить_логин {
  my $self = shift;
  my $data = ref $_[0] ? shift : {@_};
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, 'logins', ["id"], $data);
  
}

sub удалить_логин {
  my ($self, $profile_id, $login_id) = @_;
  $self->связь_удалить(id1=> $profile_id, id2=>$login_id);
  $self->_delete($self->{template_vars}{schema}, 'logins', ["id"], {id=>$login_id});
}


sub сохранить_роль {
  my $self = shift;
  my $data = ref $_[0] ? shift : {@_};
  #~ $self->app->log->error($self->app->dumper($data));
  #~ my $tx_db = $self->dbh->begin;
  #~ local $self->{dbh} = $tx_db;
  
  if ($data->{attach}) {
    my $r = ($data->{parent} && $data->{id}) && $self->связь_получить(@$data{qw(parent id)});# $self->dbh->selectrow_array($self->sth('роль/предок'), undef, $data->{id})
      #~ if $data->{parent} && $data->{id};
    $self->связь_удалить(id=>$r->{id})
      if $r && $r->{id};
    $self->связь($data->{parent}, $data->{attach}{id})
      if $data->{parent};
    #~ $tx_db->commit;
    return {id=>$data->{attach}{id}};
  }
  
  my $r = $data->{parent} && !$data->{id} && $self->dbh->selectrow_hashref($self->sth('проверить роль'), undef, @$data{qw(parent name)});
    #~ if $data->{parent} && !$data->{id};
  return $r
    if $r;
  
  $r = $self->вставить_или_обновить($self->{template_vars}{schema}, 'roles', ["id"], $data, {'name'=>q[ regexp_replace(regexp_replace(?, '\s{2,}', ' ', 'g'),'^\s+|\s+$','', 'g') ]});
  $self->связь($data->{parent}, $r->{id})
    if $data->{parent} && !$self->связь_получить($data->{parent}, $r->{id});
  
  #~ $tx_db->commit;
  return $r;
}

sub сохранить_маршрут {
  my $self = shift;
  my $data = ref $_[0] ? shift : {@_};
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, 'routes', ["id"], $data);
  $self->связь($r->{id}, $data->{role})
    if $data->{role};
  return $r;
}

sub удалить_маршрут {
  my $self = shift;
  my $data = ref $_[0] ? shift : {@_};
  my $cnt = $self->dbh->selectrow_array($self->sth('наличие связей'), undef, ($data->{remove}) x 2);
  return "С данным маршрутом есть связи. Сначала удалить связи (с группами)"
    if $cnt;
  $self->_delete($self->{template_vars}{schema}, 'routes', ["id"], id=> $data->{remove});
}


sub удалить_роль {
  my $self = shift;
  my $data = ref $_[0] ? shift : {@_};
  #~ my $tx_db = $self->dbh->begin;
  #~ local $self->{dbh} = $tx_db;
  $self->связь_удалить(id1=>$data->{parent}, id2=>$data->{remove})
    if $data->{parent} &&  $self->dbh->selectrow_array($self->sth('можно удалить связь'), undef, ($data->{id}) x 2);
  my $cnt = $self->dbh->selectrow_array($self->sth('наличие связей'), undef, ($data->{remove}) x 2);
  my $d = $self->_delete($self->{template_vars}{schema}, 'roles', ["id"], id=> $data->{remove})
    unless $cnt;
  #~ $tx_db->commit;
  return $d || {id=>$data->{remove}};
}

sub пользователи_роли {
  my ($self, $role) = @_;
  $self->dbh->selectrow_array($self->sth('пользователи роли'), undef, $role);
}

sub маршруты_роли {
  my ($self, $role) = @_;
  $self->dbh->selectrow_array($self->sth('маршруты роли'), undef, $role);
}

sub роли_пользователя {
  my ($self, $user) = @_;
  $self->dbh->selectrow_array($self->sth('роли пользователя'), undef, $user);
}

sub роли_пользователей {
  my ($self) = @_;
  $self->dbh->selectall_hashref($self->sth('роли пользователей'), 'id');
}

sub маршруты_пользователя {
  my ($self, $user) = @_;
  $self->dbh->selectrow_array($self->sth('маршруты пользователя'), undef, $user);
}

sub роли_маршрута {
  my ($self, $route) = @_;
  $self->dbh->selectrow_array($self->sth('роли маршрута'), undef, $route);
}

sub пользователи_маршрута {
  my ($self, $route) = @_;
  $self->dbh->selectrow_array($self->sth('пользователи маршрута'), undef, $route);
  
}

sub закачка_маршрута {
  my ($self, $route) = @_;
  unless ($route->{request}) {
    
    my $meth  = join ' ', map uc($_), grep defined($route->{$_}) && $route->{$_} =~ s/\s+//gr, qw(get post put head);
    $meth .= " " if $meth;
    my $path = join '', map $route->{$_},  grep defined($route->{$_}) && $route->{$_} =~ s/\s+//gr, qw(get post put head route)
      or return {error=>"Не указан URL path через (get=> | post=> | put=> | head=> | route=> )"};
    $route->{request} = sprintf '%s%s', $meth || '',  $path;
  } else {
    $route->{request} =~ s/(^\s+|\s+$)//g;
    #~ $route->{request} =~ s/\s{2,}/ /g;
  }
  return {error=>"Не указан request (get post put head route)"}
    unless $route->{request};
  
  if (my $over = delete $route->{over}) {
    my $access  =delete $over->{access};
    my $auth = delete $access->{auth}
      if $access;
    $route->{auth} = $auth
      if $auth;
    my $host = delete($over->{host}) || delete($over->{host_re});
    require Data::Dumper
      and $route->{host_re} = Data::Dumper::Dumper($host) =~ s/(^\$.+=\s*'*|'*;\n*$)//gr
      if $host;
  }
  #~ $route->{descr} ||= $self->app->dumper($route);#Data::Dumper::Dumper($route) =~ s/\$.+=\s*//r;
  $self->вставить_или_обновить($self->{template_vars}{schema}, 'routes', ["name"], $route);
};

sub закачка_пользователя {# +должность
  my ($self, $user) = @_;
  
  my $должности = $self->dbh->selectrow_hashref($self->sth('топ-группы'), undef, ('Должности') x 2)
    or die "Нет топ-группы [Должности]";
  
  my $должность = $self->dbh->selectrow_hashref($self->sth('группа родителя'), undef, $должности->{id}, ($user->{'должность'}) x 2);
  unless ($должность) {
    $должность = $self->вставить_или_обновить($self->{template_vars}{schema}, 'roles', ["id"], {name=>$user->{'должность'}});
    $self->связь($должности->{id}, $должность->{id});
  }
  
  my $пользователь = $self->dbh->selectrow_hashref($self->sth('пользователь по имени'), undef, $user->{'names'})
    || $self->вставить_или_обновить($self->{template_vars}{schema}, 'профили', ["id"], $user);
  
  
  $пользователь->{'связь с должностью'} = $self->связь($должность->{id}, $пользователь->{id});
  
  return $пользователь;
  
}

sub навигация {
  my ($self, $roles) = @_;
  #~ $self->app->log->error($self->app->dumper($roles));
  $self->dbh->selectall_arrayref($self->sth('навигация'), {Slice=>{}}, $roles);
}

#~ sub связать_или_расцепить {
  #~ my ($self, $id1, $id2) = @_;
  
  
#~ }


1;

__DATA__
