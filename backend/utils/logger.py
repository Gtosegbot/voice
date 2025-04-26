import logging
import sys
from logging.handlers import RotatingFileHandler
from ..config import settings


def setup_logger():
    logger = logging.getLogger("disparoseguro")
    logger.setLevel(settings.LOG_LEVEL)

    # Formato do log
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )

    # Handler para arquivo
    file_handler = RotatingFileHandler(
        settings.LOG_FILE,
        maxBytes=10*1024*1024,  # 10MB
        backupCount=5
    )
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)

    # Handler para console
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(formatter)
    logger.addHandler(console_handler)

    return logger


logger = setup_logger()
