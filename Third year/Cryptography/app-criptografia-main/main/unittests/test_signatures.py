import unittest

class TestSignatures(unittest.TestCase):
    def test_rsa_signing(self):
        """Prueba básica de firma y verificación RSA."""
        from ..crypto.keys import generate_rsa_keypair
        from ..crypto.signatures import rsa_sign, rsa_verify

        private_key, public_key = generate_rsa_keypair()
        message = b"mensaje para firmar"
        signature = rsa_sign(private_key, message)

        # Verificación correcta
        rsa_verify(public_key, message, signature)

        # Verificación con mensaje modificado falla
        with self.assertRaises(Exception):
            rsa_verify(public_key, b"mensaje modificado", signature)

        # Verificación con firma modificada falla
        bad_signature = bytearray(signature)
        bad_signature[0] ^= 0x01
        with self.assertRaises(Exception):
            rsa_verify(public_key, message, bytes(bad_signature))
