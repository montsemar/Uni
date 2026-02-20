#ifndef PARSER_HPP
#define PARSER_HPP

#include <vector>
#include <tuple>
#include <string>

namespace parser {
    std::vector<std::tuple<int, int, int>> parse_coords(const std::string& filepath);
    
    std::vector<std::tuple<int, int, int>> parse_arcs(const std::string& filepath);
}



#endif // PARSER_HPP