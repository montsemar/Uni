"""Módulo para cifrado y descifrado asimétrico usando RSA con OAEP.

Proporciona utilidades para cargar claves en formato PEM y para cifrar/descifrar
datos utilizando RSA con esquema OAEP y SHA-256.
"""
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes as asym_hashes
from cryptography.hazmat.primitives import serialization


def load_public_key_pem(pem_bytes: bytes):
    """Cargar una clave pública desde bytes en formato PEM.
	Args:
		pem_bytes: Bytes que contienen la clave pública en formato PEM.
	Returns:
		Objeto de clave pública compatible con cryptography (por ejemplo RSAPublicKey).
	Raises:
		ValueError o TypeError si los bytes no contienen una clave válida."""
    return serialization.load_pem_public_key(pem_bytes)

def load_private_key_pem(pem_bytes: bytes, password: bytes = None):
    """Cargar una clave privada desde bytes en formato PEM.
	Args:
		pem_bytes: Bytes que contienen la clave privada en formato PEM.
		password: Password en bytes si la PEM está cifrada (opcional).
	Returns:
		Objeto de clave privada compatible con cryptography (por ejemplo RSAPrivateKey).
	Raises:
		ValueError o TypeError si los bytes no contienen una clave válida o la contraseña es incorrecta.
	"""
    return serialization.load_pem_private_key(pem_bytes, password=password)

def rsa_encrypt_with_public(public_key, plaintext: bytes) -> bytes:
    """Cifrar datos con una clave pública usando RSA-OAEP (SHA-256).

	Args:
		public_key: Objeto de clave pública (compatible con cryptography) para cifrar.
		plaintext: Datos en bytes que se desean cifrar.

	Returns:
		Bytes del texto cifrado.
	"""
    return public_key.encrypt(
		plaintext,
		padding.OAEP(
			mgf=padding.MGF1(algorithm=asym_hashes.SHA256()),
			algorithm=asym_hashes.SHA256(),
			label=None,
		),
	)

def rsa_decrypt_with_private(private_key, ciphertext: bytes) -> bytes:
    """Descifrar datos con una clave privada usando RSA-OAEP (SHA-256).
    Args:
    	private_key: Objeto de clave privada (compatible con cryptography)
    	para descifrar.
	    ciphertext: Bytes del texto cifrado a descifrar.
	Returns:
		Bytes del texto plano descifrado.
	Raises:
		ValueError si el descifrado falla (por ejemplo, si el ciphertext es inválido).
	"""
    return private_key.decrypt(
		ciphertext,
		padding.OAEP(
			mgf=padding.MGF1(algorithm=asym_hashes.SHA256()),
			algorithm=asym_hashes.SHA256(),
			label=None,
			),
	)
