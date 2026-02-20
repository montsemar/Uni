#ifndef ABIERTA_HPP
#define ABIERTA_HPP

#include <vector>
#include "nodo.hpp" // Asumiendo que existe

namespace abierta {
    class Open {
    public:
    int max_dist = 44000000;
    int min = 44000000;
    std::vector<std::vector<nodo::Nodo*>> nodes;

    Open(nodo::Nodo& start) {
        nodes.resize(max_dist + 1);
        nodes[max_dist].push_back(&start); 
    }

    void add_nh(nodo::Nodo& node) {
        nodes[node.g].push_back(&node);
        if (node.g < min) {
            min = node.g;
        }
    }

    void add_h(nodo::Nodo& node) {
        nodes[node.f].push_back(&node);
        if (node.f < min) {
            min = node.f;
        }
    }
    
    void search_min() {
        for (int i = min; i <= nodes.size(); i++) {
            if (!nodes[i].empty()) {
                min = i;
                return;
            }
        }
        min = max_dist + 2;
    }

    nodo::Nodo* pop() {
        nodo::Nodo* nodo = nodes[min].back();
        nodes[min].pop_back();
        if (nodes[min].empty()) {
            search_min();
        }
        return nodo;
    }
    
    };
} // namespace abierta

#endif // ABIERTA_HPP