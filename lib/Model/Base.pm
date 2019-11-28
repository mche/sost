package Model::Base;
use Mojo::Base 'DBIx::Mojo::Model';
use SQL::Abstract;
use experimental 'smartmatch';

has [qw(app)], undef, weak=>1;
has [qw(sth_cached uid)];# тотально для всех запросов
has SqlAb => sub { SQL::Abstract->new };

sub init {
  my $self = shift;
}

sub вставить_или_обновить {
=pod
Для одной записи таблицы
$schema, $table,
$key_cols - arrayref имен ключевых колонок
$data - hashref (или список) "колонкаА" => <значение>
$expr - hashref опционально выражения для колонок: "колонкаА"=>"to_timestamp(?::numeric)"
  если делаешь выражение без биндинга (типа 'now()') тогда обязательно удалить эту колонку из данных
  если выражение с биндингом (типа 'text2numeric(?)')  тогда конечно нужны данные этой колонки

=cut

  my $self = shift;
  $self->_try_insert(@_) || $self->_update(@_);
}

sub обновить_или_вставить {
  my $self = shift;
  $self->_update(@_) || $self->_insert(@_);
  
}

sub вставить_или_получить {
=pod
входные параметры смотри sub вставить_или_обновить
=cut
  my $self = shift;
  $self->_try_insert(@_) || $self->_select(@_);

}

sub получить_или_вставить {
  my $self = shift;
  $self->_select(@_) || $self->_insert(@_);
  
}

sub вставить { shift->_insert(@_); }
sub _insert {
=pod

=cut
  my ($self, $schema, $table, $key_cols,) = splice @_,0, 4;
  
  my $cb = ref $_[-1] eq 'CODE' ? pop : undef;
  
  my $type = $self->_table_type_cols($schema, $table);
  my $data = ref $_[0] ? shift : {@_};
  my $expr =  ref $_[0] ? shift : {};
  
  #~ delete @$data{ grep ! defined $data->{$_}, keys %$data };
  my %cols = ();
  my @cols = sort grep $type->{$_} && (defined($data->{$_}) || defined($expr->{$_})), (@cols{ keys %$data, keys %$expr }++ || keys %cols);
  my @bind_cols = sort grep $type->{$_} && defined($data->{$_}), keys %$data;
  my @bind = @$data{@bind_cols}; #map $data->{$_}, @cols;
  push @bind, $cb
    if $cb;
  $self->dbh->selectrow_hashref($self->_prepare(sprintf(<<END_SQL, 
insert into "%s"."%s" (%s)
VALUES (%s)
returning *;
END_SQL
  (
    $schema, $table,
    join(',', map qq|"$_"|, @cols),
    join(',', map { ($expr->{$_} && '('.$expr->{$_}.')::'.$type->{$_}{array_type}.($type->{$_}{data_type} eq 'ARRAY' ? '[]' : '')) || qq|?| } @cols), # values
  ))), undef, @bind,);
}

sub _try_insert {
=pod
входные параметры смотри sub вставить_или_обновить
=cut
  my ($self, $schema, $table, $key_cols,) = splice @_,0, 4;
  my $data = ref $_[0] ? shift : {@_};
  my $expr =  ref $_[0] ? shift : {};
  return $self->_insert($schema, $table, $key_cols, $data, $expr) # простая вставка для пропусков ключевых колонок
    if $key_cols && @$key_cols && scalar(grep defined($data->{$_}),  @$key_cols) ne scalar(@$key_cols);
  
  #~ delete @$data{ grep ! defined $data->{$_}, keys %$data };
  my $type = $self->_table_type_cols($schema, $table);
  my %cols = ();
  my @cols = sort grep $type->{$_}, (@cols{ keys %$data, keys %$expr }++ || keys %cols);#  && (defined($data->{$_}) || defined($expr->{$_}))
  my @bind_cols = sort grep $type->{$_}, keys %$data;
  my @bind = @$data{@bind_cols}; #map $data->{$_}, @cols;

  $self->dbh->selectrow_hashref($self->_prepare(sprintf(<<END_SQL, 
insert into "%s"."%s" (%s)
( select v.* 
from (VALUES (%s)) v (%s)
  left join "%s"."%s" t on %s
where t."%s" is null
)
returning *;
END_SQL
  (
    $schema, $table,
    join(', ', map qq|"$_"|, @cols),
    join(', ', map { ($expr->{$_} && '('.$expr->{$_}.')::'.$type->{$_}{array_type}.($type->{$_}{data_type} eq 'ARRAY' ? '[]' : '')) || sprintf(qq|?::%s|,  $type->{$_}{array_type}.($type->{$_}{data_type} eq 'ARRAY' ? '[]' : '')) } @cols), # values
    join(', ', map qq|"$_"|, @cols), # values colnames
    $schema, $table,
    join(' and ', map qq|v."$_"=t."$_"|, @$key_cols), # on left join
    $key_cols->[0], # where one key column достаточно одной ключевой колонки
  ))), undef, @bind);
}

