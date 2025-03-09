"""Test fixtures for Hyperbolic billing service."""

from unittest.mock import patch

import pytest

from coinbase_agentkit.action_providers.hyperboliclabs.billing.action_provider import BillingActionProvider
from coinbase_agentkit.action_providers.hyperboliclabs.billing.service import BillingService

@pytest.fixture
def billing(api_key: str):
    """Create a Billing service instance for testing.
    
    Args:
        api_key: API key for authentication.
    
    Returns:
        Billing: A billing service instance initialized with the API key.
    """
    return BillingService(api_key) 

@pytest.fixture
def mock_billing_service():
    """Create a mock BillingService for testing.
    
    Returns:
        MagicMock: A mock object that simulates the BillingService.
    """
    with patch("coinbase_agentkit.action_providers.hyperboliclabs.billing.action_provider.BillingService") as mock:
        yield mock.return_value


@pytest.fixture
def provider(mock_api_key):
    """Create a HyperbolicBillingActionProvider with a mock API key.
    
    Args:
        mock_api_key: Mock API key for authentication.
        
    Returns:
        HyperbolicBillingActionProvider: Provider with mock API key.
    """
    return BillingActionProvider(api_key=mock_api_key)