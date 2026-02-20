"""Cifrado y descifrado simétrico usando AES-GCM (AES Galois/Counter Mode)."""
import os
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

def aes_gcm_encrypt(key: bytes, plaintext: bytes):
    aes = AESGCM(key)
    nonce = os.urandom(12)
    ct = aes.encrypt(nonce, plaintext, associated_data=None)
    # ct = ciphertext||tag
    tag = ct[-16:]
    ciphertext = ct[:-16]
    return ciphertext, nonce, tag


def aes_gcm_decrypt(key: bytes, ciphertext: bytes, nonce: bytes, tag: bytes):
    aes = AESGCM(key)
    ct_with_tag = ciphertext + tag
    return aes.decrypt(nonce, ct_with_tag, associated_data=None)

