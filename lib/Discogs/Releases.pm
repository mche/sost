package Discogs::Releases;
use Mojo::Base 'Discogs::Masters';
use Mojolicious::Plugin::RoutesAuthDBI::Util qw(load_class);

has latest_url => '/search/?limit=250&sort=date_added%2Cdesc&format_exact=Vinyl&type=release&layout=sm&page=';

has latest_save => sub { shift->save_release_new };#sth->sth('new релизы_новые')}; # POS
has check_full => sub { shift->check_release };#sth->sth('id release')}; # POS
has check_new => sub { shift->check_new_release };#sth->sth('id релизы_новые')}; # POS
#~ has del_release_new => sub { shift->model->sth('del релизы_новые') };

sub новые_релизы {
=pod

=head2 новые_релизы

Обработка списка первого бота по релизам (->latest)

1. Берем список таблицы релизы_новые

2. Артисты

3. Заголовок

4. Список заголовков div.profile > div.head передать в соотв методы с контентом

5. Формат не винил удалить релиз из новых


=cut
  my $self = shift;
  #~ my %arg = @_;
  #~ my $limit = shift || 100;

  my $sth = $self->model->sth('по списку релизы_новые', limit=>'limit ?', where=> $self->release_id ? "r.id = ?" : 'r.id is null');
  $sth->execute($self->release_id ? ($self->release_id) : (), $self->limit, );
  
  my $n=1; 
  if ($self->forks) {
    my $stop;
    require Mojo::IOLoop::ForkCall;
    my $fc = Mojo::IOLoop::ForkCall->new;
    
    my $forkstart = sub {
      my $row = $sth->fetchrow_hashref
        or ++$stop
        and return;
      
      $row->{'№'} = $n++;
      
      $self->релиз($row);
    };
    
    my $forkdone; $forkdone = sub {
      my ($fc, $err, @return) = @_;
      
      say STDERR $err
        and $stop++
        #~ and return
        if $err;
      
      return if $stop;
      
      #~ return unless @return;
      
      #~ my $row = $sth->fetchrow_hashref
        #~ or return;
      
      $fc->run($forkstart, undef, $forkdone);
    };
    
    $fc->run($forkstart, undef, $forkdone,)
      for 1..$self->forks;
    
    $fc->ioloop->start
      unless $fc->ioloop->is_running;
    return;
    
  }
  
  
  my $sleep;
  while ( my $row = $sth->fetchrow_hashref ) {
    sleep $sleep
      if $sleep;
    
    #~ print $n++, '. ';
    $row->{'№'} = $n++;
    
    $self->релиз($row);
      #~ or redo;
    
    $sleep = $self->timeout
      if $self->timeout;
  }
  return $n;
}

