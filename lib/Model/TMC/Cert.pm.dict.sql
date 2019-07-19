@@ список
select
  t."объект/id", t."объект",
  array_agg(t.id order by t.id) as "позиции тмц/id",
  jsonb_agg(t order by t.id) as "@позиции тмц/json"

from

(select
  m.*,
  t.*,
  o.id as "объект/id",
  o.name as "объект",
  n.id as "номенклатура/id",
  /*"номенклатура/родители узла/title"(n.id, true)*/row_to_json(np) as "$номенклатура/json"
from 
  (
    select tz.id as "транспорт/заявки/id",
      tz."дата1", 
      k_go.*
    from "транспорт/заявки" tz
      left join lateral (-- все грузоотправители иды (перевести связи в ид контрагента)
        select
        array_agg(r.id1 order by un.idx) as "@грузоотправители/id",
        jsonb_agg(k order by un.idx) as "@грузоотправители/json"
        from unnest(tz."грузоотправители") WITH ORDINALITY as un(id, idx)
          join refs r on un.id=r.id
          join "контрагенты" k on k.id=r.id1
        ---where r.id2=tz.id
        ---group by r.id2
      ) k_go on true---k_go.id2=tz.id
    where tz."с объекта" is null
  ) m
  
  join refs rt on m."транспорт/заявки/id"=rt.id2
  join "тмц" t on t.id=rt.id1
  
  join refs ro on t.id=ro.id2
  join "roles" o on o.id=ro.id1
  
  join refs rn on t.id=rn.id2
  --join "номенклатура" n on n.id=rn.id1
  join "номенклатура/родители"(null) np on np.id=rn.id1 --- получше!
  
) t

group by t."объект/id", t."объект"
order by t."объект"
