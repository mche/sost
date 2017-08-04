package Model::Category;
use Mojo::Base 'Model::Base';
use Clone 'clone';
use Mojo::Asset::File; # файлы
use Mojo::JSON qw(encode_json);
use Mojo::Util qw(dumper);

#~ has sth_cached => 1;
my $main_table ="категории";

has qw(app);

has static_dir => sub { shift->app->config('mojo_static_paths')->[0]; };

sub new {
  state $self = shift->SUPER::new(@_);
  $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  $self->dbh->do($self->sth('таблицы'));
  $self->dbh->do($self->sth('функции'));
  $self->кэш(3);# корень
  return $self;
}

sub expand_node {
  my ($self, $parent_id) = @_;
  return $self->dbh->selectall_arrayref($self->sth('узлы родителя'), {Slice=>{}}, $parent_id);
  
}

#~ sub category_count {
  #~ my ($self) = @_;
  #~ return $self->dbh->selectall_hashref($self->sth('количество категорий'), 'id',);
#~ }

sub сохранить_категорию {
  my ($self, $hashref) = @_;
  $hashref->{title} =~ s/^\s+|\s+$//g;
  $hashref->{title} =~ s/\s{2,}/ /g;
  my $r = $self->dbh->selectrow_hashref($self->sth('проверить категорию'), undef, @$hashref{qw(parent title)});
   #~ die "Такая категория [$hashref->{parent}][$hashref->{title}] уже есть "
    #~ if @$r;
  return $r
    if $r;
  
  my $nc = $self->вставить_или_обновить($self->{template_vars}{schema}, $main_table, ["id"], $hashref);
  $self->связь($hashref->{parent}, $nc->{id});
  return $nc;
  
}

sub индексный_путь_категории {
  my ($self, $category_id) = @_;
  $self->dbh->selectrow_array($self->sth('индексный путь категории'), undef, $category_id);
}

sub родители_категории {
  my ($self, $category_id) = @_;
  $self->dbh->selectall_arrayref($self->sth('категории/родители узла'), { Slice=> {} }, ($category_id) x 1);
}

sub категории_для_поиска {
  my ($self,) = @_;
  my $r = $self->dbh->selectall_hashref($self->sth('категории для поиска'), 'id',);
  #~ return $r;
  map {
    my $row = $_;
    $row->{selectedPath} = [];
    map {
      #~ my %copy = %{};
      push @{$row->{selectedPath}}, clone($r->{$_});
    } @{$_->{parents_id}};
  } values %$r;
  return [ map {$r->{$_}} sort {$r->{$a}{'#'} <=> $r->{$b}{'#'} } keys %$r ];
}

sub дерево_и_поиск {
  my ($self, $parent) = @_;# $parent - корень ид
  
  return {
    tree=>$self->unpack_tree($parent),
    search=>$self->категории_для_поиска($parent),
    
  };
  
};


sub кэш {# дерево и поиск
  my ($self, $parent) = @_;# $parent - корень ид
  
  my $cache_path = sprintf("%s/%s/%s", $self->app->config('mojo_home'), $self->static_dir, "js/c/category/tree+search.json");# : "/js/c/category/tree+search.json";
  
  return $cache_path # без корня вернем путь к файлу кэша
    unless defined $parent;
  #~ $parent ||= 3;
  
  my $data = $self->дерево_и_поиск($parent);
  
  my $file = Mojo::Asset::File->new;# Temporary file
  $file->add_chunk(encode_json  $data)
    ->move_to($cache_path);
}

sub unpack_tree {# рекурсивно распаковать список таблицы дерева в иерархию дерева
  my ($self, $node_id, $count) = @_;# count флажок количеств единиц в категориях
  my $childs = $self->expand_node($node_id);
  for my $child (@$childs) {
    $child->{_count} = $self->category_count->{$child->{id}}{count} // 0
      if $count;
    delete $child->{ts};
    $child->{_childs_ids} = delete $child->{childs}; # просто массив индексов потомков
    $child->{_img_url} = $child->{img} #$img_path . '/' . 
      if $child->{img};
    $child->{childs} = $self->unpack_tree($child->{id}, $count);
  }
  return $childs;
}


