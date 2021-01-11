package Controll::Rent;
use Mojo::Base 'Mojolicious::Controller';
use Util;

has model => sub { $_[0]->app->models->{'Аренда'}->uid($_[0]->auth_user && $_[0]->auth_user->{id}) };
has model_contragent => sub { $_[0]->app->models->{'Contragent'}->uid($_[0]->auth_user && $_[0]->auth_user->{id}) };

has email => sub {
  #~ require Mojolicious::Plugin::RoutesAuthDBI::Util;
    #~ and Mojolicious::Plugin::RoutesAuthDBI::Util->import('load_class');
  require Email;
  require Email::MIME;
  #~ require MIME::Base64; MIME::Base64->import();  
  #~ require IO::All;
  #~ IO::All->import();
  require Mojo::Asset::File;
  Email->new(%{$_[0]->app->config->{'Email'}});
};

sub index {
  my $c = shift;
  return $c->render('аренда/index',
    handler=>'ep',
    'header-title' => 'Аренда помещений',
    stylesheets=>["uploader.css",],# 'js/dist/аренда/договор-форма.css',
    assets=>["аренда.js",],# 'js/dist/аренда/договор-форма.js' 'lib/v-calendar/dist/v-calendar.umd.js'],#'lib/v-calendar/dist2/lib.js',
    );
}

sub расходы {
  my $c = shift;
  return $c->render('аренда/расходы',
    handler=>'ep',
    'header-title' => 'Счета на возмещение расходов по арендаторам',
    stylesheets=>["flexboxgrid.css",],#  '/js/svelte-app/public/build/bundle.css'"uploader.css"],
    assets=>["аренда-расходы.js",],#  '/js/svelte-app/public/build/bundle.js'
    );
}

