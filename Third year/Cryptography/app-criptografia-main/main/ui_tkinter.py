"""Interfaz gráfica con tkinter para la aplicación (registro, archivos, foro).

Esta interfaz demuestra registro/login con KDF+RSA, subida/descarga de archivos
usando AES-GCM y RSA (sobreclave), y un foro simple con HMAC.
"""
# pylint: disable=attribute-defined-outside-init
# pylint: disable=broad-except
import os
import base64
import re
import time
import tkinter as tk
from tkinter import ttk, messagebox, filedialog, simpledialog
from crypto.asymmetric import (
    load_private_key_pem,
    load_public_key_pem,
    rsa_encrypt_with_public,
    rsa_decrypt_with_private,
)
from crypto.hash import hash_password, verify_password
from crypto.hmac import hmac_tag, verify_hmac
from crypto.symmetric import aes_gcm_encrypt, aes_gcm_decrypt
from crypto.keys import derive_hmac_key_from_password, generate_rsa_keypair, generate_symmetric_key
from crypto.signatures import rsa_sign, rsa_verify
from crypto.pki import verify_cert_chain, load_cert_pem, create_user_cert
from storage.users_json_store import JsonStoreUser
from storage.files_json_store import JsonStoreFile
from storage.messages_json_store import MessagesJsonStore
from server.logger import logger


