"""Store para manejar archivos cifrados y su metadata en JSON + ficheros en disco."""
import os
from .json_store import JsonStore
import base64

DATA_DIR = os.path.normpath(os.path.join(os.path.dirname(__file__), "..", "data"))

class JsonStoreFile(JsonStore):
    """Extensión de JsonStore para almacenar metadatos de archivos cifrados."""
    def __init__(self):
        super().__init__()
        self._data_list = []
        self._file_name = os.path.join(DATA_DIR, "files.json")

    # ---- file storage (ciphertext + metadata) ---- #
    def save_encrypted_file(self, name: str, ciphertext: bytes, nonce: bytes,
                            tag: bytes, owner: str, enc_keys: dict, scope: str, signature: bytes):
        """Guarda en disco el contenido cifrado (nonce|tag|ciphertext) y metadata JSON.
        Args:
            name: nombre lógico del archivo (sin extensión).
            ciphertext: bytes del ciphertext.
            nonce: nonce usado en AES-GCM (12 bytes).
            tag: tag de autenticación (16 bytes).
            signature: firma digital del archivo (bytes).
            owner: usuario propietario.
            enc_keys: claves AES cifradas (hex string) para almacenarlas en metadata
            scope: "shared" o "private"
        """
        # storage binary ciphertext on disk and metadata in json
        safe_name = name + ".enc"
        path = os.path.join(os.path.join(DATA_DIR, "files"), safe_name)
        # ensure target directory exists
        dirpath = os.path.dirname(path)
        os.makedirs(dirpath, exist_ok=True)
        with open(path, "wb") as f:
            f.write(nonce + tag + ciphertext)
        if scope == "shared" or scope == "private":
            item = {"name": name,
                    "owner": owner,
                    "path": path,
                    "nonce": nonce.hex(),
                    "tag": tag.hex(),
                    "enc_keys": enc_keys,
                    "signer": owner,
                    "signature": base64.b64encode(signature).decode('utf-8'),
                    "sign_algorithm": "RSA-PSS-SHA256",
                    "scope": scope
                    }
        else :
            raise ValueError(f"Invalid scope: {scope}")
        self.add_item(item)
    
    def list_shared_files(self) -> list:
        """Devuelve la lista de archivos con scope 'shared'."""
        all_files = self.load_list_from_json()
        shared_files = [f for f in all_files if f.get("scope") == "shared"]
        return shared_files
    
    def list_your_files(self, owner: str) -> list:
        """Devuelve la lista de archivos cuyo owner es el usuario dado."""
        all_files = self.load_list_from_json()
        your_files = [f for f in all_files if f["owner"] == owner]
        return your_files

    def get_file_info(self, name: str) -> dict:
        """Obtiene la metadata y lee el fichero cifrado.
        Returns:
            dict con keys: name, owner, nonce, tag, ciphertext, enc_keys, signature, sign_algorithm, path
            o None si no se encuentra.
        """
        for f in self.load_list_from_json():
            if f["name"] == name:
                info = dict(f)  # copia para no mutar el almacenado
                # leave signature as base64 string (tests expect a base64 string)
                # sig_b64 = info.get("signature")
                # if isinstance(sig_b64, str):
                #     try:
                #         info["signature"] = base64.b64decode(sig_b64)
                #     except Exception:
                #         pass
                path = info.get("path")
                # intentar leer fichero y extraer nonce|tag|ciphertext
                if path and os.path.exists(path):
                    with open(path, "rb") as fh:
                        raw = fh.read()
                    if len(raw) >= 12 + 16:
                        info["nonce"] = raw[:12].hex()
                        info["tag"] = raw[12:28].hex()
                        info["ciphertext"] = raw[28:]
                    else:
                        # fallback: convertir valores del JSON (hex->bytes) y dejar raw como ciphertext
                        n_hex = info.get("nonce")
                        t_hex = info.get("tag")
                        info["nonce"] = n_hex if isinstance(n_hex, str) else (n_hex.hex() if isinstance(n_hex, (bytes, bytearray)) else n_hex)
                        info["tag"] = t_hex if isinstance(t_hex, str) else (t_hex.hex() if isinstance(t_hex, (bytes, bytearray)) else t_hex)
                        info["ciphertext"] = raw
                else:
                    # fichero no presente: convertir nonce/tag hex a bytes si es necesario y ciphertext a None
                    n_hex = info.get("nonce")
                    t_hex = info.get("tag")
                    info["nonce"] = n_hex if isinstance(n_hex, str) else (n_hex.hex() if isinstance(n_hex, (bytes, bytearray)) else n_hex)
                    info["tag"] = t_hex if isinstance(t_hex, str) else (t_hex.hex() if isinstance(t_hex, (bytes, bytearray)) else t_hex)
                    info["ciphertext"] = None
                return info
        return None

    def publish_file(self, filename: str, enc_keys: dict):
        """Marcar un fichero existente como público y actualizar enc_keys (dict user->hex)."""
        data = self.load_list_from_json()
        found = False
        for item in data:
            if item["name"] == filename:
                item["enc_keys"] = enc_keys
                item["scope"] = "shared"
                found = True
        if not found:
            raise FileNotFoundError(f"File not found in store: {filename}")
        self.save_list_to_json()
