"""Store para mensajes del foro, basado en JsonStore.

Guarda cada mensaje como un objeto con keys: user, msg, hmac_hex, timestamp.
"""
import os
from .json_store import JsonStore

DATA_DIR = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "data"))


class MessagesJsonStore(JsonStore):
    """Almacena y recupera mensajes del foro en messages.json."""

    def __init__(self):
        super().__init__()
        self._data_list = []
        self._file_name = os.path.join(DATA_DIR, "messages.json")

    def add_message(self, user: str, msg: str, hmac_hex: str, timestamp: str):
        """Añade un mensaje a la lista y lo persiste en JSON."""
        item = {
            "user": user,
            "msg": msg,
            "hmac_hex": hmac_hex,
            "timestamp": timestamp,
        }
        self.add_item(item)

    def list_messages(self):
        """Devuelve la lista de mensajes cargada desde JSON."""
        self.load_list_from_json()
        return self._data_list
