update "разное"
  set 
    val='{"117873": " 100 days ", "132387": " 100 days ", "132389": " 100 days ", "211310": " 100 days ", "249240": " 100 days ", "455343": " 100 days ", "675138": " 100 days ", "827181": " 100 days ", "872426": " 100 days "}'::jsonb,
    uid=0,
    ts=default 
where key='месяц табеля закрыт/interval' and (ts+'12 hour'::interval) < now()---12 hour
;

/*

   id   |          date
--------+------------------
 117873 | 2018-01-18
 132387 | 2018-02-19
(2 rows)
*/