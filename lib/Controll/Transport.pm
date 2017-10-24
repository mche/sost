package Controll::Transport;
use Mojo::Base 'Mojolicious::Controller';
use Util qw(numeric);
use JSON::PP;

my $JSON = JSON::PP->new->utf8(0);


has model => sub {shift->app->models->{'Transport'}};
#~ has model_nomen => sub {shift->app->models->{'Nomen'}};
#~ has model_obj => sub {shift->app->models->{'Object'}};
has model_contragent => sub {shift->app->models->{'Contragent'}};

sub index {
  my $c = shift;
  #~ $c->index;
  return $c->render('transport/ask',
    handler=>'ep',
    'header-title' => 'Транспорт и техника',
    assets=>["transport/ask.js",],
    );
    #~ if $c->is_user_authenticated;
}

sub ask_work {
  my $c = shift;
  #~ $c->index;
  return $c->render('transport/ask-work',
    handler=>'ep',
    'header-title' => 'Транспорт и техника',
    assets=>["transport/ask-work.js",],
    );
  
}

sub список_транспорта {
  my $c = shift;
  my $cat =  $c->vars('category');
  my $con = $c->vars('contragent');
  $c->render(json=>$c->model->список_транспорта($cat, $con));
}

sub свободный_транспорт {
  my $c = shift;
  $c->render(json=>$c->model->свободный_транспорт());
}

sub список_заявок {
  my $c = shift;
  my $param = $c->req->json;
  $c->render(json=>$c->model->список_заявок($param));
}

