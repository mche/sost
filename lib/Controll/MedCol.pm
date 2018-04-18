package Controll::MedCol;
use Mojo::Base 'Mojolicious::Controller';
#~ use Util;

has model => sub {shift->app->models->{'MedCol'}};
has 'Проект' => 'МедОбучение';
has время_теста => 3600;# по умолчанию
has задать_вопросов => 60;# по умолчанию

sub new {
  my $c = shift->SUPER::new(@_);
  $c->session(expiration => 2592000*3);# 30 дней
  #~ unshift @{$c->app->renderer->paths}, 'templates - medcol';
  $c->model->время_теста($c->время_теста);
  $c->model->задать_вопросов($c->задать_вопросов);
  
  #~ $c->session(path => '/medcol');
  return $c;
}

sub сессия  {
  my $c = shift;
  my $sess = $c->session;
  my $s = $c->model->сессия_или_новая($sess->{medcol});
  $sess->{medcol} = $s->{id};
  return $s;
}
sub новая_сессия {
  my $c = shift;
  my $sess = $c->session;
  my $new = $c->model->фиксировать_сессию($sess->{medcol});
  
  $sess->{medcol} = $new->{id};
  return $new;
}

sub начать_новую_сессию {# проверить
  my ($c, $sess) = @_;
  
  return ($sess->{'задано вопросов'} && $sess->{'прошло с начала, сек'} > ($sess->{'всего время'} || $c->время_теста))
        || $sess->{'получено ответов'} && ($sess->{'получено ответов'}  >= ($sess->{"тест/задать вопросов"} || $c->задать_вопросов))
}


sub index {
  my $c = shift;
  my $sess = $c->сессия;
  
  $sess = $c->новая_сессия
      if $c->начать_новую_сессию($sess);# можно сбрасывать неотвеченные сесиси || $sess->{'задано вопросов'} eq 0 || $sess->{'получено ответов'} eq 0;
  
  return $c->render('medcol/index',
    handler=>'ep',
    'header-title' => 'Тестовые вопросы',
    'Проект'=>$c->Проект,
    'список тестов' => $c->model->названия_тестов(where=>'where coalesce("задать вопросов", 1)>0 '),#$c->время_теста
    'результаты'=> $c->model->результаты_сессий($sess->{id}),
    'сессия'=>$sess,
    assets=>["medcol/main.js",],
    );
}

sub upload {
  my $c = shift;
  my $названия_тестов = $c->model->названия_тестов();#$c->время_теста
  return $c->_upload_render('названия тестов'=>$названия_тестов, )
    if $c->req->method eq 'GET';
  
  my $data = $c->param('data');
  my $list = $c->model->сохранить_название($c->param('ид списка') || undef, $c->param('название'), $c->param('задать вопросов') =~ /\d/ ? $c->param('задать вопросов') : undef, $c->param('всего время') || undef)
    if $c->param('название') =~ /\w/;
  return $c->_upload_render('названия тестов'=>$названия_тестов, 'ошибка'=>'Не указано название списка')
    unless $list;
  
  $названия_тестов = $c->model->названия_тестов();#$c->время_теста
  
  $c->inactivity_timeout(10*60);
  
  my @data = ();
  my @bad = ();
  for (split /\r?\n\r?\n/, $data) {
    my @s = /([^\r\n\*]+)\r?\n?/mg;
    my @q = (shift(@s) =~ /\[(\w+)\]\s*(.+)/);#вопрос, в @s остается ответы
    #~ $c->app->log->error(">>>>>".$_)#("@q", " == ", join(';', @s))
    push @bad, $_
      and next
      if scalar @s != 4 ;
    #~ say dumper($dbh->selectrow_hashref($sth, undef, @q, \@s));
    push @data, $c->model->сохранить_тестовый_вопрос(@q, \@s, $list->{id})
      if @q && @s;
  }
  
  #~ $c->model->удалить_вопросы_из_списка($list->{id}, [map($_->{id}, @data)])
    #~ if @data && $c->param('удалять незакачанные');
  
  $c->_upload_render('закачка'=>\@data, $list->{id} ? ('все вопросы'=>$c->model->вопросы_списка($list->{id})) : (), 'плохие'=>\@bad, 'названия тестов'=>$названия_тестов, 'название'=>(grep($_->{id} eq $list->{id}, @$названия_тестов))[0],);
  
}

sub _upload_render {
  my $c = shift;
  $c->render('medcol/upload',
    handler=>'ep',
    'header-title' => 'Закачка тестовых вопросов с ответами',
    'Проект'=>$c->Проект,
    assets=>["medcol/main.js",],
    @_,
  );
}

sub вопрос {# вопрос выдать и принять
  my $c = shift;
  my $sess = $c->сессия;
   
  #~ $c->новая_сессия
    #~ and 
    return $c->redirect_to('/') #$c->index
      if $c->начать_новую_сессию($sess);

  my $q = $c->model->заданный_вопрос($sess->{id});# нет ответа
  
  if ($q && (my $ans = $c->param('ans')) ) {
    #~ $c->app->log->error("ans: $ans", @{$q->{"sha1"}},  );#Util::indexOf($ans, $q->{"ответы"})
    my $i;
    $_ eq $ans
      ? ($i = shift(@{$q->{'индексы ответов'} }))
        && last
      : shift(@{$q->{'индексы ответов'} })
      for @{ $q->{"sha1"} };
    if ($i) {#есть ответ
      $c->model->сохранить_ответ($q->{'процесс сдачи/id'}, $i);
      $sess->{'получено ответов'}++;
      #~ $c->новая_сессия
        #~ and 
        return $c->redirect_to('/') #$c->index
          if $c->начать_новую_сессию($sess);
      $q = $c->model->новый_вопрос($sess->{id});
    }
    
  }
  
  unless ($q && $sess->{'название теста'} ) {# нет еще вопроса
    return $c->index #$c->redirect_to('/')
      unless $c->param('t');
    $sess = $c->model->начало_теста($sess->{id}, $c->param('t')) # вернет сессиб связанную с тестом
      unless $sess->{'название теста'};
    #~ $c->model->сессию_продлить($sess->{id})
      
    $q = $c->model->новый_вопрос($sess->{id});
    #~ $sess = $c->сессия;# заново сессию
  }
  
  $c->render('medcol/вопрос',
    handler=>'ep',
    'header-title' => "Тест - $sess->{'название теста'}",
    'Проект'=>$c->Проект,
    assets=>["medcol/main.js",],
    'вопрос'=>$q,
    'сессия'=>$sess,
  );
}

sub подробно {# результаты одной сессии
  my $c = shift;
  
  my $sess = eval {$c->model->сессия_sha1($c->stash('sess_sha1'))};#$c->время_теста
  return $c->redirect_to('/')
    unless $sess;
  
  $c->render('medcol/подробно',
    handler=>'ep',
    'header-title' => "Отчет по тесту - $sess->{'название теста'}",
    'Проект'=>$c->Проект,
    assets=>["medcol/main.js",],
    'неправильно'=>$c->model->неправильные_ответы($sess->{id}),
    'сессия'=>$sess,
  );
}

sub DESTROY {
  my $c = shift;
  #~ $c->app->log->debug(@{$c->app->renderer->paths});
  #~ shift @{$c->app->renderer->paths};
  #~ $c->app->log->debug(@{$c->app->renderer->paths});
}

1;