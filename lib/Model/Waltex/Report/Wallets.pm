package Model::Waltex::Report::Wallets;
use Mojo::Base 'Model::Base';
#~ use Mojo::Util qw(dumper);
use Util;

our $DATA = ['Wallets.pm.dict.sql'];
my $main_table ="движение денег";

has model_money => sub {shift->app->models->{'Money'}};
has wallets => sub { [536, 672, 3596, 1998, 342643, 411536, 334671, # тдг
  774, 884, 2063, #итб
  ] };
has not_wallets => sub { [191244, 11146, 1272, 128455, 393883, 119394, 271889, 261660, 545, 1998, 190829, 1415, # тдг
  143419, 1192, #итб
  ] };
sub new {
  my $self = shift->SUPER::new(@_);
  $self->{template_vars}{tables}{main} = $main_table;
  #~ die dumper($self->{template_vars});
  return $self;
}

sub init {
  my $self = shift;
  #~ $self->dbh->do($self->sth('таблицы'));
  #~ $self->dbh->do($self->sth('функции'));
}

sub сальдо_по_кошелькам {
  my ($self, $param, $cb) = @_;
  my @bind = (($param->{'дата'}) x 3, $param->{'проект/id'},) x 2;# два union
  $cb 
    ? $self->dbh->pg->db->query($self->dict->render('сальдо по кошелькам'), @bind, $cb)
    : $self->dbh->selectall_arrayref($self->sth('сальдо по кошелькам'), {Slice=>{}}, @bind,);
}

sub прямые_платежи {# обратно - внутр перемещения
  my ($self, $param, $cb) = @_;
  my ($where, @bind) = $self->SqlAb->where({
    ' p.id '=>$param->{'проект/id'},
    #~ ' "кошелек/id" ' => {'not any(?)' => \['', $self->not_wallets]},
    ' m."дата" ' => $param->{'дата'},
  });
  $cb 
    ? $self->dbh->pg->db->query($self->model_money->dict->render('список или позиция', select => $param->{select} || '*', where1=>$where), @bind, $cb)
    : $self->dbh->selectall_arrayref($self->model_money->sth('список или позиция', select => $param->{select} || '*', where1=>$where), {Slice=>{}}, @bind,);
}

sub внутренние_перемещения {#переворот кошельков
  my ($self, $param, $cb) = @_;
  my ($where, @bind) = $self->SqlAb->where({
    ' "кошельки/id"[1][1] '=>$param->{'проект/id'},
    ' "дата" ' => $param->{'дата'},
  });
  $cb 
    ? $self->dbh->pg->db->query($self->dict->render('внутренние перемещения', select => $param->{select} || '*', where=>$where, order_by=>' order by id desc '), @bind, $cb)
    : $self->dbh->selectall_arrayref($self->sth('внутренние перемещения', select => $param->{select} || '*', where=>$where, order_by=>' order by id desc '), {Slice=>{}}, @bind,);
}

1;