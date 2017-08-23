$c->layout('print', handler=>'ep', );

h2({}, 'Квитки общего списка сотрудников'),
div({-style=>"white-space:pre-wrap;"}, $c->dumper($c->stash('данные'))),