package Model::Transport;
use Mojo::Base 'Model::Base';
use Util qw(indexOf);
#~ use JSON::PP;
use Lingua::RU::Money::XS qw(rur2words);

#~ my $JSON = JSON::PP->new->utf8(0);

#~ has sth_cached => 1;
has [qw(app)];
#~ has model_obj => sub {shift->app->models->{'Object'}};

sub new {
  state $self = shift->SUPER::new(@_);
  #~ $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  $self->dbh->do($self->sth('таблицы'));
  #~ $self->dbh->do($self->sth('функции'));
  return $self;
}

sub список_транспорта {
  my ($self, $category, $contragent) = @_;
  $self->dbh->selectall_arrayref($self->sth('список или позиция транспорта'), {Slice=>{}}, (undef) x 2, ($category) x 2, ($contragent) x 2);
}

sub свободный_транспорт {
  my ($self,) = @_;
  #~ $self->app->log->error($self->app->dumper( $self->dbh->selectall_arrayref('select t.id, hstore_to_json(hstore(t)) from "транспорт" t;', {Slice=>{}},) ));
  $self->dbh->selectall_arrayref($self->sth('свободный транспорт'), {Slice=>{}},);
  
}

my %type = ("ts"=>'date', "дата1"=>'date', "дата2"=>'date', "дата3"=>'date', "стоимость"=>'money', "сумма"=>'money',);
sub список_заявок {
  my ($self, $param) = @_;
  my $where = $param->{where} || "";
  my @bind = ( ($param->{'транспорт/заявки/id'}) x 2, @{$param->{bind} || []},);
  
  while (my ($key, $value) = each %{$param->{table} || {}}) {
    next
      unless ref($value) && ($value->{ready} || $value->{_ready}) ;
    
    if ($key ~~ [qw(номер)]) {
      $where .= ($where ? " and " :  "where ") . sprintf(qq' "%s" = ? ', $key,);
      push @bind, $value->{title};
      next;
    }
    
    if ($key ~~ [qw(откуда куда груз коммент)]) {
      $where .= ($where ? " and " :  "where ") . sprintf(qq' "%s"::text ~* ? ', $key,);
      push @bind, $value->{id} ? "#$value->{id}" : $value->{title};
      next;
    }
    
    if ($value->{id}) {
      $where .= ($where ? " and " :  "where ").qq| "$key/id"=? |;
      push @bind, $value->{id};
      next;
    }
    my @values = @{$value->{values} || []};
    next
      unless @values;
    $values[1] = 10000000000
      unless $values[1];
    $values[0] = 0
      unless $values[0];
    
    #~ my $sign = $value->{sign};
    
    $where .= ($where ? " and " :  "where ") . sprintf(qq' ("%s" between ?::%s and ?::%s)', $key, ($type{$key}) x 2);
    push @bind,  @values;
    
  }
  
  my $limit_offset = "LIMIT 50 OFFSET ".($param->{offset} || 0);
  
  $self->dbh->selectall_arrayref($self->sth('список или позиция заявок', where => $where, order_by=>'order by ts desc', limit_offset => $limit_offset), {Slice=>{}}, @bind);
}

sub сохранить_транспорт {
  my ($self, $data) = @_;
  my $prev = $self->позиция_транспорта($data->{id})
    if $data->{id};
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, "транспорт", ["id"], $data);
  $prev ||= $self->позиция_транспорта($r->{id});
  
  map {# прямые связи
    if ($data->{$_}) {
      my $rr= $self->связь_получить($prev->{"$_/id"}, $r->{id});
      $r->{"связь/$_"} = $rr && $rr->{id}
        ? $self->связь_обновить($rr->{id}, $data->{$_}, $r->{id})
        : $self->связь($data->{$_}, $r->{id});
    } 
    #~ else {# можно чикать/нет
      #~ $self->связь_удалить(id1=>$prev->{"$_/id"}, id2=>$r->{id});
    #~ }
  } qw(категория перевозчик);
  
  return $r;#$self->позиция_транспорта($r->{id});
}

sub позиция_транспорта {
  my ($self, $id) = @_;
  $self->dbh->selectrow_hashref($self->sth('список или позиция транспорта'), undef, ($id) x 2, (undef) x 4);
}

sub сохранить_заявку {
  my $self = shift;
  my $data = ref $_[0] ? shift : {@_};
  my $prev = $self->позиция_заявки($data->{id})
    if $data->{id};
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, "транспорт/заявки", ["id"], $data);
  $prev ||= $self->позиция_заявки($r->{id});
  
  $r->{"контрагенты"} = [];
  $r->{"заказчики"} = [];
  $r->{"грузоотправители"} = [];
  $r->{"связи"} = {};
  $r->{"связи удалить"} = {}; # будут удалены связи, если их не будет в сохраненных $r->{"связи"}
  # обработать связи
  map {
    my $rr = $self->связь($_, $r->{id});
    push @{$r->{"заказчики"}}, $rr->{id};
    $r->{"связи"}{"$rr->{id1}:$rr->{id2}"}++;
  } grep {$_} @{$data->{"заказчики/id"}}
    if $data->{"заказчики/id"};
  map {
    $r->{"связи удалить"}{$_.':'.$r->{id}} = {id1=>$_, id2=>$r->{id},};
  } @{$prev->{"заказчики/id"}};
  map {
    my $rr = $self->связь($_, $r->{id});
    push @{$r->{"грузоотправители"}}, $rr->{id};
    $r->{"связи"}{"$rr->{id1}:$rr->{id2}"}++;
  } grep {$_} @{$data->{"грузоотправители/id"}};
  map {
    $r->{"связи удалить"}{$_.':'.$r->{id}} = {id1=>$_, id2=>$r->{id},};
  } @{$prev->{"грузоотправители/id"}};
  map {# прямые связи
    if ($data->{$_}) {
      my $rr = $self->связь($data->{$_}, $r->{id});
      $r->{"связи"}{"$rr->{id1}:$rr->{id2}"}++;
      my $index = indexOf(qw(перевозчик заказчик0  посредник грузоотправитель0), $_);
      $r->{"контрагенты"}[$index] = $rr->{id}
        if defined $index;
    }
    #~ $self->связь_удалить(id1=>$prev->{"$_/id"}, id2=>$r->{id});
    $r->{"связи удалить"}{$prev->{"$_/id"}.':'.$r->{id}} = {id1=>$prev->{"$_/id"}, id2=>$r->{id},}
      if $prev->{"$_/id"};# можно чикать/нет
    
  } qw(перевозчик заказчик000 посредник грузоотправитель000 транспорт водитель-профиль категория);#объект
  
  
  map {# обратная связь
    if ($data->{$_}) {
      my $rr  = $self->связь($r->{id}, $data->{$_}, );
      $r->{"связи"}{"$rr->{id1}:$rr->{id2}"}++;
    }
    #~ $self->связь_удалить(id1=>$r->{id}, id2=>$prev->{"$_/id"}, );
    $r->{"связи удалить"}{$r->{id}.':'.$prev->{"$_/id"}} = {id1=>$r->{id}, id2=>$prev->{"$_/id"},}
      if $prev->{"$_/id"};
  } qw(транспорт1);
  
  map {# почикать связи, если их нет
    $self->связь_удалить(%{$r->{"связи удалить"}{$_}})
      unless $r->{"связи"}{$_};
  } keys %{$r->{"связи удалить"}};
  
  $self->обновить($self->{template_vars}{schema}, "транспорт/заявки", ["id"], {id=>$r->{id}, "контрагенты"=>$r->{"контрагенты"}, "заказчики"=>$r->{"заказчики"}, "грузоотправители"=>$r->{"грузоотправители"},});
  # номер последним!
  $self->обновить($self->{template_vars}{schema}, "транспорт/заявки", ["id"], {id=>$r->{id}}, {"номер"=>q| nextval(' "public"."транспорт/заявки/номер" ')|})
      unless $prev->{'номер'} || !$data->{'транспорт'};#&& $data->{'номер'};# && $data->{id};
  
  return $self->позиция_заявки($r->{id});
}

