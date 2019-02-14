package Controll::Tg;
use Mojo::Base 'Mojolicious::Controller';

=pod
curl -vv -X POST "https://api.telegram.org/bot<    token с двоеточием       >/setWebhook" -F url="https://<       хост       >/tg/webhook/<    token с двоеточием       >"
curl -vv -X POST "https://api.telegram.org/bot<    token с двоеточием       >/deleteWebhook"


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
has commands => sub { [qw(start help inline)] };

sub webhook {
  my $c = shift;
  my $token = $c->stash('token');
  
  $c->app->log->error("Bad token=[$token]")
    and return $c->reply->not_found
    if $token ne $c->token;
  
  my $data = $c->req->json;
  
  $c->app->log->info($c->dumper($data));
  
  my $text = $data->{message}{text};
  my $send;
  eval {
    
    if ($data->{callback_query}) {
      $send = $c->answerCallbackQuery($data);
    } elsif ($text && (my $cmd = ($text =~ m|^/(\w+)|)[0])) {
      $send = $cmd ~~ $c->commands ? $c->$cmd($data) : $c->badcmd($data);
    } elsif ($data->{message}{contact}) {# передан телефон - регистрировать или уже занят или не найден
      $send = $c->contact($data);
    } elsif ($text && $text eq 'Удалить регистрацию') {
      $send = $c->delete_contact($data);
    } elsif ($text && $text eq 'Отмена') {
      $send = $c->remove_keyboard($data);
    } else {
      $send =  $c->menu($data);
    }
  };

  $c->app->log->error($@)
    if $@;
  ref $send eq 'ARRAY' ? map($c->minion->enqueue(tg_api_request => ['sendMessage' => $_]), @$send) : $c->minion->enqueue(tg_api_request => ['sendMessage' => $send])
    if $send;
  #~ $c->render(json=>$data);#{"ok"=>1}
  $c->render(json=>{"ok"=>\1});

  
}

sub badcmd {
  my ($c, $data) = @_;

  return {
    chat_id => $data->{message}{chat}{id},
    text    => 'Нет такой команды боту',
  };#, $cb);#
}

sub help {
  my ($c, $data) = @_;

  return {
    chat_id => $data->{message}{chat}{id},
    text    => 'Навигация по боту...',
  };#, $cb);#
  
}

sub start {
  my ($c, $data) = @_;

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
  
  return [
  {
    chat_id => $data->{message}{chat}{id},
    text => "Регистация завершена! Вы сотрудник: ". join(' ', @{$profile->[0]{names}}),
  },
  $c->remove_keyboard($data),
  ];
}

sub menu {#выбор действий
  my ($c, $data) = @_;
  my $profile = $c->model->профиль_контакта({user_id=>$data->{message}{from}{id}});
  return $c->start($data)# не рег
    unless @$profile;
  
  return {
    chat_id => $data->{message}{chat}{id},
    # Object: ReplyKeyboardMarkup
    text    => join(' ', @{$profile->[0]{names}}).", выберите действие", #" Выберите действие ",#.$data->{message}{chat}{first_name} || $data->{message}{chat}{last_name},
    #~ "parse_mode": "Markdown",
    "reply_markup" => {
    #~ "ReplyKeyboardMarkup" => {
      "one_time_keyboard"=> \1,
      "resize_keyboard" => \1, # \1 = true when JSONified, \0 = false
      "keyboard" => [
          # Keyboard: row 1
          [
              # Keyboard: button 1
              #~ " Привет, ".$data->{message}{chat}{first_name} || $data->{message}{chat}{last_name},
              
              {
                  text => 'Удалить регистрацию',
                  #~ request_contact => \1
              },
              {# Keyboard: button 2
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
  my $profile = $c->model->профиль_контакта({user_id=>$data->{message}{from}{id}});
  return {
    chat_id => $data->{message}{chat}{id},
    text => 'Ваш контакт не зарегистрирован',
  }  unless @$profile;
  
  my $del = $c->model->удалить_контакт($data->{message}{from}{id});
  return [
    {
      chat_id => $data->{message}{chat}{id},
      text => $del,
    },
    {
      chat_id => $data->{message}{chat}{id},
      text => 'Ваш контакт отписан от профиля: '. join(' ', @{$profile->[0]{names}}),,
    },
    $c->remove_keyboard($data),
  
  ];
}

sub remove_keyboard {
  my ($c, $data) = @_;
    return {
    chat_id => $data->{message}{chat}{id},
    text=>'OK',
    #~ "ReplyKeyboardRemove" => {
    "reply_markup" => {
      "remove_keyboard"=>\1,
    },
  };
}

sub inline {
  my ($c, $data) = @_;
  # 
    return {
    chat_id => $data->{message}{chat}{id},
    text    => 'inline test', #" Выберите действие ",#.$data->{message}{chat}{first_name} || $data->{message}{chat}{last_name},
    #~ "parse_mode": "Markdown",
    "reply_markup" => {# InlineKeyboardMarkup
      #~ "one_time_keyboard"=> \1,
      #~ "resize_keyboard" => \1, # \1 = true when JSONified, \0 = false
      "inline_keyboard" => [# Array of button rows, each represented by an Array of InlineKeyboardButton objects
          # Keyboard: row 1
          [
              {
                  text => 'Логин',
                  url => 'https://uniost.ru',
              },
              {# Keyboard: button 2
                  text => 'callback_data',
                  callback_data => 'data for callback'
              },
          ]
      ],
    }
  };
}

sub answerCallbackQuery {# https://core.telegram.org/bots/api#answercallbackquery
  my ($c, $data) = @_;
  return {
    chat_id => $data->{callback_query}{message}{chat}{id},
    callback_query_id=> $data->{callback_query}{id},
    text=>" from text: $data->{callback_query}{message}{text}; data:  $data->{callback_query}{data}",
    #~ show_alert	Boolean	Optional	If true, an alert will be shown by the client instead of a notification at the top of the chat screen. Defaults to false.
    #url	String	Optional	URL that will be opened by the user's client. If you have created a Game and accepted the conditions via @Botfather, specify the URL that opens your game – note that this will only work if the query comes from a callback_game button. Otherwise, you may use links like t.me/your_bot?start=XXXX that open your bot with a parameter.
    #~ cache_time	Integer	Optional	The maximum amount of time in seconds that the result of the callback query may be cached client-side. Telegram apps will support caching starting in version 3.14. Defaults to 0.
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
      'id' : ...,
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
      'id' : ...,
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
      'user_id' => ...
    },
    ...
    
@@ callback_data
{
  'callback_query' => {
    'chat_instance' => '-2380470308978289922',
    'data' => 'data for callback',
    'from' => {
      'first_name' => "Михаил",
      'id' => ...,
      'is_bot' => bless( do{\(my $o = 0)}, 'JSON::PP::Boolean' ),
      'language_code' => 'ru',
      'last_name' => "★"
    },
    'id' => '1900090128907129140',
    'message' => {
      'chat' => {
        'first_name' => "Михаил",
        'id' => ...,
        'last_name' => "★",
        'type' => 'private'
      },
      'date' => 1550119318,
      'from' => {
        'first_name' => 'UniOST',
        'id' => 699463837,
        'is_bot' => bless( do{\(my $o = 1)}, 'JSON::PP::Boolean' ),
        'username' => 'UniOSTbot'
      },
      'message_id' => 161,
      'text' => 'inline_kbd'
    }
  },
  'update_id' => 14798953
}

