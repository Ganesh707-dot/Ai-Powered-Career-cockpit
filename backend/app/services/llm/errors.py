class AIConfigurationError(RuntimeError):
    """Raised when the active LLM provider is not configured."""


class AIProviderError(RuntimeError):
    """Raised when an LLM request fails."""