my $draft_key = 'черновик заявки на транспорт';
sub сохранить_черновик_заявки {# одна заявка на одного польз
  my $self = shift;
  my $data = ref $_[0] ? shift : {@_};
  #~ $data->{val} = $JSON->encode($data);
  $data->{key} = $draft_key;
  
  my $r = $self->dbh->selectrow_hashref($self->sth('черновик заявки'), undef, ($data->{uid}) x 2, $data->{key})
    unless $data->{draft_id};
  $data->{id} = $data->{draft_id} || ($r && $r->{id});
  $self->вставить_или_обновить($self->{template_vars}{schema}, "разное", ["id"], $data);
  
}

sub позиция_заявки {
  my ($self, $id) = @_; # 
  $self->dbh->selectrow_hashref($self->sth('список или позиция заявок'), undef, ([$id]) x 2,);
}

sub заявки_адреса {
  my ($self, $id, $param) = @_; #ид заказчик или проект
  return $self->dbh->selectall_arrayref($self->sth('заявки/адреса/откуда', select=>' "адрес" as name, count(*) as cnt', group_by=>' group by "адрес" ',), {Slice=>{}}, ($id) x 2,)
    if $param && ($param->param('only') || $param->param('column')) eq 'откуда';
  return $self->dbh->selectall_arrayref($self->sth('заявки/адреса/куда', select=>' "адрес" as name, count(*) as cnt', group_by=>' group by "адрес" ',), {Slice=>{}}, ($id) x 2,)
    if $param && ($param->param('only') || $param->param('column')) eq 'куда';
  $self->dbh->selectall_arrayref($self->sth('заявки/адреса'), {Slice=>{}}, ($id) x 4,);
  
}

sub водители {
  my ($self,) = @_; #
  $self->dbh->selectall_arrayref($self->sth('водители'), {Slice=>{}},);
}

sub заявки_водители {
  my ($self, $id) = @_; #ид перевозчика
  $self->dbh->selectall_arrayref($self->sth('заявки/водители'), {Slice=>{}}, $id,);
  
}

my @our_kIDs = qw(1393 10883);# останина капитал
sub заявки_контакт1 {
  my ($self, $id) = @_; #ид перевозчика
  my $r = $self->dbh->selectall_arrayref($self->sth('заявки/контакты', cont_num=>1), {Slice=>{}}, ([$id]) x 2,);
  #~ $self->app->log->error($self->app->dumper($r));
  my $our = indexOf(@our_kIDs, $id);
  push @$r, @{$self->dbh->selectall_arrayref($self->sth('заявки/контакты', cont_num=>3), {Slice=>{}}, (\@our_kIDs) x 2)}
    if defined $our;
  return $r;
}

sub заявки_контакты_заказчика {
  my ($self, $id) = @_; #ид заказчика
  $self->dbh->selectall_arrayref($self->sth('заявки/контакты заказчиков', cont_num000=>2), {Slice=>{}}, ([$id]) x 2,);
}

sub заявки_контакт3 {# 
  my ($self, $curr_user) = @_; #ид посредника - не нужен
  my $r = $self->dbh->selectall_arrayref($self->sth('заявки/контакты', cont_num=>3), {Slice=>{}}, ([0]) x 2);
  
  push @$r, @{$self->dbh->selectall_arrayref($self->sth('заявки/контакты', cont_num=>1), {Slice=>{}}, (\@our_kIDs) x 2)};
  push @$r, {title=>join(' ', @{$curr_user->{names}}), phone=>undef}
    if $curr_user;
  
  return $r;
}

sub заявки_контакты_грузоотправителя {
  my ($self, $id) = @_; #ид грузоотправтеля
  $self->dbh->selectall_arrayref($self->sth('заявки/контакты грузоотправителей', cont_num000=>4), {Slice=>{}}, ([$id]) x 2,);
}

sub заявки_директор {
  my ($self, $id, $num) = @_; #ид перевозчика
  $self->dbh->selectall_arrayref($self->sth('заявки/директор', cont_num=>$num), {Slice=>{}}, ([$id]) x 2,);
}

=pod
sub заявки_интервал {
  my ($self, $param) = @_; #
  my @bind = ((undef) x 2, $param->{'дата1'}, $param->{'дата2'},);
  $self->dbh->selectall_arrayref($self->sth('список или позиция заявок', where => qq! where "транспорт/id" is not null and "дата1" between coalesce(?::date, (now()-interval '9 days')::date) and coalesce(?::date, now()::date) !, ), {Slice=>{}}, @bind);
  
  
}
=cut

sub черновик_заявки {
  my ($self, $uid) = @_;
  $self->dbh->selectrow_hashref($self->sth('черновик заявки'), undef, ($uid) x 2, $draft_key);
}

1;

