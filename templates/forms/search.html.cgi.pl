my $match = $c->match->endpoint;
return 
  if $match && (
    $match->name eq 'поиск транспорта'
    || $match->name eq 'форма новой заявки'
    || $match->name eq 'форма заявки'
    );
#~ start_form('get',  $c->url_for('search')),
#~ div({-class=>"card-panel teal lighten-4",}, #<!-- search-wrapper card-->
  div({-class=>"input-field",},# col s6 m6 l6
    #~ i({-class=>"material-icons prefix", -style=>"bottom:0;"}, 'search'),
    #~ textfield(-id=>"search", -name=>"q", -type=>"search"),
    q|<input type="search" id="search" name="q" class="autocomplete" placeholder="поиск транспорта">|,
    label({-for=>"search",}, i({-class=>"material-icons",}, 'search'), ),#'Поиск'
    #~ i({-class=>"material-icons",},'close'),
  ),
  div({-class=>"search-results",}, ''),
#~ ),
#~ end_form,
