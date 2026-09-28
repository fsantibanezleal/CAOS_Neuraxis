param([switch]$SkipModels)
$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')
if (-not (Test-Path '.venv/Scripts/python.exe')) { py -3.12 -m venv .venv }
if ($LASTEXITCODE) { throw 'Python environment creation failed' }
& .venv/Scripts/python.exe -m pip install -r requirements-api.txt -r requirements-dev.txt
if ($LASTEXITCODE) { throw 'Dependency installation failed' }
if (-not $SkipModels) {
    # Checkpoints remain the audited engine v0.01.000 assets; the app version is unrelated.
    $modelRelease = 'v0.01.000'
    & .venv/Scripts/python.exe -m reflexmesh.cli fetch-models --destination models/checkpoints --version $modelRelease
    if ($LASTEXITCODE) { throw 'Verified model installation failed' }
}
Push-Location frontend
try { npm ci; if ($LASTEXITCODE) { throw 'Frontend dependency installation failed' } }
finally { Pop-Location }
Write-Output 'Setup complete. Build with: cd frontend; npm run build'
Write-Output 'Start from the repository root: .venv/Scripts/python.exe scripts/serve.py'
