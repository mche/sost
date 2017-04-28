package Discogs::XML::Release::Formats;
use Mojo::Base 'Discogs::Base';

=pod

<formats><format text="" name="Vinyl" qty="1"><descriptions><description>12"</description></descriptions></format></formats>

=cut

sub formats {
  my ($self, $dom, $release) = @_;
  my $position = 1;
  [ $dom->find('format')->map(sub {
    my @desc = $_->find('description')->map('text')->each;
    my $data = {
      format_aid => $self->model->формат($_->attr('name'))->{aid},
      qty => $_->attr('qty'),
      position => $position++,
      release_aid=>$release->{aid},
      descriptions => @desc ? \@desc : undef,
    };

    $self->model->releases_formats(%$data);
  })->each ];
  
}

1;