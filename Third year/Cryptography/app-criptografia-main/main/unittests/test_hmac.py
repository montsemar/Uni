"""Pruebas unitarias para el módulo main.crypto.hmac.

Valida generación y verificación de etiquetas HMAC-SHA256 con casos:
- tag válido, longitud y tipo.
- verificación correcta e incorrecta (tag o clave errónea).
- determinismo y manejo de entradas vacías.
"""

import unittest
from main.crypto import hmac as hm

class TestHMACModule(unittest.TestCase):
    """Suite de pruebas para hmac_tag y verify_hmac."""
    def setUp(self):
        self.key = b"\x0a" * 32
        self.other_key = b"\x0b" * 32
        self.data = b"hello world"
        self.empty = b""

    def test_hmac_tag_length_and_type(self):
        tag = hm.hmac_tag(self.key, self.data)
        self.assertIsInstance(tag, bytes)
        self.assertEqual(len(tag), 32)  # SHA-256 HMAC -> 32 bytes

    def test_verify_hmac_success(self):
        tag = hm.hmac_tag(self.key, self.data)
        self.assertTrue(hm.verify_hmac(self.key, self.data, tag))

    def test_verify_hmac_with_wrong_tag_fails(self):
        tag = hm.hmac_tag(self.key, self.data)
        # flip one bit to tamper tag
        tampered = bytes([tag[0] ^ 1]) + tag[1:]
        self.assertFalse(hm.verify_hmac(self.key, self.data, tampered))

    def test_verify_hmac_with_wrong_key_fails(self):
        tag = hm.hmac_tag(self.key, self.data)
        self.assertFalse(hm.verify_hmac(self.other_key, self.data, tag))

    def test_hmac_is_deterministic_for_same_input(self):
        t1 = hm.hmac_tag(self.key, self.data)
        t2 = hm.hmac_tag(self.key, self.data)
        self.assertEqual(t1, t2)

    def test_empty_key_and_data(self):
        tag = hm.hmac_tag(self.empty, self.empty)
        self.assertTrue(hm.verify_hmac(self.empty, self.empty, tag))
