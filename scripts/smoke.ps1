$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
& .venv/Scripts/python.exe scripts/check_artifacts.py
if ($LASTEXITCODE) { throw 'Artifact validation failed' }
& .venv/Scripts/python.exe scripts/check_semantic_transfer.py
if ($LASTEXITCODE) { throw 'Semantic-transfer validation failed' }
& .venv/Scripts/python.exe scripts/check_semantic_routing.py
if ($LASTEXITCODE) { throw 'Semantic-routing validation failed' }
& .venv/Scripts/python.exe -m pytest
if ($LASTEXITCODE) { throw 'Application tests failed' }
Push-Location frontend
try { npm run build; if ($LASTEXITCODE) { throw 'Frontend build failed' } }
finally { Pop-Location }