sub save_ask {
  my $c = shift;
  my $data = $c->req->json;
  
  return $c->save_draft($data)
  if ($data->{черновик});
  #~ return $c->render(json=>$data);
  
  # проверки
  return $c->render(json=>{error=>"Не указан ПОЛУЧАТЕЛЬ транспорта"})
    unless $data->{contragent2}{id} || $data->{contragent2}{title};# || $data->{project}{id};
  
  #~ $data->{"откуда"} = [map { $_->{id} ? "#".$_->{id} : $_->{title};} grep {$_->{title}} @{$data->{address1}}];
  #~ $data->{"куда"} = [map { $_->{id} ? "#".$_->{id} : $_->{title};} grep {$_->{title}} @{$data->{address2}}];
  $data->{"откуда"} = $JSON->encode([ map { [map { $_->{id} ? "#".$_->{id} : $_->{title} } grep { $_->{title} } @$_] } grep { grep($_->{title}, @$_) } @{$data->{address1}} ]);
  $data->{"куда"} = $JSON->encode([ map { [map { $_->{id} ? "#".$_->{id} : $_->{title} } grep { $_->{title} } @$_] } grep { grep($_->{title}, @$_) } @{$data->{address2}} ]);
  #~ $c->app->log->error($data->{"откуда"}, $data->{"куда"});
  
  return $c->render(json=>{error=>"Не указано КУДА транспорт"})
    if $data->{"куда"} eq '[]';

  $data->{transport}{"категория"} = $data->{category}{selectedItem} && $data->{category}{selectedItem}{id};
  
  return $c->render(json=>{error=>"Не указана КАТЕГОРИЯ транспорта"})
    unless !$data->{transport}{title} || $data->{transport}{"категория"};# || ($data->{category}{newItems}[0]{title});
  
  return $c->render(json=>{error=>"Не указан ПЕРЕВОЗЧИК"})
    unless !$data->{transport}{title} || $data->{contragent1}{id} || $data->{contragent1}{title};
  
  return $c->render(json=>{error=>"Не указан ВОДИТЕЛЬ транспорта"})
    unless !$data->{transport}{title} || !$data->{contragent1}{'проект/id'} || $data->{driver}{id} || $data->{driver}{title};# || $data->{contragent1}{id} 
  
  return $c->render(json=>{error=>"Не указан ГРУЗ транспорта"})
    unless $data->{'без груза'} || $data->{'груз'};
  
  my $tx_db = $c->model->dbh->begin;
  local $c->$_->{dbh} = $tx_db # временно переключить модели на транзакцию
    for qw(model_contragent model);
  
  #~ $c->app->log->error($c->dumper($data));
  $data->{'заказчик'} = $c->сохранить_контрагент($data->{contragent2});
  return $c->render(json=>{error=>$data->{'заказчик'}})
    unless ref $data->{'заказчик'};
  #~ $c->app->log->error($c->dumper([$data->{contragent2}, $data->{contragent2}{id}]));
  $data->{'заказчик'} = $data->{'заказчик'}{id};
  
  $data->{'перевозчик'} = $c->сохранить_контрагент($data->{contragent1});
  return $c->render(json=>{error=>$data->{'перевозчик'}})
    unless ref $data->{'перевозчик'};
  $data->{'перевозчик'} = $data->{'перевозчик'}{id};
  
  $data->{'посредник'} = $data->{contragent3}{id}
    unless $data->{'наш транспорт'};
  
  $data->{transport}{uid} = $c->auth_user->{id};
  $data->{transport}{перевозчик} = $data->{'перевозчик'};
  $data->{'транспорт'} = $c->сохранить_транспорт($data->{transport});
  return $c->render(json=>{error=>$data->{'транспорт'}})
    unless ref $data->{'транспорт'};
  $data->{'транспорт'} = $data->{'транспорт'}{id};
  $data->{'транспорт1'} = $data->{transport1}{id}
    if $data->{transport1} && $data->{transport1}{id};
  
  #~ if ($data->{transport1} && ) {
    #~ $data->{transport1}{uid} = $c->auth_user->{id};
    #~ $data->{transport1}{перевозчик} = $data->{'перевозчик'};
    #~ $data->{transport1}{категория} = $data->{category}{selectedItem} && $data->{category}{selectedItem}{id};
    #~ $data->{транспорт1} = $c->сохранить_транспорт($data->{transport1});
    #~ return $c->render(json=>{error=>$data->{транспорт1}})
      #~ unless ref $data->{транспорт1};
    #~ $data->{транспорт1} = $data->{транспорт1}{id};
  #~ }
  
  $data->{"водитель-профиль"} = $data->{driver}{id};
  $data->{"водитель"} = $data->{"водитель-профиль"} ? [undef, $data->{driver}{phone}, $data->{driver}{doc}] : [$data->{driver}{title}, $data->{driver}{phone}, $data->{driver}{doc}];
  
  $data->{'контакт1'} = [$data->{contact1}{title}, $data->{contact1}{phone}];
  $data->{'контакт2'} = [$data->{contact2}{title}, $data->{contact2}{phone}];
  $data->{'контакт3'} =  $data->{'посредник'} ? [$data->{contact3}{title}, $data->{contact3}{phone}]  :  undef;
  #~ if ($data->{address2}{id}) {
    #~ $data->{"куда"} = undef;
    #~ $data->{"объект"} = $data->{address2}{id};
  #~ } else {
    #~ $data->{"куда"} = $data->{address2}{title};
    #~ $data->{"объект"} = undef;
  #~ }
  
  
  
  if($data->{'транспорт'}){
    $data->{"категория"} = undef;
  } else {
    $data->{"категория"} = $data->{transport}{"категория"};
  }
  
  $data->{"стоимость"} = numeric($data->{"стоимость"})
    if $data->{"стоимость"};
  $data->{"факт"} = numeric($data->{"факт"})
    if $data->{"факт"};
  
  $data->{uid} = $c->auth_user->{id}
    unless $data->{id};
  #~ $c->app->log->error($c->dumper($data));
  delete $data->{ts};
  
  my $r = eval {$c->model->сохранить_заявку($data
    #~ %$data,
    #~ "проект"=>$data->{project}{id},
    #~ $data->{address2}{id} ? ("куда"=>undef, "объект"=>$data->{address2}{id}) : ("куда"=>$data->{address2}{title}),
    #~ $data->{'транспорт'}{id} ? ("категория"=>undef) : ("категория"=>$data->{transport}{"категория"}),
  )};
  $r ||= $@;
    #~ if $@;
  $c->app->log->error($r)
    and return $c->render(json=>{error=>$r})
    unless ref $r;
  
  $tx_db->commit;
  
  $c->render(json=>{success=>$r});
  
}


