# app-criptografia

Resumen de la estructura (carpeta `main/` usada como paquete principal)

- `main/` - paquete principal
  - `main/main.py` - arranque de la aplicación (GUI Tkinter)
  - `main/ui_tkinter.py` - interfaz gráfica y flujos de usuario
  - `main/crypto/` - utilidades criptográficas (RSA, AES‑GCM, HMAC, KDF, firmas)
  - `main/storage/` - stores JSON para usuarios, archivos y mensajes
  - `main/pki/` - configuración y estructuras para la CA usada por `pki.py`
  - `main/data/` - directorio de datos creado en tiempo de ejecución (ficheros cifrados y JSON)
  - `main/unittests/` - tests unitarios

Qué hace la aplicación

- Registro/Login/Logout: gestión básica de usuarios con derivación de contraseña
    (PBKDF2) y almacenamiento de pares RSA por usuario. Además, al registrarse se
    crea un certificado digital para el usuario con openssl (necesitas indicar 
    confirmaciones en la terminal)
- Subida de archivos: cifra el contenido con AES-GCM y cifra la clave AES con
    la clave pública RSA (cifrado híbrido) del propietario o de los usuarios con 
    los que se ha compartido. Los ciphertexts se almacenan localmente en 
    `main/data/files/` y la metadata en JSON.
- Descarga de archivos: en la sección privada `Mi Mochila` solo el propietario 
    puede descifrar el fichero mediante su clave privada (cargada en memoria tras 
    el login). En la sección compartida `Publicaciones`, cualquier usuario con permisos puede 
    descifrar el fichero mediante su clave privada.
- Foro: usuarios pueden publicar mensajes; la app calcula un HMAC por mensaje
    para verificar integridad/autenticidad.

## Requisitos
- paquetes en requirements.txt
- OpenSSL
