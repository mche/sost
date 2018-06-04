package Controll::TMC;
use Mojo::Base 'Mojolicious::Controller';
#~ use JSON::PP;

#~ my $JSON = JSON::PP->new->utf8(0);

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
    
  return $c->render(json=>{error=>"Не указана номенклатура"})
    unless $data->{"номенклатура"}{selectedItem}{id} || $data->{"номенклатура"}{newItems}[0]{title} ;
  
  my $r = $c->model->позиция_заявки($data->{id})
    or return $c->render(json => {error=>"нет такой позиции заявки"})
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
  
  #~ my $nom = $c->сохранить_номенклатуру($data->{"номенклатура"});
  #~ return $c->render(json=>{error=>$nom})
    #~ unless ref $nom;

  #~ return $c->render(json=>{success=>$data});
  
  my $rc = eval{$c->model->сохранить_заявку((map {($_=>$data->{$_})} grep {defined $data->{$_}} qw(id дата1 количество коммент объект)),
    "uid"=>$c->auth_user->{id},
    "номенклатура/id"=>$data->{"номенклатура"}{selectedItem}{id},#$nom->{id},
    "наименование"=>$data->{"номенклатура"}{newItems}[0]{title}, # наименование текстом, если не выбрал позицию
    #~ "контрагент"=>$data->{"контрагент"} && ($data->{"контрагент"}{id} || $data->{"контрагент"}{new}{id}),
    )};
  $rc ||= $@;
  $c->app->log->error($rc)
    and return $c->render(json=>{error=>"Ошибка: $rc"})
    unless ref $rc;
  
  
  
  $tx_db->commit;
  
  $c->render(json=>{success=>$c->model->позиция_заявки($rc->{id})});
  
  
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
    unless grep { $_->{id} || $_->{title} } @{$data->{contragent4} ||  $data->{'@грузоотправители'}};
  
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
    
    if (my $id = $tmc->{'$тмц/заявка'} && $tmc->{'$тмц/заявка'}{id}) {
      my $pos = $tmc->{'$тмц/заявка'} = $c->model->позиция_заявки($id);
      if ($nom->{id} ne $pos->{'номенклатура/id'}) {# сменилась номенклатура
        $c->model->связь_удалить(id1=>$pos->{'номенклатура/id'}, id2=>$pos->{id});
        $c->model->связь($nom->{id}, $pos->{id});
      }
    } else {# снабженец сам делает заявку
      my $pos = $tmc->{'$тмц/заявка'} = $c->model->сохранить_заявку(
        (map {($_=>$tmc->{$_})} grep {defined $tmc->{$_}} qw(id00000 дата1 количество объект)),
        "uid"=>$c->auth_user->{id},
        "номенклатура"=>$nom->{id},
      );
      $pos ||= $@;
      $c->app->log->error($pos)
        and return $c->render(json=>{error=>"Ошибка сохранения позиции заявки: $pos"})
        unless ref $pos;
    }
    
    delete @$tmc{qw(количество/принято дата/принято принял)};
    $tmc->{uid} = $c->auth_user->{id};
    
    $tmc = $_ =  $c->model->сохранить_тмц($tmc);
    #~ $pos = $c->model->позиция_тмц($pos->{id})
      #~ or $c->app->log->error($c->dumper($tmc))
      #~ and return $c->render(json=>{error=>"не сохранилась строка ТМЦ"});
    
    
    #~ $tmc->{id} ||= $pos->{id};#$tmc->{'позиция'}{id};
    
    $data->{'груз'} .= join('〉', @{$tmc->{"номенклатура"}}).":\t".$tmc->{"количество"}."\n";
    unless ( $data->{'_объекты'}{$tmc->{'объект/id'}}++ || !(my $kid = $c->model_obj->объекты_проекты($tmc->{'объект/id'})->[0]{'контрагент/id'}) ) {
      push @{$data->{'куда'}}, ['#'.$tmc->{'объект/id'}];
      push(@{$data->{'заказчики/id'}}, $kid)
        unless $data->{'_объекты'}{$kid}++;
      push @{$data->{'контакты заказчиков'}}, [join(' ', @{$tmc->{'профиль заказчика/names'}}), undef] # телефон бы
        if $tmc->{'профиль заказчика/names'} && !$data->{'_объекты'}{$kid}++;
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
  } @{$data->{contragent4} || $data->{'@грузоотправители'}};
  
  #~ $c->app->log->error($c->dumper($data->{'грузоотправители/id'}));
  $data->{'контакты грузоотправителей'} = [];
  if ($data->{contact4}) {
    push @{$data->{'контакты грузоотправителей'}}, [$_->{title}, $_->{phone}]
      for @{$data->{contact4}};
  }
  
  
  $data->{"откуда"} = $c->app->JSON->encode([ map { [map { $_->{id} ? "#".(($data->{'с объекта/id'} = $_->{id}) && $_->{id}) : $_->{title} } grep { $_->{title} } @$_] } grep { grep($_->{title}, @$_) } @{$data->{address1}} ])
    if $data->{address1};
  
  #
  if (my $id = $data->{'с объекта/id'} || $data->{'$с объекта'} && $data->{'$с объекта'}{id}) {
    $c->model_obj->доступные_объекты($c->auth_user->{id}, $id)->[0]
      or return $c->render(json=>{error=>"Объект недоступен"});
    $data->{"откуда"} = $c->app->JSON->encode([["#$id"]]);
    $data->{'с объекта/id'} = $id;
    $data->{'контакты грузоотправителей'} = [[join(' ', @{$c->auth_user->{names}}), undef]];
    
  } else {
    $data->{'с объекта/id'} = undef;
  }
  return $c->render(json=>{error=>"Не указан адрес отгрузки"})
    if $data->{"откуда"} eq '[]';
  
  # ($data->{'на объект'} && $data->{'на объект'}{id}) || $data->{'на объект/id'} || 
  if( my $id = $data->{'$на объект'} && $data->{'$на объект'}{id} ) {# куда - на объект
    $data->{'куда'} = $c->app->JSON->encode([["#$id"]]);
    $data->{'на объект/id'} = $id;
    $data->{'заказчики/id'} = [$c->model_obj->объекты_проекты($id)->[0]{'контрагент/id'}];
    $data->{'контакты заказчиков'} = [[join(' ', @{$c->auth_user->{names}}), undef]];
  } else {
    $data->{"куда"} = $c->app->JSON->encode($data->{"куда"});
    $data->{'на объект/id'} = undef;
  }
  
  #~ if(my $id = $data->{'с объекта/id'} || ($data->{'с объекта'} && $data->{'с объекта'}{id})) {# откуда - с объекта
    #~ $data->{'откуда'} = $c->app->JSON->encode([["#$id"]]);
    #~ $data->{'на объект/id'} = $id;
    #~ $data->{'заказчики/id'} = [$c->model_obj->объекты_проекты($id)->[0]{'контрагент/id'}];
    #~ $data->{'контакты заказчиков'} = [[join(' ', @{$c->auth_user->{names}}), undef]];
  #~ } else {
    #~ $data->{"откуда"} = ;
    #~ $data->{'на объект/id'} = undef;
  #~ }
  
  #~ return $c->render(json=>{success=>$data});
  
  $data->{'uid'} = $data->{id} ? undef : 0;
  #~ $data->{'снабженец'} = $data->{id} ? undef : $c->auth_user->{id};
  $data->{'снабженец'} = $c->auth_user->{id};
  
  #~ $c->app->log->error($c->dumper($data));
  
  my $rc = eval {$c->model->сохранить_снаб($data)};
  $rc ||= $@;
  $c->app->log->error($rc)
    and return $c->render(json=>{error=>"Ошибка сохранения"})
    unless ref $rc;
  
  #~ $c->app->log->error($c->dumper($rc));
  
  $tx_db->commit;
  
  $c->render(json=>{success=>$rc});

}


