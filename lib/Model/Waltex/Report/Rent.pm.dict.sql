@@ контрагенты
select array_agg(distinct k.id) as id
from 
  "аренда/договоры" d
  join refs r on d.id=r.id2
  join "контрагенты" k on k.id=r.id1
