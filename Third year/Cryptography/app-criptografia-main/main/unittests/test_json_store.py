"""Tests para Json Store"""
import unittest
import tempfile
import os
from main.storage.json_store import JsonStore

class TestJsonStore(unittest.TestCase):
    def test_load_missing_file_returns_empty(self):
        with tempfile.TemporaryDirectory() as td:
            p = os.path.join(td, "no-such-file.json")
            store = JsonStore()
            store._file_name = p
            data = store.load_list_from_json()
            self.assertEqual(data, [])
            self.assertEqual(store._data_list, [])

    def test_add_and_load_roundtrip(self):
        with tempfile.TemporaryDirectory() as td:
            p = os.path.join(td, "store.json")
            store = JsonStore()
            store._file_name = p
            item = {"id": 1, "name": "alice"}
            store.add_item(item)

            # load with a fresh instance to ensure persistence
            s2 = JsonStore()
            s2._file_name = p
            loaded = s2.load_list_from_json()
            self.assertIsInstance(loaded, list)
            self.assertIn(item, loaded)

    def test_find_item_true_and_false(self):
        with tempfile.TemporaryDirectory() as td:
            p = os.path.join(td, "store.json")
            store = JsonStore()
            store._file_name = p
            store._data_list = [{"user": "bob"}, {"user": "alice"}]
            store.save_list_to_json()

            # existing
            self.assertTrue(store.find_item("user", "alice"))
            # non-existing
            self.assertFalse(store.find_item("user", "charlie"))

    def test_find_item_missing_key_raises(self):
        with tempfile.TemporaryDirectory() as td:
            p = os.path.join(td, "store.json")
            store = JsonStore()
            store._file_name = p
            # item lacks 'user' key
            store._data_list = [{"name": "no_user_key"}]
            store.save_list_to_json()

            with self.assertRaises(Exception) as cm:
                store.find_item("user", "whatever")
            self.assertIn("KeyError", str(cm.exception))

    def test_load_malformed_json_raises(self):
        with tempfile.TemporaryDirectory() as td:
            p = os.path.join(td, "bad.json")
            # write invalid JSON
            with open(p, "w", encoding="utf-8") as f:
                f.write("{ not: valid json }")
            store = JsonStore()
            store._file_name = p
            with self.assertRaises(Exception) as cm:
                store.load_list_from_json()
            self.assertIn("JSON Decode Error - Wrong JSON Format", str(cm.exception))

    def test_save_to_invalid_path_raises(self):
        with tempfile.TemporaryDirectory() as td:
            # non-existent subdirectory to force FileNotFoundError on open()
            bad_dir = os.path.join(td, "nope")
            p = os.path.join(bad_dir, "out.json")
            store = JsonStore()
            store._file_name = p
            store._data_list = [{"x": 1}]
            with self.assertRaises(Exception) as cm:
                store.save_list_to_json()
            self.assertIn("Wrong file or file path", str(cm.exception))
