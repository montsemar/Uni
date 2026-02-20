#include "parser.hpp"

#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <sstream>

std::vector<std::string> leer_archivo(const std::string& file_path) {
    
    std::ifstream file(file_path);
    
    std::vector<std::string> lines;

    if (!file.is_open()) {
        std::cerr << "Error: No se pudo abrir el archivo " << file_path << std::endl;
        return lines;
    }

    std::string line;
    while (std::getline(file, line)) {
        lines.push_back(line);
    }

    file.close(); 

    return lines;
}


std::vector<std::tuple<int, int, int>> parser::parse_coords(const std::string& filepath) {
    std::vector<std::string> lines = leer_archivo(filepath);
    
    std::vector<std::tuple<int, int, int>> v;
    for (const auto& line : lines) {
        if (line.starts_with("v")) {
            std::istringstream stream(line);

            char tag;
            int id, lat, lon;
            stream >> tag >> id >> lat >> lon;
            v.emplace_back(id, lat, lon);
        }
    }

    return v;
}


std::vector<std::tuple<int, int, int>> parser::parse_arcs(const std::string& filepath) {
    std::vector<std::string> lines = leer_archivo(filepath);

    std::vector<std::tuple<int, int, int>> a;

    for (const auto& line : lines) {
        if (line.starts_with("a")) {
            std::istringstream stream(line);

            char tag;
            int id1, id2, cost;
            stream >> tag >> id1 >> id2 >> cost;
            a.emplace_back(id1, id2, cost);
        }
    }
    
    return a;
}