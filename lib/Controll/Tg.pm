package Controll::Tg;
use Mojo::Base 'Mojolicious::Controller';

has model => sub { shift->app->models->{'Tg'} };
has token => sub { shift->app->tg->{token} };
#~ has api => sub {
  #~ require WWW::Telegram::BotAPI;
  #~ WWW::Telegram::BotAPI->new(
    #~ token => shift->token,
    #~ async => 1 # WARNING: may fail if Mojo::UserAgent is not available!
  #~ );
#~ };
has commands => sub { [qw(start)] };

sub webhook {
  my $c = shift;
  my $token = $c->stash('token');
  
  $c->app->log->error("Bad token=[$token]")
    and return $c->reply->not_found
    if $token ne $c->token;
  
  my $data = $c->req->json;
  
  #~ $c->app->log->info($c->dumper($data));
  
  if ($data->{message}{text} && (my $cmd = ($data->{message}{text} =~ m|^/(\w+)|)[0])) {
    my $send = $cmd ~~ $c->commands ? $c->$cmd($data) : $c->badcmd($data);
    $c->minion->enqueue(tg_api_request => ['sendMessage' => $send]);
  } elsif ($data->{message}{contact}) {# передан телефон - регистрировать или уже занят или не найден
    $c->minion->enqueue(tg_api_request => ['sendMessage' => $c->contact($data)]);
    
  }
  

=pod
  $c->render_later;
  #~ my $res={};
  my $cb = sub {
    my ($ua, $tx) = @_;
    #~ $c->render(json=>$res)
      #~ unless $ua;
     $c->app->log->error($tx->error)
      if $tx->error;
    #~ say $tx->res->json->{ok} ? 'YAY!' : ':('; # Not production ready!
    $res = $tx->res->json;
    return $c->render(json=>$res)
      if $res;
    $c->render(json=>{error=>$tx->error || 'Ошибка запроса АПИ'});
  };

  if ($data->{message}{text} && (my $cmd = ($data->{message}{text} =~ m|^/(\w+)|)[0])) {
    $cmd ~~ $c->commands ? $c->$cmd($data, $cb) : $c->badcmd($data, $cb);
  }
  Mojo::IOLoop->start unless Mojo::IOLoop->is_running;
=cut
  
  $c->render(json=>$data);#{"ok"=>1}

  
}

sub badcmd {
  my ($c, $data, $cb) = @_;
  #~ $c->api->sendMessage(
  return {
    chat_id => $data->{message}{chat}{id},
    text    => 'Нет такой команды боту',
  };#, $cb);#
}

sub start {
  my ($c, $data, $cb) = @_;
  #~ $c->api->sendMessage(
  return {
    chat_id => $data->{message}{chat}{id},
    # Object: ReplyKeyboardMarkup
    text    => " Привет, ".$data->{message}{chat}{first_name} || $data->{message}{chat}{last_name},
    #~ "parse_mode": "Markdown",
    "reply_markup" => {
      "one_time_keyboard"=> \1,
      "resize_keyboard" => \1, # \1 = true when JSONified, \0 = false
      "keyboard" => [
          # Keyboard: row 1
          [
              # Keyboard: button 1
              #~ " Привет, ".$data->{message}{chat}{first_name} || $data->{message}{chat}{last_name},
              # Keyboard: button 2
              {
                  text => 'Подписаться через мой номер телефона',
                  request_contact => \1
              },
              "Отмена",
          ]
      ],
  }
  };#, $cb);
}

# обработка посланного телефона
sub contact {
  my ($c, $data, $cb) = @_;
  return {
    chat_id => $data->{message}{chat}{id},
    text => $c->dumper($data->{message}{contact}),
  };
}


1;

__END__

# Asynchronous request are supported with Mojo::UserAgent.
$api = WWW::Telegram::BotAPI->new (
    token => 'my_token',
    async => 1 # WARNING: may fail if Mojo::UserAgent is not available!
);
$api->sendMessage ({
    chat_id => 123456,
    text    => 'Hello world!'
}, sub {
    my ($ua, $tx) = @_;
    die 'Something bad happened!' if $tx->error;
    say $tx->res->json->{ok} ? 'YAY!' : ':('; # Not production ready!
});
Mojo::IOLoop->start;

{
  'message' => {
    'chat' => {
      'first_name' : "Михаил",
      'id' : 442399207,
      'last_name' : "★",
      'type' : 'private'
    },
    'date' : 1549887761,
    'entities' : [
      {
        'length' : 6,
        'offset' : 0,
        'type' : 'bot_command'
      }
    ],
    'from' : {
      'first_name' : "Михаил",
      'id' : 442399207,
      'is_bot' : false,
      'language_code' : 'ru',
      'last_name' : "★"
    },
    'message_id' : 16,
    'text' : '/start'
  },
  'update_id' : 14798891
}

согласился отправить свой тел
{
  'message' => {
    'chat' => {
      ...
    },
    'contact' => {
      'first_name' => "Михаил",
      'last_name' => "★",
      'phone_number' => '+79223361468',
      'user_id' => 442399207
    },
    ...
