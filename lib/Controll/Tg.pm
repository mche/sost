package Controll::Tg;
use Mojo::Base 'Mojolicious::Controller';
use WWW::Telegram::BotAPI;

has model => sub { shift->app->models->{'Tg'} };
has token => sub { shift->app->config->{'tg UniOST bot token'} };
has api => sub {
  WWW::Telegram::BotAPI->new(
    token => shift->token,
      #~ async => 1 # WARNING: may fail if Mojo::UserAgent is not available!
  );
};
has commands => sub { [qw(start)] };

sub webhook {
  my $c = shift;
  my $token = $c->stash('token');
  
  $c->app->log->error("Bad Tg token=[$token]")
    and return $c->reply->not_found
    if $token ne $c->token;
  
  my $data = $c->req->json;
  
  $c->app->log->info($c->dumper($data));
  
  if ($data->{message}{text} && (my $cmd = ($data->{message}{text} =~ m|^/(\w+)|)[0])) {
    $cmd ~~ $c->commands ? $c->$cmd($data) : $c->nocmd($data);
  }
  
  $c->render(json=>$data);#{"ok"=>1}
}

sub nocmd {
  my ($c, $data) = @_;
  $c->api->sendMessage({
    chat_id => $data->{message}{chat}{id},
    text    => 'Нет такой команды боту',
  });
}

sub start {
  my ($c, $data) = @_;
  $c->api->sendMessage({
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
  });
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
