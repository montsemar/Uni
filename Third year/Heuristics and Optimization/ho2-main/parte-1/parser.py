import sys

def parse_line(line, n, line_idx):
    """
    Parsea una línea individual, eliminando espacios en blanco y validando longitud.
    
    :param line: La cadena de texto de la línea.
    :param n: El número esperado de columnas.
    :param line_idx: El índice de la línea (para mensajes de error).
    :return: Una lista de caracteres limpios.
    """
    stripped_line = line.strip()
    if len(stripped_line) != n:
        raise ValueError(f"Error en linea {line_idx + 1}: Se esperaban {n} caracteres, se encontraron {len(stripped_line)}.")
    
    # Validar caracteres permitidos
    valid_chars = {'.', 'X', 'O'}
    for char in stripped_line:
        if char not in valid_chars:
            raise ValueError(f"Error en linea {line_idx + 1}: Caracter invalido '{char}'. Solo se permiten '.', 'X', 'O'.")
            
    return list(stripped_line)

def parse_input(filepath):
    """
    Lee el fichero de entrada y devuelve el tamaño n y la matriz de datos.
    
    :param filepath: Ruta al archivo de entrada.
    :return: Tupla (n, matrix_data)
    """
    try:
        with open(filepath, 'r') as f:
            lines = [l for l in f.readlines() if l.strip()] # Leer ignorando líneas vacías finales
            
        if not lines:
            raise ValueError("El fichero de entrada esta vacio.")
            
        # Determinar n basándose en la longitud de la primera línea
        first_line = lines[0].strip()
        n = len(first_line)
        
        if n % 2 != 0:
            raise ValueError("Las dimensiones del tablero deben ser pares para Binairo.")

        if len(lines) != n:
            raise ValueError(f"El tablero debe ser cuadrado. Filas: {len(lines)}, Columnas: {n}")

        matrix_data = []
        for idx, line in enumerate(lines):
            parsed_row = parse_line(line, n, idx)
            matrix_data.append(parsed_row)
            
        return n, matrix_data
        
    except FileNotFoundError:
        print(f"Error: No se pudo encontrar el fichero '{filepath}'.")
        sys.exit(1)
    except ValueError as e:
        print(f"Error de formato: {e}")
        sys.exit(1)