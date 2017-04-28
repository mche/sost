package Discogs::Releases::Labels;
use Mojo::Base 'Discogs::Base';
use Discogs::Label;

has label => sub {Discogs::Label->new};

=pod

Нежурналируемая таблица "discogs.releases_labels"
  Колонка   |   Тип   |          Модификаторы           
------------+---------+---------------------------------
 aid        | integer | DEFAULT nextval('id'::regclass)
 label      | text    | NOT NULL
 release_id | integer | NOT NULL
 catno      | text    | NOT NULL

ALTER TABLE releases_labels ADD column release_aid int;
update releases_labels t
  set release_aid=r.aid
  from release r
  where t.release_id=r.id;
ALTER TABLE ONLY releases_labels alter column release_aid set not null;

ALTER TABLE releases_labels ADD column label_aid int;
update releases_labels t
set label_aid=l.aid
from label l
where lower(t.label)=lower(l.name);

<div class="content">
  <a href="/label/1866-Columbia">Columbia</a> ‎– C6K 67398, 
  <a href="/label/15491-Legacy">Legacy</a> ‎– C6K 67398
</div>

=cut

sub labels {
  my ($self, $dom) = @_;
  #~ warn "Content: ", $dom->all_text;
  #~ $dom->child_nodes->grep(sub {my $tag = $_->tag; return undef if $tag && $tag eq 'br'; $tag || $_->all_text =~ /\S+/; })->each;
  my $position = 1;
  [ $dom->find('a')->map(sub {
    my $data = $self->label->label_link($_);
    $data->{position} = $position++;
    $data;
  })->each ];
}

sub save {
  my ($self, $data, $release) = @_;
  for my $row (@$data) {
    $row->{release_aid} ||= $release->{aid};
    $row->{save} = $self->model->releases_labels(map(($_=>$row->{$_}), qw(release_aid position label_aid catno)));
  }
  $data;
}

1;

__END__
