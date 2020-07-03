package Controll::Rent;
use Mojo::Base 'Mojolicious::Controller';
use Util;

has model => sub { $_[0]->app->models->{'Аренда'}->uid($_[0]->auth_user && $_[0]->auth_user->{id}) };
has model_contragent => sub { $_[0]->app->models->{'Contragent'}->uid($_[0]->auth_user && $_[0]->auth_user->{id}) };

sub index {
  my $c = shift;
  return $c->render('аренда/index',
    handler=>'ep',
    'header-title' => 'Аренда помещений',
    assets=>["аренда.js", "uploader.css"],
    );
}

sub расходы {
  my $c = shift;
  return $c->render('аренда/расходы',
    handler=>'ep',
    'header-title' => 'Счета на возмещение расходов по арендаторам',
    assets=>["аренда-расходы.js", "flexboxgrid.css"],# "uploader.css"],
    );
}

sub объекты_список {
  my $c = shift;
  $c->render(json=>$c->model->список_объектов());
}

sub объекты_ук {# для формы
  my $c = shift;
  $c->render(json=>$c->model->объекты_ук());
}


sub договоры_список {
  my $c = shift;
  my $param = $c->req->json;
  $c->render(json=>$c->model->список_договоров($param));
}

sub сохранить_объект {
  my $c = shift;
  my $data = $c->req->json;
  
  return $c->render(json=>{error=>"Не указан объект"})
    unless $data->{'$объект'} && $data->{'$объект'}{id};
  
  my $tx_db = $c->model->dbh->begin;
  local $c->model->{dbh} = $tx_db; # временно переключить модели на транзакцию
  
  map {
    my $room = $_;
    
    $data->{$_} = &Util::numeric($data->{$_})
    for qw(площадь);
    
    return $c->render(json=>{error=>"Не заполнен кабинет"})
      unless (scalar grep($room->{$_}, qw(номер-название площадь))) eq 2 && defined $room->{'этаж'};
    
    $room->{uid} = $c->auth_user->{id}
      unless $room->{id};
    
    $room->{id} = $c->model->сохранить_кабинет($room)->{id};
  } @{ $data->{'@кабинеты'}};
  
  $data->{uid} = $c->auth_user->{id}
      unless $data->{id};
  
  my $r = $c->model->сохранить_объект($data);
  
  $tx_db->commit
    if ref $r;
  
  $c->render(json=>ref $r ? {success=>$r} : {error=>$r});
  
}

sub удалить_объект {
  my $c = shift;
  my $data = $c->req->json;
  my $r = $c->model->удалить_объект($data);
  return $c->render(json=>{error=>$r})
    unless ref $r;
  $c->render(json=>{remove=>$r});
}

sub удалить_договор {
  my $c = shift;
  my $data = $c->req->json;
  my $r = $c->model->удалить_договор($data);
  return $c->render(json=>{error=>$r})
    unless ref $r;
  $c->render(json=>{remove=>$r});
}

