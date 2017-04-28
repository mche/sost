package Discogs::XML::Label;
use Mojo::Base 'Discogs::XML::Base';

has item_tag => 'label';
has pg_table => 'label';
has tag2col => sub { {parentlabel=>'_parent_label', sublabels=>'_sublabels'} };

sub label {
  my ($self, $dom) = @_;

  my $data = $self->child_nodes($dom);
  my $ret = eval {$self->model->_insert($self->pg_schema, $self->pg_table, undef, $data)}
    if $data->{id};
  warn $@
    if $@;
  return $ret || {};
}

sub id {
  my ($self, $dom) = @_;
  $self->text($dom);
  
}


sub sublabels {
=pod

<sublabels><label>Glasgow Underground Music</label><label>Glasgow Underground Recordings</label><label>Muzique Tropique</label></sublabels>

=cut
  my ($self, $dom) = @_;
  [ $dom->find('label')->map(sub {$self->text($_)})->each ];
}


sub urls {
=pod

<urls><url>http://www.bombthebass.com/</url><url>http://www.myspace.com/bombthebass  </url><url>http://www.brainwashed.com/btb</url><url>http://groups.yahoo.com/group/bomb_the_bass/</url><url>http://en.wikipedia.org/wiki/Bomb_The_Bass</url><url>https://soundcloud.com/bomb-the-bass</url><url>http://www.facebook.com/pages/Bomb-The-Bass/</url><url>http://twitter.com/bomb_the_bass</url><url>https://www.youtube.com/user/bombthebassHQ</url></urls>

=cut
  my ($self, $dom) = @_;
  [ $dom->find('url')->map(sub {$self->text($_)})->each ];
}



sub profile {
  shift->text(shift);
  
}

sub name {
  shift->text(shift);
  
}

sub parentlabel {
  shift->text(shift);
}

sub contactinfo {
  shift->text(shift);
}

1;