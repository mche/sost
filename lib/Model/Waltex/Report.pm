package Model::Waltex::Report;
use Mojo::Base 'Model::Base';
#~ use Mojo::Util qw(dumper);

our $DATA = ['Report.pm.dict.sql'];
#~ has sth_cached => 1;
my $main_table ="движение денег";
has "temp_view_name";# => "движение денег-снимок".rand();

sub new {
  my $self = shift->SUPER::new(@_);
  $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  return $self;
}
sub init {
  my $self = shift;
  $self->dbh->do($self->sth('временная схема'));
  $self->dbh->do($self->sth('функции'));
  
}

sub снимок_диапазона {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  
  my @union = ();# юнионы
  my @bind = ();
  my @b = ();
  my %where = ();
=pod
  where 
  "дата" between ?::date and ?::date
  and ((?::int is null or "кошельки/id"[1][1]=?) -- проект
  and (?::int is null or "кошельки/id"[1][2]=?)) -- кошелек
  
  and (
    (coalesce(?::int, 0)=0 /*пустое не вкл*/
    and ((coalesce(?::int, 0)=0/*все объекты выкл*/ and (?::int is null or "объект/id"=?)) -- один объект
      or (coalesce(?::int, 0)=1 and "объект/id" is not null)) --- все объекты вкл
      
    and ((coalesce(?::int, 0)=0/*все контрагенты выкл*/ and (?::int is null or "контрагент/id"=?)) -- один контрагент
      or (coalesce(?::int, 0)=1 and "контрагент/id" is not null)) --- все контрагенты вкл
    ) 
    ---or (::int is null and ::int is null and ::int is null and ::int is null and ::int is null) --- нет: объекта/все объекты и контрагента/все контрагенты и пустое движение
    or (coalesce(?::int, 0)=1/*пустое вкл*/ and "кошелек2" is null and "контрагент/id" is null and "объект/id" is null and "профиль/id" is null)--- пустое движение
  )
=cut
  

  #для внешние и пустые платежи
  push @union, 'снимок диапазона/union/все платежи'
    and (($where{'снимок диапазона/union/все платежи'}, @b) = $self->SqlAb->where({
      ' "дата" ' => { -between => \["?::date and ?::date" => @{$param->{'даты'}}],},
      $param->{'проект'} ? (' "кошельки/id"[1][1] ' => $param->{'проект'}) : (),
      $param->{'кошелек'} ? (' "кошельки/id"[1][2] ' => $param->{'кошелек'}) : (),
      $param->{'пустое движение'}
        ? (' "кошелек2" ' => undef, ' "контрагент/id" ' => undef, ' "профиль/id" ' => undef,)
        : (( $param->{'все контрагенты'}
          ? (' "контрагент/id" ' => { '!=', undef },)
          : ($param->{'контрагент'}
            ? (' "контрагент/id" ' => $param->{'контрагент'})
            : ()
          )
        
        ), ($param->{'все объекты'}
          ? (' "объект/id" ' => { '!=', undef })
          : ($param->{'объект'}
            ? (' "объект/id" ' =>$param->{'объект'})
            : ()
          )
        ), $param->{'все профили'}
          ? (' "профиль/id" ' => { '!=', undef },)
          : ($param->{'профиль'}
            ? (' "профиль/id" ' => $param->{'профиль'})
            : ()
          )
        )
      }))
    and push @bind, (@{$param->{'интервал'} || [undef, undef]}, @b) #@{$param->{'даты'}}, ($param->{'проект'}) x 2,  ($param->{'кошелек'}) x 2, $param->{'пустое движение'}, $param->{'все объекты'}, ($param->{'объект'}) x 2, $param->{'все объекты'}, $param->{'все контрагенты'}, ($param->{'контрагент'}) x 2, $param->{'все контрагенты'}, $param->{'пустое движение'})
    if !($param->{'все кошельки2'});# || $param->{'все профили'}
  
  #~ $self->app->log->error($where{'снимок диапазона/union/все платежи'});
  
=pod
where 
  "дата" between ?::date and ?::date
  and ((?::int is null or "кошельки/id"[1][1]=?) and (?::int is null or "кошельки/id"[1][2]=?)) -- проект или кошелек
  
  and (
    ((coalesce(?::int, 0)=0/*все кошельки2 выкл*/ and (?::int is null or "кошелек2"=?)) --- не указан "все кошельки2" и один кошелек2
      or (coalesce(?::int, 0)=1 and "кошелек2" is not null) --- "все кошельки2" вкл
    )
    or (coalesce(?::int, 0)=0 and ?::int is null)--- нет "все кошельки2" и кошелек2
  ) 
=cut

  push @union, 'снимок диапазона/union/внутр перемещения'
    and (($where{'снимок диапазона/union/внутр перемещения'}, @b) = $self->SqlAb->where({
      ' "дата" ' => { -between => \["?::date and ?::date", @{$param->{'даты'}}], },
      $param->{'проект'} ? (' "кошельки/id"[1][1] ' => $param->{'проект'}) : (),
      $param->{'кошелек'} ? (' "кошельки/id"[1][2] ' => $param->{'кошелек'}) : (),
      $param->{'все кошельки2'}
        ? (' "кошелек2" ' => { '!=', undef },)
        : ($param->{'кошелек2'}
          ? (' "кошелек2" ' => $param->{'кошелек2'})
          : ()
        ),
    }))
    and push @bind, (@{$param->{'интервал'} || [undef, undef]}, @b) #@{$param->{'даты'}}, ($param->{'проект'}) x 2,  ($param->{'кошелек'}) x 2, $param->{'все кошельки2'}, ($param->{'кошелек2'}) x 2, ($param->{'все кошельки2'}) x 2, $param->{'кошелек2'}, )
    if !($param->{'пустое движение'} || $param->{'все объекты'} || $param->{'объект'} || $param->{'все контрагенты'} || $param->{'контрагент'} || $param->{'все профили'} || $param->{'профиль'});# || ($param->{'все кошельки2'} || $param->{'кошелек2'}); || $param->{'объект'}|| $param->{'контрагент'} || $param->{'профиль'}

=pod
where
  "дата" between ?::date and ?::date
  and ((?::int is null or "кошельки/id"[1][1]=?) and (?::int is null or "кошельки/id"[1][2]=?)) -- проект или кошелек
  
  and (
    ((coalesce(?::int, 0)=0/*"все профили" выкл*/ and (?::int is null or "профиль/id"=?)) --- не указан "все профили" и один профиль
      or (coalesce(?::int, 0)=1 and "профиль/id" is not null) --- вкл "все профили"
    )
    or (coalesce(?::int, 0)=0 and ?::int is null)--- нет "все профили" и профиль
  ) 

=cut

  push @union, 'снимок диапазона/union/начисления сотрудникам'
    and (($where{'снимок диапазона/union/начисления сотрудникам'}, @b) = $self->SqlAb->where({
      ' "дата" ' => { -between => \["?::date and ?::date", @{$param->{'даты'}}], },
      $param->{'проект'} ? (' "кошельки/id"[1][1] ' => $param->{'проект'}) : (),
      $param->{'кошелек'} ? (' "кошельки/id"[1][2] ' => $param->{'кошелек'}) : (),
      $param->{'все профили'}
        ? (' "профиль/id" ' => { '!=', undef },)
        : ($param->{'профиль'}
          ? (' "профиль/id" ' => $param->{'профиль'})
          : ()
        ),
    }))
    and push @bind, (@{$param->{'интервал'} || [undef, undef]}, @b) #@{$param->{'даты'}}, ($param->{'проект'}) x 2,  ($param->{'кошелек'}) x 2, $param->{'все профили'}, ($param->{'профиль'}) x 2, ($param->{'все профили'}) x 2, $param->{'профиль'})
    if !($param->{'пустое движение'} || $param->{'все объекты'} || $param->{'все контрагенты'} || $param->{'все кошельки2'});# || ($param->{'профиль'} || $param->{'все профили'}); || $param->{'объект'} || $param->{'контрагент'} || $param->{'кошелек2'}
  
  # тут начисленные деньги по объектам

  push @union, 'снимок диапазона/union/начисления сотрудникам/по объектам'
    and (($where{'снимок диапазона/union/начисления сотрудникам/по объектам'}, @b) = $self->SqlAb->where({
      ' "дата" ' => { -between => \["?::date and ?::date", @{$param->{'даты'}}], },
      $param->{'проект'} ? (' "кошельки/id"[1][1] ' => $param->{'проект'}) : (),
      $param->{'кошелек'} ? (' "кошельки/id"[1][2] ' => $param->{'кошелек'}) : (),
      $param->{'все объекты'}
        ? ()
        : ($param->{'объект'}
          ? (' "объект/id" ' => $param->{'объект'})
          : ()
        ),
    }))
    and push @bind, (@{$param->{'интервал'} || [undef, undef]}, @b) #@{$param->{'даты'}}, ($param->{'проект'}) x 2,  ($param->{'кошелек'}) x 2, $param->{'все профили'}, ($param->{'профиль'}) x 2, ($param->{'все профили'}) x 2, $param->{'профиль'})
    if $param->{'все объекты'} || $param->{'объект'};

  
  $self->dbh->do($self->sth('снимок диапазона', temp_view_name=>$self->temp_view_name, union=>\@union, where=>\%where), undef, @bind );
  #~ $self->app->log->debug("снимок_диапазона");
}

