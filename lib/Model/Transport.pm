package Model::Transport;
use Mojo::Base 'Model::Base';
use Util qw(indexOf numeric);
#~ use JSON::PP;
use Lingua::RU::Money::XS qw(rur2words);

our $DATA = ['Transport.pm.dict.sql'];

#~ my $JSON = JSON::PP->new->utf8(0);

#~ has sth_cached => 1;
has [qw(app)];
has model_Contragent => sub {shift->app->models->{'Contragent'}};

sub init {
  #~ state $self = shift->SUPER::new(@_);
  my $self = shift;
  #~ $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  $self->dbh->do($self->sth('таблицы'));
  #~ $self->dbh->do($self->sth('функции'));
  return $self;
}

sub список_транспорта {
  my ($self, $category, $contragent, $param) = (shift, shift, shift, ref $_[0] ? shift : {@_});
  $self->dbh->selectall_arrayref($self->sth('список или позиция транспорта', select=>$param->{select} || '*',), {Slice=>{}}, (undef) x 2, ($category) x 2, ($contragent) x 2);
}

sub наш_транспорт {
  my ($self, $param) = (shift, ref $_[0] ? shift : {@_});
  #~ $self->app->log->error($self->app->dumper( $self->dbh->selectall_arrayref('select t.id, hstore_to_json(hstore(t)) from "транспорт" t;', {Slice=>{}},) ));
  $self->dbh->selectall_arrayref($self->sth('наш транспорт', select=>$param->{select} || '*'), {Slice=>{}},);
  
}

