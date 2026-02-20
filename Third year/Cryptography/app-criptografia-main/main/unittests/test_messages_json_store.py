import unittest
import tempfile
import os
from main.storage.messages_json_store import MessagesJsonStore


class TestMessagesJsonStore(unittest.TestCase):
    def test_add_and_list_messages_roundtrip(self):
        with tempfile.TemporaryDirectory() as td:
            # point data dir to temp
            from main.storage import messages_json_store as mmod
            mmod.DATA_DIR = td
            store = MessagesJsonStore()
            store.add_message('alice', 'hola', 'deadbeef', '28/10/2025 12:00')

            # new instance should read persisted file
            s2 = MessagesJsonStore()
            s2._file_name = os.path.join(td, 'messages.json')
            msgs = s2.list_messages()
            self.assertEqual(len(msgs), 1)
            m = msgs[0]
            self.assertEqual(m['user'], 'alice')
            self.assertEqual(m['msg'], 'hola')
            self.assertEqual(m['hmac_hex'], 'deadbeef')

    def test_list_messages_empty_when_no_file(self):
        with tempfile.TemporaryDirectory() as td:
            from main.storage import messages_json_store as mmod
            mmod.DATA_DIR = td
            store = MessagesJsonStore()
            # ensure no file
            p = os.path.join(td, 'messages.json')
            if os.path.exists(p):
                os.remove(p)
            self.assertEqual(store.list_messages(), [])
