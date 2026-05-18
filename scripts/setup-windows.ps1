# Prepara dependencias npm en Windows 11.
# Ejecutar desde la carpeta raiz del proyecto: .\scripts\setup-windows.ps1

Write-Host "Instalando dependencias raiz, backend y frontend..."
npm run install:all

if (-not (Test-Path ".\backend\.env")) {
  Copy-Item ".\backend\.env.example" ".\backend\.env"
  Write-Host "Creado backend\.env desde la plantilla."
}

Write-Host "Dependencias listas. Revisa backend\.env antes de migrar la base de datos."

