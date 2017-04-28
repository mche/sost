package Discogs::Images;
use Mojo::Base 'Discogs::Base';
#~ use MIME::Base64 qw(encode_base64);
#~ use Digest::SHA qw (hmac_sha1_base64);
#~ use Exporter 'import';
#~ our @EXPORT_OK = qw(enc_dir enc_split b64 hmac);

=pod

  use Discogs::Images qw(enc_dir);
  
  my $dir = enc_dir('Discogs::Images::hmac', $release->{master_aid}, $release->{aid});
  my $img1 = "$dir/$release->{aid}-1.jpg";


  my $DI = Discogs::Images->new(dbh=>$dbh);
  $DI->ua(UA->new);
  $DI->release_images($row);
  
=cut

has img_css => 'div#view_images > p img';# CSS selector

sub process_year {
  my $self = shift;
  #~ my %arg = @_;
  $self->model->dbh->do($self->model->sth('reset release img_done'), undef, ($self->year));
  my $sth = $self->model->sth('картинки релизов по годам', select=>'r.*, discogs.release_img_hmac_sha1_hex_path(r.id::text) as img_dir  ', limit => $self->limit ? ' limit ? ' : ''); # r.id, r.master_id,  r.title as release_title, m.aid as master_aid, m.title as master_title,
  $sth->execute($self->year, $self->limit ? ($self->limit) : ());
  
  my $n = 0;

  while (my $row = $sth->fetchrow_hashref) {
    say %$row
      and next
      unless $row->{aid};
    
    #~ print "$n. ";
    $row->{'№'} = ++$n;
    $self->release_images($row);
      #~ or redo;
    
    sleep $self->timeout
      if $self->timeout;

  }
  
  #~ $n = $self->process_year
    #~ if $n; # еще есть релизы

  return $n;

}

sub count_year {
  my $self = shift;
  say %{ $self->model->count_release_year_img($self->year)};
}

# скачка всех картинок релиза
sub release_images {
  my ($self, $row)= @_;
  #~ my $ua = $self->ua;
  #~ my $ua_img = $self->ua_img;
  #~ my $dbh = $self->dbh;
  
  
  $row->{release_title} ||= $row->{title} ||= 'Blunderbuss';
  my $title = $row->{release_title} =~ s/\W+/-/gr;
  my $url = $self->base_url."/release/$row->{id}-$title/images";
  
  print "$row->{'№'}. Релиз [$url]...";
  my $res;
  while (1) {
    $res = $self->ua->request('get', $url,);
    last
      if ref $res;
    #~ unless (ref $res) {
    print $res, "\n";
    $row->{img_urls} = ['404'];
    return $self->model->done_release_img($row)
      #~ if $res =~ m'^4';
      if $res eq '404';
    
    die "Ошибка HTTP [$res]";
    
    #~ say "Пауза и повтор..."
      #~ and sleep 10;
    #~ $self->ua->ua($self->ua->new_ua);# переподключить агента
      #~ and next
      #~ if $res =~ /Connect timeout/i;
    
    #~ say "Проблемный выход на повторный заход";
    #~ sleep 1;
    #~ return undef;
    #~ }
  }
  print "OK\n";
  
  #~ my $dir = enc_dir('hmac', $row->{master_aid}, $row->{aid});
  my $dir = $self->base_covers_dir.'/'.$row->{img_dir};
  system("mkdir -p $dir");
  die "Не смог создать папку[$dir]: [$?] [$!]"
    unless $? == 0;
  
  my $dom = $res->dom;
  my @src = $dom->find($self->img_css)->map(sub {$_->attr('src')})->each #
    or say "\tНе нашел [img_css]"
    and ($row->{img_urls} = [])
    and return $self->model->done_release_img($row);
  
  my @fail = ();

  for my $n (0..$#src) {
    $n++;
    my $path = "$dir/$n.jpg";
    
    print "\t№$n >>> [$path]...";#[$src[$n-1]]
    #~ say "Уже есть такой файл"
      #~ and next
      #~ if -f $path && -s $path;
    
    my $img = $self->ua->request('get', $src[$n-1],);

    unless (ref $img) {# fail
      print "$img\n";
      $fail[$n-1] = $src[$n-1];
      next;
    }
    print "OK\n";
    $img->content->asset->move_to($path);
    sleep 1;
  }
  
  $row->{img_urls} = \@src;
  $row->{img_fails} = \@fail;

  return $self->model->done_release_img($row);
  
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

