$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
if (-not (Test-Path '.venv/Scripts/python.exe')) { py -3.12 -m venv .venv }
if ($LASTEXITCODE) { throw 'Python environment creation failed' }
& .venv/Scripts/python.exe -m pip install -r requirements-api.txt -r requirements-dev.txt
if ($LASTEXITCODE) { throw 'Dependency installation failed' }
Push-Location frontend
try { npm ci; if ($LASTEXITCODE) { throw 'Frontend dependency installation failed' } }
finally { Pop-Location }
