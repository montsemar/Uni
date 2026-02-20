"""Utilities para derivación y verificación de contraseñas usando PBKDF2-HMAC-SHA256.
Este módulo proporciona funciones para generar un key derivation (KDF) a partir de
una contraseña usando PBKDF2-HMAC con SHA-256 y para verificar contraseñas contra
los valores almacenados (salt + derivado + iteraciones)."""

import base64
import binascii
import os
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography import exceptions


def hash_password(password: str, salt: bytes = None):
    """Deriva una clave a partir de una contraseña y devuelve metadatos seguros.
    Si no se proporciona `salt`, se genera uno aleatorio de 16 bytes.
    Args:
        password: Contraseña en texto claro.
        salt: Salt en bytes (opcional). Si es None se genera uno nuevo.
    Returns:
        Un dict con:
          - "salt": salt codificado en base64 (str).
          - "derived": clave derivada codificada en base64 (str).
          - "iter": número de iteraciones usado (int)."""
    if salt is None:
        salt = os.urandom(16)
    kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=200_000)
    key = kdf.derive(password.encode())
    return {"salt": base64.b64encode(salt).decode(),
            "derived": base64.b64encode(key).decode(),
            "iter": 200000}


def verify_password(password: str, stored: dict) -> bool:
    """Verifica una contraseña comparándola con los datos derivados almacenados.
    Args:
        password: Contraseña en texto claro a verificar.
        stored: Diccionario con los campos devueltos por `hash_password`
        ("salt", "derived", "iter").
    Returns:
        True si la contraseña coincide; False en caso contrario.
    Notes:
        - La función captura excepciones de verificación del KDF y devuelve False
          si la verificación falla o los datos almacenados están mal formados."""
    salt = base64.b64decode(stored["salt"])
    kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32,
                     salt=salt, iterations=stored.get("iter", 200000))
    try:
        kdf.verify(password.encode(), base64.b64decode(stored["derived"]))
        return True
    except exceptions.InvalidKey:
        return False
    except binascii.Error:
        return False
