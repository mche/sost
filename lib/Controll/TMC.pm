package Controll::TMC;
use Mojo::Base 'Mojolicious::Controller';
#~ use Util;
#~ use JSON::PP;

#~ my $JSON = JSON::PP->new->utf8(0);

has model => sub {shift->app->models->{'TMC'}};
has model_nomen => sub {shift->app->models->{'Номенклатура'}};
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

sub index_obj {
  my $c = shift;
  return $c->render('tmc/объекты',
    handler=>'ep',
    'header-title' => 'Учет ТМЦ',
    assets=>["tmc/объекты.js",],
    );
}

sub index_sklad {
  my $c = shift;
  return $c->render('tmc/sklad',
    handler=>'ep',
    'header-title' => 'Учет ТМЦ',
    assets=>["tmc/sklad.js",],
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
    
  return $c->render(json=>{error=>"Не указано наименование"})
    unless $data->{"наименование"};#$data->{"номенклатура"}{selectedItem}{id} || $data->{"номенклатура"}{newItems}[0]{title} ;
  
  my $r = $c->model->позиция_заявки($data->{id})
    or return $c->render(json => {error=>"нет такой позиции заявки"})
    if ($data->{id});
  
  return $c->render(json=>{error=>"Чужая заявка"})
    unless !$r || $r->{uid} eq $c->auth_user->{id};
  
  return $c->render(json=>{error=>"ТМЦ оприходовано $r->{'дата/принято'}"})
    if $r && $r->{'количество/принято'};
  
  return $c->render(json => {error=>"Заявка уже в обработке "})#снабжением
    if $r && $r->{"транспорт/заявки/id"};
  
  delete @$data{qw(ts uid количество/принято дата/принято принял)};
  
  grep {defined $data->{$_} || return $c->render(json=>{error=>"Не указано [$_]"})} qw(дата1 количество);
  
  $c->model_obj->доступные_объекты($c->auth_user->{id}, $data->{"объект"})->[0]
    or return $c->render(json=>{error=>"Объект недоступен"});
  
  #~ $data->{_prev} = $c->model->позиция_тмц($data->{id})
    #~ if $data->{id};
  $data->{uid} = $c->auth_user->{id}
    unless $r && $r->{uid};
  
  my $tx_db = $c->model->dbh->begin;
  local $c->model->{dbh} = $tx_db; # временно переключить модели на транзакцию
    #~ for grep $c->can($_),qw(model_nomen model);
  
  #~ my $nom = $c->model_nomen->сохранить_номенклатуру($data->{"номенклатура"});
  #~ return $c->render(json=>{error=>$nom})
    #~ unless ref $nom;

  
  my $rc = eval{$c->model->сохранить_заявку({map {($_=>$data->{$_})} grep {defined $data->{$_}} qw(id uid дата1 количество ед коммент объект наименование),},
    $r,
    #~ "номенклатура/id"=>$data->{"номенклатура"}{selectedItem}{id},#$nom->{id},
    #~ "наименование"=>$data->{"номенклатура"}{newItems}[0]{title}, # наименование текстом, если не выбрал позицию
    )};
  $rc ||= $@;
  $c->app->log->error("Ошибка сохранения: $rc")
    and return $c->render(json=>{error=>"Ошибка сохранения: $rc"})
    unless ref $rc && $rc->{id};
  
  $tx_db->commit;
  
  $c->render(json=>{success=>$c->model->позиция_заявки($rc->{id})});
  
  
}

sub сохранить_снаб {# снабжение/закупка и перемещения
  my $c = shift;
  my $data = $c->req->json;
  $c->inactivity_timeout(10*60);
  
  $data->{'дата1'} ||= $data->{"дата отгрузки"};
  return $c->render(json=>{error=>"Не указана дата отгрузки"})
    unless $data->{'дата1'};
  
  $data->{"объект"} //= $data->{"объект/id"};
  
  #~ return $c->render(json=>{error=>"Не указан объект"})
    #~ unless defined $data->{"объект"};
  
  #~ $c->model_obj->доступные_объекты($c->auth_user->{id}, $data->{"объект"})->[0]
    #~ or return $c->render(json=>{error=>"Объект недоступен"});
  
  #$data->{'перемещение'} || 
  $c->render(json=>{error=>"Не указан постащик-грузоотправитель"})
    unless grep { $_->{id} || $_->{title} } @{$data->{contragent4}};#$data->{'@грузоотправители'} || 
  
  my $prev = $c->model_transport->позиция_заявки($data->{id}, {join_tmc=>1,})
    if $data->{id};
    
  return $c->render(json=>{error=>"Чужая поставка/перемещение"})
    unless !$prev || $prev->{'снабженец'} eq $c->auth_user->{id};
  
  my $объекты_проекты= $c->model_obj->объекты_проекты_хэш();
  
  #### поехали сохранять
  
  my $tx_db = $c->model->dbh->begin;
  local $c->model->{dbh} = $tx_db; # временно переключить модели на транзакцию
    #~ for grep $c->can($_),qw(model_nomen model_contragent model model_transport);
  
  $data->{'_объекты'} = {};# просто кэш уникальности для заказчиков/адресов
  $data->{'заказчики/id'} = []; # из объектов позиций
  $data->{'груз'} = '';
  $data->{'куда'} = []; # объекты позиций
  $data->{'контакты заказчиков'} = [];
  map {######### позиции
    my $tmc = $_;
    grep {defined $tmc->{$_} || return $c->render(json=>{error=>"Не указано [$_]"})} qw( количество );#цена дата1
    
    $tmc->{'номенклатура'} = $c->model_nomen->сохранить_номенклатуру($_->{nomen} || $_->{Nomen})->{id}
      or return $c->render(json=>{error=>"Ошибка сохранения номенклатуры"});
    
    #~ $c->app->log->error($c->dumper($tmc));
    
    $tmc->{"объект"} = #$tmc->{"объект/id"} ||
      (ref($tmc->{'$объект'}) &&  $tmc->{'$объект'}{id}) || (ref($tmc->{"объект"}) && $tmc->{"объект"}{id})
      ||  $data->{"объект/id"} || (ref($data->{"объект"}) ? $data->{"объект"}{id} : $data->{"объект"})
        or return $c->render(json=>{error=>"Не указан в позиции [Объект-получатель]"});
    
    
    #~ if (my $id = $tmc->{'$тмц/заявка'} && $tmc->{'$тмц/заявка'}{id}) {
      #~ $tmc->{'$тмц/заявка'} = $c->model->позиция_заявки($id);
      #~ if ($nom->{id} ne $tmc->{'$тмц/заявка'}{'номенклатура/id'}) {# сменилась номенклатура или добавлена
        #~ $c->model->связь_удалить(id1=>$tmc->{'$тмц/заявка'}{'номенклатура/id'}, id2=>$id);
        #~ $c->model->связь($nom->{id}, $id);
      #~ }
    #~ } 

    #~ else {# снабженец сам делает заявку -- НЕТ, просто строки тмц
      #~ my $pos = $tmc->{'$тмц/заявка'} = $c->model->сохранить_заявку(
        #~ (map {($_=>$tmc->{$_})} grep {defined $tmc->{$_}} qw(id00000 дата1 количество объект)),
        #~ "uid"=>$c->auth_user->{id},
        #~ "номенклатура"=>$nom->{id},
      #~ );
      #~ $pos ||= $@;
      #~ $c->app->log->error($pos)
        #~ and return $c->render(json=>{error=>"Ошибка сохранения позиции заявки: $pos"})
        #~ unless ref $pos;
    #~ }
    
    my $prev = $c->model->позиция_тмц($tmc->{id})
      if $tmc->{id};
    
    my $expr = {};
    
    delete @$tmc{(qw(ts uid количество/принято дата/принято принял списать), 'простая поставка')};
    $tmc->{uid} = $c->auth_user->{id}
      unless $prev &&  $prev->{uid};
    
=pod
    if ($tmc->{списать}) {
      #~ if ($prev && $prev->{'количество/принято'}) {# не изменил
        #~ delete @$tmc{qw(списать)};
      #~ } else {# установил
      #~ $expr->{списать} = 'true';
        $tmc->{'количество/принято'} = $tmc->{'количество'};
        $tmc->{'принял'} = $c->auth_user->{id}
          unless $prev && $prev->{'принял'};
        $expr->{'дата/принято'} = 'now()'
          unless $prev && $prev->{'дата/принято'};
      #~ }
    } else {#  убрал
      delete @$tmc{qw(списать)};
      $expr->{списать} = 'null';
      if ($prev && $prev->{'принял'} && $prev->{'принял'} eq $c->auth_user->{id}) {# сам списал
        $expr->{'количество/принято'} = 'null';
        $expr->{'принял'} = 'null';
        $expr->{'дата/принято'} = 'null';
      }
    }
=cut
    
    #~ $c->app->log->error("перед model->сохранить_тмц");
    my $pos = $c->model->сохранить_тмц($tmc, $expr, $prev)
    #~ $pos = $c->model->позиция_тмц($pos->{id})
      or $c->app->log->error($c->dumper($tmc))
      and return $c->render(json=>{error=>"не сохранилась строка ТМЦ"});

    $tmc->{id} = $pos->{id};
 
    $pos = $tmc->{'позиция тмц'} = $c->model->позиция_тмц($pos->{id})
      or $c->app->log->error($c->dumper($tmc))
      and return $c->render(json=>{error=>"не сохранилась строка ТМЦ"});
    #~ $c->app->log->error("после model->позиция_тмц");
    
    
    
    #~ if ($nom->{id} ne $pos->{'номенклатура/id'}) {# сменилась номенклатура
      #~ $pos->{"тмц/заявка/id"}
        #~ ? $c->model->связь_удалить(id1=>$pos->{'номенклатура/id'}, id2=> $pos->{"тмц/заявка/id"})
        #~ : $c->model->связь_удалить(id1=>$pos->{'номенклатура/id'}, id2=>$pos->{id})
        #~ if $pos->{'номенклатура/id'};
      #~ $pos->{"тмц/заявка/id"}
        #~ ? $c->model->связь($nom->{id}, $pos->{"тмц/заявка/id"})
        #~ : $c->model->связь($nom->{id}, $pos->{id});
    #~ }
    
    #~ if ($tmc->{"объект"} ne $pos->{'объект/id'}) {# сменился получатель объект
      #~ $pos->{"тмц/заявка/id"}
        #~ ? $c->model->связь_удалить(id1=>$pos->{'объект/id'}, id2=> $pos->{"тмц/заявка/id"})
        #~ : $c->model->связь_удалить(id1=>$pos->{'объект/id'}, id2=>$pos->{id})
        #~ if $pos->{'объект/id'};
      #~ $pos->{"тмц/заявка/id"}
        #~ ? $c->model->связь($tmc->{"объект"}, $pos->{"тмц/заявка/id"})
        #~ : $c->model->связь($tmc->{"объект"}, $pos->{id});
      
    #~ }
    
    #~ $pos = $tmc->{'позиция тмц'} = $c->model->позиция_тмц($pos->{id})
      #~ if ($nom->{id} ne $pos->{'номенклатура/id'}) || ($tmc->{"объект"} ne $pos->{'объект/id'}); # надо обновить
    
    $data->{'груз'} .= join('〉', @{$pos->{"номенклатура"}}).":\t".$pos->{"количество"}."\n";
    unless ( $data->{'_объекты'}{$pos->{'объект/id'}}++ || !(my $kid = $объекты_проекты->{$pos->{'объект/id'}}{'контрагент/id'}) ) {
      push @{$data->{'куда'}}, ['#'.$pos->{'объект/id'}];
      push(@{$data->{'заказчики/id'}}, $kid)
        unless $data->{'_объекты'}{$kid}++;
      push @{$data->{'контакты заказчиков'}}, [join(' ', @{$pos->{'профиль заказчика/names'}}), undef] # телефон бы
        if $pos->{'профиль заказчика/names'} && !$data->{'_объекты'}{$kid}++;
    }
    
  } @{$data->{'@позиции тмц'} || return $c->render(json=>{error=>"Не указаны позиции ТМЦ"})};
  
  # обработка поставщиков, их конт лиц и адресов отгрузки(откуда)
  $data->{'грузоотправители/id'} = [];
  my $i = 0;
  map {
    my $k = $c->model_contragent->сохранить_контрагент($_);
    #~ $c->app->log->error($c->dumper($k));
    #~ return $c->render(json=>{error=>$k})
      #~ unless ref $k;
    if(ref($k) && $k->{id}) {
      push @{$data->{'грузоотправители/id'}}, $k->{id};
    } else {
      splice @{$data->{contact4}},$i,1;
      splice @{$data->{address1}},$i,1;
    }
    $i++;
  } @{$data->{contragent4}};#$data->{'@грузоотправители'} || 
  
  #~ $c->app->log->error($c->dumper($data->{'contragent4'}));
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
    #~ $data->{'контакты грузоотправителей'} = [[join(' ', @{$c->auth_user->{names}}), undef]];
    
  } else {
    $data->{'с объекта/id'} = undef;
  }
  #~ return $c->render(json=>{error=>"Не указан адрес отгрузки"})
    #~ if $data->{"откуда"} eq '[]' && !$data->{"перемещение"};
  
  # ($data->{'на объект'} && $data->{'на объект'}{id}) || $data->{'на объект/id'} || 
  if( my $id = $data->{'$на объект'} && $data->{'$на объект'}{id} ) {# куда - на объект
    $data->{'куда'} = $c->app->JSON->encode([["#$id"]]);
    $data->{'на объект/id'} = $id;
    $data->{'заказчики/id'} = [$объекты_проекты->{$id}{'контрагент/id'}];
    #~ $data->{'контакты заказчиков'} = [[join(' ', @{$c->auth_user->{names}}), undef]];
  } else {
    $data->{"куда"} = $c->app->JSON->encode($data->{"куда"});
    $data->{'на объект/id'} = undef;
  }
  
  #~ if(my $id = $data->{'с объекта/id'} || ($data->{'с объекта'} && $data->{'с объекта'}{id})) {# откуда - с объекта
    #~ $data->{'откуда'} = $c->app->JSON->encode([["#$id"]]);
    #~ $data->{'на объект/id'} = $id;
    #~ $data->{'заказчики/id'} = [$объекты_проекты->{$id}{'контрагент/id'}];
    #~ $data->{'контакты заказчиков'} = [[join(' ', @{$c->auth_user->{names}}), undef]];
  #~ } else {
    #~ $data->{"откуда"} = ;
    #~ $data->{'на объект/id'} = undef;
  #~ }
  
  #~ return $c->render(json=>{success=>$data});
  
  
  delete @$data{(qw(ts uid снабженец), '')};
  $data->{uid} = 0
      unless $prev &&  $prev->{uid};
  
  #~ $data->{'uid'} = $data->{id} ? undef : 0;
  #~ $data->{'снабженец'} = $data->{id} ? undef : $c->auth_user->{id};
  $data->{'снабженец'} = $c->auth_user->{id}
    unless $prev &&  $prev->{'снабженец'};
  
  #~ $c->app->log->error($c->dumper($data));
  
  my $rc = $c->model->сохранить_снаб($data, $prev);
  #~ $rc = $@
    #~ and 
    $c->app->log->error($rc)
    and return $c->render(json=>{error=>"Ошибка сохранения: $rc"})
    unless ref $rc && $rc->{id};
  
  #~ $c->app->log->error(&Util::dump_val($data));
  
  $tx_db->commit;
  
  $c->render(json=>{success=> $c->model_transport->позиция_заявки($rc->{id}, {join_tmc=>1,})});
}

