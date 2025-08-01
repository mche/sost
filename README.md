# О проекте SOST

Это внутренний корпоративный портал учета для группы строительных контор.

Базовая браузерная нагрузка на фреймворк AngularJS (version >1.7.x).
С постепенным переходом на Vue.

Серверный Perl фреймворк - Mojolicious (version >7.xx)

# Сторонние (CPAN) модули Perl

Список в файле C< perlbrew.list-modules >

    #список получен командой
    perlbrew list-modules > list-modules
    # или лучше
    perl -MExtUtils::Installed -E 'say for ExtUtils::Installed->new->modules' > list-modules
    
    # применить установку списка (https://perlbrew.pl/Reinstall-All-Modules-On-New-Perl.html)
    cat list-modules | perlbrew exec --with perl-5.xx.x cpanm


# Основные модули системы

## Управление списками сотрудников, групп, ролей и маршрутов системы

Это мощный модуль типа ActiveDirectory. Доступ в системе, различные привязки сотрудников к объектам строительства, должностям, бригадам, ...

    lib/Controll/Access.pm
    lib/Model/Access.pm
    templates/access/
    static/js/components/access/

## Учет денежных средств

    lib/Controll/Waltex.pm
    templates/waltex/

### Движение денежных средств

Форма ввода прихода/расхода по контрагентам, сотрудникам, а также внутренние перемещения между проектами.

    lib/Controll/Waltex/Money.pm
    static/js/components/waltex/money


### Отчет по денежным средствам

На основе данных движения ДС.

    lib/Controll/Waltex/Report.pm
    templates/waltex/report/
    static/js/components/waltex/report/

## Учет рабочего времени

    lib/Controll/TimeWork.pm
    lib/Model/TimeWork.pm
    templates/timework/

### Табель учета рабочего времени 

Форма одного месяца, одного объекта.

    static/js/components/timework/form.*

### Сводка по табелю рабочего времени 

Начисление заработанных сумм, контроль баланса начислений и выплат.

    static/js/components/timework/report.*

### Учет ТМЦ

    lib/Controll/TMC.pm
    lib/Model/TMC.pm
    templates/tmc/

### Заявки ТМЦ на объектах

Форма одной позиции заявки вводят на объектах. Список заявок.

    static/js/components/tmc/ask-form.*
    static/js/components/tmc/ask-table.*

### Заявки ТМЦ на оплате

Форма ввода для снабженца к заявкам ТМЦ данных о факте оплаты.

    static/js/components/tmc/ask-snab-form.*
    static/js/components/tmc/ask-snab-table.*

## Учет транспорта/техники и заявок

    lib/Controll/Transport.pm
    lib/Model/Transport.pm
    templates/transport/
    static/js/components/transport/


# Бакапы

## crontab -l

    # Global variables
    SHELL=/bin/bash
    PB='source ~/perl5/perlbrew/etc/bashrc; source ~/postgresql/env; perlbrew use perl-5.26.1'

    LANG=ru_RU.utf8
    WDAYHOUR=date +%a%H

    # если --format=с то восст pg_restore -U postgres -d dbname -v [файл]
    20 9-23 * * * cd ~/папка; eval $PB; pg_dump  --no-owner --exclude-schema=tmp --exclude-table-data=public.logs dbname |  gpg -q --batch --yes -e -r my@email.ru --trust-model always -z 9  > backup/$($WDAYHOUR).pg.dump.gpg 2>/dev/null
    25 9-23 * * * cd ~/папка; eval $PB; echo "start $($WDAYHOUR).pg.dump.gpg" >> log/cron-backup.log; perl script/mailru-cloud.pl --file=backup/$($WDAYHOUR).pg.dump.gpg --path=backup --cred='user:pass'  2>>~/папка/log/cron-backup.log >/dev/null

## Развернуть бакап базы данных

    # в другом месте
    gpg --import Загрузки/мой\ ключ\ гпг.gpg
    gpg --output - --decrypt Вт23.pg.dump.gpg > Вт23.pg.dump
    createdb -U postgres dbname
    psql -U postgres dbname < Вт23.pg.dump

## Вся папка проекта

    # не включать большой файл и скрытые пункты
    tar --exclude='.[^/]*' --exclude="*.gpg" --exclude="*.log" -cvjf -  папка/ | gpg -q --batch --yes -e -r my@email.ru --trust-model always  > папка.tar.bz2.gpg
    
    # в другом месте
    gpg --import Загрузки/мой\ ключ\ гпг.gpg
    
    gpg --output папка.tar.bz2 --decrypt папка.tar.bz2.gpg
    gpg --output - --decrypt папка.tar.bz2.gpg | tar -tjf -
    gpg --output - --decrypt папка.tar.bz2.gpg | tar -xvjf -

# Тесты

   ~/github/apib/apib  -d 1 -k 0 -c 1  -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:60.0) Gecko/20100101 Firefox/60.0' -H 'Accept: application/json, text/plain, */*' -H 'Accept-Language: ru-RU,ru;q=0.8,en-US;q=0.5,en;q=0.3' -H 'Referer: http://localhost:3000/waltex' -H 'Cookie: OST=e.........' -H 'Connection: keep-alive' -H 'Pragma: no-cache' -H 'Cache-Control: no-cache' -H "Content-Type: application/json" -f ~/money.json http://localhost:3000/waltex/money/save

# SEE ALSO


# AUTHOR

Михаил Че (Mikhail Che), C<< <mche[-at-]cpan.org> >>

# BUGS / CONTRIBUTING

Please report any bugs or feature requests at L<https://github.com/mche/sost/issues>. Pull requests also welcome.

# COPYRIGHT

Copyright 2017-* Mikhail Che.

This library is free software; you can redistribute it and/or modify
it under the same terms as Perl itself.

