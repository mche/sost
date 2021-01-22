package Controll::Waltex::Report::Rent;
#~ use Mojo::Base 'Mojolicious::Controller';
use Mojo::Base 'Controll::Waltex::Report';

#~ has model_project => sub {shift->app->models->{'Project'}};
#~ has model_wallet => sub {shift->app->models->{'Wallet'}};
#~ has model_waltex => sub {shift->app->models->{'Waltex::Report'}};
#~ has controll_report => sub { Controll::Waltex::Report->new(app=>shift->app); };
has model_report_rent => sub { $_[0]->app->models->{'Waltex::Report::Rent'}->uid($_[0]->auth_user && $_[0]->auth_user->{id}) };

sub index {#пока нет
  my $c = shift;
  return $c->render('waltex/report/аренда.html.ep',
    handler=>'ep',
    'header-title' => 'Отчпет по аренде',
    assets=>["деньги/отчет/аренда.js",],
    );
  
}

sub data {
  my $c = shift;
  my $param = $c->req->json;
  delete $param->{'все контрагенты'};
  $param->{'контрагенты'} = $c->model_report_rent->контрагенты();
  $param->{'аренда'}  = 1;
  #~ $param->{'все проекты'} = 1;
  #~ $param->{'проект'} = {"id"=>0};
  #~ $c->log->error($c->dumper($param));
  $c->все_контрагенты($param);# там render
  #~ $param->{'место интервалов'} = 'строки';
  #~ $c->data($param);# там render
  #~ $c->log->error($c->dumper($c->snapshot_name));
  #~ $c->render(json=>$data);
}

sub строка {
  my $c = shift;
  my $param = $c->req->json;
  #~ $param->{'все контрагенты'} = 1;
  #~ $param->{'все проекты'} = 1;
  #~ $param->{'проект'} = {"id"=>0};
  #~ $param->{"место интервалов"} = "столбцы";
  #~ {"проект":{"id":0},"кошелек":{"без сохранения":true,"проект":{"id":0,"ready":true},"title":""},"кошелек2":{"без сохранения":true,"title":""},"контрагент":{"без сохранения":true},"профиль":{},"объект":{"проект":{"id":0,"ready":true}},"все проекты":true,"место интервалов":"столбцы","все контрагенты":true,"все кошельки":false,"все кошельки2":false,"все профили":false,"все объекты":false,"все пустое движение":false,}
  #~ $c->log->error($c->dumper($param));
  $c->row($param);
  
}

