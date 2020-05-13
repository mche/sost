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
  #~ $c->log->medcol("новая сессия [$s->{id}]")#(sprintf "новая сессия %s; pg_pid %s", $s->{id}, $s->{pg_backend_pid}
    #~ unless $sess->{medcol};
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
  
  return 
        $sess
        && ($sess->{'задано вопросов'} && $sess->{'прошло с начала, сек'} > ($sess->{'всего время'} || $c->время_теста))
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
  my $sess = $c->session;#$c->сессия;
  
  $sess = $c->model->сессия($sess->{medcol})
    if $sess->{medcol};
  
  $sess = $c->новая_сессия
      if $c->начать_новую_сессию($sess);# можно сбрасывать неотвеченные сесиси || $sess->{'задано вопросов'} eq 0 || $sess->{'получено ответов'} eq 0;
  
  my $результаты = $sess->{id} ? $c->model->мои_результаты($sess->{id}) : [];
  
  #~ $c->log->error($c->dumper($результаты->[-1]))#$результаты->[0], 
    #~ if @$результаты;
  
  my $профиль; $профиль = $c->model->профиль_или_новый($результаты->[-1]{'сессия/id'})
    if scalar grep $_->{'%'}>=70, @$результаты;
  $профиль ||= {};
  #~ $c->log->error($c->dumper($профиль));
  
  return $c->render('medcol/index',
    handler=>'ep',
    'header-title' => 'Тестовые вопросы',
    'Проект'=>$c->Проект,
    'список тестов' => $c->model->названия_тестов(where=>'where coalesce("задать вопросов", 1)>0 and not coalesce("отключить", false) '),#$c->время_теста
    'результаты'=> $результаты,
    'сессия'=>$sess,
    $профиль ? ('профиль'=>$профиль) : (),
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
  
  my ($ok, $bad)  = $c->_parse_upload($list->{id}, $data, {"удалять незакачанные"=>$c->param('удалять незакачанные')});
  
  $c->_upload_render('закачка'=>$ok, $list->{id} ? ('все вопросы'=>$c->model->вопросы_теста($list->{id})) : (), 'плохие'=>$bad, 'названия тестов'=>$названия_тестов, 'название'=>(grep($_->{id} eq $list->{id}, @$названия_тестов))[0],);
  
}

sub _parse_upload {
  my ($c, $test_id, $data, $param) = @_;
  $c->inactivity_timeout(10*60);
  
  my @data = ();
  my @bad = ();

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
        push @data, $c->model->сохранить_тестовый_вопрос(@q, \@ans, $test_id);
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
  push @data, $c->model->сохранить_тестовый_вопрос(@q, \@ans, $test_id)
    if @q && @ans gt 3;
  
  $c->model->удалить_вопросы_из_списка($test_id, [map($_->{id}, @data)])
    if @data && $param->{'удалять незакачанные'};
  
  return \@data, \@bad;
  
};

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
  #~ $c->новая_сессия
    #~ and return $c->redirect_to('МедКол/детальный результат', 'sess_sha1'=>$sess->{"сессия/sha1"})
    #~ unless $q;
  
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
    #~ $c->log->error("Вопрос", $q, $c->param('t'));
    $c->новая_сессия
      and return $c->redirect_to('МедКол/детальный результат', 'sess_sha1'=>$sess->{"сессия/sha1"})
      unless $c->param('t');
    
    #~ return $c->index #$c->redirect_to('/')
      #~ unless $c->param('t');
    $sess = $c->model->начало_теста($sess->{id}, $c->param('t')) # вернет сессию связанную с тестом
      unless $sess->{'название теста'};
    #~ $c->model->сессию_продлить($sess->{id})
      
    $q = $c->model->новый_вопрос($sess->{id});
    #~ $sess = $c->сессия;# заново сессию
  }
  
  return $c->render('medcol/вопрос',
    handler=>'ep',
    'header-title' => "Тест: ".join(' 〉', grep defined, @{$sess->{'@название теста/родители'} || []}, $sess->{'название теста'}),
    'Проект'=>$c->Проект,
    assets=>["medcol/main.js",],
    'вопрос'=>$q,
    'сессия'=>$sess,
  ) if $q;
  
  # не должно сюда
  $c->новая_сессия
    and return $c->redirect_to('МедКол/детальный результат', 'sess_sha1'=>$sess->{"сессия/sha1"});
}

sub подробно {# результаты одной сессии
  my $c = shift;
  
  my $sess = shift || eval {$c->model->сессия_sha1($c->stash('sess_sha1'))};#$c->время_теста
  return $c->redirect_to('/')
    unless $sess;
  
  $c->render('medcol/подробно',
    handler=>'ep',
    'header-title' => "Отчет по тесту: ".join(' 〉', grep defined, @{$sess->{'@название теста/родители'} || []}, $sess->{'название теста'}),
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
    "логин" => $c->param('логин'),
    "limit" => $c->param('limit') || $c->результаты_лимит_строк,
    "offset" => $c->param('offset') || 0,
    #~ test_id => $c->param('t'),
    #~ 'сессия от'=>$c->param('d1'),
    #~ 'сессия до'=>$c->param('d2'),
  };
  #~ $param->{offset} = 0
    #~ if $param->{offset} < 0;
  
  my $res = scalar grep(defined, @$param{qw(успехов тест sha1 логин)}) ? $c->model->результаты_сессий_цепочки($param) : [];
  
  return $c->результаты_цепочки_xlsx($param, $res)
    if @$res && $c->param('xls');
  
  $c->render('medcol/результаты_цепочки',
    handler=>'ep',
    'header-title' => "Результаты тестирования",
    'Проект'=>$c->Проект,
    assets=>["medcol/main.js", "medcol/lib.js", "medcol/результаты-цепочки.js"],#datetime.picker.js
    'результаты'=>$res,#
    param=>$param,
    #~ 'список тестов' => $c->model->названия_тестов(),#where=>'where coalesce("задать вопросов", 1)>0 '
  );
  
}

