/*выделение новой базы*/
DO
$do$
DECLARE
   d record;
   new_id integer;
BEGIN
/********************************************/
FOR d IN
  select id from "аренда/объекты"
LOOP
  insert into "аренда/объекты/литеры" (uid, title) values ( 1732, 'А' ) returning id into new_id;
  --~ RAISE NOTICE 'Транспорт: cat#%->tr#%', 60812, new_id;
  insert into refs (id1, id2) values (d.id, new_id);
  ---RAISE NOTICE ' id: %', d.id;
END LOOP;

FOR d IN
  select o.id as "oid", l.id as id1, p.id as id2
  from "аренда/объекты" o
  join "refs" r on o.id=r.id1
  join  "аренда/помещения" p on p.id=r.id2
  
  join refs rl on o.id=rl.id1
  join "аренда/объекты/литеры" l on l.id=rl.id2
LOOP
  insert into refs (id1, id2) values (d.id1, d.id2);
  delete from refs where id1=d.oid and id2=d.id2;

END LOOP;

---проверка
--~ select o.*, p.*
--~ from "аренда/объекты" o
  --~ join "refs" r on o.id=r.id1
  --~ join (
    --~ select p.*, to_jsonb(lit) as "литер/json", lit.id as "литер/id"
    --~ from "аренда/помещения" p
      --~ join refs r on p.id=r.id2
      --~ join "аренда/объекты/литеры" lit on lit.id=r.id1---(VALUES ('A', 1)) as lit("title",  "id")
  --~ ) p on p."литер/id"=r.id2;

END
$do$;