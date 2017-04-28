package Discogs::XML::Release;
use Mojo::Base 'Discogs::XML::Base';
use Discogs::XML::Release::Labels;
use Discogs::XML::Release::Artists;
#~ use Discogs::XML::Release::Extraartists;
use Discogs::XML::Release::Tracklist;

#~ has release_labels=> sub {Discogs::XML::Release::Labels->new};
#~ has release_artists=> sub {Discogs::XML::Release::Artists->new};
#########~ has extraartists => sub {Discogs::XML::Release::Extraartists->new};
#~ has tracklist => sub {Discogs::XML::Release::Tracklist->new};

=pod

images;artists;title;labels;extraartists;formats;genres;styles;country;released;notes;master_id;data_quality;tracklist;identifiers;videos;companies

<identifiers><identifier type="Barcode" value="5037968003106"/></identifiers>

=cut

has item_tag => 'release';
has tag2col => sub { {identifiers=>'barcode', country=>'country_aid'} };

sub release {
  my ($self, $dom) = @_;
  my $release = $self->child_nodes($dom);
  $release->{id} = $dom->attr('id')
    or die $dom;
  #~ $release->{labels} = $self->release_labels->labels($dom->at('labels'));
  #~ $release->{artists} = $self->release_artists->artists($dom->at('artists'));
  #~ $release->{extraartists} = $self->release_artists->extraartists($dom->at('extraartists'));
  #~ $release->{tracklist} = $self->tracklist->tracklist($dom->at('tracklist'));
  return $release;
}


sub title {
  shift->text(@_);
}

sub released {
  shift->text(@_);
}

sub notes {
  shift->text(@_);
}

sub master_id {
  shift->text(@_);
}

sub identifiers {
  my ($self, $dom) = @_;
  my $bar = $dom->at('identifier[type="Barcode"]')
    or return undef;
  $bar->attr('value');
}

sub country {
  my ($self, $dom) = @_;
  $self->model->country($self->text($dom))->{aid};
}

sub genres {
  my ($self, $dom) = @_;
  [$dom->find('genre')->map(sub {
    
    $self->model->genre($self->text($_))->{aid};
  })->each];
}

sub styles {
my ($self, $dom) = @_;
  [$dom->find('style')->map(sub {
    
    $self->model->style($self->text($_))->{aid};
    
  })->each];
  
}

1;