sub движение_интервалы_столбцы {# столбцы
  my $self = shift;
  $self->dbh->selectall_arrayref($self->sth('движение/интервалы/столбцы', temp_view_name=>$self->temp_view_name), {Slice=>{}}, );# $param->{'проект'}, @{$param->{'даты'}},
}

sub движение_интервалы_строки {
  my $self = shift;
  $self->dbh->selectall_hashref($self->sth('движение/интервалы/строки', temp_view_name=>$self->temp_view_name), 'key', );# $param->{'проект'}, @{$param->{'даты'}},
}

sub движение_все_кошельки {
  my $self = shift;
  $self->dbh->selectall_hashref($self->sth('движение/все кошельки', temp_view_name=>$self->temp_view_name), 'key', );
}

sub движение_все_кошельки2 {
  my $self = shift;
  $self->dbh->selectall_hashref($self->sth('движение/все кошельки2', temp_view_name=>$self->temp_view_name), 'key', );
}

sub движение_все_контрагенты {
  my $self = shift;
  $self->dbh->selectall_hashref($self->sth('движение/все контрагенты', temp_view_name=>$self->temp_view_name), 'key', );
}

sub движение_все_объекты {
  my $self = shift;
  $self->dbh->selectall_hashref($self->sth('движение/все объекты', temp_view_name=>$self->temp_view_name), 'key', );
  
}

