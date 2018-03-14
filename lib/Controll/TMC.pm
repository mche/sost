package Controll::TMC;
use Mojo::Base 'Mojolicious::Controller';
use JSON::PP;

my $JSON = JSON::PP->new->utf8(0);

has model => sub {shift->app->models->{'TMC'}};
has model_nomen => sub {shift->app->models->{'Nomen'}};
has model_obj => sub {shift->app->models->{'Object'}};
has model_contragent => sub {shift->app->models->{'Contragent'}};
has model_transport => sub {shift->app->models->{'Transport'}};

sub index {
  my $c = shift;
  return $c->render('tmc/ask',
    handler=>'ep',
    'header-title' => 'Учет ТМЦ',
    assets=>["tmc/ask.js",],
    );
}

sub index_snab {
  my $c = shift;
  return $c->render('tmc/snab',
    handler=>'ep',
    'header-title' => 'Учет ТМЦ',
    assets=>["tmc/snab.js",],
    );
}

sub index_baza {
  my $c = shift;
  return $c->render('tmc/baza',
    handler=>'ep',
    'header-title' => 'Учет ТМЦ',
    assets=>["tmc/baza.js",],
    );
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
  
  my $r = $c->model->позиция_тмц($data->{id})
    or return $c->render(json => {error=>"нет такой позиции ТМЦ"})
    if ($data->{id});
  
  return $c->render(json=>{error=>"ТМЦ оприходовано $r->{'дата/принято'}"})
    if $r && $r->{'количество/принято'};
  
  return $c->render(json => {error=>"Заявка обработана снабжением"})
    if $r && $r->{"транспорт/заявки/id"};
  
  delete @$data{qw(количество/принято дата/принято принял)};
  
  grep {defined $data->{$_} || return $c->render(json=>{error=>"Не указано [$_]"})} qw(дата1 количество);
  
  $c->model_obj->доступные_объекты($c->auth_user->{id}, $data->{"объект"})->[0]
    or return $c->render(json=>{error=>"Объект недоступен"});
  
  #~ $data->{_prev} = $c->model->позиция_тмц($data->{id})
    #~ if $data->{id};
  
  my $tx_db = $c->model->dbh->begin;
  local $c->$_->{dbh} = $tx_db # временно переключить модели на транзакцию
    for grep $c->can($_),qw(model_nomen model);
  
  my $nom = $c->сохранить_номенклатуру($data->{"номенклатура"});
  return $c->render(json=>{error=>$nom})
    unless ref $nom;

  #~ return $c->render(json=>{success=>$data});
  
  my $rc = eval{$c->model->сохранить_заявку((map {($_=>$data->{$_})} grep {defined $data->{$_}} qw(id дата1 количество ед коммент объект)),
    "uid"=>$c->auth_user->{id},
    "номенклатура"=>$nom->{id},
    #~ "контрагент"=>$data->{"контрагент"} && ($data->{"контрагент"}{id} || $data->{"контрагент"}{new}{id}),
    )};
  $c->app->log->error($@)
    and return $c->render(json=>{error=>"Ошибка: $@"})
    unless ref $rc;
  
  
  
  $tx_db->commit;
  
  $c->render(json=>{success=>$c->model->позиция_тмц($rc->{id})});
  
  
}

