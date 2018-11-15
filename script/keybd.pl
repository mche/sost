use warnings;
use strict;
use utf8;

=pod
use Glib;

my $main_loop = Glib::MainLoop->new;

Glib::IO->add_watch(fileno 'STDIN', [qw/in/], \&watch_callback, 'STDIN');    

#just to show it's non blocking
my $timer1  = Glib::Timeout->add(10000, \&timer_callback, undef, 1 );

$main_loop->run;

sub watch_callback {
#    print "@_\n";
    my ($fd, $condition, $fh) = @_;
    my $line = readline STDIN;
    print $line;
    #always return TRUE to continue the callback
    return 1;
}    

sub timer_callback {
   print "\t\t\t".time."\n";

}
__END__
=cut


=pod
use Term::ReadKey;
use threads;

$|++;
#ReadMode('cbreak');

# works non-blocking if read stdin is in a thread
my $thr = threads->new(\&read_in)->detach;

while(1){
print "test\n";
sleep 5;
}

#ReadMode('normal'); # restore normal tty settings


sub read_in {
        while(1) {
         my $char;
         if (defined ($char = ReadKey(0)) ) {
            print "\t\t$char->", ord($char),"\n";    
            #process key presses here
            if($char eq 'q'){exit}
            #if(length $char){exit}  # panic button on any key :-)
            }
          }
}

__END__ 

=cut

=pod
#OK
use Term::ReadLine;
my $term = Term::ReadLine->new('Simple Perl calc');
my $prompt = "Enter code: ";
my $OUT = $term->OUT || \*STDOUT;
while ( defined ($_ = $term->readline($prompt)) ) {
  #~ my $res = eval("package allowed_subs; $_");
  #~ warn $@ if $@;
  #~ print $OUT $res, "\n" unless $@;
  #~ $term->addhistory($_) if /\S/;
  print $OUT $_, "-OK!\n"
}

=cut

=pod

use 5.010;
use strict;
use Term::ReadKey;

ReadMode 4; # It will turn off controls keys (eg. Ctrl+c)

my $key; 

# It will create a child so from here two processes will run.
# So for parent process fork() will return child process id
# And for child process fork() will return 0 id

my $pid = fork(); 

# This if block will execute by the child process and not by 
# parent because for child $pid is 0     

if(not $pid){

   while(1){

        # Do your main task here
        say "hi I'm sub process and contains the main task";
        sleep 2;
    }
}

# Parent will skip if block and will follow the following code
while (1) {

   $key = ReadKey(-1); # ReadKey(-1) will perform a non-blocked read

   if($key eq 'q'){    # if key pressed is 'q'

      `kill -9 $pid`;   # then if will run shell command kill and kill
                        # the child process
       ReadMode 0;      # Restore original settings for tty.

       exit;            # Finally exit from script

    } elsif( $key eq 'h' ) {

         say "Hey! you pressed $key key for help";
    } elsif( $key ne '' ) {

        say "Hey! You pressed $key";
    }
}

=cut

use Term::ReadKey;
ReadMode 4; # Turn off controls keys
my $key;
while (not defined ($key = ReadKey(-1))) {
  1;
}
print "Get key $key", ord($key),"\n";
ReadMode 0; # Reset tty mode before exiting