sub движение_все_профили {
  my $self = shift;
  $self->dbh->selectall_hashref($self->sth('движение/все профили', temp_view_name=>$self->temp_view_name), 'key', );
  
}

sub движение_итого_интервалы {
  my $self = shift;
  $self->dbh->selectall_arrayref($self->sth('движение итого/интервалы', temp_view_name=>$self->temp_view_name), {Slice=>{}}, );# $param->{'проект'}, @{$param->{'даты'}},
}

sub всего {
  my $self = shift;
  $self->dbh->selectall_hashref($self->sth('движение всего', temp_view_name=>$self->temp_view_name), 'title', undef, ); # $param->{'проект'}, @{$param->{'даты'}},
}

sub всего_строки {
  my $self = shift;
  $self->dbh->selectall_arrayref($self->sth('движение всего/2', temp_view_name=>$self->temp_view_name), {Slice=>{}}, ); # $param->{'проект'}, @{$param->{'даты'}},
}

sub всего_строки_все_кошельки0000 {
  my $self = shift;
  $self->dbh->selectall_hashref($self->sth('всего/все кошельки', temp_view_name=>$self->temp_view_name), 'key', ); # $param->{'проект'}, @{$param->{'даты'}},
}

sub всего_строки_все_контрагенты {
  my $self = shift;
  $self->dbh->selectall_hashref($self->sth('всего/все контрагенты', temp_view_name=>$self->temp_view_name), 'key', ); # $param->{'проект'}, @{$param->{'даты'}},
}

sub итого_колонки {
  my $self = shift;
  $self->dbh->selectall_hashref($self->sth('движение итого/2', temp_view_name=>$self->temp_view_name), 'sign', undef, ); # $param->{'проект'}, @{$param->{'даты'}},
}



sub итого_всего {
  my $self = shift;
  #~ my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectrow_array($self->sth('движение итого/всего', temp_view_name=>$self->temp_view_name), undef, );# $param->{'проект'}, @{$param->{'даты'}},
  
}