sub сохранить_договор {
  my $c = shift;
  my $data = $c->req->json;
  
  $data->{'проект/id'} = $data->{'$проект'}{id};
  
  return $c->render(json=>{error=>"Не заполнен договор"})
    unless (scalar grep($data->{$_}, qw(проект/id номер дата1 дата2))) eq 4;
  
  my $prev = $c->model->список_договоров({id=>$data->{id}})->[0]
    if $data->{id};
  
  $data->{$_} = &Util::money($data->{$_}) || undef
    for grep defined $data->{$_}, qw(), 'сумма нал';
  
  my $tx_db = $c->model->dbh->begin;
  local $c->model->{dbh} = $tx_db; # временно переключить модели на транзакцию
  
  #~ $data->{'контрагент'}{'реквизиты'} = $data->{'контрагент/реквизиты'}
    #~ if $data->{'контрагент/реквизиты'};
  #~ $c->log->error($c->dumper($data->{'контрагент'}));
  my $k = $c->model_contragent->сохранить_контрагент($data->{'контрагент'});
  #~ $c->log->error($c->dumper($k));
  
  return $c->render(json=>{error=>$k || "Нет контрагента"})
    unless ref $k && $k->{id};
  
  
  $data->{'контрагент/id'} = $k->{id};
  
  $data->{'@помещения'} = [map {
    my $r = eval {$c->сохранить_помещение_договора($_)};
    
    $r ||= $@
      and $c->log->error($r)
      and return $c->render(json=>{error=>$r})
      unless $r && ref $r;
    
    $r;
  } grep {$_->{'помещение/id'}} @{ $data->{'@помещения'} }];
  
  $data->{uid} = $c->auth_user->{id}
    unless $data->{id};
  
  my $r = eval {$c->model->сохранить_договор($data, $prev)};
  $r ||= $@
    and $c->log->error($r)
    and return $c->render(json=>{error=>$r})
    unless $r && ref $r;
  
  # после сохранения договора!
  my $dop = $c->сохранить_доп_соглашения($data, $prev);#~ $data->{'@доп.соглашения'} = [
  #~ $dop ||= $@
    #~ and 
  $c->log->error($dop)
    and return $c->render(json=>{error=>$dop})
    unless $dop && ref $dop;
    
  my $discnt = $c->сохранить_скидки($data, $prev);#~ $data->{'@доп.соглашения'} = [
  #~ $dop ||= $@
    #~ and 
  $c->log->error($discnt)
    and return $c->render(json=>{error=>$discnt})
    unless $discnt && ref $discnt;
  
  $tx_db->commit;
  $c->model_contragent->почистить_таблицу();# только после связей!{uid=>$c->auth_user->{id}}
  
  $r = $c->model->список_договоров({id=>$r->{id}})->[0];# еще раз договор
  
  $c->render(json=>{success=>$r});
}

sub сохранить_помещение_договора {# и доп соглашения
  my ($c, $room) = @_;
  
  $room->{'сумма'} = undef
    if ($room->{'ставка|сумма'}) eq 'ставка';
    
  $room->{'ставка'} = undef
    if ($room->{'ставка|сумма'}) eq 'сумма';
  
  return "Не заполнена ставка или сумма аренды помещения" #$c->render(json=>{error=>"Не заполнена ставка или сумма аренды помещения"})
    unless (scalar grep($room->{$_}, qw(ставка сумма))) eq 1;
  
  $room->{$_} = &Util::money($room->{$_}) || undef
    for grep defined $room->{$_}, qw(ставка сумма), 'сумма нал';
  $room->{$_} = &Util::numeric($room->{$_}) || ($room->{$_} eq 0 ? 0 : undef)
    for grep defined $room->{$_}, qw(площадь);
  
  $room->{uid} = $c->auth_user->{id}
    unless $room->{uid};
  #~ $c->log->error($c->dumper($room));
  my $r = eval {$c->model->сохранить_помещение_договора($room)};# строка договора
  
  $r ||= $@
    and $c->log->error($r)
    #~ and return $r # $c->render(json=>{error=>$r})
    unless $r && ref $r;
  
  return $r;
}

sub сохранить_доп_соглашения {# список
  my ($c, $data, $prev) = @_;
  #~ my %refs = ();
  $data->{'@доп.соглашения'} = [map {
    my $r = $c->сохранить_доп_соглашение($_, $prev);
    
    #~ $r ||= $@
      #~ and $c->log->error($r)
      #~ and 
    return $r # $c->render(json=>{error=>$r})
      unless $r && ref $r;
    
    # не тут - в модели
    #~ my $rr  = $self->связь($data->{id}, $r->{id});
    #~ $refs{"$rr->{id1}:$rr->{id2}"}++;

    $r;
  } grep {$_->{'дата1'}} @{ $data->{'@доп.соглашения'} || [] }];
  
  $c->model->сохранить_доп_соглашения($data, $prev); # там связи с договором и удаление
  
}