sub insert_default_values { shift->_insert_default_values(@_); }
sub _insert_default_values {
  my ($self, $schema, $table,) = splice @_,0, 3;
  #~ warn ("_insert_default_values [$schema][$table] [@_]");
  $self->dbh->selectrow_hashref($self->_prepare(sprintf(<<END_SQL,
insert into "%s"."%s"
DEFAULT VALUES
returning *;
END_SQL
  ( $schema, $table,))), undef,);#, 'cached'
}

sub _table_type_cols {# типы колонок таблицы
  my ($self, $schema, $table) = @_;
  $schema ||= $self->{template_vars}{schema}
    or die "Не указана схема БД";
  $table ||= $self->{template_vars}{tables}{main}
    or die "Не указана таблица";
  $self->dbh->selectall_hashref($self->_prepare(<<END_SQL, 'cached'), 'column_name', undef, ($schema, $table))
select column_name, data_type, regexp_replace(udt_name, '^_', '') as array_type
from information_schema.columns
where
  table_catalog=current_database()
  and table_schema=?
  and table_name=?
;
END_SQL
    or die "Не найдены колонки таблицы [$schema.$table]";
  
}

sub обновить { shift->_update(@_); }
sub _update {
=pod
входные параметры смотри sub вставить_или_обновить
=cut
  my ($self, $schema, $table, $key_cols,) = splice @_,0, 4;
  my $data = ref $_[0] ? shift : {@_};
  my $expr =  ref $_[0] ? shift : {};
  
  my $type = $self->_table_type_cols($schema, $table);
  my %cols = ();
  my @cols = sort grep $type->{$_}, (@cols{ keys %$data, keys %$expr }++ || keys %cols);#  grep !($_ ~~ $key_cols),
  my @set_cols = sort grep $type->{$_}, keys %$data;
  my ($where, @bind);
  if (ref $key_cols eq 'ARRAY') {
    $where = @$key_cols ? 'where '.join(' and ', map qq|"$_"=?|, @$key_cols) : '';
    @bind = (@$data{ @set_cols }, @$data{ @$key_cols });#grep !$expr->{$_} || $expr->{$_} !~ /\?/, 
  } elsif (ref $key_cols eq 'HASH') {
    ($where, @bind) = $self->SqlAb->where($key_cols);
    unshift @bind, @$data{ @set_cols };
  } else {
    die "Нет параметра key_cols";
  }
  
  my $sth = $self->_prepare(sprintf(<<END_SQL, 
update "%s"."%s" t
set %s
%s
returning *;
END_SQL
  (
    $schema, $table,
    join(', ', map sprintf(qq|"$_"=%s|, ($expr->{$_} && '('.$expr->{$_}.')::'.$type->{$_}{array_type}.($type->{$_}{data_type} eq 'ARRAY' ? '[]' : '')) || sprintf(qq|?::%s|, $type->{$_}{array_type}.($type->{$_}{data_type} eq 'ARRAY' ? '[]' : ''))), @cols), # set
    $where, # where
    
  )));
  
  #~ $self->app->log->debug($sth->{Statement}, $self->app->dumper($sth->{ParamValues}), "@bind");
  
  $self->dbh->selectrow_hashref($sth, undef, @bind);
}

