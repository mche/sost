select pid as "pid выполняемых сейчас запросов", query_start, state_change, state_change-query_start, query from pg_stat_activity where application_name<>'psql' and state='active';
select count(*) as "соединений" from pg_stat_activity where application_name<>'psql' ;
