#! /usr/bin/bash
gedit ~/devel/experiment-correct-files/example_of_q8sproject_file &
gnome-terminal --profile=timer --window -- /home/edciriac/Documents/scriptit/timer.sh
cd ~/devel/experiment/
rm Q8Sproject
source ./.experiment_venv/bin/activate
pip uninstall -y q8s > /dev/null 2>&1
cd ~/devel/

$SHELL