sub акты {
  my $c = shift;
  return $c->render('аренда/акты',
    handler=>'ep',
    'header-title' => 'Аренда акты',
    stylesheets=>[],# 'js/dist/аренда/договор-форма.css',
    assets=>["аренда-акты.js",],# 'js/dist/аренда/договор-форма.js' 'lib/v-calendar/dist/v-calendar.umd.js'],#'lib/v-calendar/dist2/lib.js',
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

sub договоры_помещений {
  my $c = shift;
  #~ my $param = $c->req->json;
  $c->render(json=>$c->model->договоры_помещений());#$param
}

sub сохранить_объект {
  my $c = shift;
  my $data = $c->req->json;
  
  return $c->render(json=>{error=>"Не указан объект"})
    unless $data->{'$объект'} && $data->{'$объект'}{id};
  
  my $tx_db = $c->model->dbh->begin;
  local $c->model->{dbh} = $tx_db; # временно переключить модели на транзакцию
  
  while (my ($id, $liter) = each %{$data->{litersEdit}}) {
    $liter->{uid} = $liter->{id} ? undef : $c->auth_user->{id};
    delete $liter->{id}
      unless $liter->{id};
    $data->{'%литеры изменения'}{$id} = $c->model->сохранить_литер($liter)->{id};# тут без связей
    #~ $c->log->error($c->dumper($liter));
  }
  #~ $c->log->error($c->dumper($data->{'%литеры изменения'}));

  
  map {
    my $room = $_;
    
    $room->{$_} = &Util::numeric($room->{$_})
    for qw(площадь);
    
    return $c->render(json=>{error=>"Не заполнен кабинет"})
      unless (scalar grep($room->{$_}, qw(номер-название площадь))) eq 2 && defined $room->{'этаж'};
    
    $room->{uid} = $room->{id} ? undef : $c->auth_user->{id};
    
    $room->{id} = $c->model->сохранить_кабинет($room)->{id};# тут без связей
  } @{ $data->{'@кабинеты'}};
  
  $data->{uid} = $c->auth_user->{id}
      unless $data->{id};
  
  my $r = $c->model->сохранить_объект($data);# тут связи с литерами и помещениями
  
  $tx_db->commit
    if ref $r;
  
  $c->render(json=>ref $r ? {success=>$r} : {error=>$r});
  
}

sub удалить_объект {
  my $c = shift;
  my $data = $c->req->json;
  
  my $tx_db = $c->model->dbh->begin;
  local $c->model->{dbh} = $tx_db; # временно переключить модели на транзакцию
  
  my $r = $c->model->удалить_объект($data);
  return $c->render(json=>{error=>$r})
    unless ref $r;
  
  $tx_db->commit;
  
  $c->render(json=>{remove=>$r});
}

sub удалить_договор {
  my $c = shift;
  my $data = $c->req->json;
  
  my $tx_db = $c->model->dbh->begin;
  local $c->model->{dbh} = $tx_db; # временно переключить модели на транзакцию
  
  my $r = $c->model->удалить_договор($data);
  return $c->render(json=>{error=>$r})
    unless ref $r;
  
  $tx_db->commit;
  
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
    for grep defined $data->{$_}, qw(), 'сумма нал', 'сумма безнал';
  
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
  
                                      #~ $c->log->error($c->dumper( $c->app->json->decode($r->{'@доп.соглашения/json'}) ));
  
  $c->render(json=>{success=>$r});
}

sub сохранить_помещение_договора {# и доп соглашения
  my ($c, $room) = @_;
  
  $room->{'сумма'} = undef
    if ($room->{'ставка|сумма'}) eq 'ставка';
    
  $room->{'ставка'} = undef
    if ($room->{'ставка|сумма'}) eq 'сумма';
  
  #~ return "Не заполнена ставка или сумма аренды помещения" #$c->render(json=>{error=>"Не заполнена ставка или сумма аренды помещения"})
    #~ unless (scalar grep defined $room->{$_}, qw(ставка сумма)) eq 1;
  
  $room->{$_} = &Util::money($room->{$_}) || ($room->{$_} eq 0 ? 0 : undef)
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
  my ($c, $dop, $prev) = @_;
  #~ $c->log->error($c->dumper($dop, $prev));
  $dop->{'@помещения'} = [map {
    my $r = $c->сохранить_помещение_договора($_);
    #~ $r ||= $@
      #~ and 
    return $r # $c->render(json=>{error=>$r})
      unless $r && ref $r;
    
    #~ $c->log->error("помещение доп соглашения", $c->dumper($r));
    
    $r;
  } grep {$_->{'помещение/id'}} @{ $dop->{'@помещения'} }];
  
  $dop->{uid} = $c->auth_user->{id}
    unless $dop->{id};
  
  my $r = eval {$c->model->сохранить_доп_соглашение($dop, $prev)};
  #~ $c->log->error("доп соглашения", $c->dumper($r));
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
  return "Неверная скидка"
    if $data->{'%'} > 100;
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
  #~ return $c->render(json=>{error=>"Нет проекта"})
    #~ unless $data->{'проект/id'};
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

sub удалить_расход {
  my $c = shift;
  my $data = $c->req->json;
  
  my $tx_db = $c->model->dbh->begin;
  local $c->model->{dbh} = $tx_db; # временно переключить модели на транзакцию
  
  my $r = $c->model->удалить_расход($data);
  return $c->render(json=>{error=>$r})
    unless ref $r;
  
  $tx_db->commit;
  $c->render(json=>{remove=>$r});
}

#~ ^\/аренда\/счет([^/]+)/?(?:\.([^/]+))?$

sub счет_оплата_docx {# сделать docx во врем папке и вернуть урл
  my $c = shift;
  
  my $docx = $c->stash('docx'); # имя файла
  #~ $c->app->log->error($docx);
  return $c->render_file(
    'filepath' => "static/tmp/$docx",
    'format'   => ($c->param('format') || $docx =~ /pdf/) ? 'pdf' : 'docx',
    #~ 'format'   => 'pdf',                 # will change Content-Type "application/x-download" to "application/pdf"
    #~ 'content_disposition' => 'inline',   # will change Content-Disposition from "attachment" to "inline"
    $c->param('inline') ? ('content_disposition' => 'inline') : (),
    defined $c->param('cleanup') ? ('cleanup'  => $c->param('cleanup')) : ( 'cleanup'  => 1),# delete file after completed
  )  if $c->req->method eq 'GET';#$docx;
  
  my $param =  $c->req->json || {};
  return $c->render(json=>{error=>'не указан месяц'})
    unless $param->{'месяц'};
  #~ return $c->render(json=>{error=>'не указаны договоры'})
    #~ unless $param->{'договоры'};
  $param->{'договоры'} = undef
    if $param->{'договоры'} && !@{$param->{'договоры'}};
  
  #~ $param->{docx} = sprintf("%s-%s.docx", $param->{'счет или акт'}, $c->auth_user->{id});
  #~ $param->{docx_template_file} = sprintf("templates/аренда/%s.template.docx", $param->{'счет или акт'},);
  $param->{uid} = $c->auth_user->{id};
  #~ $param->{auth_user} = $c->auth_user;
  my $data = $c->model->счет_помещения_docx($param);
  $c->log->error($c->dumper($data))
    and return $c->render(json=>{error=>$data})
    unless ref $data;
  return $c->render(json=>{error=>"Не найдено счетов"})
    unless @$data && $data->[0]{'jsonb_agg'};
  #~ $c->app->json->decode(
  #~ $c->log->error($c->dumper($data->[0]));#{"номер $param->{'счет или акт'}а"}
  #~ my @nums  = map {$_->{"номер $param->{'счет или акт'}а"}} @{ $c->app->json->decode($data->{data}) };
  
  #~ return $c->render(json=>{data=>$data});
  #~ my $tmp = Mojo::File::tempfile->basename;
  my $file = sprintf("%s-%s.%s", $param->{'счет или акт'}, $c->auth_user->{id}, $param->{'pdf формат'} ? 'pdf' : 'docx');#
  my $out_file = "static/tmp/$file";
  #~ my $err_file = "$data->{docx_out_file}.error";
  my $err_file = "$out_file.error";
  my $pdf_conv_pipe = $param->{'pdf формат'} ? sprintf(" | doc2pdf -M Title='%s' -M Author='%s' -M Subject='%s' -n --stdin --stdout ", $param->{'счет или акт'}, '', '') : '';
  
  my $python = $c->model->dict->{'счет.docx'}->render(
    docx_template_file=>sprintf("templates/аренда/%s.template.docx", $param->{'счет или акт'},),# || "static/аренда-счет.template.docx",
    #~ docx_out_file=>$r->{docx_out_file},
    data=>$data->[0]{'jsonb_agg'},# $self->app->json->encode($data),
    seller=>{},#$self->dbh->selectrow_array(q<select k."реквизиты"||to_jsonb(k) from "контрагенты" k  where id=123222>),# арендодатель по умолчанию
    #~ sign_image=>-f "static/i/logo/sign-123222.png" && "static/i/logo/sign-123222.png",#
    #~ {% if item['$арендодатель'] and sign_images.get(str(item['$арендодатель']['id'])) %} {{ sign_images.get(str(item['$арендодатель']['id'])) }} {% elif sign_images.get(str(seller['id'])) %} {{ sign_images.get(str(seller['id'])) }} {% endif %}
  );
  
  open(my $pipe, "| python  2>'$err_file' $pdf_conv_pipe > '$out_file' ")
      or die "can't fork: $!";
    binmode($pipe, ':encoding(UTF-8)');
    #~ ##local $SIG{PIPE} = sub { die "spooler pipe broke" };
    say $pipe $python;
    close($pipe)
    #~ || die "bads: $! $?"
      or return $c->render_file('filepath' => $err_file,  'format'   => 'txt', 'content_disposition' => 'inline', 'cleanup'  => 1,);
  
  #~ unlink $err_file;
  
  #~ $c->render(json=>{data=>$data});
  $c->render(json=>{docx=>$file});# $c->render(json=>{docx=>$data->{docx}})
}

sub счет_расходы_docx {# сделать docx во врем папке и вернуть урл
  my $c = shift;
  
  my $docx = $c->stash('docx'); # имя файла
  #~ $c->app->log->error($docx);
  return $c->render_file(
    'filepath' => "static/tmp/$docx",
    'format'   => ($c->param('format') || $docx) =~ /pdf/ ? 'pdf' : 'docx',
    $c->param('inline') ? ('content_disposition' => 'inline') : (),
    #~ 'format'   => 'pdf',                 # will change Content-Type "application/x-download" to "application/pdf"
    #~ 'content_disposition' => 'inline',   # will change Content-Disposition from "attachment" to "inline"
    'cleanup'  => 1,                     # delete file after completed
  )  if $c->req->method eq 'GET';#$docx;
  
  my $param =  $c->req->json || {};
  return $c->render(json=>{error=>'не указан месяц'})
    unless $param->{'месяц'};
  return $c->render(json=>{error=>'не указаны счета(id)'})
    unless $param->{'аренда/расходы/id'};
  
  $param->{'счет или акт'} ||= 'счет';
  #~ $param->{docx} = sprintf("%s-%s.docx", $param->{'счет или акт'}, $c->auth_user->{id});
  #~ $param->{docx_template_file} = sprintf("templates/аренда/%s.template.docx", $param->{'счет или акт'},);
  $param->{uid} = $c->auth_user->{id};
  #~ $param->{auth_user} = $c->auth_user;
  my $data = $c->model->счет_расходы_docx($param);
  $c->log->error($c->dumper($data))
    and return $c->render(json=>{error=>$data})
    unless ref $data;
  
  return $c->render(json=>{error=>"Не найдено счетов"})
    unless @$data && $data->[0]{'jsonb_agg'};
  
  #~ $c->log->error($c->dumper($data->{data}));
  
  #~ return $c->render(json=>{data=>$data});
  #~ my $tmp = Mojo::File::tempfile->basename;
=pod
  $docx = sprintf("%s-%s.%s", $param->{'счет или акт'}, $c->auth_user->{id}, $param->{'pdf формат'} ? 'pdf' : 'docx');#
  my $out_file = "static/tmp/$docx";
  #~ my $err_file = "$data->{docx_out_file}.error";
  my $err_file = "$out_file.error";
  my $pdf_conv = $param->{'pdf формат'} ? sprintf(" | doc2pdf -M Title='%s' -M Author='%s' -M Subject='%s' -n --stdin --stdout 2>'$err_file' ", $param->{'счет или акт'}, '', '') : '';
  
  open(my $python, "| python  2>'$err_file' $pdf_conv > '$out_file' ")
    || die "can't fork: $!";
  #~ ##local $SIG{PIPE} = sub { die "spooler pipe broke" };
  say $python $data->{python};
  close($python)
    #~ || die "bads: $! $?"
    || return $c->render_file('filepath' => $err_file,  'format'   => 'txt', 'content_disposition' => 'inline', 'cleanup'  => 1,);
  
  unlink $err_file;
  
  #~ $c->render(json=>{data=>$data});
  #~ $c->render(json=>{url=>$data->{docx_out_file}});
  $c->render(json=>{docx=>$docx});
=cut
  my $file = sprintf("%s-%s.%s", $param->{'счет или акт'}, $c->auth_user->{id}, $param->{'pdf формат'} ? 'pdf' : 'docx');#
  my $out_file = "static/tmp/$file";
  #~ my $err_file = "$data->{docx_out_file}.error";
  my $err_file = "$out_file.error";
  my $pdf_conv_pipe = $param->{'pdf формат'} ? sprintf(" | doc2pdf -M Title='%s' -M Author='%s' -M Subject='%s' -n --stdin --stdout ", $param->{'счет или акт'}, '', '') : '';
  
  my $python = $c->model->dict->{'счет.docx'}->render(
    docx_template_file=>sprintf("templates/аренда/%s.template.docx", $param->{'счет или акт'},),# || "static/аренда-счет.template.docx",
    #~ docx_out_file=>$r->{docx_out_file},
    data=>$data->[0]{'jsonb_agg'},# $self->app->json->encode($data),
    seller=>{},#$self->dbh->selectrow_array(q<select k."реквизиты"||to_jsonb(k) from "контрагенты" k  where id=123222>),# арендодатель по умолчанию
    #~ sign_image=>-f "static/i/logo/sign-123222.png" && "static/i/logo/sign-123222.png",#
    #~ {% if item['$арендодатель'] and sign_images.get(str(item['$арендодатель']['id'])) %} {{ sign_images.get(str(item['$арендодатель']['id'])) }} {% elif sign_images.get(str(seller['id'])) %} {{ sign_images.get(str(seller['id'])) }} {% endif %}
  );
  
  open(my $pipe, "| python  2>'$err_file' $pdf_conv_pipe > '$out_file' ")
      or die "can't fork: $!";
    binmode($pipe, ':encoding(UTF-8)');
    #~ ##local $SIG{PIPE} = sub { die "spooler pipe broke" };
    say $pipe $python;
    close($pipe)
    #~ || die "bads: $! $?"
      or return $c->render_file('filepath' => $err_file,  'format'   => 'txt', 'content_disposition' => 'inline', 'cleanup'  => 1,);
  
  unlink $err_file;
  
  #~ $c->render(json=>{data=>$data});
  $c->render(json=>{docx=>$file});# $c->render(json=>{docx=>$data->{docx}})

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
  my $data = $c->model->реестр_актов("месяц"=>$month, "месяц2"=>$month2, "счет или акт"=>'акт');
  open my $xfh, '>', \my $fdata or die "Failed to open filehandle: $!";
  my $workbook  = Excel::Writer::XLSX->new( $xfh );
  my $date_format = $workbook->add_format( num_format => 'dd.mm.yyyy', align  => 'left', );
  my $num_format = $workbook->add_format( num_format=> '# ##0.00');
  # порядок столбца, название, ширина, формат
  my %names = ('номер счета'=>[1,'Номер счета', 15], 'дата счета'=>[2,'Дата счета', 15, $date_format],  'номер акта'=>[3,'Номер акта', 15], 'дата акта'=>[4, 'Дата акта', 15], 'сумма/num'=>[5, 'Сумма', 10, $num_format], 'договор/номер'=>[6, 'Номер договора', 20], 'контрагент/title'=>[7, 'Арендатор', 50], 'ИНН'=>[8, 'ИНН', 15], 'объект'=>[9, 'Объект', 20],'проект'=>[10, 'Арендодатель', 20]);#'договор/дата завершения','договор/дата начала'=>'l', 
  #~ my $filename=sprintf("static/tmp/%s-реестр-актов.xlsx", $c->auth_user->{id}, $month);
  my @cols = sort {$names{$a}[0] <=> $names{$b}[0]} keys %names;
  
  
  my $worksheet = $workbook->add_worksheet();
  my $col = 0;
  $worksheet->set_column( $col++, 0, $names{$_}[2] || 30 )# тут формат не катит
    for @cols;#, $format
  $worksheet->set_row(0, 30);
    
  my $row = 0;
  # шапка
  $worksheet->write_row($row++,0, [map($names{$_}[1], @cols)], $workbook->add_format( bold => 1, bottom=>1, align=>'center', size=>13,bg_color=>'#C8E6C9'));
  
  for my $r (@$data) {
    my $col = 0;
    $worksheet->write($row, $col++, $r->{$_}, $names{$_}[3])# тут формат не катит 
      for @cols;#$c->app->json->decode($_->{'$арендодатель'})->{name}
    $worksheet->write_date_time( $row, 1, $r->{'дата счета'} && $r->{'дата счета'}.'T', $date_format );
    $worksheet->write_date_time( $row, 3, $r->{'дата акта'} && $r->{'дата акта'}.'T', $date_format );
    
    
    $row++;
  }
  
  $workbook->close();
  #~ return $fdata;
  #~ $c->render(data=>$fdata, format=>'xlsx');
  # Render data from memory as file
  $c->render_file('data' => $fdata, 'filename' => 'реестр-актов.xlsx', format=>'xlsx');
}

sub акты_список {
  my $c = shift;
  my $param = $c->req->json;
  my $data = $c->model->реестр_актов("select000"=>' jsonb_agg(a) ', "проект/id"=>$param->{project}{id}, "месяц"=>$param->{month}, "месяц2"=>$param->{month2}, "счет или акт"=>'акт', order_by=>'order by k.title');
  $c->render(json=>$data);
}

sub сохранить_подписание_акта {
  my $c = shift;
  my $param = $c->req->json;
  my $r = $c->model->сохранить_подписание_акта($param->{'акт/id'});
  $c->render(json=>{error=>$r})
    unless ref $r;
  $c->render(json=>{success=>$r});
  
}

sub на_емайл {# счета и акты, создать pdf файлы для каждого договора и вернуть данные для таблицы
  my $c = shift;
  my $param =  $c->req->json || {};
  return $c->render(json=>{error=>'не указан месяц'})
    unless $param->{'месяц'};
  #~ return $c->render(json=>{error=>'не указаны договоры'})
    #~ unless $param->{'договоры'};
  $param->{'договоры'} = undef
    if $param->{'договоры'} && !@{$param->{'договоры'}};
  $param->{uid} = $c->auth_user->{id};
  #~ $param->{auth_user} = $c->auth_user;
  $param->{"на емайл"} = 1;# у кого есть емайлы
  $param->{'pdf формат'} = 1;
  $param->{'select'} = ' "договор/id", jsonb_agg(a) as "@документы/json" ';
  $param->{'group_by'} = ' group by "договор/id" ';
  my $data = $c->model->счет_помещения_docx($param);
  $c->log->error($c->dumper($data))
    and return $c->render(json=>{error=>$data})
    unless ref $data;
  return $c->render(json=>{error=>"Не найдено счетов/актов или адресов почты"})
    unless @$data && $data->[0]{'@документы/json'};
  #~ $param->{docx} = sprintf("%s-%s.docx", $param->{'счет или акт'}, $c->auth_user->{id});
  my $docx_template_file = sprintf("templates/аренда/%s.template.docx", $param->{'счет или акт'},);
  
  for my $r (@$data) {# по одному договору
    
    #~ my $data = $c->app->json->decode($r->{jsonb_agg});

    my $file = sprintf("%s-%s-%s-%s.%s", $param->{'счет или акт'}, $c->auth_user->{id}, $r->{'договор/id'}, $param->{'месяц'}, $param->{'pdf формат'} ? 'pdf' : 'docx');#
    my $out_file = "static/tmp/$file";
    #~ my $err_file = "$data->{docx_out_file}.error";
    my $err_file = "$out_file.error";
    my $pdf_conv_pipe = $param->{'pdf формат'} ? sprintf(" | doc2pdf -M Title='%s' -M Author='%s' -M Subject='%s' -n --stdin --stdout 2>'$err_file' ", $param->{'счет или акт'}, '', '') : '';
    
    my $python = $c->model->dict->{'счет.docx'}->render(
      docx_template_file=>$docx_template_file,# || "static/аренда-счет.template.docx",
      #~ docx_out_file=>$r->{docx_out_file},
      data=>$r->{'@документы/json'},# $self->app->json->encode($data),
      seller=>{},#$self->dbh->selectrow_array(q<select k."реквизиты"||to_jsonb(k) from "контрагенты" k  where id=123222>),# арендодатель по умолчанию
      #~ sign_image=>-f "static/i/logo/sign-123222.png" && "static/i/logo/sign-123222.png",#
      #~ {% if item['$арендодатель'] and sign_images.get(str(item['$арендодатель']['id'])) %} {{ sign_images.get(str(item['$арендодатель']['id'])) }} {% elif sign_images.get(str(seller['id'])) %} {{ sign_images.get(str(seller['id'])) }} {% endif %}
    );
    
    open my $pipe, "| python  2>'$err_file' $pdf_conv_pipe > '$out_file' "
      or die "can't fork: $!";
    binmode($pipe, ':encoding(UTF-8)');
    #~ ##local $SIG{PIPE} = sub { die "spooler pipe broke" };
    say $pipe $python;
    close($pipe)
      #~ || die "bads: $! $?"
      || return $c->render_file('filepath' => $err_file,  'format'   => 'txt', 'content_disposition' => 'inline', 'cleanup'  => 1,);
    
    unlink $err_file;
    #~ @$r{keys %$data} = values %$data;
    $r->{file} = $file;
    $r->{'статус отправки письма'} = $c->отправить_письмо($param, $r)
      and unlink $out_file
      and delete $r->{file}
      if $param->{'отправить'};
    
  }
  #~ $c->log->error($c->dumper($data));
  $c->render(json=>{data=>$data, });#from=>$c->app->config->{'Email'}
}

sub отправить_письмо {
  my ($c, $param, $data) = @_;
  my $docs = $c->app->json->decode($data->{'@документы/json'});
  #~ $c->log->error($c->dumper($docs->[0]{'$арендодатель/json'}));
  #~ $c->log->error(Mojo::Asset::File->new(path => "static/tmp/$data->{file}")->slurp);
  my $mailer = $c->email;# has
 my $message = Email::MIME->create(
    header_str => [
      From    => $mailer->smtp_user,
      To      =>  sprintf("Арендатору <%s>", $docs->[0]{'$контрагент/json'}{'реквизиты'}{'email'}),#
      Subject => " Аренда помещений $docs->[0]{'объект'} ",
      $docs->[0]{'$арендодатель/json'}{'реквизиты'} && $docs->[0]{'$арендодатель/json'}{'реквизиты'}{'email'} ? ("Reply-To"=> $docs->[0]{'$арендодатель/json'}{'реквизиты'}{'email'}) : (), #'John Doe <John.Doe@gmail.com>',
      #~ "Sender" => 'John Doe <John.Doe@gmail.com>',# Sender or From header address rejected: not owned by authorized user
    ],
    parts => [
          Email::MIME->create(
            attributes => {
                    encoding => 'quoted-printable',
                    charset  => 'UTF-8',
                    content_type => 'text/html',
            },
            body_str => $c->render_to_string('аренда/письмо арендатору', format => 'html', docs=>$docs, param=>$param), #$c->model->dict->{'письмо аренда помещений'}->render(data=>$docs, param=>$param), #"<h1>Тест 2!</h1>\n",
          ),
          Email::MIME->create(
            #~ body => io("static/tmp/счет-1732-1044957-2020-09-30.pdf")->binary->all,
            body=> Mojo::Asset::File->new(path => "static/tmp/$data->{file}")->slurp,
            attributes => {
                filename => "$param->{'счет или акт'}.pdf",
                content_type => 'application/pdf',
                charset=>'UTF-8',
                encoding => 'Base64',
                #~ encoding     => "quoted-printable",
            },
         ),
    ]
  );
  my $sent = eval { $mailer->send_message($message)->{message} };
  $sent = ($@ =~ /^(.+?)\n/)[0]
    and $c->log->error($sent)
    unless $sent;
  #~ $c->log->error($c->dumper($sent));
  return $sent;
}

1;