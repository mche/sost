use Mojo::Base -strict;
use JSON::PP;
my @models = do 'config/Config-Models.pm';

{
  dbh => sub {
    do 'config/Config-DB.pm';
  },
  init_models => sub {
    my $app = shift;
    map {
      my @names = split '\|', $_;
      my $class = load_class("Model::$names[0]");
      $class->new(app=>$app)->init()
        if $class;
    } @models;
  },
  models => sub {
    my $app = shift;
    return +{map {
      my @names = split '\|', $_;
      my $class = load_class("Model::$names[0]");
      my $model = $class->new(app=>$app)
        if $class;
      $app->log->info("create model [@names]");
      $model ? (map {$_ => $model} @names) : ();
    } @models, 
    };
  },
  json => sub { JSON::PP->new->utf8(0)->allow_nonref(1); },
  JSON => sub { shift->json },
  tg => sub {
    require WWW::Telegram::BotAPI;
    my $app = shift;
    WWW::Telegram::BotAPI->new(
      token => $app->tg_bot_token,
      async => 1 # WARNING: may fail if Mojo::UserAgent is not available!
    );
  },
};