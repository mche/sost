use Mojo::Base -strict;
use Mojo::UserAgent;
use Mojo::Util qw(dumper url_escape decode);
use File::Basename;
use Getopt::Long;

=pod

# Кронить
##
# Global variables
SHELL=/bin/bash
#BASH_ENV=$HOME/.bashrc
PB='source ~/perl5/perlbrew/etc/bashrc; perlbrew use perl-5.26.1'
PATH=/sbin:/bin:/usr/sbin:/usr/bin
# чтобы день недели русский
LANG=ru_RU.utf8
WDAYHOUR=date +%a%H

20 9-23 * * * cd ~/проект;  pg_dump --no-owner -n public -U postgres guest |  gpg -q --batch --yes -e -r my@email.ru --trust-model always -z 9  > backup/$($WDAYHOUR).pg.dump.gpg 2>/dev/null
25 9-23 * * * eval $PB;  cd ~/проект; echo "start $($WDAYHOUR).pg.dump.gpg" >> log/cron-backup.log;  perl script/mailru-cloud.pl --file=backup/$($WDAYHOUR).pg.dump.gpg --path=backup --cred='login:************' 2>>log/cron-backup.log 

=cut

my %OPT = ();
GetOptions (map {$_.'=s' => \$OPT{$_};} qw(file cred path) )   # file - локальный путь к файлу, cred - пара login:pass, path - облачная папка (/ default) если ее нет, то автоматом создастся
  or die("Error in command line arguments\n");

my ($login, $pass) = split /:/, $OPT{cred} || '';
die '--cred=login:pass'
  unless $login && $pass;

$OPT{path} //= '';
$OPT{path} =~ s|^/||;
$OPT{path} =~ s|/$||;
$OPT{path} = '/'.$OPT{path};
$OPT{path} .= '/'
  unless $OPT{path} eq '/';

my $file = basename($OPT{file} || '')
  or die '--file=<local path>';

my $ua  = Mojo::UserAgent->new;
# Change name of user agent
$ua->transactor->name('Mozilla/5.0 (MS Windows 10.3; rv:59.0) Gecko/20100101 Firefox/59.0');
#~ $ua->transactor->name('Mozilla/5.0 (X11; Linux x86_64; rv:69.0) Gecko/20100101 Firefox/69.0');
$ua->max_redirects(5);

my $token = $ua->get("https://account.mail.ru/login")->result;
die "cant get [https://account.mail.ru/login]", dumper($token)
  unless $token->is_success && $token->code == 200;

my $content = $token->body;#->content->asset->slurp;
$token = ($content =~ /"csrf":\s*"(.+?)"/)[0]
  or die "нету token", $content;

#~ say "token: $token";
#~ exit;


#~ my $param = {
  #~ Domain => 'mail.ru',
  #~ FailPage => '',
  #~ Login => $login,
  #~ Password => $pass,#'',
  #~ new_auth_form => 1,
  #~ page => 'https://cloud.mail.ru/?from=promo',
  #~ saveauth => 1,
#~ };
my $param = {"Login"=>$login,"Password"=> $pass,"saveauth"=>"1","new_auth_form"=>"1","FromAccount" => "opener=account&twoSteps=1","act_token" =>$token,"page" => "https => //e.mail.ru/messages/inbox","back" => "1","lang" => "ru_RU"};

my $sign = $ua->post("https://auth.mail.ru/cgi-bin/auth" => {Accept => '*/*'} => form => $param)->result;

say $sign->body;
__END__


die "cant login: \n", dumper($sign)
  unless $sign->code == 200 || $sign->code == 302 && (my $redirect = $sign->headers->location);

die "cant login, check --cred [bad redirect=$redirect]"
  if $redirect && $redirect =~ m|/login|;

my $auth = $sign->code == 200 ? $sign : $ua->get($redirect)->result;
die "cant login [redirect=$redirect]", dumper($auth)
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

my $headers = {
  Referer=>url_escape(decode('UTF-8', "https://cloud.mail.ru/home$OPT{path}")),
  'X-Requested-With'=>'XMLHttpRequest',
  Origin=>'https://cloud.mail.ru',
  Accept=>'*/*',
  'Accept-Encoding'=>'gzip, deflate',
  'Accept-Language'=>'ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3',
};

 # Передача файла методом PUT
my $asset  = Mojo::Asset::File->new(path => $OPT{file});
my $tx     = $ua->build_tx(PUT => 'https://cloclo17-upload.cloud.mail.ru/upload/?cloud_domain=2&x-email=' . url_escape($auth->{email}) => $headers);
$tx->req->content->asset($asset);
$ua->start($tx);

die "cant upload:\n", dumper($tx->result)
  unless $tx->result->code =~ /^2/;

my $file_hash = $tx->result->body;

my $post = $ua->post('https://cloud.mail.ru/api/v2/file/add' => $headers, form=>{
  home=>decode('UTF-8', "$OPT{path}$file"),
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

die "cant upload:\n", dumper($post)
  unless $post->is_success;
  
say "DONE:\n", dumper($post->json);

__END__
POST https://cloud.mail.ru/api/v2/file/rename
home=/UNIOST/backup/Чт17.pg.dump.gpg
name=апр11.Чт17.pg.dump.gpg
conflict=rename
api=2
build=cloudweb-8874-62-8-6.201904161611
x-page-id=YpzHO0REqY
email=tdg09@mail.ru
x-email=tdg09@mail.ru