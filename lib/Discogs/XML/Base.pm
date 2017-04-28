package Discogs::XML::Base;
use Mojo::Base 'Discogs::Base';
use Mojo::DOM;
use Mojo::Util qw(dumper);

has [qw(item_tag tag2col)];# artist label release master

#~ binmode( STDIN, ':utf8' );

sub stdin {
  my $self = shift;
  my $parser = Mojo::DOM->new->xml(1);#->charset('UTF-8');
  my $tag = $self->item_tag
    or die "Не указан [->item_tag]: artist | label | release | master";
  my $re = qr"(.+</$tag>)?(.+)?";
  #~ my $re = qr".*?</$tag>";

  my $buff;
  my $count = 0;
  LINE: while (my $line = <>) {
    utf8::decode($line);
    my ($close, $chunk) = $line =~ /$re/;
    #~ while ($line =~ s/($re)//g) { хуже пошло
      #~ $buff .= $1;
    if ($close) {
      $buff .= $close;
      for my $dom ($parser->parse($buff)->find($tag)->each) {
        my $r = $self->$tag($dom);
        if ($r->{id}) {
          $buff = '';
          say dumper($r);
          say STDERR $r->{id};
        #~ say STDERR $dom->content unless $r->{id};
          last LINE
            if $self->limit && ++$count >= $self->limit;
          }
      }
      #~ $buff = ''; не тут!
    }
    $buff .= $chunk
      if defined $chunk;
    #~ $buff .= $line; # остаток
    
  }
}

sub text {
  my ($self, $dom) = @_;
  my $text = $dom->text =~ s/\r\n?/\n/gr;
  $text =~ s/^\s+|\s+$//g;
  length($text) ? $text : undef;
}

sub child_nodes {
  my ($self, $dom) = @_;
  my %data = ();
  for my $node ($dom->child_nodes->each) {
    next 
      unless $node->tag;
    my $tag = lc($node->tag);
    $data{$self->tag2col->{$tag} || $tag} = $self->$tag($node)
      if $self->can($tag);
    
  }
  \%data;
}

sub data_quality {
  my ($self, $dom) = @_;
  my $text = $self->text($dom)
    or return undef;
  $self->model->data_quality($text)->{aid};
}

1;