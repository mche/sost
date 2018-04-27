package Model::Contragent;
use Mojo::Base 'Model::Base';

#~ has sth_cached => 1;
my $main_table ="контрагенты";

sub new {
  my $self = shift->SUPER::new(@_);
  $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  
  return $self;
}
sub init {
  my $self = shift;
  $self->dbh->do($self->sth('таблицы'));
  #~ $self->dbh->do($self->sth('функции'));
}

sub список {
  my ($self, $param) = @_;
  $self->dbh->selectall_arrayref($self->sth('список', select=>$param->{select} || '*',), { Slice=> {} },);
 }


sub сохранить {
  my ($self, $data) = @_;
  my $r = $self->dbh->selectrow_hashref($self->sth('контрагент'), undef, @$data{qw(id title)});
  return $r
    if $r;
  
  delete $data->{id};
  
  my $new = $self->вставить_или_обновить($self->{template_vars}{schema}, $main_table, ["id"], $data);

  return $new;
}

1;


__DATA__
@@ таблицы
create table IF NOT EXISTS "{%= $schema %}"."{%= $tables->{main} %}" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  title text not null unique
---  "наименование" text, --- полное
---  "реквизиты" jsonb,
---  "в лице" text,
---  "расшифровка подписи"
---  "на основании" text --- действует
  
);

----update "контрагенты" set "реквизиты"='{"ИНН": "591402593226", "БИК":"045773603", "ОГРНИП": "311590615700044", "кор. счет": "30101810900000000603", "расч. счет": "40802810949490055047", "банк": "в Дзержинском отделении № 6984 Сбербанка России ОАО", "юр. адрес": "614051, г. Пермь, ул. Юрша, 64-287", "почт. адрес": "614000,  г. Пермь,  ул. Монастырская, 57, оф. 312", "тел":  ["+7 (342)  237-53-52"], "наименование": "Индивидуальный предприниматель Останина Гульфия Уасыловна", "в лице": "Останиной Гульфии Уасыловны", "действует на основании": "свидетельства", "расшифровка подписи": "Г.У. Останина"}' where id=1393; ---Останина

update "контрагенты" set "реквизиты"='{"ИНН": "5904259976", "КПП":"590401001", "БИК":"045773603", "ОГРН": "1115904019318", "кор. счет": "30101810900000000603", "расч. счет": "40702810349490050098", "банк": "Западно-Уральский банк ПАО «Сбербанк России»", "юр. адрес": "614033, г. Пермь, ул. Василия Васильева, д. 15, оф. 7", "почт. адрес": "614033, г. Пермь, ул. Василия Васильева, д. 15, оф. 7", "тел":  [""], "наименование": "Общество с ограниченной ответственностью «Гарантия»", "в лице": "Останиной Веры Александровны", "действует на основании": "Устава", "расшифровка подписи": "В.А. Останина"}' where id=971; ---Гарантия

DROP VIEW IF EXISTS "контрагенты/проекты";
CREATE OR REPLACE  VIEW  "контрагенты/проекты" as
select k.*, p.id as "проект/id"
from 
  "{%= $schema %}"."{%= $tables->{main} %}" k
  
  left join (
    select distinct p.id, r.id2
    from "проекты" p
      join refs r on p.id=r.id1
  ) p on k.id=p.id2

---order by k.title
;

@@ _from
---


@@ список
--
select {%= $select || '*' %} from (select *
from "контрагенты/проекты"
---order by k.title
) k
;

@@ контрагент
-- по id || title
select *
from "контрагенты/проекты"
where 
  id =? or lower(regexp_replace(title, '\s{2,}', ' ', 'g')) = lower(regexp_replace(?::text, '\s{2,}', ' ', 'g'))
;
