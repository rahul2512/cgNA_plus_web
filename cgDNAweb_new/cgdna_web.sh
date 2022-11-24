#!/bin/bash

CTRL=$1

#if [ -z "$PERLBREW_ROOT" ]; then
#  export PERLBREW_ROOT=/opt/perlbrew
#  . $PERLBREW_ROOT/etc/bashrc
#fi

set -o nounset
set -o errexit

WAPP=cgdna_web
RUNHOME=/home/debruin/cgDNAweb_new/
RUNUSER=$(id -un)

cd $RUNHOME

#env|sort
#export MOJO_LOG_LEVEL=debug

case $CTRL in
  "start")
        exec >>log/$WAPP.out 2>&1
	hypnotoad -f script/$WAPP &
	;;

  "stop")
        hypnotoad -s script/$WAPP
        if [ -f hypnotoad.pid ]; then
	  kill -TERM $(cat script/hypnotoad.pid)
        fi
	;;
 
 *)
	echo "wrong parameter $CTRL"
	exit 99
	;;

esac

exit 0