sub сохранить_номенклатуру {
  my ($c, $nom) = @_;
  my @new = grep $_->{title}, @{$nom->{newItems} || []};
  
  #~ $nom->{newItems} = [];# сбросить обязательно для кэша
  
  return "нет наименования/номенклатуры"
    unless ($nom->{selectedItem} && $nom->{selectedItem}{id}) || @new;
  
  my $parent = ($nom->{selectedItem} && $nom->{selectedItem}{id}) || ($nom->{topParent} && $nom->{topParent}{id});
  
  $nom->{selectedItem} = $c->model_nomen->проверить_путь([map $_->{title}, @new])
    and $nom->{id} = $nom->{selectedItem}{id}
    and return $nom
    unless $parent;
  
  for (@new) {
    $_->{parent} = $parent;# для проверки
    my $new= eval {$c->model_nomen->сохранить($_)};# || $@;
    $c->app->log->error($@)
      and return "Ошибка: $@"
      unless ref $new;
    $parent = $new->{id};
    #~ push @{$nom->{selectedPath} ||= []}, $new;
    $nom->{selectedItem} = $new;
    #~ push @{$nom->{newItems}}, $new;# для проверки и кэшировагния
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
    and return "Ошибка сохранения поставщика: $@"
    unless ref $data->{new};
  
  $data->{id}=$data->{new}{id};
  
  return $data;
  
}

sub сохранить_снаб {# обработка снабжения и перемещения
  my $c = shift;
  my $data = $c->req->json;
  
  $data->{'дата1'} ||= $data->{"дата отгрузки"};
  return $c->render(json=>{error=>"Не указана дата отгрузки"})
    unless $data->{'дата1'};
  
  $data->{"объект"} //= $data->{"объект/id"};
  
  #~ return $c->render(json=>{error=>"Не указан объект"})
    #~ unless defined $data->{"объект"};
  
  #~ $c->model_obj->доступные_объекты($c->auth_user->{id}, $data->{"объект"})->[0]
    #~ or return $c->render(json=>{error=>"Объект недоступен"});
  
  return $c->render(json=>{error=>"Не указан поставщик"})
    unless grep { $_->{id} || $_->{title} } @{$data->{contragent4} ||  $data->{'$грузоотправители'}};
  
  my $tx_db = $c->model->dbh->begin;
  local $c->$_->{dbh} = $tx_db # временно переключить модели на транзакцию
    for grep $c->can($_),qw(model_nomen model_contragent model model_transport);
  
  $data->{'_объекты'} = {};# просто кэш уникальности для заказчиков/адресов
  $data->{'заказчики/id'} = []; # из объектов позиций
  $data->{'груз'} = '';
  $data->{'куда'} = []; # объекты позиций
  $data->{'контакты заказчиков'} = [];
  map {
    my $tmc = $_;
    grep {defined $tmc->{$_} || return $c->render(json=>{error=>"Не указано [$_]"})} qw(дата1 количество );#цена
    
    my $nom = $c->сохранить_номенклатуру($_->{nomen} || $_->{Nomen});
    return $c->render(json=>{error=>$nom})
      unless ref $nom;
    
    $tmc->{"объект"} = $tmc->{"объект/id"} || (ref($tmc->{'$объект'}) && $tmc->{'$объект'}{id}) || (ref($tmc->{"объект"}) && $tmc->{"объект"}{id})
      ||  $data->{"объект/id"} || (ref($data->{"объект"}) ? $data->{"объект"}{id} : $data->{"объект"});
    
    # пересохранить цену и комменты позиций
    my $pos = $c->model->сохранить_заявку(
      (map {($_=>$tmc->{$_})} grep {defined $tmc->{$_}} qw(id дата1 количество цена коммент объект)),
      "uid"=>$c->auth_user->{id},
      "номенклатура"=>$nom->{id},
    );
    $c->app->log->error($@)
      and return $c->render(json=>{error=>"Ошибка сохранения позиций заявки: $@"})
      unless ref $pos;
    
    $c->app->log->error($c->dumper($pos));
    
    $tmc->{'позиция'} = $c->model->позиция_тмц($pos->{id})
      or $c->app->log->error($c->dumper($tmc))
      and return $c->render(json=>{error=>"не сохранилась строка ТМЦ"});
    
    #~ $c->app->log->error($c->dumper($tmc->{'позиция'}));
    
    $_->{id}=$tmc->{'позиция'}{id};
    
    $data->{'груз'} .= join('/', @{$tmc->{'позиция'}{"номенклатура"}})."\t".$tmc->{'позиция'}{"количество"}."\n";
    unless ( $data->{'_объекты'}{$tmc->{'объект'}}++ || !(my $kid = $c->model_obj->объекты_проекты($tmc->{'объект'})->[0]{'контрагент/id'}) ) {
      push @{$data->{'куда'}}, ['#'.$tmc->{'объект'}];
      push(@{$data->{'заказчики/id'}}, $kid)
        unless $data->{'_объекты'}{$kid}++;
      push @{$data->{'контакты заказчиков'}}, [join(' ', @{$tmc->{'профиль заказчика'}}), undef] # телефон бы
        if $tmc->{'профиль заказчика'} && !$data->{'_объекты'}{$kid}++;
    }
  } @{$data->{'$позиции тмц'} || return $c->render(json=>{error=>"Не указаны позиции ТМЦ"})};
  
  
  
  # обработка поставщиков, их конт лиц и адресов отгрузки(откуда)
  $data->{'грузоотправители/id'} = [];
  my $i = 0;
  map {
    my $k = $c->сохранить_контрагент($_);
    #~ return $c->render(json=>{error=>$k})
      #~ unless ref $k;
    if(ref($k) && $k->{id}) {
      push @{$data->{'грузоотправители/id'}}, $k->{id};
    } else {
      splice @{$data->{contact4}},$i,1;
      splice @{$data->{address1}},$i,1;
    }
    $i++;
  } @{$data->{contragent4} || $data->{'$грузоотправители'}};
  
  #~ $c->app->log->error($c->dumper($data->{'грузоотправители/id'}));
  $data->{'контакты грузоотправителей'} = [];
  if ($data->{contact4}) {
    push @{$data->{'контакты грузоотправителей'}}, [$_->{title}, $_->{phone}]
      for @{$data->{contact4}};
  }
  
  
  $data->{"откуда"} = $JSON->encode([ map { [map { $_->{id} ? "#".(($data->{'с объекта/id'} = $_->{id}) && $_->{id}) : $_->{title} } grep { $_->{title} } @$_] } grep { grep($_->{title}, @$_) } @{$data->{address1}} ])
    if $data->{address1};
  
  if (my $id = $data->{'$с объекта'} && $data->{'$с объекта'}{id}) {
    $c->model_obj->доступные_объекты($c->auth_user->{id}, $id)->[0]
      or return $c->render(json=>{error=>"Объект недоступен"});
    $data->{"откуда"} = $JSON->encode([["#$id"]]);
    $data->{'с объекта/id'} = $id;
    $data->{'контакты грузоотправителей'} = [[join(' ', @{$c->auth_user->{names}}), undef]];
    
  } else {
    $data->{'с объекта/id'} = undef;
  }
  return $c->render(json=>{error=>"Не указан адрес отгрузки"})
    if $data->{"откуда"} eq '[]';
  
  if(my $id = ($data->{'на объект'} && $data->{'на объект'}{id}) || ($data->{'$на объект'} && $data->{'$на объект'}{id}) ) {# куда - на объект
    $data->{'куда'} = $JSON->encode([["#$id"]]);
    $data->{'на объект/id'} = $id;
    $data->{'заказчики/id'} = [$c->model_obj->объекты_проекты($id)->[0]{'контрагент/id'}];
    $data->{'контакты заказчиков'} = [[join(' ', @{$c->auth_user->{names}}), undef]];
  } else {
    $data->{"куда"} = $JSON->encode($data->{"куда"});
    $data->{'на объект/id'} = undef;
  }
  
  #~ if(my $id = $data->{'с объекта/id'} || ($data->{'с объекта'} && $data->{'с объекта'}{id})) {# откуда - с объекта
    #~ $data->{'откуда'} = $JSON->encode([["#$id"]]);
    #~ $data->{'на объект/id'} = $id;
    #~ $data->{'заказчики/id'} = [$c->model_obj->объекты_проекты($id)->[0]{'контрагент/id'}];
    #~ $data->{'контакты заказчиков'} = [[join(' ', @{$c->auth_user->{names}}), undef]];
  #~ } else {
    #~ $data->{"откуда"} = ;
    #~ $data->{'на объект/id'} = undef;
  #~ }
  
  #~ return $c->render(json=>{success=>$data});
  
  $data->{'uid'} //= 0;
  $data->{'снабженец'} = $data->{id} ? undef : $c->auth_user->{id};
  
  my $rc = $c->model->сохранить_снаб($data);
  #~ $rc ||= $@;
  $c->app->log->error($rc)
    and return $c->render(json=>{error=>"Ошибка сохранения: $rc"})
    unless ref $rc;
  
  #~ $c->app->log->error($c->dumper($rc));
  
  $tx_db->commit;
  
  $c->render(json=>{success=>$rc});

}


sub list {
  my $c = shift;
  my $param =  shift || $c->req->json;
  
  my $obj = ( ref $param->{'объект'} ? $param->{'объект'}{id} : $param->{'объект'} ) #$c->vars('object') // $c->vars('obj') # 0 - все проекты
    // return $c->render(json => {error=>"Не указан объект"});
  
  $c->model_obj->доступные_объекты($c->auth_user->{id}, $obj)->[0]
    or return $c->render(json=>{error=>"Объект недоступен"});
    
  $param->{where} = ' where "транспорт/id" is null and "с объекта" is null and "на объект" is null ';

  my $data = eval{$c->model->список($param)};# || $@;
  $c->app->log->error($@)
    and return $c->render(json => {error=>"Ошибка: $@"})
    unless ref $data;
  
  return $c->render(json => $data);
}

sub список_снаб {# 
  my $c = shift;
  my $param =  $c->req->json || {};
  #~ $param->{'список снабжения'}=1;
  #~ $c->list($param);
  my $obj = ($param->{объект} && ref($param->{объект}) ? $param->{объект}{id} : $param->{объект}) //= $c->vars('object') // $c->vars('obj') # 0 - все проекты
    // return $c->render(json => {error=>"Не указан объект"});
  
  $param->{where} = ' where "транспорт/заявки/id" is null ';
  
  my $data1 = eval{$c->model->список($param)}# !не только необработанные позиции
  #~ $data1 ||= $@;
    or $c->app->log->error($@)
    and return $c->render(json => {error=>"Ошибка"});
    #~ unless ref $data1;

  my $data2 = eval{$c->model->список_снаб($param)}
  #~ $data2 = $@
    #~ if $@;
    or $c->app->log->error($@)
    and return $c->render(json => {error=>"Ошибка"});
    #~ unless ref($data2);

  return $c->render(json => [$data1, $data2,]);
}

sub delete_ask {
  my $c = shift;
  my $data = $c->req->json;
  
  my $r = $c->model->позиция_тмц($data->{id})
    or return $c->render(json => {error=>"нет такой позиции ТМЦ"});
  
  return $c->render(json=>{error=>"ТМЦ оприходовано $r->{'дата/принято'}"})
    if $r->{'количество/принято'};
  
  return $c->render(json => {error=>"Заявка обработана снабжением"})
    if $r->{"транспорт/заявки/id"};
  
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

sub адреса_отгрузки {
  my $c = shift;
  
  my $id = $c->vars('contragent_id')
    or return $c->render(json => {error=>"Нет ИДа контрагента"});
    
  return $c->render(json => $c->model->адреса_отгрузки($id));
}

sub заявки_с_транспортом {
  my $c = shift;
  my $param =  $c->req->json || {};
  
  return $c->render(json => {error=>"Не указан объект"})
    unless $param->{'объект'} && $param->{'объект'}{id};
  
  $c->model_obj->доступные_объекты($c->auth_user->{id}, $param->{'объект'}{id})->[0]
    or return $c->render(json=>{error=>"Объект недоступен"});

  my $data = eval{$c->model->заявки_с_транспортом($param)};# || $@;
  $data = $@
    and $c->app->log->error($data)
    and return $c->render(json => {error=>"Ошибка: $data"})
    unless ref $data;
  
  return $c->render(json => $data);
}

sub сохранить_поступление {
  my $c = shift;
  my $data =  $c->req->json;
  
  my $r = $c->model->позиция_тмц($data->{id})
    or return $c->render(json => {error=>"нет такой позиции ТМЦ"});
  
  $c->model_obj->доступные_объекты($c->auth_user->{id}, $r->{'объект/id'})->[0]
    or return $c->render(json=>{error=>"Объект недоступен"});
  
  return $c->render(json=>{error=>"Прошло уже 24 часа"})
    if $r->{'количество/принято'} && $r->{'дата/принято'} && $r->{'дата/принято/часов'} > 24;
  
  $data->{'принял'} = $c->auth_user->{id};
  #~ if($data->{'крыжик количества'}) { в js!!!

  delete @$data{qw(uid ts цена количество дата1 дата/принято)};# обязательно удалить 'дата/принято' - будет now()
  
  #~ $c->app->log->debug($c->dumper($data));
  
  $r = eval {$c->model->обновить($c->model->{template_vars}{schema}, 'тмц', ["id"], $data, {'дата/принято'=>"now()", 'количество/принято'=>"text2numeric(?)"})};
  $r ||= $@;
  $c->app->log->error($r)
    and return $c->render(json=>{error=>"Ошибка сохранения"})
    unless ref $r;
  #~ eval {$c->model->dbh->commit};
  $r = $c->model->позиция_тмц($data->{id});
  $c->render(json=>{success=>$r});
}

sub заявки_перемещение {
  my $c = shift;
  my $param =  $c->req->json || {};
  
  return $c->render(json => {error=>"Не указан объект"})
    unless $param->{'объект'} && $param->{'объект'}{id};
  
  $c->model_obj->доступные_объекты($c->auth_user->{id}, $param->{'объект'}{id})->[0]
    or return $c->render(json=>{error=>"Объект недоступен"});

  my $data = eval{$c->model->заявки_перемещение($param)};# || $@;
  $data ||= $@;
  $c->app->log->error($data)
    and return $c->render(json => {error=>"Ошибка: $data"})
    unless ref $data;
  
  return $c->render(json => $data);
  
}

sub сохранить_перемещение {
  my $c = shift;
  #~ my $data =  $c->req->json;
  
  return $c->сохранить_снаб();
  
}

sub текущие_остатки {# для доступнвых объектов
  my $c = shift;
  my $param =  $c->req->json || {};
  
  #~ my @oids = ();
  #~ push @oids, $_->{id} 
    #~ for @{ $c->model_obj->доступные_объекты($c->auth_user->{id}, $param->{'объект'}{id} eq 0 ? [undef] : [$param->{'объект'}{id}]) };
  
  my $data = eval{ $c->model->текущие_остатки($c->auth_user->{id}, $param->{'объект'}{id} eq 0 ? undef : [$param->{'объект'}{id}]) };# || $@;
  $data ||= $@;
  $c->app->log->error($data)
    and return $c->render(json => {error=>"Ошибка: $data"})
    unless ref $data;
  
  return $c->render(json => $data);
}

sub движение {
  my $c = shift;
  my $param =  $c->req->json || {};
  
  $param->{uid} = $c->auth_user->{id};
  my $data = eval{ $c->model->движение_тмц($param) };# || $@;
  $data ||= $@;
  $c->app->log->error($data)
    and return $c->render(json => {error=>"Ошибка: $data"})
    unless ref $data;
  
  return $c->render(json => $data);
}

1;
