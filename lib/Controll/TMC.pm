package Controll::TMC;
use Mojo::Base 'Mojolicious::Controller';


has model => sub {shift->app->models->{'TMC'}};
has model_nomen => sub {shift->app->models->{'Nomen'}};
has model_obj => sub {shift->app->models->{'Object'}};
has model_contragent => sub {shift->app->models->{'Contragent'}};

sub index {
  my $c = shift;
  #~ $c->index;
  return $c->render('tmc/ask',
    handler=>'ep',
    'header-title' => 'Учет ТМЦ',
    assets=>["tmc/ask.js",],
    );
    #~ if $c->is_user_authenticated;
}

sub index_snab {
  my $c = shift;
  #~ $c->index;
  return $c->render('tmc/ask-snab',
    handler=>'ep',
    'header-title' => 'Учет ТМЦ',
    assets=>["tmc/ask-snab.js",],
    );
    #~ if $c->is_user_authenticated;
}

=pod
sub new_ask {# поля для формы заявки
  my $c = shift;
  # снабженцу поля
  return $c->render(json=>{"позиции"=>[]})
    if scalar grep {$_->{name} eq 'Менеджер отдела снабжения'} @{$c->auth_user->{roles} || []};
  $c->render(json=>{});
}
=cut

sub save_ask {
  my $c = shift;
  my $data = $c->req->json;
  
  return $c->render(json=>{error=>"Не указан объект"})
    unless $data->{"объект"};
    
  grep {defined $data->{$_} || return $c->render(json=>{error=>"Не указано [$_]"})} qw(дата1 количество);
  
  $c->model_obj->доступные_объекты($c->auth_user->{id}, $data->{"объект"})->[0]
    or return $c->render(json=>{error=>"Объект недоступен"});
  
  my $tx_db = $c->model->dbh->begin;
  local $c->$_->{dbh} = $tx_db # временно переключить модели на транзакцию
    for grep $c->can($_),qw(model_nomen model);
  
  my $nom = $c->сохранить_номенклатуру($data->{"номенклатура"});
  return $c->render(json=>{error=>$nom})
    unless ref $nom;
  
  
  
  my $rc = eval{$c->model->сохранить_заявку((map {($_=>$data->{$_})} grep {defined $data->{$_}} qw(id дата1 количество ед коммент объект)),
    "uid"=>$c->auth_user->{id},
    "номенклатура"=>$nom->{id},
    #~ "контрагент"=>$data->{"контрагент"} && ($data->{"контрагент"}{id} || $data->{"контрагент"}{new}{id}),
    )};
  $c->app->log->error($@)
    and return $c->render(json=>{error=>"Ошибка: $@"})
    unless ref $rc;
  
  $tx_db->commit;
  
  $c->render(json=>{success=>$rc});
  
  
}

sub сохранить_номенклатуру {
  my ($c, $nom) = @_;
  my @new = grep $_->{title}, @{$nom->{newPath} || []};
  
  #~ $nom->{newPath} = [];# сбросить обязательно для кэша
  
  return "нет наименования/номенклатуры"
    unless ($nom->{selectedItem} && $nom->{selectedItem}{id}) || @new;
  
  my $parent = $nom->{selectedItem} && $nom->{selectedItem}{id};
  
  for (@new) {
    $_->{parent} = $parent;# для проверки
    my $new= eval {$c->model_nomen->сохранить($_)};# || $@;
    $c->app->log->error($@)
      and return "Ошибка: $@"
      unless ref $new;
    $parent = $new->{id};
    #~ push @{$nom->{selectedPath} ||= []}, $new;
    $nom->{selectedItem} = $new;
    #~ push @{$nom->{newPath}}, $new;# для проверки и кэшировагния
  }
  
  #~ $nom->{selectedItem} = $nom->{selectedPath}[-1]
    #~ if @new;
    #~ unless $nom->{selectedItem} && $nom->{selectedItem}{id};
  
  $nom->{id} = $nom->{selectedItem}{id};
  
  #~ $c->model_category->кэш($c, 3) !!! тошлько после успешной транз!
    #~ if @new;
  return $nom;
  
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
    and return "Ошибка: $@"
    unless ref $data->{new};
  
  $data->{id}=$data->{new}{id};
  
  return $data;
  
}

