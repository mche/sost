#!/sbin/openrc-run
# Copyright 1999-2017 Gentoo Foundation
# Distributed under the terms of the GNU General Public License v2

extra_commands="clean_cache"
extra_started_commands="reload upgrade force_stop"
#~ extra_stopped_commands="clean-cache-start"

description="Веб-ОСТ"

ROOT=/home/guest/sost
# только старт гипнотода, далее только пидфайл
SCRIPT=$ROOT/script/app.sh
LOG=log/mojo.log
CACHE=$ROOT/static/cache/*
USER=guest # su
GROUP=guest
#Note that this value can only be changed after the server has been stopped.
PIDFILE=$ROOT/hypnotoad.pid

depend() {
    use net
    after postgresql
}


start() {
  ebegin "Starting [$description]"
  su - $USER -c \
       "cd ~/sost; \
        source ~/.bashrc; \
        perlbrew use perl-5.32.1; \
        MOJO_MODE=production; \
        hypnotoad script/app.pl 2>/dev/null;  "

  local retval=$?
  if [ $retval -ne 0 ] ; then
      eerror "ошибка в логе ${ROOT}/${LOG}"
  fi
  eend $retval
}

stop() {
  ebegin "Gracefully stopping [$description]"
  start-stop-daemon --signal 3 --pidfile $PIDFILE 
  local retval=$?
  if [ $retval -ne 0 ] ; then
      eerror "видимо не запущен"
  fi
  eend $retval
}

#~ reload() {
  #~ upgrade()
#~ }

upgrade() {
  ebegin "Upgrade (hot deployment) [$description]"
  start-stop-daemon --signal 12 --pidfile $PIDFILE
  local retval=$?
  if [ $retval -ne 0 ] ; then
      eerror "видимо не запущен"
  fi
  eend $retval
}

force_stop() {
  ebegin "Immediately stoping [$description]"
  start-stop-daemon --signal 15 --pidfile $PIDFILE
  local retval=$?
  if [ $retval -ne 0 ] ; then
      eerror "видимо не запущен"
  fi
  eend $retval
}

clean_cache() {
  ebegin "Cleaning $CACHE of [$description]"
  rm -rf $CACHE
  eend $retval
}




