package Model::Waltex::ZP;
use Mojo::Base 'Model::Base';
#~ use Mojo::Util qw(dumper);

our $DATA = ['ZP.pm.dict.sql'];

sub init { 1 };

sub конверты_данные {
  my ($self, $param) = @_;
  
  my ($where, @bind) = $self->SqlAb->where({
    ' "дата" ' => \[ " = date_trunc('month', ?::date)", $param->{"месяц"},],
    ' "сохраненный расчет" ' => { '!=', undef },# флажок закрыт
  });

  $self->dbh->selectall_arrayref($self->sth('конверты данные', select => $param->{select} || '*', where=>$where), {Slice=>{},}, ($param->{"месяц"}) x 4, @bind);
}

1;

__DATA__