#~ sub остаток_начало000 {
  #~ my $self = shift;
  #~ my $param = ref $_[0] ? shift : {@_};
  #~ $self->dbh->selectrow_array($self->sth('остаток на дату', temp_view_name=>$self->temp_view_name), undef, ($param->{'даты'}[0], '0 days', ($param->{'проект'}) x 2, ($param->{'кошелек'}) x 2,  ($param->{'контрагент'}) x 2, ) x 2);
#~ }

#~ sub остаток_конец000 { # на вторую дату
  #~ my $self = shift;
  #~ my $param = ref $_[0] ? shift : {@_};
  #~ $self->dbh->selectrow_array($self->sth('остаток на дату', temp_view_name=>$self->temp_view_name), undef, ($param->{'даты'}[1], '1 days', ($param->{'проект'}) x 2, ($param->{'кошелек'}) x 2,  ($param->{'контрагент'}) x 2, ) x 2);
#~ }

sub остатки_период {# общие остатки строка
  my $self = shift;
  my $cb = ref $_[-1] eq 'CODE' && pop @_;
  my $param = ref $_[0] ? shift : {@_};
  
  my @union = ();
  
  push @union, 'движение и остатки/union/внутренние перемещения';
    #~ unless $param->{'контрагент'} || $param->{'все контрагенты'} || $param->{'профиль'} || $param->{'все профили'};
  
  #~ push @union, 'движение и остатки/union/начисления сотрудникам'
    #~ if $param->{'профиль'} || $param->{'все профили'};
  
  #~ my @bind = ($param->{'даты'}[0], @{$param->{'даты'}}, ($param->{'проект'}) x 2, ($param->{'кошелек'}) x 2, ($param->{'объект'}) x 2,);
  push my @bind, ($param->{'даты'}[0], @{$param->{'даты'}}, ($param->{'проект'}) x 2, ($param->{'кошелек'}) x 2, ) x (1+ scalar @union);
  
  my $r = $cb
    ? $self->dbh->pg->db->query($self->dict->render('остатки/период', union=>\@union,), @bind, $cb)
    : $self->dbh->selectrow_hashref($self->sth('остатки/период', union=>\@union,), undef, @bind);# не отсекать контрагентов и сотрудников  ($param->{'контрагент'}) x 4,  ($param->{'профиль'}) x 4,
  #~ $self->app->log->debug("остатки_период");
  return $r;
}


sub всего_остатки_все_кошельки {
  my $self = shift;
  my $cb = ref $_[-1] eq 'CODE' && pop @_;
  my $param = ref $_[0] ? shift : {@_};
  
  my @union = ();
  
  push @union, 'движение и остатки/union/внутренние перемещения';
    #~ unless $param->{'контрагент'} || $param->{'все контрагенты'} || $param->{'профиль'} || $param->{'все профили'};
  
  #~ push @union, 'движение и остатки/union/начисления сотрудникам'
    #~ if $param->{'профиль'} || $param->{'все профили'};
    
  my @bind = ($param->{'даты'}[0], @{$param->{'даты'}}, ($param->{'проект'}) x 2, ($param->{'кошелек'}) x 2,) x (1+scalar @union);

  $cb 
    ? $self->dbh->pg->db->query($self->dict->render('всего и остатки/все кошельки', union=>\@union), @bind, $cb)
    : $self->dbh->selectall_arrayref($self->sth('всего и остатки/все кошельки', union=>\@union), {Slice=>{}}, @bind,); # не отсекать контров и сотр  ($param->{'контрагент'}) x 4, ($param->{'профиль'}) x 4,
}

sub всего_остатки_все_кошельки2 {# перемещения
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  
  my @union = ();
  
  push @union, 'движение и остатки/union/внутренние перемещения';
    #~ unless $param->{'контрагент'} || $param->{'все контрагенты'} || $param->{'профиль'} || $param->{'все профили'};
  
  #~ push @union, 'движение и остатки/union/начисления сотрудникам'
    #~ if $param->{'профиль'} || $param->{'все профили'};
    
  my @bind = ($param->{'даты'}[0], @{$param->{'даты'}}, ($param->{'проект'}) x 2, ($param->{'кошелек'}) x 2,) x (1+scalar @union);

  $self->dbh->selectall_arrayref($self->sth('всего и остатки/все кошельки2', union=>\@union), {Slice=>{}}, @bind ); # не отсекать контров и сотр  ($param->{'контрагент'}) x 4, ($param->{'профиль'}) x 4,
}

