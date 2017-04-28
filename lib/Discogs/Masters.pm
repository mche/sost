package Discogs::Masters;
use Mojo::Base 'Discogs::Base';

has latest_url => '/search/?limit=250&sort=date_added%2Cdesc&format_exact=Vinyl&type=master&layout=sm&page=';

has latest_css => 'div#search_results a.search_result_title';# CSS selector
has master_versions_css => 'table#versions tr td.title > a'; # список релизов

has check_master => sub { shift->model->sth('id master') };
has check_new_master => sub { shift->model->sth('id мастера_новые') };
has save_master_new => sub { shift->model->sth('new мастера_новые')};

# три хаза переопределяет Release.pm
has latest_save => sub { shift->save_master_new }; # POS
has check_full => sub { shift->check_master }; # POS
has check_new => sub { shift->check_new_master };# POS

has check_release => sub { shift->model->sth('id release') };
has check_new_release => sub { shift->model->sth('id релизы_новые') };
has save_release_new => sub { shift->model->sth('new релизы_новые')};
has master_new => sub { shift->model->sth('new master') };
has del_master_new => sub { shift->model->sth('del мастера_новые') };


# собрать все новые ссылки 
# используется для мастеров и релизов!
sub latest {
  my $self = shift;
  my $ua = $self->ua;

  my $p=1;
  PAGE: while ( my $url = $self->base_url.$self->latest_url.$p++ ) {
    print "Страница [$url]...";
    my $res = $ua->request('get', $url,);
    unless (ref $res) {
      print $res, "\n";
      last
        if $res =~ m'^4';
      say "\t\tПовторный заход";
      redo;
    }
    print "OK\n----------------\n";
    
    my $dom = $res->dom;
    my @href = map $_->attr('href'), $dom->find($self->latest_css)->each
      or die "Не нашел ссылки [@{[$self->latest_css]}]";#
    
    my @new = (); # если не одной новой записи из 250 тогда полный выход
    for my $href (@href) {
      my $id = ($href =~ /(\d+)$/)[0];
      
      say "=== Дошел до наших записей [$id] ==="
        and last PAGE
        if $self->dbh->selectrow_hashref($self->check_full, undef, ($id));
      
      #~ say "пропустил [$id], уже есть в новых"
      push @new, 0
        and next
        if $self->dbh->selectrow_hashref($self->check_new, undef, ($id));
      
      my $new = $self->dbh->selectrow_hashref($self->latest_save, undef, ($id, $href));
      say "\tновый [@{[%$new]}]";
      push @new, 1;
      
    }
    say "=== Останов: последние 3 позиции в списке не новые ==="
      and last
      unless scalar grep $_, @new[-3..-1];
  }
  
  return $self;
}

sub new_masters {
=pod

=head2 new_masters

Обработка списка первого бота по мастерам (->latest)

1. Берем список таблицы мастера_новые

2. По урлу мастера взять список div#m_versions (table#versions). Пока формат версии пофиг. Формат точно обработает бот по релизам.

tr td.title a

3. Проверить релизы в check_full & check_new

4. Сохранить в ПОС 'new релизы_новые'

5. сохранить в ПОС 'new master'. main_release это первый в таблице версий.

=cut
  my $self = shift;
  my %arg = @_;
  #~ my $limit = shift || 100;

  my $sth = $self->model->sth('по списку мастера_новые', limit=>'limit ?');
  $sth->execute($arg{limit});
  
  my $n=1;
  MASTER: while ( my $row = $sth->fetchrow_hashref ) {
    print $n++, '. ';
    
    $self->master($row);
      #~ or redo;

    sleep $arg{timeout}
      if $arg{timeout};
  }
  
  return $n;
}

sub master {# обработать мастер по строке мастера_новые
  my ($self, $row) = @_;
  my $ua = $self->ua;
  my $dbh = $self->dbh;
  
  my $url = $self->base_url . $row->{url};
  print "Мастер [$url]...";
  my $res = $ua->request('get', $url,);
  
  unless (ref $res) {
    print $res, "\n";
    
    say "Почикал новый мастер [$row->{id}]"
      and return $dbh->selectrow_hashref($self->del_master_new, undef, ($row->{id},))
      if $res eq '404';
    
    die "Ошибка HTTP [$res]";
    
    #~ return 
      #~ if $res =~ m'^4';
    say "\t\tПовторный заход";
    sleep 1;
    return undef;
  }
  say "OK";
  my $dom = $res->dom;
  my @href = map $_->attr('href'), $dom->find($self->master_versions_css)->each
    or die "Не нашел ссылки [@{[$self->master_versions_css]}]";#
  
  my $main_release;
  local $dbh->{AutoCommit};
  for my $href (@href) { # версии/релизы
    my $id = ($href =~ /(\d+)$/)[0];
    
    $main_release ||= $id;
    
    say "Релиз [$id] обработан"
      and next
      if $dbh->selectrow_hashref($self->check_release, undef, ($id));
    
    if ( $dbh->selectrow_hashref($self->check_new_release, undef, ($id)) ) {
      say "Релиз [$id] есть в таблице релизы_новые";
      next;
    } else {
      my $new = $dbh->selectrow_hashref($self->save_release_new, undef, ($id, $href));
      say "\tновый релиз [@{[%$new]}]";
    }
  }
  my $new;
  ($new = $dbh->selectrow_hashref($self->master_new, undef, ($row->{id}, $main_release, )))
    and say "\tобработан мастер [@{[ @$new{qw(aid id main_release ts)} ]}]"
    and $dbh->commit
    and return $new
    if $main_release;

  die " мастер [@{[%$row]}] без релизов/версий";
}

1;