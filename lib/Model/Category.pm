package Model::Category;
use Mojo::Base 'Model::Base';
use Clone 'clone';
use Mojo::Asset::File; # файлы
use Mojo::JSON qw(encode_json);
use Mojo::Util qw(dumper);

our $DATA = ['Category.pm.dict.sql'];
#~ has sth_cached => 1;
my $main_table ="категории";

#~ has qw(app);

has static_dir => sub { shift->app->config('mojo_static_paths')->[0]; };

sub new {
  #~ state 
  my $self = shift->SUPER::new(@_);
  $self->{template_vars}{tables}{main} = $main_table;
  return $self;
}

sub init {
  my $self= shift;
  $self->dbh->do($self->sth('таблицы'));
  $self->dbh->do($self->sth('функции'));
  
}

sub список {
  my ($self, $root, $param) = (shift, shift, ref $_[0] ? shift : {@_},);
  $self->dbh->selectall_arrayref($self->sth('список', select => $param->{select} || '*', ), {Slice=>{}}, ($root) x 2);
}

sub категории_транспорта {
  my ($self, $root, $param) = (shift, shift, ref $_[0] ? shift : {@_},);
  $self->dbh->selectall_arrayref($self->sth('категории транспорта', select => $param->{select} || '*', ), {Slice=>{}}, ($root) x 2);
}


sub expand_node {
  my ($self, $parent_id) = @_;
  return $self->dbh->selectall_arrayref($self->sth('узлы родителя'), {Slice=>{}}, $parent_id);
  
}

#~ sub category_count {
  #~ my ($self) = @_;
  #~ return $self->dbh->selectall_hashref($self->sth('количество категорий'), 'id',);
#~ }

sub сохранить_категорию {
  my ($self, $cat) = @_;
  my @new_category = grep $_->{title}, @{$cat->{newItems} || []};
  
  $cat->{newItems} = [];# сбросить обязательно для кэша
  
  return "нет категории"
    unless ($cat->{selectedItem} && $cat->{selectedItem}{id}) || @new_category;
  
  my $parent = ( $cat->{selectedItem} && $cat->{selectedItem}{id} ) 
    // ( $cat->{topParent} && $cat->{topParent}{id} )
    // 3;
  
  for (@new_category) {
    $_->{parent} = $parent;# для проверки
    my $new= eval {$self->_сохранить_категорию($_)};# || $@;
    $new = $@
      if $@;
    $self->app->log->error($new)
      and return "Ошибка категории: $new"
      unless ref $new;
    $parent = $new->{id};
    #~ push @{$cat->{selectedPath} ||= []}, $new;
    push @{$cat->{newItems}}, $new;# для проверки и кэшировагния
  }
  
  $cat->{selectedItem} = $cat->{newItems}[-1]
    if @new_category;
    #~ unless $cat->{selectedItem} && $cat->{selectedItem}{id};
  
  $cat->{id} = $cat->{selectedItem}{id};
  
  #~ $c->model_category->кэш($c, 3) !!! тошлько после успешной транз!
    #~ if @new_category;
  
  
  return $cat;
  
}

sub _сохранить_категорию {
  my ($self, $hashref) = @_;
  $hashref->{title} =~ s/^\s+|\s+$//g;
  $hashref->{title} =~ s/\s{2,}/ /g;
  return "Нет наименования категории"
    unless $hashref->{title};
  return "Нет родителя категории"
    unless $hashref->{parent};
  
  my $r = $self->dbh->selectrow_hashref($self->sth('проверить категорию'), undef, @$hashref{qw(parent title)});
   #~ die "Такая категория [$hashref->{parent}][$hashref->{title}] уже есть "
    #~ if @$r;
  return $r
    if $r;
  
  my $nc = $self->вставить_или_обновить($self->{template_vars}{schema}, $main_table, ["id"], $hashref);
  $self->связь($hashref->{parent}, $nc->{id});
  return $nc;
  
}

