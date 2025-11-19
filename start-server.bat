@echo off
echo.
echo ================================
echo GameZone Store - Local Server
echo ================================
echo.
echo Iniciando servidor en puerto 8000...
echo Abriendo navegador en http://localhost:8000
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

cd /d "%~dp0public"
python -m http.server 8000