sub всего_остатки_все_контрагенты {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  
  my @union = ();
  
  #~ push @union, 'движение и остатки/union/внутренние перемещения'
    #~ unless $param->{'контрагент'} || $param->{'все контрагенты'} || $param->{'профиль'} || $param->{'все профили'};
  
  #~ push @union, 'движение и остатки/union/начисления сотрудникам'
    #~ if $param->{'профиль'} || $param->{'все профили'};

$self->dbh->selectall_arrayref($self->sth('всего и остатки/все контрагенты', union=>\@union,), {Slice=>{}}, ($param->{'даты'}[0], @{$param->{'даты'}}, ($param->{'проект'}) x 2, ($param->{'кошелек'}) x 2, ) x (1+scalar @union)); # не отсекать контров и сотр  ($param->{'контрагент'}) x 4, ($param->{'профиль'}) x 4,
}

sub всего_остатки_все_профили {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  
  my @union = ();
  
  #~ push @union, 'движение и остатки/union/внутренние перемещения'
    #~ unless $param->{'контрагент'} || $param->{'все контрагенты'} || $param->{'профиль'} || $param->{'все профили'};
  
  #~ push @union, 'движение и остатки/union/начисления сотрудникам';
    #~ if $param->{'профиль'} || $param->{'все профили'};

  $self->dbh->selectall_arrayref($self->sth('всего и остатки/все профили', union=>\@union,), {Slice=>{}}, ($param->{'даты'}[0], @{$param->{'даты'}}, ($param->{'проект'}) x 2, ($param->{'кошелек'}) x 2, ) x (1+scalar @union)); # не отсекать контров и сотр  ($param->{'контрагент'}) x 4, ($param->{'профиль'}) x 4,
}

sub всего_остатки_все_объекты {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  
  my @union = ();
  
  #~ push @union, 'движение и остатки/union/внутренние перемещения'
    #~ unless $param->{'контрагент'} || $param->{'все контрагенты'} || $param->{'профиль'} || $param->{'все профили'};
  
  #~ push @union, 'движение и остатки/union/начисления сотрудникам'
    #~ if $param->{'профиль'} || $param->{'все профили'};

$self->dbh->selectall_arrayref($self->sth('всего и остатки/все объекты', union=>\@union,), {Slice=>{}}, ($param->{'даты'}[0], @{$param->{'даты'}}, ($param->{'проект'}) x 2, ($param->{'кошелек'}) x 2, ) x (1+scalar @union)); #
}

sub строка_отчета_интервалы_столбцы {
  my $self = shift;
  
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_arrayref($self->sth('строка отчета/интервалы/столбцы', temp_view_name=>$self->temp_view_name), {Slice=>{}}, ($param->{"категория"}) x 2, $param->{sign},);#
}


sub строка_отчета_интервалы_строки {
  my $self = shift;
  
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_arrayref($self->sth('строка отчета/интервалы/строки', temp_view_name=>$self->temp_view_name), {Slice=>{}}, ($param->{"категория"}) x 2, $param->{"код интервала"} || $param->{key} ,);#
}

sub строка_отчета_интервалы_все_кошельки {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_arrayref($self->sth('строка отчета/интервалы/все кошельки', temp_view_name=>$self->temp_view_name), {Slice=>{}}, ($param->{"категория"}) x 2, $param->{key} ,);#
}

sub строка_отчета_интервалы_все_кошельки2 {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_arrayref($self->sth('строка отчета/интервалы/все кошельки2', temp_view_name=>$self->temp_view_name), {Slice=>{}}, ($param->{"категория"}) x 2, $param->{key} ,);#
}

sub строка_отчета_интервалы_все_контрагенты {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_arrayref($self->sth('строка отчета/интервалы/все контрагенты', temp_view_name=>$self->temp_view_name), {Slice=>{}}, ($param->{"категория"}) x 2, $param->{key} ,);#
}

sub строка_отчета_интервалы_все_объекты {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_arrayref($self->sth('строка отчета/интервалы/все объекты', temp_view_name=>$self->temp_view_name), {Slice=>{}}, ($param->{"категория"}) x 2, $param->{key} ,);#
}

