"""
Enhanced Logging Infrastructure
Provides structured logging with file rotation and multiple handlers
"""

import logging
import sys
from pathlib import Path
from logging.handlers import RotatingFileHandler, TimedRotatingFileHandler
from datetime import datetime
from typing import Optional
import json


class JSONFormatter(logging.Formatter):
    """
    Custom JSON formatter for structured logging.
    Outputs logs in JSON format for easier parsing and analysis.
    """

    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON."""
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
        }

        # Add exception info if present
        if record.exc_info:
            log_data["exception"] = self.formatException(record.exc_info)

        # Add extra fields if present
        if hasattr(record, "user_id"):
            log_data["user_id"] = record.user_id
        if hasattr(record, "request_id"):
            log_data["request_id"] = record.request_id
        if hasattr(record, "session_id"):
            log_data["session_id"] = record.session_id

        return json.dumps(log_data)


def setup_logging(
    log_level: str = "INFO",
    log_dir: Optional[str] = None,
    enable_json: bool = False
) -> None:
    """
    Set up application-wide logging configuration.

    Args:
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_dir: Directory for log files (default: logs/ in backend root)
        enable_json: Use JSON formatting instead of standard format
    """
    # Create logs directory if it doesn't exist
    if log_dir is None:
        log_dir = Path(__file__).parent.parent.parent.parent / "logs"
    else:
        log_dir = Path(log_dir)

    log_dir.mkdir(parents=True, exist_ok=True)

    # Set logging level
    level = getattr(logging, log_level.upper(), logging.INFO)

    # Create formatters
    if enable_json:
        formatter = JSONFormatter()
    else:
        formatter = logging.Formatter(
            fmt="[%(asctime)s] %(levelname)-8s | %(name)-25s | %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )

    # Console handler (stdout)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    console_handler.setFormatter(formatter)

    # File handler with rotation (10MB max, keep 5 backups)
    file_handler = RotatingFileHandler(
        filename=log_dir / "app.log",
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
        encoding="utf-8"
    )
    file_handler.setLevel(logging.DEBUG)  # Log everything to file
    file_handler.setFormatter(formatter)

    # Error file handler (errors only)
    error_handler = RotatingFileHandler(
        filename=log_dir / "errors.log",
        maxBytes=10 * 1024 * 1024,  # 10MB
        backupCount=5,
        encoding="utf-8"
    )
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(formatter)

    # Daily rotating handler for audit logs
    audit_handler = TimedRotatingFileHandler(
        filename=log_dir / "audit.log",
        when="midnight",
        interval=1,
        backupCount=30,  # Keep 30 days
        encoding="utf-8"
    )
    audit_handler.setLevel(logging.INFO)
    audit_handler.setFormatter(formatter)

    # Configure root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.DEBUG)

    # Remove existing handlers to avoid duplicates
    root_logger.handlers.clear()

    # Add all handlers
    root_logger.addHandler(console_handler)
    root_logger.addHandler(file_handler)
    root_logger.addHandler(error_handler)

    # Configure module-specific loggers
    configure_module_loggers(level)

    # Log startup message
    logger = logging.getLogger(__name__)
    logger.info(f"Logging initialized - Level: {log_level}, Directory: {log_dir}")


def configure_module_loggers(level: int) -> None:
    """Configure logging levels for specific modules."""

    # Reduce noise from third-party libraries
    logging.getLogger("uvicorn").setLevel(logging.WARNING)
    logging.getLogger("fastapi").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("asyncpg").setLevel(logging.WARNING)

    # Set our application loggers
    logging.getLogger("src").setLevel(level)
    logging.getLogger("src.api").setLevel(level)
    logging.getLogger("src.modules").setLevel(level)
    logging.getLogger("src.infrastructure").setLevel(level)


def get_logger(name: str) -> logging.Logger:
    """
    Get a logger instance with the given name.

    Args:
        name: Logger name (usually __name__)

    Returns:
        Logger instance
    """
    return logging.getLogger(name)


class LoggerAdapter(logging.LoggerAdapter):
    """
    Custom logger adapter for adding context to log messages.
    Useful for adding request IDs, user IDs, etc.
    """

    def process(self, msg: str, kwargs: dict) -> tuple:
        """Add extra context to log message."""
        # Add context from self.extra to every log record
        if "extra" not in kwargs:
            kwargs["extra"] = {}
        kwargs["extra"].update(self.extra)
        return msg, kwargs


def get_request_logger(request_id: str, user_id: Optional[str] = None) -> LoggerAdapter:
    """
    Get a logger with request context.

    Args:
        request_id: Unique request ID
        user_id: Optional user ID

    Returns:
        LoggerAdapter with context
    """
    logger = get_logger("src.api")
    extra = {"request_id": request_id}
    if user_id:
        extra["user_id"] = user_id
    return LoggerAdapter(logger, extra)
