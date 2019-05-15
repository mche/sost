package Model::Nomen;
use Mojo::Base 'Model::Base';
#~ use Mojo::Util qw(dumper);

our $DATA = ['Nomen.pm.dict.sql'];
#~ has sth_cached => 1;

#~ has [qw(app)];

sub init {
  #~ state $self = shift->SUPER::new(@_);
  my $self = shift;
  #~ $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  $self->dbh->do($self->sth('таблицы'));
  $self->dbh->do($self->sth('функции'));
  #~ return $self;
}

sub список {
  my ($self, $root, $param) = (shift, shift, ref $_[0] ? shift : {@_},);
  $self->dbh->selectall_arrayref($self->sth('список', select=>$param->{select} || '*',), {Slice=>{}}, ($root) x 2);
}

sub позиция {
  my ($self, $id) = @_;
  my ($where, @bind) = $self->SqlAb->where({
    'id'=>$id,
  });
  $self->dbh->selectrow_hashref($self->sth('позиция', where=>$where), undef, @bind);
  
}

sub список_без_потомков {
  my ($self, $root, $param) = (shift, shift, ref $_[0] ? shift : {@_},);
  $self->dbh->selectall_arrayref($self->sth('список', select=>$param->{select} || '*', where=>' and c.childs is null '), {Slice=>{}}, ($root) x 2);
}

sub сохранить_номенклатуру {
  my ($self, $nom) = @_;
  my @new = grep $_->{title}, @{$nom->{newItems} || []};
  
  return "нет наименования номенклатуры"
    unless ($nom->{selectedItem} && $nom->{selectedItem}{id}) || @new;
  
  $nom->{id} = $nom->{selectedItem}{id}
    and return $nom
    if !@new;
  
  my $parent = ($nom->{selectedItem} && $nom->{selectedItem}{id}) || ($nom->{topParent} && $nom->{topParent}{id});
  
  #~ $nom->{selectedItem} = $self->проверить_путь($parent, [map $_->{title}, @new])
    #~ and $nom->{id} = $nom->{selectedItem}{id}
    #~ and return $nom;
    #~ unless $parent;
  
  #~ my @pathID = (($nom->{selectedItem} && $nom->{selectedItem}{id}) || ());
  
  for (@new) {
    $_->{parent} = $parent;# и для проверки
    my $new= eval {$self->сохранить($_)};# || $@;
    $self->app->log->error($@)
      and return "Ошибка: $@"
      unless ref $new;
    $parent = $new->{id};
    #~ push @pathID, $new->{id};
    #~ push @{$nom->{selectedPath} ||= []}, $new;
    $nom->{selectedItem} = $new;
    #~ push @{$nom->{newItems}}, $new;# для проверки и кэшировагния
  }
  
  #~ $nom->{selectedItem} = $nom->{selectedPath}[-1]
    #~ if @new;
    #~ unless $nom->{selectedItem} && $nom->{selectedItem}{id};
  
  
  
  $nom->{id} = $nom->{selectedItem}{id};
  return $nom;
  
}

sub сохранить {
  my ($self, $data) = @_;
  $data->{title} =~ s/^\s+|\s+$//g;
  $data->{title} =~ s/\s{2,}/ /g;
  my $r = $self->dbh->selectrow_hashref($self->sth('проверить'), undef, @$data{qw(parent title)})
    if $data->{parent};
  return $r
    if $r;
  
  my $n = $self->вставить_или_обновить($self->{template_vars}{schema}, "номенклатура", ["id"], $data, {'tilte'=>q[ regexp_replace(regexp_replace(?, '\s{2,}', ' ', 'g'),'^\s+|\s+$','', 'g') ]});
  $self->связь($data->{parent}, $n->{id})
    if $data->{parent};
  return $n;
  
}

sub проверить_путь {# новый путь
  my ($self, $parent, $path) = @_;   #   массив новых
  
  $self->dbh->selectrow_hashref($self->sth('проверить путь'), undef, ($parent) x 4, $path);
  
}

sub полное_наименование {
  my ($self, $nom) = @_;
  my $selectedItem = $self->позиция($nom->{id} || $nom->{selectedItem}{id})
    if $nom->{id} || ($nom->{selectedItem} && $nom->{selectedItem}{id});
  $selectedItem ||= $nom->{selectedItem};
  return [
    $selectedItem ? grep(!!$_, @{$selectedItem->{parents_title} || []}, $selectedItem->{title}) : (),
    map($_->{title}, grep($_->{title}, @{$nom->{newItems} || []}))
  ];
}

sub удалить_концы {
  my ($self) = @_;
  1 while scalar @{$self->dbh->selectrow_array($self->sth('удалить концы'), undef, (undef))};
}

#~ sub это_инструмент {
  #~ my ($self, $nom) = @_;
  #~ my $selectedItem = $nom->{selectedItem};
  #~ return $selectedItem && ($selectedItem->{id} eq 154997 ||($selectedItem->{parents_id} && $selectedItem->{parents_id}[0] eq 154997));
   
#~ }

sub переместить_позицию {
  my ($self, $data) = @_;
  return " не указаны ид1 & ид2! "
    unless $data->{id1} && $data->{id2};
  $self->dbh->selectrow_hashref($self->sth('переместить позицию'), undef, ($data->{id1}, $data->{id2}));
}
1;

__DATA__
