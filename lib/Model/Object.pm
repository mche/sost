package Model::Object;
use Mojo::Base 'Model::Base';
#~ use Mojo::Util qw(dumper);

#~ has sth_cached => 1;

has [qw(app)];

sub new {
  state $self = shift->SUPER::new(@_);
  #~ $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  #~ $self->dbh->do($self->sth('таблицы'));
  $self->dbh->do($self->sth('функции'));
  return $self;
}

sub список {
  my $self = shift;
  $self->dbh->selectall_arrayref($self->sth('список'), {Slice=>{}},);
}

sub доступные_объекты {# если $oid undef - значит выбрать все доступные об, конктетный ИД - проверить доступ к этому об, если ИД=0 - значит проверить доступ ко всем об(через топ-группу)
  my ($self, $uid, $oid) = @_; # ид профиля
  $self->dbh->selectall_arrayref($self->sth('доступные объекты'), {Slice=>{},}, $uid, [$oid]);
}

sub объекты_проекты {
  my $self = shift;
  my $oid = ref $_[0] ? shift : [@_];
  $self->dbh->selectall_arrayref($self->sth('объекты+проекты'), {Slice=>{}}, ($oid) x 3);
}


1;

__DATA__
@@ таблицы
---

@@ функции

/*--------------------------------------------------------*/
drop view if exists "roles/childs[]";
CREATE OR REPLACE view "roles/childs[]" as
--- потомки ниже уровня
select p.id, array_agg(distinct c.id) as "childs/id"
from roles p
  left join (
    select c.*, r.id1
    from refs r
      join roles c on c.id=r.id2
  ) c on p.id=c.id1
group by p.id
;

/*--------------------------------------------------------*/

drop FUNCTION if exists "roles/родители"() CASCADE;
CREATE OR REPLACE FUNCTION "roles/родители"()
RETURNS TABLE("id" int, name varchar, descr text, disable boolean, parent int, "parents/id" int[], "parents_id" int[], "parents/name" varchar[], "parents_name" varchar[], "parents/descr" text[], "parents_descr" text[], "childs/id" int[], level int)
AS $func$

/*Базовая функция для дерева*/

WITH RECURSIVE rc AS (
   SELECT c.id, c.name, c.descr, c.disable, p.id as "parent", p.name as "parent/name", p.id as "parent/id", p.descr as "parent_descr", 0::int AS "level"
   FROM "roles" c
    left join (
    select c.*, r.id2 as child
    from "roles" c
      join refs r on c.id=r.id1
    ) p on c.id= p.child
    
   UNION
   
   SELECT rc.id, rc.name, rc.descr, rc.disable, rc."parent", p.name, p.id as parent, p.descr as "parent_descr", rc.level + 1 AS "level"
   FROM rc 
      join refs r on r.id2=rc."parent/id"
      join "roles" p on r.id1= p.id
)

SELECT id, name, descr, disable, parent,
  "parents/id", "parents/id", --- дважды
  "parents/name", "parents/name", -- дважды
  "parents/descr", "parents/descr" as "parents_descr",
  "childs/id", "level"
FROM (
  SELECT rc.id, rc.name, rc.descr, rc.disable, rc.parent,
    array_agg(rc."parent/id" order by rc."level" desc) as "parents/id",  ---уникальность массива вследствие повторение пути ветвей структуры
    array_agg(rc."parent/name" order by rc."level" desc) as "parents/name",
    array_agg(rc."parent_descr" order by rc."level" desc) as "parents/descr",
    c."childs/id",
    max(rc."level") as "level"

  FROM rc
    left join "roles/childs[]" c on rc.id=c.id -- потомки ниже уровня

  group by rc.id, rc.name, rc.descr, rc.disable, rc.parent, c."childs/id"
) a;

$func$ LANGUAGE SQL;

/*-----------------------------------------------------------*/

drop view if exists "объекты" CASCADE;
CREATE OR REPLACE VIEW "объекты" AS
select *
from  "roles/родители"()
where 3403=any("parents/id") --- Объекты и подразделения
  and (coalesce("childs/id", array[]::int[])=array[]::int[] or "childs/id"=array[null]::int[]) --- только финальные позиции ветки 3403

;


---CREATE OR REPLACE  VIEW "" as
drop FUNCTION if exists "доступные объекты"(int, int[]);
CREATE OR REPLACE FUNCTION "доступные объекты"(int, int[])
RETURNS TABLE("id" int, name varchar, descr text, disable boolean, parent int, "parents/id" int[], "parents_id" int[], "parents/name" varchar[],  "parents_name" varchar[], "parents/descr" text[], "parents_descr" text[], "childs/id" int[], level int)
LANGUAGE sql
AS $end$
/* проверять доступ профиля к объектам или все его доступные объекты
*/
/*select distinct o.id, o.ts, o.name, o.disable, o.descr ---, array[r1.id2, r3.id2]::int[] as "профиль"
from
   
  (--  все объекты
    select distinct g1.*, r3.id2 as _profile_top
    from roles g1
      join refs r2 on g1.id = r2.id2
      join roles g2 on g2.id=r2.id1 -- 
      left join refs r3 on g2.id = r3.id1 and r3.id2 = $1      --- доступ по топовой группе
    where 
      g2."name"='Объекты и подразделения'
        and not coalesce(g1."disable", false)
) o 

left join refs r1 on o.id=r1.id1

where 
  (o._profile_top is not null or $1=r1.id2) -- по профилю
  and (o.id=any($2) or $2 is null or $2[1] is null or (o._profile_top is not null and $2[1]=0)) --  к объектам
  ---  or ((o.id=any($2) or coalesce($2[1], 0)=0) and $1=r3.id2))--- если 0(все объекты) то проверить связь с топовой группой объектов
;*/

select o.*
from "объекты" o
  left join refs r on r.id1=any(o."parents/id" || o.id)
where r.id2=$1
  and (o.id=any($2) or $2 is null or $2[1] is null
    or (o.parent=3403 and $2[1]=0)) --  к объектам

$end$
;


/****************        ЗАПРОСЫ  ********************/

@@ список0000
--- для отчета все объекты
select o.*,
  row_to_json(p) as "$проект/json"
from "объекты" o
   left join (
    select distinct p.id, p.name, p.descr, p.disable, p."контрагент/id", /*p."$контрагент/json",*/ r.id2
    from "refs" r
      join "проекты" p on p.id=r.id1
  ) p on o.id=p.id2
--where not coalesce("disable", false)
--order by name
;

@@ список
select *
from "проекты/объекты";

@@ доступные объекты
--- для форм ввода
select o.*,
  k.id as "контрагент/id", 
  row_to_json(k) as "$контрагент/json",
  row_to_json(p) as "$проект/json"
from
  "доступные объекты"(?, ?) o
  
  left join (
    select distinct p.id, p.name, r.id2
    from "refs" r
      join "проекты" p on p.id=r.id1
  ) p on o.id=p.id2
  
  left join (
    select k.*, r.id1
    from  refs r
      join "контрагенты" k on k.id=r.id2
  ) k on p.id=k.id1

;


@@ объекты+проекты
select *
from "проекты/объекты"
where (?::int[] = array[]::int[] or (?::int[])[1]=0 or id=any(?))
;

