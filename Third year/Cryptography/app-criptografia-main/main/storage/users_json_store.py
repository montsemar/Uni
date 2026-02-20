"""Store para gestionar usuarios persistidos en JSON."""
import os
from .json_store import JsonStore

DATA_DIR = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "data"))

class JsonStoreUser(JsonStore):
    """Extensión de JsonStore para manejar usuarios (búsqueda y acceso)."""
    def __init__(self):
        super().__init__()
        self._data_list = []
        self._file_name = os.path.join(DATA_DIR, "usuarios.json")

    # ---- user management ---- #
    def get_user(self, username: str):
        """Devuelve el dict del usuario si existe, o None en caso contrario."""
        self.load_list_from_json()
        for item in self._data_list:
            if item.get("user") == username:
                return item
        return None
    
    def list_all_users(self):
        """Devuelve la lista de usuarios cargada desde JSON."""
        self.load_list_from_json()
        return self._data_list