sub pack_tree {# рекурсивно упаковать структуру дерева в список таблицы
  my $self = shift;
  my ($parent, $childs) = @_; #@childs
  $childs ||= $parent->{childs};
  #~ $parent = $model->категория($parent)
    #~ unless ref $parent;
  #~ $parent->{childs} = \@childs;
  my $ret = [];# возвратить список сохраненых узлов
  while ( my $child = shift @$childs ) {
    my $childs = delete $child->{childs};
    #~ $child->{childs} = [];# теперь тут иды
    #~ for (@$childs) {
      #~ $_->{id} ||= $self->sequence_next_val($self->{template_vars}{sequence});
      #~ push @{$child->{childs}}, $_->{id};
    #~ }
    #~ $child->{parent} = $parent->{id};
    #~ if ($child->{img} && !$child->{_img_url}) {# покинуть картинку
      #~ my $path = $asset_img->path;
      #~ $asset_img->path($path."/".$child->{img})->move_to('/dev/null');
      #~ $asset_img->path($path);
      #~ $child->{img} = undef;
    #~ }
    my $skip_data = {};
    $skip_data->{$_} = delete $child->{$_} for grep /^_/ || ! defined $child->{$_} , keys %$child;
    #~ $c->app->log->debug($c->dumper($child));
    my $node =  $self->сохранить_категорию($child);# 
    #~ $child->{_childs} = delete $child->{childs};
    #~ $child->{childs} = $childs;
    push @$ret, $node, @{$self->pack_tree($node, $childs)};
  }
  return $ret;
}

1;

__DATA__
@@ таблицы
create table IF NOT EXISTS "{%= $schema %}"."{%= $tables->{main} %}" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  title text not null,
  parent int not null,
  childs int[] not null default '{}'::int[],
  disabled boolean,
  img text, --- имя файла в спец каталоге см $img_path Controll::Category;
  "order" int2
);
--- корень дерева категорий
--- insert into "{%= $schema %}"."{%= $tables->{main} %}" (title, parent) values ('Корень1', 0) returning *;

@@ проверить категорию
--перед вставкой
select *
from "категории/потомки узла"(?)
where lower(regexp_replace(title, '\s{2,}', ' ', 'g')) = lower(regexp_replace(?::text, '\s{2,}', ' ', 'g'))
;

@@ узлы родителя
-- expand_node
select * from  "категории/потомки узла/потомки"(?)

;

@@ индексный путь категории?cached=1

select "категории/индексный путь"(?);


@@ категории/родители узла
SELECT c.*
FROM "категории/родители узла"(?, false) x
  join "категории" c on x.id=c.id
order by x.level desc
;

@@ категории для поиска?cached=1
/*
select id, title, "категории/родители узла/title"(id, false) as "selectedTitle", ------random_int_array(5, 6, 40) проверил сортировку по массиву
  "категории/индексный путь"(id) as "selectedIdx"
---from (
---select c.id, array_agg(pc.title) as path ---, array_agg(pc.img) as img
from "категории/ветка узла"(3) ---"категории" c 
---join lateral (select cc.* from "категории/родители узла"(c.id, false) cc order by level desc)  pc on true
where ---"сборка названий категории"(c."id") ~ '\mямо'
  c.id <> 3
---group by c.id
---order by array_to_string(array_agg(pc.title), '/')
--) q
order by 3
;
*/

select row_number() OVER (order by parents_title) "#", -- нумератор для преобразования массива parents_id в массив индексов этой выборки
  id, title, "order",
  parents_id[2:(array_upper(parents_id, 1)-0)] as parents_id,
  parents_title[2:(array_upper(parents_title, 1)-0)] as parents_title, ------random_int_array(5, 6, 40) проверил сортировку по массиву
  "категории/индексный путь"(id) as "selectedIdx"
from (
select c.id, c.title, c."order",
  array_agg(pc.id) as parents_id, array_agg(pc.title) as parents_title ---, array_agg(pc.img) as img
from "категории" c 
  join lateral (select cc.* from "категории/родители узла"(c.id, true) cc order by level desc)  pc on true
where ---"сборка названий категории"(c."id") ~ '\mямо'
  c.id <> 3
group by c.id
---order by 2 ---array_to_string(array_agg(pc.title), '/')
) q
---where coalesce(3, 3) = any(parents_id) --- если нужно ограничивать только ветку
order by 6 -- по массиву parents_title
;

