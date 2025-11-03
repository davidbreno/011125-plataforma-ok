@echo off
cd /d "%~dp0"
REM Inicia o preview fixo em 127.0.0.1:8080 e abre o navegador
REM Caso a porta esteja ocupada, mostra mensagem amigável
where npm >nul 2>&1
if not %ERRORLEVEL%==0 (
  echo NPM nao encontrado no PATH. Instale Node.js e tente novamente.
  pause
  exit /b 1
)
start "Servidor Preview" cmd /c "npm run preview -- --port 8080 --host 127.0.0.1"
REM pequeno atraso para o servidor iniciar
powershell -Command "Start-Sleep -Seconds 2"
start "" http://127.0.0.1:8080/