sub строка_отчета_интервалы_все_профили {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_arrayref($self->sth('строка отчета/интервалы/все профили', temp_view_name=>$self->temp_view_name), {Slice=>{}}, ($param->{"категория"}) x 2, $param->{key} ,);#
}

sub строка_отчета_всего_столбцы {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_hashref($self->sth('строка отчета/всего/столбцы', temp_view_name=>$self->temp_view_name), 'category', undef, ($param->{"категория"}) x 2, $param->{sign},); 
}

sub строка_отчета_всего_строки {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_hashref($self->sth('строка отчета/всего/строки', temp_view_name=>$self->temp_view_name), 'category', undef, ($param->{"категория"}) x 2, $param->{"код интервала"} || $param->{key},); 
}

sub строка_отчета_всего_все_кошельки {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_hashref($self->sth('строка отчета/всего/все кошельки', temp_view_name=>$self->temp_view_name), 'category', undef, ($param->{"категория"}) x 2, $param->{key},); 
}

sub строка_отчета_всего_все_кошельки2 {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_hashref($self->sth('строка отчета/всего/все кошельки2', temp_view_name=>$self->temp_view_name), 'category', undef, ($param->{"категория"}) x 2, $param->{key},); 
}

sub строка_отчета_всего_все_контрагенты {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_hashref($self->sth('строка отчета/всего/все контрагенты', temp_view_name=>$self->temp_view_name), 'category', undef, ($param->{"категория"}) x 2, $param->{key},); 
}

sub строка_отчета_всего_все_объекты {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_hashref($self->sth('строка отчета/всего/все объекты', temp_view_name=>$self->temp_view_name), 'category', undef, ($param->{"категория"}) x 2, $param->{key},); 
}

sub строка_отчета_всего_все_профили {
  my $self = shift;
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_hashref($self->sth('строка отчета/всего/все профили', temp_view_name=>$self->temp_view_name), 'category', undef, ($param->{"категория"}) x 2, $param->{key},); 
}

sub строка_отчета_интервалы_позиции_столбцы {
  my $self = shift;
  
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_arrayref($self->sth('строка отчета/интервалы/позиции/столбцы', temp_view_name=>$self->temp_view_name), {Slice=>{}}, $param->{"категория"}, $param->{sign},);#
}


sub строка_отчета_интервалы_позиции_строки {
  my $self = shift;
  
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_arrayref($self->sth('строка отчета/интервалы/позиции/строки', temp_view_name=>$self->temp_view_name), {Slice=>{}}, $param->{"категория"}, $param->{"код интервала"} || $param->{key},);#
}

sub строка_отчета_интервалы_позиции_все_кошельки {
  my $self = shift;
  
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_arrayref($self->sth('строка отчета/интервалы/позиции/все кошельки', temp_view_name=>$self->temp_view_name), {Slice=>{}}, $param->{"категория"}, $param->{key},);#
}

sub строка_отчета_интервалы_позиции_все_кошельки2 {
  my $self = shift;
  
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_arrayref($self->sth('строка отчета/интервалы/позиции/все кошельки2', temp_view_name=>$self->temp_view_name), {Slice=>{}}, $param->{"категория"}, $param->{key},);#
}

sub строка_отчета_интервалы_позиции_все_контрагенты {
  my $self = shift;
  
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_arrayref($self->sth('строка отчета/интервалы/позиции/все контрагенты', temp_view_name=>$self->temp_view_name), {Slice=>{}}, $param->{"категория"}, $param->{key},);#
}

sub строка_отчета_интервалы_позиции_все_объекты {
  my $self = shift;
  
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_arrayref($self->sth('строка отчета/интервалы/позиции/все объекты', temp_view_name=>$self->temp_view_name), {Slice=>{}}, $param->{"категория"}, $param->{key},);#
}

sub строка_отчета_интервалы_позиции_все_профили {
  my $self = shift;
  
  my $param = ref $_[0] ? shift : {@_};
  
  $self->dbh->selectall_arrayref($self->sth('строка отчета/интервалы/позиции/все профили', temp_view_name=>$self->temp_view_name), {Slice=>{}}, $param->{"категория"}, $param->{key},);#
}

sub сумма_двух_денег {
  my $self = shift;
  $self->dbh->selectrow_array($self->sth('сумма двух денег'), undef, @_);
  
}


1;

__DATA__
