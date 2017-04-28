package Model::Base;
use Mojo::Base 'DBIx::Mojo::Model';

has qw(sth_cached);# тотально для всех запросов

sub вставить_или_обновить {
=pod
Для одной записи таблицы
$schema, $table,
$key_cols - arrayref имен ключевых колонок
$data - hashref (или список) "колонкаА" => <значение>
$expr - hashref опционально выражения для колонок: "колонкаА"=>"to_timestamp(?::numeric)"

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
  my ($self, $schema, $table, $key_cols,) = map shift, 1..4;
  
  my $cb = ref $_[-1] eq 'CODE' ? pop : undef;
  
  my $type = $self->_table_type_cols($schema, $table);
  my $data = ref $_[0] ? shift : {@_};
  my $expr =  ref $_[0] ? shift : {};
  
  #~ delete @$data{ grep ! defined $data->{$_}, keys %$data };
  my %cols = ();
  my @cols = sort grep $type->{$_}, (@cols{ keys %$data, keys %$expr }++ || keys %cols);
  my @bind_cols = sort grep $type->{$_}, keys %$data;
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
    join(',', map $expr->{$_} || qq|?|, @cols), # values
  ))), undef, @bind,);
}

sub _try_insert {
=pod
входные параметры смотри sub вставить_или_обновить
=cut
  my ($self, $schema, $table, $key_cols,) = map shift, 1..4;
  my $data = ref $_[0] ? shift : {@_};
  my $expr =  ref $_[0] ? shift : {};
  
  return $self->_insert($schema, $table, $key_cols, $data) # простая вставка для пропусков ключевых колонок
    if $key_cols && @$key_cols && scalar(grep defined($data->{$_}),  @$key_cols) ne scalar(@$key_cols);
  
  #~ delete @$data{ grep ! defined $data->{$_}, keys %$data };
  my $type = $self->_table_type_cols($schema, $table);
  my %cols = ();
  my @cols = sort grep $type->{$_}, (@cols{ keys %$data, keys %$expr }++ || keys %cols);
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
    join(',', map qq|"$_"|, @cols),
    join(',', map $expr->{$_} || sprintf(qq|?::%s|,  $type->{$_}{data_type} eq 'ARRAY' ? $type->{$_}{array_type}.'[]' : $type->{$_}{data_type}), @cols), # values
    join(',', map qq|"$_"|, @cols), # values colnames
    $schema, $table,
    join(' and ', map qq|v."$_"=t."$_"|, @$key_cols), # on left join
    $key_cols->[0], # where one key column достаточно одной ключевой колонки
  ))), undef, @bind);
}

sub _table_type_cols {# типы колонок таблицы
  my ($self, $schema, $table) = @_;
  $schema ||= $self->{template_vars}{schema}
    or die "Не указана схема БД";
  $table ||= $self->{template_vars}{tables}{main}
    or die "Не указана таблица";
  $self->dbh->selectall_hashref($self->_prepare(<<END_SQL, 1), 'column_name', undef, ($schema, $table))
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

sub _update {
=pod
входные параметры смотри sub вставить_или_обновить
=cut
  my ($self, $schema, $table, $key_cols,) = map shift, 1..4;
  my $data = ref $_[0] ? shift : {@_};
  my $expr =  ref $_[0] ? shift : {};
  
  my $type = $self->_table_type_cols($schema, $table);
  my %cols = ();
  my @cols = sort grep $type->{$_}, (@cols{ keys %$data, keys %$expr }++ || keys %cols);
  my @bind_cols = sort grep $type->{$_}, keys %$data;
  my @bind = (@$data{@bind_cols}, @$data{@$key_cols});
  
  $self->dbh->selectrow_hashref($self->_prepare(sprintf(<<END_SQL, 
update "%s"."%s" t
set %s
where %s
returning *;
END_SQL
  (
    $schema, $table,
    join(', ', map sprintf(qq|"$_"=%s|, $expr->{$_} || sprintf(qq|?::%s|,  $type->{$_}{data_type} eq 'ARRAY' ? $type->{$_}{array_type}.'[]' : $type->{$_}{data_type})), @cols), # set
    join(' and ', map qq|"$_"=?|, @$key_cols), # where
    
  ))), undef, @bind);
}

sub _update_distinct {# обновить только обновляемые колонки, поэтому может вернуть пусто
=pod
входные параметры смотри sub вставить_или_обновить
=cut
  my ($self, $schema, $table, $key_cols,) = map shift, 1..4;
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
    
    join(',', map $expr->{$_} || sprintf(qq|?::%s|,  $type->{$_}{data_type} eq 'ARRAY' ? $type->{$_}{array_type}.'[]' : $type->{$_}{data_type}), @cols), # values
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
  my ($self, $schema, $table, $key_cols,) = map shift, 1..4;
  my $data = ref $_[0] ? shift : {@_};
  
  my @bind = @$data{@$key_cols};
  
  $self->dbh->selectrow_hashref($self->_prepare(sprintf(<<END_SQL, 
select *
from "%s"."%s"
where %s;
END_SQL
  ($schema, $table,
  join(' and ', map qq|"$_"=?|, @$key_cols),
  ))),
  undef, (@bind));
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
  my $sth = $self->_prepare(<<END_SQL);
SELECT nextval('   $seq   ');
END_SQL
  return $self->dbh->selectrow_array($sth);
}


sub связь {
  my ($self, $id1, $id2) = @_;
  $self->вставить_или_обновить($self->template_vars->{schema}, $self->template_vars->{tables}{refs}, ["id1", "id2"], {id1=>$id1, id2=>$id2,});
}

sub связь_получить {
  my ($self, $id1, $id2) = @_;
  
  $self->_select($self->template_vars->{schema}, $self->template_vars->{tables}{refs}, ["id1", "id2"], {id1=>$id1, id2=>$id2,});
}

sub связь_обновить {
  my ($self, $id, $id1, $id2) = @_;
  my $bind = ref $id ? $id : {id=>$id, id1=>$id1, id2=>$id2,};
  $self->_update($self->template_vars->{schema}, $self->template_vars->{tables}{refs}, ["id"], $bind);
}

sub связь_удалить {
  my $self = shift;
  my $data = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectrow_hashref($self->_prepare(sprintf(<<END_SQL, $self->template_vars->{schema}, $self->template_vars->{tables}{refs})), undef, (@$data{qw(id id1 id2)}));
delete
from "%s"."%s"
where id=? or (id1=? and id2=?)
returning *;
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