sub сохранить_инвентаризацию {# 
  my $c = shift;
  my $data = $c->req->json;
  $c->inactivity_timeout(10*60);
  
  $data->{'дата1'} ||= $data->{"дата отгрузки"};
  return $c->render(json=>{error=>"Не указана дата"})
    unless $data->{'дата1'};
  return $c->render(json=>{error=>"Не указан объект"})
    unless $data->{'$объект'} && $data->{'$объект'}{id} ;
  #~ $data->{"объект"} //= $data->{"объект/id"};
  
  my $prev = $c->model->позиция_инвентаризации($data->{id})
    if $data->{id};
  
  return $c->render(json=>{error=>"Чужая инвентаризация"})
    unless !$prev || $prev->{uid} eq $c->auth_user->{id};
  
  my $tx_db = $c->model->dbh->begin;
  local $c->model->{dbh} = $tx_db; # временно переключить модели на транзакцию
  
=pod 
  построчное сохранение
  map {
    my $tmc = $_;
    grep {defined $tmc->{$_} || return $c->render(json=>{error=>"Не указано [$_]"})} qw( количество );#цена дата1
    
    $tmc->{'номенклатура'} = $c->model_nomen->сохранить_номенклатуру($_->{nomen} || $_->{Nomen})->{id}
      or return $c->render(json=>{error=>"Ошибка сохранения номенклатуры"});
    
    my $prev = $c->model->позиция_тмц($tmc->{id})
      if $tmc->{id};
    
    my $expr = {};
    
    delete @$tmc{(qw(ts uid количество/принято дата/принято принял списать объект), 'простая поставка')};
    $tmc->{uid} = $c->auth_user->{id}
      unless $prev &&  $prev->{uid};
      
    my $pos  = $c->model->сохранить_тмц($tmc, $expr, $prev)
    #~ $pos = $c->model->позиция_тмц($pos->{id})
      or $c->app->log->error($c->dumper($tmc))
      and return $c->render(json=>{error=>"не сохранилась строка ТМЦ"});
    
    $tmc->{id} = $pos->{id};
    $pos = $tmc->{'позиция тмц'} = $c->model->позиция_тмц($pos->{id}); # надо обновить
    
  } @{ $data->{'@позиции тмц'} || return $c->render(json=>{error=>"Не указаны позиции ТМЦ"}) };
=cut
  
  delete @$data{(qw(ts uid), '')};
  $data->{'uid'} = $c->auth_user->{id}
    unless $prev &&  $prev->{'uid'};
  
  #~ $c->app->log->error($c->dumper($data));
  
  my $rc = $c->model->сохранить_инвентаризацию($data, $prev);
  $c->app->log->error($rc)
    and return $c->render(json=>{error=>"Ошибка сохранения: $rc"})
    unless ref $rc && $rc->{id};
  
  $tx_db->commit;
  
  $rc = $c->model->позиция_инвентаризации($rc->{id});
  
  $c->render(json=>{success=> $rc});
}