sub сохранить_доп_соглашение {# к договору
  my ($c, $data, $prev) = @_;
  $data->{'@помещения'} = [map {
    my $r = $c->сохранить_помещение_договора($_);
    
    #~ $r ||= $@
      #~ and 
    return $r # $c->render(json=>{error=>$r})
      unless $r && ref $r;
    
    #~ $c->log->error("помещение доп соглашения", $c->dumper($r));
    
    $r;
  } grep {$_->{'помещение/id'}} @{ $data->{'@помещения'} }];
  
  $data->{uid} = $c->auth_user->{id}
    unless $data->{id};
  
  my $r = eval {$c->model->сохранить_доп_соглашение($data, $prev)};
  
  $r ||= $@
    #~ and $c->log->error($r)
    and return $r # $c->render(json=>{error=>$r})
    unless $r && ref $r;
  
  #~ $c->log->error("Доп. соглашение", $c->dumper($r));
  
  return $r;
}

sub сохранить_скидки {
  my ($c, $data, $prev) = @_;
  #~ my %refs = ();
  $data->{'@скидки'} = [map {
    my $r = $c->сохранить_скидку($_, $prev);
    
    #~ $r ||= $@
      #~ and $c->log->error($r)
      #~ and 
    return $r # $c->render(json=>{error=>$r})
      unless $r && ref $r;
    
    # не тут - в модели
    #~ my $rr  = $self->связь($data->{id}, $r->{id});
    #~ $refs{"$rr->{id1}:$rr->{id2}"}++;

    $r;
  } grep {$_->{'%'}} @{ $data->{'@скидки'} || [] }];
  
  $c->model->сохранить_скидки($data, $prev); # там связи с договором и удаление
  
}

sub сохранить_скидку {
  my ($c, $data, $prev) = @_;
  $data->{uid} = $c->auth_user->{id}
    unless $data->{id};
  
  $data->{'%'} = &Util::numeric($data->{'%'}); #/100;
  my $r = eval {$c->model->сохранить_скидку($data, $prev)};
  
  $r ||= $@
    #~ and $c->log->error($r)
    and return $r # $c->render(json=>{error=>$r})
    unless $r && ref $r;
  
  #~ $c->log->error("сохранить_скидку", $c->dumper($r));
  
  return $r;
  
}

sub расходы_список {
  my $c = shift;
  my $param = $c->req->json;
  $c->render(json=>$c->model->список_расходов($param));
}

sub расходы_категории {
  my $c = shift;
  my $param = $c->req->json;
  $c->render(json=>$c->model->расходы_категории($param || ()));
}

sub сохранить_расход {
  my $c = shift;
  my $data = $c->req->json;
  
  return $c->render(json=>{error=>"Нет даты"})
    unless (scalar grep($data->{$_}, qw(дата))) eq 1;
  return $c->render(json=>{error=>"Нет проекта"})
    unless $data->{'проект/id'};
  return $c->render(json=>{error=>"Нет договора"})
    unless $data->{'договор/id'};
  
  my $prev = $c->model->список_расходов( id=>$data->{id} )->[0]
    if $data->{id};
  
  my $tx_db = $c->model->dbh->begin;
  local $c->model->{dbh} = $tx_db; # временно переключить модели на транзакцию
  
  $data->{'@позиции'} = [map {
    my $pos = $_;
    
    my $n = eval {$c->model->сохранить_категорию($pos->{'$категория'})};
    $n ||= $@
      and $c->log->error($n)
      and return $c->render(json=>{error=>$n})
      unless $n && ref $n;
    $pos->{'категория/id'} = $n->{id};
    
    return $c->render(json=>{error=>"Не заполнена позиция"})
      unless (scalar grep($pos->{$_}, qw(сумма))) || (scalar grep($pos->{$_}, qw(количество ед цена))) eq 3 ;
    
    $pos->{$_} = &Util::numeric($pos->{$_})
      for grep defined $pos->{$_}, qw(количество);
    $pos->{$_} = &Util::money($pos->{$_})
      for grep defined $pos->{$_}, qw(цена сумма);
    
    $pos->{uid} = $c->auth_user->{id}
      unless $pos->{uid};
    
    my $r = eval {$c->model->сохранить_позицию_расхода($pos)};# строка договора
    
    $r = $@
      and $c->log->error($r)
      and return $c->render(json=>{error=>$r})
      unless $r && ref $r;
    
    $r;
    
  } grep { $_->{'$категория'} && ($_->{'$категория'}{id} || $_->{'$категория'}{title}) } @{ $data->{'@позиции'} }];
  
  $data->{uid} = $c->auth_user->{id}
    unless $data->{id};
    
  my $r = eval {$c->model->сохранить_расход($data, $prev)};
  $r ||= $@
    and $c->log->error($r)
    and return $c->render(json=>{error=>$r})
    unless $r && ref $r;
  
  $tx_db->commit;
  
  $c->render(json=>{success=>$r});
  
}# end сохранить_расход

