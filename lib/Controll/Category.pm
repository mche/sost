package Controll::Category;
use Mojo::Base 'Mojolicious::Controller';
#~ use Model::Waltex::Category;
#~ use Mojo::Home;
use Mojo::Util qw(steady_time);
use Mojo::Asset::File; # удалять файлы
use Mojo::JSON qw(encode_json);

=pod

=cut

my $home = Mojo::Home->new;
my $img_path;
my $asset_img = Mojo::Asset::File->new;

has static_dir => sub { shift->config('mojo_static_paths')->[0]; };
#~ has category_count => sub {$model->category_count};# hashref
has model => sub {shift->app->models->{'Category'}};

sub new {
  my $c = shift->SUPER::new(@_);
  #~ $img_path = $c->config('Категории')->{img_path};
  #~ $asset_img->path(sprintf("%s/%s%s/", $c->config('mojo_home'), $c->static_dir, $img_path, ));#$remove
  return $c;
}

sub tree0000 {
  my $c = shift;
  $c->render(
    handler=>'ep',
    title=>'Категории',
    #~ img_path=>$img_path,
    #~ data_save_url=>$c->url_for('сохранение дерева категорий и пиктограмм'),
    #~ data_url=>"/controllers/transport/category/tree.json",
    #~ template_url => "/controllers/transport/category/tree.html",
    #~ stylesheets=>["lib/angular-ui-tree/dist/angular-ui-tree.min.css", "/controllers/transport/category/tree.css",],
    #~ javascripts => [qw(/lib/ng-file-upload/ng-file-upload-all.min.js /lib/angular-ui-tree/dist/angular-ui-tree.min.js /controllers/transport/category/tree.js)],
    
    #~ stylesheets=>["/lib/angular-ui-tree/angular-ui-tree.min.css", "/controllers/transport/category/style.css"], в шаблоне перенес
  
  );#javascripts=>["/lib/ng-file-upload/ng-file-upload-all.min.js", ""],)
}

sub data {
  my $c = shift;
  
  my $parent = $c->vars('parent') || 3;
  
  #~ return $c->redirect_to($c->url_for($c->model->кэш())->query({_=>time()}))
  #~ return $c->redirect_to($c->model->кэш())
  return $c->render_file(
    'filepath' => $c->model->кэш(),
    'format'=>'json',
    'content_disposition' => 'inline',   # will change Content-Disposition from "attachment" to "inline"
  )
    if $parent eq 3;
  
  $c->render(json => {error=>"Не"});
}

sub save_tree000 {
  my $c = shift;
  if (my $tree = $c->req->json) {
    #~ $c->app->log->debug($c->dumper());
    my $parent = 3;
    
    my $pack = $c->model->pack_tree({id=>$parent, childs=>$tree});
    
    # <!-- файловая версия дерева категорий обновляется при изменениях -->
    my $file = Mojo::Asset::File->new;# Temporary file
    #~ $file->add_chunk($c->req->body)
    #~ $file->add_chunk(encode_json($pack->[0]))
    $file->add_chunk(encode_json $c->model->unpack_tree($parent) )
      ->move_to(sprintf("%s/%s/%s", $c->config('mojo_home'), $c->static_dir, "js/c/category/tree.json"));
    
    $file = Mojo::Asset::File->new;
    $file->add_chunk( encode_json $c->model->категории_для_поиска() )
      ->move_to(sprintf("%s/%s/%s", $c->config('mojo_home'), $c->static_dir, "js/c/category/search.json"));
    
    return $c->render(json=>$pack);
  }
  # картинка одной позиции
  elsif (my $img = $c->req->upload('img') ) {
    my $name = steady_time().".".$img->filename;
    if (my $remove = $c->req->param('remove_img')) {
      my $path = $asset_img->path;
      $asset_img->path($path."/".$remove)->move_to('/dev/null');
      $asset_img->path($path);
      #~ Mojo::Asset::File->new(path => sprintf("%s/%s%s/%s", $c->config('mojo_home'), $c->static_dir, $img_path, $remove));
    }
    $img->move_to(sprintf("%s/%s%s/%s", $c->config('mojo_home'), $c->static_dir, $img_path, $name));
    #~ my $dir = sprintf("/%s%s/%s", $c->static_dir, $img_path);
    $c->render(json=>{name=>$name,});#dir=>$img_path, 
  }
  
}








1;