sub ask_docx {
  my ($self, $id) = @_;
  
  my $JSON = $self->app->json;
  
  my $r = $self->dbh->selectrow_hashref($self->sth('список или позиция заявок'), undef, ([$id]) x 2,);
  $r->{"посредник"} = $JSON->decode($r->{'посредник/json'} || $r->{'перевозчик/json'} || '{}');
  $r->{"контакты"} //= [];
  $r->{"маршрут/откуда"} = $JSON->decode($r->{'откуда'}) || [[]];
  $r->{"маршрут/куда"} = $JSON->decode($r->{'куда'}) || [[]];
  $r->{"_откуда"} = $JSON->decode($r->{'откуда'}) || [[]];
  $r->{"_куда"} = $JSON->decode($r->{'куда'}) || [[]];
  my $objects = $self->dbh->selectall_hashref(' select * from "объекты"; ', 'id',);
  map { my $i=$_; map { my $k=$_; if ( my $id = ($r->{"маршрут/откуда"}[$i][$k] =~ /^#(\d+)/)[0] ) { $r->{"маршрут/откуда"}[$i][$k] = $objects->{$id}{name}; } } (0..$#{$r->{"маршрут/откуда"}[$i]}) } (0..$#{$r->{"маршрут/откуда"}});
  map { my $i=$_; map { my $k=$_; if ( my $id = ($r->{"маршрут/куда"}[$i][$k] =~ /^#(\d+)/)[0] ) { $r->{"маршрут/куда"}[$i][$k] = $objects->{$id}{name}; } } (0..$#{$r->{"маршрут/куда"}[$i]}) } (0..$#{$r->{"маршрут/куда"}});
  my $sum = $r->{'сумма'} =~ s/[^\d\.]+//gr;
  my $sum_char = rur2words($sum);
  $r->{'сумма'} = $sum*1;
  $r->{'сумма прописью'} = ucfirst $sum_char =~ s/(\s*руб\w+ \d+ коп\w+)//gr;
  $r->{'сумма прописью/коп'} = $1;
  $r->{'коммент'} =  "Счет, акт выставлять на $r->{'заказчик'} (реквизиты во вложении),\nв счете прописывать номер заявки, маршрут и дату погрузки!!!".($r->{'коммент'} ? "\n".$r->{'коммент'} : '')
    if $r->{"заказчик/id"} ~~ [16404, 16307];
  $r->{'коммент'} =  "Счет, акт выставлять на $r->{'грузоотправитель'} (реквизиты во вложении),\nв счете прописывать номер заявки, маршрут и дату погрузки!!!".($r->{'коммент'} ? "\n".$r->{'коммент'} : '')
    if $r->{"грузоотправитель/id"} ~~ [16404, 16307];
  
  $r->{route} = [($r->{"_откуда"}[0][0] && $r->{"_откуда"}[0][0] =~ /^#(\d+)/ ? 'г. Пермь' : $r->{"маршрут/откуда"}[0][0]), ($r->{"_куда"}[-1][0] && $r->{"_куда"}[-1][0] =~ /^#(\d+)/ ? 'г. Пермь' : $r->{"маршрут/куда"}[-1][0])];
  my $file = sprintf("ТЗ №%s %s %s.docx", $r->{номер} || '#'.$r->{id}, $r->{перевозчик} || '?нет перевозчика?', join('-', map {s/^\s*г[.\s]+//r} @{$r->{route}}));
  $file =~ s!/!|!g;
  $r->{docx_out_file} = "static/tmp/".substr($file, 0, 255);#от $r->{'дата заявки формат'}  
  
  $r->{'водитель'} ||= [];
  $r->{'водитель-профиль'} ||=[];
  
  #~ my $contragent2=>$r->{'посредник/id'} ? :  $r->{заказчик},# грузополучатель
  my $director1 = ($r->{"директор1"} && $r->{"директор1"}[0]) || $r->{'посредник'} && $r->{'посредник'}{'реквизиты'} && $r->{'посредник'}{'реквизиты'}{'в лице'}; # в лице перевозчика
  
  $r->{python} = $self->dict->{'заявка.docx'}->render(#$self->sth('заявка.docx',
    docx_template_file=>"static/transport-ask-ostanina.template.docx",
    docx_out_file=>$r->{docx_out_file},
    #~ contragent3_top_details=>join(', ', map { " u'''$_''' " } grep {!/^\s*#/} ("Наседкин", "Михаил",)), #@$top_details,
    contragent0_title=>$r->{'посредник'}{title},
    contragent3_title=>$r->{'посредник'}{title},
    contragent3_face_title=>'                                                      ',
    contragent1_face_title=>'                                                      ',
    contragent3_osn=>'Устава',
    contragent1_osn=>'Устава',
    $r->{'посредник'} && $r->{'посредник'}{'реквизиты'} ? (
      
      contragent0_INN=>$r->{'посредник'}{'реквизиты'}{'ИНН'},#$self->app->dumper($r->{'посредник'}), #
      contragent0_BIK=>$r->{'посредник'}{'реквизиты'}{'БИК'},
      contragent0_OGRNIP=> $r->{'посредник'}{'реквизиты'}{'ОГРНИП'},
      contragent0_korr_schet=>$r->{'посредник'}{'реквизиты'}{'кор. счет'} || $r->{'посредник'}{'реквизиты'}{'корр. счет'},
      contragent0_ras_schet=>$r->{'посредник'}{'реквизиты'}{'расч. счет'},
      contragent0_bank=>$r->{'посредник'}{'реквизиты'}{'банк'},
      contragent0_ur_addr=>$r->{'посредник'}{'реквизиты'}{'юр. адрес'},
      contragent0_post_addr=>$r->{'посредник'}{'реквизиты'}{'почт. адрес'},
      contragent0_tel=>join(', ', @{ $r->{'посредник'}{'реквизиты'}{'тел'} || []}),
      contragent3_face=>$r->{'посредник'}{'реквизиты'}{'в лице'},
      contragent3_face_title=>$r->{'посредник'}{'реквизиты'}{'расшифровка подписи'},
      contragent3_osn=>$r->{'посредник'}{'реквизиты'}{'действует на основании'},
      contragent3_name=>$r->{'посредник'}{'реквизиты'}{'наименование'},
    ) : (),
    $r->{'посредник/id'} ? () : (
      contragent3_name=>$r->{заказчик},
      contragent3_title=>$r->{заказчик},
      contragent3_face=>'[?]',
      contragent3_face_title=>'                                                      ',
      contragent3_osn=>'Устава',
      contragent1_osn=>$r->{'посредник'} && $r->{'посредник'}{'реквизиты'} && $r->{'посредник'}{'реквизиты'}{'действует на основании'} || '[?]',
      contragent1_face_title=>($r->{'посредник'} && $r->{'посредник'}{'реквизиты'} && $r->{'посредник'}{'реквизиты'}{'расшифровка подписи'}) || '                                                      ',
    ),
    
    id=>$r->{id},
    num=>$r->{номер},
    bad_num=>$r->{номер} ? '' : '!НОМЕР ЗАЯВКИ?',
    date=>$r->{'дата заявки формат'},
    bad_date=>$r->{'дата заявки формат'} ? '' : '!ДАТА ЗАЯВКИ?',
    contragent1=>$r->{перевозчик},
    bad_contragent1=>$r->{перевозчик} ? '' : '!ПЕРЕВОЗЧИК?',
    director1=>$director1,
    bad_director1=>$director1  ? '' : '!ЛИЦО ПЕРЕВОЗЧИКА?',
    contact1=>($r->{"контакты"}[0] && $r->{"контакты"}[0][0]) // '',
    phone1=>($r->{"контакты"}[0] && $r->{"контакты"}[0][1]) // '',
    route=>join(' - ', @{$r->{route}}),
    gruz=>$r->{груз},
    contragent4 => $r->{грузоотправитель},
    contact4=>($r->{"контакты грузоотправителей"}[0] && $r->{"контакты грузоотправителей"}[0][0]) // '',
    phone4=>($r->{"контакты грузоотправителей"}[0] && $r->{"контакты грузоотправителей"}[0][1]) // '',
    address1=>($r->{"_откуда"}[0][0] && $r->{"_откуда"}[0][0] =~ /^#(\d+)/ ? 'г. Пермь, ' : '') . join(', ', @{$r->{"маршрут/откуда"}[0]}),
    datetime1=>$r->{"дата1 краткий формат"},
    
    contragent2=>$r->{заказчик},# грузополучатель
    contact2=>($r->{"контакты заказчиков"}[0] && $r->{"контакты заказчиков"}[0][0]) // '',
    phone2=>($r->{"контакты заказчиков"}[0] && $r->{"контакты заказчиков"}[0][1]) // '',
    address2=>($r->{"_куда"}[-1][0] && $r->{"_куда"}[-1][0] =~ /^#(\d+)/ ? 'г. Пермь, ' : '') . join(', ', @{$r->{"маршрут/куда"}[-1]}),
    datetime2=>$r->{"дата3 краткий формат"},
    
    money=>"$r->{сумма} ($r->{'сумма прописью'})$r->{'сумма прописью/коп'} , без НДС по оригиналам ОТТН и бух.документов 3-5 б.д.\nДокументы подписать , печать, подпись, расшифровка",
    comment=>$r->{'коммент'} // '',
    contact3=>($r->{"контакты"}[2] && $r->{"контакты"}[2][0]) // '', # контактное лицо посредника
    phone3=>($r->{"контакты"}[2] && $r->{"контакты"}[2][1]) // '',
    transport1=>$r->{"транспорт1"} ? $r->{"транспорт1"}=~s|\\|/|gr.", " : '',# тягач сцепки
    transport2=>($r->{"транспорт"} // '')=~s|\\|/|gr,# 
    driver=> $r->{'водитель'}[0] // join(' ', @{$r->{'водитель-профиль'}}),
    driver_phone=>$r->{'водитель'}[1] // '',
    driver_doc=>$r->{'водитель'}[2] // '',# паспорт
    
  );
  
  return $r;
}


__DATA__
@@ таблицы
create table IF NOT EXISTS "{%= $schema %}"."транспорт" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int not null,
  "title" varchar not null,
  "descr" text null
/* связи:
id1("категории")->id2("транспорт")
id1("контрагенты")->id2("транспорт") --- перевозчик
id1("транспорт")->id2("транспорт/заявки")
*/
);

create table IF NOT EXISTS "{%= $schema %}"."транспорт/заявки" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int not null,
  "номер" int, --- select nextval(' "public"."транспорт/заявки/номер" ');
  "дата1" date not null, -- начало
  "дата2" date null, --  завершение факт
  "дата3" date null, --  завершение план
---  "дата3" timestamp without time zone, --- когда фактически отработана/закрыта заявка
  "контрагенты" int[], --- массив связей(id1(контрагент)-id2(заявка)): 1эл-т - ид связи с перевозчиком; 2эл-т - ид связи с заказчиком/ГП; 3эл-т - ид связи с посредником (если есть) 4эл - ид связи с грузоотправителем
  "заказчики" int[], --- вынес из "контрагенты"[2] (их может много), тоже массив связей ид1("контрагенты")-ид2("транспорт/заявки")
  "грузоотправители" int[], --- вынес из "контрагенты"[4] (их может много), тоже массив связей ид1("контрагенты")-ид2("транспорт/заявки")
  "откуда" jsonb,  -- 2-х уровневый масив
  "куда" jsonb, --- 
  "маршрут на круг" boolean, --- с обратом
  "груз" text, 
  "водитель" text[], -- имя, тел, паспорт
  "контакты" text[], --- порядок соотв массиву "контрагенты"
  "контакты заказчиков" text[], --- вынес из "контакты"(соотв массиву "заказчики")
  "контакты грузоотправителей" text[], --- вынес из "контакты"(соотв массиву "грузоотправители")
  ---"контакт1" text[], -- контактное лицо(имя, тел) перевозчика
  ---"контакт2" text[], -- контактное лицо(имя, тел) заказчика/ГП
  ---"контакт3" text[], -- контактное лицо(имя, тел) последника(если есть)
  ---"контакт4" text[], -- контактное лицо(имя, тел) грузоотправителя(если есть)
  "директор1" text[], -- перевозчик в лице руководителя
  "стоимость" money,  --- деньги перевозчику
  ---"сумма/посредник-ГП" money, --- если есть посредник, то это сумма его сделки с ГП
  "сумма/посреднику" money[], --- от заказчиков, соотв позиции массива "заказчики"
  "тип стоимости" int, --- 0 - вся сумма, 1- за час, 2 - за км
  "факт" numeric, --- часов или км
  --- сумма="стоимость"*(coalesce("факт",1)^"тип стоимости"::boolean::int)
  "дата получения док" date, --- фактическая дата 
  "дата оплаты по договору" date, --- планикуемая для контроля оплат
  "дата оплаты" date, --- фактический приход денег по заявке
  "док оплаты" text, -- номер: счет/фактура
  "коммент" text, 
  "отозвать" boolean, -- отмена
  "снабженец" int, --- создал заявку (id профиля)
  "с объекта" int, --- доставка на объект через промежуточные базы
  "на объект" int --- доставка на объект через промежуточные базы
/* связи:
id1("объекты")->id2("транспорт/заявки") --- куда если на наш объект (внутренний получатель)
--- убрал ---id1("проекты")->id2("транспорт/заявки") --- если наш получатель и не объект
id1("контрагенты")->id2("транспорт/заявки") --- таких связей несколько (2 или 3): связи с перевозчиком, заказчиком, посредником(если есть). ИДы этих связей в поле-массиве "контрагенты" 
--- убрал! см поле "контрагенты"!  id1("транспорт/заявки")->id2("контрагенты") ---  получатель/заказчик

id1("транспорт")->id2("транспорт/заявки") --- конкретно транспорт
id1("транспорт/заявки")->id2("транспорт") --- если сцепка тягач-прицеп (прицеп остается в прямой связи как обычный транспорт, а тягач будет в обратной связи)
id1("профили")->id2("транспорт/заявки") --- водитель если своя машина
id1("категории")->id2("транспорт/заявки") --- если еще не указан транспорт (после установки транспорта категория тут разрывается - сам транспорт связан с категорией)
*/
);

create index IF NOT EXISTS "idx/транспорт/заявки/дата" on "транспорт/заявки" ("дата1");

create table IF NOT EXISTS "{%= $schema %}"."разное" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int not null,--- чья запись
  key text not null,--- типа "черновик заявки на транспорт"
  val jsonb not null
/*
связей нет
----------id1("профили")->id2("разное") 

*/
);
create index IF NOT EXISTS "idx/разное/лkey" on "{%= $schema %}"."разное" ("key");

/*
update "транспорт/заявки" z
set "куда"=u.upd
from (
  select z.id, '{"'||coalesce('#'||o.id::text, "куда")||'"}' as upd
  from "транспорт/заявки" z
    left join (
      select o.*, r.id2
      from "объекты" o
        join refs r on  o.id=r.id1
    ) o on z.id=o.id2
) u
where z.id=u.id;

alter table "транспорт/заявки" alter column "куда" type text[] USING "куда"::text[];

update "транспорт/заявки" z
set "откуда"=u.upd
from (
  select z.id, '{"'||"откуда"||'"}' as upd
  from "транспорт/заявки" z
) u
where z.id=u.id;

---alter table "транспорт/заявки" add column "куда2" type text[];
alter table "транспорт/заявки" alter column "куда" type jsonb using array_to_json(array["куда"]);
alter table "транспорт/заявки" alter column "откуда" type jsonb using array_to_json(array["откуда"]);


alter table "транспорт/заявки" alter column "откуда" type text[] USING "откуда"::text[];

update "транспорт/заявки" z
set "водитель"=u.upd
from (
  select z.id, '{"'||"водитель"||'"}' as upd
  from "транспорт/заявки" z
) u
where z.id=u.id;

alter table "транспорт/заявки" alter column "водитель" type text[] USING "водитель"::text[];

alter table "транспорт/заявки" add column "контакт1" text[]; --- контактное лицо и телефон перевозчика
alter table "транспорт/заявки" add column "контакт2" text[]; --- контактное лицо и телефон заказчика

alter table "транспорт/заявки" add column "контакт3" text[]; --- контактное лицо и телефон посредника(наша контора - трансп отдел)
alter table "транспорт/заявки" add column "контакт4" text[]; -- контактное лицо(имя, тел) грузоотправителя(если есть)
alter table "транспорт/заявки" add column "сумма/посредник-ГП" money; --- а поле "стоимость" - между перевозчиком
alter table "транспорт/заявки" add column "контрагенты" int[]; --- см выше в create table
alter table "транспорт/заявки" add column "дата3" date; --- завершение план

alter table "транспорт/заявки" add column "дата получения док" date; --- фактическая дата 
alter table "транспорт/заявки" add column "дата оплаты по договору" date; --- планикуемая для контроля оплат

alter table "транспорт/заявки" add column "контакты" text[]; --- контактные лица порядок соотв массиву "контрагенты"
update "транспорт/заявки" z
  set "контакты"=array["контакт1", "контакт2", coalesce("контакт3", array[null, null]), coalesce("контакт4", array[null, null])]
;

--- массив связей с контрагентами
update "транспорт/заявки" z
set "контрагенты"=u."связи"
from (
select tz.id, con1.id as "перевозчик/id", con2.id as "заказчик/id", array[con1.id_ref, con2.id_ref] as "связи"
from "транспорт/заявки" tz
  left join (-- перевозчик
    select con.*, r.id2, r.id as id_ref
    from refs r
      join "контрагенты" con on con.id=r.id1
  ) con1 on tz.id=con1.id2
  
  left join (-- заказчик
    select con.*,  r.id1, r.id as id_ref
    from refs r
      join "контрагенты" con on con.id=r.id2
  ) con2 on tz.id=con2.id1
) u
where z.id=u.id
;

--- перевернуть связь заявка-заказчик
update refs r
set id1=u."заказчик/id",
  id2=u.tz_id
from (
select tz.id as tz_id, con2.id as "заказчик/id", con2.id_ref----, array[con1.id_ref, con2.id_ref] as "связи"
from "транспорт/заявки" tz
  join (-- заказчик
    select con.*,  r.id1, r.id as id_ref
    from refs r
      join "контрагенты" con on con.id=r.id2
  ) con2 on tz.id=con2.id1
) u
where r.id=u.id_ref
;

---- прочие поля для печатной формы
create sequence "public"."транспорт/заявки/номер";
alter table "транспорт/заявки" add column "номер" int; --- select nextval(' "public"."транспорт/заявки/номер" ');


alter table "транспорт/заявки" add column "маршрут на круг" boolean;
alter table "транспорт/заявки" add column "отозвать" boolean;

alter table "транспорт/заявки" add column "заказчики" int[]; --- вынес из "контрагенты"(их может много), тоже массив связей ид1("контрагенты")-ид2("транспорт/заявки")
update "транспорт/заявки"
set "заказчики" = array["контрагенты"[2]];

alter table "транспорт/заявки" add column "грузоотправители" int[]; --- вынес из "контрагенты"(их может много), тоже массив связей ид1("контрагенты")-ид2("транспорт/заявки")
update "транспорт/заявки"
set "грузоотправители" = array["контрагенты"[4]];

alter table "транспорт/заявки" add column "контакты заказчиков" text[]; --- вынес из "контакты"(соотв массиву "заказчики")
update "транспорт/заявки"
set "контакты заказчиков" = "контакты"[2:2];

alter table "транспорт/заявки" add column "контакты грузоотправителей" text[]; --- вынес из "контакты"(соотв массиву "грузоотправители")
update "транспорт/заявки"
set "контакты грузоотправителей" = "контакты"[4:4];

alter table "транспорт/заявки" add column "сумма/посреднику" money[];
update "транспорт/заявки"
set "сумма/посреднику" = array["сумма/посредник-ГП"];

alter table "транспорт/заявки" add column "снабженец" int; --- создал заявку

alter table "транспорт/заявки" add column "на объект" int; --- (ид связи) доставка на объект через промежуточные базы
alter table "транспорт/заявки" add column "с объекта" int; --- (ид связи) доставка на объект через промежуточные базы

--- заново нумерацию заявок с начала года
alter sequence "транспорт/заявки/номер" restart 1;

update "транспорт/заявки" set "номер"=s.x
from (
  select id, nextval(' "public"."транспорт/заявки/номер" ') as x
  from "транспорт/заявки"
  where ts>'2017-12-31' and "номер" is not null
  order by "номер"
) as s 
where "транспорт/заявки".id=s.id;


--- Гарантия тоже в наш транспорт
insert into refs (id1, id2)
select distinct unnest(array[1393, 10883, 971]), t.id
from "транспорт" t
  join refs r on t.id=r.id2
where r.id1=any(array[1393, 10883, 971])
on conflict DO NOTHING
;

*/

---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION "полный формат даты"(date) RETURNS text AS $$ 
  select array_to_string(array[
    ---to_char($1, 'TMdy') || ',',
    regexp_replace(to_char($1, 'DD'), '^0', ''),
    ---to_char($1, 'TMmon'),
    m.name,
    to_char($1, 'YYYY')
  ]::text[], ' ')
  from (VALUES ('01', 'января'),  ('02', 'февраля'), ('03', 'марта'), ('04', 'апреля'), ('05', 'мая'), ('06', 'июня'), ('07', 'июля'), ('08', 'августа'), ('09', 'сентября'), ('10', 'октября'), ('11', 'ноября'), ('12', 'декабря')) as m (id, name)
  where m.id=to_char($1, 'MM')
  ;
$$ LANGUAGE SQL IMMUTABLE STRICT;

-------------------------------------------------------------------
CREATE OR REPLACE VIEW "водители" AS
select p.*, d.name as "должность", d.id as "должность/id"
from "должности" d
  join refs r on d.id=r.id1
  join "профили" p on p.id=r.id2
where d.name = any(array['Водитель', 'Водитель КДМ', 'Машинист автокрана', 'Машинист экскаватора', 'Машинист катка', 'Машинист экскаватора-погрузчика'])
;
--------------

@@ 123
/*
CREATE OR REPLACE FUNCTION "транспорт/заявки/куда-адр-об"(text)
RETURNS table("id" int, "адрес" text, "проект/id" int, "проект" text, "объект/id" int, "объект" text) AS $func$ 
--- select "транспорт/заявки/куда-адр-об"('{"dsfds\ dsgfdg", "объект#3406"}');
/*преобразовать текст полей КУДА адресов-объектов в массив и прицепить объекты(если строки вида объект#3406)*/
select a.*,  po.*
from (
select case when un ~ '^объект#' then regexp_replace(un, '^объект#', '')::int else null end as id, un as "адрес"
  from (select unnest($1::text[]) as un) un
) a
left join "проекты/объекты" po on po."объект/id"=a.id
;
$func$ LANGUAGE SQL; --- IMMUTABLE STRICT;
*/

@@ список или позиция транспорта
select t.*, ----(case when con.id is null then '★' else '' end) || t.title as title2,
  cat.id as "категория/id", cat.parents_name || cat.name::varchar as "категории", cat.parents_id as "категории/id",
  k.*,
  v.id as "водитель/id", v.names as "водитель-профиль",  v."водитель"
from "транспорт" t
  join refs r on t.id=r.id2
  join "roles/родители"() cat on cat.id=r.id1
  
  /*****join (-- перевозчика транспорт или наш
    select z.t_id, con.*
    from (
      select r.id1 as t_id, max(z.id) as z_id
      from refs r
        join "транспорт/заявки" z on z.id=r.id2 ---только отработанные заявки
      group by r.id1
    ) z 
    join refs r on z.z_id=r.id2
    join "контрагенты" con on con.id=r.id1
  
  ) con on t.id=con.t_id
  ******/
  
  /*********join refs rk on t.id=rk.id2
  join "контрагенты" con on con.id=rk.id1 -- перевозчик
  
  LEFT JOIN (-- проект перевозчика
    SELECT p.*,  r.id2 AS k_id
     FROM refs r
       JOIN "проекты" p ON p.id = r.id1
  ) p ON con.id = p.k_id
  **********/
  
  left join lateral (-- перевозчик
    select array_agg(k.id) as  "перевозчик/id", array_agg(k.title) as "перевозчик", array_agg(p.id) as "проект/id", array_agg(p.name) as "проект"
    from 
      refs rk
      join "контрагенты" k on k.id=rk.id1 
      left join (-- может проект
        select p.*,  r.id2
        from refs r
          join "проекты" p on p.id=r.id1
      ) p on k.id=p.id2
    where rk.id2=t.id
  ) k on true

  
  left join lateral ( -- водитель по последней заявке 
    select p.id, p.names, z."водитель"
    from refs r -- на транспорт
      join "транспорт/заявки" z on z.id=r.id2
      left join (
        select p.*, r.id2
        from  refs r
          join "профили" p on p.id=r.id1
      ) p on p.id2 = z.id
    where r.id1= t.id
      and (p.names is not null or z."водитель" is not null)
    order by z."дата1" desc
    limit 1
  ) v on true
where 
----cat.parents_id[1]=3
  (coalesce(?::int, 0)=0 or t.id=?)
  and (coalesce(?::int, 0)=0 or ?::int=any(cat.parents_id || cat.id))
  and (coalesce(?::int, 0)=0 or ?=any(k."перевозчик/id"))

;

@@ список или позиция заявок
select * from (
select tz.*,
  tz."откуда" as "$откуда/json", tz."куда" as "$куда/json",
  ask_seq.last_value as "последний номер",
  "полный формат даты"(tz.ts::date) as "дата заявки формат",
  ----"формат даты"(tz.ts::date) as "дата заявки формат списка",
  array_to_string(array[ to_char(tz.ts, 'DD'), to_char(tz.ts, 'MM'),  to_char(tz.ts, 'YY')]::text[], '.') as "дата заявки краткий формат",
  "формат даты"(tz."дата1") as "дата1 формат",
  timestamp_to_json(tz."дата1"::timestamp) as "@дата1/json",
  array_to_string(array[ to_char(tz."дата1", 'DD'), to_char(tz."дата1", 'MM'),  to_char(tz."дата1", 'YYYY')]::text[], '.') as "дата1 краткий формат",
  "формат даты"(tz."дата2") as "дата2 формат",
  timestamp_to_json(tz."дата2"::timestamp) as "@дата2/json",
   "формат даты"(tz."дата3") as "дата3 формат",
   timestamp_to_json(tz."дата3"::timestamp) as "@дата3/json",
  array_to_string(array[ to_char(tz."дата2", 'DD'), to_char(tz."дата2", 'MM'),  to_char(tz."дата2", 'YYYY')]::text[], '.') as "дата2 краткий формат",
  array_to_string(array[ to_char(tz."дата3", 'DD'), to_char(tz."дата3", 'MM'),  to_char(tz."дата3", 'YYYY')]::text[], '.') as "дата3 краткий формат",
  tz."стоимость"*(coalesce(tz."факт",1::numeric)^coalesce(tz."тип стоимости"::boolean::int, 1::int)) as "сумма",

  ka."контрагенты/id",
  k_zak."заказчики/id",
  k_zak."$заказчики/json",
  k_go."грузоотправители/id",
  k_go."$грузоотправители/json",
  con1.id as "перевозчик/id", con1.title as "перевозчик",
  con1."проект/id" as "перевозчик/проект/id", con1."проект" as "перевозчик/проект",
  row_to_json(con1) as "$перевозчик/json",
  con2.id as "заказчик/id", con2.title as "заказчик",
  con2."проект/id" as "заказчик/проект/id", con2."проект" as "заказчик/проект",
  con3.id as "посредник/id", con3.title as "посредник",
  con3."проект/id" as "посредник/проект/id", con3."проект" as "посредник/проект",
  row_to_json(con3) as "$посредник/json",
  ----coalesce(ob."проект/id", pr.id) as "проект/id", coalesce(ob."проект", pr.title) as "проект",
  ---tr."проект/id" as "перевозчик/проект/id", tr."проект" as "перевозчик/проект",
  con4.id as "грузоотправитель/id", con4.title as "грузоотправитель",
  con4."проект/id" as "грузоотправитель/проект/id", con4."проект" as "грузоотправитель/проект",
  
  ---ob.id as "объект/id", ob.name as "объект",
  tr.id as "транспорт/id", tr.title as "транспорт",---(case when tr.id is null then '★' else '' end) || 
  coalesce(tr."категория/id", cat.id) as "категория/id", coalesce(tr."категории", cat."категории") as "категории", coalesce(tr."категории/id", cat."категории/id") as "категории/id",
  tr1.id as "транспорт1/id", tr1.title as "транспорт1", -- тягач может
  v.id as "водитель-профиль/id", v.names as "водитель-профиль", tz."водитель",
  snab."профиль" as "$снабженец/json",
  tmc."$позиции тмц/json", tmc."позиции тмц/объекты/id",
  o1."json" as "$с объекта/json", o1."id" as "с объекта/id",
  o2."json" as "$на объект/json", o2."id" as "на объект/id",
  array[o1.id, o2.id] as "базы/id"
  
from "транспорт/заявки" tz
  join "public"."транспорт/заявки/номер" ask_seq on true
  
  left join lateral (-- все контрагенты (без заказчиков и грузотправителей) иды (перевести связи в ид контрагента)
    select array_agg(r.id1 order by un.idx) as "контрагенты/id" ---array_agg(row_to_json(k) order by un.idx) as "все контрагенты"
    from unnest(tz."контрагенты") WITH ORDINALITY as un(id, idx)
      join refs r on un.id=r.id
      ---join "контрагенты" k on k.id=r.id1
    where r.id2=tz.id
    group by tz.id
  ) ka on true
  
  /*******left join lateral (-- все заказчики иды (перевести связи в ид контрагента)
    select array_agg(r.id1 order by un.idx) as "заказчики/id" ---array_agg(row_to_json(k) order by un.idx) as "все контрагенты"
    from unnest(tz."заказчики") WITH ORDINALITY as un(id, idx)
      join refs r on un.id=r.id
    where r.id2=tz.id
    group by tz.id
  ) k_zak on true
  *******/
  
  left join lateral (-- все заказчики (как json)
    select array_agg(r.id1 order by un.idx) as "заказчики/id", array_agg(row_to_json(k) order by un.idx) as "$заказчики/json"
    from unnest(tz."заказчики") WITH ORDINALITY as un(id, idx)
      join refs r on un.id=r.id
      join (
        select distinct k.*,
          p.id as "проект/id", p.name as "проект"
        from "контрагенты" k
          left join (-- проект 
            select p.*,  r.id2
            from refs r
              join "проекты" p on p.id=r.id1
          ) p on k.id=p.id2 
      ) k on k.id=r.id1
    where r.id2=tz.id
    group by tz.id
  ) k_zak on true
  
  left join lateral (-- все грузоотправители иды (перевести связи в ид контрагента)
    select array_agg(r.id1 order by un.idx) as "грузоотправители/id",  array_agg(row_to_json(k) order by un.idx) as "$грузоотправители/json"
    from unnest(tz."грузоотправители") WITH ORDINALITY as un(id, idx)
      join refs r on un.id=r.id
      join (
        select distinct k.*,
          p.id as "проект/id", p.name as "проект"
        from "контрагенты" k
          left join (-- проект 
            select p.*,  r.id2
            from refs r
              join "проекты" p on p.id=r.id1
          ) p on k.id=p.id2 
      ) k on k.id=r.id1
    where r.id2=tz.id
    group by tz.id
  ) k_go on true
  
  left join lateral (-- перевозчик (!не в транспорте!)
    select distinct con.*,
      p.id as "проект/id", p.name as "проект" --,r.id2
    from refs r
      join "контрагенты" con on con.id=r.id1
      left join (-- проект 
        select p.*,  r.id2
        from refs r
          join "проекты" p on p.id=r.id1
      ) p on con.id=p.id2
    where 
      r.id=tz."контрагенты"[1]
      and r.id2=tz.id
  ) con1 on true ---tz.id=con1.id2
  
  left join lateral (-- заказчик1 (для docx оставил)
    select distinct con.*,
      p.id as "проект/id", p.name as "проект" --,r.id2
    from refs r
      join "контрагенты" con on con.id=r.id1
      left join (-- проект 
        select p.*,  r.id2
        from refs r
          join "проекты" p on p.id=r.id1
      ) p on con.id=p.id2
    where
      r.id=tz."заказчики"[1]---tz."контрагенты"[2]
      and r.id2=tz.id
  ) con2 on true ---tz.id=con2.id2
  
  left join lateral (-- посредник
    select distinct con.*,
      p.id as "проект/id", p.name as "проект" ---, r.id2
    from refs r
      join "контрагенты" con on con.id=r.id1
      left join (-- проект 
        select p.*,  r.id2
        from refs r
          join "проекты" p on p.id=r.id1
      ) p on con.id=p.id2
    where
      r.id=tz."контрагенты"[3]
      and r.id2=tz.id
  ) con3 on true ---tz.id=con3.id2
  
  left join lateral (-- грузоотправитель1
    select distinct con.*,
      p.id as "проект/id", p.name as "проект" --,r.id2
    from refs r
      join "контрагенты" con on con.id=r.id1
      left join (-- проект 
        select p.*,  r.id2
        from refs r
          join "проекты" p on p.id=r.id1
      ) p on con.id=p.id2
    where
      r.id=tz."грузоотправители"[1]---tz."контрагенты"[4]
      and r.id2=tz.id
  ) con4 on true ---tz.id=con4.id2
  
  /***left join (-- проект или через объект
    select pr.*,  r.id2 as tz_id
    from refs r
      join "проекты" pr on pr.id=r.id1
  ) pr on tz.id=pr.tz_id
  ***/
  
  /***left join (
    select ob.*, r.id2 as tz_id
    from refs r
      join "объекты" ob on ob.id=r.id1
  ) ob on tz.id=ob.tz_id
  ***/
  
  left join (-- категория без транспорта
    select distinct cat.*, cat.parents_name || cat.name::varchar as "категории", cat.parents_id as "категории/id", r.id2 as tz_id
    from refs r
      join "roles/родители"() cat on cat.id=r.id1
      where cat.parents_id[1] = 36668
  
  ) cat on tz.id=cat.tz_id
  
  left join (--- транспорт с категорией и !не перевозчиком!
    select tr.*,
      cat.id as "категория/id", cat.parents_name || cat.name::varchar as "категории", cat.parents_id as "категории/id",
      r.id2 as tz_id
      ---con.id as "перевозчик/id", con.title as "перевозчик",
      ---p.id as "проект/id", p.name as "проект"
    from refs r
      join "транспорт" tr on tr.id=r.id1
      join refs r2 on tr.id=r2.id2
      join "roles/родители"() cat on cat.id=r2.id1
      /*********join refs rk on tr.id=rk.id2
      join "контрагенты" con on con.id=rk.id1
      left join (-- проект 
        select p.*,  r.id2
        from refs r
          join "проекты" p on p.id=r.id1
      ) p on con.id=p.id2
      **********/
    where cat.parents_id[1] = 36668
  ) tr on tz.id=tr.tz_id
  
  left join (--- тягач для прицепов (обратная связь) без категории
    select tr.*, r.id1 as tz_id
    from "транспорт" tr
      join refs r on tr.id=r.id2
  ) tr1 on tz.id=tr1.tz_id
  
  left join lateral (-- водитель на заявке
  select p.*---, r.id2 as tz_id
    from refs r
      join "профили" p on p.id=r.id1
    where r.id2=tz.id
  ) v on true ---tz.id=v.tz_id
  
  left join lateral (-- снабженец создал заявку
    select row_to_json(p) as "профиль"
      from"профили" p
      where p.id=tz."снабженец"
  ) snab on true
  
  left join lateral (--- привязанные позиции тмц
  select array_agg(row_to_json(t)) as "$позиции тмц/json",
    array_agg("объект/id") as "позиции тмц/объекты/id"  --- для фильтрации по объекту
  from (
    select t.*,
      timestamp_to_json(t."дата1"::timestamp) as "$дата1/json",
      timestamp_to_json(t."дата/принято"::timestamp) as "$дата/принято/json",
      EXTRACT(epoch FROM now()-"дата/принято")/3600 as "дата/принято/часов",
      o.id as "объект/id", o.name as "объект", row_to_json(o) as "$объект/json",
      n.id as "номенклатура/id", "номенклатура/родители узла/title"(n.id, true) as "номенклатура",
      p.names as "профиль заказчика"
    from refs r
      join "тмц" t on t.id=r.id1
      join "профили" p on t.uid=p.id
      join refs rn on t.id=rn.id2
      join "номенклатура" n on rn.id1=n.id
      join refs ro on t.id=ro.id2
      join "объекты" o on ro.id1=o.id
    where r.id2=tz.id
    ) t
  ) tmc on true
  
   left join lateral (--- с объекта груз/снабжение
    select row_to_json(o) as "json", o.id
    from refs r
      join "объекты" o on o.id=r.id1 and r.id2=tz.id
    where r.id=tz."с объекта"
   ) o1 on true
   
   left join lateral (--- на объект груз/снабжение
    select row_to_json(o) as "json", o.id
    from refs r
      join "объекты" o on o.id=r.id1 and r.id2=tz.id
    where r.id=tz."на объект"
   ) o2 on true

where coalesce(?::int[], '{0}'::int[])='{0}'::int[] or tz.id=any(?::int[])
) t
{%= $where || '' %}
{%= $order_by || '' %} --- менять порядок для разных табов-списков
{%= $limit_offset || '' %}
;


@@ заявки/адреса/откуда
-- откуда (без объектов)
select {%= $select || '*' %}
from (
  select k.id as "контрагент/id", jsonb_array_elements_text(j."addr") as "адрес"
  from "транспорт/заявки" tz
    join jsonb_array_elements(tz."откуда") as j ("addr") on true
    join refs r on tz.id=r.id2
    join "контрагенты" k on k.id=r.id1
  where tz."откуда" is not null
    and (r.id=any(tz."заказчики") or r.id=any(tz."грузоотправители"))---tz."контрагенты"[2] -- заказчик
    and ((coalesce(?::int[], array[0]))[1]=0 or k.id=any(?))
) tz
where not "адрес" ~ '^#\d+'
{%= $group_by || '' %}

@@ заявки/адреса/куда
-- куда  (без объектов)
select {%= $select || '*' %}
from (
  select k.id as "контрагент/id", jsonb_array_elements_text(j."addr") as "адрес"
  from "транспорт/заявки" tz
    join jsonb_array_elements(tz."куда") as j ("addr") on true
    join refs r on tz.id=r.id2
    join "контрагенты" k on k.id=r.id1
  where tz."куда" is not null
    and (r.id=any(tz."заказчики") or r.id=any(tz."грузоотправители"))---tz."контрагенты"[2] -- заказчик
    and ((coalesce(?::int[], array[0]))[1]=0 or k.id=any(?))
) tz
where not "адрес" ~ '^#\d+'
{%= $group_by || '' %}

@@ заявки/адреса
-- куда и откуда (без объектов)
select "адрес" as name, count(*) as cnt
from (

{%= $dict->render('заявки/адреса/откуда') %}
union
{%= $dict->render('заявки/адреса/куда') %}

) u
group by "адрес"
;

@@ водители
-- наши
select v.*, tz."водитель"[2] as phone, tz."водитель"[3] as doc -- паспорт
from "водители" v 
  left join lateral (-- доп поля из заявок
    select tz."водитель", max(tz.id) as max_id
    from "транспорт/заявки" tz
      join refs r on tz.id=r.id2
    where r.id1=v.id and (tz."водитель" is not null and (tz."водитель"[2] is not null or tz."водитель"[3] is not null) )
    group by tz."водитель"
  
  ) tz on true
order by v.names, tz.max_id desc
;

@@ заявки/водители
select distinct tz."водитель"[1] as title,  tz."водитель"[2] as phone, tz."водитель"[3] as doc -- паспорт
from "транспорт" t
  join refs rk on t.id=rk.id2
  join "контрагенты" k on k.id=rk.id1 -- перевозчик
  
  join refs rz on t.id=rz.id1
  join "транспорт/заявки" tz on tz.id=rz.id2

where tz."водитель" is not null
  and tz."водитель"[1] is not null
  and coalesce(k.id, 0)=?
;


@@ заявки/контакты
--- $cont_num=1|2|3|4 (соотв перевозчика |заказчика/ГП | посредника | грузоотправителя)
select distinct coalesce(tz."контакты"[{%= $cont_num %}][1], '') as title,  coalesce(tz."контакты"[{%= $cont_num %}][2], '') as phone
from 
  "транспорт/заявки" tz
  join refs r on r.id=tz."контрагенты"[{%= $cont_num %}]

where 
  ---tz."контакты"[{%= $cont_num %}] is not null
  (tz."контакты"[{%= $cont_num %}][1] is not null or tz."контакты"[{%= $cont_num %}][2] is not null)
  and ((?::int[])[1] = 0 or r.id1 = any(?)) --- ид ка
;

@@ заявки/контакты заказчиков
--- 
select distinct coalesce("контакты заказчиков"[1][1], '') as title,  coalesce("контакты заказчиков"[1][2], '') as phone
from (
  select tz."контакты заказчиков"[un.idx\:un.idx] --- срез сохраняет многоразмерность
  from "транспорт/заявки" tz,
  unnest(tz."заказчики")  WITH ORDINALITY as un(id, idx),
  refs r
  where un.id=r.id
  and ((?::int[])[1] = 0 or r.id1 = any(?)) --- ид ка
  and tz.id=r.id2  --- избыток
) с
where 
  "контакты заказчиков"[1][1] is not null or "контакты заказчиков"[1][2] is not null
;

@@ заявки/контакты грузоотправителей
--- 
select distinct coalesce("контакты грузоотправителей"[1][1], '') as title,  coalesce("контакты грузоотправителей"[1][2], '') as phone
from (
  select tz."контакты грузоотправителей"[un.idx : un.idx] --- срез сохраняет многоразмерность
  from "транспорт/заявки" tz,
  unnest(tz."грузоотправители")  WITH ORDINALITY as un(id, idx),
  refs r
  where un.id=r.id
  and ((?::int[])[1] = 0 or r.id1 = any(?)) --- ид ка
  and tz.id=r.id2  --- избыток
) с
where 
  "контакты грузоотправителей"[1][1] is not null or "контакты грузоотправителей"[1][2] is not null
;

@@ заявки/директор
--- $cont_num=1|2|3 (соотв перевозчика, заказчика/ГП и посредника)
select distinct tz."директор{%= $cont_num %}"[1] as title,  tz."директор{%= $cont_num %}"[2] as phone
from "контрагенты" k 
  join refs r on k.id=r.id1 
  join "транспорт/заявки" tz on tz.id=r.id2

where tz."директор{%= $cont_num %}" is not null
  and tz."директор{%= $cont_num %}"[1] is not null
  and r.id=tz."контрагенты"[{%= $cont_num %}]
  ---and tz."контрагенты"[{%= $cont_num %}] is not null
  and ((?::int[])[1] = 0 or k.id = any(?)) --- coalesce(k.id, 0)=
;

@@ свободный транспорт
select t.*,
  cat.id as "категория/id", cat.parents_name || cat.name::varchar as "категории", cat.parents_id as "категории/id",
  k.*
from "транспорт" t

  join refs rc on t.id=rc.id2
  join "roles/родители"() cat on cat.id=rc.id1

  join lateral ( -- перевозчик c нашим проектом
    select array_agg(k.id) as  "перевозчик/id", array_agg(k.title) as "перевозчик", array_agg(p.id) as "проект/id", array_agg(p.name) as "проект"
    from 
      refs rk
      join "контрагенты" k on k.id=rk.id1
      join (-- только наши проекты 
        select p.*,  r.id2
        from refs r
          join "проекты" p on p.id=r.id1
      ) p on k.id=p.id2
    where rk.id2=t.id
  ) k on k."перевозчик/id" is not null --- ??? странно
  
where 
  not exists (
    select z.*
    from 
      refs r
      join "транспорт/заявки" z on z.id=r.id2

    where z."дата2" is null
      and t.id=r.id1
  )
  and not exists (--- может тягач
    select z.*
    from 
      refs r 
      join "транспорт/заявки" z on z.id=r.id1
    where z."дата2" is null
      and t.id=r.id2
  )
;

@@ черновик заявки
select *
from "разное"
where (?::int is null or uid=?) ---
  and key=?
;

@@ заявка.docx
# -*- coding: utf-8 -*-
'''
https://github.com/elapouya/python-docx-template
http://docxtpl.readthedocs.io/en/latest/

pip install docxtpl

'''

from docxtpl import DocxTemplate
tpl=DocxTemplate(u'{%= $docx_template_file %}')#/home/guest/Ostanin-dev/static/transport-ask-ostanina.template.docx
#'top_details': [{%= $top_details %}], # шапка реквизитов
context = {
    'contragent3_title': u'''{%= $contragent3_title %}''',
    'contragent3_name': u'''{%= $contragent3_name %}''',
    'contragent0_title': u'''{%= $contragent0_title %}''',
    'contragent0_INN': u'''{%= $contragent0_INN %}''',
    'contragent0_BIK': u'''{%= $contragent0_BIK %}''',
    'contragent0_OGRNIP': u'''{%= $contragent0_OGRNIP %}''',
    'contragent0_korr_schet': u'''{%= $contragent0_korr_schet %}''',
    'contragent0_ras_schet': u'''{%= $contragent0_ras_schet %}''',
    'contragent0_bank': u'''{%= $contragent0_bank %}''',
    'contragent0_ur_addr': u'''{%= $contragent0_ur_addr %}''',
    'contragent0_post_addr': u'''{%= $contragent0_post_addr %}''',
    'contragent0_tel': u'''{%= $contragent0_tel %}''',
    'contragent3_face': u'''{%= $contragent3_face %}''',
    'contragent3_name': u'''{%= $contragent3_name %}''',
    'contragent3_face_title': u'''{%= $contragent3_face_title %}''',
    'contragent3_osn': u'''{%= $contragent3_osn %}''',
    
    'contragent1_face_title': u'''{%= $contragent1_face_title %}''',
    'contragent1_osn': u'''{%= $contragent1_osn %}''',

    'id': u'{%= $id %}',
    'num': u'{%= $num %}', #441
    'bad_num':u'{%= $bad_num %}',
    'date': u'{%= $date %}', # 19 октября 2017
    'bad_date':u'{%= $bad_date %}',

    'contragent1' : u'''{%= $contragent1 %}''', # перевозчик ООО «ДанаТрансТорг»
    'director1': u'''{%= $director1 %}''', # генерального директора Федоровой Натальи Владимировны# перевозчик  в лице
    'bad_director1':u'{%= $bad_director1 %}',
    'contact1': u'''{%= $contact1 %}''', #Наталья# контактное лицо перевозчика
    'phone1': u'''{%= $phone1 %}''', #+7(919) 474 70 70# телефон контактного лица перевозчика
    
    'route': u'''{%= $route %}''', #г . Екатеринбург - г. Пермь# Маршрут/ расстояние
    'gruz': u'''{%= $gruz %}''', # Плитка гранитная  20 т на паллетах
    'contragent4': u'''{%= $contragent4 %}''',#ООО ТД «Сибирский гранит»# грузоотправитель
    'contact4': u'''{%= $contact4 %}''', #Илья# контактное лицо грузоотправителя
    'phone4': u'''{%= $phone4 %}''', #+7 904 162 18 30# телефон контактного лица грузоотправителя
    'address1': u'''{%= $address1 %}''', #г. Екатеринбург, Сибирский тракт 7 км  загруз - верх# Адрес загрузки  откуда
    'datetime1': u'''{%= $datetime1 %}''', #20.10.2017 с 11:00 до 15:00# Дата и время загрузки
    
    'contragent2': u'''{%= $contragent2 %}''', #ООО «ТехДорГрупп»# грузополучатель
    'contact2': u'''{%= $contact2 %}''', #Максим# контактное лицо грузополучатель
    'phone2': u'''{%= $phone2 %}''', #8 963-877-21-23# телефон контактного лица грузополучателя
    'address2': u'''{%= $address2 %}''', #г. Пермь, ул. Решетниковский спуск 1 к2   разгруз - верх# Адрес выгрузки
    'datetime2': u'''{%= $datetime2 %}''', #21.10.2017     с 9:00 до 15:00# Дата и время выгрузки
    
    'money': u'''{%== $money %}''', #14 000(четырнадцать) тысяч руб. 00 коп., без НДС по оригиналам ОТТН и бух.документов 1-3 б.д. Документы подписать , печать, подпись, расшифровка#Стоимость перевозки
    'comment': u'''{%== $comment %}''', #Счет, акт выставлять на ООО «ТехДорГрупп» (реквизиты во вложении), в счете прописывать маршрут и дату погрузки!!!# Особые условия
    
    'contact3': u'''{%= $contact3 %}''', #Ольга# Решение вопросов
    'phone3': u'''{%= $phone3 %}''',#+7 982 351 66 78
    
    'transport1': u'''{%= $transport1 %}''',# DAF-XF95-430 №  а/м А 063 УК159
    'transport2': u'''{%= $transport2 %}''', #п/п АН 0263 59
    'driver': u'''{%= $driver %}''', #Ежов Юрий Викторович
    'driver_phone': u'''{%= $driver_phone %}''', #8-922-33-98-306 / 8-902-635-46-67
    'driver_doc': u'''{%= $driver_doc %}''', # паспорт
    

}

tpl.render(context)
tpl.save(u'{%= $docx_out_file %}') # /home/guest/Документы/transport-ask-template.ok.docx