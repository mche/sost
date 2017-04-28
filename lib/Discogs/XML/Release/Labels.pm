package Discogs::XML::Release::Labels;
use Mojo::Base 'Discogs::Base';

=pod

<labels><label catno="LAR-043" name="Large Records"/></labels>

=cut

sub labels {
  my ($self, $dom) = @_;
  my $position = 1;
  [ $dom->find('label')->map(sub {
    
    my $data = $self->label->label_link($_);
    $data->{position} = $position++;
    $data;
  })->each ];
  
}

1;