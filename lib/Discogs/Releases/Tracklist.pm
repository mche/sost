package Discogs::Releases::Tracklist;
use Mojo::Base 'Discogs::Base';
use Discogs::Util qw(split_role);
use Discogs::Artist;

has artist => sub {Discogs::Artist->new};

=pod

#~ ~/postgresql-9.4.7/contrib/pgcrypto $ make
#~ ~/postgresql-9.4.7/contrib/pgcrypto $ make install
#~ vinylhub=# CREATE EXTENSION pgcrypto;
#~ CREATE EXTENSION

vinylhub=# drop index "track_releaseid_trackid";
DROP INDEX


vinylhub=# alter table track DROP CONSTRAINT "track_pkey";
ALTER TABLE

vinylhub=# alter table track add CONSTRAINT "track_pkey" primary key (aid);
ALTER TABLE

vinylhub=# alter table track alter column track_id type uuid USING track_id::uuid;
ALTER TABLE
vinylhub=#  create index on track (track_id);

alter table track add column release_aid int;

Нежурналируемая таблица "discogs.track"
  Колонка   |   Тип   |               Модификаторы               
------------+---------+------------------------------------------
 aid        | integer | NOT NULL DEFAULT nextval('id'::regclass)
 release_id | integer | 
 position   | text    | 
 track_id   | text    | NOT NULL
 title      | text    | 
 duration   | text    | 
 trackno    | integer | 
Индексы:
    "track_pkey" PRIMARY KEY, btree (track_id)
    "track_aid_idx" UNIQUE, btree (aid)
    "track_releaseid_idx" btree (release_id)
    "track_releaseid_trackid" btree (release_id, track_id)

<div data-toggle="tracklist" class="section tracklist" id="tracklist">
            <h3 class="group">
                Tracklist                            </h3>

            <div class="section_content">
                                                    
                    <table itemtype="http://schema.org/MusicGroup" itemscope="" class="playlist">
                                                        <tbody><tr itemtype="http://schema.org/MusicRecording" itemscope="" itemprop="track" class="first tracklist_track track">
                    <td class="tracklist_track_pos">A1</td>
        
        
        <td class="track tracklist_track_title "><span itemprop="name" class="tracklist_track_title">Looking For A Dream</span><meta content="https://www.discogs.com/Slender-Loris-Looking-For-A-Dream/release/347566" itemprop="url"></td>
        <td width="25" class="tracklist_track_duration">
            <meta content="PT0H00M00S" itemprop="duration">
            <span></span>
        </td>
    </tr>

                                                                    <tr itemtype="http://schema.org/MusicRecording" itemscope="" itemprop="track" class=" tracklist_track track">
                    <td class="tracklist_track_pos">A2</td>
        
        
        <td class="track tracklist_track_title "><span itemprop="name" class="tracklist_track_title">Bad Magic</span><meta content="https://www.discogs.com/Slender-Loris-Looking-For-A-Dream/release/347566" itemprop="url"></td>
        <td width="25" class="tracklist_track_duration">
            <meta content="PT0H00M00S" itemprop="duration">
            <span></span>
        </td>
    </tr>

                                                                    <tr itemtype="http://schema.org/MusicRecording" itemscope="" itemprop="track" class=" tracklist_track track">
                    <td class="tracklist_track_pos">B1</td>
        
        
        <td class="track tracklist_track_title "><span itemprop="name" class="tracklist_track_title">Are You Ready For Love?</span><meta content="https://www.discogs.com/Slender-Loris-Looking-For-A-Dream/release/347566" itemprop="url"></td>
        <td width="25" class="tracklist_track_duration">
            <meta content="PT0H00M00S" itemprop="duration">
            <span></span>
        </td>
    </tr>

                                                                    <tr itemtype="http://schema.org/MusicRecording" itemscope="" itemprop="track" class=" tracklist_track track">
                    <td class="tracklist_track_pos">B2</td>
        
        
        <td class="track tracklist_track_title "><span itemprop="name" class="tracklist_track_title">Ghost Train</span><meta content="https://www.discogs.com/Slender-Loris-Looking-For-A-Dream/release/347566" itemprop="url"></td>
        <td width="25" class="tracklist_track_duration">
            <meta content="PT0H00M00S" itemprop="duration">
            <span></span>
        </td>
    </tr>

                        </tbody></table>

            </div>
        </div>

