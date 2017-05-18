use Mojo::Base -strict;
[
[route=>'/', to=>'main#index', name=>'home',],
[route=>'/waltex', to=>'waltex#index', name=>'waltex',],
[route=>'/waltex/money/save', to=>'Waltex::Money#save', name=>'сохранить движение ДС',],
[route=>'/waltex/money/delete/:id', to=>'Waltex::Money#delete', name=>'удалить запись движения ДС',],
[route=>'/waltex/money/data/:id', to=>'Waltex::Money#data', name=>'строка движения ДС',],
[route=>'/waltex/money/list/:project', to=>'Waltex::Money#list', name=>'список движения ДС',],
[route=>'/category/data', to=>'Category#data', name=>'категории/дерево и поиск',],
[route=>'/wallet/data/:project', to=>'Waltex::Wallet#data', name=>'список кошельков',],
[route=>'/contragent/data', to=>'Contragent#data', name=>'список контрагентов',],
[route=>'/project/list', to=>'Project#list', name=>'список проектов',],
[route=>'/project/save', to=>'Project#save', name=>'сохранить проект',],

[route=>'/waltex/report', to=>'Waltex::Report#index', name=>'отчет ДС',],
[route=>'/waltex/report/data', to=>'Waltex::Report#data', name=>'данные отчета ДС',],
[route=>'/waltex/report/row', to=>'Waltex::Report#row', name=>'строка отчета ДС',],
];