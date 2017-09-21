package Model::TimeWork;
use Mojo::Base 'Model::Base';
#~ use Mojo::Util qw(dumper);

#~ has sth_cached => 1;
my $main_table = 'табель';
has [qw(app)];
has model_obj => sub {shift->app->models->{'Object'}};


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
  $self->model_obj->список();
  #~ $self->dbh->selectall_arrayref($self->sth('объекты'), {Slice=>{},},);
  
}

sub доступные_объекты {
  my ($self, $uid) = @_; # ид профиля
  $self->model_obj->доступные_объекты($uid, undef);
  #~ $self->dbh->selectall_arrayref($self->sth('доступные объекты'), {Slice=>{},}, (($uid) x 2, (undef, undef)));
  
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
    elsif ($_->{"значение"} ~~ [qw(КТУ1 КТУ2 КТУ3 Примечание Начислено Сумма Суточные Суточные/ставка)]) {
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
    
    $_->{'Суточные/начислено'} ||= $self->dbh->selectrow_hashref($self->sth('строка табеля'), undef, ($_->{id}, (0) x 2, ($month, undef), ('Суточные/начислено', undef)));
    
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
  $self->model_obj->доступные_объекты($data->{uid}, $data->{"объект"})->[0]
    or return "Объект недоступен";# eval
  
  unless ($data->{'значение'} ~~ [qw(Начислено Примечание Суточные/начислено)]) {# заблокировать сохранение если Начислено
    my $pay = $self->dbh->selectrow_hashref($self->sth('строка табеля'), undef, ($data->{"профиль"}, ($data->{"объект"}) x 2, ($data->{'дата'}, undef), ('Начислено', undef)));
    return "Табельная строка начислена"
      if $pay && $pay->{'коммент'};
  }
  
  #~ return "Нельзя начислить" форму ограничил в контроллере
    #~ if $data->{'значение'} eq 'Начислено' && !$r->{'разрешить начислять'};
  ;
  
  my $tx_db = $self->dbh->begin;
  local $self->{dbh} = $tx_db;
  my $r = ($data->{'значение'} =~ /^\d/ && $self->dbh->selectrow_hashref($self->sth('строка табеля'), undef, $data->{"профиль"}, ($data->{"объект"}) x 2, (undef, $data->{'дата'}), (undef, '^\d')))# ^(\d+\.*,*\d*|.{1})$
    || $self->dbh->selectrow_hashref($self->sth('строка табеля'), undef, $data->{"профиль"}, ($data->{"объект"}) x 2, (undef, $data->{'дата'}), ($data->{'значение'}, undef))
  ;
  if ($r) {
    $data->{id} = $r->{id};
    $r = $self->_update($self->{template_vars}{schema}, $main_table, ["id"], $data);
  } #elsif() {} 
  else {
    $r = $self->вставить_или_обновить($self->{template_vars}{schema}, $main_table, ["id"], $data);
  }
  $self->связь($data->{"профиль"}, $r->{id});
  $self->связь($data->{"объект"}, $r->{id})
    if $data->{"объект"}; # 0 - все объекты
  
  $tx_db->commit;
  return $r;
}

sub удалить_значение {# из формы
  my ($self, $data) = @_; #
  # проверка доступа к объекту
  $self->model_obj->доступные_объекты($data->{uid}, $data->{"объект"})->[0]
    or return "Объект недоступен";# eval
  
  unless ($data->{'значение'} ~~ [qw(Начислено Примечание)]) {# заблокировать сохранение если Начислено
    my $pay = $self->dbh->selectrow_hashref($self->sth('строка табеля'), undef, ($data->{"профиль"}, ($data->{"объект"}) x 2, ($data->{'дата'}, undef), ('Начислено', undef)));
    return "Табельная строка часов оплачена"
      if $pay && $pay->{'коммент'};
  }
  
  my $r = $self->dbh->selectrow_hashref($self->sth('строка табеля'), undef, $data->{"профиль"}, ($data->{"объект"}) x 2, (undef, $data->{'дата'}), (undef, '^(\d+\.*,*\d*|.{1})$'))
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
    my @bind = (($param->{'общий список'} ? undef : ($param->{'объект'} && $param->{'объект'}{id})) x 2, $param->{'месяц'}, ($param->{'отключенные объекты'}) x 2, ($param->{'месяц'}) x 2,);
    
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
  
  if (defined $data->{"объект"}) {
    my $r = $self->dbh->selectrow_hashref($self->sth('строка табеля'), undef, ($data->{"профиль"}, ($data->{"объект"}) x 2, ($data->{'дата'}, undef), ($data->{'значение'}, undef)))
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
    my $r = $self->dbh->selectrow_hashref($self->sth('строка табеля'), undef, ($data->{"профиль"}, ($_) x 2, ($data->{'дата'}, undef), ($data->{'значение'}, undef),))
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

sub данные_отчета_сотрудники_на_объектах {
  my ($self, $param) = @_; #
  #~ my @bind = (($param->{'общий список'} && 0) // ($param->{'объект'} && $param->{'объект'}{id})) x 2
  $self->dbh->selectall_arrayref($self->sth('сотрудники на объектах'), {Slice=>{},}, (0)x2, $param->{'месяц'},);
}

sub данные_квитков {
  my ($self, $param, $uid) = @_; 
  $self->dbh->selectall_arrayref($self->sth('квитки', join=>'табель/join'), {Slice=>{},}, ($param->{'объект'} && $param->{'объект'}{id}) x 2, $param->{'месяц'}, (undef) x 2, $uid);
};


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
------------
CREATE OR REPLACE FUNCTION "формат месяц"(date) RETURNS text AS $$ 
  select to_char($1, 'YYYY-MM');
$$ LANGUAGE SQL IMMUTABLE STRICT;
--------------
CREATE OR REPLACE FUNCTION "формат даты"(date) RETURNS text AS $$ 
  select array_to_string(array[
    to_char($1, 'TMdy') || ',',
    regexp_replace(to_char($1, 'DD'), '^0', ''),
    to_char($1, 'TMmon'),
    case when date_trunc('year', now())=date_trunc('year', $1) then '' else to_char($1, 'YYYY') end
  ]::text[], ' ');
$$ LANGUAGE SQL IMMUTABLE STRICT;
---------
CREATE INDEX IF NOT EXISTS "табель/индекс по месяцам" ON "табель"("формат месяц"("дата"));
CREATE INDEX IF NOT EXISTS "табель/значение/индекс" on "табель"("значение");

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

CREATE OR REPLACE VIEW "объекты" AS
select g1.*
from
  -- к объектам стрительства
  roles g1
  join refs r2 on g1.id = r2.id2
  join roles g2 on g2.id=r2.id1 -- 

where 
  g2."name"='Объекты и подразделения'

;

CREATE OR REPLACE VIEW "проекты/объекты" AS
select
  p.id as "проект/id",
  p.title as "проект",
  o.id as "объект/id",
  o.name as "объект"

from "проекты" p
  join "refs" r on p.id=r.id1
  join "объекты" o on o.id=r.id2
;

CREATE OR REPLACE VIEW "должности" AS
select g1.*
from roles g1
  join refs r2 on g1.id=r2.id2
  join roles g2 on g2.id=r2.id1 and g2.name='Должности' --- жесткое название топовой группы
  left join (
    select r.id2 as g_id
    from refs r
    join roles g on g.id=r.id1 -- еще родитель
  ) n on g2.id=n.g_id

where n.g_id is null --- нет родителя топовой группы
;

DROP VIEW IF EXISTS "табель/начисления" CASCADE;
CREATE OR REPLACE VIEW "табель/начисления" AS
--- для отчета по деньгам
select
  t.id, t.ts,
  p.id as "профиль/id",
  array_to_string(p.names, ' ') as "профиль",
  og.name as "объект",
  og.id as "объект/id",
  po."проект", po."проект/id",
  t."коммент"::money as "сумма",
  (date_trunc('month', t."дата"+interval '1 month') - interval '1 day')::date as "дата",
  array_to_string(coalesce(c."примечание", array[]::text[]), E'\n') || ' (' || og.name || ')' as "примечание"
from
---  {%###= $dict->render('табель/join') %}
  "табель" t
  join refs ro on t.id=ro.id2 --- на объект
  join roles og on og.id=ro.id1 -- группы-объекты
  join "проекты/объекты" po on og.id=po."объект/id"
  join refs rp on t.id=rp.id2 -- на профили
  join "профили" p on p.id=rp.id1
  left join ( --- сборка примечание за все начисления месяца
    select
      rp.id1 as pid,
      ro.id1 as oid,
      date_trunc('month', t."дата") as "месяц",
      array_agg(t."коммент") as "примечание" --- || ' (' || og.name || ')'
    from
      "табель" t
      join refs rp on t.id=rp.id2 -- на профили
      join refs ro on t.id=ro.id2 -- на объекты
      join roles og on og.id=ro.id1 -- группы-объекты
      ---join "профили" p on p.id=rp.id1
    where "значение"='Примечание'
      and "коммент" is not null and "коммент"<>''
    group by rp.id1, ro.id1, date_trunc('month', t."дата")
  ) c on 
    p.id=c.pid
    and og.id=c.oid
    and date_trunc('month', t."дата")=c."месяц"
where "значение"='Начислено'
  and "коммент" is not null and "коммент"<>''
;


@@ бригады
---  для отчета без контроля доступа
select g2.*
from {%= $dict->render('бригады/join') %}
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
  left join (--- на объект
    select og.*, ro.id2 
    from refs ro
      join roles og on og.id=ro.id1 -- группы-объекты
  ) og on t.id=og.id2
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
from {%= $dict->render('табель/join') %}
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
  {%= $dict->render('должности/join') %}
  
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
      {%= $dict->render('должности/join') %}
      where n.g_id is null --- нет родителя топовой группы
    ) g1 on p.id=g1.pid
  where 
    (? is null or p.id=any(?)) --- профили кучей
    ---and not coalesce(p.disable, false)
  group by p.id, p.names
) pd
  left join (-- бригады не у всех
    select r.id2 as profile_id, array_agg(b.name) as "бригада"
    from refs r
    join (select g2.* from {%= $dict->render('бригады/join') %}) b on b.id=r.id1
    group by r.id2
  ) br on pd.id=br.profile_id
order by pd.names
;

@@ профили за прошлый месяц
-- и должности

select array_agg(distinct p.id)
from 
  {%= $dict->render('табель/join') %}
where 
  not p.id=any(?) --- профили не скрытые
  and not coalesce(p.disable, false)
  and "формат месяц"((?::date - interval ?)::date)="формат месяц"(t."дата")
  and og.id=? -- объект

;

@@ значение на дату
--- для ставки, КТУ
select t.*
from 
  {%= $dict->render('табель/join') %}
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
  {%= $dict->render('табель/join') %}
where p.id=?
  ---and ro.id1= -- объект
  ---and extract(day from t."дата")=1
  and t."дата"<=?::date -- последнее значение (СТАВКА)
  and t."значение" = ? -- Ставка допустим
order by t."дата" desc, ts desc
limit 1;

@@ сводка за месяц/суммы
select sum(coalesce(text2numeric(t."значение"), 0::numeric)) as "всего часов",
  count(t."значение") as "всего смен",
  og.id as "объект", p.id as "профиль", p.names, og.name as "объект/name" ---, array_agg(g1.name) as "должности"
  , "формат месяц"(t."дата") as "формат месяц"
from 
  {%= $dict->render($join) %}
where 
  (coalesce(?::int,0)=0 or og.id=?) -- объект
  and "формат месяц"(?::date)="формат месяц"(t."дата")
  and t."значение" ~ '^\d' --- только цифры часов в начале строки
  and (?::boolean is null or coalesce(og."disable", false)=?::boolean) -- отключенные/не отключенные объекты
group by og.id, og.name,  p.id, "формат месяц"(t."дата")        ---, p.names
---order by og.name, p.names

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
  day."коммент" as "Суточные",
  text2numeric(day_st."коммент") as "Суточные/ставка",
  day."коммент"::numeric * sum."всего смен" as "Суточные/смены",
  descr."коммент" as "Примечание"
from (
  {%= $dict->render('сводка за месяц/суммы', join=>$join) %}
) sum
-------КТУ1--------
left join lateral (
select t.*
from 
  {%= $dict->render($join) %}
where p.id=sum."профиль"
  and og.id=sum."объект" -- объект
  and  sum."формат месяц"="формат месяц"(t."дата") -- 
  and t."значение" = 'КТУ1'
order by t."дата" desc, t.ts desc
limit 1
) k1 on true
--------КТУ2-----------
left join lateral (
select t.*
from 
  {%= $dict->render($join) %}
where p.id=sum."профиль"
  and og.id=sum."объект" -- объект
  and sum."формат месяц"="формат месяц"(t."дата") -- 
  and t."значение" = 'КТУ2'
order by t."дата" desc, t.ts desc
limit 1
) k2 on true
--------Ставка по этому объекту-----------
left join lateral (
select t.*
from 
  {%= $dict->render($join) %}
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
  {%= $dict->render($join) %}
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
  {%= $dict->render($join) %}
where p.id=sum."профиль"
  and og.id=sum."объект" -- объект
  ---and  t."дата"<=::date нельзя переносить начисленную сумму
  and sum."формат месяц"="формат месяц"(t."дата")
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
  {%= $dict->render($join) %}
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
  {%= $dict->render($join) %}
where p.id=sum."профиль"
  and og.id=sum."объект" -- объект
  and  sum."формат месяц"="формат месяц"(t."дата") -- 
  and t."значение" = 'Начислено'
order by t."дата" desc
limit 1
) pay on true
----------------Примечание---------------------
left join lateral (
select t.*
from 
  {%= $dict->render($join) %}
where p.id=sum."профиль"
  and og.id=sum."объект" -- объект
  and  sum."формат месяц"="формат месяц"(t."дата") -- 
  and t."значение" = 'Примечание'
order by t."дата" desc
limit 1
) descr on true
----------------Суточные---------------------
left join lateral (
select t.*
from 
  {%= $dict->render($join) %}
where p.id=sum."профиль"
  and og.id=sum."объект" -- объект
  and  sum."формат месяц"="формат месяц"(t."дата") -- 
  and t."значение" = 'Суточные'
order by t."дата" desc
limit 1
) day on true
----------------Суточные/ставка---------------------
left join lateral (
select t.*
from 
  {%= $dict->render($join) %}
where p.id=sum."профиль"
  and og.id=sum."объект" -- объект
  and  sum."формат месяц"="формат месяц"(t."дата") -- 
  and t."значение" = 'Суточные/ставка'
order by t."дата" desc
limit 1
) day_st on true

) q

@@ 000сводка за месяц/объекты
select *, "всего часов" * 
from (
  {%= $dict->{'сводка за месяц'} %}
) sum

@@ сводка за месяц/общий список
--- сворачивает объекты
select sum."профиль",
  array_agg(sum."объект" order by sum."объект") as "объекты",
  array_agg(sum."всего часов" order by sum."объект") as "всего часов",
  array_agg(sum."всего смен" order by sum."объект") as "всего смен",
  array_agg(sum."КТУ1" order by sum."объект") as "КТУ1",
  array_agg(sum."КТУ2" order by sum."объект") as "КТУ2",
  array_agg(sum."Ставка" order by sum."объект") as "Ставка",
  array_agg(sum."Сумма" order by sum."объект") as "Сумма",
  array_agg(sum."Начислено" order by sum."объект") as "Начислено",
  array_agg(sum."Суточные" order by sum."объект") as "Суточные",
  array_agg(sum."Суточные/ставка" order by sum."объект") as "Суточные/ставка",
  sum(sum."Суточные/смены") as "Суточные/смены",
  ---day_cnt."коммент" as "Суточные/смены",
  text2numeric(day_sum."коммент") as "Суточные/сумма",
  text2numeric(day_money."коммент") as "Суточные/начислено",
  array_agg(sum."Примечание" order by sum."объект") as "Примечание"
from (
  {%= $dict->render('сводка за месяц', join=>$join) %}
) sum
/*не будет этого поля----------------Суточные/смены (не по объектам)---------------------
left join lateral (
select t.*
from 
  {%= $dict->render($join) %}
where p.id=sum."профиль"
  ----!!!!!!and og.id=sum."объект" -- объект
  and  sum."формат месяц"="формат месяц"(t."дата") -- 
  and t."значение" = 'Суточные/смены'
order by t."дата" desc
limit 1
) day_cnt on true
*/
----------------Суточные/сумма (не по объектам)---------------------
left join lateral (
select t.*
from 
  {%= $dict->render($join) %}
where p.id=sum."профиль"
  ----!!!!!!and og.id=sum."объект" -- объект
  and  sum."формат месяц"="формат месяц"(t."дата") -- 
  and t."значение" = 'Суточные/сумма'
order by t."дата" desc
limit 1
) day_sum on true
----------------Суточные/начислено (не по объектам)---------------------
left join lateral (
select t.*
from 
  {%= $dict->render($join) %}
where p.id=sum."профиль"
  ----!!!!!!and og.id=sum."объект" -- объект
  and  sum."формат месяц"="формат месяц"(t."дата") -- 
  and t."значение" = 'Суточные/начислено'
order by t."дата" desc
limit 1
) day_money on true


group by sum."профиль", sum.names, day_sum."коммент", day_money."коммент"
order by sum.names
;

@@ строка табеля
---   для сохранения ставки
select t.*, p.id as "профиль", og.id as "объект"
from {%= $dict->render('табель/join') %}

where p.id=?
  and (?::int = 0 or og.id=?)
  and ("формат месяц"(?::date)="формат месяц"(t."дата") or t."дата"=?::date)
  and (t."значение" = ? or  t."значение" ~ ?)


@@ сотрудники на объектах
--- для отчета спец-та по тендерам
select
  "профиль", "ФИО", "должности",
  array_agg("объект") as "объекты",
  array_agg("объект/название") as "объекты/название",
  array_agg("всего смен") as "всего смен",
  array_agg(array_to_string("дни", ', ')) as "дни"
from (
select              
---sum(coalesce(text2numeric(t."значение"), 0::numeric)) as "всего часов",
  count(t."значение") as "всего смен",
  array_agg(date_part('day', t."дата") order by date_part('day', t."дата") ) as "дни",
  og.id as "объект", og.name as "объект/название",
  p.id as "профиль", array_to_string(p.names, ' ') as "ФИО",
  g1."должности"
from 
  {%= $dict->render('табель/join') %}
  left join (--- должности 
    select array_agg(g1.name) as "должности" , r1.id2 as pid
    from refs r1 
    {%= $dict->render('должности/join') %}
    where n.g_id is null --- нет родителя топовой группы
    group by r1.id2
  ) g1 on p.id=g1.pid
where 
  (?::int=0 or og.id=?) -- объект
  and "формат месяц"(?::date)="формат месяц"(t."дата")
  and t."значение" ~ '^\d' --- только цифры часов в начале строки
  ---and coalesce(og."disable", false)=Х::boolean -- отключенные/не отключенные объекты
group by p.id, g1."должности", og.id, og.name  ---, p.names
---order by p.names
) s
group by "профиль", "ФИО",  "должности"
order by "ФИО"
;

@@ квитки
--- на принтер
select s.*, d."должности", o.id::boolean as "печать"
from (
select sum."профиль", sum.names, 
  array_agg(sum."объект") as "объекты",
  array_agg(sum."объект/name") as "объекты/name",
  array_agg(sum."всего часов") as "всего часов",
  array_agg(sum."всего смен") as "всего смен",
  array_agg(pay."начислено") as "начислено"
  
from (
    {%= $dict->render('сводка за месяц/суммы', join=>$join) %}
  ) sum
  ----------------Начислено---------------------
  left join lateral (
  select t."коммент" as "начислено"
  from 
    {%= $dict->render($join) %}
  where p.id=sum."профиль"
    and og.id=sum."объект" -- объект
    and  sum."формат месяц"="формат месяц"(t."дата") -- 
    and t."значение" = 'Начислено'
    and t."коммент" is not null and "коммент"<>''
  order by t."дата" desc
  limit 1
  ) pay on true
  group by sum."профиль", sum.names
) s 

left join (--- должности

    select array_agg(g1.name) as "должности" , r1.id2 as pid
    from refs r1 
    {%= $dict->render('должности/join') %}
    where n.g_id is null --- нет родителя топовой группы
    group by r1.id2

) d on s."профиль" = d.pid

left join lateral ( --- установить крыжик печать для сотрудников доступных объектов
  select id
  from "доступные объекты"(?, s."объекты")
  limit 1
) o on true

order by s.names;