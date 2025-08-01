CREATE OR REPLACE FUNCTION "timestamp_to_json"(timestamp)
RETURNS json AS $$ 
select row_to_json(d) from (
  select 
  ---date_part('century', $1) as century,
  date_part('day', $1) as day,
  to_char($1, 'DD') as "DD",
  ---date_part('decade', $1) as decade,
  ---date_part('dow', $1) as dow,
  ---date_part('doy', $1) as doy,
  ---date_part('epoch', $1) as epoch,
  date_part('hour', $1) as hour,
  to_char($1, 'HH') as "HH",
  ---date_part('isodow', $1) as isodow,
  ---date_part('isoyear', $1) as isoyear,
  --date_part('microseconds', $1) as microseconds,
  ---date_part('millennium', $1) as millennium,
  ---date_part('milliseconds', $1) as milliseconds,
  date_part('minute', $1) as minute,
  to_char($1, 'MI') as "MI",
  date_part('month', $1) as month,
  to_char($1, 'MM') as "MM",
  date_part('quarter', $1) as quarter,
  date_part('second', $1) as second,
  to_char($1, 'SS') as "SS",
--- нужен тип timestamp with time zone
---  date_part('timezone', $1) as timezone,
---  date_part('timezone_hour', $1) as timezone_hour,
---  date_part('timezone_minute', $1) as timezone_minute,
  date_part('week', $1) as week,
  date_part('year', $1) as year,
  to_char($1, 'YY') as "YY",
  to_char($1, 'TMday') as "день недели", ---полное название дня недели в нижнем регистре (дополненное пробелами до 9 символов)
  to_char($1, 'TMdy') as "день нед",---сокращённое название дня недели в нижнем регистре (3 буквы в английском; в других языках длина может меняться)
  to_char($1, 'TMmon') as "мес",
  to_char($1, 'TMmonth') as "месяца",
  m.title as "месяц"
  from 
    (VALUES (1, 'январь'), (2, 'февраль'), (3, 'март'), (4, 'апрель'), (5, 'май'), (6, 'июнь'), (7, 'июль'), (8, 'август'), (9, 'сентябрь'), (10, 'октябрь'), (11, 'ноябрь'), (12, 'декабрь'))
    m(num, title)
  where m.num=date_part('month', $1)
) d;
$$ LANGUAGE SQL IMMUTABLE STRICT;


CREATE OR REPLACE FUNCTION "timestamp_to_json"(timestamp with time zone)
RETURNS json AS $$ 
select row_to_json(d) from (
  select 
  ---date_part('century', $1) as century,
  date_part('day', $1) as day,
  to_char($1, 'DD') as "DD",
  ---date_part('decade', $1) as decade,
  ---date_part('dow', $1) as dow,
  ---date_part('doy', $1) as doy,
  ---date_part('epoch', $1) as epoch,
  date_part('hour', $1) as hour,
  to_char($1, 'HH') as "HH",
  ---date_part('isodow', $1) as isodow,
  ---date_part('isoyear', $1) as isoyear,
  --date_part('microseconds', $1) as microseconds,
  ---date_part('millennium', $1) as millennium,
  ---date_part('milliseconds', $1) as milliseconds,
  date_part('minute', $1) as minute,
  to_char($1, 'MI') as "MI",
  date_part('month', $1) as month,
  to_char($1, 'MM') as "MM",
  date_part('quarter', $1) as quarter,
  date_part('second', $1) as second,
  to_char($1, 'SS') as "SS",
--- нужен тип timestamp with time zone
---  date_part('timezone', $1) as timezone,
---  date_part('timezone_hour', $1) as timezone_hour,
---  date_part('timezone_minute', $1) as timezone_minute,
  date_part('week', $1) as week,
  date_part('year', $1) as year,
  to_char($1, 'YY') as "YY",
  to_char($1, 'TMday') as "день недели", ---полное название дня недели в нижнем регистре (дополненное пробелами до 9 символов)
  to_char($1, 'TMdy') as "день нед",---сокращённое название дня недели в нижнем регистре (3 буквы в английском; в других языках длина может меняться)
  to_char($1, 'TMmon') as "мес",
  to_char($1, 'TMmonth') as "месяца",
  m.title as "месяц"
  from 
    (VALUES (1, 'январь'), (2, 'февраль'), (3, 'март'), (4, 'апрель'), (5, 'май'), (6, 'июнь'), (7, 'июль'), (8, 'август'), (9, 'сентябрь'), (10, 'октябрь'), (11, 'ноябрь'), (12, 'декабрь'))
    m(num, title)
  where m.num=date_part('month', $1)
) d;
$$ LANGUAGE SQL IMMUTABLE STRICT;

