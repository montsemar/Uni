"""
Modulo encargado de la gestion de PKI (Public Key Infrastructure).
Aquí se encuentran las funciones para la generación de certificado de un usuario
y la verificación de certificados.
"""
import os
import subprocess
import shutil
import tempfile
from server.logger import logging
from pathlib import Path

DIR = str((Path(__file__).resolve().parent.parent).resolve()) # apuntando a main/

def create_user_cert(user: str, priv_pem: bytes, pwd: str) -> str:
    """Crea una CSR (Certificate Signing Request) para el usuario 'user' usando la clave privada
    'priv_pem' protegida con 'pwd', y la firma con la AC2.
    Devuelve la ruta al certificado generado (PEM) en pki/usuarios/."""
    if shutil.which("openssl") is None:
        raise FileNotFoundError("openssl no está disponible en PATH")
    
    # guardamos la clave privada en usuarios/privado/{user}key.pem
    usuarios_dir = os.path.join(DIR, "pki", "usuarios")
    os.makedirs(usuarios_dir, exist_ok=True)
    privado_dir = os.path.join(usuarios_dir, "privado")
    key_path = os.path.join(privado_dir, f"{user}key.pem")
    os.makedirs(privado_dir, exist_ok=True)
    with open(key_path, "wb") as f:
        # priv_pem is expected to be bytes
        if isinstance(priv_pem, str):
            f.write(priv_pem.encode('utf-8'))
        else:
            f.write(priv_pem)
    logging.info("Clave privada de %s guardada en %s", user, key_path)

    # Creamos la solicitud de certificado (CSR)
    solicitudes_dir = os.path.join(DIR, "pki", "ac2", "solicitudes")
    os.makedirs(solicitudes_dir, exist_ok=True)
    csr_path = os.path.join(solicitudes_dir, f"{user}req.pem")
    subj = (f"/C=ES"
            f"/ST=MADRID"
            f"/O=UC3M"
            f"/OU=INF"
            f"/CN={user}"
            f"/emailAddress={user}@spi.inf.uc3m.es")
    cmd = ["openssl", "req", "-new", "-key", key_path, "-out", csr_path, 
           "-sha256", "-subj", subj, "-passin", f"pass:{pwd}"]
    logging.info("Creando CSR para %s", user)
    try:
        subprocess.run(cmd, check=True, capture_output=True, text=True)
    except subprocess.CalledProcessError as e:
        logging.error("openssl req falló: %s", e.stderr or e.stdout)
        raise
    logging.info("CSR creado en %s", csr_path)

    # Firmar el CSR con la AC2
    cnf_path = os.path.join(DIR, "pki", "ac2", "openssl_AC2.cnf")
    if not os.path.exists(cnf_path):
        raise FileNotFoundError(f"No se encontró config de AC2: {cnf_path}")
    cmd = ["openssl", "ca", "-config", cnf_path, "-in", csr_path, "-notext"]
    logging.info("AC2 firmando CSR %s", csr_path)
    try:
        subprocess.run(cmd, check=True, stdin=None, stdout=None, stderr=None, cwd=os.path.dirname(cnf_path))
    except subprocess.CalledProcessError as e:
        logging.error("openssl ca falló: %s", e.stderr or e.stdout)
        raise
    logging.info("Certificado de usuario creado y firmado por AC2")

    # Ahora copiamos el certificado generado a pki/usuarios/
    nuevoscerts_dir = os.path.join(DIR, "pki", "ac2", "nuevoscerts")
    # get serial.old to know the last issued certificate number
    serial_path = os.path.join(DIR, "pki", "ac2", "serial.old")
    with open(serial_path, "r") as f:
        serial_str = f.read().strip()
    gen_cert_name = serial_str +".pem"
    gen_cert_path = os.path.join(nuevoscerts_dir, gen_cert_name)
    out_cert_path =  os.path.join(usuarios_dir, f"{user}cert.pem")
    shutil.copyfile(gen_cert_path, out_cert_path)
    logging.info("Certificado de usuario guardado en %s", out_cert_path)

    return out_cert_path

def load_cert_pem(user: str) -> bytes:
    """Carga un certificado en formato PEM desde la ruta 'cert_path'."""
    cert_path = os.path.join(DIR, "pki", "usuarios", f"{user}cert.pem") 
    with open(cert_path, "rb") as f:
        return f.read()

def verify_cert_chain(cert_pem: bytes) -> bool:
    """Verifica la cadena usando 'openssl verify' con ac1+ac2 concatenadas."""
    if shutil.which("openssl") is None:
        raise FileNotFoundError("openssl no está disponible en PATH")

    ac1_path = os.path.join(DIR, "pki", "ac1", "ac1cert.pem")
    ac2_path = os.path.join(DIR, "pki", "ac2", "ac2cert.pem")
    if not os.path.exists(ac1_path) or not os.path.exists(ac2_path):
        logging.error("Faltan certificados de AC1/AC2: %s, %s", ac1_path, ac2_path)
        raise FileNotFoundError("Faltan certificados de AC1/AC2")

    cert_tf = tempfile.NamedTemporaryFile(delete=False, suffix=".pem")
    cafile_tf = tempfile.NamedTemporaryFile(delete=False, suffix=".pem")
    try:
        # escribir certificado del usuario
        cert_tf.write(cert_pem)
        cert_tf.flush()
        cert_tf.close()

        # concatenar AC1 + AC2 en el CAfile temporal
        with open(ac1_path, "rb") as f1, open(ac2_path, "rb") as f2:
            cafile_tf.write(f1.read())
            cafile_tf.write(b"\n")
            cafile_tf.write(f2.read())
        cafile_tf.flush()
        cafile_tf.close()

        cmd = ["openssl", "verify", "-CAfile", cafile_tf.name, cert_tf.name]
        logging.info("Ejecutando: %s", " ".join(cmd))
        res = subprocess.run(cmd, capture_output=True, text=True)
        output = (res.stdout or "") + (res.stderr or "")

        if res.returncode == 0 and "OK" in output:
            logging.info("Certificado verificado: %s", output.strip())
            return True
        
    except Exception as e:
        logging.error("Error verificando certificado: %s", str(e))
        return False

    for path in (cert_tf.name, cafile_tf.name):
        try:
            os.remove(path)
        except Exception:
            logging.warning("No se pudo eliminar archivo temporal: %s", path)
