package Model::Transport;
use Mojo::Base 'Model::Base';

#~ has sth_cached => 1;
has [qw(app)];
#~ has model_obj => sub {shift->app->models->{'Object'}};

sub new {
  state $self = shift->SUPER::new(@_);
  #~ $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  $self->dbh->do($self->sth('таблицы'));
  #~ $self->dbh->do($self->sth('функции'));
  return $self;
}

sub список_транспорта {
  my ($self, $category, $contragent) = @_;
  $self->dbh->selectall_arrayref($self->sth('список или позиция транспорта'), {Slice=>{}}, (undef) x 2, ($category) x 2, ($contragent) x 2);
  
}

sub сохранить_транспорт {
  my ($self, $data) = @_;
  my $prev = $self->позиция_транспорта($data->{id})
    if $data->{id};
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, "транспорт", ["id"], $data);
  $prev ||= $self->позиция_транспорта($r->{id});
  
  map {# прямые связи
    if ($data->{$_}) {
      my $rr= $self->связь_получить($prev->{"$_/id"}, $r->{id});
      $r->{"связь/$_"} = $rr && $rr->{id}
        ? $self->связь_обновить($rr->{id}, $data->{$_}, $r->{id})
        : $self->связь($data->{$_}, $r->{id});
    } 
    #~ else {# можно чикать/нет
      #~ $self->связь_удалить(id1=>$prev->{"$_/id"}, id2=>$r->{id});
    #~ }
  } qw(категория);
  
  return $self->позиция_транспорта($r->{id});
}

sub позиция_транспорта {
  my ($self, $id) = @_;
  $self->dbh->selectrow_hashref($self->sth('список или позиция транспорта'), undef, ($id) x 2, (undef) x 4);
}

sub сохранить_заявку {
  my $self = shift;
  my $data = ref $_[0] ? shift : {@_};
  my $prev = $self->позиция_заявки($data->{id})
    if $data->{id};
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, "транспорт/заявки", ["id"], $data);
  $prev ||= $self->позиция_заявки($r->{id});
  
  
  return $self->позиция_заявки($r->{id});
}

sub позиция_заявки {
  my ($self, $id) = @_; # $wallet2 - флажок внутреннего перемещения
  $self->dbh->selectrow_hashref($self->sth('список или позиция заявок'), undef, ($id) x 2,);
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
id1("транспорт")->id2("транспорт/заявки")
*/
);

create table IF NOT EXISTS "{%= $schema %}"."транспорт/заявки" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  "дата1" date not null, --от
  "дата2" date null, -- до
---  "дата3" timestamp without time zone, --- когда фактически отработана/закрыта заявка
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
id1("транспорт")->id2("транспорт/заявки")
*/
);

@@ список или позиция транспорта
select t.*, cat.id as "категория/id", cat.parents_title || cat.title as "категории", cat.parents_id as "категории/id",
  con.id as "перевозчик/id", con.title as "перевозчик"
from "транспорт" t
  join refs r on t.id=r.id2
  join "категории/родители"() cat on cat.id=r.id1
  
  left join (-- перевозчика транспорт или наш
    select z.t_id, con.*
    from (
      select r.id1 as t_id, max(z.id) as z_id
      from refs r
        join "транспорт/заявки" z on z.id=r.id2 ---только отработанные заявки?
      group by r.id1
    ) z 
    join refs r on z.z_id=r.id2
    join "контрагенты" con on con.id=r.id1
  
  ) con on t.id=con.t_id
where 
----cat.parents_id[1]=3
  (coalesce(?::int, 0)=0 or t.id=?)
  and (coalesce(?::int, 0)=0 or ?::int=any(cat.parents_id || cat.id))
  and (coalesce(?::int, 0)=0 or con.id=?)

;

@@ список или позиция заявок
select
from "транспорт/заявки" tz
  
