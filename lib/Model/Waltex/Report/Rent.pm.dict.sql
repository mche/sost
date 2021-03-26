@@ контрагенты
select array_agg(distinct k.id) as id
from 
  "аренда/договоры" d
  join refs r on d.id=r.id2
  join "контрагенты" k on k.id=r.id1
  
@@ движение
select m.*,
  -------------------------------------------------
  timestamp_to_json(m."дата") as "$дата",
  case when m."sign"<0 then null::money else m."сумма" end as "приход",
  case when m."sign">0 then null::money else -1::numeric*m."сумма" end as "расход",
  d.id as "договор/id"
from 
  "движение ДС/все платежи" m
  left join (--- договоры аренды
    select d.*, m.id as "движение денег/id"
    from "движение денег" m
      join refs r on m.id=r.id2
      join "аренда/договоры" d on d.id=r.id1
  ) d on d."движение денег/id"=m.id

union all
  select 
  "договор/id" as id, "договор/ts" as ts, "дата", -1::numeric*"сумма" as "сумма",
    -1::numeric as "sign", --- счет-расход
    "категории", "категория",
    "контрагент", "контрагент/id",
    "$объект/json", "объект/id", "объект",
    null::int as "кошелек2", --- left join
    null::text as "профиль", null::int as "профиль/id",
    "кошельки", --- пока не знаю
   "кошельки/id",  --- пока не знаю
    "примечание",
    ------------------------------------------------------------
    timestamp_to_json("дата") as "$дата",
    null::money as "приход",
    /*-1::numeric*/"сумма"  as "расход",
    "договор/id"
  from "движение ДС/аренда/счета" ---только аренда помещений и предоплата
  where not 929979=any("категории") --- БЕЗ обеспечит платежа!

union all
  select r.*,
  ----------------------------------------------------------------
    timestamp_to_json(r."дата") as "$дата",
    null::money as "приход",
    -1::numeric*r."сумма"  as "расход",
    d.id as "договор/id"
  from "аренда/счета доп платежей" r --- по аренде доп платежи арендаторов
    left join (
      select d.*, r.id as "аренда/расходы/id"
      from "аренда/расходы" r
        join refs rr on r.id=rr.id2
        join "аренда/договоры" d on d.id=rr.id1
    
    ) d on d."аренда/расходы/id"=r.id
--- без ;


@@ движение арендатора
select {%= $select || '*' %} from (
  {%= $dict->render('движение') %}
) a
{%= $where || '' %}
{%= $order_by || '' %}


@@ долги
select m.*
from (
  select "контрагент/id", sum("сумма") as "сумма", sum("сумма"::numeric) as "сумма/numeric"
  from ({%= $dict->render('движение арендатора', where=>$where) %}) m
  group by "контрагент/id"
) m
  --~ join "контрагенты" k on k.id=m."контрагент/id"
%#  {%= $where || '' %}
{%= $order_by || '' %}