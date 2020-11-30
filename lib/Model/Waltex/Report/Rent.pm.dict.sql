@@ контрагенты
select array_agg(distinct k.id) as id
from 
  "аренда/договоры" d
  join refs r on d.id=r.id2
  join "контрагенты" k on k.id=r.id1
  

@@ движение арендатора
select {%= $select || '*' %} from (
select *,
  -------------------------------------------------
  timestamp_to_json("дата") as "$дата",
  case when "sign"<0 then null::money else "сумма" end as "приход",
  case when "sign">0 then null::money else -1::numeric*"сумма" end as "расход"
from 
  "движение ДС/все платежи"

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
      /*-1::numeric*/"сумма"  as "расход"
    from "движение ДС/аренда/счета" ---только аренда помещений и предоплата

union all
    select *,
    ----------------------------------------------------------------
      timestamp_to_json("дата") as "$дата",
      null::money as "приход",
      /*-1::numeric*/"сумма"  as "расход"
    from "аренда/счета доп платежей" --- по аренде доп платежи арендаторов

) a
{%= $where || '' %}
{%= $order_by || '' %}