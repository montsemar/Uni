"""Pruebas unitarias para el módulo main.crypto.hash.

Este módulo contiene casos de prueba que verifican la correcta derivación y
verificación de contraseñas usando PBKDF2-HMAC-SHA256:
- test_hash_and_verify_roundtrip: ida y vuelta de hash/verify.
- test_verify_wrong_password_returns_false: contraseña incorrecta.
- test_hash_with_provided_salt_is_reproducible: salt determinista.
- test_corrupted_stored_data_returns_false: datos almacenados corruptos.
- test_wrong_iter_in_stored_make_verification_fail: iteraciones incorrectas.
"""

import unittest
import copy
from main.crypto import hash as hh

class TestHash(unittest.TestCase):
    """Suite de pruebas para hash_password y verify_password."""
    def setUp(self):
        self.password = "P@ssw0rd!"
        self.salt = b"\x01" * 16  # determinista para pruebas

    def test_hash_and_verify_roundtrip(self):
        stored = hh.hash_password(self.password)
        self.assertTrue(hh.verify_password(self.password, stored))

    def test_verify_wrong_password_returns_false(self):
        stored = hh.hash_password(self.password)
        self.assertFalse(hh.verify_password("wrong-password", stored))

    def test_hash_with_provided_salt_is_reproducible(self):
        a = hh.hash_password(self.password, salt=self.salt)
        b = hh.hash_password(self.password, salt=self.salt)
        self.assertEqual(a["salt"], b["salt"])
        self.assertEqual(a["derived"], b["derived"])
        self.assertEqual(a["iter"], b["iter"])

    def test_corrupted_stored_data_returns_false(self):
        stored = hh.hash_password(self.password)
        bad = copy.deepcopy(stored)
        bad["derived"] = "not-base64!"
        self.assertFalse(hh.verify_password(self.password, bad))

    def test_wrong_iter_in_stored_make_verification_fail(self):
        stored = hh.hash_password(self.password)
        wrong_iter = stored.copy()
        wrong_iter["iter"] = 12345  # diferente a 200000 => verificación debe fallar
        self.assertFalse(hh.verify_password(self.password, wrong_iter))
