package Model::Nomen;
use Mojo::Base 'Model::Base';
#~ use Mojo::Util qw(dumper);

#~ has sth_cached => 1;

#~ has [qw(app)];

sub init {
  #~ state $self = shift->SUPER::new(@_);
  my $self = shift;
  #~ $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  $self->dbh->do($self->sth('таблицы'));
  $self->dbh->do($self->sth('функции'));
  #~ return $self;
}

sub список {
  my ($self, $root, $param) = (shift, shift, ref $_[0] ? shift : {@_},);
  $self->dbh->selectall_arrayref($self->sth('список', select=>$param->{select} || '*',), {Slice=>{}}, ($root) x 2);
}

sub список_без_потомков {
  my ($self, $root, $param) = (shift, shift, ref $_[0] ? shift : {@_},);
  $self->dbh->selectall_arrayref($self->sth('список', select=>$param->{select} || '*', where=>' and c.childs is null '), {Slice=>{}}, ($root) x 2);
}

sub сохранить_номенклатуру {
  my ($self, $nom) = @_;
  my @new = grep $_->{title}, @{$nom->{newItems} || []};
  
  return "нет наименования номенклатуры"
    unless ($nom->{selectedItem} && $nom->{selectedItem}{id}) || @new;
  
  my $parent = ($nom->{selectedItem} && $nom->{selectedItem}{id}) || ($nom->{topParent} && $nom->{topParent}{id});
  
  $nom->{selectedItem} = $self->проверить_путь([map $_->{title}, @new])
    and $nom->{id} = $nom->{selectedItem}{id}
    and return $nom
    unless $parent;
  
  for (@new) {
    $_->{parent} = $parent;# для проверки
    my $new= eval {$self->сохранить($_)};# || $@;
    $self->app->log->error($@)
      and return "Ошибка: $@"
      unless ref $new;
    $parent = $new->{id};
    #~ push @{$nom->{selectedPath} ||= []}, $new;
    $nom->{selectedItem} = $new;
    #~ push @{$nom->{newItems}}, $new;# для проверки и кэшировагния
  }
  
  #~ $nom->{selectedItem} = $nom->{selectedPath}[-1]
    #~ if @new;
    #~ unless $nom->{selectedItem} && $nom->{selectedItem}{id};
  
  $nom->{id} = $nom->{selectedItem}{id};
  return $nom;
  
}

sub сохранить {
  my ($self, $data) = @_;
  $data->{title} =~ s/^\s+|\s+$//g;
  $data->{title} =~ s/\s{2,}/ /g;
  my $r = $self->dbh->selectrow_hashref($self->sth('проверить'), undef, @$data{qw(parent title)});
   #~ die "Такая категория [$data->{parent}][$data->{title}] уже есть "
    #~ if @$r;
  return $r
    if $r;
  
  my $n = $self->вставить_или_обновить($self->{template_vars}{schema}, "номенклатура", ["id"], $data);
  $self->связь($data->{parent}, $n->{id})
    if $data->{parent};
  return $n;
  
}

sub проверить_путь {# новый путь
  my ($self, $path) = @_;   #   массив
  
  $self->dbh->selectrow_hashref($self->sth('проверить путь'), undef, $path);
  
}

1;

__DATA__
@@ таблицы
create table IF NOT EXISTS "номенклатура" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  "title" varchar not null, --
  "disable" boolean,
  "descr" text
);


@@ функции
CREATE OR REPLACE FUNCTION "номенклатура/родители"()
RETURNS TABLE("id" int, title varchar, parent int, "parents_id" int[], "parents_title" varchar[], parents_descr text[], level int) --, , "level" int[]
AS $func$

/*Базовая функция для компонентов поиска-выбора позиции и построения дерева*/

WITH RECURSIVE rc AS (
   SELECT c.id, c.title, p.id as "parent", p.title as "parent_title", p.id as "parent_id", p.descr as parent_descr, 0::int AS "level"
   FROM "номенклатура" c
    left join (
    select c.*, r.id2 as child
    from "номенклатура" c
      join refs r on c.id=r.id1
    ) p on c.id= p.child
    
   UNION
   
   SELECT rc.id, rc.title, rc."parent", c.title, c.id as parent, c.descr, rc.level + 1 AS "level"
   FROM rc ---ON c.id = rc.child
      join refs r on r.id2=rc."parent_id"
      join "номенклатура" c on r.id1= c.id
)

SELECT id, title, parent,
  array_agg("parent_id" order by "level" desc),
  array_agg("parent_title" order by "level" desc),
  array_agg("parent_descr" order by "level" desc),
  max("level") as "level"
