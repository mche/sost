package Model::TimeWork;
use Mojo::Base 'Model::Base';
#~ use Mojo::Util qw(dumper);

#~ has sth_cached => 1;
my $main_table = 'табель';
has [qw(app)];


sub new {
  state $self = shift->SUPER::new(@_);
  $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  $self->dbh->do($self->sth('таблицы'));
  #~ $self->dbh->do($self->sth('функции'));
  return $self;
}

sub объекты {
  my ($self, $uid) = @_; # ид профиля
  
  my $data = $self->dbh->selectall_arrayref($self->sth('доступные объекты'), {Slice=>{},}, ($uid, 'Ведение табеля рабочего времени'));
  
  #~ map {
    #~ $_->{"сотрудники"} = $self->сотрудники_объекта($_->{id});
    #~ map {
      #~ $_->{"должности"}=$self->должности_сотрудника($_->{id});
    #~ } @{$_->{"сотрудники"}};
    
  #~ } @$data;
  
  return $data;
  
}

sub данные {
  my ($self, $oid, $month) = @_; # ид объекта
  my $data = {};
  $data->{"сотрудники"} = $self->сотрудники_объекта($oid);
  map {
    $_->{"должности"}=$self->должности_сотрудника($_->{id});
  } @{$data->{"сотрудники"}};
   
  $data->{"значения"} = {};
  
  return $data;
  
}

sub сотрудники_объекта {
  my ($self, $oid) = @_; # ид объекта
  
  $self->dbh->selectall_arrayref($self->sth('сотрудники объекта'), {Slice=>{},}, ($oid, 'Сотрудники'));
  
}

sub должности_сотрудника {
  my ($self, $pid) = @_; # ид профиля
  
  $self->dbh->selectall_arrayref($self->sth('должности сотрудника'), {Slice=>{},}, ($pid, 'Должности'));
}


1;


__DATA__
@@ таблицы
create table IF NOT EXISTS "{%= $schema %}"."{%= $tables->{main} %}" (
  id integer  NOT NULL DEFAULT nextval('{%= $sequence %}'::regclass) primary key,
  ts  timestamp without time zone NOT NULL DEFAULT now(),
  uid int, --- автор записи
  ---"объект" int not null, -- таблица roles
  "дата" date not null, --
  ----"сотрудник" int not null, -- таблица  профили
  "значение" text,
  "коммент" text
);

@@ доступные объекты
select g2.*
from refs r1
  join roles g1 on g1.id=r1.id1
  join refs r2 on g1.id = r2.id2
  join roles g2 on g2.id=r2.id1 -- объекты
  join refs r3 on g2.id = r3.id2
  join roles g3 on g3.id=r3.id1 -- 

where r1.id2=? -- профиль
  and g1."name"=? -- жесткое название группы внутри каждого объекта
  and g3."name"='Объекты и подразделения'
;

@@ сотрудники объекта
select p.*
from refs r1
  join roles g1 on g1.id=r1.id2 -- вниз 1 ур
  join refs r3 on g1.id = r3.id1 -- к профилям
  join "профили" p on p.id=r3.id2

where r1.id1=? -- объект
  and g1.name=? -- жесткое название группы внутри каждого объекта
order by array_to_string(p.names, ' ')
;

@@ должности сотрудника
select g1.*
from refs r1
  join roles g1 on g1.id=r1.id1 -- это
  join refs r2 on g1.id=r2.id2
  join roles g2 on g2.id=r2.id1 --- топ Должности
  left join (
    select r.id2 as g_id
    from refs r
    join roles g on g.id=r.id1 -- еще родитель
  ) n on g2.id=n.g_id
  
  
where r1.id2=? --- профиль
  and g2.name=? --- жесткое название группы
  and n.g_id is null --- нет родителя

order by g1.name
;