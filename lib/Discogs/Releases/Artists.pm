package Discogs::Releases::Artists;
use Mojo::Base 'Discogs::Base';
use Discogs::Util qw(split_role);
use Discogs::Artist;

has artist => sub {Discogs::Artist->new};

=pod

Нежурналируемая таблица "discogs.releases_artists"
    Колонка    |   Тип   |               Модификаторы               
---------------+---------+------------------------------------------
 aid           | integer | NOT NULL DEFAULT nextval('id'::regclass)
 release_id    | integer | NOT NULL
 position      | integer | NOT NULL
 artist_id     | integer | 
 artist_name   | text    | 
 anv           | text    | 
 join_relation | text    | 
Индексы:
    "releases_artists_pkey" PRIMARY KEY, btree (release_id, "position")
    "releases_artists_aid_idx" UNIQUE, btree (aid)
    "releases_artists_id_idx" btree (artist_id)
    "releases_artists_name_idx" btree (artist_name)
    "releases_artists_releaseid_idx" btree (release_id)

alter table releases_artists add column release_aid int;

set enable_seqscan to off;

update releases_artists ra
set release_aid = r.aid
from release r
where ra.release_id=r.id;

alter table releases_artists add column artist_aid int;

update releases_artists ra
set artist_aid = a.aid
from artist a
where ra.artist_id=r.id;

=cut

sub artists {
  my ($self, $dom, $release) = @_;
=pod

div.profile

> h1#profile_title >

  <span itemprop="byArtist" itemscope="" itemtype="http://schema.org/MusicGroup">
    <span itemprop="name" title="Bruce Springsteen">
      <a href="/artist/219986-Bruce-Springsteen">Bruce Springsteen</a>
    </span>
  </span>

или 

  <span itemprop="byArtist" itemscope="" itemtype="http://schema.org/MusicGroup">
    <span itemprop="name" title="Slapp Happy">
        <a href="/artist/364236-Slapp-Happy">Slapp Happy</a>, </span>                    
    <span itemprop="name" title="City Preachers">
        <a href="/artist/1306701-City-Preachers">City Preachers</a>, </span>                    
    <span itemprop="name" title="The Commuters">
        <a href="/artist/1493455-The-Commuters">The Commuters</a>, </span>                    
    <span itemprop="name" title="Anthony Moore">
        <a href="/artist/100685-Anthony-Moore">Anthony Moore</a>, </span>                    
    <span itemprop="name" title="Slapp Happy">
        <a href="/artist/364236-Slapp-Happy">Slapp Happy</a> Featuring  </span>                    
    <span itemprop="name" title="Anthony Moore">
        <a href="/artist/100685-Anthony-Moore">Anthony Moore</a></span>
  </span>

=cut
  my $position = 1;
  [$dom->find('h1#profile_title span[itemprop="byArtist"] span[itemprop="name"]')->map(sub {
    my $data = $self->artist->artist_link($_->at('a'));
    $data->{position} = $position++;
    return $data;
  })->each];
}

sub extraartists {# credits
=pod
     Нежурналируемая таблица "discogs.releases_extraartists"
   Колонка   |   Тип   |               Модификаторы               
-------------+---------+------------------------------------------
 aid         | integer | NOT NULL DEFAULT nextval('id'::regclass)
 release_id  | integer | 
 artist_id   | integer | 
 artist_name | text    | 
 anv         | text    | 
 role        | text    | 

не нужна таблица

=cut

  my ($self, $dom, $release) = @_;
  return undef unless $dom;
  my $position = 1;
  [$dom->find('div#credits li')->map(sub {
    {
      position=>$position++,
      roles=>$self->model->roles(split_role($_->at('span.role')->all_text))->{aid},
      artists=>[$_->find('a')->map(sub {$self->artist->artist_link($_)})->each],
    };
    
  })->each];
}

1;

__END__
