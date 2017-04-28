package Discogs::XML::Release::Artists;
use Mojo::Base 'Discogs::Base';


=pod

<artists><artist><id>59</id><name>Kerri Chandler</name><anv></anv><join></join><role></role><tracks></tracks></artist></artists>

=cut

sub artists {
  my ($self, $dom, $release) = @_;
  my $position = 1;
  [ $dom->find('artist')->map(sub {
    my $anv = $_->at('anv');
    my $join = $_->at('join');
    $self->model->releases_artists(release_aid=>$release->{aid}, position=>$position++, anv=>$anv && $anv->text || undef, join_relation=>$join && $join->text || undef,);
  })->each ];
}

use Discogs::Util qw(split_role);

=pod

<extraartists><artist><id>1996145</id><name>Jason Jasberto Batog</name><anv></anv><join></join><role>Design [For Opticasens]</role><tracks></tracks></artist><artist><id>473978</id><name>Jeff Craven</name><anv></anv><join></join><role>Executive-Producer</role><tracks></tracks></artist><artist><id>59</id><name>Kerri Chandler</name><anv></anv><join></join><role>Written-By, Producer, Arranged By</role><tracks></tracks></artist></extraartists>


<extraartists><artist><id>356288</id><name>Kenny "Dope" Gonzalez</name><anv></anv><join></join><role>Executive-Producer</role><tracks></tracks></artist><artist><id>161487</id><name>Louie Vega</name><anv>"Little Louie" Vega</anv><join></join><role>Executive-Producer</role><tracks></tracks></artist><artist><id>5366</id><name>Vikter Duplaix</name><anv></anv><join></join><role>Featuring, Producer, Arranged By, Programmed By, Performer</role><tracks></tracks></artist><artist><id>21363</id><name>James Poyser</name><anv></anv><join></join><role>Keyboards, Guitar</role><tracks></tracks></artist><artist><id>280843</id><name>Rick Essig</name><anv>RCE</anv><join></join><role>Mastered By</role><tracks></tracks></artist><artist><id>22432</id><name>Wadud</name><anv></anv><join></join><role>Vocals [Special Guest Vocalist]</role><tracks></tracks></artist><artist><id>21363</id><name>James Poyser</name><anv>J. Poyser</anv><join></join><role>Written-By</role><tracks></tracks></artist><artist><id>5366</id><name>Vikter Duplaix</name><anv>V. Duplaix</anv><join></join><role>Written-By</role><tracks></tracks></artist><artist><id>597949</id><name>Wadud Ahmad</name><anv>W. Ahmed</anv><join></join><role>Written-By</role><tracks></tracks></artist></extraartists>
=cut

sub extraartists {
  my ($self, $dom, $parent) = @_;
  my $position = 1;
  my %roles = ();
  my %data = ();
  $dom->find('artist')->map(sub {
    my $role = $_->at('role')->text;
    my $roles_aid = $roles{$role} ||= $self->model->roles(split_role($role))->{aid};
    my $anv = $_->at('anv');
    my $join = $_->at('join');
    push @{$data{$roles_aid}}, {id => $_->at('id')->text, position=>$position++, anv=>$anv && $anv->text || undef, join_relation=>$join && $join->text || undef,};
  
  });
  $position = 1;
  my @data = ();
  for my $roles_aid (sort {$data{$a}[0]{position} <=> $data{$b}[0]{position}} keys %data) {
    for my $artist (@{$data{$roles_aid}}) {
      push @data, $self->model->extraartists(roles_aid=>$roles_aid, parent_aid=>$parent->{aid}, position=>$position++, artist_aid => $self->model->artist_id($artist->{id})->{aid}, anv=>$artist->{anv}, join_relation=>$artist->{join_relation},);
    }
  }
  return \@data;
}

1;