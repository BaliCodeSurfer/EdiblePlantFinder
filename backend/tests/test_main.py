import httpx
import pytest
from fastapi.testclient import TestClient
from unittest.mock import AsyncMock, patch

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
    # Send an invalid token to trigger the JWT verification error (401)
    response = client.post(
        "/identify",
        json={"image_base64": "a" * 200},
        headers={"Authorization": "Bearer invalid-token"},
    )
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


# ---------------------------------------------------------------------------
# Retry behavior tests (exercise the tenacity decorator in identify_plant)
# ---------------------------------------------------------------------------


def _make_transient_response(status_code: int) -> httpx.Response:
    """Helper to build an HTTPStatusError that tenacity will treat as retryable."""
    request = httpx.Request("POST", "https://api.plant.id/v3/identification")
    response = httpx.Response(status_code, request=request)
    return httpx.HTTPStatusError("transient error", request=request, response=response)


def test_identify_retries_on_transient_error_then_succeeds(client):
    """Simulates two 503s followed by success on the third attempt."""
    token = client.post("/session").json()["access_token"]
    call_count = 0

    async def fake_post(*args, **kwargs):
        nonlocal call_count
        call_count += 1
        if call_count < 3:
            raise _make_transient_response(503)
        # Success on 3rd try — use a plain Mock so that .raise_for_status()
        # and .json() behave like real httpx.Response (synchronous methods).
        from unittest.mock import Mock

        mock_resp = Mock()
        mock_resp.raise_for_status.return_value = None
        mock_resp.json.return_value = {
            "result": {"classification": {"suggestions": [{"name": "retry_success"}]}}
        }
        return mock_resp

    with patch("app.services.httpx.AsyncClient") as mock_client_cls:
        mock_instance = AsyncMock()
        mock_client_cls.return_value.__aenter__.return_value = mock_instance
        # Explicitly make post an AsyncMock with the async side_effect
        mock_instance.post = AsyncMock(side_effect=fake_post)

        resp = client.post(
            "/identify",
            json={"image_base64": "a" * 200},
            headers={"Authorization": f"Bearer {token}"},
        )

    assert resp.status_code == 200
    assert resp.json()["result"] == {
        "classification": {"suggestions": [{"name": "retry_success"}]}
    }
    assert call_count == 3


def test_identify_fails_after_exhausting_retries(client):
    """All three attempts return 503 → final 500 after retries are exhausted."""
    token = client.post("/session").json()["access_token"]
    call_count = 0

    async def always_fail(*args, **kwargs):
        nonlocal call_count
        call_count += 1
        raise _make_transient_response(503)

    with patch("app.services.httpx.AsyncClient") as mock_client_cls:
        mock_instance = AsyncMock()
        mock_client_cls.return_value.__aenter__.return_value = mock_instance
        mock_instance.post = AsyncMock(side_effect=always_fail)

        resp = client.post(
            "/identify",
            json={"image_base64": "a" * 200},
            headers={"Authorization": f"Bearer {token}"},
        )

    assert resp.status_code == 500
    assert resp.json()["detail"] == "Internal server error"
    assert call_count == 3


# ---------------------------------------------------------------------------
# Rate limiter tests (slowapi)
# ---------------------------------------------------------------------------


def test_identify_rate_limit_exceeded(client):
    """Exceeding the configured rate limit should return HTTP 429."""
    token = client.post("/session").json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # The default limit is "10/minute". We send 11 requests from the same IP.
    responses = []
    for _ in range(11):
        resp = client.post(
            "/identify",
            json={"image_base64": "a" * 200},
            headers=headers,
        )
        responses.append(resp.status_code)

    # First 10 should not be rate-limited (200 or 500 depending on mocking)
    assert all(code in (200, 500) for code in responses[:10])
    # 11th request must be rejected
    assert responses[10] == 429


def test_identify_rate_limit_per_ip(client):
    """Different IPs should have independent rate limit counters."""
    token = client.post("/session").json()["access_token"]
    base_headers = {"Authorization": f"Bearer {token}"}

    # Exhaust limit for IP 1.1.1.1
    for _ in range(11):
        client.post(
            "/identify",
            json={"image_base64": "a" * 200},
            headers={**base_headers, "X-Forwarded-For": "1.1.1.1"},
        )

    # IP 2.2.2.2 should still be allowed (different counter)
    resp = client.post(
        "/identify",
        json={"image_base64": "a" * 200},
        headers={**base_headers, "X-Forwarded-For": "2.2.2.2"},
    )
    assert resp.status_code in (200, 500)  # not rate-limited
