package Model::Access;
use Mojo::Base 'Model::Base';
#~ use Mojo::Util qw(dumper);

#~ has sth_cached => 1;

has [qw(app)];

sub new {
  state $self = shift->SUPER::new(@_);
  #~ $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  #~ $self->dbh->do($self->sth('таблицы'));
  #~ $self->dbh->do($self->sth('функции'));
  return $self;
}

sub пользователи {
  my $self = shift;
  $self->dbh->selectall_arrayref($self->sth('пользователи'), {Slice=>{}},);
  
}

sub роли {
  my $self = shift;
  $self->dbh->selectall_arrayref($self->sth('роли'), {Slice=>{}},);
  
}

sub маршруты {
  
  
}

sub сохранить_профиль {
  my $self = shift;
  my $data = ref $_[0] ? shift : {@_};
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, 'профили', ["id"], $data);
  
}

sub сохранить_логин {
  my $self = shift;
  my $data = ref $_[0] ? shift : {@_};
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, 'logins', ["id"], $data);
  
}



1;

__DATA__

@@ пользователи
select p.*, l.login, l.pass, l.id as "login/id"
from "профили" p
  left join (
  select l.*, r.id1 as p_id
  from logins l
  join refs r on l.id=r.id2
  ) l on l.p_id=p.id
order by array_to_string(p.names, ' ')
;


@@ роли
select *
from "roles"
;
