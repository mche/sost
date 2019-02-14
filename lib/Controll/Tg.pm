package Controll::Tg;
use Mojo::Base 'Mojolicious::Controller';

=pod
curl -vv -X POST "https://api.telegram.org/bot<    token с двоеточием       >/setWebhook" -F url="https://<       хост       >/tg/webhook/<    token с двоеточием       >"
curl -vv -X POST "https://api.telegram.org/bot<    token с двоеточием       >/deleteWebhook"
# в группу; как получил chat_id группы не помню
curl -vv -X POST "https://api.telegram.org/bot<    token с двоеточием       >/sendMessage" -F chat_id="-329972771" -F text="привет всей группе"

=cut

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
  
  $c->app->log->info($c->dumper($data));
  
  if ($data->{message}{text} && (my $cmd = ($data->{message}{text} =~ m|^/(\w+)|)[0])) {
    my $send = $cmd ~~ $c->commands ? $c->$cmd($data) : $c->badcmd($data);
    $c->minion->enqueue(tg_api_request => ['sendMessage' => $send]);
  } elsif ($data->{message}{contact}) {# передан телефон - регистрировать или уже занят или не найден
    $c->minion->enqueue(tg_api_request => ['sendMessage' => $c->contact($data)]);
    
  } elsif ($data->{message}{text} && $data->{message}{text} eq 'Удалить регистрацию') {
    $c->minion->enqueue(tg_api_request => ['sendMessage' => $c->delete_contact($data)]);
  } else {
    $c->minion->enqueue(tg_api_request => ['sendMessage' => $c->menu($data)]);
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
  
  #~ $c->render(json=>$data);#{"ok"=>1}
  $c->render(json=>{"ok"=>\1});

  
}

sub badcmd {
  my ($c, $data) = @_;
  #~ $c->api->sendMessage(
  return {
    chat_id => $data->{message}{chat}{id},
    text    => 'Нет такой команды боту',
  };#, $cb);#
}

sub start {
  my ($c, $data) = @_;
  #~ $c->api->sendMessage(
  return {
    chat_id => $data->{message}{chat}{id},
    # Object: ReplyKeyboardMarkup
    text    => " Добро пожаловать, ".$data->{message}{chat}{first_name} || $data->{message}{chat}{last_name},
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
                  text => 'Регистрация (номер телефона)',
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
  my ($c, $data) = @_;
  
  my $profile = $c->model->профиль_контакта($data->{message}{contact});
  
  return {
    chat_id => $data->{message}{chat}{id},
    text => "Нет такого телефона сотрудника. Связаться с отделом кадров и занести номер в профиль",
  } unless @$profile;
  
  $profile->[0]{"tg_contact"} = $c->model->сохранить_контакт($profile->[0]{id}, $data->{message}{contact})
    unless $profile->[0]{"tg_contact"};
  
  return {
    chat_id => $data->{message}{chat}{id},
    text => "Регистация завершена на сотрудника: ". join(' ', @{$profile->[0]{names}}),
  };
}

sub menu {#выбор действий
  my ($c, $data) = @_;
  my $profile = $c->model->профиль_контакта({user_id=>$data->{message}{from}{id}});
  return $c->start($data)# не рег
    unless @$profile;
  
  return {
    chat_id => $data->{message}{chat}{id},
    # Object: ReplyKeyboardMarkup
    text    => $profile, #" Выберите действие ",#.$data->{message}{chat}{first_name} || $data->{message}{chat}{last_name},
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
                  text => 'Удалить регистрацию',
                  #~ request_contact => \1
              },
              {
                  text => 'Еще действие...',
                  #~ request_contact => \1
              },
              "Отмена",
          ]
      ],
    }
  };
}

sub delete_contact {# удалить рег контакт
  my ($c, $data) = @_;
  my $del = $c->model->удалить_контакт($data->{message}{from}{id});
  return {
    chat_id => $data->{message}{chat}{id},
    text => $del,
  }
};


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
      'phone_number' => '+79.......',
      'user_id' => 442399207
    },
    ...
