import os
import sys
import shutil
import tempfile
import unittest
from subprocess import CompletedProcess
from unittest.mock import patch

# Asegurar que el paquete `server` (dentro de `main/`) sea importable durante los tests
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from ..crypto import pki


class TestPKI(unittest.TestCase):
	def setUp(self):
		# crear un DIR temporal y apuntar pki.DIR ahí
		self.tempdir = tempfile.mkdtemp()
		pki.DIR = self.tempdir

	def tearDown(self):
		shutil.rmtree(self.tempdir, ignore_errors=True)

	def _write_file(self, relpath, data: bytes):
		path = os.path.join(self.tempdir, relpath)
		os.makedirs(os.path.dirname(path), exist_ok=True)
		with open(path, "wb") as f:
			f.write(data)
		return path

	@patch('main.crypto.pki.shutil.which', return_value='openssl')
	@patch('main.crypto.pki.subprocess.run')
	def test_create_user_cert_success(self, mock_run, mock_which):
		user = 'alice'
		priv_pem = b'-----BEGIN PRIVATE KEY-----\nFAKEKEY\n-----END PRIVATE KEY-----\n'
		pwd = 'secret'

		# preparar estructura necesaria en temp DIR
		ac2_nuevos = os.path.join('pki', 'ac2', 'nuevoscerts')
		os.makedirs(os.path.join(self.tempdir, ac2_nuevos), exist_ok=True)
		# openssl_AC2.cnf requerido por la función
		self._write_file(os.path.join('pki', 'ac2', 'openssl_AC2.cnf'), b'cfg')
		# serial.old contiene el nombre (por ejemplo '01')
		self._write_file(os.path.join('pki', 'ac2', 'serial.old'), b'01')
		# crear el certificado generado que la función copiará
		gen_cert_path = self._write_file(os.path.join('pki', 'ac2', 'nuevoscerts', '01.pem'), b'CERTDATA')

		# hacer que subprocess.run simule dos llamadas exitosas (req y ca)
		mock_run.side_effect = [CompletedProcess(args=['openssl','req'], returncode=0, stdout=''),
								CompletedProcess(args=['openssl','ca'], returncode=0, stdout='')]

		out_cert = pki.create_user_cert(user, priv_pem, pwd)

		# comprobar que el certificado final fue copiado a usuarios/
		expected_out = os.path.join(self.tempdir, 'pki', 'usuarios', f'{user}cert.pem')
		self.assertEqual(out_cert, expected_out)
		with open(expected_out, 'rb') as f:
			self.assertEqual(f.read(), b'CERTDATA')

		# comprobar que la clave privada se escribió
		keypath = os.path.join(self.tempdir, 'pki', 'usuarios', 'privado', f'{user}key.pem')
		with open(keypath, 'rb') as f:
			self.assertEqual(f.read(), priv_pem)

	def test_load_cert_pem(self):
		user = 'bob'
		data = b'MY_CERT'
		path = self._write_file(os.path.join('pki', 'usuarios', f'{user}cert.pem'), data)
		loaded = pki.load_cert_pem(user)
		self.assertEqual(loaded, data)

	@patch('main.crypto.pki.shutil.which', return_value='openssl')
	@patch('main.crypto.pki.subprocess.run')
	def test_verify_cert_chain_success_and_failure(self, mock_run, mock_which):
		# preparar AC1 y AC2 certs
		ac1 = self._write_file(os.path.join('pki', 'ac1', 'ac1cert.pem'), b'AC1')
		ac2 = self._write_file(os.path.join('pki', 'ac2', 'ac2cert.pem'), b'AC2')

		cert_pem = b'USERCERT'

		# caso exitoso
		mock_run.return_value = CompletedProcess(args=['openssl','verify'], returncode=0, stdout='tmp: OK')
		ok = pki.verify_cert_chain(cert_pem)
		self.assertTrue(ok)

		# caso fallo
		mock_run.return_value = CompletedProcess(args=['openssl','verify'], returncode=1, stdout='tmp: error')
		nok = pki.verify_cert_chain(cert_pem)
		self.assertFalse(nok)
