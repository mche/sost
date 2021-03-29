package Model::Waltex::Report::Rent;
use Mojo::Base 'Model::Base';
use feature qw(signatures);
#~ use Util;

our $DATA = ['Rent.pm.dict.sql'];

sub контрагенты {
  my $self = shift;
  $self->dbh->selectrow_array($self->sth('контрагенты'));
  
}

sub движение_арендатора {
  my ($self, $param) = (shift, shift);
  my ($where, @bind) = $self->SqlAb->where({
    ' "кошельки/id"[1][1] '=>$param->{'арендодатель'},
    ' "контрагент/id" '=>$param->{'арендатор'},
    ' "дата" ' => { '<' => \"now()" },
  });
  $self->dbh->selectall_arrayref($self->sth('движение арендатора', select=>' *, "приход"::numeric as "приход/num", "расход"::numeric as "расход/num" ', where=>$where, order_by=>' order by "дата", "sign" '), {Slice=>{}}, @bind);
}

sub долги {# пока по всему контрагенту общий долг
  my ($self, $param) = (shift, shift);
  my ($where, @bind) = $self->SqlAb->where({
    ' "кошельки/id"[1][1] '=>$param->{'арендодатель'},
    $param->{'контрагенты/id'} && @{$param->{'контрагенты/id'}} ? (' "контрагент/id" '=>\[ q| = any(?)|, $param->{'контрагенты/id'} ]) : (),
    ' "дата" ' => { '<' => \"now()" },
    ' not ?::int /*не обесп платеж*/ ' => \['= any("категории")', '929979',],
  });
  $self->dbh->selectall_arrayref($self->sth('долги',  where=>$where, order_by=>' order by "сумма" '), {Slice=>{}}, @bind);
}

sub проект ($self, $id) {
  #~ $self->app->log->error($self->app->dumper($id));
  my ($where, @bind) = $self->SqlAb->where({
    ' "проект/id" ' => $id,
  });
  $self->dbh->selectrow_hashref($self->sth('проекты/контрагенты',  where=>$where), undef, @bind);
}

1;