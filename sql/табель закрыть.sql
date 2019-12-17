update "разное"
  set 
    val='{"117873": " 50 days ", "132387": " 50 days ", "132389": " 50 days ", "211310": " 50 days ", "249240": " 50 days ", "455343": " 50 days ", "675138": " 50 days ", "827181": " 50 days ", "872426": " 50 days "}'::jsonb,
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