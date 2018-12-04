package Controll::Util;
use Mojo::Base 'Mojolicious::Controller';
#~ use Mailru::Cloud;
use Mojo::UserAgent;
use Mojo::Util qw(url_escape url_unescape decode encode);

#~ $ENV{MOJO_MAX_MESSAGE_SIZE} = 0;

has model => sub {shift->app->models->{'Util'}};
has ua => sub {
  my $ua  = Mojo::UserAgent->new;
  # Change name of user agent
  $ua->transactor->name('Mozilla/5.0 (Windows 10; rv:63.0) Gecko/20100101 Firefox/63.0');
  $ua->max_redirects(5);
  return $ua;
};

#~ sub new {
  #~ my $c = shift->SUPER::new(@_);
  #~ $c->app->log->error($c);
  #~ local $ENV{MOJO_MAX_MESSAGE_SIZE} = 0;
  #~ return $c;
  
#~ }

=pod
Путь в облаке создается

cat ~/hello.mp3 |  curl  -F "file=@-"  -F "path=/UNIOST/test/test.mp3"  https://uniost.ru/mailru/upload
=cut

sub mailru_upload {
  my ($c) = @_;
  #~ $c->req->max_message_size(0);
  my ($login, $pw) = eval {split ':', $c->app->JSON->decode($c->model->_select($c->model->{template_vars}{schema}, 'разное', ["key"], {'key'=> 'mailru'})->{val})}
    or return $c->render(json=>{error=>"Нету login:pass [$@]"});
  my $path = Mojo::Path->new($c->param('path') || return $c->render(text=>"Нету параметра [path] в облако".$c->dumper($c->req)))->leading_slash(1)->trailing_slash(0);
  #~ utf8::downgrade($path);
  #~ $c->app->log->error($c->dumper("https://cloud.mail.ru/home$path"));
  #~ my $file_name = Mojo::Path->new($c->param('file_name') || return $c->render(json=>{error=>"Нету параметра [file_name] в облако"}))->leading_slash(1)->trailing_slash(0);
  my $asset = eval {$c->req->upload('file')->asset}
    || return $c->render(json=>{error=>"Нету содержимого [file] в облако"});

  #Authorize on cloud.mail.ru
  my $auth = $c->_mailru_login($login, $pw);
  return $c->render(json=>{error=>"Cant login on mail.ru: $auth"})
    unless ref $auth;
  
  my $headers = {
    Referer=>url_escape(decode('UTF-8', "https://cloud.mail.ru/home")),
    'X-Requested-With'=>'XMLHttpRequest',
    Origin=>'https://cloud.mail.ru',
    Accept=>'*/*',
    'Accept-Encoding'=>'gzip, deflate',
    'Accept-Language'=>'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
  };
  
  my $ua = $c->ua;
   # Передача файла методом PUT
  my $tx     = $ua->build_tx(PUT => 'https://cloclo17-upload.cloud.mail.ru/upload/?cloud_domain=2&x-email=' . url_escape($auth->{email}) => $headers);
  $tx->req->content->asset($asset);
  $c->ua->start($tx);

  return $c->render(json=>{error=>"cant upload:\n". $c->dumper($tx->result)}) 
    unless $tx->result->code =~ /^2/;

  my $file_hash = $tx->result->body;

  my $post = $ua->post('https://cloud.mail.ru/api/v2/file/add' => $headers, form=>{
    home=>"$path",#не идет utf8
    hash=>$file_hash,
    size=>$asset->size,#(stat $file)[7],
    conflict=>'rewrite', #'rename',
    api=>2,
    build=>$auth->{build},
    'x-page-id'=>$auth->{'x-page-id'},
    email=>$auth->{email},
    'x-email'=>$auth->{email},
    token=>$auth->{token},
      
  })->res;

  return $c->render(json=>{error=>"cant upload:\n". $c->dumper($post)})
    unless $post->is_success;
  
  $c->render(json=>{success=> $c->dumper($post->json)});
}

sub _mailru_login {
  my ($c, $login, $pass) = @_;
  
  my $param = {
    Domain => 'mail.ru',
    FailPage => '',
    Login => $login,
    Password => $pass,#'',
    new_auth_form => 1,
    page => 'https://cloud.mail.ru/?from=promo',
    saveauth => 1,
  };
  
  my $ua = $c->ua;

  my $sign = $ua->post("https://auth.mail.ru/cgi-bin/auth?lang=ru_RU&from=authpopup" => {Accept => '*/*'} => form => $param)->result;

  return "cant login: \n". $c->dumper($sign)
    unless $sign->code == 200 || $sign->code == 302 && (my $redirect = $sign->headers->location);

  return "cant login, check --cred [bad redirect=$redirect]"
    if $redirect && $redirect =~ m|/login|;

  my $auth = $sign->code == 200 ? $sign : $ua->get($redirect)->result;
  return "cant login [redirect=$redirect]". $c->dumper($auth)
    unless $auth->is_success;

  my $content = $auth->body;#->content->asset->slurp;
  $auth->{token} = ($content =~ /"csrf":\s*"(.+?)"/)[0]
    or die "cant get token", $content;
  $auth->{email} = ($content =~ /"email":\s*"(.+?)"/)[0]
    or die "cant get build string";
  $auth->{build} = ($content =~ /"build":\s*"(.+?)"/i)[0]
    or die "cant get build string";
  $auth->{'x-page-id'} = ($content =~ /"x-page-id":\s*"(.+?)"/i)[0]
    or die "cant get x-page-id string";

  #TODO
  $auth->{space} = [($content =~ /"space":\s*\{(.+?)\}/)];
  return $auth;
}

1;