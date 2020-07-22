DO
$do$
DECLARE
   d record;
BEGIN
/********************************************/

/********************************************/
FOR d IN
  select m.id---,p.name, w2."проект2/name"
  from  "движение денег" m
 
  ---кошелек
  join refs rw on m.id=rw.id2
  join "кошельки" w on w.id=rw.id1
  
  ---  проект через кошелек
  join refs rp on w.id=rp.id2
  join "roles" p on p.id=rp.id1
  
  
  where
    p.id = 513555---74325--- 513555 not in (select unnest(array[74325, 270471, 513555]) as "id")
    
LOOP
  PERFORM  "удалить объект"('public', 'движение денег', 'refs', d.id, 1732);
  ---RAISE NOTICE ' id: %', d.id;
END LOOP;
--------------------------------------
FOR d IN
  select m.id---,p.name, w2."проект2/name"
  from  "движение денег" m
 
  ---все кошелек перемещения
  join refs rw on m.id=rw.id1
  join "кошельки" w on w.id=rw.id2
    
LOOP
  PERFORM  "удалить объект"('public', 'движение денег', 'refs', d.id, 1732);
  ---RAISE NOTICE ' id: %', d.id;
END LOOP;

END
$do$;