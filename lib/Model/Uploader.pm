package Model::Uploader;
use Mojo::Base 'Model::Base';

our $DATA = ['Uploader.pm.dict.sql'];

#~ has model_obj => sub {shift->app->models->{'Object'}};
#~ has model_transport => sub {shift->app->models->{'Transport'}};
#~ has model_nomen => sub {shift->app->models->{'Nomen'}};

sub init {
  #~ state $self = shift->SUPER::new(@_);
  my $self = shift;
  #~ $self->{template_vars}{tables}{main} = $main_table;
  $self->dbh->do($self->sth('таблицы'));
  #~ $self->dbh->do($self->sth('функции'));
  return $self;
}

my $SAVE_EXPR = {
  "last_modified"=>'((?::bigint)/1000-2147483648::bigint)::int',# миллисек/1000 и запихать в int4
  "size"=>'(?::bigint-2147483648::bigint)::int',
};
sub сохранить_файл {
  my ($self, $data) = @_;
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, 'файлы', ["id"], $data, $SAVE_EXPR);
  $self->файлы(id=>$r->{id})->[0];
}

#~ sub файл {
  #~ my ($self, $id) = @_;
  #~ $self->dbh->selectrow_hashref($self->sth('файлы', where=>'WHERE f.id=?'), undef, $id);
#~ }

sub файлы {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  my ($where, @bind) = $self->SqlAb->where({
    #~ $param->{id1} ? (" f.id " => \["IN (select id2 from refs where id1=?)" => ($param->{id1})],) : (),
    $param->{id1} ? (" r.id1 " => $param->{id1}) : (),# parent_id
    $param->{id} ? (" f.id " => $param->{id}) : (),
    #~ $param->{ids} ? (' f.id ' => {' any(?) ' => \['', $param->{ids}]})
    $param->{ids} ? (" f.id " => \[" = any(?) " => ($param->{ids})],) : (),
    $param->{sha1} ? (" encode(digest(f.id::text||f.ts::text, 'sha1'),'hex') " => $param->{sha1}) : (),
    
  });
  
  $self->dbh->selectall_arrayref($self->sth('файлы', where=>$where, order_by=>$param->{order_by} || ' order by f."names" '), {Slice=>{}}, @bind);
}

sub переименовать_папку {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
   my ($where, @bind) = $self->SqlAb->where({
       ' array_length("names", 1) ' => { '>' => 1 },
       '"names"[1]' => $param->{'name'},
       " r.id1 " => $param->{parent_id},
      " f.id" => { '=' => \"r.id2" },
   });
  unshift @bind, [$param->{'edit'}]; # set
  $self->dbh->selectall_arrayref($self->sth('переименовать папку', where=>$where,), {Slice=>{}}, @bind);
}

sub переместить_в_папку {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
   my ($where, @bind) = $self->SqlAb->where({
      ' f.id ' => \[ ' = any(?) ', $param->{'@id'} ],
      #~ " f.id" => { '=' => \"r.id2" },
   });
  unshift @bind, [$param->{'edit'} eq '' ? () : ($param->{'edit'})]; # set
  $self->dbh->selectall_arrayref($self->sth('переименовать папку', where=>$where,), {Slice=>{}}, @bind);
}

sub переименовать_файл {
  my $self = shift;
  my $file = ref $_[0] ? shift : {@_};
  $self->обновить_или_вставить($self->{template_vars}{schema}, 'файлы', ["id"], $file);
}

sub _удалить_файлы {
  my ($self, $ids, $uid) = @_;
  my @r;
  for my $r (@{$self->файлы( ids=>$ids)}) {
    push @r, {error=>"Чужой файл @{[ $r->{names} ]}"}
      and next
      unless $r->{uid} eq $uid;
    $r->{parent_id} ||= 0;
    my $parent_dir = Mojo::File->new("static/u/$r->{parent_id}/$r->{id}")->remove->dirname;
    $parent_dir->remove_tree
      unless @{$parent_dir->list};
    #~ $c->model->удалить_файл($r->{id})
    $self->_удалить_строку('файлы', $r->{id});
    push @r, {success=>$r->{id}};
  };
  return \@r;
}

1;