#~ ^\/аренда\/счет([^/]+)/?(?:\.([^/]+))?$

sub счет_оплата_docx {# сделать docx во врем папке и вернуть урл
  my $c = shift;
  
  my $docx = $c->stash('docx'); # имя файла
  #~ $c->app->log->error($docx);
  return $c->render_file(
    'filepath' => "static/tmp/$docx",
    #~ 'format'   => 'pdf',                 # will change Content-Type "application/x-download" to "application/pdf"
    #~ 'content_disposition' => 'inline',   # will change Content-Disposition from "attachment" to "inline"
    'cleanup'  => 1,                     # delete file after completed
  )  if $c->req->method eq 'GET';#$docx;
  
  my $param =  $c->req->json || {};
  return $c->render(json=>{error=>'не указан месяц'})
    unless $param->{'месяц'};
  #~ return $c->render(json=>{error=>'не указаны договоры'})
    #~ unless $param->{'договоры'};
  $param->{'договоры'} = undef
    if $param->{'договоры'} && !@{$param->{'договоры'}};
  
  $param->{docx} = sprintf("%s-%s.docx", $param->{'счет или акт'}, $c->auth_user->{id});
  $param->{docx_template_file} = sprintf("static/аренда-%s.template.docx", $param->{'счет или акт'},);
  $param->{uid} = $c->auth_user->{id};
  $param->{auth_user} = $c->auth_user;
  my $data = $c->model->счет_оплата_docx($param);
  $c->log->error($c->dumper($data))
    and return $c->render(json=>{error=>$data})
    unless ref $data;
  return $c->render(json=>{error=>"Не найдено счетов"})
    unless $data->{data};
  
  #~ $c->log->error($c->dumper($data));
  
  #~ return $c->render(json=>{data=>$data});
  
  my $err_file = "$data->{docx_out_file}.error";
  
  open(PYTHON, "| python  2>'$err_file' ")
    || die "can't fork: $!";
  #~ ##local $SIG{PIPE} = sub { die "spooler pipe broke" };
  say PYTHON $data->{python};
  close PYTHON
    #~ || die "bads: $! $?"
    || return $c->render_file('filepath' => $err_file,  'format'   => 'txt', 'content_disposition' => 'inline', 'cleanup'  => 1,);
  
  unlink $err_file;
  
  #~ $c->render(json=>{data=>$data});
  #~ $c->render(json=>{url=>$data->{docx_out_file}});
  $c->render(json=>{docx=>$data->{docx}});
}

