import pytest
from fastapi.testclient import TestClient

from app.main import app


def test_health(client):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_session(client):
    response = client.post("/session")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_identify_success(client, mock_identify_plant):
    mock_identify_plant.return_value = {
        "classification": {"suggestions": [{"name": "Quercus alba"}]}
    }
    token_resp = client.post("/session")
    token = token_resp.json()["access_token"]
    response = client.post(
        "/identify",
        json={"image_base64": "a" * 200},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    assert response.json()["result"] == {
        "classification": {"suggestions": [{"name": "Quercus alba"}]}
    }
    mock_identify_plant.assert_awaited_once()


def test_identify_unauthorized(client):
    response = client.post("/identify", json={"image_base64": "a" * 200})
    assert response.status_code == 401


def test_identify_validation_error(client):
    token_resp = client.post("/session")
    token = token_resp.json()["access_token"]
    response = client.post(
        "/identify",
        json={"image_base64": "short"},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 422


def test_identify_server_error(client, mock_identify_plant):
    mock_identify_plant.side_effect = Exception("Plant.id timeout")
    token_resp = client.post("/session")
    token = token_resp.json()["access_token"]
    response = client.post(
        "/identify",
        json={"image_base64": "a" * 200},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 500
    assert response.json()["detail"] == "Internal server error"
