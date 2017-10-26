use Mojo::Base -strict;
use AnyEvent::HTTP;
use Data::Dumper;
#~ use Mojo::Util qw(url_escape);
use URI::Escape;
#~ use open IO=> ':encoding(UTF-8)';

$AnyEvent::HTTP::MAX_PER_HOST = 8;

my @data = do {
  local $/;
  my @d =  split /\s+/, <DATA>;
  close DATA;
  @d;
};

sub data {
  uri_escape_utf8  join " ", sort {int(rand(3))-1} @data;
}

my $cv = AnyEvent->condvar;
my $n=8;

sub req {
  
http_request(
   POST    => "http://saturn721.pythonanywhere.com",
   headers => { 
     "user-agent" => "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.105 Safari/537.36 Vivaldi/1.92.917.43",
     #~ 'Content-Length'=> 131,
     'Content-Type'=> 'application/x-www-form-urlencoded',
    'Cookie' => 'csrftoken=akwQDI27sFgUdkqIEp0LOGw4Aeh832iRx3HXYbtxxkFddcJh2BUME1abojxEq8JI',
    'Accept'=> '*/*',
    },
    on_header => sub {
      #~ say  "On header",Dumper  \@_;
      say STDERR $n++, "\t", shift->{Reason};
      1;
    },
    body => "csrfmiddlewaretoken=cR29NHA9CNVUSVsEcqejzQvmLbSWcE8kzAdg8a1zHskdSNLdAC8kpb9tzg8szKzb&author=terry%20pratchett&email=terry%40pratchet.com&title=how&message=".data(),
   timeout => 30,
   persistent =>1,
   keepalive => 1,
   sub {
     my ($body, $hdr) = @_;
     #~ say Dumper $hdr;
    #~ say $body;
    req();
    #~ $cv->send
      #~ if ++$n eq 10000;
      #~ 
     #~ if ($hdr->{Status} =~ /^2/) {
        #~ say $body;
     #~ } else {
        #~ say "error, $hdr->{Status} $hdr->{Reason}";
     #~ }
  },);
}
    #~ and warn $_
    req()
    for 1..$n;


#~ http_request
   #~ HEAD    => "https://www.google.com",
   #~ headers => { "user-agent" => "MySearchClient 1.0" },
   #~ timeout => 30,
   #~ on_header => sub {
      #~ say @_;
      #~ 1;
    #~ },
   #~ sub {
      #~ my ($body, $hdr) = @_;
      #~ say Dumper $hdr;
      #~ say $body;
      #~ $cv->send;
   #~ }
#~ ;

$cv->recv;

say STDERR "done";

__DATA__
I'M OLEG
GOOD NEWS, EVERYONE!
SKILLS
EDUCATION
EXPIERENCE
PORTFOLIO
ARTICLES
PRICING
CONTACTS
ПРИВЕТ, МЕНЯ ЗОВУТ
ОЛЕГ БЕЗГАЧЕВ
ЛУЖУ, ПОЯЮ, САЙТЫ ВЕРСТАЮ
Привет всем. От хорошего человека и замечательного работника. Курган, РОССИЯ. У меня нет высоких рангов и статусных образований. Я просто живу в стране, в которой лучше уметь все. А главное, выживать и оставаться оптимистом.
РЕЗЮМЕ КОНТАКТЫ
СПОСОБНОСТИ
Наладка и ремонт промышленного сварочного и газоплазморезательного оборудования. Различных отечественных и иностранных марок
90%
Резьба по дереву. Ручная работа. Изготовление домашней посуды и утвари, декоративных украшений.
70%
Копирайт и рерайт текстов. Нейминг. Написание статей на заказ и по выбранным темам. Продано более 100 статей на крупнейшей бирже textsale.ru. Выполнение творческих заданий на ресурсе e-generator.ru. Совместные переводы на translatedby.com.
60%
Верстка. HTML, CSS, JQuery. Верстаю и буду верстать. Да прибудет со мной Патрег. Активно осваиваю вебверстку из шаблонов. Этот сайт может третья версия личной страницы и вторая, которая верстается из шаблона. Хотя творчески перерабатывается
10%
ОБРАЗОВАНИЕ
Курганский Машиностроительный Техникум.
БЛОГ
ПРИМЕРЫ РЕЗЬБЫ
 img
Резные ложки свадебные ручной работы. Из целого куска дерева.

 img
Славянские боги-идолы. Различной тематики. Это Дедушка-леший.

СТАТЬИ
click me click me click me click me click me click me 

﻿Яровой чеснок

﻿Если ваш чеснок гниет посреди зимы. Если высыхает до состояния одной шелухи. Или начинает пускать ростки. То вам стоит посмотреть в сторону ярового чеснока. Он менее распространен, чем свой озимый собрат.

КОНТАКТЫ
imgLOCATION
Курган Курганская область
Россия
imgCONTACTS
saturn721@gmail.com
страница в постоянной разработке
    
Ваше имя
    
Ваш email
    
Тема сообщения
    
Введите здесь ваше сообщение
 Отправить