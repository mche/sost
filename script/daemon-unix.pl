 use HTTP::Daemon::UNIX;

 # arguments will be passed to IO::Socket::UNIX, but Listen=>1 and
 # Type=>SOCK_STREAM will be added by default. also, HTTP::Daemon::UNIX will try
 # to delete stale socket first, for convenience.
 my $d = HTTP::Daemon::UNIX->new(Local => "/home/guest/mytest.sock");

 # will print something like: "http:path/to/unix.sock"
 print "Please contact me at: <URL:", $d->url, ">\n";

 # after that, use like you would use HTTP::Daemon
 while (my $c = $d->accept) {
     while (my $r = $c->get_request) {
         #~ if ($r->method eq 'GET' and $r->uri->path eq "/xyzzy") {
             #~ # remember, this is *not* recommended practice :-)
             #~ $c->send_file_response("/etc/passwd");
         #~ } else {
             #~ $c->send_error(RC_FORBIDDEN);
          $c->send_redirect( '/foo/bar' );
         #~ }
     }
     $c->close;
     undef($c);
 }