sub _update_distinct {# обновить только обновляемые колонки, поэтому может вернуть пусто
=pod
входные параметры смотри sub вставить_или_обновить
=cut
  my ($self, $schema, $table, $key_cols,) = splice @_,0, 4;
  my $data = ref $_[0] ? shift : {@_};
  my $expr =  ref $_[0] ? shift : {};
  
  my $type = $self->_table_type_cols($schema, $table);
  my %cols = ();
  my @cols = sort grep $type->{$_}, (@cols{ keys %$data, keys %$expr }++ || keys %cols);
  my @upd_cols = grep {!($_ ~~ $key_cols)} @cols; # без ключевых колонок
  my @bind_cols = sort grep $type->{$_}, keys %$data;
  my @bind = @$data{@bind_cols};#
  
  $self->dbh->selectrow_hashref($self->_prepare(sprintf(<<END_SQL, 
update "%s"."%s" t
set 
  (%s) = -- список колонок без ключевых (  col1,   col2,   col3)
   (%s) -- (v.col1, v.col2, v.col3)
from (VALUES (%s)) v (%s) -- аналогично _try_insert
where
  %s --  t.id = v.id
  and (%s) IS DISTINCT FROM -- (t.col1, t.col2, t.col3)
     (%s) -- (v.col1, v.col2, v.col3)
returning *;
END_SQL
  (
    $schema, $table,
    #~ join(', ', map qq|"$_"=?|, @cols),
    join(', ', map qq|"$_"|, @upd_cols), # set
    join(', ', map qq|v."$_"|, @upd_cols), # set
    
    #~ join(',', map $expr->{$_} || sprintf(qq|?::%s|,  $type->{$_}{data_type} eq 'ARRAY' ? $type->{$_}{array_type}.'[]' : $type->{$_}{data_type}), @cols), # values
    join(', ', map { ($expr->{$_} && '('.$expr->{$_}.')::'.$type->{$_}{array_type}.($type->{$_}{data_type} eq 'ARRAY' ? '[]' : '')) || sprintf(qq|?::%s|,  $type->{$_}{array_type}.($type->{$_}{data_type} eq 'ARRAY' ? '[]' : '')) } @cols), # values
    #~ join(',', map qq|?::@{[$type->{$_}{data_type} eq 'ARRAY' ? $type->{$_}{array_type}.'[]' : $type->{$_}{data_type} ]}|, @cols), # values
    join(',', map qq|"$_"|, @cols), # values
    
    join(' and ', map qq|t."$_"=v."$_"|, @$key_cols), # where
    join(', ', map qq|t."$_"|, @upd_cols), # DISTINCT
    join(', ', map qq|v."$_"|, @upd_cols), # DISTINCT
    
  ))), undef, @bind);
}

sub _select {
=pod
входные параметры смотри sub вставить_или_обновить
=cut
  my ($self, $schema, $table, $key_cols,) = splice @_,0, 4;
  my $data = ref $_[0] ? shift : {@_};
  
  my ($where, @bind) = ref $key_cols eq 'ARRAY'
    ? ('WHERE '.join(' and ', map qq|"$_"=?|, @$key_cols), @$data{@$key_cols})
    : $self->SqlAb->where($key_cols)
  ;
  
  $self->dbh->selectrow_hashref($self->_prepare(sprintf(<<END_SQL, 
select *
from "%s"."%s"
%s ---where 
;
END_SQL
  ($schema, $table, $where,
  ))),
  undef, (@bind));
}

sub _удалить { shift->_delete(@_); }
sub _delete {
=pod
входные параметры смотри sub вставить_или_обновить
=cut
  my ($self, $schema, $table, $key_cols,) = splice @_,0, 4;#map shift, 1..4;
  my $data = ref $_[0] ? shift : {@_};
  
  my @bind = @$data{@$key_cols};
  
  $self->dbh->selectrow_hashref($self->_prepare(sprintf(<<END_SQL, 
delete
from "%s"."%s"
where %s
returning *
;
END_SQL
  ($schema, $table,
  join(' and ', map qq|"$_"=?|, @$key_cols),
  ))),
  undef, (@bind));
  
}

sub _удалить_строку {# со связями!
  my ($self, $table, $id, $refs, $schema) = splice @_,0, 5;#
  #~ $uid ||= $self->uid;
  $refs ||= $self->template_vars->{tables}{refs};
  $schema ||= $self->template_vars->{schema};
  #~ $self->app->log->error('_удалить_строку',  $schema, $table, $refs, $id);
  $self->dbh->selectrow_array(<<END_SQL, undef, $schema, $table, $refs, $id, $self->uid
select "удалить объект"(?, ?, ?, ?, ?);
END_SQL
  );
}

