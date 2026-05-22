#! /usr/bin/bash

seconds=60*10; date1=$((`date +%s` + $seconds));
while [ "$date1" -ge `date +%s` ]; do
  echo -ne "Time left $(date -u --date @$(($date1 - `date +%s` )) +%H:%M:%S)\r";
done
gsettings set org.gnome.desktop.notifications show-banners true
notify-send "TIME IS UP. Please switch to the questionnaire" --hint=string:sound-name:bell 
sleep 1
gsettings set org.gnome.desktop.notifications show-banners false
