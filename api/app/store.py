"""Acceso a DynamoDB: encuestas y votos."""

import secrets
import string

import boto3
from botocore.exceptions import ClientError

ALFABETO = string.ascii_letters + string.digits


class Conflicto(Exception):
    """Encuesta cerrada o voto repetido."""


class NoExiste(Exception):
    """La encuesta no existe."""


def percents(votes):
    """Porcentajes enteros que suman 100 (resto mayor)."""
    total = sum(votes)
    if total == 0:
        return [0] * len(votes)
    base = [v * 100 // total for v in votes]
    # Los que más resto tienen reciben el punto que falta
    orden = sorted(range(len(votes)), key=lambda i: -(votes[i] * 100 % total))
    for i in orden[: 100 - sum(base)]:
        base[i] += 1
    return base


def view(item, with_admin=False):
    votes = [int(v) for v in item["votes"]]
    pct = percents(votes)
    out = {
        "id": item["pk"].split("#", 1)[1],
        "question": item["question"],
        "options": [
            {"id": i, "text": t, "votes": votes[i], "percent": pct[i]}
            for i, t in enumerate(item["options"])
        ],
        "total_votes": sum(votes),
        "closed": bool(item["closed"]),
    }
    if with_admin:
        out["admin_code"] = item["admin_code"]
    return out


class Store:
    def __init__(self, table_name, region, endpoint=None):
        res = boto3.resource("dynamodb", region_name=region, endpoint_url=endpoint)
        self.table = res.Table(table_name)
        self.res = res
        self.name = table_name

    def ensure_table(self):
        """Solo para DynamoDB Local: en AWS la tabla la crea Terraform."""
        try:
            self.res.create_table(
                TableName=self.name,
                KeySchema=[{"AttributeName": "pk", "KeyType": "HASH"}],
                AttributeDefinitions=[{"AttributeName": "pk", "AttributeType": "S"}],
                BillingMode="PAY_PER_REQUEST",
            )
        except ClientError as err:
            if err.response["Error"]["Code"] != "ResourceInUseException":
                raise

    def ping(self):
        self.table.load()

    def create_poll(self, question, options):
        poll_id = "".join(secrets.choice(ALFABETO) for _ in range(8))
        item = {
            "pk": f"POLL#{poll_id}",
            "question": question,
            "options": options,
            "votes": [0] * len(options),
            "closed": False,
            "admin_code": "".join(secrets.choice(ALFABETO) for _ in range(10)),
        }
        self.table.put_item(Item=item, ConditionExpression="attribute_not_exists(pk)")
        return item

    def get_poll(self, poll_id):
        item = self.table.get_item(
            Key={"pk": f"POLL#{poll_id}"}, ConsistentRead=True
        ).get("Item")
        if item is None:
            raise NoExiste()
        return item

    def vote(self, poll_id, option_id, voter_id):
        poll = self.get_poll(poll_id)
        if poll["closed"]:
            raise Conflicto("La encuesta está cerrada")
        if not 0 <= option_id < len(poll["options"]):
            raise ValueError("La opción no existe")
        # El voto único lo garantiza la condición, no una lectura previa
        try:
            self.table.put_item(
                Item={"pk": f"VOTE#{poll_id}#{voter_id}", "option": option_id},
                ConditionExpression="attribute_not_exists(pk)",
            )
        except ClientError as err:
            if err.response["Error"]["Code"] == "ConditionalCheckFailedException":
                raise Conflicto("Ya votaste en esta encuesta") from err
            raise
        try:
            return self.table.update_item(
                Key={"pk": f"POLL#{poll_id}"},
                UpdateExpression=f"SET votes[{option_id}] = votes[{option_id}] + :one",
                ConditionExpression="closed = :f",
                ExpressionAttributeValues={":one": 1, ":f": False},
                ReturnValues="ALL_NEW",
            )["Attributes"]
        except ClientError as err:
            if err.response["Error"]["Code"] == "ConditionalCheckFailedException":
                # Se cerró entre la lectura y el incremento: se libera el voto
                self.table.delete_item(Key={"pk": f"VOTE#{poll_id}#{voter_id}"})
                raise Conflicto("La encuesta está cerrada") from err
            raise

    def close(self, poll_id, code):
        poll = self.get_poll(poll_id)
        if not code or not secrets.compare_digest(code, poll["admin_code"]):
            raise PermissionError()
        return self.table.update_item(
            Key={"pk": f"POLL#{poll_id}"},
            UpdateExpression="SET closed = :t",
            ExpressionAttributeValues={":t": True},
            ReturnValues="ALL_NEW",
        )["Attributes"]
