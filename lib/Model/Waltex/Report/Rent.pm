package Model::Waltex::Report::Rent;
use Mojo::Base 'Model::Base';
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

1;