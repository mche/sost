package Model::Staff;
use Mojo::Base 'Model::Base';
#~ use Mojo::Util qw(dumper);

#~ has sth_cached => 1;
has [qw(app)];
#~ has model_obj => sub {shift->app->models->{'Object'}};


sub init {
  my $self = shift;
  #~ $self->dbh->do($self->sth('таблицы'));
  #~ $self->dbh->do($self->sth('функции'));
  
}

sub роли {
  my ($self, $param) = (shift, ref $_[0] ? shift : {@_});
  $self->dbh->selectall_arrayref($self->sth('роли', and_where=>$param->{where} || ''), {Slice=>{}}, @{$param->{bind} || []});
}

sub профили {
  my $self = shift;
  $self->dbh->selectall_arrayref($self->sth('профили'), {Slice=>{}},);
}

1;

__DATA__
@@ роли
select 
  r.*,
  null as "навигационный маршрут",
  r."childs/id" as childs,
  p1.parents1
from "roles/родители"() r

left join (
  select array_agg(g.id order by primary_ref) as parents1, g.child
    from (
      select c.id, r.id2 as child, r.id as primary_ref
      from "roles" c
        join refs r on c.id=r.id1
      ---order by r.id
    ) g
    group by g.child
) p1 on r.id= p1.child

where case when "parents/id"[1] is null then array[id]::int[] else "parents/id" end && array[20959, 10814, 3886, 57516 ]::int[] --- проекты бригнады должности иностранцы
  and not idx(array[4269, 3935, 4294, 76291, 4404, 4234, 4290, 4163,4316,4246 ]::int[], id)::boolean  --- важные должности
  and (parent is null or (not (icount(parents1) > 1 and parents1[array_upper(parents1, 1)] = parent))) --- отсечь вложенные группы
  {%= $and_where || '' %}

order by r.id, array_to_string(r.parents_name, '')
;

@@ профили
select p.*---, h."@приемы-увольнения/json"
from
  "профили" p
  /***left join lateral (
    select array_agg(row_to_json(h.*)) as "@приемы-увольнения/json"
    from refs r
      join "профили/прием-увольнение" h on h.id=r.id2
    where r.id1=p.id
  ) h on true***/
  
order by p.names
;

@@ функции
                                                                                                                              /*****************************/
                                                                                                                             /* История приема-увольнения */
                                                                                                                            /****************************/

CREATE TABLE IF NOT EXISTS "профили/прием-увольнение" (
  id integer  not null default nextval('{%= $sequence %}'::regclass) primary key,
  ts timestamp not null default now(), 
  disable boolean
);

CREATE OR REPLACE FUNCTION "тригг/профили/прием-увольнение"() RETURNS TRIGGER AS
$func$
DECLARE
    new_id int;
BEGIN
  IF OLD.id is null or coalesce(NEW.disable, false) <> coalesce(OLD.disable, false)  THEN
    insert into "профили/прием-увольнение" (disable) values (coalesce(NEW.disable, false)) returning id into new_id;
    insert into "{%= $schema %}"."{%= $tables->{refs} %}" (id1,id2) values (NEW.id, new_id);
  END IF;

  RETURN NEW;
END
$func$ LANGUAGE plpgsql;

/***
CREATE TRIGGER "профили/прием-увольнение/тригг"
BEFORE INSERT OR UPDATE ON "профили"
FOR EACH ROW EXECUTE PROCEDURE "тригг/профили/прием-увольнение"();
**/