=cut

sub tracklist {
  my ($self, $dom, $release) = @_;
  
  my $tr = $dom->find('div#tracklist tr.tracklist_track')
    or return;
  
  my $trackno = 1;
  [ $tr->map(sub {
    my $duration = $_->at('td.tracklist_track_duration span');
    my $title = $_->at('td.tracklist_track_title');
    {
      trackno => $trackno++,
      position => $_->at('td.tracklist_track_pos')->all_text || undef,
      title => $title->text || $title->at('span.tracklist_track_title')->all_text,
      duration => $duration->all_text || undef,
      tracks_artists =>  $self->tracks_artists($_->at('td.tracklist_track_artists')),
      tracks_extraartists =>  $self->tracks_extraartists($_->find('span.tracklist_extra_artist_span')),
    
    };

  })->each ];
}

sub tracks_artists {
  my ($self, $dom, $track) = @_;
=pod

vinylhub=# drop index "tracks_artists_aid_idx";
DROP INDEX

vinylhub=# alter table tracks_artists DROP CONSTRAINT "tracks_artists_pkey";
ALTER TABLE

vinylhub=# alter table tracks_artists add CONSTRAINT "tracks_artists_pkey" primary key (aid);
ALTER TABLE

vinylhub=# alter table tracks_artists alter column track_id type uuid USING track_id::uuid;
ALTER TABLE

vinylhub=#  create index on tracks_artists (track_id);
CREATE INDEX


vinylhub=# alter table tracks_artists add column track_aid int; -- not null
ALTER TABLE

update tracks_artists ta
set track_aid = t.aid
from track t
where ta.track_id=t.track_id;

alter table tracks_artists add column artist_aid int; -- not null

update tracks_artists ta
set artist_aid = a.aid
from artist a
where ta.artist_id=a.id;


          Нежурналируемая таблица "discogs.tracks_artists"
    Колонка    |   Тип   |               Модификаторы               
---------------+---------+------------------------------------------
 aid           | integer | NOT NULL DEFAULT nextval('id'::regclass)
 track_id      | uuid    | удалить
 position      | integer | 
 artist_id     | integer | 
 artist_name   | text    | 
 anv           | text    | 
 join_relation | text    | 
 track_aid     | integer | 
Индексы:
    "tracks_artists_track_aid_idx" btree (track_aid)
    "tracks_artists_track_id_idx" btree (track_id)


=cut

  return undef unless $dom;
  my $position = 1;
  [$dom->find('a')->map(sub {
    my $data = $self->artist->artist_link($_);
    $data->{position} = $position++;
    return $data;
  })->each];
}

sub tracks_extraartists {
  my ($self, $coll, $track) = @_;# коллекция
=pod

       Нежурналируемая таблица "discogs.tracks_extraartists"
   Колонка    |   Тип   |               Модификаторы               
--------------+---------+------------------------------------------
 aid          | integer | NOT NULL DEFAULT nextval('id'::regclass)
 track_id     | uuid    | NOT NULL
 artist_id    | integer | 
 artist_name  | text    | 
 anv          | text    | 
 role         | text    | 
 track_aid    | integer | 
Индексы:
    "tracks_extraartists_track_id_idx" btree (track_id)


update tracks_extraartists ta
set track_aid = t.aid
from track t
where ta.track_id=t.track_id;

=cut
  return undef unless $coll && @$coll;
  
  #~ my $roles = $_->child_nodes->first->all_text;
  my $position = 1;
  return [$coll->map(sub {
    {
      position=>$position++,
      roles=>$self->model->roles(split_role(( split /\s*–\s*/, $_->all_text )[0]))->{aid},
      artists=>[$_->find('a')->map(sub {$self->artist->artist_link($_)})->each],
    };
  })->each];

}


1;

__END__
