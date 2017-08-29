package Controll::Transport;
use Mojo::Base 'Mojolicious::Controller';
use Util qw(numeric);


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

sub список_транспорта {
  my $c = shift;
  my $cat =  $c->vars('category');
  my $con = $c->vars('contragent');
  $c->render(json=>$c->model->список_транспорта($cat, $con));
}

sub save_ask {
  my $c = shift;
  my $data = $c->req->json;
  
  # проверки
  return $c->render(json=>{error=>"Не указан ПОЛУЧАТЕЛЬ транспорта"})
    unless $data->{contragent2}{id} || $data->{contragent2}{title} || $data->{project}{id};
    
  return $c->render(json=>{error=>"Не указано КУДА транспорт"})
    unless $data->{address2}{id} || $data->{address2}{title};

  $data->{transport}{"категория"} ||= $data->{category}{selectedItem} && $data->{category}{selectedItem}{id};
  
  return $c->render(json=>{error=>"Не указана КАТЕГОРИЯ транспорта"})
    unless !$data->{transport}{title} || $data->{transport}{"категория"};# || ($data->{category}{newItems}[0]{title});
  
  return $c->render(json=>{error=>"Не указан ГРУЗ транспорта"})
    unless $data->{'без груза'} || $data->{'груз'};
  
  my $tx_db = $c->model->dbh->begin;
  local $c->$_->{dbh} = $tx_db # временно переключить модели на транзакцию
    for qw(model_contragent model);
  
  $data->{'заказчик'} = $c->сохранить_контрагент($data->{contragent2});
  return $c->render(json=>{error=>$data->{'заказчик'}})
    unless ref $data->{'заказчик'};
  
  $data->{'перевозчик'} = $c->сохранить_контрагент($data->{contragent1});
  return $c->render(json=>{error=>$data->{'перевозчик'}})
    unless ref $data->{'перевозчик'};
  
  $data->{'транспорт'} = $c->сохранить_транспорт($data->{transport});
  return $c->render(json=>{error=>$data->{'транспорт'}})
    unless ref $data->{'транспорт'};
  
  $data->{"проект"} = $data->{project}{id}
    unless $data->{'заказчик'}{id} || $data->{address2}{id};
  
  if ($data->{address2}{id}) {
    $data->{"куда"} = undef;
    $data->{"объект"} = $data->{address2}{id};
  } else {
    $data->{"куда"} = $data->{address2}{title};
  }
  
  if($data->{'транспорт'}{id}){
    $data->{"категория"} = undef;
  } else {
    $data->{"категория"} = $data->{'транспорт'}{"категория/id"} || $data->{transport}{"категория"};
  }
  
  $data->{"стоимость"} = numeric($data->{"стоимость"})
    if $data->{"стоимость"};
  $data->{"факт"} = numeric($data->{"факт"})
    if $data->{"факт"};
  
  my $r = eval {$c->model->сохранить_заявку($data
    #~ %$data,
    #~ "проект"=>$data->{project}{id},
    #~ $data->{address2}{id} ? ("куда"=>undef, "объект"=>$data->{address2}{id}) : ("куда"=>$data->{address2}{title}),
    #~ $data->{'транспорт'}{id} ? ("категория"=>undef) : ("категория"=>$data->{transport}{"категория"}),
  )};
  $r = $@
    if $@;
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
  $data = eval{$c->model->сохранить_транспорт($data)};# || $@;
  $c->app->log->error($data)
    and return "Ошибка сохранения транспорта: $data"
    unless ref $data;
  
  return $data;
}


1;