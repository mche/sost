package Model::TimeWork;
use Mojo::Base 'Model::Base';
#~ use Mojo::Util qw(dumper);

#~ has sth_cached => 1;
my $main_table = 'табель';
has [qw(app)];


sub new {
  state $self = shift->SUPER::new(@_);
  $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  $self->dbh->do($self->sth('таблицы'));
  #~ $self->dbh->do($self->sth('функции'));
  return $self;
}

sub объекты {
  my ($self, $uid) = @_; # ид профиля
  
  $self->dbh->selectall_arrayref($self->sth('доступные объекты'), {Slice=>{},}, ($uid, 'Ведение табеля рабочего времени'));
  
}

sub данные {
  my ($self, $oid, $month) = @_; # ид объекта
  my $data = {"значения" => {}};
  
  my %profiles = ();
  
  map {
    
    $data->{"значения"}{$_->{"профиль"}}{$_->{"дата"}} = $_;
    $profiles{$_->{"профиль"}}++;
    
  } @{$self->dbh->selectall_arrayref($self->sth('значения за месяц по объекту'), {Slice=>{},}, ($month, $oid))};
  
  #~ $data->{"сотрудники"} = $self->сотрудники_объекта($oid);
  #~ map {
    #~ $_->{"должности"}=$self->должности_сотрудника($_->{id});
  #~ } @{$data->{"сотрудники"}};
  $data->{"сотрудники"} = $self->dbh->selectall_arrayref($self->sth('профили'), {Slice=>{},}, (1, [keys %profiles]));
  $data->{"сотрудники"} = $self->dbh->selectall_arrayref($self->sth('профили за прошлый месяц'), {Slice=>{},}, ($month, '1 month', $oid))
    unless @{$data->{"сотрудники"}};
  
  return $data;
  
}

sub сотрудники_объекта {
  my ($self, $oid) = @_; # ид объекта
  
  $self->dbh->selectall_arrayref($self->sth('сотрудники объекта'), {Slice=>{},}, ($oid, 'Сотрудники'));
  
}

sub должности_сотрудника {
  my ($self, $pid) = @_; # ид профиля
  
  $self->dbh->selectall_arrayref($self->sth('должности сотрудника'), {Slice=>{},}, ($pid));
}

sub профили {# просто список для добавления строк в табель
  my ($self) = @_; # ид профиля
  
  $self->dbh->selectall_arrayref($self->sth('профили'), {Slice=>{},}, (undef, undef));
}

sub сохранить {
  my ($self, $data) = @_; #
  my $tx_db = $self->dbh->begin;
  local $self->{dbh} = $tx_db;
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, $main_table, ["id"], $data);
  $self->связь($data->{"профиль"}, $r->{id});
  $self->связь($data->{"объект"}, $r->{id});
  
  $tx_db->commit;
  return $r;
}

1;


__DATA__
@@ таблицы
create table IF NOT EXISTS "{%= $schema %}"."{%= $tables->{main} %}" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  ---"объект" int not null, -- таблица roles
  "дата" date not null, --
  ----"сотрудник" int not null, -- таблица  профили
  "значение" text not null,
  "коммент" text
);
CREATE OR REPLACE FUNCTION "формат месяц"(date) RETURNS text AS $$ 
  select to_char($1, 'YYYY-MM');
$$ LANGUAGE SQL IMMUTABLE STRICT;
CREATE INDEX IF NOT EXISTS "табель/индекс по месяцам" ON "табель"("формат месяц"("дата"));

@@ доступные объекты
--- для правки
select g2.*
from refs r1
  join roles g1 on g1.id=r1.id1
  join refs r2 on g1.id = r2.id2
  join roles g2 on g2.id=r2.id1 -- объекты
  join refs r3 on g2.id = r3.id2
  join roles g3 on g3.id=r3.id1 -- 

where r1.id2=? -- профиль
  and g1."name"=? -- жесткое название группы внутри каждого объекта
  and g3."name"='Объекты и подразделения'
;

@@ табель/join
"табель" t
  join refs ro on t.id=ro.id2 --- на объект
  join refs rp on t.id=rp.id2 -- на профили
  join "профили" p on p.id=rp.id1

@@ значения за месяц по объекту
select t.*, ro.id1 as "объект", p.id as "профиль"
from {%= $dict->{'табель/join'} %}
where "формат месяц"(?::date)="формат месяц"(t."дата")
  and ro.id1=? -- объект
;


@@ сотрудники объекта
select p.*
from refs r1
  join roles g1 on g1.id=r1.id2 -- вниз 1 ур
  join refs r3 on g1.id = r3.id1 -- к профилям
  join "профили" p on p.id=r3.id2

where r1.id1=? -- объект
  and g1.name=? -- жесткое название группы внутри каждого объекта
order by array_to_string(p.names, ' ')
;

@@ должности/join
---!!! refs r1
  join roles g1 on g1.id=r1.id1 -- это надо
  join refs r2 on g1.id=r2.id2
  join roles g2 on g2.id=r2.id1 --- топ Должности
  left join (
    select r.id2 as g_id
    from refs r
    join roles g on g.id=r.id1 -- еще родитель
  ) n on g2.id=n.g_id

@@ должности сотрудника
select g1.*
from refs r1
  {%= $dict->{'должности/join'} %}
  
where r1.id2=? --- профиль
  and g2.name='Должности' --- жесткое название топовой группы
  and n.g_id is null --- нет родителя топовой группы

order by g1.name
;

@@ профили
-- и должности
select p.id, p.names, array_agg(g1.name) as "должности"
from "профили" p
--- должности сотрудника
  join refs r1 on p.id=r1.id2
  {%= $dict->{'должности/join'} %}
  
where 
  (? is null or p.id=any(?)) --- профили кучей
  and not coalesce(p.disable, false)
  and g2.name='Должности' --- жесткое название топовой группы
  and n.g_id is null --- нет родителя топовой группы

group by p.id, p.names

order by array_to_string(p.names, ' ')
;

@@ профили за прошлый месяц
-- и должности
select p.id, p.names, array_agg(g1.name) as "должности"
from (
select distinct p.id, p.names
from 
  {%= $dict->{'табель/join'} %}
where not coalesce(p.disable, false)
  and "формат месяц"((?::date - interval ?)::date)="формат месяц"(t."дата")
  and ro.id1=? -- объект
) p
--- должности сотрудника
  join refs r1 on p.id=r1.id2
  {%= $dict->{'должности/join'} %}
  
where 
  g2.name='Должности' --- жесткое название топовой группы
  and n.g_id is null --- нет родителя топовой группы

group by p.id, p.names

order by array_to_string(p.names, ' ')
;
  