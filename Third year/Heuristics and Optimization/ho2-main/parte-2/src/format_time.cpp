#include "format_time.hpp"

#include <cmath>
#include <iostream>

double time_utils::redondearEspecial(double num) {
    if (std::abs(num) < 1e-15) {
        return 0.0; // Manejar números muy cercanos a cero
    }

    // 1. Separar signo, parte entera y fraccional
    double sign = (num < 0) ? -1.0 : 1.0;
    double x = std::abs(num);
    
    double integer_part = std::floor(x);
    double fractional_part = x - integer_part;

    if (std::abs(fractional_part) < 1e-15) {
        return sign * integer_part; // Si no hay parte fraccional, devolver solo el entero
    }

    // 2. Encontrar el Factor de Escala (S)
    // S mueve la parte fraccional para que el primer dígito no-cero se sitúe
    // en la posición de las decenas (rango [10, 100)).
    // Esto asegura que al redondear al entero, estamos redondeando el segundo dígito significativo.
    double S = 1.0;
    while (fractional_part * S < 10.0) {
        S *= 10.0;
    }

    // 3. Escalar, Redondear y Desescalar
    
    // a) Escalar a la zona de redondeo (Ej: 0.00127 -> 12.7)
    double scaled_frac = fractional_part * S;
    
    // b) Redondear el número escalado (Ej: 12.7 -> 13)
    double rounded_frac_int = std::round(scaled_frac);

    // c) Manejar el 'carry-over' si el redondeo hace que la parte fraccional se convierta en 100 o más
    // (Ej: 0.998 * 100 = 99.8 -> 100.0)
    if (rounded_frac_int >= 100.0) {
        integer_part += 1.0;
        rounded_frac_int = 0.0; // La nueva parte fraccional es 0
    }
    
    // d) Desescalar el resultado redondeado (Ej: 13 / 10000 -> 0.0013)
    double final_frac = rounded_frac_int / S;

    // 4. Combinar y aplicar signo
    return sign * (integer_part + final_frac);
}
