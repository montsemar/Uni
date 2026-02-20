#ifndef CERRADA_HPP
#define CERRADA_HPP

#include <unordered_set>
#include "nodo.hpp"

namespace cerrada {
    class Closed {
        public:
        Closed() = default;

        void add(const nodo::Nodo& node) {
            nodes.insert(node.id);
        }

        bool contains(const nodo::Nodo& node) const {
            return nodes.count(node.id);
        }

        private:
        std::unordered_set<int> nodes;
        
    };
}

#endif // CERRADA_HPP