sub индексный_путь_категории {
  my ($self, $category_id) = @_;
  $self->dbh->selectrow_array($self->sth('индексный путь категории'), undef, $category_id);
}

sub родители_категории {
  my ($self, $category_id) = @_;
  $self->dbh->selectall_arrayref($self->sth('категории/родители узла'), { Slice=> {} }, ($category_id) x 1);
}

sub категории_для_поиска {
  my ($self,) = @_;
  my $r = $self->dbh->selectall_hashref($self->sth('категории для поиска'), 'id',);
  #~ return $r;
  map {
    my $row = $_;
    $row->{selectedPath} = [];
    map {
      #~ my %copy = %{};
      push @{$row->{selectedPath}}, clone($r->{$_});
    } @{$_->{parents_id}};
  } values %$r;
  return [ map {$r->{$_}} sort {$r->{$a}{'#'} <=> $r->{$b}{'#'} } keys %$r ];
}

sub дерево_и_поиск {
  my ($self, $parent) = @_;# $parent - корень ид
  
  return {
    tree=>$self->unpack_tree($parent),
    search=>$self->категории_для_поиска($parent),
    
  };
  
};


sub кэш {# дерево и поиск
  my ($self, $parent) = @_;# $parent - корень ид
  
  my $cache_path = sprintf("%s/%s/%s", $self->app->config('mojo_home'), $self->static_dir, "js/c/category/tree+search.json");# : "/js/c/category/tree+search.json";
  
  return $cache_path # без корня вернем путь к файлу кэша
    unless defined $parent;
  #~ $parent ||= 3;
  
  my $data = $self->дерево_и_поиск($parent);
  
  my $file = Mojo::Asset::File->new;# Temporary file
  $file->add_chunk(encode_json  $data)
    ->move_to($cache_path);
}

sub unpack_tree {# рекурсивно распаковать список таблицы дерева в иерархию дерева
  my ($self, $node_id, $count) = @_;# count флажок количеств единиц в категориях
  my $childs = $self->expand_node($node_id);
  for my $child (@$childs) {
    $child->{_count} = $self->category_count->{$child->{id}}{count} // 0
      if $count;
    delete $child->{ts};
    $child->{_childs_ids} = delete $child->{childs}; # просто массив индексов потомков
    $child->{_img_url} = $child->{img} #$img_path . '/' . 
      if $child->{img};
    $child->{childs} = $self->unpack_tree($child->{id}, $count);
  }
  return $childs;
}


sub pack_tree {# рекурсивно упаковать структуру дерева в список таблицы
  my $self = shift;
  my ($parent, $childs) = @_; #@childs
  $childs ||= $parent->{childs};
  #~ $parent = $model->категория($parent)
    #~ unless ref $parent;
  #~ $parent->{childs} = \@childs;
  my $ret = [];# возвратить список сохраненых узлов
  while ( my $child = shift @$childs ) {
    my $childs = delete $child->{childs};
    #~ $child->{childs} = [];# теперь тут иды
    #~ for (@$childs) {
      #~ $_->{id} ||= $self->sequence_next_val($self->{template_vars}{sequence});
      #~ push @{$child->{childs}}, $_->{id};
    #~ }
    #~ $child->{parent} = $parent->{id};
    #~ if ($child->{img} && !$child->{_img_url}) {# покинуть картинку
      #~ my $path = $asset_img->path;
      #~ $asset_img->path($path."/".$child->{img})->move_to('/dev/null');
      #~ $asset_img->path($path);
      #~ $child->{img} = undef;
    #~ }
    my $skip_data = {};
    $skip_data->{$_} = delete $child->{$_} for grep /^_/ || ! defined $child->{$_} , keys %$child;
    #~ $c->app->log->debug($c->dumper($child));
    my $node =  $self->_сохранить_категорию($child);# 
    #~ $child->{_childs} = delete $child->{childs};
    #~ $child->{childs} = $childs;
    push @$ret, $node, @{$self->pack_tree($node, $childs)};
  }
  return $ret;
}

1;

__DATA__
