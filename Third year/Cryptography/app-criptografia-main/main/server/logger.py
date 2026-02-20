"""Logging"""
import logging

# Configuración del logger
logging.basicConfig(
    filename="app.log",            # Archivo donde se guardan los logs
    filemode="a",                  # "a" = append (no machacar archivo)
    format="%(asctime)s - %(levelname)s - %(message)s",
    level=logging.INFO             # Nivel mínimo: INFO (puede ser DEBUG, WARNING...)
)

logger = logging.getLogger("ApuntesSeguro")