sub релиз {# обработать релиз по строке релизы_новые
  my ($self, $row) = @_;
  $row->{id} ||= $self->release_id
    || die "Нет релиз ИДа";
  $row->{'№'} ||= '1';
  $row->{url} ||= "/Looking-For-A-Dream-Moon/release/$row->{id}";
  my $ua = $self->ua;
  #~ my $dbh = $self->dbh;
  
  my $url = $self->base_url . $row->{url};
  print "$row->{'№'}. Релиз [$url]...";
  my $res = $ua->request('get', $url,);
  
  unless (ref $res) {
    print $res, "\n";
    
    my $del;
    
    say "Почикал новый релиз [$row->{id}]", 
      and $ua->dump( $self->model->del_release_new($row->{id}) )
      and return 1
      if $res eq '404';
    
    die "Ошибка HTTP [$res]";
    
    #~ return
      #~ if $res =~ m'^4';
    #~ say "\t\tПовторный заход";
    #~ sleep 1;
    #~ return undef;
  }
  say "OK";
  my $dom = $res->dom;
  
  my %data = (
    id=>$row->{id},
    master_id => $self->master_id($dom),
    title => $self->title($dom),
    barcode => $self->barcode($dom),
    notes => $self->notes($dom),
    status => $self->statistics($dom),
  );
  my %col_map = (genre=>'genres', style=>'styles', country => 'country_aid');
  
  
  for my $head ($dom->find('div.profile > div.head')->each) {
    my $meth = lc($head->text =~ s/\W//gr);
    #~ $ua->dump($meth, $self->$meth($head->next_node))
    $data{$col_map{$meth} || $meth} = $self->$meth($head->next)
      if $self->can($meth);
  }
  
  my $format = delete $data{format};
  my $label = delete $data{label};
  
  $ua->dump('release', \%data);
  # my $release = $self->model->release(['id'], %data)
  
  # подтаблицы
  $ua->dump('format', $format);
  # $self->releases_formats->save($format, $release);
  $ua->dump('label', $label);
  #~ $self->releases_labels->save($label, $release);
  #~ $ua->dump('artists', $self->artists($dom, $release));
  #~ $ua->dump('extraartists', $self->extraartists($dom, $release));
  #~ $ua->dump('tracklist', $self->tracklist($dom, $release));
  
  return 1;
}

sub statistics {
  my ($self, $dom) = @_;
  join "\n", map s/\s+//gr, $dom->find('div#statistics div.section_content li')->map(sub {$_->all_text})->each;
}

sub title {
  my ($self, $dom) = @_;
  my $h1 = $dom->at('h1#profile_title');
=pod
<h1 class="hide_mobile has_action_menu" id="profile_title">
                <span itemtype="http://schema.org/MusicGroup" itemscope="" itemprop="byArtist">
                                            
        <span title="Slender Loris" itemprop="name">
            <a href="/artist/4996379-Slender-Loris">Slender Loris</a></span>
                </span>
                &lrm;&ndash;
                <span itemprop="name">
                                            Looking For A Dream
                                    </span>
            </h1>

=cut
  $h1->children('span')->last->all_text =~ s/^\s+|\s+$//gr;
}

has releases_labels => sub { load_class('Discogs::Releases::Labels')->new; };
sub label { shift->releases_labels->labels(@_) }

has releases_formats => sub { load_class('Discogs::Releases::Formats')->new; };
sub format { shift->releases_formats->format(@_) }

has _artists => sub { load_class('Discogs::Releases::Artists')->new; };
sub artists { shift->_artists->artists(@_) }
sub extraartists {shift->_artists->extraartists(@_)}

has _tracklist => sub { load_class('Discogs::Releases::Tracklist')->new; };
sub tracklist { shift->_tracklist->tracklist(@_) }

sub master_id {
  my ($self, $dom) = @_;
=pod

<a href="/Josh-Wink-Profound-Sounds-Vol-1/master/66526" id="all-versions-link">All Versions of this Release</a>

=cut
  my $link = $dom->at('a#all-versions-link')
    or return;
  ($link->attr('href') =~ /(\d+)$/)[0];
}

sub genre {
=pod

Нежурналируемая таблица "discogs.genre"
   Колонка    |   Тип   |               Модификаторы               
--------------+---------+------------------------------------------
 aid          | integer | NOT NULL DEFAULT nextval('id'::regclass)
 id           | integer | NOT NULL
 name         | text    | 
 parent_genre | integer | 
 sub_genre    | integer | 
Индексы:
    "genre_pkey" PRIMARY KEY, btree (id)
    "genre_aid_idx" UNIQUE, btree (aid)

vinylhub=# alter table release alter COLUMN  genres type text[] USING genres::text[];
ALTER TABLE

vinylhub=# alter table genre drop constraint "genre_pkey";
ALTER TABLE

vinylhub=# drop index "genre_aid_idx";
DROP INDEX

vinylhub=# alter table genre add constraint "genre_pkey" primary key (aid);
ALTER TABLE

vinylhub=# alter table genre drop  column id;
ALTER TABLE

vinylhub=# alter table genre alter column name set not null;
ALTER TABLE

vinylhub=#  create unique index on genre (name);
CREATE INDEX

vinylhub=# insert into genre (name) select r.name
 from (select distinct(s) as name from (select unnest(genres) as s from release) s) r
  left join genre g on r.name=g.name
  where g.name is null
  ;

vinylhub=# alter table release add column genres2 int[];
ALTER TABLE

create or replace function discogs.genre_array_int(text[]) returns int[] as $$
declare
   ret    int[];
   i int;
begin
   if $1 is null then return null::int[];
   END IF;
    
   if array_length($1, 1) is null then return array[]::int[];
   END IF;
   
   for i in array_lower($1, 1)..array_upper($1, 1) loop
     ret[i] := ( select aid from discogs.genre where lower(name)=lower($1[i]));
   end loop;

   return ret;

end;
$$ language plpgsql; 

vinylhub=# update release set  genres2 = genre_array_int(genres);

alter table release drop column genres;

alter table release rename column genres2 to  genres;


=cut
  my ($self, $dom) = @_;
  [$dom->find('a')->map(sub {
    #~ my %data = ();
    
    $self->model->genre($_->all_text)->{aid};
    
    #~ \%data;
  })->each];
}

sub style {

=pod

alter table release alter COLUMN  styles type text[] USING styles::text[];

create table discogs.style (
 aid   integer NOT NULL DEFAULT nextval('public.id'::regclass) primary key,
 name  text NOT NULL
);

insert into discogs.style (name) select r.name
 from (select distinct(s) as name from (select unnest(styles) as s from release) s
) r
  left join discogs.style g on r.name=g.name
  where g.name is null
  ;

alter table release add column styles2 int[];

create or replace function discogs.style_array_int(text[]) returns int[] as $$
declare
   ret    int[];
   i int;
begin
   if $1 is null then return null::int[];
   END IF;
    
   if array_length($1, 1) is null then return array[]::int[];
   END IF;
   
   for i in array_lower($1, 1)..array_upper($1, 1) loop
     ret[i] := ( select aid from discogs.style where lower(name)=lower($1[i]));
   end loop;

   return ret;

end;
$$ language plpgsql; 

update release set  styles2 = style_array_int(styles) where styles is not null;

create unique index on style (name);

alter table release drop column styles;

alter table release rename column styles2 to styles;

=cut


  my ($self, $dom) = @_;
  #~ '{"'.join('", "', $dom->children('a')->map(sub { $_->all_text; })->each) . '"}';
  [$dom->find('a')->map(sub {
    #~ my %data = ();
    
    $self->model->style($_->all_text)->{aid};
    
    #~ \%data;
  })->each];
  
}

sub country {
=pod

Нежурналируемая таблица "discogs.country"
 Колонка |   Тип   |               Модификаторы               
---------+---------+------------------------------------------
 aid     | integer | NOT NULL DEFAULT nextval('id'::regclass)
 name    | text    | 
Индексы:
    "country_aid_idx" UNIQUE, btree (aid)
Ссылки извне:
    TABLE "release" CONSTRAINT "release_country_aid_fkey" FOREIGN KEY (country_aid) REFERENCES country(aid)

=cut
  my ($self, $dom) = @_;
  my $country = $dom->at('a')
    or return;
  $self->model->country($country->all_text)->{aid};
    #~ || $self->model->new_country($country->all_text);
}

sub released {
  my ($self, $dom) = @_;
  my $r = $dom->at('a')
    or return;
  $r->all_text =~ s/^\s+|\s+$//gr;
}


sub barcode {
  my ($self, $dom) = @_;
=pod
<div id="barcodes" data-toggle-section-id="barcodes" class="section barcodes toggle_section    toggle_section_remember">
        <h3 data-for=".barcodes" class="toggle_section_control float_fix">
                        Barcode and Other Identifiers
        </h3>
        <div class="section_content toggle_section_content">
                    <ul class="list_no_style">
                            <li>Barcode: 4547366030969</li>
                            <li>Rights Society: JASRAC</li>
                            <li>Matrix / Runout: SICP 10045 HD 1</li>
                            <li>Barcode: SICP 10045 CD 1</li>
                            <li>Mastering SID Code: IFPI 1275</li>
                            <li>Mould SID Code: 45T0</li>
                    </ul>
        </div>
    </div>
=cut
  my $div = $dom->at('div#barcodes')
    or return;
  #~ warn "Barcode: ", $div->all_text;
  join ', ', $div->find('li')->grep(sub {$_->all_text =~ /Barcode/i})->map(sub {$_->all_text =~ s/Barcode\s*:\s*//ir})->each;
}

sub notes {
  my ($self, $dom) = @_;
=pod

<div id="notes" data-toggle-section-id="notes" class="section notes toggle_section    toggle_section_remember">
        <h3 data-for=".notes" class="toggle_section_control float_fix">
                        Notes
        </h3>
        <div class="section_content toggle_section_content">
                    1: Track title is given as "D2" (which is the side of record on the vinyl version of i220-010 release). This was also released on CD where this track is listed on 8th position. On both version no titles are given (only writing/producing credits). Both versions of i220-010 can be seen on the master release page <a target="_blank" href="http://www.discogs.com/Heiko-Laux-The-Oldschoolstreet/master/27265">Heiko Laux - The Oldschoolstreet</a>. Additionally this track contains female vocals that aren't present on original i220-010 release. 
<br>4: Credited as J. Dahlbäck. 
<br>5: Track title wrongly given as "Vol. 1". 
<br>6: Credited as Gez Varley presents Tony Montana. 
<br>12: Track exclusive to Profound Sounds Vol. 1.
    
        </div>
    </div>

=cut
  my $div = $dom->at('div#notes div')
    or return;
  $div->all_text =~ s/^\s+|\s+$//gr;
}

1;