sub _prepare {# sth
  my ($self, $sql, $cached) = @_;
  $cached //= $self->sth_cached;
  return $self->dbh->prepare_cached($sql)
    if $cached;
  return  $self->dbh->prepare($sql)
  
}

sub sequence_next_val {
  my ($self, $seq) = @_;
  my $sth = $self->_prepare(<<END_SQL, 'cached');
SELECT nextval('   $seq   ');
END_SQL
  return $self->dbh->selectrow_array($sth);
}


sub связь {
  my $self = shift;
  my $data = ref $_[0] ? shift : {id1=>shift, id2=>shift};
  #~ my $param = ref $_[0] ? shift : {@_};
  return
    unless $data->{id1} && $data->{id2};
  $self->вставить_или_обновить($self->template_vars->{schema}, $self->template_vars->{tables}{refs}, ["id1", "id2"], $data);#{id1=>$id1, id2=>$id2,}
}

# ->связь_получить(123, 345);
# ->связь_получить(123, "номенклатура");
# ->связь_получить("roles", 568);
sub связь_получить {
  my ($self, $id1, $id2, $table_refs, $schema) = @_;
  return $self->_select($schema || $self->template_vars->{schema}, $table_refs || $self->template_vars->{tables}{refs}, ["id1", "id2"], {id1=>$id1, id2=>$id2,})
    if $id1 =~ /^\d+$/ && $id2 =~ /^\d+$/;
  
  $self->dbh->selectall_arrayref($self->_prepare(sprintf(<<END_SQL, $schema || $self->template_vars->{schema}, $table_refs || $self->template_vars->{tables}{refs}, $schema || $self->template_vars->{schema}, $id2), 'cached'), {Slice=>{}}, ($id1))
select r.*
from "%s"."%s" r
  join "%s"."%s" t on t.id=r.id2
where r.id1=?
END_SQL
  if $id2 && $id1 =~ /^\d+$/;

  $self->dbh->selectall_arrayref($self->_prepare(sprintf(<<END_SQL, $schema || $self->template_vars->{schema}, $table_refs || $self->template_vars->{tables}{refs}, $schema || $self->template_vars->{schema}, $id1), 'cached'), {Slice=>{}}, ($id2))
select r.*
from "%s"."%s" r
  join "%s"."%s" t on t.id=r.id1
where r.id2=?
END_SQL
  if $id1 && $id2 =~ /^\d+$/;
}

#
#->связь_обновить(10203, 12354);
#->связь_обновить({id=>10203, id1=>12354});
#->связь_обновить(10203, {id1=>12354});
#->связь_обновить({id=>10203}, {id1=>12354}); #where set
#->связь_обновить({id1=>102, id2=>103}, {id1=>123}); #where set
sub связь_обновить {
  my ($self, $id, $id1, $id2) = splice @_,0, 4;
  my $set = ref $id1 ? $id1 : shift;
  my $bind = ref $id ? $id : {id=>$id, ref $id1 ? () : ($id1 ? (id1=>$id1) : (), $id2 ? (id2=>$id2) : (),),};
  
  my @keys_set = sort keys %$set
    if $set;
  
  return $self->dbh->selectrow_hashref($self->_prepare(sprintf(<<END_SQL, $self->template_vars->{schema}, $self->template_vars->{tables}{refs}), 'cached'), undef, (@$set{@keys_set}, @$bind{qw(id id1 id2)}, ))
update "%s"."%s"
set @{[ join ', ', map qq("$_"=?), @keys_set ]}
where id=? or (id1=? and id2=?)
returning *;
END_SQL
    if $set;
  
  $self->_update($self->template_vars->{schema}, $self->template_vars->{tables}{refs}, ["id"], $bind);
}

sub связь_удалить {
  my $self = shift;
  my $data = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectrow_hashref($self->_prepare(sprintf(<<END_SQL, $self->template_vars->{schema}, $self->template_vars->{tables}{refs}), 'cached'), undef, (@$data{qw(id id1 id2)}));
delete
from "%s"."%s"
where id=? or (id1=? and id2=?)
returning *;
END_SQL

}

