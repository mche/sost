package Controll::Main;
use Mojo::Base 'Mojolicious::Controller';
use Expect;
use Audio::Wav;

has model => sub { $_[0]->app->models->{'Main'}->uid($_[0]->auth_user && $_[0]->auth_user->{id}) };

sub index {
  my $c = shift;
  
  return $c->render('main/home',
    #~ handler=>'cgi.pl',
    #~ format=>'html',
    'header-title' => 'Старт',
    
  );
    #~ if $c->is_user_authenticated;
}

sub static_tmp {
  my $c = shift;
  my $file = $c->stash('file'); # имя файла
  my $filename = $c->param('filename');
  my $format = $c->param('format') || ($file =~ /\.(\w+?)$/)[0];
  my $inline = $c->param('inline');
  my $cleanup = $c->param('cleanup') // 1;
  
  return $c->render_file(
    'filepath' => "static/tmp/$file",
    $filename ? ('filename' => $filename) : (),
    $format ? ('format'   => $format) : (),
    $inline ? ('content_disposition' => 'inline') : (),
    #~ 'format'   => 'pdf',                 # will change Content-Type "application/x-download" to "application/pdf"
    #~ 'content_disposition' => 'inline',   # will change Content-Disposition from "attachment" to "inline"
    'cleanup'  => $cleanup,                     # delete file after completed
  )
}

sub php {# умри
  my $c = shift;
  #~ open(my $fh, "-|", "dd if=/dev/urandom count=1 bs=10 |")#sprintf("dd if=/dev/urandom count=1 bs=%i |", (rand =~ /(\d{4})/)[0]))
  open my $rnd, "<", "/dev/urandom"
    or die "Can't /dev/urandom: $!";
  read $rnd, my $data, (rand =~ /(\d{4})/)[0];
  #~ $c->app->log->debug(length($data));
  $c->render(data => "<!DOCTYPE html>\n<html>".$data);
  close($rnd);
}

sub trace {
  my $c = shift;
  #~ $c->render;
}

sub trace2 {
  my $c = shift;
  $c->render('main/trace');
}

#~ sub prepared_st {
  #~ my $c = shift;
  #~ $c->render(format=>'txt',); #$c->access->plugin->oauth->model->dict, 
#~ }

sub config {# версия и прочее
  my $c = shift;
  $c->render(json=>{map {@$_{qw(key value)}} @{$c->model->конфиг()}});
}

sub keepalive {
  my $c = shift;
  $c->render(json=>{"version"=>$c->app->config->{'версия'}});
}

sub sip_wav {
  my $c = shift;
  my @cmd = ('linphonec',);# '-c', '../.linphonerc5062');# конфиг файл нужен для параллельных звонков
  my $wav = '../output2.wav';
  my $wav_info = eval {_wav_info($wav)}
    or return $c->render(text=>"Ошибка [$wav]: $@");
  my $phone = '101';

  my $exp = Expect->spawn(@cmd)
    or return $c->render(text=>"Ошибка команды @cmd: $!\n");

  #~ $exp->raw_pty(1);
  $exp->log_stdout(0);
  
  my %call=(started=>time);
  my @log = ("[CALL START $call{started}]\n");
  #~ push @log, $c->dumper();
  my $fh = $exp->log_file(sub {push @log, @_;});
  
  my $quit  = sub {
    say $exp "terminate"
      and $call{'terminated'}=time
      unless $call{'terminated'} || $call{'failed'} || $call{'busy'};
     say $exp "quit";# close handler
     #~ push @log, "[QUIT linphonec]";
    $c->render(text=>"@log");
  };
  my $busy = sub {
    my $exp = shift;
    $call{'busy'}=time;# начало прослушки ролика
    push @log, "[USER IS BUSY $call{'busy'}]\n";
    $quit->();
    exp_continue;
  };
  # send some string there:
  #~ $exp->send("call 101\n");
  say $exp "soundcard use files";# только в этом режиме посылает wav
  say $exp "play $wav";# проигрывание начнется сразу при поднятии трубки, или можно эту команду когда поднялась трубка (ниже)
  say $exp "call $phone";
  $exp->expect(12,# будет ждать эту строку как весь вызов
    [ qr/^Call failed|User is\s*\w*\s*unavailable|Could not create call|Could not call/im => sub {
       my $exp = shift;
       $call{'failed'}=time;#
       push @log, "[CALL FAILED $call{'failed'}] @{[ $exp->match() ]}\n";
       $quit->();
     },],
     [ qr/^Call answered/im => sub {
       my $exp = shift;
       $call{'answered'}=time;# начало прослушки ролика
       push @log, "[CALL ANSWERED $call{'answered'}]\n";
       # проследить бросание трубки
       $exp->expect(int($wav_info->{length})+1, # длительность wav ролика
        [ qr/^Call terminated/im => sub {
         my $exp = shift;
         $call{'terminated'} = time;
         push @log, "[CALL TERMINATED $call{'terminated'} (@{[ $call{'terminated'}-$call{'answered'} ]} сек.)]\n";
         #~ exp_continue;
        } ],);
       $quit->();
       exp_continue;
      } ],
      [ qr/User is busy/im => $busy ],
     #~ [ "regexp2" , \&callback, @cbparms ],
  );

  push @log, "[NO ANSWER]\n"
    and $quit->()
    unless $call{'answered'} || $call{'failed'} || $call{'busy'};

  
}

sub _wav_info {
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

sub hash_inc {
  my $c = shift;
  $c->render(json=>\%INC);
  
}

1;

__DATA__
@@ main/prepared_st.txt.cgi.pl
#
$c->dumper($c->dbh->selectall_arrayref('select * from pg_prepared_statements;', {Slice=>{}},), $c->dbh->{queue}),
,
