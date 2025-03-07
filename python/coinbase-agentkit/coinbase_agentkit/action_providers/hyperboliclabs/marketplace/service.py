"""Service for marketplace-related operations."""

from ..constants import MARKETPLACE_BASE_URL, MARKETPLACE_ENDPOINTS
from ..services.base import Base
from .models import (
    AvailableInstancesResponse,
    InstanceHistoryResponse,
    RentedInstancesResponse,
    RentInstanceRequest,
    RentInstanceResponse,
    TerminateInstanceRequest,
    TerminateInstanceResponse,
)


class Marketplace(Base):
    """Service for marketplace-related operations."""

    def __init__(self, api_key: str):
        """Initialize the marketplace service.

        Args:
            api_key: The API key for authentication.

        """
        super().__init__(api_key, MARKETPLACE_BASE_URL)

    def get_available_instances(self) -> AvailableInstancesResponse:
        """Get available GPU instances from the marketplace.

        Returns:
            AvailableInstancesResponse: The marketplace instances data.

        Raises:
            requests.exceptions.RequestException: If the API request fails.
            pydantic.ValidationError: If response validation fails.

        """
        response_data = self.make_request(
            endpoint=MARKETPLACE_ENDPOINTS["LIST_INSTANCES"], method="POST", data={"filters": {}}
        )
        return AvailableInstancesResponse(**response_data)

    def get_instance_history(self) -> InstanceHistoryResponse:
        """Get GPU instance rental history.

        Returns:
            InstanceHistoryResponse: The instance history data.

        Raises:
            requests.exceptions.RequestException: If the API request fails.
            pydantic.ValidationError: If response validation fails.

        """
        response_data = self.make_request(
            endpoint=MARKETPLACE_ENDPOINTS["INSTANCE_HISTORY"], method="GET"
        )
        return InstanceHistoryResponse(**response_data)

    def get_rented_instances(self) -> RentedInstancesResponse:
        """Get currently rented GPU instances.

        Returns:
            RentedInstancesResponse: The rented instances data.

        Raises:
            requests.exceptions.RequestException: If the API request fails.
            pydantic.ValidationError: If response validation fails.

        """
        response_data = self.make_request(
            endpoint=MARKETPLACE_ENDPOINTS["LIST_USER_INSTANCES"], method="GET"
        )
        return RentedInstancesResponse(**response_data)

    def rent_instance(
        self,
        request: RentInstanceRequest,
    ) -> RentInstanceResponse:
        """Rent a GPU compute instance.

        Args:
            request: The RentInstanceRequest object containing rental parameters.

        Returns:
            RentInstanceResponse: The rental response data.

        Raises:
            requests.exceptions.RequestException: If the API request fails.
            pydantic.ValidationError: If request/response validation fails.

        """
        response_data = self.make_request(
            endpoint=MARKETPLACE_ENDPOINTS["CREATE_INSTANCE"], data=request.model_dump()
        )
        return RentInstanceResponse(**response_data)

    def terminate_instance(
        self,
        request: TerminateInstanceRequest,
    ) -> TerminateInstanceResponse:
        """Terminate a GPU compute instance.

        Args:
            request: The TerminateInstanceRequest object containing the instance ID.

        Returns:
            TerminateInstanceResponse: The termination response data.

        Raises:
            requests.exceptions.RequestException: If the API request fails.
            pydantic.ValidationError: If request/response validation fails.

        """
        response_data = self.make_request(
            endpoint=MARKETPLACE_ENDPOINTS["TERMINATE_INSTANCE"], data=request.model_dump()
        )
        return TerminateInstanceResponse(**response_data) 