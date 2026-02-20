"""Pruebas unitarias para el módulo main.crypto.asymmetric.

Verifica cifrado/descifrado RSA-OAEP, carga de claves PEM y comportamiento ante
claves/entradas inválidas.
"""

import unittest
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.serialization import BestAvailableEncryption, NoEncryption
from main.crypto import asymmetric as asm

class TestAsymmetricModule(unittest.TestCase):
    """Pruebas para rsa_encrypt_with_public, rsa_decrypt_with_private,
    load_public_key_pem y load_private_key_pem."""
    def setUp(self):
        # Generate a fresh RSA keypair for tests
        self.private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        self.public_key = self.private_key.public_key()
        self.plaintext = b"The quick brown fox jumps over the lazy dog"

    def test_rsa_encrypt_and_decrypt_roundtrip(self):
        """test"""
        cipher = asm.rsa_encrypt_with_public(self.public_key, self.plaintext)
        plain2 = asm.rsa_decrypt_with_private(self.private_key, cipher)
        self.assertEqual(self.plaintext, plain2)

    def test_encrypt_empty_bytes(self):
        """test"""
        cipher = asm.rsa_encrypt_with_public(self.public_key, b"")
        plain2 = asm.rsa_decrypt_with_private(self.private_key, cipher)
        self.assertEqual(b"", plain2)

    def test_decrypt_with_wrong_private_key_raises(self):
        """test"""
        other_priv = rsa.generate_private_key(public_exponent=65537, key_size=2048)
        cipher = asm.rsa_encrypt_with_public(self.public_key, self.plaintext)
        with self.assertRaises((ValueError, TypeError)):
            _ = asm.rsa_decrypt_with_private(other_priv, cipher)

    def test_load_public_key_pem_valid(self):
        """test"""
        pub_pem = self.public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )
        loaded = asm.load_public_key_pem(pub_pem)
        # Should be able to encrypt with loaded key and decrypt with original private key
        cipher = loaded.encrypt(self.plaintext, asm.padding.OAEP(
            mgf=asm.padding.MGF1(algorithm=asm.asym_hashes.SHA256()),
            algorithm=asm.asym_hashes.SHA256(),
            label=None,
        ))
        plain2 = asm.rsa_decrypt_with_private(self.private_key, cipher)
        self.assertEqual(self.plaintext, plain2)

    def test_load_private_key_pem_valid_and_encrypted(self):
        """test"""
        # Unencrypted PKCS8
        priv_pem = self.private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=NoEncryption()
        )
        loaded = asm.load_private_key_pem(priv_pem, password=None)
        cipher = asm.rsa_encrypt_with_public(loaded.public_key(), self.plaintext)
        self.assertEqual(self.plaintext, asm.rsa_decrypt_with_private(loaded, cipher))

        # Encrypted private key with password
        password = b"correcthorsebatterystaple"
        priv_pem_enc = self.private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=BestAvailableEncryption(password)
        )
        loaded_enc = asm.load_private_key_pem(priv_pem_enc, password=password)
        cipher2 = asm.rsa_encrypt_with_public(loaded_enc.public_key(), self.plaintext)
        self.assertEqual(self.plaintext, asm.rsa_decrypt_with_private(loaded_enc, cipher2))

    def test_load_public_key_pem_invalid_bytes_raises(self):
        """test"""
        with self.assertRaises((ValueError, TypeError)):
            asm.load_public_key_pem(b"not a valid pem")

    def test_load_private_key_pem_invalid_password_raises(self):
        """test"""
        password = b"pw"
        priv_pem_enc = self.private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=BestAvailableEncryption(password)
        )
        # wrong password should raise ValueError or TypeError depending on backend
        with self.assertRaises((ValueError, TypeError)):
            asm.load_private_key_pem(priv_pem_enc, password=b"wrong")
