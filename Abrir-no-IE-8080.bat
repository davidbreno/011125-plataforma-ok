@echo off
REM Tenta abrir no Internet Explorer; se não existir, usa Edge; caso contrário, usa navegador padrão
set URL=http://127.0.0.1:8080/
if exist "%ProgramFiles%\Internet Explorer\iexplore.exe" (
  start "" "%ProgramFiles%\Internet Explorer\iexplore.exe" %URL%
  exit /b 0
)
where msedge >nul 2>&1
if %ERRORLEVEL%==0 (
  start "" msedge %URL%
  exit /b 0
)
start "" %URL%
