class Piece:
    """Clase madre para las piezas del tablero."""
    def __str__(self):
        return " "

class White(Piece):
    """Representa un disco blanco (O)."""
    def __str__(self):
        return "O"

class Black(Piece):
    """Representa un disco negro (X)."""
    def __str__(self):
        return "X"

class Empty(Piece):
    """Representa una casilla vacía o desconocida (.)."""
    def __str__(self):
        return " "