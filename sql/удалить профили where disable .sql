DO
$do$
DECLARE
   d record;
BEGIN
/********************************************/

/********************************************/
FOR d IN
  select id
  from  "профили"
  where
    "disable"=true
    
LOOP
  PERFORM  "удалить объект"('public', 'профили', 'refs', d.id, 1732);
  ---RAISE NOTICE ' id: %', d.id;
END LOOP;

----VACUUM  FULL  VERBOSE  ANALYZE;

END
$do$;