#include <iostream>
#include <string>

namespace web_input{
    std::string multiply_string (const std::string& input, int amount);
    bool all_brackets_matched (const std::string& input);
    bool all_valid_characters (const std::string& input);
    bool is_valid_input (const std::string& input);
    int find_center (std::string input);
    //std::string expand_sequence (const std::string& input); //old one
    //new recursive input parser:
    std::string expand_sequence (const std::string& substring, int mult_factor, int level);
    int substr_length (const std::string& substring, int mult_factor, int level);
}
