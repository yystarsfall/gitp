@echo off
node "%~dp0dist\index.js" %*
exit /b %errorlevel%