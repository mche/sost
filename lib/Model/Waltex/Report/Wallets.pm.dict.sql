@@ сальдо по кошелькам
--- на дату, один проект 
select id, title,
  sum("сумма1") as "сальдо1", sum("сумма2") as "сальдо2", sum("движение") as "движение"
from (
select m.id as _id, /*! иначе строки схлоп*/w.id, w.title,
  case when m."дата" < ?::date then "сумма" else 0::money end as "сумма1",
  "сумма" as "сумма2",
   case when "дата" >= ?::date then "сумма" else 0::money end as "движение"
from "движение денег" m
  
  join refs rw on m.id=rw.id2
  join  "кошельки" w on w.id=rw.id1
  join refs rp on w.id=rp.id2
  
where m."дата" <= ?::date ---+ interval '1 days')
  ---and w.id=any(?) ---   нужные кошельки
  and rp.id1=?
  
  union --- внутр перемещения
  
  select  m.id, w.id, w.title,
  case when m."дата" < ?::date then -1*"сумма" else 0::money end as "сумма1",
  -1*"сумма" as "сумма2",
   case when "дата" >= ?::date then -1*"сумма" else 0::money end as "движение"
  from "движение денег" m
  
    join refs rw on m.id=rw.id1
    join  "кошельки" w on w.id=rw.id2
    join refs rp on w.id=rp.id2
  
  where m."дата" <= ?::date ---+ interval '1 days')
    ---and w.id=any(?) ---   нужные кошельки
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
