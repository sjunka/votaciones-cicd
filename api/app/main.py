"""API de votaciones: fábrica de la app Flask."""

import os

from botocore.exceptions import BotoCoreError, ClientError
from flask import Flask, jsonify, request

from app.store import Conflicto, NoExiste, Store, view


def _error(msg, code):
    return jsonify({"error": msg}), code


def _validate_poll(body):
    """Devuelve (pregunta, opciones) o lanza ValueError con mensaje en español."""
    if not isinstance(body, dict):
        raise ValueError("El cuerpo debe ser JSON")
    q = body.get("question")
    opts = body.get("options")
    if not isinstance(q, str) or not 3 <= len(q.strip()) <= 200:
        raise ValueError("La pregunta debe tener entre 3 y 200 caracteres")
    if not isinstance(opts, list) or not 2 <= len(opts) <= 6:
        raise ValueError("Debe haber entre 2 y 6 opciones")
    clean = []
    for o in opts:
        if not isinstance(o, str) or not 1 <= len(o.strip()) <= 80:
            raise ValueError("Cada opción debe tener entre 1 y 80 caracteres")
        clean.append(o.strip())
    if len({o.lower() for o in clean}) != len(clean):
        raise ValueError("Las opciones no pueden repetirse")
    return q.strip(), clean


def create_app():
    app = Flask(__name__)
    env = os.environ.get
    store = Store(
        env("TABLE_NAME", "votaciones-local"),
        env("AWS_REGION", "us-east-1"),
        env("DYNAMODB_ENDPOINT"),
    )
    if env("DYNAMODB_ENDPOINT"):
        store.ensure_table()

    @app.get("/api/health")
    def health():
        info = {
            "version": env("APP_VERSION", "dev"),
            "commit": env("APP_COMMIT", "local"),
            "environment": env("APP_ENV", "local"),
        }
        try:
            store.ping()
        except (BotoCoreError, ClientError):
            return jsonify({"status": "error", **info, "database": "error"}), 503
        return jsonify({"status": "ok", **info, "database": "ok"})

    @app.post("/api/polls")
    def create_poll():
        try:
            q, opts = _validate_poll(request.get_json(silent=True))
        except ValueError as err:
            return _error(str(err), 400)
        return jsonify(view(store.create_poll(q, opts), with_admin=True)), 201

    @app.get("/api/polls/<poll_id>")
    def get_poll(poll_id):
        try:
            return jsonify(view(store.get_poll(poll_id)))
        except NoExiste:
            return _error("La encuesta no existe", 404)

    @app.post("/api/polls/<poll_id>/votes")
    def vote(poll_id):
        body = request.get_json(silent=True)
        if not isinstance(body, dict):
            return _error("El cuerpo debe ser JSON", 400)
        opt, voter = body.get("option_id"), body.get("voter_id")
        if isinstance(opt, bool) or not isinstance(opt, int):
            return _error("option_id debe ser un entero", 400)
        if not isinstance(voter, str) or not 1 <= len(voter) <= 64:
            return _error("voter_id debe tener entre 1 y 64 caracteres", 400)
        try:
            return jsonify(view(store.vote(poll_id, opt, voter)))
        except NoExiste:
            return _error("La encuesta no existe", 404)
        except Conflicto as err:
            return _error(str(err), 409)
        except ValueError as err:
            return _error(str(err), 400)

    @app.post("/api/polls/<poll_id>/close")
    def close(poll_id):
        try:
            code = request.headers.get("X-Admin-Code")
            return jsonify(view(store.close(poll_id, code)))
        except NoExiste:
            return _error("La encuesta no existe", 404)
        except PermissionError:
            return _error("Código de administrador incorrecto", 403)

    return app
