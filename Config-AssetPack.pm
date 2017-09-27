use Mojo::Base -strict;
[ # cpanm JavaScript::Minifier::XS CSS::Sass CSS::Minifier::XS
  'AssetPack::Che' => {
    pipes => [qw(Sass Css JavaScript HTML CombineFile)],
    CombineFile => {
      version=>"2017-09-27 18:03",
      #~ url_lines =>{# только для morbo
        #~ 'js/controllers/profile/form-auth.html'=> "@@@ profile/form-auth",
        #~ 'js/c/waltex/money/work.html'=> "@@@ money/work",
        #~ 'js/c/waltex/money/form.html'=>"@@@ money/form",
        #~ 'js/c/category/tree.html'=>"@@@ category/tree",
        #~ 'js/c/category/item.html'=>"@@@ category/item",
        #~ 'js/c/wallet/item.html'=>"@@@ wallet/item",
        #~ 'js/c/contragent/item.html'=>"@@@ contragent/item",
        #~ 'js/c/waltex/money/table.html'=>"@@@ money/table",
        #~ 'js/c/project/list.html'=>"@@@ project/list",
        #~ 'js/controllers/date/between.html'=>"@@@ date/between",
        #~ 'js/c/waltex/report/form.html' => "@@@ report/form",
        #~ 'js/c/waltex/report/table.html' => "@@@ report/table",
        #~ 'js/c/waltex/report/wallets.html'=>"@@@ report/table/wallets",
        #~ 'js/c/access/users.html'=>"@@@ access/users/list",
        #~ 'js/c/access/roles.html'=>"@@@ access/roles/list",
        #~ 'js/c/access/routes.html'=>"@@@ access/routes/list",
        #~ 'js/c/waltex/report/row.html' => "@@@ report/row",
      #~ },
      gzip => {min_size => 1000},
    },
    HTML => {minify_opts=>{remove_newlines => 0,}},# чета при удалении переводов строк  проблемы
    process => [# хэшреф убрал для последовательности
      
      ['materialize.js'=>grep !/^#/, qw(
      
        lib/materialize/js/initial.js
        lib/materialize/js/jquery.easing.1.3.js
        lib/materialize/js/animation.js
        lib/materialize/js/velocity.min.js
        lib/materialize/js/global.js

        lib/materialize/js/hammer.min.js
        lib/materialize/js/jquery.hammer.js

        lib/materialize/js/modal.js

        lib/materialize/js/tabs.js

        lib/materialize/js/waves.js

        lib/materialize/js/sideNav.js

        lib/materialize/js/forms.js
        
        lib/materialize/js/dropdown.js
        lib/materialize/js/toasts.js
#lib/materialize/js/collapsible.js
      )],
      
      ['datetime.picker.js'=> grep !/^#/, qw(
#внимание-минификация-через-uglify-нет-точек-с-запятой
#-хе-новая-версия-прошла
        lib/materialize/js/date_picker/picker.min.js
#-делал-исправления-в-материализованном-календаре-по-отображению-месяца-и-навигации
        lib/materialize/js/date_picker/picker.date.min.js
#не-материализ!
        lib/materialize/js/date_picker/picker.time.min.js
        lib/materialize/js/date_picker/ru_RU.js
      
      )],
      
      ['lib.js'=> grep !/^#/, qw(
        lib/angular/angular.js
        lib/jquery/dist/jquery.min.js
        #lib/angular-cookies/angular-cookies.js
        materialize.js
        js/controllers/template-cache/script.js
        js/jquery.autocomplete.js
        js/jquery.autocomplete.options.js
        lib/date-fns/dist/date_fns.js
        js/date-fns.locale.ru.js
        datetime.picker.js
        ),
      ],
      
      ['profile/form-auth.html'=>qw(
      js/controllers/profile/form-auth.html
      )],
      ['profile/form-auth.js' => grep !/^#/, qw(
        #"lib/angular-md5/angular-md5.js"
        #lib/jquery-md5/jquery.md5.js
        lib/nano-md5/md5.js
        #js/controllers/phone-input/phone-input.js
        #c/profile/lib.js
        js/controllers/profile/form-auth.js
        
        )],
      
      ['main.js' => grep !/^#/, qw(
        js/version.js
        js/main.js
        js/app.js
        js/routes.js
        js/user.js
        #в_main_js/config.js
        profile/form-auth.js
        ),
      
      ],
      [ 'main.css'=> grep !/^#/, qw(
        https://fonts.googleapis.com/icon?family=Material+Icons
        https://fonts.googleapis.com/css?family=Roboto:400,700
        sass/main.scss
        css/fontello/fontello.css
        
        ),
      ],#


      ['date-between.js'=> grep !/^#/, qw(
      #lib/date-fns/dist/date_fns.js
      #datetime.picker.js
      js/controllers/date/between.js
      )],
      #~ ['date-between.html'=>qw(    #~ )],
      
      ['waltex/money.html'=> grep !/^#/, qw(
      js/c/tree/item.html
      js/c/tree/list.html
      js/c/wallet/item.html
      js/c/contragent/item.html
      js/c/project/list.html
      js/c/waltex/money/form.html
      js/c/waltex/money/table.html
      js/controllers/date/between.html
      js/c/profile/item.html
      
      )],
      ['waltex/money.js'=> grep !/^#/, qw(
      js/c/tree/item.js
      js/c/tree/list.js
      js/c/wallet/item.js
      js/c/contragent/item.js
      js/c/project/list.js
      #js/c/waltex/money/work.js
      js/c/waltex/money/table.js
      js/c/waltex/money/form.js
      js/c/profile/item.js
      lib/angular-drag-and-drop-lists/angular-drag-and-drop-lists.js
      #datetime.picker.js
      date-between.js
      
      )],
      
      ['waltex/report.html'=> grep !/^#/, qw(
      js/c/project/list.html
      js/c/waltex/report/form.html
      js/c/waltex/report/table.html
      #js/c/waltex/report/row.html
      js/controllers/date/between.html
      #js/c/waltex/report/wallets.html
      
      #форма-модально
      js/c/tree/item.html
      js/c/tree/list.html
      js/c/wallet/item.html
      js/c/contragent/item.html
      js/c/waltex/money/form.html
      js/c/profile/item.html
      
      )],
      ['waltex/report.js'=> grep !/^#/, qw(
      js/c/project/list.js
      js/c/waltex/report/form.js
      js/c/waltex/report/table.js
      #js/c/waltex/report/wallets.js
      #js/c/waltex/report/row.js
      #lib/date-fns/dist/date_fns.js
      date-between.js
      js/util/array-splice.js
      
      #!!показ_позиции_в_форме
      js/c/tree/item.js
      js/c/tree/list.js
      js/c/wallet/item.js
      js/c/contragent/item.js
      js/c/profile/item.js
      js/c/waltex/money/form.js
      #datetime.picker.js
      
      )],
      
        
        ['admin/access.html' => grep !/^#/, qw(
        js/c/access/users.html
        js/c/access/roles.html
        js/c/access/routes.html
        
        )],
        ['admin/access.js' => grep !/^#/, qw(
        js/c/access/users.js
        js/c/access/roles.js
        js/c/access/routes.js
        js/c/access/controll.js
        
        )],
        
        ['timework/form.html' => grep !/^#/, qw(
        js/c/object/my.html
        js/c/timework/form.html
        
        )],
        ['timework/form.js' => grep !/^#/, qw(
        js/c/timework/controll.js
        js/c/timework/form.js
        js/c/object/my.js
        #lib/date-fns/dist/date_fns.js
        #js/date-fns.locale.ru.js
        #datetime.picker.js
        #lib/datatables.net-fixedcolumns/js/dataTables.fixedColumns.js
        )],
        ['timework/report.html' => grep !/^#/, qw(
        js/c/timework/report.html
        js/c/object/my.html
        #из_детализации_работать_с_движением_ДС_по_сотруднику
        waltex/money.html
        js/c/timework/pay-form.html
        
        )],
        ['timework/report.js' => grep !/^#/, qw(
        js/c/timework/report.js
        js/c/object/my.js
        #lib/date-fns/dist/date_fns.js
        #js/date-fns.locale.ru.js
        #datetime.picker.js
        #из_детализации_работать_с_движением_ДС_по_сотруднику
        waltex/money.js
        js/c/timework/pay-form.js
        )],
        
        ['timework/report-obj.html' => grep !/^#/, qw(
        js/c/timework/report-obj.html
        
        )],
        ['timework/report-obj.js' => grep !/^#/, qw(
        lib/angular-toArrayFilter/toArrayFilter.js
        js/c/timework/report-obj.js
        )],
        
        ['timework/report-print.html' => grep !/^#/, qw(
        js/c/timework/report-print.html
        
        )],
        ['timework/report-print.js' => grep !/^#/, qw(
        js/c/timework/report-print.js
        )],
        
        ['tmc/ask.html' => grep !/^#/, qw(
        js/c/tree/item.html
        js/c/tree/list.html
        js/c/tmc/ask-form.html
        js/c/tmc/ask-table.html
        js/c/object/my.html
        js/controllers/date/between.html
        
        )],
        ['tmc/ask.js' => grep !/^#/, qw(
        js/c/tree/item.js
        js/c/tree/list.js
        js/c/tmc/ask-form.js
        js/c/tmc/ask-table.js
        js/c/tmc/ask.js
        js/c/object/my.js
        date-between.js
        )],
        ['tmc/ask-snab.html' => grep !/^#/, qw(
        js/c/tree/item.html
        js/c/tree/list.html
        js/c/contragent/item.html
        js/c/tmc/ask-snab-form.html
        js/c/tmc/ask-snab-table.html
        js/c/object/my.html
        js/controllers/date/between.html
        
        )],
        ['tmc/ask-snab.js' => grep !/^#/, qw(
        js/c/tree/item.js
        js/c/tree/list.js
        js/c/contragent/item.js
        js/c/tmc/ask-snab-form.js
        js/c/tmc/ask-snab-table.js
        js/c/tmc/ask-snab.js
        js/c/object/my.js
        date-between.js
        )],
        ['transport/ask.html' => grep !/^#/, qw(
        js/c/tree/item.html
        js/c/tree/list.html
        js/c/transport/ask-form.html
        js/c/transport/ask-table.html
        js/controllers/date/between.html
        js/c/contragent/item.html
        #js/c/project/item.html
        #водитель
        js/c/transport/driver.html
        js/c/transport/obj+addr2.html
        js/c/transport/item.html
        js/controllers/date/between.html
        js/c/transport/ask-work.html
        )],
        ['transport/ask.js' => grep !/^#/, qw(
        js/c/tree/item.js
        js/c/tree/list.js
        js/c/transport/ask-form.js
        js/c/transport/ask-table.js
        js/c/transport/ask.js
        date-between.js
        js/c/contragent/item.js
        #js/c/project/item.js
        #водитель
        js/c/transport/driver.js
        js/c/transport/obj+addr2.js
        js/c/transport/item.js
        date-between.js
        js/c/transport/ask-work.js
        )],
        ['transport/ask-work.html' => grep !/^#/, qw(
        js/c/transport/ask-work.html
        
        )],
        ['transport/ask-work.js' => grep !/^#/, qw(
        js/c/transport/ask-work.js
        
        )],
        
    ],
  },
];