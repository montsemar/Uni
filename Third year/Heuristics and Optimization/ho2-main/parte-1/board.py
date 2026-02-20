from pieces import White, Black, Empty

class Board:
    """
    Clase que gestiona la lógica y representación del tablero.
    """
    def __init__(self, n, raw_data=None):
        """
        Inicializa el tablero.
        :param n: Dimensión del tablero (n x n).
        :param raw_data: Lista de listas con caracteres o enteros (opcional).
        """
        self.n = n
        self.grid = [[Empty() for _ in range(n)] for _ in range(n)]
        
        if raw_data:
            self.load_from_data(raw_data)

    def load_from_data(self, data):
        """Carga datos en el tablero desde una matriz de caracteres o enteros."""
        for r in range(self.n):
            for c in range(self.n):
                val = data[r][c]
                if val == 'O' or val == 0:
                    self.grid[r][c] = White()
                elif val == 'X' or val == 1:
                    self.grid[r][c] = Black()
                else:
                    self.grid[r][c] = Empty()

    def __str__(self):
        """
        Genera la representación en cadena del tablero con formato de rejilla.
        Ejemplo:
        +---+---+
        | X | O |
        +---+---+
        """
        border = "+" + "---+" * self.n
        result = [border]
        
        for row in self.grid:
            row_str = "|"
            for cell in row:
                row_str += f" {str(cell)} |"
            result.append(row_str)
            result.append(border)
            
        return "\n".join(result)