@@ 1
select
  
  array_agg(t.id order by {%= $order_by || 't.id' %}) as "позиции тмц/id",
  jsonb_agg(t order by {%= $order_by || 't.id' %}) as "@позиции тмц/json",
  array_agg("объект/id" order by {%= $order_by || 't.id' %}) as "позиции тмц/объекты/id"  --- для фильтрации по объекту

from "транспорт/заявки" m
  
  left join lateral (-- все грузоотправители иды (перевести связи в ид контрагента)
    select
    array_agg(r.id1 order by un.idx) as "@грузоотправители/id",
    array_agg(row_to_json(k) order by un.idx) as "@грузоотправители/json"
    from unnest(tz."грузоотправители") WITH ORDINALITY as un(id, idx)
      join refs r on un.id=r.id
      join "контрагенты" k on k.id=r.id1
    ---where r.id2=tz.id
    ---group by r.id2
  ) k_go on true---k_go.id2=tz.id
  
  join refs rt on m.id=rt.id2
  join "тмц" t on t.id=rt.id1
  left join (---номенклатура и объект если по заявке
    select
      z.*,
      ---timestamp_to_json(z."дата1"::timestamp) as "$дата1/json",
      ---row_to_json(p) as "$заказчик/json",
      o.id as "объект/id", /***o.name as "объект",***/ ---row_to_json(o) as "$объект/json",
      n.id as "номенклатура/id", "номенклатура/родители узла/title"(n.id, true) as "номенклатура",
      t.id as "тмц/id"
    from
      "тмц" t
      join refs r on t.id=r.id2
      join "тмц/заявки" z on z.id=r.id1 --- связь с тмц-строкой
      --join "профили" p on z.uid=p.id
      
      left join (
        select n.id, rn.id2
        from refs rn ---on z.id=rn.id2
        join "номенклатура" n on rn.id1=n.id
      ) n on z.id=n.id2
      
      join refs ro on z.id=ro.id2
      join "объекты" o on ro.id1=o.id
  ) z on t.id=z."тмц/id"
  
  left join (---номенклатура если без заявки
    select n.id, 
    "номенклатура/родители узла/title"(n.id, true) as "номенклатура",
    t.id as "тмц/id"
    from
      "тмц" t
      join refs r on t.id=r.id2
      join "номенклатура" n on n.id=r.id1
  ) n on t.id=n."тмц/id"      /***coalesce(t."простая поставка", false)=false and***/

  left join (---объект если без заявки
  select o.id,
    ---row_to_json(o) as "$объект/json",
    t.id as "тмц/id"
  from 
    "тмц" t 
    join refs r on t.id=r.id2
    join "объекты" o on r.id1=o.id
  ) ot on t.id=ot."тмц/id" /***coalesce(t."простая поставка", false)=false and***/