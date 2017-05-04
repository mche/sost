#!/bin/bash

ROOT=/home/guest/Lovigazel.ru
# только старт гипнотода, далее только пидфайл
SCRIPT=$ROOT/script/app.sh
LOG=log/mojo.log
CACHE=$ROOT/static/cache/*
USER=guest # su
GROUP=guest
#Note that this value can only be changed after the server has been stopped.
PIDFILE=$ROOT/hypnotoad-443.pid

THIS=$0
ACTION=$1
shift

#~ set -e

case $ACTION in # был shift!!!
  start)
		echo -n "Starting $SCRIPT... "
		# тут убрал --pidfile $PIDFILE и происходит автоматическая Upgrade successful, stopping <PID>...
		start-stop-daemon --start --user $USER --exec $SCRIPT && echo "OK." && exit 0
		echo "NOT STARTED."
	;;
  stop)
		echo -n "Gracefully stopping $SCRIPT... "
		start-stop-daemon --signal 3 --pidfile $PIDFILE && echo "OK." && exit 0
		echo "NOT STARTED."
	;;
  upgrade)
		echo -n "Upgrade (hot deployment) $SCRIPT... " 
		start-stop-daemon --signal 12 --pidfile $PIDFILE && echo "OK." && exit 0
		echo "NOT STARTED."
	;;
  force-stop)
		echo -n "Immediately stoping $SCRIPT... " 
		start-stop-daemon --signal 15 --pidfile $PIDFILE && echo "OK." && exit 0
		echo "NOT STARTED."
	;;
  restart)
		#~ echo -n "Restarting $SCRIPT..."
		$0 stop && $0 start
		#~ echo "OK."
		
	;;
  clean-cache)
		echo -n "Cleaning $CACHE... "
		rm -rf $CACHE
		echo "OK."
	;;
	clean-cache-start)
		$0 clean-cache && $0 start
	;;
	
	*)  
		echo "Usage: $THIS {start|stop|restart|upgrade|force-stop|clean-cache|clean-cache-start}" >&2
	exit 1
	;;
esac
exit 0