sub списки_на_объектах {# списки на объектах базах
  my $c = shift;
  my $param =  shift || $c->req->json || {};
  
  my $obj = ( ref $param->{'объект'} ? $param->{'объект'}{id} : $param->{'объект'} ) #$c->vars('object') // $c->vars('obj') # 0 - все проекты
    // return $c->render(json => {error=>"Не указан объект"});
  
  $c->model_obj->доступные_объекты($c->auth_user->{id}, $obj)->[0]
    or return $c->render(json=>{error=>"Объект недоступен"});
  
  #~ return $c->список_снаб($param);
  
  my @r = ();
  $c->render_later;
  my $render = sub { $c->render(json=>\@r) if scalar grep(exists $r[$_], (0..$#r)) eq 2 ; };
  $param->{where} = ' where ("тмц/количество" is null or "количество">"тмц/количество") ';
  $param->{select} = ' row_to_json(m) ';
  $param->{order_by} = '  order by "дата1" desc, id desc ';
  $c->model->список_заявок($param, sub {  $r[0] = $_[2]->hashes; $render->(); });
  $param->{where} = '';
  $param->{select} = ' row_to_json(t) ';
  $param->{order_by} = undef;
  $c->model->список_снаб($param, sub {  $r[1] = $_[2]->hashes; $render->(); });
  Mojo::IOLoop->start unless Mojo::IOLoop->is_running;
  
}

sub список_заявок {# для снабжения
  my $c = shift;
  my $param =  shift || $c->req->json || {};

  my $obj = ($param->{объект} && ref($param->{объект}) ? $param->{объект}{id} : $param->{объект}) //= $c->vars('object') // $c->vars('obj') # 0 - все проекты
    // return $c->render(json => {error=>"Не указан объект"});
  
  #~ $param->{where} = ' where "транспорт/заявки/id" is null ';
  $param->{where} = ' where ("тмц/количество" is null or "количество">"тмц/количество") ';
  $param->{select} = ' row_to_json(m) ';
  $param->{order_by} = '  order by "дата1" desc, id desc ';
  my $data = $c->model->список_заявок($param);# !не только необработанные позиции
  return $c->render(json => $data);#
}

sub список_поставок {
  my $c = shift;
  my $param =  shift || $c->req->json || {};

  my $obj = ($param->{объект} && ref($param->{объект}) ? $param->{объект}{id} : $param->{объект}) //= $c->vars('object') // $c->vars('obj') # 0 - все проекты
    // return $c->render(json => {error=>"Не указан объект"});
  $param->{where} = '';
  #~ $c->app->log->error($c->dumper($param));
  $param->{select} = ' row_to_json(t) ';
  my $data = $c->model->список_снаб($param);
  return $c->render(json => $data);#
}

sub delete_ask {
  my $c = shift;
  my $data = $c->req->json;
  
  my $r = $c->model->позиция_заявки($data->{id})
    or return $c->render(json => {error=>"нет такой позиции заявки"});
  
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

=pod
sub заявки_с_транспортом {
  my $c = shift;
  my $param =  $c->req->json || {};
  
  return $c->render(json => {error=>"Не указан объект"})
    unless $param->{'объект'} && $param->{'объект'}{id};
  
  $c->model_obj->доступные_объекты($c->auth_user->{id}, $param->{'объект'}{id})->[0]
    or return $c->render(json=>{error=>"Объект недоступен"});
  
  $param->{select} = ' row_to_json(t) ';
  my $data = $c->model->заявки_с_транспортом($param);# || $@;
  #~ $data = $@
    #~ and $c->app->log->error($data)
    #~ and return $c->render(json => {error=>"Ошибка: $data"})
    #~ unless ref $data;
  
  return $c->render(json => $data);
}
=cut

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

=pod
sub заявки_перемещение {
  my $c = shift;
  my $param =  $c->req->json || {};
  
  return $c->render(json => {error=>"Не указан объект"})
    unless $param->{'объект'} && $param->{'объект'}{id};
  
  $c->model_obj->доступные_объекты($c->auth_user->{id}, $param->{'объект'}{id})->[0]
    or return $c->render(json=>{error=>"Объект недоступен"});

  $param->{select} = ' row_to_json(t) ';
  my $data = $c->model->заявки_перемещение($param);# || $@;
  #~ $data ||= $@;
  #~ $c->app->log->error($data)
    #~ and return $c->render(json => {error=>"Ошибка: $data"})
    #~ unless ref $data;
  
  return $c->render(json => $data);
  
}
=cut

sub сохранить_перемещение {
  my $c = shift;
  #~ my $data =  $c->req->json;
  
  return $c->сохранить_снаб();
  
}

sub удалить_перемещение {
  my $c = shift;
  my $data =  $c->req->json;
  
  #~ $data->{"объект"} //= $data->{"объект/id"};
  my $t = $c->model_transport->позиция_заявки($data->{id})
    or return c->render(json=>{error=>"Нет такого перемещения"});
  
  return $c->render(json=>{error=>"Нельзя удалить перемещение"})
    if $t->{'транспорт/id'} || !$t->{"с объекта/id"};
  
  $c->model_obj->доступные_объекты($c->auth_user->{id}, $t->{"с объекта/id"})->[0]
    or return $c->render(json=>{error=>"Объект недоступен"});
  
  my $tx_db = $c->model->dbh->begin;
  local $c->model->{dbh} = $tx_db; # временно переключить модели на транзакцию
  
  my $r = $c->model->удалить_перемещение($data->{id});
  
  $tx_db->commit;
  
  return $c->render(json=>{remove=>$r});
  
}

sub текущие_остатки {# для доступнвых объектов
  my $c = shift;
  my $param =  $c->req->json || {};
  
  #~ my @oids = ();
  #~ push @oids, $_->{id} 
    #~ for @{ $c->model_obj->доступные_объекты($c->auth_user->{id}, $param->{'объект'}{id} eq 0 ? [undef] : [$param->{'объект'}{id}]) };
  
  $param->{select} = ' row_to_json(o) ';
  my $data = $c->model->текущие_остатки($c->auth_user->{id}, $param->{'объект'}{id} eq 0 ? undef : [$param->{'объект'}{id}], $param);# || $@;
  #~ $data ||= $@;
  #~ $c->app->log->error($data)
    #~ and return $c->render(json => {error=>"Ошибка: $data"})
    #~ unless ref $data;
  
  return $c->render(json => $data);
}

sub движение {
  my $c = shift;
  my $param =  $c->req->json || {};
  
  $param->{uid} = $c->auth_user->{id};
  $param->{select} = ' row_to_json(d) ';
  my $data = $c->model->движение_тмц($param);# || $@;
  #~ $data ||= $@;
  #~ $c->app->log->error($data)
    #~ and return $c->render(json => {error=>"Ошибка: $data"})
    #~ unless ref $data;
  
  return $c->render(json => $data);
}

1;
