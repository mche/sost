package Controll::MedCol;
use Mojo::Base 'Mojolicious::Controller';

has model => sub {shift->app->models->{'MedCol'}};

has сессия => sub {
  my $c = shift;
  my $sess = $c->session;
  my $s = $c->model->сессия($sess->{medcol});
  $sess->{medcol} = $s->{id};
  return $s;
};

sub new {
  my $c = shift->SUPER::new(@_);
  #~ $c->сессия;
  return $c;
}

sub index {
  my $c = shift;
  #~ $c->app->log->debug("сессия: ".$c->сессия);
  return $c->render('medcol/index',
    handler=>'ep',
    'header-title' => 'Тестовые вопросы',
    'Проект'=>'МедОбучение',
    'список тестов' => $c->model->названия_тестов(),
    assets=>["medcol/main.js",],
    );
}

sub upload {
  my $c = shift;
  my $названия_тестов = $c->model->названия_тестов();
  return $c->_upload_render('названия тестов'=>$названия_тестов, )
    if $c->req->method eq 'GET';
  
  my $data = $c->param('data');
  my $list = $c->model->сохранить_название($c->param('ид списка') || undef, $c->param('название'))
    if $c->param('название') =~ /\w/;
  return $c->_upload_render('названия тестов'=>$названия_тестов, 'ошибка'=>'Не указано название списка')
    unless $list;
  
  $названия_тестов = $c->model->названия_тестов();
  
  my @data = ();
  for (split /\r?\n\r?\n/, $data) {
    my @s = /([^\r\n\*]+)\r?\n?/mg;
    my @q = (shift(@s) =~ /\[(\w+)\]\s*(.+)/);#вопрос, в @s остается ответы
    #~ $c->app->log->debug("@q", " == ", join(';', @s));
    #~ say dumper($dbh->selectrow_hashref($sth, undef, @q, \@s));
    push @data, $c->model->сохранить_тестовый_вопрос(@q, \@s, $list->{id})
      if @q && @s;
  }
  
  #~ $c->app->log->debug($c->dumper(\@data));
  
  
  $c->_upload_render('закачка'=>@data ? \@data : $c->model->вопросы_списка($list->{id}), 'названия тестов'=>$названия_тестов, 'название'=>$list,);
  
}

sub _upload_render {
  shift->render('medcol/upload',
    handler=>'ep',
    'header-title' => 'Закачка тестовых вопросов с ответами',
    'Проект'=>'МедКолледж',
    assets=>["medcol/main.js",],
    @_,
  );
}

sub q {# вопрос выдать и принять
  my $c = shift;
  my $sess = $c->сессия;
  my $q = $c->model->заданный_вопрос($sess->{id});# нет ответа
  unless ($q) {# нет еще вопроса
    $c->model->начало_теста($sess->{id}, $c->param('q'))
      if !$sess->{'название теста'} && $c->param('q');
    $q = $c->model->новый_вопрос($sess->{id});
    #~ $q = $c->model->заданный_вопрос($sess->{id});
  }
}

1;