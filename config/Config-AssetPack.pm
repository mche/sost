use Mojo::Base -strict;
use Mojo::Util qw(encode);
[ # cpanm JavaScript::Minifier::XS CSS::Sass CSS::Minifier::XS
  'AssetPack::Che' => {
    pipes => [qw(Sass Css JavaScript HTML CombineFile)],
    CombineFile => {
      #~ version=>"2017-10-09T10:03",
      gzip => {min_size => 1000},
    },
    HTML => {minify_opts=>{remove_newlines => 1,}},# чета при удалении переводов строк  проблемы
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
        #lib/vue/dist/vue.runtime.min.js
        #lib/angular-cookies/angular-cookies.js
        materialize.js
        js/c/template-cache/script.js
        js/jquery.autocomplete.js
        js/jquery.autocomplete.options.js
        lib/date-fns/dist/date_fns.js
        js/date-fns.locale.ru.js
        datetime.picker.js
        
        ),
      ],
      
      ['medcol/main.js' => grep !/^#/, qw(
      lib/jquery/dist/jquery.min.js
      js/jquery.autocomplete.js
      js/jquery.autocomplete.options.js
      #materialize.js
      js/medcol.js
      )],
      
      ['profile/form-auth.html'=>qw(
      js/c/profile/form-auth.html
      )],
      ['profile/form-auth.js' => grep !/^#/, qw(
        #"lib/angular-md5/angular-md5.js"
        #lib/jquery-md5/jquery.md5.js
        lib/nano-md5/md5.js
        #js/controllers/phone-input/phone-input.js
        #c/profile/lib.js
        js/c/profile/form-auth.js
        
        )],
      
      #глобальная подборка
      ['main.js' => grep !/^#/, qw(
        #js/version.js
        js/main.js
        js/util.js
        js/routes.js
        #js/user.js
        #в_main_js/config.js
        profile/form-auth.js
        js/svg.js
        #js/util/object-watch.js
        #js/util/watch-object.js
        js/util/array-pushself.js
        #в_конце!!!
        js/global-modules.js
        js/app.js
        ),
      
      ],
       [ 'animate.css'=> grep !/^#/, qw(
        lib/animate.css/source/_base.css
        lib/animate.css/source/attention_seekers/flash.css
        lib/animate.css/source/zooming_entrances/zoomIn.css
        lib/animate.css/source/zooming_entrances/zoomInUp.css
        lib/animate.css/source/zooming_entrances/zoomInDown.css
        lib/animate.css/source/zooming_exits/zoomOut.css
        lib/animate.css/source/zooming_exits/zoomOutUp.css
        lib/animate.css/source/zooming_exits/zoomOutDown.css
        lib/animate.css/source/sliding_entrances/slideInUp.css
        lib/animate.css/source/sliding_entrances/slideInDown.css
        lib/animate.css/source/sliding_entrances/slideInRight.css
        lib/animate.css/source/sliding_entrances/slideInLeft.css
        
        #lib/animate.css/source/bouncing_entrances/bounceIn.css
        lib/animate.css/source/fading_entrances/fadeIn.css
        #lib/animate.css/source/fading_exits/fadeOut.css
       
       )],
      [ 'main.css'=> grep !/^#/, qw(
        ###https://fonts.googleapis.com/icon?family=Material+Icons
        #fonts/material-icons/material-icons.css
        ###https://fonts.googleapis.com/css?family=Roboto+Condensed:300,400,400i,700,700i|Roboto:100,100i,300,300i,400,400i,500,500i,700,700i,900,900i&subset=cyrillic,cyrillic-ext,latin-ext&effect=3d-float
        ###https://fonts.googleapis.com/css?family=Roboto+Condensed:300,400,700&amp;subset=cyrillic,cyrillic-ext
        #css/fontello/fontello.css
        animate.css
        sass/main.scss
        #css/main.css
        ),
      ],# static/sass $ sass --watch main.scss:../css/main.css


      ['date-between.js'=> grep !/^#/, qw(
      #lib/date-fns/dist/date_fns.js
      js/c/date/between.js
      )],
      #~ ['date-between.html'=>qw(    #~ )],
      
      ['waltex/money.html'=> grep !/^#/, qw(
      js/c/tree/item.html
      js/c/tree/list.html
      js/c/wallet/item.html
      js/c/contragent/item.html
      js/c/project/list.html
      js/c/transport/obj+addr.html
      js/c/waltex/money/form.html
      js/c/waltex/money/table.html
      js/c/date/between.html
      js/c/profile/item.html
      
      )],
      ['waltex/money.js'=> grep !/^#/, qw(
      js/c/tree/item.js
      js/c/tree/list.js
      js/c/wallet/item.js
      js/c/contragent/data.js
      js/c/contragent/item.js
      js/c/project/list.js
      js/c/transport/obj+addr.js
      #js/c/waltex/money/work.js
      js/c/waltex/money/table.js
      js/c/waltex/money/form.js
      js/c/profile/item.js
      lib/angular-drag-and-drop-lists/angular-drag-and-drop-lists.js
      date-between.js
      
      )],
      
      ['waltex/report.html'=> grep !/^#/, qw(
      js/c/project/list.html
      js/c/waltex/report/form.html
      js/c/waltex/report/table.html
      #js/c/waltex/report/row.html
      js/c/date/between.html
      #js/c/waltex/report/wallets.html
      js/c/transport/obj+addr.html
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
      js/c/transport/obj+addr.js
      #!!показ_позиции_в_форме
      js/c/tree/item.js
      js/c/tree/list.js
      js/c/wallet/item.js
      js/c/contragent/data.js
      js/c/contragent/item.js
      js/c/profile/item.js
      js/c/waltex/money/form.js
      
      )],
      
      ['lib/fileupload.js'=>qw(
        lib/blueimp-file-upload/js/vendor/jquery.ui.widget.js
        lib/blueimp-file-upload/js/jquery.fileupload.js
      )],
        
        ['admin/access.html' => grep !/^#/, qw(
        js/c/access/users.html
        js/c/access/roles.html
        js/c/access/routes.html
        
        )],
        ['admin/access.js' => grep !/^#/, qw(
        #lib/fileupload.js_в_контроллере
        #lib/angular-fallback-src/fallback-src.js
        js/util/sprintf.js
        js/c/access/users.js
        js/c/access/roles.js
        js/c/access/routes.js
        js/c/access/controll.js
        )],
        ['staff/сотрудники.js' => grep !/^#/, qw(
        #lib/fileupload.js_в_контроллере
        #lib/angular-fallback-src/fallback-src.js
        js/c/access/users.js
        js/c/access/roles.js
        js/c/staff/сотрудники.js
        )],
        ['staff/сотрудники.html' => grep !/^#/, qw(
        js/c/access/users.html
        js/c/access/roles.html
        
        )],
        
        ['timework/form.html' => grep !/^#/, qw(
        js/c/object/select.html
        js/c/timework/form.html
        
        )],
        ['timework/form.js' => grep !/^#/, qw(
        js/c/timework/controll.js
        js/c/timework/form.js
        js/c/object/select.js
        #lib/date-fns/dist/date_fns.js
        #js/date-fns.locale.ru.js
        #lib/datatables.net-fixedcolumns/js/dataTables.fixedColumns.js
        )],
        ['timework/report.html' => grep !/^#/, qw(
        js/c/timework/report.html
        js/c/object/select.html
        #из_детализации_работать_с_движением_ДС_по_сотруднику
        waltex/money.html
        js/c/timework/pay-form.html
        js/c/tree/item.html
        js/c/tree/list.html
        )],
        ['timework/report.js' => grep !/^#/, qw(
        js/c/timework/report-lib.js
        js/c/timework/report.js
        js/c/object/select.js
        #lib/date-fns/dist/date_fns.js
        #js/date-fns.locale.ru.js
        #из_детализации_работать_с_движением_ДС_по_сотруднику
        waltex/money.js
        js/c/timework/pay-form.js
        js/c/tree/item.js
        js/c/tree/list.js
        )],
        
        ['timework/calc-zp.html' => grep !/^#/, qw(
        js/c/timework/calc-zp.html
        js/c/object/select.html
        waltex/money.html
        js/c/timework/pay-form.html
        js/c/tree/item.html
        js/c/tree/list.html
        )],
        ['timework/calc-zp.js' => grep !/^#/, qw(
        js/c/timework/report-lib.js
        js/c/timework/calc-zp.js
        js/c/object/select.js
        waltex/money.js
        js/c/timework/pay-form.js
        js/c/tree/item.js
        js/c/tree/list.js
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
        
        ['timework/calc-zp-print.html' => grep !/^#/, qw(
        js/c/timework/calc-zp-print.html
        
        )],
        ['timework/calc-zp-print.js' => grep !/^#/, qw(
        js/c/timework/calc-zp-print.js
        )],
        
        ['tmc/ask.html' => grep !/^#/, qw(
        js/c/tree/item.html
        js/c/tree/list.html
        js/c/tmc/ask/ask-form.html
        js/c/tmc/ask/ask-table.html
        js/c/object/select.html
        js/c/date/between.html
        
        )],
        ['tmc/ask.js' => grep !/^#/, qw(
        js/c/tmc/ask/ask.js
        js/c/tree/item.js
        js/c/tree/list.js
        js/c/tmc/ask/ask-form.js
        js/c/tmc/ask/ask-table.js
        js/c/object/select.js
        date-between.js
        )],
        ['tmc/snab.html' => grep !/^#/, qw(
        js/c/tree/item.html
        js/c/tree/list.html
        js/c/contragent/item.html
        js/c/transport/ask-contact.html
        js/c/transport/obj+addr.html
        js/c/tmc/ask/ask-nomen-ost.html
        js/c/tmc/ask/ask-table.html
        js/c/tmc/snab/snab-form.html
        js/c/tmc/snab/snab-form-easy.html
        js/c/tmc/snab/snab-tabs.html
        js/c/tmc/snab/snab-table.html
        js/c/tmc/snab/snab-table-tmc.html
        js/c/tmc/ostat-table.html
        js/c/tmc/sklad/sklad-inv-form.html
        js/c/tmc/sklad/sklad-inv-table.html
        js/c/object/select.html
        js/c/date/between.html
        
        )],
        ['tmc/snab.js' => grep !/^#/, qw(
        js/c/tree/item.js
        js/c/tree/list.js
        js/c/contragent/data.js
        js/c/contragent/item.js
        js/c/transport/ask-contact.js
        js/c/transport/obj+addr.js
        js/c/tmc/form-lib.js
        js/c/tmc/snab/snab-form.js
        js/c/tmc/snab/snab-form-easy.js
        js/c/tmc/ask/ask-nomen-ost.js
        js/c/tmc/ask/ask-table.js
        js/c/nomen/lib.js
        js/c/tmc/tables-lib.js
        js/c/tmc/snab/snab-tabs.js
        js/c/tmc/snab/snab-table.js
        js/c/tmc/snab/snab-table-tmc.js
        js/c/tmc/ostat-table.js
        js/c/tmc/sklad/sklad-inv-form.js
        js/c/tmc/sklad/sklad-inv-table.js
        js/c/object/select.js
        date-between.js
        js/c/tmc/snab/snab.js
        )],
        ['tmc/baza.js' => grep !/^#/, qw(
        js/c/tmc/baza/baza.js
        js/c/tree/item.js
        js/c/tree/list.js
        js/c/contragent/data.js
        js/c/contragent/item.js
        js/c/transport/ask-contact.js
        js/c/transport/obj+addr.js
        js/c/tmc/form-lib.js
        js/c/tmc/baza/baza-form.js
        js/c/tmc/ask/ask-form.js
        js/c/nomen/lib.js
        js/c/tmc/tables-lib.js
        js/c/tmc/baza/baza-tabs.js
        js/c/tmc/snab/snab-table-tmc.js
        js/c/tmc/ostat-table.js
        js/c/tmc/snab/snab-table.js
        js/c/tmc/ask/ask-table.js
        js/c/tmc/snab/snab.js
        js/c/object/select.js
        date-between.js
        )],
         ['tmc/baza.html' => grep !/^#/, qw(
        js/c/tree/item.html
        js/c/tree/list.html
        js/c/contragent/item.html
        js/c/transport/ask-contact.html
        js/c/transport/obj+addr.html
        #js/c/tmc/baza/baza-form.html
        js/c/tmc/snab/snab-form.html
        js/c/tmc/ask/ask-form.html
        js/c/tmc/baza/baza-tabs.html
        js/c/tmc/snab/snab-table-tmc.html
        js/c/tmc/ostat-table.html
        js/c/tmc/snab/snab-table.html
        js/c/tmc/ask/ask-table.html
        js/c/object/select.html
        js/c/date/between.html
        
        )],

        ['tmc/sklad.js' => grep !/^#/, qw(
        #из-tmc/snab.js
        js/c/tree/item.js
        js/c/tree/list.js
        js/c/contragent/data.js
        js/c/contragent/item.js
        #js/c/transport/ask-contact.js
        js/c/transport/obj+addr.js
        js/c/tmc/form-lib.js
        #js/c/tmc/snab/snab-form.js
        js/c/tmc/snab/snab-form-easy.js
        js/c/tmc/ask/ask-ost-confirm.js
        js/c/tmc/ask/ask-table.js
        js/c/nomen/lib.js
        js/c/tmc/tables-lib.js
        #js/c/tmc/snab/snab-tabs.js
        js/c/tmc/snab/snab-table.js
        js/c/tmc/snab/snab-table-tmc.js
        js/c/tmc/ostat-table.js
        js/c/object/select.js
        date-between.js
        js/c/tmc/snab/snab.js
        ####после!
        js/c/tmc/sklad/sklad.js
        js/c/tmc/sklad/sklad-tabs.js
        js/c/tmc/sklad/sklad-inv-form.js
        js/c/tmc/sklad/sklad-inv-table.js
        js/c/tmc/baza/baza-form.js
        )],
         ['tmc/sklad.html' => grep !/^#/, qw(
         js/c/tmc/sklad/sklad-tabs.html
         #js/c/tmc/sklad/sklad-inv-form.html
         #js/c/tmc/sklad/sklad-inv-table.html
         #js/c/tmc/snab/snab-form.html
         js/c/tmc/ask/ask-ost-confirm.html
        tmc/snab.html
        
        )],
        
        ['transport/ask.html' => grep !/^#/, qw(
        js/c/tree/item.html
        js/c/tree/list.html
        js/c/transport/ask-form.html
        #да,таблицаТМЦ
        js/c/tmc/snab/snab-table-tmc.html
        js/c/transport/ask-table.html
        js/c/date/between.html
        js/c/contragent/item.html
        #js/c/project/item.html
        #водитель
        js/c/transport/ask-contact.html
        js/c/transport/obj+addr.html
        js/c/transport/item.html
        js/c/date/between.html
        js/c/transport/ask-work.html
        )],
        ['transport/ask.js' => grep !/^#/, qw(
        #lib/jquery.scrollTableBody/src/jquery.scrollTableBody-1.0.0.js
        js/c/tree/item.js
        js/c/tree/list.js
        js/c/transport/ask-form.js
        js/c/transport/ask-table.js
        js/c/tmc/snab/snab-table-tmc.js
        js/c/transport/ask.js
        date-between.js
        js/c/contragent/data.js
        js/c/contragent/item.js
        #js/c/project/item.js
        #водитель
        js/c/transport/ask-contact.js
        js/c/transport/obj+addr.js
        js/c/transport/item.js
        date-between.js
        js/c/transport/ask-work.js
        #js/c/profile/current-user.js
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