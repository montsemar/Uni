#!/usr/bin/env python3

import sys
from pathlib import Path


def read_tokens_lines(path):
    with open(path, "r") as f:
        lines = []
        for raw in f:
            line = raw.split('#', 1)[0].strip()
            if line:
                lines.append(line)
    # split lines into token lists where appropriate
    return lines


def make_labels(count):
    # Use simple numeric labels (1,2,3,...) to avoid parsing issues in GLPK data
    return [str(i+1) for i in range(count)]


def error_exit(msg):
    print("Error:", msg)
    sys.exit(1)


def main():
    if len(sys.argv) != 3:
        print("Uso: ./gen-2.py <fichero-entrada> <fichero-salida>")
        sys.exit(1)

    entrada = Path(sys.argv[1])
    salida = Path(sys.argv[2])

    if not entrada.exists():
        error_exit(f"Fichero de entrada no encontrado: {entrada}")

    lines = read_tokens_lines(entrada)
    if not lines:
        error_exit("Fichero de entrada vacío o sólo comentarios.")

    # primera línea: n m u (n = franjas, m = autobuses, u = talleres)
    try:
        n, m, u = map(int, lines[0].split())
    except Exception:
        error_exit("La primera línea debe contener tres enteros: n m u")
    # Después de la primera línea viene C (m filas de m enteros) y luego O (u filas de n enteros)
    expected_lines = 1 + m + u
    if len(lines) < expected_lines:
        error_exit(f"Faltan líneas en la entrada. Esperadas >= {expected_lines}, encontradas {len(lines)}")

    # leer matriz C: siguientes m líneas, cada una con m enteros
    C = []
    for i in range(m):
        toks = lines[1 + i].split()
        if len(toks) != m:
            error_exit(f"Fila {i+1} de C tiene {len(toks)} columnas (se esperaban {m})")
        row = []
        for v in toks:
            try:
                iv = int(v)
            except Exception:
                error_exit(f"Valores de C deben ser enteros. Encontrado: '{v}'")
            if iv < 0:
                error_exit("Valores de C deben ser no negativos")
            row.append(iv)
        C.append(row)

    # leer matriz O: siguientes u líneas, cada una con n valores 0/1
    O = []
    for i in range(u):
        toks = lines[1 + m + i].split()
        if len(toks) != n:
            error_exit(f"Fila {i+1} de O tiene {len(toks)} columnas (se esperaban {n})")
        row = []
        for v in toks:
            if v not in ("0", "1"):
                error_exit(f"Valores de O deben ser 0 o 1. Encontrado: '{v}'")
            row.append(int(v))
        O.append(row)

    # Validaciones adicionales
    # diagonal cero
    for i in range(m):
        if C[i][i] != 0:
            error_exit(f"Diagonal de C debe ser 0 (C[{i+1},{i+1}] = {C[i][i]})")
    # simetría
    for i in range(m):
        for j in range(i + 1, m):
            if C[i][j] != C[j][i]:
                error_exit(f"Matriz C debe ser simétrica: C[{i+1},{j+1}]={C[i][j]} != C[{j+1},{i+1}]={C[j][i]}")

    # Preparar etiquetas
    buses = make_labels(m)
    franjas = make_labels(n)
    talleres = make_labels(u)

    # Escribir fichero .dat
    with open(salida, "w") as f:
        f.write("data;\n\n")

        f.write("set BUSES := " + " ".join(buses) + ";\n")
        f.write("set FRANJAS := " + " ".join(franjas) + ";\n")
        f.write("set TALLERES := " + " ".join(talleres) + ";\n\n")

        # Construir YAUX: tuplas (i,j,s,t1,t2) con i<j, C[i][j]>0, O[t1][s]=O[t2][s]=1 y t1 != t2
        yauxtuples = []
        for i in range(m):
            for j in range(i+1, m):
                if C[i][j] > 0:
                    for s in range(n):
                        for t1 in range(u):
                            if O[t1][s] != 1:
                                continue
                            for t2 in range(u):
                                if t2 == t1:
                                    continue
                                if O[t2][s] != 1:
                                    continue
                                # añadir la tupla con etiquetas (i+1,j+1,s+1,t1+1,t2+1)
                                yauxtuples.append((buses[i], buses[j], franjas[s], talleres[t1], talleres[t2]))

        # Escribir YAUX como set de 5-tuplas con comas: (i,j,s,t1,t2)
        f.write("set YAUX :=\n")
        for tup in yauxtuples:
            f.write("(" + ",".join(tup) + ")\n")
        f.write(";\n\n")

        # Cambio: param O as triples (franja taller value)
        f.write("param O :=\n")
        for s in range(n):
            for t in range(u):
                # Cambio: franja taller value
                f.write(f"{franjas[s]} {talleres[t]} {O[t][s]}\n")
        f.write(";\n\n")

        # param C as triples (bus bus value)
        f.write("param C :=\n")
        for i in range(m):
            for j in range(m):
                f.write(f"{buses[i]} {buses[j]} {C[i][j]}\n")
        f.write(";\n\n")

        f.write("end;\n")

    print(f"Fichero de datos generado correctamente: {salida}")

    # Ejecutar GLPK con el modelo parte-2-2.mod
    import os
    out_file = Path("gen-2_output.txt")
    comando = f'glpsol -m parte-2-2.mod -d "{salida}" -o "{out_file}"'
    print(f"Ejecutando: {comando}")
    rc = os.system(comando)
    if rc != 0:
        print("Advertencia: la ejecución de glpsol devolvió un código distinto de 0. Compruebe que glpsol está instalado y que el modelo existe.")

    # Si no se generó el fichero de salida, avisar y terminar
    if not out_file.exists():
        print("No se encontró el fichero de salida de GLPK (gen-2_output.txt). No se puede mostrar la solución.")
        return

    # Parsear la salida de GLPK para mostrar objetivo, rows/cols y asignaciones x[i,s,t]=1
    import re
    asignados = []
    objetivo = None
    restr = None
    vars_info = None

    var_re = re.compile(r'x\[\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\]')

    with open(out_file, 'r') as f_out:
        for linea in f_out:
            if objetivo is None and 'Objective' in linea:
                objetivo = linea.strip()
            if restr is None and 'Rows' in linea:
                mnum = re.findall(r'\d+', linea)
                if mnum:
                    restr = int(mnum[0])
                    restr = "Nº restricciones o Rows: " + str(restr - 1)
            if vars_info is None and 'Columns' in linea:
                vars_info = "Nº variables de decisión o " + linea.strip()

            m = var_re.search(linea)
            if m:
                start, end = m.span()
                post = linea[end:]
                nums_post = re.findall(r"\b[01]\b", post)
                if nums_post and nums_post[0] == '1':
                    bus = m.group(1)
                    franja = m.group(2)
                    taller = m.group(3)
                    asignados.append((bus, franja, taller))

    # Salida por pantalla
    if objetivo:
        print("\n\n" + objetivo + "\n")
    if restr:
        print(restr + "\n")
    if vars_info:
        print(vars_info + "\n")

    print("Buses asignados a franjas y talleres:\n")
    if asignados:
        for item in asignados:
            print(f"Autobús {item[0]} → Franja {item[1]} en Taller {item[2]}")
    else:
        print("No se encontraron asignaciones óptimas o GLPK no mostró variables x con valor 1.")

    # Construir el bloque legible final similar al que imprime gen-1.py
    summary_lines = []
    if objetivo:
        summary_lines.append(objetivo)
    if restr:
        summary_lines.append(restr)
    if vars_info:
        summary_lines.append(vars_info)
    summary_lines.append("")
    summary_lines.append("Buses asignados a franjas y talleres:")
    if asignados:
        for item in asignados:
            summary_lines.append(f"Autobús {item[0]} → Franja {item[1]} en Taller {item[2]}")
    else:
        summary_lines.append("No se encontraron asignaciones óptimas o GLPK no mostró variables x con valor 1.")

    summary_text = "\n".join(summary_lines) + "\n"

    # Si GLPK generó gen-2_output.txt, lo dejamos intacto y además guardamos un resumen en gen-2_summary.txt
    try:
        if out_file.exists():
            # GLPK produced full output: preserve it and do not create a separate summary file
            print(f"Salida de GLPK preservada en {out_file}")
        else:
            # GLPK no generó salida; creamos gen-2_output.txt con un encabezado tipo GLPK y el resumen.
            with open(out_file, 'w') as f_out:
                f_out.write("Problem:    parte-2-2\n")
                # Intentar escribir alguna info básica
                if vars_info:
                    f_out.write(vars_info.replace('Nº variables de decisión o ', '') + "\n")
                if objetivo:
                    f_out.write(objetivo + "\n")
                f_out.write("\n")
                f_out.write(summary_text)
            print(f"No se encontró salida de GLPK. Se creó {out_file} con resumen básico.")
    except Exception as e:
        print(f"Advertencia: error al crear/guardar archivos de salida: {e}")


if __name__ == '__main__':
    main()
