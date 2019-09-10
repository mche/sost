package Controll::Uploader;
use Mojo::Base 'Mojolicious::Controller';

has model => sub {shift->app->models->{'Uploader'}};

sub выгрузить_файл {# выгрузить файл
  my $c = shift;
  my $upload = $c->req->upload('file')
    or return $c->render(json=>{error=>'Нет файла'});
  $c->app->log->error($c->param('lastModified'));
  $c->render(json=>{success=>{"filename"=> $upload->filename, "content_type"=>$upload->headers->content_type, "size"=>$upload->size, "last_modified"=>$c->param('lastModified') || $c->param('last_modified')}});#currentChunkSize
}

1;