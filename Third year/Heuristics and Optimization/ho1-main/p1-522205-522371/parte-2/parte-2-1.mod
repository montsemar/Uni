# ------------------------------------------------------------------
# parte-2-1.mod
#
# cmnd: glpsol -m parte-2-1.mod -o solution.out -d datos.dat
# ------------------------------------------------------------------

# --------------------
# SECCION DE PARAMETROS
# --------------------

# sets
set BUSES;
set FRANJAS;

# parametros
param kd, >= 0;        # Coste por kilometro
param kp, >= 0;        # Penalizacion por pasajero

param Distancia        {BUSES}, >= 0; # Distancia del autobus i al taller
param Pasajeros        {BUSES}, >= 0; # Pasajeros del autobus i

# ---------------------
# SECCION DE VARIABLES
# ---------------------

# x[i,j] = 1 si el autobús i es asignado a la franja j || 0 si no
var x                  {i in BUSES, j in FRANJAS}, binary;

# y[i] = 1 si el autobús no tiene franja asignada || 0 en caso contrario
var y                  {i in BUSES}, binary;

# ---------------------
# SECCION FUNCION OBJETIVO
# ---------------------

# Minimizar el coste total, que es la suma de:
# 1. El coste por kilómetro asumido por un bus.
# 2. La penalización por pasajero que asume un bus no asignado.
minimize z:
    sum{i in BUSES, j in FRANJAS} (kd * Distancia[i] * x[i,j]) +
    sum{i in BUSES} (kp * Pasajeros[i] * y[i]);

# --------------------
# SECCION DE RESTRICCIONES
# --------------------

    # R1: Ninguna franja puede tener asignado más de un autobús.
    #     Se define una restriccion para cada franja j.
    s.t. Constraint1{j in FRANJAS}:
        sum{i in BUSES} x[i,j] <= 1;

    # R2: Ningún autobús puede estar asignado a más de una franja
    #     (pero puede no estarlo en ninguna)
    #     Se define una restriccion para cada autobus i.
    s.t. Constraint2{i in BUSES}:
        (sum{j in FRANJAS} x[i,j]) + y[i] = 1;


end;