sub удалить_снаб {
  my $c = shift;
  my $data =  shift || $c->req->json || die "Нет данных";
  
  my $t = $c->model_transport->позиция_заявки($data->{id})
    or return c->render(json=>{error=>"Нет такой закупки"});
  
  #~ return $c->render(json=>{error=>"Нельзя удалить перемещение"})
    #~ if $t->{'транспорт/id'} || !$t->{"с объекта/id"};
  
  return $c->render(json=>{error=>"Чужая закупка"})
    unless $t->{'снабженец'} eq $c->auth_user->{id};
  
  my $tx_db = $c->model->dbh->begin;
  local $c->model->{dbh} = $tx_db; # временно переключить модели на транзакцию
  
  my $rc = $c->model->удалить_снаб($data, $t);
  
  $c->app->log->error($rc)
    and return $c->render(json=>{error=>"Ошибка удаления: $rc"})
    unless ref $rc;
  
  $tx_db->commit;
  $c->render(json=>{remove=>$rc});
}

sub объекты_список_заявок {
  my $c = shift;
  my $param =  shift || $c->req->json || {};
  
  my $obj = ( ref $param->{'объект'} ? $param->{'объект'}{id} : $param->{'объект'} ) #$c->vars('object') // $c->vars('obj') # 0 - все проекты
    // return $c->render(json => {error=>"Не указан объект"});
  
  $c->model_obj->доступные_объекты($c->auth_user->{id}, $obj)->[0]
    or return $c->render(json=>{error=>"Объект недоступен"});
  
  $c->render(json => $c->model->список_заявок({
    select => ' row_to_json(m) ',
    where => ' where ( "количество">(coalesce("тмц/количество", 0::numeric)+coalesce("простая поставка/количество", 0::numeric)) ) ',
    order_by => ' order by "дата1" desc, id desc ',
    limit=>100,
    offset => $param->{offset} // 0,
    table => $param->{where} || {},
    'транспорт/заявки/id' => $param->{'транспорт/заявки/id'},
    'объект' => $obj,
  }));
  
}