sub сохранить_снаб {# обработка снабжения
  my $c = shift;
  my $data = $c->req->json;
  
  return $c->render(json=>{error=>"Не указан объект"})
    unless defined $data->{"объект"};
  
  $c->model_obj->доступные_объекты($c->auth_user->{id}, $data->{"объект"})->[0]
    or return $c->render(json=>{error=>"Объект недоступен"});
  
  my $tx_db = $c->model->dbh->begin;
  local $c->$_->{dbh} = $tx_db # временно переключить модели на транзакцию
    for grep $c->can($_),qw(model_nomen model_contragent model);
  
  map {
    my $data1 = $_;
    grep {defined $data1->{$_} || return $c->render(json=>{error=>"Не указано [$_]"})} qw(дата1 количество цена);
    
    my $nom = $c->сохранить_номенклатуру($_->{nomen} || $_->{Nomen});
    return $c->render(json=>{error=>$nom})
      unless ref $nom;

    my $rc = $c->model->сохранить_заявку((map {($_=>$data1->{$_})} grep {defined $data1->{$_}} qw(id дата1 количество цена коммент)),
      "uid"=>$c->auth_user->{id},
      "номенклатура"=>$nom->{id},
      "объект"=>$data1->{"объект/id"} || $data->{"объект"},
      );
    $c->app->log->error($@)
      and return $c->render(json=>{error=>"Ошибка: $@"})
      unless ref $rc;
    
    $_->{id}=$rc->{id};
    
  } @{$data->{'позиции'} || return $c->render(json=>{error=>"Не указаны ТМЦ"})};
  
  
  my $ca = $c->сохранить_контрагент($data->{contragent});
  return $c->render(json=>{error=>$ca})
    unless ref $ca;
  
  my $rc = eval{$c->model->сохранить_снаб((map {($_=>$data->{$_})} grep {defined $data->{$_}} ("id", "дата отгрузки", "адрес отгрузки", "коммент", "позиции")),
      "uid"=>$c->auth_user->{id},
      "контрагент"=>$ca->{id},
      #~ "объект"=>$data->{"объект"},
      )};
    $c->app->log->error($@)
      and return $c->render(json=>{error=>"Ошибка: $@"})
      unless ref $rc;
  
  #~ return $c->render(json=>{success=>$rc});
  
  $tx_db->commit;
  
  $c->render(json=>{success=>$rc});

}


sub list {
  my $c = shift;
  my $param =  shift || $c->req->json;
  
  my $obj = $c->vars('object') // $c->vars('obj') # 0 - все проекты
    // return $c->render(json => {error=>"Не указан объект"});
  
  $c->model_obj->доступные_объекты($c->auth_user->{id}, $obj)->[0]
    or return $c->render(json=>{error=>"Объект недоступен"});

  my $data = eval{$c->model->список($obj, $param)};# || $@;
  $c->app->log->error($@)
    and return $c->render(json => {error=>"Ошибка: $@"})
    unless ref $data;
  
  return $c->render(json => $data);
}

sub список_снаб {# 
  my $c = shift;
  my $param =  $c->req->json;
  $param->{'список снабжения'}=1;
  $c->list($param);
  #~ my $obj = $c->vars('object') // $c->vars('obj') # 0 - все проекты
    #~ // return $c->render(json => {error=>"Не указан объект"});
  
  #~ $c->model_obj->доступные_объекты($c->auth_user->{id}, $obj)->[0]
    #~ or return $c->render(json=>{error=>"Объект недоступен"});

  #~ my $data = eval{$c->model->список_снаб($obj, $param)};# || $@;
  #~ $c->app->log->error($@)
    #~ and return $c->render(json => {error=>"Ошибка: $@"})
    #~ unless ref $data;
  
  #~ return $c->render(json => $data);
}

sub delete_ask {
  my $c = shift;
  my $data = $c->req->json;
  
  return $c->render(json => {error=>"Заявка обработана снабжением"})
    if $data->{"тмц/снаб/id"};
  
  return $c->render(json => {error=>"На заявку есть ссылки"})
    if scalar @{$c->model->связи(id1=>$data->{"id"})};
  
  my $tx_db = $c->model->dbh->begin;
  local $c->model->{dbh} = $tx_db; # временно переключить модели на транзакцию
  
  my $r = eval{$c->model->удалить_заявку($data->{id})};# || $@;
  $c->app->log->error($@)
    and return $c->render(json => {error=>"Ошибка: $@"})
    unless ref $r;
  
  $tx_db->commit;
  
  return $c->render(json => {remove=>$r});
  
}

1;
