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
  my $parent_id = $c->param('parent_id') || $c->param('parentId') || 0;# папка
  #~ my @names = @{ Mojo::Path->new($c->param('relativePath')) };
  
  my $r;# результат
  
  if ($c->param('currentChunkSize') ne $c->param('totalSize')) {# 
    $upload->asset->move_to(sprintf("static/u/tmp/%s-%s-%s-%s", $uid, $upload_id, ('0' x (length($totalChunks)-length($chunkNumber))).$chunkNumber, $totalChunks));
    
    if ($chunkNumber eq $totalChunks) { # последний кусок
      $r = $c->_сохранить_файл($upload);
      system(sprintf("cat static/u/tmp/%s-%s-* > static/u/$parent_id/$r->{id}; rm static/u/tmp/%s-%s-*", ($uid, $upload_id) x 2))
        if $r && ref $r;
    }
    
  } else {# короткий файлик
    $r = $c->_сохранить_файл($upload);
    $upload->asset->move_to("static/u/$parent_id/$r->{id}")
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
  my $parent_id = $c->param('parent_id') || $c->param('parentId') || 0;
  if ($parent_id) {
    $c->model->связь($parent_id, $r->{id});
  }
  Mojo::File->new("static/u/$parent_id/")->make_path;
  return $r;
}

sub файлы {
  my $c = shift;
  #~ 
  my $r = $c->model->файлы( id1=>$c->stash('id1'), order_by=> ' ORDER BY array_length(f.names, 1)=1, f.names ' );
  $c->render(json=>$r); 
  
}

sub удалить_файлы {
  my $c = shift;
  my $data=$c->req->json;
  #~ $c->app->log->error($data);
  my @r;
  for my $r (@{$c->model->файлы( ids=>$data)}) {
    push @r, {error=>"Чужой файл @{[ $r->{names} ]}"}
      and next
      unless $r->{uid} eq $c->auth_user->{id};
    my $parent_dir = Mojo::File->new("static/u/$r->{parent_id}/$r->{id}")->remove->dirname;
    $parent_dir->remove_tree
      unless @{$parent_dir->list};
    #~ $c->model->удалить_файл($r->{id})
    $c->model->_удалить_строку($c->auth_user->{id},'файлы', $r->{id});
    push @r, {success=>$r->{id}};
  };
  $c->render(json=>\@r); 
}

sub файл_прикрепление {
  shift->_файл();
}

sub файл_инлайн {
  shift->_файл('inline');
}

sub _файл {
  my $c = shift;
  my $content_disposition = shift;
  my $sha1 = $c->stash('sha1')
    or die "Нет ид файла";
  my $r = $c->model->файлы( sha1=>$sha1)->[0]
    or die "Нет файла";
  
  #~ $c->log->error($c->dumper($r));
  
  $c->render_file(
    'filepath' => "static/u/$r->{parent_id}/$r->{id}",
    'filename' => $r->{names}[-1],
    #~ 'format'   => 'pdf',                 # will change Content-Type "application/x-download" to "application/pdf"
    content_type=>$r->{content_type},
    $content_disposition ? ('content_disposition' => $content_disposition) : (),   # will change Content-Disposition from "attachment" to "inline"
    #~ 'cleanup'  => 1,                     # delete file after completed
  );
}



1;