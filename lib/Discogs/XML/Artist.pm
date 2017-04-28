package Discogs::XML::Artist;
use Mojo::Base 'Discogs::XML::Base';

has item_tag => 'artist';
has pg_table => 'artist';
has tag2col => sub { {groups=>'_groups', } };

sub artist {
  my ($self, $dom) = @_;

  my $data = $self->child_nodes($dom);
  my $ret = eval {$self->model->_insert($self->pg_schema, $self->pg_table,  undef, $data)}
    if $data->{id};
  warn $@
    if $@;
  return $ret || {};
}

sub id {
  my ($self, $dom) = @_;
  $self->text($dom);
  
}


sub members {
=pod

<members><id>499695</id><name>Fred Reeves</name><id>716506</id><name>Jeffrey Campbell</name><id>641415</id><name>Maurice Bailey</name><id>716503</id><name>Shiller Shaun Fequiere</name></members>

=cut
  my ($self, $dom) = @_;
  [ $dom->find('id')->map(sub {$self->text($_)})->each ];
}

sub groups {
=pod

<groups><name>Full Force Family</name><name>Hip-Hop Against Apartheid</name></groups>

=cut
  my ($self, $dom) = @_;
  [ $dom->find('name')->map(sub {$self->text($_)})->each ];
}

sub urls {
=pod

<urls><url>http://www.bombthebass.com/</url><url>http://www.myspace.com/bombthebass  </url><url>http://www.brainwashed.com/btb</url><url>http://groups.yahoo.com/group/bomb_the_bass/</url><url>http://en.wikipedia.org/wiki/Bomb_The_Bass</url><url>https://soundcloud.com/bomb-the-bass</url><url>http://www.facebook.com/pages/Bomb-The-Bass/</url><url>http://twitter.com/bomb_the_bass</url><url>https://www.youtube.com/user/bombthebassHQ</url></urls>

=cut
  my ($self, $dom) = @_;
  [ $dom->find('url')->map(sub {$self->text($_)})->each ];
}

sub aliases {
=pod

<aliases><name>Chrome &amp; Price</name><name>Iron Wobble</name><name>Pete Plastic</name><name>System Faith</name></aliases>

=cut
  shift->groups(shift);
  
}


sub namevariations {
=pod

<namevariations><name>FB</name><name>Feature Breeze</name><name>Futur Breeze</name><name>Future-Breeze</name></namevariations>

=cut
  shift->groups(shift);
  
}

sub profile {
  shift->text(shift);
  
}

sub name {
  shift->text(shift);
  
}

sub realname {
  shift->text(shift);
}

1;