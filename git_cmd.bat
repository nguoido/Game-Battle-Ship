@echo off
REM XET KHUNG HINH
mode con:cols=60 lines=23
title %~nx0
echo ------------------------------------------------------------
echo ---------------------     GitHup     ---------------------
echo ------------------------------------------------------------

echo 1. pull
echo 2. push

echo ------------------------------------------------------------
set p= 
set /p p= OPTION:

if %p% == 1 goto option1 
if %p% == 2 goto option2

:option1
start git pull
pause

:option2
git add *
git commit -m "o"
git push
exit