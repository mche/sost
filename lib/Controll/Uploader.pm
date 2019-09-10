package Controll::Uploader;
use Mojo::Base 'Mojolicious::Controller';

sub выгрузить_файл {# выгрузить файл
  my $c = shift;
  my $upload = $c->req->upload('file')
    or return $c->render(json=>{error=>'Нет файла'});
  $c->app->log->error($c->param('lastModified'));
  $c->render(json=>{success=>{"filename"=> $upload->filename, "content_type"=>$upload->headers->content_type, "size"=>$upload->size, "lastModified"=>$c->param('lastModified')}});
}

1;