---from (
---select rc.*, g.title, g.descr, g.disable
FROM rc
---  join "номенклатура" g on rc.id=g.id
---) r
group by id, title, parent;

$func$ LANGUAGE SQL;

/*------------------------------------------------------------------------------*/
CREATE OR REPLACE FUNCTION "номенклатура/родители узла"(int, boolean)
-- вверх (2 парам - логич: true - включить топ-корень (нужно для индексного пути) и false в остальных случаях)
RETURNS TABLE("id" int, title text, parent int, level int)
AS $func$

WITH RECURSIVE rc AS (
   SELECT c.id, c.title, p.id1 as parent, 1::int AS level
   FROM "номенклатура" c
      left join (
      select  r.*
        from refs r 
        join "номенклатура" c2 on r.id1= c2.id
      ) p on p.id2=c.id
   WHERE c.id = $1
   UNION
   SELECT c.id, c.title, p.id1 as parent, rc.level + 1 AS level
   FROM "номенклатура" c
      JOIN rc ON c.id = rc.parent
      left join (
      select  r.*
        from refs r 
        join "номенклатура" c2 on r.id1= c2.id
      ) p on p.id2=rc.parent
    WHERE coalesce($2, false) or p.id1 is not null
)

/*
select c.id, c.title, 0 as parent, 0::int2 as "order", 1000::int AS level
from "категории" c
where coalesce($2, false) and id=3-- корень
union 
*/
SELECT *
FROM rc
--order by level desc

$func$ LANGUAGE SQL;

/*----------------------------------------------------------------------------*/
CREATE OR REPLACE FUNCTION "номенклатура/родители узла/title"(int, boolean)
/*
вверх
*/
RETURNS text[]
AS $func$

select array_agg(title order by level desc) as "full_title"
---from (
---select title
from "номенклатура/родители узла"($1, $2)
--order by level desc
--) s

$func$ LANGUAGE SQL;

/*--------------------------------------------------------------------------*/
CREATE OR REPLACE FUNCTION "номенклатура/потомки узла"(int)
/*
Только на уровне ниже
*/
RETURNS SETOF "номенклатура"
AS $func$

select cc.*
from "номенклатура" c
  join refs r on c.id=r.id1
  join "номенклатура" cc on cc.id=r.id2

where c.id=$1;


$func$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION check_nomen() RETURNS "trigger" AS
$BODY$  

BEGIN 
  IF EXISTS (
    SELECT 1
    FROM (select r.title
     from refs rr
     join "номенклатура" r on r.id=rr.id2-- потомки одного уровня
     WHERE rr.id1=NEW.id1 -- new parent
    ) e
    join "номенклатура" r on r.id=NEW.id2 and lower(r.title)=lower(e.title)

  ) THEN
      RAISE EXCEPTION 'Повтор названия номенклатуры на одном уровне' ;
   END IF;   

  RETURN NEW;
  
END; 
$BODY$
  LANGUAGE 'plpgsql';--- VOLATILE;

DROP TRIGGER  IF EXISTS  check_nomen ON refs;
CREATE  TRIGGER check_nomen -- CONSTRAINT только для AFTER
    BEFORE INSERT OR UPDATE  ON refs
    FOR EACH ROW  EXECUTE PROCEDURE check_nomen(); 


/******************конец функций******************/

@@ список
select {%= $select || '*' %} from (select g.*, r."parent", r."parents_id", r."parents_title", c.childs
from "номенклатура/родители"() r
join "номенклатура" g on r.id=g.id
left join (
  select array_agg(c.id) as childs, r.id1 as parent
  from "номенклатура" c
    join refs r on c.id=r.id2
  group by r.id1
) c on r.id= c.parent

where (coalesce(?::int, 0)=0 or r."parents_id"[1]=?::int)                         ----=any(r."parents_id") -- может ограничить корнем
{%= $where %}
) t
;

@@ проверить
--перед вставкой
select *
from "номенклатура/потомки узла"(?)
where lower(regexp_replace(title, '\s{2,}', ' ', 'g')) = lower(regexp_replace(?::text, '\s{2,}', ' ', 'g'))
;

@@ проверить путь
--- если topParent null
select *
from "номенклатура/родители"()
where regexp_replace(lower(array_to_string(parents_title||title, '\t')), '\s+', '')=regexp_replace(lower(array_to_string(?::varchar[], '\t')), '\s+', '');---array['цемент', 'мкр,т', 'т']