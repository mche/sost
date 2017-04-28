package Discogs::Releases::Formats;
use Mojo::Base 'Discogs::Base';

sub format {# проверить и обработать формат
  my ($self, $dom,) = @_;
=pod

vinylhub=# \d releases_formats
        Нежурналируемая таблица "discogs.releases_formats"
   Колонка    |   Тип   |               Модификаторы               
--------------+---------+------------------------------------------
 aid          | integer | NOT NULL DEFAULT nextval('id'::regclass)
 release_id   | integer | NOT NULL
 position     | integer | NOT NULL
 qty          | integer | 
 descriptions | text[]  | 
 format_aid   | integer | NOT NULL
Индексы:
    "releases_formats_pkey" PRIMARY KEY, btree (release_id, "position")
    "releases_formats_aid_idx" UNIQUE, btree (aid)
    "releases_formats_releaseid_idx" btree (release_id)
Ограничения внешнего ключа:
    "releases_formats_format_aid_fkey" FOREIGN KEY (format_aid) REFERENCES format(aid)
    "releases_formats_release_id_fkey" FOREIGN KEY (release_id) REFERENCES release(id)

ALTER TABLE releases_formats ADD column release_aid int;
update releases_formats t
  set release_aid=r.aid
  from release r
  where t.release_id=r.id;
ALTER TABLE ONLY releases_formats alter column release_aid set not null;

<div class="head">Format:</div>
<div class="content">
  <a href="/search/?format_exact=Vinyl">Vinyl</a>, LP, Album
  <br>
  <a href="/search/?format_exact=CD">CD</a>, Album
  <br>
            
</div>

<div class="content">
                                                                2 ×
            <a href="/search/?format_exact=Vinyl">Vinyl</a>, 12", Album, 45 RPM, 33 ⅓ RPM
            <br>
            
                </div>

=cut
  #~ my @nodes = $dom->child_nodes->grep(sub {my $tag = $_->tag; return undef if $tag && $tag eq 'br'; $tag || $_->content =~ /\S+/; })->each;
  #~ my %data = (qty=>1,);
  my $position = 1;
  [ $dom->find('a')->map(sub {
    my %data = (qty => 1, descriptions => [], position => $position++,);
    
    my $format = $_->all_text;
    $data{format_aid} = $self->model->формат($format)->{aid};
    
    my $prev = $_->previous_node;
    $data{qty} = ($prev->content =~ /(\d+)/)[0]
      if $prev && !$prev->tag && $prev->content =~ /×/;
      
    my $next = $_->next_node;
    $data{descriptions} = [map $_ =~ s/^\s+|\s+$//gr, grep /\S+/, split /\s*,\s*/, $next->content]
      if $next &&  !$next->tag;
    
    \%data;
    
  })->each ];

}

sub save {
  my ($self, $data, $release) = @_;
  for my $row (@$data) {
    $row->{release_aid} ||= $release->{aid};
    $row->{save} = $self->model->releases_formats(%$row);
  }
  $data;
}

1;

__END__

