"""Pruebas unitarias para la implementación AES-GCM (mensaje, integridad y longitudes)."""
import os
import unittest
from cryptography.exceptions import InvalidTag
from ..crypto.keys import generate_symmetric_key
from ..crypto.symmetric import aes_gcm_encrypt, aes_gcm_decrypt

class TestAesGcm(unittest.TestCase):
    """Test class for AES-GCM encryption and decryption"""
    def test_encrypt_decrypt_roundtrip(self):
        """Comprueba que cifrar y descifrar recupera el plaintext."""
        key = generate_symmetric_key()  # 256-bit AES key
        plaintext = b"mensaje de prueba para AES-GCM"
        ciphertext, nonce, tag = aes_gcm_encrypt(key, plaintext)

        # tipos y longitudes esperadas
        self.assertIsInstance(ciphertext, bytes)
        self.assertIsInstance(nonce, bytes)
        self.assertIsInstance(tag, bytes)
        self.assertEqual(len(nonce), 12, "Nonce debe ser de 12 bytes")
        self.assertEqual(len(tag), 16, "Tag debe ser de 16 bytes")

        recovered = aes_gcm_decrypt(key, ciphertext, nonce, tag)
        self.assertEqual(recovered, plaintext)

    def test_modified_ciphertext_or_tag_or_nonce_fails(self):
        """Verifica que modificaciones en ct/tag/nonce provoquen InvalidTag."""
        key = generate_symmetric_key()
        plaintext = b"otro mensaje"
        ciphertext, nonce, tag = aes_gcm_encrypt(key, plaintext)

        # modificar ciphertext
        bad_ct = bytearray(ciphertext)
        if len(bad_ct) == 0:
            # si por alguna razón ciphertext vacío (caso muy improbable), añadir byte
            bad_ct = bytearray(b"\x00")
        bad_ct[0] ^= 0x01
        with self.assertRaises(InvalidTag):
            aes_gcm_decrypt(key, bytes(bad_ct), nonce, tag)

        # modificar tag
        bad_tag = bytearray(tag)
        bad_tag[0] ^= 0x01
        with self.assertRaises(InvalidTag):
            aes_gcm_decrypt(key, ciphertext, nonce, bytes(bad_tag))

        # modificar nonce
        bad_nonce = bytearray(nonce)
        bad_nonce[0] ^= 0x01
        with self.assertRaises(InvalidTag):
            aes_gcm_decrypt(key, ciphertext, bytes(bad_nonce), tag)

    def test_invalid_key_lengths_raise(self):
        """Comprueba que longitudes de clave inválidas fallan al cifrar."""
        plaintext = b"test"
        invalid_keys = [b"", os.urandom(1), os.urandom(15), os.urandom(20)]
        for k in invalid_keys:
            with self.subTest(key_len=len(k)):
                with self.assertRaises(Exception):
                    # puede lanzar ValueError al crear AESGCM o en encrypt
                    aes_gcm_encrypt(k, plaintext)

    def test_ciphertext_differs_from_plaintext(self):
        """Asegura que el ciphertext no sea igual al plaintext para datos repetidos."""
        key = generate_symmetric_key()
        plaintext = b"bytes repetidos" * 4
        ciphertext, nonce, tag = aes_gcm_encrypt(key, plaintext)
        self.assertNotEqual(ciphertext, plaintext)