@@ функции


/*--------------------------------------------------------------------------*/
CREATE OR REPLACE FUNCTION "категории/потомки узла"(int)
/*
Только на уровне ниже
*/
RETURNS SETOF "категории"
AS $func$

select cc.*
from "категории" c
  join refs r on c.id=r.id1
  join "категории" cc on cc.id=r.id2

where c.id=$1;


$func$ LANGUAGE SQL;

/*----------------------------------------------------------------------------*/
CREATE OR REPLACE FUNCTION "категории/потомки узла/id"(int)
/*
Только на уровне ниже
*/
RETURNS int[]
AS $func$

select array_agg(id)
from (
select id
from "категории/потомки узла"($1)
order by coalesce("order", id)
) o

$func$ LANGUAGE SQL;

/*----------------------------------------------------------------------------*/
CREATE OR REPLACE FUNCTION "категории/потомки узла/потомки"(int)
/*
expand_node
*/
RETURNS TABLE("id" int, title text, parent int, "order" int2, childs int[])
AS $func$

select id, title, parent, "order", "категории/потомки узла/id"(id) as childs
from "категории/потомки узла"($1)

$func$ LANGUAGE SQL;

/*------------------------------------------------------------------------------*/
CREATE OR REPLACE FUNCTION "категории/ветка узла"(int)
-- вниз
RETURNS TABLE("id" int, title text, parent int, parents_id int[], parents_title text[], "order" int2, level int)
AS $func$

WITH RECURSIVE rc AS (
   SELECT cc.id, cc.title, c.id as parent, array[c.id]::int[]  as parents_id,  array[c.title]::text[]  as parents_title, cc."order", 1::int AS level
   FROM "категории" c
      join refs r on c.id=r.id1
      join "категории" cc on r.id2= cc.id -- child
   WHERE c.id = $1
   UNION
   SELECT cc.id, cc.title, rc.id as parent, array_append(rc.parents_id, rc.id) as parents_id, array_append(rc.parents_title, rc.title) as parents_title, cc."order", rc.level + 1 AS level
   FROM "категории" c
      JOIN rc ON c.id = rc.id
      join refs r on r.id1=rc.id
      join "категории" cc on r.id2= cc.id --child
       
   ---where coalesce($2, false) or c.parent<>0 --   кроме топа
)

SELECT *
FROM rc
--order by level desc

$func$ LANGUAGE SQL;

/*----------------------------------------------------------------------------*/
CREATE OR REPLACE FUNCTION "категории/ветка узла/потомки"(int)
/*
Только на уровне ниже
*/
RETURNS TABLE("id" int, title text, parent int, parents_id int[], parents_title text[], "order" int2, level int, childs int[])
AS $func$

select *,"категории/потомки узла/id"(id) as childs
from "категории/ветка узла"($1)

$func$ LANGUAGE SQL;

/*------------------------------------------------------------------------------*/
CREATE OR REPLACE FUNCTION "категории/родители узла"(int, boolean)
-- вверх (2 парам - логич: true - включить топ-корень (нужно для индексного пути) и false в остальных случаях)
RETURNS TABLE("id" int, title text, img text, parent int, "order" int2, level int)
AS $func$

WITH RECURSIVE rc AS (
   SELECT c.id, c.title, c.img, p.id1 as parent, c."order",  1::int AS level
   FROM "категории" c
      left join (
      select  r.*
        from refs r 
        join "категории" c2 on r.id1= c2.id
      ) p on p.id2=c.id
   WHERE c.id = $1
   UNION
   SELECT c.id, c.title, c.img, p.id1 as parent, c."order",  rc.level + 1 AS level
   FROM "категории" c
      JOIN rc ON c.id = rc.parent
      left join (
      select  r.*
        from refs r 
        join "категории" c2 on r.id1= c2.id
      ) p on p.id2=rc.parent
    WHERE coalesce($2, false) or p.id1 is not null
)

