package Controll::MedCol;
use Mojo::Base 'Mojolicious::Controller';
#~ use Util;

has model => sub { $_[0]->app->models->{'MedCol'} };#->uid($_[0]->auth_user && $_[0]->auth_user->{id})
has 'Проект' => 'МедКолледж';
has время_теста => 3600;# по умолчанию
has задать_вопросов => 60;# по умолчанию
has результаты_лимит_строк => 50;

sub new {
  my $c = shift->SUPER::new(@_);
  $c->session(expiration => 2592000*6);# 6 мес
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
  #~ my $s = $c->app->dbh2->selectrow_hashref(' insert into "медкол"."сессии" DEFAULT VALUES returning * ');
  $c->log->medcol("новая сессия [$s->{id}]")#(sprintf "новая сессия %s; pg_pid %s", $s->{id}, $s->{pg_backend_pid}
    unless $sess->{medcol};
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

sub выход {
  my $c = shift;
  # Delete whole session by setting an expiration date in the past
  $c->session(expires => 1);
  $c->redirect_to('/');
}

sub войти_в_сессию {#продолжить цепочку сессий
  my $c = shift;
  my $sha1 = $c->param('sha1');
  if (length($sha1) >= 12) {
    my $s = $c->model->войти_в_сессию($sha1);
    my $sess = $c->session;
    $sess->{medcol} = $s->{id}
      if $s;
  }
  $c->redirect_to('/');
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
    'результаты'=> $c->model->мои_результаты($sess->{id}),
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
=pod
  for (split /\r?\n\r?\n/, $data) {
    my @s = /\s*\*?\s*([^\r\n]+)\r?\n?/mg;
    my @q = (shift(@s) =~ /\[?(\w+)\]?\s*(.+)/);#вопрос, в @s остается ответы
    #~ $c->app->log->error(">>>>>".$_)#("@q", " == ", join(';', @s))
    push @bad, $_
      and next
      if scalar @s != 4 && /\w/;
    #~ say dumper($dbh->selectrow_hashref($sth, undef, @q, \@s));
    push @data, $c->model->сохранить_тестовый_вопрос(@q, \@s, $list->{id})
      if @q && @s;
  }
=cut
=pod

Закачка из PDF

2086. [T012166] НА СКЛАДЕ ОРГАНИЗАЦИИ ОПТОВОЙ ТОРГОВЛИ

ЛЕКАРСТВЕННЫМИ СРЕДСТВАМИ В ОТДЕЛ ЭКСПЕДИЦИИ ТОВАР

ПОСТУПАЕТ ИЗ ОТДЕЛА

 

А) основного хранения

 

Б) приемки лекарственных препаратов

 

В) карантинного хранения

 

Г) административного

 



=cut

  #~ while ($data =~ /^([\d\.\s]*\[(\w+)\]((?:.+|[\s\r\n]+)+?))/gm) {
  my (@q, @ans, $ans);
  for my $line (split /\s*\r?\n\s*/, $data) {
    if ($line =~ s/^[\d\.\s]*\[(\w+)\]\s*//) {
      push @ans, $ans
        if $ans;
      #~ $c->app->log->error("@q", @ans, scalar @ans)
        #~ if @ans gt 3;
      if (@q && @ans gt 3) {
        push @data, $c->model->сохранить_тестовый_вопрос(@q, \@ans, $list->{id});
      } else {
        push @bad, @q, @ans;
      }
      @q = @ans = ();
      $ans = ''; # многострочный ответ
      push @q, $1, $line;
      next;
    }
    
    if ($line =~ s/^([абвгд])\)\s*//i) {
      push @ans, $ans
        if $ans;
      
      $ans = $line;
      
      if (lc($1) eq 'а'){
        $q[1] .= ' '.join(' ', @ans);# многострочный вопрос
        @ans = ();
      }
      next;
    } elsif ($ans) {# продолж многостроч ответ
      $ans .= ' '.$line;
      next;
      
    } else {# по старому закачка
      #~ $ans = line;
    }
    
    push @ans, $line;
  }
  # последний вопрос
  push @ans, $ans
    if $ans;
  push @data, $c->model->сохранить_тестовый_вопрос(@q, \@ans, $list->{id})
    if @q && @ans gt 3;
  
  $c->model->удалить_вопросы_из_списка($list->{id}, [map($_->{id}, @data)])
    if @data && $c->param('удалять незакачанные');
  
  $c->_upload_render('закачка'=>\@data, $list->{id} ? ('все вопросы'=>$c->model->вопросы_списка($list->{id})) : (), 'плохие'=>\@bad, 'названия тестов'=>$названия_тестов, 'название'=>(grep($_->{id} eq $list->{id}, @$названия_тестов))[0],);
  
}

