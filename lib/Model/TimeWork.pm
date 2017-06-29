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
  $self->dbh->do($self->sth('функции'));
  return $self;
}

sub объекты {
  my ($self, $uid) = @_; # ид профиля
  
  $self->dbh->selectall_arrayref($self->sth('объекты'), {Slice=>{},},);
  
}

sub доступные_объекты {
  my ($self, $uid) = @_; # ид профиля
  
  $self->dbh->selectall_arrayref($self->sth('доступные объекты'), {Slice=>{},}, ($uid, (undef, undef)));
  
}

sub бригады {
  my ($self,) = @_; # ид профиля
  
  $self->dbh->selectall_arrayref($self->sth('бригады'), {Slice=>{},}, (undef, undef));
  
}

sub данные {# для формы
  my ($self, $oid, $month) = @_; # ид объекта
  my $data = {"значения" => {}};
  
  my %profiles = ();
  my %hidden = ();
  
  map {
    
    if ($_->{"значение"} eq '_не показывать_') {
      $hidden{$_->{"профиль"}}++;
      $_->{"значение"} = '';
    }
    elsif ($_->{"значение"} eq '_добавлен_') {
      $profiles{$_->{"профиль"}}++ unless $profiles{$_->{"профиль"}};
      $_->{"значение"} = '';
    }
    elsif ($_->{"значение"} ~~ [qw(КТУ1 КТУ2 КТУ3 Примечание Начислено Сумма)]) {
      $profiles{$_->{"профиль"}} = {} unless ref $profiles{$_->{"профиль"}};
      $profiles{$_->{"профиль"}}{$_->{"значение"}} = $_;
    } # кту ставит на участке
    else {$profiles{$_->{"профиль"}}++ unless $profiles{$_->{"профиль"}};}

    $data->{"значения"}{$_->{"профиль"}}{$_->{"дата"}} = $_
      unless  $_->{"значение"} ~~ [qw(Ставка)] || ref $profiles{$_->{"профиль"}} && defined $profiles{$_->{"профиль"}}{$_->{"значение"}}; # $_->{"значение"} ~~ [qw(Ставка Начислено)] || 
    
  } @{$self->dbh->selectall_arrayref($self->sth('значения за месяц'), {Slice=>{},}, $month, ($oid) x 2, (undef) x 4)};
  
  my $prev_month = $self->dbh->selectrow_array($self->sth('профили за прошлый месяц'), undef, ([keys %hidden], $month, '1 month', $oid,)) || [];# кроме скрытых в этом мес
  
  $data->{"сотрудники"} = $self->dbh->selectall_arrayref($self->sth('профили'), {Slice=>{},}, (1, [keys %profiles, @$prev_month]));
  
  map {
    my $p = $_;
    my $profile = $profiles{$_->{id}};
    if ($profile && ref $profile) {
      @$_{keys %$profile} = values %$profile;
    }
    
    #~ $_->{'Ставка'} ||= $self->dbh->selectrow_hashref($self->sth('значение на дату'), undef, ($_->{id}, $oid, ($month, undef), 'Ставка'));
    
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

sub сохранить {# из формы и отчета
  my ($self, $data) = @_; #
  # проверка доступа к объекту
  $self->dbh->selectrow_hashref($self->sth('доступные объекты'), undef, ($data->{uid}, (1, [$data->{"объект"}])))
    or return "Объект недоступен";# eval
  
  unless ($data->{'значение'} ~~ [qw(Начислено Примечание)]) {# заблокировать сохранение если Начислено
    my $pay = $self->dbh->selectrow_hashref($self->sth('строка табеля'), undef, ($data->{"профиль"}, $data->{"объект"}, ($data->{'дата'}, undef), ('Начислено', undef)));
    return "Табельная строка часов оплачена"
      if $pay && $pay->{'коммент'};
  }
  
  #~ return "Нельзя начислить" форму ограничил в контроллере
    #~ if $data->{'значение'} eq 'Начислено' && !$r->{'разрешить начислять'};
  
  my $tx_db = $self->dbh->begin;
  local $self->{dbh} = $tx_db;
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, $main_table, ["id"], $data);
  $self->связь($data->{"профиль"}, $r->{id});
  $self->связь($data->{"объект"}, $r->{id});
  
  $tx_db->commit;
  return $r;
}

sub удалить_значение {# из формы
  my ($self, $data) = @_; #
  # проверка доступа к объекту
  $self->dbh->selectrow_hashref($self->sth('доступные объекты'), undef, ($data->{uid}, (1, [$data->{"объект"}])))
    or return "Объект недоступен";# eval
  
  unless ($data->{'значение'} ~~ [qw(Начислено Примечание)]) {# заблокировать сохранение если Начислено
    my $pay = $self->dbh->selectrow_hashref($self->sth('строка табеля'), undef, ($data->{"профиль"}, $data->{"объект"}, ($data->{'дата'}, undef), ('Начислено', undef)));
    return "Табельная строка часов оплачена"
      if $pay && $pay->{'коммент'};
  }
  
  my $r = $self->dbh->selectrow_hashref($self->sth('строка табеля'), undef, $data->{"профиль"}, $data->{"объект"}, (undef, $data->{'дата'}), (undef, '^(\d+\.*,*\d*|.{1})$'))
    or return "Запись табеля не найдена";
  
  my $tx_db = $self->dbh->begin;
  local $self->{dbh} = $tx_db;
  $r = $self->_delete($self->{template_vars}{schema}, $main_table, ["id"], $r);
  $self->связь_удалить(id1=>$data->{"профиль"}, id2=>$r->{id});
  $self->связь_удалить(id1=>$data->{"объект"}, id2=>$r->{id});
  
  $tx_db->commit;
  return $r;
}


sub данные_отчета {
  my ($self, $param) = @_; #
  
  #~ if ($param->{'общий список'} || $param->{'объект'}) {
    my @bind = (($param->{'общий список'} ? undef : ($param->{'объект'} && $param->{'объект'}{id})) x 2, $param->{'месяц'}, $param->{'отключенные объекты'} || 0, ($param->{'месяц'}) x 7,);
    
    return $self->dbh->selectall_arrayref($self->sth('сводка за месяц', join=>'табель/join'), {Slice=>{},}, @bind)
      unless $param->{'общий список'} || $param->{'общий список бригад'} || $param->{'бригада'};
    
    return $self->dbh->selectall_arrayref($self->sth('сводка за месяц/общий список', join=>'табель/join'), {Slice=>{},}, @bind);
  #~ }
  #~ if ($param->{'общий список бригад'} || $param->{'бригада'}) {
    #~ my @bind = (($param->{'общий список бригад'} ? undef : ($param->{'бригада'} && $param->{'бригада'}{id})) x 2, $param->{'месяц'}, $param->{'отключенные объекты'} || 0, ($param->{'месяц'}) x 7,);
    
    #~ return $self->dbh->selectall_arrayref($self->sth('сводка за месяц', join=>'табель/бригады/join'), {Slice=>{},}, @bind)
      #~ unless $param->{'общий список бригад'};
    
    #~ return $self->dbh->selectall_arrayref($self->sth('сводка за месяц/общий список', join=>'табель/бригады/join'), {Slice=>{},}, @bind);
  #~ }
}

sub сохранить_значение {# из отчета
  my ($self, $data) = @_; #
  
  #~ $data->{'значение'} = 'Ставка';
  #~ $data->{'коммент'} = $data->{'Ставка'};
  
  if ($data->{"объект"}) {
    my $r = $self->dbh->selectrow_hashref($self->sth('строка табеля'), undef, ($data->{"профиль"}, $data->{"объект"}, ($data->{'дата'}, undef), ($data->{'значение'}, undef)))
      || $data;
    $r->{'коммент'} = $data->{'коммент'};
    $r->{'коммент'} = undef
      if $r->{'коммент'} eq '';
    #~ $r->{'разрешить начислять'} = 1;
    return $self->сохранить($r);
  }
  
  my @ret = ();
  my $i = 0;
  for (@{$data->{"объекты"} || []}) {
    my $r = $self->dbh->selectrow_hashref($self->sth('строка табеля'), undef, ($data->{"профиль"}, $_, ($data->{'дата'}, undef), ($data->{'значение'}, undef),))
      || $data;
    $r->{'коммент'} = $data->{'коммент'}[$i++];
    $r->{'коммент'} = undef
      if $r->{'коммент'} eq '';
    $r->{"объект"} = $_;
    #~ $r->{'разрешить начислять'} = 1;
    push @ret, $self->сохранить($r);
  }
  
  return \@ret;
  
}

sub детально_по_профилю {
  my ($self, $param) = @_; #
  my $data = {};
  #~ my $object = 'объект';
  #~ utf8::encode($object);
  map {
    if ($_->{'значение'} =~ /^(?:КТУ|Примечание)/) {
      $data->{$_->{'объект'}}{$_->{'значение'}} = $_;
    } else {
      $data->{$_->{'объект'}}{$_->{'дата'}} =  $_;
    }
    
  } @{ $self->dbh->selectall_arrayref($self->sth('значения за месяц', order_by=>"order by og.name"), {Slice=>{}}, $param->{'месяц'}, (undef) x 2, ($param->{'профиль'}) x 2, ('^(\d+\.*,*\d*|.{1}|КТУ\d*|Примечание)$') x 2) };
  
  return $data;
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

@@ функции
CREATE OR REPLACE FUNCTION text2numeric(text)
/*
*/
RETURNS numeric
AS $func$
DECLARE
  r text;
BEGIN
  r:=regexp_replace(regexp_replace($1, '[^\d,\.]+', '', 'g'), ',', '.', 'g');
  RETURN case when r='' then null else r::numeric end;
END
$func$ LANGUAGE plpgsql;

---DROP VIEW IF EXISTS "табель/начисления";
CREATE OR REPLACE VIEW "табель/начисления"
AS
select
  t.id, t.ts,
  p.id as "профиль/id",
  array_to_string(p.names, ' ') as "профиль",
  t."коммент"::money as "сумма",
  (date_trunc('month', t."дата"+interval '1 month') - interval '1 day')::date as "дата",
  'начисление з/п по табелю'::text as "примечание"
from
  "табель" t
  join refs rp on t.id=rp.id2 -- на профили
  join "профили" p on p.id=rp.id1
where "значение"='Начислено'
  and "коммент" is not null and "коммент"<>''
;

@@ объекты
--- для отчета все объекты
select g1.*
from
  -- к объектам стрительства
  roles g1
  join refs r2 on g1.id = r2.id2
  join roles g2 on g2.id=r2.id1 -- 

where 
  g2."name"='Объекты и подразделения'
  and not coalesce(g1."disable", false)

order by g1.name
;

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
  --join refs r3 on r1.id2 = r3.id2 -- снова профиль
  --join roles g3 on g3.id=r3.id1 -- 
  --join refs r4 on g3.id = r4.id2
  --join roles g4 on g4.id=r4.id1 -- 

where r1.id2=? -- профиль
  and (?::int is null or g1.id=any(?::int[])) -- можно проверить доступ к объекту
  and g2."name"='Объекты и подразделения'
  and not coalesce(g1."disable", false)
  
  ---and g3."name"='Ведение табеля'
  ---and g4."name"='Табель рабочего времени'

order by g1.name
;

@@ бригады
---  для отчета без контроля доступа
select g2.*
from {%= $dict->{'бригады/join'}->render %}
where 
  (?::int is null or g2.id=any(?::int[])) -- 
order by g2.name
;

@@ бригады/join
  -- к бригадам
  roles g1
  join refs r1 on g1.id = r1.id1 and g1."name"='Бригады'
  join roles g2 on g2.id=r1.id2 and not coalesce(g2."disable", false)

@@ табель/join
"табель" t
  join refs ro on t.id=ro.id2 --- на объект
  join roles og on og.id=ro.id1 -- группы-объекты
  join refs rp on t.id=rp.id2 -- на профили
  join "профили" p on p.id=rp.id1

@@ табель/бригады/join
-- для отчета по бригадам
"табель" t
   -- на профили
  join refs rp on t.id=rp.id2
  join "профили" p on p.id=rp.id1
  -- на группы-бригады
  join refs ro on p.id=ro.id2 
  join roles og on og.id=ro.id1 -- это бригады
  join refs rb on og.id=rb.id2
  join roles bg on bg.id=rb.id1 and bg.name='Бригады'

@@ значения за месяц
-- по объекту или профилю
select t.*, og.id as "объект", p.id as "профиль"
from {%= $dict->{'табель/join'}->render %}
where "формат месяц"(?::date)="формат месяц"(t."дата")
  and (?::int is null or og.id=?) -- объект
  and (?::int is null or p.id=?) -- профиль
  and (?::text is null or t."значение" ~ ?::text) -- регулярку типа '^.{1,2}$' только часы
{%= $order_by %}
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
  join roles g2 on g2.id=r2.id1 and g2.name='Должности' --- жесткое название топовой группы
  left join (
    select r.id2 as g_id
    from refs r
    join roles g on g.id=r.id1 -- еще родитель
  ) n on g2.id=n.g_id

@@ должности сотрудника
select g1.*
from refs r1
  {%= $dict->{'должности/join'}->render %}
  
where r1.id2=? --- профиль
  and g2.name='Должности' --- жесткое название топовой группы
  and n.g_id is null --- нет родителя топовой группы

order by g1.name
;

@@ профили
-- и должности/бригады
select pd.*, br."бригада"
from (
  select p.id, p.names,
    array_agg(g1.name) as "должности",
    sum((g1.name='ИТР')::int) as "ИТР?"
  from
    "профили" p
  
    left join (--- должности сотрудника
      select g1.*, r1.id2 as pid
      from refs r1 
      {%= $dict->{'должности/join'}->render %}
      where n.g_id is null --- нет родителя топовой группы
    ) g1 on p.id=g1.pid
  where 
    (? is null or p.id=any(?)) --- профили кучей
    and not coalesce(p.disable, false)
  group by p.id, p.names
) pd
  left join (-- бригады не у всех
    select r.id2 as profile_id, array_agg(b.name) as "бригада"
    from refs r
    join (select g2.* from {%= $dict->{'бригады/join'}->render %}) b on b.id=r.id1
    group by r.id2
  ) br on pd.id=br.profile_id
order by pd.names
;

@@ профили за прошлый месяц
-- и должности
/*select p.id, p.names, array_agg(g1.name) as "должности"
from (*/
select array_agg(distinct p.id)
from 
  {%= $dict->{'табель/join'}->render %}
where 
  not p.id=any(?) --- профили не скрытые
  and not coalesce(p.disable, false)
  and "формат месяц"((?::date - interval ?)::date)="формат месяц"(t."дата")
  and ro.id1=? -- объект
/*
) p
--- должности сотрудника
  join refs r1 on p.id=r1.id2
  {%= $dict->{'должности/join'}->render %}
  
where 
  g2.name='Должности' --- жесткое название топовой группы
  and n.g_id is null --- нет родителя топовой группы

group by p.id, p.names

order by array_to_string(p.names, ' ')
*/
;

@@ значение на дату
--- для ставки, КТУ
select t.*
from 
  {%= $dict->{'табель/join'}->render %}
where p.id=?
  and ro.id1=? -- объект
  ---and extract(day from t."дата")=1
  and (t."дата"<=?::date or "формат месяц"(?::date)="формат месяц"(t."дата")) -- последнее значение (СТАВКА) или на этот месяц (КТУ)
  and t."значение" = ?
order by t."дата" desc
limit 1;

@@ значение на дату/все объекты
--- для ставки
--- если нет ставки по конкретному объекту взять последнюю ставку по любому объекту
select t.*
from 
  {%= $dict->{'табель/join'}->render %}
where p.id=?
  ---and ro.id1= -- объект
  ---and extract(day from t."дата")=1
  and t."дата"<=?::date -- последнее значение (СТАВКА)
  and t."значение" = ? -- Ставка допустим
order by t."дата" desc, ts desc
limit 1;

@@ сводка за месяц
select *,
  coalesce("_КТУ1", 1.0::numeric) as "КТУ1",
  coalesce("_КТУ2", coalesce("_КТУ1", 1.0::numeric)) as "КТУ2"
  ----(case when "_Ставка"='' then null else "_Ставка" end)::int "Ставка"
from (
select sum.*,
  text2numeric(k1."коммент") as "_КТУ1",
  text2numeric(k2."коммент") as "_КТУ2",
  text2numeric(coalesce(st1."коммент", st2."коммент")) as "Ставка",
 --- text2numeric(coalesce(sm1."коммент", sm2."коммент")) as "Сумма",
  text2numeric(sm1."коммент") as "Сумма",
  pay."коммент" as "Начислено",
  descr."коммент" as "Примечание"
from (
select sum(coalesce(text2numeric(t."значение"), 0::numeric)) as "всего часов",
  count(t."значение") as "всего смен",
  og.id as "объект", p.id as "профиль", p.names---, og.name as "объект/название" ---, array_agg(g1.name) as "должности"
from 
  {%= $dict->{$join}->render %}
where 
  (?::int is null or og.id=?) -- объект
  and "формат месяц"(?::date)="формат месяц"(t."дата")
  and t."значение" ~ '^\d' --- только цифры часов в начале строки
  and coalesce(og."disable", false)=?::boolean -- отключенные/не отключенные объекты
group by og.id, p.id---, p.names
order by og.name, array_to_string(p.names, ' ')
) sum
-------КТУ1--------
left join lateral (
select t.*
from 
  {%= $dict->{$join}->render %}
where p.id=sum."профиль"
  and og.id=sum."объект" -- объект
  and  "формат месяц"(?::date)="формат месяц"(t."дата") -- 
  and t."значение" = 'КТУ1'
order by t."дата" desc, t.ts desc
limit 1
) k1 on true
--------КТУ2-----------
left join lateral (
select t.*
from 
  {%= $dict->{$join}->render %}
where p.id=sum."профиль"
  and og.id=sum."объект" -- объект
  and  "формат месяц"(?::date)="формат месяц"(t."дата") -- 
  and t."значение" = 'КТУ2'
order by t."дата" desc, t.ts desc
limit 1
) k2 on true
--------Ставка по этому объекту-----------
left join lateral (
select t.*
from 
  {%= $dict->{$join}->render %}
where p.id=sum."профиль"
  and og.id=sum."объект" -- объект
  and  t."дата"<=?::date
  and t."значение" = 'Ставка'
  and t."коммент" is not null
order by t."дата" desc, t.ts desc
limit 1
) st1 on true
--------последняя Ставка по всем объектам-----------
left join lateral (
select t.*
from 
  {%= $dict->{$join}->render %}
where p.id=sum."профиль"
  ---and ro.id1=sum."объект" -- объект
  and  t."дата"<=?::date
  and t."значение" = 'Ставка'
  and t."коммент" is not null
order by t."дата" desc, t.ts desc
limit 1
) st2 on true
--------Сумма по этому объекту-----------
left join lateral (
select t.*
from 
  {%= $dict->{$join}->render %}
where p.id=sum."профиль"
  and og.id=sum."объект" -- объект
  ---and  t."дата"<=?::date нельзя переносить начисленную сумму
  and "формат месяц"(?::date)="формат месяц"(t."дата")
  and t."значение" = 'Сумма'
  and t."коммент" is not null
order by t."дата" desc, t.ts desc
limit 1
) sm1 on true
/*
--------последняя Сумма по всем объектам-----------
left join lateral (
select t.*
from 
  {%= $dict->{$join}->render %}
where p.id=sum."профиль"
  ---and ro.id1=sum."объект" -- объект
  and  t."дата"<=?::date
  and t."значение" = 'Сумма'
  and t."коммент" is not null
order by t."дата" desc, t.ts desc
limit 1
) sm2 on true
*/
----------------Начислено---------------------
left join lateral (
select t.*
from 
  {%= $dict->{$join}->render %}
where p.id=sum."профиль"
  and og.id=sum."объект" -- объект
  and  "формат месяц"(?::date)="формат месяц"(t."дата") -- 
  and t."значение" = 'Начислено'
order by t."дата" desc
limit 1
) pay on true
----------------Примечание---------------------
left join lateral (
select t.*
from 
  {%= $dict->{$join}->render %}
where p.id=sum."профиль"
  and og.id=sum."объект" -- объект
  and  "формат месяц"(?::date)="формат месяц"(t."дата") -- 
  and t."значение" = 'Примечание'
order by t."дата" desc
limit 1
) descr on true
) q

@@ 000сводка за месяц/объекты
select *, "всего часов" * 
from (
  {%= $dict->{'сводка за месяц'} %}
) sum

@@ сводка за месяц/общий список
--- сворачивает объекты
select "профиль",
  array_agg("объект") as "объекты",
  array_agg("всего часов") as "всего часов",
  array_agg("всего смен") as "всего смен",
  array_agg("КТУ1") as "КТУ1",
  array_agg("КТУ2") as "КТУ2",
  array_agg("Ставка") as "Ставка",
  array_agg("Сумма") as "Сумма",
  array_agg("Начислено") as "Начислено",
  array_agg("Примечание") as "Примечание"
from (
  {%= $dict->{'сводка за месяц'}->render(join=>$join) %}
) sum
group by "профиль", names
order by array_to_string(names, ' ')
;

@@ строка табеля
---   для сохранения ставки
select t.*, p.id as "профиль", og.id as "объект"
from {%= $dict->{'табель/join'}->render %}

where p.id=?
  and og.id=?
  and ("формат месяц"(?::date)="формат месяц"(t."дата") or t."дата"=?::date)
  and (t."значение" = ? or  t."значение" ~ ?)