sub сохранить_контрагент {
  my ($c, $data) = @_;
  return $data
    if $data && $data->{id};
  return $data #"Не указан контрагент"
    unless $data && $data->{'title'};
  
  my $model = $c->model_contragent;
  
  $data->{new} = eval{$model->сохранить($data)};# || $@;
  $c->app->log->error($@)
    and return "Ошибка сохранения заказчика/перевозчика: $@"
    unless ref $data->{new};
  
  $data->{id}=$data->{new}{id};
  
  return $data;
  
}

sub сохранить_транспорт {
  my ($c, $data) = @_;
  return $data
    if $data && $data->{id};
  return $data #"Не указан "
    unless $data && $data->{'title'};
  
  $data = $c->model->сохранить_транспорт($data);# || $@;
  $c->app->log->error($data)
    and return "Ошибка сохранения транспорта: $data"
    unless ref $data;
  #~ $c->app->log->error($c->dumper($data));
  return $data;
}

sub заявки_адреса {
  my $c = shift;
  my $id = $c->vars('id');
  $c->render(json=>$c->model->заявки_адреса($id));
  
  
}

sub водители {
  my $c = shift;
  $c->render(json=>$c->model->водители());
}

sub заявки_контакты {
  my $c = shift;
  my $contact = $c->vars('contact');
  my $id = $c->vars('id');
  return $c->render(json=>$c->model->заявки_водители($id))
    if $contact eq 'водитель';
  return $c->render(json=>$c->model->заявки_контакт1($id))
    if $contact eq 'контакт1';
  return $c->render(json=>$c->model->заявки_контакт2($id))
    if $contact eq 'контакт2';
  return $c->render(json=>$c->model->заявки_контакт3($c->auth_user))
    if $contact eq 'контакт3';
  return $c->render(json=>{error=>"нет такого поля в заявках транспорта"});
}

=pod
sub заявки_интервал {
  my $c = shift;
  my $param = $c->req->json;
  
  $c->render(json=>$c->model->заявки_интервал($param));
  
}
=cut


sub save_draft { # сохранение черновика - один на одного пользователя
  my ($c, $data) = @_;
  $data->{uid} = $c->auth_user->{id};
  $data->{val} = $JSON->encode($data);
  my $r = eval {$c->model->сохранить_черновик_заявки($data)};
  $r ||= $@;
  $c->app->log->error($r)
    and return $c->render(json=>{error=>$r})
    unless ref $r;
  $c->render(json=>{draft=>$r});
}

sub черновик_заявки {
  my $c = shift;
  my $uid = $c->auth_user->{id};
  $c->render(json=>$c->model->черновик_заявки($uid));
  
}

sub ask_docx {
  my $c = shift;
  my $id = $c->vars('id');
  $c->app->log->error($id);
  #~ $docx_file=>"static/files/транспорт/заявка-$id.docx";
  
  my $data = $c->model->ask_docx($id);
  my $err_file = "$data->{docx_out_file}.error";
  
  open(PYTHON, "| python 2>'$err_file' ")
    || die "can't fork: $!";
  #~ ##local $SIG{PIPE} = sub { die "spooler pipe broke" };
  say PYTHON $data->{python};
  close PYTHON
    #~ || die "bads: $! $?"
    || return $c->render_file('filepath' => $err_file,  'format'   => 'txt', 'content_disposition' => 'inline', 'cleanup'  => 1,);
  
  `rm '$err_file'`;
  #~ my $python_script  = "static/files/транспорт/заявка-$data->{id}.py";
  
  #~ open(my $python, ">", $python_script)
    #~ || die "Can't open > $python_script: $!";
  
  #~ say $python $data->{python};
  #~ close $python
    #~ || die "bads: $! $?";
  
  $c->render_file(
    'filepath' => $data->{docx_out_file},
    #~ 'format'   => 'pdf',                 # will change Content-Type "application/x-download" to "application/pdf"
    #~ 'content_disposition' => 'inline',   # will change Content-Disposition from "attachment" to "inline"
    'cleanup'  => 1,                     # delete file after completed
  );
  
   #~ $c->render(text=>$data->{python}, format => 'txt',);
}


1;

__DATA__

