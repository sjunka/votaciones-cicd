import boto3
import pytest
from moto import mock_aws

from app.main import create_app


@pytest.fixture(autouse=True)
def aws_env(monkeypatch):
    for k in ("AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY"):
        monkeypatch.setenv(k, "test")
    monkeypatch.setenv("AWS_REGION", "us-east-1")
    monkeypatch.setenv("TABLE_NAME", "t")
    monkeypatch.delenv("DYNAMODB_ENDPOINT", raising=False)


@pytest.fixture
def client():
    with mock_aws():
        boto3.client("dynamodb", region_name="us-east-1").create_table(
            TableName="t",
            KeySchema=[{"AttributeName": "pk", "KeyType": "HASH"}],
            AttributeDefinitions=[{"AttributeName": "pk", "AttributeType": "S"}],
            BillingMode="PAY_PER_REQUEST",
        )
        yield create_app().test_client()
