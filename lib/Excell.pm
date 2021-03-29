package Excell;
use Mojo::Base -strict, -signatures;
use Excel::Writer::XLSX;

#~ use Exporter 'import'; # gives you Exporter's import() method directly
#~ our @EXPORT_OK = qw(главный_отчет);  # symbols to export on request

my $json = JSON::PP->new->utf8(0)->allow_nonref(1);

sub сальдовка ($data) {# движение арендатора
  my $tmp = Mojo::File::tempfile(DIR=>'static/tmp');
  $$tmp .= '.xlsx';
  #~ open my $xfh, '>', \my $fdata or die "Failed to open filehandle: $!";
  open my $xfh, '>', $tmp->to_string
    or die "Failed to open filehandle: $!";
  my $workbook  = Excel::Writer::XLSX->new( $xfh );
  my $worksheet = $workbook->add_worksheet('Все договоры');
  
  my @columns = ('дата', 'оплата (приход)', 'счета/акты',  'категория', 'примечание');
  
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
  $worksheet->write_row($n++, 0, \@columns, $workbook->add_format( bold => 1, bottom=>1, align=>'center', bg_color=>'#B2DFDB',));#
  my @sum  = (0, 0);
  $worksheet->set_column( 0, 0, 15 );
  $worksheet->set_column( 1, 2, 15 );
  #~ $worksheet->set_column( 2, 3, 20 );
  $worksheet->set_column( 3, 4, 50 );
  my $num_format = '# ##0.00 [$₽-419];[RED]-# ##0.00 [$₽-419]';
  for (@$data) {
    $worksheet->write_row($n, 0, [_format_date($_->{'$дата'})], $workbook->add_format(align=>'right', bottom=>4, right=>1,  left=>1));#, bg_color=>$_->{'приход/num'} ? $color{плюс}{bg_color} : $color{минус}{bg_color}
    $worksheet->write_row($n, 1, [ @$_{qw(приход/num)}], $workbook->add_format( num_format=> $num_format, size=>13, bottom=>4, right=>1, %{$color{плюс}}));#,  bg_color=>$_->{'приход/num'} ? $color{плюс}{bg_color} : $color{минус}{bg_color}
    $worksheet->write_row($n, 2, [ @$_{qw(расход/num)}], $workbook->add_format( num_format=> $num_format, size=>13, bottom=>4, right=>1, %{$color{минус}}));#, bg_color=>$_->{'приход/num'} ? $color{плюс}{bg_color} : $color{минус}{bg_color}
    $worksheet->write_row($n, 3, [join(', ', @{$_->{'категория'}})], $workbook->add_format(bottom=>4, right=>1,) );#$workbook->add_format(bg_color=>$_->{'приход/num'} ? $color{плюс}{bg_color} : $color{минус}{bg_color})
    $worksheet->write_row($n, 4, [ @$_{qw(примечание)}], $workbook->add_format(bottom=>4, right=>1,) );#$workbook->add_format( size => 8)  # , $workbook->add_format(bg_color=>$_->{'приход/num'} ? $color{плюс}{bg_color} : $color{минус}{bg_color})
    $worksheet->write_row($n, 5, [ @$_{qw(договор/id)}], $workbook->add_format(bottom=>4, right=>1,) );
    $n++;
    #~ $worksheet->conditional_formatting( 'A1:A4',
    #~ {
        #~ type     => 'no_blanks',
        #~ format   => $format,
    #~ }
#~ );
    $sum[0] += $_->{'приход/num'} || 0;
    $sum[1] += $_->{'расход/num'} || 0;
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
  return $tmp;

}

sub реестр_актов ($data) {
  my $tmp = Mojo::File::tempfile(DIR=>'static/tmp');
  $$tmp .= '.xlsx';
  #~ open my $xfh, '>', \my $fdata or die "Failed to open filehandle: $!";
  open my $xfh, '>', $tmp->to_string
    or die "Failed to open filehandle: $!";
  my $workbook  = Excel::Writer::XLSX->new( $xfh );
  my $worksheet = $workbook->add_worksheet('Реестр актов');
 
  my $date_format = $workbook->add_format( num_format => 'D MMM, YYYY', align  => 'left', bottom=>4, right=>1,);
  my $num_format = $workbook->add_format( num_format=> '# ##0.00 [$₽-419];[RED]-# ##0.00 [$₽-419]', bottom=>4, right=>1,);# # ##0,00 [$₽-419]
  my $text_format = $workbook->add_format( num_format => '@', align  => 'left', bottom=>4, right=>1,);
  # порядок столбца, название, ширина, формат
  my %names = ('№'=>[1,'№', 3], 'номер счета'=>[2,"Номер\nсчета", 7], 'дата счета'=>[3,"Дата\nсчета", 10, $date_format],  'номер акта'=>[4,"Номер\nакта", 7], 'дата акта'=>[5, "Дата\nакта", 10, $date_format], 'сумма/num'=>[6, 'Сумма', 12, $num_format], 'договор/номер'=>[7, "Номер\nдоговора", 10], 'контрагент/title'=>[8, 'Арендатор', 50, $text_format], 'ИНН'=>[9, 'ИНН', 15, $text_format], 'объект'=>[10, 'Объект', 20, $text_format],'проект'=>[11, 'Арендодатель', 20, $text_format]);#'договор/дата завершения','договор/дата начала'=>'l', 
  my @cols = sort {$names{$a}[0] <=> $names{$b}[0]} keys %names;
  my $col = 0;
  $worksheet->set_column( $col++, 0, $names{$_}[2] || 30 )# тут формат не катит
    for @cols;#, $format
  $worksheet->set_row(0, 30);
    
  my $row = 0;
  # шапка
  $worksheet->write_row($row++,0, [map($names{$_}[1], @cols)], $workbook->add_format( bold => 1, bottom=>1, align=>'center', size=>13,bg_color=>'#C8E6C9'));
  
  my $n=1;
  my $s = 0;
  my $format = $workbook->add_format( bottom=>4, right=>1);
  for my $r (@$data) {
    my $col = 0;
    #~ $r->{'дата счета'} .= 'T';
    #~ $r->{'дата акта'} .= 'T';
    $r->{'№'}=$n++;
    $s += $r->{'сумма/num'};
    $worksheet->write($row, $col++, $r->{$_}, $names{$_}[3] || $format)
      for @cols;#$json->decode($_->{'$арендодатель'})->{name}
    $worksheet->write_date_time( $row, 2, $r->{'дата счета'} && $r->{'дата счета'}.'T', $date_format );
    $worksheet->write_date_time( $row, 4, $r->{'дата акта'} && $r->{'дата акта'}.'T', $date_format );
    
    
    $row++;
  }
  $worksheet->write_formula($row, $names{'сумма/num'}[0]-1, "=SUM(F2:F$row)", $workbook->add_format( num_format=> '# ##0.00 [$₽-419];[RED]-# ##0.00 [$₽-419]', bottom=>4, right=>1, bold=>1), $s);
  
  $workbook->close();
  return $tmp;
}

sub главный_отчет ($data) {
  my $tmp = Mojo::File::tempfile(DIR=>'static/tmp');
  $$tmp .= '.xlsx';
  #~ open my $xfh, '>', \my $fdata or die "Failed to open filehandle: $!";
  open my $xfh, '>', $tmp->to_string
    or die "Failed to open filehandle: $!";
  my $workbook  = Excel::Writer::XLSX->new( $xfh );
  my $worksheet = $workbook->add_worksheet('Отчет');
  
  my ($row, $col) = (0,0);
  $worksheet->set_column( 0, 0, 50 );
  $worksheet->set_column( 1, 4+(scalar @{ $data->{data}{'колонки'} }), 20 );
  
  
  $worksheet->set_row($row, 20);
  $worksheet->write($row, 0, 'Проект', $workbook->add_format( size=>'14',  align=>'right',));
  $worksheet->write($row++, 1, ($data->{param}{'проект'} && $data->{param}{'проект'}{name}) || 'все', $workbook->add_format(bold=>1, color=>'purple', bg_color=>'#BA68C8', size=>14,));
   #~ if $data->{param}{'проект'} && $data->{param}{'проект'}{name};
  $worksheet->set_row($row, 20);
   $worksheet->write($row, 0, 'Объект', $workbook->add_format( size=>'14', align=>'right',));
   $worksheet->write($row++, 1, ($data->{param}{'объект'} && $data->{param}{'объект'}{title}) || 'все', $workbook->add_format(bold=>1, color=>'#800000', bg_color=>'#EAD5D5', size=>14,));
  
   if ($data->{param}{'все контрагенты'} || $data->{param}{'контрагент'} && $data->{param}{'контрагент'}{title}) {
     $worksheet->set_row($row, 20);
     $worksheet->write($row, 0, 'Контрагент', $workbook->add_format( size=>'14', align=>'right',));
     $worksheet->write($row++, 1, ($data->{param}{'контрагент'} && $data->{param}{'контрагент'}{title}) || 'все', $workbook->add_format(bold=>1, color=>'#008000', bg_color=>'#E8F5E9', size=>14,));
    }
  
  $worksheet->write($row++, 0, 'Период', $workbook->add_format( size=>'14', align=>'right',));
  $worksheet->write($row, 0, 'От', $workbook->add_format( align=>'right', size=>'13'));
  $worksheet->write($row++, 1, $data->{param}{'дата'}{'формат'}[0], $workbook->add_format(bold=>1, bg_color=>'#CCFFCC'));
  $worksheet->write($row, 0, 'До', $workbook->add_format( align=>'right', size=>'13'));
  $worksheet->write($row++, 1, $data->{param}{'дата'}{'формат'}[1], $workbook->add_format(bold=>1, bg_color=>'#CCFFCC'));
  
  my $num_format = '[BROWN]# ##0.00 [$₽-419];[RED]-# ##0.00 [$₽-419]'; #$workbook->add_format( num_format=> '# ##0.00 [$₽-419];[RED]-# ##0.00 [$₽-419]');
  my %колонки = ();
  $row++;
  $worksheet->set_row($row, 30);
  #~ my $data_row = $row;# для автофильтра
  $worksheet->write($row++, 0, [
    'Интервалы / Категории',
    "Сальдо на\n$data->{param}{'дата'}{'формат'}[0]",
    (map {$_->{'номер колонки'}++; $колонки{$_->{key}} = $_; _title_format($_->{title});} @{ $data->{data}{'колонки'} }),
    "Всего",
    "Сальдо на\n$data->{param}{'дата'}{'формат'}[1]",
  ], $workbook->add_format(top=>1, bottom=>1, align=>'center', bold=>1, bg_color=>'#B2DFDB', size=>13,));
  #$data->{data}{'сальдо'}{'начало'}
  
  my @parent_title = ();
  my $level = 0;
  my $ncol = scalar keys %колонки;
  for my $r (@{$data->{data}{'строки'}}) {
    next
      unless !defined($r->{show}) || !!$r->{show} ;
    #~ $parent_title = ''
      #~ unless $_->{level};
    $r->{level} //= 0;
    @parent_title = ()
      unless $r->{level};
    
    if ($r->{id}){# финальная запись
      $row--;
      #~ my $n = $колонки{$r->{'код интервала'}}{'номер колонки'};
      #~ $worksheet->write($row, 0, [
          #~ undef,
          #~ undef,
          #~ $n ? ((undef) x ($n)) : (),
        #~ ],
        #~ $workbook->add_format(bg_color=>'#DDDDDD'),
      #~ );
      #~ $worksheet->write($row, 2+$n, 
        #~ join("\n", ($r->{sign} eq 1 ? '' : '-').$r->{sum}, $r->{дата_формат}, "$r->{'кошельки'}[1][0]:$r->{'кошельки'}[1][1]", "$r->{'кошельки'}[0][0]:$r->{'кошельки'}[0][1]", $r->{'примечание'}),# "кошельки" => [["С.В.", "касса"],["Гарантия","--- расходы по объектам" ]],
        #~ $workbook->add_format(valign => 'top',),
      #~ );
      #~ $worksheet->write($row, 3+$n, [
          #~ ($n+1)<$ncol ? ((undef) x ($ncol-$n-1)) : (),
          #~ undef,
          #~ undef,
        #~ ],
        #~ $workbook->add_format(bg_color=>'#DDDDDD'),
      #~ );
      #~ $worksheet->set_row($row, 50);
    
    } elsif ($data->{param}{'непустое движение'} && !eval _money($r->{'всего'})) {
      $row--;
    } else {
      my $title = ref $r->{title} ? "$r->{title}[0][0]:$r->{title}[0][1]" : $r->{title};
      push @parent_title, $title;
      #~ $title = !$r->{level} ? $title : $level eq $r->{level} ? $parent_title || $title :  $title;#"$parent_title/".
      $worksheet->write($row, 0,
        _title_format(($r->{level} ? "       " x $r->{level} : '').$title),
        $workbook->add_format( text_wrap=>1,bottom=>4, !$r->{level} ? (top=>1, bold=>1, size=>12,) : (bg_color => ($parent_title[0] ne 'расход') && (defined $r->{'всего'} ? $r->{'всего'} !~ /^-/ : $r->{sign} eq 1) ? '#A5D6A7' : '#FFCC80',),)
      );
      $worksheet->write($row, 1, [
        #~ _title_format(($r->{level} ? "   " x $r->{level} : '').$title),
        $r->{'сальдо1'} && _money($r->{'сальдо1'}),
        (map {
          $r->{'колонки'}{$_} && _money(($_ eq '-1' || $parent_title[0] eq 'расход' ? '-' : '').$r->{'колонки'}{$_})
        } sort {($a<0 ? (-1*$a).'000' : $a) cmp ($b<0 ?  (-1*$b).'000' : $b)} keys %колонки),#
        $r->{'всего'} && ($parent_title[0] eq 'расход' ? '-' : '')._money($r->{'всего'}),
        $r->{'сальдо2'} && _money($r->{'сальдо2'}),
      ],
      $workbook->add_format(num_format=> $num_format, right=>4, bottom=>4, !$r->{level} ? (align=>'center', top=>1, size=>12,) :(bg_color => ($parent_title[0] ne 'расход') &&  (defined $r->{'всего'} ? $r->{'всего'} !~ /^-/ : $r->{sign} eq 1) ? '#A5D6A7' : '#FFCC80',),)# 
      );
      #~ $worksheet->set_row($row, 30) wrap!!!
        #~ if length($title) > 35;
    }
    
    $level = $r->{level} // 0;
    $row++;
  }
  #~ $worksheet->autofilter( $data_row, 0, $row, 10 )
    #~ if $data->{param}{'место интервалов'} eq 'строки';

  $worksheet->set_row($row, 20);
  $worksheet->write($row++, 0, [
      'ИТОГО',
      _money($data->{data}{'сальдо'}{'начало'}),
      (map {$data->{data}{'сальдо'}{'колонки'} ? _money($data->{data}{'сальдо'}{'колонки'}{$_}) : _money($data->{data}{'итого'}{'колонки'}{$_}{sum}) } sort {($a<0 ? (-1*$a).'000' : $a) cmp ($b<0 ?  (-1*$b).'000' : $b)}  keys %колонки),#
      _money($data->{data}{'итого'}{'всего'}),
      _money($data->{data}{'сальдо'}{'конец'}),
    ],
    $workbook->add_format(num_format=> $num_format, right=>4, top=>1, bottom=>1, align=>'center', size=>14, bold=>1, bg_color=>'#B2DFDB',)
  );
  
  $workbook->close();
  return $tmp;
}

sub медкол_результаты_цепочки ($param, $data) {
  my $tmp = Mojo::File::tempfile(DIR=>'static/tmp');
  $$tmp .= '.xlsx';
  #~ open my $xfh, '>', \my $fdata or die "Failed to open filehandle: $!";
  open my $xfh, '>', $tmp->to_string
    or die "Failed to open filehandle: $!";
  my $workbook  = Excel::Writer::XLSX->new( $xfh );
  my $worksheet = $workbook->add_worksheet('Результаты');
  
  $worksheet->set_column( 1, 1, 50 );
  $worksheet->set_column( 2, 2, 30 );
  my $n = 0;
  
  for my $r (@$data) {
    next unless $r->{'%больше70'};
    my $t = $json->decode($r->{'последняя сессия/ts/json'});
    $t->{'сек.'} = ($t->{'second'} =~ /^(\d+)\.?/)[0];
    my $профиль = $r->{'$профиль'} ? $json->decode($r->{'$профиль'}) : {};
    my $пароль = $профиль->{'пароль'} || substr($профиль->{'ts/sha1/d'} || '', 0, 4);
    my $i = -1;
    $worksheet->write($n++,0,
      ["профиль № $профиль->{'логин'}:$пароль", (undef) x 3, "$r->{'%больше70'} из $r->{'всего сессий'}", undef],
      $workbook->add_format(right=>4, top=>1, bg_color=>'#B2DFDB',)
    );

    for my $percent (@{$r->{'%'} || []}) {
      $i++;
      next
        if $param->{'успехов'} && $percent < 70;
      next
        if defined($param->{'sha1'}) && $param->{'sha1'} ne '' && defined($param->{'тест'}) && $param->{'тест'} ne '' && $r->{'тест/id'}[$i] ne $param->{'тест'}; # фильтр теста здесь, не в запросе, если выставлен код сессии
      my $t = $json->decode($r->{'сессия/ts/json'}[$i]);
      my $check = $json->decode($r->{'сессия/дата проверки/json'}[$i])
        if $r->{'сессия/дата проверки'}[$i];
      #~ warn @{$r->{'тест/название'}};
      my $parents = $json->decode($r->{'@тест/название/родители'}[$i]);
      $worksheet->set_row($n, 30);
      $worksheet->write($n++,0, [
          $r->{'сессия/id'}[0], #$профиль->{'логин'} || 
          join(' • ', @$parents, $r->{'тест/название'}[$i]),#@{$r->{'@тест/название/родители'}[$i] || []},
          "$t->{'день нед'}, $t->{'day'} $t->{'месяца'} $t->{'year'} @{[ (length($t->{'hour'}) eq 1 ? '0' : '').$t->{'hour'} ]}:@{[ (length($t->{'minute'}) eq 1 ? '0' : '').$t->{'minute'} ]}",
          sprintf('%.1f%', $percent),
          substr($r->{'сессия/sha1'}[$i], 0,4),
          $check ? ' ☑ ' : ' □ ',
          #~ $check ? '✓проверено' : '',
        ],
        $workbook->add_format(num_format => '@', right=>4, text_wrap=>1, valign=>'top',)
      );
    }
  }
  $workbook->close();
  return $tmp;
}

sub долги_по_аренде ($data, $project, $now) {
  my $tmp = Mojo::File::tempfile(DIR=>'static/tmp');
  $$tmp .= '.xlsx';
  #~ open my $xfh, '>', \my $fdata or die "Failed to open filehandle: $!";
  open my $xfh, '>', $tmp->to_string
    or die "Failed to open filehandle: $!";
  my $workbook  = Excel::Writer::XLSX->new( $xfh );
  my $worksheet = $workbook->add_worksheet('Долги по аренде');
  
  my %color = (
    'плюс'=>{color => 'green'},#, bg_color=>'#C8E6C9',
    'минус'=>{color => 'purple'},#, bg_color=>'#E1BEE7',
  );
  
  $worksheet->set_column( 0, 0, 40 );
  $worksheet->set_column( 1, 1, 30 );
  #~ $worksheet->set_column( 2, 3, 40 );
  #~ $worksheet->set_column( 3, 4, 30 );
  
  $worksheet->set_row(0, 20);
  $worksheet->set_row(1, 20);
  $worksheet->set_row(2, 20);
  
  $worksheet->write_row(0, 0, ['Долги по аренде (без обеспечительного платежа)',], $workbook->add_format(size=>16, align=>'center', bold=>1));
  $worksheet->write_row(1, 0, ['На дату',], $workbook->add_format(align=>'right', size=>14,));
  $worksheet->write_row(1, 1, [sprintf('%s %s %s г. %s:%s', @$now{qw(day месяца year hour minute)})], $workbook->add_format(size=>14,));
  $worksheet->write_row(2, 0, ['Арендодатель',], $workbook->add_format(align=>'right', size=>14, bottom=>1,));
  $worksheet->write_row(2, 1, [$project->{'проект'}], $workbook->add_format( bold => 1, size=>14, %{$color{минус}}, bg_color=>'#E1BEE7', bottom=>1));
  
  my $n = 4;
  my $num_format = '# ##0.00 [$₽-419];[RED]-# ##0.00 [$₽-419]';
  for (@$data) {
    $worksheet->write_row($n, 0, [$_->{'контрагент'}], $workbook->add_format(bg_color=>'#C8E6C9', bottom=>4));#$workbook->add_format(%{$color{плюс}})
    $worksheet->write_row($n++, 1, [$_->{'сумма/numeric'}], $workbook->add_format(align=>'right', num_format=>$num_format, bottom=>4));#, bg_color=>$_->{'приход/num'} ? $color{плюс}{bg_color} : $color{минус}{bg_color}
    
  }
  
  $workbook->close();
  return $tmp;
}

sub _format_date ($date) {
  my $r = $json->decode($date);
  return "$r->{day} $r->{'месяца'} $r->{year}";
}

sub _title_format ($title) {
  $title =~ s/ря(\s+\d+)$/"рь$1"/ier
    =~ s/ля(\s+\d+)$/"ль$1"/ier
    =~ s/марта(\s+\d+)$/"март$1"/ier
    =~ s/мая(\s+\d+)$/"май$1"/ier
    =~ s/марта(\s+\d+)$/"март$1"/ier
    =~ s/июня(\s+\d+)$/"июнь$1"/ier
    =~ s/августа(\s+\d+)$/"август$1"/ier
}

sub _money ($num) {
  $num =~ s/(\d+)\s+(\d+)/"$1$2"/egr
    =~ s/\s+|₽//gr
    =~ s/,/./r
}

1;