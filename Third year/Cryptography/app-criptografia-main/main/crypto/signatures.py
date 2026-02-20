from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes as asym_hashes
from cryptography.hazmat.primitives import serialization


# ... aquí ya tienes load_public_key_pem, load_private_key_pem,
#     rsa_encrypt_with_public, rsa_decrypt_with_private, etc.


def rsa_sign(private_key, data: bytes) -> bytes:
    """
    Firma 'data' usando la clave privada RSA dada, con PSS + SHA-256.

    Args:
        private_key: Clave privada (objeto RSAPrivateKey de cryptography).
        data: Bytes del mensaje/archivo a firmar.

    Returns:
        La firma en bytes.
    """
    signature = private_key.sign(
        data,
        padding.PSS(
            mgf=padding.MGF1(asym_hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH,
        ),
        asym_hashes.SHA256(),
    )
    return signature


def rsa_verify(public_key, a: bytes, b: bytes) -> bool:
    """
    Verifica una firma RSA-PSS-SHA256.

    Esta función es tolerante respecto al orden de los argumentos para
    permitir llamadas tanto como `rsa_verify(pub, signature, data)`
    como `rsa_verify(pub, data, signature)`.

    En caso de éxito devuelve True; en caso de fallo lanza Exception.
    """
    # intentamos ambas permutaciones: (signature=a, data=b) y (signature=b, data=a)
    permutations = [(a, b), (b, a)]
    last_exc = None
    for sig, data in permutations:
        try:
            public_key.verify(
                sig,
                data,
                padding.PSS(
                    mgf=padding.MGF1(asym_hashes.SHA256()),
                    salt_length=padding.PSS.MAX_LENGTH,
                ),
                asym_hashes.SHA256(),
            )
            return True
        except Exception as e:
            last_exc = e
            continue
    # ambos intentos fallaron
    raise Exception("Invalid signature") from last_exc
