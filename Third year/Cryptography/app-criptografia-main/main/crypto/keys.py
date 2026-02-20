"""Generadores de claves simétricas y asimétricas (RSA) para la aplicación."""
import base64
import hashlib
import os
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization


# CLAVES SIMÉTRICOS (AES)
def generate_symmetric_key() -> bytes:
    """Genera una clave simétrica AES-256 (32 bytes)."""
    return os.urandom(32)  # 256 bits


# CLAVES ASIMÉTRICAS (RSA)
def generate_rsa_keypair(clave: str = None, longitud=2048):
    """Genera un par RSA.

    - Si `clave` es None: devuelve (private_key_obj, public_key_obj) objetos de cryptography.
    - Si `clave` es una cadena: serializa y devuelve (pem_private_str, pem_public_str),
      cifrando la clave privada con la passphrase dada.

    Args:
        clave: contraseña para cifrar la clave privada (passphrase) o None.
        longitud: tamaño de la clave RSA en bits (2048, 3072, 4096).
    Returns:
        Tupla según `clave` descrita arriba.
    """
    if longitud not in [2048, 3072, 4096]:
        raise ValueError("La longitud de la clave debe ser 2048, 3072 o 4096 bits.")

    # Generar par de claves RSA
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=longitud,
    )
    public_key = private_key.public_key()

    # Si no se pide passphrase, devolver objetos de clave (para tests y uso interno)
    if clave is None:
        return private_key, public_key

    # Serializar claves a formato PEM y cifrar la privada con la passphrase
    pem_private = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.BestAvailableEncryption(clave.encode('utf-8'))
    )

    pem_public = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )

    return pem_private.decode('utf-8'), pem_public.decode('utf-8')

# CLAVE HMAC
def derive_hmac_key_from_password(password: str, salt: str, iterations=200_000) -> bytes:
    """Deriva una clave HMAC segura y persistente a partir de
    una contraseña usando PBKDF2-HMAC-SHA256."""
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"),
                               base64.b64decode(salt), iterations, dklen=32)
