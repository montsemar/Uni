import unittest
import tempfile
import os
import base64
import main.storage.files_json_store as fmod
from main.storage.files_json_store import JsonStoreFile

class TestJsonStoreFile(unittest.TestCase):
    def test_list_files_returns_empty_when_no_files_json(self):
        with tempfile.TemporaryDirectory() as td:
            fmod.DATA_DIR = td
            store = JsonStoreFile()
            # no files.json present
            self.assertEqual(store.load_list_from_json(), [])

    def test_save_encrypted_file_and_get_file_info(self):
        with tempfile.TemporaryDirectory() as td:
            fmod.DATA_DIR = td
            files_dir = os.path.join(td, "files")
            os.makedirs(files_dir, exist_ok=True)

            store = JsonStoreFile()
            name = "document1"
            nonce = b"\x00" * 12
            tag = b"\x01" * 16
            ciphertext = b"secret-bytes"
            owner = "alice"
            enc_key = {"alice": "deadbeefcafebabe"}
            signature = b"signature-bytes"

            store.save_encrypted_file(name, ciphertext, nonce, tag, owner, enc_key,
                                      scope="private", signature=signature)

            # file written to disk
            expected_path = os.path.join(files_dir, name + ".enc")
            self.assertTrue(os.path.exists(expected_path))
            with open(expected_path, "rb") as fh:
                raw = fh.read()

            self.assertEqual(raw, nonce + tag + ciphertext)

            # metadata persisted and readable
            files = store.load_list_from_json()
            self.assertTrue(any(f["name"] == name and f["owner"] == owner for f in files))

            info = store.get_file_info(name)
            self.assertIsNotNone(info)
            self.assertEqual(info["name"], name)
            self.assertEqual(info["owner"], owner)
            self.assertEqual(info["nonce"], nonce.hex())
            self.assertEqual(info["tag"], tag.hex())
            self.assertEqual(info["enc_keys"], enc_key)
            self.assertEqual(info["signature"], base64.b64encode(signature).decode('utf-8'))

            # new instance reads persisted metadata
            s2 = JsonStoreFile()
            lst2 = s2.load_list_from_json()
            self.assertTrue(any(f["name"] == name for f in lst2))

    def test_get_file_info_returns_none_for_missing_name(self):
        with tempfile.TemporaryDirectory() as td:
            fmod.DATA_DIR = td
            os.makedirs(os.path.join(td, "files"), exist_ok=True)
            store = JsonStoreFile()
            # no items added -> should return None
            self.assertIsNone(store.get_file_info("no-such-file"))

    def test_list_shared_and_your_files(self):
        with tempfile.TemporaryDirectory() as td:
            fmod.DATA_DIR = td
            os.makedirs(os.path.join(td, "files"), exist_ok=True)
            store = JsonStoreFile()

            # add files with different scopes and owners
            store.add_item({
                "name": "file1",
                "owner": "alice",
                "scope": "shared",
                "path": "path1",
                "nonce": "00"*12,
                "tag": "01"*16,
                "enc_keys": {"alice": "deadbeef"},
                "signature": "signature1",
                "signer": "alice",
                "sign_algorithm": "RSA-PSS-SHA256"
            })
            store.add_item({
                "name": "file2",
                "owner": "bob",
                "scope": "private",
                "path": "path2",
                "nonce": "00"*12,
                "tag": "01"*16,
                "enc_keys": {"bob": "cafebabe"},
                "signature": "signature2",
                "signer": "bob",
                "sign_algorithm": "RSA-PSS-SHA256"
            })
            store.add_item({
                "name": "file3",
                "owner": "alice",
                "scope": "private",
                "path": "path3",
                "nonce": "00"*12,
                "tag": "01"*16,
                "enc_keys": {"alice": "feedface"},
                "signature": "signature3",
                "signer": "alice",
                "sign_algorithm": "RSA-PSS-SHA256"
            })

            public_files = store.list_shared_files()
            self.assertEqual(len(public_files), 1)
            self.assertEqual(public_files[0]["name"], "file1")

            alice_files = store.list_your_files("alice")
            self.assertEqual(len(alice_files), 2)
            self.assertTrue(any(f["name"] == "file1" for f in alice_files))
            self.assertTrue(any(f["name"] == "file3" for f in alice_files))
    
    def test_publish_file_updates_scope_and_enc_keys(self):
        with tempfile.TemporaryDirectory() as td:
            fmod.DATA_DIR = td
            os.makedirs(os.path.join(td, "files"), exist_ok=True)
            store = JsonStoreFile()

            store.add_item({
                "name": "file1",
                "owner": "alice",
                "scope": "private",
                "path": "path1",
                "nonce": "00"*12,
                "tag": "01"*16,
                "enc_keys": {"alice": "deadbeef"},
                "signature": "signature1",
                "signer": "alice",
                "sign_algorithm": "RSA-PSS-SHA256"
            })

            new_enc_keys = {"alice": "deadbeef", "bob": "cafebabe"}
            store.publish_file("file1", new_enc_keys)

            updated_file = next(f for f in store.load_list_from_json() if f["name"] == "file1")
            self.assertEqual(updated_file["scope"], "shared")
            self.assertEqual(updated_file["enc_keys"], new_enc_keys)
        
    def test_publish_file_raises_for_missing_file(self):
        with tempfile.TemporaryDirectory() as td:
            fmod.DATA_DIR = td
            os.makedirs(os.path.join(td, "files"), exist_ok=True)
            store = JsonStoreFile()

            with self.assertRaises(FileNotFoundError):
                store.publish_file("nonexistent-file", {"alice": "deadbeef"})
