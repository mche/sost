package Controll::TMC;
use Mojo::Base 'Mojolicious::Controller';


has model => sub {shift->app->models->{'TMC'}};
has model_nomen => sub {shift->app->models->{'Nomen'}};

sub index {
  my $c = shift;
  #~ $c->index;
  return $c->render('tmc/index',
    handler=>'ep',
    'header-title' => 'Учет ТМЦ',
    assets=>["tmc/ask.js",],
    );
    #~ if $c->is_user_authenticated;
}

sub save_ask {
  my $c = shift;
  my $data = $c->req->json;
  
  my $tx_db = $c->model->dbh->begin;
  local $c->$_->{dbh} = $tx_db # временно переключить модели на транзакцию
    for grep $c->can($_),qw(model_nomen model);
  
  my $rc = $c->сохранить_номенклатуру($data->{"номенклатура"});
  return $c->render(json=>{error=>$rc})
    unless ref $rc;
  
  $rc = eval{$c->model->сохранить_заявку((map {($_=>$data->{$_})} grep {defined $data->{$_}} qw(id дата1 количество ед примечание объект)),
    "uid"=>$c->auth_user->{id},
    "номенклатура"=>$data->{"номенклатура"}{id},
    #~ "контрагент"=>$data->{"контрагент"} && ($data->{"контрагент"}{id} || $data->{"контрагент"}{new}{id}),
    )}
    or $c->app->log->error($@)
    and return $c->render(json=>{error=>"Ошибка: $@"});
  
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
    my $new= eval {$c->model_nomen->сохранить($_)}
      or $c->app->log->error($@)
      and return "Ошибка: $@";
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


sub list {
  my $c = shift;
  
  my $obj = $c->vars('object') || $c->vars('obj') # 0 - все проекты (для зп)
    // return $c->render(json => {error=>"Не указан объект"});
  
  my $param =  $c->req->json;
  
  my $data = eval{$c->model->список($obj, $param)}
    or $c->app->log->error($@)
    and return $c->render(json => {error=>"Ошибка: $@"});
  
  return $c->render(json => $data);
}

1;
