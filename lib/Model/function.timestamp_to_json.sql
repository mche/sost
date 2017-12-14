CREATE OR REPLACE FUNCTION "timestamp_to_json"(timestamp) RETURNS json AS $$ 
select row_to_json(d) from (
  select 
  date_part('century', $1) as century,
  date_part('day', $1) as day,
  date_part('decade', $1) as decade,
  date_part('dow', $1) as dow,
  date_part('doy', $1) as doy,
  date_part('epoch', $1) as epoch,
  date_part('hour', $1) as hour,
  date_part('isodow', $1) as isodow,
  date_part('isoyear', $1) as isoyear,
  date_part('microseconds', $1) as microseconds,
  date_part('millennium', $1) as millennium,
  date_part('milliseconds', $1) as milliseconds,
  date_part('minute', $1) as minute,
  date_part('month', $1) as month,
  date_part('quarter', $1) as quarter,
  date_part('second', $1) as second,
--- нужен тип timestamp with time zone
---  date_part('timezone', $1) as timezone,
---  date_part('timezone_hour', $1) as timezone_hour,
---  date_part('timezone_minute', $1) as timezone_minute,
  date_part('week', $1) as week,
  date_part('year', $1) as year,
  to_char($1, 'TMday') as "день недели", ---полное название дня недели в нижнем регистре (дополненное пробелами до 9 символов)
  to_char($1, 'TMdy') as "день нед",---сокращённое название дня недели в нижнем регистре (3 буквы в английском; в других языках длина может меняться)
  to_char($1, 'TMmon') as "мес",
  to_char($1, 'TMmonth') as "месяц"
) d;
$$ LANGUAGE SQL IMMUTABLE STRICT;


