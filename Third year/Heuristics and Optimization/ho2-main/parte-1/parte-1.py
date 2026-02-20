#!/usr/bin/env python3
import sys
import os
from constraint import Problem, ExactSumConstraint, InSetConstraint
from parser import parse_input
from board import Board

# Mapeo para el solver: 0 = Blanco (O), 1 = Negro (X)
WHITE = 0
BLACK = 1

def solve_binairo(n, initial_data):
    """
    Configura y resuelve el problema CSP.
    """
    problem = Problem()
    
    # Variables: Tuplas (fila, columna)
    # Dominio: [0, 1] donde 0 es Blanco y 1 es Negro
    domain = [WHITE, BLACK]
    
    variables = []
    for r in range(n):
        for c in range(n):
            variables.append((r, c))
    
    problem.addVariables(variables, domain)
    
    # 1. Restricciones iniciales (lo que ya viene en el fichero)
    for r in range(n):
        for c in range(n):
            char = initial_data[r][c]
            if char == 'O':
                problem.addConstraint(InSetConstraint([WHITE]), [(r, c)])
            elif char == 'X':
                problem.addConstraint(InSetConstraint([BLACK]), [(r, c)])

    # 2. Restricción de conteo: Igual número de blancos y negros en filas y columnas
    # Como tenemos 0 y 1, la suma de una fila/columna debe ser n/2 (número de negros)
    target_sum = n // 2
    
    for i in range(n):
        # Restricción por fila
        row_vars = [(i, c) for c in range(n)]
        problem.addConstraint(ExactSumConstraint(target_sum), row_vars)
        
        # Restricción por columna
        col_vars = [(r, i) for r in range(n)]
        problem.addConstraint(ExactSumConstraint(target_sum), col_vars)

    # 3. Restricción de adyacencia: No más de 2 del mismo color consecutivos
    # Esto significa que no puede haber 3 iguales seguidos: (A == B == C) es prohibido.
    # Lógica: A != B or B != C
    def no_three_in_row(a, b, c):
        return not (a == b == c)

    # Aplicar a filas
    for r in range(n):
        for c in range(n - 2):
            problem.addConstraint(no_three_in_row, [(r, c), (r, c+1), (r, c+2)])
            
    # Aplicar a columnas
    for c in range(n):
        for r in range(n - 2):
            problem.addConstraint(no_three_in_row, [(r, c), (r+1, c), (r+2, c)])

    return problem.getSolutions()

def main():
    print("\n")
    # Validación de argumentos
    if len(sys.argv) != 3:
        print("Uso: ./parte-1.py <fichero-entrada> <fichero-salida>")
        sys.exit(1)
        
    input_path = sys.argv[1]
    output_path = sys.argv[2]
    
    # Paso 1: Parsear entrada
    n, raw_data = parse_input(input_path)
    
    # Crear tablero inicial para visualización
    initial_board = Board(n, raw_data)
    
    # Mostrar instancia a resolver en pantalla
    print(initial_board)
    
    # Paso 2: Resolver CSP
    solutions = solve_binairo(n, raw_data)
    num_solutions = len(solutions)
    
    print(f"\n{num_solutions} soluciones encontradas")
    
    # Paso 3: Escribir salida
    try:
        # Asegurar que el directorio de salida existe si es una ruta relativa/absoluta
        output_dir = os.path.dirname(output_path)
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)
            
        with open(output_path, 'w') as f:
            # Escribir instancia original
            f.write(str(initial_board))
            f.write("\n\n")
            
            # Escribir la primera solución encontrada (si existe)
            if num_solutions > 0:
                first_sol = solutions[0]
                # Convertir el diccionario de solución a matriz para el Board
                solved_matrix = [[0] * n for _ in range(n)]
                for (r, c), val in first_sol.items():
                    solved_matrix[r][c] = val
                
                solved_board = Board(n, solved_matrix)
                f.write(str(solved_board))
                f.write("\n")
            else:
                f.write("No se encontró solución.\n")
    
        print("\n")                
    
    except IOError as e:
        print(f"Error escribiendo fichero de salida: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()