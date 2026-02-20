"""HMAC utilities usando SHA-256.
Proporciona funciones para generar una etiqueta HMAC-SHA256 y verificarla.
"""
from cryptography.hazmat.primitives import hashes, hmac
from cryptography import exceptions


def hmac_tag(key: bytes, data: bytes) -> bytes:
    """Genera un tag HMAC-SHA256 para los datos proporcionados.
    Args:
        key: clave en bytes para HMAC.
        data: datos en bytes sobre los que se calcula el HMAC.
    Returns:
        Tag HMAC en bytes."""
    h = hmac.HMAC(key, hashes.SHA256())
    h.update(data)
    return h.finalize()


def verify_hmac(key: bytes, data: bytes, tag: bytes) -> bool:
    """Verifica que `tag` sea el HMAC-SHA256 válido para `data` con `key`.
    Args:
        key: clave en bytes para HMAC.
        data: datos en bytes que se verifican.
        tag: tag HMAC esperado.
    Returns:
        True si la verificación es correcta, False si falla."""
    h = hmac.HMAC(key, hashes.SHA256())
    h.update(data)
    try:
        h.verify(tag)
        return True
    except exceptions.InvalidSignature:
        return False
