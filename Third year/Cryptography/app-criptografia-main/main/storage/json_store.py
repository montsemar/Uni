"""Lógica común para almacenamiento en ficheros JSON.

Provee carga/guardado y operaciones básicas sobre una lista interna de objetos.
"""
import json

class JsonStore:
    """Clase base para almacenar una lista de items en un fichero JSON.

    Atributos:
        _data_list: lista interna de objetos.
        _file_name: ruta al fichero JSON.
    """
    def __init__(self):
        """Clase para almacenar datos utilizando JSON"""
        self._data_list = []
        self._file_name = ''

    def load_list_from_json(self):
        """Carga la lista desde el fichero JSON configurado en _file_name.

        Devuelve la lista cargada (o lista vacía si no existe fichero).
        """
        try:
            with open(self._file_name, "r", encoding="utf-8", newline="") as file:
                self._data_list = json.load(file)
        except FileNotFoundError:
            self._data_list = []
        except json.JSONDecodeError as ex:
            raise Exception("JSON Decode Error - Wrong JSON Format") from ex
        return self._data_list

    def find_item(self, key, value):
        """Busca si existe un item con item[key] == value. Devuelve bool."""
        self.load_list_from_json()
        item_found = False
        try:
            for item in self._data_list:
                if item[key] == value:
                    item_found = True
        except KeyError as ke:
            raise Exception("KeyError") from ke
        return item_found

    def add_item(self, item):
        """Añade un item a la lista y persiste el JSON."""
        self.load_list_from_json()
        self._data_list.append(item)
        self.save_list_to_json()

    def save_list_to_json(self):
        """Guarda la lista interna en el fichero JSON configurado."""
        try:
            with open(self._file_name, "w", encoding="UTF-8",
                      newline="") as file:
                json.dump(self._data_list, file, indent=2)
        except FileNotFoundError as ex:
            raise Exception(
                "Wrong file or file path") from ex
        except json.JSONDecodeError as ex:
            raise Exception(
                "JSON Decode Error - Wrong JSON Format") from ex

