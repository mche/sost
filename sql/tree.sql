create temp table tree(
    id serial primary key,
    name char,
    parent_id integer references tree (id)
);

insert into tree (name, parent_id) values ('A', null);
insert into tree (name, parent_id) values ('B', 1);
insert into tree (name, parent_id) values ('C', 1);
insert into tree (name, parent_id) values ('D', 3);
insert into tree (name, parent_id) values ('E', 3);
insert into tree (name, parent_id) values ('F', 3);
insert into tree (name, parent_id) values ('G', 5);

--https://tapoueh.org/blog/2018/01/exporting-a-hierarchy-in-json-with-recursive-queries/

WITH RECURSIVE tree_parents as (
  select id, name, '{}'::int[] as parents_id, null::int as parent_id, 0 as level
    from tree
   where parent_id is NULL

   union all

  select c.id, c.name, parents_id || c.parent_id, c.parent_id, level+1
    from      tree_parents p
         join tree c  on c.parent_id = p.id
   where not c.id = any(parents_id) -- The cycle detection and prevention 
),

tree_children as (
/*Now start from the leaf nodes and recurse to the top-level
Leaf nodes are not parents (level > 0) and have no other row
pointing to them as their parents, directly or indirectly
(not id = any(parents_id))*/
   select c.parent_id,
          json_agg(/*jsonb_build_object('Name', c.name)*/ c)::jsonb as childs
     from tree_parents p
          join tree c using(id)
    where level > 0 and not c.id = any(parents_id)
   group by c.parent_id

  union all

/*build our JSON document, one piece at a time
as we're traversing our graph from the leaf nodes, 
the bottom-up traversal makes it possible to accumulate
sub-classes as JSON document parts that we glue together*/
   select c.parent_id,
      /*jsonb_build_object('node', c)*/ to_jsonb(c)|| jsonb_build_object('childs', childs)
     from tree_children tree
          join tree c on c.id = tree.parent_id
    ---where not c.id = any(parents_id)
)
/*,tree_parents2 as (*/

   select p.id, p.parent_id, 0 as level,
          json_agg(c)::jsonb as childs,
          array_agg(c.id) as childs_id
      --~ null::jsonb[] as childs,
      --~ null::int[] as childs_id
     from tree_parents p
        left  join tree c on p.id=c.parent_id---using(id)
    where c.id is null ---level > 0 and not c.id = any(parents_id)
   group by p.id, p.parent_id
   
   union all 
   
   select p.id, p.parent_id, 1 as level,
    ---to_jsonb(c)|| jsonb_build_object('childs', childs)
    json_agg(c)::jsonb as childs,
    array_agg(c.id) as childs_id
   from tree_parents c
        join tree_parents p on p.id=c.parent_id---using(id)
    group by p.id, p.parent_id


--select *  from tree_parents2;


/*Finally, the traversal being done, we can aggregate
the top-level classes all into the same JSON document,
an array.*/
--~ select ---jsonb_pretty(
--~ jsonb_agg(childs)--)
  --~ from tree_children
--~ where parent_id IS NULL
;