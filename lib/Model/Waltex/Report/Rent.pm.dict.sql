@@ контрагенты
select array_agg(distinct k.id) as id
from 
  "аренда/договоры" d
  join refs r on d.id=r.id2
  join "контрагенты" k on k.id=r.id1
  

@@ движение арендатора
select {%= $select || '*' %} from (
select *,
  timestamp_to_json("дата") as "$дата",
  case when "sign"<0 then null::money else "сумма" end as "приход",
  case when "sign">0 then null::money else -1::numeric*"сумма" end as "расход"
from 
  "движение ДС/все платежи"

) a
{%= $where || '' %}
{%= $order_by || '' %}