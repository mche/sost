package Model::Tg;
use Mojo::Base 'Model::Base';

our $DATA = ['Tg.pm.sql'];
has contact_table => 'tg_contact';

#~ sub new {
  #~ my $self = shift->SUPER::new(@_);
  #~ $self->{template_vars}{tables}{main} = $self->table;
  #~ return $self;
#~ }
sub init {
  my $self = shift;
  $self->dbh->do($self->sth('таблицы'));
  #~ $self->dbh->do($self->sth('функции'));
  return $self;
}

sub профиль_контакта {# получить контакт, может несколько контактов на один профиль
  my ($self, $contact) = @_;
  my ($where, @bind) = $self->SqlAb->where([
    {# тут left join
      $contact->{user_id} ? (' c."user_id" ' => $contact->{user_id}, " c.id " => { '!=', undef },) : (),
    },
    #~ {# or
      #~ $contact->{phone_number} ? (' c."phone_number" ' => $contact->{phone_number}) : (),
    #~ },
    {# или профиль телефон
      #~ $contact->{phone_number} ? (' c."phone_number" ' => $contact->{phone_number}) : ()
      $contact->{phone_number} ? (" p.id " => { -in => \[ q{ select id from ( select id, right(regexp_replace(unnest(tel), '\D+', '', 'g'), 10) as tel from "профили") p WHERE p.tel = right(?::text, 10) }, $contact->{phone_number},] },) : (),
      
      #~ \[q{ EXISTS (select id  from "профили" WHERE right(regexp_replace(unnest(tel), '\D+', '', 'g'), 10) = right(?::text, 10) ) } => $contact->{phone_number}]
      #~ bar => \["IN ($sub_stmt)" => @sub_bind],
    },],
  );
  $self->dbh->selectall_arrayref($self->sth('профиль-контакты', join_contact=>'left', where=>$where), { Slice => {} }, @bind);
  #~ $self->dict->render('профиль-контакт', join_contact=>'left', where=>$where);
}

sub сохранить_контакт {#регистрация контакта на профиль
  my ($self, $profile_id, $contact) = @_;
  my $r = $self->вставить_или_обновить($self->{template_vars}{schema}, $self->contact_table, ["user_id"], $contact);
  $self->связь($profile_id, $r->{id});
  return $r;
}

sub удалить_контакт {
  my ($self, $contact_id,) = @_;
  my $contact = $self->_select($self->{template_vars}{schema}, $self->contact_table, ["user_id"], {"user_id"=>$contact_id})
    or return "Нет регистрации на ваш профиль";
  return $self->_удалить_строку($self->contact_table, $contact->{id});
}


1;