/*
select c.id, c.title, c.img, 0 as parent, 0::int2 as "order", 1000::int AS level
from "категории" c
where coalesce($2, false) and id=3-- корень
union */
SELECT *
FROM rc
--order by level desc

$func$ LANGUAGE SQL;

/*----------------------------------------------------------------------------*/
CREATE OR REPLACE FUNCTION "категории/родители узла/потомки"(int, boolean)
/*
(2 парам - логич: true - включить топ-корень (нужно для индексного пути) и false не включать в остальных случаях)
*/
RETURNS TABLE("id" int, title text, img text, parent int, "order" int2, level int, childs int[])
AS $func$

select *,"категории/потомки узла/id"(id) as childs
from "категории/родители узла"($1, $2)

$func$ LANGUAGE SQL;

---select c.id, array_to_string(array_agg(pc.title), '/') from "категории" c join lateral (select cc.* from "категории/родители узла"(c.id, null) cc order by level desc)  pc on true group by c.id;

/*----------------------------------------------------------------------------*/
CREATE OR REPLACE FUNCTION "категории/родители узла/id"(int, boolean)
/*
вверх
*/
RETURNS int[]
AS $func$

select array_agg(id order by level desc)
from "категории/родители узла"($1, $2)


$func$ LANGUAGE SQL;

/*----------------------------------------------------------------------------*/
CREATE OR REPLACE FUNCTION "категории/родители узла/title"(int, boolean)
/*
вверх
*/
RETURNS text[]
AS $func$

select array_agg(title order by level desc)
---from (
---select title
from "категории/родители узла"($1, $2)
---order by level desc
---) s

$func$ LANGUAGE SQL;

/*-----------------------------------------------------------------*/
CREATE OR REPLACE FUNCTION "категории/индексный путь"(int)
RETURNS int[]
AS $func$

WITH x AS (
  SELECT * FROM "категории/родители узла/потомки"($1, true)
)

select array_agg(idx)::int[]
from (
  select id1, idx-1 as idx, x2.id
    from
      x as x1
        join x as x2 on x1.id=x2.parent,
      unnest(x1.childs) WITH ORDINALITY x0(id1, idx)
    order by x2.level desc
) q 
where id1 =id
;

$func$ LANGUAGE SQL;

/*-----------------------------------------------------------------
проверка уникальности на уровне
*/


CREATE OR REPLACE FUNCTION check_category() RETURNS "trigger" AS
$BODY$  

BEGIN 
  IF EXISTS (
    SELECT 1
    FROM (select r.title
      from refs rr
      join "категории" r on r.id=rr.id2-- childs
    WHERE rr.id1=NEW.id1 -- new parent
    ) e
    join "категории" r on r.id=NEW.id2 and r.title=e.title
  ) THEN
      RAISE EXCEPTION 'Повтор названия категории на одном уровне' ;
   END IF;   

  RETURN NEW;
  
END; 
$BODY$
  LANGUAGE 'plpgsql';--- VOLATILE;

DROP TRIGGER  IF EXISTS  check_category ON refs;
CREATE  TRIGGER check_category -- CONSTRAINT только дл я AFTER
    BEFORE INSERT OR UPDATE  ON refs
    FOR EACH ROW  EXECUTE PROCEDURE check_category(); 

/*-----------------------------------------------------------------*/

/*
CREATE OR REPLACE FUNCTION "сборка названий категории"(int)
RETURNS text
AS $func$
select array_to_string(array_agg(c.title), '/')
from (select * from "категории/родители узла"($1) c order by level desc) c
---group by c.id
;
$func$ LANGUAGE SQL
---- Обязательно IMMUTABLE функция для индекса;
IMMUTABLE;


CREATE INDEX IF NOT EXISTS "категории сборка названий_gin" on "категории" USING gin ("сборка названий категории"("id") gin_trgm_ops);

*/
/*
select array_to_json(array_agg(c))
from (
select c.id, array_agg(pc.title) as path
from "категории" c 
join lateral (select cc.* from "категории/родители узла"(c.id, null) cc order by level desc)  pc on true
where ---"сборка названий категории"(c."id") ~ '\mямо'
  c.id <> 22
group by c.id
order by array_to_string(array_agg(pc.title), '/')
) c
;
*/
