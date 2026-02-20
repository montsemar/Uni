#!/usr/bin/env python3
import os
import sys
import re

# --- Comprobación de argumentos ---
if len(sys.argv) != 3:
    print("Uso: ./gen-1.py <fichero-entrada> <fichero-salida>")
    sys.exit(1)

entrada = sys.argv[1]
salida = sys.argv[2]

# --- Lectura del fichero de entrada ---
# Formato esperado:
# n m
# kd kp
# d1 d2 ... dm
# p1 p2 ... pm

with open(entrada, "r") as f:
    lineas = [line.strip() for line in f.readlines() if line.strip()]
try:
    n, m = map(int, lineas[0].split())
    kd, kp = map(float, lineas[1].split())
    distancias = list(map(float, lineas[2].split()))
    pasajeros = list(map(int, lineas[3].split()))
except Exception as e:
    print("Error al leer el fichero de entrada:", e)
    sys.exit(1)

# --- Generación del fichero .dat ---
with open(salida, "w") as f:
    f.write("data;\n\n")

    # Conjuntos
    f.write("set BUSES := " + " ".join([f"{i+1:02d}" for i in range(m)]) + ";\n")
    # Se vería así: set BUSES := 01 02 03 ... 0m;
    f.write("set FRANJAS := " + " ".join([f"{i+1:02d}" for i in range(n)]) + ";\n\n")
    # Se vería así: set FRANJAS := 01 02 03 ... 0n;

    # Parámetros

    f.write(f"param kd := {kd};\n")
    f.write(f"param kp := {kp};\n\n")

    # param Distancia :=
    # 01 d1
    # 02 d2
    # ...
    # 0m dm
    # ;
    f.write("param Distancia :=\n")
    for i in range(m):
        f.write(f"{i+1:02d} {distancias[i]}\n")
    f.write(";\n\n")

    # param Pasajeros :=
    # 01 p1
    # 02 p2
    # ...
    # 0m pm
    # ;
    f.write("param Pasajeros :=\n")
    for i in range(m):
        f.write(f"{i+1:02d} {pasajeros[i]}\n")
    f.write(";\n\n")

    f.write("end;\n")

print(f"Fichero de datos generado correctamente: {salida}")

# --- Ejecución del modelo con GLPK ---
# Se asume que glpsol está en el PATH del sistema
comando = f'glpsol -m parte-2-1.mod -d "{salida}" -o gen-1_output.txt'
print(f"Ejecutando: {comando}\n")
os.system(comando)
print("\n")

# Ahora mostramos en pantalla el contenido que se pide en el enunciado
with open("gen-1_output.txt", "r") as f:
    output = f.readlines()

asignados = []
no_asignados = []
# vamos a buscar líneas con x[i,j] o y[i] con regex
var_re = re.compile(r'x\[\s*(\d+)\s*,\s*(\d+)\s*\]|y\[\s*(\d+)\s*\]')
# si es x: grupos 1 y 2 contienen bus y franja
# si es y: grupo 3 contiene bus
for linea in output:
    if "Objective" in linea:
        objetivo = linea.strip()
    if "Rows" in linea:
        restr = int(re.findall(r'\d+', linea.strip())[0])
        restr = "Nº restriccones o Rows: " + str(restr - 1)  # restamos 1 por la fila de objetivo
    if "Columns" in linea:
        vars = "Nº variables de decisión o " + linea.strip()
    m = var_re.search(linea)
    if m:
        start, end = m.span() # span da las posiciones de inicio y fin de la variable en la línea
        post = linea[end:]  # texto a la derecha de la variable
        # buscar el primer número en la porción posterior -> Activity
        nums_post = re.findall(r"\b[01]\b", post)
        if nums_post:
            activity = nums_post[0]
            if activity == "1":
                if m.group(1) and m.group(2):
                    bus = m.group(1)
                    franja = m.group(2)
                    asignados.append((bus, franja))
                elif m.group(3):
                    bus = m.group(3)
                    no_asignados.append(bus)

print(objetivo + "\n")
print(restr + "\n")
print(vars + "\n")
print("Buses asignados a franjas:\n")
if asignados:
    for item in asignados:
        print("Autobús " + str(item[0]) + " → Franja " + str(item[1]))
else:
    print("No se encontraron asignaciones óptimas.")
if no_asignados:
    print("\n")
    print("Autobuses sin asignar:")
    for item in no_asignados:
        print("Autobús " + str(item) + "\n")
else:
    print("\nTodos los autobuses fueron asignados correctamente.\n")

# Se debe abrir la terminal en la carpeta parte-2 para ejecutar el script
# En Windows con python en el path del sistema: py gen-1.py datos.in data_model.dat
# En Linux sí funciona ./gen-1.py datos.in data_model.dat