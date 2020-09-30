my $docs = $c->stash('docs');
my $param = $c->stash('param');

map {
  my $item = $_;
  map {
    
    div({-style=>"",},
      span({-style=>""}, $_->{'номенклатура'}),
      span({-style=>"font-weight:bold; padding:0.3rem 0.7rem; border-radius:1rem; background-color:#e4e4e4;"},$_ ->{'сумма'}),
    );
  } @{$item->{'@позиции'}};
  
} @$docs;

#~ for my $item () {
  #~ % for my $pos (@{$item->{'@позиции'}})
#~ <div><span style="">{%= join '', @{$pos->{'номенклатура'}} %}</span> <span>{%= $pos->{'сумма'} %}</span></div>
#~ % }