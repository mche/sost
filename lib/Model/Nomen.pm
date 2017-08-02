package Model::Nomen;
use Mojo::Base 'Model::Base';
#~ use Mojo::Util qw(dumper);

#~ has sth_cached => 1;

has [qw(app)];

sub new {
  state $self = shift->SUPER::new(@_);
  #~ $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  $self->dbh->do($self->sth('таблицы'));
  $self->dbh->do($self->sth('функции'));
  return $self;
}

sub список {
  my $self = shift;
  $self->dbh->selectall_arrayref($self->sth('список'), {Slice=>{}},);
  
  
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
RETURNS TABLE("id" int, title varchar, descr text, disable boolean, parent int, "parents_id" int[], "parents_title" varchar[], parents_descr text[]) --, level int[]
AS $func$

WITH RECURSIVE rc AS (
   SELECT c.id, p.id as "parent", p.title as "parent_title", p.id as "parent_id", p.descr as parent_descr, 1::int AS level
   FROM "номенклатура" c
    left join (
    select c.*, r.id2 as child
    from "номенклатура" c
      join refs r on c.id=r.id1
    ) p on c.id= p.child
    
   UNION
   
   SELECT rc.id, rc."parent", c.title, c.id as parent, c.descr, rc.level + 1 AS level
   FROM rc ---ON c.id = rc.child
      join refs r on r.id2=rc."parent_id"
      join "номенклатура" c on r.id1= c.id
)

SELECT id, title, descr, disable, parent,
  array_agg("parent_id" order by "level" desc),
  array_agg("parent_title" order by "level" desc),
  array_agg("parent_descr" order by "level" desc)
---, array_agg(level order by "level" desc) as level
from (
select rc.*, g.title, g.descr, g.disable
FROM rc
  join "номенклатура" g on rc.id=g.id
) r
group by id, title, descr, disable, parent;

$func$ LANGUAGE SQL;

@@ список
select g.*, r."parent", r."parents_id", r."parents_title", c.childs
from "номенклатура/родители"() r
join "номенклатура" g on r.id=g.id
left join (
  select array_agg(c.id) as childs, r.id1 as parent
  from "номенклатура" c
    join refs r on c.id=r.id2
  group by r.id1
) c on r.id= c.parent

order by r.id, r.parents_title
;