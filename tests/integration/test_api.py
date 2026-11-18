# tests/integration/test_api.py
"""Pruebas de integración: la API real con DynamoDB real (staging o stack local)."""
import os
import uuid

import requests

BASE_URL = os.environ["APP_BASE_URL"].rstrip("/")


def crear(opciones=("Python", "Java")):
    r = requests.post(
        f"{BASE_URL}/api/polls",
        json={"question": "¿Qué lenguaje prefieres?", "options": list(opciones)},
        timeout=10,
    )
    assert r.status_code == 201, r.text
    return r.json()


def votar(poll_id, option_id, voter_id=None):
    return requests.post(
        f"{BASE_URL}/api/polls/{poll_id}/votes",
        json={"option_id": option_id, "voter_id": voter_id or uuid.uuid4().hex},
        timeout=10,
    )


def test_health():
    datos = requests.get(f"{BASE_URL}/api/health", timeout=10).json()
    assert datos["status"] == "ok"
    assert datos["database"] == "ok"


def test_crear_y_consultar_sin_admin_code():
    poll = crear()
    assert len(poll["id"]) == 8 and poll["admin_code"]
    assert poll["total_votes"] == 0 and poll["closed"] is False
    leida = requests.get(f"{BASE_URL}/api/polls/{poll['id']}", timeout=10)
    assert leida.status_code == 200
    assert "admin_code" not in leida.json()


def test_votar_y_porcentajes_suman_100():
    poll = crear(("A", "B", "C"))
    for opcion in (0, 1, 2):
        assert votar(poll["id"], opcion).status_code == 200
    final = votar(poll["id"], 0).json()
    assert final["total_votes"] == 4
    assert sum(o["percent"] for o in final["options"]) == 100


def test_voto_repetido_es_409():
    poll = crear()
    assert votar(poll["id"], 0, "votante-fijo").status_code == 200
    assert votar(poll["id"], 1, "votante-fijo").status_code == 409


def test_opcion_inexistente_es_400():
    assert votar(crear()["id"], 9).status_code == 400


def test_encuesta_inexistente_es_404():
    assert requests.get(f"{BASE_URL}/api/polls/noexiste", timeout=10).status_code == 404
    assert votar("noexiste", 0).status_code == 404


def test_encuesta_invalida_es_400():
    r = requests.post(
        f"{BASE_URL}/api/polls",
        json={"question": "¿Una sola opción?", "options": ["Sola"]},
        timeout=10,
    )
    assert r.status_code == 400 and "error" in r.json()


def test_cierre_con_codigo_y_votos_bloqueados():
    poll = crear()
    url = f"{BASE_URL}/api/polls/{poll['id']}/close"
    assert requests.post(url, timeout=10).status_code == 403
    assert requests.post(url, headers={"X-Admin-Code": "mal"}, timeout=10).status_code == 403
    cabecera = {"X-Admin-Code": poll["admin_code"]}
    cierre = requests.post(url, headers=cabecera, timeout=10)
    assert cierre.status_code == 200 and cierre.json()["closed"] is True
    # Cerrar dos veces es idempotente
    assert requests.post(url, headers=cabecera, timeout=10).status_code == 200
    assert votar(poll["id"], 0).status_code == 409
