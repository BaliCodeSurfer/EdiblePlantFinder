import os
from unittest.mock import AsyncMock, patch

import pytest
from fastapi.testclient import TestClient

os.environ.setdefault("PLANT_ID_API_KEY", "test_plant_id_key")
os.environ.setdefault("JWT_SECRET_KEY", "test_jwt_secret_key_for_testing_only")

from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def mock_identify_plant():
    with patch("app.services.identify_plant", new_callable=AsyncMock) as mock:
        yield mock
