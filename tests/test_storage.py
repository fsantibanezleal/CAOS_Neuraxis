from pathlib import Path

from app.config import ROOT, storage_path


def test_default_storage_is_external(monkeypatch, tmp_path):
    monkeypatch.delenv("NEURAXIS_CHECKPOINTS", raising=False)
    monkeypatch.delenv("LOCALAPPDATA", raising=False)
    monkeypatch.delenv("XDG_CACHE_HOME", raising=False)
    monkeypatch.setattr(Path, "home", lambda: tmp_path)
    path = storage_path("NEURAXIS_CHECKPOINTS", "cache", "checkpoints")
    assert path.is_relative_to(tmp_path)
    assert not path.is_relative_to(ROOT)


def test_explicit_storage_override(monkeypatch, tmp_path):
    monkeypatch.setenv("NEURAXIS_CHECKPOINTS", str(tmp_path / "models"))
    assert storage_path("NEURAXIS_CHECKPOINTS", "cache", "checkpoints") == tmp_path / "models"