sub _upload_render {
  my $c = shift;
  $c->render('medcol/upload',
    handler=>'ep',
    'header-title' => 'Редактирование тестовых вопросов и ответов',
    'Проект'=>$c->Проект,
    assets=>["medcol/main.js", "medcol/lib.js", "medcol/форма тестов.js"],
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
      $c->новая_сессия
        and return $c->redirect_to('МедКол/детальный результат', 'sess_sha1'=>$sess->{"сессия/sha1"}) #$c->index
          #~ and return $c->подробно($sess)
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
    'header-title' => "Тест 〉$sess->{'название теста'}",
    'Проект'=>$c->Проект,
    assets=>["medcol/main.js",],
    'вопрос'=>$q,
    'сессия'=>$sess,
  );
}

sub подробно {# результаты одной сессии
  my $c = shift;
  
  my $sess = shift || eval {$c->model->сессия_sha1($c->stash('sess_sha1'))};#$c->время_теста
  return $c->redirect_to('/')
    unless $sess;
  
  $c->render('medcol/подробно',
    handler=>'ep',
    'header-title' => "Отчет по тесту 〉$sess->{'название теста'}",
    'Проект'=>$c->Проект,
    assets=>["medcol/main.js",],
    'ответы'=>$c->model->сессия_ответы($sess->{id}),
    'сессия'=>$sess,
  );
}

sub результаты {# все
  my $c = shift;
  my $param = {
    limit => $c->param('l') || $c->результаты_лимит_строк,
    offset => $c->param('o') || 0,
    test_id => $c->param('t'),
    'сессия от'=>$c->param('d1'),
    'сессия до'=>$c->param('d2'),
    'sha1'=>$c->param('c'),
  };
  $param->{offset} = 0
    if $param->{offset} < 0;
  
  $c->render('medcol/результаты',
    handler=>'ep',
    'header-title' => "Общие результаты",
    'Проект'=>$c->Проект,
    assets=>["medcol/main.js", ],#"datetime.picker.js"
    'результаты'=>$c->model->результаты_сессий($param),
    param=>$param,
    'список тестов' => $c->model->названия_тестов(),#where=>'where coalesce("задать вопросов", 1)>0 '
  );
  
}

sub статистика_ответы {
  my $c = shift;
  my $param = {
    test_id => $c->param('t'),
  };
  $c->render('medcol/статистика/ответы',
    handler=>'ep',
    'header-title' => "Статистика по ответам",
    'Проект'=>$c->Проект,
    assets=>["medcol/main.js", ],#"datetime.picker.js"
    'результаты'=>$c->model->статистика_ответы($param),
    'вопросы'=>$c->model->тестовые_вопросы(),
    #~ param=>$param,
    'названия тестов' => $c->model->названия_тестов(),#where=>'where coalesce("задать вопросов", 1)>0 '
  );
}

sub результаты_цепочки {# все
  my $c = shift;
  my $param = {
    "успехов"=>$c->param('успехов'),
    "тест"=>$c->param('тест'),
    "sha1" => $c->param('sha1'),
    "limit" => $c->param('limit') || $c->результаты_лимит_строк,
    "offset" => $c->param('offset') || 0,
    #~ test_id => $c->param('t'),
    #~ 'сессия от'=>$c->param('d1'),
    #~ 'сессия до'=>$c->param('d2'),
  };
  #~ $param->{offset} = 0
    #~ if $param->{offset} < 0;
  
  $c->render('medcol/результаты_цепочки',
    handler=>'ep',
    'header-title' => "Результаты тестирования",
    'Проект'=>$c->Проект,
    assets=>["medcol/main.js", ],#datetime.picker.js
    'результаты'=>scalar grep(defined, @$param{qw(успехов тест sha1)}) ? $c->model->результаты_сессий_цепочки($param) : [],#
    param=>$param,
    'список тестов' => $c->model->названия_тестов(),#where=>'where coalesce("задать вопросов", 1)>0 '
  );
  
}

sub сохранить_проверку_результата {
  my $c = shift;
  my $param = {
    "sha1"=>$c->param('sha1'),
    "значение"=>$c->param('val') eq 'true' ? 1 : 0,
  };
  my $r = $c->model->сохранить_проверку_результата($param);
  $c->render(json=>{success=>$r});
  
}

sub структура_тестов {
  my $c = shift;
  $c->render(json=>$c->model->структура_тестов());
}


sub DESTROY {
  my $c = shift;
  #~ $c->log->debug('DESTROY '.__PACKAGE__);
  #~ sleep 10;
  #~ $c->app->log->debug(@{$c->app->renderer->paths});
  #~ shift @{$c->app->renderer->paths};
  #~ $c->app->log->debug(@{$c->app->renderer->paths});
}

1;