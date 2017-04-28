package Discogs::Artist;
use Mojo::Base 'Discogs::Base';

=pod
https://www.discogs.com/help/doc/submission-guidelines-release-artist

Специальные артисты (6):
118760-No-Artist This artist is used as a placeholder entry and does not link to any artist. нет записи в таблице artist https://www.discogs.com/artist/No+Artist?anv=
967691 | Anonymous запись в таблице artist много namevariations
355 | Unknown Artist нет записи в таблице artist. This artist is used as a placeholder entry and does not link to any artist.
355 | unknown artist
151641-Traditional используется только Only to be used for composition type credits. много namevariations Alias- Folk!
194-Various         should be used when there are several different artists on a release, and no one is billed as the main artist. https://www.discogs.com/artist/Various?anv=     https://www.discogs.com/artist/194-Various This artist is used as a placeholder entry and does not link to any artist.
320156-Folk Used for folk songs that are credited as such on the release. Only to be used for composition type credits. Please use this profile only for songwriting credits and nothing else. много namevariations Alias- Traditional!

div.profile
> h1 - name
   
  <h1 class="hide_mobile">Erik Landley</h1>

realname

  <div class="head">Real Name:</div>
  <div class="content">Ezio Lazzerini</div>

profile

  <div class="head">Profile:</div>
  <div class="content">
        <div class="readmore uncropped" id="profile">
            Bassist and saxophonist.
        </div>
  </div>

groups участник в группах

  <div class="head">In Groups:</div>
  <div class="content">
      <a href="/artist/316312-Death-SS"><s>Death SS</s></a>, 
      <a href="/artist/1120136-Il-Trono-Dei-Ricordi">Il Trono Dei Ricordi</a>    </div>
  

namevariations
Artist Name Variation (ANV)

  <div class="head">Variations:</div>
  <div class="content">

    <div class="filter_anv_wrap">
      <span class="anv_selected">Viewing All</span>
      <a href="/artist/910465-Erik-Landley?noanv=1">Erik Landley</a>

  </div>

    <div id="anvs" class="readmore uncropped">
      <a href="/artist/910465-Erik-Landley?filter_anv=1&amp;anv=Erik+Landely">Erik Landely</a>
    </div>

  </div>

aliases

  <div class="head">Aliases:</div>
  <div class="content">
      <a href="/artist/151641-Traditional">Traditional</a>    </div>

members для группы

  <div class="head">Members:</div>
  <div class="content">
      <div class="readmore uncropped">
          <a href="/artist/26-Alexi-Delano">Alexi Delano</a>, 
          <a href="/artist/27-Cari-Lekebusch">Cari Lekebusch</a>
      </div>
  </div>

urls

  <div class="head">Sites:</div>
  <div class="content"><a href="http://www.gatewaymastering.com/" rel="nofollow">gatewaymastering.com</a>, <a href="http://en.wikipedia.org/wiki/Bob_Ludwig" rel="nofollow">Wikipedia</a></div>

=cut 

sub artist_link {# разбор сслылки артиста в 4х местах релиза: 1-заголовок, 2-артисты трека, 3-екстраартисты трека, 4-екстраартисты всего релиза(credits)
  my $self = shift;
  my $link = shift
    or return;
  my $next = $link->next_node;
  my ($join_relation, $anv);
  if ($next) {
    my $next_content = $next->all_text =~ s/^\s+|\s+$//gr;
    if (!$next->tag && $next_content =~ /\S+/) {
      if ($next_content =~ s/\s*\*\s*//) {# звездочка это anv atrist name variation
        $anv = $link->all_text =~ s/^\s+|\s+$//gr;
      }
      $join_relation = $next_content
        if $next_content;
    }
  }
  
  my $artist_id = ($link->attr('href') =~ m|/artist/(\d+)|)[0];
  my $artist = $self->model->artist_id($artist_id)
    || $self->new_artist($link->attr('href'), $artist_id)
    if $artist_id;
 
  return {
    artist_id=> $artist_id,
    artist_aid=>$artist->{aid},
    #~ artist_name => undef, # убрать колонку
    join_relation => $join_relation,
    anv => $anv || ($artist_id ? undef : $link->all_text),
  };

}

sub new_artist {
  my ($self, $href, $artist_id,) = @_;
  my $url = $self->base_url . $href;
  #~ print "\tНовый артист [$url]...";
  my $res = $self->ua->request('get', $url,);
  
  unless (ref $res) {
    print $res, "\n";
    
    die "Ошибка HTTP [$res]";
  }
  say "OK";
  my $dom = $res->dom;
  my $h1 = $dom->at('div.profile h1')
    or return {};
  my %data = (id=>$artist_id, name=>$h1->all_text =~ s/^\s+|\s+$//gr);
  
  my %col_map = (sites=>'urls', variations=>'namevariations', ingroups=>'groups_aid', members=>'members_aid',);
  
  for my $head ($dom->find('div.profile > div.head')->each) {
    my $meth = lc($head->text =~ s/\W//gr);
    $data{$col_map{$meth} || $meth} = $self->$meth($head->next)
      if $self->can($meth);# && $head->next_node;
  }
  $self->model->artist_and_update(['id'], %data);
}

sub realname {
  my ($self, $dom) = @_;
  $dom->all_text =~ s/^\s+|\s+$//gr;
}

sub profile {
  my ($self, $dom) = @_;
  $dom->all_text =~ s/^\s+|\s+$//gr;
}

sub sites {
  my ($self, $dom) = @_;
  [$dom->find('a')->map(sub {
    $_->attr('href');
    
  })->each];
}

sub aliases {
  my ($self, $dom) = @_;
  [$dom->find('a')->map(sub {
    $_->all_text;
    
  })->each];
}

sub variations {
  my ($self, $dom) = @_;
  [$dom->find('div#anvs a')->map(sub {
    $_->all_text;
    
  })->each];
}

sub ingroups {
=pod

alter table artist add column groups_aid int[];

=cut
  my ($self, $dom) = @_;
  [$dom->find('a')->map(sub {
    #~ my $data = $self->artist_link($_);
    #~ $data->{aid};
    my $artist_id = ($_->attr('href') =~ m|/artist/(\d+)|)[0];
    my $name = $_->all_text;
    $self->model->artist(['id'], id=>$artist_id, name=>$name)->{aid};
    
  })->each];
}

sub members {
=pod

alter table artist add column members_aid int[];

=cut
  shift->ingroups(@_);
}

1;