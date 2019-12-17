update "разное"
  set 
    val='{"117873": " 47 days 09:08:07.832233 ", "132387": " 47 days 09:08:22.70174 ", "132389": " 47 days 09:07:48.25594 ", "211310": " 47 days 09:08:00.452077 ", "249240": " 47 days 09:08:14.078927 ", "455343": " 47 days 09:07:43.994996 ", "675138": " 47 days 09:08:18.773806 ", "827181": " 47 days 09:07:56.503745 ", "872426": " 47 days 09:07:52.439484 "}'::jsonb,
    uid=0,
    ts=default 
where key='месяц табеля закрыт/interval' and (ts+'12 hour'::interval) < now()
;

/*

   id   |          date
--------+------------------
 117873 | 2018-01-18
 132387 | 2018-02-19
(2 rows)
*/