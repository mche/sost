select d.*,
  timestamp_to_json(d."дата1"::timestamp) as "$дата1/json",
  timestamp_to_json(d."дата2"::timestamp) as "$дата2/json",
  timestamp_to_json(d."дата расторжения"::timestamp) as "$дата расторжения/json",
  --~ row_to_json(k) as "$контрагент/json", 
  --~ k.id as "контрагент/id",
  pr.id as "проект/id", ---to_json(pr) as "$проект/json",
  dp.*,
  dp."@кабинеты/id" as "@помещения/id"
from 
  "аренда/договоры" d
  --~ join refs r on d.id=r.id2
  --~ join "контрагенты" k on k.id=r.id1
  
  left join (---арендодатель
    select pr.*, r.id2
    from "roles" pr
      join refs r on pr.id=r.id1
  ) pr on pr.id2=d.id
  
  left join (
    select dp."договор/id",
      jsonb_agg(dp order by dp.id) as "@помещения/json",
      array_agg(dp."помещение/id" order by dp.id) as "@кабинеты/id",
      array_agg(dp.id  order by dp.id) as "@договоры/помещения/id",
      array_agg(dp."объект/id" order by dp.id) as "@объекты/id",
      sum(dp."площадь помещения") as "площадь помещений",
      sum(dp."оплата за помещение") as "оплата"
    from ---"аренда/договоры" d 
      ---join refs r on d.id=r.id1
      --join (
        ( select p.id as "помещение/id", row_to_json(p) as "$помещение/json",
  o.id as "аренда/объект/id", row_to_json(o) as "$аренда/объект/json",
  ob.id as "объект/id", row_to_json(ob) as "$объект/json",
  p."площадь" as "площадь помещения",
  coalesce(r."сумма", r."ставка"*p."площадь") as "оплата за помещение",
  r.*,
  d.id as "договор/id"
from 
  "аренда/договоры" d 
  join refs _r on d.id=_r.id1
  join "аренда/договоры-помещения" r on r.id=_r.id2
  join refs r1 on r.id=r1.id2
  join "аренда/помещения" p on p.id=r1.id1
  join refs r2 on p.id=r2.id2
  join "аренда/объекты" o on o.id=r2.id1
  join refs ro on o.id=ro.id2
  join "roles" ob on ob.id=ro.id1



 ) dp
      --) dp on dp."договор/id"=d.id
    group by "договор/id"--d.id
  ) dp on d.id=dp."договор/id"

where d.id=917512
order by d."дата1" desc, d.id desc
;
