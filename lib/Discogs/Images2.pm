package Discogs::Images2;
use Mojo::Base 'Discogs::Base';
use Mojo::UA::Che;
use Mojolicious::Plugin::Config;

=pod

https://www.discogs.com/Nana-Mouskouri-All%C3%A9luia/release/8232235 сломана первая картинка (не jpeg)

=cut

has ua_che => sub {
  my $self = shift;
  #~ Mojo::UA::Che->new($self->proxy ? (proxy=>$self->proxy) : (), proxy_module_has=>{config_file=>$self->proxy_config_file}, debug=>1, );
  Mojo::UA::Che->new(%{Mojolicious::Plugin::Config->new->load($self->proxy_config_file)}, cookie_ignore => 1, res_success=>qr/404|500|503/,);
};#proxy_module_has=>{max_try=>3}, debug=>1,)};

has qw(delay) => sub {
  my $delay = Mojo::IOLoop->delay;
  return $delay;
  $delay->on(error => sub {
    my ($delay, $err) = @_;
    die $err;
  });
};

has img_css => 'div#view_images > p img';# CSS selector
has sth => sub {shift->model->sth('картинки релизов по годам', select=>'r.*, discogs.release_img_hmac_sha1_hex_path(r.id::text) as img_dir  ', limit => ' limit ? ') };# r.id, r.master_id,  r.title as release_title, m.aid as master_aid, m.title as master_title,

sub count_year {
  my $self = shift;
  #~ $self->model->dbh->do($self->model->sth('reset release img_done'), undef, ($self->year));
  say %{ $self->model->count_release_year_img($self->year)};
}

sub process_year {
  my $self = shift;
  #~ my @ua;
  #~ push @ua, $self->ua_che->dequeue for 1..$self->limit;
  $self->model->dbh->do($self->model->sth('reset release img_done'), undef, ($self->year));
  my $row = $self->model->dbh->selectrow_hashref($self->sth, undef, ($self->year, 1));
  #~ while (!$self->count || $self->count > $self->limit) {
    $self->count(0);
    #~ $self->release_images() for 1..1;# не тут лимит!
  while ($row) {
    $self->count($self->count + 1);
    $self->release_images($row);
    my $next_row;
    my $end = $self->delay->begin;
    $self->model->dbh->select($self->sth, undef, ($self->year, 1), sub {
      my ($db, $err, $res) = @_;
      die $err if $err;
      $next_row = $res->fetchrow_hashref;
      say "След. релиз получен.";
      return $end->();
    });
    $self->delay->wait;
    $row = $next_row;
    #~ say "---- END WHILE ---- count ", $self->count, ' limit ', $self->limit;
  }
  #~ $self->ua_che->enqueue(@ua);
  $self->count;

}

