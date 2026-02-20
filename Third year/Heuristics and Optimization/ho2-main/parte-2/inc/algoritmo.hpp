#ifndef ALGORITMO_HPP
#define ALGORITMO_HPP

#include "grafo.hpp"
#include "nodo.hpp"
#include "abierta.hpp"
#include "cerrada.hpp"

#include <tuple>

namespace algoritmo {
    std::tuple<int, nodo::Nodo*>dijks(grafo::Grafo& g, int start_id, int end_id);

    std::tuple<int, nodo::Nodo*>a_star(grafo::Grafo& g, int start_id, int end_id);
}


#endif // ALGORITMO_HPP