package Discogs::Label;
use Mojo::Base 'Discogs::Base';

=pod

                      Таблица "discogs.label"
   Колонка    |   Тип   |               Модификаторы               
--------------+---------+------------------------------------------
 aid          | integer | NOT NULL DEFAULT nextval('id'::regclass)
 id           | integer | NOT NULL
 name         | text    | NOT NULL
 contactinfo  | text    | 
 profile      | text    | 
 parent_label | text    | бот вставит aid!
 sublabels    | text[]  | бот вставит массив aid!
 urls         | text[]  | 
 data_quality | text    | 
Индексы:
    "label_pkey" PRIMARY KEY, btree (aid)
    "label_id_idx" UNIQUE, btree (id)
    "label_lower_idx" btree (lower(name))
    "label_name_idx" btree (name)


=cut

sub label_link {# разбор сслылки 
  my $self = shift;
  my $link = shift
    or return;

  #~ my %data = (
    #~ label => $link->all_text,
  my $label_id = ($link->attr('href') =~ m|/label/(\d+)|)[0];
    
  #~ );
  
  #~ $self->get_label($_->attr('href'))
  my $label = $self->model->label_id($label_id)
    || $self->new_label($link->attr('href'), $label_id)
    if $label_id;# && !$self->model->label_id($data{label_id});
  
  #~ $data{label_aid} = $label->{aid}
    #~ if $label;
  
  my $next = $link->next_node;
  $label->{catno} = $next->content =~ s/\s*‎–\s*|^\s+|\s*,*\s*$//gr#(map $_ =~ s/^\s+|\s*,?$//gr, grep /\S+/, split //, $next->content)[0]
    if $next && !$next->tag;
  
  $label;

}

sub new_label {
  my ($self, $href, $label_id,) = @_;
  my $url = $self->base_url . $href;
  #~ print "\tНовый артист [$url]...";
  my $res = $self->ua->request('get', $url,);
  
  unless (ref $res) {
    print $res, "\n";
    
    die "Ошибка HTTP [$res]";
  }
  say "OK";
  my $dom = $res->dom;
  my $h1 = $dom->at('div.profile h1')
    or return {};
  my %data = (id=>$label_id, name=>$h1->all_text =~ s/^\s+|\s+$//gr);
  
  my %col_map = (sites=>'urls', parentlabel=>'parent_label',);
  
  for my $head ($dom->find('div.profile > div.head')->each) {
    my $meth = lc($head->text =~ s/\W//gr);
    $data{$col_map{$meth} || $meth} = $self->$meth($head->next)
      if $self->can($meth);# && $head->next_node;
  }
  $self->model->label_and_update(['id'], %data);
  
}

sub profile {
  my ($self, $dom) = @_;
  $dom->all_text =~ s/^\s+|\s+$//gr;
}

sub sublabels {
  my ($self, $dom) = @_;
  [$dom->find('a')->map(sub {
    #~ my $data = $self->artist_link($_);
    #~ $data->{aid};
    my $label_id = ($_->attr('href') =~ m|/label/(\d+)|)[0];
    my $name = $_->all_text;
    $self->model->label(['id'], id=>$label_id, name=>$name)->{aid};
    
  })->each];
  
}

sub parentlabel {
  shift->sublabels(@_)->[0];
}

1;