#!/bin/sh

tail -10f ./temp.txt |
awk '
BEGIN { last_grader = "0.00000"; }
{
  grader = $1;
  printf ("New %s old %s\n",grader,last_grader);
  if (grader != last_grader) {
     system("/home/pi/bin/light.sh on");
     system("sleep 1");
     system("/home/pi/bin/light.sh");
  }
  last_grader = grader;
}'

/home/pi/bin/light.sh
