@@ конверты данные
select {%= $select || '*' %} from (
select t.*, round(t."расчет ЗП"/50::numeric,0)*50 as "расчет ЗП округл", m."@движение денег/json",  g1."должности"
from "Расчеты ЗП" t

  left join (---движ денег по профилям и кат з/п
    select pid, array_agg(row_to_json(m) order by m."дата" desc) as "@движение денег/json"
    from (
      select p.id as pid, m.*, w.id as "кошелек/id",---, w.title as "кошелек" , pr.id as "проект/id", pr.name as "проект"
        date_trunc('month', m."дата")=date_trunc('month', ?::date)+interval '1 month' as "запись зп через месяц"
      from "движение денег" m
        join refs rc on m.id=rc.id2 ---категория
        join refs rp on m.id=rp.id1 --
        join "профили" p on p.id=rp.id2
        join refs rw on m.id = rw.id2
        join "кошельки"   w on w.id=rw.id1
        /*join refs rpr on w.id=rpr.id2
        join "проекты" pr on pr.id=rpr.id1*/
        
      where rc.id1 = 569 and 
      (date_trunc('month', m."дата")=date_trunc('month', ?::date)
        or date_trunc('month', m."дата")=date_trunc('month', ?::date)+interval '1 month'
        or date_trunc('month', m."дата")=date_trunc('month', ?::date)+interval '2 month'
      )
    ) m
    group by pid
  ) m on m.pid=t.pid

  left join (--- должности сотрудника
    select ---g1.*, 
      r1.id2 as pid,
      array_agg(g1.name) as "должности"
    from refs r1 
      join roles g1 on g1.id=r1.id1 -- это надо
      join refs r2 on g1.id=r2.id2
      join roles g2 on g2.id=r2.id1 and g2.name='Должности' --- жесткое название топовой группы
      left join (
        select r.id2 as g_id
        from refs r
        join roles g on g.id=r.id1 -- еще родитель
      ) n on g2.id=n.g_id
    where n.g_id is null --- нет родителя топовой группы
    group by r1.id2
  ) g1 on t.pid=g1.pid
{%= $where || '' %}
) t