my %type = ("ts"=>'date', "дата1"=>'date', "дата2"=>'date', "дата3"=>'date', "стоимость"=>'money', "сумма"=>'money',);
sub список_заявок {
  my ($self, $param, $cb) = @_;
  my $where = $param->{where} || "";
  $param->{'where_tmc'} ||= '';
  $param->{bind_tmc} ||= [];
  
  my @bind = ( ($param->{'транспорт/заявки/id'}) x 2, @{$param->{bind} || []},);
  #~ my @bind_tmc = @{$param->{bind_tmc} || []};
  
  while (my ($key, $value) = each %{$param->{table} || $param->{filter} || {}}) {
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
      if ($key =~ s|^тмц/||) {
        if ($key eq 'номенклатура') {
          $param->{'where_tmc'} .= ($param->{'where_tmc'} ? " and " :  "where "). q{   EXISTS  (select np.id from "номенклатура/родители"(t."номенклатура/id") np where ((case when np.parents_id = array[null]::int[] then array[]::int[] else np.parents_id end | np.id) @@ ?::query_int)::boolean ) };
        } else {
          $param->{'where_tmc'} .= ($param->{'where_tmc'} ? " and " :  "where "). ($key =~ /^@/ ? qq| ?=any("$key/id") |  : qq| "$key/id"=? |);
        }
        push @{$param->{bind_tmc}}, $value->{id};
      } else {
        $where .= ($where ? " and " :  "where "). ($key =~ /^@/ ? qq| ?=any("$key/id") |  : qq| "$key/id"=? |);
        push @bind, $value->{id};
      }
      next;
    }
    #~ $self->app->log->error("values", $self->app->dumper($value));
    my @values = @{$value->{values} || []}
     or next;
    $values[1] = 10000000000
      unless $values[1];
    $values[0] = 0
      unless $values[0];
    
    #~ my $sign = $value->{sign};
    
    #~ my $tmc_key = $key;
    #~ if ($key =~ s/^тмц\///) {
      #~ $param->{'where_tmc'} .= ($param->{'where_tmc'} ? " and " :  "where "). sprintf(qq' ("%s" between ?::%s and ?::%s)', $key, ($type{$key}) x 2);
    #~ }
    
    $where .= ($where ? " and " :  "where ") . sprintf(qq' ("%s" between ?::%s and ?::%s)', $key, ($type{$key}) x 2);
    push @bind,  @values;
    
  }
  
  my $limit_offset = $param->{limit_offset} // "LIMIT " . ($param->{limit} || 100) . " OFFSET " . ($param->{offset} || 0);
  
  push @bind, $param->{async}
    if $param->{async} && ref $param->{async} eq 'CODE';
  $self->dbh->selectall_arrayref($self->dict->render('заявки/список или позиция', select=>$param->{select} || '*', join_transport=>$param->{'join_transport'} // 'left', join_tmc=>$param->{'join_tmc'}, where_tmc=> $param->{'where_tmc'} || '', where => $where, order_by=>$param->{order_by} // 'order by ts desc', limit_offset => $limit_offset), {Slice=>{}, Cached=>1,}, @{$param->{bind_tmc}}, @bind, $cb // ());
}

sub список_заявок_тмц {
  my ($self, $param) = (shift, ref $_[0] ? shift : {@_});
  my @bind = ( ($param->{'транспорт/заявки/id'} || []),);
  $self->dbh->selectall_arrayref($self->sth('тмц', select=>$param->{select} || '*', where=>"where t.id=any(?)", group_by=>'/*явно без группировки*/'), {Slice=>{}}, @bind, );#$param->{async} ? $param->{async} : (),
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
  my $prev = $data->{id} && $self->позиция_заявки($data->{id});
    #~ if $data->{id};косяк
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, "транспорт/заявки", ["id"], $data);
  $prev ||= $self->позиция_заявки($r->{id});
  
  $r->{"контрагенты"} = [];
  $r->{"заказчики"} = [];
  $r->{"грузоотправители"} = [];
  $r->{"связи"} = { (map {my $rr = $self->_select($self->template_vars->{schema}, $self->template_vars->{tables}{refs}, ["id"], {id=>$r->{$_},}); $rr ? ("$rr->{id1}:$rr->{id2}"=>1) : ()} ('с объекта/id', 'на объект/id')), }; # не удалять связи по ТМЦ объектам
  $r->{"связи удалить"} = {}; # будут удалены связи, если их не будет в сохраненных $r->{"связи"}
  # обработать связи
  map {
    my $rr = $self->связь($_, $r->{id});
    push @{$r->{"заказчики"}}, $rr->{id};
    $r->{"связи"}{"$rr->{id1}:$rr->{id2}"}++;
  } grep {$_} @{$data->{'заказчики/id'}}
    if $data->{'заказчики/id'};
  map {
    $r->{"связи удалить"}{$_.':'.$r->{id}} = {id1=>$_, id2=>$r->{id},};
  } @{$prev->{'@заказчики/id'}};
  map {
    my $rr = $self->связь($_, $r->{id});
    push @{$r->{"грузоотправители"}}, $rr->{id};
    $r->{"связи"}{"$rr->{id1}:$rr->{id2}"}++;
  } grep {$_} @{$data->{"грузоотправители/id"}};
  map {
    $r->{"связи удалить"}{$_.':'.$r->{id}} = {id1=>$_, id2=>$r->{id},};
  } @{$prev->{'@грузоотправители/id'}};
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
  $self->обновить($self->{template_vars}{schema}, "транспорт/заявки", ["id"], {id=>$r->{id}}, {"номер"=>q| nextval(' "public"."транспорт/заявки/номер" ')::text|})
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
  my ($self, $id, $param) = (shift, shift, ref $_[0] ? shift : {@_}); # 
  $self->dbh->selectrow_hashref($self->sth('заявки/список или позиция', join_tmc=>$param->{join_tmc}, select_top_tmc=>$param->{select_top_tmc}, select_tmc=>$param->{select_tmc}, group_by_tmc=>$param->{group_by_tmc}, group_by_top_tmc=>$param->{group_by_top_tmc}), undef, ([$id]) x 2,);
}

sub заявки_адреса {
  my ($self, $id, $param) = @_; #ид заказчик или проект
  return $self->dbh->selectall_arrayref($self->sth('заявки/адреса/откуда', select=>' "адрес" as name, count(*) as cnt', group_by=>' group by "адрес" ',), {Slice=>{}}, ($id) x 2,)
    if $param && ($param->param('only') || $param->param('column') || '') eq 'откуда';
  return $self->dbh->selectall_arrayref($self->sth('заявки/адреса/куда', select=>' "адрес" as name, count(*) as cnt', group_by=>' group by "адрес" ',), {Slice=>{}}, ($id) x 2,)
    if $param && ($param->param('only') || $param->param('column') || '') eq 'куда';
  $self->dbh->selectall_arrayref($self->sth('заявки/адреса'), {Slice=>{}}, ($id) x 4,);
  
}

