@@ сальдо по кошелькам
--- на дату, один проект 
select id, title,
  sum("сумма1") as "сальдо1", sum("сумма2") as "сальдо2", sum("движение") as "движение"
from (
select w.id, w.title,
  case when m."дата" < ?::date then "сумма" else 0::money end as "сумма1",
  "сумма" as "сумма2",
   case when "дата" = ?::date then "сумма" else 0::money end as "движение"
from "движение денег" m
  
  join refs rw on m.id=rw.id2
  join  "кошельки" w on w.id=rw.id1
  join refs rp on w.id=rp.id2
  
where "дата" <= ?::date ---+ interval '1 days')
  and rp.id1=?
) m
group by id, title
order by title
;

@@ внутренние перемещения
select {%= $select || '*' %} from (
select *
from "движение ДС/внутр перемещения" m
{%= $where || '' %}
{%= $order_by || '' %}
) m
;
