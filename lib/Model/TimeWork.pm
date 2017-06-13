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
  
  $self->dbh->selectall_arrayref($self->sth('доступные объекты'), {Slice=>{},}, ($uid, (undef, undef)));
  
}

sub данные {
  my ($self, $oid, $month) = @_; # ид объекта
  my $data = {"значения" => {}};
  
  my %profiles = ();
  my %hidden = ();
  
  map {
    
    if ($_->{"значение"} eq '_не показывать_') {
      $hidden{$_->{"профиль"}}++;
      $_->{"значение"} = '';
    }
    elsif ($_->{"значение"} ~~ [qw(КТУ1 КТУ2 КТУ3 Ставка Примечание)]) {$profiles{$_->{"профиль"}} = {} unless ref $profiles{$_->{"профиль"}}; $profiles{$_->{"профиль"}}{$_->{"значение"}} = $_;} # кту ставит на участке
    #~ elsif ($_->{"значение"} eq '') {$profiles{$_->{"профиль"}} = {} unless ref $profiles{$_->{"профиль"}}; $profiles{$_->{"профиль"}}{'КТУ2'} = $_;} # кту ставит зам 
    #~ elsif ($_->{"значение"} eq '') {$profiles{$_->{"профиль"}} = {} unless ref $profiles{$_->{"профиль"}}; $profiles{$_->{"профиль"}}{'КТУ3'} = $_;} # кту ставит директор
    #~ elsif ($_->{"значение"} eq '') {$profiles{$_->{"профиль"}} = {} unless ref $profiles{$_->{"профиль"}}; $profiles{$_->{"профиль"}}{'Ставка'} = $_;}
    #~ elsif ($_->{"значение"} eq '') {$profiles{$_->{"профиль"}} = {} unless ref $profiles{$_->{"профиль"}}; $profiles{$_->{"профиль"}}{'Примечание'} = $_;}
    else {$profiles{$_->{"профиль"}}++ unless $profiles{$_->{"профиль"}};}

    $data->{"значения"}{$_->{"профиль"}}{$_->{"дата"}} = $_
      unless ref $profiles{$_->{"профиль"}} && $profiles{$_->{"профиль"}}{$_->{"значение"}};
    
  } @{$self->dbh->selectall_arrayref($self->sth('значения за месяц по объекту'), {Slice=>{},}, ($month, $oid))};
  
  my $prev_month = $self->dbh->selectrow_array($self->sth('профили за прошлый месяц'), undef, ([keys %hidden], $month, '1 month', $oid,)) || [];# кроме скрытых в этом мес
  
  $data->{"сотрудники"} = $self->dbh->selectall_arrayref($self->sth('профили'), {Slice=>{},}, (1, [keys %profiles, @$prev_month]));
  
  map {
    my $p = $_;
    my $profile = $profiles{$_->{id}};
    if ($profile && ref $profile) {
      @$_{keys %$profile} = values %$profile;
    }
    
    $_->{'Ставка'} ||= $self->dbh->selectrow_hashref($self->sth('последнее значение'), undef, ($_->{id}, $oid, 'Ставка'));
    
  } @{$data->{"сотрудники"}};
  
  return $data;
  
}

=pod
sub сотрудники_объекта {
  my ($self, $oid) = @_; # ид объекта
  
  $self->dbh->selectall_arrayref($self->sth('сотрудники объекта'), {Slice=>{},}, ($oid, 'Сотрудники'));
  
}

sub должности_сотрудника {
  my ($self, $pid) = @_; # ид профиля
  
  $self->dbh->selectall_arrayref($self->sth('должности сотрудника'), {Slice=>{},}, ($pid));
}

=cut

sub профили {# просто список для добавления строк в табель
  my ($self) = @_; # ид профиля
  
  $self->dbh->selectall_arrayref($self->sth('профили'), {Slice=>{},}, (undef, undef));
}

sub сохранить {
  my ($self, $data) = @_; #
  # проверка доступа к объекту
  $self->dbh->selectrow_hashref($self->sth('доступные объекты'), undef, ($data->{uid}, (1, [$data->{"объект"}])))
    or die "Сохранить запрещено";# eval
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
select g1.*
from
  -- к объектам стрительства
  refs r1 
  join roles g1 on g1.id=r1.id1
  join refs r2 on g1.id = r2.id2
  join roles g2 on g2.id=r2.id1 -- 
  -- к навигации/доступу
  join refs r3 on r1.id2 = r3.id2 -- снова профиль
  join roles g3 on g3.id=r3.id1 -- 
  join refs r4 on g3.id = r4.id2
  join roles g4 on g4.id=r4.id1 -- 

where r1.id2=? -- профиль
  and (?::int is null or g1.id=any(?::int[])) -- можно проверить доступ к объекту
  and g2."name"='Объекты строительства'
  
  and g3."name"='Ведение табеля'
  and g4."name"='Табель рабочего времени'
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
/*select p.id, p.names, array_agg(g1.name) as "должности"
from (*/
select array_agg(distinct p.id)
from 
  {%= $dict->{'табель/join'} %}
where 
  not p.id=any(?) --- профили не скрытые
  and not coalesce(p.disable, false)
  and "формат месяц"((?::date - interval ?)::date)="формат месяц"(t."дата")
  and ro.id1=? -- объект
/*
) p
--- должности сотрудника
  join refs r1 on p.id=r1.id2
  {%= $dict->{'должности/join'} %}
  
where 
  g2.name='Должности' --- жесткое название топовой группы
  and n.g_id is null --- нет родителя топовой группы

group by p.id, p.names

order by array_to_string(p.names, ' ')
*/
;

@@ последнее значение
--- для переноса ставки
select t.*
from 
  {%= $dict->{'табель/join'} %}
where p.id=?
  and ro.id1=? -- объект
  ---and extract(day from t."дата")=1
  and t."значение" = ?
order by t."дата" desc
limit 1;
  