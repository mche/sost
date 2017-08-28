package Model::Transport;
use Mojo::Base 'Model::Base';

#~ has sth_cached => 1;
has [qw(app)];
#~ has model_obj => sub {shift->app->models->{'Object'}};

sub new {
  state $self = shift->SUPER::new(@_);
  #~ $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  #~ $self->dbh->do($self->sth('таблицы'));
  #~ $self->dbh->do($self->sth('функции'));
  return $self;
}

1;


__DATA__
@@ таблицы
create table IF NOT EXISTS "{%= $schema %}"."транспорт" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  "title" varchar not null,
  "descr" text null
/* связи:
id1("категории")->id2("транспорт")
не тут id1("контрагенты")->id2("транспорт") --- если внешний транспорт (наш транспорт без этой связи)
*/
);

create table IF NOT EXISTS "{%= $schema %}"."транспорт/заявки" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  "дата1" date not null,
  "дата2" date null,
  "откуда" text,
  "куда" text, --- null если связь с нашим объектом
  "груз" text, 
  "стоимость" money,
  "тип стоимости" int, --- 0 - вся сумма, 1- за час, 2 - за км
  "факт" numeric, --- часов или км
  --- сумма="стоимость"*(coalesce("факт",1)^"тип стоимости"::boolean::int)
  "коммент" text
/* связи:
id1("объекты")->id2("транспорт/заявки") --- куда если на наш объект (внутренний получатель)
id1("контрагенты")->id2("транспорт/заявки") --- перевозчик (внешний транспорт)
id1("транспорт/заявки")->id2("контрагенты") --- если внешний получатель
id1("транспорт")->id2("транспорт/заявки") --- конкретно транспорт
id1("категории")->id2("транспорт/заявки") --- если еще не указан транспорт (после установки транспорта категория тут разрывается - сам транспорт связан с категорией)
*/
);


