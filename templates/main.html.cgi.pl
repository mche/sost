main(
#~ div({-class=>"row",},
  #~ div({-class=>"col s12 m4 l2",},#><!--  left panel  -->
    #~ div({-class=>"container",}, $c->content('main.left'),),
  #~ ),
  #~ div({-class=>"col s12 m8 l10",},
    div({-class=>"container clearfix",}, $c->content,),
  #~ ),
),
#~ ),