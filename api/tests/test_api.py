import boto3
import pytest
from moto import mock_aws

from app import store as st
from app.main import create_app
from app.store import Store, percents

POLL = {"question": "¿Mejor lenguaje?", "options": ["Python", "Go", "Rust"]}


def make(client, body=None):
    return client.post("/api/polls", json=body or POLL)


def vote(client, poll_id, opt=0, voter="v1"):
    return client.post(
        f"/api/polls/{poll_id}/votes", json={"option_id": opt, "voter_id": voter}
    )


def test_create_ok(client):
    res = make(client)
    data = res.get_json()
    assert res.status_code == 201
    assert len(data["id"]) == 8 and len(data["admin_code"]) == 10
    assert data["options"][0] == {"id": 0, "text": "Python", "votes": 0, "percent": 0}
    assert data["closed"] is False


@pytest.mark.parametrize(
    "body",
    [
        None,
        {"question": "ab", "options": ["a", "b"]},
        {"question": "x" * 201, "options": ["a", "b"]},
        {"question": "Hola?", "options": ["solo"]},
        {"question": "Hola?", "options": list("abcdefg")},
        {"question": "Hola?", "options": ["a", ""]},
        {"question": "Hola?", "options": ["a", "x" * 81]},
        {"question": "Hola?", "options": ["a", 3]},
        {"question": "Hola?", "options": ["Si", "si"]},
        {"question": 5, "options": ["a", "b"]},
    ],
)
def test_create_invalid(client, body):
    res = client.post("/api/polls", json=body) if body else client.post("/api/polls")
    assert res.status_code == 400
    assert "error" in res.get_json()


def test_get_hides_admin_code_and_404(client):
    poll_id = make(client).get_json()["id"]
    data = client.get(f"/api/polls/{poll_id}").get_json()
    assert "admin_code" not in data
    assert client.get("/api/polls/nope").status_code == 404


def test_vote_and_single_vote(client):
    poll_id = make(client).get_json()["id"]
    res = vote(client, poll_id, 1)
    assert res.status_code == 200
    assert res.get_json()["options"][1]["votes"] == 1
    assert vote(client, poll_id, 2).status_code == 409
    assert client.get(f"/api/polls/{poll_id}").get_json()["total_votes"] == 1


def test_vote_invalid_option_and_body(client):
    poll_id = make(client).get_json()["id"]
    assert vote(client, poll_id, 9).status_code == 400
    assert vote(client, poll_id, -1).status_code == 400
    url = f"/api/polls/{poll_id}/votes"
    assert client.post(url).status_code == 400
    assert client.post(url, json={"option_id": "0", "voter_id": "a"}).status_code == 400
    assert client.post(url, json={"option_id": 0, "voter_id": ""}).status_code == 400
    assert vote(client, "nope").status_code == 404


def test_percents_sum_100():
    assert percents([0, 0]) == [0, 0]
    assert percents([1, 1, 1]) == [34, 33, 33]
    assert sum(percents([7, 3, 5, 11, 1])) == 100


def test_percents_in_response(client):
    poll_id = make(client).get_json()["id"]
    for i, opt in enumerate([0, 1, 2]):
        res = vote(client, poll_id, opt, f"v{i}")
    assert sum(o["percent"] for o in res.get_json()["options"]) == 100


def test_close_codes_and_closed_poll(client):
    data = make(client).get_json()
    url = f"/api/polls/{data['id']}/close"
    assert client.post(url).status_code == 403
    assert client.post(url, headers={"X-Admin-Code": "mal"}).status_code == 403
    ok = client.post(url, headers={"X-Admin-Code": data["admin_code"]})
    assert ok.status_code == 200 and ok.get_json()["closed"] is True
    again = client.post(url, headers={"X-Admin-Code": data["admin_code"]})
    assert again.status_code == 200
    assert vote(client, data["id"]).status_code == 409
    assert client.post("/api/polls/nope/close").status_code == 404


def test_close_race_releases_vote(client, monkeypatch):
    # Simula que la encuesta se cierra entre la lectura y el incremento
    data = make(client).get_json()
    real = st.Store.get_poll

    def stale(self, poll_id):
        item = real(self, poll_id)
        self.table.update_item(
            Key={"pk": f"POLL#{poll_id}"},
            UpdateExpression="SET closed = :t",
            ExpressionAttributeValues={":t": True},
        )
        return item

    monkeypatch.setattr(st.Store, "get_poll", stale)
    assert vote(client, data["id"]).status_code == 409


@pytest.mark.usefixtures("client")
def test_health_ok(monkeypatch):
    monkeypatch.setenv("APP_VERSION", "1.0.7")
    res = create_app().test_client().get("/api/health")
    assert res.status_code == 200
    assert res.get_json() == {
        "status": "ok",
        "version": "1.0.7",
        "commit": "local",
        "environment": "local",
        "database": "ok",
    }


def test_health_db_down():
    with mock_aws():  # sin tabla: DynamoDB responde error
        res = create_app().test_client().get("/api/health")
    assert res.status_code == 503
    body = res.get_json()
    assert body["status"] == "error" and body["database"] == "error"


def test_ensure_table_with_endpoint(monkeypatch):
    with mock_aws():
        monkeypatch.setenv("DYNAMODB_ENDPOINT", "http://localhost:5000")
        monkeypatch.setenv("TABLE_NAME", "nueva")
        store = Store("nueva", "us-east-1")
        store.ensure_table()
        store.ensure_table()  # idempotente
        store.ping()
        assert boto3.client("dynamodb", region_name="us-east-1").list_tables()[
            "TableNames"
        ] == ["nueva"]
