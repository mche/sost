/*выделение новой базы*/
DO
$do$
DECLARE
   d record;
BEGIN
/********************************************/
FOR d IN
  select id from "табель"
LOOP
  PERFORM  "удалить объект"('public', 'табель', 'refs', d.id, 1732);
  ---RAISE NOTICE ' id: %', d.id;
END LOOP;

/********************************************/
FOR d IN
        select id from "транспорт/заявки"
LOOP
  PERFORM  "удалить объект"('public', 'транспорт/заявки', 'refs', d.id, 1732);
  ---RAISE NOTICE ' id: %', d.id;
END LOOP;

/********************************************/
FOR d IN
        select id from "тмц"
LOOP
  PERFORM  "удалить объект"('public', 'тмц', 'refs', d.id, 1732);
  ---RAISE NOTICE ' id: %', d.id;
END LOOP;
/********************************************/
FOR d IN
        select id from "тмц/заявки"
LOOP
  PERFORM  "удалить объект"('public', 'тмц/заявки', 'refs', d.id, 1732);
  ---RAISE NOTICE ' id: %', d.id;
END LOOP;

/********************************************/
FOR d IN
        select id from "номенклатура"
LOOP
  PERFORM  "удалить объект"('public', 'номенклатура', 'refs', d.id, 1732);
  ---RAISE NOTICE ' id: %', d.id;
END LOOP;

insert into "номенклатура" (id, title) values (154997, 'инструмент и оборудование');
insert into "номенклатура" (id, title) values (1176773, 'расходники');
insert into "номенклатура" (id, title) values (154964, 'материалы');
insert into "номенклатура" (id, title) values (501876, 'услуги и работы');

/********************************************/
FOR d IN
  select m.id, p.name, w2."проект2/name"
  from  "движение денег" m
 
  ---кошелек
  join refs rw on m.id=rw.id2
  join "кошельки" w on w.id=rw.id1
  
  ---  проект через кошелек
  join refs rp on w.id=rp.id2
  join "roles" p on p.id=rp.id1
  
  left join (
      -- обратная связь с внутренним перемещением
    select distinct w.id as "кошелек2/id", p.id as "проект2/id", p."name" as "проект2/name", m.id as "движение денег/id"
    from
      "проекты" p
      join refs r on p.id=r.id1
      join "кошельки" w on w.id=r.id2
      join refs rm on w.id=rm.id2 -- к деньгам
      join "движение денег" m on m.id=rm.id1
  ) w2 on w2."движение денег/id"=m.id
  
  where
    p.id not in (select unnest(array[74325, 270471, 513555]) as "id")
    and (w2."проект2/id" is null or w2."проект2/id" not in (select unnest(array[74325, 270471, 513555]) as "id"))
    
LOOP
  PERFORM  "удалить объект"('public', 'движение денег', 'refs', d.id, 1732);
  ---RAISE NOTICE ' id: %', d.id;
END LOOP;

----VACUUM  FULL  VERBOSE  ANALYZE;

END
$do$;