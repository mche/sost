@@ внутренние перемещения
select {%= $select || '*' %} from (
select *
from "движение ДС/внутр перемещения" m
{%= $where || '' %}
{%= $order_by || '' %}
) m;
