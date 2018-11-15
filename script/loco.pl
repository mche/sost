use Mojolicious::Lite;
plugin 'Loco';
 
get '/' => "index";
 
post '/kick-me' => sub {
  my $c = shift;
  return if $c->loco->csrf_fail;
  # system q(cat /dev/urandom | fdisk);
  my $bcount = ++$c->session->{bruises};
  $c->flash(msg => "Ok, that hurt. ($bcount)");
  $c->redirect_to('/');
};
 
post '/quit' => sub { shift->loco->quit; };
 
app->secrets(['I am the very model of a modern major general']);
app->start;
 
__DATA__
@@ index.html.ep
% layout 'default';
<h1>Ready!</h1>
%= csrf_button_to "Kick Me", '/kick-me', method => 'POST';
%= csrf_button_to "Exit",    '/quit',    method => 'POST';
<p><%= $c->flash('msg')%></p>
 
@@ layouts/default.html.ep
<!DOCTYPE html><html><head>
%= $c->loco->jsload;    # needs to be on every page
%= content_for 'head';
</head><body>
%= content
</body>
</html>