sub движение_ДС_xlsx {
  my $c = shift;

  my $xlsx = $c->stash('xlsx'); # имя файла
  #~ $c->app->log->error($docx);
  return $c->render_file(
    'filepath' => "static/tmp/$xlsx",
    'filename' => 'выписка по арендатору.xlsx',
     format=>'xlsx',
    #~ 'format'   => 'pdf',                 # will change Content-Type "application/x-download" to "application/pdf"
    #~ 'content_disposition' => 'inline',   # will change Content-Disposition from "attachment" to "inline"
    'cleanup'  => 1,                     # delete file after completed
  )  if $c->req->method eq 'GET';#$docx;
  
  # вресенный файл-выписка по POST
  my $param =  $c->req->json || {};

  require Excel::Writer::XLSX;
  
  my $data = $c->model_report_rent->движение_арендатора($param);
  my @names = ('дата', 'оплата (приход)', 'счета/акты',  'категория', 'примечание');
  #~ my %names = (''=> 'приход (оплаты)', 'расход (счета / акты)',)
  #~ my $filename=sprintf("static/tmp/%s-реестр-актов.xlsx", $c->auth_user->{id}, $month);
  
  $xlsx = $c->req->request_id.'.xlsx';# /tmp/pKXYgkWjv3
  open my $fh, '>', "static/tmp/$xlsx" or die "Failed to open filehandle: $!";
  my $workbook  = Excel::Writer::XLSX->new( $fh );
  my $worksheet = $workbook->add_worksheet();
  my %color = (
    'плюс'=>{color => 'green'},#, bg_color=>'#C8E6C9',
    'минус'=>{color => 'purple'},#, bg_color=>'#E1BEE7',
  );
  
  if (@$data) {# шапка
    $worksheet->set_row(0, 20);
    $worksheet->write_row(0, 0, [undef, undef,'Расчеты с арендатором', undef, undef,], $workbook->add_format(align=>'right', size=>14, bg_color=>$color{плюс}{bg_color}));
    $worksheet->write_row(0, 3, [$data->[0]{"контрагент"}], $workbook->add_format( bold => 1,  size=>14, %{$color{плюс}}, bg_color=>'#C8E6C9', ));
    #~ $worksheet->write_row(2, 0, [$data->[0]{"контрагент"}], $bold);
    $worksheet->set_row(1, 20);
    $worksheet->write_row(1, 0, [undef, undef,'Арендодатель', undef, undef], $workbook->add_format(align=>'right', size=>14, bg_color=>$color{минус}{bg_color}));
    $worksheet->write_row(1, 3, [$data->[0]{"кошельки"}[0][0]], $workbook->add_format( bold => 1, size=>14, %{$color{минус}}, bg_color=>'#E1BEE7', ));
  }

  my $n = 5;
  $worksheet->set_row($n, 20);
  $worksheet->write_row($n++, 0, \@names, $workbook->add_format( bold => 1, bottom=>1, align=>'center', bg_color=>'#B2DFDB',));#
  my @sum  = (0, 0);
  $worksheet->set_column( 0, 0, 15 );
  $worksheet->set_column( 1, 2, 15 );
  #~ $worksheet->set_column( 2, 3, 20 );
  $worksheet->set_column( 3, 4, 50 );
  my $num_format = '# ##0.00 [$₽-419];[RED]-# ##0.00 [$₽-419]';
  for (@$data) {
    $worksheet->write_row($n, 0, [$c->_format_date($_->{'$дата'})], $workbook->add_format(align=>'right', bottom=>4, right=>1,  left=>1));#, bg_color=>$_->{'приход/num'} ? $color{плюс}{bg_color} : $color{минус}{bg_color}
    $worksheet->write_row($n, 1, [ @$_{qw(приход/num)}], $workbook->add_format( num_format=> $num_format, size=>13, bottom=>4, right=>1, %{$color{плюс}}));#,  bg_color=>$_->{'приход/num'} ? $color{плюс}{bg_color} : $color{минус}{bg_color}
    $worksheet->write_row($n, 2, [ @$_{qw(расход/num)}], $workbook->add_format( num_format=> $num_format, size=>13, bottom=>4, right=>1, %{$color{минус}}));#, bg_color=>$_->{'приход/num'} ? $color{плюс}{bg_color} : $color{минус}{bg_color}
    $worksheet->write_row($n, 3, [join(', ', @{$_->{'категория'}})], $workbook->add_format(bottom=>4, right=>1,) );#$workbook->add_format(bg_color=>$_->{'приход/num'} ? $color{плюс}{bg_color} : $color{минус}{bg_color})
    $worksheet->write_row($n, 4, [ @$_{qw(примечание)}], $workbook->add_format(bottom=>4, right=>1,) );#$workbook->add_format( size => 8)  # , $workbook->add_format(bg_color=>$_->{'приход/num'} ? $color{плюс}{bg_color} : $color{минус}{bg_color})
    $n++;
    #~ $worksheet->conditional_formatting( 'A1:A4',
    #~ {
        #~ type     => 'no_blanks',
        #~ format   => $format,
    #~ }
#~ );
    $sum[0] += $_->{'приход/num'};
    $sum[1] += $_->{'расход/num'};
  }
  # подвал
  $worksheet->write_row($n, 0, [ 'Всего',], $workbook->add_format( bold => 1, size=>14, align=>'right', top=>1));
  #~ $worksheet->write_row($n, 1, [$sum[0]], $workbook->add_format( bold => 1, size=>14, num_format=> $num_format, align=>'right', top=>1, %{$color{плюс}},));
  $worksheet->write_formula($n, 1, "=SUM(B7:B$n)", $workbook->add_format( num_format=> $num_format, top=>1,bold=>1, size=>14, %{$color{плюс}}), $sum[0]);
  $worksheet->write_formula($n, 2, "=SUM(C7:C$n)", $workbook->add_format( num_format=> $num_format, top=>1, bold=>1, size=>14, %{$color{минус}}), $sum[1]);
  #~ $worksheet->write_row($n, 3, [ undef,undef], $workbook->add_format( bold => 1, size=>14, num_format=> $num_format, align=>'right', top=>1,  %{$color{минус}},));
  $worksheet->write_row($n, 3, [undef,undef], $workbook->add_format( bold => 1, size=>12, align=>'right', top=>1,));
  $worksheet->set_row($n++, 20);
  my $s = $sum[0]-$sum[1];
  $worksheet->write_row($n, 0, ['Сальдо',], $workbook->add_format( bold => 1, size=>12, align=>'right', size=>14,));
  $worksheet->write_row($n, $s > 0 ? 1 : 2, [$s > 0 ? ($s) : ( -1*$s),], $workbook->add_format( bold => 1, size=>12, num_format=> $num_format, align=>'right', size=>14, ));#$s > 0 ? %{$color{плюс}} : %{$color{минус}},
  $worksheet->set_row($n++, 20);
    
  $workbook->close();
  #~ return $fdata;
  $c->render(json=>{'xlsx'=>$xlsx});
  # Render data from memory as file
  #~ $c->render_file('filepath' => "static/$xlsx", 'filename' => 'выписка по арендатору.xlsx', format=>'xlsx');
}

sub _format_date {
  my ($c, $date) = (shift, shift);
  my $r = $c->app->json->decode($date);
  return "$r->{day} $r->{'месяца'} $r->{year}";
}


1;