#include "grafo.hpp"
#include "nodo.hpp"
#include "parser.hpp"
#include "algoritmo.hpp"
#include "format_time.hpp"

#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <algorithm>
#include <filesystem>
#include <chrono>
#include <iomanip>

namespace fs = std::filesystem;

int main(int argc, char* argv[]) {
    if (argc != 5) {
        std::cerr << "Usage: " << argv[0] << " <start_id> <end_id> <map_directory> <output>\n";
        return 1;
    }
    
    int start_id = std::stoi(argv[1]);
    int end_id = std::stoi(argv[2]);
    fs::path input_path = argv[3];
    std::string output_file = argv[4];


    std::string map_name = input_path.filename().string();
    if (map_name.empty()) {
        map_name = input_path.parent_path().filename().string();
    }
    
    std::string co_file = (input_path / (map_name + ".co")).string();
    std::string gr_file = (input_path / (map_name + ".gr")).string();

    auto vertices = parser::parse_coords(co_file);
    auto arcs = parser::parse_arcs(gr_file);

    grafo::Grafo g(vertices, arcs);
    
    auto inicio = std::chrono::high_resolution_clock::now();
    auto [total_cost, end_node] = algoritmo::a_star(g, start_id, end_id);
    auto fin = std::chrono::high_resolution_clock::now();

    if (end_node == nullptr) {
        std::cout << "No se ha encontrado solucion entre " << start_id << " y " << end_id << "\n";
        return 0;
    }
    
    std::chrono::duration<double> duration = fin - inicio;
    double seconds = duration.count();
    double seconds_f = time_utils::redondearEspecial(seconds);
    
    double ratio = (seconds > 0) ? (g.exp / seconds) : 0.0;
    double ratio_f = time_utils::redondearEspecial(ratio);
    
    std::cout << "\n";
    std::cout << "#vertices: " << g.proc_v << "\n";
    std::cout << "#arcos   : " << g.proc_a << "\n";
    std::cout << "Solucion optima encontrada con coste " << total_cost << "\n";
    std::cout << "\n";
    
    std::cout << "Tiempo de ejecucion: " << seconds_f << " segundos\n"; 
    std::cout << "expansiones        : " << g.exp << " (" << ratio_f << " nodes/sec)\n";

    std::vector<nodo::Nodo*> path;
    nodo::Nodo* curr = end_node;

    while (curr != nullptr) {
        path.push_back(curr);
        curr = curr->father;
    }

    std::reverse(path.begin(), path.end());

    std::ofstream f(output_file);
    if (!f.is_open()) {
        std::cerr << "Error abriendo fichero de salida: " << output_file << "\n";
        return 1;
    }

    for (size_t i = 0; i < path.size(); ++i) {
        if (i == 0) {
            f << path[i]->id << " ";
        } else {
            f << "- (" << path[i]->cost << ") - " << path[i]->id << " ";
        }
    }

    f.close();

    return 0;
}