sub счет_расходы_docx {# сделать docx во врем папке и вернуть урл
  my $c = shift;
  
  my $docx = $c->stash('docx'); # имя файла
  #~ $c->app->log->error($docx);
  return $c->render_file(
    'filepath' => "static/tmp/$docx",
    #~ 'format'   => 'pdf',                 # will change Content-Type "application/x-download" to "application/pdf"
    #~ 'content_disposition' => 'inline',   # will change Content-Disposition from "attachment" to "inline"
    'cleanup'  => 1,                     # delete file after completed
  )  if $c->req->method eq 'GET';#$docx;
  
  my $param =  $c->req->json || {};
  return $c->render(json=>{error=>'не указан месяц'})
    unless $param->{'месяц'};
  return $c->render(json=>{error=>'не указаны счета(id)'})
    unless $param->{'аренда/расходы/id'};
  
  $param->{'счет или акт'} = 'счет';
  $param->{docx} = sprintf("%s-%s.docx", $param->{'счет или акт'}, $c->auth_user->{id});
  $param->{docx_template_file} = sprintf("static/аренда-%s.template.docx", $param->{'счет или акт'},);
  $param->{uid} = $c->auth_user->{id};
  $param->{auth_user} = $c->auth_user;
  my $data = $c->model->счет_расходы_docx($param);
  $c->log->error($c->dumper($data))
    and return $c->render(json=>{error=>$data})
    unless ref $data;
  
  return $c->render(json=>{error=>"Не найдено счетов"})
    unless $data->{data};
  
  #~ $c->log->error($c->dumper($data));
  
  #~ return $c->render(json=>{data=>$data});
  
  my $err_file = "$data->{docx_out_file}.error";
  
  open(PYTHON, "| python  2>'$err_file' ")
    || die "can't fork: $!";
  #~ ##local $SIG{PIPE} = sub { die "spooler pipe broke" };
  say PYTHON $data->{python};
  close PYTHON
    #~ || die "bads: $! $?"
    || return $c->render_file('filepath' => $err_file,  'format'   => 'txt', 'content_disposition' => 'inline', 'cleanup'  => 1,);
  
  unlink $err_file;
  
  #~ $c->render(json=>{data=>$data});
  #~ $c->render(json=>{url=>$data->{docx_out_file}});
  $c->render(json=>{docx=>$data->{docx}});
}

=pod
sub реестр_актов_xlsx111 {
  my $c = shift;
  my $month = $c->param('month');
  my $data = $c->model->реестр_актов("месяц"=> $month, "счет или акт"=>'акт');
  my @names = ('номер акта', 'дата акта', 'договор/номер','договор/дата начала', 'договор/дата завершения', 'контрагент/title', 'ИНН', 'объект', 'сумма/num');
  #~ $c->render(json=>[join("\t", @names), map(join("\t", @$_{@names}), @$data)]);
  my $filename=sprintf("static/tmp/%s-реестр-актов-%s.csv", $c->auth_user->{id}, $month);
  open(my $fh, ">:encoding(UTF-8)", $filename)
    || die "Can't open UTF-8 encoded $filename: $!";
  
  say $fh join("\t", @names);
  say $fh join("\t", @$_{@names})
    for @$data;
  close($fh);
  $c->render_file(
    'filepath' => $filename,
    'format'   => 'csv',                 # will change Content-Type "application/x-download" to "application/pdf"
    ##~ 'content_disposition' => 'inline',   # will change Content-Disposition from "attachment" to "inline"
    'cleanup'  => 1,                     # delete file after completed
  );
  
}
=cut

sub реестр_актов_xlsx {
  my $c = shift;
  require Excel::Writer::XLSX;
  
  my ($month, $month2) = split /:/, $c->param('month');
  my $data = $c->model->реестр_актов("месяц"=> $month, "месяц2"=> $month2, "счет или акт"=>'акт');
  my @names = ('номер акта', 'дата акта', 'договор/номер','договор/дата начала', 'договор/дата завершения', 'контрагент/title', 'ИНН', 'объект', 'сумма/num');
  #~ my $filename=sprintf("static/tmp/%s-реестр-актов.xlsx", $c->auth_user->{id}, $month);
  
  open my $xfh, '>', \my $fdata or die "Failed to open filehandle: $!";
  my $workbook  = Excel::Writer::XLSX->new( $xfh );
  my $worksheet = $workbook->add_worksheet();
  my $n = 0;
  $worksheet->write_row($n++,0, \@names);
  $worksheet->write_row($n++,0, [@$_{@names}])
    for @$data;
  $workbook->close();
  #~ return $fdata;
  #~ $c->render(data=>$fdata, format=>'xlsx');
  # Render data from memory as file
  $c->render_file('data' => $fdata, 'filename' => 'реестр-актов.xlsx', format=>'xlsx');
}

1;