class App(tk.Tk):  # pylint: disable=too-many-instance-attributes
    """Aplicación principal con pestañas para autenticación, archivos y foro.

    Args:
        user_st: instancia de JsonStoreUser para gestionar usuarios.
        file_st: instancia de JsonStoreFile para gestionar archivos.
        msg_st: instancia de MessagesJsonStore para gestionar mensajes del foro.
    """

    def __init__(self, user_st: JsonStoreUser, file_st: JsonStoreFile, msg_st: MessagesJsonStore):
        super().__init__()
        self.title("Locker")
        self.geometry("900x800")
        self.usuarios = user_st
        self.archivos = file_st
        self.messages = msg_st
        self.current_user = None
        self.user_priv_key = None
        self.create_ui()

    def create_ui(self):
        """Construye la interfaz principal con pestañas."""
        nb = ttk.Notebook(self)
        nb.pack(expand=True, fill="both")

        self.tab_auth = ttk.Frame(nb)
        self.tab_files = ttk.Frame(nb)
        self.tab_forum = ttk.Frame(nb)
        self.tab_shared = ttk.Frame(nb)

        nb.add(self.tab_auth, text="Identificación")
        nb.add(self.tab_files, text="Mi Mochila")
        nb.add(self.tab_shared, text="Publicaciones")
        nb.add(self.tab_forum, text="Foro")
        
        self.build_shared_tab()
        self.build_auth_tab()
        self.build_files_tab()
        self.build_forum_tab()

    # ---- Auth tab ----
    def build_auth_tab(self):
        """Construye la pestaña de registro / login con widgets necesarios."""
        f = self.tab_auth
        ttk.Label(f, text="Usuario").pack(pady=4)
        self.ent_user = ttk.Entry(f)
        self.ent_user.pack()

        ttk.Label(f, text="Contraseña").pack(pady=4)
        self.ent_pass = ttk.Entry(f, show="*")
        self.ent_pass.pack()

        btn_frame = ttk.Frame(f)
        btn_frame.pack(pady=8)
        ttk.Button(btn_frame, text="Registrarse",
                   command=self.on_register).grid(row=0, column=0, padx=6)
        ttk.Button(btn_frame, text="Iniciar sesión",
                   command=self.on_login).grid(row=0, column=1, padx=6)
        ttk.Button(btn_frame, text="Cerrar sesión",
                   command=self.on_logout).grid(row=0, column=2, padx=6)

        ttk.Label(f, text="Estado:").pack(pady=6)
        self.lbl_status = ttk.Label(f, text="No autenticado")
        self.lbl_status.pack()

    def on_register(self):
        """Manejador para registrar un nuevo usuario.

        Valida campos, deriva hash de la contraseña y genera par RSA.
        """
        user = self.ent_user.get().strip()
        pwd = self.ent_pass.get().strip()
        logger.info("Register attempt: user=%s", user)
        if not user or not pwd:
            logger.warning("Register failed - missing fields: user='%s'", user)
            messagebox.showwarning("Error", "Usuario y contraseña requeridos")
            return
        if self.usuarios.find_item("user", user):
            logger.warning("Register failed - user exists: %s", user)
            messagebox.showwarning("Error", "Usuario ya existe")
            return
        # Validar fortaleza de la contraseña
        pattern = r"^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9]{8,}$"
        if not re.match(pattern, pwd):
            logger.warning("Register failed - weak password for user: %s", user)
            messagebox.showwarning(
                "Error",
                ("La contraseña debe tener al menos 8 caracteres, "
                 "incluir letras y números, y no contener caracteres especiales.")
            )
            return
        pwd_hash = hash_password(pwd)
        # generar par RSA por usuario y guardar claves (privada cifrada con KDF opcional)
        priv_pem, pub_pem = generate_rsa_keypair(clave=pwd)
        # crear certificado firmado por AC2
        cert_path = create_user_cert(user, priv_pem, pwd) 
        # certficado siempre será generado en pki/usuarios/{user}cert.pem
        # guardamos camino porque bytes no convienen en JSON
        item = {"user": user,
                "pwd_hash": pwd_hash,
                "priv_pem": priv_pem,
                "pub_pem": pub_pem,
                "cert_pem": cert_path}
        self.usuarios.add_item(item)
        logger.info("User registered: %s", user)
        messagebox.showinfo("Registro",
                            f"Usuario {user} registrado con RSA 2048 (claves guardadas en store).")

    def on_login(self):
        """Manejador de inicio de sesión.
        Verifica la contraseña y carga la clave privada del usuario en memoria.
        """
        user = self.ent_user.get().strip()
        pwd = self.ent_pass.get().strip()
        logger.info("Login attempt: user=%s", user)
        if not self.usuarios.find_item("user", user):
            logger.warning("Login failed - user not found: %s", user)
            messagebox.showerror("Error", "Usuario no existe")
            return
        stored = self.usuarios.get_user(user)
        if verify_password(pwd, stored["pwd_hash"]):
            self.current_user = user
            # cargar clave privada en memoria
            self.user_priv_key = load_private_key_pem(
                stored["priv_pem"].encode(), password=pwd.encode("utf-8"))
            self.lbl_status.configure(text=f"Autenticado: {user}")
            self.load_messages_into_log()
            logger.info("Login success: %s", user)
            messagebox.showinfo("Login", f"Bienvenida {user}")
        else:
            logger.warning("Login failed - bad password for user: %s", user)
            messagebox.showerror("Login", "Contraseña incorrecta")
        self.refresh_files()
        self.refresh_files_mochila()

    def on_logout(self):
        """Cierra la sesión del usuario actual: borra estado y clave privada en memoria."""
        if not self.current_user:
            logger.info("Logout attempted with no active user")
            messagebox.showinfo("Logout", "No hay ningún usuario autenticado")
            return
        logger.info("User logged out: %s", self.current_user)
        self.current_user = None
        self.user_priv_key = None
        self.lbl_status.configure(text="No autenticado")
        # clear sensitive UI state if desired
        try:
            self.log.configure(state="normal")
            self.log.delete("1.0", "end")
            self.log.configure(state="disabled")
        except Exception:
            pass
        messagebox.showinfo("Logout", "Sesión cerrada")

    # ---- Files tab (AES-GCM + RSA envelope) ----
    def build_files_tab(self):
        """Construye la pestaña de gestión de archivos (subida/descarga)."""
        f = self.tab_files
        ttk.Label(f, text="Subir apuntes a tu mochila").pack(pady=6)
        ttk.Button(f, text="Seleccionar archivo",
                   command=self.on_upload_file_private).pack(pady=4)
        ttk.Separator(f, orient="horizontal").pack(fill="x", pady=8)
        ttk.Label(f, text="Archivos disponibles:").pack()
        self.mochila = tk.Listbox(f)
        self.mochila.pack(expand=True, fill="both", padx=8, pady=8)
        btn_frame = ttk.Frame(f)
        btn_frame.pack(pady=6)
        ttk.Button(btn_frame, text="Refrescar lista",
                   command=self.refresh_files_mochila).grid(row=0, column=0, padx=6)
        ttk.Button(btn_frame, text="Descargar",
                   command=self.on_download_file_private).grid(row=0, column=1,
                                                  padx=6)
        # desde la mochila se puede publicar/compartir el archivo
        ttk.Button(btn_frame, text="Compartir", 
                   command=self.on_share).grid(row=0, column=2, padx=6)

    def on_upload_file_private(self):
        """Sube un archivo: cifra con AES-GCM y cifra la clave con RSA del owner."""
        if not self.current_user:
            logger.warning("Upload attempted without login")
            messagebox.showwarning("Acceso", "Inicia sesión primero")
            return
        path = filedialog.askopenfilename()
        if not path: return
        with open(path, "rb") as f:
            plaintext = f.read()
        logger.info("Uploading file selected: path=%s user=%s size=%d",
                    path, self.current_user, len(plaintext))
        # No se necesita firmar en privado, no necesitamos confirmar el origen
        # Aunque también es válido usarlo para asegurar integridad, ya tenemos tag
        # De todas formas, lo añadimos para que el formato de los archivos sea consistente
        signature = rsa_sign(self.user_priv_key, plaintext)
        # generar clave simétrica por archivo
        key = generate_symmetric_key()   
        ciphertext, nonce, tag = aes_gcm_encrypt(key, plaintext)
        filename = os.path.basename(path)
        # cifrar la clave AES con la clave pública del propietario para
        # almacenarla -> cifrado híbrido
        owner_pub_pem = self.usuarios.get_user(self.current_user)[
            "pub_pem"].encode()
        owner_pub = load_public_key_pem(owner_pub_pem)
        enc_key = rsa_encrypt_with_public(owner_pub, key)
        try:
            self.archivos.save_encrypted_file(filename,
                                              ciphertext, nonce, tag,
                                              self.current_user,
                                              {self.current_user: enc_key.hex()},
                                              "private", 
                                              signature)
            logger.info("File saved encrypted: %s owner=%s", filename, self.current_user)
            messagebox.showinfo("Subida",
                                f"Archivo '{filename}' subido correctamente a tu mochila.")
        except Exception as e:
            logger.exception("Error saving encrypted file %s for user %s: %s",
                             filename, self.current_user, e)
            messagebox.showerror("Subida", f"Error guardando archivo: {e}")
        self.refresh_files_mochila()

    def refresh_files_mochila(self):
        """Refresca la lista de archivos solo suyos en la mochila."""
        self.mochila.delete(0, tk.END)
        files = list(self.archivos.list_your_files(self.current_user))
        for info in files:
            self.mochila.insert(tk.END, f"{info['name']}")
        logger.info("Refreshed file list, count=%d", len(files))

    def on_download_file_private(self):  # pylint: disable=too-many-return-statements
        """Descarga/descifra un archivo seleccionado (solo owner)."""
        if not self.current_user:
            logger.warning("Download attempted without login")
            messagebox.showwarning("Acceso", "Inicia sesión primero")
            return  
        sel = self.mochila.curselection()
        if not sel:
            messagebox.showwarning("Seleccione", "Selecciona un archivo")
            return       
        idx = sel[0]
        entry = self.mochila.get(idx)
        name = entry.split(" (")[0]
        info = self.archivos.get_file_info(name)
        if not info:
            messagebox.showerror("Error", "No encontrado")
            return
        # solo el owner puede descifrar en privado (clave AES cifrada con su RSA)
        if info["owner"] != self.current_user:
            messagebox.showwarning("Acceso",
                                   ("Solo el propietario puede descargar este archivo"))
            return
        # Selecciono solo la clave de este usuario ya que es privado y solo salen archivos suyos
        enc_key_raw = info["enc_keys"][self.current_user]
        enc_key_bytes = bytes.fromhex(enc_key_raw) if isinstance(enc_key_raw, str) else enc_key_raw
        # descifrar clave AES con la clave privada del usuario
        if not self.user_priv_key:
            messagebox.showerror("Error",
                                 "Clave privada del usuario no cargada en memoria")
            return
        aes_key = rsa_decrypt_with_private(self.user_priv_key, enc_key_bytes)
        # Descifra el archivo: normalizar nonce/tag a bytes si vienen como hex
        nonce_bytes = bytes.fromhex(info["nonce"]) if isinstance(info.get("nonce"), str) else info.get("nonce")
        tag_bytes = bytes.fromhex(info["tag"]) if isinstance(info.get("tag"), str) else info.get("tag")
        ciphertext_bytes = info.get("ciphertext")
        try:
            plaintext = aes_gcm_decrypt(aes_key, ciphertext_bytes,
                                        nonce_bytes, tag_bytes)
        except Exception as e:
            logger.exception("Decryption failed for file %s owner=%s: %s",
                             name, self.current_user, e)
            messagebox.showerror("Descifrado", f"Error al descifrar: {e}")
            return
        # pedir al usuario dónde guardar el archivo descifrado
        save_path = filedialog.asksaveasfilename(initialfile=name,
                                                 title="Guardar archivo descifrado como")
        if not save_path:
            messagebox.showinfo("Descarga", "Guardado cancelado")
            return
        try:
            with open(save_path, "wb") as out:
                out.write(plaintext)
            logger.info("File downloaded and saved: %s user=%s", save_path, self.current_user)
        except Exception as e:
            logger.exception("Failed saving decrypted file %s: %s", save_path, e)
            messagebox.showerror("Guardar", f"Error al guardar el archivo: {e}")
            return
        messagebox.showinfo("Descifrado", f"Descifrado correctamente y guardado en: {save_path}")

    def on_share(self):
        """Comparte un archivo de la mochila con otros usuarios en Publicaciones."""
        if not self.current_user:
            messagebox.showwarning("Acceso", "Inicia sesión primero")
            return
        sel = self.mochila.curselection()
        if not sel:
            messagebox.showwarning("Seleccione", "Selecciona un archivo para compartir")
            return
        idx = sel[0]
        entry = self.mochila.get(idx)
        name = entry.split(" (")[0]
        info = self.archivos.get_file_info(name)
        if not info:
            messagebox.showerror("Error", "Archivo no encontrado en el store")
            return
        if info.get("owner") != self.current_user:
            messagebox.showwarning("Acceso", "Solo el propietario puede publicar este archivo")
            return
        # localizar la clave cifrada del owner
        enc_hex = info["enc_keys"][self.current_user]
        try:
            enc_key_bytes = bytes.fromhex(enc_hex) if isinstance(enc_hex, str) else enc_hex
            aes_key = rsa_decrypt_with_private(self.user_priv_key, enc_key_bytes)
        except Exception as e:
            logger.exception("Failed to decrypt envelope key for sharing %s: %s", name, e)
            messagebox.showerror("Error", "No se pudo descifrar la clave AES con tu clave privada")
            return
        # Pedir usuarios con los que compartir (mismo UI que subida pública)
        share_raw = simpledialog.askstring(
            "Compartir archivo",
            ("Introduce los usuarios con los que quieres compartir el archivo\n"
             "(separados por comas)."),
            parent=self,
        )
        if share_raw is None:
            return
        share_users = [u.strip() for u in share_raw.split(",") if u.strip()]
        if not share_users:
            messagebox.showwarning("Error", "Debes indicar al menos un usuario")
            return
        if self.current_user not in share_users:
            share_users.append(self.current_user)
        # construir nuevo enc_keys dict cifrando la misma clave AES para cada usuario
        enc_keys_hex = {}
        for username in share_users:
            user_data = self.usuarios.get_user(username)
            if not user_data:
                messagebox.showerror("Error", f"El usuario '{username}' no existe")
                return
            # Aquí se verifican las claves públicas y certificados de los usuarios
            if username != self.current_user:
                cert_pem = load_cert_pem(username)
                if not cert_pem:
                    logger.error("Error", f"El usuario '{username}' no tiene certificado.")
                    return
                if not verify_cert_chain(cert_pem):
                    logger.error("Error", f"El certificado del usuario '{username}' no es válido.")
                    return 
            pub_pem = user_data["pub_pem"].encode()
            pub_key = load_public_key_pem(pub_pem)
            enc_key_bytes = rsa_encrypt_with_public(pub_key, aes_key)
            enc_keys_hex[username] = enc_key_bytes.hex()
        # actualizar el store: marcar como shared y actualizar enc_keys
        try:
            self.archivos.publish_file(name, enc_keys_hex)
            messagebox.showinfo("Publicado", f"Archivo '{name}' publicado en Publicaciones.")
            logger.info("File published from mochila: %s by %s", name, self.current_user)
        except Exception as e:
            logger.exception("Error publishing file %s: %s", name, e)
            messagebox.showerror("Error", f"No se pudo publicar el archivo: {e}")
            return
        # refrescar vistas
        self.refresh_files_mochila()
        self.refresh_files()
    # ---- Fin Files Privado ----

    # ---- Shared tab ----
    def build_shared_tab(self):
        """Construye la pestaña de gestión de archivos (subida/descarga)."""
        f = self.tab_shared
        ttk.Label(f, text="Subir apuntes a la nube").pack(pady=6)
        ttk.Button(f, text="Seleccionar archivo",
                   command=self.on_upload_file).pack(pady=4)
        ttk.Separator(f, orient="horizontal").pack(fill="x", pady=8)
        ttk.Label(f, text="Archivos disponibles:").pack()
        self.lst_files_public = tk.Listbox(f)
        self.lst_files_public.pack(expand=True, fill="both", padx=8, pady=8)
        btn_frame = ttk.Frame(f)
        btn_frame.pack(pady=6)
        ttk.Button(btn_frame, text="Refrescar lista",
                   command=self.refresh_files).grid(row=0, column=0, padx=6)
        ttk.Button(btn_frame, text="Descargar",
                   command=self.on_download_file).grid(row=0, column=1,
                                                  padx=6)
        return
    
    def refresh_files(self):
        """Refresca la lista de archivos mostrada en la UI."""
        self.lst_files_public.delete(0, tk.END)
        files = list(self.archivos.list_shared_files())
        for info in files:
            users = ""
            for user in info["enc_keys"].keys():
                if user != info["owner"]:
                    users += user + " "
            if info["owner"] == self.current_user:
                self.lst_files_public.insert(tk.END,
                                    f"{info['name']} (mío) | Permisos: {users}")
            else:
                self.lst_files_public.insert(tk.END,
                                    f"{info['name']} (owner: {info['owner']}) | Permisos: {users}")
        logger.info("Refreshed file list, count=%d", len(files))

    def on_download_file(self):  # pylint: disable=too-many-return-statements
        """Descarga/descifra un archivo seleccionado"""
        if not self.current_user:
            logger.warning("Download attempted without login")
            messagebox.showwarning("Acceso", "Inicia sesión primero")
            return
        sel = self.lst_files_public.curselection()
        if not sel:
            messagebox.showwarning("Seleccione", "Selecciona un archivo")
            return
        idx = sel[0]
        entry = self.lst_files_public.get(idx)
        file_name = entry.split(" (")[0]
        info = self.archivos.get_file_info(file_name)
        if not info:
            messagebox.showerror("Error", "No encontrado")
            return
        # comprobar que el usuario tiene permisos (su clave está en enc_keys)
        current_user = self.current_user
        if current_user not in info["enc_keys"]:
            messagebox.showerror("Error", "No tienes permisos para este archivo.")
            return
        # pedir al usuario dónde guardar el archivo descifrado
        save_path = filedialog.asksaveasfilename(
            title="Guardar archivo descifrado",
            initialfile=file_name,
            defaultextension="",
        )
        if not save_path:
            messagebox.showinfo("Descarga", "Guardado cancelado")
            return
        enc_key_str = info["enc_keys"][current_user]
        enc_key_bytes = bytes.fromhex(enc_key_str) if isinstance(enc_key_str, str) else enc_key_str
        aes_key = rsa_decrypt_with_private(self.user_priv_key, enc_key_bytes)
        # Normalizar nonce/tag a bytes si vienen como hex
        nonce_bytes = bytes.fromhex(info["nonce"]) if isinstance(info.get("nonce"), str) else info.get("nonce")
        tag_bytes = bytes.fromhex(info["tag"]) if isinstance(info.get("tag"), str) else info.get("tag")
        ciphertext_bytes = info.get("ciphertext")
        try:
            plaintext = aes_gcm_decrypt(
                aes_key,
                ciphertext_bytes,
                nonce_bytes,
                tag_bytes
            )
        except Exception:
            messagebox.showerror("Error", "Error al descifrar (clave incorrecta o archivo corrupto).")
            return
        # Verificar la firma digital del owner
        signer_data = info["signer"]
        if not signer_data:
            messagebox.showerror("Error", f"No existe el usuario firmante: {signer_data}")
            return
        signer = self.usuarios.get_user(signer_data)
        if not signer:
            messagebox.showerror("Error", f"No existe el usuario firmante: {signer_data}")
            return
        # verificar que el certificado del firmante es válido antes de usar su clave pública
        cert_pem = load_cert_pem(signer_data)
        if not cert_pem:
            logger.error("Error", f"El usuario '{signer_data}' no tiene certificado.")
            return
        if not verify_cert_chain(cert_pem):
            logger.error("Error", f"El certificado del usuario '{signer_data}' no es válido.")
            return 
        # continuamos verificando la firma
        signer_pub = load_public_key_pem(signer["pub_pem"].encode())
        # signature stored in metadata is base64 string; decode to bytes for verification
        sig_raw = info.get("signature")
        if isinstance(sig_raw, str):
            try:
                sig_bytes = base64.b64decode(sig_raw)
            except Exception:
                sig_bytes = sig_raw.encode() if isinstance(sig_raw, str) else sig_raw
        else:
            sig_bytes = sig_raw
        try:
            is_valid = rsa_verify(signer_pub, sig_bytes, plaintext)
        except Exception:
            is_valid = False
        if not is_valid:
            messagebox.showerror("Firma inválida", "La firma digital NO coincide (archivo alterado).")
            return
        logger.info("Firma verificada para archivo %s firmado por %s",
                    file_name, signer_data)
        with open(save_path, "wb") as fh:
            fh.write(plaintext)
        messagebox.showinfo(
            "Descarga correcta",
            f"Archivo descifrado y firma verificada.\n"
            f"Firmado por: {signer_data}"
        )

    def on_upload_file(self):
        """Sube un archivo: cifra con AES-GCM y cifra la clave con RSA del owner.
        Solo compartido públicamente en esta versión."""
        if not self.current_user:
            logger.warning("Upload attempted without login")
            messagebox.showwarning("Acceso", "Inicia sesión primero")
            return
        path = filedialog.askopenfilename()
        share_raw = simpledialog.askstring(
            "Compartir archivo",
            ("Introduce los usuarios con los que quieres compartir el archivo\n"
            "(separados por comas).\n\nEjemplo: juan, maria, pedro"),
            parent=self,
        )
        # Si pulsa Cancelar => no subimos nada
        if share_raw is None:
            return
        share_users = [u.strip() for u in share_raw.split(",") if u.strip()]
        if share_users == []:
            messagebox.showwarning("Error", "Debes introducir al menos un usuario para compartir.")
            return
        # Aseguramos que SIEMPRE estás tú en la lista
        if self.current_user not in share_users:
            share_users.append(self.current_user)
        if not path: return
        with open(path, "rb") as f:
            plaintext = f.read()
        logger.info("Uploading file selected: path=%s user=%s size=%d",
                    path, self.current_user, len(plaintext))
        # Firmar el archivo con la clave privada del owner
        signature = rsa_sign(self.user_priv_key, plaintext)
        # generar clave simétrica por archivo
        key = generate_symmetric_key()
        ciphertext, nonce, tag = aes_gcm_encrypt(key, plaintext)
        filename = os.path.basename(path)
        # cifrar la clave AES con la clave pública del propietario para
        # almacenarla -> cifrado híbrido
        enc_keys_hex = {}
        for username in share_users:   # share_users = ["juan", "maria", "pedro", ...]
            # Obtener los datos del usuario (incluye clave pública)
            user_data = self.usuarios.get_user(username)
            if not user_data:
                messagebox.showerror("Error", f"El usuario '{username}' no existe")
                return
            # Aquí se verifican las claves públicas y certificados de los usuarios
            if username != self.current_user:
                cert_pem = load_cert_pem(username)
                if not cert_pem:
                    logger.error("Error", f"El usuario '{username}' no tiene certificado.")
                    return
                if not verify_cert_chain(cert_pem):
                    logger.error("Error", f"El certificado del usuario '{username}' no es válido.")
                    return
            # Sacar la clave pública PEM
            pub_pem = user_data["pub_pem"].encode()
            pub_key = load_public_key_pem(pub_pem)
            enc_key_bytes = rsa_encrypt_with_public(pub_key, key)
            enc_keys_hex[username] = enc_key_bytes.hex()
        try:
            self.archivos.save_encrypted_file(filename, 
                                              ciphertext, nonce, tag,
                                              self.current_user,
                                              enc_keys_hex,
                                              "shared",
                                              signature) # añadido scope private/public
            logger.info("File saved encrypted: %s owner=%s", filename, self.current_user)
            messagebox.showinfo("Subida",
                                f"Archivo '{filename}'")
        except Exception as e:
            logger.exception("Error saving encrypted file %s for user %s: %s",
                             filename, self.current_user, e)
            messagebox.showerror("Subida", f"Error guardando archivo: {e}")
        self.refresh_files()
    # ---- Fin Shared Files ----

    # ---- Forum tab ----
    def build_forum_tab(self):
        """Construye la pestaña del foro para publicar mensajes con HMAC."""
        f = self.tab_forum
        ttk.Label(f,
                  text="Foro: publica tus dudas").pack(
            pady=6)
        self.txt_msg = tk.Text(f, height=6)
        self.txt_msg.pack(fill="x", padx=8)
        ttk.Button(f, text="Publicar mensaje",
                   command=self.on_post_message).pack(pady=6)
        ttk.Label(f, text="Registro de mensajes:").pack(pady=6)
        self.log = tk.Text(f, height=12, state="disabled")
        self.log.pack(expand=True, fill="both", padx=8, pady=6)

    def on_post_message(self):
        """Publica el mensaje del usuario calculando un HMAC-SHA256."""
        if not self.current_user:
            logger.warning("Post message attempted without login")
            messagebox.showwarning("Acceso", "Inicia sesión primero")
            return
        txt = self.txt_msg.get("1.0", "end").strip()
        if not txt:
            logger.warning("Empty message attempted by user=%s", self.current_user)
            return
        logger.info("Posting message by user=%s len=%d", self.current_user, len(txt))
        pwd_hash = self.usuarios.get_user(self.current_user).get("pwd_hash")
        hmac_key = derive_hmac_key_from_password(pwd_hash.get("derived"), pwd_hash.get("salt"))
        tag = hmac_tag(hmac_key, txt.encode())
        timestr = time.strftime("%d/%m/%Y %H:%M", time.localtime(time.time()))
        entry = f"[{timestr}] | User:{self.current_user} | Msg:{txt}\n"
        self.log.configure(state="normal")
        self.log.insert("end", entry)
        self.log.configure(state="disabled")
        self.txt_msg.delete("1.0", "end")
        # persistir el mensaje
        try:
            self.messages.add_message(self.current_user, txt, tag.hex(), timestr)
            logger.info("Message stored for user=%s len=%d", self.current_user, len(txt))
        except (OSError, ValueError) as e:
            logger.exception("Failed storing message for user=%s: %s", self.current_user, e)
        messagebox.showinfo("Foro", "Mensaje publicado")

    def load_messages_into_log(self):
        """Carga los mensajes persistidos desde el store y los muestra en el log."""
        msgs = self.messages.list_messages()
        logger.info("Loading messages into log, count=%d", len(msgs))
        self.log.configure(state="normal")
        self.log.delete("1.0", "end")
        skipped = 0
        for m in msgs:
            pwd_hash = self.usuarios.get_user(m.get("user")).get("pwd_hash")
            hmac_key = derive_hmac_key_from_password(pwd_hash.get("derived"), pwd_hash.get("salt"))
            # verificar HMAC
            if not verify_hmac(hmac_key, m.get("msg").encode(), bytes.fromhex(m.get("hmac_hex"))):
                skipped += 1
                continue
            # show timestamp, user and message
            entry = f"[{m.get('timestamp')}] | User:{m.get('user')} | Msg:{m.get('msg')}\n"
            self.log.insert("end", entry)
        if skipped:
            logger.warning("Skipped %d messages due to invalid HMAC", skipped)
        self.log.configure(state="disabled")

    # ---- Fin Forum tab ----