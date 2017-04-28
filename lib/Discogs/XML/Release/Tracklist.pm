package Discogs::XML::Release::Formats;
use Mojo::Base 'Discogs::Base';
use Discogs::XML::Release::Artists;

has artists => sub {Discogs::XML::Release::Artists->new};

=pod

<tracklist><track><position>A1</position><title>Things You Said</title><duration></duration><extraartists><artist><id>143350</id><name>Mark O'Sullivan</name><anv>M.O. Sullivan</anv><join></join><role>Vocals</role><tracks></tracks></artist></extraartists></track><track><position>A2</position><title>After The Rain</title><duration></duration></track><track><position>B1</position><title>Things You Said...Version 2</title><duration></duration><extraartists><artist><id>94905</id><name>Sandor</name><anv>S. Gyulai</anv><join></join><role>Guitar</role><tracks></tracks></artist><artist><id>143350</id><name>Mark O'Sullivan</name><anv>M.O. Sullivan</anv><join></join><role>Vocals</role><tracks></tracks></artist></extraartists></track><track><position>B2</position><title>Festen</title><duration></duration><extraartists><artist><id>1568360</id><name>Alexander Johansson</name><anv>A. Johansson</anv><join></join><role>Guitar</role><tracks></tracks></artist></extraartists></track></tracklist>

=cut

sub tracklist {
  my ($self, $dom, $release) = @_;
  my $trackno = 1;
  [$dom->find('track')->map(sub {
    my %data = (
      position=>$_->at('position')->text || undef,
      title => $_->at('title')->text,
      duration=>$_->at('duration')->text || undef,
      release_aid=>$release->{aid},
      trackno=>$trackno++,
    
    );
    
    my $track = $self->model->track(%data);
    
    $track->{extrartists} = $self->artists->extraartists($_->at('extrartists'));
    
    $track;
  })->each ];

}


1;