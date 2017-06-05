use Mojo::Base -strict;
[

#~ [route=>'/', to=>'main#index', name=>'home',],

#~ [get=>'/profile', over=>{access=>{auth=>'only'}}, to=>'profile#index', name=>'profile'],
#~ [post=>'/profile', over=>{access=>{auth=>'only'}}, to=>'profile#save', name=>'профиль сохранить'],#save-profile
#~ [get=>'/profile/data', over=>{access=>{auth=>'only'}}, to=>'profile#data', name=>'данные профиля'],
#~ [route=>'/profile/sign', to=>'profile#sign', name=>'обычная авторизация/регистрация'],

#~ [route=>'/waltex', over=>{access=>{auth=>'only'}}, to=>'waltex#index', name=>'движение ДС',],
#~ [route=>'/waltex/money/save', over=>{access=>{auth=>'only'}}, to=>'Waltex::Money#save', name=>'сохранить движение ДС',],
#~ [route=>'/waltex/money/delete/:id', over=>{access=>{auth=>'only'}}, to=>'Waltex::Money#delete', name=>'удалить запись движения ДС',],
#~ [route=>'/waltex/money/data/:id', over=>{access=>{auth=>'only'}}, to=>'Waltex::Money#data', name=>'строка движения ДС',],
#~ [route=>'/waltex/money/list/:project', over=>{access=>{auth=>'only'}}, to=>'Waltex::Money#list', name=>'список движения ДС',],

#~ [route=>'/category/data', to=>'Category#data', name=>'категории/дерево и поиск',],
#~ [route=>'/wallet/data/:project', to=>'Waltex::Wallet#data', name=>'список кошельков',],
#~ [route=>'/contragent/data', to=>'Contragent#data', name=>'список контрагентов',],
#~ [route=>'/project/list', to=>'Project#list', name=>'список проектов',],
#~ [route=>'/project/save', over=>{access=>{auth=>'only'}}, to=>'Project#save', name=>'сохранить проект',],

#~ [route=>'/waltex/report', over=>{access=>{auth=>'only'}}, to=>'Waltex::Report#index', name=>'отчет ДС',],
#~ [route=>'/waltex/report/data', over=>{access=>{auth=>'only'}}, to=>'Waltex::Report#data', name=>'данные отчета ДС',],
#~ [route=>'/waltex/report/row', over=>{access=>{auth=>'only'}}, to=>'Waltex::Report#row', name=>'строка отчета ДС',],


[route=>'/админка/доступ', over=>{access=>{auth=>'only'}}, to=>'Access#index', name=>'управление доступом',],
[route=>'/админка/доступ/список/пользователи', over=>{access=>{auth=>'only'}}, to=>'Access#users', name=>'доступ/список пользователей',],
[route=>'/админка/доступ/список/роли', over=>{access=>{auth=>'only'}}, to=>'Access#roles', name=>'доступ/список ролей',],
[route=>'/админка/доступ/список/маршруты', over=>{access=>{auth=>'only'}}, to=>'Access#routes', name=>'доступ/список маршрутов',],
[route=>'/админка/доступ/сохранить пользователя', over=>{access=>{auth=>'only'}}, to=>'Access#user_save', name=>'доступ/сохранить пользователя',],
[route=>'/админка/доступ/сохранить роль', over=>{access=>{auth=>'only'}}, to=>'Access#save_role', name=>'доступ/сохранить роль',],
[route=>'/админка/доступ/сохранить маршрут', over=>{access=>{auth=>'only'}}, to=>'Access#save_route', name=>'доступ/сохранить маршрут',],
[route=>'/админка/доступ/пользователи роли/:role', over=>{access=>{auth=>'only'}}, to=>'Access#role_users', name=>'доступ/пользователи роли',],
[route=>'/админка/доступ/маршруты роли/:role', over=>{access=>{auth=>'only'}}, to=>'Access#role_routes', name=>'доступ/маршруты роли',],
[route=>'/админка/доступ/роли пользователя/:user', over=>{access=>{auth=>'only'}}, to=>'Access#user_roles', name=>'доступ/роли пользователя',],
[route=>'/админка/доступ/маршруты пользователя/:user', over=>{access=>{auth=>'only'}}, to=>'Access#user_routes', name=>'доступ/маршруты пользователя',],
[route=>'/админка/доступ/роли маршрута/:route', over=>{access=>{auth=>'only'}}, to=>'Access#route_roles', name=>'доступ/роли маршрута',],
[route=>'/админка/доступ/пользователи маршрута/:route', over=>{access=>{auth=>'only'}}, to=>'Access#route_users', name=>'доступ/пользователи маршрута',],
[route=>'/админка/доступ/сохранить связь/:id1/:id2', over=>{access=>{auth=>'only'}}, to=>'Access#связь', name=>'админка/доступ/сохранить связь',],
[route=>'/админка/доступ/выгрузить маршруты', over=>{access=>{auth=>'only'}}, to=>'Access#routes_download', name=>'админка/доступ/выгрузить маршруты',],
[route=>'/админка/доступ/загрузить маршруты', over=>{access=>{auth=>'only'}}, to=>'Access#routes_upload', name=>'админка/доступ/загрузить маршруты',],
#~ [route=>'/waltex/report/data/wallets', to=>'Waltex::Report#data_wallets', name=>'данные отчета ДС/все кошельки',],
#~ [route=>'/waltex/report/row/wallets', to=>'Waltex::Report#row_wallets', name=>'строка отчета ДС/все кошельки',],
];