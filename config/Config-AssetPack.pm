use Mojo::Base -strict;
#~ use Mojo::Util qw(encode);
my $mode = app->mode;
sub map_grep_mode {
  map {s/::\w+$//r}
  grep {
    my $m = (/::(\w+)$/)[0];
    !/^--/ && (!$m || $m eq $mode);
  }
  @_;
  #~ grep !/^--/, @_;
}
#~ warn "Config AssetPack";
[ # cpanm JavaScript::Minifier::XS CSS::Sass CSS::Minifier::XS
  'AssetPack::Che' => {
    default_headers => {'X-AssetPacker'=>'Che', "Cache-Control" => "max-age=2592000, must-revalidate"},# Mojolicious::Plugin::AssetPack has store->default_headers()
    pipes => [qw(Sass Css JavaScript VueTemplateCompiler CombineFile)],#JavaScriptPacker
    CombineFile => {
      gzip => {min_size => 1000},
    },
    VueTemplateCompiler=>{enabled=>$ENV{MOJO_ASSETPACK_VUE_TEMPLATE_COMPILER} || 0},
    #~ HTML => {minify_opts=>{remove_newlines => 1,}},# чета при удалении переводов строк  проблемы
    process => [# хэшреф убрал для последовательности
      
      ['materialize.js'=>grep !/^--/, qw(
      
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
        --lib/materialize/js/collapsible.js
      )],
      
      # $ npm install babel-minify -g
      # $ minify picker.js > picker.min.js
      # делал исправления в материализованном календаре по отображению месяца и навигации
      # ВНИМАНИЕ минификация обязательно!
      # через uglify/minify нет точек с запятой
      ['datetime.picker.js'=> qw(
        lib/materialize/js/date_picker/picker.min.js
        lib/materialize/js/date_picker/picker.date.min.js
        lib/materialize/js/date_picker/picker.time.min.js
        lib/materialize/js/date_picker/ru_RU.js
      )],
      
      #guest@calculate ~ $ npm install angular
      ['lib.js'=> &map_grep_mode(grep !/^--/, qw(
        lib/angular/angular.js::development
        lib/angular/angular.min.js::production
        
        lib/jquery/dist/jquery.min.js
        
        lib/vue/dist/vue.js::development
        lib/vue/dist/vue.min.js::production
        ---lib/vuex/dist/vuex.js::development
        ---lib/vuex/dist/vuex.min.js::production
        lib/v-runtime-template/dist/v-runtime-template.umd.js

        materialize.js
        js/c/template-cache/script.js
        js/jquery.autocomplete.js
        js/jquery.autocomplete.options.js
        lib/date-fns/dist/date_fns.min.js
        js/date-fns.locale.ru.js
        datetime.picker.js
        
        ))],
      
      ['tree-item.js'=> grep !/^--/, qw(
        js/c/tree/item.js
        js/c/tree/list.js
      )],
      ['tree-item.html'=> grep !/^--/, qw(
        js/c/tree/item.html
        js/c/tree/list.html
      )],
      
      ['js/dist/templates/uploader.js' => grep !/^--/, qw(
      js/c/uploader/btn.vue.html
      js/c/uploader/drop.vue.html
      js/c/uploader/file.vue.html
      js/c/uploader/files.vue.html
      js/c/uploader/list.vue.html
      js/c/uploader/uploader.vue.html
      js/c/uploader/файлы.vue.html
      )],
      ['js/dist/templates/view-file-iframe.js' => grep !/^--/, qw(
      js/c/uploader/view-file-iframe.vue.html
      )],
      # если не нужен полный v-uploader
      ['view-file-iframe.js'=>grep !/^--/, qw(
      js/dist/templates/view-file-iframe.js
      js/c/uploader/view-file-iframe.js
      )],
      
      ['файлы.js' => do {
        my @uploader_files = qw(common.js btn.js drop.js file.js files.js list.js uploader.js файлы.js );
        my @assets = &map_grep_mode(qw(
      lib/simple-uploader.js/dist/uploader.min.js::production
      lib/simple-uploader.js/dist/uploader.js::development
      js/dist/v-uploader.min.js::production
      ), map("js/c/uploader/$_\::development", @uploader_files));
      #~ warn "@assets";
      my $files = join(' ', map("static/js/c/uploader/$_", @uploader_files));
        `cat $files  | perl script/jsPacker.pl -e0 -q > static/js/dist/v-uploader.min.js`;
        &map_grep_mode(qw(js/dist/templates/uploader.js view-file-iframe.js), @assets);
        
      }],

      #~ ['v-uploader.html' => grep !/^--/, qw(
      #~ js/c/uploader/btn.html
      #~ js/c/uploader/drop.html
      #~ js/c/uploader/file.html
      #~ js/c/uploader/files.html
      #~ js/c/uploader/list.html
      #~ js/c/uploader/uploader.html
      #~ js/c/uploader/файлы.html
      #~ )],
      ['uploader.css' => grep !/^--/, qw(
      js/c/uploader/uploader.scss
      ---js/c/uploader/пример.scss
      )],
      
      ['medcol/main.js' => grep !/^--/, qw(
      lib/jquery/dist/jquery.min.js
      js/jquery.autocomplete.js
      js/jquery.autocomplete.options.js
      --materialize.js
      ../static@medcol/js/medcol.js
      )],
      
      ['medcol/lib.js'=> &map_grep_mode(qw(
        lib/angular/angular.js::development
        lib/angular/angular.min.js::production
        
        lib/vue/dist/vue.js::development
        lib/vue/dist/vue.min.js::production

        materialize.js
        js/util/array-removeOf.js
        js/c/template-cache/script.js
        ---lib/date-fns/dist/date_fns.min.js
        ---js/date-fns.locale.ru.js
        ---datetime.picker.js
        ../static@medcol/js/app.js
      ))],
      ['medcol/форма тестов.js' => grep !/^--/, qw(
      ../static@medcol/js/админка-тестов.js
      js/c/tree/v-tree-list.js
      js/util/copy-clipboard.js
      ../static@medcol/js/форма-теста.js
      ../static@medcol/js/форма-теста-вопросы.js
      js/util/debounce.js
      )],
      ['medcol/форма-тестов.html' => grep !/^--/, qw(
      ../static@medcol/js/форма-теста.html
      ../static@medcol/js/форма-теста-вопросы.html
      js/c/tree/v-tree-list.html
      )],
      ['medcol/результаты-цепочки.js' => grep !/^--/, qw(
      js/util.js
      ../static@medcol/js/результаты-цепочки.js
      js/c/tree/v-tree-list.js
      js/util/debounce.js
      )],
      ['medcol/результаты-цепочки.html' => grep !/^--/, qw(
      js/c/tree/v-tree-list.html
      )],
      
      #~ ['profile/form-auth.html'=>qw(
      #~ js/c/profile/form-auth.html
      #~ )],
      #~ ['profile/form-auth.js' => grep !/^--/, qw(
        #~ --lib/angular-md5/angular-md5.js
        #~ --lib/jquery-md5/jquery.md5.js
        #~ lib/nano-md5/md5.js
        #~ --js/controllers/phone-input/phone-input.js
        #~ --c/profile/lib.js
        #~ js/c/profile/form-auth.js
        
        #~ )],
      
      #глобальная подборка собственных скриптов
      ['main.js' => grep !/^--/, qw(
        ---js/parcel-require.js
        js/routes.js
        js/main.js
        js/util.js
        --js/user.js
        ---profile/form-auth.js
        js/svg.js
        js/util/array-pushself.js
        js/util/array-removeOf.js
        --в_конце!!!
        js/global-modules.js
        js/app.js
        js/dist/auth.js
        ---js/dist/main.js
        ),
      
      ],
       [ 'animate.css'=> grep !/^--/, qw(
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
        
        lib/animate.css/source/sliding_exits/slideOutUp.css
        lib/animate.css/source/sliding_exits/slideOutDown.css
        lib/animate.css/source/sliding_exits/slideOutRight.css
        
        lib/animate.css/source/rotating_entrances/rotateIn.css
        
        --lib/animate.css/source/bouncing_entrances/bounceIn.css
        lib/animate.css/source/fading_entrances/fadeIn.css
        ---lib/animate.css/source/fading_entrances/fadeInUp.css
        --lib/animate.css/source/fading_exits/fadeOut.css
       
       )],
      [ 'main.css'=> grep !/^--/, qw(
        ------https://fonts.googleapis.com/icon?family=Material+Icons
        --fonts/material-icons/material-icons.css
        ------https://fonts.googleapis.com/css?family=Roboto+Condensed:300,400,400i,700,700i|Roboto:100,100i,300,300i,400,400i,500,500i,700,700i,900,900i&subset=cyrillic,cyrillic-ext,latin-ext&effect=3d-float
        ------https://fonts.googleapis.com/css?family=Roboto+Condensed:300,400,700&amp;subset=cyrillic,cyrillic-ext
        --css/fontello/fontello.css
        animate.css
        sass/main.scss
        --css/main.css
        ),
      ],# static/sass $ sass --watch main.scss:../css/main.css
      
      #http://flexboxgrid.com/
      ['flexboxgrid.css'=> &map_grep_mode(qw(
      lib/flexboxgrid/dist/flexboxgrid.css::development
      lib/flexboxgrid/dist/flexboxgrid.min.css::production
      ))],

      ['календарь.js'=> grep !/^--/, qw(
      lib/dayjs/dayjs.min.js
      js/c/календарь/календарь-год.js
      js/c/календарь/календарь-месяц.js
      )],
      ['календарь.html'=> grep !/^--/, qw(
      js/c/календарь/календарь-год.html
      js/c/календарь/календарь-месяц.html
      )],
      ['календарь.css'=> grep !/^--/, qw(
      js/c/календарь/календарь.scss
      )],

      ['date-between.js'=> grep !/^--/, qw(
      --lib/date-fns/dist/date_fns.js
      js/c/date/between.js
      )],
      #~ ['date-between.html'=>qw(    #~ )],
      
      ['waltex/money.html'=> grep !/^--/, qw(
      tree-item.html
      js/c/wallet/item.html
      js/c/contragent/item.html
      ---js/c/аренда/выбор-договора-аренды.html
      js/c/project/list.html
      js/c/transport/obj+addr.html
      js/c/waltex/money/form.html
      js/c/waltex/money/table.html
      js/c/date/between.html
      js/c/profile/item.html
      
      )],
      ['js/dist/templates/выбор-договора-аренды.js'=>qw(js/c/аренда/выбор-договора-аренды.vue.html)],
      ['waltex/money.js'=> grep !/^--/, qw(
      tree-item.js
      js/c/wallet/item.js
      js/c/contragent/data.js
      js/dist/templates/выбор-договора-аренды.js
      js/c/аренда/выбор-договора-аренды.js
      js/c/contragent/item.js
      js/c/project/list.js
      js/c/transport/obj+addr.js
      --js/c/waltex/money/work.js
      js/c/category/data.js
      js/c/waltex/money/table.js
      js/c/waltex/money/form.js
      js/c/profile/item.js
      --lib/angular-drag-and-drop-lists/angular-drag-and-drop-lists.js
      date-between.js
      
      )],
      
      ['waltex/report.html'=> grep !/^--/, qw(
      js/c/project/list.html
      js/c/waltex/report/form.html
      js/c/waltex/report/table.html
      --js/c/waltex/report/row.html
      js/c/date/between.html
      --js/c/waltex/report/wallets.html
      js/c/transport/obj+addr.html
      --форма-модально
      tree-item.html
      js/c/wallet/item.html
      js/c/contragent/item.html
      js/c/waltex/money/form.html
      js/c/profile/item.html
      
      )],
      ['waltex/report.js'=> grep !/^--/, qw(
      js/c/project/list.js
      js/c/waltex/report/form.js
      js/c/waltex/report/table.js
      --js/c/waltex/report/wallets.js
      --js/c/waltex/report/row.js
      --lib/date-fns/dist/date_fns.js
      date-between.js
      ---js/util/array-splice.js
      js/c/transport/obj+addr.js
      --!!показ_позиции_в_форме
      tree-item.js
      js/c/wallet/item.js
      js/c/contragent/data.js
      js/c/contragent/item.js
      js/c/profile/item.js
      js/c/category/data.js
      js/c/waltex/money/form.js
      
      )],
      
      ['деньги/отчет/кошельки.html'=> grep !/^--/, qw(
      js/c/project/list.html
      js/c/waltex/report/кошельки/таблица.html
      
      )],
      ['деньги/отчет/кошельки.js'=> grep !/^--/, qw(
      js/c/project/list.js
      js/c/waltex/report/кошельки/таблица.js
      js/c/waltex/report/кошельки/controll.js
      
      )],
      
      ['lib/fileupload.js'=>qw(
        lib/blueimp-file-upload/js/vendor/jquery.ui.widget.js
        lib/blueimp-file-upload/js/jquery.fileupload.js
      )],
        
        ['admin/access.html' => grep !/^--/, qw(
        ---v-uploader.html
        js/c/access/users.html
        js/c/access/roles.html
        js/c/access/routes.html
        
        )],
        ['admin/access.js' => grep !/^--/, qw(
        --lib/fileupload.js_в_контроллере
        --lib/angular-fallback-src/fallback-src.js
        js/util/sprintf.js
        файлы.js
        js/c/access/users.js
        js/c/access/roles.js
        js/c/access/routes.js
        js/c/access/controll.js
        )],
        ['staff/сотрудники.js' => grep !/^--/, qw(
        --lib/fileupload.js_в_контроллере
        --lib/angular-fallback-src/fallback-src.js
        файлы.js
        js/c/access/users.js
        js/c/access/roles.js
        js/c/staff/сотрудники.js
        )],
        ['staff/сотрудники.html' => grep !/^--/, qw(
        ---v-uploader.html
        js/c/access/users.html
        js/c/access/roles.html
        
        )],
        
        ['спецодежда.js' => grep !/^--/, qw(
          ----lib/vue2-filters/dist/vue2-filters.min.js
          ---js/util/debounce.js
          js/c/спецодежда/controll.js
          js/c/profile/сотрудники.js
          js/c/спецодежда/таблица.js
          js/c/спецодежда/форма.js
        )],
        ['спецодежда.html' => grep !/^--/, qw(
          js/c/profile/сотрудники.html
          js/c/спецодежда/таблица.html
          js/c/спецодежда/форма.html
        )],
        
        ['timework/form.html' => grep !/^--/, qw(
        js/c/object/select.html
        js/c/timework/form.html
        
        )],
        ['timework/form.js' => grep !/^--/, qw(
        js/c/timework/controll.js
        js/c/timework/form.js
        js/c/object/select.js
        --lib/date-fns/dist/date_fns.js
        --js/date-fns.locale.ru.js
        --lib/datatables.net-fixedcolumns/js/dataTables.fixedColumns.js
        )],
        ['timework/report.html' => grep !/^--/, qw(
        js/c/timework/report.html
        js/c/object/select.html
        --из_детализации_работать_с_движением_ДС_по_сотруднику
        waltex/money.html
        js/c/timework/pay-form.html
        tree-item.html
        )],
        ['timework/report.js' => grep !/^--/, qw(
        js/c/timework/report-lib.js
        js/c/timework/report.js
        js/c/object/select.js
        --lib/date-fns/dist/date_fns.js
        --js/date-fns.locale.ru.js
        --из_детализации_работать_с_движением_ДС_по_сотруднику
        waltex/money.js
        js/c/timework/pay-form.js
        tree-item.js
        )],
        
        ['timework/calc-zp.html' => grep !/^--/, qw(
        js/c/timework/calc-zp.html
        js/c/object/select.html
        waltex/money.html
        js/c/timework/pay-form.html
        tree-item.html
        )],
        ['timework/calc-zp.js' => grep !/^--/, qw(
        js/c/timework/report-lib.js
        js/c/timework/calc-zp.js
        js/c/object/select.js
        waltex/money.js
        js/c/timework/pay-form.js
        tree-item.js
        )],
        
        ['timework/report-obj.html' => grep !/^--/, qw(
        js/c/timework/report-obj.html
        
        )],
        ['timework/report-obj.js' => grep !/^--/, qw(
        lib/angular-toArrayFilter/toArrayFilter.js
        js/c/timework/report-obj.js
        )],
        
        ['timework/report-print.html' => grep !/^--/, qw(
        js/c/timework/report-print.html
        
        )],
        ['timework/report-print.js' => grep !/^--/, qw(
        js/c/timework/report-print.js
        )],
        
        ['timework/calc-zp-print.html' => grep !/^--/, qw(
        js/c/timework/calc-zp-print.html
        
        )],
        ['timework/calc-zp-print.js' => grep !/^--/, qw(
        js/c/timework/calc-zp-print.js
        )],
        
        ['тмц/заявки.html' => grep !/^--/, qw(
        tree-item.html
        js/c/тмц/заявки/ask-form.html
        js/c/тмц/заявки/ask-table.html
        js/c/object/select.html
        js/c/date/between.html
        
        )],
        ['тмц/заявки.js' => grep !/^--/, qw(
        js/c/тмц/заявки/ask.js
        tree-item.js
        js/c/тмц/заявки/ask-form.js
        js/c/тмц/заявки/ask-table.js
        js/c/object/select.js
        date-between.js
        )],
        ['тмц/снабжение.html' => grep !/^--/, qw(
        tree-item.html
        js/c/contragent/item.html
        js/c/transport/ask-contact.html
        js/c/transport/obj+addr.html
        js/c/тмц/заявки/ask-nomen-ost.html
        js/c/тмц/заявки/ask-table.html
        js/c/тмц/lib/форма.html
        js/c/тмц/lib/табы.html
        --js/c/тмц/снабжение/простая-закупка-форма.html
        js/c/тмц/снабжение/снабжение-табы.html
        js/c/тмц/таблица.html
        js/c/тмц/lib/таблица-позиций.html
        js/c/тмц/остатки/остатки-таблица.html
        --js/c/тмц/списания/списание-форма.html
        ---js/c/тмц/склад/инвентаризация-форма.html
        js/c/тмц/склад/инвентаризации-таблица.html
        js/c/object/select.html
        js/c/date/between.html
        
        )],
        ['тмц/снабжение.js' => grep !/^--/, qw(
        tree-item.js
        js/c/contragent/data.js
        js/c/contragent/item.js
        js/c/transport/ask-contact.js
        js/c/transport/obj+addr.js
        js/c/тмц/lib/форма.js
        js/c/тмц/объекты/перемещениe-форма.js
        js/c/тмц/снабжение/закупка-форма.js
        --js/c/тмц/снабжение/простая-закупка-форма.js
        js/c/тмц/заявки/ask-nomen-ost.js
        js/c/тмц/заявки/ask-table.js
        js/c/nomen/lib.js
        js/c/тмц/lib/табы.js
        js/c/тмц/снабжение/снабжение-табы.js
        js/c/тмц/таблица.js
        js/c/тмц/lib/таблица-позиций.js
        js/c/тмц/lib/таблица.js
        js/c/тмц/остатки/остатки-таблица.js
        --js/c/тмц/списания/списание-форма.js
        ---js/c/тмц/склад/инвентаризация-форма.js
        js/c/тмц/склад/инвентаризации-таблица.js
        js/c/object/select.js
        date-between.js
        js/c/тмц/снабжение/снабжение.js
        )],
        ['тмц/объекты.js' => grep !/^--/, qw(
        js/c/тмц/объекты/объекты.js
        tree-item.js
        js/c/contragent/data.js
        js/c/contragent/item.js
        js/c/transport/ask-contact.js
        js/c/transport/obj+addr.js
        js/c/тмц/lib/форма.js
        js/c/тмц/списания/списание-форма.js
        js/c/тмц/объекты/перемещениe-форма.js
        js/c/тмц/заявки/ask-form.js
        js/c/nomen/lib.js
        js/c/тмц/lib/табы.js
        js/c/тмц/объекты/объекты-табы.js
        js/c/тмц/lib/таблица-позиций.js
        js/c/тмц/остатки/остатки-таблица.js
        js/c/тмц/таблица.js
        js/c/тмц/lib/таблица.js
        js/c/тмц/заявки/ask-table.js
        js/c/тмц/склад/инвентаризации-таблица.js
        js/c/тмц/снабжение/снабжение.js
        js/c/object/select.js
        date-between.js
        )],
         ['тмц/объекты.html' => grep !/^--/, qw(
        tree-item.html
        js/c/contragent/item.html
        js/c/transport/ask-contact.html
        js/c/transport/obj+addr.html
        js/c/тмц/lib/форма.html
        js/c/тмц/lib/табы.html
        js/c/тмц/заявки/ask-form.html
        js/c/тмц/объекты/объекты-табы.html
        js/c/тмц/lib/таблица-позиций.html
        js/c/тмц/остатки/остатки-таблица.html
        js/c/тмц/списания/списание-форма.html
        js/c/тмц/таблица.html
        js/c/тмц/заявки/ask-table.html
        js/c/тмц/склад/инвентаризации-таблица.html
        js/c/object/select.html
        js/c/date/between.html
        
        )],

        ['тмц/склад.js' => grep !/^--/, qw(
        --из-tmc/снабжение.js
        tree-item.js
        js/c/contragent/data.js
        js/c/contragent/item.js
        js/c/transport/obj+addr.js
        js/c/тмц/lib/форма.js
        js/c/тмц/заявки/ask-form.js
        --доступнаФормаЗакупки
        js/c/тмц/снабжение/закупка-форма.js
        js/c/transport/ask-contact.js
        ----js/c/тмц/снабжение/простая-закупка-форма.js
        ----js/c/тмц/заявки/ask-ost-confirm.js
        js/c/тмц/заявки/ask-table.js
        js/c/nomen/lib.js
        js/c/тмц/lib/табы.js
        --js/c/тмц/снабжение/снабжение-табы.js
        js/c/тмц/таблица.js
        js/c/тмц/lib/таблица-позиций.js
        js/c/тмц/lib/таблица.js
        js/c/тмц/объекты/перемещениe-форма.js
        js/c/тмц/остатки/остатки-таблица.js
        js/c/тмц/списания/списание-форма.js
        js/c/object/select.js
        date-between.js
        js/c/тмц/снабжение/снабжение.js
        --------после!
        js/c/тмц/склад/склад.js
        js/c/тмц/склад/склад-табы.js
        js/c/тмц/склад/инвентаризация-форма.js
        js/c/тмц/склад/инвентаризации-таблица.js
        )],
         ['тмц/склад.html' => grep !/^--/, qw(
         js/c/тмц/склад/склад-табы.html
         js/c/тмц/склад/инвентаризация-форма.html
         --js/c/тмц/склад/инвентаризации-таблица.html
         --js/c/тмц/lib/форма.html
         js/c/тмц/заявки/ask-form.html
         js/c/тмц/заявки/ask-ost-confirm.html
        тмц/снабжение.html
        
        )],
        ['тмц/наличие.js' => grep !/^--/, qw(
        js/c/тмц/остатки/controll.js
        tree-item.js
        js/c/object/select.js
        js/c/nomen/lib.js
        js/c/contragent/data.js
        js/c/contragent/item.js
        js/c/transport/obj+addr.js
        js/c/тмц/lib/форма.js
        js/c/тмц/объекты/перемещениe-форма.js
        js/c/тмц/остатки/остатки-таблица.js
        )],
        ['тмц/наличие.html' => grep !/^--/, qw(
        tree-item.html
        js/c/object/select.html
        js/c/contragent/item.html
        js/c/transport/obj+addr.html
        js/c/тмц/lib/форма.html
        js/c/тмц/остатки/остатки-таблица.html
        )],
        
        ['тмц/замстрой.html' => grep !/^--/, qw(
        tree-item.html
        js/c/тмц/lib/форма.html
        js/c/тмц/lib/табы.html
        js/c/тмц/остатки/остатки-таблица.html
        js/c/тмц/склад/инвентаризации-таблица.html
        js/c/тмц/lib/таблица-позиций.html
        js/c/object/select.html
        js/c/date/between.html
        js/c/тмц/списания/замстрой-табы.html
        )],
        ['тмц/замстрой.js' => grep !/^--/, qw(
        --косяк_автоинъекции_глобальных_модулей
        js/c/contragent/data.js
        tree-item.js
        js/c/тмц/lib/форма.js
        js/c/nomen/lib.js
        js/c/тмц/lib/табы.js
        js/c/тмц/lib/таблица.js
        js/c/тмц/lib/таблица-позиций.js
        js/c/тмц/остатки/остатки-таблица.js
        js/c/тмц/склад/инвентаризации-таблица.js
        js/c/object/select.js
        date-between.js
        js/c/тмц/списания/замстрой.js
        js/c/тмц/списания/замстрой-табы.js
        )],
        
        ['тмц/сертификаты.js' => grep !/^--/, qw(
        js/c/тмц/сертификаты/index.js
        js/c/тмц/сертификаты/объекты.js
        js/c/тмц/сертификаты/закупки.js
        js/c/тмц/сертификаты/папки.js
        js/c/tree/v-tree-list.js
        файлы.js
        js/c/тмц/сертификаты/форма-папки.js
        )],
        ['тмц/сертификаты.html' => grep !/^--/, qw(
        js/c/тмц/сертификаты/объекты.html
        js/c/тмц/сертификаты/закупки.html
        js/c/тмц/сертификаты/папки.html
        js/c/tree/v-tree-list.html
        ---v-uploader.html
        js/c/тмц/сертификаты/форма-папки.html
        )],
        
        ['transport/ask.html' => grep !/^--/, qw(
        tree-item.html
        js/c/transport/ask-form.html
        --да,таблицаТМЦ
        js/c/тмц/lib/таблица-позиций.html
        js/c/transport/ask-table.html
        js/c/date/between.html
        js/c/contragent/item.html
        --js/c/project/item.html
        --водитель
        js/c/transport/ask-contact.html
        js/c/transport/obj+addr.html
        js/c/transport/item.html
        js/c/date/between.html
        js/c/transport/ask-work.html
        )],
        ['transport/ask.js' => grep !/^--/, qw(
        --lib/jquery.scrollTableBody/src/jquery.scrollTableBody-1.0.0.js
        tree-item.js
        js/c/transport/ask-form.js
        js/c/transport/ask-table.js
        js/c/тмц/lib/таблица-позиций.js
        js/c/transport/ask.js
        date-between.js
        js/c/contragent/data.js
        js/c/contragent/item.js
        --js/c/project/item.js
        --водитель
        js/c/transport/ask-contact.js
        js/c/transport/obj+addr.js
        js/c/transport/item.js
        date-between.js
        js/c/transport/ask-work.js
        --js/c/profile/current-user.js
        )],
        ['transport/ask-work.html' => grep !/^--/, qw(
        js/c/transport/ask-work.html
        
        )],
        ['transport/ask-work.js' => grep !/^--/, qw(
        js/c/transport/ask-work.js
        
        )],
        
      ['waltex/zp.js'=> grep !/^--/, qw(
        js/c/waltex/zp/module.js
        js/c/waltex/zp/pack-form.js
        js/c/wallet/item.js
      )],
      ['waltex/zp.html'=> grep !/^--/, qw(
        js/c/waltex/zp/pack-form.html
        js/c/wallet/item.html
      )],
      
      ['номенклатура/справочник.html' => grep !/^--/, qw(
        js/c/tree/list.html
        
        )],
        ['номенклатура/справочник.js' => grep !/^--/, qw(
        js/c/номенклатура/lib.js
        js/c/номенклатура/справочник.js
        js/c/tree/list.js
        
        )],
        
        ['js/dist/templates/аренда.js'=>grep !/^--/, qw(
        js/c/аренда/договоры-таблица.vue.html
        js/c/аренда/договор-форма.vue.html
        js/c/аренда/договор-помещения-форма.vue.html
        js/c/аренда/объекты-таблица.vue.html
        js/c/аренда/объект-форма.vue.html
        js/c/аренда/объекты-таблица-помещений-договоры.vue.html
        )],
        
         ['js/dist/templates/v-select.js'=>grep !/^--/, qw(
        js/c/autocomplete/v-select.vue.html
         )],
         
         ['js/dist/templates/v-suggestions.js'=>grep !/^--/, qw(
        js/c/autocomplete/v-suggestions.vue.html
         )],
         
         ['js/dist/templates/v-select-object.js'=>grep !/^--/, qw(
          js/c/object/v-select-object.vue.html
         )],
         
         ['js/dist/templates/contragent/v-item.js'=>grep !/^--/, qw(
          js/c/contragent/v-item.vue.html
         )],
        
        ['аренда.js' => grep !/^--/, qw(
        js/dist/templates/аренда.js
        js/dist/templates/v-select.js
        js/dist/templates/v-suggestions.js
        js/dist/templates/v-select-object.js
        js/c/аренда/index.js
        js/c/аренда/договоры-таблица.js
        ---js/dist/аренда/договоры-таблица.js
        js/c/аренда/договор-форма.js
        ---js/dist/аренда/договор-форма.js
        js/c/аренда/договор-помещения-форма.js
        js/c/аренда/объекты-таблица.js
        js/c/аренда/объект-форма.js
        js/c/contragent/data.js
        js/dist/templates/contragent/v-item.js
        js/c/contragent/v-item.js
        js/util/IdMaker.js
        js/util/debounce.js
        js/c/autocomplete/v-suggestions.js
        файлы.js
        js/c/object/v-select-object.js
        js/c/autocomplete/v-select.js
        js/c/project/list.js
        js/c/waltex/report/аренда/форма.js
        date-between.js
        js/c/waltex/report/table.js
        ---js/util/copy-clipboard.js
        ---js/util/array-splice.js
        )],
        ['аренда.html?wew' => grep !/^--/, qw(
        ---js/c/аренда/договоры-таблица.html
        ---js/c/аренда/договор-форма.html
        ---js/c/аренда/договор-помещения-форма.html
        ---js/c/аренда/объекты-таблица.html
        ---js/c/аренда/объекты-таблица-помещений-договоры.html
        ---js/c/аренда/объект-форма.html
        ---js/c/contragent/v-item.html
        ---js/c/autocomplete/v-suggestions.html
        ---v-uploader.html
        ---js/c/object/v-select-object.html
        ---js/c/autocomplete/v-select.html
        js/c/waltex/report/аренда/форма.html
        js/c/project/list.html
        js/c/date/between.html
        js/c/waltex/report/table.html
        )],
        
        ['js/dist/templates/аренда-расходы.js'=>grep !/^--/, qw(
          js/c/аренда/расходы/расходы-таблица.vue.html
          js/c/аренда/расходы/расходы-форма.vue.html
        )],
        
        ['js/dist/templates/project/v-list.js'=>grep !/^--/, qw(
          js/c/project/v-list.vue.html
         )],
        
        ['аренда-расходы.js' => grep !/^--/, qw(
        js/dist/templates/аренда-расходы.js
        js/dist/templates/v-select.js
        js/dist/templates/v-suggestions.js
        js/dist/templates/v-select-object.js
        view-file-iframe.js
        js/c/аренда/расходы/index.js
        js/dist/templates/project/v-list.js
        js/c/project/v-list.js
        js/c/аренда/расходы/расходы-таблица.js
        js/c/аренда/расходы/расходы-форма.js
        ---js/c/contragent/data.js
        ---js/c/contragent/v-item.js
        js/util/IdMaker.js
        js/util/debounce.js
        js/c/autocomplete/v-suggestions.js
        ----файлы.js
        js/c/autocomplete/v-select.js
        js/c/object/v-select-object.js
        js/dist/templates/выбор-договора-аренды.js
        js/c/аренда/выбор-договора-аренды.js
        ---js/c/uploader/common.js
        )],
        #~ ['аренда-расходы.html' => grep !/^--/, qw(
        #~ --js/c/project/v-list.html
        #~ ---js/c/аренда/расходы/расходы-таблица.html
        #~ ---js/c/аренда/расходы/расходы-форма.html
        #~ ---js/c/contragent/v-item.html
        #~ ---js/c/autocomplete/v-suggestions.html
        #~ ---v-uploader.html
        #~ ---js/c/autocomplete/v-select.html
        #~ ---js/c/object/v-select-object.html
        #~ ---js/c/аренда/выбор-договора-аренды.html
        #~ )],
        
        ['js/dist/templates/аренда-акты-таблица.js'=>grep !/^--/, qw(
        js/c/аренда/акты/акты-таблица.vue.html
        )],
        ['аренда-акты.js' => grep !/^--/, qw(
        js/dist/templates/аренда-акты-таблица.js
        js/c/аренда/акты/index.js
        js/dist/templates/project/v-list.js
        js/c/project/v-list.js
        js/c/аренда/акты/акты-таблица.js
        js/util/IdMaker.js
        )],
        #~ ['аренда-акты.html' => grep !/^--/, qw(
        #~ --js/c/project/v-list.html
        #~ ---js/c/аренда/акты/акты-таблица.html
        #~ )],
        
        ['контрагенты/замена.js' => grep !/^--/, qw(
        js/dist/templates/v-suggestions.js
        js/c/contragent/data.js
        js/dist/templates/contragent/v-item.js
        js/c/contragent/v-item.js
        js/util/debounce.js
        js/c/autocomplete/v-suggestions.js
        js/c/contragent/замена.js
        )],
        #~ ['контрагенты/замена.html' => grep !/^--/, qw(
        #~ ---js/c/contragent/v-item.html
        #~ ---js/c/autocomplete/v-suggestions.html
        #~ )],
        
        ['химия.js' => grep !/^--/, qw(
        js/dist/templates/v-select.js
        js/dist/templates/v-suggestions.js
        js/c/химия/index.js
        datetime.picker.js
        js/util/debounce.js
        js/util/IdMaker.js
        js/c/autocomplete/v-suggestions.js
        js/c/autocomplete/v-select.js
        js/c/химия/сырье/сырье-таблица.js
        ---lib/vue-numeric/dist/vue-numeric.min.js
        js/c/химия/сырье/сырье-форма.js
        файлы.js
        js/c/химия/продукция/продукция-таблица.js
        js/c/химия/продукция/продукция-форма.js
        js/c/химия/сырье/сырье-остатки.js
        js/c/химия/отгрузка/отгрузка-таблица.js
        js/c/химия/отгрузка/отгрузка-форма.js
        js/dist/templates/contragent/v-item.js
        js/c/contragent/v-item.js
        js/c/химия/продукция/продукция-остатки.js
        js/c/химия/контрагенты.js
        js/c/химия/номенклатура.js
        js/c/химия/сырье/сырье-движение.js
        js/c/химия/продукция/продукция-движение.js
        )],
        ['химия.html' => grep !/^--/, qw(
        ---js/c/autocomplete/v-suggestions.html
        ---js/c/autocomplete/v-select.html
        js/c/химия/сырье/сырье-таблица.html
        js/c/химия/сырье/сырье-форма.html
        ---v-uploader.html
        js/c/химия/продукция/продукция-таблица.html
        js/c/химия/продукция/продукция-форма.html
        js/c/химия/отгрузка/отгрузка-таблица.html
        js/c/химия/отгрузка/отгрузка-форма.html
        ---js/c/contragent/v-item.html
        js/c/химия/сырье/сырье-движение.html
        js/c/химия/продукция/продукция-движение.html
        )],
        
        ['отпуск.js' => grep !/^--/, qw(
        календарь.js
        js/c/profile/сотрудники.js
        js/c/отпуск/index.js
        js/c/отпуск/отпуск-календарь.js
        )],
        ['отпуск.html' => grep !/^--/, qw(
        календарь.html
        js/c/profile/сотрудники.html
        js/c/отпуск/отпуск-календарь.html
        )],
        
         #~ ['terminal.js' => grep !/^--/, qw( не катит пакер
         #~ lib/terminal/js/term.js
         #~ lib/terminal/js/addons/fit/fit.js
         #~ lib/terminal/js/app.js
         #~ )],
         
         ['terminal.css' => grep !/^--/, qw(
          https://fonts.googleapis.com/css?family=Rubik:300i
          https://fonts.googleapis.com/css?family=Open+Sans
          https://fonts.googleapis.com/css?family=Montserrat
          lib/terminal/css/style.css
          lib/terminal/css/xterm.css
         )],

    ],
  },
];