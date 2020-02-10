WITH param as (
  select *, to_char(d."дата", 'YYYY') as "год", date_trunc('month', d."дата") as "month"
  from (VALUES (1, 'январь'), (2, 'февраль'), (3, 'март'), (4, 'апрель'), (5, 'май'), (6, 'июнь'), (7, 'июль'), (8, 'август'), (9, 'сентябрь'), (10, 'октябрь'), (11, 'ноябрь'), (12, 'декабрь'))
    m(num, "месяц")
  join (VALUES ('2020-01-10'::date)) d("дата") on m.num=date_part('month', d."дата")
)
/*** ЭТО НЕ ПОШЛО, функция не возвращала вставленные строки, вынес вызов функции отдельно перед этим статементом
num as (---нумерация счетов 
  select n.*, r.id1
  from 
    param,
    "refs" r
    join "номера счетов/аренда помещений"(param."дата", ?::int[]массив ид договоров для присвоения номеров/,?uid/) n on n.id=r.id2
    --- если не нужно присвоение номеров - передать 2 параметр - пустой массив идов договоров []
)*/
---конец with

---select jsonb_agg(s) as "json" from (
select
  
  coalesce(num2."номер", '000')/*(random()*1000)::int*/ as "номер акта",
  --timestamp_to_json(coalesce(num2.ts, now())) as "$дата акта",
  
  ---row_to_json(d) as "$договор", 
  d."номер договора",
  coalesce(d."дата договора", d."дата1") as "дата договора",
  ---row_to_json(k) as "$контрагент",
  k.title as "арендатор",
  --k.id as "контрагент/id",
  dp."сумма"
  /*** хитрая функция sql/пропись.sql ***/
  --firstCap(to_text(dp."сумма"::numeric, 'рубль', scale_mode => 'int')) as "сумма прописью",
  ---ARRAY(select (select to_json(a) from (select ('{"Арендная плата за нежилое помещение за '||param."месяц"||' '||param."год"||' г."}')::text[] as "номенклатура", -1::numeric*dp."сумма" as "сумма" ) a)) as "@позиции",
  ---dp."@позиции",
  --dp."всего позиций"
from
  param
  join (
    select d.*,
      upper(replace(d."номер", '№', '')) as "номер договора",
      timestamp_to_json(coalesce(d."дата договора", d."дата1")::timestamp) as "$дата договора",
      timestamp_to_json(d."дата1"::timestamp) as "$дата1",
      timestamp_to_json(d."дата2"::timestamp) as "$дата2"
    from "аренда/договоры" d
  ) d on param."month" between date_trunc('month', d."дата1") and (date_trunc('month', coalesce(d."дата расторжения", d."дата2") + interval '1 month') - interval '1 day') ---только действующие договоры
  join refs r on d.id=r.id2
  join "контрагенты" k on k.id=r.id1
  
  /*** Waltex/Report.pm.dict.sql ***/
  ---join "движение ДС/аренда/счета" dp on d.id=dp.id and param."month"=date_trunc('month', dp."дата") and dp."примечание"!~'предоплата'
  join lateral (
    select 
      sum(dp."сумма") as "сумма",
      array_agg(row_to_json(dp) order by dp."order_by") as "@позиции",
      count(dp) as "всего позиций"
    from (
      select
        -1::numeric*dp."сумма" as "сумма",
        not 929979=any(dp."категории") as "order_by",
        case when 929979=any(dp."категории")---ид категории
          then ('{"Обеспечительный платеж"}')::text[]
          else ('{"Арендная плата за нежилое помещение за '||param."месяц"||' '||param."год"||' г."}')::text[]
        end  as "номенклатура"
      from "движение ДС/аренда/счета" dp
       --- join "аренда/договоры" dd on dp.id=dd.id
      where  d.id=dp.id
        and param."month"=date_trunc('month', dp."дата")
        and not 929979::int = any(dp."категории")
        ---and not coalesce(dd."оплата наличкой", false)
    ) dp
  ) dp on true
  
  ---нумерация актов (может быть отключена)
  left join (
    select n.*, r.id1
    from 
      "refs" r
      join "акты/аренда/помещения" n on n.id=r.id2
  ) num2 on d.id=num2.id1 and num2."месяц"=param."month"
  
  ---left join num on d.id=num.id1
 WHERE ( not coalesce((coalesce(k."реквизиты",'{}'::jsonb)->'физ. лицо'), 'false')::boolean  )
order by d."дата1" desc, d.id desc  

--Statement name[Model::Rent]::[счета]" with ParamValues: 1='2020-1-10', 2='929979', 3='{"926762","924072","924036","923866","869610","923872","923821","923920","872490","868758","923846","726497","868739","924012","869534","926751","923853","923808","872546","872541","872536","872531","872495","872423","872402","872309","872301","872296","872291","872245","872229","872224","872215","872199","872178","869778","869771","869764","869622","869617","869601","869596","869591","869524","869513","869497","869448","869411","869404","869399","868777","868771","868753","868731","831198","831191","726521","726473","726457","725937","725888","725879","869519","923898","923908","917526","917511","922747"}'] at /home/guest/perl5/perlbrew/perls/perl-5.26.1/lib/site_perl/5.26.1/Mojo/Pg/Che.pm line 115.