# страница релиза
sub release_images {# limit -  последовательно скачает пачку страниц картинок, а картинки запустит асинхронно! не ставь большие лимиты
  my ($self, $row)= @_;
  
    #~ unless $row;
  #~ $row ||= ($self->count <= $self->limit) && $self->model->dbh->selectrow_hashref($self->sth, undef, ($self->year, 1))
    #~ or return;
    #~ or say "Отсечка выполнения релизных страниц, но ждет завершения закачек файлов"
    #~ and return;
  
  $row->{release_title} ||= $row->{title} ||= 'Bloonderbuss';
  my $title = $row->{release_title} =~ s/\W+/-/gr;
  my $url = $self->base_url."/release/$row->{id}-$title/images";
  
  say "Релиз [$url]...";
  my $end = $self->delay->begin;
  $self->ua_che->get( $url => sub {
    my ($ua, $tx) = @_;
    my $res = $self->ua_che->process_tx($tx);
    unless  (ref $res) {
      if ($res =~ /404/) {
        $row->{img_urls} = ['404'];
        $self->model->done_release_img($row);
        #~ $self->release_images();
        return $end->();
      }
      die "[$url] ... $res";
      #~ $self->release_images($row);
      #~ return $end->();
    }
    my $dom = $res->dom;
    push @{$row->{img_urls} = []}, $dom->find($self->img_css)->map(sub {$_->attr('src')})->each #
      or say "\tрелиз [$row->{id}] не нашел картинок"
      and $self->model->done_release_img($row )
      #~ and $self->release_images()
      and return $end->();
    
    $row->{dir} = $self->base_covers_dir.'/'.$row->{img_dir};
    system("mkdir -p $row->{dir}");
    die "Не смог создать папку[$row->{dir}]: [$?] [$!]"
      unless $? == 0;
    $row->{img_fails} = [];
    $row->{_img_n} = [0..$#{$row->{img_urls}}];
    #~ say "Номера файлов [$row->{id}]: @{$row->{_img_n}}";
    #~ $row->{img_urls}[$_-1] && push @ua, $self->ua_che->dequeue for 1..$self->limit;
    #~ $row->{_delay} = Mojo::IOLoop->delay;

    $self->img_file($row,) for 1..1;
      
    #~ $self->release_images();
    return $end->();
  });
}

sub img_file {
  my ($self, $row, $n)= @_;
  unless ($n) {
    $n = shift @{$row->{_img_n}}; # 0!
    $self->model->done_release_img($row)
      and say "\t=== Картинки релиза [$row->{id}] завершены ==="
      and return #$self->delay->pass
      unless defined $n;
    $n++;
  }
  my $src = $row->{img_urls}[$n-1];
  my $path = "$row->{dir}/$n.jpg";
    
  #~ say "Уже есть такой файл" if -f $path && -s $path;
  my $end = $self->delay->begin;
  #~ say "\tКартинка [$row->{id}][$n] ...";
  $self->ua_che->get($src, sub {
    my ($ua, $tx) = @_;
    my $res = $self->ua_che->process_tx($tx);
    unless  (ref $res) {
      if ($res =~ $self->ua_che->res_success) {
        $row->{img_fails}[$n-1] = $res;
        say "\tКартинка [$row->{id}][$n] ... $res";#[$src[$n-1]]
        $self->img_file($row);
        return $end->();
      }
      say "\t??? Снова картинка [$row->{id}][$n] ... $res";
      $self->img_file($row, $n);
      return $end->();
    }
    my $size = $res->content->asset->size;
    $res->content->asset->move_to($path);
    
    say "\tКартинка [$row->{id}][$n] >>> [$path][$size] ... OK";
    $self->img_file($row,);
    return $end->();
  });
}


#~ sub enc_dir {# 
  #~ my ($sub, $m_aid, $r_aid) = @_;
  #~ return join "/", &Discogs::Images::enc_split($sub, $m_aid), $m_aid, $r_aid #
    #~ if $m_aid;
  
  #~ return join "/", "nomaster", &Discogs::Images::enc_split($sub, $r_aid),$r_aid;#
#~ }

#~ sub enc_split {
  #~ my $sub = shift;
  #~ my $val = &{\&{ $sub }}( shift() );
  #~ map uc($_ // 0), ($val =~ /(\w?)(\w{2})[=]*$/);
#~ }

#~ sub b64 { (encode_base64 shift) =~ s/\W//gr;}

#~ sub hmac { (hmac_sha1_base64 shift, 'blunderbuss') =~ s/\W//gr;}

#  SELECT encode(digest('113923599'::text, 'sha1'), 'base64')
#~ SELECT encode(hmac('113923599'::text, 'blunderbuss'::text, 'sha1'), 'base64')
#~ SELECT regexp_matches(regexp_replace(encode(hmac('113923599'::text, 'blunderbuss'::text, 'sha1'), 'base64'), '\W+', '', 'g'), '(\w)(\w{3})(\w+)');

# SELECT regexp_matches(encode(hmac('1'::text, 'blunderbuss'::text, 'sha1'), 'hex'), '(\w)(\w{2})(\w{3})(\w+)');

1;

__END__
DELETE FROM releases_img_done
WHERE ctid IN (
  select a[1] as ctid
  from (
    SELECT aid, array_agg(ctid) as a
    FROM releases_img_done
    group by aid
    having count(*)>1
    -- ORDER BY aid
   -- LIMIT 1
) a);

 alter table releases_img_done add column release_id int unique;


update releases_img_done set release_id=unnest(regexp_matches(img[1], '/discogs-images/R-(\d+)'))::int where img <> array[]::text[];
UPDATE 587978

vinylhub=# select count(*) from releases_img_done where img=array[]::text[];
 count 
-------
 72824

vinylhub=# delete from releases_img_done where img=array[]::text[];
DELETE 72824


CREATE OR REPLACE FUNCTION discogs.release_img_hmac_sha1_hex_path(text) returns text AS $$
    SELECT array_to_string(regexp_matches(encode(hmac($1, 'blunderbuss'::text, 'sha1'), 'hex'), '(\w)(\w{2})(\w{3})(\w+)'), '/', '0');
$$ LANGUAGE SQL STRICT IMMUTABLE;

package Discogs::Images2;
use Mojo::Base 'Discogs::Base';
use Mojo::UA::Che;
use Mojolicious::Plugin::Config;

=pod

https://www.discogs.com/Nana-Mouskouri-All%C3%A9luia/release/8232235 сломана первая картинка (не jpeg)

=cut

has ua_che => sub {
  my $self = shift;
  #~ Mojo::UA::Che->new($self->proxy ? (proxy=>$self->proxy) : (), proxy_module_has=>{config_file=>$self->proxy_config_file}, debug=>1, );
  Mojo::UA::Che->new(%{Mojolicious::Plugin::Config->new->load($self->proxy_config_file)}, cookie_ignore => 1, res_success=>qr/404|500/,);
};#proxy_module_has=>{max_try=>3}, debug=>1,)};

has qw(delay) => sub {
  my $delay = Mojo::IOLoop->delay;
  return $delay;
  $delay->on(error => sub {
    my ($delay, $err) = @_;
    die $err;
  });
};

has img_css => 'div#view_images > p img';# CSS selector
has sth => sub {shift->model->sth('картинки релизов по годам', select=>'r.*, discogs.release_img_hmac_sha1_hex_path(r.id::text) as img_dir  ', limit => ' limit ? ') };# r.id, r.master_id,  r.title as release_title, m.aid as master_aid, m.title as master_title,

sub count_year {
  my $self = shift;
  say %{ $self->model->count_release_year_img($self->year)};
}

sub process_year {
  my $self = shift;
  #~ my @ua;
  #~ push @ua, $self->ua_che->dequeue for 1..$self->limit;
  $self->model->dbh->do($self->model->sth('reset release img_done'), undef, ($self->year));
  my $row = $self->model->dbh->selectrow_hashref($self->sth, undef, ($self->year, 1));
  #~ while (!$self->count || $self->count > $self->limit) {
    $self->count(0);
    #~ $self->release_images() for 1..1;# не тут лимит!
  while ($row) {
    $self->release_images($row);
    my $next_row;
    my $end = $self->delay->begin;
    $self->model->dbh->select($self->sth, undef, ($self->year, 1), sub {
      my ($db, $err, $res) = @_;
      die $err if $err;
      $next_row = $res->fetchrow_hashref;
      #~ say "След. релиз получен.";
      return $end->();
    });
    $self->delay->wait;
    $row = $next_row;
    #~ say "---- END WHILE ---- count ", $self->count, ' limit ', $self->limit;
  }
  #~ $self->ua_che->enqueue(@ua);
  $self->count;

}

# страница релиза
sub release_images {# limit -  последовательно скачает пачку страниц картинок, а картинки запустит асинхронно! не ставь большие лимиты
  my ($self, $row)= @_;
  $self->count($self->count + 1);
    #~ unless $row;
  #~ $row ||= ($self->count <= $self->limit) && $self->model->dbh->selectrow_hashref($self->sth, undef, ($self->year, 1))
    #~ or return;
    #~ or say "Отсечка выполнения релизных страниц, но ждет завершения закачек файлов"
    #~ and return;
  
  $row->{release_title} ||= $row->{title} ||= 'Bloonderbuss';
  my $title = $row->{release_title} =~ s/\W+/-/gr;
  my $url = $self->base_url."/release/$row->{id}-$title/images";
  
  say "Релиз [$url]...";
  my $end = $self->delay->begin;
  $self->ua_che->get( $url => sub {
    my ($ua, $tx) = @_;
    my $res = $self->ua_che->process_tx($tx);
    unless  (ref $res) {
      if ($res =~ /404/) {
        $row->{img_urls} = ['404'];
        $self->model->done_release_img($row);
        #~ $self->release_images();
        return $end->();
      }
      die "[$url] ... $res";
      #~ $self->release_images($row);
      #~ return $end->();
    }
    my $dom = $res->dom;
    push @{$row->{img_urls} = []}, $dom->find($self->img_css)->map(sub {$_->attr('src')})->each #
      or say "\tрелиз [$row->{id}] не нашел картинок"
      and $self->model->done_release_img($row )
      #~ and $self->release_images()
      and return $end->();
    
    $row->{dir} = $self->base_covers_dir.'/'.$row->{img_dir};
    system("mkdir -p $row->{dir}");
    die "Не смог создать папку[$row->{dir}]: [$?] [$!]"
      unless $? == 0;
    $row->{img_fails} = [];
    $row->{_img_n} = [0..$#{$row->{img_urls}}];
    #~ say "Номера файлов [$row->{id}]: @{$row->{_img_n}}";
    #~ $row->{img_urls}[$_-1] && push @ua, $self->ua_che->dequeue for 1..$self->limit;
    #~ $row->{_delay} = Mojo::IOLoop->delay;

    $self->img_file($row,) for 1..1;
      
    #~ $self->release_images();
    return $end->();
  });
}

sub img_file {
  my ($self, $row, $n)= @_;
  unless ($n) {
    $n = shift @{$row->{_img_n}};
    say "\t=== Картинки релиза [$row->{id}] завершены ==="
      and $self->model->done_release_img($row)
      and return #$self->delay->pass
      unless defined $n;
    $n++;
  }
  my $src = $row->{img_urls}[$n-1];
  my $path = "$row->{dir}/$n.jpg";
    
  #~ say "Уже есть такой файл" if -f $path && -s $path;
  my $end = $self->delay->begin;
  #~ say "\tКартинка [$row->{id}][$n] ...";
  $self->ua_che->get($src, sub {
    my ($ua, $tx) = @_;
    my $res = $self->ua_che->process_tx($tx);
    unless  (ref $res) {
      if ($res =~ $self->ua_che->res_success) {
        $row->{img_fails}[$n-1] = $res;
        say "\tКартинка [$row->{id}][$n] ... $res";#[$src[$n-1]]
        $self->img_file($row);
        return $end->();
      }
      say "\t??? Снова картинка [$row->{id}][$n] ... $res";
      $self->img_file($row, $n);
      return $end->();
    }
    $res->content->asset->move_to($path);
    my $size = $res->content->asset->size;
    say "\tКартинка [$row->{id}][$n] >>> [$path][$size] ... OK";
    $self->img_file($row,);
    return $end->();
  });
}


#~ sub enc_dir {# 
  #~ my ($sub, $m_aid, $r_aid) = @_;
  #~ return join "/", &Discogs::Images::enc_split($sub, $m_aid), $m_aid, $r_aid #
    #~ if $m_aid;
  
  #~ return join "/", "nomaster", &Discogs::Images::enc_split($sub, $r_aid),$r_aid;#
#~ }

#~ sub enc_split {
  #~ my $sub = shift;
  #~ my $val = &{\&{ $sub }}( shift() );
  #~ map uc($_ // 0), ($val =~ /(\w?)(\w{2})[=]*$/);
#~ }

#~ sub b64 { (encode_base64 shift) =~ s/\W//gr;}

#~ sub hmac { (hmac_sha1_base64 shift, 'blunderbuss') =~ s/\W//gr;}

#  SELECT encode(digest('113923599'::text, 'sha1'), 'base64')
#~ SELECT encode(hmac('113923599'::text, 'blunderbuss'::text, 'sha1'), 'base64')
#~ SELECT regexp_matches(regexp_replace(encode(hmac('113923599'::text, 'blunderbuss'::text, 'sha1'), 'base64'), '\W+', '', 'g'), '(\w)(\w{3})(\w+)');

# SELECT regexp_matches(encode(hmac('1'::text, 'blunderbuss'::text, 'sha1'), 'hex'), '(\w)(\w{2})(\w{3})(\w+)');

1;

__END__
DELETE FROM releases_img_done
WHERE ctid IN (
  select a[1] as ctid
  from (
    SELECT aid, array_agg(ctid) as a
    FROM releases_img_done
    group by aid
    having count(*)>1
    -- ORDER BY aid
   -- LIMIT 1
) a);

 alter table releases_img_done add column release_id int unique;


update releases_img_done set release_id=unnest(regexp_matches(img[1], '/discogs-images/R-(\d+)'))::int where img <> array[]::text[];
UPDATE 587978

vinylhub=# select count(*) from releases_img_done where img=array[]::text[];
 count 
-------
 72824

vinylhub=# delete from releases_img_done where img=array[]::text[];
DELETE 72824


CREATE OR REPLACE FUNCTION discogs.release_img_hmac_sha1_hex_path(text) returns text AS $$
    SELECT array_to_string(regexp_matches(encode(hmac($1, 'blunderbuss'::text, 'sha1'), 'hex'), '(\w)(\w{2})(\w{3})(\w+)'), '/', '0');
$$ LANGUAGE SQL STRICT IMMUTABLE;

