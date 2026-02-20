import unittest
import tempfile
import os
import json
from main.storage.users_json_store import JsonStoreUser

class TestJsonStoreUser(unittest.TestCase):
    def test_get_user_returns_none_when_file_missing(self):
        with tempfile.TemporaryDirectory() as td:
            path = os.path.join(td, "usuarios.json")
            store = JsonStoreUser()
            store._file_name = path
            # file does not exist -> should return None
            self.assertIsNone(store.get_user("alice"))

    def test_add_item_and_get_user_roundtrip(self):
        with tempfile.TemporaryDirectory() as td:
            path = os.path.join(td, "usuarios.json")
            store = JsonStoreUser()
            store._file_name = path
            item = {"user": "alice", "pwd_hash": {"salt": "s", "derived": "d", "iter":200000}}
            store.add_item(item)

            # new instance reads persisted file
            s2 = JsonStoreUser()
            s2._file_name = path
            got = s2.get_user("alice")
            self.assertIsNotNone(got)
            self.assertEqual(got.get("user"), "alice")
            self.assertEqual(got.get("pwd_hash"), item["pwd_hash"])

    def test_get_user_reads_existing_file(self):
        with tempfile.TemporaryDirectory() as td:
            path = os.path.join(td, "usuarios.json")
            data = [{"user":"bob","info":123}, {"user":"carla","info":456}]
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f)
            store = JsonStoreUser()
            store._file_name = path
            self.assertIsNotNone(store.get_user("carla"))
            self.assertEqual(store.get_user("carla")["info"], 456)
            self.assertIsNone(store.get_user("does-not-exist"))

    def test_get_user_with_malformed_json_raises(self):
        with tempfile.TemporaryDirectory() as td:
            path = os.path.join(td, "usuarios.json")
            with open(path, "w", encoding="utf-8") as f:
                f.write("{ not: valid json }")
            store = JsonStoreUser()
            store._file_name = path
            with self.assertRaises(Exception):
                store.get_user("someone")

    def test_list_all_users_returns_empty_when_no_file(self):
        with tempfile.TemporaryDirectory() as td:
            path = os.path.join(td, "usuarios.json")
            store = JsonStoreUser()
            store._file_name = path
            # file does not exist -> should return empty list
            self.assertEqual(store.list_all_users(), [])
    
    def test_list_all_users_reads_existing_file(self):
        with tempfile.TemporaryDirectory() as td:
            path = os.path.join(td, "usuarios.json")
            data = [{"user":"dave"},{"user":"eva"}]
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f)
            store = JsonStoreUser()
            store._file_name = path
            users = store.list_all_users()
            self.assertEqual(len(users), 2)
            self.assertTrue(any(u["user"] == "dave" for u in users))
            self.assertTrue(any(u["user"] == "eva" for u in users))
            