--- от топ концевых сессий по родителям
WITH RECURSIVE rc AS (
   SELECT s.id, /*s.ts,*/ s.id as parent_id, 0::int AS "step"---, s."задать вопросов"
   FROM "медкол"."сессии" s 
   left join (---нет дочерней сессии
    select p.id, r.id1
    from 
      "медкол"."связи" r ---on s.id=r.id1
      join "медкол"."сессии" p on p.id=r.id2
   ) p on s.id=p.id1
  where s.id =1056101 ---5828
    
   UNION
   
   --- к родительской начальной сессии
   SELECT rc.id, /*c.ts,*/   p.id, rc.step + 1---, c."задать вопросов"
   FROM rc 
      join "медкол"."связи" r on rc.parent_id=r.id2
      join "медкол"."сессии" p on p.id=r.id1
    ---where c."задать вопросов" is not null--- признак завершенной сессии для вычисления процента
) ---конец рекурсии

/*select *
from (
    select q.id, count(q.id) as "cnt",
      sum(p."ответ")::numeric/count(q.id)::numeric as "правильность ответов"
      ---max(q.ts) as "вопрос/ts/last"---, r.id1 --- ид сессии
    from 
      rc --- все сессии цепочки
      join "медкол"."связи" r on rc.parent_id=r.id1
      join "медкол"."процесс сдачи" p on p.id=r.id2
      join "медкол"."связи" r2 on p.id=r2.id1
      join "медкол"."тестовые вопросы" q on q.id=r2.id2
    where p."ответ" is not null
    group by q.id
) pq
order by pq."правильность ответов"desc, pq."cnt";
*/
--- связать "сессия" -> "процесс сдачи" -> "тестовые вопросы"
select  q.id, pq.*
from "медкол"."названия тестов" t
  join "медкол"."связи" r1 on t.id=r1.id1
  join "медкол"."сессии" s on s.id=r1.id2
  join "медкол"."связи" r2 on t.id=r2.id1
  join "медкол"."тестовые вопросы" q on q.id=r2.id2
  left join (-- которые были
    select q.id, count(q.id) as "cnt",
      sum(p."ответ")::numeric/count(q.id)::numeric as "правильность ответов",
      array_agg(rc.parent_id) as "@сессии/id"
      ---max(q.ts) as "вопрос/ts/last"---, r.id1 --- ид сессии
    from 
      rc --- все сессии цепочки
      join "медкол"."связи" r on rc.parent_id=r.id1
      join "медкол"."процесс сдачи" p on p.id=r.id2
      join "медкол"."связи" r2 on p.id=r2.id1
      join "медкол"."тестовые вопросы" q on q.id=r2.id2
    where rc.parent_id<>1056101 and p."ответ" is not null
    group by q.id
  ) pq on q.id=pq.id---s.id=pq.id1
where s.id=1056101
  ---and  q.id<>coalesce(pq.id, 0)  ----pq.id is null 
order by ---pq.id is not null /*не задавались в начало*/, 
pq."правильность ответов"desc, pq."cnt",/*pq."вопрос/ts/last",*/ random()
limit 1
;
