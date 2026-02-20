"""Punto de entrada de la aplicación.

Este módulo crea las instancias de stores necesarias y arranca la interfaz
gráfica `App`. Ejecutar con `python main/main.py` desde la raíz del repositorio
o usando `python -m main.main` para que las importaciones de paquete funcionen
correctamente.
"""
from ui_tkinter import App
from storage.users_json_store import JsonStoreUser
from storage.files_json_store import JsonStoreFile
from storage.messages_json_store import MessagesJsonStore


if __name__ == "__main__":
    usuarios = JsonStoreUser()
    archivos = JsonStoreFile()
    mensajes = MessagesJsonStore()
    app = App(usuarios, archivos, mensajes)
    app.mainloop()