sub объекты_список_простые_поставки {
  my $c = shift;
  my $param =  shift || $c->req->json || {};
  
  my $obj = ( ref $param->{'объект'} ? $param->{'объект'}{id} : $param->{'объект'} ) #$c->vars('object') // $c->vars('obj') # 0 - все проекты
    // return $c->render(json => {error=>"Не указан объект"});
  
  $c->model_obj->доступные_объекты($c->auth_user->{id}, $obj)->[0]
    or return $c->render(json=>{error=>"Объект недоступен"});
  
  $c->render(json=>$c->model->список_заявок({
    select => ' row_to_json(m) ',
    where => ' where "простая поставка/количество" is not null',
    order_by => ' order by "дата1" desc, id desc ',
    limit=>100,
    offset => $param->{offset}  // 0,
    table => $param->{where} || {},
    'транспорт/заявки/id' => $param->{'транспорт/заявки/id'},
    'объект' => $obj,
    
  }));
}

sub объекты_список_снаб {
  my $c = shift;
  my $param =  shift || $c->req->json || {};
  
  my $obj = ( ref $param->{'объект'} ? $param->{'объект'}{id} : $param->{'объект'} ) #$c->vars('object') // $c->vars('obj') # 0 - все проекты
    // return $c->render(json => {error=>"Не указан объект"});
  
  $c->model_obj->доступные_объекты($c->auth_user->{id}, $obj)->[0]
    or return $c->render(json=>{error=>"Объект недоступен"});
  
  $c->render(json=>$c->model->список_снаб({
    select => ' row_to_json(t) ',
    where=>'',
    'объект' => $obj,
    #~ order_by => undef,
    offset => $param->{offset} // 0,
    limit=>100,
  }));
}