sub водители {
  my ($self, $param) = (shift, ref $_[0] ? shift : {@_},); #
  $self->dbh->selectall_arrayref($self->sth('водители', select=>$param->{select} || '*',), {Slice=>{}},);
}

sub заявки_водители {
  my ($self, $id) = @_; #ид перевозчика
  $self->dbh->selectall_arrayref($self->sth('заявки/водители'), {Slice=>{}}, $id,);
  
}

sub заявки_контакты {
  my ($self, $id) = @_; #ид контрагента
  $self->dbh->selectall_arrayref($self->sth('заявки/контакты'), {Slice=>{}}, ($id) x 3,);
}
=pod
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
=cut

sub заявки_директор {
  my ($self, $id, $num) = @_; #ид перевозчика
  $self->dbh->selectall_arrayref($self->sth('заявки/директор', cont_num=>$num), {Slice=>{}}, ([$id]) x 2,);
}

=pod
sub заявки_интервал {
  my ($self, $param) = @_; #
  my @bind = ((undef) x 2, $param->{'дата1'}, $param->{'дата2'},);
  $self->dbh->selectall_arrayref($self->sth('заявки/список или позиция', where => qq! where "транспорт/id" is not null and "дата1" between coalesce(?::date, (now()-interval '9 days')::date) and coalesce(?::date, now()::date) !, ), {Slice=>{}}, @bind);
  
  
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
  
  my $r = $self->dbh->selectrow_hashref($self->sth('заявки/список или позиция'), undef, ([$id]) x 2,);
  
  $r->{"перевозчик"} = $self->model_Contragent->позиция($r->{'перевозчик/id'});
  $r->{"перевозчик"}{'реквизиты'} = $JSON->decode($r->{"перевозчик"}{'реквизиты'} || '{}');
  $r->{"посредник"} = $self->model_Contragent->позиция($r->{'посредник/id'} || $r->{'перевозчик/id'});#$JSON->decode($r->{'$посредник/json'} || $r->{'$перевозчик/json'} || '{}');
  $r->{"посредник"}{'реквизиты'} = $JSON->decode($r->{"посредник"}{'реквизиты'} || '{}');
  $r->{"заказчик"} = $self->model_Contragent->позиция($r->{'@заказчики/id'}[0]);#$JSON->decode($r->{'@заказчики/json'}->[0]);
  $r->{"заказчик"}{'реквизиты'} = $JSON->decode($r->{"заказчик"}{'реквизиты'} || '{}');
  $r->{"заказчик/id"} = $r->{"заказчик"}{id};
  $r->{"грузоотправитель"} = $self->model_Contragent->позиция($r->{'@грузоотправители/id'}[0]);#$JSON->decode((@{$r->{'@грузоотправители/json'} || []})[0] || '{}');
  $r->{"грузоотправитель"}{'реквизиты'} = $JSON->decode($r->{"грузоотправитель"}{'реквизиты'} || '{}');
  $r->{"грузоотправитель/id"} = $r->{"грузоотправитель"}{id};
  $r->{"контакты"} //= [];
  $r->{"маршрут/откуда"} = $JSON->decode($r->{'откуда'}) || [[]];
  $r->{"маршрут/куда"} = $JSON->decode($r->{'куда'}) || [[]];
  $r->{"_откуда"} = $JSON->decode($r->{'откуда'}) || [[]];
  $r->{"_куда"} = $JSON->decode($r->{'куда'}) || [[]];
  my $objects = $self->dbh->selectall_hashref(' select * from "объекты"; ', 'id',);
  map { my $i=$_; map { my $k=$_; if ( my $id = ($r->{"маршрут/откуда"}[$i][$k] =~ /^#(\d+)/)[0] ) { $r->{"маршрут/откуда"}[$i][$k] = $objects->{$id}{name}; } } (0..$#{$r->{"маршрут/откуда"}[$i]}) } (0..$#{$r->{"маршрут/откуда"}});
  map { my $i=$_; map { my $k=$_; if ( my $id = ($r->{"маршрут/куда"}[$i][$k] =~ /^#(\d+)/)[0] ) { $r->{"маршрут/куда"}[$i][$k] = $objects->{$id}{name}; } } (0..$#{$r->{"маршрут/куда"}[$i]}) } (0..$#{$r->{"маршрут/куда"}});
  my $sum = numeric($r->{'сумма'});# =~ s/[^\d\.,]+//gr;
  my $sum_char = rur2words($sum);
  #~ $r->{'сумма'} = $sum*1;
  $r->{'сумма прописью'} = ucfirst $sum_char =~ s/(\s*руб\w+ \d+ коп\w+)//gr;
  $r->{'сумма прописью/коп'} = $1;
  $r->{'коммент'} =  "Счет, акт выставлять на $r->{'заказчик'}{title} (реквизиты во вложении),\nв счете прописывать номер заявки, маршрут и дату погрузки!".($r->{'коммент'} ? "\n".$r->{'коммент'} : '')
    if $r->{"заказчик/id"} ~~ [16404, 16307];
  $r->{'коммент'} =  "Счет, акт выставлять на $r->{'грузоотправитель'}{title} (реквизиты во вложении),\nв счете прописывать номер заявки, маршрут и дату погрузки!".($r->{'коммент'} ? "\n".$r->{'коммент'} : '')
    if $r->{"грузоотправитель/id"} ~~ [16404, 16307];
  $r->{коммент} .= sprintf("\r\n", $r->{'посредник'}{'реквизиты'}{'коммент/транспорт'} ||  $r->{'перевозчик'}{'реквизиты'}{'коммент/транспорт'})
    if $r->{'посредник'}{'реквизиты'}{'коммент/транспорт'} ||  $r->{'перевозчик'}{'реквизиты'}{'коммент/транспорт'};# $r->{'посредник/id'} eq 1393 || $r->{'перевозчик/id'} eq 1393;
  
  $r->{route} = [($r->{"_откуда"}[0][0] && $r->{"_откуда"}[0][0] =~ /^#(\d+)/ ? 'г. Пермь' : $r->{"маршрут/откуда"}[0][0]), ($r->{"_куда"}[-1][0] && $r->{"_куда"}[-1][0] =~ /^#(\d+)/ ? 'г. Пермь' : $r->{"маршрут/куда"}[-1][0])];
  my $file = sprintf("ТЗ №%s %s %s", $r->{номер} || '#'.$r->{id}, $r->{перевозчик}{title} || '?нет перевозчика?', join('→', map {s/^\s*г[.\s]+//r} @{$r->{route}}));
  utf8::decode($file);#иначе эта строка байтовая
  $file =~ s!/!|!g;
  $r->{docx_out_file} = "static/tmp/".substr($file, 0, 120).".docx";#от $r->{'дата заявки формат'}  
  
  $r->{'водитель'} ||= [];
  $r->{'водитель-профиль'} ||=[];
  
  #~ my $contragent2=>$r->{'посредник/id'} ? :  $r->{заказчик},# грузополучатель
  my $director1 = $r->{'посредник/id'} ? ($r->{"директор1"} && $r->{"директор1"}[0]) : ($r->{'посредник'}{'реквизиты'} && $r->{'посредник'}{'реквизиты'}{'в лице'}); # в лице перевозчика
  my $contragent0_TopList = join '\n', map { ref $_->[1] ? $_->[0].join(', ', @{$_->[1]}) : $_->[0].$_->[1] } grep {$_->[1]} (['Почт. адрес: '=>$r->{'посредник'}{'реквизиты'}{'почт. адрес'},], ['тел./факс ', $r->{'посредник'}{'реквизиты'}{'тел'}], ['', $r->{'посредник'}{'реквизиты'}{'email'}]);
  
  #~ $self->app->log->error();
  my $template_file = sprintf("static/transport-ask%s.template.docx", ($r->{'посредник/id'} || $r->{заказчик}{id}) ~~ [qw(971 1393 16404 16307 ) ] ? ".".($r->{'посредник/id'} || $r->{заказчик}{id}) : "");
  my $sign_image = sprintf("static/i/logo/sign-%s.png", $r->{'посредник/id'} || $r->{заказчик}{id});
  
  $r->{python} = $self->dict->{'заявка.docx'}->render(#$self->sth('заявка.docx',
    docx_template_file=>$template_file, # "static/transport-ask.template.docx",#
    sign_image=>-f $sign_image && $sign_image,#подпись печать
    sign_id=>$r->{'посредник/id'} || $r->{заказчик}{id},# для размера картинки печати
    docx_out_file=>$r->{docx_out_file},
    #~ contragent3_top_details=>join(', ', map { " u'''$_''' " } grep {!/^\s*#/} ("", "Михаил",)), #@$top_details,
    contragent0_TopList => $contragent0_TopList, #join('\n', qw(авпкп выпавп ваыпварп)),
    contragent0_title=>$r->{'посредник'}{title},
    contragent3_name=>$r->{'посредник'}{title} || $r->{'заказчик'}{title},
    contragent3_title=>$r->{'посредник'}{title} || $r->{'заказчик'}{title},
    #~ contragent3_face=>($r->{'заказчик'}{'реквизиты'} && $r->{'заказчик'}{'реквизиты'}{'в лице'}) || '                                                      ',
    #~ contragent3_face_title=>($r->{'заказчик'}{'реквизиты'} && $r->{'заказчик'}{'реквизиты'}{'расшифровка подписи'}) || '                                                      ',
    contragent1_face_title=>$director1 || '                                                      ',
    contragent3_osn=>'Устава',
    contragent1_osn=>'Устава',
    $r->{'посредник'} && $r->{'посредник'}{'реквизиты'} ? (
      
      contragent0_INN=>$r->{'посредник'}{'реквизиты'}{'ИНН'},#$self->app->dumper($r->{'посредник'}), #
      contragent0_KPP=>$r->{'посредник'}{'реквизиты'}{'КПП'},
      contragent0_BIK=>$r->{'посредник'}{'реквизиты'}{'БИК'},
      contragent0_OGRN_Title => $r->{'посредник'}{'реквизиты'}{'ОГРНИП'} ? 'ОГРНИП' : 'ОГРН',
      contragent0_OGRNIP=> $r->{'посредник'}{'реквизиты'}{'ОГРНИП'},
      contragent0_OGRN=> $r->{'посредник'}{'реквизиты'}{'ОГРН'},
      contragent0_korr_schet=>$r->{'посредник'}{'реквизиты'}{'кор. счет'} || $r->{'посредник'}{'реквизиты'}{'корр. счет'},
      contragent0_ras_schet=>$r->{'посредник'}{'реквизиты'}{'расч. счет'},
      contragent0_bank=>$r->{'посредник'}{'реквизиты'}{'банк'},
      contragent0_ur_addr=>$r->{'посредник'}{'реквизиты'}{'юр. адрес'},
      contragent0_post_addr=>$r->{'посредник'}{'реквизиты'}{'почт. адрес'},
      contragent0_tel=>join(', ', @{ $r->{'посредник'}{'реквизиты'}{'тел'} || []}),
      contragent0_email=>join(', ', @{ $r->{'посредник'}{'реквизиты'}{'email'} || []}),
      contragent3_face=>$r->{'посредник'}{'реквизиты'}{'в лице'},
      contragent3_face_title=>$r->{'посредник'}{'реквизиты'}{'расшифровка подписи'} ||  '                                                      ',
      contragent3_osn=>$r->{'посредник'}{'реквизиты'}{'действует на основании'},
      contragent3_name=>$r->{'посредник'}{'реквизиты'}{'наименование'} || $r->{'посредник'}{title},
    ) : (),
    
    $r->{'посредник/id'} ? (
      
    ) : (
      contragent3_name=>$r->{заказчик}{title},
      contragent3_title=>$r->{заказчик}{title},
      contragent3_face=> $r->{'заказчик'}{'реквизиты'}{'в лице'} || '[?]',
      contragent3_face_title=>$r->{'заказчик'}{'реквизиты'}{'расшифровка подписи'} || '                                                      ',
      contragent3_osn=>$r->{'заказчик'}{'реквизиты'}{'действует на основании'} || 'Устава',
      contragent1_osn=>$r->{'посредник'} && $r->{'посредник'}{'реквизиты'} && $r->{'посредник'}{'реквизиты'}{'действует на основании'} || '[?]',
      contragent1_face_title=>$r->{'посредник'}{'реквизиты'}{'расшифровка подписи'} || $director1,
      #~ $r->{'посредник'} && $r->{'посредник'}{'реквизиты'}
        #~ ? (contragent1_face_title=>$r->{'посредник'}{'реквизиты'}{'расшифровка подписи'} ) : (),
    ),
    
    logo_image=>-f "static/i/logo/$r->{'посредник'}{id}.png" && "static/i/logo/$r->{'посредник'}{id}.png",# || (-f "static/i/logo/$r->{'посредник'}{id}.wmf" && "static/i/logo/$r->{'посредник'}{id}.wmf"),
    logo_image_big=>-f "static/i/logo/$r->{'посредник'}{id}-big.png" && "static/i/logo/$r->{'посредник'}{id}-big.png",#
    id=>$r->{id},
    num=>$r->{номер},
    bad_num=>$r->{номер} ? '' : '!НОМЕР ЗАЯВКИ?',
    date=>$r->{'дата заявки формат'},
    bad_date=>$r->{'дата заявки формат'} ? '' : '!ДАТА ЗАЯВКИ?',
    contragent1=>$r->{перевозчик}{title},
    contragent1_ati => $r->{"перевозчик"}{'АТИ'},
    bad_contragent1=>$r->{перевозчик}{title} ? '' : '!ПЕРЕВОЗЧИК?',
    director1=>$director1,
    bad_director1=>$director1  ? '' : '!ЛИЦО ПЕРЕВОЗЧИКА?',
    contact1=>($r->{"контакты"}[0] && $r->{"контакты"}[0][0]) // '',
    phone1=>($r->{"контакты"}[0] && $r->{"контакты"}[0][1]) // '',
    route=>join(' - ', @{$r->{route}}),
    gruz=>$r->{груз},
    contragent4 => $r->{грузоотправитель}{title},
    contact4=>($r->{"контакты грузоотправителей"}[0] && $r->{"контакты грузоотправителей"}[0][0]) // '',
    phone4=>($r->{"контакты грузоотправителей"}[0] && $r->{"контакты грузоотправителей"}[0][1]) // '',
    address1=>($r->{"_откуда"}[0][0] && $r->{"_откуда"}[0][0] =~ /^#(\d+)/ ? 'г. Пермь, ' : '') . join(', ', @{$r->{"маршрут/откуда"}[0]}),
    date1=>$r->{"дата1 краткий формат"},
    time1=>$r->{'время1'},
    
    contragent2=>$r->{заказчик}{title},# грузополучатель
    contact2=>($r->{"контакты заказчиков"}[0] && $r->{"контакты заказчиков"}[0][0]) // '',
    phone2=>($r->{"контакты заказчиков"}[0] && $r->{"контакты заказчиков"}[0][1]) // '',
    address2=>($r->{"_куда"}[-1][0] && $r->{"_куда"}[-1][0] =~ /^#(\d+)/ ? 'г. Пермь, ' : '') . join(', ', @{$r->{"маршрут/куда"}[-1]}),
    date2=>$r->{"дата3 краткий формат"},
    time2=>$r->{'время3'},
    
    
    money=>"$r->{сумма} ($r->{'сумма прописью'})$r->{'сумма прописью/коп'}@{[ $r->{'тип стоимости'} eq 1 ? ' за 1(один) час работы' : $r->{'тип стоимости'} eq 2 ? ' за 1(один) километр пробега' : '' ]}, @{[ $r->{'стоимость/с НДС'} ? 'в т.ч. НДС' : 'без НДС' ]}, по оригиналам ОТТН и бух.документов 3-5 б.д.\nДокументы подписать , печать, подпись, расшифровка",
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
