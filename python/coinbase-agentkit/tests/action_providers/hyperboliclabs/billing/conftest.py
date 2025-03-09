"""Test fixtures for Hyperbolic billing service."""

from unittest.mock import patch

import pytest

from coinbase_agentkit.action_providers.hyperboliclabs.billing.service import Billing


@pytest.fixture
def mock_request():
    """Mock the request function for testing.
    
    Returns:
        MagicMock: A mock object that simulates the requests.request function.
    """
    with patch("coinbase_agentkit.action_providers.hyperboliclabs.service.requests.request") as mock:
        mock.return_value.status_code = 200
        mock.return_value.json.return_value = {"status": "success"}
        yield mock


@pytest.fixture
def billing(api_key: str):
    """Create a Billing service instance for testing.
    
    Args:
        api_key: API key for authentication.
    
    Returns:
        Billing: A billing service instance initialized with the API key.
    """
    return Billing(api_key) 