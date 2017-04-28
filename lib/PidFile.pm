package PidFile;
use Mojo::Base::Che -base;
use FindBin qw($Bin $Script);

has pidfile => sub {sprintf "$Bin/$Script%s.pid", shift->append;};

has pid => $$;

has written => 0;

has append => '';

sub new {
  my $class = shift;
  my $self  = $class->SUPER::new(@_);
  die "Пид-файл [@{[ $self->pidfile ]}] уже есть"
    if -e $self->pidfile;
  $self->write;
}

sub write {
  my $self = shift;
  my $file = $self->pidfile;
  my $pid  = $self->pid;
  
  open my $fh, "> $file"
    or die "Не смог записать пид-файл [$file]: $!";
  print $fh "$pid\n";
  close $fh;
  $self->written(1);
  say "флажок пид-файл [$file] установлен";
  return $self;
}

sub DESTROY {
  my $self = shift;
  return unless $self->written && $$ eq $self->pid;
  unlink $self->pidfile;
  say "флажок пид-файл [@{[ $self->pidfile ]}] снят";
}

1;

=pod

=encoding utf-8

=head1 SINOPSYS

  use PidFile;
  
  my $pidfile = PidFile->new;# умрет если уже есть пидфайл "$FindBin::Bin/$FindBin::Script.pid"
  
  ...
  
  
  $pidfile = undef; # destroy удаляет пидфайл

=cut