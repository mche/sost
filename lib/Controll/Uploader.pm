package Controll::Uploader;
use Mojo::Base 'Mojolicious::Controller';

has model => sub {shift->app->models->{'Uploader'}};

sub выгрузить_файл {# выгрузить файл
  my $c = shift;
  my $upload = $c->req->upload('file')
    or return $c->render(json=>{error=>'Нет файла'});
  #~ 
  
  #~ my $path = Mojo::File->new("static/u/1234445/".$c->param('relativePath'));
  #~ my $dir = Mojo::File->new($path->dirname)->make_path;
  
  #~ $c->app->log->error("@$path") 
    #~ if ;
  
  my $uid = $c->auth_user->{id};
  my $upload_id = $c->param('identifier');
  my $totalChunks = $c->param('totalChunks');
  my $chunkNumber = $c->param('chunkNumber');
  #~ my @names = @{ Mojo::Path->new($c->param('relativePath')) };
  
  my $r;# результат
  
  if ($c->param('currentChunkSize') ne $c->param('totalSize')) {# 
    $upload->asset->move_to(sprintf("static/u/tmp/%s-%s-%s-%s", $uid, $upload_id, ('0' x (length($totalChunks)-length($chunkNumber))).$chunkNumber, $totalChunks));
    
    if ($chunkNumber eq $totalChunks) { # последний кусок
      $r = $c->_сохранить_файл($upload);
      system(sprintf("cat static/u/tmp/%s-%s-* > static/u/$r->{id}; rm static/u/tmp/%s-%s-*", ($uid, $upload_id) x 2))
        if $r && ref $r;
    }
    
  } else {# короткий файлик
    $r = $c->_сохранить_файл($upload);
    $upload->asset->move_to("static/u/$r->{id}")
      if $r && ref $r;
  }
  #~ $c->render(json=>{success=>{"filename"=> $upload->filename, "content_type"=>$upload->headers->content_type, "size"=>$upload->size, "last_modified"=>$c->param('lastModified') || $c->param('last_modified'), "identifier"=>$c->param('identifier')}});
  $c->render(json=> $r && ref $r ? {success=>$r} : {error=>$r || "Ошибка сохранения файла"});
}

sub _сохранить_файл {
  my ($c, $upload) = @_;
  my $uid = $c->auth_user->{id};
  my @names = @{ Mojo::Path->new($c->param('relativePath')) };
  my $r = $c->model->сохранить_файл({
    "uid"=>$uid,
    "names"=>\@names,
    "last_modified"=> $c->param('lastModified') || $c->param('last_modified'),# миллисек
    "size"=>$c->param('totalSize'), # || $upload->size,
    "content_type"=>$upload->headers->content_type,
  });
  if (my $parent_id = $c->param('parent_id') || $c->param('parentId')) {
    $c->model->связь($parent_id, $r->{id});
  }
  return $r;
}

sub файлы {
  my $c = shift;
  #~ $c->app->log->error($c->stash('id1'));
  my $r = $c->model->файлы( id1=>$c->stash('id1'), order_by=> ' ORDER BY array_length(names, 1)=1, names ' );
  $c->render(json=>$r); 
  
}

1;