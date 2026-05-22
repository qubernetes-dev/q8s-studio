#! /usr/bin/bash

cd ~/devel/q8s-launcher/
rm Q8Sproject
rm /home/edciriac/.config/q8s-studio/user-configurations/*
source ../experiment/.experiment_venv/bin/activate

pwd

echo $VIRTUAL_ENV
pip uninstall -y q8s 
npm start &
sleep 5
gnome-terminal --profile=timer --window -- /home/edciriac/Documents/scriptit/timer.sh
$SHELL

