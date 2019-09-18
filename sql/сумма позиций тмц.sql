/* count |    sum     |       sum        
-------+------------+------------------
  3289 | 559506.198 | 252 531 205,96 ₽
(1 row)

Time: 1076.047 ms (00:01.076)
*/
select  count(t.id), count(t."номенклатура/id"),
  sum(t."количество"),
  sum(t."сумма")

from (
  select t.id,
  coalesce(n.id, z."номенклатура/id") as "номенклатура/id",
  t."количество",
    t."количество"*t."цена" as "сумма"
    
    ----
  from
    "транспорт/заявки" tz
    join refs rt on tz.id=rt.id2
    join "тмц" t on t.id=rt.id1
    ---join refs rz on t.id=rz.id2
     
    left join (---номенклатура и объект если по заявке
      select
        z.*,
        timestamp_to_json(z."дата1"::timestamp) as "$дата1/json",
        row_to_json(p) as "$профиль заказчика/json",
        o.id as "объект/id", /***o.name as "объект",***/ row_to_json(o) as "$объект/json",
        n.id as "номенклатура/id", /*"номенклатура/родители узла/title"(n.id, true)*/n.parents_title || n.title as "номенклатура",
        t.id as "тмц/id"
      from
        "тмц" t
        join refs r on t.id=r.id2
        join "тмц/заявки" z on z.id=r.id1 --- связь с тмц-строкой
        join "профили" p on z.uid=p.id
        
        left join (
          select n.*, rn.id2
          from refs rn ---on z.id=rn.id2
          join "номенклатура/родители"(null) n on rn.id1=n.id
        ) n on z.id=n.id2
        ---left join "номенклатура/родители"(null) np on np.id=n.id --- получше!
        
        join refs ro on z.id=ro.id2
        join "объекты" o on ro.id1=o.id
    ) z on t.id=z."тмц/id"
   
   left join (---номенклатура если без заявки
      select n.*, 
      ---"номенклатура/родители узла/title"(n.id, true) as "номенклатура",
      t.id as "тмц/id"
      from
        "тмц" t
        join refs r on t.id=r.id2
        join "номенклатура/родители"(null) n on n.id=r.id1
   ) n on t.id=n."тмц/id"      /***coalesce(t."простая поставка", false)=false and***/
   ---left join "номенклатура/родители"(null) np on np.id=n.id --- получше!
   
   left join (---объект если без заявки
    select o.*,
      row_to_json(o) as "$объект/json",
      t.id as "тмц/id"
    from 
      "тмц" t 
      join refs r on t.id=r.id2
      join "объекты" o on r.id1=o.id
   ) ot on t.id=ot."тмц/id" /***coalesce(t."простая поставка", false)=false and***/
   
   /*left join (--- если простая поставка: поставщик
      select k.*, t.id as "тмц/id"
      from 
        "тмц" t 
        join refs r on t.id=r.id2
        join "контрагенты" k on k.id=r.id1
    ) k on t.id=k."тмц/id"*/
    
    left join refs ro1 on tz."с объекта"=ro1.id
    left join refs ro2 on tz."на объект"=ro2.id
    
    left join "профили" pp on t."принял"=pp.id
  
  ) t