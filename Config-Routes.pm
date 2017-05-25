use Mojo::Base -strict;
[

[route=>'/', to=>'main#index', name=>'home',],

[get=>'/profile', to=>'profile#index', name=>'profile'],
#~ [post=>'/profile', over=>{access=>{auth=>'only'}}, to=>'profile#save', name=>'профиль сохранить'],#save-profile
#~ [get=>'/profile/data', over=>{access=>{auth=>'only'}}, to=>'profile#data', name=>'данные профиля'],
[route=>'/profile/sign', to=>'profile#sign', name=>'обычная авторизация/регистрация'],

[route=>'/waltex', over=>{access=>{auth=>'only'}}, to=>'waltex#index', name=>'движение ДС',],
[route=>'/waltex/money/save', over=>{access=>{auth=>'only'}}, to=>'Waltex::Money#save', name=>'сохранить движение ДС',],
[route=>'/waltex/money/delete/:id', over=>{access=>{auth=>'only'}}, to=>'Waltex::Money#delete', name=>'удалить запись движения ДС',],
[route=>'/waltex/money/data/:id', over=>{access=>{auth=>'only'}}, to=>'Waltex::Money#data', name=>'строка движения ДС',],
[route=>'/waltex/money/list/:project', over=>{access=>{auth=>'only'}}, to=>'Waltex::Money#list', name=>'список движения ДС',],
[route=>'/category/data', to=>'Category#data', name=>'категории/дерево и поиск',],
[route=>'/wallet/data/:project', to=>'Waltex::Wallet#data', name=>'список кошельков',],
[route=>'/contragent/data', to=>'Contragent#data', name=>'список контрагентов',],
[route=>'/project/list', to=>'Project#list', name=>'список проектов',],
[route=>'/project/save', over=>{access=>{auth=>'only'}}, to=>'Project#save', name=>'сохранить проект',],

[route=>'/waltex/report', over=>{access=>{auth=>'only'}}, to=>'Waltex::Report#index', name=>'отчет ДС',],
[route=>'/waltex/report/data', over=>{access=>{auth=>'only'}}, to=>'Waltex::Report#data', name=>'данные отчета ДС',],
[route=>'/waltex/report/row', over=>{access=>{auth=>'only'}}, to=>'Waltex::Report#row', name=>'строка отчета ДС',],


[route=>'/админка/доступ', over=>{access=>{auth=>'only'}}, to=>'Access#index', name=>'управление доступом',],
[route=>'/админка/доступ/список/пользователи', over=>{access=>{auth=>'only'}}, to=>'Access#users', name=>'список пользователей',],
[route=>'/админка/доступ/список/роли', over=>{access=>{auth=>'only'}}, to=>'Access#roles', name=>'список ролей',],
[route=>'/админка/доступ/список/маршруты', over=>{access=>{auth=>'only'}}, to=>'Access#routes', name=>'список маршрутов',],
[route=>'/админка/доступ/сохранить пользователя', over=>{access=>{auth=>'only'}}, to=>'Access#user_save', name=>'сохранить пользователя',],
#~ [route=>'/waltex/report/data/wallets', to=>'Waltex::Report#data_wallets', name=>'данные отчета ДС/все кошельки',],
#~ [route=>'/waltex/report/row/wallets', to=>'Waltex::Report#row_wallets', name=>'строка отчета ДС/все кошельки',],
];