sub результаты_цепочки_xlsx {
  my ($c, $param, $data) = @_;
  require Excel::Writer::XLSX;
  
  
  my @names = ('номер акта', 'дата акта', 'договор/номер','договор/дата начала', 'договор/дата завершения', 'контрагент/title', 'ИНН', 'объект', 'сумма/num');
  #~ my $filename=sprintf("static/tmp/%s-реестр-актов.xlsx", $c->auth_user->{id}, $month);
  
  open my $xfh, '>', \my $fdata or die "Failed to open filehandle: $!";
  my $workbook  = Excel::Writer::XLSX->new( $xfh );
  my $worksheet = $workbook->add_worksheet();
  my $n = 0;
  for my $r (@$data) {
    next unless $r->{'%больше70'};
    my $t = $c->app->json->decode($r->{'последняя сессия/ts/json'});
    $t->{'сек.'} = ($t->{'second'} =~ /^(\d+)\.?/)[0];
    my $профиль = $r->{'$профиль'} ? $c->app->json->decode($r->{'$профиль'}) : {};
    my $пароль = $профиль->{'пароль'} || substr($профиль->{'ts/sha1/d'} || '', 0, 4);
    my $i = -1;
    $worksheet->write_row($n++,0, ["профиль № $профиль->{'логин'}:$пароль", (undef) x 3, "$r->{'%больше70'} из $r->{'всего сессий'}"]);
    for my $percent (@{$r->{'%'} || []}) {
      $i++;
      next
        if $param->{'успехов'} && $percent < 70;
      next
        if defined($param->{'sha1'}) && $param->{'sha1'} ne '' && defined($param->{'тест'}) && $param->{'тест'} ne '' && $r->{'тест/id'}[$i] ne $param->{'тест'}; # фильтр теста здесь, не в запросе, если выставлен код сессии
      my $t = $c->app->json->decode($r->{'сессия/ts/json'}[$i]);
      my $check = $c->app->json->decode($r->{'сессия/дата проверки/json'}[$i])
        if $r->{'сессия/дата проверки'}[$i];
      #~ $worksheet->write_row($n++,0, \@names);
      #~ $worksheet->write_row($n++,0, [@$_{@names}])
      $worksheet->write_row($n++,0, [
        $профиль->{'логин'} || "$r->{'сессия/id'}[0]",
        join(' • ', @{$r->{'@тест/название/родители'}[$i] || []}, $r->{'тест/название'}[$i]),
        "$t->{'день нед'}, $t->{'day'} $t->{'месяца'} $t->{'year'} @{[ (length($t->{'hour'}) eq 1 ? '0' : '').$t->{'hour'} ]}:@{[ (length($t->{'minute'}) eq 1 ? '0' : '').$t->{'minute'} ]}",
        sprintf('%.1f', $percent),
        substr($r->{'сессия/sha1'}[$i], 0,4).($check ? '☑' : '□'),
        #~ $check ? '✓проверено' : '',
      ]);
    }
  }
  $workbook->close();
  #~ return $fdata;
  #~ $c->render(data=>$fdata, format=>'xlsx');
  # Render data from memory as file
  $c->render_file('data' => $fdata, 'filename' => 'Результаты тестов(выгрузка).xlsx', format=>'xlsx');
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

sub вопросы_теста {
  my $c = shift;
  my $id = $c->param('test_id');
  my $r = $c->model->вопросы_теста_родитель($id);
  $c->render(json=>$r);
}

sub сохранить_тест {
  my $c = shift;
  my $data = $c->req->json;
  #~ $data->{id}=123
    #~ if !$data->{id};
  #~ $data->{title}=$data->{'название'};
  my $r = $c->model->сохранить_тест($data);
  ($r->{'закачано'}, $r->{'плохие вопросы'})  = $c->_parse_upload($r->{id}, $data->{data}, {"удалять незакачанные"=>$data->{'удалять незакачанные'}})
    if $data->{data};
  $c->render(json => ref $r ? {success=>$r} : {error=>$r});
  
};

sub сохранить_вопрос {# крыжик вопроса в тесте
  my $c = shift;
  my $data = $c->req->json;
  my $r = $c->model->связь_удалить($data);
  return $c->render(json => ref $r ? {success=>$r} : {error=>$r})
    if $r;
  $r = $c->model->связь(@$data{qw(id1 id2)});
  return $c->render(json => ref $r ? {success=>$r} : {error=>$r});
}

sub вход {
  my $c = shift;
  #~ $c->log->error($c->param('login'), $c->param('pw'));
  
  my $профиль = $c->model->профиль_вход($c->param('login'))
    or $c->log->medcol("нет такого логина ".$c->param('login').':'.$c->param('pw'))
    and return $c->redirect_to('/');
    
  $c->log->medcol("неверный пароль ".$c->param('login').':'.$c->param('pw'))
    and return $c->redirect_to('/')
    unless substr($профиль->{'ts/sha1/d'} || '', 0, length($c->param('pw'))) eq $c->param('pw');
  
  $c->session->{medcol} = $c->model->цепочка_сессий_вверх($профиль->{'сессия/id'})->{child_id};
  $c->redirect_to('/');
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