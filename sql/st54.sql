insert into refs (id1, id2)
select 120425, m.id
from  "движение денег" m

  --- категории
  join refs rc on m.id=rc.id2
  ---join "категории" c on c.id=rc.id1
  
  ---кошелек
  join refs rw on m.id=rw.id2
  join "кошельки" w on w.id=rw.id1
  
  ---  проект через кошелек
  join refs rp on w.id=rp.id2
  ---join "roles" p on p.id=rp.id1
  
  left join (
    select o.id, r.id2
    from refs r
    join "roles" o on o.id=r.id1
  ) o on m.id=o.id2

where rc.id1=121952--аренда
  and rp.id1=270471-- проект
  and o.id is null

--order by "дата" desc