=pod
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
  my $render = sub { $c->render(json=>\@r) if scalar grep(exists $r[$_], (0..$#r)) eq 1 ; };
  
  #
  $c->model->список_снаб({
    select => ' row_to_json(t) ',
    where=>'',
    'объект' => $obj,
    order_by => undef,
  }, sub {  $r[2] = $_[2]->hashes; $render->(); });
  Mojo::IOLoop->start unless Mojo::IOLoop->is_running;
  
}
=cut

sub снаб_список_заявок {# для снабжения
  my $c = shift;
  my $param =  shift || $c->req->json || {};

  my $obj = ($param->{объект} && ref($param->{объект}) ? $param->{объект}{id} : $param->{объект}) //= $c->vars('object') // $c->vars('obj') # 0 - все проекты
    // return $c->render(json => {error=>"Не указан объект"});
  
  #~ my @data = ();
  #~ $c->render_later;
  #~ my $render = sub { $c->render(json=>\@data) if scalar grep(exists $data[$_], (0..$#data)) eq 2 ; };

  $c->render(json=>$c->model->список_заявок({
    select => ' row_to_json(m) ',
    where => ' where ( "количество">(coalesce("тмц/количество", 0::numeric)+coalesce("простая поставка/количество", 0::numeric)) ) ',
    order_by => ' order by "дата1" desc, id desc ',
    limit=>$param->{limit} // 0,
    offset => $param->{offset} // 0,
    table => $param->{where},#из списка
    'транспорт/заявки/id' => $param->{'транспорт/заявки/id'},
    'объект' => $obj,
    'тмц'=>{'резервы остатков'=>1},# подзапрос резерва нужен
  }));#, sub {  $data[0] = $_[2]->hashes; $render->(); }
  #~ Mojo::IOLoop->start unless Mojo::IOLoop->is_running;
}

sub снаб_простые_закупки {
  my $c = shift;
  my $param =  shift || $c->req->json || {};

  my $obj = ($param->{объект} && ref($param->{объект}) ? $param->{объект}{id} : $param->{объект}) //= $c->vars('object') // $c->vars('obj') # 0 - все проекты
    // return $c->render(json => {error=>"Не указан объект"});
  
  $c->render(json=>$c->model->список_заявок({
    select => ' row_to_json(m) ',
    where => ' where "простая поставка/количество" is not null',
    order_by => ' order by "дата1" desc, id desc ',
    limit=>100,
    offset => $param->{offset} // 0,
    table => $param->{where},
    'транспорт/заявки/id' => $param->{'транспорт/заявки/id'},
    'объект' => $obj,
  }));
  
}

sub склад_резервы_остатков {
  my $c = shift;
  my $param =  shift || $c->req->json || {};
  
  my $obj = ($param->{объект} && ref($param->{объект}) ? $param->{объект}{id} : $param->{объект}) //= $c->vars('object') // $c->vars('obj') # 0 - все проекты
    // return $c->render(json => {error=>"Не указан объект"});
  
  $c->model_obj->доступные_объекты($c->auth_user->{id}, $obj)->[0]
    or return $c->render(json=>{error=>"Объект недоступен"});
  
  my @data = ();
  $c->render_later;
  my $render = sub { $c->render(json=>\@data) if scalar grep(exists $data[$_], (0..$#data)) eq 2 ; };
  
  $c->render(json => $c->model->список_заявок({
    select => ' row_to_json(m) ',
    where => ' where "@тмц/резервы остатков/json" is not null and ?::int=any("@тмц/резервы остатков/объекты/id") ',#( "количество">(coalesce("тмц/количество", 0::numeric)+coalesce("простая поставка/количество", 0::numeric)) )
    bind => [$obj],
    order_by => ' order by "дата1" desc, id desc ',
    limit=> $param->{limit} // 0,
    offset => $param->{offset} // 0,
    table => $param->{where},
    #~ 'транспорт/заявки/id' => $param->{'транспорт/заявки/id'},
    'объект' => 0,# не все объекты а игнор
    'тмц'=>{'резервы остатков'=>1},# подзапрос резерва нужен
  }));#, sub {  $data[0] = $_[2]->hashes; $render->(); }
  #~ Mojo::IOLoop->start unless Mojo::IOLoop->is_running;
}

sub склад_заявки {#все заявки по всем объектам
   my $c = shift;
  my $param =  shift || $c->req->json || {};

  #~ my $obj = ($param->{объект} && ref($param->{объект}) ? $param->{объект}{id} : $param->{объект}) //= $c->vars('object') // $c->vars('obj') # 0 - все проекты
    #~ // return $c->render(json => {error=>"Не указан объект"});
  
  #~ my @data = ();
  #~ $c->render_later;
  #~ my $render = sub { $c->render(json=>\@data) if scalar grep(exists $data[$_], (0..$#data)) eq 2 ; };

  $c->render(json=>$c->model->список_заявок({
    select => ' row_to_json(m) ',
    where => ' where ( "количество">(coalesce("тмц/количество", 0::numeric)+coalesce("простая поставка/количество", 0::numeric)) ) ',
    order_by => ' order by "дата1" desc, id desc ',
    limit=>$param->{limit} // 0,
    offset => $param->{offset} // 0,
    table => $param->{where},#из списка
    #~ 'транспорт/заявки/id' => $param->{'транспорт/заявки/id'},
    #~ 'объект' => $obj,
    'объект' => 0,# не все объекты а игнор
    #~ 'тмц'=>{'резервы остатков'=>1},# подзапрос резерва нужен
  }));#, sub {  $data[0] = $_[2]->hashes; $render->(); }
  #~ Mojo::IOLoop->start unless Mojo::IOLoop->is_running;
  
  
};

sub список_поставок {# для снабжения
  my $c = shift;
  my $param =  shift || $c->req->json || {};

  my $obj = ($param->{объект} && ref($param->{объект}) ? $param->{объект}{id} : $param->{объект}) //= $c->vars('object') // $c->vars('obj') # 0 - все проекты
    // return $c->render(json => {error=>"Не указан объект"});

  my $data = $c->model->список_снаб({
    'объект' => $obj,
    select=>' row_to_json(t) ',
    where => '',
    offset => $param->{offset} // 0,
    limit=>100,
  });
  return $c->render(json => $data);#
}

sub список_инвентаризаций {
  my $c = shift;
  my $param =  shift || $c->req->json || {};

  my $obj = ($param->{объект} && ref($param->{объект}) ? $param->{объект}{id} : $param->{объект}) //= $c->vars('object') // $c->vars('obj') # 0 - все проекты
    // return $c->render(json => {error=>"Не указан объект"});
    
  my $data = $c->model->список_инвентаризаций({
    'объект' => $obj,
    select=>' row_to_json(m) ',
    where => '',
    order_by=>' order by m."дата1" desc, m.id desc ',
    offset => $param->{offset} // 0,
    limit=>100,
  });
  return $c->render(json => $data);#
  
  
}

sub списки_склад {
  shift->список_поставок();
  
  
}

sub delete_ask {
  my $c = shift;
  my $data = $c->req->json;
  
  my $r = $c->model->позиция_заявки($data->{id})
    or return $c->render(json => {error=>"нет такой позиции заявки"});
    
  return $c->render(json=>{error=>"Чужая заявка"})
    unless !$r || $r->{uid} eq $c->auth_user->{id};
  
  return $c->render(json=>{error=>"ТМЦ оприходовано $r->{'дата/принято'}"})
    if $r->{'количество/принято'};
  
  return $c->render(json => {error=>"Заявка обработана снабжением"})
    if $r->{"транспорт/заявки/id"};
  
  return $c->render(json => {error=>"На заявку есть ссылки"})
    if scalar @{$c->model->связи(id1=>$data->{"id"})};
  
  my $tx_db = $c->model->dbh->begin;
  local $c->model->{dbh} = $tx_db; # временно переключить модели на транзакцию
  
  $r = eval{$c->model->удалить_заявку($data->{id})};# || $@;
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
  
  $c->model_obj->доступные_объекты($c->auth_user->{id}, $r->{'через базу/id'} || $r->{'объект/id'})->[0]
    or return $c->render(json=>{error=>"Объект недоступен"});
  
  return $c->render(json=>{error=>"Прошло уже 24 часа"})
    if $r->{'количество/принято'} && $r->{'дата/принято'} && $r->{'дата/принято/часов'} > 24;

  delete @$data{qw(uid ts цена количество дата1 дата/принято принял списать)};# обязательно удалить 'дата/принято' - будет now()
  
  my $expr = {};
=pod
  if ($data->{'количество/принято'}) {#поставил галочку
    $data->{'принял'} = $c->auth_user->{id};
    $expr->{'дата/принято'}="now()";
    $expr->{'количество/принято'}="text2numeric(?)";
  } else {# снял галочку
    delete @$data{qw(количество/принято)};
    $expr->{'дата/принято'}="null";
    $expr->{'количество/принято'}="null";
    $expr->{'принял'} = 'null';
    $expr->{'списать'} = 'null';
  }
=cut
  
  #~ $c->app->log->debug($c->dumper($data));
  
  $r = eval {$c->model->обновить($c->model->{template_vars}{schema}, 'тмц', ["id"], $data, $expr)};
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
  
  return $c->render(json=>{error=>"Чужое перемещение"})
    unless $t->{'снабженец'} eq $c->auth_user->{id};
  
  $c->model_obj->доступные_объекты($c->auth_user->{id}, $t->{"с объекта/id"})->[0]
    or return $c->render(json=>{error=>"Объект недоступен"});
  
  my $tx_db = $c->model->dbh->begin;
  local $c->model->{dbh} = $tx_db; # временно переключить модели на транзакцию
  
  my $rс = $c->model->удалить_снаб($data, $t);
  $c->app->log->error($rс)
    and return $c->render(json=>{error=>"Ошибка удаления: $rс"})
    unless ref $rс;
  
  $tx_db->commit;
  
  return $c->render(json=>{remove=>$rс});
  
}

sub удалить_инвентаризацию {
  my $c = shift;
  my $data = $c->req->json;
  
  my $prev = $c->model->позиция_инвентаризации($data->{id})
    || return $c->render(json => {error=>"Нет такой инвентаризации"});
  
  return $c->render(json => {error=>"Чужая инвентаризация"})
    unless $prev->{uid} eq $c->auth_user->{id};
  
  my $tx_db = $c->model->dbh->begin;
  local $c->model->{dbh} = $tx_db; # временно переключить модели на транзакцию
  
  my $rc = eval { $c->model->удалить_инвентаризацию($data,$prev) };# || $@;
  $rc ||= $@;
  $c->app->log->error($rc)
    and return $c->render(json => {error=>"Ошибка удаления: $rc"})
    unless ref $rc;
  
  $tx_db->commit;
  
  return $c->render(json => {remove=>$rc});
  
}

sub текущие_остатки {# для доступных объектов
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

sub сохранить_простую_поставку {
  my $c = shift;
  my $data =  $c->req->json || {};
  
  my $tx_db = $c->model->dbh->begin;
  local $c->model->{dbh} = $tx_db; # временно переключить модели на транзакцию
  
  my $nom = $c->model_nomen->сохранить_номенклатуру($data->{'$номенклатура'});
    return $c->render(json=>{error=>$nom})
      unless ref $nom;
  
  my $ask = $c->model->позиция_заявки($data->{'$тмц/заявка'}{id});
  
  if ($nom->{id} ne $ask->{'номенклатура/id'}) {# сменилась номенклатура
    $c->model->связь_удалить(id1=>$ask->{'номенклатура/id'}, id2=>$ask->{id})
      if $ask->{'номенклатура/id'};
    $c->model->связь($nom->{id}, $ask->{id});
  }
  # строка поставщика
  if ($data->{'$строка тмц/поставщик'}{'количество'}) {
    $data->{'$строка тмц/поставщик'}{'простая поставка'} = 1;
    $data->{'$строка тмц/поставщик'}{'$тмц/заявка'} = $data->{'$тмц/заявка'};
    $data->{'$строка тмц/поставщик'}{uid} = $c->auth_user->{id}
      unless $data->{'$строка тмц/поставщик'}{uid};
    delete @{$data->{'$строка тмц/поставщик'}}{qw(ts количество/принято дата/принято принял списать)};
    my $t = $c->model->сохранить_тмц($data->{'$строка тмц/поставщик'});
    $t = $c->model->позиция_тмц($t->{id});
    my $k = $c->model_contragent->сохранить_контрагент($data->{'$строка тмц/поставщик'}{'$контрагент'});
    if ($k->{id} ne $t->{'контрагент/id'}) {# сменился поставщик или новый
      $c->model->связь_удалить(id1=>$t->{'контрагент/id'}, id2=>$t->{id})
        if $t->{'контрагент/id'};
      $c->model->связь($k->{id}, $t->{id});
    }
  } elsif ($data->{'$строка тмц/поставщик'}{id}) {
    $c->model->_удалить_строку('тмц', $data->{'$строка тмц/поставщик'}{id});
  }
  
  #  строка с базы
  if ($data->{'$строка тмц/с базы'}{'количество'}) {
    $data->{'$строка тмц/с базы'}{'простая поставка'} = 1;
    $data->{'$строка тмц/с базы'}{'$тмц/заявка'} = $data->{'$тмц/заявка'};
    $data->{'$строка тмц/с базы'}{uid} = $c->auth_user->{id}
      unless $data->{'$строка тмц/с базы'}{uid};
    delete @{$data->{'$строка тмц/с базы'}}{qw(ts количество/принято дата/принято принял списать)};#
    #~ $data->{'$строка тмц/с базы'}{' количество/принято'} = $data->{'$строка тмц/с базы'}{'количество'};
    #~ $data->{'$строка тмц/с базы'}{'выражения'}{'дата/принято'} = 'now()';
    #~ $data->{'$строка тмц/с базы'}{'принял'} = $c->auth_user->{id};
    my $tmc = $c->model->сохранить_тмц($data->{'$строка тмц/с базы'});
    $tmc = $c->model->позиция_тмц($tmc->{id});
    if ($data->{'$строка тмц/с базы'}{'$объект'}{id} ne $tmc->{'объект/id'}) {#изменлся объект
      $c->model->связь_удалить(id1=>$tmc->{'объект/id'}, id2=>$tmc->{id})
        if $tmc->{'объект/id'};
      $c->model->связь($data->{'$строка тмц/с базы'}{'$объект'}{id}, $tmc->{id});
    }
  } elsif ($data->{'$строка тмц/с базы'}{id}) {
    $c->model->_удалить_строку('тмц', $data->{'$строка тмц/с базы'}{id});
  }
  
  #  строка на базу
  if ($data->{'$строка тмц/на базу'}{'количество'}) {
    $data->{'$строка тмц/на базу'}{'простая поставка'} = 1;
    $data->{'$строка тмц/на базу'}{'$тмц/заявка'} = $data->{'$тмц/заявка'};
    $data->{'$строка тмц/на базу'}{uid} = $c->auth_user->{id}
      unless $data->{'$строка тмц/на базу'}{uid};
    delete @{$data->{'$строка тмц/на базу'}}{qw(ts количество/принято дата/принято принял списать)};#
    #~ $data->{'$строка тмц/на базу'}{' количество/принято'} = $data->{'$строка тмц/на базу'}{'количество'};
    my $tmc = $c->model->сохранить_тмц($data->{'$строка тмц/на базу'});
    $tmc = $c->model->позиция_тмц($tmc->{id});
    if ($data->{'$строка тмц/на базу'}{'$объект'}{id} ne $tmc->{'объект/id'}) {#изменлся объект
      $c->model->связь_удалить(id2=>$tmc->{'объект/id'}, id1=>$tmc->{id})
        if $tmc->{'объект/id'};
      $c->model->связь($tmc->{id}, $data->{'$строка тмц/на базу'}{'$объект'}{id});
    }
    
  } elsif ($data->{'$строка тмц/на базу'}{id}) {
    $c->model->_удалить_строку('тмц', $data->{'$строка тмц/на базу'}{id});
  }
  
  $tx_db->commit;
  
  my $z = $c->model->позиция_заявки($data->{'$тмц/заявка'}{id});
  
  return $c->render(json => {success=>$z});
};

sub сохранить_номенклатуру_заявки {
  my $c = shift;
  my $data =  $c->req->json || {};
  
  my $r = $c->model->сохранить_номенклатуру_заявки($data);#удалит если не указать $data->{'номенклатура/id'}
  return $c->render(json=>{error=>$r})
    unless ref $r;

  $c->render(json=>{success=>$r});
  
}

sub запрос_резерва_остатка {#снабжение
  my $c = shift;
  my $data =  $c->req->json || {};
  
  $data->{uid} = $c->auth_user->{id};
  
  my $r = $c->model->сохранить_запрос_резерва_остатка($data);
  return $c->render(json=>{error=>$r})
    unless ref $r;
  
  $r = $c->model->позиция_заявки_резервы_остатков($data->{'тмц/заявка/id'});

  $c->render(json=>{success=>$r || {'@тмц/резервы остатков'=>undef,}});
  
}

sub подтвердить_резерв_остатка {# склад
  my $c = shift;
  my $data =  $c->req->json || {};
  #~ require Data::Dumper;
  #~ $c->app->log->error(Data::Dumper->new([$data])->Indent(1)->Sortkeys(1)->Terse(1)->Useqq(0)->Dump());
  $data->{'резервировал'} = $c->auth_user->{id};
  my $r = $c->model->сохранить_резерв_остатка($data);
  $c->app->log->error($r, $c->dumper($data))
    and return $c->render(json=>{error=>$r})
    unless ref $r;
  $c->render(json=>{success=>$r});
}

sub сохранить_позицию_инвентаризации {# одна строка
  my $c = shift;
  my $data =  $c->req->json || {};
  #~ $data->{"тмц/инвентаризация/uid"} = $c->auth_user->{id};
  $data->{"uid"} = $c->auth_user->{id};

  my $tx_db = $c->model->dbh->begin;
  local $c->model->{dbh} = $tx_db;

  my $r = $c->model->сохранить_позицию_инвентаризации($data);
  $c->app->log->error($c->dumper($data), "Ошибка: $r")
    and return $c->render(json=>{error=>"Не сохранилась строка ТМЦ: $r"})
    unless ref $r;
  
    $tx_db->commit;
  #~ $r = $c->model->позиция_тмц($r->{id}); # надо обновить
  
  #~ $r = $c->model->инвентаризация_позиция_строка($r->{id});
  #~ $r->{'$тмц/инвентаризация/json'} = $c->model->позиция_инвентаризации($r->{'тмц/инвентаризации/id'}, select=>"row_to_json(m)", join_tmc=>0,)->{'row_to_json'};
  $r = $c->model->позиция_тмц($r->{id});
  
  $c->render(json=>{success=>$r});
  
  
}

sub удалить_позицию_инвентаризации {
  my $c = shift;
  my $data =  $c->req->json || {};
  my $r = $c->model->инвентаризация_позиция_строка($data->{id})
    or return $c->render(json=>{error=>"Нет такой позиции инвентаризации"});
  $c->render(json=>{remove=>$c->model->_удалить_строку("тмц", $data->{id})});
}

sub приходы_тмц {
  my $c = shift;
  my $param =  $c->req->json || {};
  #~ $c->app->log->debug($c->dumper($param));
  $c->model_obj->доступные_объекты($c->auth_user->{id}, $param->{'объект'} && $param->{'объект'}{id})->[0]
    or return $c->render(json=>{error=>"Объект недоступен"});
  my $r = $c->model->приходы_тмц($param);
   $c->render(json=>$r);
}

sub сохранить_списание {
  my $c = shift;
  my $data =  $c->req->json || {};
  $c->inactivity_timeout(10*60);
  
  $data->{'дата1'} ||= $data->{"дата отгрузки"};
  return $c->render(json=>{error=>"Не указана дата"})
    unless $data->{'дата1'};
  return $c->render(json=>{error=>"Не указан объект"})
    unless $data->{'$объект'} && $data->{'$объект'}{id};
  
  $c->model_obj->доступные_объекты($c->auth_user->{id}, $data->{'объект'} && $data->{'объект'}{id})->[0]
    or return $c->render(json=>{error=>"Объект недоступен"});
  
  my $prev = $c->model->позиция_списания($data->{id})
    if $data->{id};
  
  #~ return $c->render(json=>{error=>"Чужая инвентаризация"})
    #~ unless !$prev || $prev->{uid} eq $c->auth_user->{id};
  
  my $tx_db = $c->model->dbh->begin;
  local $c->model->{dbh} = $tx_db; # временно переключить модели на транзакцию
  
  # позиции
  ПОЗИЦИИ: map {
    my $tmc = $_;
    
    my $prev = $c->model->позиция_тмц($tmc->{id})
      if $tmc->{id};
    
    $tmc->{uid} = $c->auth_user->{id}
      unless $prev &&  $prev->{uid};
      
    my $pos  = $c->model->сохранить_позицию_инвентаризации($tmc, {}, $prev);# да аналог инвентаризации
    $c->app->log->error($c->dumper($tmc), "Ошибка: $pos")
      and return $c->render(json=>{error=>"не сохранилась строка ТМЦ"})
      unless ref $pos;
    
    $tmc->{id} = $pos->{id};
    $pos = $tmc->{'позиция тмц'} = $c->model->позиция_тмц($pos->{id}); # надо обновить
    
  } @{ $data->{'@позиции тмц'} || return $c->render(json=>{error=>"Не указаны позиции ТМЦ"}) };
  
  delete @$data{(qw(ts uid), '')};
  $data->{'uid'} = $c->auth_user->{id}
    unless $prev &&  $prev->{'uid'};
  
  #~ $c->app->log->error($c->dumper($data));
  
  my $rc = $c->model->сохранить_списание($data, $prev);
  $c->app->log->error($rc)
    and return $c->render(json=>{error=>"Ошибка сохранения: $rc"})
    unless ref $rc && $rc->{id};
  
  $tx_db->commit;
  
  $rc = $c->model->позиция_списания($rc->{id});
  
  $c->render(json=>{success=> $rc});
}

sub накладная_docx {
  my $c = shift;
  my $id = $c->vars('id');
  
  #~ $docx_file=>"static/files/транспорт/заявка-$id.docx";
  
  my $data = $c->model->накладная_docx($id);
  
  $c->stash('сообщение'=>$data)
    and return $c->reply->not_found
    unless ref $data;
  my $err_file = "$data->{docx_out_file}.error";
  
  open(PYTHON, "| python 2>'$err_file' ")
    || die "can't fork: $!";
  #~ ##local $SIG{PIPE} = sub { die "spooler pipe broke" };
  say PYTHON $data->{python};
  close PYTHON
    #~ || die "bads: $! $?"
    || return $c->render_file('filepath' => $err_file,  'format'   => 'txt', 'content_disposition' => 'inline', 'cleanup'  => 1,);
  
  `rm '$err_file'`;
  
  #~ $c->app->log->error($data->{коммент});
  
  $c->render_file(
    'filepath' => $data->{docx_out_file},
    #~ 'format'   => 'pdf',                 # will change Content-Type "application/x-download" to "application/pdf"
    #~ 'content_disposition' => 'inline',   # will change Content-Disposition from "attachment" to "inline"
    'cleanup'  => 1,                     # delete file after completed
  );
  
   #~ $c->render(text=>$data->{python}, format => 'txt',);
}


1;
