my $docs = $c->stash('docs');
my $param = $c->stash('param');

(map {
  my $item = $_;
  map {
    
    div({-style=>"",},
      span({-style=>""}, $_->{'номенклатура'}),
      span({-style=>"font-weight:bold; padding:0.3rem 0.7rem; border-radius:1rem; background-color:#e4e4e4;"},$_ ->{'сумма'}),
    );
  } @{$item->{'@позиции'}};
  
} @$docs),

#~ for my $item () {
  #~ % for my $pos (@{$item->{'@позиции'}})
#~ <div><span style="">{%= join '', @{$pos->{'номенклатура'}} %}</span> <span>{%= $pos->{'сумма'} %}</span></div>
#~ % }

div("---"),
div({},
<<END_TEXT
Эта электронная почта используется для рассылки документов и дополнительной информации. Для обратной связи с арендодателем просим Вас отправлять письма на <strong>@{[ $param->{garantia}{реквизиты}{email} || ' емэйл "Гарантия" ' ]}</strong>. Звонить по телефону <strong>@{[ $param->{garantia}{реквизиты}{'тел 2'}[0]  ]}</strong>.
END_TEXT
),
div({},
"Подписаные акты просим передавать в офис 312 или на пост охраны.",
),