#ifndef GRAFO_HPP
#define GRAFO_HPP

#include "nodo.hpp"

#include <vector>
#include <tuple>
#include <unordered_map>
#include <string>
#include <functional>
#include <cmath>
#include <iostream>

namespace grafo {
    struct TupleHash {
        std::size_t operator()(const std::tuple<int, int>& key) const {
            auto h1 = std::hash<int>{}(std::get<0>(key));
            auto h2 = std::hash<int>{}(std::get<1>(key));
            return h1 ^ (h2 << 1); // Combina los dos hashes
        }
    };

    class Grafo {
        public:
        int proc_v;
        int proc_a;
        int exp = 0;
        std::unordered_map<int, std::vector<int>> adj; // {id: [id_child1, id_child2, ...], ...}

        Grafo(const std::vector<std::tuple<int, int, int>>& vertices,
            const std::vector<std::tuple<int, int, int>>& arcos):
              v(vertices), a(arcos) {
                  get_cost();
                  get_adj();
                  proc_v = v.size();
                  proc_a = a.size();
              }


        nodo::Nodo* gen_node(int id, int end, nodo::Nodo* father=nullptr) {
            std::vector<int> children;
            for (const auto& child_id : adj[id]) {
                children.push_back(child_id);
            }
            return new nodo::Nodo(id, father,
                (father == nullptr) ? 0 : cost[{father->id, id}],
                children, haversine(id, end));
        }

        std::vector<nodo::Nodo*> expand_node(nodo::Nodo* node, int end) {
            exp += 1;
            std::vector<nodo::Nodo*> children;
            for (const auto& child_id : adj[node->id]) {
                children.push_back(gen_node(child_id, end, node));
            }
            return children;
        };

        private:
        std::vector<std::tuple<int, int, int>> v; // [(id, lat, lon), ...]
        std::vector<std::tuple<int, int, int>> a; // [(id1, id2, cost12), ...]
        std::unordered_map<std::tuple<int, int>, int, TupleHash> cost;


        void get_cost() {
            cost.clear();
            for (const auto& ij : a){
                std::tuple<int, int> idx = {std::get<0>(ij), std::get<1>(ij)};
                cost[idx] = std::get<2>(ij);
            }
        }

        void get_adj() {
            adj.clear();
            for (const auto& ij : a){
                if (adj[std::get<0>(ij)].capacity() < 9) {adj[std::get<0>(ij)].reserve(9);}
                adj[std::get<0>(ij)].push_back(std::get<1>(ij));

            }
        }
    
        double haversine(int id, int end) {
            double R = 6371000.0; // Radio en metros 
            
            const double to_rad = std::numbers::pi / 180.0;

            double lon1_deg = std::get<1>(v[id]) / 1000000.0; 
            double lat1_deg = std::get<2>(v[id]) / 1000000.0;
            
            double lon2_deg = std::get<1>(v[end]) / 1000000.0;
            double lat2_deg = std::get<2>(v[end]) / 1000000.0;

            double lat1 = lat1_deg * to_rad;
            double lon1 = lon1_deg * to_rad;
            double lat2 = lat2_deg * to_rad;
            double lon2 = lon2_deg * to_rad;

            double delta_lat = lat2 - lat1;
            double delta_lon = lon2 - lon1;

            double a = std::pow(std::sin(delta_lat / 2.0), 2) +
                    std::cos(lat1) * std::cos(lat2) *
                    std::pow(std::sin(delta_lon / 2.0), 2);

            double c = 2.0 * std::atan2(std::sqrt(a), std::sqrt(1.0 - a));

            return R * c;            
        }


    };

    
} // namespace grafo

#endif // GRAFO_HPP