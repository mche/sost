use Mojo::Base -strict;
use Expect;
use Audio::Wav;

=pod

=head1 DESCRIPTION

Send/play a wav file trough linhonec sipphone.
First launch linphone GUI and configure (proxy, auth ...)

=head1 USAGE

  perl $0  <sip number/addr/destination> <path/to/file.wav> [<waiting call timeout, sec(defaults 20)>] [<optional linphonec args> ...]
  # example
  perl linhonec-wav.pl 101 ~/output2.wav
  # cp ~/.linphonerc ~/.linphonerc5062
  perl linhonec-wav.pl 101 ~/output2.wav' 17 -c ~/.linphonerc5062

=cut


my $phone = shift @ARGV;
my $wav = shift @ARGV;#'../../output2.wav';
my $wait = shift(@ARGV) || 20;
my @cmd = ('linphonec', @ARGV);# '-c', '../.linphonerc5062');# конфиг файл нужен для параллельных звонков

my $wav_info = eval {wav_info($wav)}
  or say "Ошибка [$wav]: $@"
  and exit(1);


my $exp = Expect->spawn(@cmd)
  or say "Ошибка команды @cmd: $!\n"
  and exit(2);

#~ $exp->raw_pty(1);
$exp->log_stdout(0);
my $fh = $exp->log_file(\&log);

say $exp "soundcard use files";# только в этом режиме посылает wav
say $exp "play $wav";# проигрывание начнется сразу при поднятии трубки, или можно эту команду когда поднялась трубка (ниже)
say $exp "call $phone";
my %call=(started=>time);
my @log = ("[CALL START $call{started}]\n");
$exp->expect($wait,# будет ждать эту строку как весь вызов
  [ qr/^Call failed|User is\s*\w*\s*unavailable|Could not create call|Could not call/im => \&failed,],
  [ qr/^Call answered/im => \&answered ],
  [ qr/User is busy/im => \&busy ],
);

push @log, "[NO ANSWER]\n"
  and quit()
  unless $call{'answered'} || $call{'failed'} || $call{'busy'};

say @log;

################ SUBS ###################

sub wav_info {
  my $path = shift;
  my $w = Audio::Wav->new;
  my $info = $w->read($path)
    or return;
  my $details = $info->details;
  #~ $details->{filesize}=$info->length;
  #~ $details->{duration}=$info->length_seconds;
  #~ $details->{metadata}=$info->get_info;
  return $details;
}

sub quit {
  say $exp "terminate"
    and $call{'terminated'}=time
    unless $call{'terminated'} || $call{'failed'} || $call{'busy'};
   say $exp "quit";# close handler
  #~ 
   #~ push @log, "[QUIT linphonec]";
}

sub failed {
  my $exp = shift;
  $call{'failed'}=time;#
  push @log, "[CALL FAILED $call{'failed'}] @{[ $exp->match() ]}\n";
  quit();
  exp_continue;
}

sub terminated {
  my $exp = shift;
  $call{'terminated'} = time;
  push @log, "[CALL TERMINATED $call{'terminated'} (@{[ $call{'terminated'}-$call{'answered'} ]})]\n";
  exp_continue;
}

sub answered {
  my $exp = shift;
  $call{'answered'}=time;# начало прослушки ролика
  push @log, "[CALL ANSWERED $call{'answered'}]\n";
  # проследить бросание трубки
  $exp->expect(
    int($wav_info->{length})+1, # длительность wav ролика
    [ qr/^Call terminated/im => \&terminated ],
  );
  quit();
  exp_continue;
  
}

sub busy {
  my $exp = shift;
  $call{'busy'}=time;# начало прослушки ролика
  push @log, "[USER IS BUSY $call{'busy'}]\n";
  quit();
  exp_continue;
}

sub log {   push @log, @_; }