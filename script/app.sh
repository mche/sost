#!/bin/bash

#~ ROOT=~/Lovigazel.ru
#~ SCRIPT="script/app.pl"
#~ LOG="log/mojo.log"
#~ PIDFILE=hypnotoad-443.pid

MOJO_MODE=production
source ~/.bashrc
perlbrew use perl-5.25.6

cd ~/Lovigazel.ru
hypnotoad script/app.pl #2>/dev/null
#~ rm -rf static/cache/*
#~ rm -rf static/cache/android/*
#~ hypnotoad script/app.pl -s && 

#~ && cp /dev/null log/mojo.log

exit 0

