# tests/smoke/test_smoke.py
"""Pruebas de humo (solo lectura): la aplicación desplegada responde."""
import os

import requests

BASE_URL = os.environ["APP_BASE_URL"].rstrip("/")
EXPECTED_VERSION = os.environ.get("EXPECTED_VERSION")


def test_la_web_carga():
    r = requests.get(BASE_URL + "/", timeout=10)
    assert r.status_code == 200
    assert 'id="root"' in r.text


def test_health_y_version():
    r = requests.get(BASE_URL + "/api/health", timeout=10)
    assert r.status_code == 200
    datos = r.json()
    assert datos["status"] == "ok"
    assert datos["database"] == "ok"
    if EXPECTED_VERSION:
        assert datos["version"] == EXPECTED_VERSION
