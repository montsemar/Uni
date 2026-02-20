"""Pruebas unitarias para el módulo main.crypto.keys.

Cubre generación de claves simétricas y RSA:
- longitud y unicidad de la clave simétrica.
- generación, serialización y carga de clave RSA en PEM.
- manejo de longitudes inválidas y errores de contraseña en claves privadas cifradas.
"""

import unittest
from cryptography.hazmat.primitives import serialization
from main.crypto import keys as ks

class TestKeysModule(unittest.TestCase):
    """Suite de pruebas para generate_symmetric_key y generate_rsa_keypair."""
    def setUp(self):
        self.passphrase = "s3cret-pass"
        self.other_pass = "wrong-pass"

    def test_generate_symmetric_key_length_and_uniqueness(self):
        k1 = ks.generate_symmetric_key()
        k2 = ks.generate_symmetric_key()
        self.assertIsInstance(k1, bytes)
        self.assertEqual(len(k1), 32)
        self.assertNotEqual(k1, k2)  # muy improbable que coincidan

    def test_generate_rsa_keypair_returns_pem_and_loadable(self):
        priv_pem_str, pub_pem_str = ks.generate_rsa_keypair(self.passphrase, longitud=2048)
        self.assertIsInstance(priv_pem_str, str)
        self.assertIsInstance(pub_pem_str, str)
        self.assertTrue(priv_pem_str.startswith("-----BEGIN"))
        self.assertTrue(pub_pem_str.startswith("-----BEGIN"))

        priv = serialization.load_pem_private_key(priv_pem_str.encode("utf-8"),
                                                  password=self.passphrase.encode("utf-8"))
        pub = serialization.load_pem_public_key(pub_pem_str.encode("utf-8"))

        # Public numbers must match between the private's public key and the loaded public key
        self.assertEqual(pub.public_numbers(), priv.public_key().public_numbers())

    def test_generate_rsa_keypair_invalid_length_raises(self):
        with self.assertRaises(ValueError):
            ks.generate_rsa_keypair(self.passphrase, longitud=1234)

    def test_private_key_encrypted_wrong_password_raises(self):
        priv_pem_str, _ = ks.generate_rsa_keypair(self.passphrase, longitud=2048)
        with self.assertRaises((ValueError, TypeError)):
            serialization.load_pem_private_key(priv_pem_str.encode("utf-8"),
                                               password=self.other_pass.encode("utf-8"))
