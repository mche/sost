#!/bin/bash

cd Ostanin

source .bashrc
perlbrew use perl-5.26.1

MOJO_MODE=production
hypnotoad script/app.pl 2>/dev/null
#~ rm -rf static/cache/*
#~ rm -rf static/cache/android/*
#~ hypnotoad script/app.pl -s && 

#~ && cp /dev/null log/mojo.log

exit 0

