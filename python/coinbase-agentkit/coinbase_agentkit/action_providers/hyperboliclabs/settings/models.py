"""Models for Hyperbolic settings services.

This module provides models for interacting with Hyperbolic settings services.
It includes models for wallet linking operations.
"""

from pydantic import BaseModel, Field


class WalletLinkRequest(BaseModel):
    """Request model for wallet linking."""

    address: str = Field(
        ..., description="The wallet address to link to your Hyperbolic account", min_length=2
    )


class WalletLinkResponse(BaseModel):
    """Response model for wallet linking API.

    The API returns either a success response with {"success": true}
    or an error response with {"error_code": int, "message": str}
    """

    # For success responses
    success: bool | None = Field(None, description="Whether the operation was successful")

    # For error responses
    error_code: int | None = Field(None, description="Error code for failed operations")
    message: str | None = Field(None, description="Response message or error description")

    @property
    def status(self) -> str:
        """Return status string based on success boolean for backward compatibility."""
        if self.success is True:
            return "success"
        if self.error_code is not None:
            return f"error_{self.error_code}"
        return "error"