sub связи_удалить {
  my $self = shift;
  my $data = ref $_[0] ? shift : {@_};
  
  my @bind = map {ref $data->{$_} ? $data->{$_} : [$data->{$_}]} qw(id1 id2);
  
  $self->dbh->selectall_arrayref($self->_prepare(sprintf(<<END_SQL, $self->template_vars->{schema}, $self->template_vars->{tables}{refs}), 'cached'), {Slice=>{}}, @bind);
delete
from "%s"."%s"
where id1=any(?::int[]) and id2=any(?::int[])
returning *
;
END_SQL

}

sub связи {
  my $self = shift;
  my $data = ref $_[0] ? shift : {@_};
  
  my @bind = map {ref $data->{$_} ? $data->{$_} : [$data->{$_}]} qw(id id1 id2);
  
  $self->dbh->selectall_arrayref($self->_prepare(sprintf(<<END_SQL, $self->template_vars->{schema}, $self->template_vars->{tables}{refs}), 'cached'), {Slice=>{}}, @bind);
select *
from "%s"."%s"
where id=any(?::int[]) or id1=any(?::int[]) or id2=any(?::int[])
;
END_SQL

}

1;

__END__
sub _insert_bulk {
=pod
не пошло, плодит строки
http://stackoverflow.com/a/20224370


  INSERT INTO "table" (col1, col2, col3)
    VALUES (11, 12, 13) , (21, 22, 23) , (31, 32, 33);

It becomes:

  INSERT INTO "table" (col1, col2, col3)
    VALUES (unnest(array[11,21,31]), -- col1 values
          unnest(array[12,22,32]), -- col2 values
          unnest(array[13,23,33])) -- col3 values

Replacing the values with placeholders:

  INSERT INTO "table" (col1, col2, col3)
    VALUES (unnest(?), unnest(?), unnest(?))
    

Формат $data:

$data->{col1} = [значения...]
$data->{col2} = [значения...]
....
Если в массиве значений есть массивы для колонки,
то вместо функции unnest() использовать unnest_dim2(anyarray)
https://github.com/mche/postgresql-help/blob/master/README.pod#%D0%A4%D1%83%D0%BD%D0%BA%D1%86%D0%B8%D1%8F-%D0%B4%D0%BB%D1%8F-%D1%80%D0%B0%D0%B7%D0%B2%D0%BE%D1%80%D0%B0%D1%87%D0%B8%D0%B2%D0%B0%D0%BD%D0%B8%D1%8F-%D0%B4%D0%B2%D1%83%D0%BC%D0%B5%D1%80%D0%BD%D0%BE%D0%B3%D0%BE-%D0%BC%D0%B0%D1%81%D1%81%D0%B8%D0%B2%D0%B0-%D0%B2-%D1%81%D0%BF%D0%B8%D1%81%D0%BE%D0%BA-%D1%81-%D1%81%D0%BE%D1%85%D1%80%D0%B0%D0%BD%D0%B5%D0%BD%D0%B8%D0%B5%D0%BC-%D0%BC%D0%B0%D1%81%D1%81%D0%B8%D0%B2%D0%BE%D0%B2-%D0%B2%D1%82%D0%BE%D1%80%D0%BE%D0%B3%D0%BE-%D1%83%D1%80%D0%BE%D0%B2%D0%BD%D1%8F


=cut
  my ($self, $schema, $table, $key_cols,) = map shift, 1..4;
  
  my $cb = ref $_[-1] eq 'CODE' ? pop : undef;
  
  my $type = $self->_table_type_cols($schema, $table);
  my $data = ref $_[0] ? shift : {@_};
  my @cols = sort grep $type->{$_}, keys %$data;
  my @bind = @$data{@cols}; #map $data->{$_}, @cols;
  push @bind, $cb
    if $cb;
   
  $self->dbh->selectall_arrayref($self->_prepare(sprintf(<<END_SQL, 
insert into "%s"."%s" (%s)
VALUES (%s)
returning *;
END_SQL
  (
    $schema, $table,
    join(',', map qq|"$_"|, @cols),
    join(',', map sprintf("unnest(?::%s[])", $type->{$_}{data_type}), @cols), # values
  ))), { Slice=>{} }, @bind,);
}

